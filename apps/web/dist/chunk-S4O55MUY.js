// packages/shared/src/xp.ts
var MAX_LEVEL = 30;
var PING_COOLDOWN_MS = 6e4;
function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}
var XP_KILLS_PER_LEVEL = 14;
function xpRewardForKill(characterLevel) {
  return Math.max(1, Math.round(xpForLevel(characterLevel) / XP_KILLS_PER_LEVEL));
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

// packages/shared/src/itemgen/rng.ts
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = state + 1831565813 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function randomInt(rng, min, max) {
  if (max <= min) return min;
  return Math.floor(rng() * (max - min + 1)) + min;
}
function pickWeighted(rng, options) {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let roll = rng() * totalWeight;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return option;
  }
  return options[options.length - 1];
}

// packages/shared/src/itemgen/baseItems.ts
var ITEM_GEN_BASE_ITEMS = [
  // Weapon
  {
    id: "sword",
    name: "Sword",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 8, max: 14 },
    baseAttackSpeed: 1.2,
    requirements: { level: 1, strength: 10 }
  },
  {
    id: "axe",
    name: "Axe",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 11, max: 18 },
    baseAttackSpeed: 1,
    requirements: { level: 1, strength: 12 }
  },
  {
    id: "bow",
    name: "Bow",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "ranged", "physical"],
    baseDamage: { min: 7, max: 12 },
    baseAttackSpeed: 1.3,
    requirements: { level: 1, dexterity: 12 }
  },
  {
    id: "dagger",
    name: "Dagger",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 5, max: 9 },
    baseAttackSpeed: 1.6,
    requirements: { level: 1, dexterity: 10 }
  },
  {
    id: "staff",
    name: "Staff",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "spell", "caster"],
    baseDamage: { min: 6, max: 10 },
    baseAttackSpeed: 1,
    requirements: { level: 1, intelligence: 14 }
  },
  {
    id: "wand",
    name: "Wand",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "ranged", "spell", "caster"],
    baseDamage: { min: 4, max: 8 },
    baseAttackSpeed: 1.4,
    requirements: { level: 1, intelligence: 10 }
  },
  {
    id: "mace",
    name: "Mace",
    category: "weapon",
    slot: "weapon",
    tags: ["weapon", "melee", "physical"],
    baseDamage: { min: 13, max: 20 },
    baseAttackSpeed: 0.8,
    requirements: { level: 1, strength: 14 }
  },
  // Armor
  {
    id: "helmet",
    name: "Helmet",
    category: "armor",
    slot: "helmet",
    tags: ["armor", "defense"],
    baseDefense: 12,
    requirements: { level: 1 }
  },
  {
    id: "chest",
    name: "Chest",
    category: "armor",
    slot: "chest",
    tags: ["armor", "defense"],
    baseDefense: 24,
    requirements: { level: 1 }
  },
  {
    id: "gloves",
    name: "Gloves",
    category: "armor",
    slot: "gloves",
    tags: ["armor", "defense"],
    baseDefense: 8,
    requirements: { level: 1 }
  },
  {
    id: "boots",
    name: "Boots",
    category: "armor",
    slot: "boots",
    tags: ["armor", "defense"],
    baseDefense: 8,
    requirements: { level: 1 }
  },
  // Accessories
  {
    id: "ring",
    name: "Ring",
    category: "accessory",
    slot: "ring",
    tags: ["accessory"],
    requirements: { level: 1 }
  },
  {
    id: "amulet",
    name: "Amulet",
    category: "accessory",
    slot: "amulet",
    tags: ["accessory"],
    requirements: { level: 1 }
  },
  {
    id: "belt",
    name: "Belt",
    category: "accessory",
    slot: "belt",
    tags: ["accessory"],
    requirements: { level: 1 }
  }
];
function getBaseItem(id) {
  return ITEM_GEN_BASE_ITEMS.find((item) => item.id === id);
}

// packages/shared/src/itemgen/rarities.ts
var ITEM_GEN_RARITIES = [
  {
    id: "common",
    label: "Common",
    color: "#9aa0a6",
    minPrefixes: 0,
    maxPrefixes: 0,
    minSuffixes: 0,
    maxSuffixes: 0,
    dropWeight: 60
  },
  {
    id: "magic",
    label: "Magic",
    color: "#4285f4",
    minPrefixes: 1,
    maxPrefixes: 1,
    minSuffixes: 0,
    maxSuffixes: 1,
    dropWeight: 28
  },
  {
    id: "rare",
    label: "Rare",
    color: "#fbbc04",
    minPrefixes: 1,
    maxPrefixes: 3,
    minSuffixes: 1,
    maxSuffixes: 3,
    dropWeight: 11
  },
  {
    id: "unique",
    label: "Unique",
    color: "#ff8c1a",
    minPrefixes: 2,
    maxPrefixes: 3,
    minSuffixes: 2,
    maxSuffixes: 3,
    dropWeight: 1
  }
];
function getRarityDefinition(id) {
  const found = ITEM_GEN_RARITIES.find((rarity) => rarity.id === id);
  if (!found) throw new Error(`Item Generator: raridade desconhecida "${id}"`);
  return found;
}

// packages/shared/src/itemgen/weights.ts
function getEffectiveModWeight(mod, base, rarity, modTagWeightMultipliers) {
  const resolvedBaseWeight = mod.baseItemWeights?.[base.id] ?? mod.weight;
  const rarityMultiplier = mod.rarityWeights?.[rarity] ?? 1;
  const tagMultiplier = modTagWeightMultipliers ? mod.tags.reduce((product, tag) => product * (modTagWeightMultipliers[tag] ?? 1), 1) : 1;
  return resolvedBaseWeight * rarityMultiplier * tagMultiplier;
}

// packages/shared/src/itemgen/prefixes.ts
var ITEM_GEN_PREFIXES = [
  {
    id: "prefix_cruel",
    type: "prefix",
    group: "physical_damage",
    name: "Cruel",
    statLabel: "Physical Damage",
    weight: 100,
    tags: ["damage", "physical"],
    requiredTags: ["physical"],
    excludesGroups: [],
    // Machado: peso por Base Item do exemplo da Sprint ("Physical
    // Damage peso 120"). Spell Damage não precisa de um override "peso
    // 0" pro Machado porque a tag "physical" do Machado já nunca inclui
    // "spell" — ver prefix_mystic.baseItemWeights pra esse mesmo exemplo
    // espelhado do lado do Spell Damage.
    baseItemWeights: { axe: 120 },
    tiers: [
      { tier: 1, minItemLevel: 60, min: 80, max: 100, weight: 2 },
      { tier: 2, minItemLevel: 40, min: 60, max: 79, weight: 8 },
      { tier: 3, minItemLevel: 20, min: 40, max: 59, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 20, max: 39, weight: 72 }
    ]
  },
  {
    id: "prefix_heavy",
    type: "prefix",
    group: "strength",
    name: "Heavy",
    statLabel: "Strength",
    weight: 90,
    tags: ["attribute", "strength"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 50, min: 25, max: 30, weight: 2 },
      { tier: 2, minItemLevel: 30, min: 15, max: 24, weight: 8 },
      { tier: 3, minItemLevel: 10, min: 8, max: 14, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 3, max: 7, weight: 72 }
    ]
  },
  {
    id: "prefix_healthy",
    type: "prefix",
    group: "life",
    name: "Healthy",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 10, min: 20, max: 24, weight: 15 },
      { tier: 2, minItemLevel: 1, min: 10, max: 19, weight: 85 }
    ]
  },
  {
    id: "prefix_vigorous",
    type: "prefix",
    group: "life",
    name: "Vigorous",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 40, min: 50, max: 59, weight: 15 },
      { tier: 2, minItemLevel: 20, min: 30, max: 49, weight: 85 }
    ]
  },
  {
    id: "prefix_massive",
    type: "prefix",
    group: "life",
    name: "Massive",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 65, min: 90, max: 110, weight: 15 },
      { tier: 2, minItemLevel: 50, min: 70, max: 89, weight: 85 }
    ]
  },
  {
    id: "prefix_swift",
    type: "prefix",
    group: "attack_speed",
    name: "Swift",
    statLabel: "Attack Speed",
    weight: 80,
    tags: ["speed", "attack_speed"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 50, min: 15, max: 18, weight: 2 },
      { tier: 2, minItemLevel: 30, min: 10, max: 14, weight: 8 },
      { tier: 3, minItemLevel: 10, min: 5, max: 9, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 4, weight: 72 }
    ]
  },
  {
    id: "prefix_mystic",
    type: "prefix",
    group: "spell_damage",
    name: "Mystic",
    statLabel: "Spell Damage",
    weight: 80,
    tags: ["damage", "spell"],
    // Único mod que exige "spell" — só Staff/Wand têm essa tag
    // (baseItems.ts), então Mystic nunca rola em Sword/Axe/Bow/
    // Dagger/Mace. Este é o exemplo literal da Sprint: "nunca Spell
    // Damage porque a tag não permite".
    requiredTags: ["spell"],
    excludesGroups: [],
    // Mesmo exemplo da Sprint ("Spell Damage peso 0" no Machado),
    // espelhado aqui — redundante com a exclusão por tag acima (Machado
    // não tem "spell"), mas deixado explícito porque o requisito pede o
    // peso por Base Item como mecanismo próprio, testável mesmo sem
    // depender da exclusão por tag.
    baseItemWeights: { axe: 0, staff: 130, wand: 110 },
    rarityWeights: { unique: 1.4 },
    tiers: [
      { tier: 1, minItemLevel: 55, min: 70, max: 90, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 45, max: 69, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 25, max: 44, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 10, max: 24, weight: 72 }
    ]
  }
];

// packages/shared/src/itemgen/suffixes.ts
var ITEM_GEN_SUFFIXES = [
  {
    id: "suffix_of_the_bear",
    type: "suffix",
    group: "life",
    name: "of the Bear",
    statLabel: "Life",
    weight: 100,
    tags: ["defense", "life"],
    requiredTags: [],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 90, max: 110, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 55, max: 89, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 30, max: 54, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 12, max: 29, weight: 72 }
    ]
  },
  {
    id: "suffix_of_accuracy",
    type: "suffix",
    group: "accuracy",
    name: "of Accuracy",
    statLabel: "Accuracy",
    weight: 90,
    tags: ["offense", "accuracy"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 50, min: 140, max: 170, weight: 2 },
      { tier: 2, minItemLevel: 30, min: 90, max: 139, weight: 8 },
      { tier: 3, minItemLevel: 10, min: 40, max: 89, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 10, max: 39, weight: 72 }
    ]
  },
  {
    id: "suffix_of_precision",
    type: "suffix",
    group: "critical",
    name: "of Precision",
    statLabel: "Critical Strike Chance",
    weight: 70,
    tags: ["offense", "critical"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    rarityWeights: { rare: 1.3, unique: 1.6 },
    tiers: [
      { tier: 1, minItemLevel: 55, min: 8, max: 10, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 5, max: 7, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 3, max: 4, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 2, weight: 72 }
    ]
  },
  {
    id: "suffix_of_fire",
    type: "suffix",
    group: "fire_damage",
    name: "of Fire",
    statLabel: "Fire Damage",
    weight: 80,
    tags: ["damage", "fire"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 60, max: 80, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 35, max: 59, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 18, max: 34, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 5, max: 17, weight: 72 }
    ]
  },
  {
    id: "suffix_of_frost",
    type: "suffix",
    group: "cold_damage",
    name: "of Frost",
    statLabel: "Cold Damage",
    weight: 80,
    tags: ["damage", "cold"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 60, max: 80, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 35, max: 59, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 18, max: 34, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 5, max: 17, weight: 72 }
    ]
  },
  {
    id: "suffix_of_storms",
    type: "suffix",
    group: "lightning_damage",
    name: "of Storms",
    statLabel: "Lightning Damage",
    weight: 80,
    tags: ["damage", "lightning"],
    requiredTags: ["weapon"],
    excludesGroups: [],
    tiers: [
      { tier: 1, minItemLevel: 55, min: 5, max: 120, weight: 2 },
      { tier: 2, minItemLevel: 35, min: 3, max: 80, weight: 8 },
      { tier: 3, minItemLevel: 15, min: 2, max: 45, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 20, weight: 72 }
    ]
  },
  {
    id: "suffix_of_the_vampire",
    type: "suffix",
    group: "life_leech",
    name: "of the Vampire",
    statLabel: "Life Leech",
    weight: 60,
    tags: ["damage", "life_leech"],
    requiredTags: ["weapon"],
    // Bloqueio entre afixos incompatíveis (requisito da Sprint): Life
    // Leech é uma mecânica de ataque físico, nunca deveria coexistir
    // com Spell Damage no mesmo item — checagem bidirecional em
    // generator.ts, então não precisa declarar o mesmo em
    // prefix_mystic.
    excludesGroups: ["spell_damage"],
    tiers: [
      { tier: 1, minItemLevel: 60, min: 5, max: 6, weight: 2 },
      { tier: 2, minItemLevel: 40, min: 3, max: 4, weight: 8 },
      { tier: 3, minItemLevel: 20, min: 2, max: 2, weight: 18 },
      { tier: 4, minItemLevel: 1, min: 1, max: 1, weight: 72 }
    ]
  }
];

// packages/shared/src/itemgen/powerScore.ts
function calculatePowerScore(base, rolledMods) {
  let score = 0;
  if (base.baseDamage) {
    score += (base.baseDamage.min + base.baseDamage.max) / 2;
  }
  if (base.baseDefense) {
    score += base.baseDefense;
  }
  for (const mod of rolledMods) {
    score += mod.value;
  }
  return Math.round(score);
}

// packages/shared/src/itemgen/generator.ts
function isModEligibleForBase(mod, base) {
  return mod.requiredTags.every((tag) => base.tags.includes(tag));
}
function isModCompatibleWithState(mod, state) {
  if (state.committedGroups.has(mod.group)) return false;
  if (state.blockedGroups.has(mod.group)) return false;
  if (mod.excludesGroups.some((group) => state.committedGroups.has(group))) return false;
  return true;
}
function commitMod(mod, state) {
  state.committedGroups.add(mod.group);
  for (const group of mod.excludesGroups) state.blockedGroups.add(group);
}
function rollDistinctMods(rng, eligiblePool, count, base, rarity, state, modTagWeightMultipliers) {
  const picked = [];
  while (picked.length < count) {
    const candidates = eligiblePool.filter((mod) => isModCompatibleWithState(mod, state)).map((mod) => ({ mod, weight: getEffectiveModWeight(mod, base, rarity, modTagWeightMultipliers) })).filter((candidate) => candidate.weight > 0);
    if (candidates.length === 0) break;
    const choice = pickWeighted(rng, candidates).mod;
    picked.push(choice);
    commitMod(choice, state);
  }
  return picked;
}
function rollMod(rng, mod, itemLevel) {
  const eligibleTiers = mod.tiers.filter((tier2) => tier2.minItemLevel <= itemLevel);
  if (eligibleTiers.length === 0) return null;
  const tier = pickWeighted(rng, eligibleTiers);
  const value = randomInt(rng, tier.min, tier.max);
  return {
    modId: mod.id,
    type: mod.type,
    group: mod.group,
    name: mod.name,
    statLabel: mod.statLabel,
    tags: mod.tags,
    tier: tier.tier,
    value
  };
}
function generateItem(baseItemId, itemLevel, seed, options = {}) {
  const base = getBaseItem(baseItemId);
  if (!base) {
    throw new Error(`Item Generator: Base Item desconhecido "${baseItemId}"`);
  }
  const rng = createSeededRandom(seed);
  const rarityChoice = pickWeighted(
    rng,
    ITEM_GEN_RARITIES.map((rarity) => ({
      weight: rarity.dropWeight * (options.rarityWeightMultipliers?.[rarity.id] ?? 1),
      rarity
    }))
  );
  const rarityDef = getRarityDefinition(rarityChoice.rarity.id);
  const eligiblePrefixes = ITEM_GEN_PREFIXES.filter((mod) => isModEligibleForBase(mod, base));
  const eligibleSuffixes = ITEM_GEN_SUFFIXES.filter((mod) => isModEligibleForBase(mod, base));
  const prefixCount = randomInt(rng, rarityDef.minPrefixes, rarityDef.maxPrefixes);
  const suffixCount = randomInt(rng, rarityDef.minSuffixes, rarityDef.maxSuffixes);
  const state = { committedGroups: /* @__PURE__ */ new Set(), blockedGroups: /* @__PURE__ */ new Set() };
  const rolledPrefixes = rollDistinctMods(
    rng,
    eligiblePrefixes,
    prefixCount,
    base,
    rarityDef.id,
    state,
    options.modTagWeightMultipliers
  ).map((mod) => rollMod(rng, mod, itemLevel)).filter((mod) => mod !== null);
  const rolledSuffixes = rollDistinctMods(
    rng,
    eligibleSuffixes,
    suffixCount,
    base,
    rarityDef.id,
    state,
    options.modTagWeightMultipliers
  ).map((mod) => rollMod(rng, mod, itemLevel)).filter((mod) => mod !== null);
  const powerScore = calculatePowerScore(base, [...rolledPrefixes, ...rolledSuffixes]);
  return {
    seed,
    baseItemId: base.id,
    itemLevel,
    rarity: rarityDef.id,
    prefixes: rolledPrefixes,
    suffixes: rolledSuffixes,
    powerScore
  };
}

// packages/shared/src/lootgen/lootTables.ts
var LOOT_TABLES = [
  {
    // dropChance ligeiramente maior que a do Goblin: o pool de itens do
    // Wolf (dagger/boots/belt, sem arma "pesada" — coerente com um
    // bicho não carregar espada) tem upgrades de menor impacto que o do
    // Goblin (que inclui "sword"), então bosque-sussurrante media uma
    // taxa de morte mensuravelmente maior que pantano-podre na
    // simulação (68% vs 24% em 400 execuções) — compensado aqui com
    // mais frequência de drop, já que mudar QUAIS itens o Wolf largaria
    // extrapolaria "só dados de balanceamento" pra "redesenho de
    // identidade de loot" (fora do escopo desta Sprint).
    id: "wolf",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 0.7,
    allowedBaseItems: ["dagger", "boots", "belt"],
    baseItemWeights: { dagger: 40, boots: 35, belt: 25 },
    rarityMultiplier: 1,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 }
    ],
    seedOffset: 1001
  },
  {
    id: "goblin",
    weight: 100,
    minLevel: 1,
    maxLevel: 18,
    itemLevelVariance: 2,
    dropChance: 0.65,
    allowedBaseItems: ["dagger", "sword", "ring"],
    baseItemWeights: { dagger: 35, sword: 35, ring: 30 },
    rarityMultiplier: 1.1,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 35 },
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 5 }
    ],
    seedOffset: 1002
  },
  // Biomes, Regions & World Progression Phase I — requisito 3: "Ruínas:
  // Cajados, Anéis" — staff/ring adicionados com peso alto, mace/
  // helmet/chest mantidos com peso menor (variedade, não substituição
  // completa). Nenhuma mudança no Loot Generator, só pesos/allowedBaseItems.
  {
    id: "skeleton",
    weight: 100,
    minLevel: 10,
    maxLevel: 30,
    itemLevelVariance: 3,
    dropChance: 0.45,
    allowedBaseItems: ["mace", "helmet", "chest", "staff", "ring"],
    baseItemWeights: { mace: 15, helmet: 15, chest: 15, staff: 30, ring: 25 },
    rarityMultiplier: 1.2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 55 },
      { quantity: 1, weight: 40 },
      { quantity: 2, weight: 5 }
    ],
    seedOffset: 1003
  },
  {
    id: "bandit",
    weight: 100,
    minLevel: 15,
    maxLevel: 40,
    itemLevelVariance: 3,
    dropChance: 0.5,
    allowedBaseItems: ["axe", "bow", "gloves", "amulet"],
    baseItemWeights: { axe: 30, bow: 30, gloves: 20, amulet: 20 },
    rarityMultiplier: 1.3,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 42 },
      { quantity: 2, weight: 8 }
    ],
    seedOffset: 1004
  },
  {
    // Monster Loot Identity Phase I — "Bandit Captain": um novo monstro
    // (versão elite do Bandit), adicionado só como um registro de dados
    // aqui, exatamente como o cabeçalho deste arquivo promete. Existe
    // principalmente pra dar um exemplo real e testável de "monstro com
    // Rarity Bias próprio, mais forte que o do arquétipo" (ver
    // lootidentity/lootIdentities.ts).
    id: "bandit_captain",
    weight: 100,
    minLevel: 20,
    maxLevel: 45,
    itemLevelVariance: 3,
    dropChance: 0.6,
    allowedBaseItems: ["sword", "axe", "bow", "gloves", "amulet"],
    baseItemWeights: { sword: 30, axe: 25, bow: 25, gloves: 10, amulet: 10 },
    rarityMultiplier: 1.6,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 40 },
      { quantity: 3, weight: 10 }
    ],
    seedOffset: 1005
  },
  {
    // Baú do tesouro — id "treasure_chest" (não "chest") pra nunca se
    // confundir com o Base Item "chest" (peitoral), que é um id
    // completamente diferente de um registro completamente diferente
    // (ITEM_GEN_BASE_ITEMS).
    id: "treasure_chest",
    weight: 100,
    minLevel: 1,
    maxLevel: 60,
    itemLevelVariance: 1,
    dropChance: 1,
    allowedBaseItems: [
      "sword",
      "axe",
      "bow",
      "dagger",
      "staff",
      "wand",
      "mace",
      "helmet",
      "chest",
      "gloves",
      "boots",
      "ring",
      "amulet",
      "belt"
    ],
    baseItemWeights: {
      sword: 10,
      axe: 10,
      bow: 10,
      dagger: 10,
      staff: 10,
      wand: 10,
      mace: 10,
      helmet: 10,
      chest: 10,
      gloves: 10,
      boots: 10,
      ring: 10,
      amulet: 10,
      belt: 10
    },
    rarityMultiplier: 1.5,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 25 },
      { quantity: 3, weight: 5 }
    ],
    seedOffset: 2001
  },
  // Biomes, Regions & World Progression Phase I — requisito 3:
  // "Fortaleza: Armaduras Pesadas" — helmet/chest/gloves/boots com peso
  // bem maior que armas/acessórios, mesma lista de allowedBaseItems de
  // antes (só os pesos mudaram).
  {
    id: "boss",
    weight: 100,
    minLevel: 20,
    maxLevel: 80,
    itemLevelVariance: 2,
    dropChance: 1,
    allowedBaseItems: [
      "sword",
      "axe",
      "bow",
      "dagger",
      "staff",
      "wand",
      "mace",
      "helmet",
      "chest",
      "gloves",
      "boots",
      "ring",
      "amulet",
      "belt"
    ],
    baseItemWeights: {
      sword: 6,
      axe: 6,
      bow: 6,
      dagger: 6,
      staff: 6,
      wand: 6,
      mace: 6,
      helmet: 16,
      chest: 18,
      gloves: 14,
      boots: 14,
      ring: 6,
      amulet: 6,
      belt: 4
    },
    rarityMultiplier: 3,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 2, weight: 20 },
      { quantity: 3, weight: 50 },
      { quantity: 4, weight: 30 }
    ],
    seedOffset: 3001
  },
  // Requisito 3 — Loot Regional do Bosque Sussurrante: "Arcos, Couro" —
  // Javali/Aranha favorecem bow + peças de armadura (boots/gloves,
  // aproximação de "couro" — Item Generator não tem material como
  // atributo próprio, ver nota em lootidentity/archetypes.ts sobre a
  // mesma limitação).
  {
    id: "boar",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 0.6,
    allowedBaseItems: ["bow", "boots", "belt"],
    baseItemWeights: { bow: 45, boots: 35, belt: 20 },
    rarityMultiplier: 1,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 }
    ],
    seedOffset: 1006
  },
  {
    id: "spider",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 0.6,
    allowedBaseItems: ["bow", "dagger", "gloves"],
    baseItemWeights: { bow: 35, dagger: 35, gloves: 30 },
    rarityMultiplier: 1,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 40 },
      { quantity: 1, weight: 60 }
    ],
    seedOffset: 1007
  },
  // Requisito 3 — Colinas Áridas continuam favorecendo ouro (tema de
  // saque humano, já refletido no rarityMultiplier do Bandit) — Hiena
  // segue o mesmo espírito de itens ágeis (dagger/bow) do bioma.
  {
    id: "hyena",
    weight: 100,
    minLevel: 15,
    maxLevel: 45,
    itemLevelVariance: 3,
    dropChance: 0.5,
    allowedBaseItems: ["dagger", "bow", "boots"],
    baseItemWeights: { dagger: 35, bow: 35, boots: 30 },
    rarityMultiplier: 1.2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 50 },
      { quantity: 1, weight: 45 },
      { quantity: 2, weight: 5 }
    ],
    seedOffset: 1008
  },
  // Requisito 3 — Minas Abandonadas: "material de craft de metal" (doc)
  // vira, em termos de equipamento, viés em armadura pesada (mesmo tema
  // de "constructo de pedra" — chest/helmet/gloves).
  {
    id: "stone-construct",
    weight: 100,
    minLevel: 12,
    maxLevel: 25,
    itemLevelVariance: 2,
    dropChance: 0.55,
    allowedBaseItems: ["chest", "helmet", "gloves"],
    baseItemWeights: { chest: 40, helmet: 35, gloves: 25 },
    rarityMultiplier: 1.25,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 0, weight: 45 },
      { quantity: 1, weight: 50 },
      { quantity: 2, weight: 5 }
    ],
    seedOffset: 1009
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/4: uma Loot
  // Table por Mini-Boss, mesma convenção do "boss"/"treasure_chest"
  // (dropChance 1.0, quantityOptions sempre >= 1 — "loot especial"
  // garantido) — rarityMultiplier acima de qualquer inimigo comum da
  // própria região, mas abaixo do Boss final (3.0).
  {
    id: "wolf-alpha",
    weight: 100,
    minLevel: 1,
    maxLevel: 14,
    itemLevelVariance: 2,
    dropChance: 1,
    allowedBaseItems: ["dagger", "boots", "belt", "ring"],
    baseItemWeights: { dagger: 30, boots: 25, belt: 20, ring: 25 },
    rarityMultiplier: 2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 }
    ],
    seedOffset: 4001
  },
  {
    id: "swamp-witch",
    weight: 100,
    minLevel: 1,
    maxLevel: 18,
    itemLevelVariance: 2,
    dropChance: 1,
    allowedBaseItems: ["staff", "wand", "amulet", "ring"],
    baseItemWeights: { staff: 30, wand: 25, amulet: 25, ring: 20 },
    rarityMultiplier: 2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 }
    ],
    seedOffset: 4002
  },
  {
    id: "ancient-construct",
    weight: 100,
    minLevel: 12,
    maxLevel: 25,
    itemLevelVariance: 2,
    dropChance: 1,
    allowedBaseItems: ["chest", "helmet", "gloves", "boots"],
    baseItemWeights: { chest: 30, helmet: 25, gloves: 25, boots: 20 },
    rarityMultiplier: 2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 }
    ],
    seedOffset: 4003
  },
  {
    id: "forgotten-guardian",
    weight: 100,
    minLevel: 10,
    maxLevel: 30,
    itemLevelVariance: 2,
    dropChance: 1,
    allowedBaseItems: ["mace", "staff", "ring", "chest"],
    baseItemWeights: { mace: 25, staff: 30, ring: 25, chest: 20 },
    rarityMultiplier: 2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 70 },
      { quantity: 2, weight: 30 }
    ],
    seedOffset: 4004
  },
  {
    id: "dark-knight",
    weight: 100,
    minLevel: 20,
    maxLevel: 80,
    itemLevelVariance: 2,
    dropChance: 1,
    allowedBaseItems: ["sword", "mace", "chest", "helmet"],
    baseItemWeights: { sword: 30, mace: 25, chest: 25, helmet: 20 },
    rarityMultiplier: 2.2,
    quantityMultiplier: 1,
    quantityOptions: [
      { quantity: 1, weight: 60 },
      { quantity: 2, weight: 40 }
    ],
    seedOffset: 4005
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 5: "Loot Table exclusiva... reutiliza o Loot Generator existente."
  // Distinta da tabela "forgotten-guardian" acima (o loot NORMAL de
  // qualquer encontro com o Guardião Esquecido, dentro ou fora de uma
  // Dungeon) — esta é a recompensa ADICIONAL exclusiva de completar o
  // papel de "Chefe Final" de uma Dungeon (ver dungeon/
  // dungeonController.ts), somada por cima do drop normal do abate.
  // `rarityMultiplier` bem mais alto (4.0, o dobro de dark-knight) +
  // `rarityWeightMultipliers.unique` extra aplicado na chamada
  // (dungeonController.ts) — "item único" garantido, não só provável.
  {
    id: "final-boss-relic",
    weight: 100,
    minLevel: 20,
    maxLevel: 60,
    itemLevelVariance: 3,
    dropChance: 1,
    allowedBaseItems: ["sword", "mace", "staff", "amulet"],
    baseItemWeights: { sword: 30, mace: 25, staff: 25, amulet: 20 },
    rarityMultiplier: 4,
    quantityMultiplier: 1,
    quantityOptions: [{ quantity: 1, weight: 100 }],
    seedOffset: 5001
  }
];
function getLootTable(id) {
  return LOOT_TABLES.find((table) => table.id === id);
}

