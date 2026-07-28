import { EquipmentLockError, calculateUpgrade, type EconomicEvent, type EquippedItem } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { applyItemUpgrade, getEquippedItems } from "./drop.service.js";
import { debitCharacterResourceInTransaction, getCharacterResourceBalance } from "./economy.service.js";
import { equipmentLock } from "./equipmentLock.service.js";

export type UpgradeItemFailureReason =
  | "item-not-found"
  | "item-not-eligible"
  | "debit-rejected"
  | "item-locked";

export interface UpgradeItemSuccess {
  success: true;
  item: EquippedItem;
  cost: number;
  newPowerScore: number;
  newUpgradeLevel: number;
  newGoldBalance: number;
  event: EconomicEvent;
}

export interface UpgradeItemFailure {
  success: false;
  reason: UpgradeItemFailureReason;
}

export type UpgradeItemResult = UpgradeItemSuccess | UpgradeItemFailure;

/**
 * Blacksmith Service — Blacksmith Phase I (Fase 4).
 *
 * Único orquestrador de uma melhoria completa. Fluxo obrigatório: valida
 * posse/elegibilidade do item equipado → calcula custo/resultado
 * (`calculateUpgrade`, packages/shared, puro) → debita Ouro (Transaction
 * Layer/Economy Service) → aplica o novo Power Score (sistema de
 * inventário existente) → tudo dentro de UMA transação SQL atômica →
 * devolve o resultado. Mesmo padrão de composição do Merchant Service
 * (ADR-0001) — só troca crédito por débito, e remoção de item por
 * atualização de item.
 *
 * Regra de negócio (não do Ledger): só itens EQUIPADOS são elegíveis
 * (escopo desta Sprint, ver docs/design/blacksmith-phase1.md), e só
 * itens com Power Score (catálogo procedural da Aventura) — o catálogo
 * fixo não tem Power Score e não é elegível.
 *
 * Equipment Locking & Concurrency Phase I — Fase 3: todo o fluxo
 * (validação → transação → persistência) roda dentro do Equipment Lock
 * do item — mesmo fluxo "Lock → Validação → Transação → Persistência →
 * Unlock" de docs/design/equipment-locking-phase1.md. Nenhuma regra de
 * negócio do upgrade mudou; o lock só envolve o que já existia.
 */
export function upgradeItem(characterId: string, characterItemId: number): UpgradeItemResult {
  try {
    return equipmentLock.withLock(characterItemId, "blacksmith:upgrade", () => {
      const equipped = getEquippedItems(characterId);
      const item = equipped.find((i) => i.character_item_id === characterItemId);
      if (!item) {
        return { success: false, reason: "item-not-found" };
      }
      if (item.power_score === null) {
        return { success: false, reason: "item-not-eligible" };
      }

      const upgrade = calculateUpgrade({
        rarity: item.rarity,
        upgrade_level: item.upgrade_level,
        power_score: item.power_score,
      });

      const db = getDb();
      db.exec("BEGIN");
      try {
        const outcome = debitCharacterResourceInTransaction(
          characterId,
          "gold",
          upgrade.cost,
          "blacksmith:upgrade",
          `item:${characterItemId}`,
        );
        if (outcome.transaction.result !== "success") {
          db.exec("ROLLBACK");
          return { success: false, reason: "debit-rejected" };
        }
        applyItemUpgrade(characterId, characterItemId, upgrade.newPowerScore, upgrade.nextLevel);
        db.exec("COMMIT");
        return {
          success: true,
          item: { ...item, power_score: upgrade.newPowerScore, upgrade_level: upgrade.nextLevel },
          cost: upgrade.cost,
          newPowerScore: upgrade.newPowerScore,
          newUpgradeLevel: upgrade.nextLevel,
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
