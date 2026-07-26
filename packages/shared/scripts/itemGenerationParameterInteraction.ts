import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ITEM_GEN_PREFIXES } from "../src/itemgen/prefixes.js";
import { ITEM_GEN_SUFFIXES } from "../src/itemgen/suffixes.js";
import { generateItem } from "../src/itemgen/generator.js";
import { MAX_LEVEL } from "../src/xp.js";
import {
  CharacterBuild,
  Inventory,
  Equipment,
  createAdventureCharacter,
  createAdventureSession,
  createAdventureTimeline,
  advanceDungeonTick,
  equipStarterKit,
  calculateFinalStats,
  EQUIPMENT_SLOT_DEFINITIONS,
} from "../src/index.js";
import type { PresentationEvent } from "../src/index.js";

// Item Generation Parameter Interaction — Validation Phase I — reutiliza
// EXATAMENTE a mesma infraestrutura experimental de "Item Generation
// Redesign Validation — Simulation Phase I" (mutação em memória de
// ITEM_GEN_PREFIXES/ITEM_GEN_SUFFIXES já importados, restauração a
// partir de um clone pristine, nenhum arquivo tocado). Esta Sprint
// ADICIONA uma segunda dimensão de mutação (peso de tier) à mesma
// camada, formando a matriz experimental 2x2 pedida (Fase 1): Threshold
// (Atual/Novo) x Weight (Atual/Novo) — só essas 4 combinações, nenhuma
// outra.
type Mode = "current" | "new";
interface Config {
  name: string;
  threshold: Mode;
  weight: Mode;
}
const MATRIX: Config[] = [
  { name: "Baseline", threshold: "current", weight: "current" },
  { name: "Threshold", threshold: "new", weight: "current" },
  { name: "Weight", threshold: "current", weight: "new" },
  { name: "Combined", threshold: "new", weight: "new" },
];

const PRISTINE_PREFIXES = structuredClone(ITEM_GEN_PREFIXES);
const PRISTINE_SUFFIXES = structuredClone(ITEM_GEN_SUFFIXES);

// ---------- Threshold "Novo" = Modelo A (Linear), o modelo recomendado
// pela Sprint anterior (Item Generation Redesign Validation) — mesmo
// parâmetro já aprovado, não um modelo novo.
const OLD_MIN = 1;
const OLD_MAX = 65;
const NEW_MIN = 1;
const NEW_MAX = MAX_LEVEL; // 30
function rescaleThresholdLinear(old: number): number {
  return NEW_MIN + (old - OLD_MIN) * ((NEW_MAX - NEW_MIN) / (OLD_MAX - OLD_MIN));
}

// ---------- Weight "Novo" = achatamento proposto no Plano de
// Implementação da Sprint anterior ("algo como 15/25/30/30" pra mods de
// 4 tiers) — mesmo parâmetro já esboçado, agora testado de fato.
// Mapeado por NÚMERO do tier (1=melhor), não pelo peso bruto antigo,
// porque o significado de "tier 1" é o mesmo em mods de 2 ou 4 tiers.
function newWeightForTier(tierNumber: number, totalTiers: number): number {
  if (totalTiers === 2) {
    return tierNumber === 1 ? 40 : 60;
  }
  const map: Record<number, number> = { 1: 15, 2: 25, 3: 30, 4: 30 };
  return map[tierNumber] ?? 25;
}

function applyThreshold(mode: Mode): void {
  if (mode === "current") return;
  const apply = (live: typeof ITEM_GEN_PREFIXES, pristine: typeof PRISTINE_PREFIXES) => {
    for (let i = 0; i < live.length; i++) {
      const order = [...pristine[i].tiers].sort((a, b) => a.minItemLevel - b.minItemLevel);
      let prevNew = 0;
      for (const pristineTier of order) {
        const liveTier = live[i].tiers.find((t) => t.tier === pristineTier.tier)!;
        let newVal = Math.round(rescaleThresholdLinear(pristineTier.minItemLevel));
        newVal = Math.max(1, newVal);
        if (newVal <= prevNew) newVal = prevNew + 1;
        liveTier.minItemLevel = newVal;
        prevNew = newVal;
      }
    }
  };
  apply(ITEM_GEN_PREFIXES, PRISTINE_PREFIXES);
  apply(ITEM_GEN_SUFFIXES, PRISTINE_SUFFIXES);
}