// packages/shared/src/lootgen/generator.ts
var RARITY_VALUE_MULTIPLIER = {
  common: 1,
  magic: 2,
  rare: 4,
  unique: 10
};
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function rollItemLevel(rng, monsterLevel, table) {
  const raw = monsterLevel + randomInt(rng, -table.itemLevelVariance, table.itemLevelVariance);
  return clamp(raw, table.minLevel, table.maxLevel);
}
function rollBaseItemId(rng, table, baseItemWeightOverrides) {
  const candidates = table.allowedBaseItems.map((id) => ({
    id,
    weight: (table.baseItemWeights[id] ?? 1) * (baseItemWeightOverrides?.[id] ?? 1)
  }));
  return pickWeighted(rng, candidates).id;
}
function estimateItemValue(item) {
  return item.powerScore * RARITY_VALUE_MULTIPLIER[item.rarity];
}
function generateLoot(sourceId, monsterLevel, seed, options = {}) {
  const table = getLootTable(sourceId);
  if (!table) {
    throw new Error(`Loot Generator: Loot Table desconhecida "${sourceId}"`);
  }
  const rng = createSeededRandom(seed + table.seedOffset);
  const effectiveDropChance = options.dropChanceOverride ?? table.dropChance;
  const dropped = rng() < effectiveDropChance;
  if (!dropped) {
    return { generatedItems: [], currencies: [], totalPower: 0, totalValue: 0, seed };
  }
  const quantityRoll = pickWeighted(rng, table.quantityOptions);
  const quantity = Math.max(options.minimumQuantity ?? 0, Math.round(quantityRoll.quantity * table.quantityMultiplier));
  const rarityWeightMultipliers = {
    magic: table.rarityMultiplier * (options.rarityWeightMultipliers?.magic ?? 1),
    rare: table.rarityMultiplier * (options.rarityWeightMultipliers?.rare ?? 1),
    unique: table.rarityMultiplier * (options.rarityWeightMultipliers?.unique ?? 1)
  };
  const generatedItems = [];
  for (let i = 0; i < quantity; i++) {
    const itemLevel = rollItemLevel(rng, monsterLevel, table);
    const baseItemId = rollBaseItemId(rng, table, options.baseItemWeightOverrides);
    const itemSeed = randomInt(rng, 0, 2147483647);
    generatedItems.push(
      generateItem(baseItemId, itemLevel, itemSeed, {
        rarityWeightMultipliers,
        modTagWeightMultipliers: options.modTagWeightMultipliers
      })
    );
  }
  const totalPower = generatedItems.reduce((sum, item) => sum + item.powerScore, 0);
  const totalValue = generatedItems.reduce((sum, item) => sum + estimateItemValue(item), 0);
  return {
    generatedItems,
    // Requisito 5 — Currency: só o tipo existe nesta fase (types.ts);
    // nenhuma Loot Table rola currency ainda, então fica sempre vazio.
    currencies: [],
    totalPower,
    totalValue,
    seed
  };
}

// packages/shared/src/lootidentity/archetypes.ts
var MONSTER_ARCHETYPES = [
  {
    id: "beast",
    name: "Beast",
    tags: ["beast", "feral", "physical"],
    lootBias: {
      baseItemAffinity: { dagger: 1.6, boots: 1.5, belt: 1.4 },
      affixAffinity: { life: 1.5, physical: 1.4, attack_speed: 1.3 },
      rarityBias: {}
    },
    currencyBias: { gold: 0.6, craft_material: 1.5 },
    futureCraftBias: { essence: 1.2 }
  },
  {
    id: "undead",
    name: "Undead",
    tags: ["undead", "spell", "cold"],
    lootBias: {
      baseItemAffinity: { staff: 1.5, wand: 1.5, ring: 1.4 },
      affixAffinity: { spell: 1.6, cold: 1.5 },
      rarityBias: {}
    },
    currencyBias: { fragment: 1.6, gold: 0.5 },
    futureCraftBias: { essence: 1.4 }
  },
  {
    id: "humanoid",
    name: "Humanoid",
    tags: ["humanoid", "versatile"],
    lootBias: {
      baseItemAffinity: { sword: 1.2, axe: 1.2, mace: 1.2, chest: 1.2, helmet: 1.2 },
      affixAffinity: {},
      rarityBias: {}
    },
    currencyBias: { gold: 1 },
    futureCraftBias: {}
  },
  {
    id: "bandit",
    name: "Bandit",
    tags: ["bandit", "cunning", "physical"],
    lootBias: {
      baseItemAffinity: { sword: 1.4, dagger: 1.5, bow: 1.4 },
      affixAffinity: { critical: 1.5, accuracy: 1.4, attack_speed: 1.3 },
      rarityBias: {}
    },
    currencyBias: { gold: 1.5, rune: 0.3 },
    futureCraftBias: { catalyst: 1.1 }
  },
  {
    id: "mage",
    name: "Mage",
    tags: ["mage", "spell", "elemental"],
    lootBias: {
      baseItemAffinity: { staff: 1.6, wand: 1.6, amulet: 1.4 },
      affixAffinity: { spell: 1.6, fire: 1.3, cold: 1.3, lightning: 1.3 },
      rarityBias: {}
    },
    currencyBias: { craft_material: 1.6, fragment: 1.2 },
    futureCraftBias: { catalyst: 1.3 }
  },
  {
    id: "construct",
    name: "Construct",
    tags: ["construct", "mechanical", "defense"],
    lootBias: {
      baseItemAffinity: { chest: 1.5, helmet: 1.4, gloves: 1.3, boots: 1.3 },
      affixAffinity: { strength: 1.4, life: 1.2 },
      rarityBias: {}
    },
    currencyBias: { fragment: 1.6, craft_material: 1.2 },
    futureCraftBias: { essence: 1.1 }
  },
  {
    id: "demon",
    name: "Demon",
    tags: ["demon", "fire", "chaos"],
    lootBias: {
      baseItemAffinity: { axe: 1.3, mace: 1.3, amulet: 1.3, ring: 1.2 },
      affixAffinity: { fire: 1.4, physical: 1.3, life_leech: 1.3 },
      rarityBias: {}
    },
    currencyBias: { boss_material: 1.3, fragment: 1.3, rune: 1.2 },
    futureCraftBias: { essence: 1.3 }
  },
  {
    id: "boss",
    name: "Boss",
    tags: ["boss"],
    lootBias: {
      // "Todos permitidos" (requisito 2) / "Sem restrições" (requisito
      // 3) -> nenhum viés de Base Item ou de mod, todo mundo com o
      // mesmo peso relativo.
      baseItemAffinity: {},
      affixAffinity: {},
      // Exemplo literal da Sprint: "Boss: Rare x4, Unique x1".
      rarityBias: { rare: 4, unique: 1 }
    },
    // Exemplo literal da Sprint: "Boss: Tudo elevado".
    currencyBias: { gold: 2, craft_material: 2, fragment: 2, boss_material: 3, rune: 2 },
    futureCraftBias: { essence: 1.5, catalyst: 1.5 }
  }
];
function getArchetype(id) {
  return MONSTER_ARCHETYPES.find((archetype) => archetype.id === id);
}

// packages/shared/src/lootidentity/lootIdentities.ts
var MONSTER_LOOT_IDENTITIES = [
  {
    monsterId: "wolf",
    archetypeId: "beast",
    // Exemplo literal da Sprint: "Wolf: Rare x0.5, Unique x0".
    lootBiasOverride: { rarityBias: { rare: 0.5, unique: 0 } }
  },
  {
    monsterId: "goblin",
    archetypeId: "humanoid"
  },
  {
    monsterId: "skeleton",
    archetypeId: "undead"
  },
  // Biomes, Regions & World Progression Phase I — requisito 2/3:
  // arquétipos já existentes reaproveitados (nenhum arquétipo novo
  // criado) — Beast pra Javali/Aranha/Hiena (mesmo de Wolf), Construct
  // pro Stone Construct.
  {
    monsterId: "boar",
    archetypeId: "beast"
  },
  {
    monsterId: "spider",
    archetypeId: "beast"
  },
  {
    monsterId: "hyena",
    archetypeId: "beast"
  },
  {
    monsterId: "stone-construct",
    archetypeId: "construct"
  },
  {
    monsterId: "bandit",
    archetypeId: "bandit"
  },
  {
    monsterId: "bandit_captain",
    archetypeId: "bandit",
    // Exemplo literal da Sprint: "Bandit Captain: Rare x2, Unique x0.2".
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.2 } }
  },
  {
    monsterId: "boss",
    archetypeId: "boss"
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/4: um
  // registro por Mini-Boss, mesmo padrão de "Bandit Captain" (arquétipo
  // reaproveitado + sorte de raridade própria acima do arquétipo).
  // Elite (não listado aqui de propósito) não tem Loot Identity
  // própria — reaproveita a do Enemy Template normal sorteado (ver
  // enemy/lootIntegration.ts, que aplica o bônus por cima na hora).
  {
    monsterId: "wolf-alpha",
    archetypeId: "beast",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } }
  },
  {
    monsterId: "swamp-witch",
    archetypeId: "mage",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } }
  },
  {
    monsterId: "ancient-construct",
    archetypeId: "construct",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } }
  },
  {
    monsterId: "forgotten-guardian",
    archetypeId: "undead",
    lootBiasOverride: { rarityBias: { rare: 2, unique: 0.3 } }
  },
  {
    monsterId: "dark-knight",
    archetypeId: "humanoid",
    lootBiasOverride: { rarityBias: { rare: 2.5, unique: 0.5 } }
  }
];
function getLootIdentity(monsterId) {
  return MONSTER_LOOT_IDENTITIES.find((identity) => identity.monsterId === monsterId);
}

// packages/shared/src/lootidentity/resolve.ts
function multiplyBiasMaps(base, override) {
  const keys = /* @__PURE__ */ new Set([...Object.keys(base), ...Object.keys(override)]);
  const result = {};
  for (const key of keys) {
    result[key] = (base[key] ?? 1) * (override[key] ?? 1);
  }
  return result;
}
function resolveLootBias(monsterId) {
  const identity = getLootIdentity(monsterId);
  if (!identity) {
    throw new Error(`Monster Loot Identity: identidade desconhecida "${monsterId}"`);
  }
  const archetype = getArchetype(identity.archetypeId);
  if (!archetype) {
    throw new Error(`Monster Loot Identity: Archetype desconhecido "${identity.archetypeId}"`);
  }
  const override = identity.lootBiasOverride ?? {};
  return {
    baseItemAffinity: multiplyBiasMaps(archetype.lootBias.baseItemAffinity, override.baseItemAffinity ?? {}),
    affixAffinity: multiplyBiasMaps(archetype.lootBias.affixAffinity, override.affixAffinity ?? {}),
    rarityBias: multiplyBiasMaps(archetype.lootBias.rarityBias, override.rarityBias ?? {})
  };
}

// packages/shared/src/lootidentity/generator.ts
function generateMonsterLoot(monsterId, monsterLevel, seed, overrides = {}) {
  const bias = resolveLootBias(monsterId);
  const rarityWeightMultipliers = overrides.rarityMultiplierBonus ? {
    magic: (bias.rarityBias.magic ?? 1) * overrides.rarityMultiplierBonus,
    rare: (bias.rarityBias.rare ?? 1) * overrides.rarityMultiplierBonus,
    unique: (bias.rarityBias.unique ?? 1) * overrides.rarityMultiplierBonus
  } : bias.rarityBias;
  return generateLoot(monsterId, monsterLevel, seed, {
    baseItemWeightOverrides: bias.baseItemAffinity,
    rarityWeightMultipliers,
    modTagWeightMultipliers: bias.affixAffinity,
    dropChanceOverride: overrides.dropChanceOverride,
    minimumQuantity: overrides.minimumQuantity
  });
}

// packages/shared/src/inventory/validation.ts
function validateGeneratedItem(item) {
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

// packages/shared/src/inventory/inventory.ts
var Inventory = class {
  inventoryId;
  // Requisito 1 — "weight (futuro)": campo reservado, sempre 0 nesta
  // fase. Nenhuma Loot Table/Base Item carrega peso ainda; somar peso
  // de verdade é uma Sprint futura, fora de escopo aqui.
  weight;
  // Requisito 1 — incrementado em toda mutação bem-sucedida
  // (addItem/removeItem/expandCapacity); pensado pra concorrência
  // otimista quando o Inventory for persistido de verdade numa fase
  // futura (nenhuma persistência implementada nesta Sprint).
  version;
  slots;
  // instanceId -> slotIndex, O(1) pra findById()/duplicate check.
  itemIndex;
  // Fila de índices vazios, sempre ordenada crescente — O(1) pra achar
  // espaço livre em addItem() sem varrer o array, e determinístico:
  // addItem() sempre ocupa o MENOR índice livre disponível (testado em
  // inventory.test.ts).
  freeSlots;
  constructor(inventoryId, initialCapacity) {
    if (!Number.isInteger(initialCapacity) || initialCapacity < 0) {
      throw new Error(`Inventory: capacity precisa ser um inteiro >= 0 (recebido ${initialCapacity})`);
    }
    this.inventoryId = inventoryId;
    this.weight = 0;
    this.version = 0;
    this.slots = [];
    this.itemIndex = /* @__PURE__ */ new Map();
    this.freeSlots = [];
    this.appendSlots(initialCapacity);
  }
  appendSlots(count) {
    const start = this.slots.length;
    for (let i = 0; i < count; i++) {
      const slotIndex = start + i;
      this.slots.push({ slotIndex, instanceId: null, item: null, quantity: 0 });
      this.freeSlots.push(slotIndex);
    }
  }
  get capacity() {
    return this.slots.length;
  }
  // Requisito 1 — "items[]": vista somente-leitura da coleção de slots
  // (vazio ou com 1 item cada, requisito 2). Mutação só através de
  // addItem()/removeItem(), nunca escrevendo neste array por fora.
  get items() {
    return this.slots;
  }
  // Como aumentar a capacidade sem alterar nenhuma lógica existente
  // (pergunta final da Sprint): só isto. addItem/removeItem/getItem/
  // findItem/findBySlot/findById não sabem e não precisam saber que a
  // capacidade mudou — eles só leem `this.slots`/`this.freeSlots`, que
  // já refletem o novo tamanho.
  expandCapacity(additionalSlots) {
    if (!Number.isInteger(additionalSlots) || additionalSlots <= 0) {
      throw new Error(`Inventory: additionalSlots precisa ser um inteiro positivo (recebido ${additionalSlots})`);
    }
    this.appendSlots(additionalSlots);
    this.version++;
  }
  // Requisito 3 — ordem de validação: id -> duplicação -> integridade
  // (base/raridade/power score/prefixos/sufixos) -> capacidade. Nenhum
  // item é montado à mão aqui — o item já vem pronto do Loot Generator
  // (generateLoot()/generateMonsterLoot()); Inventory só guarda.
  addItem(instanceId, item) {
    if (typeof instanceId !== "string" || instanceId.length === 0) {
      return { success: false, reason: "invalid_instance_id" };
    }
    if (this.itemIndex.has(instanceId)) {
      return { success: false, reason: "duplicate_instance_id" };
    }
    const validationError = validateGeneratedItem(item);
    if (validationError) {
      return { success: false, reason: validationError };
    }
    if (this.freeSlots.length === 0) {
      return { success: false, reason: "inventory_full" };
    }
    const slotIndex = this.freeSlots.shift();
    this.slots[slotIndex] = { slotIndex, instanceId, item, quantity: 1 };
    this.itemIndex.set(instanceId, slotIndex);
    this.version++;
    return { success: true, slotIndex };
  }
  // Requisito 4 — "sem apagar dados incorretamente": só o slot
  // encontrado é limpo; nenhum outro slot é tocado; retorna
  // success:false (nunca lança) quando o instanceId não existe.
  removeItem(instanceId) {
    const slotIndex = this.itemIndex.get(instanceId);
    if (slotIndex === void 0) {
      return { success: false, reason: "not_found" };
    }
    const removedItem = this.slots[slotIndex].item;
    this.slots[slotIndex] = { slotIndex, instanceId: null, item: null, quantity: 0 };
    this.itemIndex.delete(instanceId);
    this.freeSlots.push(slotIndex);
    this.freeSlots.sort((a, b) => a - b);
    this.version++;
    return { success: true, slotIndex, removedItem };
  }
  // Requisito 5 — O(1): acesso direto por posição.
  getItem(slotIndex) {
    return this.slots[slotIndex]?.item ?? null;
  }
  // Requisito 5 — O(1): acesso direto por posição, slot inteiro.
  findBySlot(slotIndex) {
    return this.slots[slotIndex] ?? null;
  }
  // Requisito 5 — O(1) via itemIndex (Map instanceId -> slotIndex),
  // nunca uma varredura linear.
  findById(instanceId) {
    const slotIndex = this.itemIndex.get(instanceId);
    return slotIndex === void 0 ? null : this.slots[slotIndex];
  }
  // Requisito 5 — busca por predicado arbitrário: O(n) sempre ("Tudo
  // O(1) sempre que possível" — aqui não é possível, um predicado
  // qualquer não dá pra indexar de antemão).
  findItem(predicate) {
    for (const slot of this.slots) {
      if (slot.item && predicate(slot.item, slot)) return slot;
    }
    return null;
  }
  // Requisito 7 — vista somente-dados, 100% serializável (sem Map/
  // classe), pronta pra uma futura persistência real (DB/API) sem
  // implementar nenhuma nesta Sprint.
  toSnapshot() {
    return {
      inventoryId: this.inventoryId,
      capacity: this.capacity,
      items: this.slots.map((slot) => ({ ...slot })),
      weight: this.weight,
      version: this.version
    };
  }
};

// packages/shared/src/equipment/slots.ts
var EQUIPMENT_SLOT_DEFINITIONS = [
  { id: "weapon", label: "Weapon", acceptsItemSlot: "weapon" },
  { id: "helmet", label: "Helmet", acceptsItemSlot: "helmet" },
  { id: "chest", label: "Chest", acceptsItemSlot: "chest" },
  { id: "gloves", label: "Gloves", acceptsItemSlot: "gloves" },
  { id: "boots", label: "Boots", acceptsItemSlot: "boots" },
  { id: "ring1", label: "Ring 1", acceptsItemSlot: "ring" },
  { id: "ring2", label: "Ring 2", acceptsItemSlot: "ring" },
  { id: "amulet", label: "Amulet", acceptsItemSlot: "amulet" },
  { id: "belt", label: "Belt", acceptsItemSlot: "belt" }
];

// packages/shared/src/equipment/equipment.ts
var Equipment = class {
  characterId;
  version;
  slots;
  constructor(characterId) {
    this.characterId = characterId;
    this.version = 0;
    this.slots = EQUIPMENT_SLOT_DEFINITIONS.map((definition) => ({
      slotId: definition.id,
      instanceId: null,
      item: null
    }));
  }
  // Vista somente-leitura de todos os slots (vazio ou com 1 item cada).
  get items() {
    return this.slots;
  }
  findSlotIndex(equipmentSlotId) {
    return this.slots.findIndex((slot) => slot.slotId === equipmentSlotId);
  }
  getEquippedItem(equipmentSlotId) {
    const slotIndex = this.findSlotIndex(equipmentSlotId);
    return slotIndex === -1 ? null : this.slots[slotIndex].item;
  }
  // Requisito 2 — recebe um Inventory Slot (via `inventoryInstanceId`,
  // o identificador único que o Inventory System já usa) e o slot de
  // Equipment de destino. Validações na ordem documentada em
  // types.ts. "item equipado anteriormente": se já havia algo ali, a
  // troca é automática — o item antigo volta pro MESMO slot de
  // Inventory que acabou de ser liberado pelo novo item (nunca perde
  // dado, nunca precisa de um segundo slot livre pra trocar de arma).
  equipItem(inventory, equipmentSlotId, inventoryInstanceId) {
    const slotIndex = this.findSlotIndex(equipmentSlotId);
    if (slotIndex === -1) {
      return { success: false, reason: "invalid_slot" };
    }
    const slotDefinition = EQUIPMENT_SLOT_DEFINITIONS[slotIndex];
    const inventorySlot = inventory.findById(inventoryInstanceId);
    if (!inventorySlot || !inventorySlot.item) {
      return { success: false, reason: "item_not_found" };
    }
    const item = inventorySlot.item;
    const validationError = validateGeneratedItem(item);
    if (validationError) {
      return { success: false, reason: validationError };
    }
    const base = getBaseItem(item.baseItemId);
    if (!base || base.slot !== slotDefinition.acceptsItemSlot) {
      return { success: false, reason: "wrong_item_type" };
    }
    const removeResult = inventory.removeItem(inventoryInstanceId);
    if (!removeResult.success) {
      return { success: false, reason: "item_not_found" };
    }
    const previousSlot = this.slots[slotIndex];
    const previousItem = previousSlot.item;
    const previousInstanceId = previousSlot.instanceId;
    if (previousItem && previousInstanceId) {
      const returnResult = inventory.addItem(previousInstanceId, previousItem);
      if (!returnResult.success) {
        inventory.addItem(inventoryInstanceId, item);
        return { success: false, reason: "swap_failed" };
      }
    }
    this.slots[slotIndex] = { slotId: slotDefinition.id, instanceId: inventoryInstanceId, item };
    this.version++;
    return { success: true, equipmentSlotId: slotDefinition.id, previousItem };
  }
  // Requisito 3 — "retorna o item para o inventário, nunca perde
  // item, valida inventário cheio": só desequipa DEPOIS de confirmar
  // que o addItem() no Inventory teria sucesso — se o Inventory
  // estiver cheio, o Equipment nem chega a ser tocado.
  unequipItem(inventory, equipmentSlotId) {
    const slotIndex = this.findSlotIndex(equipmentSlotId);
    if (slotIndex === -1) {
      return { success: false, reason: "invalid_slot" };
    }
    const slot = this.slots[slotIndex];
    if (!slot.item || !slot.instanceId) {
      return { success: false, reason: "empty_slot" };
    }
    const addResult = inventory.addItem(slot.instanceId, slot.item);
    if (!addResult.success) {
      return { success: false, reason: "inventory_full" };
    }
    const item = slot.item;
    this.slots[slotIndex] = { slotId: slot.slotId, instanceId: null, item: null };
    this.version++;
    return { success: true, equipmentSlotId: slot.slotId, item, inventorySlotIndex: addResult.slotIndex };
  }
};

// packages/shared/src/equipment/stats.ts
var STAT_LABEL_BUCKET = {
  "Physical Damage": "attack",
  "Fire Damage": "attack",
  "Cold Damage": "attack",
  "Lightning Damage": "attack",
  "Spell Damage": "spellDamage",
  "Critical Strike Chance": "critical",
  Accuracy: "accuracy",
  "Attack Speed": "attackSpeed",
  "Life Leech": "lifeLeech",
  Life: "life"
};
function calculateCharacterStats(equipment) {
  const stats = {
    life: 0,
    attack: 0,
    defense: 0,
    spellDamage: 0,
    critical: 0,
    accuracy: 0,
    attackSpeed: 0,
    lifeLeech: 0,
    // Requisito 6 — nenhum mod do Item Generator concede resistência
    // ainda (só dano elemental existe hoje); os 4 campos já existem no
    // formato certo (mesmos 4 tipos de dano de itemgen/) pra somar de
    // verdade assim que esse tipo de mod for adicionado ao Item
    // Generator numa fase futura, sem precisar mudar esta função.
    resistances: { physical: 0, fire: 0, cold: 0, lightning: 0 },
    powerScore: 0
  };
  for (const slot of equipment.items) {
    const item = slot.item;
    if (!item) continue;
    const base = getBaseItem(item.baseItemId);
    if (base?.baseDamage) {
      stats.attack += (base.baseDamage.min + base.baseDamage.max) / 2;
    }
    if (base?.baseDefense) {
      stats.defense += base.baseDefense;
    }
    if (base?.baseAttackSpeed) {
      stats.attackSpeed += base.baseAttackSpeed;
    }
    for (const mod of [...item.prefixes, ...item.suffixes]) {
      const bucket = STAT_LABEL_BUCKET[mod.statLabel];
      if (bucket) stats[bucket] += mod.value;
    }
    stats.powerScore += item.powerScore;
  }
  return stats;
}

// packages/shared/src/characterbuild/classes.ts
var CHARACTER_CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    startingAttributes: { strength: 20, dexterity: 10, intelligence: 5, vitality: 15 },
    growthPerLevel: { strength: 3, dexterity: 1, intelligence: 0.5, vitality: 2.5 }
  },
  {
    id: "mage",
    name: "Mage",
    startingAttributes: { strength: 5, dexterity: 8, intelligence: 22, vitality: 8 },
    growthPerLevel: { strength: 0.5, dexterity: 1, intelligence: 3, vitality: 1.2 }
  },
  {
    id: "ranger",
    name: "Ranger",
    startingAttributes: { strength: 8, dexterity: 20, intelligence: 8, vitality: 10 },
    growthPerLevel: { strength: 1, dexterity: 3, intelligence: 0.8, vitality: 1.5 }
  },
  {
    id: "cleric",
    name: "Cleric",
    startingAttributes: { strength: 12, dexterity: 8, intelligence: 15, vitality: 14 },
    growthPerLevel: { strength: 1.2, dexterity: 0.8, intelligence: 2, vitality: 2 }
  }
];
function getCharacterClass(id) {
  return CHARACTER_CLASSES.find((classDef) => classDef.id === id);
}

// packages/shared/src/characterbuild/baseAttributes.ts
var ATTRIBUTE_KEYS = ["strength", "dexterity", "intelligence", "vitality"];
function computeBaseAttributes(classDef, level) {
  const levelsGained = Math.max(0, level - 1);
  const result = {};
  for (const key of ATTRIBUTE_KEYS) {
    result[key] = classDef.startingAttributes[key] + classDef.growthPerLevel[key] * levelsGained;
  }
  return result;
}

