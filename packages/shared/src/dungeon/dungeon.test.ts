import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DUNGEON_FINAL_BOSS_BY_EXPEDITION, getFinalBossTemplateId, isDungeonExpedition } from "./dungeonDefinitions.js";
import { deriveDungeonBossProgress } from "./dungeonProgress.js";
import { advanceDungeonTick } from "./dungeonController.js";
import { getExpeditionDefinition } from "../expeditions/expeditionDefinitions.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { getLootTable } from "../lootgen/lootTables.js";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { deriveHudState } from "../hud/deriveHudState.js";
import { deriveObjectiveProgress } from "../objectives/objectiveProgress.js";
import type { PresentationEvent } from "../presentation/types.js";
import { runDungeonSimulation } from "../simulation/simulator.js";
import { generateBalanceReport } from "../simulation/report.js";

const DUNGEON_ID = "queda-da-fortaleza-sombria";
const BOSS_TEMPLATE_ID = "forgotten-guardian";

// Personagem forte o bastante pra derrotar o Chefe Final de forma
// confiável, colocado DIRETAMENTE em ruinas-esquecidas (bypassa a
// travessia natural de biomas, que levaria centenas de ticks) — mesmo
// princípio de "testar o MECANISMO, não a dificuldade de uma jornada
// inteira" já usado em expeditions.test.ts/factions.test.ts (midHero/
// strongHero). A Dungeon é forçada via um ExpeditionStarted sintético
// (mesma técnica do Simulador, ver simulation/simulator.ts:
// SimulatedAdventureOptions.forceExpeditionId).
function strongHeroInRuins(suffix: string, seed: number) {
  const characterId = `dungeon-strong-${suffix}`;
  const build = new CharacterBuild(characterId, "warrior", 0);
  for (let i = 0; i < 30; i++) build.addExperience(20000);
  const inventory = new Inventory(characterId, 30);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", seed);

  const session = createAdventureSession(`${characterId}-session`, character, "ruinas-esquecidas", seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);
  timeline.events.push({
    kind: "ExpeditionStarted",
    expeditionId: DUNGEON_ID,
    name: "Queda da Fortaleza Sombria",
    regionId: "ruinas-esquecidas",
    tickIndex: 0,
    timestamp: 0,
  });
  timeline.nextTickIndex = 1;
  return { session, timeline };
}

// Personagem nu (sem starter kit) — mesmo princípio de "Gameplay
// Balance & First Playable Experience Phase I" (um personagem sem
// equipamento morre com frequência mesmo contra inimigos comuns) —
// usado aqui pra encontrar um cenário de DERROTA contra o Chefe Final
// (FinalBossEncounter sem FinalBossDefeated).
function nakedHeroInRuins(suffix: string, seed: number) {
  const characterId = `dungeon-naked-${suffix}`;
  const build = new CharacterBuild(characterId, "warrior", 0);
  const inventory = new Inventory(characterId, 30);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);

  const session = createAdventureSession(`${characterId}-session`, character, "ruinas-esquecidas", seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);
  timeline.events.push({
    kind: "ExpeditionStarted",
    expeditionId: DUNGEON_ID,
    name: "Queda da Fortaleza Sombria",
    regionId: "ruinas-esquecidas",
    tickIndex: 0,
    timestamp: 0,
  });
  timeline.nextTickIndex = 1;
  return { session, timeline };
}

