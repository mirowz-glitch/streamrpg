import type { ItemGenGeneratedItem } from "../itemgen/types.js";

// Inventory System Phase I — tipos isolados de propósito, prefixados
// `Inventory*`/`ItemValidation*` pra nunca colidir com o `InventoryItem`
// que já existe em ../types.ts (modelo simples de item usado HOJE por
// InventoryPage/EquipmentSlots — não tocado por esta Sprint). Este
// módulo guarda ItemGenGeneratedItem (Item Generator), não
// InventoryItem.

// Requisito 2 — Inventory Slots: cada slot vazio ou com 1 item, nunca
// stack de equipamento (`quantity` sempre 1 quando ocupado nesta fase).
// O campo já existe pra uma fase futura de consumíveis/materiais
// empilháveis reaproveitar a MESMA estrutura de slot, sem redesenhar
// nada aqui — só um novo tipo de item (não ItemGenGeneratedItem) que
// declare quantity > 1.
export interface InventorySlotState {
  slotIndex: number;
  instanceId: string | null;
  item: ItemGenGeneratedItem | null;
  quantity: number;
}

// Requisito 6 — motivos específicos de falha de integridade, um por
// checagem pedida na Sprint ("Base inexistente", "Prefixos
// inexistentes", "Sufixos inexistentes", "Power Score inválido" +
// "seed"/"item level" como parte da mesma validação de integridade).
export type ItemValidationError =
  | "invalid_seed"
  | "invalid_item_level"
  | "invalid_base_item"
  | "invalid_rarity"
  | "invalid_power_score"
  | "invalid_prefix"
  | "invalid_suffix";

// Requisito 3 — addItem() valida, nesta ordem: id (instanceId),
// duplicação, integridade do item (ItemValidationError) e só por
// último capacidade (não faz sentido gastar um slot livre validando um
// item que já ia falhar por outro motivo).
export type AddItemFailureReason = "invalid_instance_id" | "duplicate_instance_id" | ItemValidationError | "inventory_full";

export type AddItemResult = { success: true; slotIndex: number } | { success: false; reason: AddItemFailureReason };

// Requisito 4 — removeItem() só reporta "not_found"; nunca lança
// exceção, nunca mexe em outro slot além do encontrado.
export type RemoveItemResult =
  | { success: true; slotIndex: number; removedItem: ItemGenGeneratedItem }
  | { success: false; reason: "not_found" };

// Vista somente-leitura, 100% serializável em JSON (sem Map/classe) —
// preparada pra uma futura persistência (requisito 7), sem implementar
// nenhuma.
export interface InventorySnapshot {
  inventoryId: string;
  capacity: number;
  items: InventorySlotState[];
  weight: number;
  version: number;
}