function applyWeight(mode: Mode): void {
  if (mode === "current") return;
  const apply = (live: typeof ITEM_GEN_PREFIXES) => {
    for (const mod of live) {
      const total = mod.tiers.length;
      for (const tier of mod.tiers) tier.weight = newWeightForTier(tier.tier, total);
    }
  };
  apply(ITEM_GEN_PREFIXES);
  apply(ITEM_GEN_SUFFIXES);
}

function restoreOriginal(): void {
  for (let i = 0; i < ITEM_GEN_PREFIXES.length; i++) {
    for (let j = 0; j < ITEM_GEN_PREFIXES[i].tiers.length; j++) {
      ITEM_GEN_PREFIXES[i].tiers[j].minItemLevel = PRISTINE_PREFIXES[i].tiers[j].minItemLevel;
      ITEM_GEN_PREFIXES[i].tiers[j].weight = PRISTINE_PREFIXES[i].tiers[j].weight;
    }
  }
  for (let i = 0; i < ITEM_GEN_SUFFIXES.length; i++) {
    for (let j = 0; j < ITEM_GEN_SUFFIXES[i].tiers.length; j++) {
      ITEM_GEN_SUFFIXES[i].tiers[j].minItemLevel = PRISTINE_SUFFIXES[i].tiers[j].minItemLevel;
      ITEM_GEN_SUFFIXES[i].tiers[j].weight = PRISTINE_SUFFIXES[i].tiers[j].weight;
    }
  }
}

// ---------- estatística utilitária (mesma convenção das Sprints anteriores) ----------
function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[idx];
}
function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
function stddev(values: number[]): number {
  const m = average(values);
  return Math.sqrt(average(values.map((v) => (v - m) ** 2)));
}
function stats(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const m = average(values);
  const sd = stddev(values);
  const se = sd / Math.sqrt(values.length || 1);
  return { n: values.length, mean: m, median: median(values), se, ci95Low: m - 1.96 * se, ci95High: m + 1.96 * se, p90: percentile(s, 90), max: s[s.length - 1] ?? 0, stddev: sd };
}
// Diferença de duas médias independentes (welch-like, aproximação normal)
// — usado pra classificar "ruído/pequeno/moderado/significativo" na Fase 6.
function meanDiffZScore(a: number[], b: number[]): number {
  const ma = average(a), mb = average(b);
  const va = stddev(a) ** 2 / a.length;
  const vb = stddev(b) ** 2 / b.length;
  const se = Math.sqrt(va + vb);
  return se === 0 ? 0 : (mb - ma) / se;
}
function classifyEffect(zAbs: number): "inexistente" | "pequeno" | "moderado" | "significativo" {
  if (zAbs < 1) return "inexistente";
  if (zAbs < 2) return "pequeno";
  if (zAbs < 4) return "moderado";
  return "significativo";
}

// ---------- Fase 3: Monte Carlo (por região, com distribuição de tier/mod) ----------
const MC_N_PER_REGION = 8000;
const WEAPON_BASE = "sword";
const ARMOR_BASE = "chest";
const REGIONS: { region: string; playerLevel: number }[] = [
  { region: "bosque-sussurrante", playerLevel: 1 },
  { region: "pantano-podre", playerLevel: 5 },
  { region: "colinas-aridas/minas-abandonadas/ruinas-esquecidas", playerLevel: 15 },
  { region: "picos-congelados", playerLevel: 20 },
  { region: "litoral-quebrado", playerLevel: 24 },
  { region: "deserto-de-vidro", playerLevel: 28 },
  { region: "fortaleza-sombria", playerLevel: 30 },
];

