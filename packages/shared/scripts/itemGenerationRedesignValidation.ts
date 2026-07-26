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
  getBaseItem,
  EQUIPMENT_SLOT_DEFINITIONS,
} from "../src/index.js";
import type { PresentationEvent } from "../src/index.js";

// Item Generation Redesign Validation — Simulation Phase I — Sprint
// exclusivamente de simulação. NENHUM arquivo de src/ é alterado por
// este script: `ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES` (já existentes,
// importados normalmente) são MUTADOS EM MEMÓRIA — dentro do MESMO
// processo Node, nunca gravados em disco — antes de cada configuração
// de teste, e RESTAURADOS (a partir de um clone "pristine" tirado antes
// de qualquer mutação) logo depois. Isso permite rodar o EXATO mesmo
// algoritmo de geração (generateItem(), advanceDungeonTick(), toda a
// engine real) que o jogo usa, só trocando OS DADOS de `minItemLevel`
// por escala — a "Camada Experimental" pedida na Fase 1, sem duplicar
// nenhuma lógica do gerador e sem tocar em Combat Engine/RuntimeConfig/
// Persistência. `git status` neste diretório continua limpo após rodar
// este script (nenhuma mudança de arquivo).
type RescaleModel = "current" | "A" | "B" | "C" | "D";
const MODELS: RescaleModel[] = ["current", "A", "B", "C", "D"];

const PRISTINE_PREFIXES = structuredClone(ITEM_GEN_PREFIXES);
const PRISTINE_SUFFIXES = structuredClone(ITEM_GEN_SUFFIXES);

// Fase 2 — Modelo D (Adaptativo): mesmos 7 níveis médios de entrada de
// região medidos empiricamente pela Equipment Progression Audit Phase I
// (reports/equipment-progression-audit-AFTER.json,
// fase4b_powerCurveByRegionEntry) — reaproveitados, não re-medidos.
const EMPIRICAL_LEVEL_ANCHORS = [1, 5, 15, 20, 24, 28, 30];
// Conjunto de todos os `minItemLevel` distintos hoje cadastrados nos 14
// mods do jogo (prefixes.ts/suffixes.ts) — usado só pelo Modelo D pra
// ranquear cada limiar original antes de mapear pros anchors empíricos.
const ORIGINAL_DISTINCT_THRESHOLDS = [1, 10, 15, 20, 30, 35, 40, 50, 55, 60, 65];

const OLD_MIN = 1;
const OLD_MAX = 65;
const NEW_MIN = 1;
const NEW_MAX = MAX_LEVEL; // 30

