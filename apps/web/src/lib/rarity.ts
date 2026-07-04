import type { ItemRarity } from "@streamrpg/shared";

// Sprint Identity & Progression — extraído de InventoryPage (era
// duplicado inline) para ser reaproveitado também no perfil do
// personagem. Mesmas cores, nenhum valor novo.
export const RARITY_COLOR: Record<ItemRarity, string> = {
  common: "#9aa0a6",
  uncommon: "#34a853",
  rare: "#4285f4",
  epic: "#a142f4",
  legendary: "#fbbc04",
};

export const RARITY_LABEL: Record<ItemRarity, string> = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};
