import type { ItemGenRandom } from "../itemgen/rng.js";
import { COMBAT_CONFIG } from "./config.js";
import { getCombatDamageTypeDefinition } from "./damageTypes.js";
import type { CombatContext } from "./types.js";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Requisito 3/6 — Hit Roll: independente de qualquer outra etapa.
// Hit Chance vem só da Accuracy do Attacker (Target não tem Evasion
// própria ainda — ver COMBAT_CONFIG.hitChance.baselineEvasion).
// "Guaranteed Hit" pula o roll por completo.
export function rollHit(rng: ItemGenRandom, context: CombatContext): { hit: boolean; hitChance: number } {
  if (context.guaranteedHit) {
    return { hit: true, hitChance: 1 };
  }

  const accuracy = context.attacker.finalStats.accuracy;
  const rawChance = accuracy / (accuracy + COMBAT_CONFIG.hitChance.baselineEvasion);
  const multiplier = context.futureModifiers?.hitChanceMultiplier ?? 1;
  const hitChance = clamp(rawChance * multiplier, COMBAT_CONFIG.hitChance.min, COMBAT_CONFIG.hitChance.max);

  return { hit: rng() < hitChance, hitChance };
}

// Requisito 3/5 — Critical Roll: independente das outras etapas.
// "Nunca valores fixos. Tudo vindo dos Final Stats" —
// `finalStats.criticalChance` (percentual, ex.: 5-15) é a única
// entrada real; o Future Modifier é um multiplicador opcional por
// cima, nunca um valor fixo substituindo o stat.
export function rollCritical(rng: ItemGenRandom, context: CombatContext): { critical: boolean; criticalChance: number } {
  const baseChance = context.attacker.finalStats.criticalChance / 100;
  const multiplier = context.futureModifiers?.criticalChanceMultiplier ?? 1;
  const criticalChance = clamp(baseChance * multiplier, 0, 1);

  return { critical: rng() < criticalChance, criticalChance };
}

// Requisito 3/4 — Damage Roll: base do Attacker (via
// COMBAT_DAMAGE_TYPES, requisito 4 — hoje só Physical tem um Final
// Stat real) + variação aleatória + multiplicador crítico (se a etapa
// anterior rolou crítico) + Future Modifier. Independente de Armor/
// Resistência — a mitigação é a PRÓXIMA etapa, separada.
export function rollDamage(rng: ItemGenRandom, context: CombatContext, critical: boolean): number {
  const definition = getCombatDamageTypeDefinition(context.attackType);
  const baseDamage = definition.finalStatKey ? context.attacker.finalStats[definition.finalStatKey] : 0;

  const varianceRoll = 1 + (rng() * 2 - 1) * COMBAT_CONFIG.damage.variance;
  let damage = Math.max(0, baseDamage * varianceRoll);

  if (critical) {
    damage *= context.attacker.criticalMultiplier;
  }

  damage *= context.futureModifiers?.damageMultiplier ?? 1;

  return Math.max(0, damage);
}

// Requisito 3/4 — Armor Reduction: independente das outras etapas.
// Só Physical usa Armor (COMBAT_DAMAGE_TYPES.mitigatedByArmor); os
// demais tipos usam Resistência (sempre 0 hoje — Equipment/Character
// Build Phase I não concedem resistência ainda) ou nada (Chaos
// bypassa os dois, convenção clássica de ARPG).
export function applyMitigation(rolledDamage: number, context: CombatContext): number {
  const definition = getCombatDamageTypeDefinition(context.attackType);

  if (definition.mitigatedByArmor) {
    const armorPenetration = clamp(context.futureModifiers?.armorPenetration ?? 0, 0, 1);
    const effectiveArmor = Math.max(0, context.target.finalStats.armor * (1 - armorPenetration));
    const reduction = effectiveArmor / (effectiveArmor + COMBAT_CONFIG.armor.mitigationConstant);
    return rolledDamage * (1 - reduction);
  }

  if (definition.resistanceKey) {
    const resistance = context.target.finalStats.resistances[definition.resistanceKey];
    const reduction = clamp(resistance / 100, 0, COMBAT_CONFIG.resistance.maxMitigation);
    return rolledDamage * (1 - reduction);
  }

  // Chaos (ou qualquer tipo futuro sem resistanceKey): bypassa Armor
  // e Resistência por completo.
  return rolledDamage;
}

// Requisito 3/5 — Life Leech: independente das outras etapas. Vem só
// do `lifeLeech` do Attacker (Equipment System — mod "of the
// Vampire"), nunca um valor fixo. Não devolve vida a ninguém aqui —
// só calcula a quantidade; aplicar fica por conta de quem chama
// resolveCombat() (ver types.ts).
export function calculateLifeLeech(finalDamage: number, context: CombatContext): number {
  const leechPercent = context.attacker.finalStats.lifeLeech / 100;
  const multiplier = context.futureModifiers?.lifeLeechMultiplier ?? 1;
  return finalDamage * leechPercent * multiplier;
}
