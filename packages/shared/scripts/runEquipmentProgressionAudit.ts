import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  getBaseItem,
  getEquipmentSlotDefinition,
  EQUIPMENT_SLOT_DEFINITIONS,
} from "../src/index.js";
import type { PresentationEvent } from "../src/index.js";

// Equipment Progression Audit — Player Power Curve Phase I — Sprint de
// diagnóstico puro. "NÃO ALTERAR: Simulator" desta vez inclui o próprio
// runSimulatedAdventure()/generateBalanceReport() — por isso este script
// NÃO os chama; reconstrói a MESMA metodologia de jornada natural já
// usada nas 2 auditorias anteriores (mesmo characterId/seed/região/
// orçamento) chamando diretamente createAdventureSession()/
// advanceDungeonTick() (as MESMAS primitivas que o Simulador usa por
// baixo, e que os smoke tests deste projeto inteiro sempre usaram) —
// nenhuma linha de packages/shared/src/simulation/ é lida nem
// modificada. A única razão pra isso: o Simulador nunca expôs a
// Timeline bruta (só contadores agregados), e esta Sprint exige o
// evento-a-evento completo (Fase 1: "para cada equipamento obtido").
const REGION_ID = "bosque-sussurrante";
const CLASS_ID = "warrior";
const MAX_SIMULATED_SECONDS = 7200;
const SECONDS_PER_TICK = 22;
const MAX_TICKS = Math.floor(MAX_SIMULATED_SECONDS / SECONDS_PER_TICK);
const RUN_COUNT = 300;
const INVENTORY_CAPACITY = 30;
const FUNNEL_REGION = "picos-congelados";

interface LootRecord {
  time: number;
  region: string;
  level: number;
  rarity: string;
  powerScore: number;
  baseItemId: string;
  slot: string;
  equippedInSameTick: boolean;
}

interface EquipRecord {
  time: number;
  region: string;
  level: number;
  slotId: string;
  baseItemId: string;
  powerScore: number;
  previousPowerScore: number;
  percentIncrease: number | null; // null quando o slot estava vazio antes
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

interface RunResult {
  seed: number;
  survived: boolean;
  diedInRegion: string | null;
  finalTime: number;
  finalLevel: number;
  loot: LootRecord[];
  equips: EquipRecord[];
  powerSeries: PowerSample[];
  reachedFunnelRegion: boolean;
  powerScoreAtFunnelEntry: number | null;
  upgradesBeforeFunnel: number;
  emptySlotsAtFunnelEntry: number;
  diedInFunnelRegion: boolean;
}

function estimateDps(stats: { physicalDamage: number; spellDamage: number; attackSpeed: number }): number {
  return (stats.physicalDamage + stats.spellDamage) * stats.attackSpeed;
}

function runOne(seed: number): RunResult {
  const characterId = `equip-audit-${seed}`;
  const build = new CharacterBuild(characterId, CLASS_ID, 0);
  const inventory = new Inventory(characterId, INVENTORY_CAPACITY);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, CLASS_ID, seed);

  const session = createAdventureSession(`${characterId}-session`, character, REGION_ID, seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);

  const loot: LootRecord[] = [];
  const equips: EquipRecord[] = [];
  const powerSeries: PowerSample[] = [];

  let reachedFunnelRegion = false;
  let powerScoreAtFunnelEntry: number | null = null;
  let upgradesBeforeFunnel = 0;
  let emptySlotsAtFunnelEntry = 0;
  let diedInFunnelRegion = false;
  let upgradesSoFar = 0;

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
        const baseItem = getBaseItem(event.baseItemId);
        loot.push({
          time: ticks * SECONDS_PER_TICK,
          region,
          level,
          rarity: event.rarity,
          powerScore: event.powerScore,
          baseItemId: event.baseItemId,
          slot: baseItem?.slot ?? "unknown",
          equippedInSameTick: events.some((e) => e.kind === "ItemEquipped" && e.baseItemId === event.baseItemId),
        });
      }
      if (event.kind === "ItemEquipped") {
        upgradesSoFar++;
        equips.push({
          time: ticks * SECONDS_PER_TICK,
          region,
          level,
          slotId: event.slotId,
          baseItemId: event.baseItemId,
          powerScore: event.powerScore,
          previousPowerScore: event.previousPowerScore,
          percentIncrease: event.previousPowerScore > 0 ? ((event.powerScore - event.previousPowerScore) / event.previousPowerScore) * 100 : null,
        });
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

    if (!reachedFunnelRegion && region === FUNNEL_REGION) {
      reachedFunnelRegion = true;
      powerScoreAtFunnelEntry = finalStats.powerScore;
      upgradesBeforeFunnel = upgradesSoFar;
      emptySlotsAtFunnelEntry = EQUIPMENT_SLOT_DEFINITIONS.filter((slot) => !session.character.equipment.getEquippedItem(slot.id)).length;
    }

    if (!tickResult.characterAlive) {
      survived = false;
      if (region === FUNNEL_REGION) diedInFunnelRegion = true;
      break;
    }
  }

  return {
    seed,
    survived,
    diedInRegion: survived ? null : session.currentRegion,
    finalTime: ticks * SECONDS_PER_TICK,
    finalLevel: session.character.characterBuild.level,
    loot,
    equips,
    powerSeries,
    reachedFunnelRegion,
    powerScoreAtFunnelEntry,
    upgradesBeforeFunnel,
    emptySlotsAtFunnelEntry,
    diedInFunnelRegion,
  };
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

