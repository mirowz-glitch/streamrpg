import { getBaseItem } from "../itemgen/baseItems.js";
import { ITEM_GEN_RARITIES } from "../itemgen/rarities.js";
import { ITEM_GEN_PREFIXES } from "../itemgen/prefixes.js";
import { ITEM_GEN_SUFFIXES } from "../itemgen/suffixes.js";
import type { ItemGenGeneratedItem } from "../itemgen/types.js";
import type { ItemValidationError } from "./types.js";

// Requisito 6 — todo item recebido pelo Inventory é validado contra os
// dados REAIS do Item Generator (ITEM_GEN_BASE_ITEMS/ITEM_GEN_RARITIES/
// ITEM_GEN_PREFIXES/ITEM_GEN_SUFFIXES, lidos, nunca copiados) — se o
// Item Generator ganhar um novo Base Item/Prefixo/Sufixo numa Sprint
// futura, esta validação já aceita automaticamente, sem precisar de
// nenhuma mudança aqui. "Não alterar o Item Generator": este arquivo só
// LÊ as tabelas dele, nunca as modifica.
export function validateGeneratedItem(item: ItemGenGeneratedItem): ItemValidationError | null {
  if (typeof item.seed !== "number" || !Number.isFinite(item.seed)) {
    return "invalid_seed";
  }
  if (typeof item.itemLevel !== "number" || !Number.isFinite(item.itemLevel) || item.itemLevel < 0) {
    return "invalid_item_level";
  }
  if (!getBaseItem(item.baseItemId)) {
    return "invalid_base_item";
  }
  if (!ITEM_GEN_RARITIES.some((rarity) => rarity.id === item.rarity)) {
    return "invalid_rarity";
  }
  if (typeof item.powerScore !== "number" || !Number.isFinite(item.powerScore) || item.powerScore < 0) {
    return "invalid_power_score";
  }
  for (const mod of item.prefixes) {
    if (!ITEM_GEN_PREFIXES.some((prefix) => prefix.id === mod.modId)) {
      return "invalid_prefix";
    }
  }
  for (const mod of item.suffixes) {
    if (!ITEM_GEN_SUFFIXES.some((suffix) => suffix.id === mod.modId)) {
      return "invalid_suffix";
    }
  }
  return null;
}
