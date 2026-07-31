import { calculateSalvageRewards, type InventoryItem, type SalvageReward } from "@streamrpg/shared";

export interface SalvageOffer {
  item: InventoryItem;
  rewards: SalvageReward[];
}

// Salvage Phase I — Fase 6 (preview client-side). `calculateSalvageRewards`
// é a MESMA função pura que o servidor usa
// (packages/shared/src/equipment/salvage.ts) — este módulo só a aplica
// sobre a mochila inteira pra exibição; a desmontagem real (a mutação)
// sempre é recalculada e decidida pelo servidor (salvage.service.ts),
// nunca por este preview. Diferente de Merchant/Blacksmith: itens
// EQUIPADOS também aparecem como elegíveis (desmontar é abrir mão do
// item, não há razão pra exigir desequipar primeiro — docs/design/
// salvage-phase1.md Seção 9). Itens sem Power Score (catálogo fixo)
// nunca aparecem — mesma regra já aplicada no servidor
// (dismantleItem rejeita item-not-eligible).
export function buildSalvageOffers(items: InventoryItem[]): SalvageOffer[] {
  return items
    .filter((item) => item.power_score !== null)
    .map((item) => ({
      item,
      rewards: calculateSalvageRewards({
        rarity: item.rarity,
        upgrade_level: item.upgrade_level,
        power_score: item.power_score,
      }),
    }));
}