console.log(`Executando ${RUN_COUNT} campanhas (jornada natural, mesma metodologia das auditorias anteriores)...`);
const runs: RunResult[] = [];
for (let i = 0; i < RUN_COUNT; i++) runs.push(runOne(1 + i * 99991));

// ---------- Fase 2: Upgrade Frequency ----------
const allGaps: number[] = [];
const longestGapsPerRun: number[] = [];
for (const run of runs) {
  const times = run.equips.map((e) => e.time).sort((a, b) => a - b);
  let longest = 0;
  for (let i = 1; i < times.length; i++) {
    const gap = times[i] - times[i - 1];
    allGaps.push(gap);
    if (gap > longest) longest = gap;
  }
  // Gap final até o fim da execução (deserto de loot até morrer/parar).
  if (times.length > 0) {
    const tailGap = run.finalTime - times[times.length - 1];
    if (tailGap > longest) longest = tailGap;
    allGaps.push(tailGap);
  } else {
    longest = run.finalTime;
  }
  longestGapsPerRun.push(longest);
}
const sortedGaps = [...allGaps].sort((a, b) => a - b);

// ---------- Fase 3: Slot Progression ----------
const slotUpgradeCounts: Record<string, number> = {};
const slotPowerAtEnd: Record<string, number[]> = {};
for (const def of EQUIPMENT_SLOT_DEFINITIONS) {
  slotUpgradeCounts[def.id] = 0;
  slotPowerAtEnd[def.id] = [];
}
for (const run of runs) {
  for (const eq of run.equips) slotUpgradeCounts[eq.slotId] = (slotUpgradeCounts[eq.slotId] ?? 0) + 1;
}

// ---------- Fase 5/6: Loot Quality + Dead Loot ----------
const regionLootStats: Record<string, { drops: number; equippedCount: number; powerSum: number; rarityCounts: Record<string, number> }> = {};
let totalDrops = 0;
let totalUsed = 0;
for (const run of runs) {
  for (const drop of run.loot) {
    totalDrops++;
    if (drop.equippedInSameTick) totalUsed++;
    const bucket = (regionLootStats[drop.region] ??= { drops: 0, equippedCount: 0, powerSum: 0, rarityCounts: {} });
    bucket.drops++;
    if (drop.equippedInSameTick) bucket.equippedCount++;
    bucket.powerSum += drop.powerScore;
    bucket.rarityCounts[drop.rarity] = (bucket.rarityCounts[drop.rarity] ?? 0) + 1;
  }
}

// ---------- Fase 7: Equipment Plateau Detection ----------
// Um platô = intervalo de tempo em que o Power Score total não cresce.
// Limiar: >= 300s (mesma ordem de grandeza usada nas auditorias
// anteriores pra "deserto de loot", 600s, mas aqui medindo PODER, não
// apenas presença de drop).
const PLATEAU_THRESHOLD_SECONDS = 300;
interface Plateau {
  region: string;
  level: number;
  startTime: number;
  endTime: number;
  duration: number;
}
const allPlateaus: Plateau[] = [];
for (const run of runs) {
  let plateauStart = 0;
  let plateauStartRegion = run.powerSeries[0]?.region ?? REGION_ID;
  let plateauStartLevel = run.powerSeries[0]?.level ?? 1;
  let maxPowerSoFar = run.powerSeries[0]?.powerScore ?? 0;
  for (let i = 1; i < run.powerSeries.length; i++) {
    const sample = run.powerSeries[i];
    if (sample.powerScore > maxPowerSoFar) {
      const duration = sample.time - plateauStart;
      if (duration >= PLATEAU_THRESHOLD_SECONDS) {
        allPlateaus.push({ region: plateauStartRegion, level: plateauStartLevel, startTime: plateauStart, endTime: sample.time, duration });
      }
      maxPowerSoFar = sample.powerScore;
      plateauStart = sample.time;
      plateauStartRegion = sample.region;
      plateauStartLevel = sample.level;
    }
  }
}

// ---------- Fase 8: Endgame Funnel Correlation ----------
const reachedFunnel = runs.filter((r) => r.reachedFunnelRegion);
const diedAtFunnel = reachedFunnel.filter((r) => r.diedInFunnelRegion);
const survivedFunnelEntry = reachedFunnel.filter((r) => !r.diedInFunnelRegion);

