// Equipment System Phase I — Inventory -> Equip() -> Equipment ->
// Character Stats. Conecta o Inventário ao Personagem: equipar/
// desequipar move o item entre os dois; o Stat Aggregator soma tudo
// que está equipado num único ponto.
//
// Uso básico:
//
//   import { Equipment, calculateCharacterStats } from "@streamrpg/shared";
//   const equipment = new Equipment("char-42");
//   const result = equipment.equipItem(inventory, "weapon", "drop-001");
//   if (result.success) {
//     const stats = calculateCharacterStats(equipment);
//   }
//
// Como adicionar um novo slot de equipamento sem alterar nenhuma
// lógica: inserir um novo registro em slots.ts
// (EQUIPMENT_SLOT_DEFINITIONS) com o `acceptsItemSlot` correto.
// equipItem()/unequipItem()/calculateCharacterStats() nunca precisam
// mudar — todos leem essa tabela (ou os slots já criados a partir
// dela), nunca o nome de um slot específico.
export * from "./types.js";
export * from "./slots.js";
export * from "./equipment.js";
export * from "./stats.js";
