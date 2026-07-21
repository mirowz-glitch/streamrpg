import { getRegionName } from "../regions.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { getBiomeDefinition } from "../worldencounter/biomes.js";
import { ELITE_MODIFIER, MINIBOSS_AURA } from "../worldencounter/eliteModifiers.js";
import { getExplorationEventDefinition } from "../worldevents/worldEventDefinitions.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import { getProgress } from "../xp.js";
import { deriveObjectiveProgress } from "../objectives/objectiveProgress.js";
import { deriveExpeditionProgress } from "../expeditions/expeditionProgress.js";
import { deriveCurrentFactionProgress } from "../factions/factionProgress.js";
import { deriveDungeonBossProgress } from "../dungeon/dungeonProgress.js";
import type { AdventureSession } from "../adventure/types.js";
import type { AdventureTimeline, PresentationEvent } from "../presentation/types.js";
import type {
  HudDamageRecord,
  HudEncounterInfo,
  HudEncounterState,
  HudExpeditionInfo,
  HudFactionInfo,
  HudFinalBossInfo,
  HudLevelUpInfo,
  HudObjectiveCompletedInfo,
  HudObjectiveInfo,
  HudRecentEquip,
  HudRecentLoot,
  HudRecentRecovery,
  HudRecentWorldEvent,
  HudRegionInfo,
  HudRegionUnlockInfo,
  HudSessionHistory,
  HudSessionStatus,
  HudSessionSummary,
  HudState,
  HudVariantDefeatedInfo,
  HudVariantEncounterInfo,
} from "./types.js";

const DEFAULT_RECENT_EVENT_LIMIT = 20;

// Requisito 3 — classificação de dificuldade derivada SÓ do
// `recommendedLevelRange.min` (nível mínimo real da Encounter Table da
// região, World Encounter System) — a mesma regra pra qualquer região,
// nunca um texto fixo por região. Faixas ilustrativas, não calibradas
// (mesma convenção do resto do projeto).
function classifyDifficulty(minimumLevel: number): string {
  if (minimumLevel < 10) return "Baixa";
  if (minimumLevel < 25) return "Média";
  if (minimumLevel < 45) return "Alta";
  return "Muito Alta";
}

function deriveRegionInfo(regionId: string): HudRegionInfo {
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
    biome: biome
      ? {
          order: biome.order,
          climate: biome.climate,
          description: biome.description,
          difficultyLabel: biome.difficultyLabel,
          visualTheme: { ...biome.visualTheme },
        }
      : null,
  };
}

// Requisito 4 — "derivado apenas da Adventure Session": lê só
// `session.currentEncounter` (real) e o Presentation Event mais
// recente relevante (EncounterFinished) pra distinguir "acabou de
// terminar" de "explorando, sem encontro nenhum". Nunca inventa nada
// além disso.
function deriveEncounterInfo(session: AdventureSession, events: readonly PresentationEvent[]): HudEncounterInfo {
  const encounter = session.currentEncounter;

  if (encounter) {
    const enemiesAlive = encounter.enemies.filter((enemy) => enemy.alive).length;
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/7:
    // `encounter.variant`/aura só existem enquanto `currentEncounter`
    // ainda está preenchido (ver nota no tipo, hud/types.ts) — mesma
    // limitação de `enemiesAlive` acima.
    const auraColor = encounter.variant === "elite" ? ELITE_MODIFIER.auraColor : encounter.variant === "miniboss" ? MINIBOSS_AURA.color : null;
    const auraIcon = encounter.variant === "elite" ? ELITE_MODIFIER.auraIcon : encounter.variant === "miniboss" ? MINIBOSS_AURA.icon : null;
    return {
      state: "em-combate",
      enemiesTotal: encounter.enemies.length,
      enemiesAlive,
      enemiesDefeated: encounter.enemies.length - enemiesAlive,
      variant: encounter.variant,
      auraColor,
      auraIcon,
    };
  }

  const lastRelevantEvent = findLast(events, (event) => event.kind === "EncounterFinished" || event.kind === "CharacterDied");
  const state: HudEncounterState = lastRelevantEvent?.kind === "EncounterFinished" ? "concluido" : "sem-encontro";

  return { state, enemiesTotal: 0, enemiesAlive: 0, enemiesDefeated: 0, variant: "normal", auraColor: null, auraIcon: null };
}

// Requisito 10 — "nunca inferir estados, usar apenas dados
// existentes": "derrota" e "explorando"/"em-combate" são os únicos
// estados que o Adventure Loop de hoje realmente produz (ver nota em
// types.ts) — `session.character.currentLife`/`session.currentEncounter`
// são os dois únicos campos lidos aqui. "vitoria"/"encerrada" nunca são
// retornados nesta fase: não existe condição de vitória nem
// encerramento explícito em nenhum sistema já construído — inventar
// uma aqui seria "inferir estado", exatamente o que este requisito
// proíbe.
function deriveSessionStatus(session: AdventureSession): HudSessionStatus {
  if (session.character.currentLife <= 0) return "derrota";
  if (session.currentEncounter) return "em-combate";
  return "explorando";
}

