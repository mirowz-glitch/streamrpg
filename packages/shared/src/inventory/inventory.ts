import type { ItemGenGeneratedItem } from "../itemgen/types.js";
import { validateGeneratedItem } from "./validation.js";
import type { AddItemResult, InventorySlotState, InventorySnapshot, RemoveItemResult } from "./types.js";

// Inventory System Phase I — armazenamento de itens gerados pelo Loot
// Generator (Loot Generator -> Generated Item -> Inventory -> Character).
//
// Diferente de itemgen/lootgen/lootidentity (módulos PUROS: mesma
// entrada, mesma saída, sem estado) — Inventory é genuinamente
// estado que MUDA ao longo do tempo (um personagem enche/esvazia seu
// inventário durante uma sessão), por isso é uma classe com mutação
// interna, no mesmo espírito das classes de sistema já existentes em
// apps/api/src/engine|systems (EventBus, GameEngine, DropSystem) —
// não um valor imutável recriado a cada chamada.
//
// Requisito 1 — capacidade nunca hardcoded: vem do construtor, sempre.
// Requisito 8 — nenhum campo nomeado "slot1"/"slot2"/...: tudo vive em
// `slots` (array indexado por posição, uma coleção só).
//
// Índices auxiliares (`itemIndex`/`freeSlots`) existem só pra cumprir
// "Tudo O(1) sempre que possível" (requisito 5) sem duplicar dado — são
// derivados de `slots` e mantidos em sincronia a cada mutação; nunca
// expostos brutos (só via getItem/findBySlot/findById/toSnapshot).
export class Inventory {
  readonly inventoryId: string;
  // Requisito 1 — "weight (futuro)": campo reservado, sempre 0 nesta
  // fase. Nenhuma Loot Table/Base Item carrega peso ainda; somar peso
  // de verdade é uma Sprint futura, fora de escopo aqui.
  weight: number;
  // Requisito 1 — incrementado em toda mutação bem-sucedida
  // (addItem/removeItem/expandCapacity); pensado pra concorrência
  // otimista quando o Inventory for persistido de verdade numa fase
  // futura (nenhuma persistência implementada nesta Sprint).
  version: number;

  private slots: InventorySlotState[];
  // instanceId -> slotIndex, O(1) pra findById()/duplicate check.
  private itemIndex: Map<string, number>;
  // Fila de índices vazios, sempre ordenada crescente — O(1) pra achar
  // espaço livre em addItem() sem varrer o array, e determinístico:
  // addItem() sempre ocupa o MENOR índice livre disponível (testado em
  // inventory.test.ts).
  private freeSlots: number[];

  constructor(inventoryId: string, initialCapacity: number) {
    if (!Number.isInteger(initialCapacity) || initialCapacity < 0) {
      throw new Error(`Inventory: capacity precisa ser um inteiro >= 0 (recebido ${initialCapacity})`);
    }
    this.inventoryId = inventoryId;
    this.weight = 0;
    this.version = 0;
    this.slots = [];
    this.itemIndex = new Map();
    this.freeSlots = [];
    this.appendSlots(initialCapacity);
  }

  private appendSlots(count: number): void {
    const start = this.slots.length;
    for (let i = 0; i < count; i++) {
      const slotIndex = start + i;
      this.slots.push({ slotIndex, instanceId: null, item: null, quantity: 0 });
      this.freeSlots.push(slotIndex);
    }
  }

  get capacity(): number {
    return this.slots.length;
  }

  // Requisito 1 — "items[]": vista somente-leitura da coleção de slots
  // (vazio ou com 1 item cada, requisito 2). Mutação só através de
  // addItem()/removeItem(), nunca escrevendo neste array por fora.
  get items(): readonly InventorySlotState[] {
    return this.slots;
  }

  // Como aumentar a capacidade sem alterar nenhuma lógica existente
  // (pergunta final da Sprint): só isto. addItem/removeItem/getItem/
  // findItem/findBySlot/findById não sabem e não precisam saber que a
  // capacidade mudou — eles só leem `this.slots`/`this.freeSlots`, que
  // já refletem o novo tamanho.
  expandCapacity(additionalSlots: number): void {
    if (!Number.isInteger(additionalSlots) || additionalSlots <= 0) {
      throw new Error(`Inventory: additionalSlots precisa ser um inteiro positivo (recebido ${additionalSlots})`);
    }
    this.appendSlots(additionalSlots);
    this.version++;
  }

