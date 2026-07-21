import type { ItemGenGeneratedItem, ItemGenSlot } from "../itemgen/types.js";
import type { ItemValidationError } from "../inventory/types.js";

// Equipment System Phase I — tipos isolados de propósito, prefixados
// `Equipment*`/`Character*` pra nunca colidir com `EquippedItem`/
// `ItemSlot` que já existem em ../types.ts (modelo simples de
// equipamento usado HOJE por CharacterPage/EquipmentSlots — não tocado
// por esta Sprint). Este módulo guarda ItemGenGeneratedItem (Item
// Generator) vindo do Inventory, não EquippedItem.

// Requisito 1 — cada slot de Equipment aceita exatamente um
// ItemGenSlot (o "tipo" de Base Item que cabe ali). Weapon/Helmet/
// Chest/Gloves/Boots/Amulet/Belt mapeiam 1:1; Ring 1 e Ring 2 são dois
// slots de Equipment DIFERENTES que aceitam o mesmo ItemGenSlot
// "ring" (o Item Generator só tem um slot de anel — Equipment é quem
// decide que existem dois lugares pra usar esse tipo de item).
export interface EquipmentSlotDefinition {
  id: string;
  label: string;
  acceptsItemSlot: ItemGenSlot;
}

// Requisito 8 — "Data Driven": cada slot de Equipment vazio ou com 1
// item, nunca stack (o mesmo princípio de InventorySlotState) — nunca
// um campo nomeado "weaponSlot"/"helmetSlot"/... por fora da tabela
// (EQUIPMENT_SLOT_DEFINITIONS, slots.ts).
export interface EquipmentSlotState {
  slotId: string;
  instanceId: string | null;
  item: ItemGenGeneratedItem | null;
}

// Requisito 2 — equipItem() valida, nesta ordem (a única ordem
// logicamente possível: não dá pra checar "tipo correto" antes de ter
// o item de verdade em mãos):
//   1. slot correto (equipmentSlotId existe em EQUIPMENT_SLOT_DEFINITIONS)
//   2. item existente (inventoryInstanceId existe no Inventory)
//   3. item válido (mesma validateGeneratedItem() do Inventory System)
//   4. tipo correto (Base Item do item bate com slotDef.acceptsItemSlot)
// "item equipado anteriormente" não é uma causa de falha — é
// informação: se já havia algo equipado ali, ele é trocado
// automaticamente e devolvido no campo `previousItem` do sucesso.
export type EquipItemFailureReason = "invalid_slot" | "item_not_found" | ItemValidationError | "wrong_item_type" | "swap_failed";

export type EquipItemResult =
  | { success: true; equipmentSlotId: string; previousItem: ItemGenGeneratedItem | null }
  | { success: false; reason: EquipItemFailureReason };

// Requisito 3 — unequipItem() "nunca perde item": só remove do
// Equipment DEPOIS de confirmar que o Inventory tem espaço pra
// recebê-lo de volta (addItem() já faz essa validação; se falhar,
// nada muda no Equipment).
export type UnequipItemFailureReason = "invalid_slot" | "empty_slot" | "inventory_full";

export type UnequipItemResult =
  | { success: true; equipmentSlotId: string; item: ItemGenGeneratedItem; inventorySlotIndex: number }
  | { success: false; reason: UnequipItemFailureReason };

// Requisito 6 — mesmos 4 tipos de dano já modelados no Item Generator
// (physical/fire/cold/lightning, ver itemgen/prefixes.ts/suffixes.ts),
// prontos pra somar de verdade assim que existir um mod que conceda
// resistência (nenhum concede hoje) — sem precisar mudar o Stat
// Aggregator (stats.ts) quando isso acontecer.
export interface CharacterResistances {
  physical: number;
  fire: number;
  cold: number;
  lightning: number;
}

// Requisito 5 — Stat Aggregator: os 9 stats pedidos + Power Score.
export interface CharacterStats {
  life: number;
  attack: number;
  defense: number;
  spellDamage: number;
  critical: number;
  accuracy: number;
  attackSpeed: number;
  lifeLeech: number;
  resistances: CharacterResistances;
  powerScore: number;
}
