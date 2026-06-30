import type { ItemRarity, ItemSlot } from "./types.js";

const RARITY_BASE: Record<ItemRarity, { attack: number; defense: number }> = {
  common: { attack: 5, defense: 3 },
  uncommon: { attack: 10, defense: 6 },
  rare: { attack: 18, defense: 11 },
  epic: { attack: 30, defense: 18 },
  legendary: { attack: 50, defense: 30 },
};

const SLOT_DEFENSE_WEIGHT: Partial<Record<ItemSlot, number>> = {
  armor: 1,
  helmet: 0.7,
  boots: 0.5,
  amulet: 0.5,
  ring: 0.3,
};

export interface ItemPower {
  attack: number;
  defense: number;
}

export function getItemPower(rarity: ItemRarity, slot: ItemSlot): ItemPower {
  const base = RARITY_BASE[rarity];

  if (slot === "weapon") {
    return { attack: base.attack, defense: 0 };
  }

  const weight = SLOT_DEFENSE_WEIGHT[slot] ?? 0.5;
  return { attack: 0, defense: Math.round(base.defense * weight) };
}

export function comparePower(
  newItem: ItemPower,
  currentItem: ItemPower | null,
): "better" | "worse" | "equal" {
  if (!currentItem) return "better";

  const newTotal = newItem.attack + newItem.defense;
  const currentTotal = currentItem.attack + currentItem.defense;

  if (newTotal > currentTotal) return "better";
  if (newTotal < currentTotal) return "worse";
  return "equal";
}
