import { EquipmentLockError, calculateSalvageRewards, type EconomicEvent, type InventoryItem, type SalvageReward } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { listInventory, removeItem } from "./drop.service.js";
import { creditCharacterResourceInTransaction } from "./economy.service.js";
import { equipmentLock } from "./equipmentLock.service.js";

export type DismantleItemFailureReason = "item-not-found" | "item-not-eligible" | "credit-rejected" | "item-locked";

export interface DismantleItemSuccess {
  success: true;
  item: InventoryItem;
  rewards: SalvageReward[];
  events: EconomicEvent[];
}

export interface DismantleItemFailure {
  success: false;
  reason: DismantleItemFailureReason;
}

export type DismantleItemResult = DismantleItemSuccess | DismantleItemFailure;

/**
 * Salvage Service — Salvage Phase I (Fase 3/4).
 *
 * Único orquestrador de uma desmontagem completa. Fluxo obrigatório:
 * Equipment Lock do item → valida posse/elegibilidade → calcula
 * recursos (`calculateSalvageRewards`, packages/shared, puro) → credita
 * cada recurso (Transaction Layer/Economy Service) → remove o item
 * (sistema de inventário existente, `removeItem`) → tudo dentro de UMA
 * transação SQL atômica → devolve o resultado. Mesmo padrão de
 * composição do Merchant/Blacksmith (ADR-0001) — só troca "um crédito"
 * por "N créditos" (a lista de recompensas), já que
 * `calculateSalvageRewards` retorna uma lista (docs/design/
 * salvage-phase1.md Seção 9: hoje sempre 1 entrada, `materials`).
 *
 * Regra de negócio (não do Ledger): diferente de Merchant, itens
 * EQUIPADOS também podem ser desmontados diretamente — desmontar é, por
 * definição, abrir mão do item, não há razão de jogo pra exigir
 * desequipar primeiro (decisão já registrada na prep doc Seção 9,
 * confirmada nesta Sprint). Mesma regra de elegibilidade do Blacksmith:
 * só itens com Power Score (catálogo procedural da Aventura) — o
 * catálogo fixo não tem Power Score e não é elegível.
 */
export function dismantleItem(characterId: string, characterItemId: number): DismantleItemResult {
  try {
    return equipmentLock.withLock(characterItemId, "salvage:dismantle", () => {
      const items = listInventory(characterId);
      const item = items.find((i) => i.id === characterItemId);
      if (!item) {
        return { success: false, reason: "item-not-found" };
      }
      if (item.power_score === null) {
        return { success: false, reason: "item-not-eligible" };
      }

      const rewards = calculateSalvageRewards({
        rarity: item.rarity,
        upgrade_level: item.upgrade_level,
        power_score: item.power_score,
      });

      const db = getDb();
      db.exec("BEGIN");
      try {
        const events: EconomicEvent[] = [];
        for (const reward of rewards) {
          const outcome = creditCharacterResourceInTransaction(
            characterId,
            reward.resourceId,
            reward.amount,
            "salvage:dismantle",
            `item:${characterItemId}`,
          );
          if (outcome.transaction.result !== "success") {
            db.exec("ROLLBACK");
            return { success: false, reason: "credit-rejected" };
          }
          events.push(outcome.event);
        }
        removeItem(characterId, characterItemId);
        db.exec("COMMIT");
        return { success: true, item, rewards, events };
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