function findLast<T>(items: readonly T[], predicate: (item: T) => boolean): T | undefined {
  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i])) return items[i];
  }
  return undefined;
}

function toRecentLoot(event: PresentationEvent | undefined): HudRecentLoot | null {
  if (!event || event.kind !== "LootDropped") return null;
  return {
    instanceId: event.instanceId,
    baseItemId: event.baseItemId,
    rarity: event.rarity,
    powerScore: event.powerScore,
    regionId: event.regionId,
    tickIndex: event.tickIndex,
  };
}

function toRecentEquip(event: PresentationEvent | undefined): HudRecentEquip | null {
  if (!event || event.kind !== "ItemEquipped") return null;
  return {
    slotId: event.slotId,
    baseItemId: event.baseItemId,
    rarity: event.rarity,
    powerScore: event.powerScore,
    previousPowerScore: event.previousPowerScore,
    delta: event.powerScore - event.previousPowerScore,
    tickIndex: event.tickIndex,
  };
}

type LootDroppedEvent = Extract<PresentationEvent, { kind: "LootDropped" }>;
type AttackHitEvent = Extract<PresentationEvent, { kind: "AttackHit" }>;

function toLevelUpInfo(event: PresentationEvent | undefined): HudLevelUpInfo | null {
  if (!event || event.kind !== "LevelUp") return null;
  return { level: event.level, previousLevel: event.previousLevel, tickIndex: event.tickIndex };
}

// Recovery & Adventure Flow Phase I — requisito 5: mesmo padrão de
// toLevelUpInfo, agora pro RecoveryApplied (Recovery Layer).
function toRecentRecovery(event: PresentationEvent | undefined): HudRecentRecovery | null {
  if (!event || event.kind !== "RecoveryApplied") return null;
  return {
    lifeBefore: event.lifeBefore,
    lifeHealed: event.lifeHealed,
    lifeAfter: event.lifeAfter,
    reason: event.reason,
    tickIndex: event.tickIndex,
  };
}

// Objectives, Missions & Player Goals Phase I — requisito 1/5: reusa a
// derivação pura já feita pelo Objective System (objectiveProgress.ts)
// — HUD nunca recalcula progresso de objetivo, só empacota o snapshot
// pro shape que os componentes consomem. `percent` é aritmética pura
// (mesmo princípio de HealthBarState), nunca uma segunda fonte de
// verdade de progresso.
function toObjectiveInfo(session: AdventureSession, timeline: AdventureTimeline): HudObjectiveInfo {
  const snapshot = deriveObjectiveProgress(session, timeline);
  const percent = snapshot.target > 0 ? Math.min(100, Math.floor((snapshot.progress / snapshot.target) * 100)) : 100;
  return {
    id: snapshot.objective.id,
    name: snapshot.objective.name,
    description: snapshot.objective.description,
    progress: Math.min(snapshot.progress, snapshot.target),
    target: snapshot.target,
    percent,
  };
}

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 7: reusa a derivação pura já feita pelo Expedition
// Controller (expeditionProgress.ts) — HUD nunca recalcula progresso
// de expedição, só empacota o snapshot pro shape que os componentes
// consomem (mesmo princípio de toObjectiveInfo acima). `null` quando
// nenhuma expedição está ativa agora.
// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
// 8: reusa a derivação pura já feita pelo módulo dungeon/
// (dungeonProgress.ts) — HUD nunca recalcula progresso do Chefe Final,
// só empacota o snapshot. `null` quando a Expedição ativa não é uma
// Dungeon.
function toFinalBossInfo(session: AdventureSession, timeline: AdventureTimeline): HudFinalBossInfo | null {
  const snapshot = deriveDungeonBossProgress(session, timeline);
  if (!snapshot) return null;
  return {
    bossName: snapshot.bossName,
    encountered: snapshot.encountered,
    defeated: snapshot.defeated,
    healthPercent: snapshot.healthPercent,
  };
}

function toExpeditionInfo(session: AdventureSession, timeline: AdventureTimeline): HudExpeditionInfo | null {
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
    finalBoss: toFinalBossInfo(session, timeline),
  };
}