function runMonteCarlo() {
  const perRegionWeapon: number[][] = [];
  const perRegionArmor: number[][] = [];
  const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const modCounts: Record<string, number> = {};

  const byRegion = REGIONS.map(({ region, playerLevel }) => {
    const weapon: number[] = [];
    const armor: number[] = [];
    for (let i = 0; i < MC_N_PER_REGION; i++) {
      const seed = playerLevel * 1_000_003 + i * 7 + 1;
      const wItem = generateItem(WEAPON_BASE, playerLevel, seed);
      const aItem = generateItem(ARMOR_BASE, playerLevel, seed + 500_000);
      weapon.push(wItem.powerScore);
      armor.push(aItem.powerScore);
      for (const mod of [...wItem.prefixes, ...wItem.suffixes, ...aItem.prefixes, ...aItem.suffixes]) {
        tierCounts[mod.tier] = (tierCounts[mod.tier] ?? 0) + 1;
        modCounts[mod.modId] = (modCounts[mod.modId] ?? 0) + 1;
      }
    }
    perRegionWeapon.push(weapon);
    perRegionArmor.push(armor);
    return { region, playerLevel, weapon, armor };
  });

  let runningBestWeapon = 0;
  let runningBestArmor = 0;
  const upgradeProbabilityByRegion = byRegion.map((r) => {
    const beatWeapon = r.weapon.filter((v) => v > runningBestWeapon).length / r.weapon.length;
    const beatArmor = r.armor.filter((v) => v > runningBestArmor).length / r.armor.length;
    runningBestWeapon = Math.max(runningBestWeapon, ...r.weapon);
    runningBestArmor = Math.max(runningBestArmor, ...r.armor);
    return { region: r.region, upgradeProbabilityWeapon: beatWeapon, upgradeProbabilityArmor: beatArmor };
  });

  return {
    expectedValueByRegion: byRegion.map((r) => ({ region: r.region, playerLevel: r.playerLevel, weapon: stats(r.weapon), armor: stats(r.armor) })),
    upgradeProbabilityByRegion,
    tierDistribution: tierCounts,
    modDistribution: modCounts,
  };
}

// ---------- Fase 4/7: Campaign Simulation + Running Maximum (mesma metodologia das 2 Sprints anteriores) ----------
const REGION_ID = "bosque-sussurrante";
const CLASS_ID = "warrior";
const MAX_SIMULATED_SECONDS = 7200;
const SECONDS_PER_TICK = 22;
const MAX_TICKS = Math.floor(MAX_SIMULATED_SECONDS / SECONDS_PER_TICK);
const RUN_COUNT = 300;
const INVENTORY_CAPACITY = 30;

interface EquipRecord {
  time: number;
  region: string;
  level: number;
  slotId: string;
}
interface PowerSample {
  time: number;
  region: string;
  level: number;
  powerScore: number;
}
interface CampaignRunResult {
  seed: number;
  survived: boolean;
  finalLevel: number;
  equips: EquipRecord[];
  lootTotal: number;
  lootUsed: number;
  powerSeries: PowerSample[];
  runningMaxRecordsByRegion: Record<string, number>;
}

function runOneCampaign(seed: number): CampaignRunResult {
  const characterId = `param-interaction-${seed}`;
  const build = new CharacterBuild(characterId, CLASS_ID, 0);
  const inventory = new Inventory(characterId, INVENTORY_CAPACITY);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, CLASS_ID, seed);

  const session = createAdventureSession(`${characterId}-session`, character, REGION_ID, seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);

  const equips: EquipRecord[] = [];
  const powerSeries: PowerSample[] = [];
  let lootTotal = 0;
  let lootUsed = 0;
  let runningMax = 0;
  const runningMaxRecordsByRegion: Record<string, number> = {};

  let ticks = 0;
  let survived = true;

  while (ticks < MAX_TICKS && session.character.currentLife > 0) {
    ticks++;
    const currentTime = ticks * SECONDS_PER_TICK * 1000;
    const { tickResult, events } = advanceDungeonTick(session, timeline, { autoEquip: true, currentTime });
    const region = session.currentRegion;
    const level = session.character.characterBuild.level;

    for (const event of events as PresentationEvent[]) {
      if (event.kind === "LootDropped") {
        lootTotal++;
        if (events.some((e) => e.kind === "ItemEquipped" && e.baseItemId === event.baseItemId)) lootUsed++;
        if (event.powerScore > runningMax) {
          runningMax = event.powerScore;
          runningMaxRecordsByRegion[region] = (runningMaxRecordsByRegion[region] ?? 0) + 1;
        }
      }
      if (event.kind === "ItemEquipped") {
        equips.push({ time: ticks * SECONDS_PER_TICK, region, level, slotId: event.slotId });
      }
    }

    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    powerSeries.push({ time: ticks * SECONDS_PER_TICK, region, level, powerScore: finalStats.powerScore });

    if (!tickResult.characterAlive) {
      survived = false;
      break;
    }
  }

  return { seed, survived, finalLevel: session.character.characterBuild.level, equips, lootTotal, lootUsed, powerSeries, runningMaxRecordsByRegion };
}

