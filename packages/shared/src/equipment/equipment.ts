import { getBaseItem } from "../itemgen/baseItems.js";
import type { ItemGenGeneratedItem } from "../itemgen/types.js";
import type { Inventory } from "../inventory/inventory.js";
import { validateGeneratedItem } from "../inventory/validation.js";
import { EQUIPMENT_SLOT_DEFINITIONS, getEquipmentSlotDefinition } from "./slots.js";
import type { EquipItemResult, EquipmentSlotState, UnequipItemResult } from "./types.js";

// Equipment System Phase I — Inventory -> Equip() -> Equipment ->
// Character Stats. Cada personagem possui exatamente UM Equipment
// (requisito 1), com um slot fixo por registro de
// EQUIPMENT_SLOT_DEFINITIONS (slots.ts) — nunca um campo nomeado por
// fora dessa tabela (requisito 8).
//
// Igual ao Inventory (packages/shared/src/inventory) — e diferente dos
// módulos puros itemgen/lootgen/lootidentity — Equipment é estado que
// muda (equipar/desequipar ao longo de uma sessão), por isso também é
// uma classe com mutação interna, no mesmo espírito de
// apps/api/src/engine|systems.
//
// "Não alterar: Inventory" — este arquivo só CONSOME a API pública já
// existente do Inventory (findById/addItem/removeItem), nunca lê nem
// escreve os campos privados dele.
export class Equipment {
  readonly characterId: string;
  version: number;

  private slots: EquipmentSlotState[];

  constructor(characterId: string) {
    this.characterId = characterId;
    this.version = 0;
    this.slots = EQUIPMENT_SLOT_DEFINITIONS.map((definition) => ({
      slotId: definition.id,
      instanceId: null,
      item: null,
    }));
  }

  // Vista somente-leitura de todos os slots (vazio ou com 1 item cada).
  get items(): readonly EquipmentSlotState[] {
    return this.slots;
  }

  private findSlotIndex(equipmentSlotId: string): number {
    return this.slots.findIndex((slot) => slot.slotId === equipmentSlotId);
  }

  getEquippedItem(equipmentSlotId: string): ItemGenGeneratedItem | null {
    const slotIndex = this.findSlotIndex(equipmentSlotId);
    return slotIndex === -1 ? null : this.slots[slotIndex].item;
  }

  // Requisito 2 — recebe um Inventory Slot (via `inventoryInstanceId`,
  // o identificador único que o Inventory System já usa) e o slot de
  // Equipment de destino. Validações na ordem documentada em
  // types.ts. "item equipado anteriormente": se já havia algo ali, a
  // troca é automática — o item antigo volta pro MESMO slot de
  // Inventory que acabou de ser liberado pelo novo item (nunca perde
  // dado, nunca precisa de um segundo slot livre pra trocar de arma).
  equipItem(inventory: Inventory, equipmentSlotId: string, inventoryInstanceId: string): EquipItemResult {
    const slotIndex = this.findSlotIndex(equipmentSlotId);
    if (slotIndex === -1) {
      return { success: false, reason: "invalid_slot" };
    }
    const slotDefinition = EQUIPMENT_SLOT_DEFINITIONS[slotIndex];

    const inventorySlot = inventory.findById(inventoryInstanceId);
    if (!inventorySlot || !inventorySlot.item) {
      return { success: false, reason: "item_not_found" };
    }
    const item = inventorySlot.item;

    const validationError = validateGeneratedItem(item);
    if (validationError) {
      return { success: false, reason: validationError };
    }

    const base = getBaseItem(item.baseItemId);
    if (!base || base.slot !== slotDefinition.acceptsItemSlot) {
      return { success: false, reason: "wrong_item_type" };
    }

    // Validações passaram — agora move de verdade. removeItem() aqui
    // sempre resolve success:true (acabamos de confirmar via
    // findById() que o item existe), mas o resultado é checado mesmo
    // assim por segurança defensiva.
    const removeResult = inventory.removeItem(inventoryInstanceId);
    if (!removeResult.success) {
      return { success: false, reason: "item_not_found" };
    }

    const previousSlot = this.slots[slotIndex];
    const previousItem = previousSlot.item;
    const previousInstanceId = previousSlot.instanceId;

    if (previousItem && previousInstanceId) {
      // O slot de Inventory que acabou de ser liberado por
      // removeItem() acima garante espaço pro item antigo — mas se,
      // por qualquer motivo, isso falhar, desfaz a operação inteira
      // (devolve o item novo pro Inventory) em vez de perder o item
      // antigo.
      const returnResult = inventory.addItem(previousInstanceId, previousItem);
      if (!returnResult.success) {
        inventory.addItem(inventoryInstanceId, item);
        return { success: false, reason: "swap_failed" };
      }
    }

    this.slots[slotIndex] = { slotId: slotDefinition.id, instanceId: inventoryInstanceId, item };
    this.version++;

    return { success: true, equipmentSlotId: slotDefinition.id, previousItem };
  }

  // Requisito 3 — "retorna o item para o inventário, nunca perde
  // item, valida inventário cheio": só desequipa DEPOIS de confirmar
  // que o addItem() no Inventory teria sucesso — se o Inventory
  // estiver cheio, o Equipment nem chega a ser tocado.
  unequipItem(inventory: Inventory, equipmentSlotId: string): UnequipItemResult {
    const slotIndex = this.findSlotIndex(equipmentSlotId);
    if (slotIndex === -1) {
      return { success: false, reason: "invalid_slot" };
    }

    const slot = this.slots[slotIndex];
    if (!slot.item || !slot.instanceId) {
      return { success: false, reason: "empty_slot" };
    }

    const addResult = inventory.addItem(slot.instanceId, slot.item);
    if (!addResult.success) {
      return { success: false, reason: "inventory_full" };
    }

    const item = slot.item;
    this.slots[slotIndex] = { slotId: slot.slotId, instanceId: null, item: null };
    this.version++;

    return { success: true, equipmentSlotId: slot.slotId, item, inventorySlotIndex: addResult.slotIndex };
  }
}
