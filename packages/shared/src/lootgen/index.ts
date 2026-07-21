// Loot Generator Phase I — Monster/Chest/Boss -> Loot Table -> Drop
// Chance -> Quantidade -> Item Generator -> LootResult. Consome
// generateItem() (itemgen/) exclusivamente — nenhum item é montado à
// mão neste módulo.
//
// Uso básico:
//
//   import { generateLoot } from "@streamrpg/shared";
//   const loot = generateLoot("wolf", 20, 1234567);
//   // mesmo sourceId ("wolf") + mesmo monsterLevel (20) + mesma seed
//   // (1234567) = sempre o mesmo LootResult.
//
// Como estender sem tocar em lógica existente:
// - Novo monstro ou novo baú -> adicionar um registro em
//   lootTables.ts (LOOT_TABLES). generator.ts nunca precisa mudar.
export * from "./types.js";
export * from "./lootTables.js";
export * from "./generator.js";
