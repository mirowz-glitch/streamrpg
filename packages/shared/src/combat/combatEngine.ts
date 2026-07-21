import { createSeededRandom } from "../itemgen/rng.js";
import { rollHit, rollCritical, rollDamage, applyMitigation, calculateLifeLeech } from "./pipeline.js";
import type { CombatContext, CombatResult } from "./types.js";

// Combat Engine Phase I — requisito 1: "Toda ação ofensiva deverá
// passar por um único sistema. Nunca calcular dano fora dele." Esta é
// essa única função — nenhum outro arquivo desta Sprint (ou de
// qualquer Sprint futura que queira infligir dano) deveria calcular
// dano por conta própria.
//
// Pipeline completo (requisito 3):
//
//   Hit Roll -> Critical Roll -> Damage Roll -> Armor Reduction ->
//   Life Leech -> Final Damage -> Combat Result
//
// Cada etapa é uma função independente e pura em pipeline.ts —
// resolveCombat() só orquestra a ordem, nenhum cálculo é feito aqui
// além do roteamento entre etapas e o clamp final de vida (requisito
// 7: "nunca permitir vida negativa").
//
// Determinístico: mesmo CombatContext (attacker/target/seed/
// timestamp/attackType/modifiers) sempre produz o mesmo CombatResult
// — nenhuma chamada a Math.random ou Date.now em nenhuma etapa.
//
// Puro: nunca muta `context.attacker`/`context.target` — devolve
// tudo que mudou (`remainingLife`, `lifeLeech`) no CombatResult; quem
// chama decide como aplicar isso nos Combatants reais.
export function resolveCombat(context: CombatContext): CombatResult {
  const rng = createSeededRandom(context.seed);

  const { hit } = rollHit(rng, context);
  if (!hit) {
    return {
      damage: 0,
      critical: false,
      miss: true,
      lifeLeech: 0,
      remainingLife: context.target.currentLife,
      damageType: context.attackType,
      seed: context.seed,
    };
  }

  const { critical } = rollCritical(rng, context);
  const rolledDamage = rollDamage(rng, context, critical);
  const finalDamage = applyMitigation(rolledDamage, context);
  const lifeLeech = calculateLifeLeech(finalDamage, context);

  // Requisito 7 — "nunca permitir vida negativa".
  const remainingLife = Math.max(0, context.target.currentLife - finalDamage);

  return {
    damage: finalDamage,
    critical,
    miss: false,
    lifeLeech,
    remainingLife,
    damageType: context.attackType,
    seed: context.seed,
  };
}