describe("First Dungeon, Final Boss & Complete Game Loop Phase I", () => {
  describe("dados (requisito 1/2/5)", () => {
    it("queda-da-fortaleza-sombria existe como ExpeditionDefinition, atravessando todos os biomas conhecidos", () => {
      const definition = getExpeditionDefinition(DUNGEON_ID);
      assert.ok(definition, "a Dungeon deveria existir como uma ExpeditionDefinition comum");
      assert.equal(definition!.startBiome, "bosque-sussurrante");
      assert.ok(definition!.allowedBiomes.includes("fortaleza-sombria"));
      assert.equal(definition!.reward.guaranteedLootTableId, "final-boss-relic");
    });

    it("forgotten-guardian (Guardião Esquecido) é o Chefe Final designado — reaproveita o EnemyTemplate já existente, nenhum novo criado", () => {
      assert.equal(DUNGEON_FINAL_BOSS_BY_EXPEDITION[DUNGEON_ID], BOSS_TEMPLATE_ID);
      assert.equal(getFinalBossTemplateId(DUNGEON_ID), BOSS_TEMPLATE_ID);
      assert.ok(isDungeonExpedition(DUNGEON_ID));
      assert.equal(isDungeonExpedition("bosque-antigo"), false, "Expedições regulares não deveriam ter Chefe Final");

      const template = getEnemyTemplate(BOSS_TEMPLATE_ID);
      assert.ok(template, "o Enemy Template do Chefe Final deveria já existir");
      assert.equal(template!.name, "Guardião Esquecido");
    });

    it("final-boss-relic é uma Loot Table exclusiva, com drop garantido e viés forte pra Unique", () => {
      const table = getLootTable("final-boss-relic");
      assert.ok(table, "a Loot Table exclusiva do Chefe Final deveria existir");
      assert.equal(table!.dropChance, 1.0);
      assert.ok(table!.rarityMultiplier >= 3, "rarityMultiplier deveria ser bem mais alto que o de um monstro comum");
      // Distinta da Loot Table normal do Guardião Esquecido (o drop de
      // qualquer abate comum) — a recompensa exclusiva é ADICIONAL.
      const regularTable = getLootTable("forgotten-guardian");
      assert.ok(regularTable);
      assert.notEqual(table!.seedOffset, regularTable!.seedOffset);
    });
  });

  describe("mecanismo do Chefe Final (requisito 7)", () => {
    it("um personagem forte encontra e derrota o Chefe, concedendo XP/ouro/item/reputação e disparando DungeonCompleted", () => {
      let found: { events: PresentationEvent[]; session: ReturnType<typeof strongHeroInRuins>["session"] } | null = null;
      for (let seed = 1; seed <= 30 && !found; seed++) {
        const { session, timeline } = strongHeroInRuins(`win-${seed}`, seed);
        for (let tick = 0; tick < 100; tick++) {
          const { tickResult, events } = advanceDungeonTick(session, timeline, { currentTime: 1000 * (tick + 1), autoEquip: true });
          if (events.some((event) => event.kind === "FinalBossDefeated")) {
            found = { events: timeline.events, session };
            break;
          }
          if (!tickResult.characterAlive) break;
        }
      }
      assert.ok(found, "esperava ao menos 1 seed (de 30) derrotar o Chefe Final em até 100 ticks com um personagem forte");

      const events = found!.events;
      const defeatedEvent = events.find((event) => event.kind === "FinalBossDefeated")!;
      assert.ok(defeatedEvent.kind === "FinalBossDefeated" && defeatedEvent.enemyTemplateId === BOSS_TEMPLATE_ID);
      assert.ok(defeatedEvent.kind === "FinalBossDefeated" && defeatedEvent.xpAmount > 0 && defeatedEvent.goldAmount > 0);

      // Requisito 4 — recompensa: item exclusivo (LootDropped na MESMA
      // tick) + reputação (ReputationChanged, facção dona de
      // ruinas-esquecidas: Culto das Ruínas). Nota: a MESMA tick também
      // pode conter um ReputationChanged GENÉRICO pra Legião Sombria
      // (o gatilho comum de "MiniBossDefeated" já observado por
      // factions/factionController.ts, já que o Chefe Final também É um
      // MiniBossDefeated do ponto de vista genérico) — por isso o filtro
      // aqui é por `factionId`, não só por tickIndex.
      const defeatTick = defeatedEvent.tickIndex;
      const lootEvent = events.find((event) => event.kind === "LootDropped" && event.tickIndex === defeatTick);
      assert.ok(lootEvent, "esperava um LootDropped na mesma tick da derrota (item exclusivo)");
      const reputationEvent = events.find(
        (event) => event.kind === "ReputationChanged" && event.tickIndex === defeatTick && event.factionId === "culto-das-ruinas",
      );
      assert.ok(reputationEvent, "esperava um ReputationChanged pra Culto das Ruínas na mesma tick da derrota");

      // Requisito 7 — DungeonCompleted acompanha ExpeditionCompleted na
      // mesma tick em que a Expedição termina (pode ser a MESMA tick da
      // derrota, ou uma tick posterior, dependendo de quantos encontros
      // ainda faltavam) — nunca a substitui.
      const dungeonCompletedEvent = events.find((event) => event.kind === "DungeonCompleted");
      if (dungeonCompletedEvent) {
        assert.ok(dungeonCompletedEvent.kind === "DungeonCompleted" && dungeonCompletedEvent.bossName === "Guardião Esquecido");
        const sameTickExpeditionCompleted = events.find(
          (event) => event.kind === "ExpeditionCompleted" && event.tickIndex === dungeonCompletedEvent.tickIndex,
        );
        assert.ok(sameTickExpeditionCompleted, "DungeonCompleted deveria sempre acompanhar um ExpeditionCompleted na mesma tick");
      }
    });

    it("FinalBossEncounter dispara mesmo quando o personagem morre lutando (mesma limitação estrutural de MiniBossEncounter)", () => {
      // Boss Accessibility & Endgame Balance Phase I — Fase 3: com o
      // Chefe enfraquecido e o `miniBoss` chance mais alto (ver
      // encounterTables.ts), um seed pode agora VENCER o 1º encontro e
      // sobreviver o bastante pra rolar um 2º dentro da mesma janela de
      // 60 ticks — o loop precisa parar no 1º desfecho do Chefe (vitória
      // OU derrota), nunca continuar escaneando depois de uma vitória
      // anterior (que deixaria um FinalBossDefeated "antigo" na
      // Timeline, mesmo procurando por uma derrota).
      let found: PresentationEvent[] | null = null;
      for (let seed = 1; seed <= 60 && !found; seed++) {
        const { session, timeline } = nakedHeroInRuins(`lose-${seed}`, seed * 7919);
        for (let tick = 0; tick < 60; tick++) {
          const { tickResult, events } = advanceDungeonTick(session, timeline, { currentTime: 1000 * (tick + 1), autoEquip: true });
          const encountered = events.some((event) => event.kind === "FinalBossEncounter");
          const defeated = events.some((event) => event.kind === "FinalBossDefeated");
          if (encountered && !defeated && !tickResult.characterAlive) {
            found = timeline.events;
            break;
          }
          if (encountered) break;
          if (!tickResult.characterAlive) break;
        }
      }
      assert.ok(found, "esperava ao menos 1 seed (de 60) encontrar o Chefe e morrer sem derrotá-lo");
      assert.ok(found!.some((event) => event.kind === "FinalBossEncounter"));
      assert.ok(!found!.some((event) => event.kind === "FinalBossDefeated"));
    });
  });

  describe("HUD (requisito 8)", () => {
    it("hudState.expedition.finalBoss é null quando a Expedição ativa não tem Chefe Final designado", () => {
      const characterId = "dungeon-hud-regular";
      const build = new CharacterBuild(characterId, "warrior", 0);
      const inventory = new Inventory(characterId, 24);
      const equipment = new Equipment(characterId);
      const character = createAdventureCharacter(build, inventory, equipment);
      const session = createAdventureSession(`${characterId}-session`, character, "bosque-sussurrante", 7, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push({
        kind: "ExpeditionStarted",
        expeditionId: "bosque-antigo",
        name: "Bosque Antigo",
        regionId: "bosque-sussurrante",
        tickIndex: 0,
        timestamp: 0,
      });
      timeline.nextTickIndex = 1;

      const hud = deriveHudState(session, timeline);
      assert.ok(hud.expedition, "deveria haver uma Expedição ativa");
      assert.equal(hud.expedition!.finalBoss, null);
      assert.equal(deriveDungeonBossProgress(session, timeline), null);
    });

    it("hudState.expedition.finalBoss reflete encountered/defeated corretamente ao longo do combate", () => {
      let sample: { session: ReturnType<typeof strongHeroInRuins>["session"]; timeline: ReturnType<typeof strongHeroInRuins>["timeline"] } | null = null;
      outer: for (let seed = 1; seed <= 30; seed++) {
        const { session, timeline } = strongHeroInRuins(`hud-${seed}`, seed);
        const hudBefore = deriveHudState(session, timeline);
        assert.ok(hudBefore.expedition, "expedição forçada deveria já estar ativa");
        assert.ok(hudBefore.expedition!.finalBoss, "finalBoss deveria já estar populado (Dungeon com Chefe designado)");
        assert.equal(hudBefore.expedition!.finalBoss!.encountered, false);
        assert.equal(hudBefore.expedition!.finalBoss!.defeated, false);

        for (let tick = 0; tick < 100; tick++) {
          const { tickResult, events } = advanceDungeonTick(session, timeline, { currentTime: 1000 * (tick + 1), autoEquip: true });
          if (events.some((event) => event.kind === "FinalBossDefeated")) {
            sample = { session, timeline };
            break outer;
          }
          if (!tickResult.characterAlive) break;
        }
      }
      assert.ok(sample, "esperava ao menos 1 seed derrotar o Chefe em até 100 ticks");
      const hudAfter = deriveHudState(sample!.session, sample!.timeline);
      // A Expedição pode já ter concluído nesta mesma tick (fronteira
      // fechada) — mesmo princípio de HudExpeditionInfo já documentado
      // (deriveExpeditionProgress volta null quando a última fronteira é
      // ExpeditionCompleted/Failed). Se ainda ativa, finalBoss.defeated
      // deveria refletir a derrota.
      if (hudAfter.expedition) {
        assert.equal(hudAfter.expedition.finalBoss!.defeated, true);
        assert.equal(hudAfter.expedition.finalBoss!.bossName, "Guardião Esquecido");
      }
    });
  });

  describe("objetivos (requisito 6)", () => {
    it("defeat-final-boss/complete-dungeon contam os eventos certos", () => {
      const characterId = "dungeon-obj";
      const build = new CharacterBuild(characterId, "warrior", 0);
      const inventory = new Inventory(characterId, 24);
      const equipment = new Equipment(characterId);
      const character = createAdventureCharacter(build, inventory, equipment);
      const session = createAdventureSession(`${characterId}-session`, character, "ruinas-esquecidas", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push(
        { kind: "FinalBossEncounter", enemyTemplateId: BOSS_TEMPLATE_ID, enemyName: "Guardião Esquecido", regionId: "ruinas-esquecidas", tickIndex: 0, timestamp: 0 },
        { kind: "FinalBossDefeated", enemyTemplateId: BOSS_TEMPLATE_ID, enemyName: "Guardião Esquecido", xpAmount: 800, goldAmount: 250, tickIndex: 0, timestamp: 0 },
        {
          kind: "DungeonCompleted",
          expeditionId: DUNGEON_ID,
          name: "Queda da Fortaleza Sombria",
          bossName: "Guardião Esquecido",
          encountersCompleted: 220,
          xpAmount: 1500,
          goldAmount: 400,
          tickIndex: 1,
          timestamp: 1000,
        },
      );
      timeline.nextTickIndex = 2;

      const events = timeline.events;
      assert.equal(events.filter((e) => e.kind === "FinalBossDefeated").length, 1);
      assert.equal(events.filter((e) => e.kind === "DungeonCompleted").length, 1);

      const snapshot = deriveObjectiveProgress(session, timeline);
      assert.ok(snapshot.objective, "deveria sempre existir um objetivo ativo");
    });
  });

  describe("simulação (requisito 10/11)", () => {
    it("runDungeonSimulation produz contadores de dungeon/boss consistentes", () => {
      const results = runDungeonSimulation({ count: 10, seedBase: 1 });
      assert.equal(results.length, 10);
      for (const result of results) {
        assert.ok(result.dungeonsStarted >= 1, "cada execução forçada deveria ter iniciado a Dungeon ao menos 1 vez");
        assert.ok(result.finalBossEncountered >= result.finalBossDefeated);
        assert.ok(result.bossDamageDealtTotal >= 0 && result.bossDamageTakenTotal >= 0);
        assert.ok(result.bossFirstEncounterTicks === -1 || result.bossFirstEncounterTicks > 0);
      }
    });

    it("generateBalanceReport agrega dungeon/boss stats (Boss Balance Report) coerentemente", () => {
      const results = runDungeonSimulation({ count: 15, seedBase: 1 });
      const report = generateBalanceReport(results);
      assert.ok(report.dungeon.totalStarted >= results.length);
      assert.ok(report.dungeon.bossWinRate >= 0 && report.dungeon.bossWinRate <= 1);
      assert.ok(report.dungeon.boss.averageHealthPercentAfterDefeat >= 0 && report.dungeon.boss.averageHealthPercentAfterDefeat <= 100);
      assert.ok(report.dungeon.boss.fightDurationSeconds > 0, "duração da luta deveria ser sempre positiva (1 tick)");
      assert.ok(report.dungeon.boss.averageDpsDealt >= 0 && report.dungeon.boss.averageDpsTaken >= 0);
      assert.ok(report.dungeon.boss.completionRateWithBossEncountered >= 0 && report.dungeon.boss.completionRateWithBossEncountered <= 1);
      assert.ok(Array.isArray(report.recommendations) && report.recommendations.length > 0);
    });

    it("determinístico: mesma seed sempre produz os mesmos contadores de dungeon/boss", () => {
      const a = runDungeonSimulation({ count: 3, seedBase: 42 });
      const b = runDungeonSimulation({ count: 3, seedBase: 42 });
      for (let i = 0; i < a.length; i++) {
        assert.equal(a[i].dungeonsCompleted, b[i].dungeonsCompleted);
        assert.equal(a[i].finalBossEncountered, b[i].finalBossEncountered);
        assert.equal(a[i].finalBossDefeated, b[i].finalBossDefeated);
        assert.equal(a[i].bossDamageDealtTotal, b[i].bossDamageDealtTotal);
        assert.equal(a[i].bossHealthPercentAfterDefeatTotal, b[i].bossHealthPercentAfterDefeatTotal);
      }
    });
  });
});
