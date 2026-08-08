import type { CombinedRuntimeConfig } from "../worldencounter/types.js";
import { getMapModifier } from "./mapModifierRegistry.js";
import type { MapModifierId } from "./types.js";

// Sprint 33 — Map Modifiers Phase II, Fase 2-6: "Os Mods deixam de ser
// apenas catálogo. Passam a alterar gameplay real... Sempre através de
// multiplicadores. Nunca substituindo sistemas existentes. Nunca
// criando novas fórmulas." Este é o "ModifierResolver" de Map Modifiers
// — o mesmo padrão já validado 2 vezes (expeditions/expeditionModifiers.ts:
// resolveDungeonRuntimeConfig(); worldtiers/worldTierDefinitions.ts:
// resolveCombinedRuntimeConfig()) — ids -> multiplicadores reais, nunca
// um switch/if por id: cada Mod aponta pra UM eixo de
// `CombinedRuntimeConfig` (a tabela `MAP_MODIFIER_AXIS` abaixo), e o
// multiplicador em si é sempre `1 + magnitudePercent / 100` (mesmo
// número já publicado no Registry, Sprint 32 — nunca um segundo valor
// inventado aqui).
//
// Por que reutilizar `CombinedRuntimeConfig` em vez de criar um tipo
// próprio: os 5 eixos reais que os 8 Mods precisam (dano/vida de
// monstro, chance de Elite, ouro, XP, quantidade/raridade de loot) já
// são exatamente `enemyDamageMultiplier`/`enemyLifeMultiplier`/
// `eliteChanceMultiplier`/`rewardMultiplier`/`xpMultiplier`/
// `lootMultiplier`/`lootRarityMultiplier` — os MESMOS campos que
// Combat/Encounter/Loot/Economia já leem desde as Sprints de World
// Tiers/Dungeon Modifiers. Um tipo paralelo duplicaria a mesma forma
// sem nenhum ganho.
const MAP_MODIFIER_AXIS: Partial<Record<MapModifierId, keyof CombinedRuntimeConfig>> = {
  "monster-damage-up": "enemyDamageMultiplier",
  "monster-life-up": "enemyLifeMultiplier",
  "elite-chance-up": "eliteChanceMultiplier",
  "gold-quantity-up": "rewardMultiplier",
  "experience-up": "xpMultiplier",
  "loot-quantity-up": "lootMultiplier",
  "rarity-up": "lootRarityMultiplier",
  // Fase 6 — Boss Modifier: "boss-power-up... Ainda sem efeito. Apenas
  // criar ponto oficial de integração." Reconhecido aqui (a chave
  // existe, `undefined` como valor) — o resolvedor abaixo já sabe
  // ignorá-lo (nenhum eixo = nenhuma contribuição), documentando
  // explicitamente que este é o ponto que uma Sprint futura vai
  // preencher, em vez de simplesmente omitir o id e deixar a decisão
  // implícita.
  "boss-power-up": undefined,
};

// Fase 2-5 — combinação SEMPRE multiplicativa (mesmo princípio de
// `combineField()` em expeditionModifiers.ts): cada Mod ativo multiplica
// o eixo que ele afeta; Mods sem `enabled`/id desconhecido/sem eixo
// (boss-power-up) não contribuem em nada — "dado que falta, nunca
// lógica que falta". `modifierIds` vazio/ausente devolve `base`
// inalterado (mesma referência de valor de `NEUTRAL_COMBINED_RUNTIME_CONFIG`
// quando `base` já era neutro).
export function applyMapModifiers(base: CombinedRuntimeConfig, modifierIds: readonly MapModifierId[] | undefined): CombinedRuntimeConfig {
  if (!modifierIds || modifierIds.length === 0) return base;

  const result = { ...base };
  for (const id of modifierIds) {
    const mod = getMapModifier(id);
    if (!mod || !mod.enabled) continue;
    const axis = MAP_MODIFIER_AXIS[id];
    if (!axis) continue;
    const multiplier = 1 + mod.magnitudePercent / 100;
    result[axis] = result[axis] * multiplier;
  }
  return result;
}
