import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "../presentation/presentationLayer.js";
import { deriveHudState } from "./deriveHudState.js";
import { getProgress } from "../xp.js";

function strongHero(suffix = "1") {
  const build = new CharacterBuild(`hud-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`hud-hero-${suffix}`, 30);
  const equipment = new Equipment(`hud-hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  const character = strongHero(suffix);
  return createAdventureSession(`hud-session-${suffix}`, character, regionId, seed, 0);
}

describe("HUD State Phase I", () => {
  describe("estado inicial", () => {
    it("uma sessão recém-criada produz um HudState coerente, sem nenhum tick ainda", () => {
      const session = freshSession();
      const timeline = createAdventureTimeline(session.sessionId);
      const hud = deriveHudState(session, timeline);

      assert.equal(hud.currentLife, session.character.currentLife);
      assert.ok(hud.maximumLife > 0);
      assert.equal(hud.region.id, "bosque-sussurrante");
      assert.equal(hud.encounter.state, "sem-encontro");
      assert.equal(hud.encounter.enemiesTotal, 0);
      assert.equal(hud.recentLoot, null);
      assert.equal(hud.recentEquip, null);
      assert.equal(hud.lastDamageDealt, null);
      assert.equal(hud.lastDamageTaken, null);
      assert.equal(hud.sessionStatus, "explorando");
      assert.deepEqual(hud.recentEvents, []);
    });
  });

  describe("barra de vida", () => {
    it("currentLife/maximumLife refletem o personagem real, nunca um cálculo próprio", () => {
      const session = freshSession();
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const hud = deriveHudState(session, timeline);
      assert.equal(hud.currentLife, session.character.currentLife);
    });
  });

  describe("região", () => {
    it("nome vem de getRegionName(), nunca hardcoded", () => {
      const session = freshSession("fortaleza-sombria", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const hud = deriveHudState(session, timeline);
      assert.equal(hud.region.name, "Fortaleza Sombria");
    });

    it("nível recomendado vem da Encounter Table real da região", () => {
      const session = freshSession("fortaleza-sombria", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const hud = deriveHudState(session, timeline);
      assert.deepEqual(hud.region.recommendedLevelRange, { min: 60, max: 80 });
    });

    it("região sem Encounter Table produz recommendedLevelRange/difficulty null, nunca um valor inventado", () => {
      const session = freshSession("planicie-dourada", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const hud = deriveHudState(session, timeline);
      assert.equal(hud.region.recommendedLevelRange, null);
      assert.equal(hud.region.difficulty, null);
    });

    it("dificuldade é a mesma classificação pra qualquer região com o mesmo nível mínimo (regra única, não texto por região)", () => {
      const sessionA = freshSession("bosque-sussurrante", 1, "a");
      const sessionB = freshSession("pantano-podre", 1, "b");
      const timelineA = createAdventureTimeline(sessionA.sessionId);
      const timelineB = createAdventureTimeline(sessionB.sessionId);
      const hudA = deriveHudState(sessionA, timelineA);
      const hudB = deriveHudState(sessionB, timelineB);
      // As duas regiões têm minimumLevel 1 nas suas Encounter Tables.
      assert.equal(hudA.region.difficulty, hudB.region.difficulty);
    });
  });

  describe("encontro", () => {
    it("após um tick totalmente resolvido (personagem sobrevive), o estado vira 'concluido'", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const hud = deriveHudState(session, timeline);
      assert.equal(hud.encounter.state, "concluido");
      assert.equal(hud.encounter.enemiesTotal, 0);
    });

    it("quando o personagem morre no meio de um encontro, o estado reflete os inimigos vivos/mortos reais", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let died = false;
      for (let i = 0; i < 30 && !died; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        died = !tickResult.characterAlive;
      }
      assert.ok(died, "esperava que o personagem morresse em até 30 encontros");
      const hud = deriveHudState(session, timeline);
      assert.equal(hud.encounter.state, "em-combate");
      assert.equal(hud.encounter.enemiesTotal, session.currentEncounter!.enemies.length);
      assert.equal(hud.encounter.enemiesAlive, session.currentEncounter!.enemies.filter((e) => e.alive).length);
      assert.equal(hud.encounter.enemiesDefeated, hud.encounter.enemiesTotal - hud.encounter.enemiesAlive);
    });
  });

  describe("loot popup / equipment popup", () => {
    it("recentLoot reflete o LootDropped mais recente da timeline", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let hud = deriveHudState(session, timeline);
      for (let i = 0; i < 20 && !hud.recentLoot; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        hud = deriveHudState(session, timeline);
        if (!tickResult.characterAlive) break;
      }
      assert.ok(hud.recentLoot, "esperava achar loot em até 20 encontros");
      const lastLootEvent = [...timeline.events].reverse().find((e) => e.kind === "LootDropped");
      assert.equal(hud.recentLoot!.instanceId, (lastLootEvent as { instanceId: string }).instanceId);
    });

    it("recentEquip.delta é calculado só com dados do próprio evento (powerScore - previousPowerScore)", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let hud = deriveHudState(session, timeline);
      for (let i = 0; i < 20 && !hud.recentEquip; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { autoEquip: true, currentTime: 1000 * (i + 1) });
        hud = deriveHudState(session, timeline);
        if (!tickResult.characterAlive) break;
      }
      assert.ok(hud.recentEquip, "esperava um Auto Equip em até 20 encontros");
      assert.equal(hud.recentEquip!.delta, hud.recentEquip!.powerScore - hud.recentEquip!.previousPowerScore);
      assert.ok(hud.recentEquip!.delta >= 0);
    });
  });

  describe("feed de eventos", () => {
    it("recentEvents é sempre uma fatia (nunca reconstrução) da própria Adventure Timeline", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      advanceAdventureWithPresentation(session, timeline, { currentTime: 2000 });
      const hud = deriveHudState(session, timeline);
      assert.deepEqual(hud.recentEvents, timeline.events.slice(-20));
    });

    it("respeita o limite customizado de eventos recentes", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const hud = deriveHudState(session, timeline, { recentEventLimit: 2 });
      assert.ok(hud.recentEvents.length <= 2);
    });
  });

  describe("overlay / estatísticas", () => {
    it("statistics/elapsedTime são exatamente os da AdventureSession, sem transformação", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 5000 });
      const hud = deriveHudState(session, timeline);
      assert.deepEqual(hud.statistics, session.statistics);
      assert.equal(hud.elapsedTime, session.statistics.elapsedTime);
    });

    it("lastDamageDealt/lastDamageTaken vêm do AttackHit mais recente", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const hud = deriveHudState(session, timeline);
      const lastAttackHit = [...timeline.events].reverse().find((e) => e.kind === "AttackHit");
      assert.ok(lastAttackHit);
      assert.equal(hud.lastDamageDealt, (lastAttackHit as { damageDealt: number }).damageDealt);
      assert.equal(hud.lastDamageTaken, (lastAttackHit as { damageTaken: number }).damageTaken);
    });
  });

  describe("estado da sessão", () => {
    it("nunca retorna 'vitoria' ou 'encerrada' (sem condição de vitória/encerramento no Adventure Loop ainda)", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      for (let i = 0; i < 30; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const hud = deriveHudState(session, timeline);
        assert.notEqual(hud.sessionStatus, "vitoria");
        assert.notEqual(hud.sessionStatus, "encerrada");
        if (!tickResult.characterAlive) break;
      }
    });

    it("vira 'derrota' exatamente quando o personagem morre, nunca antes", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      for (let i = 0; i < 30; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const hud = deriveHudState(session, timeline);
        assert.equal(hud.sessionStatus === "derrota", !tickResult.characterAlive);
        if (!tickResult.characterAlive) break;
      }
    });
  });

  describe("progressão (XP, Level Up, Melhor Item, Recorde de Dano, Resumo, Histórico) — Progression & Player Retention Phase I", () => {
    it("xpProgress é exatamente getProgress(characterBuild.experience), nenhum cálculo novo de experiência", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const hud = deriveHudState(session, timeline);
      assert.deepEqual(hud.xpProgress, getProgress(session.character.characterBuild.experience));
    });

    it("recentLevelUp reflete o LevelUp mais recente da timeline, null quando não há nenhum ainda", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const hudBefore = deriveHudState(session, timeline);
      assert.equal(hudBefore.recentLevelUp, null);

      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const hudAfter = deriveHudState(session, timeline);
      const lastLevelUp = [...timeline.events].reverse().find((e) => e.kind === "LevelUp");
      if (lastLevelUp && lastLevelUp.kind === "LevelUp") {
        assert.equal(hudAfter.recentLevelUp!.level, lastLevelUp.level);
        assert.equal(hudAfter.recentLevelUp!.previousLevel, lastLevelUp.previousLevel);
      } else {
        assert.equal(hudAfter.recentLevelUp, null);
      }
    });

    it("bestItemFound é o maior Power Score entre todos os LootDropped já vistos; newBestItemEvent só dispara na tick exata do recorde", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let best = -Infinity;
      let sawNewRecord = false;
      for (let i = 0; i < 20; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const hud = deriveHudState(session, timeline);
        if (hud.newBestItemEvent) {
          assert.ok(hud.newBestItemEvent.powerScore > best, "só deveria disparar quando o Power Score é realmente maior");
          best = hud.newBestItemEvent.powerScore;
          sawNewRecord = true;
        }
        if (hud.bestItemFound) {
          assert.equal(hud.bestItemFound.powerScore, best);
        }
        if (!tickResult.characterAlive) break;
      }
      assert.ok(sawNewRecord, "esperava ao menos um novo recorde de item em até 20 encontros");
    });

    it("newBestItemEvent nunca continua 'ligado' numa tick seguinte sem LootDropped novo", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let previousHadRecord = false;
      for (let i = 0; i < 20; i++) {
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const hud = deriveHudState(session, timeline);
        const hasLoot = events.some((e) => e.kind === "LootDropped");
        if (previousHadRecord && !hasLoot) {
          assert.equal(hud.newBestItemEvent, null);
        }
        previousHadRecord = Boolean(hud.newBestItemEvent);
        if (!tickResult.characterAlive) break;
      }
    });

    it("newDamageRecordEvent só dispara quando o AttackHit do tick supera todos os anteriores", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      let best = -Infinity;
      for (let i = 0; i < 10; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const hud = deriveHudState(session, timeline);
        if (hud.newDamageRecordEvent) {
          assert.ok(hud.newDamageRecordEvent.damageDealt > best);
          best = hud.newDamageRecordEvent.damageDealt;
        }
        if (!tickResult.characterAlive) break;
      }
      assert.ok(best > -Infinity, "esperava ao menos um recorde de dano nas primeiras ticks");
    });

    it("sessionSummary é null enquanto o personagem está vivo e reflete statistics+XP exatamente na derrota", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let died = false;
      for (let i = 0; i < 30 && !died; i++) {
        const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const hud = deriveHudState(session, timeline);
        died = !tickResult.characterAlive;
        assert.equal(hud.sessionSummary === null, !died);
      }
      assert.ok(died, "esperava que o personagem morresse em até 30 encontros");
      const hud = deriveHudState(session, timeline);
      assert.ok(hud.sessionSummary);
      assert.equal(hud.sessionSummary!.elapsedTime, session.statistics.elapsedTime);
      assert.equal(hud.sessionSummary!.enemiesKilled, session.statistics.enemiesKilled);
      assert.equal(hud.sessionSummary!.damageDealt, session.statistics.damageDealt);
      assert.equal(hud.sessionSummary!.damageTaken, session.statistics.damageTaken);
      assert.equal(hud.sessionSummary!.itemsFound, session.statistics.itemsFound);
      assert.equal(hud.sessionSummary!.itemsEquipped, session.statistics.itemsEquipped);
      assert.equal(hud.sessionSummary!.xpGained, timeline.totalXpGranted);
    });

    it("sessionHistory: encountersStarted conta os EncounterStarted reais da timeline, e os agregados batem com a conta manual", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      advanceAdventureWithPresentation(session, timeline, { currentTime: 2000 });
      const hud = deriveHudState(session, timeline);

      const encountersStarted = timeline.events.filter((e) => e.kind === "EncounterStarted").length;
      assert.equal(hud.sessionHistory.encountersStarted, encountersStarted);
      assert.equal(hud.sessionHistory.encountersCompleted, session.statistics.encountersCompleted);
      assert.equal(
        hud.sessionHistory.survivalRate,
        encountersStarted > 0 ? Math.min(100, (session.statistics.encountersCompleted / encountersStarted) * 100) : 100,
      );
      const elapsedSeconds = session.statistics.elapsedTime / 1000;
      assert.equal(hud.sessionHistory.averageDps, elapsedSeconds > 0 ? session.statistics.damageDealt / elapsedSeconds : 0);
      assert.equal(
        hud.sessionHistory.damagePerEncounter,
        session.statistics.encountersCompleted > 0 ? session.statistics.damageTaken / session.statistics.encountersCompleted : 0,
      );
      assert.equal(
        hud.sessionHistory.itemsPerEncounter,
        session.statistics.encountersCompleted > 0 ? session.statistics.itemsFound / session.statistics.encountersCompleted : 0,
      );
    });

    it("sessionHistory nunca é null mesmo sem nenhum tick ainda (tudo em 0, survivalRate em 100)", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const hud = deriveHudState(session, timeline);
      assert.deepEqual(hud.sessionHistory, {
        encountersCompleted: 0,
        encountersStarted: 0,
        survivalRate: 100,
        averageDps: 0,
        damagePerEncounter: 0,
        itemsPerEncounter: 0,
      });
    });
  });

  describe("determinismo visual", () => {
    it("mesma sessão + mesma timeline sempre produzem o mesmo HudState (memoizável)", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const a = deriveHudState(session, timeline);
      const b = deriveHudState(session, timeline);
      assert.deepEqual(a, b);
    });

    it("mesma sequência completa de ticks sempre produz o mesmo HudState final", () => {
      function run(): unknown {
        const session = freshSession("bosque-sussurrante", 42, "det");
        const timeline = createAdventureTimeline(session.sessionId);
        advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
        advanceAdventureWithPresentation(session, timeline, { currentTime: 2000 });
        return deriveHudState(session, timeline);
      }
      assert.deepEqual(run(), run());
    });
  });

  describe("performance", () => {
    it("deriveHudState é rápido mesmo com uma timeline grande", () => {
      const session = freshSession("bosque-sussurrante", 1, "perf");
      const timeline = createAdventureTimeline(session.sessionId);
      const maxLife = session.character.currentLife;
      for (let i = 0; i < 200; i++) {
        session.character.currentLife = maxLife;
        advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
      }
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        deriveHudState(session, timeline);
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 2000, `1000 chamadas de deriveHudState levaram ${elapsedMs}ms, esperava < 2000ms`);
    });
  });
});
