import type { MonsterArchetype } from "./types.js";

// Monster Loot Identity Phase I — requisito 1: os 8 Monster Archetypes.
// Valores ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE/pesos de mod/Loot Table já usada no resto do
// projeto).
//
// Base Item Affinity (requisito 2) — o brief cita alguns nomes que
// ainda não existem como Base Item real (ex.: "Claws"/"Leather"/"Fur"
// pro Beast; só "Boots" da lista existe hoje em itemgen/baseItems.ts).
// Nenhum Base Item novo foi criado aqui — "Nunca alterar o Item
// Generator" também vale pros dados dele. Mapeei pro que já existe
// tematicamente mais próximo: Claws -> Dagger, Leather/Fur -> Boots/
// Belt. Undead/Bandit/Mage já batem 1:1 com ids reais (Staff/Wand/Ring,
// Sword/Dagger/Bow, Staff/Wand/Amulet).
//
// Affix Affinity (requisito 3) — mesma limitação: "Chaos" (Undead) e
// "Mana" (Mage) não existem como tag/mod no Item Generator ainda (só
// existe dano físico/spell/fogo/frio/raio/vida/força/velocidade/
// crítico/acerto/leech — ver itemgen/prefixes.ts e suffixes.ts).
// Omitidos aqui pelo mesmo motivo — adicionar essas tags exigiria
// alterar o Item Generator, fora do escopo desta Sprint. "Elemental"
// (Mage) foi traduzido pras 3 tags elementares que já existem: fire/
// cold/lightning.
//
// Adicionar um novo Archetype = inserir um novo registro nesta lista.
// Nenhuma outra parte desta camada (resolve.ts/generator.ts) precisa
// mudar.
export const MONSTER_ARCHETYPES: MonsterArchetype[] = [
  {
    id: "beast",
    name: "Beast",
    tags: ["beast", "feral", "physical"],
    lootBias: {
      baseItemAffinity: { dagger: 1.6, boots: 1.5, belt: 1.4 },
      affixAffinity: { life: 1.5, physical: 1.4, attack_speed: 1.3 },
      rarityBias: {},
    },
    currencyBias: { gold: 0.6, craft_material: 1.5 },
    futureCraftBias: { essence: 1.2 },
  },
  {
    id: "undead",
    name: "Undead",
    tags: ["undead", "spell", "cold"],
    lootBias: {
      baseItemAffinity: { staff: 1.5, wand: 1.5, ring: 1.4 },
      affixAffinity: { spell: 1.6, cold: 1.5 },
      rarityBias: {},
    },
    currencyBias: { fragment: 1.6, gold: 0.5 },
    futureCraftBias: { essence: 1.4 },
  },
  {
    id: "humanoid",
    name: "Humanoid",
    tags: ["humanoid", "versatile"],
    lootBias: {
      baseItemAffinity: { sword: 1.2, axe: 1.2, mace: 1.2, chest: 1.2, helmet: 1.2 },
      affixAffinity: {},
      rarityBias: {},
    },
    currencyBias: { gold: 1.0 },
    futureCraftBias: {},
  },
  {
    id: "bandit",
    name: "Bandit",
    tags: ["bandit", "cunning", "physical"],
    lootBias: {
      baseItemAffinity: { sword: 1.4, dagger: 1.5, bow: 1.4 },
      affixAffinity: { critical: 1.5, accuracy: 1.4, attack_speed: 1.3 },
      rarityBias: {},
    },
    currencyBias: { gold: 1.5, rune: 0.3 },
    futureCraftBias: { catalyst: 1.1 },
  },
  {
    id: "mage",
    name: "Mage",
    tags: ["mage", "spell", "elemental"],
    lootBias: {
      baseItemAffinity: { staff: 1.6, wand: 1.6, amulet: 1.4 },
      affixAffinity: { spell: 1.6, fire: 1.3, cold: 1.3, lightning: 1.3 },
      rarityBias: {},
    },
    currencyBias: { craft_material: 1.6, fragment: 1.2 },
    futureCraftBias: { catalyst: 1.3 },
  },
  {
    id: "construct",
    name: "Construct",
    tags: ["construct", "mechanical", "defense"],
    lootBias: {
      baseItemAffinity: { chest: 1.5, helmet: 1.4, gloves: 1.3, boots: 1.3 },
      affixAffinity: { strength: 1.4, life: 1.2 },
      rarityBias: {},
    },
    currencyBias: { fragment: 1.6, craft_material: 1.2 },
    futureCraftBias: { essence: 1.1 },
  },
  {
    id: "demon",
    name: "Demon",
    tags: ["demon", "fire", "chaos"],
    lootBias: {
      baseItemAffinity: { axe: 1.3, mace: 1.3, amulet: 1.3, ring: 1.2 },
      affixAffinity: { fire: 1.4, physical: 1.3, life_leech: 1.3 },
      rarityBias: {},
    },
    currencyBias: { boss_material: 1.3, fragment: 1.3, rune: 1.2 },
    futureCraftBias: { essence: 1.3 },
  },
  {
    id: "boss",
    name: "Boss",
    tags: ["boss"],
    lootBias: {
      // "Todos permitidos" (requisito 2) / "Sem restrições" (requisito
      // 3) -> nenhum viés de Base Item ou de mod, todo mundo com o
      // mesmo peso relativo.
      baseItemAffinity: {},
      affixAffinity: {},
      // Exemplo literal da Sprint: "Boss: Rare x4, Unique x1".
      rarityBias: { rare: 4, unique: 1 },
    },
    // Exemplo literal da Sprint: "Boss: Tudo elevado".
    currencyBias: { gold: 2, craft_material: 2, fragment: 2, boss_material: 3, rune: 2 },
    futureCraftBias: { essence: 1.5, catalyst: 1.5 },
  },
];

export function getArchetype(id: string): MonsterArchetype | undefined {
  return MONSTER_ARCHETYPES.find((archetype) => archetype.id === id);
}
