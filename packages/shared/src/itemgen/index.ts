// Item Generator Phase I — arquitetura procedural de itens (Base Item
// -> Item Level -> Rarity Roll -> Prefix Roll -> Suffix Roll -> Tier
// Roll -> Value Roll -> Power Score -> Final Item), inspirada em Path
// of Exile 2. Sistema paralelo ao modelo simples de itens já em
// produção (ItemRarity/ItemSlot em types.ts, RARITY_WEIGHTS/pickRarity
// em xp.ts) — nenhum dos dois é alterado por este módulo.
//
// Uso básico:
//
//   import { generateItem } from "@streamrpg/shared";
//   const item = generateItem("sword", 42, 1234567);
//   // mesma seed (1234567) + mesmo baseItemId + mesmo itemLevel =
//   // sempre o mesmo item.
//
// Como estender sem tocar em lógica existente:
// - Novo Base Item -> adicionar um registro em baseItems.ts
//   (ITEM_GEN_BASE_ITEMS), com as `tags` corretas (Phase II).
// - Novo Prefixo/Sufixo -> adicionar um registro em prefixes.ts/
//   suffixes.ts (ITEM_GEN_PREFIXES/ITEM_GEN_SUFFIXES), usando um
//   `group` já existente (modGroups.ts) ou um novo (+ registrar lá).
// - Nova Raridade -> adicionar um registro em rarities.ts
//   (ITEM_GEN_RARITIES).
// - Novo Mod Group -> adicionar um registro em modGroups.ts
//   (ITEM_GEN_MOD_GROUPS).
// generator.ts nunca precisa mudar para nenhum desses casos — ele só lê
// as tabelas.
//
// Phase II (Affix System) — resumo do que foi adicionado:
// - `ItemGenBaseItem.tags` + `ItemGenModDefinition.requiredTags`: o mod
//   só rola se o Base Item tiver TODAS as tags exigidas (ex.: Spell
//   Damage exige "spell" — só Staff/Wand têm).
// - `ItemGenModDefinition.excludesGroups`: bloqueio bidirecional entre
//   afixos incompatíveis (ex.: Life Leech x Spell Damage).
// - `ItemGenModTier.weight`: peso do tier ENTRE os já elegíveis pelo
//   Item Level (T1 raro, T4 comum).
// - `ItemGenModDefinition.baseItemWeights`/`rarityWeights`: ajustam a
//   frequência do mod por tipo de equipamento/raridade (weights.ts).
// - Checagem de grupo/exclusão agora é GLOBAL (prefixo x sufixo), não
//   só dentro do mesmo tipo.
export * from "./types.js";
export * from "./rng.js";
export * from "./baseItems.js";
export * from "./rarities.js";
export * from "./modGroups.js";
export * from "./weights.js";
export * from "./prefixes.js";
export * from "./suffixes.js";
export * from "./powerScore.js";
export * from "./generator.js";
