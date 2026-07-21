// Enemy System Phase I — Enemy Template -> Enemy Instance -> Character
// Build -> Combat Engine -> Loot Identity -> Loot Generator. A
// fundação definitiva dos inimigos: sem IA/Bosses/Habilidades/UI/
// Multiplayer/balanceamento — só spawn, morte e integração.
//
// Uso básico:
//
//   import { getEnemyTemplate, spawnEnemy, toCombatant, killEnemy,
//            generateLootForKilledEnemy } from "@streamrpg/shared";
//
//   const template = getEnemyTemplate("wolf")!;
//   const instance = spawnEnemy(template, 1234567, 10);
//   const combatant = toCombatant(instance, template);
//   // ... resolveCombat() do Combat Engine, depois:
//   // instance = applyCombatResultToEnemy(instance, combatResult);
//
//   if (instance.currentLife <= 0) {
//     const killResult = killEnemy(instance, template);
//     const loot = generateLootForKilledEnemy(killResult, instance, 999);
//   }
//
// Como adicionar um novo inimigo criando apenas um novo Enemy
// Template: inserir um novo registro em templates.ts
// (ENEMY_TEMPLATES) com id/name/region/levelRange/archetype/
// lootIdentityId/baseStats/growth/futureFlags (+ garantir que exista
// uma MonsterLootIdentity com o mesmo id em
// lootidentity/lootIdentities.ts). Nenhuma outra parte desta camada
// (enemyStats.ts/instance.ts/combatant.ts/lootIntegration.ts) precisa
// mudar — tudo lê o Template pelo `id`, nunca conhece o nome de um
// inimigo específico.
export * from "./types.js";
export * from "./config.js";
export * from "./templates.js";
export * from "./enemyStats.js";
export * from "./instance.js";
export * from "./combatant.js";
export * from "./lootIntegration.js";
