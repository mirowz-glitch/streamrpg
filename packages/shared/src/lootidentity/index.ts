// Monster Loot Identity Phase I — dá personalidade de loot pra cada
// criatura: Monster -> Loot Identity -> Loot Table -> Loot Generator ->
// Item Generator -> Generated Item. O Loot Generator continua sendo o
// único responsável por gerar os itens; esta camada só define QUAIS
// itens/mods/raridades cada criatura favorece (nunca garante).
//
// Uso básico:
//
//   import { generateMonsterLoot } from "@streamrpg/shared";
//   const loot = generateMonsterLoot("wolf", 10, 1234567);
//   // mesmo monsterId ("wolf") + mesmo monsterLevel (10) + mesma seed
//   // (1234567) = sempre o mesmo LootResult, agora com o bias de Beast
//   // + o próprio ajuste de raridade do Wolf aplicado.
//
// Como estender sem tocar em lógica existente:
// - Novo Archetype -> adicionar um registro em archetypes.ts
//   (MONSTER_ARCHETYPES).
// - Novo monstro -> (1) escolher/criar um Archetype, (2) adicionar um
//   registro em lootIdentities.ts (MONSTER_LOOT_IDENTITIES) com o mesmo
//   `monsterId` de uma Loot Table já existente em lootgen/lootTables.ts
//   (ou criar uma nova lá, seguindo a mesma convenção do Loot Generator
//   Phase I). resolve.ts/generator.ts nunca precisam mudar.
export * from "./types.js";
export * from "./archetypes.js";
export * from "./lootIdentities.js";
export * from "./resolve.js";
export * from "./generator.js";
