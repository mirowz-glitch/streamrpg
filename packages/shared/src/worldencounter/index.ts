// World Encounter System Phase I — Region -> Encounter Table ->
// Encounter Generator -> Enemy Template -> Spawn Enemy -> World
// Encounter. Decide quando/onde/como inimigos aparecem — sem IA,
// pathfinding, bosses, eventos, multiplayer, UI ou balanceamento.
//
// Uso básico:
//
//   import { generateEncounter, spawnWorldEncounter } from "@streamrpg/shared";
//   const recipe = generateEncounter("bosque-sussurrante", 10, 1234567);
//   const encounter = spawnWorldEncounter(recipe);
//   // encounter.enemies é um EnemyInstance[] de verdade (Enemy System),
//   // já pronto pra toCombatant()/resolveCombat() (Combat Engine).
//
// Como adicionar uma nova região ou um novo encontro só com dados
// novos: inserir um novo objeto em ENCOUNTER_TABLES (encounterTables.ts)
// pra uma região nova, ou um novo item em `entries` de uma região já
// existente pra um encontro novo (garantindo que `enemyTemplateId`
// exista em ENEMY_TEMPLATES, Enemy System). generator.ts/spawn.ts
// nunca precisam mudar — tudo lê a Encounter Table pelo `regionId`,
// nunca conhece o nome de uma região ou de um inimigo específico.
export * from "./types.js";
export * from "./config.js";
export * from "./encounterTables.js";
export * from "./generator.js";
export * from "./spawn.js";
export * from "./biomes.js";
export * from "./regionProgression.js";
export * from "./eliteModifiers.js";
