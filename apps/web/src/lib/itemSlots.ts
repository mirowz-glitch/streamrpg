import type { ItemSlot } from "@streamrpg/shared";

// Domain Vocabulary Consolidation Phase I — extraído de InventoryPage.tsx
// e EquipmentSlots.tsx (eram copiados verbatim nos dois arquivos, mesmo
// padrão que motivou a extração de RARITY_COLOR/RARITY_LABEL pra
// rarity.ts). Nenhum valor novo, nenhum slot novo — só um único lugar
// pro nome oficial de cada ItemSlot.
export const SLOT_ORDER: ItemSlot[] = ["weapon", "armor", "helmet", "gloves", "boots", "belt", "amulet", "ring"];

export const SLOT_LABEL: Record<ItemSlot, string> = {
  weapon: "Arma",
  armor: "Armadura",
  helmet: "Elmo",
  gloves: "Luvas",
  boots: "Botas",
  belt: "Cinto",
  amulet: "Amuleto",
  ring: "Anel",
};
