import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "../presentation/presentationLayer.js";
import { advanceAdventureWithRecovery } from "./recoveryLayer.js";
import { RECOVERY_CONFIG } from "./config.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import { generateBalanceReport } from "../simulation/report.js";
import type { SimulatedAdventureResult } from "../simulation/types.js";

function strongHero(suffix = "1") {
  const build = new CharacterBuild(`recovery-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`recovery-hero-${suffix}`, 30);
  const equipment = new Equipment(`recovery-hero-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", Number(suffix) || 1);
  return character;
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  const character = strongHero(suffix);
  return createAdventureSession(`recovery-session-${suffix}`, character, regionId, seed, 0);
}

describe("Recovery & Adventure Flow Phase I", () => {
  describe("recuperação entre encontros", () => {
    it("cura só é aplicada quando o encontro é concluído com sucesso (EncounterFinished) e o personagem está vivo", () => {
      const session = freshSession("bosque-sussurrante", 1, "recover-basic");
      const timeline = createAdventureTimeline(session.sessionId);

      // Reduz a vida artificialmente pra garantir que há o que curar.
      session.character.currentLife = Math.floor(session.character.currentLife * 0.5);

      const { events, tickResult, recovery } = advanceAdventureWithRecovery(session, timeline, { currentTime: 1000 });
      const encounterFinished = events.some((e) => e.kind === "EncounterFinished");

      assert.equal(recovery.applied, encounterFinished && tickResult.characterAlive);
      if (encounterFinished) {
        assert.ok(recovery.lifeHealed > 0, "esperava cura real quando o encontro termina com o personagem abaixo da vida máxima");
      }
    });

    it("a cura nunca ultrapassa a vida máxima (clamp)", () => {
      const session = freshSession("bosque-sussurrante", 1, "recover-clamp");
      const timeline = createAdventureTimeline(session.sessionId);

      // Vida já cheia — não deveria haver nada pra curar, mesmo que o
      // encontro termine com sucesso.
      const { recovery } = advanceAdventureWithRecovery(session, timeline, { currentTime: 1000 });
      assert.ok(recovery.lifeAfter <= session.character.currentLife + 0.001);
      assert.equal(recovery.lifeHealed, Math.max(0, recovery.lifeAfter - recovery.lifeBefore));
    });

    it("a quantidade curada corresponde a percentOfMaxLife x vida máxima (RECOVERY_CONFIG), nunca um valor solto", () => {
      const session = freshSession("bosque-sussurrante", 1, "recover-percent");
      const timeline = createAdventureTimeline(session.sessionId);
      session.character.currentLife = Math.floor(session.character.currentLife * 0.5); // abaixo do máximo, pra nunca clampar

      const maximumLife = calculateFinalStats(session.character.characterBuild, session.character.equipment).maximumLife;
      const { tickResult, recovery } = advanceAdventureWithRecovery(session, timeline, { currentTime: 1000 });
      if (tickResult.characterAlive && recovery.applied) {
        const expectedHeal = maximumLife * (RECOVERY_CONFIG.percentOfMaxLife ?? 0);
        assert.ok(Math.abs(recovery.lifeHealed - expectedHeal) < 1e-9);
      }
    });

    it("nunca cura um personagem morto (sem EncounterFinished quando o personagem morre no meio do encontro)", () => {
      const session = freshSession("colinas-aridas", 3, "recover-death");
      const timeline = createAdventureTimeline(session.sessionId);
      // Personagem fraco de propósito (sem o kit forte) pra morrer.
      const weakBuild = new CharacterBuild("recovery-weak", "warrior", 0);
      const weakInventory = new Inventory("recovery-weak", 10);
      const weakEquipment = new Equipment("recovery-weak");
      const weakCharacter = createAdventureCharacter(weakBuild, weakInventory, weakEquipment);
      const weakSession = createAdventureSession("recovery-weak-session", weakCharacter, "colinas-aridas", 3, 0);
      const weakTimeline = createAdventureTimeline(weakSession.sessionId);

      let died = false;
      for (let i = 0; i < 30 && !died; i++) {
        const { tickResult, recovery, events } = advanceAdventureWithRecovery(weakSession, weakTimeline, { currentTime: 1000 * (i + 1) });
        died = !tickResult.characterAlive;
        if (died) {
          assert.equal(recovery.applied, false, "nunca deveria curar na tick em que o personagem morreu");
          assert.ok(!events.some((e) => e.kind === "RecoveryApplied"));
        }
      }
      assert.ok(died, "esperava que o personagem fraco morresse em até 30 tentativas");
    });
  });

  describe("evento RecoveryApplied", () => {
    it("quando aplicada, a cura produz um RecoveryApplied na Timeline com lifeBefore/lifeHealed/lifeAfter/reason coerentes", () => {
      const session = freshSession("bosque-sussurrante", 1, "recover-event");
      const timeline = createAdventureTimeline(session.sessionId);
      session.character.currentLife = Math.floor(session.character.currentLife * 0.5);

      const { events } = advanceAdventureWithRecovery(session, timeline, { currentTime: 1000 });
      const recoveryEvent = events.find((e) => e.kind === "RecoveryApplied");
      assert.ok(recoveryEvent, "esperava um RecoveryApplied quando a vida estava baixa e o encontro terminou");
      if (recoveryEvent && recoveryEvent.kind === "RecoveryApplied") {
        assert.equal(recoveryEvent.reason, "encounter-finished");
        assert.equal(recoveryEvent.lifeAfter, recoveryEvent.lifeBefore + recoveryEvent.lifeHealed);
        assert.ok(recoveryEvent.lifeHealed > 0);
      }
      // O mesmo evento também deve estar na Adventure Timeline persistente.
      assert.ok(timeline.events.some((e) => e.kind === "RecoveryApplied"));
    });

    it("produz também um FloatingNumberEvent kind='heal' (reaproveita o tipo já existente, nunca produzido antes desta Sprint)", () => {
      const session = freshSession("bosque-sussurrante", 1, "recover-floating");
      const timeline = createAdventureTimeline(session.sessionId);
      session.character.currentLife = Math.floor(session.character.currentLife * 0.5);

      const { floatingNumbers, recovery } = advanceAdventureWithRecovery(session, timeline, { currentTime: 1000 });
      if (recovery.applied) {
        const healNumber = floatingNumbers.find((f) => f.kind === "heal");
        assert.ok(healNumber, "esperava um floating number 'heal' quando a cura foi aplicada");
        assert.equal(healNumber!.value, recovery.lifeHealed);
        assert.equal(healNumber!.target, "character");
      }
    });
  });

  describe("determinismo", () => {
    it("mesma sessão inicial + mesma seed sempre produzem o mesmo RecoveryResult", () => {
      function run() {
        const session = freshSession("bosque-sussurrante", 7, "recover-det");
        const timeline = createAdventureTimeline(session.sessionId);
        return advanceAdventureWithRecovery(session, timeline, { currentTime: 1000 }).recovery;
      }
      assert.deepEqual(run(), run());
    });

    it("advanceAdventureWithRecovery com enableRecovery equivalente a advanceAdventureWithPresentation puro, exceto pela cura em si", () => {
      // Engine Observability & Event Derivation Phase I — mesmo suffix
      // (mesmo sessionId) nos dois, mesmo motivo do teste equivalente em
      // presentation.test.ts: `lootDrops[].instanceId` embute o
      // sessionId, então nomes diferentes quebrariam a comparação por um
      // motivo que não tem nada a ver com o que este teste mede
      // (equivalência de GAMEPLAY entre Presentation pura e com Recovery).
      const sessionPure = freshSession("bosque-sussurrante", 99, "recover-pure-wrapped");
      const sessionRecovered = freshSession("bosque-sussurrante", 99, "recover-pure-wrapped");

      const timelinePure = createAdventureTimeline(sessionPure.sessionId);
      const timelineRecovered = createAdventureTimeline(sessionRecovered.sessionId);

      const pureResult = advanceAdventureWithPresentation(sessionPure, timelinePure, { currentTime: 1000 });
      const { tickResult: recoveredTickResult } = advanceAdventureWithRecovery(sessionRecovered, timelineRecovered, { currentTime: 1000 });

      // O resultado de GAMEPLAY (tickResult) é idêntico — a Recovery
      // Layer nunca altera o que a Presentation Layer já decidiu.
      assert.deepEqual(recoveredTickResult, pureResult.tickResult);
    });
  });

  describe("relatório: recuperação", () => {
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
          damageTaken: 100,
          itemsFound: 2,
          itemsEquipped: 1,
          goldFound: 0,
          elapsedTime: 100000,
        },
        xpGained: 100,
        rarityCounts: {},
        lifeRecovered: 40,
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

    it("agrega HP recuperado/perdido e calcula eficiência = recuperado/perdido", () => {
      const results = [fakeResult({ lifeRecovered: 40, statistics: { ...fakeResult({}).statistics, damageTaken: 100 } })];
      const report = generateBalanceReport(results);
      assert.equal(report.recovery.averageLifeRecovered, 40);
      assert.equal(report.recovery.averageLifeLost, 100);
      assert.ok(Math.abs(report.recovery.efficiency - 0.4) < 1e-9);
    });

    it("sinaliza recuperação insuficiente quando a taxa de morte está muito acima do alvo", () => {
      const results = [
        ...Array.from({ length: 10 }, () => fakeResult({ survived: false })),
        ...Array.from({ length: 2 }, () => fakeResult({ survived: true })),
      ];
      const report = generateBalanceReport(results, 600, 0.3);
      assert.ok(report.recommendations.some((line) => line.toLowerCase().includes("insuficiente")));
    });

    it("sinaliza recuperação excessiva quando a taxa de morte é quase zero e a eficiência é bem maior que o dano recebido", () => {
      const results = Array.from({ length: 20 }, () =>
        fakeResult({
          survived: true,
          lifeRecovered: 200,
          statistics: { ...fakeResult({}).statistics, damageTaken: 100 },
        }),
      );
      const report = generateBalanceReport(results, 600, 0.3);
      assert.ok(report.recommendations.some((line) => line.toLowerCase().includes("excessiva")));
    });
  });
});
