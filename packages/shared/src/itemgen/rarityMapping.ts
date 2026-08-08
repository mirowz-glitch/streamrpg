import type { ItemRarity } from "../types.js";
import type { ItemGenRarityId } from "./types.js";

// World Autonomy Phase II (Vision 2.0, Sprint 9) — bug fix. O Item
// Generator produz 4 raridades (`ItemGenRarityId`: common/magic/rare/
// unique, rarities.ts), mas todo o sistema econômico (`calculateSaleValue`,
// `calculateSalvageRewards`, `calculateUpgradeCost`, todos em
// packages/shared) espera as 5 raridades de `ItemRarity` (common/uncommon/
// rare/epic/legendary). Sem esta tradução, a string crua do Item Generator
// fluía direto até a coluna `items.rarity` (drop.service.ts
// grantAdventureLoot) e "magic"/"unique" não batiam com nenhuma chave das
// tabelas `BASE_VALUE_BY_RARITY`/`BASE_MATERIALS_BY_RARITY`/
// `BASE_COST_BY_RARITY` — resultado: `undefined + número = NaN` ao vender/
// desmontar/melhorar esses itens pelo Merchant/Salvage/Blacksmith reais.
//
// Ponto único de verdade, aplicado no momento da persistência
// (grantAdventureLoot, ANTES do INSERT) — nenhum consumidor downstream
// (Merchant/Blacksmith/Salvage/InventoryItem/EquippedItem) precisa saber
// que essa tradução existe; todos continuam lendo só `ItemRarity`.
const ITEMGEN_TO_ITEM_RARITY: Record<ItemGenRarityId, ItemRarity> = {
  common: "common",
  magic: "uncommon",
  rare: "rare",
  unique: "legendary",
};

const VALID_ITEM_RARITIES: ReadonlySet<string> = new Set<ItemRarity>([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
]);

/**
 * Normaliza uma raridade recebida como string solta (Item Generator ou já
 * no vocabulário simples de `ItemRarity`) para o `ItemRarity` de 5 tiers
 * usado pelo sistema econômico. Valores já válidos passam direto; valores
 * desconhecidos caem em "common" (mesmo fallback defensivo já usado
 * localmente em offline/computeOfflineCatchUp.ts antes desta correção).
 */
export function normalizeItemRarity(rarity: string): ItemRarity {
  if (VALID_ITEM_RARITIES.has(rarity)) return rarity as ItemRarity;
  return ITEMGEN_TO_ITEM_RARITY[rarity as ItemGenRarityId] ?? "common";
}
