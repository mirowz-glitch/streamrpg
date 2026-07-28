import type { ItemRarity } from "../types.js";

// Merchant Phase I — Fase 2. Única fonte de verdade pro preço de venda
// de um item — nenhum outro lugar (rota, componente React) pode
// calcular isso de novo. Recebe só o que já existe em `InventoryItem`
// hoje (rarity/min_level) — Power Score procedural não é exposto pela
// API ainda (auditoria desta Sprint), então a fórmula não depende dele;
// estender pra usar Power Score é uma decisão futura, não desta Sprint.
const BASE_VALUE_BY_RARITY: Record<ItemRarity, number> = {
  common: 5,
  uncommon: 12,
  rare: 30,
  epic: 75,
  legendary: 180,
};

const LEVEL_MULTIPLIER = 2;

export interface SellableItem {
  rarity: ItemRarity;
  min_level: number;
}

/**
 * Calcula o valor de venda de um item — pura, determinística, sem
 * acesso a banco/React/API. Sempre retorna um inteiro positivo para
 * qualquer combinação válida de `ItemRarity`/`min_level >= 1`.
 */
export function calculateSaleValue(item: SellableItem): number {
  return BASE_VALUE_BY_RARITY[item.rarity] + item.min_level * LEVEL_MULTIPLIER;
}
