import type { ItemRarity } from "../types.js";
import type { ResourceId } from "../economy/types.js";

// Salvage Phase I — Fase 2/3. Função pura equivalente a
// `calculateSaleValue`/`calculateUpgradeCost`: só rarity/upgrade_level
// como entrada, sem I/O. Decide quantos `materials` um item rende ao
// ser desmontado — mesma disciplina de packages/shared inteiro.
//
// Itens já melhorados pelo Ferreiro (upgrade_level > 0) rendem mais
// materials que a base (docs/design/salvage-phase1.md Seção 2) —
// desmontar um item investido nunca deveria ser pior que desmontar um
// item bruto, senão o jogador nunca teria motivo pra desmontar um item
// já melhorado.
const BASE_MATERIALS_BY_RARITY: Record<ItemRarity, number> = {
  common: 8,
  uncommon: 16,
  rare: 32,
  epic: 64,
  legendary: 128,
};

const MATERIALS_PER_UPGRADE_LEVEL = 6;

export interface SalvageableItem {
  rarity: ItemRarity;
  upgrade_level: number;
  power_score: number | null;
}

export interface SalvageReward {
  resourceId: ResourceId;
  amount: number;
}

/**
 * Calcula os recursos concedidos ao desmontar um item — hoje sempre
 * uma única entrada (`materials`), mas retorna uma lista (não um
 * número) porque a arquitetura já prevê múltiplos recursos por
 * desmontagem no futuro (docs/design/salvage-phase1.md Seção 9: "materiais
 * únicos vs. tipados", ainda não decidido) — nenhum chamador precisa
 * mudar quando isso acontecer. Itens sem Power Score (catálogo fixo,
 * não procedural) não são elegíveis — quem chama decide isso antes
 * (Salvage Service/UI), esta função assume `power_score` já não-nulo.
 */
export function calculateSalvageRewards(item: SalvageableItem): SalvageReward[] {
  if (item.power_score === null) {
    throw new Error("Item has no power_score and is not eligible for salvage");
  }
  const amount = BASE_MATERIALS_BY_RARITY[item.rarity] + item.upgrade_level * MATERIALS_PER_UPGRADE_LEVEL;
  return [{ resourceId: "materials", amount }];
}
