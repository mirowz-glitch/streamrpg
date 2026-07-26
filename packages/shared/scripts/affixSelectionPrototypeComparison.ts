import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateItem } from "../src/itemgen/generator.js";
import {
  CurrentAffixSelectionStrategy,
  ProgressiveAffixSelectionStrategy,
  setDefaultAffixSelectionStrategy,
  resetDefaultAffixSelectionStrategy,
  type AffixSelectionStrategy,
} from "../src/itemgen/selectionStrategy.js";
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

// Affix Selection Redesign — Prototype Phase I — Fase 4/5 do briefing
// (Comparative Simulation + Statistical Analysis). MESMA metodologia
// EXATA das 2 Sprints anteriores (Item Generation Design Review/
// Redesign Validation): mesmo N, mesmas seeds, mesmas regiões, mesmas
// métricas. A ÚNICA variável trocada entre execuções é a
// AffixSelectionStrategy ativa (setDefaultAffixSelectionStrategy) — os
// dados (afixos/tiers/thresholds/pesos) nunca são tocados, ao
// contrário da Sprint anterior (que mutava minItemLevel em memória).
// Nenhum arquivo de src/ além de generator.ts/selectionStrategy.ts
// (Fases 1-3, já commitados nesta própria Sprint) é lido de forma
// diferente — Combat Engine, Loot Tables, RuntimeConfig, Power Score:
// intocados.

type StrategyId = "current" | "progressive";
const STRATEGIES: { id: StrategyId; strategy: AffixSelectionStrategy }[] = [
  { id: "current", strategy: CurrentAffixSelectionStrategy },
  { id: "progressive", strategy: ProgressiveAffixSelectionStrategy },
];

// ---------- estatística utilitária (idêntica à Sprint anterior) ----------
function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[idx];
}
function stddev(values: number[]): number {
  const m = average(values);
  return Math.sqrt(average(values.map((v) => (v - m) ** 2)));
}
function stats(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const m = average(values);
  const sd = stddev(values);
  const ci95 = 1.96 * (sd / Math.sqrt(values.length || 1));
  return {
    n: values.length,
    mean: m,
    median: median(values),
    ci95Low: m - ci95,
    ci95High: m + ci95,
    p10: percentile(s, 10),
    p90: percentile(s, 90),
    p99: percentile(s, 99),
    max: s[s.length - 1] ?? 0,
    stddev: sd,
  };
}
// Cohen's d (tamanho de efeito) — Fase 5, "tamanho de efeito". Usa o
// desvio padrão combinado (pooled) das duas amostras.
function cohensD(a: number[], b: number[]): number {
  const ma = average(a);
  const mb = average(b);
  const sa = stddev(a);
  const sb = stddev(b);
  const pooled = Math.sqrt((sa * sa + sb * sb) / 2);
  return pooled === 0 ? 0 : (mb - ma) / pooled;
}

// ---------- Fase 3 do briefing anterior / Fase 4 desta Sprint: Monte Carlo isolado por região ----------
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

function runMonteCarlo(strategy: AffixSelectionStrategy) {
  const byRegion = REGIONS.map(({ region, playerLevel }) => {
    const weapon: number[] = [];
    const armor: number[] = [];
    for (let i = 0; i < MC_N_PER_REGION; i++) {
      const seed = playerLevel * 1_000_003 + i * 7 + 1;
      weapon.push(generateItem(WEAPON_BASE, playerLevel, seed, { strategy }).powerScore);
      armor.push(generateItem(ARMOR_BASE, playerLevel, seed + 500_000, { strategy }).powerScore);
    }
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
  };
}

// ---------- Fase 4 desta Sprint: Campaign Simulation (mesma metodologia de runEquipmentProgressionAudit.ts) ----------
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
  powerScore: number;
  previousPowerScore: number;
}
interface PowerSample {
  time: number;
  region: string;
  level: number;
  powerScore: number;
  maximumLife: number;
  armor: number;
  estimatedDps: number;
}
interface CampaignRunResult {
  seed: number;
  survived: boolean;
  finalLevel: number;
  equips: EquipRecord[];
  lootTotal: number;
  lootUsed: number;
  powerSeries: PowerSample[];
}

