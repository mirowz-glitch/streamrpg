import type { ItemGenModGroup } from "./types.js";

// Item Generator Phase II — requisito "grupos de mods (mod groups)":
// registro central de todo grupo existente. Um grupo pode ter vários
// mods (ex.: "life" tem Healthy/Vigorous/Massive, prefixes.ts) — o
// gerador nunca deixa dois mods do mesmo grupo coexistirem no mesmo
// item (generator.ts).
//
// Adicionar um novo Mod Group = inserir um novo registro aqui e usar o
// mesmo `id` no campo `group` dos mods em prefixes.ts/suffixes.ts.
export const ITEM_GEN_MOD_GROUPS: ItemGenModGroup[] = [
  { id: "physical_damage", label: "Physical Damage" },
  { id: "spell_damage", label: "Spell Damage" },
  { id: "strength", label: "Strength" },
  { id: "life", label: "Life" },
  { id: "attack_speed", label: "Attack Speed" },
  { id: "accuracy", label: "Accuracy" },
  { id: "critical", label: "Critical" },
  { id: "fire_damage", label: "Fire Damage" },
  { id: "cold_damage", label: "Cold Damage" },
  { id: "lightning_damage", label: "Lightning Damage" },
  { id: "life_leech", label: "Life Leech" },
];
