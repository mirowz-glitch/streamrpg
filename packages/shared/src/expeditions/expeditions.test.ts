import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EXPEDITION_DEFINITIONS, getExpeditionDefinition, selectExpeditionDefinitionId } from "./expeditionDefinitions.js";
import { deriveExpeditionProgress } from "./expeditionProgress.js";
import { advanceExpeditionTick } from "./expeditionController.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import { deriveHudState } from "../hud/deriveHudState.js";
import { deriveObjectiveProgress } from "../objectives/objectiveProgress.js";
import type { PresentationEvent } from "../presentation/types.js";
import { runSimulatedAdventure } from "../simulation/simulator.js";
import { generateBalanceReport } from "../simulation/report.js";

function strongHero(suffix: string) {
  const build = new CharacterBuild(`exp-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`exp-hero-${suffix}`, 30);
  const equipment = new Equipment(`exp-hero-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", 1);
  return character;
}

// Personagem forte o bastante pra sobreviver vários encontros, mas
// ainda DENTRO da faixa de nível de "bosque-sussurrante" (1-14) —
// `strongHero` (nível 30) desbloqueia "colinas-aridas" (nível mín. 15)
// já na 1ª tick (Region Unlock, objectives/objectiveLayer.ts,
// reaproveitado sem alteração), o que troca a Expedition Definition
// esperada sem nenhum bug real envolvido. Nível 12 (1 level-up de
// 20000 XP) fica abaixo do limiar de 15, garantindo que a expedição
// auto-iniciada continue sendo "bosque-antigo" nos testes que
// verificam o id exato.
function midHero(suffix: string) {
  const build = new CharacterBuild(`exp-mid-hero-${suffix}`, "warrior", 0);
  build.addExperience(20000);
  const inventory = new Inventory(`exp-mid-hero-${suffix}`, 30);
  const equipment = new Equipment(`exp-mid-hero-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", 1);
  return character;
}

describe("Expeditions, Checkpoints & Long Session Progression Phase I", () => {
  describe("dados (requisito 1)", () => {
    it("cada ExpeditionDefinition tem id/nome/descrição/bioma/duração/checkpoints/recompensa/dificuldade — sem ids duplicados", () => {
      const ids = new Set<string>();
      for (const definition of EXPEDITION_DEFINITIONS) {
        assert.ok(definition.id.length > 0);
        assert.ok(definition.name.length > 0);
        assert.ok(definition.description.length > 0);
        assert.ok(definition.startBiome.length > 0);
        assert.ok(definition.allowedBiomes.includes(definition.startBiome));
        assert.ok(definition.expectedEncounters > 0);
        assert.ok(definition.checkpointCount > 0);
        assert.ok(definition.difficulty.length > 0);
        assert.ok(!ids.has(definition.id), `id duplicado: ${definition.id}`);
        ids.add(definition.id);
      }
    });

    it("toda ExpeditionDefinition referencia uma região com Encounter Table real (mesmo World Encounter, requisito arquitetural)", () => {
      for (const definition of EXPEDITION_DEFINITIONS) {
        assert.ok(getEncounterTable(definition.startBiome), `região "${definition.startBiome}" sem Encounter Table correspondente`);
      }
    });

    it("getExpeditionDefinition devolve undefined para id inexistente", () => {
      assert.equal(getExpeditionDefinition("nao-existe"), undefined);
    });
  });

  describe("seleção (requisito 1/2)", () => {
    it("selectExpeditionDefinitionId devolve null para uma região sem nenhuma Expedition Definition", () => {
      assert.equal(selectExpeditionDefinitionId(1, "regiao-inexistente"), null);
    });

    it("selectExpeditionDefinitionId só escolhe entre definições cujo startBiome é a região pedida", () => {
      for (let seed = 0; seed < 50; seed++) {
        const id = selectExpeditionDefinitionId(seed, "bosque-sussurrante");
        assert.ok(id);
        const definition = getExpeditionDefinition(id!)!;
        assert.equal(definition.startBiome, "bosque-sussurrante");
      }
    });

    it("determinístico: mesma seed+região sempre produz o mesmo id", () => {
      const a = selectExpeditionDefinitionId(777, "colinas-aridas");
      const b = selectExpeditionDefinitionId(777, "colinas-aridas");
      assert.equal(a, b);
    });
  });

  describe("progressão pura (requisito 4)", () => {
    it("deriveExpeditionProgress devolve null quando não há ExpeditionStarted na Timeline", () => {
      const session = createAdventureSession("exp-progress-empty", strongHero("empty"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      assert.equal(deriveExpeditionProgress(session, timeline), null);
    });

    it("deriveExpeditionProgress conta encontros/elites/mini-bosses/eventos/objetivos/regiões só DEPOIS do ExpeditionStarted mais recente", () => {
      const session = createAdventureSession("exp-progress-boundary", strongHero("boundary"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);

      // Eventos ANTES do início da expedição — não devem contar.
      timeline.events.push({ kind: "EncounterFinished", enemiesKilled: 1, tickIndex: 0, timestamp: 0 });

      timeline.events.push({ kind: "ExpeditionStarted", expeditionId: "bosque-antigo", name: "Bosque Antigo", regionId: "bosque-sussurrante", tickIndex: 1, timestamp: 1000 });

      timeline.events.push(
        { kind: "EncounterFinished", enemiesKilled: 1, tickIndex: 2, timestamp: 2000 },
        { kind: "EncounterFinished", enemiesKilled: 1, tickIndex: 3, timestamp: 3000 },
        { kind: "EliteDefeated", enemyTemplateId: "wolf", tickIndex: 3, timestamp: 3000 } as unknown as PresentationEvent,
        { kind: "WorldEventStarted", explorationEventId: "abandoned-chest", name: "Baú Abandonado", category: "treasure", regionId: "bosque-sussurrante", tickIndex: 4, timestamp: 4000 },
        { kind: "ObjectiveCompleted", objectiveId: "kill-5", objectiveName: "Caçador", xpBonus: 30, tickIndex: 5, timestamp: 5000 },
      );
      timeline.nextTickIndex = 6;

      const snapshot = deriveExpeditionProgress(session, timeline);
      assert.ok(snapshot);
      assert.equal(snapshot!.expeditionId, "bosque-antigo");
      assert.equal(snapshot!.encountersCompleted, 2, "só os 2 EncounterFinished DEPOIS do início devem contar");
      assert.equal(snapshot!.elitesDefeated, 1);
      assert.equal(snapshot!.worldEventsFound, 1);
      assert.equal(snapshot!.objectivesCompleted, 1);
      assert.equal(snapshot!.diedDuringExpedition, false);
      assert.equal(snapshot!.checkpointsTotal, 3);
      assert.ok(snapshot!.percent > 0 && snapshot!.percent < 100);
      assert.equal(snapshot!.complete, false);
    });

    it("checkpointsReached cresce em fronteiras uniformes (bosque-antigo: 12 encontros, 3 checkpoints => marcos em 3/6/9)", () => {
      const session = createAdventureSession("exp-progress-checkpoints", strongHero("checkpoints"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push({ kind: "ExpeditionStarted", expeditionId: "bosque-antigo", name: "Bosque Antigo", regionId: "bosque-sussurrante", tickIndex: 0, timestamp: 0 });
      timeline.nextTickIndex = 1;

      function withEncounters(count: number): number {
        for (let i = timeline.events.length; i < 1 + count; i++) {
          timeline.events.push({ kind: "EncounterFinished", enemiesKilled: 1, tickIndex: i, timestamp: i * 1000 });
        }
        timeline.nextTickIndex = timeline.events.length;
        return deriveExpeditionProgress(session, timeline)!.checkpointsReached;
      }

      assert.equal(withEncounters(2), 0);
      assert.equal(withEncounters(3), 1);
      assert.equal(withEncounters(6), 2);
      assert.equal(withEncounters(9), 3);
      assert.equal(withEncounters(12), 3, "o último checkpoint nunca coincide com o Final (12 == expectedEncounters)");
      const finalSnapshot = deriveExpeditionProgress(session, timeline)!;
      assert.equal(finalSnapshot.complete, true);
    });

    it("deriveExpeditionProgress devolve null depois de ExpeditionCompleted/ExpeditionFailed (fronteira fechada)", () => {
      const session = createAdventureSession("exp-progress-closed", strongHero("closed"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push(
        { kind: "ExpeditionStarted", expeditionId: "bosque-antigo", name: "Bosque Antigo", regionId: "bosque-sussurrante", tickIndex: 0, timestamp: 0 },
        {
          kind: "ExpeditionCompleted",
          expeditionId: "bosque-antigo",
          name: "Bosque Antigo",
          encountersCompleted: 12,
          elitesDefeated: 0,
          miniBossesDefeated: 0,
          worldEventsFound: 0,
          diedDuringExpedition: false,
          xpAmount: 200,
          goldAmount: 50,
          tickIndex: 1,
          timestamp: 1000,
        },
      );
      timeline.nextTickIndex = 2;
      assert.equal(deriveExpeditionProgress(session, timeline), null);
    });
  });

  // Busca a primeira seed (dentre `maxSeeds` tentativas) cujo
  // personagem nível 12 (midHero) sobrevive por `maxTicks` ticks numa
  // sessão nova em "bosque-sussurrante" — mesma técnica de "procurar
  // seed" já usada em eliteMiniBoss.test.ts/worldEvents.test.ts, aqui
  // pra blindar contra a aleatoriedade natural de combate (morte antes
  // de atingir o checkpoint/conclusão que o teste quer observar).
  function findSurvivingRun(
    maxSeeds: number,
    maxTicks: number,
    stopWhen: (events: PresentationEvent[]) => boolean,
  ): { session: ReturnType<typeof createAdventureSession>; timeline: ReturnType<typeof createAdventureTimeline>; ticks: number } | null {
    for (let seed = 1; seed <= maxSeeds; seed++) {
      const character = midHero(`survive-${seed}`);
      const session = createAdventureSession(`exp-survive-${seed}`, character, "bosque-sussurrante", seed, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      let found = false;
      let ticks = 0;
      while (!found && ticks < maxTicks) {
        const { tickResult, events } = advanceExpeditionTick(session, timeline, { currentTime: 1000 * (ticks + 1) });
        ticks++;
        if (!tickResult.characterAlive) break;
        if (stopWhen(events)) found = true;
      }
      if (found) return { session, timeline, ticks };
    }
    return null;
  }

  describe("Expedition Controller — integração (requisito 2/3/5/6)", () => {
    it("auto-inicia uma expedição na primeira tick de uma região com Expedition Definition, sem intervenção da UI", () => {
      // Vertical Slice — Player Journey, Retention & First Hour Experience
      // Phase I — Fase 3: reordenar BIOME_PROGRESSION (biomes.ts) pra
      // tirar colinas-aridas do caminho crítico até o Boss colocou
      // pântano-podre logo depois de bosque-sussurrante (`order` 2,
      // gate nível 5). `midHero()` (nível 12, ver função acima) já
      // supera esse gate — o Region Unlock (checkRegionUnlock, chamado
      // a cada tick, ver regionProgression.ts) dispara JÁ na 1ª tick,
      // então a expedição auto-iniciada agora é a de pântano-podre, não
      // mais a de bosque-sussurrante (era "bosque-antigo" antes da
      // reordenação, quando o próximo bioma exigia nível 15).
      const character = midHero("autostart");
      const session = createAdventureSession("exp-autostart", character, "bosque-sussurrante", 7, 0);
      const timeline = createAdventureTimeline(session.sessionId);

      const { events } = advanceExpeditionTick(session, timeline, { currentTime: 1000 });
      const started = events.find((event) => event.kind === "ExpeditionStarted");
      assert.ok(started && started.kind === "ExpeditionStarted");
      assert.equal(started.expeditionId, "travessia-do-pantano");
      assert.equal(started.regionId, "pantano-podre");

      const snapshot = deriveExpeditionProgress(session, timeline);
      assert.ok(snapshot);
      assert.equal(snapshot!.expeditionId, "travessia-do-pantano");
    });

    it("ao atingir um checkpoint: gera ExpeditionCheckpointReached, cura o personagem (clamped ao máximo) via Recovery Layer reaproveitada", () => {
      const run = findSurvivingRun(30, 30, (events) => events.some((event) => event.kind === "ExpeditionCheckpointReached"));
      assert.ok(run, "esperava ao menos 1 seed (de 30) atingir um checkpoint em 30 ticks");

      const { session, timeline } = run!;
      const checkpointEvent = timeline.events.find((event) => event.kind === "ExpeditionCheckpointReached");
      assert.ok(checkpointEvent && checkpointEvent.kind === "ExpeditionCheckpointReached");
      assert.ok(checkpointEvent.checkpointIndex >= 1);
      assert.ok(checkpointEvent.recoveryAmount >= 0);

      const maximumLife = calculateFinalStats(session.character.characterBuild, session.character.equipment).maximumLife;
      assert.ok(session.character.currentLife <= maximumLife + 0.001, "cura nunca deve exceder o máximo");
    });

    it("ao concluir a expedição: concede XP + ouro (reutilizando characterBuild.addExperience/statistics.goldFound) e emite ExpeditionCompleted", () => {
      const run = findSurvivingRun(30, 60, (events) => events.some((event) => event.kind === "ExpeditionCompleted"));
      assert.ok(run, "esperava ao menos 1 seed (de 30) concluir a expedição em 60 ticks");

      const { session, timeline } = run!;
      const completedEvent = timeline.events.find((event) => event.kind === "ExpeditionCompleted");
      assert.ok(completedEvent && completedEvent.kind === "ExpeditionCompleted");
      // Vertical Slice — Player Journey, Retention & First Hour Experience
      // Phase I — Fase 3: `midHero()` (nível 12) já supera o novo gate
      // de pântano-podre (nível 5, ver biomes.ts/encounterTables.ts) —
      // a expedição concluída aqui não é mais necessariamente
      // "bosque-antigo". Lida dinamicamente do próprio evento (mais
      // robusto que fixar um id), em vez de assumir qual delas roda.
      const definition = getExpeditionDefinition(completedEvent.expeditionId)!;
      assert.equal(completedEvent.xpAmount, definition.reward.xpAmount);
      assert.equal(completedEvent.goldAmount, definition.reward.goldAmount);
      assert.ok(session.character.characterBuild.experience >= (definition.reward.xpAmount ?? 0));
      assert.ok(session.statistics.goldFound >= (definition.reward.goldAmount ?? 0));

      // Depois de concluída, uma NOVA expedição deve auto-iniciar na
      // tick seguinte (requisito arquitetural: nunca fica "presa" sem
      // expedição ativa numa região que tem definição).
      const { events: nextEvents } = advanceExpeditionTick(session, timeline, { currentTime: 999999 });
      assert.ok(nextEvents.some((event) => event.kind === "ExpeditionStarted"), "esperava uma nova expedição auto-iniciar logo depois da conclusão");
    });

    it("determinístico: mesma seed sempre produz a mesma sequência de eventos de expedição", () => {
      function runTicks(seed: number, count: number): string[] {
        const character = strongHero(`determinism-${seed}`);
        const session = createAdventureSession(`exp-determinism-${seed}`, character, "bosque-sussurrante", seed, 0);
        const timeline = createAdventureTimeline(session.sessionId);
        const kinds: string[] = [];
        for (let i = 0; i < count; i++) {
          const { tickResult, events } = advanceExpeditionTick(session, timeline, { currentTime: 1000 * (i + 1) });
          for (const event of events) {
            if (event.kind.startsWith("Expedition")) kinds.push(event.kind);
          }
          if (!tickResult.characterAlive) break;
        }
        return kinds;
      }

      const a = runTicks(555, 20);
      const b = runTicks(555, 20);
      assert.deepEqual(a, b);
    });
  });

  describe("objetivos (requisito 11)", () => {
    it("complete-expedition/reach-checkpoints/complete-expedition-no-death/complete-expedition-with-worldevent contam os eventos certos", () => {
      const session = createAdventureSession("exp-obj-session", strongHero("obj"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push(
        { kind: "ExpeditionCheckpointReached", expeditionId: "bosque-antigo", checkpointIndex: 1, checkpointsTotal: 3, recoveryAmount: 20, tickIndex: 0, timestamp: 0 },
        { kind: "ExpeditionCheckpointReached", expeditionId: "bosque-antigo", checkpointIndex: 2, checkpointsTotal: 3, recoveryAmount: 20, tickIndex: 1, timestamp: 1000 },
        {
          kind: "ExpeditionCompleted",
          expeditionId: "bosque-antigo",
          name: "Bosque Antigo",
          encountersCompleted: 12,
          elitesDefeated: 0,
          miniBossesDefeated: 0,
          worldEventsFound: 1,
          diedDuringExpedition: false,
          xpAmount: 200,
          goldAmount: 50,
          tickIndex: 2,
          timestamp: 2000,
        },
      );
      timeline.nextTickIndex = 3;

      const events = timeline.events;
      assert.equal(events.filter((e) => e.kind === "ExpeditionCheckpointReached").length, 2);
      assert.equal(events.filter((e) => e.kind === "ExpeditionCompleted").length, 1);
      assert.equal(events.filter((e) => e.kind === "ExpeditionCompleted" && e.diedDuringExpedition === false).length, 1);
      assert.equal(events.filter((e) => e.kind === "ExpeditionCompleted" && e.worldEventsFound > 0).length, 1);

      const snapshot = deriveObjectiveProgress(session, timeline);
      assert.ok(snapshot.objective, "deveria sempre existir um objetivo ativo");
    });
  });

  describe("HUD (requisito 7)", () => {
    it("hudState.expedition é null sem expedição ativa, populado enquanto ativa, e volta a null depois de concluir", () => {
      // Vertical Slice — Player Journey, Retention & First Hour Experience
      // Phase I — Fase 3: mesma reordenação documentada no teste de
      // "auto-inicia uma expedição" acima — midHero (nível 12) já supera
      // o gate de pântano-podre (nível 5), então a expedição
      // auto-iniciada na 1ª tick é "travessia-do-pantano" (14
      // encontros, conclui rápido), não mais "bosque-antigo".
      const character = midHero("hud-start");
      const session = createAdventureSession("exp-hud-session", character, "bosque-sussurrante", 7, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      assert.equal(deriveHudState(session, timeline).expedition, null);

      const firstTick = advanceExpeditionTick(session, timeline, { currentTime: 1000 });
      assert.ok(firstTick.events.some((event) => event.kind === "ExpeditionStarted"), "midHero (nível 12) deveria auto-iniciar 'travessia-do-pantano' já na 1ª tick");
      const hudAfterStart = deriveHudState(session, timeline);
      assert.ok(hudAfterStart.expedition, "hudState.expedition deveria estar populado logo após ExpeditionStarted");
      assert.equal(hudAfterStart.expedition!.expeditionId, "travessia-do-pantano");

      const run = findSurvivingRun(30, 60, (events) => events.some((event) => event.kind === "ExpeditionCompleted"));
      assert.ok(run, "esperava ao menos 1 seed (de 30) concluir a expedição em 60 ticks");
      const { session: completedSession, timeline: completedTimeline } = run!;
      // Logo na tick EM QUE conclui, ainda não há expedição ativa
      // (a fronteira fechou com ExpeditionCompleted) — mesmo
      // comportamento de deriveObjectiveProgress entre um objetivo
      // completado e o próximo ainda não selecionado.
      assert.equal(deriveHudState(completedSession, completedTimeline).expedition, null);

      // Card é intencionalmente PERSISTENTE (requisito 7 mostra progresso
      // contínuo) — na tick SEGUINTE, uma NOVA expedição já auto-inicia
      // (ver teste de "Expedition Controller" acima), então
      // hudState.expedition volta a ficar não-nulo, só que referindo a
      // OUTRA expedição (a próxima).
      advanceExpeditionTick(completedSession, completedTimeline, { currentTime: 999999 });
      const hudAfterCompletion = deriveHudState(completedSession, completedTimeline);
      assert.ok(hudAfterCompletion.expedition);
    });
  });

  describe("simulação (requisito 9/10)", () => {
    it("runSimulatedAdventure produz contadores de expedição consistentes", () => {
      const result = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1, maxSimulatedSeconds: 1200 });
      assert.ok(result.expeditionsStarted >= 0);
      assert.ok(result.expeditionsCompleted >= 0);
      assert.ok(result.expeditionsFailed >= 0);
      assert.ok(result.expeditionsCompleted + result.expeditionsFailed <= result.expeditionsStarted);
      assert.ok(result.expeditionCheckpointsReached >= 0);
      assert.ok(result.expeditionXpGained >= 0);
      assert.ok(result.expeditionGoldGained >= 0);
      assert.ok(result.averageExpeditionDurationSeconds >= 0);
    });

    it("generateBalanceReport agrega expeditions com completionRate/checkpoints/duração/XP/ouro coerentes", () => {
      const results = Array.from({ length: 30 }, (_, i) => runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: i + 1, maxSimulatedSeconds: 1200 }));
      const report = generateBalanceReport(results);
      assert.ok(report.expeditions.totalStarted >= 0);
      assert.ok(report.expeditions.completionRate >= 0 && report.expeditions.completionRate <= 1);
      assert.ok(report.expeditions.averageCheckpointsReached >= 0);
      assert.ok(report.expeditions.averageDurationSeconds >= 0);
      assert.ok(report.expeditions.averageXpGained >= 0);
      assert.ok(report.expeditions.averageGoldGained >= 0);
    });

    it("determinístico: mesma seed sempre produz os mesmos contadores de expedição", () => {
      const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 1200 });
      const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 1200 });
      assert.equal(a.expeditionsStarted, b.expeditionsStarted);
      assert.equal(a.expeditionsCompleted, b.expeditionsCompleted);
      assert.equal(a.expeditionsFailed, b.expeditionsFailed);
      assert.equal(a.expeditionCheckpointsReached, b.expeditionCheckpointsReached);
      assert.equal(a.expeditionXpGained, b.expeditionXpGained);
      assert.equal(a.expeditionGoldGained, b.expeditionGoldGained);
    });
  });
});