function estimateDps(s: { physicalDamage: number; spellDamage: number; attackSpeed: number }): number {
  return (s.physicalDamage + s.spellDamage) * s.attackSpeed;
}

function runOneCampaign(seed: number): CampaignRunResult {
  const characterId = `affix-selection-${seed}`;
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
      }
      if (event.kind === "ItemEquipped") {
        equips.push({ time: ticks * SECONDS_PER_TICK, region, level, slotId: event.slotId, powerScore: event.powerScore, previousPowerScore: event.previousPowerScore });
      }
    }

    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    powerSeries.push({
      time: ticks * SECONDS_PER_TICK,
      region,
      level,
      powerScore: finalStats.powerScore,
      maximumLife: finalStats.maximumLife,
      armor: finalStats.armor,
      estimatedDps: estimateDps(finalStats),
    });

    if (!tickResult.characterAlive) {
      survived = false;
      break;
    }
  }

  return { seed, survived, finalLevel: session.character.characterBuild.level, equips, lootTotal, lootUsed, powerSeries };
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
  const lifeByLevel: Record<number, number[]> = {};
  const armorByLevel: Record<number, number[]> = {};
  const dpsByLevel: Record<number, number[]> = {};
  for (const run of runs) {
    for (const sample of run.powerSeries) {
      (powerByLevel[sample.level] ??= []).push(sample.powerScore);
      (lifeByLevel[sample.level] ??= []).push(sample.maximumLife);
      (armorByLevel[sample.level] ??= []).push(sample.armor);
      (dpsByLevel[sample.level] ??= []).push(sample.estimatedDps);
    }
  }
  const powerCurveByLevel = Object.entries(powerByLevel)
    .map(([level, values]) => ({
      level: Number(level),
      averagePowerScore: average(values),
      averageMaximumLife: average(lifeByLevel[Number(level)] ?? []),
      averageArmor: average(armorByLevel[Number(level)] ?? []),
      averageEstimatedDps: average(dpsByLevel[Number(level)] ?? []),
      samples: values.length,
    }))
    .sort((a, b) => a.level - b.level);

  const powerByRegionEntry: Record<string, number[]> = {};
  for (const run of runs) {
    const seen = new Set<string>();
    for (const sample of run.powerSeries) {
      if (seen.has(sample.region)) continue;
      seen.add(sample.region);
      (powerByRegionEntry[sample.region] ??= []).push(sample.powerScore);
    }
  }

  return {
    runs,
    survivalRate: runs.filter((r) => r.survived).length / RUN_COUNT,
    averageFinalLevel: average(runs.map((r) => r.finalLevel)),
    totalUpgradeEvents: runs.reduce((s, r) => s + r.equips.length, 0),
    upgradesPerRun: runs.map((r) => r.equips.length),
    deadLootRate: totalLoot > 0 ? 1 - totalUsed / totalLoot : 0,
    slotProgression: EQUIPMENT_SLOT_DEFINITIONS.map((def) => ({ slotId: def.id, totalUpgrades: slotUpgradeCounts[def.id] })),
    powerCurveByLevel,
    powerAtRegionEntry: Object.entries(powerByRegionEntry).map(([region, values]) => ({ region, averagePowerScoreAtEntry: average(values), entries: values.length })),
    earlyGamePowerScoreLevel1: average(powerByLevel[1] ?? []),
    maxPowerScoreObserved: Math.max(...runs.flatMap((r) => r.powerSeries.map((p) => p.powerScore)), 0),
    powerScoreLevel20: powerByLevel[20] ?? [],
    powerScoreLevel30: powerByLevel[30] ?? [],
  };
}