function rescaleRaw(old: number, model: RescaleModel): number {
  if (model === "current") return old;
  if (model === "A") {
    // Linear: mapeia [1,65] -> [1,30] diretamente.
    return NEW_MIN + (old - OLD_MIN) * ((NEW_MAX - NEW_MIN) / (OLD_MAX - OLD_MIN));
  }
  if (model === "B") {
    // Proporcional: preserva os limiares já <= 20 (T3/T4, já dentro da
    // janela real), só comprime os limiares > 20 (T1/T2) pro intervalo
    // [20,30] restante.
    if (old <= 20) return old;
    return 20 + (old - 20) * ((NEW_MAX - 20) / (OLD_MAX - 20));
  }
  if (model === "C") {
    // Curva Suave: lei de potência (expoente 0.6 < 1) — espalha mais os
    // valores baixos/médios (onde a maioria das campanhas realmente
    // passa a maior parte do tempo, ver Fase 2 da auditoria anterior) em
    // vez de comprimir tudo linearmente; ainda assim converge pro mesmo
    // teto de 30.
    const t = (old - OLD_MIN) / (OLD_MAX - OLD_MIN);
    return NEW_MIN + (NEW_MAX - NEW_MIN) * Math.pow(t, 0.6);
  }
  // Modelo D — Adaptativo: rank do limiar original entre os 11 valores
  // distintos hoje usados, interpolado sobre os 7 anchors EMPÍRICOS de
  // nível médio de entrada de região (não uma curva sintética) — reflete
  // onde os personagens REALMENTE passam o tempo, não uma progressão
  // teórica linear/suave.
  const idx = ORIGINAL_DISTINCT_THRESHOLDS.indexOf(old);
  const f = idx >= 0 ? idx / (ORIGINAL_DISTINCT_THRESHOLDS.length - 1) : (old - OLD_MIN) / (OLD_MAX - OLD_MIN);
  const pos = f * (EMPIRICAL_LEVEL_ANCHORS.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(EMPIRICAL_LEVEL_ANCHORS.length - 1, lo + 1);
  const frac = pos - lo;
  return EMPIRICAL_LEVEL_ANCHORS[lo] + frac * (EMPIRICAL_LEVEL_ANCHORS[hi] - EMPIRICAL_LEVEL_ANCHORS[lo]);
}

// Garante ordem estritamente crescente por mod após arredondar (evita
// colisão entre tiers adjacentes por causa do arredondamento) — reaplica
// a MESMA garantia que já existia nos dados originais (T4 < T3 < T2 < T1).
function applyModel(model: RescaleModel): void {
  if (model === "current") return;
  const apply = (live: typeof ITEM_GEN_PREFIXES, pristine: typeof PRISTINE_PREFIXES) => {
    for (let i = 0; i < live.length; i++) {
      const order = [...pristine[i].tiers].sort((a, b) => a.minItemLevel - b.minItemLevel);
      let prevNew = 0;
      for (const pristineTier of order) {
        const liveTier = live[i].tiers.find((t) => t.tier === pristineTier.tier)!;
        let newVal = Math.round(rescaleRaw(pristineTier.minItemLevel, model));
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

function restoreOriginal(): void {
  for (let i = 0; i < ITEM_GEN_PREFIXES.length; i++) {
    for (let j = 0; j < ITEM_GEN_PREFIXES[i].tiers.length; j++) {
      ITEM_GEN_PREFIXES[i].tiers[j].minItemLevel = PRISTINE_PREFIXES[i].tiers[j].minItemLevel;
    }
  }
  for (let i = 0; i < ITEM_GEN_SUFFIXES.length; i++) {
    for (let j = 0; j < ITEM_GEN_SUFFIXES[i].tiers.length; j++) {
      ITEM_GEN_SUFFIXES[i].tiers[j].minItemLevel = PRISTINE_SUFFIXES[i].tiers[j].minItemLevel;
    }
  }
}

// ---------- estatística utilitária (mesma de todas as auditorias anteriores) ----------
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
  // Intervalo de confiança 95% pra média (aproximação normal, válido
  // pelo Teorema Central do Limite dado N >= alguns milhares em todas as
  // amostras desta Sprint).
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

// ---------- Fase 3: Monte Carlo comparativo (mesma metodologia da Sprint anterior, N reduzido pra caber 5 configs) ----------
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
  const byRegion = REGIONS.map(({ region, playerLevel }) => {
    const weapon: number[] = [];
    const armor: number[] = [];
    for (let i = 0; i < MC_N_PER_REGION; i++) {
      const seed = playerLevel * 1_000_003 + i * 7 + 1;
      weapon.push(generateItem(WEAPON_BASE, playerLevel, seed).powerScore);
      armor.push(generateItem(ARMOR_BASE, playerLevel, seed + 500_000).powerScore);
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

// ---------- Fase 4: Campaign Simulation (mesma metodologia de runEquipmentProgressionAudit.ts) ----------
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
  const characterId = `redesign-validation-${seed}`;
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
    survivalRate: runs.filter((r) => r.survived).length / RUN_COUNT,
    averageFinalLevel: average(runs.map((r) => r.finalLevel)),
    totalUpgradeEvents: runs.reduce((s, r) => s + r.equips.length, 0),
    averageUpgradesPerRun: average(runs.map((r) => r.equips.length)),
    deadLootRate: totalLoot > 0 ? 1 - totalUsed / totalLoot : 0,
    slotProgression: EQUIPMENT_SLOT_DEFINITIONS.map((def) => ({ slotId: def.id, totalUpgrades: slotUpgradeCounts[def.id] })),
    powerCurveByLevel,
    powerAtRegionEntry: Object.entries(powerByRegionEntry).map(([region, values]) => ({ region, averagePowerScoreAtEntry: average(values), entries: values.length })),
    // Fase 6 — Regression: nível 1-5 (early game) não deve mudar de forma
    // perceptível entre modelos — checagem direta abaixo na comparação.
    earlyGamePowerScoreLevel1: average(powerByLevel[1] ?? []),
    maxPowerScoreObserved: Math.max(...runs.flatMap((r) => r.powerSeries.map((p) => p.powerScore)), 0),
  };
}

// ---------- Execução: 1 configuração por vez, mutar -> medir -> restaurar ----------
console.log("Executando Monte Carlo + campanhas para cada modelo (current, A, B, C, D)...");
const results: Record<string, { monteCarlo: ReturnType<typeof runMonteCarlo>; campaign: ReturnType<typeof runCampaignSuite> }> = {};

for (const model of MODELS) {
  console.log(`  modelo ${model}...`);
  applyModel(model);
  try {
    const monteCarlo = runMonteCarlo();
    const campaign = runCampaignSuite();
    results[model] = { monteCarlo, campaign };
  } finally {
    restoreOriginal();
  }
}

// Confirma que os arquivos originais nunca foram tocados: os valores
// live devem ser bit-a-bit iguais ao clone pristine ao final da execução.
const restoredCorrectly =
  JSON.stringify(ITEM_GEN_PREFIXES) === JSON.stringify(PRISTINE_PREFIXES) && JSON.stringify(ITEM_GEN_SUFFIXES) === JSON.stringify(PRISTINE_SUFFIXES);

const report = { restoredCorrectly, results };

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "item-generation-redesign-validation.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "item-generation-redesign-validation.json")}`);
console.log("restoredCorrectly:", restoredCorrectly);
