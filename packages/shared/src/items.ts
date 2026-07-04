import type { DamageType, ItemRarity, ItemSlot } from "./types.js";

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

// ============================================================
// Sprint Character Attributes Schema — infraestrutura para o Combat
// Model (docs/combat-model/canonical-formula.md). Função nova, aditiva:
// não altera getItemPower()/comparePower() acima, usados hoje pelo
// frontend (InventoryPage) e pelo BossCombatSystem — nenhum dos dois é
// tocado por esta Sprint.
// ============================================================

export interface CombatAttributes {
  attackPhysical: number;
  attackMagic: number;
  resistancePhysical: number;
  resistanceMagic: number;
}

/**
 * Divide o mesmo poder de item já calculado por getItemPower() entre os
 * dois tipos (físico/mágico), conforme damage_type. Armas contribuem só
 * para ATQ (do tipo correspondente); os demais slots contribuem só para
 * Resistência (do tipo correspondente) — mesma regra de
 * getItemPower() (weapon = attack puro, resto = defense ponderado).
 */
export function getCombatAttributes(
  rarity: ItemRarity,
  slot: ItemSlot,
  damageType: DamageType = "physical",
): CombatAttributes {
  const power = getItemPower(rarity, slot);

  if (slot === "weapon") {
    return {
      attackPhysical: damageType === "physical" ? power.attack : 0,
      attackMagic: damageType === "magic" ? power.attack : 0,
      resistancePhysical: 0,
      resistanceMagic: 0,
    };
  }

  return {
    attackPhysical: 0,
    attackMagic: 0,
    resistancePhysical: damageType === "physical" ? power.defense : 0,
    resistanceMagic: damageType === "magic" ? power.defense : 0,
  };
}

// Constante global, não um atributo por personagem — o capítulo 6 da
// Bible já decidiu "pequena chance de crítico", igual para todos, nunca
// modificada por atributo (reafirmado em
// docs/combat-model/canonical-formula.md). Ilustrativo, não calibrado —
// mesma convenção de DROP_CHANCE/TIER_MAX_HP em outras partes do projeto.
export const CRITICAL_HIT_CHANCE = 0.05;
