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
  EQUIPMENT_SLOT_DEFINITIONS,
} from "../src/index.js";
import type { PresentationEvent } from "../src/index.js";

// Global Gameplay Rebalance — Phase I — auditoria completa do jogo sob
// o Continuous Affix Scaling já em produção (Sprint anterior). Mesma
// metodologia de jornada natural de TODAS as auditorias anteriores
// (createAdventureSession/advanceDungeonTick, nunca o Simulador/
// RuntimeConfig) — só a COLETA de dados foi ampliada (Fases 1-9 do
// briefing): tempo/mortalidade por região, Chefes (taxa de vitória,
// duração, equipamento, nível), Dungeons (conclusão), Elite/Mini-Boss,
// cadência de upgrade, curva de poder, ritmo de combate.
const REGION_ID = "bosque-sussurrante";
const CLASS_ID = "warrior";
const MAX_SIMULATED_SECONDS = 7200;
const SECONDS_PER_TICK = 22;
const MAX_TICKS = Math.floor(MAX_SIMULATED_SECONDS / SECONDS_PER_TICK);
const RUN_COUNT = 500;
const INVENTORY_CAPACITY = 30;

const DUNGEON_BOSS_BY_EXPEDITION: Record<string, string> = {
  "queda-da-fortaleza-sombria": "forgotten-guardian",
  "fortaleza-congelada": "frost-king",
  "catedral-esquecida": "corrupted-bishop",
  "covil-do-dragao": "ancient-dragon",
};

interface RegionVisit {
  region: string;
  enterTime: number;
  enterLevel: number;
  enterPowerScore: number;
  leaveTime: number | null; // null = morreu ou orçamento acabou dentro da região
  diedHere: boolean;
}

interface BossEncounterRecord {
  templateId: string;
  region: string;
  encounterTime: number;
  defeated: boolean;
  playerLevel: number;
  playerPowerScore: number;
}

interface EncounterCombatRecord {
  region: string;
  damageDealt: number;
  damageTaken: number;
  attackCount: number;
  enemiesKilled: number;
}

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
  maximumLife: number;
  armor: number;
  physicalDamage: number;
  spellDamage: number;
  attackSpeed: number;
}

interface LootRecord {
  region: string;
  powerScore: number;
  equippedInSameTick: boolean;
}

interface RunResult {
  seed: number;
  survived: boolean;
  finalLevel: number;
  finalTime: number;
  regionVisits: RegionVisit[];
  bossEncounters: BossEncounterRecord[];
  eliteMiniBossOutcomes: { templateId: string; region: string; defeated: boolean }[];
  dungeonOutcomes: { expeditionId: string; completed: boolean; encountersCompleted: number }[];
  encounterCombat: EncounterCombatRecord[];
  recoveryEvents: number;
  equips: EquipRecord[];
  loot: LootRecord[];
  powerSeries: PowerSample[];
}

function estimateDps(s: { physicalDamage: number; spellDamage: number; attackSpeed: number }): number {
  return (s.physicalDamage + s.spellDamage) * s.attackSpeed;
}