// ---------- Fase 4: Power Curve vs. tempo/nível (amostragem por nível) ----------
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

// ---------- Fase 4b: Power Curve por região (entrada na região) ----------
const powerByRegionEntry: Record<string, { powerScore: number; level: number }[]> = {};
for (const run of runs) {
  const seenRegions = new Set<string>();
  for (const sample of run.powerSeries) {
    if (seenRegions.has(sample.region)) continue;
    seenRegions.add(sample.region);
    (powerByRegionEntry[sample.region] ??= []).push({ powerScore: sample.powerScore, level: sample.level });
  }
}
const powerCurveByRegionEntry = Object.entries(powerByRegionEntry).map(([region, entries]) => ({
  region,
  entries: entries.length,
  averagePowerScoreAtEntry: average(entries.map((e) => e.powerScore)),
  averageLevelAtEntry: average(entries.map((e) => e.level)),
}));

const report = {
  totalRuns: RUN_COUNT,
  survivalRate: runs.filter((r) => r.survived).length / RUN_COUNT,
  fase2_upgradeFrequency: {
    totalUpgradeEvents: runs.reduce((sum, r) => sum + r.equips.length, 0),
    averageUpgradesPerRun: average(runs.map((r) => r.equips.length)),
    averageGapSeconds: average(allGaps),
    medianGapSeconds: median(allGaps),
    p75GapSeconds: percentile(sortedGaps, 75),
    p90GapSeconds: percentile(sortedGaps, 90),
    p99GapSeconds: percentile(sortedGaps, 99),
    maxGapSecondsObserved: Math.max(...allGaps, 0),
    averageLongestGapPerRun: average(longestGapsPerRun),
    medianLongestGapPerRun: median(longestGapsPerRun),
  },
  fase3_slotProgression: EQUIPMENT_SLOT_DEFINITIONS.map((def) => ({
    slotId: def.id,
    label: def.label,
    totalUpgrades: slotUpgradeCounts[def.id],
    averageUpgradesPerRun: slotUpgradeCounts[def.id] / RUN_COUNT,
  })),
  fase4_powerCurveByLevel: powerCurveByLevel,
  fase4b_powerCurveByRegionEntry: powerCurveByRegionEntry,
  fase5_lootQualityByRegion: Object.entries(regionLootStats).map(([region, stats]) => ({
    region,
    drops: stats.drops,
    averagePowerScore: stats.powerSum / stats.drops,
    usageRate: stats.equippedCount / stats.drops,
    rarityCounts: stats.rarityCounts,
  })),
  fase6_deadLoot: {
    totalDrops,
    totalUsed,
    deadLootRate: 1 - totalUsed / totalDrops,
  },
  fase7_plateaus: {
    totalPlateausDetected: allPlateaus.length,
    averagePlateauDuration: average(allPlateaus.map((p) => p.duration)),
    longestPlateaus: [...allPlateaus].sort((a, b) => b.duration - a.duration).slice(0, 10),
    plateausByRegion: Object.entries(
      allPlateaus.reduce((acc: Record<string, number>, p) => {
        acc[p.region] = (acc[p.region] ?? 0) + 1;
        return acc;
      }, {}),
    ),
  },
  fase8_endgameFunnelCorrelation: {
    reachRate: reachedFunnel.length / RUN_COUNT,
    diedAtFunnelRate: reachedFunnel.length > 0 ? diedAtFunnel.length / reachedFunnel.length : 0,
    diedCohort: {
      count: diedAtFunnel.length,
      averagePowerScoreAtEntry: average(diedAtFunnel.map((r) => r.powerScoreAtFunnelEntry ?? 0)),
      averageUpgradesBeforeEntry: average(diedAtFunnel.map((r) => r.upgradesBeforeFunnel)),
      averageEmptySlotsAtEntry: average(diedAtFunnel.map((r) => r.emptySlotsAtFunnelEntry)),
    },
    survivedEntryCohort: {
      count: survivedFunnelEntry.length,
      averagePowerScoreAtEntry: average(survivedFunnelEntry.map((r) => r.powerScoreAtFunnelEntry ?? 0)),
      averageUpgradesBeforeEntry: average(survivedFunnelEntry.map((r) => r.upgradesBeforeFunnel)),
      averageEmptySlotsAtEntry: average(survivedFunnelEntry.map((r) => r.emptySlotsAtFunnelEntry)),
    },
  },
  fase1_sampleTimelines: runs.slice(0, 3).map((r) => ({ seed: r.seed, survived: r.survived, diedInRegion: r.diedInRegion, equips: r.equips })),
};

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "equipment-progression-audit.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "equipment-progression-audit.json")}`);
console.log(JSON.stringify(report, null, 2));
