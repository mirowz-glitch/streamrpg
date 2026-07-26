import type { EquipmentSlotDefinition } from "./types.js";

// Equipment System Phase I — requisito 1: os 9 slots de Equipment, e
// requisito 7 ("adicionar um novo slot deve exigir apenas: adicionar
// um registro na tabela"). Nenhum outro arquivo (equipment.ts/
// stats.ts) sabe o nome de um slot específico — tudo lê esta tabela.
//
// Adicionar um novo slot (ex.: "Cloak"/"Ring 3") = inserir um novo
// registro aqui, com o `acceptsItemSlot` correto. Nenhuma outra parte
// desta camada precisa mudar.
// Vertical Slice — Commercial Readiness & First Playable Experience
// Phase I — Fase 2/6: `label` é puramente presentacional (nenhuma
// lógica de equipar/comparar lê o texto, só `id`/`acceptsItemSlot`) —
// traduzido pra português, consistente com o resto da interface.
export const EQUIPMENT_SLOT_DEFINITIONS: EquipmentSlotDefinition[] = [
  { id: "weapon", label: "Arma", acceptsItemSlot: "weapon" },
  { id: "helmet", label: "Elmo", acceptsItemSlot: "helmet" },
  { id: "chest", label: "Peitoral", acceptsItemSlot: "chest" },
  { id: "gloves", label: "Luvas", acceptsItemSlot: "gloves" },
  { id: "boots", label: "Botas", acceptsItemSlot: "boots" },
  { id: "ring1", label: "Anel 1", acceptsItemSlot: "ring" },
  { id: "ring2", label: "Anel 2", acceptsItemSlot: "ring" },
  { id: "amulet", label: "Amuleto", acceptsItemSlot: "amulet" },
  { id: "belt", label: "Cinto", acceptsItemSlot: "belt" },
];

export function getEquipmentSlotDefinition(id: string): EquipmentSlotDefinition | undefined {
  return EQUIPMENT_SLOT_DEFINITIONS.find((definition) => definition.id === id);
}
