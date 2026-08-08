import { EquipmentLockError, calculateSaleValue, type EconomicEvent, type InventoryItem } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { listInventory, recordItemHistoryEvent, removeItem } from "./drop.service.js";
import { creditCharacterResourceInTransaction, getCharacterResourceBalance } from "./economy.service.js";
import { equipmentLock } from "./equipmentLock.service.js";
import { pushNotification } from "./notifications.service.js";
import { unsocketAllGemsForItem } from "./gem.service.js";

export type SellItemFailureReason = "item-not-found" | "item-equipped" | "credit-rejected" | "item-locked";

export interface SellItemSuccess {
  success: true;
  item: InventoryItem;
  saleValue: number;
  newGoldBalance: number;
  event: EconomicEvent;
}

export interface SellItemFailure {
  success: false;
  reason: SellItemFailureReason;
}

export type SellItemResult = SellItemSuccess | SellItemFailure;

/**
 * Merchant Service — Merchant Phase I (Fase 3).
 *
 * Único orquestrador de uma venda completa. Fluxo obrigatório: valida
 * posse/estado do item → calcula preço (Sale Value, packages/shared) →
 * credita Ouro (Transaction Layer/Economy Service) → remove o item
 * (sistema de inventário existente) → tudo dentro de UMA transação SQL
 * atômica → devolve o resultado. Nenhuma etapa é pulada; se qualquer
 * escrita falhar depois do crédito, a transação inteira é revertida
 * (ver ADR-0001 para a composição de transação usada aqui).
 *
 * Regra de negócio (não do Ledger): item equipado não pode ser vendido
 * diretamente — precisa ser desequipado primeiro (mesma recomendação já
 * registrada em docs/design/merchant-phase1.md Seção 9, decidida nesta
 * Sprint).
 *
 * Equipment Locking & Concurrency Phase I — Fase 3: mesmo envelope de
 * lock do Blacksmith (docs/design/equipment-locking-phase1.md) — como
 * itens equipados já não podem ser vendidos, o caso prático mais comum
 * (AutoEquip vs. Merchant no MESMO item) já era impossível antes deste
 * lock; o lock protege mesmo assim contra o caso mais raro de duas
 * operações críticas (ex.: uma Sprint futura de Salvage) mirando o
 * mesmo item desequipado ao mesmo tempo.
 */
export function sellItem(characterId: string, characterItemId: number): SellItemResult {
  try {
    return equipmentLock.withLock(characterItemId, "merchant:sell", () => {
      const items = listInventory(characterId);
      const item = items.find((i) => i.id === characterItemId);
      if (!item) {
        return { success: false, reason: "item-not-found" };
      }
      if (item.is_equipped) {
        return { success: false, reason: "item-equipped" };
      }

      const saleValue = calculateSaleValue({ rarity: item.rarity, min_level: item.min_level });

      const db = getDb();
      db.exec("BEGIN");
      try {
        const outcome = creditCharacterResourceInTransaction(
          characterId,
          "gold",
          saleValue,
          "merchant:sell",
          `item:${characterItemId}`,
        );
        if (outcome.transaction.result !== "success") {
          db.exec("ROLLBACK");
          return { success: false, reason: "credit-rejected" };
        }
        // Sprint 14 — Legendary Items + Legacy System, Fase 3/5: grava
        // ANTES de removeItem() — a mesma linha de `items` (não a de
        // `character_items`, que remove agora) sobrevive pra sempre;
        // este é o único jeito de "quantidade de vendas"/"maior preço"
        // (Legado econômico) existirem depois que o item some da
        // mochila. Preço vai no `detail` (número puro, parseável por
        // `deriveItemLegacyFromHistory`).
        recordItemHistoryEvent(item.item_id, item.history, "sold", characterId, String(saleValue));
        // Sprint 15 — Sockets + Gem System (Foundation), Fase 10
        // (Compatibilidade): mesma posição de recordItemHistoryEvent
        // acima — SEMPRE ANTES de removeItem(), pra nenhuma Gema
        // continuar apontando pra um item que o personagem não possui
        // mais.
        unsocketAllGemsForItem(item.item_id, "sold");
        removeItem(characterId, characterItemId);
        db.exec("COMMIT");
        // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 7 —
        // Notificação pessoal (nunca Discord/Twitch), mesmo princípio
        // de chamada direta no ponto de sucesso do Activity Feed acima.
        pushNotification(characterId, "💰", `Você vendeu ${item.name} por ${saleValue} de ouro.`);
        return {
          success: true,
          item,
          saleValue,
          newGoldBalance: getCharacterResourceBalance(characterId, "gold"),
          event: outcome.event,
        };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof EquipmentLockError) {
      return { success: false, reason: "item-locked" };
    }
    throw error;
  }
}