// packages/shared/src/characterbuild/derivedAttributes.ts
var DERIVED_STAT_FORMULAS = [
  { key: "maximumLife", base: 50, coefficients: { vitality: 5, strength: 1 } },
  { key: "maximumMana", base: 30, coefficients: { intelligence: 4, vitality: 0.5 } },
  { key: "physicalDamage", base: 0, coefficients: { strength: 1, dexterity: 0.5 } },
  { key: "spellDamage", base: 0, coefficients: { intelligence: 1.2 } },
  { key: "criticalChance", base: 5, coefficients: { dexterity: 0.1 } },
  { key: "accuracy", base: 50, coefficients: { dexterity: 2 } },
  { key: "attackSpeed", base: 1, coefficients: { dexterity: 0.01 } },
  { key: "movementSpeed", base: 100, coefficients: { dexterity: 0.2 } },
  { key: "armor", base: 0, coefficients: { strength: 0.5, vitality: 0.5 } }
];
function applyFormula(formula, base) {
  let value = formula.base;
  for (const [attribute, coefficient] of Object.entries(formula.coefficients)) {
    value += base[attribute] * coefficient;
  }
  return value;
}
function computePowerScore(derived) {
  return Math.round(
    derived.maximumLife * 0.5 + derived.maximumMana * 0.3 + derived.physicalDamage * 2 + derived.spellDamage * 2 + derived.armor * 1.5 + derived.criticalChance * 3 + derived.accuracy * 0.3 + derived.attackSpeed * 20 + derived.movementSpeed * 0.2
  );
}
function calculateDerivedAttributes(base) {
  const partial = {};
  for (const formula of DERIVED_STAT_FORMULAS) {
    partial[formula.key] = applyFormula(formula, base);
  }
  return { ...partial, powerScore: computePowerScore(partial) };
}