// ---------- Execução: 1 estratégia por vez, trocar default -> medir -> restaurar ----------
console.log("Executando Monte Carlo + campanhas para current e progressive...");
const results: Record<StrategyId, { monteCarlo: ReturnType<typeof runMonteCarlo>; campaign: ReturnType<typeof runCampaignSuite> }> = {} as never;

for (const { id, strategy } of STRATEGIES) {
  console.log(`  estrategia ${id}...`);
  setDefaultAffixSelectionStrategy(strategy);
  try {
    // Monte Carlo usa options.strategy por chamada (não depende do
    // default global) — passado explicitamente mesmo assim, pra deixar
    // claro no próprio código qual estratégia está sob teste.
    const monteCarlo = runMonteCarlo(strategy);
    // A campanha completa passa por advanceDungeonTick() -> Loot
    // Generator -> generateItem() SEM nenhum options.strategy (nenhum
    // desses arquivos foi alterado) — por isso depende do default
    // global trocado acima.
    const campaign = runCampaignSuite();
    results[id] = { monteCarlo, campaign };
  } finally {
    resetDefaultAffixSelectionStrategy();
  }
}

// ---------- Fase 5: Statistical Analysis (comparação direta + tamanho de efeito) ----------
const current = results.current;
const proto = results.progressive;

const effectSizes = {
  upgradesPerRun: cohensD(current.campaign.upgradesPerRun, proto.campaign.upgradesPerRun),
  powerScoreLevel20: cohensD(current.campaign.powerScoreLevel20, proto.campaign.powerScoreLevel20),
  powerScoreLevel30: cohensD(current.campaign.powerScoreLevel30, proto.campaign.powerScoreLevel30),
};

// ---------- Fase 6: Regression Audit ----------
// Early game (nível 1) não deve mudar de forma perceptível — nenhuma
// tier alta é sequer elegível nesse nível em nenhum mod, então ambas
// estratégias devem produzir o MESMO valor esperado (só T4/T3 elegíveis,
// eligibleTiers.length costuma ser 1, onde o protótipo já devolve
// direto sem pesar nada — ver selectionStrategy.ts).
const earlyGameDeltaPercent =
  current.campaign.earlyGamePowerScoreLevel1 > 0
    ? ((proto.campaign.earlyGamePowerScoreLevel1 - current.campaign.earlyGamePowerScoreLevel1) / current.campaign.earlyGamePowerScoreLevel1) * 100
    : 0;

const report = {
  strategies: STRATEGIES.map((s) => s.id),
  monteCarlo: {
    current: current.monteCarlo,
    progressive: proto.monteCarlo,
  },
  campaign: {
    current: { ...current.campaign, runs: undefined, powerScoreLevel20: undefined, powerScoreLevel30: undefined },
    progressive: { ...proto.campaign, runs: undefined, powerScoreLevel20: undefined, powerScoreLevel30: undefined },
    upgradesPerRunStats: {
      current: stats(current.campaign.upgradesPerRun),
      progressive: stats(proto.campaign.upgradesPerRun),
    },
  },
  statisticalAnalysis: {
    effectSizes,
  },
  regressionAudit: {
    earlyGamePowerScoreLevel1: {
      current: current.campaign.earlyGamePowerScoreLevel1,
      progressive: proto.campaign.earlyGamePowerScoreLevel1,
      deltaPercent: earlyGameDeltaPercent,
    },
    maxPowerScoreObserved: {
      current: current.campaign.maxPowerScoreObserved,
      progressive: proto.campaign.maxPowerScoreObserved,
    },
    survivalRate: {
      current: current.campaign.survivalRate,
      progressive: proto.campaign.survivalRate,
    },
  },
};

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "affix-selection-prototype-comparison.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "affix-selection-prototype-comparison.json")}`);
console.log(JSON.stringify(report, null, 2));