function runCampaignSuite() {
  const runs: CampaignRunResult[] = [];
  for (let i = 0; i < RUN_COUNT; i++) runs.push(runOneCampaign(1 + i * 99991));

  const slotUpgradeCounts: Record<string, number> = {};
  for (const def of EQUIPMENT_SLOT_DEFINITIONS) slotUpgradeCounts[def.id] = 0;
  for (const run of runs) for (const eq of run.equips) slotUpgradeCounts[eq.slotId] = (slotUpgradeCounts[eq.slotId] ?? 0) + 1;

  const totalLoot = runs.reduce((s, r) => s + r.lootTotal, 0);
  const totalUsed = runs.reduce((s, r) => s + r.lootUsed, 0);

  const powerByLevel: Record<number, number[]> = {};
  for (const run of runs) for (const sample of run.powerSeries) (powerByLevel[sample.level] ??= []).push(sample.powerScore);
  const powerCurveByLevel = Object.entries(powerByLevel)
    .map(([level, values]) => ({ level: Number(level), averagePowerScore: average(values), samples: values.length }))
    .sort((a, b) => a.level - b.level);

  const upgradesByRegion: Record<string, number> = {};
  for (const run of runs) for (const eq of run.equips) upgradesByRegion[eq.region] = (upgradesByRegion[eq.region] ?? 0) + 1;

  const runningMaxRecordsByRegion: Record<string, number> = {};
  for (const run of runs) {
    for (const [region, count] of Object.entries(run.runningMaxRecordsByRegion)) {
      runningMaxRecordsByRegion[region] = (runningMaxRecordsByRegion[region] ?? 0) + count;
    }
  }
  const totalRunningMaxRecords = Object.values(runningMaxRecordsByRegion).reduce((a, b) => a + b, 0);

  return {
    survivalRate: runs.filter((r) => r.survived).length / RUN_COUNT,
    averageFinalLevel: average(runs.map((r) => r.finalLevel)),
    totalUpgradeEvents: runs.reduce((s, r) => s + r.equips.length, 0),
    upgradesPerRun: runs.map((r) => r.equips.length),
    deadLootRate: totalLoot > 0 ? 1 - totalUsed / totalLoot : 0,
    slotProgression: EQUIPMENT_SLOT_DEFINITIONS.map((def) => ({ slotId: def.id, totalUpgrades: slotUpgradeCounts[def.id] })),
    upgradesByRegion,
    powerCurveByLevel,
    powerScoreLevel1: average(powerByLevel[1] ?? []),
    powerScoreLevel20to30: [20, 22, 24, 26, 28, 30].map((lvl) => ({ level: lvl, averagePowerScore: average(powerByLevel[lvl] ?? []) })),
    maxPowerScoreObserved: Math.max(...runs.flatMap((r) => r.powerSeries.map((p) => p.powerScore)), 0),
    runningMaxRecordsByRegion,
    totalRunningMaxRecords,
  };
}

