import { BIOME_PROGRESSION } from "../worldencounter/biomes.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { EXPEDITION_DEFINITIONS } from "../expeditions/expeditionDefinitions.js";
import { FACTION_DEFINITIONS } from "../factions/factionDefinitions.js";
import { ITEM_GEN_RARITIES } from "../itemgen/rarities.js";
import type {
  BalanceReport,
  BossBalanceStats,
  BossEncounterProfileStats,
  CombatStats,
  DungeonStats,
  EliteMiniBossStats,
  EquipmentProgressionStats,
  ExpeditionStats,
  FactionBreakdown,
  FactionStats,
  JourneyMilestone,
  LootStats,
  ObjectiveStats,
  ProgressionStats,
  RecoveryStats,
  RegionBreakdown,
  RegionProgressionBreakdown,
  RhythmStats,
  SimulatedAdventureResult,
  SurvivalStats,
  VariantEncounterStats,
  WorldEventCategoryBreakdown,
  WorldEventStats,
} from "./types.js";

function average(values: number[]): number {
  return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

// Balance, Pacing & Player Experience Phase I — Fase 1 (Sobrevivência):
// "HP médio; HP mínimo; mortes por Elite/Mini-Boss/Boss." `averageHpPercent`
// soma TODAS as amostras de TODAS as execuções antes de dividir (média
// ponderada por tempo de jogo real, não uma "média das médias" que
// daria peso igual a uma sessão de 5 ticks e outra de 500).
function buildSurvivalStats(results: SimulatedAdventureResult[]): SurvivalStats {
  const seconds = results.map((r) => r.simulatedSeconds);
  const deaths = results.filter((r) => !r.survived).length;
  const totalHpPercentSum = results.reduce((sum, r) => sum + r.hpPercentSum, 0);
  const totalHpPercentSamples = results.reduce((sum, r) => sum + r.hpPercentSamples, 0);
  const minHpValues = results.filter((r) => r.hpPercentSamples > 0).map((r) => r.minHpPercentObserved);
  const deadResults = results.filter((r) => !r.survived);
  return {
    averageSeconds: average(seconds),
    minSeconds: seconds.length > 0 ? Math.min(...seconds) : 0,
    maxSeconds: seconds.length > 0 ? Math.max(...seconds) : 0,
    deathRate: results.length > 0 ? deaths / results.length : 0,
    averageHpPercent: totalHpPercentSamples > 0 ? totalHpPercentSum / totalHpPercentSamples : 0,
    minHpPercentObserved: minHpValues.length > 0 ? Math.min(...minHpValues) : 0,
    deathsByElite: deadResults.filter((r) => r.deathCause === "elite").length,
    deathsByMiniBoss: deadResults.filter((r) => r.deathCause === "miniboss").length,
    deathsByBoss: deadResults.filter((r) => r.deathCause === "boss").length,
    deathsByNormal: deadResults.filter((r) => r.deathCause === "normal").length,
  };
}

// Fase 1 (Progressão): "XP por minuto; ouro por minuto; loot por
// minuto; tempo até 1º Elite/Mini-Boss/World Event." As taxas "por
// minuto" são a MÉDIA das taxas individuais de cada execução (mesma
// convenção de "average" de todo o resto deste arquivo), não uma soma
// agregada dividida por tempo total.
function buildProgressionStats(results: SimulatedAdventureResult[]): ProgressionStats {
  const levelDistribution: Record<number, number> = {};
  for (const result of results) {
    levelDistribution[result.finalLevel] = (levelDistribution[result.finalLevel] ?? 0) + 1;
  }
  const perRunRate = (getValue: (r: SimulatedAdventureResult) => number) =>
    average(results.filter((r) => r.simulatedSeconds > 0).map((r) => getValue(r) / (r.simulatedSeconds / 60)));

  const eliteTimes = results.filter((r) => r.secondsToFirstElite >= 0).map((r) => r.secondsToFirstElite);
  const miniBossTimes = results.filter((r) => r.secondsToFirstMiniBoss >= 0).map((r) => r.secondsToFirstMiniBoss);
  const worldEventTimes = results.filter((r) => r.secondsToFirstWorldEvent >= 0).map((r) => r.secondsToFirstWorldEvent);
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 1 (Curva de Progressão): "tempo até 1ª conclusão de
  // Expedição; tempo até 1ª Dungeon; tempo até 1º Boss" (encontro E
  // derrota) — mesmo princípio de ausência de dado (-1 filtrado) já
  // usado acima.
  const itemTimes = results.filter((r) => r.secondsToFirstItem >= 0).map((r) => r.secondsToFirstItem);
  const expeditionCompletionTimes = results.filter((r) => r.secondsToFirstExpeditionCompletion >= 0).map((r) => r.secondsToFirstExpeditionCompletion);
  const dungeonStartTimes = results.filter((r) => r.secondsToFirstDungeonStart >= 0).map((r) => r.secondsToFirstDungeonStart);
  const secondsPerTickSamples = results.filter((r) => r.ticks > 0).map((r) => r.simulatedSeconds / r.ticks);
  const secondsPerTick = average(secondsPerTickSamples);
  const bossEncounterTimes = results.filter((r) => r.bossFirstEncounterTicks >= 0).map((r) => r.bossFirstEncounterTicks * secondsPerTick);
  const bossDefeatTimes = results.filter((r) => r.secondsToFirstBossDefeat >= 0).map((r) => r.secondsToFirstBossDefeat);

  return {
    averageFinalLevel: average(results.map((r) => r.finalLevel)),
    levelDistribution,
    averageXpGained: average(results.map((r) => r.xpGained)),
    xpPerMinute: perRunRate((r) => r.xpGained),
    goldPerMinute: perRunRate((r) => r.statistics.goldFound),
    lootPerMinute: perRunRate((r) => r.statistics.itemsFound),
    averageSecondsToFirstElite: average(eliteTimes),
    averageSecondsToFirstMiniBoss: average(miniBossTimes),
    averageSecondsToFirstWorldEvent: average(worldEventTimes),
    averageSecondsToFirstItem: average(itemTimes),
    averageSecondsToFirstExpeditionCompletion: average(expeditionCompletionTimes),
    averageSecondsToFirstDungeonStart: average(dungeonStartTimes),
    averageSecondsToFirstBossEncounter: average(bossEncounterTimes),
    averageSecondsToFirstBossDefeat: average(bossDefeatTimes),
  };
}

// Fase 1 (Progressão de Equipamentos): "tempo até 1º upgrade; upgrades
// consecutivos; períodos longos sem upgrade; deserto de loot."
// `LOOT_DESERT_THRESHOLD_SECONDS` é o mesmo tipo de limiar ilustrativo
// de comparação já usado em todo o resto do projeto (10 minutos sem
// nenhum upgrade, verificado empiricamente antes da entrega) — não uma
// segunda fonte de verdade de balanceamento.
const LOOT_DESERT_THRESHOLD_SECONDS = 600;

function buildEquipmentProgressionStats(results: SimulatedAdventureResult[]): EquipmentProgressionStats {
  const firstUpgradeTimes = results.filter((r) => r.firstUpgradeSeconds >= 0).map((r) => r.firstUpgradeSeconds);
  const perRunRate = (getValue: (r: SimulatedAdventureResult) => number) =>
    average(results.filter((r) => r.simulatedSeconds > 0).map((r) => getValue(r) / (r.simulatedSeconds / 60)));
  const desertRuns = results.filter((r) => r.longestGapWithoutUpgradeSeconds >= LOOT_DESERT_THRESHOLD_SECONDS).length;

  return {
    averageSecondsToFirstUpgrade: average(firstUpgradeTimes),
    averageUpgradeCount: average(results.map((r) => r.upgradeCount)),
    upgradesPerMinute: perRunRate((r) => r.upgradeCount),
    averageLongestGapWithoutUpgradeSeconds: average(results.map((r) => r.longestGapWithoutUpgradeSeconds)),
    lootDesertRate: results.length > 0 ? desertRuns / results.length : 0,
  };
}

// Fase 1 (Ritmo): "tempo médio gasto em combate/recuperação/exploração/
// checkpoints/boss" — média simples entre execuções dos campos já
// somados pelo Simulador (classificação por tick, ver simulator.ts).
function buildRhythmStats(results: SimulatedAdventureResult[]): RhythmStats {
  return {
    averageCombatSeconds: average(results.map((r) => r.rhythmCombatSeconds)),
    averageRecoverySeconds: average(results.map((r) => r.rhythmRecoverySeconds)),
    averageExplorationSeconds: average(results.map((r) => r.rhythmExplorationSeconds)),
    averageCheckpointSeconds: average(results.map((r) => r.rhythmCheckpointSeconds)),
    averageBossSeconds: average(results.map((r) => r.rhythmBossSeconds)),
  };
}

// Fase 1 (Jornada do Jogador): "gerar uma timeline automática... medir
// quanto tempo leva para cada marco." Reaproveita médias JÁ calculadas
// acima (progression/equipmentProgression) — nenhum novo cálculo
// duplicado, só reorganizadas na ordem cronológica esperada da jornada.
function buildJourneyTimeline(progression: ProgressionStats, equipmentProgression: EquipmentProgressionStats, secondsPerTick: number): JourneyMilestone[] {
  return [
    { label: "Primeiro combate", averageSeconds: secondsPerTick },
    { label: "Primeiro item", averageSeconds: progression.averageSecondsToFirstItem },
    { label: "Primeiro upgrade", averageSeconds: equipmentProgression.averageSecondsToFirstUpgrade },
    { label: "Primeiro Elite", averageSeconds: progression.averageSecondsToFirstElite },
    { label: "Primeira Expedição concluída", averageSeconds: progression.averageSecondsToFirstExpeditionCompletion },
    { label: "Primeiro Evento Mundial", averageSeconds: progression.averageSecondsToFirstWorldEvent },
    { label: "Primeiro Mini-Boss", averageSeconds: progression.averageSecondsToFirstMiniBoss },
    { label: "Primeira Dungeon", averageSeconds: progression.averageSecondsToFirstDungeonStart },
    { label: "Primeiro Chefe Final avistado", averageSeconds: progression.averageSecondsToFirstBossEncounter },
    { label: "Primeiro Chefe Final derrotado", averageSeconds: progression.averageSecondsToFirstBossDefeat },
  ];
}

// Fase 1 (Loot): "raridade média; upgrades encontrados/equipados; slots
// mais fracos; itens nunca utilizados; ouro acumulado."
// `averageItemsNeverUsed` é uma aproximação honesta (itemsFound -
// itemsEquipped, nunca negativa) — o Inventory não distingue "nunca
// visto" de "visto e descartado" (dado que falta, não lógica que
// falta). `weakestSlotId` é o slot com a menor média de Power Score
// final entre os slots que ao menos uma execução chegou a equipar.
function buildLootStats(results: SimulatedAdventureResult[]): LootStats {
  const rarityCounts: Record<string, number> = {};
  for (const result of results) {
    for (const [rarity, count] of Object.entries(result.rarityCounts)) {
      rarityCounts[rarity] = (rarityCounts[rarity] ?? 0) + count;
    }
  }

  const slotIds = new Set<string>();
  for (const result of results) {
    for (const slotId of Object.keys(result.finalSlotPowerScores)) slotIds.add(slotId);
  }
  const slotAveragePowerScore: Record<string, number> = {};
  for (const slotId of slotIds) {
    const scores = results.filter((r) => slotId in r.finalSlotPowerScores).map((r) => r.finalSlotPowerScores[slotId]);
    slotAveragePowerScore[slotId] = average(scores);
  }
  let weakestSlotId: string | null = null;
  let weakestScore = Infinity;
  for (const [slotId, score] of Object.entries(slotAveragePowerScore)) {
    if (score < weakestScore) {
      weakestScore = score;
      weakestSlotId = slotId;
    }
  }

  const rarityRank = new Map(ITEM_GEN_RARITIES.map((rarity, index) => [rarity.id, index]));
  let rarityScoreWeightedSum = 0;
  let rarityScoreCount = 0;
  for (const [rarity, count] of Object.entries(rarityCounts)) {
    const rank = rarityRank.get(rarity as (typeof ITEM_GEN_RARITIES)[number]["id"]);
    if (rank === undefined) continue;
    rarityScoreWeightedSum += rank * count;
    rarityScoreCount += count;
  }

  return {
    averageItemsFound: average(results.map((r) => r.statistics.itemsFound)),
    averageItemsEquipped: average(results.map((r) => r.statistics.itemsEquipped)),
    rarityCounts,
    averageRarityScore: rarityScoreCount > 0 ? rarityScoreWeightedSum / rarityScoreCount : 0,
    averageItemsNeverUsed: average(results.map((r) => Math.max(0, r.statistics.itemsFound - r.statistics.itemsEquipped))),
    averageGoldAccumulated: average(results.map((r) => r.statistics.goldFound)),
    slotAveragePowerScore,
    weakestSlotId,
  };
}

function buildCombatStats(results: SimulatedAdventureResult[]): CombatStats {
  return {
    averageDamageDealt: average(results.map((r) => r.statistics.damageDealt)),
    averageDamageTaken: average(results.map((r) => r.statistics.damageTaken)),
    averageEncountersCompleted: average(results.map((r) => r.statistics.encountersCompleted)),
  };
}

// Recovery & Adventure Flow Phase I — requisito 7: "HP recuperado / HP
// perdido / eficiência da recuperação". `efficiency` usa a SOMA total
// (não a média das razões por execução) — mais estável contra sessões
// com pouquíssimo dano recebido (razão individual explodindo perto de
// zero no denominador).
function buildRecoveryStats(results: SimulatedAdventureResult[]): RecoveryStats {
  const totalRecovered = results.reduce((sum, r) => sum + r.lifeRecovered, 0);
  const totalLost = results.reduce((sum, r) => sum + r.statistics.damageTaken, 0);
  return {
    averageLifeRecovered: average(results.map((r) => r.lifeRecovered)),
    averageLifeLost: average(results.map((r) => r.statistics.damageTaken)),
    efficiency: totalLost > 0 ? totalRecovered / totalLost : 0,
    // Fase 1 (Recovery): "overheal; cura desperdiçada" — soma direta do
    // `lifeWasted` já capturado AO VIVO pelo Simulador a cada tick
    // (`recovery.lifeHealed - vida efetivamente ganha`), sem nova lógica.
    averageOverheal: average(results.map((r) => r.lifeWasted)),
  };
}

// Objectives, Missions & Player Goals Phase I — requisito 9: "objetivos
// concluídos, tempo médio, bônus de XP, taxa de conclusão."
// `completionRate` = objetivos concluídos / objetivos iniciados (cada
// execução sempre tem exatamente um objetivo ativo a mais no fim —
// completo ou não — além dos já concluídos, ver objectiveLayer.ts).
function buildObjectiveStats(results: SimulatedAdventureResult[]): ObjectiveStats {
  const totalObjectivesCompleted = results.reduce((sum, r) => sum + r.objectivesCompleted, 0);

  const gapsBetweenObjectives: number[] = [];
  const firstObjectiveSeconds: number[] = [];
  for (const result of results) {
    let previousSeconds = 0;
    result.objectiveCompletionSeconds.forEach((seconds, index) => {
      gapsBetweenObjectives.push(seconds - previousSeconds);
      if (index === 0) firstObjectiveSeconds.push(seconds);
      previousSeconds = seconds;
    });
  }

  const totalObjectivesStarted = totalObjectivesCompleted + results.length;

  return {
    averageObjectivesCompleted: average(results.map((r) => r.objectivesCompleted)),
    averageSecondsPerObjective: average(gapsBetweenObjectives),
    averageFirstObjectiveSeconds: average(firstObjectiveSeconds),
    averageXpBonusGranted: average(results.map((r) => r.objectiveXpBonusGranted)),
    completionRate: totalObjectivesStarted > 0 ? totalObjectivesCompleted / totalObjectivesStarted : 0,
  };
}

function buildRegionBreakdown(results: SimulatedAdventureResult[]): RegionBreakdown[] {
  const regionIds = [...new Set(results.map((r) => r.regionId))];
  return regionIds.map((regionId) => {
    const regionRuns = results.filter((r) => r.regionId === regionId);
    const regionDeaths = regionRuns.filter((r) => !r.survived).length;
    return {
      regionId,
      runs: regionRuns.length,
      deaths: regionDeaths,
      deathRate: regionRuns.length > 0 ? regionDeaths / regionRuns.length : 0,
      averageSurvivalSeconds: average(regionRuns.map((r) => r.simulatedSeconds)),
      averageFinalLevel: average(regionRuns.map((r) => r.finalLevel)),
    };
  });
}

// Biomes, Regions & World Progression Phase I — requisito 8/9: uma
// linha por região JÁ VISITADA em qualquer execução (não só a região
// inicial) — "regiões alcançadas, tempo por região, mortes por região,
// loot por região, objetivos concluídos por região". `reachRate` mede
// requisito 9 ("progressão contínua": regiões mais adiante na
// sequência devem ter reachRate menor, nunca zero se o bioma anterior
// foi balanceado corretamente).
function buildRegionProgressionStats(results: SimulatedAdventureResult[]): RegionProgressionBreakdown[] {
  const regionIds = [...new Set(results.flatMap((r) => r.regionsVisited))];

  return regionIds.map((regionId) => {
    const runsReached = results.filter((r) => r.regionsVisited.includes(regionId));
    const deathsInRegion = runsReached.filter((r) => r.diedInRegion === regionId);
    const deaths = deathsInRegion.length;

    // Vertical Slice — Player Journey, Retention & First Hour Experience
    // Phase I — Fase 1 (Curva de Dificuldade, "por região"): HP% é
    // média PONDERADA por amostra (mesmo princípio de SurvivalStats
    // acima); dano/recuperação são somas totais por execução, média
    // simples entre execuções que alcançaram a região.
    const hpPercentSumTotal = runsReached.reduce((sum, r) => sum + (r.perRegionHpPercentSum[regionId] ?? 0), 0);
    const hpPercentSamplesTotal = runsReached.reduce((sum, r) => sum + (r.perRegionHpPercentSamples[regionId] ?? 0), 0);

    return {
      regionId,
      runsReached: runsReached.length,
      reachRate: results.length > 0 ? runsReached.length / results.length : 0,
      averageSecondsSpent: average(runsReached.map((r) => r.perRegionSeconds[regionId] ?? 0)),
      deaths,
      deathRate: runsReached.length > 0 ? deaths / runsReached.length : 0,
      averageItemsFound: average(runsReached.map((r) => r.perRegionItemsFound[regionId] ?? 0)),
      averageObjectivesCompleted: average(runsReached.map((r) => r.perRegionObjectivesCompleted[regionId] ?? 0)),
      averageHpPercent: hpPercentSamplesTotal > 0 ? hpPercentSumTotal / hpPercentSamplesTotal : 0,
      averageDamageDealt: average(runsReached.map((r) => r.perRegionDamageDealt[regionId] ?? 0)),
      averageDamageTaken: average(runsReached.map((r) => r.perRegionDamageTaken[regionId] ?? 0)),
      averageRecoveryReceived: average(runsReached.map((r) => r.perRegionRecoveryReceived[regionId] ?? 0)),
      averageRecoveryWasted: average(runsReached.map((r) => r.perRegionRecoveryWasted[regionId] ?? 0)),
      deathsByElite: deathsInRegion.filter((r) => r.deathCause === "elite").length,
      deathsByMiniBoss: deathsInRegion.filter((r) => r.deathCause === "miniboss").length,
      deathsByBoss: deathsInRegion.filter((r) => r.deathCause === "boss").length,
      deathsByNormal: deathsInRegion.filter((r) => r.deathCause === "normal").length,
    };
  });
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 8: "elites
// encontrados, mini-bosses encontrados, taxa de vitória, loot obtido,
// XP adicional." `winRate` cai pra 1 (não "0%") quando nada foi
// encontrado — ausência de dado, não uma derrota medida.
function buildVariantStats(encountered: number[], defeated: number[], results: SimulatedAdventureResult[]): VariantEncounterStats {
  const totalEncountered = encountered.reduce((sum, value) => sum + value, 0);
  const totalDefeated = defeated.reduce((sum, value) => sum + value, 0);
  const runsWithEncounter = encountered.filter((value) => value > 0).length;
  return {
    totalEncountered,
    totalDefeated,
    winRate: totalEncountered > 0 ? totalDefeated / totalEncountered : 1,
    runsWithEncounter,
    frequency: results.length > 0 ? runsWithEncounter / results.length : 0,
  };
}

function buildEliteMiniBossStats(results: SimulatedAdventureResult[]): EliteMiniBossStats {
  const elite = buildVariantStats(
    results.map((r) => r.eliteEncountered),
    results.map((r) => r.eliteDefeated),
    results,
  );
  const miniBoss = buildVariantStats(
    results.map((r) => r.miniBossEncountered),
    results.map((r) => r.miniBossDefeated),
    results,
  );
  return { elite, miniBoss, averageVariantXpBonus: average(results.map((r) => r.variantXpBonusGranted)) };
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 8: "eventos encontrados; frequência; bioma; recompensa; impacto na
// sobrevivência; XP; loot." `perCategory` reconstruído varrendo
// `worldEventCountByCategory` já coletado por execução (mesmo
// princípio de "observar o que já foi contado", nenhuma nova varredura
// de eventos aqui).
function buildWorldEventStats(results: SimulatedAdventureResult[]): WorldEventStats {
  const totalEncountered = results.reduce((sum, r) => sum + r.worldEventsEncountered, 0);
  const runsWithEvents = results.filter((r) => r.worldEventsEncountered > 0);
  const runsWithoutEvents = results.filter((r) => r.worldEventsEncountered === 0);

  const categories = new Set<string>();
  for (const result of results) {
    for (const category of Object.keys(result.worldEventCountByCategory)) categories.add(category);
  }
  const perCategory: WorldEventCategoryBreakdown[] = [...categories].map((category) => {
    const counts = results.map((r) => r.worldEventCountByCategory[category] ?? 0);
    const categoryTotal = counts.reduce((sum, count) => sum + count, 0);
    const runsWithCategory = counts.filter((count) => count > 0).length;
    return {
      category,
      totalEncountered: categoryTotal,
      averagePerRun: average(counts),
      frequency: results.length > 0 ? runsWithCategory / results.length : 0,
    };
  });

  return {
    totalEncountered,
    averagePerRun: average(results.map((r) => r.worldEventsEncountered)),
    frequency: results.length > 0 ? runsWithEvents.length / results.length : 0,
    perCategory,
    averageGoldGained: average(results.map((r) => r.worldEventGoldGained)),
    averageXpGained: average(results.map((r) => r.worldEventXpGained)),
    averageLootItemsGained: average(results.map((r) => r.worldEventLootItemsGained)),
    averageRecoveryGained: average(results.map((r) => r.worldEventRecoveryGained)),
    deathRateWithEvents: runsWithEvents.length > 0 ? runsWithEvents.filter((r) => !r.survived).length / runsWithEvents.length : 0,
    deathRateWithoutEvents: runsWithoutEvents.length > 0 ? runsWithoutEvents.filter((r) => !r.survived).length / runsWithoutEvents.length : 0,
  };
}

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 9: "duração média, checkpoints atingidos, conclusão,
// falhas... XP, ouro." `averageCheckpointsReached`/`averageDurationSeconds`
// só consideram execuções com ao menos 1 expedição ENCERRADA (evita
// diluir a média com 0s de sessões que nunca chegaram a terminar
// nenhuma, o que sub-estimaria o valor real de quem termina).
function buildExpeditionStats(results: SimulatedAdventureResult[]): ExpeditionStats {
  const totalStarted = results.reduce((sum, r) => sum + r.expeditionsStarted, 0);
  const totalCompleted = results.reduce((sum, r) => sum + r.expeditionsCompleted, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.expeditionsFailed, 0);
  const totalCheckpoints = results.reduce((sum, r) => sum + r.expeditionCheckpointsReached, 0);
  const totalEnded = totalCompleted + totalFailed;
  const durationsFromEndedRuns = results.map((r) => r.averageExpeditionDurationSeconds).filter((value) => value > 0);

  return {
    totalStarted,
    totalCompleted,
    totalFailed,
    completionRate: totalStarted > 0 ? totalCompleted / totalStarted : 0,
    averageCheckpointsReached: totalEnded > 0 ? totalCheckpoints / totalEnded : 0,
    averageDurationSeconds: average(durationsFromEndedRuns),
    averageXpGained: average(results.map((r) => r.expeditionXpGained)),
    averageGoldGained: average(results.map((r) => r.expeditionGoldGained)),
  };
}

// Factions, Reputation & World Consequences Phase I — requisito 7/8:
// "reputação média; ranks; bônus; distribuição" — uma linha por facção
// definida (FACTION_DEFINITIONS), mesmo quando nenhuma execução a
// alcançou (0 de reputação média, 100% no rank inicial "neutro" — dado
// real, não ausência silenciosa).
function buildFactionStats(results: SimulatedAdventureResult[]): FactionStats {
  const perFaction: FactionBreakdown[] = FACTION_DEFINITIONS.map((definition) => {
    const reputations = results.map((r) => r.factionFinalReputation[definition.id] ?? 0);
    const rankDistribution: Record<string, number> = {};
    for (const result of results) {
      const rankId = result.factionFinalRank[definition.id] ?? definition.ranks[0].id;
      rankDistribution[rankId] = (rankDistribution[rankId] ?? 0) + 1;
    }
    return {
      factionId: definition.id,
      factionName: definition.name,
      averageFinalReputation: average(reputations),
      rankDistribution,
    };
  });

  // Fase 1 (Facções): "tempo até Amigável/Respeitado" — reconstruído a
  // partir dos ticks capturados AO VIVO pelo Simulador (qualquer
  // facção, o primeiro rank-up a atingir cada patamar), multiplicados
  // pelo mesmo `secondsPerTick` reconstruído em buildBossBalanceStats
  // (aproximação honesta, execuções sem tick nenhum são ignoradas).
  const secondsPerTickSamples = results.filter((r) => r.ticks > 0).map((r) => r.simulatedSeconds / r.ticks);
  const secondsPerTick = average(secondsPerTickSamples);
  const amigavelSeconds = results.filter((r) => r.ticksToAmigavel >= 0).map((r) => r.ticksToAmigavel * secondsPerTick);
  const respeitadoSeconds = results.filter((r) => r.ticksToRespeitado >= 0).map((r) => r.ticksToRespeitado * secondsPerTick);

  return {
    perFaction,
    averageReputationEventsPerRun: average(results.map((r) => r.reputationEventsCount)),
    averageRankUpsPerRun: average(results.map((r) => r.rankUpEventsCount)),
    averageXpBonusGranted: average(results.map((r) => r.factionXpBonusGained)),
    averageGoldBonusGranted: average(results.map((r) => r.factionGoldBonusGained)),
    averageSecondsToAmigavel: average(amigavelSeconds),
    averageSecondsToRespeitado: average(respeitadoSeconds),
  };
}

// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
// 10: "taxa de conclusão; derrotas no Boss; tempo médio; XP; loot;
// reputação." `bossWinRate` cai pra 1 (não "0%") quando o Chefe nunca
// foi encontrado — ausência de dado, mesmo princípio de
// buildVariantStats (Elites/Mini-Bosses) acima. `averageDurationSeconds`
// só considera execuções com ao menos 1 Dungeon ENCERRADA (concluída ou
// falhada), mesmo princípio de buildExpeditionStats.
// Boss Balance Report — pedido explícito do usuário após a entrega
// original da Sprint: "verificar se o Boss é realmente percebido como
// um clímax", não só uma extensão arquitetural correta. Cada campo aqui
// só agrega somas já capturadas AO VIVO pelo Simulador (simulator.ts) —
// nenhum dado é reconstruído ou estimado aqui.
//
// `secondsPerTick` não é um parâmetro do Simulador guardado por
// execução — reconstruído aqui como a média de `simulatedSeconds/ticks`
// entre as execuções que tiveram ao menos 1 tick (aproximação honesta,
// nunca um valor mágico novo).
function buildBossBalanceStats(results: SimulatedAdventureResult[], bossEncountered: number, bossDefeated: number): BossBalanceStats {
  const secondsPerTickSamples = results.filter((r) => r.ticks > 0).map((r) => r.simulatedSeconds / r.ticks);
  const secondsPerTick = average(secondsPerTickSamples);

  const totalDamageDealt = results.reduce((sum, r) => sum + r.bossDamageDealtTotal, 0);
  const totalDamageTaken = results.reduce((sum, r) => sum + r.bossDamageTakenTotal, 0);
  const totalHealthPercentAfterDefeat = results.reduce((sum, r) => sum + r.bossHealthPercentAfterDefeatTotal, 0);

  const runsThatEncountered = results.filter((r) => r.finalBossEncountered > 0);
  const runsThatDidNotEncounter = results.filter((r) => r.finalBossEncountered === 0);
  const recoveryCountsBeforeEncounter = runsThatEncountered.map((r) => r.bossRecoveryCountBeforeFirstEncounter);
  const secondsUntilEncountered = runsThatEncountered
    .filter((r) => r.bossFirstEncounterTicks >= 0)
    .map((r) => r.bossFirstEncounterTicks * secondsPerTick);
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Boss Balance Report atualizado: "taxa de chegada; tempo
  // até derrotar o Chefe."
  const secondsUntilDefeated = results.filter((r) => r.secondsToFirstBossDefeat >= 0).map((r) => r.secondsToFirstBossDefeat);

  const averageDamageDealtPerFight = bossEncountered > 0 ? totalDamageDealt / bossEncountered : 0;
  const averageDamageTakenPerFight = bossEncountered > 0 ? totalDamageTaken / bossEncountered : 0;

  return {
    averageDamageDealtPerFight,
    averageDamageTakenPerFight,
    averageDpsDealt: secondsPerTick > 0 ? averageDamageDealtPerFight / secondsPerTick : 0,
    averageDpsTaken: secondsPerTick > 0 ? averageDamageTakenPerFight / secondsPerTick : 0,
    averageHealthPercentAfterDefeat: bossDefeated > 0 ? totalHealthPercentAfterDefeat / bossDefeated : 0,
    averageRecoveryCountBeforeFight: average(recoveryCountsBeforeEncounter),
    averageSecondsUntilEncountered: average(secondsUntilEncountered),
    // Requisito explícito do usuário ("duração da luta") — documentado
    // honestamente: o combate resolve inteiro dentro de UMA tick
    // (Adventure Loop, invariante já documentada em presentation/types.ts),
    // então a "duração" é sempre exatamente 1 tick — nunca uma medida
    // fabricada com granularidade que o motor não produz.
    fightDurationSeconds: secondsPerTick,
    completionRateWithBossEncountered: runsThatEncountered.length > 0 ? runsThatEncountered.filter((r) => r.dungeonsCompleted > 0).length / runsThatEncountered.length : 0,
    completionRateWithoutBossEncountered:
      runsThatDidNotEncounter.length > 0 ? runsThatDidNotEncounter.filter((r) => r.dungeonsCompleted > 0).length / runsThatDidNotEncounter.length : 0,
    arrivalRate: results.length > 0 ? runsThatEncountered.length / results.length : 0,
    averageSecondsUntilDefeated: average(secondsUntilDefeated),
  };
}

// Fase 1 (Dungeon): "duração média; encontros médios; checkpoints
// usados; recovery recebido/desperdiçado; HP ao entrar/sair do
// checkpoint; mortes antes/no Boss." `averageEncountersCompleted` é
// reconstruído (duração média / segundos por tick), mesmo princípio de
// `secondsPerTick` de buildBossBalanceStats — nenhum novo campo por
// tick precisou ser somado só pra isso.
function buildDungeonStats(results: SimulatedAdventureResult[]): DungeonStats {
  const totalStarted = results.reduce((sum, r) => sum + r.dungeonsStarted, 0);
  const totalCompleted = results.reduce((sum, r) => sum + r.dungeonsCompleted, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.dungeonsFailed, 0);
  const bossEncountered = results.reduce((sum, r) => sum + r.finalBossEncountered, 0);
  const bossDefeated = results.reduce((sum, r) => sum + r.finalBossDefeated, 0);
  const durationsFromEndedRuns = results.map((r) => r.averageDungeonDurationSeconds).filter((value) => value > 0);
  const averageDurationSeconds = average(durationsFromEndedRuns);

  const secondsPerTickSamples = results.filter((r) => r.ticks > 0).map((r) => r.simulatedSeconds / r.ticks);
  const secondsPerTick = average(secondsPerTickSamples);

  const runsWithDungeon = results.filter((r) => r.dungeonsStarted > 0);
  const checkpointHpSamplesTotal = results.reduce((sum, r) => sum + r.checkpointHpSamples, 0);
  const checkpointHpBeforeSum = results.reduce((sum, r) => sum + r.checkpointHpBeforePercentSum, 0);
  const checkpointHpAfterSum = results.reduce((sum, r) => sum + r.checkpointHpAfterPercentSum, 0);

  return {
    totalStarted,
    totalCompleted,
    totalFailed,
    completionRate: totalStarted > 0 ? totalCompleted / totalStarted : 0,
    bossEncountered,
    bossDefeated,
    bossWinRate: bossEncountered > 0 ? bossDefeated / bossEncountered : 1,
    averageDurationSeconds,
    averageXpGranted: average(results.map((r) => r.dungeonXpGranted)),
    averageGoldGranted: average(results.map((r) => r.dungeonGoldGranted)),
    averageReputationGranted: average(results.map((r) => r.dungeonReputationGranted)),
    averageEncountersCompleted: secondsPerTick > 0 ? averageDurationSeconds / secondsPerTick : 0,
    averageCheckpointsUsed: average(runsWithDungeon.map((r) => r.dungeonCheckpointsReached)),
    averageRecoveryReceived: average(runsWithDungeon.map((r) => r.dungeonRecoveryReceived)),
    averageRecoveryWasted: average(runsWithDungeon.map((r) => r.dungeonRecoveryWasted)),
    averageCheckpointHpBeforePercent: checkpointHpSamplesTotal > 0 ? checkpointHpBeforeSum / checkpointHpSamplesTotal : 0,
    averageCheckpointHpAfterPercent: checkpointHpSamplesTotal > 0 ? checkpointHpAfterSum / checkpointHpSamplesTotal : 0,
    deathsBeforeBoss: results.reduce((sum, r) => sum + r.dungeonDeathBeforeBoss, 0),
    deathsAtBoss: results.reduce((sum, r) => sum + r.dungeonDeathAtBoss, 0),
    boss: buildBossBalanceStats(results, bossEncountered, bossDefeated),
  };
}

// Boss Accessibility & Endgame Balance Phase I — Fase 1 (Estado do
// Personagem no momento em que o Boss é encontrado): média SÓ entre as
// execuções que de fato o encontraram (bossEncounterCharacterLevel >= 0,
// ausência de dado nas demais, mesmo princípio de sempre). Cada campo já
// foi capturado AO VIVO pelo Simulador no exato tick do encontro (ver
// simulator.ts) — esta função só tira a média, nenhum novo cálculo de
// estado aqui.
function buildBossEncounterProfileStats(results: SimulatedAdventureResult[]): BossEncounterProfileStats {
  const encountered = results.filter((r) => r.bossEncounterCharacterLevel >= 0);
  const lostToBoss = results.filter((r) => r.bossHpPercentRemainingOnPlayerLoss >= 0);
  return {
    averageCharacterLevel: average(encountered.map((r) => r.bossEncounterCharacterLevel)),
    averageMaxLife: average(encountered.map((r) => r.bossEncounterMaxLife)),
    averageHpPercent: average(encountered.map((r) => r.bossEncounterHpPercent)),
    averageEstimatedDps: average(encountered.map((r) => r.bossEncounterEstimatedDps)),
    averageGold: average(encountered.map((r) => r.bossEncounterGold)),
    averageReputationTotal: average(encountered.map((r) => r.bossEncounterReputationTotal)),
    averageRarityScore: average(encountered.map((r) => r.bossEncounterAverageRarityScore)),
    averageEncountersCompleted: average(encountered.map((r) => r.bossEncounterEncountersCompleted)),
    averageCheckpointsUsed: average(encountered.map((r) => r.bossEncounterCheckpointsUsed)),
    averageBossHpPercentRemainingOnLoss: average(lostToBoss.map((r) => r.bossHpPercentRemainingOnPlayerLoss)),
  };
}

// Requisito 10 — Recomendações Automáticas: "derivadas apenas das
// estatísticas coletadas" — cada regra abaixo só compara números já
// agregados (survival/progression/loot/combat/perRegion) entre si,
// nunca cita uma região/inimigo por nome fora do que os próprios dados
// apontarem. Os limiares (0.2/0.5/1 item/etc.) são heurísticas
// ilustrativas de comparação, não uma segunda fonte de verdade de
// balanceamento.
function buildRecommendations(
  survival: SurvivalStats,
  progression: ProgressionStats,
  loot: LootStats,
  combat: CombatStats,
  recovery: RecoveryStats,
  objectives: ObjectiveStats,
  perRegion: RegionBreakdown[],
  regionProgression: RegionProgressionBreakdown[],
  eliteMiniBoss: EliteMiniBossStats,
  worldEvents: WorldEventStats,
  expeditions: ExpeditionStats,
  factions: FactionStats,
  dungeon: DungeonStats,
  equipmentProgression: EquipmentProgressionStats,
  rhythm: RhythmStats,
  bossEncounterProfile: BossEncounterProfileStats,
  totalRuns: number,
  targetMaxSimulatedSeconds: number,
  targetDeathRate: number,
): string[] {
  const recommendations: string[] = [];

  for (const region of perRegion) {
    if (region.runs >= 5 && region.deathRate > survival.deathRate + 0.2 && region.deathRate > 0.5) {
      recommendations.push(
        `Região "${region.regionId}" com taxa de morte de ${(region.deathRate * 100).toFixed(0)}% ` +
          `(média geral: ${(survival.deathRate * 100).toFixed(0)}%) — candidata a região excessivamente difícil.`,
      );
    }
  }

  if (combat.averageDamageTaken > combat.averageDamageDealt) {
    recommendations.push(
      `Dano médio recebido (${combat.averageDamageTaken.toFixed(0)}) supera o dano médio causado ` +
        `(${combat.averageDamageDealt.toFixed(0)}) — inimigos podem estar causando dano acima do esperado.`,
    );
  }

  if (loot.averageItemsEquipped < 1) {
    recommendations.push(
      `Média de apenas ${loot.averageItemsEquipped.toFixed(1)} itens equipados por sessão — possível falta de upgrades no início do jogo.`,
    );
  }

  const survivedFullWindow = survival.averageSeconds >= targetMaxSimulatedSeconds * 0.8;
  if (survivedFullWindow && progression.averageFinalLevel < 3) {
    recommendations.push(
      `Sobrevivência média próxima da janela completa (${survival.averageSeconds.toFixed(0)}s) mas nível médio de apenas ` +
        `${progression.averageFinalLevel.toFixed(1)} — possível escassez de XP.`,
    );
  }
  if (survival.averageSeconds < targetMaxSimulatedSeconds * 0.3 && progression.averageFinalLevel >= 4) {
    recommendations.push(
      `Nível médio de ${progression.averageFinalLevel.toFixed(1)} alcançado em apenas ${survival.averageSeconds.toFixed(0)}s ` +
        `— possível excesso de XP em relação ao ritmo esperado.`,
    );
  }

  // Requisito 8 — Curva de Recuperação: "recuperação insuficiente" (a
  // taxa de morte ainda está visivelmente acima do alvo) ou
  // "recuperação excessiva" (quase ninguém morre E a cura supera com
  // folga o dano recebido — sinal de sobra, não de ajuste fino).
  if (survival.deathRate > targetDeathRate + 0.15) {
    recommendations.push(
      `Taxa de morte de ${(survival.deathRate * 100).toFixed(0)}% acima do alvo de ${(targetDeathRate * 100).toFixed(0)}% ` +
        `— recuperação entre encontros pode estar insuficiente.`,
    );
  } else if (survival.deathRate < targetDeathRate * 0.3 && recovery.efficiency > 1.5) {
    recommendations.push(
      `Taxa de morte de ${(survival.deathRate * 100).toFixed(0)}% (bem abaixo do alvo de ${(targetDeathRate * 100).toFixed(0)}%) ` +
        `com eficiência de recuperação de ${recovery.efficiency.toFixed(2)}x o dano recebido — recuperação pode estar excessiva.`,
    );
  }

  // Requisito 10 — Balanceamento de Objetivos: "primeiro objetivo
  // concluído em menos de 2 minutos". 120s é o próprio limite pedido
  // pela Sprint, não uma heurística inventada.
  const FIRST_OBJECTIVE_TARGET_SECONDS = 120;
  if (objectives.averageFirstObjectiveSeconds > FIRST_OBJECTIVE_TARGET_SECONDS) {
    recommendations.push(
      `Primeiro objetivo concluído em média aos ${objectives.averageFirstObjectiveSeconds.toFixed(0)}s ` +
        `(alvo: até ${FIRST_OBJECTIVE_TARGET_SECONDS}s) — considerar reduzir o alvo do objetivo inicial.`,
    );
  }
  if (objectives.completionRate < 0.5) {
    recommendations.push(
      `Taxa de conclusão de objetivos de apenas ${(objectives.completionRate * 100).toFixed(0)}% — possível objetivo impossível ou sessões terminando cedo demais.`,
    );
  }

  // Requisito 9 — Balanceamento de Regiões: "nenhuma região impossível
  // (quem chega lá sempre morre), nenhuma região trivial (ninguém
  // morre e a permanência é curtíssima — sinal de que não há desafio
  // real), progressão contínua (cada região alcançável tem uma taxa de
  // alcance real, > 0, nunca um buraco na sequência)."
  for (const region of regionProgression) {
    if (region.runsReached >= 5 && region.deathRate >= 0.9) {
      recommendations.push(
        `Região "${region.regionId}" com taxa de morte de ${(region.deathRate * 100).toFixed(0)}% entre quem a alcançou — candidata a região impossível.`,
      );
    }
    if (region.runsReached >= 5 && region.deathRate === 0 && region.averageSecondsSpent < 30) {
      recommendations.push(
        `Região "${region.regionId}" com 0% de mortes e apenas ${region.averageSecondsSpent.toFixed(0)}s de permanência média — candidata a região trivial (pouco tempo pra sequer testar o desafio).`,
      );
    }
  }
  // "Progressão contínua": todo bioma da sequência (BIOME_PROGRESSION,
  // worldencounter/biomes.ts) que nunca aparece em regionProgression
  // simplesmente nunca foi alcançado em nenhuma execução — sinal de que
  // a progressão travou antes dele.
  const reachedRegionIds = new Set(regionProgression.map((region) => region.regionId));
  for (const biome of BIOME_PROGRESSION) {
    if (!reachedRegionIds.has(biome.regionId)) {
      recommendations.push(
        `Região "${biome.regionId}" (bioma #${biome.order}) nunca foi alcançada em nenhuma execução — progressão pode estar travada antes dela.`,
      );
    }
  }

  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 9: "Elite
  // impossível? Elite trivial? Mini-Boss impossível? Frequência
  // correta?" — mesmos limiares ilustrativos de comparação usados no
  // resto desta função, nunca uma segunda fonte de verdade.
  const MIN_SAMPLE_FOR_VARIANT_CHECK = 5;
  if (eliteMiniBoss.elite.totalEncountered >= MIN_SAMPLE_FOR_VARIANT_CHECK && eliteMiniBoss.elite.winRate < 0.3) {
    recommendations.push(
      `Elite com taxa de vitória de apenas ${(eliteMiniBoss.elite.winRate * 100).toFixed(0)}% (${eliteMiniBoss.elite.totalDefeated}/${eliteMiniBoss.elite.totalEncountered}) — candidato a modificador Elite impossível.`,
    );
  }
  if (eliteMiniBoss.elite.totalEncountered >= MIN_SAMPLE_FOR_VARIANT_CHECK * 2 && eliteMiniBoss.elite.winRate >= 0.98) {
    recommendations.push(
      `Elite com taxa de vitória de ${(eliteMiniBoss.elite.winRate * 100).toFixed(0)}% (${eliteMiniBoss.elite.totalDefeated}/${eliteMiniBoss.elite.totalEncountered}) — candidato a modificador Elite trivial (quase nunca representa risco real).`,
    );
  }
  if (eliteMiniBoss.miniBoss.totalEncountered >= MIN_SAMPLE_FOR_VARIANT_CHECK && eliteMiniBoss.miniBoss.winRate < 0.3) {
    recommendations.push(
      `Mini-Boss com taxa de vitória de apenas ${(eliteMiniBoss.miniBoss.winRate * 100).toFixed(0)}% (${eliteMiniBoss.miniBoss.totalDefeated}/${eliteMiniBoss.miniBoss.totalEncountered}) — candidato a Mini-Boss impossível.`,
    );
  }
  if (totalRuns >= 20 && eliteMiniBoss.elite.totalEncountered === 0) {
    recommendations.push(`Elite nunca apareceu em ${totalRuns} execuções — frequência de aparição pode estar zerada por engano.`);
  }
  if (totalRuns >= 20 && eliteMiniBoss.miniBoss.totalEncountered === 0) {
    recommendations.push(`Mini-Boss nunca apareceu em ${totalRuns} execuções — frequência de aparição pode estar zerada por engano.`);
  }

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 9: "evento raro demais? evento comum demais? recompensa excessiva?
  // recompensa insignificante?" — mesmos limiares ilustrativos de
  // comparação já usados no resto desta função.
  const MIN_SAMPLE_FOR_CATEGORY_CHECK = 10;
  for (const category of worldEvents.perCategory) {
    if (totalRuns >= MIN_SAMPLE_FOR_CATEGORY_CHECK && category.frequency < 0.05) {
      recommendations.push(
        `Categoria "${category.category}" presente em apenas ${(category.frequency * 100).toFixed(0)}% das execuções — candidata a evento raro demais.`,
      );
    }
    if (totalRuns >= MIN_SAMPLE_FOR_CATEGORY_CHECK && category.frequency > 0.9) {
      recommendations.push(
        `Categoria "${category.category}" presente em ${(category.frequency * 100).toFixed(0)}% das execuções — candidata a evento comum demais.`,
      );
    }
  }
  if (totalRuns >= MIN_SAMPLE_FOR_CATEGORY_CHECK && worldEvents.totalEncountered === 0) {
    recommendations.push(`Nenhum World Event apareceu em ${totalRuns} execuções — a rolagem de chance pode estar zerada por engano.`);
  }
  // "Recompensa excessiva": XP média de World Events acima de 20% da XP
  // média total da sessão — sinal de que a recompensa pode estar
  // competindo demais com o abate normal como fonte de progresso.
  if (worldEvents.totalEncountered > 0 && progression.averageXpGained > 0 && worldEvents.averageXpGained > progression.averageXpGained * 0.2) {
    recommendations.push(
      `XP média de World Events (${worldEvents.averageXpGained.toFixed(0)}) representa mais de 20% da XP média total ` +
        `(${progression.averageXpGained.toFixed(0)}) — recompensa de XP pode estar excessiva.`,
    );
  }
  // "Recompensa insignificante": eventos acontecem com frequência
  // razoável, mas não produzem nem ouro, nem XP, nem loot, nem
  // recuperação mensurável.
  if (
    worldEvents.frequency > 0.3 &&
    worldEvents.averageGoldGained < 1 &&
    worldEvents.averageXpGained < 1 &&
    worldEvents.averageLootItemsGained < 0.1 &&
    worldEvents.averageRecoveryGained < 1
  ) {
    recommendations.push(
      `World Events aparecem em ${(worldEvents.frequency * 100).toFixed(0)}% das execuções mas concedem recompensa média próxima de zero — recompensa pode estar insignificante.`,
    );
  }

  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 10: "expedição longa demais? curta demais? checkpoints
  // muito próximos? muito distantes? recompensa insuficiente?
  // excessiva?" — mesmos limiares ilustrativos de comparação já usados
  // no resto desta função.
  const MIN_SAMPLE_FOR_EXPEDITION_CHECK = 10;
  if (expeditions.totalStarted >= MIN_SAMPLE_FOR_EXPEDITION_CHECK) {
    if (expeditions.completionRate < 0.3) {
      recommendations.push(
        `Taxa de conclusão de Expedições de apenas ${(expeditions.completionRate * 100).toFixed(0)}% (${expeditions.totalCompleted}/${expeditions.totalStarted}) — candidata a Expedição longa/difícil demais.`,
      );
    }
    if (expeditions.completionRate > 0.95 && expeditions.averageDurationSeconds > 0 && expeditions.averageDurationSeconds < targetMaxSimulatedSeconds * 0.15) {
      recommendations.push(
        `Taxa de conclusão de ${(expeditions.completionRate * 100).toFixed(0)}% com duração média de apenas ${expeditions.averageDurationSeconds.toFixed(0)}s — candidata a Expedição curta demais.`,
      );
    }
  }

  // "Checkpoints muito próximos/distantes": propriedade ESTRUTURAL das
  // próprias definições (espaçamento em encontros entre marcos), não
  // do comportamento simulado — verificada direto em
  // EXPEDITION_DEFINITIONS (expeditions/expeditionDefinitions.ts).
  for (const definition of EXPEDITION_DEFINITIONS) {
    const spacing = definition.expectedEncounters / (definition.checkpointCount + 1);
    if (spacing < 2) {
      recommendations.push(
        `Expedição "${definition.id}" com checkpoints a cada ${spacing.toFixed(1)} encontros — candidata a checkpoints muito próximos.`,
      );
    }
    if (spacing > 10) {
      recommendations.push(
        `Expedição "${definition.id}" com checkpoints a cada ${spacing.toFixed(1)} encontros — candidata a checkpoints muito distantes.`,
      );
    }
  }

  if (expeditions.totalCompleted >= MIN_SAMPLE_FOR_EXPEDITION_CHECK && progression.averageXpGained > 0) {
    const expeditionXpShare = expeditions.averageXpGained / progression.averageXpGained;
    if (expeditionXpShare < 0.02) {
      recommendations.push(
        `XP média de recompensa final de Expedição (${expeditions.averageXpGained.toFixed(0)}) representa menos de 2% da XP média total ` +
          `(${progression.averageXpGained.toFixed(0)}) — recompensa final pode estar insuficiente.`,
      );
    }
    if (expeditionXpShare > 0.5) {
      recommendations.push(
        `XP média de recompensa final de Expedição (${expeditions.averageXpGained.toFixed(0)}) representa mais de 50% da XP média total ` +
          `(${progression.averageXpGained.toFixed(0)}) — recompensa final pode estar excessiva.`,
      );
    }
  }

  // Factions, Reputation & World Consequences Phase I — requisito 8:
  // "reputação rápida demais? lenta demais? bônus excessivos?" — mesmos
  // limiares ilustrativos de comparação já usados no resto desta
  // função. Verificado por facção diretamente contra EXPEDITION_DEFINITIONS-
  // style: FACTION_DEFINITIONS (dado estrutural: qual rank é o mais
  // alto/mais baixo de cada facção), nunca inventando um limiar novo por
  // facção individual.
  const MIN_SAMPLE_FOR_FACTION_CHECK = 10;
  if (totalRuns >= MIN_SAMPLE_FOR_FACTION_CHECK) {
    for (const definition of FACTION_DEFINITIONS) {
      const stats = factions.perFaction.find((faction) => faction.factionId === definition.id);
      if (!stats) continue;
      const totalForFaction = Object.values(stats.rankDistribution).reduce((sum, count) => sum + count, 0);
      if (totalForFaction === 0) continue;

      const topRank = definition.ranks[definition.ranks.length - 1];
      const bottomRank = definition.ranks[0];
      const atTopRate = (stats.rankDistribution[topRank.id] ?? 0) / totalForFaction;
      const atBottomRate = (stats.rankDistribution[bottomRank.id] ?? 0) / totalForFaction;

      if (atTopRate > 0.5) {
        recommendations.push(
          `Facção "${definition.name}" atinge o rank máximo (${topRank.name}) em ${(atTopRate * 100).toFixed(0)}% das execuções — reputação pode estar subindo rápido demais.`,
        );
      }
      if (atBottomRate > 0.9 && stats.averageFinalReputation < (definition.ranks[1]?.minReputation ?? 0) * 0.3) {
        recommendations.push(
          `Facção "${definition.name}" permanece no rank inicial (${bottomRank.name}) em ${(atBottomRate * 100).toFixed(0)}% das execuções — reputação pode estar subindo devagar demais.`,
        );
      }
    }
  }
  // "Bônus excessivos": XP média concedida por reputação (bônus de rank
  // nas conclusões de Expedição) acima de 10% da XP média total da
  // sessão — sinal de que o bônus pode estar competindo demais com o
  // progresso normal (mesmo princípio já usado pra World Events/
  // Expedições acima).
  if (factions.averageXpBonusGranted > 0 && progression.averageXpGained > 0 && factions.averageXpBonusGranted > progression.averageXpGained * 0.1) {
    recommendations.push(
      `Bônus médio de XP concedido por reputação (${factions.averageXpBonusGranted.toFixed(1)}) representa mais de 10% da XP média total ` +
        `(${progression.averageXpGained.toFixed(0)}) — bônus de facção pode estar excessivo.`,
    );
  }

  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 11 + Boss Balance Report (pedido explícito do usuário, pós-entrega):
  // "Boss trivial (>=98%)? Boss frustrante (<=40%)? luta dure tempo
  // excessivo? recompensa desproporcional ao risco?" — mesmos limiares
  // ilustrativos de comparação já usados pra Elite/Mini-Boss acima.
  const MIN_SAMPLE_FOR_BOSS_CHECK = 5;
  if (dungeon.bossEncountered >= MIN_SAMPLE_FOR_BOSS_CHECK && dungeon.bossWinRate <= 0.4) {
    recommendations.push(
      `Chefe Final com taxa de vitória de apenas ${(dungeon.bossWinRate * 100).toFixed(0)}% (${dungeon.bossDefeated}/${dungeon.bossEncountered}) — candidato a Chefe Final frustrante (limiar: <=40%).`,
    );
  }
  if (dungeon.bossEncountered >= MIN_SAMPLE_FOR_BOSS_CHECK * 2 && dungeon.bossWinRate >= 0.98) {
    recommendations.push(
      `Chefe Final com taxa de vitória de ${(dungeon.bossWinRate * 100).toFixed(0)}% (${dungeon.bossDefeated}/${dungeon.bossEncountered}) — candidato a Chefe Final trivial (limiar: >=98%, quase nunca representa risco real).`,
    );
  }
  if (dungeon.totalStarted >= 10 && dungeon.bossEncountered === 0) {
    recommendations.push(`Chefe Final nunca apareceu em ${dungeon.totalStarted} tentativas de Dungeon — frequência de aparição pode estar zerada por engano.`);
  }
  if (dungeon.totalStarted >= 10 && dungeon.completionRate < 0.3) {
    recommendations.push(
      `Taxa de conclusão de Dungeons de apenas ${(dungeon.completionRate * 100).toFixed(0)}% (${dungeon.totalCompleted}/${dungeon.totalStarted}) — candidata a Dungeon longa/difícil demais.`,
    );
  }
  // "Luta dure tempo excessivo": a luta em si resolve numa única tick
  // (ver BossBalanceStats.fightDurationSeconds, documentado como
  // sempre = 1 tick — nenhuma granularidade menor existe). O proxy
  // honesto de "demorar demais" é quanto tempo decorre ATÉ avistar o
  // Chefe: se isso já consome quase toda a sobrevivência média geral,
  // a maioria dos personagens nunca chega a viver o clímax de verdade.
  if (dungeon.boss.averageSecondsUntilEncountered > 0 && survival.averageSeconds > 0 && dungeon.boss.averageSecondsUntilEncountered > survival.averageSeconds * 0.9) {
    recommendations.push(
      `Tempo médio até avistar o Chefe Final (${dungeon.boss.averageSecondsUntilEncountered.toFixed(0)}s) está muito próximo da sobrevivência média geral ` +
        `(${survival.averageSeconds.toFixed(0)}s) — a jornada até o Chefe pode estar excessivamente longa.`,
    );
  }
  if (dungeon.totalCompleted >= 5 && progression.averageXpGained > 0) {
    const bossXpShare = dungeon.averageXpGranted / progression.averageXpGained;
    if (bossXpShare > 0.5) {
      recommendations.push(
        `Recompensa de XP do Chefe Final (${dungeon.averageXpGranted.toFixed(0)}) representa mais de 50% da XP média total ` +
          `(${progression.averageXpGained.toFixed(0)}) — recompensa pode estar excessiva.`,
      );
    }
    if (bossXpShare < 0.01) {
      recommendations.push(
        `Recompensa de XP do Chefe Final (${dungeon.averageXpGranted.toFixed(0)}) representa menos de 1% da XP média total ` +
          `(${progression.averageXpGained.toFixed(0)}) — recompensa pode estar insuficiente.`,
      );
    }
  }
  // "Recompensa desproporcional ao risco": taxa de vitória baixa
  // (combate genuinamente arriscado) mas recompensa que não compensa
  // esse risco (a mesma fatia de XP que qualquer combate comum
  // ofereceria) — o pior dos dois mundos.
  if (dungeon.bossEncountered >= MIN_SAMPLE_FOR_BOSS_CHECK && dungeon.bossWinRate <= 0.4 && progression.averageXpGained > 0) {
    const bossXpShare = dungeon.averageXpGranted / progression.averageXpGained;
    if (bossXpShare < 0.05) {
      recommendations.push(
        `Chefe Final arriscado (${(dungeon.bossWinRate * 100).toFixed(0)}% de vitória) mas com recompensa de XP equivalente a apenas ${(bossXpShare * 100).toFixed(0)}% da XP média total — recompensa desproporcional ao risco.`,
      );
    }
  }

  // Balance, Pacing & Player Experience Phase I — Fase 2 (Ritmo):
  // "Dungeon longa demais / curta demais" contra o alvo EXPLÍCITO desta
  // Sprint de 40 a 70 encontros (não um limiar ilustrativo novo — é o
  // próprio número pedido no briefing).
  const DUNGEON_TARGET_MIN_ENCOUNTERS = 40;
  const DUNGEON_TARGET_MAX_ENCOUNTERS = 70;
  if (dungeon.totalStarted >= 10 && dungeon.averageEncountersCompleted > 0) {
    if (dungeon.averageEncountersCompleted > DUNGEON_TARGET_MAX_ENCOUNTERS) {
      recommendations.push(
        `Dungeon com média de ${dungeon.averageEncountersCompleted.toFixed(0)} encontros por execução — acima do alvo de ` +
          `${DUNGEON_TARGET_MIN_ENCOUNTERS}-${DUNGEON_TARGET_MAX_ENCOUNTERS}, candidata a Dungeon longa demais.`,
      );
    } else if (dungeon.averageEncountersCompleted < DUNGEON_TARGET_MIN_ENCOUNTERS) {
      recommendations.push(
        `Dungeon com média de ${dungeon.averageEncountersCompleted.toFixed(0)} encontros por execução — abaixo do alvo de ` +
          `${DUNGEON_TARGET_MIN_ENCOUNTERS}-${DUNGEON_TARGET_MAX_ENCOUNTERS}, candidata a Dungeon curta demais.`,
      );
    }
  }

  // Fase 2 (Loot): "insuficiente / excessivo," usando a raridade média
  // (0 = a raridade mais comum, máximo = a mais rara, ambas definidas em
  // ITEM_GEN_RARITIES) como proxy de intensidade de loot — nenhuma nova
  // ordem de raridade inventada aqui.
  const maxRarityRank = ITEM_GEN_RARITIES.length - 1;
  const totalRarityDrops = Object.values(loot.rarityCounts).reduce((sum, count) => sum + count, 0);
  if (totalRarityDrops > 0 && maxRarityRank > 0) {
    const rarityRatio = loot.averageRarityScore / maxRarityRank;
    if (rarityRatio < 0.05) {
      recommendations.push(
        `Raridade média do loot muito baixa (${loot.averageRarityScore.toFixed(2)} de ${maxRarityRank}) — quase só itens da raridade mais comum, loot pode estar insuficiente.`,
      );
    }
    if (rarityRatio > 0.6) {
      recommendations.push(
        `Raridade média do loot alta (${loot.averageRarityScore.toFixed(2)} de ${maxRarityRank}) — itens raros aparecendo com frequência incomum, loot pode estar excessivo.`,
      );
    }
  }

  // Fase 2 (Economia): "ouro sem utilidade / insuficiente." Marketplace/
  // loja estão explicitamente fora de escopo desta Sprint — qualquer
  // ouro acumulado é estruturalmente sem destino de gasto. Isto é
  // sinalizado como reconhecimento transparente do gargalo (para a
  // seção "Recomendações" da entrega final), não como algo a corrigir
  // ajustando valores nesta Sprint.
  if (progression.goldPerMinute > 0) {
    recommendations.push(
      `Ouro acumula a ${progression.goldPerMinute.toFixed(1)}/min mas não há Marketplace/loja implementados nesta Sprint — ` +
        `ouro atualmente sem utilidade de gasto (gargalo estrutural, fora do escopo desta Sprint).`,
    );
  } else if (totalRuns >= 10) {
    recommendations.push("Nenhum ouro por minuto detectado nas execuções — taxa de geração de ouro pode estar insuficiente.");
  }

  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 2 (Ritmo): "longos períodos sem novidades; excesso
  // de combates consecutivos." Combate ocupando quase todo o tempo
  // rastreado (combate+exploração+checkpoint+boss) é o mesmo sinal pras
  // duas coisas — muito combate seguido, sem variedade — mesmo limiar
  // ilustrativo de comparação já usado no resto desta função.
  const rhythmTrackedTotal = rhythm.averageCombatSeconds + rhythm.averageRecoverySeconds + rhythm.averageExplorationSeconds + rhythm.averageCheckpointSeconds + rhythm.averageBossSeconds;
  if (rhythmTrackedTotal > 0 && rhythm.averageCombatSeconds / rhythmTrackedTotal > 0.9) {
    recommendations.push(
      `Combate ocupa ${((rhythm.averageCombatSeconds / rhythmTrackedTotal) * 100).toFixed(0)}% do tempo rastreado (o resto é ` +
        `exploração/checkpoint/boss) — candidato a excesso de combates consecutivos / longos períodos sem novidade.`,
    );
  }

  // Fase 2 (Ritmo): "identificar automaticamente regiões que quebram o
  // ritmo" — uma região com tempo médio de permanência muito acima da
  // média das demais (>=3x) prende o jogador desproporcionalmente mais
  // tempo que o resto da jornada.
  const regionsWithSample = regionProgression.filter((region) => region.runsReached >= 5);
  if (regionsWithSample.length > 1) {
    const averageTimeAcrossRegions = average(regionsWithSample.map((region) => region.averageSecondsSpent));
    for (const region of regionsWithSample) {
      if (averageTimeAcrossRegions > 0 && region.averageSecondsSpent > averageTimeAcrossRegions * 3) {
        recommendations.push(
          `Região "${region.regionId}" com permanência média de ${region.averageSecondsSpent.toFixed(0)}s (média geral entre regiões: ` +
            `${averageTimeAcrossRegions.toFixed(0)}s) — candidata a região que quebra o ritmo da jornada.`,
        );
      }
    }
  }

  // Fase 2 (Loot): "períodos longos sem upgrades (deserto de loot);
  // excesso de upgrades; slots abandonados."
  if (equipmentProgression.lootDesertRate > 0.3) {
    recommendations.push(
      `${(equipmentProgression.lootDesertRate * 100).toFixed(0)}% das execuções tiveram um período de pelo menos ` +
        `${LOOT_DESERT_THRESHOLD_SECONDS}s sem nenhum upgrade — candidato a "deserto de loot".`,
    );
  }
  if (equipmentProgression.upgradesPerMinute > 1) {
    recommendations.push(
      `${equipmentProgression.upgradesPerMinute.toFixed(2)} upgrades por minuto em média — candidato a excesso de upgrades ` +
        `(equipamento pode estar deixando de ser uma recompensa especial).`,
    );
  }
  const slotScores = Object.values(loot.slotAveragePowerScore);
  if (loot.weakestSlotId && slotScores.length > 1) {
    const weakestScore = loot.slotAveragePowerScore[loot.weakestSlotId];
    const averageOtherSlots = average(Object.entries(loot.slotAveragePowerScore).filter(([slotId]) => slotId !== loot.weakestSlotId).map(([, score]) => score));
    if (averageOtherSlots > 0 && weakestScore < averageOtherSlots * 0.3) {
      recommendations.push(
        `Slot "${loot.weakestSlotId}" com Power Score médio de ${weakestScore.toFixed(1)} (demais slots: ${averageOtherSlots.toFixed(1)}) — candidato a slot abandonado.`,
      );
    }
  }

  // Fase 2 (Boss): "poucos jogadores chegam ao Boss; muitos chegam;
  // Boss aparece cedo; Boss aparece tarde." `arrivalRate` (taxa de
  // chegada) é distinto de `bossWinRate` (taxa de vitória, já coberto
  // acima) — mede quem CHEGA a vê-lo, não quem vence.
  if (dungeon.totalStarted >= 10) {
    if (dungeon.boss.arrivalRate < 0.1) {
      recommendations.push(
        `Apenas ${(dungeon.boss.arrivalRate * 100).toFixed(0)}% das tentativas de Dungeon chegam a avistar o Chefe Final — poucos jogadores alcançam o Boss.`,
      );
    }
    if (dungeon.boss.arrivalRate > 0.9) {
      recommendations.push(
        `${(dungeon.boss.arrivalRate * 100).toFixed(0)}% das tentativas de Dungeon chegam a avistar o Chefe Final — a maioria alcança o Boss (jornada até ele pode estar curta/fácil demais).`,
      );
    }
    if (dungeon.boss.averageSecondsUntilEncountered > 0 && progression.averageSecondsToFirstDungeonStart >= 0) {
      const secondsFromDungeonStartToBoss = dungeon.boss.averageSecondsUntilEncountered - progression.averageSecondsToFirstDungeonStart;
      if (secondsFromDungeonStartToBoss > 0 && secondsFromDungeonStartToBoss < 60) {
        recommendations.push(
          `Chefe Final avistado ${secondsFromDungeonStartToBoss.toFixed(0)}s depois do início da Dungeon — candidato a Boss aparecendo cedo demais (sem construir tensão).`,
        );
      }
    }
    if (dungeon.boss.averageSecondsUntilEncountered > targetMaxSimulatedSeconds * 5) {
      recommendations.push(
        `Tempo médio até avistar o Chefe Final (${dungeon.boss.averageSecondsUntilEncountered.toFixed(0)}s) é mais de 5x a janela de sessão de referência ` +
          `(${targetMaxSimulatedSeconds}s) — candidato a Boss aparecendo tarde demais.`,
      );
    }
  }

  // Boss Accessibility & Endgame Balance Phase I — Fase 2: as 4
  // categorias que faltavam da lista pedida ("Boss inacessível"/"Boss
  // fraco" já existem acima, como "poucos chegam"/"Chefe Final
  // trivial"). Todas usam SÓ o estado do personagem já capturado AO
  // VIVO no exato tick do encontro (bossEncounterProfile,
  // simulator.ts) — nenhuma nova suposição, só leitura desses dados.
  const MIN_SAMPLE_FOR_BOSS_PROFILE_CHECK = 5;
  const bossEncounterSampleSize = dungeon.bossEncountered;
  if (bossEncounterSampleSize >= MIN_SAMPLE_FOR_BOSS_PROFILE_CHECK) {
    // "Boss inalcançável: chegam mas morrem imediatamente" — taxa de
    // vitória muito baixa E o jogador já chega com HP crítico (a morte
    // não é "azar de uma luta difícil", é consequência de já chegar
    // praticamente sem vida).
    if (dungeon.bossWinRate <= 0.1 && bossEncounterProfile.averageHpPercent < 30) {
      recommendations.push(
        `Taxa de vitória de ${(dungeon.bossWinRate * 100).toFixed(0)}% E HP médio de apenas ${bossEncounterProfile.averageHpPercent.toFixed(0)}% ao avistar o Chefe ` +
          `— candidato a "Boss inalcançável": o jogador chega, mas morre quase imediatamente por já estar esgotado, não por uma luta difícil em si.`,
      );
    }

    // "Boss resistente: luta longa demais" — proxy honesto (o combate
    // sempre resolve numa única tick, ver BossBalanceStats.fightDurationSeconds):
    // quando o jogador PERDE, o Chefe ainda está com a maior parte da
    // vida (>=70%) — sinal de que o jogador mal arranha o Chefe antes
    // de morrer, não de uma luta equilibrada e perdida por pouco.
    if (dungeon.bossWinRate < 0.5 && bossEncounterProfile.averageBossHpPercentRemainingOnLoss >= 70) {
      recommendations.push(
        `Quando o jogador perde pro Chefe Final, ele ainda está com ${bossEncounterProfile.averageBossHpPercentRemainingOnLoss.toFixed(0)}% de vida em média ` +
          `— candidato a "Boss resistente": o jogador mal causa dano relevante antes de morrer.`,
      );
    }

    // "Jornada desgastante: jogador chega praticamente morto" — HP
    // médio ao avistar o Chefe abaixo de 40%, independente do
    // resultado da luta (vitória ou derrota).
    if (bossEncounterProfile.averageHpPercent < 40) {
      recommendations.push(
        `HP médio de ${bossEncounterProfile.averageHpPercent.toFixed(0)}% ao avistar o Chefe Final — candidato a "jornada desgastante": ` +
          `a jornada até ele consome recursos demais, independente do resultado da luta.`,
      );
    }

    // "Loot insuficiente: poucos upgrades antes do Boss" — raridade
    // média equipada ao avistar o Chefe muito baixa (mesmo princípio de
    // raridade relativa já usado no resto deste arquivo).
    const maxRarityRankAtBoss = ITEM_GEN_RARITIES.length - 1;
    if (maxRarityRankAtBoss > 0 && bossEncounterProfile.averageRarityScore / maxRarityRankAtBoss < 0.15) {
      recommendations.push(
        `Raridade média equipada de ${bossEncounterProfile.averageRarityScore.toFixed(2)} (de ${maxRarityRankAtBoss}) ao avistar o Chefe Final ` +
          `— candidato a "loot insuficiente": poucos upgrades reais aconteceram antes do clímax da Dungeon.`,
      );
    }

    // "Progressão insuficiente: personagem chega subdesenvolvido" —
    // nível médio ao avistar o Chefe comparado ao teto de nível da
    // própria região onde ele vive (ruinas-esquecidas, ver
    // encounterTables.ts) — chegar MUITO abaixo desse teto indica que o
    // personagem não teve tempo de desenvolver o nível esperado pra
    // essa região antes de encontrar o Chefe.
    const bossRegionTable = getEncounterTable("ruinas-esquecidas");
    if (bossRegionTable && bossEncounterProfile.averageCharacterLevel < bossRegionTable.levelRange.max * 0.5) {
      recommendations.push(
        `Nível médio de ${bossEncounterProfile.averageCharacterLevel.toFixed(1)} ao avistar o Chefe Final (teto da região onde ele vive: ` +
          `${bossRegionTable.levelRange.max}) — candidato a "progressão insuficiente": o personagem chega subdesenvolvido pro clímax.`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push("Nenhum desequilíbrio significativo detectado nas estatísticas coletadas.");
  }

  return recommendations;
}

export function generateBalanceReport(
  results: SimulatedAdventureResult[],
  targetMaxSimulatedSeconds = 600,
  targetDeathRate = 0.3,
): BalanceReport {
  const survival = buildSurvivalStats(results);
  const progression = buildProgressionStats(results);
  const loot = buildLootStats(results);
  const combat = buildCombatStats(results);
  const recovery = buildRecoveryStats(results);
  const objectives = buildObjectiveStats(results);
  const perRegion = buildRegionBreakdown(results);
  const regionProgression = buildRegionProgressionStats(results);
  const eliteMiniBoss = buildEliteMiniBossStats(results);
  const worldEvents = buildWorldEventStats(results);
  const expeditions = buildExpeditionStats(results);
  const factions = buildFactionStats(results);
  const dungeon = buildDungeonStats(results);
  const equipmentProgression = buildEquipmentProgressionStats(results);
  const rhythm = buildRhythmStats(results);
  const secondsPerTickForTimeline = average(results.filter((r) => r.ticks > 0).map((r) => r.simulatedSeconds / r.ticks));
  const journeyTimeline = buildJourneyTimeline(progression, equipmentProgression, secondsPerTickForTimeline);
  const bossEncounterProfile = buildBossEncounterProfileStats(results);
  const recommendations = buildRecommendations(
    survival,
    progression,
    loot,
    combat,
    recovery,
    objectives,
    perRegion,
    regionProgression,
    eliteMiniBoss,
    worldEvents,
    expeditions,
    factions,
    dungeon,
    equipmentProgression,
    rhythm,
    bossEncounterProfile,
    results.length,
    targetMaxSimulatedSeconds,
    targetDeathRate,
  );

  return {
    totalRuns: results.length,
    survival,
    progression,
    loot,
    combat,
    recovery,
    objectives,
    perRegion,
    regionProgression,
    eliteMiniBoss,
    worldEvents,
    expeditions,
    factions,
    dungeon,
    equipmentProgression,
    rhythm,
    journeyTimeline,
    bossEncounterProfile,
    recommendations,
  };
}

// Requisito 9 — Relatório de Balanceamento, em markdown legível.
export function formatBalanceReport(report: BalanceReport): string {
  const lines: string[] = [];
  lines.push("# Relatório de Balanceamento — Vertical Slice");
  lines.push("");
  lines.push(`Total de aventuras simuladas: ${report.totalRuns}`);
  lines.push("");
  lines.push("## Sobrevivência");
  lines.push(`- Média: ${report.survival.averageSeconds.toFixed(1)}s`);
  lines.push(`- Mínimo: ${report.survival.minSeconds.toFixed(1)}s`);
  lines.push(`- Máximo: ${report.survival.maxSeconds.toFixed(1)}s`);
  lines.push(`- Taxa de morte: ${(report.survival.deathRate * 100).toFixed(0)}%`);
  lines.push(`- HP médio (amostrado a cada tick): ${report.survival.averageHpPercent.toFixed(1)}%`);
  lines.push(`- HP mínimo observado: ${report.survival.minHpPercentObserved.toFixed(1)}%`);
  lines.push(
    `- Mortes por causa: ${report.survival.deathsByElite} Elite, ${report.survival.deathsByMiniBoss} Mini-Boss, ` +
      `${report.survival.deathsByBoss} Chefe Final, ${report.survival.deathsByNormal} encontro normal`,
  );
  lines.push("");
  lines.push("## Progressão");
  lines.push(`- Nível médio alcançado: ${report.progression.averageFinalLevel.toFixed(2)}`);
  lines.push(`- XP média obtida: ${report.progression.averageXpGained.toFixed(0)}`);
  lines.push(
    `- Distribuição de níveis: ${Object.entries(report.progression.levelDistribution)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([level, count]) => `nível ${level}: ${count}`)
      .join(", ")}`,
  );
  lines.push(
    `- Taxas por minuto: ${report.progression.xpPerMinute.toFixed(1)} XP, ${report.progression.goldPerMinute.toFixed(1)} ouro, ` +
      `${report.progression.lootPerMinute.toFixed(2)} itens`,
  );
  lines.push(
    `- Tempo médio até 1º Elite/Mini-Boss/World Event: ${report.progression.averageSecondsToFirstElite.toFixed(0)}s / ` +
      `${report.progression.averageSecondsToFirstMiniBoss.toFixed(0)}s / ${report.progression.averageSecondsToFirstWorldEvent.toFixed(0)}s`,
  );
  lines.push(
    `- Tempo médio até 1º item / 1ª Expedição concluída / 1ª Dungeon / 1º Boss avistado / 1º Boss derrotado: ` +
      `${report.progression.averageSecondsToFirstItem.toFixed(0)}s / ${report.progression.averageSecondsToFirstExpeditionCompletion.toFixed(0)}s / ` +
      `${report.progression.averageSecondsToFirstDungeonStart.toFixed(0)}s / ${report.progression.averageSecondsToFirstBossEncounter.toFixed(0)}s / ` +
      `${report.progression.averageSecondsToFirstBossDefeat.toFixed(0)}s`,
  );
  lines.push("");
  lines.push("## Progressão de Equipamentos");
  lines.push(`- Tempo médio até o 1º upgrade: ${report.equipmentProgression.averageSecondsToFirstUpgrade.toFixed(0)}s`);
  lines.push(`- Upgrades por execução (média): ${report.equipmentProgression.averageUpgradeCount.toFixed(1)}`);
  lines.push(`- Upgrades por minuto: ${report.equipmentProgression.upgradesPerMinute.toFixed(2)}`);
  lines.push(`- Maior período sem upgrade (média): ${report.equipmentProgression.averageLongestGapWithoutUpgradeSeconds.toFixed(0)}s`);
  lines.push(`- Execuções com "deserto de loot" (>= ${LOOT_DESERT_THRESHOLD_SECONDS}s sem upgrade): ${(report.equipmentProgression.lootDesertRate * 100).toFixed(0)}%`);
  lines.push("");
  lines.push("## Ritmo");
  lines.push(`- Tempo médio em combate: ${report.rhythm.averageCombatSeconds.toFixed(0)}s`);
  lines.push(`- Tempo médio em recuperação: ${report.rhythm.averageRecoverySeconds.toFixed(0)}s`);
  lines.push(`- Tempo médio em exploração (World Events não-combate): ${report.rhythm.averageExplorationSeconds.toFixed(0)}s`);
  lines.push(`- Tempo médio em checkpoints: ${report.rhythm.averageCheckpointSeconds.toFixed(0)}s`);
  lines.push(`- Tempo médio no Chefe Final: ${report.rhythm.averageBossSeconds.toFixed(0)}s`);
  lines.push("");
  lines.push("## Jornada do Jogador (timeline de marcos)");
  for (const milestone of report.journeyTimeline) {
    lines.push(`- ${milestone.label}: ${milestone.averageSeconds >= 0 ? `${milestone.averageSeconds.toFixed(0)}s` : "nunca aconteceu"}`);
  }
  lines.push("");
  lines.push("## Loot");
  lines.push(`- Itens encontrados (média): ${report.loot.averageItemsFound.toFixed(2)}`);
  lines.push(`- Itens equipados/upgrades (média): ${report.loot.averageItemsEquipped.toFixed(2)}`);
  lines.push(`- Itens nunca equipados (média): ${report.loot.averageItemsNeverUsed.toFixed(2)}`);
  lines.push(`- Raridade média (0 = mais comum): ${report.loot.averageRarityScore.toFixed(2)}`);
  lines.push(
    `- Raridades: ${
      Object.entries(report.loot.rarityCounts)
        .map(([rarity, count]) => `${rarity}: ${count}`)
        .join(", ") || "nenhum item encontrado"
    }`,
  );
  lines.push(`- Ouro acumulado (média): ${report.loot.averageGoldAccumulated.toFixed(1)}`);
  lines.push(`- Slot mais fraco (menor Power Score médio): ${report.loot.weakestSlotId ?? "nenhum dado"}`);
  lines.push(
    `- Power Score médio por slot: ${
      Object.entries(report.loot.slotAveragePowerScore)
        .map(([slotId, score]) => `${slotId}: ${score.toFixed(1)}`)
        .join(", ") || "nenhum dado"
    }`,
  );
  lines.push("");
  lines.push("## Combate");
  lines.push(`- Dano causado (média): ${report.combat.averageDamageDealt.toFixed(0)}`);
  lines.push(`- Dano recebido (média): ${report.combat.averageDamageTaken.toFixed(0)}`);
  lines.push(`- Encontros vencidos (média): ${report.combat.averageEncountersCompleted.toFixed(2)}`);
  lines.push("");
  lines.push("## Recuperação");
  lines.push(`- HP recuperado (média): ${report.recovery.averageLifeRecovered.toFixed(1)}`);
  lines.push(`- HP perdido (média): ${report.recovery.averageLifeLost.toFixed(1)}`);
  lines.push(`- Eficiência (recuperado/perdido): ${report.recovery.efficiency.toFixed(2)}x`);
  lines.push(`- Overheal/cura desperdiçada (média): ${report.recovery.averageOverheal.toFixed(1)}`);
  lines.push("");
  lines.push("## Objetivos");
  lines.push(`- Objetivos concluídos (média): ${report.objectives.averageObjectivesCompleted.toFixed(2)}`);
  lines.push(`- Tempo médio por objetivo: ${report.objectives.averageSecondsPerObjective.toFixed(1)}s`);
  lines.push(`- Tempo médio até o primeiro objetivo: ${report.objectives.averageFirstObjectiveSeconds.toFixed(1)}s`);
  lines.push(`- XP bônus concedida (média): ${report.objectives.averageXpBonusGranted.toFixed(1)}`);
  lines.push(`- Taxa de conclusão: ${(report.objectives.completionRate * 100).toFixed(0)}%`);
  lines.push("");
  lines.push("## Por região (região inicial)");
  for (const region of report.perRegion) {
    lines.push(
      `- ${region.regionId}: ${region.runs} execuções, ${(region.deathRate * 100).toFixed(0)}% mortes, ` +
        `sobrevivência média ${region.averageSurvivalSeconds.toFixed(1)}s, nível médio ${region.averageFinalLevel.toFixed(2)}`,
    );
  }
  lines.push("");
  lines.push("## Progressão de biomas (todas as regiões alcançadas) — Curva de Dificuldade por região");
  for (const region of report.regionProgression) {
    lines.push(
      `- ${region.regionId}: alcançada em ${(region.reachRate * 100).toFixed(0)}% das execuções (${region.runsReached}), ` +
        `${region.averageSecondsSpent.toFixed(1)}s de permanência média, ${(region.deathRate * 100).toFixed(0)}% mortes, ` +
        `${region.averageItemsFound.toFixed(2)} itens/execução, ${region.averageObjectivesCompleted.toFixed(2)} objetivos/execução`,
    );
    lines.push(
      `  HP médio restante: ${region.averageHpPercent.toFixed(1)}% | dano causado/recebido (médio): ${region.averageDamageDealt.toFixed(0)}/${region.averageDamageTaken.toFixed(0)} | ` +
        `recuperação recebida/desperdiçada (média): ${region.averageRecoveryReceived.toFixed(1)}/${region.averageRecoveryWasted.toFixed(1)} | ` +
        `mortes por causa: ${region.deathsByElite} Elite, ${region.deathsByMiniBoss} Mini-Boss, ${region.deathsByBoss} Chefe Final, ${region.deathsByNormal} normal`,
    );
  }
  lines.push("");
  lines.push("## Elites & Mini-Bosses");
  lines.push(
    `- Elite: ${report.eliteMiniBoss.elite.totalEncountered} encontrados, ${report.eliteMiniBoss.elite.totalDefeated} derrotados ` +
      `(${(report.eliteMiniBoss.elite.winRate * 100).toFixed(0)}% de vitória), presente em ${(report.eliteMiniBoss.elite.frequency * 100).toFixed(0)}% das execuções`,
  );
  lines.push(
    `- Mini-Boss: ${report.eliteMiniBoss.miniBoss.totalEncountered} encontrados, ${report.eliteMiniBoss.miniBoss.totalDefeated} derrotados ` +
      `(${(report.eliteMiniBoss.miniBoss.winRate * 100).toFixed(0)}% de vitória), presente em ${(report.eliteMiniBoss.miniBoss.frequency * 100).toFixed(0)}% das execuções`,
  );
  lines.push(`- XP bônus concedida por Elite/Mini-Boss (média por execução): ${report.eliteMiniBoss.averageVariantXpBonus.toFixed(1)}`);
  lines.push("");
  lines.push("## World Events");
  lines.push(
    `- Total encontrados: ${report.worldEvents.totalEncountered} (${report.worldEvents.averagePerRun.toFixed(2)}/execução), ` +
      `presente em ${(report.worldEvents.frequency * 100).toFixed(0)}% das execuções`,
  );
  for (const category of report.worldEvents.perCategory) {
    lines.push(
      `- ${category.category}: ${category.totalEncountered} encontrados (${category.averagePerRun.toFixed(2)}/execução), ` +
        `presente em ${(category.frequency * 100).toFixed(0)}% das execuções`,
    );
  }
  lines.push(`- Ouro médio ganho: ${report.worldEvents.averageGoldGained.toFixed(1)}`);
  lines.push(`- XP média ganha: ${report.worldEvents.averageXpGained.toFixed(1)}`);
  lines.push(`- Itens de loot médios ganhos: ${report.worldEvents.averageLootItemsGained.toFixed(2)}`);
  lines.push(`- HP médio recuperado (Shrine): ${report.worldEvents.averageRecoveryGained.toFixed(1)}`);
  lines.push(
    `- Impacto na sobrevivência: ${(report.worldEvents.deathRateWithEvents * 100).toFixed(0)}% de mortes entre quem encontrou ao menos 1 evento, ` +
      `${(report.worldEvents.deathRateWithoutEvents * 100).toFixed(0)}% entre quem não encontrou nenhum`,
  );
  lines.push("");
  lines.push("## Expedições");
  lines.push(`- Iniciadas: ${report.expeditions.totalStarted}`);
  lines.push(
    `- Concluídas: ${report.expeditions.totalCompleted} (${(report.expeditions.completionRate * 100).toFixed(0)}% de taxa de conclusão)`,
  );
  lines.push(`- Falhadas: ${report.expeditions.totalFailed}`);
  lines.push(`- Checkpoints atingidos (média por expedição encerrada): ${report.expeditions.averageCheckpointsReached.toFixed(2)}`);
  lines.push(`- Duração média (expedições encerradas): ${report.expeditions.averageDurationSeconds.toFixed(0)}s`);
  lines.push(`- XP total de recompensas de Expedição (média por execução, pode somar múltiplas conclusões): ${report.expeditions.averageXpGained.toFixed(1)}`);
  lines.push(`- Ouro total de recompensas de Expedição (média por execução, pode somar múltiplas conclusões): ${report.expeditions.averageGoldGained.toFixed(1)}`);
  lines.push("");
  lines.push("## Facções");
  for (const faction of report.factions.perFaction) {
    const ranks = Object.entries(faction.rankDistribution)
      .map(([rankId, count]) => `${rankId}: ${count}`)
      .join(", ");
    lines.push(`- ${faction.factionName}: reputação média ${faction.averageFinalReputation.toFixed(1)}, ranks (${ranks})`);
  }
  lines.push(`- Eventos de reputação (média por execução): ${report.factions.averageReputationEventsPerRun.toFixed(2)}`);
  lines.push(`- Subidas de rank (média por execução): ${report.factions.averageRankUpsPerRun.toFixed(2)}`);
  lines.push(`- Bônus de XP concedido (média por execução): ${report.factions.averageXpBonusGranted.toFixed(1)}`);
  lines.push(`- Bônus de ouro concedido (média por execução): ${report.factions.averageGoldBonusGranted.toFixed(1)}`);
  lines.push(`- Tempo médio até Amigável: ${report.factions.averageSecondsToAmigavel.toFixed(0)}s`);
  lines.push(`- Tempo médio até Respeitado: ${report.factions.averageSecondsToRespeitado.toFixed(0)}s`);
  lines.push("");
  lines.push("## Dungeon (Chefe Final)");
  lines.push(`- Dungeons iniciadas: ${report.dungeon.totalStarted}`);
  lines.push(`- Dungeons concluídas: ${report.dungeon.totalCompleted} (${(report.dungeon.completionRate * 100).toFixed(0)}% de taxa de conclusão)`);
  lines.push(`- Dungeons falhadas: ${report.dungeon.totalFailed}`);
  lines.push(
    `- Chefe Final: ${report.dungeon.bossEncountered} encontrados, ${report.dungeon.bossDefeated} derrotados (${(report.dungeon.bossWinRate * 100).toFixed(0)}% de vitória)`,
  );
  lines.push(`- Duração média (Dungeons encerradas): ${report.dungeon.averageDurationSeconds.toFixed(0)}s`);
  lines.push(`- Encontros médios por execução (reconstruído: duração/segundos por tick): ${report.dungeon.averageEncountersCompleted.toFixed(1)}`);
  lines.push(`- Checkpoints usados (média por Dungeon iniciada): ${report.dungeon.averageCheckpointsUsed.toFixed(1)}`);
  lines.push(
    `- Recovery (dentro da Dungeon): ${report.dungeon.averageRecoveryReceived.toFixed(1)} recebido / ` +
      `${report.dungeon.averageRecoveryWasted.toFixed(1)} desperdiçado (média por Dungeon iniciada)`,
  );
  lines.push(
    `- HP no checkpoint: ${report.dungeon.averageCheckpointHpBeforePercent.toFixed(1)}% ao chegar / ` +
      `${report.dungeon.averageCheckpointHpAfterPercent.toFixed(1)}% ao sair`,
  );
  lines.push(`- Mortes antes do Chefe: ${report.dungeon.deathsBeforeBoss} / Mortes no Chefe: ${report.dungeon.deathsAtBoss}`);
  lines.push(`- XP do Chefe Final (média por execução): ${report.dungeon.averageXpGranted.toFixed(1)}`);
  lines.push(`- Ouro do Chefe Final (média por execução): ${report.dungeon.averageGoldGranted.toFixed(1)}`);
  lines.push(`- Reputação concedida pelo Chefe Final (média por execução): ${report.dungeon.averageReputationGranted.toFixed(1)}`);
  lines.push("");
  lines.push("## Boss Balance Report");
  lines.push("(Pedido explícito do usuário: verificar se o Chefe Final é realmente percebido como um clímax, não só uma extensão arquitetural correta.)");
  lines.push(`- Taxa de chegada (execuções que avistaram o Chefe): ${(report.dungeon.boss.arrivalRate * 100).toFixed(0)}%`);
  lines.push(`- Taxa de vitória contra o Chefe: ${(report.dungeon.bossWinRate * 100).toFixed(0)}% (${report.dungeon.bossDefeated}/${report.dungeon.bossEncountered})`);
  lines.push(`- HP médio restante do jogador após derrotá-lo: ${report.dungeon.boss.averageHealthPercentAfterDefeat.toFixed(0)}%`);
  lines.push(
    `- Duração da luta: sempre ${report.dungeon.boss.fightDurationSeconds.toFixed(0)}s (1 tick — o Adventure Loop resolve o combate inteiro numa única chamada, sem granularidade menor que isso)`,
  );
  lines.push(`- Tempo médio até avistar o Chefe: ${report.dungeon.boss.averageSecondsUntilEncountered.toFixed(0)}s`);
  lines.push(`- Tempo médio até derrotar o Chefe: ${report.dungeon.boss.averageSecondsUntilDefeated >= 0 ? `${report.dungeon.boss.averageSecondsUntilDefeated.toFixed(0)}s` : "nunca aconteceu"}`);
  lines.push(
    `- Dano médio por luta: ${report.dungeon.boss.averageDamageDealtPerFight.toFixed(0)} causado / ${report.dungeon.boss.averageDamageTakenPerFight.toFixed(0)} recebido`,
  );
  lines.push(`- DPS médio: ${report.dungeon.boss.averageDpsDealt.toFixed(1)} causado / ${report.dungeon.boss.averageDpsTaken.toFixed(1)} recebido`);
  lines.push(`- Curas (Recovery Layer) usadas, em média, antes de avistar o Chefe: ${report.dungeon.boss.averageRecoveryCountBeforeFight.toFixed(1)}`);
  lines.push(`- XP/ouro médios concedidos pelo Chefe: ${report.dungeon.averageXpGranted.toFixed(0)} XP, ${report.dungeon.averageGoldGranted.toFixed(0)} ouro`);
  lines.push(
    `- Impacto na conclusão da Dungeon: ${(report.dungeon.boss.completionRateWithBossEncountered * 100).toFixed(0)}% de conclusão entre quem encontrou o Chefe, ` +
      `${(report.dungeon.boss.completionRateWithoutBossEncountered * 100).toFixed(0)}% entre quem não encontrou`,
  );
  lines.push(
    `- HP médio restante do Boss quando o jogador PERDE: ${
      report.bossEncounterProfile.averageBossHpPercentRemainingOnLoss >= 0 ? `${report.bossEncounterProfile.averageBossHpPercentRemainingOnLoss.toFixed(0)}%` : "nunca aconteceu"
    }`,
  );
  lines.push("");
  lines.push("## Estado do Personagem ao encontrar o Chefe Final");
  lines.push("(Boss Accessibility & Endgame Balance Phase I — só entre as execuções que de fato o avistaram.)");
  lines.push(`- Nível médio: ${report.bossEncounterProfile.averageCharacterLevel.toFixed(1)}`);
  lines.push(`- Vida máxima média: ${report.bossEncounterProfile.averageMaxLife.toFixed(0)}`);
  lines.push(`- HP% médio: ${report.bossEncounterProfile.averageHpPercent.toFixed(0)}%`);
  lines.push(`- DPS estimado médio (dano físico x velocidade de ataque, sem crítico): ${report.bossEncounterProfile.averageEstimatedDps.toFixed(1)}`);
  lines.push(`- Ouro médio acumulado: ${report.bossEncounterProfile.averageGold.toFixed(0)}`);
  lines.push(`- Reputação total média (soma de todas as facções): ${report.bossEncounterProfile.averageReputationTotal.toFixed(1)}`);
  lines.push(`- Raridade média equipada: ${report.bossEncounterProfile.averageRarityScore.toFixed(2)}`);
  lines.push(`- Encontros completados até aqui (média): ${report.bossEncounterProfile.averageEncountersCompleted.toFixed(0)}`);
  lines.push(`- Checkpoints usados até aqui (média): ${report.bossEncounterProfile.averageCheckpointsUsed.toFixed(1)}`);
  lines.push("");
  lines.push("## Recomendações automáticas");
  for (const recommendation of report.recommendations) {
    lines.push(`- ${recommendation}`);
  }
  lines.push("");

  return lines.join("\n");
}

// Recovery & Adventure Flow Phase I — requisito 6: "gerar comparação
// antes x depois" automaticamente, a partir de dois BalanceReport já
// computados (um com a Recovery Layer desligada, outro ligada) —
// nenhuma lógica de simulação nova aqui, só formatação lado a lado.
export function formatComparisonReport(before: BalanceReport, after: BalanceReport, label = "Antes x Depois"): string {
  const lines: string[] = [];
  lines.push(`# Comparação — ${label}`);
  lines.push("");
  lines.push(`Aventuras simuladas por lado: ${before.totalRuns} (antes) / ${after.totalRuns} (depois)`);
  lines.push("");
  lines.push("| Métrica | Antes | Depois |");
  lines.push("| --- | --- | --- |");
  lines.push(`| Taxa de morte | ${(before.survival.deathRate * 100).toFixed(0)}% | ${(after.survival.deathRate * 100).toFixed(0)}% |`);
  lines.push(
    `| Sobrevivência média | ${before.survival.averageSeconds.toFixed(1)}s | ${after.survival.averageSeconds.toFixed(1)}s |`,
  );
  lines.push(
    `| Nível médio | ${before.progression.averageFinalLevel.toFixed(2)} | ${after.progression.averageFinalLevel.toFixed(2)} |`,
  );
  lines.push(`| HP recuperado (média) | ${before.recovery.averageLifeRecovered.toFixed(1)} | ${after.recovery.averageLifeRecovered.toFixed(1)} |`);
  lines.push(`| HP perdido (média) | ${before.recovery.averageLifeLost.toFixed(1)} | ${after.recovery.averageLifeLost.toFixed(1)} |`);
  lines.push(
    `| Encontros concluídos (média) | ${before.combat.averageEncountersCompleted.toFixed(2)} | ${after.combat.averageEncountersCompleted.toFixed(2)} |`,
  );
  lines.push("");

  return lines.join("\n");
}
