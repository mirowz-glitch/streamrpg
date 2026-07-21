import {
  CREATURES,
  REGIONS,
  getRecentEvents
} from "./chunk-RHKKRLPV.js";

// apps/web/src/lib/rarity.ts
var RARITY_COLOR = {
  common: "#9aa0a6",
  uncommon: "#34a853",
  rare: "#4285f4",
  epic: "#a142f4",
  legendary: "#fbbc04"
};
var RARITY_LABEL = {
  common: "Comum",
  uncommon: "Incomum",
  rare: "Raro",
  epic: "\xC9pico",
  legendary: "Lend\xE1rio"
};

// apps/web/src/lib/collectionInsights.ts
var TOTAL_EQUIPMENT_SLOTS = 6;
function buildCollectionInsightContext(opts) {
  const recentEvents = getRecentEvents(20);
  return {
    booksRead: recentEvents.filter((e) => e.kind === "book_read").length,
    creaturesViewed: recentEvents.filter((e) => e.kind === "creature_viewed").length,
    museumEntriesViewed: recentEvents.filter((e) => e.kind === "museum_entry_viewed").length,
    regionsDiscovered: opts?.regionsDiscovered ?? 0,
    totalRegions: REGIONS.length,
    equippedSlotCount: opts?.equippedSlotCount ?? 0,
    totalEquipmentSlots: TOTAL_EQUIPMENT_SLOTS
  };
}
function hasEncounteredLethalCreature() {
  return getRecentEvents(20).some((e) => {
    if (e.kind !== "creature_viewed") return false;
    const creatureId = e.meta?.creatureId;
    if (typeof creatureId !== "string") return false;
    const creature = CREATURES.find((c) => c.id === creatureId);
    return creature?.dangerLevel === "letal";
  });
}
function getBestiaryInsight(ctx) {
  if (ctx.creaturesViewed >= 6) return "Seu caderno est\xE1 ficando cheio.";
  if (ctx.creaturesViewed >= 2) return "Voc\xEA j\xE1 registrou criaturas suficientes para come\xE7ar a entender esta regi\xE3o.";
  return null;
}
function getLibraryInsight(ctx) {
  if (ctx.booksRead >= 6) return "Est\xE1 formando uma boa cole\xE7\xE3o de conhecimento.";
  if (ctx.booksRead >= 2) return "Vejo que continua pesquisando.";
  return null;
}
function getMuseumInsight(ctx) {
  if (ctx.museumEntriesViewed >= 3) return "Poucas pe\xE7as faltam para compreender esta Era.";
  if (ctx.museumEntriesViewed >= 1) return "Voc\xEA j\xE1 reconhece alguns nomes deste lugar.";
  return null;
}
function getRegionsInsight(ctx) {
  if (ctx.regionsDiscovered >= Math.ceil(ctx.totalRegions * 0.7)) return "Voc\xEA j\xE1 visitou boa parte do Reino.";
  if (ctx.regionsDiscovered >= 3) return "Voc\xEA est\xE1 come\xE7ando a conhecer os caminhos do Reino.";
  return null;
}
function getInventoryInsight(ctx) {
  if (ctx.equippedSlotCount >= ctx.totalEquipmentSlots) return "Seu equipamento cobre cada espa\xE7o que voc\xEA tem.";
  if (ctx.equippedSlotCount >= ctx.totalEquipmentSlots - 1) return "Seu equipamento j\xE1 cobre quase todos os espa\xE7os.";
  if (ctx.equippedSlotCount >= 3) return "Seu equipamento j\xE1 cobre boa parte dos espa\xE7os.";
  return null;
}

export {
  RARITY_COLOR,
  RARITY_LABEL,
  buildCollectionInsightContext,
  hasEncounteredLethalCreature,
  getBestiaryInsight,
  getLibraryInsight,
  getMuseumInsight,
  getRegionsInsight,
  getInventoryInsight
};
