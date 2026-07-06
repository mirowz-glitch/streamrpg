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

// packages/shared/src/regions.ts
var REGION_GRAPH = {
  "porto-do-amanhecer": {
    id: "porto-do-amanhecer",
    name: "Porto do Amanhecer",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada"]
  },
  "bosque-sussurrante": {
    id: "bosque-sussurrante",
    name: "Bosque Sussurrante",
    neighbors: [
      "porto-do-amanhecer",
      "colinas-aridas",
      // Trilha do Contrabandista (atalho já documentado)
      "pantano-podre",
      "planicie-dourada",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro"
    ]
  },
  "pantano-podre": {
    id: "pantano-podre",
    name: "P\xE2ntano Podre",
    neighbors: [
      "porto-do-amanhecer",
      "bosque-sussurrante",
      "colinas-aridas",
      "planicie-dourada",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro"
    ]
  },
  "colinas-aridas": {
    id: "colinas-aridas",
    name: "Colinas \xC1ridas",
    neighbors: [
      "porto-do-amanhecer",
      "bosque-sussurrante",
      "pantano-podre",
      "planicie-dourada",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro"
    ]
  },
  "planicie-dourada": {
    id: "planicie-dourada",
    name: "Plan\xEDcie Dourada",
    neighbors: [
      "porto-do-amanhecer",
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "litoral-quebrado",
      "picos-congelados",
      "deserto-de-vidro"
    ]
  },
  "minas-abandonadas": {
    id: "minas-abandonadas",
    name: "Minas Abandonadas",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"]
  },
  "litoral-quebrado": {
    id: "litoral-quebrado",
    name: "Litoral Quebrado",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"]
  },
  "picos-congelados": {
    id: "picos-congelados",
    name: "Picos Congelados",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"]
  },
  "deserto-de-vidro": {
    id: "deserto-de-vidro",
    name: "Deserto de Vidro",
    neighbors: ["bosque-sussurrante", "pantano-podre", "colinas-aridas", "planicie-dourada", "ruinas-esquecidas"]
  },
  "ruinas-esquecidas": {
    id: "ruinas-esquecidas",
    name: "Ru\xEDnas Esquecidas",
    neighbors: ["minas-abandonadas", "litoral-quebrado", "picos-congelados", "deserto-de-vidro", "fortaleza-sombria"]
  },
  "fortaleza-sombria": {
    id: "fortaleza-sombria",
    name: "Fortaleza Sombria",
    neighbors: ["ruinas-esquecidas"]
  }
};
function getRegionName(id) {
  return REGION_GRAPH[id]?.name ?? id;
}
function allRegionIds() {
  return Object.keys(REGION_GRAPH);
}

export {
  KINGDOM_ROLE_CATALOG,
  PING_COOLDOWN_MS,
  getProgress,
  getItemPower,
  getCombatAttributes,
  getRegionName,
  allRegionIds
};