// packages/shared/src/characterbuild/characterBuild.ts
var CharacterBuild = class {
  characterId;
  classId;
  experience;
  version;
  constructor(characterId, classId, experience = 0) {
    if (!getCharacterClass(classId)) {
      throw new Error(`Character Build: classe desconhecida "${classId}"`);
    }
    if (!Number.isFinite(experience) || experience < 0) {
      throw new Error(`Character Build: experience precisa ser um n\xFAmero >= 0 (recebido ${experience})`);
    }
    this.characterId = characterId;
    this.classId = classId;
    this.experience = experience;
    this.version = 0;
  }
  // Requisito 1 — "Level": reaproveita getLevel() já existente
  // (packages/shared/src/xp.ts, a mesma curva usada hoje pelo
  // backend/CharacterPage) em vez de duplicar uma segunda curva de
  // XP — nunca uma segunda fonte de verdade pra "quanto XP = qual
  // nível". Sempre derivado de `experience`, nunca setado à parte
  // (impossível ficar dessincronizado).
  get level() {
    return getLevel(this.experience);
  }
  addExperience(amount) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Character Build: amount precisa ser um n\xFAmero >= 0 (recebido ${amount})`);
    }
    this.experience += amount;
    this.version++;
  }
  // Requisito 2 — Base Attributes: classe + nível, nunca equipamento.
  getBaseAttributes() {
    const classDef = getCharacterClass(this.classId);
    if (!classDef) {
      throw new Error(`Character Build: classe desconhecida "${this.classId}"`);
    }
    return computeBaseAttributes(classDef, this.level);
  }
  // Requisito 3 — Derived Attributes: sempre pelo agregador único
  // (derivedAttributes.ts), nunca calculado aqui.
  getDerivedAttributes() {
    return calculateDerivedAttributes(this.getBaseAttributes());
  }
};

// packages/shared/src/characterbuild/finalStats.ts
function applyModifiers(stats, modifier) {
  if (!modifier) return;
  for (const [key, value] of Object.entries(modifier)) {
    stats[key] += value;
  }
}
function calculateFinalStats(build, equipment, modifiers = {}) {
  const derived = build.getDerivedAttributes();
  const equipmentStats = calculateCharacterStats(equipment);
  const stats = {
    maximumLife: derived.maximumLife + equipmentStats.life,
    maximumMana: derived.maximumMana,
    physicalDamage: derived.physicalDamage + equipmentStats.attack,
    spellDamage: derived.spellDamage + equipmentStats.spellDamage,
    criticalChance: derived.criticalChance + equipmentStats.critical,
    accuracy: derived.accuracy + equipmentStats.accuracy,
    attackSpeed: derived.attackSpeed + equipmentStats.attackSpeed,
    movementSpeed: derived.movementSpeed,
    armor: derived.armor + equipmentStats.defense,
    lifeLeech: equipmentStats.lifeLeech,
    resistances: { ...equipmentStats.resistances },
    powerScore: derived.powerScore + equipmentStats.powerScore
  };
  applyModifiers(stats, modifiers.buffs);
  applyModifiers(stats, modifiers.passives);
  applyModifiers(stats, modifiers.talents);
  return stats;
}

// packages/shared/src/combat/damageTypes.ts
var COMBAT_DAMAGE_TYPES = [
  { id: "physical", label: "Physical", finalStatKey: "physicalDamage", resistanceKey: "physical", mitigatedByArmor: true },
  { id: "fire", label: "Fire", finalStatKey: null, resistanceKey: "fire", mitigatedByArmor: false },
  { id: "cold", label: "Cold", finalStatKey: null, resistanceKey: "cold", mitigatedByArmor: false },
  { id: "lightning", label: "Lightning", finalStatKey: null, resistanceKey: "lightning", mitigatedByArmor: false },
  { id: "chaos", label: "Chaos", finalStatKey: null, resistanceKey: null, mitigatedByArmor: false }
];
function getCombatDamageTypeDefinition(id) {
  const found = COMBAT_DAMAGE_TYPES.find((definition) => definition.id === id);
  if (!found) {
    throw new Error(`Combat Engine: tipo de dano desconhecido "${id}"`);
  }
  return found;
}

// packages/shared/src/combat/config.ts
var COMBAT_CONFIG = {
  hitChance: {
    // Requisito 6 — "preparado para Evasion futura": até o Target ter
    // seu próprio stat de Evasion (não existe em FinalStats ainda),
    // usamos este valor fixo como "evasão padrão" de qualquer alvo —
    // um único número pra trocar por `target.finalStats.evasion` no
    // dia em que esse stat existir, sem mudar a fórmula em pipeline.ts.
    baselineEvasion: 100,
    // Nunca 0% (sempre existe uma chance mínima de acertar) nem acima
    // de 100%.
    min: 0.05,
    max: 1
  },
  damage: {
    // Requisito 3 ("Damage Roll") — variação aleatória em torno do
    // dano base, uniforme em [1 - variance, 1 + variance].
    variance: 0.15
  },
  armor: {
    // Fórmula clássica de mitigação por Armor: reduction = armor /
    // (armor + mitigationConstant). Só usada quando
    // CombatDamageTypeDefinition.mitigatedByArmor === true.
    mitigationConstant: 100
  },
  resistance: {
    // Resistência (0-100) vira % de mitigação direta, com teto —
    // convenção clássica de ARPG (nunca 100% de mitigação via
    // resistência).
    maxMitigation: 0.75
  }
};

// packages/shared/src/combat/pipeline.ts
function clamp2(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function rollHit(rng, context) {
  if (context.guaranteedHit) {
    return { hit: true, hitChance: 1 };
  }
  const accuracy = context.attacker.finalStats.accuracy;
  const rawChance = accuracy / (accuracy + COMBAT_CONFIG.hitChance.baselineEvasion);
  const multiplier = context.futureModifiers?.hitChanceMultiplier ?? 1;
  const hitChance = clamp2(rawChance * multiplier, COMBAT_CONFIG.hitChance.min, COMBAT_CONFIG.hitChance.max);
  return { hit: rng() < hitChance, hitChance };
}
function rollCritical(rng, context) {
  const baseChance = context.attacker.finalStats.criticalChance / 100;
  const multiplier = context.futureModifiers?.criticalChanceMultiplier ?? 1;
  const criticalChance = clamp2(baseChance * multiplier, 0, 1);
  return { critical: rng() < criticalChance, criticalChance };
}
function rollDamage(rng, context, critical) {
  const definition = getCombatDamageTypeDefinition(context.attackType);
  const baseDamage = definition.finalStatKey ? context.attacker.finalStats[definition.finalStatKey] : 0;
  const varianceRoll = 1 + (rng() * 2 - 1) * COMBAT_CONFIG.damage.variance;
  let damage = Math.max(0, baseDamage * varianceRoll);
  if (critical) {
    damage *= context.attacker.criticalMultiplier;
  }
  damage *= context.futureModifiers?.damageMultiplier ?? 1;
  return Math.max(0, damage);
}
function applyMitigation(rolledDamage, context) {
  const definition = getCombatDamageTypeDefinition(context.attackType);
  if (definition.mitigatedByArmor) {
    const armorPenetration = clamp2(context.futureModifiers?.armorPenetration ?? 0, 0, 1);
    const effectiveArmor = Math.max(0, context.target.finalStats.armor * (1 - armorPenetration));
    const reduction = effectiveArmor / (effectiveArmor + COMBAT_CONFIG.armor.mitigationConstant);
    return rolledDamage * (1 - reduction);
  }
  if (definition.resistanceKey) {
    const resistance = context.target.finalStats.resistances[definition.resistanceKey];
    const reduction = clamp2(resistance / 100, 0, COMBAT_CONFIG.resistance.maxMitigation);
    return rolledDamage * (1 - reduction);
  }
  return rolledDamage;
}
function calculateLifeLeech(finalDamage, context) {
  const leechPercent = context.attacker.finalStats.lifeLeech / 100;
  const multiplier = context.futureModifiers?.lifeLeechMultiplier ?? 1;
  return finalDamage * leechPercent * multiplier;
}

// packages/shared/src/combat/combatEngine.ts
function resolveCombat(context) {
  const rng = createSeededRandom(context.seed);
  const { hit } = rollHit(rng, context);
  if (!hit) {
    return {
      damage: 0,
      critical: false,
      miss: true,
      lifeLeech: 0,
      remainingLife: context.target.currentLife,
      damageType: context.attackType,
      seed: context.seed
    };
  }
  const { critical } = rollCritical(rng, context);
  const rolledDamage = rollDamage(rng, context, critical);
  const finalDamage = applyMitigation(rolledDamage, context);
  const lifeLeech = calculateLifeLeech(finalDamage, context);
  const remainingLife = Math.max(0, context.target.currentLife - finalDamage);
  return {
    damage: finalDamage,
    critical,
    miss: false,
    lifeLeech,
    remainingLife,
    damageType: context.attackType,
    seed: context.seed
  };
}

// packages/shared/src/enemy/config.ts
var ENEMY_DEFAULT_CRITICAL_MULTIPLIER = 1.5;

// packages/shared/src/enemy/templates.ts
var ENEMY_TEMPLATES = [
  {
    id: "wolf",
    name: "Wolf",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "wolf",
    baseStats: { strength: 2, dexterity: 4, intelligence: 1, vitality: 2 },
    growth: { strength: 0.3, dexterity: 0.35, intelligence: 0.1, vitality: 0.3 },
    futureFlags: {}
  },
  {
    id: "goblin",
    name: "Goblin",
    region: "pantano-podre",
    levelRange: { min: 1, max: 18 },
    archetype: "humanoid",
    lootIdentityId: "goblin",
    baseStats: { strength: 2, dexterity: 5, intelligence: 2, vitality: 2 },
    growth: { strength: 0.3, dexterity: 0.3, intelligence: 0.15, vitality: 0.3 },
    futureFlags: {}
  },
  // Biomes, Regions & World Progression Phase I — requisito 2:
  // "Identidade de Monstros" do Bosque Sussurrante (Lobo já existia,
  // Javali/Aranha são novos) — mesmo patamar de poder do Wolf já
  // calibrado (dano/vida próximos), pra não perturbar o balanceamento
  // da região feito na Sprint de Gameplay Balance.
  {
    id: "boar",
    name: "Boar",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "boar",
    baseStats: { strength: 3, dexterity: 3, intelligence: 1, vitality: 4 },
    growth: { strength: 0.35, dexterity: 0.3, intelligence: 0.1, vitality: 0.4 },
    futureFlags: {}
  },
  {
    id: "spider",
    name: "Spider",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "spider",
    baseStats: { strength: 2, dexterity: 5, intelligence: 1, vitality: 1 },
    growth: { strength: 0.25, dexterity: 0.4, intelligence: 0.1, vitality: 0.25 },
    futureFlags: {}
  },
  // Biomes, Regions & World Progression Phase I — requisito 9: a
  // simulação de longa duração (progressão automática de biomas)
  // mediu 100% de taxa de morte pra quem alcança Ruínas Esquecidas
  // mesmo depois de reduzir o tamanho do grupo (worldencounter/
  // encounterTables.ts) — Skeleton nunca tinha sido recalibrado desde
  // a Sprint original do Enemy System (antes de qualquer trabalho de
  // balanceamento existir no projeto). Reduzido na mesma proporção
  // aplicada a Wolf/Goblin na Sprint de Gameplay Balance, pra tirar
  // "região impossível" da lista de recomendações automáticas.
  {
    id: "skeleton",
    name: "Skeleton",
    region: "ruinas-esquecidas",
    levelRange: { min: 10, max: 30 },
    archetype: "undead",
    lootIdentityId: "skeleton",
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 11 (balanceamento): medido empiricamente (Simulador,
    // execuções forçadas da Dungeon) que o personagem estabiliza num
    // patamar de vida persistente de ~30-40% do máximo em Ruínas
    // Esquecidas (a regeneração entre encontros/checkpoints nunca
    // alcança recuperar mais que isso) — margem estreita demais pra
    // sobreviver às dezenas de encontros que a travessia de uma Dungeon
    // completa exige, eventualmente zerada por um pico de dano azarado
    // ("gambler's ruin"). `strength`/growth.strength reduzidos (~30%,
    // mesma técnica de redução aplicada a Wolf/Goblin na Sprint de
    // Gameplay Balance) — objetivo: elevar o patamar de vida estável
    // pra reduzir a chance acumulada de morte numa sessão longa, sem
    // tornar o Skeleton trivial (vitality/intelligence intocados).
    baseStats: { strength: 3, dexterity: 3, intelligence: 3, vitality: 7 },
    growth: { strength: 0.25, dexterity: 0.2, intelligence: 0.3, vitality: 0.7 },
    futureFlags: {}
  },
  {
    id: "bandit",
    name: "Bandit",
    region: "colinas-aridas",
    levelRange: { min: 15, max: 40 },
    archetype: "bandit",
    lootIdentityId: "bandit",
    baseStats: { strength: 10, dexterity: 14, intelligence: 4, vitality: 10 },
    growth: { strength: 1, dexterity: 1.3, intelligence: 0.3, vitality: 1 },
    futureFlags: {}
  },
  // Requisito 2 — "Identidade de Monstros" das Colinas Áridas: Hiena
  // nova, mesmo patamar de poder do Bandit já existente na região
  // (rápida e frágil, em vez de tática/organizada).
  {
    id: "hyena",
    name: "Hyena",
    region: "colinas-aridas",
    levelRange: { min: 15, max: 45 },
    archetype: "beast",
    lootIdentityId: "hyena",
    baseStats: { strength: 8, dexterity: 16, intelligence: 2, vitality: 8 },
    growth: { strength: 0.8, dexterity: 1.4, intelligence: 0.1, vitality: 0.8 },
    futureFlags: {}
  },
  {
    id: "bandit_captain",
    name: "Bandit Captain",
    region: "colinas-aridas",
    levelRange: { min: 20, max: 45 },
    archetype: "bandit",
    lootIdentityId: "bandit_captain",
    baseStats: { strength: 16, dexterity: 18, intelligence: 6, vitality: 16 },
    growth: { strength: 1.5, dexterity: 1.6, intelligence: 0.4, vitality: 1.5 },
    criticalMultiplier: 1.7,
    // Requisito 6 — já nasce marcado como candidato a Champion; nenhuma
    // lógica real lê isso ainda.
    futureFlags: { championEligible: true }
  },
  // Requisito 1/2 — Bioma novo (Minas Abandonadas, ver worldencounter/
  // biomes.ts): "constructos de pedra animados" (docs/world-design/
  // regions.md) — Enemy Template novo, nível 12-25 (nunca testado por
  // simulação antes desta Sprint, ver worldencounter/worldEncounter.test.ts).
  {
    id: "stone-construct",
    name: "Stone Construct",
    region: "minas-abandonadas",
    levelRange: { min: 12, max: 25 },
    archetype: "construct",
    lootIdentityId: "stone-construct",
    baseStats: { strength: 14, dexterity: 6, intelligence: 2, vitality: 16 },
    growth: { strength: 1.2, dexterity: 0.4, intelligence: 0.1, vitality: 1.4 },
    futureFlags: {}
  },
  {
    id: "boss",
    name: "Boss",
    region: "fortaleza-sombria",
    levelRange: { min: 20, max: 80 },
    archetype: "boss",
    lootIdentityId: "boss",
    baseStats: { strength: 40, dexterity: 20, intelligence: 20, vitality: 60 },
    growth: { strength: 4, dexterity: 2, intelligence: 2, vitality: 6 },
    criticalMultiplier: 2,
    futureFlags: { isBoss: true, seasonModifierEligible: true, mapModifierEligible: true }
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2: "exatamente
  // UM Mini-Boss por bioma... não criar sistema novo, são apenas Enemy
  // Templates especiais." Colinas Áridas reaproveita bandit_captain (já
  // existia, já marcado championEligible — ver worldencounter/
  // encounterTables.ts, `miniBossTemplateId: "bandit_captain"`); os
  // outros 5 biomas ganham um template novo aqui, mesmo mecanismo de
  // sempre (arquétipo reaproveitado, nenhum novo criado). Poder
  // deliberadamente acima do inimigo comum da região (~1.8-2x), mas bem
  // abaixo do Boss final de fortaleza-sombria (que continua o único
  // `isBoss: true` do jogo).
  {
    id: "wolf-alpha",
    name: "Lobo Alfa",
    region: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    archetype: "beast",
    lootIdentityId: "wolf-alpha",
    baseStats: { strength: 5, dexterity: 8, intelligence: 2, vitality: 6 },
    growth: { strength: 0.5, dexterity: 0.55, intelligence: 0.15, vitality: 0.5 },
    criticalMultiplier: 1.6,
    futureFlags: {}
  },
  {
    id: "swamp-witch",
    name: "Bruxa do Charco",
    region: "pantano-podre",
    levelRange: { min: 1, max: 18 },
    archetype: "mage",
    lootIdentityId: "swamp-witch",
    baseStats: { strength: 5, dexterity: 6, intelligence: 8, vitality: 6 },
    growth: { strength: 0.5, dexterity: 0.5, intelligence: 0.6, vitality: 0.5 },
    criticalMultiplier: 1.6,
    futureFlags: {}
  },
  {
    id: "ancient-construct",
    name: "Construto Anci\xE3o",
    region: "minas-abandonadas",
    levelRange: { min: 12, max: 25 },
    archetype: "construct",
    lootIdentityId: "ancient-construct",
    baseStats: { strength: 20, dexterity: 8, intelligence: 4, vitality: 24 },
    growth: { strength: 1.6, dexterity: 0.5, intelligence: 0.15, vitality: 1.8 },
    criticalMultiplier: 1.5,
    futureFlags: {}
  },
  {
    id: "forgotten-guardian",
    name: "Guardi\xE3o Esquecido",
    region: "ruinas-esquecidas",
    levelRange: { min: 10, max: 30 },
    archetype: "undead",
    lootIdentityId: "forgotten-guardian",
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 11 (balanceamento): medido empiricamente que o Chefe
    // Final nunca era derrotado (0/8 vitórias numa amostra de 50
    // Dungeons forçadas) — o personagem chega ao encontro já desgastado
    // por uma jornada de ~150-200 encontros (ver expeditions/
    // expeditionDefinitions.ts), e a diferença de poder original
    // (~4x o Skeleton comum) era grande demais pra esse estado.
    // strength/growth.strength reduzidos (~25%, mesma técnica já usada
    // em Skeleton/Wolf/Goblin) — continua sendo um Mini-Boss real
    // (ainda ~3x o Skeleton comum), só não uma parede intransponível.
    //
    // Balance, Pacing & Player Experience Phase I — Fase 3 (Boss): "HP;
    // dano." Mesmo após o corte de 25% acima, o diagnóstico desta
    // Sprint (before/quickCheck, combinando todas as amostras) mediu
    // 0/17 vitórias contra o Chefe — o corte anterior ainda não foi o
    // bastante pra um personagem que sobrevive a ~150-220 encontros
    // consecutivos sem descanso completo entre eles. Reduzido mais uma
    // vez (~15% adicional em strength/vitality/growth) — continua acima
    // do Skeleton comum (não trivial), mas não mais uma parede
    // matematicamente intransponível pro estado desgastado em que o
    // personagem realmente chega até ele.
    // Boss Accessibility & Endgame Balance Phase I — Fase 3 (Enemy
    // Templates): "HP; dano." Diagnóstico (bossaccess-before-dungeon-
    // report.md, 500 Dungeons): HP médio do jogador ao AVISTAR o Chefe
    // é de apenas 11% (Estado do Personagem, capturado ao vivo no exato
    // tick do encontro) — o jogador chega esgotado pela jornada, não
    // "perde uma luta justa". Reduzido HP (vitality 11->8, growth
    // 1.0->0.75) e dano (strength 7.5->6, growth 0.65->0.5) mais uma
    // vez. Efeito medido: HP restante do Boss quando o jogador perde
    // caiu de ~48% pra ~34-40% (o jogador causa mais dano relativo
    // antes de morrer) — mas a taxa de vitória permaneceu em 0% em
    // TODAS as amostras testadas (150 a 400 Dungeons, múltiplas
    // configurações). Investigado: com HP de chegada tão baixo (5-11%),
    // qualquer troca de golpes tende a matar o jogador antes de sua
    // própria ação valer — um limite estrutural do estado de chegada,
    // não da força do Chefe em si (Combat Engine/Adventure Loop, que
    // decidem a ordem de ataque, estão fora do escopo desta Sprint).
    // Mantido este corte (melhora real e mensurável de "HP do Boss ao
    // perder", mesmo sem cruzar pra vitória) — reverter não
    // desfaria o gargalo raiz. Ver "Recomendações" na entrega final.
    baseStats: { strength: 6, dexterity: 7, intelligence: 9, vitality: 8 },
    growth: { strength: 0.5, dexterity: 0.5, intelligence: 0.8, vitality: 0.75 },
    criticalMultiplier: 1.6,
    futureFlags: {}
  },
  {
    id: "dark-knight",
    name: "Cavaleiro Negro",
    region: "fortaleza-sombria",
    levelRange: { min: 20, max: 80 },
    archetype: "humanoid",
    lootIdentityId: "dark-knight",
    baseStats: { strength: 24, dexterity: 16, intelligence: 8, vitality: 30 },
    growth: { strength: 2, dexterity: 1, intelligence: 0.3, vitality: 2.4 },
    criticalMultiplier: 1.8,
    futureFlags: {}
  }
];
function getEnemyTemplate(id) {
  return ENEMY_TEMPLATES.find((template) => template.id === id);
}

// packages/shared/src/enemy/enemyStats.ts
function asCharacterClassDefinition(template) {
  return {
    id: template.id,
    name: template.name,
    startingAttributes: template.baseStats,
    growthPerLevel: template.growth
  };
}
function computeEnemyBaseAttributes(template, level) {
  return computeBaseAttributes(asCharacterClassDefinition(template), level);
}
function computeEnemyDerivedAttributes(template, level) {
  return calculateDerivedAttributes(computeEnemyBaseAttributes(template, level));
}
var EMPTY_ENEMY_RESISTANCES = { physical: 0, fire: 0, cold: 0, lightning: 0 };
function computeEnemyFinalStats(template, level) {
  const derived = computeEnemyDerivedAttributes(template, level);
  return { ...derived, lifeLeech: 0, resistances: { ...EMPTY_ENEMY_RESISTANCES } };
}

// packages/shared/src/enemy/instance.ts
function spawnEnemy(template, seed, level, options = {}) {
  if (level < template.levelRange.min || level > template.levelRange.max) {
    throw new Error(
      `Enemy System: n\xEDvel ${level} fora do levelRange do template "${template.id}" (${template.levelRange.min}-${template.levelRange.max})`
    );
  }
  const finalStats = computeEnemyFinalStats(template, level);
  const lifeMultiplier = options.statMultipliers?.life ?? 1;
  const maximumLife = finalStats.maximumLife * lifeMultiplier;
  return {
    instanceId: `${template.id}-${seed}`,
    templateId: template.id,
    seed,
    level,
    currentLife: maximumLife,
    maximumLife,
    alive: true,
    spawnTime: options.spawnTime ?? Date.now(),
    position: options.position ?? null,
    futureState: options.variant ? { variant: options.variant, statMultipliers: options.statMultipliers } : {}
  };
}
function killEnemy(instance, template, deathTime = Date.now()) {
  if (!instance.alive) {
    throw new Error(`Enemy System: inst\xE2ncia "${instance.instanceId}" j\xE1 est\xE1 morta`);
  }
  if (instance.templateId !== template.id) {
    throw new Error(
      `Enemy System: template "${template.id}" n\xE3o corresponde \xE0 inst\xE2ncia "${instance.instanceId}" (templateId "${instance.templateId}")`
    );
  }
  return {
    instance: { ...instance, alive: false, currentLife: 0 },
    deathTime,
    lootIdentityId: template.lootIdentityId
  };
}
function applyCombatResultToEnemy(instance, result) {
  return { ...instance, currentLife: result.remainingLife };
}

// packages/shared/src/enemy/combatant.ts
function toCombatant(instance, template) {
  const finalStats = computeEnemyFinalStats(template, instance.level);
  const damageMultiplier = instance.futureState.statMultipliers?.damage ?? 1;
  return {
    finalStats: damageMultiplier === 1 ? finalStats : { ...finalStats, physicalDamage: finalStats.physicalDamage * damageMultiplier },
    criticalMultiplier: template.criticalMultiplier ?? ENEMY_DEFAULT_CRITICAL_MULTIPLIER,
    currentLife: instance.currentLife
  };
}

// packages/shared/src/worldencounter/eliteModifiers.ts
var ELITE_MODIFIER = {
  id: "elite",
  namePrefix: "Elite",
  lifeMultiplier: 3,
  damageMultiplier: 2.2,
  xpMultiplier: 3,
  lootRarityMultiplier: 2,
  auraColor: "#ff8c1a",
  auraIcon: "\u2726"
};
var VARIANT_XP_MULTIPLIERS = {
  elite: ELITE_MODIFIER.xpMultiplier,
  miniboss: 6
};
var MINIBOSS_AURA = { color: "#ffd700", icon: "\u{1F451}" };

// packages/shared/src/enemy/lootIntegration.ts
var MINIBOSS_GOLD_SEED_OFFSET = 909;
var MINIBOSS_GOLD_MIN = 40;
var MINIBOSS_GOLD_MAX = 120;
function generateLootForKilledEnemy(killResult, instance, seed) {
  const variant = instance.futureState.variant;
  const result = variant === "elite" ? generateMonsterLoot(killResult.lootIdentityId, instance.level, seed, {
    dropChanceOverride: 1,
    minimumQuantity: 1,
    rarityMultiplierBonus: ELITE_MODIFIER.lootRarityMultiplier
  }) : generateMonsterLoot(killResult.lootIdentityId, instance.level, seed);
  if (!variant) {
    return result;
  }
  const generatedItems = result.generatedItems.map((item) => ({
    ...item,
    sourceVariant: variant,
    sourceEnemyTemplateId: instance.templateId
  }));
  if (variant !== "miniboss") {
    return { ...result, generatedItems };
  }
  const goldRng = createSeededRandom(seed + MINIBOSS_GOLD_SEED_OFFSET);
  const goldAmount = randomInt(goldRng, MINIBOSS_GOLD_MIN, MINIBOSS_GOLD_MAX);
  return {
    ...result,
    generatedItems,
    currencies: [...result.currencies, { type: "gold", amount: goldAmount }]
  };
}

// packages/shared/src/worldencounter/config.ts
var WORLD_ENCOUNTER_CONFIG = {
  // Variação aleatória em torno do nível do jogador ao rolar o nível
  // de um grupo do encontro — mesmo princípio do `itemLevelVariance`
  // do Loot Generator, só que um valor único do sistema (a Encounter
  // Table não declara um por região nesta fase).
  levelVariance: 2
};

// packages/shared/src/worldencounter/encounterTables.ts
var ENCOUNTER_TABLES = [
  // Biomes, Regions & World Progression Phase I — requisito 2:
  // Lobo continua maioria (preserva o balanceamento já calibrado na
  // Sprint de Gameplay Balance — mesmo peso relativo de antes, só
  // redistribuído pra abrir espaço pros dois novos); Javali/Aranha
  // entram como minoria, mesmo patamar de poder (ver enemy/templates.ts).
  {
    regionId: "bosque-sussurrante",
    levelRange: { min: 1, max: 14 },
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 2/3:
    // exemplo literal da Sprint (Normal 95%/Elite 4%/MiniBoss 1%).
    // Mini-Boss: Lobo Alfa (novo Enemy Template, ver enemy/templates.ts).
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "wolf-alpha",
    entries: [
      {
        enemyTemplateId: "wolf",
        weight: 60,
        minimumLevel: 1,
        maximumLevel: 14,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {}
      },
      {
        enemyTemplateId: "boar",
        weight: 25,
        minimumLevel: 1,
        maximumLevel: 14,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {}
      },
      {
        enemyTemplateId: "spider",
        weight: 15,
        minimumLevel: 1,
        maximumLevel: 14,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {}
      }
    ]
  },
  {
    regionId: "pantano-podre",
    // Vertical Slice — Player Journey, Retention & First Hour Experience
    // Phase I — Fase 3 ("Progressão regional"): min subiu de 1 pra 5.
    // Reordenar BIOME_PROGRESSION (biomes.ts) pra tirar colinas-aridas
    // do caminho crítico até o Boss colocou pântano-podre logo depois
    // de bosque-sussurrante (`order` 2) — como o gate original (nível 1)
    // já era trivialmente satisfeito desde o personagem nascer, o
    // desbloqueio disparava JÁ NA 1ª tick (checkRegionUnlock roda a
    // cada tick, ver worldencounter/regionProgression.ts), esvaziando
    // bosque-sussurrante como experiência real da 1ª hora — descoberto
    // via testes que dependiam do timing antigo (expeditions.test.ts).
    // Nível 5 dá um espaço real de jogo em bosque antes da transição
    // (~10-20min pelo ritmo já medido em before-adventures-report.md),
    // continua bem abaixo do antigo gate de colinas-aridas (15).
    levelRange: { min: 5, max: 18 },
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Mini-Boss: Bruxa do Charco (novo Enemy Template).
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "swamp-witch",
    entries: [
      {
        enemyTemplateId: "goblin",
        weight: 100,
        minimumLevel: 1,
        maximumLevel: 18,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {}
      }
    ]
  },
  // Biomes, Regions & World Progression Phase I — requisito 9: a
  // simulação de longa duração (progressão automática de biomas,
  // ver simulation/) mediu 100% de taxa de morte pra quem alcança
  // Ruínas Esquecidas — "região impossível", exatamente o que o
  // requisito 9 pede pra evitar. Causa: até 2 slots x 3 Skeletons = até
  // 6 inimigos sequenciais no mesmo encontro, sem regeneração de vida
  // entre eles (Adventure Loop não regenera dentro de um encontro) —
  // o mesmo "gauntlet" identificado e corrigido pra bosque-sussurrante/
  // pantano-podre na Sprint de Gameplay Balance, nunca replicado aqui
  // até agora. Corrigido com a MESMA técnica: reduzir o tamanho médio
  // do grupo (mesma calibração, dado apenas).
  {
    regionId: "ruinas-esquecidas",
    levelRange: { min: 10, max: 30 },
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 11 (balanceamento): o 2º slot (20% de chance de "1
    // Skeleton + 2 Skeletons" sequenciais, até 4 inimigos sem
    // recuperação entre eles — o mesmo "gauntlet" já documentado)
    // mostrou-se insustentável numa Dungeon que precisa atravessar
    // dezenas de encontros aqui sem morrer (medido empiricamente: 80%
    // das mortes em execuções forçadas da Dungeon aconteciam
    // especificamente em Ruínas Esquecidas). Removido o 2º slot —
    // sempre 1 grupo por encontro agora (até 2 Skeletons, nunca 4),
    // mesma técnica de redução de grupo já usada nesta região desde a
    // Sprint de Biomas.
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Mini-Boss: Guardião Esquecido (novo Enemy Template).
    //
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 2: "Guardião Esquecido" reaproveitado EXATAMENTE como já
    // existia (mesmo Enemy Template, mesma região, "Boss deve ser apenas
    // um EnemyTemplate" — nenhum novo template criado) vira o Chefe
    // Final da nova Dungeon (ver dungeon/). 0.01 (1%) era calibrado pra
    // um encontro OCASIONAL num bioma qualquer — insuficiente pra um
    // "Chefe Final" confiável ao longo de uma Dungeon inteira (medido
    // empiricamente: ~0.2 ocorrências esperadas nos ~20 encontros de
    // Ruínas Esquecidas de uma Expedição comum). Recalibrado pra 0.08
    // (~83% de chance de ao menos 1 ocorrência em 20 encontros),
    // verificado via Simulador antes da entrega. Efeito colateral aceito
    // conscientemente: qualquer aventura (dungeon ou não) em Ruínas
    // Esquecidas agora encontra o Guardião Esquecido com mais frequência
    // — puramente dado, nenhuma lógica nova, mesma convenção de
    // calibração já usada em todo o projeto.
    //
    // Balance, Pacing & Player Experience Phase I — Fase 3 (MiniBosses):
    // "frequência." Diagnóstico (before-dungeon-report.md, 100 Dungeons):
    // o Chefe Final (mesmo template, mesma role de Mini-Boss aqui) só
    // apareceu em 5% das execuções — quase ninguém sequer chega a
    // enfrentá-lo, o oposto de "clímax da Dungeon". Aumentado de 0.08
    // para 0.14 (~95% de chance de ao menos 1 ocorrência ao longo dos
    // ~20-40 encontros que uma Dungeon tipicamente passa nesta região,
    // versus ~83% antes) — mesma técnica de cálculo já documentada
    // acima quando 0.08 foi escolhido.
    //
    // Boss Accessibility & Endgame Balance Phase I — Fase 3
    // (Encounter Tables): "frequência." Diagnóstico (bossaccess-before-
    // dungeon-report.md, 500 Dungeons): mesmo com 0.14 e uma permanência
    // média de ~430 ticks em Ruínas Esquecidas — o bastante pra uma
    // chance teórica de ~99.9997% de ao menos 1 ocorrência — só 3% das
    // execuções realmente avistaram o Chefe. Investigado a fundo
    // (scripts de diagnóstico descartados após o uso): a sequência de
    // seeds `session.seed + encountersCompleted` (consecutiva dentro de
    // UMA sessão, formato documentado em presentationLayer.ts) produz
    // uma taxa de acerto real muito menor que a teórica pra rolagens
    // raras ao longo de centenas de chamadas consecutivas — o MESMO
    // tipo de correlação de seed já documentado (Sprints de Facções/
    // Dungeon) pra seeds pequenas e próximas ENTRE execuções do
    // Simulador, só que aqui acontece DENTRO da própria sequência real
    // de jogo (itemgen/rng.ts, fora do escopo desta Sprint — nenhuma
    // lógica alterada). Não é possível corrigir a causa raiz sem tocar
    // nessa lógica; a correção disponível dentro do escopo é compensar
    // empiricamente subindo a probabilidade nominal. Testado via
    // Simulador: 0.35 eleva a taxa de chegada real de ~3% pra ~19-20%
    // (medido em amostras de 150-400 Dungeons) — ainda não 1:1 com o
    // valor nominal (a supressão real permanece, só atenuada), mas uma
    // melhora grande e mensurável, o critério de aprovação desta
    // Sprint. Ver "Recomendações" na entrega final.
    variantChances: { elite: 0.04, miniBoss: 0.35 },
    miniBossTemplateId: "forgotten-guardian",
    entries: [
      {
        enemyTemplateId: "skeleton",
        weight: 100,
        minimumLevel: 10,
        maximumLevel: 30,
        minimumGroup: 1,
        // First Dungeon, Final Boss & Complete Game Loop Phase I —
        // requisito 11: reduzido de 2 pra 1 (mesma técnica de "reduzir
        // grupo" já aplicada acima em packSizeOptions) — 2 Skeletons
        // sequenciais na MESMA tick, sem regeneração entre eles (Adventure
        // Loop não regenera dentro de um encontro), produziam os picos de
        // dano que zeravam o personagem numa jornada longa (medido
        // empiricamente via Simulador).
        maximumGroup: 1,
        futureFlags: {}
      }
    ]
  },
  {
    regionId: "colinas-aridas",
    levelRange: { min: 15, max: 45 },
    // Vertical Slice — Player Journey, Retention & First Hour Experience
    // Phase I — Fase 3 (Encounter Tables): reordenar BIOME_PROGRESSION
    // (biomes.ts) tirou colinas-aridas do caminho crítico até o Boss,
    // mas ela passou a ser visitada MAIS TARDE (depois de Ruínas
    // Esquecidas) em vez de logo após o Bosque — um personagem chega
    // aqui já num nível bem mais alto que o original (~15-20) previa.
    // Medido empiricamente (quickCheck): 100% de taxa de morte (antes:
    // 8%), causa quase toda "encontro normal" — o mesmo "gauntlet"
    // (múltiplos inimigos sequenciais na mesma tick, sem regeneração
    // entre eles) já identificado e corrigido em bosque-sussurrante/
    // pantano-podre/ruínas-esquecidas em Sprints anteriores, nunca
    // replicado aqui até agora. Corrigido com a MESMA técnica: só 1
    // slot por encontro (nunca mais "2 Goblins + 1 Bandit" no mesmo
    // encontro) e Bandit/Hyena reduzidos de até 3/2 pra até 1 cada
    // (1ª tentativa, reduzir só pra 2, não foi suficiente — medido
    // novamente, ainda 100%).
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Mini-Boss: Bandit Captain reaproveitado (já existia, já
    // championEligible — ver enemy/templates.ts) — nenhum template novo
    // criado pra Colinas Áridas.
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "bandit_captain",
    entries: [
      {
        enemyTemplateId: "bandit",
        weight: 80,
        minimumLevel: 15,
        maximumLevel: 40,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: {}
      },
      {
        enemyTemplateId: "bandit_captain",
        weight: 15,
        minimumLevel: 20,
        maximumLevel: 45,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: { elitePackEligible: true }
      },
      // Requisito 2 — Hiena: nova, mesmo patamar de poder do Bandit
      // raso (ver enemy/templates.ts).
      {
        enemyTemplateId: "hyena",
        weight: 25,
        minimumLevel: 15,
        maximumLevel: 45,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: {}
      }
    ]
  },
  // Biomes, Regions & World Progression Phase I — requisito 1: bioma
  // novo (Minas Abandonadas — reaproveita a região real já documentada
  // em docs/world-design/regions.md como equivalente de "Cavernas
  // Antigas", nenhuma região nova inventada fora do que já existe no
  // grafo — ver worldencounter/biomes.ts). Nível 12-25 (mesma faixa do
  // documento). Nunca testada por simulação antes desta Sprint.
  {
    regionId: "minas-abandonadas",
    levelRange: { min: 12, max: 25 },
    packSizeOptions: [
      { slots: 1, weight: 70 },
      { slots: 2, weight: 30 }
    ],
    // Mini-Boss: Construto Ancião (novo Enemy Template).
    variantChances: { elite: 0.04, miniBoss: 0.01 },
    miniBossTemplateId: "ancient-construct",
    entries: [
      {
        enemyTemplateId: "stone-construct",
        weight: 70,
        minimumLevel: 12,
        maximumLevel: 25,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {}
      },
      // Skeleton reaproveitado (mesmo Enemy Template de Ruínas
      // Esquecidas — "mortos-vivos" também aparecem nas Minas per
      // docs/world-design/regions.md) — nenhum template duplicado.
      {
        enemyTemplateId: "skeleton",
        weight: 30,
        minimumLevel: 12,
        maximumLevel: 25,
        minimumGroup: 1,
        maximumGroup: 2,
        futureFlags: {}
      }
    ]
  },
  {
    regionId: "fortaleza-sombria",
    // "Faixa da região" mais estreita que a "Faixa do template" (Boss
    // vai de 20-80 no Enemy Template) — demonstra os dois clamps
    // sendo genuinamente diferentes (requisito 3).
    //
    // First Dungeon, Final Boss & Complete Game Loop Phase I — nota:
    // investigado (e revertido) baixar este limiar pra "encurtar" a
    // jornada até o Chefe Final — descartado: o EnemyTemplate "boss"
    // (baseStats.strength 40, growth.strength 4) foi claramente
    // calibrado pra um personagem MUITO acima do nível 20 (medido
    // empiricamente: um personagem recém-chegado nesta região morre
    // quase sempre). A solução correta (ver expeditions/
    // expeditionDefinitions.ts: "queda-da-fortaleza-sombria") foi
    // dimensionar `expectedEncounters` da Dungeon pra concluir LOGO
    // DEPOIS de derrotar o Guardião Esquecido em Ruínas Esquecidas —
    // nunca exigindo que a Dungeon force o personagem a entrar aqui.
    levelRange: { min: 60, max: 80 },
    packSizeOptions: [{ slots: 1, weight: 100 }],
    // Requisito 3 — "configurável por bioma": Elite fica em 0 aqui de
    // propósito — a única entry desta região já é o Boss final
    // (isBoss: true); multiplicar o Boss final por um modificador de
    // Elite produziria um "Elite Boss" absurdamente acima do que o
    // Enemy System já calibra pra ele. Mini-Boss: Cavaleiro Negro (novo
    // Enemy Template, mais forte que qualquer inimigo comum mas bem
    // abaixo do Boss final).
    variantChances: { elite: 0, miniBoss: 0.02 },
    miniBossTemplateId: "dark-knight",
    entries: [
      {
        enemyTemplateId: "boss",
        weight: 100,
        minimumLevel: 20,
        maximumLevel: 80,
        minimumGroup: 1,
        maximumGroup: 1,
        futureFlags: { bossPackEligible: true }
      }
    ]
  }
];
function getEncounterTable(regionId) {
  return ENCOUNTER_TABLES.find((table) => table.regionId === regionId);
}

// packages/shared/src/worldevents/worldEventTables.ts
var EXPLORATION_EVENT_TABLES = [
  {
    regionId: "bosque-sussurrante",
    chance: 0.08,
    entries: [
      { eventId: "abandoned-chest", weight: 40 },
      { eventId: "destroyed-cart", weight: 30 },
      { eventId: "lost-merchant", weight: 25 },
      { eventId: "traveler", weight: 15 },
      { eventId: "trade-camp", weight: 10 },
      { eventId: "ancient-altar", weight: 20 },
      { eventId: "sacred-fountain", weight: 10 },
      { eventId: "ambush", weight: 10 },
      { eventId: "hunters", weight: 8 },
      { eventId: "lost-diary", weight: 8 }
    ]
  },
  {
    regionId: "pantano-podre",
    chance: 0.08,
    entries: [
      { eventId: "ambush", weight: 40 },
      { eventId: "hunters", weight: 30 },
      { eventId: "abandoned-chest", weight: 15 },
      { eventId: "lost-merchant", weight: 15 },
      { eventId: "ancient-altar", weight: 8 },
      { eventId: "lost-diary", weight: 10 }
    ]
  },
  {
    regionId: "colinas-aridas",
    chance: 0.07,
    entries: [
      { eventId: "lost-merchant", weight: 30 },
      { eventId: "traveler", weight: 25 },
      { eventId: "trade-camp", weight: 20 },
      { eventId: "destroyed-cart", weight: 15 },
      { eventId: "abandoned-chest", weight: 10 },
      { eventId: "hostile-patrol", weight: 20 },
      { eventId: "ambush", weight: 15 },
      { eventId: "lost-diary", weight: 8 }
    ]
  },
  {
    regionId: "minas-abandonadas",
    chance: 0.07,
    entries: [
      { eventId: "ancient-ruins", weight: 25 },
      { eventId: "monument", weight: 15 },
      { eventId: "lost-diary", weight: 15 },
      { eventId: "forgotten-treasure", weight: 20 },
      { eventId: "abandoned-chest", weight: 15 },
      { eventId: "trade-camp", weight: 10 },
      { eventId: "rune-stone", weight: 10 },
      { eventId: "hostile-patrol", weight: 10 }
    ]
  },
  {
    regionId: "ruinas-esquecidas",
    chance: 0.09,
    entries: [
      { eventId: "ancient-ruins", weight: 35 },
      { eventId: "monument", weight: 20 },
      { eventId: "lost-diary", weight: 15 },
      { eventId: "forgotten-treasure", weight: 30 },
      { eventId: "abandoned-chest", weight: 15 },
      { eventId: "sacred-fountain", weight: 15 },
      { eventId: "rune-stone", weight: 15 }
    ]
  },
  {
    regionId: "fortaleza-sombria",
    chance: 0.04,
    entries: [
      { eventId: "hostile-patrol", weight: 30 },
      { eventId: "forgotten-treasure", weight: 15 },
      { eventId: "rune-stone", weight: 10 },
      { eventId: "monument", weight: 10 },
      { eventId: "ancient-altar", weight: 10 }
    ]
  }
];
function getExplorationEventTable(regionId) {
  return EXPLORATION_EVENT_TABLES.find((table) => table.regionId === regionId);
}

// packages/shared/src/worldevents/worldEventDefinitions.ts
var EXPLORATION_EVENT_DEFINITIONS = [
  // Treasure — requisito 2: "Baú Abandonado, Carroça Destruída, Tesouro
  // Esquecido."
  {
    id: "abandoned-chest",
    name: "Ba\xFA Abandonado",
    description: "Um ba\xFA de madeira, meio enterrado, esquecido por algum viajante.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas",
      "fortaleza-sombria"
    ],
    weight: 100,
    category: "treasure",
    difficulty: "Nenhuma",
    reward: { lootTableId: "treasure_chest", goldAmount: 20 }
  },
  {
    id: "destroyed-cart",
    name: "Carro\xE7a Destru\xEDda",
    description: "Os restos de uma carro\xE7a de mercador, saqueada h\xE1 tempos.",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas", "pantano-podre"],
    weight: 80,
    category: "treasure",
    difficulty: "Nenhuma",
    reward: { lootTableId: "treasure_chest", goldAmount: 15 }
  },
  {
    id: "forgotten-treasure",
    name: "Tesouro Esquecido",
    description: "Um esconderijo antigo, coberto de poeira e teias \u2014 ningu\xE9m vem aqui h\xE1 gera\xE7\xF5es.",
    allowedBiomes: ["ruinas-esquecidas", "minas-abandonadas", "fortaleza-sombria"],
    weight: 60,
    category: "treasure",
    difficulty: "Nenhuma",
    reward: { lootTableId: "treasure_chest", goldAmount: 40 }
  },
  // Merchant — requisito 2: "Mercador Perdido, Viajante, Acampamento
  // Comercial." "Nesta Sprint apenas gera recompensas. Sem interface de
  // compra" — ouro direto, sem loja.
  {
    id: "lost-merchant",
    name: "Mercador Perdido",
    description: "Um mercador que se perdeu do caminho, grato por companhia \u2014 divide o que tem.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas"
    ],
    weight: 100,
    category: "merchant",
    difficulty: "Nenhuma",
    reward: { goldAmount: 30 }
  },
  {
    id: "traveler",
    name: "Viajante",
    description: "Um viajante solit\xE1rio, disposto a trocar hist\xF3rias e um pouco de ouro.",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas"],
    weight: 80,
    category: "merchant",
    difficulty: "Nenhuma",
    reward: { goldAmount: 20 }
  },
  {
    id: "trade-camp",
    name: "Acampamento Comercial",
    description: "Um pequeno acampamento de comerciantes, de passagem entre regi\xF5es.",
    allowedBiomes: ["colinas-aridas", "bosque-sussurrante", "minas-abandonadas"],
    weight: 50,
    category: "merchant",
    difficulty: "Nenhuma",
    reward: { goldAmount: 50 }
  },
  // Shrine — requisito 2: "Altar Antigo, Fonte Sagrada, Pedra Rúnica."
  // "Pode conceder: recuperação, XP, ouro" — cada um combina um
  // subconjunto diferente (variedade via dado, nunca lógica nova).
  //
  // Boss Accessibility & Endgame Balance Phase I — Fase 3
  // (Configurações): `recoveryAmount` era um valor fixo pequeno (30/20)
  // frente à vida máxima típica ao avistar o Chefe (~360, Estado do
  // Personagem, bossaccess-before-dungeon-report.md) — uma fração
  // pequena demais pra realmente aliviar a exaustão da jornada.
  // Aumentado (30->120, 20->100). Testado via Simulador: contribuição
  // real pequena isoladamente (Shrine é raro e não garante acontecer
  // logo antes do Chefe), mas mantido — nenhuma regressão medida em
  // nenhuma métrica, e ajuda genuinamente quem o encontra.
  {
    id: "ancient-altar",
    name: "Altar Antigo",
    description: "Um altar de pedra coberto de musgo, ainda emanando um calor reconfortante.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas",
      "fortaleza-sombria"
    ],
    weight: 100,
    category: "shrine",
    difficulty: "Nenhuma",
    reward: { recoveryAmount: 120 }
  },
  {
    id: "sacred-fountain",
    name: "Fonte Sagrada",
    description: "\xC1gua cristalina brota de uma fonte esculpida \u2014 beber dela revigora corpo e mente.",
    allowedBiomes: ["bosque-sussurrante", "ruinas-esquecidas"],
    weight: 60,
    category: "shrine",
    difficulty: "Nenhuma",
    reward: { recoveryAmount: 100, xpAmount: 25 }
  },
  {
    id: "rune-stone",
    name: "Pedra R\xFAnica",
    description: "Uma pedra gravada com runas antigas, pulsando com um brilho fraco.",
    allowedBiomes: ["ruinas-esquecidas", "minas-abandonadas", "fortaleza-sombria"],
    weight: 50,
    category: "shrine",
    difficulty: "Nenhuma",
    reward: { xpAmount: 30, goldAmount: 10 }
  },
  // Ambush — requisito 2: "Emboscada, Patrulha Hostil, Caçadores."
  // "Reutilizar Encounter normal" — `reward` vazia de propósito, o
  // combate real (Enemy System/Loot Generator, já existentes) concede
  // tudo através dos mecanismos de abate normais.
  {
    id: "ambush",
    name: "Emboscada",
    description: "Inimigos saltam da vegeta\xE7\xE3o, sem aviso \u2014 n\xE3o h\xE1 tempo pra hesitar.",
    allowedBiomes: ["pantano-podre", "bosque-sussurrante", "colinas-aridas"],
    weight: 100,
    category: "ambush",
    difficulty: "Normal",
    reward: {},
    consequence: "Combate imediato, sem chance de recuar."
  },
  {
    id: "hostile-patrol",
    name: "Patrulha Hostil",
    description: "Uma patrulha armada bloqueia o caminho \u2014 n\xE3o parecem dispostos a negociar.",
    allowedBiomes: ["colinas-aridas", "fortaleza-sombria", "minas-abandonadas"],
    weight: 70,
    category: "ambush",
    difficulty: "Normal",
    reward: {},
    consequence: "Combate imediato, sem chance de recuar."
  },
  {
    id: "hunters",
    name: "Ca\xE7adores",
    description: "Um grupo de ca\xE7adores confunde voc\xEA com presa f\xE1cil.",
    allowedBiomes: ["pantano-podre", "bosque-sussurrante"],
    weight: 60,
    category: "ambush",
    difficulty: "Normal",
    reward: {},
    consequence: "Combate imediato, sem chance de recuar."
  },
  // Discovery — requisito 2: "Ruínas Antigas, Diário Perdido,
  // Monumento." "Concedem progresso exploratório" — XP direto, sem
  // combate/loot.
  {
    id: "ancient-ruins",
    name: "Ru\xEDnas Antigas",
    description: "Colunas quebradas e paredes desmoronadas \u2014 vest\xEDgios de uma civiliza\xE7\xE3o esquecida.",
    allowedBiomes: ["ruinas-esquecidas", "minas-abandonadas"],
    weight: 100,
    category: "discovery",
    difficulty: "Nenhuma",
    reward: { xpAmount: 35 }
  },
  {
    id: "lost-diary",
    name: "Di\xE1rio Perdido",
    description: "As p\xE1ginas gastas de um di\xE1rio, relatando os \xFAltimos dias de quem o escreveu.",
    allowedBiomes: [
      "bosque-sussurrante",
      "pantano-podre",
      "colinas-aridas",
      "minas-abandonadas",
      "ruinas-esquecidas"
    ],
    weight: 70,
    category: "discovery",
    difficulty: "Nenhuma",
    reward: { xpAmount: 20 }
  },
  {
    id: "monument",
    name: "Monumento",
    description: "Um monumento imponente, entalhado com s\xEDmbolos que ningu\xE9m mais consegue ler.",
    allowedBiomes: ["ruinas-esquecidas", "fortaleza-sombria", "minas-abandonadas"],
    weight: 50,
    category: "discovery",
    difficulty: "Nenhuma",
    reward: { xpAmount: 45 }
  }
];
function getExplorationEventDefinition(id) {
  return EXPLORATION_EVENT_DEFINITIONS.find((definition) => definition.id === id);
}

// packages/shared/src/worldevents/generator.ts
function selectExplorationEvent(rng, table) {
  const triggered = rng() < table.chance;
  if (!triggered) return null;
  const entry = pickWeighted(rng, table.entries);
  const definition = getExplorationEventDefinition(entry.eventId);
  if (!definition) {
    throw new Error(`World Events: evento desconhecido "${entry.eventId}" (tabela da regi\xE3o "${table.regionId}")`);
  }
  return definition;
}

// packages/shared/src/worldencounter/generator.ts
function resolveGroupLevel(rng, playerLevel, regionMin, regionMax, entryMin, entryMax, templateMin, templateMax) {
  const min = Math.max(regionMin, entryMin, templateMin);
  const max = Math.min(regionMax, entryMax, templateMax);
  if (min > max) {
    throw new Error(
      `World Encounter: faixas de n\xEDvel incompat\xEDveis (regi\xE3o [${regionMin}-${regionMax}], entry [${entryMin}-${entryMax}], template [${templateMin}-${templateMax}]) n\xE3o se sobrep\xF5em`
    );
  }
  const raw = playerLevel + randomInt(rng, -WORLD_ENCOUNTER_CONFIG.levelVariance, WORLD_ENCOUNTER_CONFIG.levelVariance);
  return Math.min(max, Math.max(min, raw));
}
function rollVariant(rng, table) {
  const options = [
    { variant: "normal", weight: Math.max(0, 1 - table.variantChances.elite - table.variantChances.miniBoss) },
    { variant: "elite", weight: table.variantChances.elite },
    { variant: "miniboss", weight: table.variantChances.miniBoss }
  ];
  return pickWeighted(rng, options).variant;
}
function buildNormalGroups(rng, table, playerLevel, regionId) {
  const packSlots = pickWeighted(rng, table.packSizeOptions).slots;
  const groups = [];
  for (let slot = 0; slot < packSlots; slot++) {
    const entry = pickWeighted(rng, table.entries);
    const template = getEnemyTemplate(entry.enemyTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template desconhecido "${entry.enemyTemplateId}" (regi\xE3o "${regionId}")`);
    }
    const count = randomInt(rng, entry.minimumGroup, entry.maximumGroup);
    const level = resolveGroupLevel(
      rng,
      playerLevel,
      table.levelRange.min,
      table.levelRange.max,
      entry.minimumLevel,
      entry.maximumLevel,
      template.levelRange.min,
      template.levelRange.max
    );
    const instanceSeeds = [];
    for (let i = 0; i < count; i++) {
      instanceSeeds.push(randomInt(rng, 0, 2147483647));
    }
    groups.push({ enemyTemplateId: entry.enemyTemplateId, level, count, instanceSeeds });
  }
  return groups;
}
function generateEncounter(regionId, playerLevel, seed) {
  const table = getEncounterTable(regionId);
  if (!table) {
    throw new Error(`World Encounter: regi\xE3o sem Encounter Table "${regionId}"`);
  }
  const rng = createSeededRandom(seed);
  const explorationEventTable = getExplorationEventTable(regionId);
  const explorationEvent = explorationEventTable ? selectExplorationEvent(rng, explorationEventTable) : null;
  if (explorationEvent) {
    if (explorationEvent.category === "ambush") {
      const groups = buildNormalGroups(rng, table, playerLevel, regionId);
      return { regionId, seed, groups, variant: "normal", explorationEventId: explorationEvent.id };
    }
    return { regionId, seed, groups: [], variant: "normal", explorationEventId: explorationEvent.id };
  }
  const variant = rollVariant(rng, table);
  if (variant === "miniboss") {
    const template = getEnemyTemplate(table.miniBossTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template de Mini-Boss desconhecido "${table.miniBossTemplateId}" (regi\xE3o "${regionId}")`);
    }
    const level = resolveGroupLevel(
      rng,
      playerLevel,
      table.levelRange.min,
      table.levelRange.max,
      template.levelRange.min,
      template.levelRange.max,
      template.levelRange.min,
      template.levelRange.max
    );
    const instanceSeeds = [randomInt(rng, 0, 2147483647)];
    return {
      regionId,
      seed,
      groups: [{ enemyTemplateId: table.miniBossTemplateId, level, count: 1, instanceSeeds }],
      variant
    };
  }
  if (variant === "elite") {
    const entry = pickWeighted(rng, table.entries);
    const template = getEnemyTemplate(entry.enemyTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template desconhecido "${entry.enemyTemplateId}" (regi\xE3o "${regionId}")`);
    }
    const level = resolveGroupLevel(
      rng,
      playerLevel,
      table.levelRange.min,
      table.levelRange.max,
      entry.minimumLevel,
      entry.maximumLevel,
      template.levelRange.min,
      template.levelRange.max
    );
    const instanceSeeds = [randomInt(rng, 0, 2147483647)];
    return {
      regionId,
      seed,
      groups: [{ enemyTemplateId: entry.enemyTemplateId, level, count: 1, instanceSeeds }],
      variant
    };
  }
  return { regionId, seed, groups: buildNormalGroups(rng, table, playerLevel, regionId), variant };
}