function runOne(seed: number): RunResult {
  const characterId = `rebalance-audit-${seed}`;
  const build = new CharacterBuild(characterId, CLASS_ID, 0);
  const inventory = new Inventory(characterId, INVENTORY_CAPACITY);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, CLASS_ID, seed);

  const session = createAdventureSession(`${characterId}-session`, character, REGION_ID, seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);

  const regionVisits: RegionVisit[] = [];
  const bossEncounters: BossEncounterRecord[] = [];
  const eliteMiniBossOutcomes: { templateId: string; region: string; defeated: boolean }[] = [];
  const dungeonOutcomes: { expeditionId: string; completed: boolean; encountersCompleted: number }[] = [];
  const encounterCombat: EncounterCombatRecord[] = [];
  const equips: EquipRecord[] = [];
  const loot: LootRecord[] = [];
  const powerSeries: PowerSample[] = [];
  let recoveryEvents = 0;

  let currentVisit: RegionVisit | null = null;
  let ticks = 0;
  let survived = true;

  while (ticks < MAX_TICKS && session.character.currentLife > 0) {
    ticks++;
    const currentTime = ticks * SECONDS_PER_TICK * 1000;
    const region = session.currentRegion;
    const level = session.character.characterBuild.level;
    const { tickResult, events } = advanceDungeonTick(session, timeline, { autoEquip: true, currentTime });
    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);

    if (!currentVisit || currentVisit.region !== region) {
      if (currentVisit) currentVisit.leaveTime = ticks * SECONDS_PER_TICK;
      currentVisit = {
        region,
        enterTime: ticks * SECONDS_PER_TICK,
        enterLevel: level,
        enterPowerScore: finalStats.powerScore,
        leaveTime: null,
        diedHere: false,
      };
      regionVisits.push(currentVisit);
    }

    let tickDamageDealt = 0;
    let tickDamageTaken = 0;
    let tickAttackCount = 0;
    let tickKills = 0;

    for (const event of events as PresentationEvent[]) {
      if (event.kind === "AttackHit") {
        tickDamageDealt += event.damageDealt;
        tickDamageTaken += event.damageTaken;
        tickAttackCount++;
      }
      if (event.kind === "EnemyKilled") tickKills += event.count;
      if (event.kind === "RecoveryApplied") recoveryEvents++;
      if (event.kind === "LootDropped") {
        loot.push({
          region,
          powerScore: event.powerScore,
          equippedInSameTick: events.some((e) => e.kind === "ItemEquipped" && e.baseItemId === event.baseItemId),
        });
      }
      if (event.kind === "ItemEquipped") {
        equips.push({ time: ticks * SECONDS_PER_TICK, region, level, slotId: event.slotId });
      }
      if (event.kind === "EliteEncounter" || event.kind === "MiniBossEncounter") {
        eliteMiniBossOutcomes.push({ templateId: event.enemyTemplateId, region: event.regionId, defeated: false });
      }
      if (event.kind === "EliteDefeated" || event.kind === "MiniBossDefeated") {
        const pending = [...eliteMiniBossOutcomes].reverse().find((o) => o.templateId === event.enemyTemplateId && !o.defeated);
        if (pending) pending.defeated = true;
      }
      if (event.kind === "FinalBossEncounter") {
        bossEncounters.push({
          templateId: event.enemyTemplateId,
          region: event.regionId,
          encounterTime: ticks * SECONDS_PER_TICK,
          defeated: false,
          playerLevel: level,
          playerPowerScore: finalStats.powerScore,
        });
      }
      if (event.kind === "FinalBossDefeated") {
        const pending = [...bossEncounters].reverse().find((b) => b.templateId === event.enemyTemplateId && !b.defeated);
        if (pending) pending.defeated = true;
      }
      if (event.kind === "ExpeditionCompleted") {
        dungeonOutcomes.push({ expeditionId: event.expeditionId, completed: true, encountersCompleted: event.encountersCompleted });
      }
      if (event.kind === "ExpeditionFailed") {
        dungeonOutcomes.push({ expeditionId: event.expeditionId, completed: false, encountersCompleted: event.encountersCompleted });
      }
    }

    if (tickAttackCount > 0) {
      encounterCombat.push({ region, damageDealt: tickDamageDealt, damageTaken: tickDamageTaken, attackCount: tickAttackCount, enemiesKilled: tickKills });
    }

    powerSeries.push({
      time: ticks * SECONDS_PER_TICK,
      region,
      level,
      powerScore: finalStats.powerScore,
      maximumLife: finalStats.maximumLife,
      armor: finalStats.armor,
      physicalDamage: finalStats.physicalDamage,
      spellDamage: finalStats.spellDamage,
      attackSpeed: finalStats.attackSpeed,
    });

    if (!tickResult.characterAlive) {
      survived = false;
      if (currentVisit) {
        currentVisit.diedHere = true;
        currentVisit.leaveTime = ticks * SECONDS_PER_TICK;
      }
      break;
    }
  }
  if (currentVisit && currentVisit.leaveTime === null && survived) {
    currentVisit.leaveTime = ticks * SECONDS_PER_TICK;
  }

  return {
    seed,
    survived,
    finalLevel: session.character.characterBuild.level,
    finalTime: ticks * SECONDS_PER_TICK,
    regionVisits,
    bossEncounters,
    eliteMiniBossOutcomes,
    dungeonOutcomes,
    encounterCombat,
    recoveryEvents,
    equips,
    loot,
    powerSeries,
  };
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[idx];
}

