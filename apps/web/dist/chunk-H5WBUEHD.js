// packages/shared/src/xp.ts
var MAX_LEVEL = 30;
var PING_COOLDOWN_MS = 6e4;
function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}
function buildXpTable() {
  const table = [0];
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    table.push(table[lvl - 1] + xpForLevel(lvl));
  }
  return table;
}
var XP_TABLE = buildXpTable();
function getLevel(totalXp) {
  let level = 1;
  for (let i = 0; i < MAX_LEVEL - 1; i++) {
    if (totalXp >= XP_TABLE[i + 1]) {
      level = i + 2;
    } else {
      break;
    }
  }
  return level;
}
function getProgress(totalXp) {
  const level = getLevel(totalXp);
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, xp: 0, xp_to_next: 0, percent: 100 };
  }
  const baseXp = XP_TABLE[level - 1];
  const xpInLevel = totalXp - baseXp;
  const xpNeeded = xpForLevel(level);
  return {
    level,
    xp: xpInLevel,
    xp_to_next: xpNeeded - xpInLevel,
    percent: Math.min(100, Math.floor(xpInLevel / xpNeeded * 100))
  };
}

// packages/shared/src/items.ts
var RARITY_BASE = {
  common: { attack: 5, defense: 3 },
  uncommon: { attack: 10, defense: 6 },
  rare: { attack: 18, defense: 11 },
  epic: { attack: 30, defense: 18 },
  legendary: { attack: 50, defense: 30 }
};
var SLOT_DEFENSE_WEIGHT = {
  armor: 1,
  helmet: 0.7,
  boots: 0.5,
  amulet: 0.5,
  ring: 0.3
};
function getItemPower(rarity, slot) {
  const base = RARITY_BASE[rarity];
  if (slot === "weapon") {
    return { attack: base.attack, defense: 0 };
  }
  const weight = SLOT_DEFENSE_WEIGHT[slot] ?? 0.5;
  return { attack: 0, defense: Math.round(base.defense * weight) };
}
function getCombatAttributes(rarity, slot, damageType = "physical") {
  const power = getItemPower(rarity, slot);
  if (slot === "weapon") {
    return {
      attackPhysical: damageType === "physical" ? power.attack : 0,
      attackMagic: damageType === "magic" ? power.attack : 0,
      resistancePhysical: 0,
      resistanceMagic: 0
    };
  }
  return {
    attackPhysical: 0,
    attackMagic: 0,
    resistancePhysical: damageType === "physical" ? power.defense : 0,
    resistanceMagic: damageType === "magic" ? power.defense : 0
  };
}

// packages/shared/src/types.ts
var KINGDOM_ROLE_CATALOG = [
  { slug: "guardiao", name: "Guardi\xE3o do Reino", icon: "\u{1F451}" },
  { slug: "campeao-bosses", name: "Campe\xE3o dos Bosses", icon: "\u2694" },
  { slug: "grande-explorador", name: "Grande Explorador", icon: "\u{1F5FA}" },
  { slug: "heroi-reino", name: "Her\xF3i do Reino", icon: "\u2B50" },
  { slug: "membro-antigo", name: "Membro Mais Antigo", icon: "\u{1F4C5}" },
  { slug: "maior-sequencia", name: "Maior Sequ\xEAncia", icon: "\u{1F525}" }
];

export {
  KINGDOM_ROLE_CATALOG,
  PING_COOLDOWN_MS,
  getProgress,
  getItemPower,
  getCombatAttributes
};
//# sourceMappingURL=chunk-H5WBUEHD.js.map
