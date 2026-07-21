import type { ItemGenModDefinition } from "./types.js";

// Item Generator Phase I/II — banco de Sufixos. Mesmo padrão dos
// prefixos (prefixes.ts) — id/grupo/peso/tiers/tags/requiredTags/
// exclusões, tudo em dados. Valores ilustrativos, não calibrados.
//
// Phase II (Affix System) — ver o cabeçalho de prefixes.ts pra
// explicação de `requiredTags`/`tiers[].weight`/`baseItemWeights`/
// `rarityWeights`. "of Precision" (Critical) é o mod novo desta fase,
// completando o exemplo da Sprint ("Sword pode rolar Physical Damage,
// Attack Speed, Accuracy, Critical, Life Leech"). "of the Vampire"
// (Life Leech) ganhou `excludesGroups: ["spell_damage"]` — o bloqueio
// entre afixos incompatíveis pedido na Sprint: leech é uma mecânica de
// ataque físico, não deveria coexistir com Spell Damage no mesmo item
// (em Staff/Wand os dois são elegíveis por tag, então esse bloqueio só
// é observável ali).
//
// Adicionar um novo Sufixo = inserir um novo registro nesta lista.
// Nenhuma outra parte do gerador (generator.ts) precisa mudar.
export const ITEM_GEN_SUFFIXES: ItemGenModDefinition[] = [
  {
    id: "suffix_of_the_bear",
    type: "suffix",
    group: "life",
    name: "of the Bear",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 90, max: 110, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 55, max: 89, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 30, max: 54, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 12, max: 29, weight: 72 },
    ],
  },
  {
    id: "suffix_of_accuracy",
    type: "suffix",
    group: "accuracy",
    name: "of Accuracy",
    statLabel: "Accuracy",
    weight: 90,
    tags: ["offense", "accuracy"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 50, min: 140, max: 170, weight: 2 },
      { tier: 2, minItemLevel: 30, min: 90, max: 139, weight: 8 },
      { tier: 3, minItemLevel: 10, min: 40, max: 89, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 10, max: 39, weight: 72 },
    ],
  },
  {
    id: "suffix_of_precision",
    type: "suffix",
    group: "critical",
    name: "of Precision",
    statLabel: "Critical Strike Chance",
    weight: 70,
    tags: ["offense", "critical"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    rarityWeights: { rare: 1.3, unique: 1.6 },
    tiers: [
      { tier: 1, minItemLevel: 55, min: 8, max: 10, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 5, max: 7, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 3, max: 4, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 2, weight: 72 },
    ],
  },
  {
    id: "suffix_of_fire",
    type: "suffix",
    group: "fire_damage",
    name: "of Fire",
    statLabel: "Fire Damage",
    weight: 80,
    tags: ["damage", "fire"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 60, max: 80, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 35, max: 59, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 18, max: 34, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 5, max: 17, weight: 72 },
    ],
  },
  {
    id: "suffix_of_frost",
    type: "suffix",
    group: "cold_damage",
    name: "of Frost",
    statLabel: "Cold Damage",
    weight: 80,
    tags: ["damage", "cold"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 60, max: 80, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 35, max: 59, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 18, max: 34, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 5, max: 17, weight: 72 },
    ],
  },
  {
    id: "suffix_of_storms",
    type: "suffix",
    group: "lightning_damage",
    name: "of Storms",
    statLabel: "Lightning Damage",
    weight: 80,
    tags: ["damage", "lightning"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 5, max: 120, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 3, max: 80, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 2, max: 45, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 20, weight: 72 },
    ],
  },
  {
    id: "suffix_of_the_vampire",
    type: "suffix",
    group: "life_leech",
    name: "of the Vampire",
    statLabel: "Life Leech",
    weight: 60,
    tags: ["damage", "life_leech"],
    requiredTags: ["weapon"],
    // Bloqueio entre afixos incompatíveis (requisito da Sprint): Life
    // Leech é uma mecânica de ataque físico, nunca deveria coexistir
    // com Spell Damage no mesmo item — checagem bidirecional em
    // generator.ts, então não precisa declarar o mesmo em
    // prefix_mystic.
    excludesGroups: ["spell_damage"],
    tiers: [
      { tier: 1, minItemLevel: 60, min: 5, max: 6, weight: 2 },
      { tier: 2, minItemLevel: 40, min: 3, max: 4, weight: 8 },
      { tier: 3, minItemLevel: 20, min: 2, max: 2, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 1, weight: 72 },
    ],
  },
];