// packages/shared/src/worldencounter/spawn.ts
function spawnWorldEncounter(result) {
  const enemies = [];
  const options = result.variant === "elite" ? { variant: "elite", statMultipliers: { life: ELITE_MODIFIER.lifeMultiplier, damage: ELITE_MODIFIER.damageMultiplier } } : result.variant === "miniboss" ? { variant: "miniboss" } : {};
  for (const group of result.groups) {
    const template = getEnemyTemplate(group.enemyTemplateId);
    if (!template) {
      throw new Error(`World Encounter: Enemy Template desconhecido "${group.enemyTemplateId}"`);
    }
    for (const instanceSeed of group.instanceSeeds) {
      enemies.push(spawnEnemy(template, instanceSeed, group.level, options));
    }
  }
  return { regionId: result.regionId, seed: result.seed, enemies, variant: result.variant, explorationEventId: result.explorationEventId };
}

// packages/shared/src/worldencounter/biomes.ts
var BIOME_PROGRESSION = [
  {
    regionId: "bosque-sussurrante",
    order: 1,
    climate: "Temperado, chuva leve ocasional",
    description: "Floresta densa de copas altas, luz filtrada em feixes, trilhas estreitas cobertas de folhas.",
    difficultyLabel: "Baixa",
    visualTheme: { color: "#2f9e44", icon: "\u{1F332}" }
  },
  {
    regionId: "pantano-podre",
    order: 2,
    climate: "Neblina constante, calor \xFAmido",
    description: "\xC1gua parada, \xE1rvores tortas meio submersas, palafitas prec\xE1rias ao longe.",
    difficultyLabel: "Baixa-M\xE9dia",
    visualTheme: { color: "#5c7a5c", icon: "\u{1F32B}\uFE0F" }
  },
  {
    regionId: "minas-abandonadas",
    order: 3,
    climate: "Subterr\xE2neo \u2014 sem clima externo, temperatura em queda constante",
    description: "T\xFAneis escavados, trilhos de vagonete quebrados, tochas apagadas h\xE1 muito tempo.",
    difficultyLabel: "M\xE9dia",
    visualTheme: { color: "#6b5b4f", icon: "\u26CF\uFE0F" }
  },
  {
    regionId: "ruinas-esquecidas",
    order: 4,
    climate: "Ameno, protegido pelas pr\xF3prias ru\xEDnas",
    description: "Colunas quebradas, est\xE1tuas cobertas de vinha, salas subterr\xE2neas com inscri\xE7\xF5es antigas.",
    difficultyLabel: "Alta",
    visualTheme: { color: "#d4af37", icon: "\u{1F3DB}\uFE0F" }
  },
  {
    regionId: "fortaleza-sombria",
    order: 5,
    climate: "C\xE9u permanentemente nublado, independente das regi\xF5es vizinhas",
    description: "Torres negras, pontes suspensas sobre abismos, port\xF5es de ferro maiores que qualquer constru\xE7\xE3o vista antes.",
    difficultyLabel: "Muito Alta",
    visualTheme: { color: "#8b1e3f", icon: "\u{1F3F0}" }
  },
  {
    regionId: "colinas-aridas",
    order: 6,
    climate: "Sol forte, pouca sombra, noites frias",
    description: "Colinas ocre, vegeta\xE7\xE3o rasteira e seca, ru\xEDnas de fazendas abandonadas espalhadas.",
    difficultyLabel: "Baixa-M\xE9dia",
    visualTheme: { color: "#c9a227", icon: "\u{1F3DC}\uFE0F" }
  }
];
function getBiomeDefinition(regionId) {
  return BIOME_PROGRESSION.find((biome) => biome.regionId === regionId);
}
function getNextBiome(regionId) {
  const current = getBiomeDefinition(regionId);
  if (!current) return void 0;
  return BIOME_PROGRESSION.find((biome) => biome.order === current.order + 1);
}

// packages/shared/src/worldencounter/regionProgression.ts
function checkRegionUnlock(currentRegionId, characterLevel, unlockedRegionIds) {
  const nextBiome = getNextBiome(currentRegionId);
  if (!nextBiome) return { unlocked: false, newRegionId: null };
  if (unlockedRegionIds.includes(nextBiome.regionId)) return { unlocked: false, newRegionId: null };
  const nextTable = getEncounterTable(nextBiome.regionId);
  if (!nextTable) return { unlocked: false, newRegionId: null };
  if (characterLevel >= nextTable.levelRange.min) {
    return { unlocked: true, newRegionId: nextBiome.regionId };
  }
  return { unlocked: false, newRegionId: null };
}

// packages/shared/src/adventure/session.ts
var DEFAULT_CRITICAL_MULTIPLIER = 1.5;
function createAdventureCharacter(characterBuild, inventory, equipment, criticalMultiplier = DEFAULT_CRITICAL_MULTIPLIER) {
  const finalStats = calculateFinalStats(characterBuild, equipment);
  return {
    characterBuild,
    inventory,
    equipment,
    criticalMultiplier,
    currentLife: finalStats.maximumLife
  };
}
function createAdventureSession(sessionId, character, regionId, seed, startTime = Date.now()) {
  return {
    sessionId,
    character,
    currentRegion: regionId,
    currentEncounter: null,
    statistics: {
      encountersCompleted: 0,
      enemiesKilled: 0,
      damageDealt: 0,
      damageTaken: 0,
      itemsFound: 0,
      itemsEquipped: 0,
      goldFound: 0,
      elapsedTime: 0
    },
    seed,
    startTime,
    futureHooks: {}
  };
}
function toAdventureCombatant(character) {
  return {
    finalStats: calculateFinalStats(character.characterBuild, character.equipment),
    criticalMultiplier: character.criticalMultiplier,
    currentLife: character.currentLife
  };
}

// packages/shared/src/adventure/autoEquip.ts
function tryAutoEquip(character, instanceId, item) {
  const base = getBaseItem(item.baseItemId);
  if (!base) return false;
  const candidateSlots = EQUIPMENT_SLOT_DEFINITIONS.filter((definition) => definition.acceptsItemSlot === base.slot);
  for (const slotDefinition of candidateSlots) {
    const currentlyEquipped = character.equipment.getEquippedItem(slotDefinition.id);
    const currentPowerScore = currentlyEquipped?.powerScore ?? 0;
    if (item.powerScore > currentPowerScore) {
      const result = character.equipment.equipItem(character.inventory, slotDefinition.id, instanceId);
      if (result.success) return true;
    }
  }
  return false;
}

// packages/shared/src/adventure/adventureLoop.ts
function advanceAdventure(session, options = {}) {
  if (session.character.currentLife <= 0) {
    throw new Error(`Adventure Session: personagem "${session.sessionId}" j\xE1 est\xE1 morto, sess\xE3o encerrada`);
  }
  const currentTime = options.currentTime ?? Date.now();
  const rng = createSeededRandom(session.seed + session.statistics.encountersCompleted);
  let encounterGenerated = false;
  if (!session.currentEncounter) {
    const playerLevel = session.character.characterBuild.level;
    const recipeSeed = randomInt(rng, 0, 2147483647);
    const recipe = generateEncounter(session.currentRegion, playerLevel, recipeSeed);
    session.currentEncounter = spawnWorldEncounter(recipe);
    encounterGenerated = true;
  }
  const encounter = session.currentEncounter;
  let enemiesKilledThisTick = 0;
  let itemsFoundThisTick = 0;
  let itemsEquippedThisTick = 0;
  const lootDrops = [];
  const encounterVariant = encounter.variant;
  const variantEnemyTemplateId = encounterVariant !== "normal" ? encounter.enemies[0]?.templateId ?? null : null;
  for (let i = 0; i < encounter.enemies.length; i++) {
    let enemy = encounter.enemies[i];
    const template = getEnemyTemplate(enemy.templateId);
    if (!template) {
      throw new Error(`Adventure Session: Enemy Template desconhecido "${enemy.templateId}"`);
    }
    while (enemy.alive && enemy.currentLife > 0 && session.character.currentLife > 0) {
      const playerCombatant = toAdventureCombatant(session.character);
      const enemyCombatant = toCombatant(enemy, template);
      const attackResult = resolveCombat({
        attacker: playerCombatant,
        target: enemyCombatant,
        seed: randomInt(rng, 0, 2147483647),
        timestamp: currentTime,
        attackType: "physical"
      });
      enemy = applyCombatResultToEnemy(enemy, attackResult);
      session.statistics.damageDealt += attackResult.damage;
      session.character.currentLife = Math.min(
        playerCombatant.finalStats.maximumLife,
        session.character.currentLife + attackResult.lifeLeech
      );
      if (enemy.currentLife <= 0) break;
      const counterResult = resolveCombat({
        attacker: enemyCombatant,
        target: playerCombatant,
        seed: randomInt(rng, 0, 2147483647),
        timestamp: currentTime,
        attackType: "physical"
      });
      session.character.currentLife = counterResult.remainingLife;
      session.statistics.damageTaken += counterResult.damage;
    }
    encounter.enemies[i] = enemy;
    if (enemy.currentLife <= 0 && session.character.currentLife > 0) {
      const killResult = killEnemy(enemy, template, currentTime);
      encounter.enemies[i] = killResult.instance;
      enemiesKilledThisTick++;
      session.statistics.enemiesKilled++;
      const lootSeed = randomInt(rng, 0, 2147483647);
      const loot = generateLootForKilledEnemy(killResult, killResult.instance, lootSeed);
      for (const item of loot.generatedItems) {
        const instanceId = `${session.sessionId}-item-${randomInt(rng, 0, 2147483647)}`;
        const addResult = session.character.inventory.addItem(instanceId, item);
        lootDrops.push({ instanceId, baseItemId: item.baseItemId, rarity: item.rarity, powerScore: item.powerScore, stored: addResult.success });
        if (!addResult.success) continue;
        itemsFoundThisTick++;
        session.statistics.itemsFound++;
        if (options.autoEquip && tryAutoEquip(session.character, instanceId, item)) {
          itemsEquippedThisTick++;
          session.statistics.itemsEquipped++;
        }
      }
      session.statistics.goldFound += loot.currencies.length;
    }
    if (session.character.currentLife <= 0) break;
  }
  const allEnemiesDead = encounter.enemies.every((instance) => !instance.alive);
  const variantEnemyDefeated = encounterVariant !== "normal" && allEnemiesDead && enemiesKilledThisTick > 0;
  if (allEnemiesDead) {
    session.statistics.encountersCompleted++;
    session.currentEncounter = null;
  }
  session.statistics.elapsedTime = currentTime - session.startTime;
  return {
    encounterGenerated,
    enemiesEncountered: encounter.enemies.length,
    enemiesKilledThisTick,
    itemsFoundThisTick,
    itemsEquippedThisTick,
    characterAlive: session.character.currentLife > 0,
    lootDrops,
    encounterVariant,
    variantEnemyTemplateId,
    variantEnemyDefeated
  };
}

// packages/shared/src/adventure/starterKit.ts
var STARTER_KIT_ITEM_LEVEL = 1;
var STARTER_KIT_SEED_OFFSET = 777001;
var FORCE_COMMON_RARITY = { magic: 0, rare: 0, unique: 0 };
var STARTER_WEAPON_BY_CLASS = {
  warrior: "sword",
  mage: "wand",
  ranger: "bow",
  cleric: "mace"
};
function starterKitFor(classId) {
  const weaponId = STARTER_WEAPON_BY_CLASS[classId] ?? "sword";
  return [
    { baseItemId: weaponId, slotId: "weapon" },
    { baseItemId: "helmet", slotId: "helmet" },
    { baseItemId: "chest", slotId: "chest" },
    { baseItemId: "gloves", slotId: "gloves" },
    { baseItemId: "boots", slotId: "boots" }
  ];
}
function equipStarterKit(character, classId, seed) {
  const kit = starterKitFor(classId);
  kit.forEach((entry, index) => {
    const itemSeed = STARTER_KIT_SEED_OFFSET + seed + index;
    const item = generateItem(entry.baseItemId, STARTER_KIT_ITEM_LEVEL, itemSeed, {
      rarityWeightMultipliers: FORCE_COMMON_RARITY
    });
    const instanceId = `starter-${entry.baseItemId}-${itemSeed}`;
    const addResult = character.inventory.addItem(instanceId, item);
    if (!addResult.success) return;
    character.equipment.equipItem(character.inventory, entry.slotId, instanceId);
  });
}

// packages/shared/src/presentation/healthBar.ts
function toHealthBarState(current, maximum) {
  const percent = maximum > 0 ? Math.max(0, Math.min(100, Math.round(current / maximum * 100))) : 0;
  return { current, maximum, percent };
}

// packages/shared/src/presentation/floatingNumbers.ts
function estimateLifeLeech(currentLifeBefore, currentLifeAfter, damageTakenDelta) {
  const rawEstimate = currentLifeAfter - currentLifeBefore + damageTakenDelta;
  return Math.max(0, rawEstimate);
}
function deriveFloatingNumbers(tickIndex, timestamp, damageDealtDelta, damageTakenDelta, lifeLeechEstimate) {
  const numbers = [];
  if (damageDealtDelta > 0) {
    numbers.push({ kind: "damage", value: damageDealtDelta, target: "enemy", tickIndex, timestamp });
  }
  if (damageTakenDelta > 0) {
    numbers.push({ kind: "damage", value: damageTakenDelta, target: "character", tickIndex, timestamp });
  }
  if (lifeLeechEstimate > 0) {
    numbers.push({ kind: "lifeLeech", value: lifeLeechEstimate, target: "character", tickIndex, timestamp });
  }
  return numbers;
}

// packages/shared/src/presentation/presentationLayer.ts
function rarityRank(rarityId) {
  const index = ITEM_GEN_RARITIES.findIndex((rarity) => rarity.id === rarityId);
  return index === -1 ? 0 : index;
}
function applyExplorationEventReward(session, reward, playerLevel, lootSeed) {
  let recoveryAmount = 0;
  if (reward.recoveryAmount) {
    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    const lifeBefore = session.character.currentLife;
    const lifeAfter = Math.min(finalStats.maximumLife, lifeBefore + reward.recoveryAmount);
    recoveryAmount = lifeAfter - lifeBefore;
    session.character.currentLife = lifeAfter;
  }
  const goldAmount = reward.goldAmount ?? 0;
  if (goldAmount > 0) {
    session.statistics.goldFound += goldAmount;
  }
  let lootItemCount = 0;
  let bestLootRarity = null;
  const lootDrops = [];
  if (reward.lootTableId) {
    const loot = generateLoot(reward.lootTableId, playerLevel, lootSeed);
    for (let i = 0; i < loot.generatedItems.length; i++) {
      const item = loot.generatedItems[i];
      const instanceId = `${session.sessionId}-explorationevent-${lootSeed}-${i}`;
      const addResult = session.character.inventory.addItem(instanceId, item);
      lootDrops.push({ instanceId, baseItemId: item.baseItemId, rarity: item.rarity, powerScore: item.powerScore, stored: addResult.success });
      if (addResult.success) {
        lootItemCount++;
        if (!bestLootRarity || rarityRank(item.rarity) > rarityRank(bestLootRarity)) bestLootRarity = item.rarity;
      }
    }
  }
  return { xpAmount: reward.xpAmount ?? 0, goldAmount, recoveryAmount, lootItemCount, bestLootRarity, lootDrops };
}
function createAdventureTimeline(sessionId) {
  return { sessionId, events: [], nextTickIndex: 0, totalXpGranted: 0, unlockedRegionIds: [] };
}
function advanceAdventureWithPresentation(session, timeline, options = {}) {
  const timestamp = options.currentTime ?? Date.now();
  const tickIndex = timeline.nextTickIndex;
  timeline.nextTickIndex++;
  const beforeEquippedInstanceIds = new Map(session.character.equipment.items.map((slot) => [slot.slotId, slot.instanceId]));
  const beforeEquippedPowerScore = new Map(
    session.character.equipment.items.map((slot) => [slot.slotId, slot.item?.powerScore ?? 0])
  );
  const beforeStatistics = { ...session.statistics };
  const beforeCurrentLife = session.character.currentLife;
  let predictedExplorationEvent = null;
  let predictedLootSeed = 0;
  if (!session.currentEncounter) {
    const predictionRng = createSeededRandom(session.seed + session.statistics.encountersCompleted);
    const predictedRecipeSeed = randomInt(predictionRng, 0, 2147483647);
    const playerLevelBeforeTick = session.character.characterBuild.level;
    const predictedRecipe = generateEncounter(session.currentRegion, playerLevelBeforeTick, predictedRecipeSeed);
    if (predictedRecipe.explorationEventId) {
      predictedExplorationEvent = getExplorationEventDefinition(predictedRecipe.explorationEventId) ?? null;
      predictedLootSeed = predictedRecipeSeed;
    }
  }
  const tickResult = advanceAdventure(session, options);
  const lifeAfterCombatResolution = session.character.currentLife;
  const events = [];
  const region = session.currentRegion;
  const appliedExplorationReward = predictedExplorationEvent && tickResult.encounterGenerated ? applyExplorationEventReward(session, predictedExplorationEvent.reward, session.character.characterBuild.level, predictedLootSeed) : null;
  if (tickResult.encounterGenerated) {
    events.push({ kind: "EncounterStarted", regionId: region, enemyCount: tickResult.enemiesEncountered, tickIndex, timestamp });
    events.push({ kind: "AttackStarted", enemyCount: tickResult.enemiesEncountered, tickIndex, timestamp });
  }
  const damageDealtDelta = session.statistics.damageDealt - beforeStatistics.damageDealt;
  const damageTakenDelta = session.statistics.damageTaken - beforeStatistics.damageTaken;
  if (damageDealtDelta > 0 || damageTakenDelta > 0) {
    events.push({ kind: "AttackHit", damageDealt: damageDealtDelta, damageTaken: damageTakenDelta, tickIndex, timestamp });
  }
  if (tickResult.enemiesKilledThisTick > 0) {
    events.push({ kind: "EnemyKilled", count: tickResult.enemiesKilledThisTick, tickIndex, timestamp });
  }
  const variantEnemyName = tickResult.variantEnemyTemplateId ? getEnemyTemplate(tickResult.variantEnemyTemplateId)?.name ?? tickResult.variantEnemyTemplateId : "";
  const levelBefore = session.character.characterBuild.level;
  const baseXpAwarded = tickResult.enemiesKilledThisTick * xpRewardForKill(levelBefore);
  const variantXpBonus = tickResult.variantEnemyDefeated && tickResult.encounterVariant !== "normal" ? Math.round(xpRewardForKill(levelBefore) * (VARIANT_XP_MULTIPLIERS[tickResult.encounterVariant] - 1)) : 0;
  const explorationEventXpAmount = appliedExplorationReward?.xpAmount ?? 0;
  const xpAwarded = baseXpAwarded + variantXpBonus + explorationEventXpAmount;
  if (xpAwarded > 0) {
    session.character.characterBuild.addExperience(xpAwarded);
    timeline.totalXpGranted += xpAwarded;
  }
  const levelAfter = session.character.characterBuild.level;
  if (levelAfter > levelBefore) {
    events.push({ kind: "LevelUp", level: levelAfter, previousLevel: levelBefore, tickIndex, timestamp });
  }
  for (const drop of tickResult.lootDrops) {
    events.push({
      kind: "LootDropped",
      instanceId: drop.instanceId,
      baseItemId: drop.baseItemId,
      rarity: drop.rarity,
      powerScore: drop.powerScore,
      regionId: region,
      stored: drop.stored,
      tickIndex,
      timestamp
    });
  }
  if (appliedExplorationReward) {
    for (const drop of appliedExplorationReward.lootDrops) {
      events.push({
        kind: "LootDropped",
        instanceId: drop.instanceId,
        baseItemId: drop.baseItemId,
        rarity: drop.rarity,
        powerScore: drop.powerScore,
        regionId: region,
        stored: drop.stored,
        tickIndex,
        timestamp
      });
    }
  }
  if (tickResult.encounterVariant !== "normal") {
    const enemyTemplateId = tickResult.variantEnemyTemplateId ?? "";
    const encounterKind = tickResult.encounterVariant === "elite" ? "EliteEncounter" : "MiniBossEncounter";
    events.push({ kind: encounterKind, enemyTemplateId, enemyName: variantEnemyName, regionId: region, tickIndex, timestamp });
    if (tickResult.variantEnemyDefeated) {
      if (tickResult.encounterVariant === "elite") {
        events.push({ kind: "EliteDefeated", enemyTemplateId, enemyName: variantEnemyName, xpBonus: variantXpBonus, tickIndex, timestamp });
      } else {
        events.push({ kind: "MiniBossDefeated", enemyTemplateId, enemyName: variantEnemyName, xpBonus: variantXpBonus, tickIndex, timestamp });
      }
    }
  }
  if (appliedExplorationReward && predictedExplorationEvent) {
    const explorationEventId = predictedExplorationEvent.id;
    const name = predictedExplorationEvent.name;
    const category = predictedExplorationEvent.category;
    events.push({ kind: "WorldEventStarted", explorationEventId, name, category, regionId: region, tickIndex, timestamp });
    events.push({ kind: "WorldEventCompleted", explorationEventId, name, category, tickIndex, timestamp });
    switch (category) {
      case "treasure":
        events.push({
          kind: "TreasureOpened",
          explorationEventId,
          itemCount: appliedExplorationReward.lootItemCount,
          bestRarity: appliedExplorationReward.bestLootRarity,
          goldAmount: appliedExplorationReward.goldAmount,
          tickIndex,
          timestamp
        });
        break;
      case "merchant":
        events.push({ kind: "MerchantFound", explorationEventId, goldAmount: appliedExplorationReward.goldAmount, tickIndex, timestamp });
        break;
      case "shrine":
        events.push({
          kind: "ShrineBlessing",
          explorationEventId,
          recoveryAmount: appliedExplorationReward.recoveryAmount,
          xpAmount: appliedExplorationReward.xpAmount,
          goldAmount: appliedExplorationReward.goldAmount,
          tickIndex,
          timestamp
        });
        break;
      case "discovery":
        events.push({ kind: "DiscoveryMade", explorationEventId, xpAmount: appliedExplorationReward.xpAmount, tickIndex, timestamp });
        break;
      case "ambush":
        events.push({ kind: "AmbushTriggered", explorationEventId, enemyCount: tickResult.enemiesEncountered, tickIndex, timestamp });
        break;
    }
  }
  for (const slot of session.character.equipment.items) {
    const before = beforeEquippedInstanceIds.get(slot.slotId);
    if (slot.instanceId && slot.instanceId !== before && slot.item) {
      events.push({
        kind: "ItemEquipped",
        slotId: slot.slotId,
        baseItemId: slot.item.baseItemId,
        rarity: slot.item.rarity,
        powerScore: slot.item.powerScore,
        previousPowerScore: beforeEquippedPowerScore.get(slot.slotId) ?? 0,
        tickIndex,
        timestamp
      });
    }
  }
  const encounterFinishedThisTick = session.statistics.encountersCompleted > beforeStatistics.encountersCompleted;
  if (encounterFinishedThisTick) {
    events.push({ kind: "EncounterFinished", enemiesKilled: tickResult.enemiesKilledThisTick, tickIndex, timestamp });
  }
  if (!tickResult.characterAlive) {
    events.push({ kind: "CharacterDied", tickIndex, timestamp });
  }
  const lifeLeechEstimate = estimateLifeLeech(beforeCurrentLife, lifeAfterCombatResolution, damageTakenDelta);
  const floatingNumbers = deriveFloatingNumbers(tickIndex, timestamp, damageDealtDelta, damageTakenDelta, lifeLeechEstimate);
  if (appliedExplorationReward && appliedExplorationReward.recoveryAmount > 0) {
    floatingNumbers.push({ kind: "heal", value: appliedExplorationReward.recoveryAmount, target: "character", tickIndex, timestamp });
  }
  timeline.events.push(...events);
  return { tickResult, events, floatingNumbers };
}

