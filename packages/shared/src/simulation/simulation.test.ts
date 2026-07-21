import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { computeEnemyFinalStats } from "../enemy/enemyStats.js";
import { xpForLevel, xpRewardForKill, XP_KILLS_PER_LEVEL } from "../xp.js";
import { runSimulatedAdventure, runBalanceSimulation, STARTER_REGION_IDS } from "./simulator.js";
import { generateBalanceReport } from "./report.js";
import type { SimulatedAdventureResult } from "./types.js";

describe("Gameplay Balance & First Playable Experience Phase I", () => {
  describe("balanceamento das regiões", () => {
    it("bosque-sussurrante é a única região de entrada (nível 1); pântano-podre é a 2ª região da jornada (nível 5+)", () => {
      // Vertical Slice — Player Journey, Retention & First Hour Experience
      // Phase I — Fase 3: pântano-podre deixou de ser um 2º ponto de
      // entrada nível 1 (ver STARTER_REGION_IDS, simulator.ts, e a nota
      // de reordenação em biomes.ts) — agora é a 2ª região da jornada,
      // desbloqueada aos poucos depois de bosque-sussurrante.
      const bosque = getEncounterTable("bosque-sussurrante");
      const pantano = getEncounterTable("pantano-podre");
      assert.ok(bosque);
      assert.ok(pantano);
      assert.equal(bosque!.levelRange.min, 1);
      assert.equal(pantano!.levelRange.min, 5);
    });

    it("um Wolf/Goblin nível 1 nunca ameaça matar um personagem nível 1 num único golpe (dano << vida máxima)", () => {
      // Requisito 3 — "cada combate deve durar poucos segundos, mas
      // permitir reação do jogador": um único golpe não deveria consumir
      // uma fração grande da vida máxima de um personagem recém-criado
      // (145 de vida pra um Warrior nível 1, ver characterbuild/classes.ts).
      const wolfTemplate = getEnemyTemplate("wolf")!;
      const goblinTemplate = getEnemyTemplate("goblin")!;
      const wolfStats = computeEnemyFinalStats(wolfTemplate, 1);
      const goblinStats = computeEnemyFinalStats(goblinTemplate, 1);

      const APPROXIMATE_WARRIOR_LEVEL1_MAX_LIFE = 145;
      assert.ok(wolfStats.physicalDamage < APPROXIMATE_WARRIOR_LEVEL1_MAX_LIFE * 0.2);
      assert.ok(goblinStats.physicalDamage < APPROXIMATE_WARRIOR_LEVEL1_MAX_LIFE * 0.2);
    });
  });

  describe("distribuição de encontros", () => {
    it("as regiões iniciais têm encontros de abertura pequenos (no máximo 2 inimigos por grupo)", () => {
      for (const regionId of STARTER_REGION_IDS) {
        const table = getEncounterTable(regionId)!;
        for (const entry of table.entries) {
          assert.ok(entry.maximumGroup <= 2, `${regionId}/${entry.enemyTemplateId} deveria ter maximumGroup <= 2`);
        }
      }
    });

    it("packSizeOptions das regiões iniciais têm peso positivo (nenhuma composição impossível)", () => {
      for (const regionId of STARTER_REGION_IDS) {
        const table = getEncounterTable(regionId)!;
        for (const option of table.packSizeOptions) {
          assert.ok(option.weight > 0);
        }
      }
    });
  });

  describe("progressão inicial", () => {
    it("xpRewardForKill reaproveita xpForLevel (nenhuma fórmula nova): K abates no nível 1 cobrem aproximadamente xpForLevel(1)", () => {
      const rewardPerKill = xpRewardForKill(1);
      const totalAfterKKills = rewardPerKill * XP_KILLS_PER_LEVEL;
      const needed = xpForLevel(1);
      // "Aproximadamente" por causa do arredondamento em Math.round().
      assert.ok(Math.abs(totalAfterKKills - needed) <= XP_KILLS_PER_LEVEL);
    });

    it("xpRewardForKill nunca é zero ou negativo, mesmo em níveis altos", () => {
      for (const level of [1, 5, 10, 20, 29]) {
        assert.ok(xpRewardForKill(level) >= 1);
      }
    });

    it("um personagem nível 1 alcança o nível 2 em poucos minutos simulados (Requisito 4: 2-4min aproximados)", () => {
      const result = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 300 });
      assert.ok(result.finalLevel >= 2, `esperava nível >= 2 em até 5min simulados, obteve nível ${result.finalLevel}`);
    });
  });

  describe("simulações determinísticas", () => {
    it("mesma seed + mesma região sempre produzem o mesmo SimulatedAdventureResult", () => {
      function run(): SimulatedAdventureResult {
        return runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 123 });
      }
      assert.deepEqual(run(), run());
    });

    it("seeds diferentes tendem a produzir resultados diferentes (não é uma constante disfarçada)", () => {
      const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1 });
      const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 2 });
      assert.notDeepEqual(a, b);
    });

    it("runBalanceSimulation com o mesmo seedBase produz sempre a mesma lista de resultados", () => {
      const a = runBalanceSimulation({ runs: 10, seedBase: 500 });
      const b = runBalanceSimulation({ runs: 10, seedBase: 500 });
      assert.deepEqual(a, b);
    });
  });

  describe("relatório de estatísticas", () => {
    function fakeResult(overrides: Partial<SimulatedAdventureResult>): SimulatedAdventureResult {
      return {
        regionId: "bosque-sussurrante",
        seed: 1,
        survived: true,
        simulatedSeconds: 100,
        ticks: 10,
        finalLevel: 2,
        statistics: {
          encountersCompleted: 5,
          enemiesKilled: 8,
          damageDealt: 200,
          damageTaken: 50,
          itemsFound: 2,
          itemsEquipped: 1,
          goldFound: 0,
          elapsedTime: 100000,
        },
        xpGained: 100,
        rarityCounts: { common: 1, magic: 1 },
        lifeRecovered: 20,
        objectivesCompleted: 1,
        objectiveXpBonusGranted: 30,
        objectiveCompletionSeconds: [60],
        regionsVisited: ["bosque-sussurrante"],
        perRegionSeconds: { "bosque-sussurrante": 100 },
        perRegionItemsFound: { "bosque-sussurrante": 2 },
        perRegionObjectivesCompleted: { "bosque-sussurrante": 1 },
        diedInRegion: null,
        eliteEncountered: 0,
        eliteDefeated: 0,
        miniBossEncountered: 0,
        miniBossDefeated: 0,
        variantXpBonusGranted: 0,
        worldEventsEncountered: 0,
        worldEventCountByCategory: {},
        worldEventGoldGained: 0,
        worldEventXpGained: 0,
        worldEventLootItemsGained: 0,
        worldEventRecoveryGained: 0,
        expeditionsStarted: 0,
        expeditionsCompleted: 0,
        expeditionsFailed: 0,
        expeditionCheckpointsReached: 0,
        expeditionXpGained: 0,
        expeditionGoldGained: 0,
        averageExpeditionDurationSeconds: 0,
        factionFinalReputation: {},
        factionFinalRank: {},
        reputationEventsCount: 0,
        rankUpEventsCount: 0,
        factionXpBonusGained: 0,
        factionGoldBonusGained: 0,
        dungeonsStarted: 0,
        dungeonsCompleted: 0,
        dungeonsFailed: 0,
        finalBossEncountered: 0,
        finalBossDefeated: 0,
        dungeonXpGranted: 0,
        dungeonGoldGranted: 0,
        dungeonReputationGranted: 0,
        averageDungeonDurationSeconds: 0,
        bossDamageDealtTotal: 0,
        bossDamageTakenTotal: 0,
        bossHealthPercentAfterDefeatTotal: 0,
        bossRecoveryCountBeforeFirstEncounter: 0,
        bossFirstEncounterTicks: -1,
        secondsToFirstElite: -1,
        secondsToFirstMiniBoss: -1,
        secondsToFirstWorldEvent: -1,
        hpPercentSum: 0,
        hpPercentSamples: 0,
        minHpPercentObserved: 100,
        deathCause: null,
        lifeWasted: 0,
        dungeonRecoveryReceived: 0,
        dungeonRecoveryWasted: 0,
        checkpointHpBeforePercentSum: 0,
        checkpointHpAfterPercentSum: 0,
        checkpointHpSamples: 0,
        dungeonDeathBeforeBoss: 0,
        dungeonDeathAtBoss: 0,
        ticksToAmigavel: -1,
        ticksToRespeitado: -1,
        finalSlotPowerScores: {},
        dungeonCheckpointsReached: 0,
        secondsToFirstItem: -1,
        secondsToFirstExpeditionCompletion: -1,
        secondsToFirstDungeonStart: -1,
        secondsToFirstBossDefeat: -1,
        firstUpgradeSeconds: -1,
        upgradeCount: 0,
        longestGapWithoutUpgradeSeconds: 0,
        rhythmCombatSeconds: 0,
        rhythmRecoverySeconds: 0,
        rhythmExplorationSeconds: 0,
        rhythmCheckpointSeconds: 0,
        rhythmBossSeconds: 0,
        perRegionHpPercentSum: {},
        perRegionHpPercentSamples: {},
        perRegionDamageDealt: {},
        perRegionDamageTaken: {},
        perRegionRecoveryReceived: {},
        perRegionRecoveryWasted: {},
        bossEncounterCharacterLevel: -1,
        bossEncounterMaxLife: -1,
        bossEncounterHpPercent: -1,
        bossEncounterEstimatedDps: -1,
        bossEncounterGold: -1,
        bossEncounterReputationTotal: -1,
        bossEncounterAverageRarityScore: -1,
        bossEncounterEncountersCompleted: -1,
        bossEncounterCheckpointsUsed: -1,
        bossHpPercentRemainingOnPlayerLoss: -1,
        ...overrides,
      };
    }

    it("agrega sobrevivência (média/mínimo/máximo/taxa de morte) corretamente", () => {
      const results = [
        fakeResult({ simulatedSeconds: 100, survived: true }),
        fakeResult({ simulatedSeconds: 200, survived: false }),
        fakeResult({ simulatedSeconds: 300, survived: true }),
      ];
      const report = generateBalanceReport(results);
      assert.equal(report.survival.averageSeconds, 200);
      assert.equal(report.survival.minSeconds, 100);
      assert.equal(report.survival.maxSeconds, 300);
      assert.ok(Math.abs(report.survival.deathRate - 1 / 3) < 1e-9);
    });

    it("agrega progressão (nível médio/distribuição/XP média) corretamente", () => {
      const results = [fakeResult({ finalLevel: 2, xpGained: 100 }), fakeResult({ finalLevel: 4, xpGained: 300 })];
      const report = generateBalanceReport(results);
      assert.equal(report.progression.averageFinalLevel, 3);
      assert.equal(report.progression.averageXpGained, 200);
      assert.deepEqual(report.progression.levelDistribution, { 2: 1, 4: 1 });
    });

    it("agrega loot (itens/raridades) corretamente, somando rarityCounts de todas as execuções", () => {
      const results = [
        fakeResult({ rarityCounts: { common: 2, magic: 1 } }),
        fakeResult({ rarityCounts: { common: 1, rare: 1 } }),
      ];
      const report = generateBalanceReport(results);
      assert.deepEqual(report.loot.rarityCounts, { common: 3, magic: 1, rare: 1 });
    });

    it("agrupa perRegion corretamente, contando execuções/mortes por região", () => {
      const results = [
        fakeResult({ regionId: "bosque-sussurrante", survived: true }),
        fakeResult({ regionId: "bosque-sussurrante", survived: false }),
        fakeResult({ regionId: "pantano-podre", survived: true }),
      ];
      const report = generateBalanceReport(results);
      const bosque = report.perRegion.find((r) => r.regionId === "bosque-sussurrante")!;
      const pantano = report.perRegion.find((r) => r.regionId === "pantano-podre")!;
      assert.equal(bosque.runs, 2);
      assert.equal(bosque.deaths, 1);
      assert.equal(pantano.runs, 1);
      assert.equal(pantano.deaths, 0);
    });

    it("recommendations nunca fica vazio (sempre produz ao menos uma linha, mesmo sem desequilíbrio)", () => {
      const results = [fakeResult({}), fakeResult({})];
      const report = generateBalanceReport(results);
      assert.ok(report.recommendations.length > 0);
    });

    it("recommendations derivadas apenas das estatísticas: uma região com taxa de morte visivelmente maior é sinalizada", () => {
      const results = [
        ...Array.from({ length: 10 }, () => fakeResult({ regionId: "regiao-dificil", survived: false })),
        ...Array.from({ length: 10 }, () => fakeResult({ regionId: "regiao-facil", survived: true })),
      ];
      const report = generateBalanceReport(results);
      assert.ok(report.recommendations.some((line) => line.includes("regiao-dificil")));
    });
  });

  describe("performance", () => {
    it("100 aventuras simuladas completam rapidamente", () => {
      const start = Date.now();
      runBalanceSimulation({ runs: 100 });
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 5000, `100 aventuras simuladas levaram ${elapsedMs}ms, esperava < 5000ms`);
    });
  });
});
