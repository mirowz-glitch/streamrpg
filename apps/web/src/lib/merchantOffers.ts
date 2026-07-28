import { calculateSaleValue, type InventoryItem } from "@streamrpg/shared";

export interface MerchantOffer {
  item: InventoryItem;
  saleValue: number;
}

// Merchant Phase I — Fase 6. `calculateSaleValue` é a MESMA função pura
// que o servidor usa (packages/shared/src/economy/saleValue.ts) — este
// módulo só a aplica sobre a lista de itens pra exibição; a venda real
// (a mutação) sempre é recalculada e decidida pelo servidor
// (merchant.service.ts), nunca por este preview. Itens equipados nunca
// aparecem como oferta — mesma regra já aplicada no servidor
// (sellItem rejeita item equipado); replicada aqui só pra não mostrar
// um botão "Vender" que o servidor sempre rejeitaria (Princípio 7,
// docs/design/idle-experience-redesign.md: nunca pedir a mesma decisão
// sem sentido).
export function buildMerchantOffers(items: InventoryItem[]): MerchantOffer[] {
  return items
    .filter((item) => !item.is_equipped)
    .map((item) => ({ item, saleValue: calculateSaleValue(item) }));
}