// packages/shared/src/objectives/objectiveDefinitions.ts
var OBJECTIVE_DEFINITIONS = [
  {
    id: "kill-5",
    name: "Primeira Ca\xE7ada",
    description: "Derrote 5 inimigos",
    type: "kill",
    target: 5,
    reward: { xpBonus: 30 },
    soundId: "objective-complete-minor"
  },
  {
    id: "kill-12",
    name: "Ca\xE7ador Experiente",
    description: "Derrote 12 inimigos",
    type: "kill",
    target: 12,
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor"
  },
  {
    id: "survive-5-encounters",
    name: "Persist\xEAncia",
    description: "Sobreviva a 5 encontros",
    type: "survival",
    target: 5,
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor"
  },
  {
    id: "reach-level-2",
    name: "Primeiros Passos",
    description: "Alcance o n\xEDvel 2",
    type: "level",
    target: 2,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-major"
  },
  {
    id: "reach-level-3",
    name: "Ascens\xE3o",
    description: "Alcance o n\xEDvel 3",
    type: "level",
    target: 3,
    reward: { xpBonus: 70 },
    soundId: "objective-complete-major"
  },
  {
    id: "find-magic-item",
    name: "Tesouro Raro",
    description: "Encontre um item M\xE1gico (ou melhor)",
    type: "loot",
    target: 1,
    targetRarity: "magic",
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor"
  },
  {
    id: "equip-upgrade",
    name: "Equipamento Melhor",
    description: "Equipe um item melhor que o atual",
    type: "equipment",
    target: 1,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor"
  },
  // Biomes, Regions & World Progression Phase I — requisito 5:
  // Objetivos Regionais — só elegíveis enquanto o personagem está na
  // região correspondente (`regionId`). "Mate 10 Lobos" (exemplo da
  // Sprint) virou "derrote 10 inimigos no Bosque" — o Presentation
  // Layer não distingue ESPÉCIE de inimigo dentro de um encontro (só
  // contagem, ver presentation/types.ts), então "no Bosque" é o que
  // sobrevive honestamente sem inventar um dado que não existe (mesma
  // limitação documentada em Best Item/Damage Record de outras
  // Sprints).
  {
    id: "bosque-hunt",
    name: "Ca\xE7ada no Bosque",
    description: "Derrote 10 inimigos no Bosque Sussurrante",
    type: "kill",
    target: 10,
    regionId: "bosque-sussurrante",
    reward: { xpBonus: 70 },
    soundId: "objective-complete-minor"
  },
  {
    id: "pantano-survival",
    name: "Sobreviv\xEAncia no P\xE2ntano",
    description: "Sobreviva a 3 encontros no P\xE2ntano Podre",
    type: "survival",
    target: 3,
    regionId: "pantano-podre",
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor"
  },
  {
    id: "ruinas-treasure",
    name: "Tesouro das Ru\xEDnas",
    description: "Encontre um item raro (ou melhor) nas Ru\xEDnas Esquecidas",
    type: "loot",
    target: 1,
    targetRarity: "rare",
    regionId: "ruinas-esquecidas",
    reward: { xpBonus: 90 },
    soundId: "objective-complete-major"
  },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 5: exemplos
  // literais da Sprint ("Derrote um Elite"/"Derrote um Mini-Boss"/
  // "Sobreviva após derrotar um Elite"). Sem `regionId` — Elites e
  // Mini-Bosses podem aparecer em qualquer bioma com `variantChances`
  // (ver worldencounter/encounterTables.ts).
  {
    id: "defeat-elite",
    name: "Ca\xE7ador de Elites",
    description: "Derrote um Elite",
    type: "defeat-elite",
    target: 1,
    reward: { xpBonus: 100 },
    soundId: "objective-complete-major"
  },
  {
    id: "defeat-miniboss",
    name: "Ca\xE7ador de Mini-Bosses",
    description: "Derrote um Mini-Boss",
    type: "defeat-miniboss",
    target: 1,
    reward: { xpBonus: 150 },
    soundId: "objective-complete-major"
  },
  {
    id: "survive-after-elite",
    name: "Sangue Frio",
    description: "Derrote um Elite e sobreviva a mais 3 encontros",
    type: "survive-after-elite",
    target: 3,
    reward: { xpBonus: 120 },
    soundId: "objective-complete-major"
  },
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 10: exemplos literais da Sprint ("Descubra 3 Monumentos"/"Abra 5
  // Baús"/"Encontre um Mercador"/"Receba uma Bênção"). Sem `regionId` —
  // World Events podem aparecer em qualquer bioma com sua própria
  // ExplorationEventTable (ver worldevents/worldEventTables.ts).
  // "Descubra 3 Monumentos" vira "descubra 3 vestígios" (o Objective
  // System conta a CATEGORIA inteira "discovery", não um evento
  // específico — mesma limitação honesta já documentada pra objetivos
  // regionais de "kill": a granularidade observável é por categoria,
  // não por id individual).
  {
    id: "discover-worldevent",
    name: "Explorador",
    description: "Descubra 3 vest\xEDgios do mundo (ru\xEDnas, di\xE1rios, monumentos)",
    type: "discover-worldevent",
    target: 3,
    reward: { xpBonus: 90 },
    soundId: "objective-complete-major"
  },
  {
    id: "open-treasure",
    name: "Ca\xE7ador de Tesouros",
    description: "Abra 5 ba\xFAs ou tesouros",
    type: "open-treasure",
    target: 5,
    reward: { xpBonus: 80 },
    soundId: "objective-complete-minor"
  },
  {
    id: "find-merchant",
    name: "Encontro Providencial",
    description: "Encontre um mercador",
    type: "find-merchant",
    target: 1,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor"
  },
  {
    id: "receive-blessing",
    name: "Aben\xE7oado",
    description: "Receba uma b\xEAn\xE7\xE3o de um santu\xE1rio",
    type: "receive-blessing",
    target: 1,
    reward: { xpBonus: 40 },
    soundId: "objective-complete-minor"
  },
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 11: exemplos literais da Sprint ("Complete uma
  // Expedição"/"Alcance dois Checkpoints"/"Complete uma Expedição sem
  // morrer"/"Complete uma Expedição encontrando um Evento Mundial").
  // Sem `regionId` — Expedições existem em qualquer bioma com uma
  // Expedition Definition própria (ver expeditions/expeditionDefinitions.ts).
  {
    id: "complete-expedition",
    name: "Expedicion\xE1rio",
    description: "Complete uma Expedi\xE7\xE3o",
    type: "complete-expedition",
    target: 1,
    reward: { xpBonus: 150 },
    soundId: "objective-complete-major"
  },
  {
    id: "reach-checkpoints",
    name: "Marco a Marco",
    description: "Alcance dois Checkpoints de Expedi\xE7\xE3o",
    type: "reach-checkpoints",
    target: 2,
    reward: { xpBonus: 60 },
    soundId: "objective-complete-minor"
  },
  {
    id: "complete-expedition-no-death",
    name: "Sem Um Arranh\xE3o",
    description: "Complete uma Expedi\xE7\xE3o sem morrer",
    type: "complete-expedition-no-death",
    target: 1,
    reward: { xpBonus: 200 },
    soundId: "objective-complete-major"
  },
  {
    id: "complete-expedition-with-worldevent",
    name: "Rota Ao Vivo",
    description: "Complete uma Expedi\xE7\xE3o encontrando um Evento Mundial",
    type: "complete-expedition-with-worldevent",
    target: 1,
    reward: { xpBonus: 180 },
    soundId: "objective-complete-major"
  },
  // Factions, Reputation & World Consequences Phase I — requisito 9:
  // exemplos literais da Sprint ("alcance Respeitado"/"ajude
  // Mercadores"/"descubra locais das Ruínas"). Sem `regionId` —
  // reputação de facção pode subir em qualquer bioma (ver
  // factionController.ts).
  {
    id: "reach-respected-rank",
    name: "Reputa\xE7\xE3o Crescente",
    description: "Alcance o rank Respeitado em uma fac\xE7\xE3o",
    type: "reach-faction-rank",
    target: 1,
    reward: { xpBonus: 120 },
    soundId: "objective-complete-major"
  },
  {
    id: "help-merchants",
    name: "Amigo dos Mercadores",
    description: "Ganhe reputa\xE7\xE3o com os Mercadores Livres 3 vezes",
    type: "help-merchants",
    target: 3,
    reward: { xpBonus: 70 },
    soundId: "objective-complete-minor"
  },
  {
    id: "discover-ruins",
    name: "Segredos das Ru\xEDnas",
    description: "Ganhe reputa\xE7\xE3o com o Culto das Ru\xEDnas 2 vezes",
    type: "discover-ruins",
    target: 2,
    reward: { xpBonus: 80 },
    soundId: "objective-complete-minor"
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 6: exemplos literais da Sprint ("Derrote o Guardião Esquecido"/
  // "Complete a Fortaleza Sombria"/"Conclua uma Dungeon"). Sem
  // `regionId` nos dois primeiros — o Chefe Final/a Dungeon existem em
  // qualquer sessão que alcance a Expedição certa (ver dungeon/
  // dungeonDefinitions.ts), exceto "reach-fortaleza-sombria" (abaixo),
  // que É regional de propósito (reaproveita o tipo "survival" já
  // existente, mesmo princípio de "bosque-hunt"/"pantano-survival").
  {
    id: "defeat-final-boss",
    name: "Matador de Guardi\xF5es",
    description: "Derrote o Guardi\xE3o Esquecido",
    type: "defeat-final-boss",
    target: 1,
    reward: { xpBonus: 250 },
    soundId: "objective-complete-major"
  },
  {
    id: "reach-fortaleza-sombria",
    name: "Nas Portas da Fortaleza",
    description: "Complete a Fortaleza Sombria (sobreviva a 3 encontros l\xE1)",
    type: "survival",
    target: 3,
    regionId: "fortaleza-sombria",
    reward: { xpBonus: 200 },
    soundId: "objective-complete-major"
  },
  {
    id: "complete-dungeon",
    name: "Her\xF3i da Dungeon",
    description: "Conclua uma Dungeon",
    type: "complete-dungeon",
    target: 1,
    reward: { xpBonus: 400 },
    soundId: "objective-complete-major"
  }
];
var STARTER_OBJECTIVE_ID = "kill-5";
function getObjectiveDefinition(id) {
  return OBJECTIVE_DEFINITIONS.find((definition) => definition.id === id);
}
function selectObjectiveId(seed, completedCount, previousObjectiveId, currentRegionId) {
  if (completedCount === 0) return STARTER_OBJECTIVE_ID;
  const candidates = OBJECTIVE_DEFINITIONS.filter(
    (definition) => definition.id !== previousObjectiveId && (definition.regionId === void 0 || definition.regionId === currentRegionId)
  );
  const rng = createSeededRandom(seed + completedCount);
  const index = randomInt(rng, 0, candidates.length - 1);
  return candidates[index].id;
}

// packages/shared/src/objectives/objectiveProgress.ts
function rarityRank2(rarityId) {
  const index = ITEM_GEN_RARITIES.findIndex((rarity) => rarity.id === rarityId);
  return index === -1 ? 0 : index;
}
function countObjectiveCompletions(events) {
  let count = 0;
  for (const event of events) {
    if (event.kind === "ObjectiveCompleted") count++;
  }
  return count;
}
function lastCompletedObjectiveId(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ObjectiveCompleted") return event.objectiveId;
  }
  return null;
}
function boundaryTickIndex(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].kind === "ObjectiveCompleted") return events[i].tickIndex;
  }
  return -1;
}
function computeProgress(objective, session, eventsSinceBoundary) {
  switch (objective.type) {
    case "kill":
      return eventsSinceBoundary.reduce((sum, event) => sum + (event.kind === "EnemyKilled" ? event.count : 0), 0);
    case "survival":
      return eventsSinceBoundary.filter((event) => event.kind === "EncounterFinished").length;
    case "level":
      return session.character.characterBuild.level;
    case "loot": {
      const targetRank = rarityRank2(objective.targetRarity ?? "magic");
      const found = eventsSinceBoundary.some((event) => event.kind === "LootDropped" && rarityRank2(event.rarity) >= targetRank);
      return found ? 1 : 0;
    }
    case "equipment": {
      const upgraded = eventsSinceBoundary.some((event) => event.kind === "ItemEquipped" && event.powerScore > event.previousPowerScore);
      return upgraded ? 1 : 0;
    }
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 5: cada
    // `case` só conta os eventos que a extensão aditiva de
    // presentationLayer.ts já publica — nenhuma lógica de detecção
    // nova, mesmo princípio de "kill"/"survival" acima.
    case "defeat-elite":
      return eventsSinceBoundary.filter((event) => event.kind === "EliteDefeated").length;
    case "defeat-miniboss":
      return eventsSinceBoundary.filter((event) => event.kind === "MiniBossDefeated").length;
    case "survive-after-elite": {
      let lastEliteDefeatedTick = -1;
      for (const event of eventsSinceBoundary) {
        if (event.kind === "EliteDefeated") lastEliteDefeatedTick = event.tickIndex;
      }
      if (lastEliteDefeatedTick === -1) return 0;
      return eventsSinceBoundary.filter((event) => event.kind === "EncounterFinished" && event.tickIndex > lastEliteDefeatedTick).length;
    }
    // World Events, Dynamic Encounters & Exploration Phase I —
    // requisito 10: cada `case` só conta os eventos que a extensão
    // aditiva de presentationLayer.ts já publica — mesmo princípio de
    // defeat-elite/defeat-miniboss acima.
    case "discover-worldevent":
      return eventsSinceBoundary.filter((event) => event.kind === "DiscoveryMade").length;
    case "open-treasure":
      return eventsSinceBoundary.filter((event) => event.kind === "TreasureOpened").length;
    case "find-merchant":
      return eventsSinceBoundary.filter((event) => event.kind === "MerchantFound").length;
    case "receive-blessing":
      return eventsSinceBoundary.filter((event) => event.kind === "ShrineBlessing").length;
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 11: cada `case` só conta os eventos que
    // expeditions/expeditionController.ts já publica — mesmo princípio
    // de defeat-elite/open-treasure acima. `diedDuringExpedition`/
    // `worldEventsFound` já vêm prontos no próprio ExpeditionCompleted
    // (calculados pela Expedição, que já varre a janela inteira) —
    // nenhuma segunda varredura de eventos cruzados aqui.
    case "complete-expedition":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCompleted").length;
    case "reach-checkpoints":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCheckpointReached").length;
    case "complete-expedition-no-death":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCompleted" && !event.diedDuringExpedition).length;
    case "complete-expedition-with-worldevent":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCompleted" && event.worldEventsFound > 0).length;
    // Factions, Reputation & World Consequences Phase I — requisito 9:
    // cada `case` só conta os eventos que factions/factionController.ts
    // já publica — mesmo princípio de complete-expedition/open-treasure
    // acima. "reach-faction-rank" conta especificamente o rank
    // "respeitado" (não QUALQUER rank-up) via o campo `rankId` que o
    // próprio ReputationRankUp já carrega.
    case "reach-faction-rank":
      return eventsSinceBoundary.filter((event) => event.kind === "ReputationRankUp" && event.rankId === "respeitado").length;
    case "help-merchants":
      return eventsSinceBoundary.filter((event) => event.kind === "ReputationChanged" && event.factionId === "mercadores-livres").length;
    case "discover-ruins":
      return eventsSinceBoundary.filter((event) => event.kind === "ReputationChanged" && event.factionId === "culto-das-ruinas").length;
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 6: cada `case` só conta os eventos que
    // dungeon/dungeonController.ts já publica — mesmo princípio de
    // defeat-elite/complete-expedition acima.
    case "defeat-final-boss":
      return eventsSinceBoundary.filter((event) => event.kind === "FinalBossDefeated").length;
    case "complete-dungeon":
      return eventsSinceBoundary.filter((event) => event.kind === "DungeonCompleted").length;
    default:
      return 0;
  }
}
function deriveObjectiveProgress(session, timeline) {
  const events = timeline.events;
  const completedCount = countObjectiveCompletions(events);
  const previousObjectiveId = lastCompletedObjectiveId(events);
  const objectiveId = selectObjectiveId(session.seed, completedCount, previousObjectiveId, session.currentRegion);
  const objective = getObjectiveDefinition(objectiveId);
  if (!objective) {
    throw new Error(`Objective System: objetivo desconhecido "${objectiveId}"`);
  }
  const boundary = boundaryTickIndex(events);
  const eventsSinceBoundary = events.filter((event) => event.tickIndex > boundary);
  const progress = computeProgress(objective, session, eventsSinceBoundary);
  return {
    objective,
    progress,
    target: objective.target,
    complete: progress >= objective.target,
    completedCount
  };
}

// packages/shared/src/expeditions/expeditionDefinitions.ts
var EXPEDITION_DEFINITIONS = [
  {
    id: "bosque-antigo",
    name: "Bosque Antigo",
    description: "Uma travessia guiada pelas trilhas mais antigas do Bosque Sussurrante.",
    startBiome: "bosque-sussurrante",
    allowedBiomes: ["bosque-sussurrante"],
    expectedEncounters: 12,
    expectedSeconds: 264,
    checkpointCount: 3,
    reward: { xpAmount: 200, goldAmount: 50 },
    difficulty: "Baixa"
  },
  {
    id: "travessia-do-pantano",
    name: "Travessia do P\xE2ntano",
    description: "Atravessar o P\xE2ntano Podre de ponta a ponta, sem se perder na neblina.",
    startBiome: "pantano-podre",
    allowedBiomes: ["pantano-podre"],
    expectedEncounters: 14,
    expectedSeconds: 308,
    checkpointCount: 3,
    reward: { xpAmount: 260, goldAmount: 60 },
    difficulty: "Baixa"
  },
  {
    id: "rota-das-colinas",
    name: "Rota das Colinas",
    description: "Uma rota comercial perigosa atrav\xE9s das Colinas \xC1ridas.",
    startBiome: "colinas-aridas",
    allowedBiomes: ["colinas-aridas"],
    expectedEncounters: 18,
    expectedSeconds: 396,
    checkpointCount: 3,
    reward: { xpAmount: 450, goldAmount: 120 },
    difficulty: "M\xE9dia"
  },
  {
    id: "descida-as-minas",
    name: "Descida \xE0s Minas",
    description: "Descer fundo nas Minas Abandonadas, entre os construtos de pedra.",
    startBiome: "minas-abandonadas",
    allowedBiomes: ["minas-abandonadas"],
    expectedEncounters: 16,
    expectedSeconds: 352,
    checkpointCount: 3,
    reward: { xpAmount: 400, goldAmount: 100 },
    difficulty: "M\xE9dia"
  },
  {
    id: "exploracao-das-ruinas",
    name: "Explora\xE7\xE3o das Ru\xEDnas",
    description: "Uma expedi\xE7\xE3o longa pelas Ru\xEDnas Esquecidas, em busca do que restou do passado.",
    startBiome: "ruinas-esquecidas",
    allowedBiomes: ["ruinas-esquecidas"],
    expectedEncounters: 20,
    expectedSeconds: 440,
    checkpointCount: 4,
    reward: { xpAmount: 600, goldAmount: 160 },
    difficulty: "Alta"
  },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 1: "Dungeon deve ser apenas uma ExpeditionDefinition" — a primeira
  // Dungeon completa, atravessando os 6 biomas conhecidos (Bosque
  // Sussurrante -> Colinas Áridas -> Pântano Podre -> Minas Abandonadas
  // -> Ruínas Esquecidas -> Fortaleza Sombria, mesma ORDEM de
  // BIOME_PROGRESSION, worldencounter/biomes.ts) via a MESMA travessia
  // automática por nível que já existe (Region Unlock, Objective
  // System — intocado, só reaproveitado). `expectedEncounters` bem
  // maior que qualquer Expedição regional isolada (soma aproximada dos
  // 6 biomas) — calibrado empiricamente via Simulador (requisito 10)
  // pra terminar POUCO depois do Chefe Final normalmente aparecer
  // (Ruínas Esquecidas, penúltimo bioma). `guaranteedLootTableId`
  // finalmente LÊ o Future Hook preparado desde a Sprint de Expedições
  // (expeditions/types.ts: ExpeditionReward.guaranteedLootTableId,
  // nunca lido por nenhuma lógica real até agora) — aponta pra
  // "final-boss-relic" (lootgen/lootTables.ts), mas quem efetivamente
  // concede o item é dungeon/dungeonController.ts (na derrota do Chefe,
  // não na conclusão da Expedição — ver nota lá).
  {
    id: "queda-da-fortaleza-sombria",
    name: "Queda da Fortaleza Sombria",
    description: "A primeira Dungeon completa do reino: atravesse todos os biomas conhecidos at\xE9 enfrentar o Guardi\xE3o Esquecido, o Chefe Final que guarda o caminho para a Fortaleza Sombria.",
    startBiome: "bosque-sussurrante",
    allowedBiomes: ["bosque-sussurrante", "colinas-aridas", "pantano-podre", "minas-abandonadas", "ruinas-esquecidas", "fortaleza-sombria"],
    // Calibrado empiricamente via Simulador (requisito 10, várias
    // iterações): a 1ª tentativa (80 encontros) completava o
    // ORÇAMENTO da Expedição ENQUANTO o personagem ainda estava preso
    // em bosque-sussurrante (nível ~10) — Region Unlock (nível-driven,
    // intocado) simplesmente não anda rápido o bastante pra travessia
    // completa nesse número de encontros. Medido: alcançar Ruínas
    // Esquecidas (onde o Chefe Final vive) exige ~150-160 encontros
    // reais desde o nível 1. `expectedEncounters: 220` dá folga
    // suficiente pra chegar lá, encontrar o Guardião Esquecido
    // (variantChances.miniBoss recalibrado pra 0.08 em Ruínas
    // Esquecidas) e concluir a Expedição LOGO DEPOIS de derrotá-lo —
    // nunca exigindo que o personagem sobreviva até Fortaleza Sombria
    // (cujo EnemyTemplate "boss" é calibrado pra um nível muito mais
    // alto, ver worldencounter/encounterTables.ts).
    expectedEncounters: 220,
    expectedSeconds: 4840,
    // Balance, Pacing & Player Experience Phase I — Fase 3 (Dungeon):
    // "distância entre checkpoints." Diagnóstico (before-dungeon-report.md,
    // 100 execuções): 68% de taxa de morte na Dungeon inteira, a grande
    // maioria (49% das 100 execuções) morrendo ainda dentro de
    // bosque-sussurrante — a jornada de ~150-160 encontros até Ruínas
    // Esquecidas (ver nota acima) é longa demais pro espaçamento de
    // ~5.5 encontros/checkpoint (39 checkpoints) segurar a taxa de
    // morte. Apertado pra ~4 encontros/checkpoint (mesmo patamar de
    // "rota-das-colinas" 18/4=4.5 e "exploracao-das-ruinas" 20/5=4) —
    // dobra a quantidade de curas de checkpoint (Recovery Layer
    // reaproveitada, CHECKPOINT_RECOVERY_MULTIPLIER intocado) ao longo
    // da MESMA jornada de 220 encontros, sem alterar nenhuma lógica.
    // Não reduzido `expectedEncounters` abaixo do alvo de 40-70 desta
    // Sprint: medido que alcançar Ruínas Esquecidas exige ~150-160
    // encontros reais a partir do nível 1 (Region Unlock, nível-driven,
    // fora do escopo desta Sprint) — comprimir a jornada pra 40-70
    // encontros exigiria pular biomas inteiros da "primeira Dungeon
    // completa do reino" (contradizendo sua própria definição) ou
    // alterar o ritmo de nivelamento (Character Build/Combat Engine,
    // ambos protegidos nesta Sprint). Mantido 220 com justificativa
    // técnica explícita, conforme permitido pelo briefing ("não manter
    // 220 apenas por consistência... adotar o valor mais adequado").
    checkpointCount: 54,
    // Fase 3 (Boss): "loot; XP" — únicos ganchos ainda editáveis pra
    // recompensa do Chefe nesta Sprint (FINAL_BOSS_XP_REWARD/GOLD_REWARD
    // em dungeon/dungeonController.ts foram congelados). Aumentado
    // (1500->2200 XP, 400->600 ouro) em resposta direta à recomendação
    // automática "recompensa desproporcional ao risco" (Chefe com taxa
    // de vitória de 0% na linha de base).
    reward: { xpAmount: 2200, goldAmount: 600, guaranteedLootTableId: "final-boss-relic" },
    difficulty: "Lend\xE1ria"
  }
];
function getExpeditionDefinition(id) {
  return EXPEDITION_DEFINITIONS.find((definition) => definition.id === id);
}
function selectExpeditionDefinitionId(seed, currentRegionId) {
  const candidates = EXPEDITION_DEFINITIONS.filter((definition) => definition.startBiome === currentRegionId);
  if (candidates.length === 0) return null;
  const rng = createSeededRandom(seed);
  const index = randomInt(rng, 0, candidates.length - 1);
  return candidates[index].id;
}

// packages/shared/src/expeditions/expeditionProgress.ts
function findActiveExpeditionStart(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionCompleted" || event.kind === "ExpeditionFailed") return null;
    if (event.kind === "ExpeditionStarted") return { expeditionId: event.expeditionId, tickIndex: event.tickIndex };
  }
  return null;
}
function checkpointThreshold(definition, checkpointIndex) {
  return Math.round(definition.expectedEncounters * checkpointIndex / (definition.checkpointCount + 1));
}
function checkpointsReachedFor(encountersCompleted, definition) {
  let reached = 0;
  for (let i = 1; i <= definition.checkpointCount; i++) {
    if (encountersCompleted >= checkpointThreshold(definition, i)) reached = i;
  }
  return reached;
}
function deriveExpeditionProgress(session, timeline) {
  const active = findActiveExpeditionStart(timeline.events);
  if (!active) return null;
  const definition = getExpeditionDefinition(active.expeditionId);
  if (!definition) return null;
  const eventsSinceStart = timeline.events.filter((event) => event.tickIndex >= active.tickIndex);
  const encountersCompleted = eventsSinceStart.filter((event) => event.kind === "EncounterFinished").length;
  const elitesDefeated = eventsSinceStart.filter((event) => event.kind === "EliteDefeated").length;
  const miniBossesDefeated = eventsSinceStart.filter((event) => event.kind === "MiniBossDefeated").length;
  const worldEventsFound = eventsSinceStart.filter((event) => event.kind === "WorldEventStarted").length;
  const objectivesCompleted = eventsSinceStart.filter((event) => event.kind === "ObjectiveCompleted").length;
  const regionsUnlocked = eventsSinceStart.filter((event) => event.kind === "RegionUnlocked").length;
  const diedDuringExpedition = eventsSinceStart.some((event) => event.kind === "CharacterDied");
  const checkpointsReached = checkpointsReachedFor(encountersCompleted, definition);
  const percent = definition.expectedEncounters > 0 ? Math.min(100, Math.floor(encountersCompleted / definition.expectedEncounters * 100)) : 100;
  return {
    expeditionId: definition.id,
    name: definition.name,
    description: definition.description,
    difficulty: definition.difficulty,
    encountersCompleted,
    expectedEncounters: definition.expectedEncounters,
    percent,
    checkpointsReached,
    checkpointsTotal: definition.checkpointCount,
    elitesDefeated,
    miniBossesDefeated,
    worldEventsFound,
    objectivesCompleted,
    regionsUnlocked,
    diedDuringExpedition,
    complete: encountersCompleted >= definition.expectedEncounters,
    startTickIndex: active.tickIndex
  };
}

