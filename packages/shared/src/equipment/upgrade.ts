import type { ItemRarity } from "../types.js";

// Blacksmith Phase I — Fase 2/3. Função pura equivalente a
// `calculateSaleValue` (packages/shared/src/economy/saleValue.ts): só
// rarity/upgrade_level como entrada, sem banco/React/API. Opera sobre o
// vocabulário SIMPLES de equipamento (InventoryItem/EquippedItem), não
// sobre o sistema procedural mais elaborado deste mesmo diretório
// (ItemGenGeneratedItem) — os dois permanecem deliberadamente
// desacoplados (ver docs/architecture/domain-vocabulary.md).
//
// Regra econômica (docs/design/blacksmith-phase1.md Seção 3): o custo de
// melhoria precisa ser sempre maior que `calculateSaleValue` do mesmo
// item, em qualquer raridade/nível — senão "vender e comprar de novo"
// seria mais barato que "melhorar" (incentivo perverso). Verificado por
// teste (upgrade.test.ts).
const BASE_COST_BY_RARITY: Record<ItemRarity, number> = {
  common: 20,
  uncommon: 40,
  rare: 80,
  epic: 160,
  legendary: 320,
};

const COST_LEVEL_MULTIPLIER = 15;
const POWER_SCORE_INCREMENT = 5;

export interface UpgradableItem {
  rarity: ItemRarity;
  upgrade_level: number;
  power_score: number | null;
}

/**
 * Calcula o custo em Ouro da próxima melhoria de um item — cresce com
 * a raridade (base) e com quantas vezes o item já foi melhorado
 * (desencoraja empilhamento infinito de poder barato).
 */
export function calculateUpgradeCost(item: Pick<UpgradableItem, "rarity" | "upgrade_level">): number {
  return BASE_COST_BY_RARITY[item.rarity] + item.upgrade_level * COST_LEVEL_MULTIPLIER;
}

export interface UpgradeResult {
  nextLevel: number;
  cost: number;
  newPowerScore: number;
}

/**
 * Orquestra o resultado completo de uma melhoria: próximo nível, custo
 * (via `calculateUpgradeCost`) e novo Power Score. Itens sem Power Score
 * (catálogo fixo, não procedural) não são elegíveis — quem chama decide
 * isso antes (Blacksmith Service/UI), esta função assume `power_score`
 * já não-nulo.
 */
export function calculateUpgrade(item: UpgradableItem): UpgradeResult {
  if (item.power_score === null) {
    throw new Error("Item has no power_score and is not eligible for upgrade");
  }
  return {
    nextLevel: item.upgrade_level + 1,
    cost: calculateUpgradeCost(item),
    newPowerScore: item.power_score + POWER_SCORE_INCREMENT,
  };
}
