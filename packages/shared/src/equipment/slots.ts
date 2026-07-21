import type { EquipmentSlotDefinition } from "./types.js";

// Equipment System Phase I — requisito 1: os 9 slots de Equipment, e
// requisito 7 ("adicionar um novo slot deve exigir apenas: adicionar
// um registro na tabela"). Nenhum outro arquivo (equipment.ts/
// stats.ts) sabe o nome de um slot específico — tudo lê esta tabela.
//
// Adicionar um novo slot (ex.: "Cloak"/"Ring 3") = inserir um novo
// registro aqui, com o `acceptsItemSlot` correto. Nenhuma outra parte
// desta camada precisa mudar.
export const EQUIPMENT_SLOT_DEFINITIONS: EquipmentSlotDefinition[] = [
  { id: "weapon", label: "Weapon", acceptsItemSlot: "weapon" },
  { id: "helmet", label: "Helmet", acceptsItemSlot: "helmet" },
  { id: "chest", label: "Chest", acceptsItemSlot: "chest" },
  { id: "gloves", label: "Gloves", acceptsItemSlot: "gloves" },
  { id: "boots", label: "Boots", acceptsItemSlot: "boots" },
  { id: "ring1", label: "Ring 1", acceptsItemSlot: "ring" },
  { id: "ring2", label: "Ring 2", acceptsItemSlot: "ring" },
  { id: "amulet", label: "Amulet", acceptsItemSlot: "amulet" },
  { id: "belt", label: "Belt", acceptsItemSlot: "belt" },
];

export function getEquipmentSlotDefinition(id: string): EquipmentSlotDefinition | undefined {
  return EQUIPMENT_SLOT_DEFINITIONS.find((definition) => definition.id === id);
}