// packages/shared/src/factions/factionDefinitions.ts
function standardRanks() {
  return [
    { id: "neutro", name: "Neutro", minReputation: 0, reward: {} },
    { id: "amigavel", name: "Amig\xE1vel", minReputation: 15, reward: { xpBonusPercent: 5, goldBonusPercent: 5 } },
    { id: "respeitado", name: "Respeitado", minReputation: 50, reward: { xpBonusPercent: 10, goldBonusPercent: 10 } },
    { id: "honrado", name: "Honrado", minReputation: 100, reward: { xpBonusPercent: 15, goldBonusPercent: 15 } },
    { id: "lendario", name: "Lend\xE1rio", minReputation: 180, reward: { xpBonusPercent: 20, goldBonusPercent: 20 } }
  ];
}
var FACTION_DEFINITIONS = [
  {
    id: "guardioes-da-floresta",
    name: "Guardi\xF5es da Floresta",
    description: "Protetores antigos do Bosque Sussurrante e do P\xE2ntano Podre, hostis a tudo que corrompe a natureza.",
    regions: ["bosque-sussurrante", "pantano-podre"],
    alignment: "Ordem Natural",
    ranks: standardRanks()
  },
  {
    id: "mercadores-livres",
    name: "Mercadores Livres",
    description: "Uma rede de caravanas e postos de troca que atravessa todas as regi\xF5es, neutra em qualquer conflito.",
    regions: ["colinas-aridas"],
    alignment: "Neutro",
    ranks: standardRanks()
  },
  {
    id: "culto-das-ruinas",
    name: "Culto das Ru\xEDnas",
    description: "Estudiosos obcecados pelos segredos enterrados nas Ru\xEDnas Esquecidas.",
    regions: ["ruinas-esquecidas"],
    alignment: "Oculto",
    ranks: standardRanks()
  },
  {
    id: "legiao-sombria",
    name: "Legi\xE3o Sombria",
    description: "Uma for\xE7a de conquista que domina as Minas Abandonadas e a Fortaleza Sombria, e respeita apenas o poder.",
    regions: ["minas-abandonadas", "fortaleza-sombria"],
    alignment: "Tirania",
    ranks: standardRanks()
  }
];
function getFactionDefinition(id) {
  return FACTION_DEFINITIONS.find((definition) => definition.id === id);
}
function getFactionForRegion(regionId) {
  return FACTION_DEFINITIONS.find((definition) => definition.regions.includes(regionId));
}
function getRankForReputation(faction, reputation) {
  let current = faction.ranks[0];
  for (const rank of faction.ranks) {
    if (reputation >= rank.minReputation) current = rank;
  }
  return current;
}
function getNextRank(faction, reputation) {
  return faction.ranks.find((rank) => rank.minReputation > reputation) ?? null;
}

// packages/shared/src/factions/factionProgress.ts
function findLastReputationEvent(events, factionId) {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ReputationChanged" && event.factionId === factionId) return event;
  }
  return null;
}
function deriveFactionReputation(factionId, timeline) {
  const event = findLastReputationEvent(timeline.events, factionId);
  return event && event.kind === "ReputationChanged" ? event.newReputation : 0;
}
function deriveFactionProgress(factionId, timeline) {
  const definition = getFactionDefinition(factionId);
  if (!definition) return null;
  const reputation = deriveFactionReputation(factionId, timeline);
  const rank = getRankForReputation(definition, reputation);
  const nextRank = getNextRank(definition, reputation);
  const percentToNextRank = nextRank ? Math.min(100, Math.max(0, Math.floor((reputation - rank.minReputation) / (nextRank.minReputation - rank.minReputation) * 100))) : 100;
  return {
    factionId: definition.id,
    factionName: definition.name,
    reputation,
    rankId: rank.id,
    rankName: rank.name,
    percentToNextRank,
    nextRankName: nextRank?.name ?? null
  };
}
function deriveCurrentFactionProgress(currentRegionId, timeline) {
  const faction = getFactionForRegion(currentRegionId);
  if (!faction) return null;
  return deriveFactionProgress(faction.id, timeline);
}

// packages/shared/src/dungeon/dungeonDefinitions.ts
var DUNGEON_FINAL_BOSS_BY_EXPEDITION = {
  "queda-da-fortaleza-sombria": "forgotten-guardian"
};
function getFinalBossTemplateId(expeditionId) {
  return DUNGEON_FINAL_BOSS_BY_EXPEDITION[expeditionId];
}
function isDungeonExpedition(expeditionId) {
  return expeditionId in DUNGEON_FINAL_BOSS_BY_EXPEDITION;
}

// packages/shared/src/dungeon/dungeonProgress.ts
function deriveDungeonBossProgress(session, timeline) {
  const expeditionSnapshot = deriveExpeditionProgress(session, timeline);
  if (!expeditionSnapshot) return null;
  const bossTemplateId = getFinalBossTemplateId(expeditionSnapshot.expeditionId);
  if (!bossTemplateId) return null;
  const template = getEnemyTemplate(bossTemplateId);
  if (!template) return null;
  const eventsSinceStart = timeline.events.filter((event) => event.tickIndex >= expeditionSnapshot.startTickIndex);
  const encountered = eventsSinceStart.some((event) => event.kind === "FinalBossEncounter" && event.enemyTemplateId === bossTemplateId);
  const defeated = eventsSinceStart.some((event) => event.kind === "FinalBossDefeated" && event.enemyTemplateId === bossTemplateId);
  let healthPercent = null;
  if (session.currentEncounter && session.currentEncounter.variant === "miniboss") {
    const bossEnemy = session.currentEncounter.enemies.find((enemy) => enemy.templateId === bossTemplateId);
    if (bossEnemy) {
      healthPercent = bossEnemy.maximumLife > 0 ? Math.max(0, Math.min(100, bossEnemy.currentLife / bossEnemy.maximumLife * 100)) : 0;
    }
  }
  return {
    enemyTemplateId: bossTemplateId,
    bossName: template.name,
    encountered,
    defeated,
    healthPercent
  };
}

// packages/shared/src/hud/deriveHudState.ts
var DEFAULT_RECENT_EVENT_LIMIT = 20;
function classifyDifficulty(minimumLevel) {
  if (minimumLevel < 10) return "Baixa";
  if (minimumLevel < 25) return "M\xE9dia";
  if (minimumLevel < 45) return "Alta";
  return "Muito Alta";
}
function deriveRegionInfo(regionId) {
  const table = getEncounterTable(regionId);
  const recommendedLevelRange = table ? { ...table.levelRange } : null;
  const biome = getBiomeDefinition(regionId);
  return {
    id: regionId,
    name: getRegionName(regionId),
    recommendedLevelRange,
    difficulty: recommendedLevelRange ? classifyDifficulty(recommendedLevelRange.min) : null,
    // Biomes, Regions & World Progression Phase I — requisito 1: nunca
    // duplica levelRange (já vem de recommendedLevelRange, acima) — só
    // acrescenta o que o BiomeDefinition tem de novo.
    biome: biome ? {
      order: biome.order,
      climate: biome.climate,
      description: biome.description,
      difficultyLabel: biome.difficultyLabel,
      visualTheme: { ...biome.visualTheme }
    } : null
  };
}
function deriveEncounterInfo(session, events) {
  const encounter = session.currentEncounter;
  if (encounter) {
    const enemiesAlive = encounter.enemies.filter((enemy) => enemy.alive).length;
    const auraColor = encounter.variant === "elite" ? ELITE_MODIFIER.auraColor : encounter.variant === "miniboss" ? MINIBOSS_AURA.color : null;
    const auraIcon = encounter.variant === "elite" ? ELITE_MODIFIER.auraIcon : encounter.variant === "miniboss" ? MINIBOSS_AURA.icon : null;
    return {
      state: "em-combate",
      enemiesTotal: encounter.enemies.length,
      enemiesAlive,
      enemiesDefeated: encounter.enemies.length - enemiesAlive,
      variant: encounter.variant,
      auraColor,
      auraIcon
    };
  }
  const lastRelevantEvent = findLast(events, (event) => event.kind === "EncounterFinished" || event.kind === "CharacterDied");
  const state = lastRelevantEvent?.kind === "EncounterFinished" ? "concluido" : "sem-encontro";
  return { state, enemiesTotal: 0, enemiesAlive: 0, enemiesDefeated: 0, variant: "normal", auraColor: null, auraIcon: null };
}
function deriveSessionStatus(session) {
  if (session.character.currentLife <= 0) return "derrota";
  if (session.currentEncounter) return "em-combate";
  return "explorando";
}
function findLast(items, predicate) {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i])) return items[i];
  }
  return void 0;
}
function toRecentLoot(event) {
  if (!event || event.kind !== "LootDropped") return null;
  return {
    instanceId: event.instanceId,
    baseItemId: event.baseItemId,
    rarity: event.rarity,
    powerScore: event.powerScore,
    regionId: event.regionId,
    tickIndex: event.tickIndex
  };
}
function toRecentEquip(event) {
  if (!event || event.kind !== "ItemEquipped") return null;
  return {
    slotId: event.slotId,
    baseItemId: event.baseItemId,
    rarity: event.rarity,
    powerScore: event.powerScore,
    previousPowerScore: event.previousPowerScore,
    delta: event.powerScore - event.previousPowerScore,
    tickIndex: event.tickIndex
  };
}
function toLevelUpInfo(event) {
  if (!event || event.kind !== "LevelUp") return null;
  return { level: event.level, previousLevel: event.previousLevel, tickIndex: event.tickIndex };
}
function toRecentRecovery(event) {
  if (!event || event.kind !== "RecoveryApplied") return null;
  return {
    lifeBefore: event.lifeBefore,
    lifeHealed: event.lifeHealed,
    lifeAfter: event.lifeAfter,
    reason: event.reason,
    tickIndex: event.tickIndex
  };
}
function toObjectiveInfo(session, timeline) {
  const snapshot = deriveObjectiveProgress(session, timeline);
  const percent = snapshot.target > 0 ? Math.min(100, Math.floor(snapshot.progress / snapshot.target * 100)) : 100;
  return {
    id: snapshot.objective.id,
    name: snapshot.objective.name,
    description: snapshot.objective.description,
    progress: Math.min(snapshot.progress, snapshot.target),
    target: snapshot.target,
    percent
  };
}
function toFinalBossInfo(session, timeline) {
  const snapshot = deriveDungeonBossProgress(session, timeline);
  if (!snapshot) return null;
  return {
    bossName: snapshot.bossName,
    encountered: snapshot.encountered,
    defeated: snapshot.defeated,
    healthPercent: snapshot.healthPercent
  };
}
function toExpeditionInfo(session, timeline) {
  const snapshot = deriveExpeditionProgress(session, timeline);
  if (!snapshot) return null;
  return {
    expeditionId: snapshot.expeditionId,
    name: snapshot.name,
    description: snapshot.description,
    difficulty: snapshot.difficulty,
    percent: snapshot.percent,
    checkpointsReached: snapshot.checkpointsReached,
    checkpointsTotal: snapshot.checkpointsTotal,
    encountersCompleted: snapshot.encountersCompleted,
    expectedEncounters: snapshot.expectedEncounters,
    elitesDefeated: snapshot.elitesDefeated,
    miniBossesDefeated: snapshot.miniBossesDefeated,
    worldEventsFound: snapshot.worldEventsFound,
    finalBoss: toFinalBossInfo(session, timeline)
  };
}
function toFactionInfo(session, timeline) {
  const snapshot = deriveCurrentFactionProgress(session.currentRegion, timeline);
  if (!snapshot) return null;
  return {
    factionId: snapshot.factionId,
    factionName: snapshot.factionName,
    reputation: snapshot.reputation,
    rankId: snapshot.rankId,
    rankName: snapshot.rankName,
    percentToNextRank: snapshot.percentToNextRank,
    nextRankName: snapshot.nextRankName
  };
}
function toObjectiveCompletedInfo(event) {
  if (!event || event.kind !== "ObjectiveCompleted") return null;
  return {
    objectiveId: event.objectiveId,
    objectiveName: event.objectiveName,
    xpBonus: event.xpBonus,
    tickIndex: event.tickIndex
  };
}
function toRegionUnlockInfo(event) {
  if (!event || event.kind !== "RegionUnlocked") return null;
  return {
    previousRegionId: event.previousRegionId,
    newRegionId: event.newRegionId,
    newRegionName: getRegionName(event.newRegionId),
    tickIndex: event.tickIndex
  };
}
function toVariantEncounterInfo(event, kind) {
  if (!event || event.kind !== kind) return null;
  return { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, regionId: event.regionId, tickIndex: event.tickIndex };
}
function toVariantDefeatedInfo(event, kind) {
  if (!event || event.kind !== kind) return null;
  return { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, xpBonus: event.xpBonus, tickIndex: event.tickIndex };
}
function toRecentWorldEvent(event, events) {
  if (!event || event.kind !== "WorldEventStarted") return null;
  if (event.tickIndex !== lastTickIndexOf(events)) return null;
  const definition = getExplorationEventDefinition(event.explorationEventId);
  return {
    explorationEventId: event.explorationEventId,
    name: event.name,
    description: definition?.description ?? "",
    category: event.category,
    tickIndex: event.tickIndex
  };
}
function toHudRecentLoot(event) {
  return {
    instanceId: event.instanceId,
    baseItemId: event.baseItemId,
    rarity: event.rarity,
    powerScore: event.powerScore,
    regionId: event.regionId,
    tickIndex: event.tickIndex
  };
}
function deriveBestItem(events) {
  let best = null;
  for (const event of events) {
    if (event.kind === "LootDropped" && (!best || event.powerScore > best.powerScore)) {
      best = event;
    }
  }
  return best ? toHudRecentLoot(best) : null;
}
function lastTickIndexOf(events) {
  return events.length > 0 ? events[events.length - 1].tickIndex : null;
}
function deriveNewBestItemEvent(events) {
  const tickIndex = lastTickIndexOf(events);
  if (tickIndex === null) return null;
  let previousBest = -Infinity;
  let bestThisTick = null;
  for (const event of events) {
    if (event.kind !== "LootDropped") continue;
    if (event.tickIndex === tickIndex) {
      if (!bestThisTick || event.powerScore > bestThisTick.powerScore) bestThisTick = event;
    } else if (event.powerScore > previousBest) {
      previousBest = event.powerScore;
    }
  }
  return bestThisTick && bestThisTick.powerScore > previousBest ? toHudRecentLoot(bestThisTick) : null;
}
function deriveNewDamageRecordEvent(events) {
  const tickIndex = lastTickIndexOf(events);
  if (tickIndex === null) return null;
  let previousBest = -Infinity;
  let bestThisTick = null;
  for (const event of events) {
    if (event.kind !== "AttackHit") continue;
    if (event.tickIndex === tickIndex) {
      if (!bestThisTick || event.damageDealt > bestThisTick.damageDealt) bestThisTick = event;
    } else if (event.damageDealt > previousBest) {
      previousBest = event.damageDealt;
    }
  }
  return bestThisTick && bestThisTick.damageDealt > previousBest ? { damageDealt: bestThisTick.damageDealt, tickIndex: bestThisTick.tickIndex } : null;
}
function deriveSessionSummary(session, timeline) {
  if (session.character.currentLife > 0) return null;
  const statistics = session.statistics;
  return {
    elapsedTime: statistics.elapsedTime,
    enemiesKilled: statistics.enemiesKilled,
    damageDealt: statistics.damageDealt,
    damageTaken: statistics.damageTaken,
    itemsFound: statistics.itemsFound,
    itemsEquipped: statistics.itemsEquipped,
    xpGained: timeline.totalXpGranted
  };
}
function deriveSessionHistory(session, events) {
  const statistics = session.statistics;
  const encountersStarted = events.filter((event) => event.kind === "EncounterStarted").length;
  const survivalRate = encountersStarted > 0 ? Math.min(100, statistics.encountersCompleted / encountersStarted * 100) : 100;
  const elapsedSeconds = statistics.elapsedTime / 1e3;
  const averageDps = elapsedSeconds > 0 ? statistics.damageDealt / elapsedSeconds : 0;
  const damagePerEncounter = statistics.encountersCompleted > 0 ? statistics.damageTaken / statistics.encountersCompleted : 0;
  const itemsPerEncounter = statistics.encountersCompleted > 0 ? statistics.itemsFound / statistics.encountersCompleted : 0;
  return {
    encountersCompleted: statistics.encountersCompleted,
    encountersStarted,
    survivalRate,
    averageDps,
    damagePerEncounter,
    itemsPerEncounter
  };
}
function deriveHudState(session, timeline, options = {}) {
  const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
  const events = timeline.events;
  const lastLootEvent = findLast(events, (event) => event.kind === "LootDropped");
  const lastEquipEvent = findLast(events, (event) => event.kind === "ItemEquipped");
  const lastAttackHitEvent = findLast(events, (event) => event.kind === "AttackHit");
  const lastLevelUpEvent = findLast(events, (event) => event.kind === "LevelUp");
  const lastRecoveryEvent = findLast(events, (event) => event.kind === "RecoveryApplied");
  const lastObjectiveCompletedEvent = findLast(events, (event) => event.kind === "ObjectiveCompleted");
  const lastRegionUnlockEvent = findLast(events, (event) => event.kind === "RegionUnlocked");
  const lastEliteEncounterEvent = findLast(events, (event) => event.kind === "EliteEncounter");
  const lastMiniBossEncounterEvent = findLast(events, (event) => event.kind === "MiniBossEncounter");
  const lastEliteDefeatedEvent = findLast(events, (event) => event.kind === "EliteDefeated");
  const lastMiniBossDefeatedEvent = findLast(events, (event) => event.kind === "MiniBossDefeated");
  const lastWorldEventStartedEvent = findLast(events, (event) => event.kind === "WorldEventStarted");
  const recentEventLimit = options.recentEventLimit ?? DEFAULT_RECENT_EVENT_LIMIT;
  return {
    currentLife: session.character.currentLife,
    maximumLife: finalStats.maximumLife,
    region: deriveRegionInfo(session.currentRegion),
    encounter: deriveEncounterInfo(session, events),
    recentLoot: toRecentLoot(lastLootEvent),
    recentEquip: toRecentEquip(lastEquipEvent),
    lastDamageTaken: lastAttackHitEvent && lastAttackHitEvent.kind === "AttackHit" ? lastAttackHitEvent.damageTaken : null,
    lastDamageDealt: lastAttackHitEvent && lastAttackHitEvent.kind === "AttackHit" ? lastAttackHitEvent.damageDealt : null,
    sessionStatus: deriveSessionStatus(session),
    elapsedTime: session.statistics.elapsedTime,
    statistics: { ...session.statistics },
    recentEvents: events.slice(-recentEventLimit),
    xpProgress: getProgress(session.character.characterBuild.experience),
    recentLevelUp: toLevelUpInfo(lastLevelUpEvent),
    bestItemFound: deriveBestItem(events),
    newBestItemEvent: deriveNewBestItemEvent(events),
    newDamageRecordEvent: deriveNewDamageRecordEvent(events),
    sessionSummary: deriveSessionSummary(session, timeline),
    sessionHistory: deriveSessionHistory(session, events),
    recentRecovery: toRecentRecovery(lastRecoveryEvent),
    currentObjective: toObjectiveInfo(session, timeline),
    recentObjectiveCompleted: toObjectiveCompletedInfo(lastObjectiveCompletedEvent),
    recentRegionUnlock: toRegionUnlockInfo(lastRegionUnlockEvent),
    recentEliteEncounter: toVariantEncounterInfo(lastEliteEncounterEvent, "EliteEncounter"),
    recentMiniBossEncounter: toVariantEncounterInfo(lastMiniBossEncounterEvent, "MiniBossEncounter"),
    recentEliteDefeated: toVariantDefeatedInfo(lastEliteDefeatedEvent, "EliteDefeated"),
    recentMiniBossDefeated: toVariantDefeatedInfo(lastMiniBossDefeatedEvent, "MiniBossDefeated"),
    recentWorldEvent: toRecentWorldEvent(lastWorldEventStartedEvent, events),
    expedition: toExpeditionInfo(session, timeline),
    faction: toFactionInfo(session, timeline)
  };
}

// packages/shared/src/animation/presets.ts
var ANIMATION_PRESETS = {
  "enemy-hit": { type: "enemy-hit", duration: 300, priority: 10, shake: 4, opacity: 0.7 },
  "enemy-critical-hit": { type: "enemy-critical-hit", duration: 420, priority: 15, shake: 9, opacity: 0.6, scale: 1.1 },
  "enemy-miss": { type: "enemy-miss", duration: 250, priority: 5, opacity: 0.9 },
  "enemy-boss-hit": { type: "enemy-boss-hit", duration: 500, priority: 18, shake: 14, opacity: 0.5, scale: 1.15 },
  "enemy-elite-hit": { type: "enemy-elite-hit", duration: 400, priority: 16, shake: 10, opacity: 0.6, scale: 1.1 },
  "character-hit": { type: "character-hit", duration: 350, priority: 20, offset: 6, opacity: 0.6 },
  "enemy-death": { type: "enemy-death", duration: 600, priority: 12, scale: 0, opacity: 0 },
  "enemy-death-explosion": { type: "enemy-death-explosion", duration: 700, priority: 14, scale: 1.4, opacity: 0 },
  "enemy-death-ragdoll": { type: "enemy-death-ragdoll", duration: 800, priority: 14, offset: 20, opacity: 0 },
  "enemy-death-dissolve": { type: "enemy-death-dissolve", duration: 900, priority: 14, opacity: 0 },
  "loot-drop-common": { type: "loot-drop-common", duration: 800, priority: 8, offset: -12 },
  "loot-drop-magic": { type: "loot-drop-magic", duration: 850, priority: 8, offset: -14, scale: 1.05 },
  // Requisito 10, exemplo literal "Loot Rare".
  "loot-drop-rare": { type: "loot-drop-rare", duration: 900, priority: 9, offset: -16, scale: 1.1 },
  // Requisito 10, exemplo literal "Loot Unique".
  "loot-drop-unique": { type: "loot-drop-unique", duration: 1100, priority: 11, offset: -20, scale: 1.2 },
  "equipment-pulse-upgrade": { type: "equipment-pulse-upgrade", duration: 500, priority: 9, scale: 1.08 },
  "equipment-pulse-downgrade": { type: "equipment-pulse-downgrade", duration: 500, priority: 9, scale: 0.95 },
  "equipment-pulse-neutral": { type: "equipment-pulse-neutral", duration: 400, priority: 7, scale: 1.02 },
  "floating-number-damage": { type: "floating-number-damage", duration: 900, priority: 6, offset: -24, opacity: 0 },
  "floating-number-critical": { type: "floating-number-critical", duration: 1e3, priority: 13, offset: -30, opacity: 0, scale: 1.3 },
  "floating-number-miss": { type: "floating-number-miss", duration: 700, priority: 4, offset: -16, opacity: 0 },
  "floating-number-heal": { type: "floating-number-heal", duration: 900, priority: 6, offset: -24, opacity: 0 },
  "floating-number-lifeLeech": { type: "floating-number-lifeLeech", duration: 900, priority: 6, offset: -24, opacity: 0 },
  // Requisito 10, exemplo literal "Character Death".
  "character-death": { type: "character-death", duration: 1200, priority: 25, scale: 0.9, opacity: 0.2 },
  // Progression & Player Retention Phase I — requisito 2: duração mais
  // longa de propósito (celebração, não reação de combate) — prioridade
  // alta o bastante pra não ser descartada por um hit simultâneo, mas
  // abaixo de Character Death (o único evento que deve sempre vencer).
  "level-up": { type: "level-up", duration: 1600, priority: 22, scale: 1.15, opacity: 1 },
  // Objectives, Missions & Player Goals Phase I — requisito 8: mesma
  // duração/prioridade de "level-up" (celebração equivalente), um
  // pouco abaixo pra nunca competir com um Level Up simultâneo.
  "objective-completed": { type: "objective-completed", duration: 1500, priority: 21, scale: 1.12, opacity: 1 },
  // Biomes, Regions & World Progression Phase I — requisito 7: a
  // celebração mais longa/de maior prioridade de todas (evento raro,
  // acontece só uma vez por bioma) — ainda abaixo de Character Death.
  "region-unlocked": { type: "region-unlocked", duration: 1800, priority: 23, scale: 1.2, opacity: 1 },
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: banners de
  // surgimento (Elite < Mini-Boss em duração/prioridade, mesma lógica
  // de "objective-completed" < "region-unlocked" — Mini-Boss é o evento
  // mais raro/mais grave dos dois) e de derrota (levemente abaixo do
  // banner de surgimento correspondente).
  "elite-encounter": { type: "elite-encounter", duration: 1400, priority: 19, scale: 1.1, opacity: 1 },
  "miniboss-encounter": { type: "miniboss-encounter", duration: 1700, priority: 22, scale: 1.18, opacity: 1 },
  "elite-defeated": { type: "elite-defeated", duration: 1300, priority: 17, scale: 1.1, opacity: 1 },
  "miniboss-defeated": { type: "miniboss-defeated", duration: 1600, priority: 21, scale: 1.15, opacity: 1 },
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 7: duração/prioridade mais discretas que Elite/Mini-Boss (evento
  // frequente e de baixo risco, não uma celebração rara) — ainda acima
  // de "loot-drop-common" (a categoria Ambush já dispara os presets de
  // combate normais por cima, então este banner só precisa se destacar
  // sobre eles brevemente).
  "world-event-discovered": { type: "world-event-discovered", duration: 1200, priority: 15, scale: 1.05, opacity: 1 },
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 8: checkpoint é um marco frequente dentro de UMA
  // expedição (prioridade moderada); conclusão é o evento mais raro/
  // celebrado (prioridade alta, só abaixo de Character Death); falha
  // é discreta (a própria morte já tem seu próprio "character-death").
  "expedition-checkpoint": { type: "expedition-checkpoint", duration: 1500, priority: 20, scale: 1.1, opacity: 1 },
  "expedition-completed": { type: "expedition-completed", duration: 2e3, priority: 24, scale: 1.25, opacity: 1 },
  "expedition-failed": { type: "expedition-failed", duration: 1400, priority: 16, scale: 1, opacity: 1 },
  // Factions, Reputation & World Consequences Phase I — requisito 6:
  // duração/prioridade equivalentes a "objective-completed" (celebração
  // de progressão de longo prazo, não um marco de sessão única como
  // Expedição/Região).
  "faction-rank-up": { type: "faction-rank-up", duration: 1600, priority: 21, scale: 1.12, opacity: 1 },
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 9: o topo da hierarquia de prioridade de toda a Sprint — "surge"
  // (acima de miniboss-encounter) < "derrotado" (acima de
  // expedition-completed) < "Dungeon concluída" (o evento mais raro/
  // dramático possível, sempre vence qualquer banner simultâneo).
  "final-boss-encounter": { type: "final-boss-encounter", duration: 1900, priority: 23, scale: 1.2, opacity: 1 },
  "final-boss-defeated": { type: "final-boss-defeated", duration: 2200, priority: 26, scale: 1.3, opacity: 1 },
  "dungeon-completed": { type: "dungeon-completed", duration: 2600, priority: 27, scale: 1.4, opacity: 1 }
};
function getAnimationPreset(type) {
  return ANIMATION_PRESETS[type];
}

// packages/shared/src/animation/handlers.ts
var sequenceCounter = 0;
function nextAnimationId() {
  sequenceCounter += 1;
  return `anim-${sequenceCounter}`;
}
function makeAnimation(type, timestamp, payload) {
  const preset = getAnimationPreset(type);
  return {
    id: nextAnimationId(),
    type,
    timestamp,
    duration: preset.duration,
    priority: preset.priority,
    payload
  };
}
var LOOT_ANIMATION_BY_RARITY = {
  common: "loot-drop-common",
  magic: "loot-drop-magic",
  rare: "loot-drop-rare",
  unique: "loot-drop-unique"
};
function animationsForPresentationEvent(event, timestamp) {
  switch (event.kind) {
    case "EnemyKilled":
      return [makeAnimation("enemy-death", timestamp, { count: event.count })];
    case "LootDropped": {
      const type = LOOT_ANIMATION_BY_RARITY[event.rarity] ?? "loot-drop-common";
      return [
        makeAnimation(type, timestamp, {
          instanceId: event.instanceId,
          baseItemId: event.baseItemId,
          rarity: event.rarity,
          powerScore: event.powerScore,
          regionId: event.regionId
        })
      ];
    }
    case "ItemEquipped": {
      const delta = event.powerScore - event.previousPowerScore;
      const type = delta > 0 ? "equipment-pulse-upgrade" : delta < 0 ? "equipment-pulse-downgrade" : "equipment-pulse-neutral";
      return [
        makeAnimation(type, timestamp, {
          slotId: event.slotId,
          baseItemId: event.baseItemId,
          rarity: event.rarity,
          powerScore: event.powerScore,
          previousPowerScore: event.previousPowerScore,
          delta
        })
      ];
    }
    case "CharacterDied":
      return [makeAnimation("character-death", timestamp, {})];
    // Progression & Player Retention Phase I — requisito 2: consome só
    // os dados já existentes no próprio LevelUpEvent (Presentation
    // Layer), nenhum cálculo novo de progressão aqui.
    case "LevelUp":
      return [makeAnimation("level-up", timestamp, { level: event.level, previousLevel: event.previousLevel })];
    // Objectives, Missions & Player Goals Phase I — requisito 8:
    // consome só os dados já existentes no próprio ObjectiveCompleted
    // (Objective System), nenhum cálculo novo.
    case "ObjectiveCompleted":
      return [
        makeAnimation("objective-completed", timestamp, {
          objectiveId: event.objectiveId,
          objectiveName: event.objectiveName,
          xpBonus: event.xpBonus
        })
      ];
    // Biomes, Regions & World Progression Phase I — requisito 7: banner
    // de desbloqueio; "RegionEntered" (a mesma tick, sempre junto) não
    // tem animação própria — já fica registrado no feed de eventos.
    case "RegionUnlocked":
      return [makeAnimation("region-unlocked", timestamp, { previousRegionId: event.previousRegionId, newRegionId: event.newRegionId })];
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: consome
    // só os dados já existentes no próprio evento (Presentation Layer),
    // nenhum cálculo novo.
    case "EliteEncounter":
      return [makeAnimation("elite-encounter", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, regionId: event.regionId })];
    case "MiniBossEncounter":
      return [makeAnimation("miniboss-encounter", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, regionId: event.regionId })];
    case "EliteDefeated":
      return [makeAnimation("elite-defeated", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, xpBonus: event.xpBonus })];
    case "MiniBossDefeated":
      return [makeAnimation("miniboss-defeated", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, xpBonus: event.xpBonus })];
    // World Events, Dynamic Encounters & Exploration Phase I —
    // requisito 7: banner dispara em "WorldEventStarted" (o "surgiu"),
    // mesmo padrão de EliteEncounter/MiniBossEncounter. A recompensa em
    // si (loot/cura) já ganha feedback pelas animações EXISTENTES
    // (loot-drop-*/floating-number-heal, disparadas pelos próprios
    // LootDropped/floating number "heal" que presentationLayer.ts já
    // produz) — "sem lógica nova" pro requisito 7 também vale aqui.
    // WorldEventCompleted/TreasureOpened/MerchantFound/ShrineBlessing/
    // DiscoveryMade/AmbushTriggered não precisam de animação própria.
    case "WorldEventStarted":
      return [makeAnimation("world-event-discovered", timestamp, { explorationEventId: event.explorationEventId, name: event.name, category: event.category })];
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 8: consome só os dados já existentes no próprio evento
    // (expeditions/expeditionController.ts), nenhum cálculo novo.
    // "ExpeditionStarted" não tem animação própria (só registrado no
    // feed) — mesmo tratamento de "RegionEntered".
    case "ExpeditionCheckpointReached":
      return [
        makeAnimation("expedition-checkpoint", timestamp, {
          expeditionId: event.expeditionId,
          checkpointIndex: event.checkpointIndex,
          checkpointsTotal: event.checkpointsTotal,
          recoveryAmount: event.recoveryAmount
        })
      ];
    case "ExpeditionCompleted":
      return [
        makeAnimation("expedition-completed", timestamp, {
          expeditionId: event.expeditionId,
          name: event.name,
          xpAmount: event.xpAmount,
          goldAmount: event.goldAmount
        })
      ];
    case "ExpeditionFailed":
      return [makeAnimation("expedition-failed", timestamp, { expeditionId: event.expeditionId, name: event.name })];
    // Factions, Reputation & World Consequences Phase I — requisito 6:
    // consome só os dados já existentes no próprio evento
    // (factions/factionController.ts), nenhum cálculo novo.
    // "ReputationChanged" não tem animação própria (só registrado no
    // feed) — mesmo tratamento de "ExpeditionStarted"/"RegionEntered".
    case "ReputationRankUp":
      return [
        makeAnimation("faction-rank-up", timestamp, {
          factionId: event.factionId,
          factionName: event.factionName,
          rankId: event.rankId,
          rankName: event.rankName,
          xpBonusPercent: event.xpBonusPercent,
          goldBonusPercent: event.goldBonusPercent
        })
      ];
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 9: consome só os dados já existentes no próprio evento
    // (dungeon/dungeonController.ts), nenhum cálculo novo.
    case "FinalBossEncounter":
      return [
        makeAnimation("final-boss-encounter", timestamp, {
          enemyTemplateId: event.enemyTemplateId,
          enemyName: event.enemyName,
          regionId: event.regionId
        })
      ];
    case "FinalBossDefeated":
      return [
        makeAnimation("final-boss-defeated", timestamp, {
          enemyTemplateId: event.enemyTemplateId,
          enemyName: event.enemyName,
          xpAmount: event.xpAmount,
          goldAmount: event.goldAmount
        })
      ];
    case "DungeonCompleted":
      return [
        makeAnimation("dungeon-completed", timestamp, {
          expeditionId: event.expeditionId,
          name: event.name,
          bossName: event.bossName,
          xpAmount: event.xpAmount,
          goldAmount: event.goldAmount
        })
      ];
    default:
      return [];
  }
}
var FLOATING_NUMBER_ANIMATION = {
  damage: "floating-number-damage",
  critical: "floating-number-critical",
  miss: "floating-number-miss",
  heal: "floating-number-heal",
  lifeLeech: "floating-number-lifeLeech"
};
function animationsForFloatingNumber(event, timestamp) {
  const animations = [];
  if (event.kind === "damage" || event.kind === "critical" || event.kind === "miss") {
    const hitType = event.target === "enemy" ? event.kind === "critical" ? "enemy-critical-hit" : event.kind === "miss" ? "enemy-miss" : "enemy-hit" : "character-hit";
    animations.push(makeAnimation(hitType, timestamp, { value: event.value, target: event.target }));
  }
  animations.push(makeAnimation(FLOATING_NUMBER_ANIMATION[event.kind], timestamp, { value: event.value, target: event.target }));
  return animations;
}
function buildAnimationsForTick(events, floatingNumbers, baseTimestamp) {
  const result = [];
  let cursor = baseTimestamp;
  for (const floatingNumber of floatingNumbers) {
    const animations = animationsForFloatingNumber(floatingNumber, cursor);
    result.push(...animations);
    cursor += Math.max(...animations.map((animation) => animation.duration));
  }
  for (const event of events) {
    const animations = animationsForPresentationEvent(event, cursor);
    if (animations.length === 0) continue;
    result.push(...animations);
    cursor += Math.max(...animations.map((animation) => animation.duration));
  }
  return result;
}