console.log(`Executando ${RUN_COUNT} campanhas (jornada natural, Continuous Affix Scaling em produção)...`);
const runs: RunResult[] = [];
for (let i = 0; i < RUN_COUNT; i++) runs.push(runOne(1 + i * 99991));

// ---------- Fase 1/2: Gameplay Overview + Region Difficulty ----------
const regionStats: Record<
  string,
  { entries: number; deaths: number; totalTimeSpent: number; enterLevels: number[]; enterPowerScores: number[] }
> = {};
for (const run of runs) {
  for (const visit of run.regionVisits) {
    const bucket = (regionStats[visit.region] ??= { entries: 0, deaths: 0, totalTimeSpent: 0, enterLevels: [], enterPowerScores: [] });
    bucket.entries++;
    if (visit.diedHere) bucket.deaths++;
    if (visit.leaveTime !== null) bucket.totalTimeSpent += visit.leaveTime - visit.enterTime;
    bucket.enterLevels.push(visit.enterLevel);
    bucket.enterPowerScores.push(visit.enterPowerScore);
  }
}
const regionReport = Object.entries(regionStats).map(([region, s]) => ({
  region,
  entries: s.entries,
  reachRate: s.entries / RUN_COUNT,
  mortalityRate: s.deaths / s.entries,
  averageTimeSpentSeconds: s.totalTimeSpent / s.entries,
  averageLevelAtEntry: average(s.enterLevels),
  averagePowerScoreAtEntry: average(s.enterPowerScores),
}));

// ---------- Fase 4: Boss Audit ----------
const bossStats: Record<string, { encounters: number; wins: number; levels: number[]; powerScores: number[] }> = {};
for (const run of runs) {
  for (const b of run.bossEncounters) {
    const bucket = (bossStats[b.templateId] ??= { encounters: 0, wins: 0, levels: [], powerScores: [] });
    bucket.encounters++;
    if (b.defeated) bucket.wins++;
    bucket.levels.push(b.playerLevel);
    bucket.powerScores.push(b.playerPowerScore);
  }
}
const bossReport = Object.entries(bossStats).map(([templateId, s]) => ({
  templateId,
  encounters: s.encounters,
  winRate: s.wins / s.encounters,
  averagePlayerLevel: average(s.levels),
  averagePlayerPowerScore: average(s.powerScores),
}));

// Elite/MiniBoss win rate (fortaleza-sombria "boss"/"dark-knight" incluídos aqui, já que não têm Expedição-Dungeon dedicada)
const eliteMiniBossStats: Record<string, { encounters: number; wins: number }> = {};
for (const run of runs) {
  for (const e of run.eliteMiniBossOutcomes) {
    const bucket = (eliteMiniBossStats[e.templateId] ??= { encounters: 0, wins: 0 });
    bucket.encounters++;
    if (e.defeated) bucket.wins++;
  }
}
const eliteMiniBossReport = Object.entries(eliteMiniBossStats).map(([templateId, s]) => ({
  templateId,
  encounters: s.encounters,
  winRate: s.wins / s.encounters,
}));

// ---------- Fase 5: Dungeon Audit ----------
const dungeonStats: Record<string, { attempts: number; completions: number }> = {};
for (const run of runs) {
  for (const d of run.dungeonOutcomes) {
    const bucket = (dungeonStats[d.expeditionId] ??= { attempts: 0, completions: 0 });
    bucket.attempts++;
    if (d.completed) bucket.completions++;
  }
}
const dungeonReport = Object.entries(dungeonStats).map(([expeditionId, s]) => ({
  expeditionId,
  bossTemplateId: DUNGEON_BOSS_BY_EXPEDITION[expeditionId] ?? null,
  attempts: s.attempts,
  completionRate: s.completions / s.attempts,
}));

// ---------- Fase 6: Region Rewards (loot quality/uso por região, já estabelecido) ----------
const lootByRegion: Record<string, { drops: number; used: number; powerSum: number }> = {};
for (const run of runs) {
  for (const l of run.loot) {
    const bucket = (lootByRegion[l.region] ??= { drops: 0, used: 0, powerSum: 0 });
    bucket.drops++;
    if (l.equippedInSameTick) bucket.used++;
    bucket.powerSum += l.powerScore;
  }
}
const lootReport = Object.entries(lootByRegion).map(([region, s]) => ({
  region,
  drops: s.drops,
  usageRate: s.used / s.drops,
  averagePowerScore: s.powerSum / s.drops,
}));