// ---------- Execução da matriz 2x2 ----------
console.log("Executando matriz experimental 2x2 (Baseline, Threshold, Weight, Combined)...");
const results: Record<string, { monteCarlo: ReturnType<typeof runMonteCarlo>; campaign: ReturnType<typeof runCampaignSuite> }> = {};

for (const config of MATRIX) {
  console.log(`  configuração ${config.name} (threshold=${config.threshold}, weight=${config.weight})...`);
  applyThreshold(config.threshold);
  applyWeight(config.weight);
  try {
    const monteCarlo = runMonteCarlo();
    const campaign = runCampaignSuite();
    results[config.name] = { monteCarlo, campaign };
  } finally {
    restoreOriginal();
  }
}

const restoredCorrectly =
  JSON.stringify(ITEM_GEN_PREFIXES) === JSON.stringify(PRISTINE_PREFIXES) && JSON.stringify(ITEM_GEN_SUFFIXES) === JSON.stringify(PRISTINE_SUFFIXES);

// ---------- Fase 5: Interaction Analysis ----------
// Efeito individual de Threshold = Threshold - Baseline.
// Efeito individual de Weight = Weight - Baseline.
// Efeito combinado observado = Combined - Baseline.
// Soma dos efeitos individuais = (Threshold-Baseline) + (Weight-Baseline).
// Sinergia = Efeito combinado observado - Soma dos efeitos individuais.
function interactionFor(metric: (name: string) => number) {
  const baseline = metric("Baseline");
  const threshold = metric("Threshold");
  const weight = metric("Weight");
  const combined = metric("Combined");
  const effectThreshold = threshold - baseline;
  const effectWeight = weight - baseline;
  const combinedObserved = combined - baseline;
  const additivePrediction = effectThreshold + effectWeight;
  const synergy = combinedObserved - additivePrediction;
  return { baseline, threshold, weight, combined, effectThreshold, effectWeight, combinedObserved, additivePrediction, synergy };
}

const interaction = {
  averageUpgradesPerRun: interactionFor((name) => average(results[name].campaign.upgradesPerRun)),
  deadLootRatePct: interactionFor((name) => results[name].campaign.deadLootRate * 100),
  powerScoreLevel30: interactionFor((name) => results[name].campaign.powerCurveByLevel.find((r) => r.level === 30)?.averagePowerScore ?? 0),
  totalRunningMaxRecords: interactionFor((name) => results[name].campaign.totalRunningMaxRecords),
};

// ---------- Fase 6: Statistical Significance (z-score da diferença de médias, upgrades/run) ----------
const significance = {
  thresholdVsBaseline: (() => {
    const z = meanDiffZScore(results.Baseline.campaign.upgradesPerRun, results.Threshold.campaign.upgradesPerRun);
    return { zScore: z, classification: classifyEffect(Math.abs(z)) };
  })(),
  weightVsBaseline: (() => {
    const z = meanDiffZScore(results.Baseline.campaign.upgradesPerRun, results.Weight.campaign.upgradesPerRun);
    return { zScore: z, classification: classifyEffect(Math.abs(z)) };
  })(),
  combinedVsBaseline: (() => {
    const z = meanDiffZScore(results.Baseline.campaign.upgradesPerRun, results.Combined.campaign.upgradesPerRun);
    return { zScore: z, classification: classifyEffect(Math.abs(z)) };
  })(),
  combinedVsBestIndividual: (() => {
    const bestIndividual =
      average(results.Threshold.campaign.upgradesPerRun) > average(results.Weight.campaign.upgradesPerRun) ? results.Threshold.campaign.upgradesPerRun : results.Weight.campaign.upgradesPerRun;
    const z = meanDiffZScore(bestIndividual, results.Combined.campaign.upgradesPerRun);
    return { zScore: z, classification: classifyEffect(Math.abs(z)) };
  })(),
};

const report = { restoredCorrectly, matrix: MATRIX, results, interaction, significance };

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "item-generation-parameter-interaction.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "item-generation-parameter-interaction.json")}`);
console.log("restoredCorrectly:", restoredCorrectly);
console.log(JSON.stringify({ interaction, significance }, null, 2));
