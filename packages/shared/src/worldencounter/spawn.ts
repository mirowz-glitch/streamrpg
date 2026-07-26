import { getEnemyTemplate } from "../enemy/templates.js";
import { spawnEnemy } from "../enemy/instance.js";
import type { EnemyInstance, SpawnEnemyOptions } from "../enemy/types.js";
import { ELITE_MODIFIER } from "./eliteModifiers.js";
import type { DungeonRuntimeConfig, EncounterResult, WorldEncounter } from "./types.js";

// Vertical Slice — Dungeon Modifier Runtime Integration Phase I — Fase
// 2 (Combat): combina o multiplicador da Dungeon (`runtimeConfig`) com
// o que a variante do encontro já concede (Elite; Mini-Boss não recebe
// nenhum) — SEMPRE multiplicativo, nunca substituindo. `undefined`
// quando o produto final é exatamente 1 (nenhum efeito de nenhum dos
// dois lados) — preserva `SpawnEnemyOptions` idêntico a antes pra
// qualquer encontro fora de uma Dungeon com modificador ativo (mesmo
// formato `{}` de sempre pro caso comum).
function combinedMultiplier(base: number | undefined, extra: number): number | undefined {
  const combined = (base ?? 1) * extra;
  return combined === 1 ? undefined : combined;
}

// Requisito 5 — Spawn Integration: "o Encounter Generator nunca cria
// inimigos diretamente. Ele apenas chama spawnEnemy() do Enemy
// System." Esta é a ÚNICA função desta Sprint que chama spawnEnemy()
// — generateEncounter() (generator.ts) nunca faz isso, só devolve a
// receita (EncounterResult) que esta função consome.
//
// Determinístico: os `instanceSeeds` já vêm pré-rolados por
// generateEncounter(); esta função não introduz nenhuma aleatoriedade
// própria, só repassa (regionId, seed rolado, level) pro Enemy System.
//
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1: o único
// ponto onde o multiplicador de stats do Elite (eliteModifiers.ts) é
// de fato aplicado — passado como `SpawnEnemyOptions` pro Enemy System
// já existente (spawnEnemy(), nunca alterado em sua própria lógica de
// combate). Mini-Boss não recebe multiplicador nenhum — ele já é forte
// por conta própria, como um Enemy Template especial (requisito 2).
export function spawnWorldEncounter(result: EncounterResult, runtimeConfig?: DungeonRuntimeConfig): WorldEncounter {
  const enemies: EnemyInstance[] = [];

  const baseOptions: SpawnEnemyOptions =
    result.variant === "elite"
      ? { variant: "elite", statMultipliers: { life: ELITE_MODIFIER.lifeMultiplier, damage: ELITE_MODIFIER.damageMultiplier } }
      : result.variant === "miniboss"
        ? { variant: "miniboss" }
        : {};

  // Fase 2 (Combat): "increased-vitality; increased-damage." Aplicado a
  // QUALQUER variante (normal/elite/miniboss) — uma Dungeon com "Vida
  // Aumentada" deixa TODOS os inimigos dela mais fortes, não só os
  // Elites; combina multiplicativamente com o que a variante já dava
  // (ex.: Elite 3.0x vida × Dungeon 1.2x vida = 3.6x).
  const life = combinedMultiplier(baseOptions.statMultipliers?.life, runtimeConfig?.enemyLifeMultiplier ?? 1);
  const damage = combinedMultiplier(baseOptions.statMultipliers?.damage, runtimeConfig?.enemyDamageMultiplier ?? 1);
  const options: SpawnEnemyOptions = {
    ...baseOptions,
    ...(life !== undefined || damage !== undefined ? { statMultipliers: { life, damage } } : {}),
  };

  for (const group of result.groups) {
    const template = getEnemyTemplate(group.enemyTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template desconhecido "${group.enemyTemplateId}"`);
    }
    for (const instanceSeed of group.instanceSeeds) {
      enemies.push(spawnEnemy(template, instanceSeed, group.level, options));
    }
  }

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // arquitetural: `explorationEventId` só repassado (nenhuma lógica nova
  // aqui) — pra categorias sem combate, `result.groups` já vem `[]` de
  // generator.ts, então `enemies` já nasce vazio sem nenhum `if`
  // especial nesta função.
  return { regionId: result.regionId, seed: result.seed, enemies, variant: result.variant, explorationEventId: result.explorationEventId };
}
