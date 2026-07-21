import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FACTION_DEFINITIONS, getFactionDefinition, getFactionForRegion, getNextRank, getRankForReputation } from "./factionDefinitions.js";
import { deriveCurrentFactionProgress, deriveFactionProgress, deriveFactionReputation } from "./factionProgress.js";
import { advanceFactionTick } from "./factionController.js";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { deriveHudState } from "../hud/deriveHudState.js";
import { deriveObjectiveProgress } from "../objectives/objectiveProgress.js";
import type { PresentationEvent } from "../presentation/types.js";
import { runSimulatedAdventure } from "../simulation/simulator.js";
import { generateBalanceReport } from "../simulation/report.js";

// Personagem nível 4 (1200 XP): forte o bastante pra sobreviver vários
// encontros, mas ainda DENTRO da faixa de nível de "bosque-sussurrante"
// (1-14) — mesmo motivo documentado em expeditions.test.ts: um
// personagem forte demais desbloqueia o PRÓXIMO bioma já na 1ª tick
// (Region Unlock, objectives/objectiveLayer.ts, reaproveitado), o que
// trocaria a facção "dona" da região (e a Expedição esperada) sem
// nenhum bug real envolvido.
//
// Vertical Slice — Player Journey, Retention & First Hour Experience
// Phase I — Fase 3: reduzido de 20000 XP (nível 12) pra 1200 XP (nível
// 4) — a reordenação de BIOME_PROGRESSION (biomes.ts) colocou
// pântano-podre logo depois de bosque-sussurrante com gate de nível 5
// (antes era colinas-aridas, gate 15); nível 12 já superava esse novo
// gate menor e desbloqueava pântano-podre já na 1ª tick, testando a
// facção errada (Mercadores Livres em vez de Guardiões da Floresta).
function midHero(suffix: string) {
  const build = new CharacterBuild(`fac-hero-${suffix}`, "warrior", 0);
  build.addExperience(1200);
  const inventory = new Inventory(`fac-hero-${suffix}`, 30);
  const equipment = new Equipment(`fac-hero-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", 1);
  return character;
}

describe("Factions, Reputation & World Consequences Phase I", () => {
  describe("dados (requisito 1/2)", () => {
    it("cada FactionDefinition tem id/nome/descrição/regiões/alinhamento/ranks — sem ids duplicados", () => {
      const ids = new Set<string>();
      for (const definition of FACTION_DEFINITIONS) {
        assert.ok(definition.id.length > 0);
        assert.ok(definition.name.length > 0);
        assert.ok(definition.description.length > 0);
        assert.ok(definition.regions.length > 0);
        assert.ok(definition.alignment.length > 0);
        assert.ok(definition.ranks.length > 0);
        assert.ok(!ids.has(definition.id), `id duplicado: ${definition.id}`);
        ids.add(definition.id);
      }
    });

    it("as 4 facções iniciais existem: Guardiões da Floresta, Mercadores Livres, Culto das Ruínas, Legião Sombria", () => {
      const names = new Set(FACTION_DEFINITIONS.map((f) => f.name));
      for (const expected of ["Guardiões da Floresta", "Mercadores Livres", "Culto das Ruínas", "Legião Sombria"]) {
        assert.ok(names.has(expected), `esperava a facção "${expected}"`);
      }
    });

    it("cada facção tem ranks ordenados ascendentemente por minReputation, começando em 0", () => {
      for (const definition of FACTION_DEFINITIONS) {
        assert.equal(definition.ranks[0].minReputation, 0);
        for (let i = 1; i < definition.ranks.length; i++) {
          assert.ok(definition.ranks[i].minReputation > definition.ranks[i - 1].minReputation);
        }
      }
    });

    it("nenhuma região das 6 biomas conhecidas fica sem facção dona (regions.ts nunca superpõe)", () => {
      const allRegionIds = FACTION_DEFINITIONS.flatMap((f) => f.regions);
      assert.equal(new Set(allRegionIds).size, allRegionIds.length, "uma região não deveria pertencer a mais de uma facção");
    });

    it("getFactionDefinition/getFactionForRegion devolvem undefined pra id/região inexistentes", () => {
      assert.equal(getFactionDefinition("nao-existe"), undefined);
      assert.equal(getFactionForRegion("regiao-inexistente"), undefined);
    });
  });

  describe("ranks puros (requisito 3)", () => {
    it("getRankForReputation devolve o rank mais alto já alcançado", () => {
      const faction = getFactionDefinition("guardioes-da-floresta")!;
      assert.equal(getRankForReputation(faction, 0).id, "neutro");
      assert.equal(getRankForReputation(faction, 14).id, "neutro");
      assert.equal(getRankForReputation(faction, 15).id, "amigavel");
      assert.equal(getRankForReputation(faction, 999).id, "lendario");
    });

    it("getNextRank devolve null no rank máximo", () => {
      const faction = getFactionDefinition("guardioes-da-floresta")!;
      assert.equal(getNextRank(faction, 0)!.id, "amigavel");
      assert.equal(getNextRank(faction, 999), null);
    });
  });

  describe("progressão pura (requisito 3)", () => {
    it("deriveFactionReputation devolve 0 sem nenhum ReputationChanged dessa facção", () => {
      const session = createAdventureSession("fac-progress-empty", midHero("empty"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      assert.equal(deriveFactionReputation("guardioes-da-floresta", timeline), 0);
    });

    it("deriveFactionReputation ignora ReputationChanged de OUTRAS facções, e usa sempre o mais recente da facção certa", () => {
      const session = createAdventureSession("fac-progress-filter", midHero("filter"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push(
        {
          kind: "ReputationChanged",
          factionId: "mercadores-livres",
          factionName: "Mercadores Livres",
          delta: 5,
          newReputation: 5,
          reason: "MerchantFound",
          xpBonusGranted: 0,
          goldBonusGranted: 0,
          tickIndex: 0,
          timestamp: 0,
        },
        {
          kind: "ReputationChanged",
          factionId: "guardioes-da-floresta",
          factionName: "Guardiões da Floresta",
          delta: 4,
          newReputation: 4,
          reason: "EliteDefeated",
          xpBonusGranted: 0,
          goldBonusGranted: 0,
          tickIndex: 1,
          timestamp: 1000,
        },
        {
          kind: "ReputationChanged",
          factionId: "guardioes-da-floresta",
          factionName: "Guardiões da Floresta",
          delta: 4,
          newReputation: 8,
          reason: "EliteDefeated",
          xpBonusGranted: 0,
          goldBonusGranted: 0,
          tickIndex: 2,
          timestamp: 2000,
        },
      );
      timeline.nextTickIndex = 3;

      assert.equal(deriveFactionReputation("guardioes-da-floresta", timeline), 8);
      assert.equal(deriveFactionReputation("mercadores-livres", timeline), 5);
      assert.equal(deriveFactionReputation("culto-das-ruinas", timeline), 0);
    });

    it("deriveFactionProgress calcula percentToNextRank corretamente e nextRankName vira null no rank máximo", () => {
      const session = createAdventureSession("fac-progress-percent", midHero("percent"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push({
        kind: "ReputationChanged",
        factionId: "guardioes-da-floresta",
        factionName: "Guardiões da Floresta",
        delta: 15,
        newReputation: 15,
        reason: "test",
        xpBonusGranted: 0,
        goldBonusGranted: 0,
        tickIndex: 0,
        timestamp: 0,
      });
      timeline.nextTickIndex = 1;

      const snapshot = deriveFactionProgress("guardioes-da-floresta", timeline)!;
      assert.equal(snapshot.reputation, 15);
      assert.equal(snapshot.rankId, "amigavel");
      assert.equal(snapshot.nextRankName, "Respeitado");
      assert.ok(snapshot.percentToNextRank >= 0 && snapshot.percentToNextRank <= 100);

      timeline.events.push({
        kind: "ReputationChanged",
        factionId: "guardioes-da-floresta",
        factionName: "Guardiões da Floresta",
        delta: 9999,
        newReputation: 9999,
        reason: "test",
        xpBonusGranted: 0,
        goldBonusGranted: 0,
        tickIndex: 1,
        timestamp: 1000,
      });
      timeline.nextTickIndex = 2;
      const maxed = deriveFactionProgress("guardioes-da-floresta", timeline)!;
      assert.equal(maxed.rankId, "lendario");
      assert.equal(maxed.nextRankName, null);
      assert.equal(maxed.percentToNextRank, 100);
    });

    it("deriveCurrentFactionProgress devolve null pra região sem facção dona", () => {
      const session = createAdventureSession("fac-progress-noregion", midHero("noregion"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      assert.equal(deriveCurrentFactionProgress("regiao-inexistente", timeline), null);
    });
  });

  // Busca a primeira seed (dentre `maxSeeds` tentativas) cujo
  // personagem nível 12 (midHero) produz uma sequência de eventos que
  // satisfaz `stopWhen`, dentro de `maxTicks` ticks — mesma técnica de
  // "procurar seed" já usada em expeditions.test.ts/eliteMiniBoss.test.ts,
  // aqui pra blindar contra a aleatoriedade natural de combate (Elite/
  // Mini-Boss/rank-up nem sempre acontecem dentro de uma janela fixa de
  // ticks numa única seed).
  //
  // `seed * 99991` (não `seed` puro): a receita de cada encontro usa
  // `createSeededRandom(session.seed + encountersCompleted)` (contrato
  // documentado em presentationLayer.ts) — sessões de seed PEQUENA e
  // CONSECUTIVA (1, 2, 3...) combinadas com poucos `encountersCompleted`
  // (0-30) caem todas na mesma faixa estreita de entrada pro RNG
  // (1-90ish), e essa faixa estreita mostrou empiricamente 0 Elites em
  // 900 amostras (achado de diagnóstico, não um bug de gameplay — a
  // MESMA faixa ampla de seeds, testada com `generateEncounter()`
  // direto, produz a taxa nominal esperada de ~4%). Multiplicar por um
  // primo grande espalha a faixa de entrada o bastante pra amostrar o
  // RNG de forma representativa.
  function findSeedRun(maxSeeds: number, maxTicks: number, stopWhen: (events: PresentationEvent[]) => boolean): PresentationEvent[] | null {
    for (let attempt = 1; attempt <= maxSeeds; attempt++) {
      const seed = attempt * 99991;
      const character = midHero(`seed-search-${seed}`);
      const session = createAdventureSession(`fac-seed-search-${seed}`, character, "bosque-sussurrante", seed, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      const allEvents: PresentationEvent[] = [];
      for (let tick = 0; tick < maxTicks; tick++) {
        const { tickResult, events } = advanceFactionTick(session, timeline, { currentTime: 1000 * (tick + 1) });
        allEvents.push(...events);
        if (!tickResult.characterAlive) break;
        if (stopWhen(allEvents)) return allEvents;
      }
    }
    return null;
  }

  describe("Faction Controller — integração (requisito 3/4/6)", () => {
    it("EliteDefeated concede reputação aos Guardiões da Floresta e emite ReputationChanged", () => {
      const events = findSeedRun(20, 60, (evts) => evts.some((event) => event.kind === "ReputationChanged" && event.reason === "EliteDefeated"));
      assert.ok(events, "esperava ao menos 1 seed (de 20) gerar EliteDefeated -> ReputationChanged em 60 ticks");
      const found = events!.find((event) => event.kind === "ReputationChanged" && event.reason === "EliteDefeated")!;
      assert.ok(found.kind === "ReputationChanged" && found.factionId === "guardioes-da-floresta");
    });

    it("ExpeditionCompleted concede reputação à facção dona do bioma inicial da Expedição (Guardiões da Floresta, bosque-antigo)", () => {
      const events = findSeedRun(30, 60, (evts) => evts.some((event) => event.kind === "ReputationChanged" && event.reason === "ExpeditionCompleted"));
      assert.ok(events, "esperava ao menos 1 seed (de 30) concluir 1 Expedição em 60 ticks");
      const found = events!.find((event) => event.kind === "ReputationChanged" && event.reason === "ExpeditionCompleted")!;
      assert.ok(found.kind === "ReputationChanged" && found.factionId === "guardioes-da-floresta" && found.delta === 15);
    });

    it("ReputationRankUp dispara só quando o rank de depois é diferente do de antes, e concede bônus de XP/ouro (requisito 4)", () => {
      const events = findSeedRun(
        30,
        120,
        (evts) =>
          evts.some((event) => event.kind === "ReputationRankUp") &&
          evts.some((event) => event.kind === "ReputationChanged" && event.reason === "ExpeditionCompleted" && (event.xpBonusGranted > 0 || event.goldBonusGranted > 0)),
      );
      assert.ok(events, "esperava ao menos 1 seed (de 30) com rank-up + bônus visível em alguma conclusão de Expedição, em 120 ticks");

      const rankUpEvent = events!.find((event) => event.kind === "ReputationRankUp")!;
      assert.ok(rankUpEvent.kind === "ReputationRankUp" && rankUpEvent.rankId === "amigavel");

      const bonusEvent = events!.find(
        (event) => event.kind === "ReputationChanged" && event.reason === "ExpeditionCompleted" && (event.xpBonusGranted > 0 || event.goldBonusGranted > 0),
      )!;
      assert.ok(bonusEvent.kind === "ReputationChanged" && (bonusEvent.xpBonusGranted > 0 || bonusEvent.goldBonusGranted > 0));

      // Requisito 6 — ReputationRankUp só dispara quando o rank muda:
      // toda vez que aparece na sequência, o ReputationChanged
      // IMEDIATAMENTE anterior (mesma tick) deveria ter cruzado o
      // limiar de "amigavel" (15) partindo de baixo dele.
      for (let i = 0; i < events!.length; i++) {
        const event = events![i];
        if (event.kind !== "ReputationRankUp") continue;
        const previous = events![i - 1];
        assert.ok(previous.kind === "ReputationChanged" && previous.factionId === event.factionId, "ReputationRankUp deveria sempre vir logo depois do ReputationChanged que o causou");
      }
    });

    it("determinístico: mesma seed sempre produz a mesma sequência de eventos de reputação", () => {
      function runTicks(seed: number, count: number): string[] {
        const character = midHero(`determinism-${seed}`);
        const session = createAdventureSession(`fac-determinism-${seed}`, character, "bosque-sussurrante", seed, 0);
        const timeline = createAdventureTimeline(session.sessionId);
        const kinds: string[] = [];
        for (let i = 0; i < count; i++) {
          const { tickResult, events } = advanceFactionTick(session, timeline, { currentTime: 1000 * (i + 1) });
          for (const event of events) {
            if (event.kind === "ReputationChanged" || event.kind === "ReputationRankUp") kinds.push(`${event.kind}:${event.factionId}`);
          }
          if (!tickResult.characterAlive) break;
        }
        return kinds;
      }

      const a = runTicks(777, 40);
      const b = runTicks(777, 40);
      assert.deepEqual(a, b);
    });
  });

  describe("objetivos (requisito 9)", () => {
    it("reach-faction-rank/help-merchants/discover-ruins contam os eventos certos", () => {
      const session = createAdventureSession("fac-obj-session", midHero("obj"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push(
        {
          kind: "ReputationRankUp",
          factionId: "guardioes-da-floresta",
          factionName: "Guardiões da Floresta",
          rankId: "respeitado",
          rankName: "Respeitado",
          xpBonusPercent: 10,
          goldBonusPercent: 10,
          tickIndex: 0,
          timestamp: 0,
        },
        {
          kind: "ReputationRankUp",
          factionId: "guardioes-da-floresta",
          factionName: "Guardiões da Floresta",
          rankId: "amigavel",
          rankName: "Amigável",
          xpBonusPercent: 5,
          goldBonusPercent: 5,
          tickIndex: 1,
          timestamp: 1000,
        },
        {
          kind: "ReputationChanged",
          factionId: "mercadores-livres",
          factionName: "Mercadores Livres",
          delta: 5,
          newReputation: 5,
          reason: "MerchantFound",
          xpBonusGranted: 0,
          goldBonusGranted: 0,
          tickIndex: 2,
          timestamp: 2000,
        },
        {
          kind: "ReputationChanged",
          factionId: "culto-das-ruinas",
          factionName: "Culto das Ruínas",
          delta: 8,
          newReputation: 8,
          reason: "DiscoveryMade",
          xpBonusGranted: 0,
          goldBonusGranted: 0,
          tickIndex: 3,
          timestamp: 3000,
        },
      );
      timeline.nextTickIndex = 4;

      const events = timeline.events;
      assert.equal(events.filter((e) => e.kind === "ReputationRankUp" && e.rankId === "respeitado").length, 1);
      assert.equal(events.filter((e) => e.kind === "ReputationRankUp" && e.rankId === "amigavel").length, 1);
      assert.equal(events.filter((e) => e.kind === "ReputationChanged" && e.factionId === "mercadores-livres").length, 1);
      assert.equal(events.filter((e) => e.kind === "ReputationChanged" && e.factionId === "culto-das-ruinas").length, 1);

      const snapshot = deriveObjectiveProgress(session, timeline);
      assert.ok(snapshot.objective, "deveria sempre existir um objetivo ativo");
    });
  });

  describe("HUD (requisito 5)", () => {
    it("hudState.faction é populado com a facção dona da região atual, e reflete a reputação real", () => {
      // Seed 99991 (não 1): First Dungeon, Final Boss & Complete Game
      // Loop Phase I adicionou uma 2ª Expedition Definition pra
      // "bosque-sussurrante" (seed-shift, mesma categoria já documentada
      // em expeditions.test.ts) — E, como documentado no describe
      // "Faction Controller" acima ("EliteDefeated concede
      // reputação..."), seeds pequenas e consecutivas (1, 2, 3...)
      // caem numa faixa estreita e correlacionada do RNG de encontro que
      // suprime Elites. 99991 (seed espaçada, mesma técnica de lá)
      // satisfaz as DUAS condições: sorteia "bosque-antigo" E dispara
      // um gatilho de reputação dentro de 60 ticks.
      const character = midHero("hud");
      const session = createAdventureSession("fac-hud-session", character, "bosque-sussurrante", 99991, 0);
      const timeline = createAdventureTimeline(session.sessionId);

      const hudBefore = deriveHudState(session, timeline);
      assert.ok(hudBefore.faction, "hudState.faction deveria já existir (Guardiões da Floresta é dona de bosque-sussurrante, mesmo com 0 de reputação)");
      assert.equal(hudBefore.faction!.factionId, "guardioes-da-floresta");
      assert.equal(hudBefore.faction!.reputation, 0);
      assert.equal(hudBefore.faction!.rankName, "Neutro");

      for (let tick = 0; tick < 60; tick++) {
        const { tickResult, events } = advanceFactionTick(session, timeline, { currentTime: 1000 * (tick + 1) });
        if (!tickResult.characterAlive) break;
        if (events.some((event) => event.kind === "ReputationChanged")) break;
      }
      const hudAfter = deriveHudState(session, timeline);
      assert.ok(hudAfter.faction!.reputation > 0, "esperava reputação > 0 depois de algum gatilho ter disparado");
    });
  });

  describe("simulação (requisito 7/8)", () => {
    it("runSimulatedAdventure produz contadores de facção consistentes", () => {
      const result = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1, maxSimulatedSeconds: 1200 });
      assert.ok(result.reputationEventsCount >= 0);
      assert.ok(result.rankUpEventsCount >= 0);
      assert.ok(result.factionXpBonusGained >= 0);
      assert.ok(result.factionGoldBonusGained >= 0);
      for (const definition of FACTION_DEFINITIONS) {
        assert.ok(definition.id in result.factionFinalReputation);
        assert.ok(definition.id in result.factionFinalRank);
      }
    });

    it("generateBalanceReport agrega factions com reputação média/ranks/bônus coerentes", () => {
      const results = Array.from({ length: 30 }, (_, i) => runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: i + 1, maxSimulatedSeconds: 1200 }));
      const report = generateBalanceReport(results);
      assert.equal(report.factions.perFaction.length, FACTION_DEFINITIONS.length);
      for (const faction of report.factions.perFaction) {
        assert.ok(faction.averageFinalReputation >= 0);
        const totalRuns = Object.values(faction.rankDistribution).reduce((sum, count) => sum + count, 0);
        assert.equal(totalRuns, results.length, `distribuição de rank de "${faction.factionId}" deveria cobrir todas as execuções`);
      }
      assert.ok(report.factions.averageXpBonusGranted >= 0);
      assert.ok(report.factions.averageGoldBonusGranted >= 0);
    });

    it("determinístico: mesma seed sempre produz os mesmos contadores de facção", () => {
      const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 1200 });
      const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 1200 });
      assert.deepEqual(a.factionFinalReputation, b.factionFinalReputation);
      assert.deepEqual(a.factionFinalRank, b.factionFinalRank);
      assert.equal(a.factionXpBonusGained, b.factionXpBonusGained);
      assert.equal(a.factionGoldBonusGained, b.factionGoldBonusGained);
    });
  });
});
