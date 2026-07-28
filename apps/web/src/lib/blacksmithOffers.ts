import { calculateUpgrade, type EquippedItem, type UpgradeResult } from "@streamrpg/shared";

export interface BlacksmithOffer {
  item: EquippedItem;
  upgrade: UpgradeResult;
}

// Blacksmith Phase I — Fase 7 (preview client-side). `calculateUpgrade`
// é a MESMA função pura que o servidor usa
// (packages/shared/src/equipment/upgrade.ts) — este módulo só a aplica
// sobre a lista de itens equipados pra exibição; a melhoria real (a
// mutação) sempre é recalculada e decidida pelo servidor
// (blacksmith.service.ts), nunca por este preview. Itens sem Power Score
// (catálogo fixo, não procedural) nunca aparecem como elegíveis — mesma
// regra já aplicada no servidor (upgradeItem rejeita item-not-eligible);
// replicada aqui só pra não mostrar um botão "Melhorar" que o servidor
// sempre rejeitaria.
export function buildBlacksmithOffers(equipped: EquippedItem[]): BlacksmithOffer[] {
  return equipped
    .filter((item) => item.power_score !== null)
    .map((item) => ({
      item,
      upgrade: calculateUpgrade({ rarity: item.rarity, upgrade_level: item.upgrade_level, power_score: item.power_score }),
    }));
}
