import type { CharacterClassDefinition } from "./types.js";

// Character Build Phase I — requisito 5: as 4 classes. Cada uma só
// define atributos iniciais e crescimento por nível — nenhuma
// habilidade, nenhuma lógica própria. Valores ilustrativos, não
// calibrados (mesma convenção de CRITICAL_HIT_CHANCE/pesos do Item
// Generator/Loot Generator).
//
// Requisito 8 — "adicionar uma nova classe deve exigir apenas: criar
// uma nova tabela": inserir um novo registro nesta lista. Nenhuma
// outra parte desta camada (baseAttributes.ts/derivedAttributes.ts/
// characterBuild.ts/finalStats.ts) precisa mudar.
export const CHARACTER_CLASSES: CharacterClassDefinition[] = [
  {
    id: "warrior",
    name: "Warrior",
    startingAttributes: { strength: 20, dexterity: 10, intelligence: 5, vitality: 15 },
    growthPerLevel: { strength: 3, dexterity: 1, intelligence: 0.5, vitality: 2.5 },
  },
  {
    id: "mage",
    name: "Mage",
    startingAttributes: { strength: 5, dexterity: 8, intelligence: 22, vitality: 8 },
    growthPerLevel: { strength: 0.5, dexterity: 1, intelligence: 3, vitality: 1.2 },
  },
  {
    id: "ranger",
    name: "Ranger",
    startingAttributes: { strength: 8, dexterity: 20, intelligence: 8, vitality: 10 },
    growthPerLevel: { strength: 1, dexterity: 3, intelligence: 0.8, vitality: 1.5 },
  },
  {
    id: "cleric",
    name: "Cleric",
    startingAttributes: { strength: 12, dexterity: 8, intelligence: 15, vitality: 14 },
    growthPerLevel: { strength: 1.2, dexterity: 0.8, intelligence: 2, vitality: 2 },
  },
];

export function getCharacterClass(id: string): CharacterClassDefinition | undefined {
  return CHARACTER_CLASSES.find((classDef) => classDef.id === id);
}