// Factions, Reputation & World Consequences Phase I — requisito 5:
// reusa a derivação pura já feita pelo Faction System
// (factionProgress.ts) — HUD nunca recalcula reputação, só empacota o
// snapshot pro shape que os componentes consomem (mesmo princípio de
// toObjectiveInfo/toExpeditionInfo acima). `null` quando a região atual
// não tem facção dona.
function toFactionInfo(session: AdventureSession, timeline: AdventureTimeline): HudFactionInfo | null {
  const snapshot = deriveCurrentFactionProgress(session.currentRegion, timeline);
  if (!snapshot) return null;
  return {
    factionId: snapshot.factionId,
    factionName: snapshot.factionName,
    reputation: snapshot.reputation,
    rankId: snapshot.rankId,
    rankName: snapshot.rankName,
    percentToNextRank: snapshot.percentToNextRank,
    nextRankName: snapshot.nextRankName,
  };
}

function toObjectiveCompletedInfo(event: PresentationEvent | undefined): HudObjectiveCompletedInfo | null {
  if (!event || event.kind !== "ObjectiveCompleted") return null;
  return {
    objectiveId: event.objectiveId,
    objectiveName: event.objectiveName,
    xpBonus: event.xpBonus,
    tickIndex: event.tickIndex,
  };
}

