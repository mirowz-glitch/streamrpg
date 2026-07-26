import type { ItemGenBaseItem } from "./types.js";

// Item Generator Phase I — requisito 1: Base Items, só dados neutros
// (slot/dano base/defesa base/velocidade base/requisitos). Nenhum
// atributo mágico aqui — isso só entra via Prefix/Suffix Roll.
//
// Phase II (Affix System) — `tags` foi adicionado: é o que
// prefixes.ts/suffixes.ts usam em `requiredTags` pra decidir
// automaticamente quais mods podem rolar (ex.: só itens com a tag
// "spell" podem rolar Spell Damage). Simplificação assumida: Staff/Wand
// aqui são conjuradores puros (tags "spell"/"caster", sem "physical"),
// então mods de dano físico (Cruel) não rolam neles — mudança
// deliberada desta Phase II (no Phase I, `allowedSlots: ["weapon"]`
// deixava Cruel rolar em qualquer arma, incluindo Staff/Wand).
//
// Adicionar um novo Base Item = inserir um novo registro nesta lista.
// Nenhuma outra parte do gerador (generator.ts) precisa mudar.
//
// Vertical Slice — Commercial Readiness & First Playable Experience
// Phase I — Fase 2/6: `name` é puramente presentacional (a lógica do
// gerador só lê `id`/`slot`/`tags`/os campos numéricos) — traduzido
// pra português. Achado da auditoria hands-on desta Sprint: um item
// encontrado aparecia como "Item encontrado: boots (magic)" numa
// interface 100% português, quebrando a sensação de produto comercial.
export const ITEM_GEN_BASE_ITEMS: ItemGenBaseItem[] = [
  // Weapon
  {
    id: "sword",
    name: "Espada",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 8, max: 14 },
    baseAttackSpeed: 1.2,
    requirements: { level: 1, strength: 10 },
  },
  {
    id: "axe",
    name: "Machado",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 11, max: 18 },
    baseAttackSpeed: 1.0,
    requirements: { level: 1, strength: 12 },
  },
  {
    id: "bow",
    name: "Arco",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "ranged", "physical"],
    baseDamage: { min: 7, max: 12 },
    baseAttackSpeed: 1.3,
    requirements: { level: 1, dexterity: 12 },
  },
  {
    id: "dagger",
    name: "Adaga",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 5, max: 9 },
    baseAttackSpeed: 1.6,
    requirements: { level: 1, dexterity: 10 },
  },
  {
    id: "staff",
    name: "Cajado",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "spell", "caster"],
    baseDamage: { min: 6, max: 10 },
    baseAttackSpeed: 1.0,
    requirements: { level: 1, intelligence: 14 },
  },
  {
    id: "wand",
    name: "Varinha",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "ranged", "spell", "caster"],
    baseDamage: { min: 4, max: 8 },
    baseAttackSpeed: 1.4,
    requirements: { level: 1, intelligence: 10 },
  },
  {
    id: "mace",
    name: "Maça",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 13, max: 20 },
    baseAttackSpeed: 0.8,
    requirements: { level: 1, strength: 14 },
  },

  // Armor
  {
    id: "helmet",
    name: "Elmo",
    category: "armor",
    slot: "helmet",
    tags: ["armor", "defense"],
    baseDefense: 12,
    requirements: { level: 1 },
  },
  {
    id: "chest",
    name: "Peitoral",
    category: "armor",
    slot: "chest",
    tags: ["armor", "defense"],
    baseDefense: 24,
    requirements: { level: 1 },
  },
  {
    id: "gloves",
    name: "Luvas",
    category: "armor",
    slot: "gloves",
    tags: ["armor", "defense"],
    baseDefense: 8,
    requirements: { level: 1 },
  },
  {
    id: "boots",
    name: "Botas",
    category: "armor",
    slot: "boots",
    tags: ["armor", "defense"],
    baseDefense: 8,
    requirements: { level: 1 },
  },

  // Accessories
  {
    id: "ring",
    name: "Anel",
    category: "accessory",
    slot: "ring",
    tags: ["accessory"],
    requirements: { level: 1 },
  },
  {
    id: "amulet",
    name: "Amuleto",
    category: "accessory",
    slot: "amulet",
    tags: ["accessory"],
    requirements: { level: 1 },
  },
  {
    id: "belt",
    name: "Cinto",
    category: "accessory",
    slot: "belt",
    tags: ["accessory"],
    requirements: { level: 1 },
  },
];

export function getBaseItem(id: string): ItemGenBaseItem | undefined {
  return ITEM_GEN_BASE_ITEMS.find((item) => item.id === id);
}