  // Requisito 3 — ordem de validação: id -> duplicação -> integridade
  // (base/raridade/power score/prefixos/sufixos) -> capacidade. Nenhum
  // item é montado à mão aqui — o item já vem pronto do Loot Generator
  // (generateLoot()/generateMonsterLoot()); Inventory só guarda.
  addItem(instanceId: string, item: ItemGenGeneratedItem): AddItemResult {
    if (typeof instanceId !== "string" || instanceId.length === 0) {
      return { success: false, reason: "invalid_instance_id" };
    }
    if (this.itemIndex.has(instanceId)) {
      return { success: false, reason: "duplicate_instance_id" };
    }

    const validationError = validateGeneratedItem(item);
    if (validationError) {
      return { success: false, reason: validationError };
    }

    if (this.freeSlots.length === 0) {
      return { success: false, reason: "inventory_full" };
    }

    const slotIndex = this.freeSlots.shift()!;
    this.slots[slotIndex] = { slotIndex, instanceId, item, quantity: 1 };
    this.itemIndex.set(instanceId, slotIndex);
    this.version++;
    return { success: true, slotIndex };
  }

  // Requisito 4 — "sem apagar dados incorretamente": só o slot
  // encontrado é limpo; nenhum outro slot é tocado; retorna
  // success:false (nunca lança) quando o instanceId não existe.
  removeItem(instanceId: string): RemoveItemResult {
    const slotIndex = this.itemIndex.get(instanceId);
    if (slotIndex === undefined) {
      return { success: false, reason: "not_found" };
    }

    const removedItem = this.slots[slotIndex].item as ItemGenGeneratedItem;
    this.slots[slotIndex] = { slotIndex, instanceId: null, item: null, quantity: 0 };
    this.itemIndex.delete(instanceId);
    this.freeSlots.push(slotIndex);
    // Mantém freeSlots ordenado crescente — é o que garante que
    // addItem() sempre preenche o menor índice livre, não o
    // "liberado mais recentemente" (determinismo, requisito 9).
    this.freeSlots.sort((a, b) => a - b);
    this.version++;
    return { success: true, slotIndex, removedItem };
  }

  // Requisito 5 — O(1): acesso direto por posição.
  getItem(slotIndex: number): ItemGenGeneratedItem | null {
    return this.slots[slotIndex]?.item ?? null;
  }

  // Requisito 5 — O(1): acesso direto por posição, slot inteiro.
  findBySlot(slotIndex: number): InventorySlotState | null {
    return this.slots[slotIndex] ?? null;
  }

  // Requisito 5 — O(1) via itemIndex (Map instanceId -> slotIndex),
  // nunca uma varredura linear.
  findById(instanceId: string): InventorySlotState | null {
    const slotIndex = this.itemIndex.get(instanceId);
    return slotIndex === undefined ? null : this.slots[slotIndex];
  }

  // Requisito 5 — busca por predicado arbitrário: O(n) sempre ("Tudo
  // O(1) sempre que possível" — aqui não é possível, um predicado
  // qualquer não dá pra indexar de antemão).
  findItem(predicate: (item: ItemGenGeneratedItem, slot: InventorySlotState) => boolean): InventorySlotState | null {
    for (const slot of this.slots) {
      if (slot.item && predicate(slot.item, slot)) return slot;
    }
    return null;
  }

  // Requisito 7 — vista somente-dados, 100% serializável (sem Map/
  // classe), pronta pra uma futura persistência real (DB/API) sem
  // implementar nenhuma nesta Sprint.
  toSnapshot(): InventorySnapshot {
    return {
      inventoryId: this.inventoryId,
      capacity: this.capacity,
      items: this.slots.map((slot) => ({ ...slot })),
      weight: this.weight,
      version: this.version,
    };
  }
}