// Biomes, Regions & World Progression Phase I — requisito 7: mesmo
// padrão de toLevelUpInfo/toObjectiveCompletedInfo. `newRegionName` vem
// de getRegionName() (já existente), nunca hardcoded.
function toRegionUnlockInfo(event: PresentationEvent | undefined): HudRegionUnlockInfo | null {
  if (!event || event.kind !== "RegionUnlocked") return null;
  return {
    previousRegionId: event.previousRegionId,
    newRegionId: event.newRegionId,
    newRegionName: getRegionName(event.newRegionId),
    tickIndex: event.tickIndex,
  };
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 6/7: mesmo
// padrão de toLevelUpInfo/toRegionUnlockInfo.
function toVariantEncounterInfo(event: PresentationEvent | undefined, kind: "EliteEncounter" | "MiniBossEncounter"): HudVariantEncounterInfo | null {
  if (!event || event.kind !== kind) return null;
  return { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, regionId: event.regionId, tickIndex: event.tickIndex };
}

function toVariantDefeatedInfo(event: PresentationEvent | undefined, kind: "EliteDefeated" | "MiniBossDefeated"): HudVariantDefeatedInfo | null {
  if (!event || event.kind !== kind) return null;
  return { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, xpBonus: event.xpBonus, tickIndex: event.tickIndex };
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 6: mesmo padrão de toVariantEncounterInfo. `description` vem de
// getExplorationEventDefinition() (worldevents/, só lido) — o próprio
// WorldEventStarted não carrega descrição.
//
// Diferente de toLevelUpInfo/toRegionUnlockInfo/toVariantEncounterInfo
// (que devolvem o último evento do tipo em QUALQUER tick da Timeline,
// e só "somem" da UI porque os banners que os consomem leem do
// Animation Controller, que expira sozinho) — `recentWorldEvent` é
// consumido diretamente por um painel persistente (WorldEventPanel,
// requisito 6), não por um banner temporário. Por isso a checagem de
// `tickIndex === lastTickIndexOf(events)` é feita aqui de propósito
// (mesmo princípio de deriveNewBestItemEvent/deriveNewDamageRecordEvent):
// sem ela, o painel mostraria o ÚLTIMO evento pra sempre, mesmo
// dezenas de encontros depois.
function toRecentWorldEvent(event: PresentationEvent | undefined, events: readonly PresentationEvent[]): HudRecentWorldEvent | null {
  if (!event || event.kind !== "WorldEventStarted") return null;
  if (event.tickIndex !== lastTickIndexOf(events)) return null;
  const definition = getExplorationEventDefinition(event.explorationEventId);
  return {
    explorationEventId: event.explorationEventId,
    name: event.name,
    description: definition?.description ?? "",
    category: event.category,
    tickIndex: event.tickIndex,
  };
}

function toHudRecentLoot(event: LootDroppedEvent): HudRecentLoot {
  return {
    instanceId: event.instanceId,
    baseItemId: event.baseItemId,
    rarity: event.rarity,
    powerScore: event.powerScore,
    regionId: event.regionId,
    tickIndex: event.tickIndex,
  };
}

// Requisito 5/7 — "sem consultar novamente o Inventory ou Equipment":
// varre só os LootDropped já registrados na Adventure Timeline (o
// mesmo princípio de toRecentLoot/toRecentEquip), guarda o de maior
// Power Score já visto nesta sessão.
function deriveBestItem(events: readonly PresentationEvent[]): HudRecentLoot | null {
  let best: LootDroppedEvent | null = null;
  for (const event of events) {
    if (event.kind === "LootDropped" && (!best || event.powerScore > best.powerScore)) {
      best = event;
    }
  }
  return best ? toHudRecentLoot(best) : null;
}

// Requisito 5/6 — "a tick exata em que o recorde foi batido": um tick
// pode empurrar vários eventos (ex.: LootDropped seguido de
// EncounterFinished/LevelUp), então o LootDropped/AttackHit relevante
// NUNCA é garantido ser o último item do array — precisa comparar
// contra o `tickIndex` do último evento, não contra "é o último
// elemento".
function lastTickIndexOf(events: readonly PresentationEvent[]): number | null {
  return events.length > 0 ? events[events.length - 1].tickIndex : null;
}

// Requisito 5 — só não-nulo quando a tick MAIS RECENTE da Timeline
// tiver um LootDropped que supera todos os LootDropped de ticks
// anteriores — o instante exato em que o recorde foi batido, pra UI
// celebrar uma única vez.
function deriveNewBestItemEvent(events: readonly PresentationEvent[]): HudRecentLoot | null {
  const tickIndex = lastTickIndexOf(events);
  if (tickIndex === null) return null;

  let previousBest = -Infinity;
  let bestThisTick: LootDroppedEvent | null = null;
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

// Requisito 6 — mesmo princípio do item, aplicado ao maior dano
// causado num único AttackHit (a menor granularidade observável nesta
// fase, ver presentation/types.ts).
function deriveNewDamageRecordEvent(events: readonly PresentationEvent[]): HudDamageRecord | null {
  const tickIndex = lastTickIndexOf(events);
  if (tickIndex === null) return null;

  let previousBest = -Infinity;
  let bestThisTick: AttackHitEvent | null = null;
  for (const event of events) {
    if (event.kind !== "AttackHit") continue;
    if (event.tickIndex === tickIndex) {
      if (!bestThisTick || event.damageDealt > bestThisTick.damageDealt) bestThisTick = event;
    } else if (event.damageDealt > previousBest) {
      previousBest = event.damageDealt;
    }
  }
  return bestThisTick && bestThisTick.damageDealt > previousBest
    ? { damageDealt: bestThisTick.damageDealt, tickIndex: bestThisTick.tickIndex }
    : null;
}

// Requisito 3 — "todos os dados devem vir da Adventure Session":
// só não-nulo quando a sessão termina em derrota — o único fim de
// sessão que o Adventure Loop produz hoje (ver HudSessionStatus).
function deriveSessionSummary(session: AdventureSession, timeline: AdventureTimeline): HudSessionSummary | null {
  if (session.character.currentLife > 0) return null;
  const statistics = session.statistics;
  return {
    elapsedTime: statistics.elapsedTime,
    enemiesKilled: statistics.enemiesKilled,
    damageDealt: statistics.damageDealt,
    damageTaken: statistics.damageTaken,
    itemsFound: statistics.itemsFound,
    itemsEquipped: statistics.itemsEquipped,
    xpGained: timeline.totalXpGranted,
  };
}

// Requisito 4 — "derivar apenas de dados existentes": agregados
// simples a partir de AdventureStatistics + contagem de eventos
// "EncounterStarted" já existentes na Timeline. Guardas de divisão por
// zero devolvem 0 (ou 100% de sobrevivência, sem nenhum encontro
// iniciado ainda).
function deriveSessionHistory(session: AdventureSession, events: readonly PresentationEvent[]): HudSessionHistory {
  const statistics = session.statistics;
  const encountersStarted = events.filter((event) => event.kind === "EncounterStarted").length;
  const survivalRate = encountersStarted > 0 ? Math.min(100, (statistics.encountersCompleted / encountersStarted) * 100) : 100;
  const elapsedSeconds = statistics.elapsedTime / 1000;
  const averageDps = elapsedSeconds > 0 ? statistics.damageDealt / elapsedSeconds : 0;
  const damagePerEncounter = statistics.encountersCompleted > 0 ? statistics.damageTaken / statistics.encountersCompleted : 0;
  const itemsPerEncounter = statistics.encountersCompleted > 0 ? statistics.itemsFound / statistics.encountersCompleted : 0;

  return {
    encountersCompleted: statistics.encountersCompleted,
    encountersStarted,
    survivalRate,
    averageDps,
    damagePerEncounter,
    itemsPerEncounter,
  };
}

export interface DeriveHudStateOptions {
  recentEventLimit?: number;
}

// Requisito 1 — HUD State: a única transformação entre Adventure
// Session/Presentation Layer e qualquer componente de UI. Pura e
// memoizável (requisito 13): mesma sessão + mesma timeline (mesmo
// conteúdo) sempre produzem o mesmo HudState — nenhuma leitura de
// relógio, nenhuma RNG, nenhuma mutação.
export function deriveHudState(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: DeriveHudStateOptions = {},
): HudState {
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
    faction: toFactionInfo(session, timeline),
  };
}