// packages/shared/src/animation/controller.ts
var AnimationController = class {
  queued = [];
  active = [];
  // Requisito 1 — enfileira animações já prontas (produzidas por
  // buildAnimationsForTick()); mantém a fila ordenada por timestamp,
  // com `priority` como desempate — "a fila nunca poderá modificar
  // gameplay, ela apenas agenda apresentação".
  enqueue(animations) {
    this.queued.push(...animations);
    this.queued.sort((a, b) => a.timestamp - b.timestamp || b.priority - a.priority);
  }
  // Requisito 2 — processa a fila pra um instante `now`: promove pra
  // "ativo" tudo cujo timestamp já chegou, e remove de "ativo" tudo
  // cuja duração já terminou. Puro — nunca lê relógio sozinho, `now`
  // sempre vem de fora (determinístico, testável sem esperar tempo
  // real passar).
  tick(now) {
    const started = [];
    const stillQueued = [];
    for (const animation of this.queued) {
      if (animation.timestamp <= now) {
        started.push(animation);
        this.active.push(animation);
      } else {
        stillQueued.push(animation);
      }
    }
    this.queued = stillQueued;
    const finished = [];
    const stillActive = [];
    for (const animation of this.active) {
      if (animation.timestamp + animation.duration <= now) {
        finished.push(animation);
      } else {
        stillActive.push(animation);
      }
    }
    this.active = stillActive;
    return { started, finished };
  }
  // Requisito 2/11 — "cancelável": remove uma animação específica da
  // fila ou de ativas, em qualquer estado. Devolve `false` sem efeito
  // nenhum se o id não existir (nunca lança).
  cancel(id) {
    const queuedIndex = this.queued.findIndex((animation) => animation.id === id);
    if (queuedIndex !== -1) {
      this.queued.splice(queuedIndex, 1);
      return true;
    }
    const activeIndex = this.active.findIndex((animation) => animation.id === id);
    if (activeIndex !== -1) {
      this.active.splice(activeIndex, 1);
      return true;
    }
    return false;
  }
  // Requisito 2 — "limpar fila": esvazia tudo de uma vez (ex.: ao
  // reiniciar a Adventure Session).
  clear() {
    this.queued = [];
    this.active = [];
  }
  getSnapshot() {
    return { queued: [...this.queued], active: [...this.active] };
  }
};

// packages/shared/src/recovery/config.ts
var RECOVERY_CONFIG = {
  type: "percent-of-max-life",
  percentOfMaxLife: 0.011
};

// packages/shared/src/recovery/recoveryLayer.ts
function resolveHealAmount(config, maximumLife) {
  const type = config.type;
  switch (type) {
    case "percent-of-max-life":
      return maximumLife * (config.percentOfMaxLife ?? 0);
    case "fixed":
    case "level-based":
    case "rarity-based":
      return 0;
    default:
      return 0;
  }
}
function advanceAdventureWithRecovery(session, timeline, options = {}, config = RECOVERY_CONFIG) {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers } = advanceAdventureWithPresentation(session, timeline, options);
  const tickIndex = timeline.nextTickIndex - 1;
  const encounterFinished = events.some((event) => event.kind === "EncounterFinished");
  let recovery = {
    applied: false,
    reason: "encounter-finished",
    lifeBefore: session.character.currentLife,
    lifeHealed: 0,
    lifeAfter: session.character.currentLife,
    tickIndex
  };
  if (encounterFinished && tickResult.characterAlive) {
    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    const healAmount = resolveHealAmount(config, finalStats.maximumLife);
    const lifeBefore = session.character.currentLife;
    const lifeAfter = Math.min(finalStats.maximumLife, lifeBefore + healAmount);
    const lifeHealed = lifeAfter - lifeBefore;
    if (lifeHealed > 0) {
      session.character.currentLife = lifeAfter;
      recovery = { applied: true, reason: "encounter-finished", lifeBefore, lifeHealed, lifeAfter, tickIndex };
      const recoveryEvent = {
        kind: "RecoveryApplied",
        lifeBefore,
        lifeHealed,
        lifeAfter,
        reason: recovery.reason,
        tickIndex,
        timestamp
      };
      events.push(recoveryEvent);
      timeline.events.push(recoveryEvent);
      floatingNumbers.push({ kind: "heal", value: lifeHealed, target: "character", tickIndex, timestamp });
    }
  }
  return { tickResult, events, floatingNumbers, recovery };
}

// packages/shared/src/objectives/objectiveLayer.ts
function advanceAdventureWithObjectives(session, timeline, options = {}) {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers, recovery } = advanceAdventureWithRecovery(session, timeline, options);
  let objective = deriveObjectiveProgress(session, timeline);
  if (objective.complete) {
    const xpBonus = objective.objective.reward.xpBonus ?? 0;
    if (xpBonus > 0) {
      session.character.characterBuild.addExperience(xpBonus);
    }
    const tickIndex = timeline.nextTickIndex - 1;
    const completedEvent = {
      kind: "ObjectiveCompleted",
      objectiveId: objective.objective.id,
      objectiveName: objective.objective.name,
      xpBonus,
      tickIndex,
      timestamp
    };
    events.push(completedEvent);
    timeline.events.push(completedEvent);
    objective = deriveObjectiveProgress(session, timeline);
  }
  if (tickResult.characterAlive && !session.currentEncounter) {
    const unlockCheck = checkRegionUnlock(session.currentRegion, session.character.characterBuild.level, timeline.unlockedRegionIds);
    if (unlockCheck.unlocked && unlockCheck.newRegionId) {
      const previousRegionId = session.currentRegion;
      timeline.unlockedRegionIds.push(unlockCheck.newRegionId);
      session.currentRegion = unlockCheck.newRegionId;
      const tickIndex = timeline.nextTickIndex - 1;
      const unlockedEvent = {
        kind: "RegionUnlocked",
        previousRegionId,
        newRegionId: unlockCheck.newRegionId,
        tickIndex,
        timestamp
      };
      const enteredEvent = {
        kind: "RegionEntered",
        regionId: unlockCheck.newRegionId,
        tickIndex,
        timestamp
      };
      events.push(unlockedEvent, enteredEvent);
      timeline.events.push(unlockedEvent, enteredEvent);
      objective = deriveObjectiveProgress(session, timeline);
    }
  }
  return { tickResult, events, floatingNumbers, recovery, objective };
}

// packages/shared/src/expeditions/expeditionController.ts
var CHECKPOINT_RECOVERY_MULTIPLIER = 5;
function advanceExpeditionTick(session, timeline, options = {}) {
  const timestamp = options.currentTime ?? Date.now();
  const beforeExpedition = deriveExpeditionProgress(session, timeline);
  const { tickResult, events, floatingNumbers, recovery, objective } = advanceAdventureWithObjectives(session, timeline, options);
  const tickIndex = timeline.nextTickIndex - 1;
  if (!beforeExpedition) {
    const seed = session.seed + tickIndex;
    const definitionId = selectExpeditionDefinitionId(seed, session.currentRegion);
    if (definitionId) {
      const definition = getExpeditionDefinition(definitionId);
      const startedEvent = {
        kind: "ExpeditionStarted",
        expeditionId: definition.id,
        name: definition.name,
        regionId: session.currentRegion,
        tickIndex,
        timestamp
      };
      events.push(startedEvent);
      timeline.events.push(startedEvent);
    }
  }
  const afterExpedition = deriveExpeditionProgress(session, timeline);
  if (afterExpedition) {
    const beforeCheckpoints = beforeExpedition && beforeExpedition.expeditionId === afterExpedition.expeditionId ? beforeExpedition.checkpointsReached : 0;
    if (afterExpedition.checkpointsReached > beforeCheckpoints) {
      const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
      const lifeBefore = session.character.currentLife;
      const healAmount = finalStats.maximumLife * (RECOVERY_CONFIG.percentOfMaxLife ?? 0) * CHECKPOINT_RECOVERY_MULTIPLIER;
      const lifeAfter = Math.min(finalStats.maximumLife, lifeBefore + healAmount);
      const recoveryAmount = lifeAfter - lifeBefore;
      session.character.currentLife = lifeAfter;
      const checkpointEvent = {
        kind: "ExpeditionCheckpointReached",
        expeditionId: afterExpedition.expeditionId,
        checkpointIndex: afterExpedition.checkpointsReached,
        checkpointsTotal: afterExpedition.checkpointsTotal,
        recoveryAmount,
        tickIndex,
        timestamp
      };
      events.push(checkpointEvent);
      timeline.events.push(checkpointEvent);
      if (recoveryAmount > 0) {
        floatingNumbers.push({ kind: "heal", value: recoveryAmount, target: "character", tickIndex, timestamp });
      }
    }
    if (afterExpedition.complete) {
      const definition = getExpeditionDefinition(afterExpedition.expeditionId);
      const xpAmount = definition.reward.xpAmount ?? 0;
      const goldAmount = definition.reward.goldAmount ?? 0;
      if (xpAmount > 0) session.character.characterBuild.addExperience(xpAmount);
      if (goldAmount > 0) session.statistics.goldFound += goldAmount;
      const completedEvent = {
        kind: "ExpeditionCompleted",
        expeditionId: definition.id,
        name: definition.name,
        encountersCompleted: afterExpedition.encountersCompleted,
        elitesDefeated: afterExpedition.elitesDefeated,
        miniBossesDefeated: afterExpedition.miniBossesDefeated,
        worldEventsFound: afterExpedition.worldEventsFound,
        diedDuringExpedition: afterExpedition.diedDuringExpedition,
        xpAmount,
        goldAmount,
        tickIndex,
        timestamp
      };
      events.push(completedEvent);
      timeline.events.push(completedEvent);
    } else if (!tickResult.characterAlive) {
      const definition = getExpeditionDefinition(afterExpedition.expeditionId);
      const failedEvent = {
        kind: "ExpeditionFailed",
        expeditionId: definition.id,
        name: definition.name,
        encountersCompleted: afterExpedition.encountersCompleted,
        tickIndex,
        timestamp
      };
      events.push(failedEvent);
      timeline.events.push(failedEvent);
    }
  }
  return { tickResult, events, floatingNumbers, recovery, objective };
}

// packages/shared/src/factions/factionController.ts
var ELITE_DEFEATED_FACTION_ID = "guardioes-da-floresta";
var ELITE_DEFEATED_REPUTATION = 4;
var MINIBOSS_DEFEATED_FACTION_ID = "legiao-sombria";
var MINIBOSS_DEFEATED_REPUTATION = 10;
var DISCOVERY_MADE_FACTION_ID = "culto-das-ruinas";
var DISCOVERY_MADE_REPUTATION = 8;
var MERCHANT_FOUND_FACTION_ID = "mercadores-livres";
var MERCHANT_FOUND_REPUTATION = 5;
var EXPEDITION_COMPLETED_REPUTATION = 15;
function applyReputationChange(timeline, events, factionId, amount, reason, tickIndex, timestamp, xpBonusGranted = 0, goldBonusGranted = 0) {
  const definition = getFactionDefinition(factionId);
  if (!definition) return;
  const before = deriveFactionReputation(factionId, timeline);
  const after = before + amount;
  const changedEvent = {
    kind: "ReputationChanged",
    factionId: definition.id,
    factionName: definition.name,
    delta: amount,
    newReputation: after,
    reason,
    xpBonusGranted,
    goldBonusGranted,
    tickIndex,
    timestamp
  };
  events.push(changedEvent);
  timeline.events.push(changedEvent);
  const rankBefore = getRankForReputation(definition, before);
  const rankAfter = getRankForReputation(definition, after);
  if (rankAfter.id !== rankBefore.id) {
    const rankUpEvent = {
      kind: "ReputationRankUp",
      factionId: definition.id,
      factionName: definition.name,
      rankId: rankAfter.id,
      rankName: rankAfter.name,
      xpBonusPercent: rankAfter.reward.xpBonusPercent ?? 0,
      goldBonusPercent: rankAfter.reward.goldBonusPercent ?? 0,
      tickIndex,
      timestamp
    };
    events.push(rankUpEvent);
    timeline.events.push(rankUpEvent);
  }
}
function advanceFactionTick(session, timeline, options = {}) {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers, recovery, objective } = advanceExpeditionTick(session, timeline, options);
  const tickIndex = timeline.nextTickIndex - 1;
  const tickEvents = [...events];
  for (const event of tickEvents) {
    if (event.kind === "EliteDefeated") {
      applyReputationChange(timeline, events, ELITE_DEFEATED_FACTION_ID, ELITE_DEFEATED_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "MiniBossDefeated") {
      applyReputationChange(timeline, events, MINIBOSS_DEFEATED_FACTION_ID, MINIBOSS_DEFEATED_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "DiscoveryMade") {
      applyReputationChange(timeline, events, DISCOVERY_MADE_FACTION_ID, DISCOVERY_MADE_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "MerchantFound") {
      applyReputationChange(timeline, events, MERCHANT_FOUND_FACTION_ID, MERCHANT_FOUND_REPUTATION, event.kind, tickIndex, timestamp);
    } else if (event.kind === "ExpeditionCompleted") {
      const expeditionDefinition = getExpeditionDefinition(event.expeditionId);
      const faction = expeditionDefinition ? getFactionForRegion(expeditionDefinition.startBiome) : void 0;
      if (faction) {
        const reputationBefore = deriveFactionReputation(faction.id, timeline);
        const rank = getRankForReputation(faction, reputationBefore);
        const xpBonus = Math.round(event.xpAmount * (rank.reward.xpBonusPercent ?? 0) / 100);
        const goldBonus = Math.round(event.goldAmount * (rank.reward.goldBonusPercent ?? 0) / 100);
        if (xpBonus > 0) session.character.characterBuild.addExperience(xpBonus);
        if (goldBonus > 0) session.statistics.goldFound += goldBonus;
        applyReputationChange(timeline, events, faction.id, EXPEDITION_COMPLETED_REPUTATION, event.kind, tickIndex, timestamp, xpBonus, goldBonus);
      }
    }
  }
  return { tickResult, events, floatingNumbers, recovery, objective };
}

// packages/shared/src/dungeon/dungeonController.ts
var FINAL_BOSS_XP_REWARD = 800;
var FINAL_BOSS_GOLD_REWARD = 250;
var FINAL_BOSS_REPUTATION = 30;
var FINAL_BOSS_LOOT_SEED_OFFSET = 7001;
var FINAL_BOSS_LOOT_TABLE_FALLBACK = "final-boss-relic";
var FINAL_BOSS_UNIQUE_BIAS = 6;
function findMostRecentExpeditionId(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionStarted") return event.expeditionId;
  }
  return null;
}
function findExpeditionStartTick(events, expeditionId) {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionStarted" && event.expeditionId === expeditionId) return event.tickIndex;
  }
  return null;
}
function applyDungeonReputationChange(timeline, events, factionId, amount, reason, tickIndex, timestamp) {
  const definition = getFactionDefinition(factionId);
  if (!definition) return;
  const before = deriveFactionReputation(factionId, timeline);
  const after = before + amount;
  const changedEvent = {
    kind: "ReputationChanged",
    factionId: definition.id,
    factionName: definition.name,
    delta: amount,
    newReputation: after,
    reason,
    xpBonusGranted: 0,
    goldBonusGranted: 0,
    tickIndex,
    timestamp
  };
  events.push(changedEvent);
  timeline.events.push(changedEvent);
  const rankBefore = getRankForReputation(definition, before);
  const rankAfter = getRankForReputation(definition, after);
  if (rankAfter.id !== rankBefore.id) {
    const rankUpEvent = {
      kind: "ReputationRankUp",
      factionId: definition.id,
      factionName: definition.name,
      rankId: rankAfter.id,
      rankName: rankAfter.name,
      xpBonusPercent: rankAfter.reward.xpBonusPercent ?? 0,
      goldBonusPercent: rankAfter.reward.goldBonusPercent ?? 0,
      tickIndex,
      timestamp
    };
    events.push(rankUpEvent);
    timeline.events.push(rankUpEvent);
  }
}
function advanceDungeonTick(session, timeline, options = {}) {
  const timestamp = options.currentTime ?? Date.now();
  const { tickResult, events, floatingNumbers, recovery, objective } = advanceFactionTick(session, timeline, options);
  const tickIndex = timeline.nextTickIndex - 1;
  const activeExpeditionId = findMostRecentExpeditionId(timeline.events);
  const bossTemplateId = activeExpeditionId ? getFinalBossTemplateId(activeExpeditionId) : void 0;
  const tickEvents = [...events];
  if (bossTemplateId) {
    for (const event of tickEvents) {
      if (event.kind === "MiniBossEncounter" && event.enemyTemplateId === bossTemplateId) {
        const encounterEvent = {
          kind: "FinalBossEncounter",
          enemyTemplateId: event.enemyTemplateId,
          enemyName: event.enemyName,
          regionId: event.regionId,
          tickIndex,
          timestamp
        };
        events.push(encounterEvent);
        timeline.events.push(encounterEvent);
      }
      if (event.kind === "MiniBossDefeated" && event.enemyTemplateId === bossTemplateId) {
        const template = getEnemyTemplate(bossTemplateId);
        const enemyName = template?.name ?? event.enemyName;
        session.character.characterBuild.addExperience(FINAL_BOSS_XP_REWARD);
        session.statistics.goldFound += FINAL_BOSS_GOLD_REWARD;
        const defeatedEvent = {
          kind: "FinalBossDefeated",
          enemyTemplateId: bossTemplateId,
          enemyName,
          xpAmount: FINAL_BOSS_XP_REWARD,
          goldAmount: FINAL_BOSS_GOLD_REWARD,
          tickIndex,
          timestamp
        };
        events.push(defeatedEvent);
        timeline.events.push(defeatedEvent);
        const expeditionDefinition = activeExpeditionId ? getExpeditionDefinition(activeExpeditionId) : void 0;
        const lootTableId = expeditionDefinition?.reward.guaranteedLootTableId ?? FINAL_BOSS_LOOT_TABLE_FALLBACK;
        const lootSeed = session.seed + tickIndex + FINAL_BOSS_LOOT_SEED_OFFSET;
        const loot = generateLoot(lootTableId, session.character.characterBuild.level, lootSeed, {
          dropChanceOverride: 1,
          minimumQuantity: 1,
          rarityWeightMultipliers: { unique: FINAL_BOSS_UNIQUE_BIAS }
        });
        for (let i = 0; i < loot.generatedItems.length; i++) {
          const generatedItem = { ...loot.generatedItems[i], sourceVariant: "miniboss", sourceEnemyTemplateId: bossTemplateId };
          const instanceId = `${session.sessionId}-finalboss-${tickIndex}-${i}`;
          const addResult = session.character.inventory.addItem(instanceId, generatedItem);
          const lootDroppedEvent = {
            kind: "LootDropped",
            instanceId,
            baseItemId: generatedItem.baseItemId,
            rarity: generatedItem.rarity,
            powerScore: generatedItem.powerScore,
            regionId: session.currentRegion,
            stored: addResult.success,
            tickIndex,
            timestamp
          };
          events.push(lootDroppedEvent);
          timeline.events.push(lootDroppedEvent);
        }
        const rewardFaction = template ? getFactionForRegion(template.region) : void 0;
        if (rewardFaction) {
          applyDungeonReputationChange(timeline, events, rewardFaction.id, FINAL_BOSS_REPUTATION, "FinalBossDefeated", tickIndex, timestamp);
        }
      }
    }
  }
  for (const event of tickEvents) {
    if (event.kind !== "ExpeditionCompleted" || !isDungeonExpedition(event.expeditionId)) continue;
    const startTick = findExpeditionStartTick(timeline.events, event.expeditionId);
    const bossDefeatedDuringExpedition = startTick !== null && timeline.events.some((e) => e.kind === "FinalBossDefeated" && e.tickIndex >= startTick);
    if (!bossDefeatedDuringExpedition) continue;
    const dungeonBossTemplateId = getFinalBossTemplateId(event.expeditionId);
    const bossTemplate = getEnemyTemplate(dungeonBossTemplateId);
    const dungeonCompletedEvent = {
      kind: "DungeonCompleted",
      expeditionId: event.expeditionId,
      name: event.name,
      bossName: bossTemplate?.name ?? "",
      encountersCompleted: event.encountersCompleted,
      xpAmount: event.xpAmount,
      goldAmount: event.goldAmount,
      tickIndex,
      timestamp
    };
    events.push(dungeonCompletedEvent);
    timeline.events.push(dungeonCompletedEvent);
  }
  return { tickResult, events, floatingNumbers, recovery, objective };
}

export {
  KINGDOM_ROLE_CATALOG,
  PING_COOLDOWN_MS,
  getProgress,
  getItemPower,
  getCombatAttributes,
  getRegionName,
  allRegionIds,
  ITEM_GEN_RARITIES,
  Inventory,
  Equipment,
  CharacterBuild,
  createAdventureCharacter,
  createAdventureSession,
  equipStarterKit,
  toHealthBarState,
  createAdventureTimeline,
  deriveHudState,
  buildAnimationsForTick,
  AnimationController,
  advanceDungeonTick
};