// ---------- Fase 7: Upgrade Cadence ----------
const allGaps: number[] = [];
for (const run of runs) {
  const times = run.equips.map((e) => e.time).sort((a, b) => a - b);
  for (let i = 1; i < times.length; i++) allGaps.push(times[i] - times[i - 1]);
}
const sortedGaps = [...allGaps].sort((a, b) => a - b);

// ---------- Fase 8: Power Curve ----------
const byLevel: Record<number, { power: number[]; life: number[]; armor: number[]; dps: number[] }> = {};
for (const run of runs) {
  for (const sample of run.powerSeries) {
    const bucket = (byLevel[sample.level] ??= { power: [], life: [], armor: [], dps: [] });
    bucket.power.push(sample.powerScore);
    bucket.life.push(sample.maximumLife);
    bucket.armor.push(sample.armor);
    bucket.dps.push(estimateDps(sample));
  }
}
const powerCurve = Object.entries(byLevel)
  .map(([level, b]) => ({
    level: Number(level),
    averagePowerScore: average(b.power),
    averageMaximumLife: average(b.life),
    averageArmor: average(b.armor),
    averageEstimatedDps: average(b.dps),
    samples: b.power.length,
  }))
  .sort((a, b) => a.level - b.level);

// ---------- Fase 9: Combat Pacing ----------
const combatByRegion: Record<string, { encounters: number; damageDealt: number[]; damageTaken: number[]; attackCount: number[] }> = {};
for (const run of runs) {
  for (const c of run.encounterCombat) {
    const bucket = (combatByRegion[c.region] ??= { encounters: 0, damageDealt: [], damageTaken: [], attackCount: [] });
    bucket.encounters++;
    bucket.damageDealt.push(c.damageDealt);
    bucket.damageTaken.push(c.damageTaken);
    bucket.attackCount.push(c.attackCount);
  }
}
const combatPacingReport = Object.entries(combatByRegion).map(([region, b]) => ({
  region,
  encounters: b.encounters,
  averageDamageDealt: average(b.damageDealt),
  averageDamageTaken: average(b.damageTaken),
  averageAttacksPerEncounter: average(b.attackCount),
}));
const totalRecoveryEvents = runs.reduce((s, r) => s + r.recoveryEvents, 0);

const report = {
  totalRuns: RUN_COUNT,
  survivalRate: runs.filter((r) => r.survived).length / RUN_COUNT,
  averageFinalLevel: average(runs.map((r) => r.finalLevel)),
  fase1_2_regionOverview: regionReport,
  fase3_note: "Enemy Scaling avaliado via Boss/Elite/MiniBoss win rate (fase4) e Combat Pacing (fase9) — vida/ataque/defesa/velocidade não são reamostrados aqui pois já são dado estático (enemy/templates.ts), a auditoria mede o RESULTADO desses stats contra o jogador atual.",
  fase4_bossReport: bossReport,
  fase4b_eliteMiniBossReport: eliteMiniBossReport,
  fase5_dungeonReport: dungeonReport,
  fase6_regionRewards: lootReport,
  fase7_upgradeCadence: {
    totalUpgradeEvents: runs.reduce((s, r) => s + r.equips.length, 0),
    averageUpgradesPerRun: average(runs.map((r) => r.equips.length)),
    averageGapSeconds: average(allGaps),
    medianGapSeconds: median(allGaps),
    p90GapSeconds: percentile(sortedGaps, 90),
  },
  fase8_powerCurve: powerCurve,
  fase9_combatPacing: { byRegion: combatPacingReport, totalRecoveryEvents, averageRecoveryEventsPerRun: totalRecoveryEvents / RUN_COUNT },
};

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "global-gameplay-rebalance-audit.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "global-gameplay-rebalance-audit.json")}`);
console.log("survivalRate:", report.survivalRate, "averageFinalLevel:", report.averageFinalLevel.toFixed(2));
