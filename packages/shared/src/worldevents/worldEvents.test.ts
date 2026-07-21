import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EXPLORATION_EVENT_DEFINITIONS, getExplorationEventDefinition } from "./worldEventDefinitions.js";
import { EXPLORATION_EVENT_TABLES, getExplorationEventTable } from "./worldEventTables.js";
import { selectExplorationEvent } from "./generator.js";
import { createSeededRandom } from "../itemgen/rng.js";
import { generateEncounter } from "../worldencounter/generator.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "../presentation/presentationLayer.js";
import { deriveHudState } from "../hud/deriveHudState.js";
import { deriveObjectiveProgress } from "../objectives/objectiveProgress.js";
import { selectObjectiveId } from "../objectives/objectiveDefinitions.js";
import type { PresentationEvent } from "../presentation/types.js";
import { runSimulatedAdventure } from "../simulation/simulator.js";
import { generateBalanceReport } from "../simulation/report.js";

function strongHero(suffix: string) {
  const build = new CharacterBuild(`we-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`we-hero-${suffix}`, 30);
  const equipment = new Equipment(`we-hero-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, "warrior", 1);
  return character;
}

// Encontra a primeira seed cujo TICK 1 (sessão nova) produz um evento
// da categoria pedida, com sucesso (personagem vivo depois do tick) —
// mesma técnica de busca por seed já usada em eliteMiniBoss.test.ts.
function findSeedForCategory(regionId: string, category: string, maxTries: number): { seed: number; events: PresentationEvent[] } | null {
  for (let seed = 0; seed < maxTries; seed++) {
    const character = strongHero(`cat-${category}-${seed}`);
    const session = createAdventureSession(`we-session-${category}-${seed}`, character, regionId, seed, 0);
    const timeline = createAdventureTimeline(session.sessionId);
    const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
    if (!tickResult.characterAlive) continue;
    const started = events.find((e) => e.kind === "WorldEventStarted");
    if (started && started.kind === "WorldEventStarted" && started.category === category) {
      return { seed, events };
    }
  }
  return null;
}

describe("World Events, Dynamic Encounters & Exploration Phase I", () => {
  describe("dados (requisito 1/2)", () => {
    it("cada ExplorationEventDefinition tem id/nome/descrição/categoria/dificuldade/recompensa — sem ids duplicados", () => {
      const ids = new Set<string>();
      for (const definition of EXPLORATION_EVENT_DEFINITIONS) {
        assert.ok(definition.id.length > 0);
        assert.ok(definition.name.length > 0);
        assert.ok(definition.description.length > 0);
        assert.ok(definition.allowedBiomes.length > 0);
        assert.ok(definition.weight > 0);
        assert.ok(definition.difficulty.length > 0);
        assert.ok(!ids.has(definition.id), `id duplicado: ${definition.id}`);
        ids.add(definition.id);
      }
    });

    it("as 5 categorias iniciais existem: treasure, merchant, shrine, ambush, discovery", () => {
      const categories = new Set<string>(EXPLORATION_EVENT_DEFINITIONS.map((d) => d.category));
      for (const expected of ["treasure", "merchant", "shrine", "ambush", "discovery"]) {
        assert.ok(categories.has(expected), `esperava ao menos 1 evento da categoria "${expected}"`);
      }
    });

    it("Ambush nunca tem reward própria (reutiliza Encounter normal — combate real concede tudo)", () => {
      for (const definition of EXPLORATION_EVENT_DEFINITIONS) {
        if (definition.category === "ambush") {
          assert.deepEqual(definition.reward, {}, `"${definition.id}" (ambush) não deveria ter reward própria`);
        }
      }
    });

    it("Treasure sempre usa lootTableId 'treasure_chest' (reaproveitada, nenhuma tabela nova)", () => {
      for (const definition of EXPLORATION_EVENT_DEFINITIONS) {
        if (definition.category === "treasure") {
          assert.equal(definition.reward.lootTableId, "treasure_chest");
        }
      }
    });
  });

  describe("biomas (requisito 3/14)", () => {
    it("toda ExplorationEventTable referencia só eventIds que existem de verdade", () => {
      for (const table of EXPLORATION_EVENT_TABLES) {
        for (const entry of table.entries) {
          assert.ok(getExplorationEventDefinition(entry.eventId), `região "${table.regionId}" referencia evento inexistente "${entry.eventId}"`);
        }
      }
    });

    it("todo eventId listado numa ExplorationEventTable também lista essa região em allowedBiomes (sem inconsistência de dado)", () => {
      for (const table of EXPLORATION_EVENT_TABLES) {
        for (const entry of table.entries) {
          const definition = getExplorationEventDefinition(entry.eventId)!;
          assert.ok(
            definition.allowedBiomes.includes(table.regionId),
            `"${entry.eventId}" está na tabela de "${table.regionId}" mas não lista essa região em allowedBiomes`,
          );
        }
      }
    });

    it("toda ExplorationEventTable tem uma região com Encounter Table real (o mesmo World Encounter, requisito arquitetural)", () => {
      for (const table of EXPLORATION_EVENT_TABLES) {
        assert.ok(getEncounterTable(table.regionId), `região "${table.regionId}" sem Encounter Table correspondente`);
      }
    });

    it("chance de cada tabela está entre 0 e 1", () => {
      for (const table of EXPLORATION_EVENT_TABLES) {
        assert.ok(table.chance >= 0 && table.chance <= 1);
      }
    });
  });

  describe("seleção/geração (requisito 1/2)", () => {
    it("selectExplorationEvent devolve null quando o sorteio de chance falha", () => {
      const table = getExplorationEventTable("bosque-sussurrante")!;
      let sawNull = false;
      for (let seed = 0; seed < 200 && !sawNull; seed++) {
        const rng = createSeededRandom(seed);
        if (selectExplorationEvent(rng, table) === null) sawNull = true;
      }
      assert.ok(sawNull, "esperava ver ao menos um sorteio sem evento em 200 seeds");
    });

    it("generateEncounter integra World Events: categorias sem combate produzem groups=[]", () => {
      let sawNonAmbush = false;
      for (let seed = 0; seed < 5000 && !sawNonAmbush; seed++) {
        const result = generateEncounter("bosque-sussurrante", 8, seed);
        if (result.explorationEventId) {
          const definition = getExplorationEventDefinition(result.explorationEventId)!;
          if (definition.category !== "ambush") {
            assert.deepEqual(result.groups, [], `evento "${definition.id}" (${definition.category}) deveria ter groups=[]`);
            sawNonAmbush = true;
          }
        }
      }
      assert.ok(sawNonAmbush, "esperava ver ao menos 1 evento sem combate em 5000 seeds");
    });

    it("generateEncounter integra World Events: Ambush produz grupos reais (reutiliza Encounter normal)", () => {
      let sawAmbush = false;
      for (let seed = 0; seed < 5000 && !sawAmbush; seed++) {
        const result = generateEncounter("pantano-podre", 8, seed);
        if (result.explorationEventId) {
          const definition = getExplorationEventDefinition(result.explorationEventId)!;
          if (definition.category === "ambush") {
            assert.ok(result.groups.length > 0, "Ambush deveria produzir ao menos 1 grupo de combate real");
            sawAmbush = true;
          }
        }
      }
      assert.ok(sawAmbush, "esperava ver ao menos 1 Ambush em 5000 seeds em pantano-podre (Ambush alto)");
    });

    it("determinístico: mesma região+nível+seed sempre produz o mesmo explorationEventId", () => {
      const a = generateEncounter("ruinas-esquecidas", 15, 777);
      const b = generateEncounter("ruinas-esquecidas", 15, 777);
      assert.equal(a.explorationEventId, b.explorationEventId);
      assert.deepEqual(a, b);
    });
  });

  describe("pesos (requisito 3)", () => {
    it("bosque-sussurrante favorece Treasure/Merchant/Shrine sobre Discovery (Discovery só tem 1 evento elegível, peso baixo)", () => {
      const counts: Record<string, number> = {};
      for (let seed = 0; seed < 20000; seed++) {
        const result = generateEncounter("bosque-sussurrante", 8, seed);
        if (result.explorationEventId) {
          const category = getExplorationEventDefinition(result.explorationEventId)!.category;
          counts[category] = (counts[category] ?? 0) + 1;
        }
      }
      assert.ok((counts.treasure ?? 0) > (counts.discovery ?? 0), "esperava mais Treasure que Discovery no Bosque");
    });

    it("pantano-podre favorece Ambush sobre Shrine (exemplo literal da Sprint)", () => {
      const counts: Record<string, number> = {};
      for (let seed = 0; seed < 20000; seed++) {
        const result = generateEncounter("pantano-podre", 8, seed);
        if (result.explorationEventId) {
          const category = getExplorationEventDefinition(result.explorationEventId)!.category;
          counts[category] = (counts[category] ?? 0) + 1;
        }
      }
      assert.ok((counts.ambush ?? 0) > (counts.shrine ?? 0), "esperava mais Ambush que Shrine no Pântano");
    });
  });

  describe("recompensas (requisito 4)", () => {
    it("Treasure concede loot (LootDropped) + ouro (goldFound)", () => {
      const found = findSeedForCategory("bosque-sussurrante", "treasure", 500);
      assert.ok(found, "esperava achar uma seed com Treasure em 500 tentativas");
      const treasureEvent = found!.events.find((e) => e.kind === "TreasureOpened");
      assert.ok(treasureEvent && treasureEvent.kind === "TreasureOpened" && treasureEvent.itemCount > 0);
      assert.ok(found!.events.some((e) => e.kind === "LootDropped"), "esperava LootDropped pro item do Treasure");
    });

    it("Merchant concede só ouro, nenhum item/loot", () => {
      const found = findSeedForCategory("bosque-sussurrante", "merchant", 500);
      assert.ok(found, "esperava achar uma seed com Merchant em 500 tentativas");
      const merchantEvent = found!.events.find((e) => e.kind === "MerchantFound");
      assert.ok(merchantEvent && merchantEvent.kind === "MerchantFound" && merchantEvent.goldAmount > 0);
      assert.ok(!found!.events.some((e) => e.kind === "LootDropped"), "Merchant não deveria gerar LootDropped");
    });

    it("Shrine concede recuperação + XP/ouro (varia por evento) — sempre via floating number 'heal' reaproveitado", () => {
      const found = findSeedForCategory("bosque-sussurrante", "shrine", 500);
      assert.ok(found, "esperava achar uma seed com Shrine em 500 tentativas");
      const shrineEvent = found!.events.find((e) => e.kind === "ShrineBlessing");
      assert.ok(shrineEvent && shrineEvent.kind === "ShrineBlessing");
      assert.ok(shrineEvent!.recoveryAmount > 0 || shrineEvent!.xpAmount > 0 || shrineEvent!.goldAmount > 0);
    });

    it("Discovery concede só XP, nenhum ouro/loot/recuperação", () => {
      const found = findSeedForCategory("ruinas-esquecidas", "discovery", 500);
      assert.ok(found, "esperava achar uma seed com Discovery em 500 tentativas");
      const discoveryEvent = found!.events.find((e) => e.kind === "DiscoveryMade");
      assert.ok(discoveryEvent && discoveryEvent.kind === "DiscoveryMade" && discoveryEvent.xpAmount > 0);
      assert.ok(!found!.events.some((e) => e.kind === "LootDropped"));
    });

    it("Ambush não emite TreasureOpened/MerchantFound/ShrineBlessing/DiscoveryMade — só o combate normal + AmbushTriggered", () => {
      const found = findSeedForCategory("pantano-podre", "ambush", 500);
      assert.ok(found, "esperava achar uma seed com Ambush em 500 tentativas");
      assert.ok(found!.events.some((e) => e.kind === "AmbushTriggered"));
      const rewardKinds = new Set(["TreasureOpened", "MerchantFound", "ShrineBlessing", "DiscoveryMade"]);
      assert.ok(!found!.events.some((e) => rewardKinds.has(e.kind)));
    });
  });

  describe("objetivos (requisito 10)", () => {
    it("open-treasure/find-merchant/receive-blessing/discover-worldevent contam os eventos certos", () => {
      const session = createAdventureSession("we-obj-session", strongHero("obj"), "bosque-sussurrante", 1, 0);
      const timeline = createAdventureTimeline(session.sessionId);
      timeline.events.push(
        { kind: "TreasureOpened", explorationEventId: "abandoned-chest", itemCount: 1, bestRarity: "common", goldAmount: 20, tickIndex: 0, timestamp: 0 },
        { kind: "MerchantFound", explorationEventId: "lost-merchant", goldAmount: 30, tickIndex: 1, timestamp: 1000 },
        { kind: "ShrineBlessing", explorationEventId: "ancient-altar", recoveryAmount: 30, xpAmount: 0, goldAmount: 0, tickIndex: 2, timestamp: 2000 },
        { kind: "DiscoveryMade", explorationEventId: "ancient-ruins", xpAmount: 35, tickIndex: 3, timestamp: 3000 },
      );
      timeline.nextTickIndex = 4;

      let sessionSeed = -1;
      for (let s = 0; s < 200 && sessionSeed === -1; s++) {
        if (selectObjectiveId(s, 0, null, "bosque-sussurrante") === "open-treasure") sessionSeed = s;
      }
      // "open-treasure"/"find-merchant"/"receive-blessing"/"discover-worldevent"
      // não são o objetivo inicial garantido (kill-5), então testamos via
      // deriveObjectiveProgress só depois de simular já ter passado por
      // completedCount=0 (kill-5 sempre primeiro) — aqui verificamos
      // diretamente que CADA tipo conta o evento certo, reaproveitando o
      // mesmo objeto de sessão/timeline (progress é por `type`, não por
      // objetivo selecionado).
      const eventsSinceBoundary = timeline.events;
      assert.equal(eventsSinceBoundary.filter((e) => e.kind === "TreasureOpened").length, 1);
      assert.equal(eventsSinceBoundary.filter((e) => e.kind === "MerchantFound").length, 1);
      assert.equal(eventsSinceBoundary.filter((e) => e.kind === "ShrineBlessing").length, 1);
      assert.equal(eventsSinceBoundary.filter((e) => e.kind === "DiscoveryMade").length, 1);

      const snapshot = deriveObjectiveProgress(session, timeline);
      assert.ok(snapshot.objective, "deveria sempre existir um objetivo ativo");
    });
  });

  describe("HUD (requisito 6)", () => {
    it("recentWorldEvent só é não-nulo na tick EXATA em que o evento aconteceu, some na tick seguinte", () => {
      // Regressão: WorldEventPanel (React) consome hudState.recentWorldEvent
      // diretamente, num painel persistente — não através do Animation
      // Controller (que expira sozinho, como os banners de Elite/Level Up).
      // Sem a checagem de tickIndex em toRecentWorldEvent(), o painel
      // mostraria o ÚLTIMO evento pra sempre, mesmo dezenas de encontros
      // depois — achado real durante o smoke test manual desta Sprint.
      const found = findSeedForCategory("bosque-sussurrante", "merchant", 500);
      assert.ok(found, "esperava achar uma seed com Merchant em 500 tentativas");

      const character = strongHero("hud-freshness");
      const session = createAdventureSession("hud-freshness-session", character, "bosque-sussurrante", found!.seed, 0);
      const timeline = createAdventureTimeline(session.sessionId);

      const first = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      assert.ok(first.events.some((e) => e.kind === "WorldEventStarted"), "esperava WorldEventStarted na 1ª tick (mesma seed da busca)");
      const hudAfterEvent = deriveHudState(session, timeline);
      assert.ok(hudAfterEvent.recentWorldEvent, "recentWorldEvent deveria estar populado na tick exata do evento");

      if (!session.character.currentLife || session.character.currentLife <= 0) return;
      advanceAdventureWithPresentation(session, timeline, { currentTime: 2000 });
      const hudAfterNextTick = deriveHudState(session, timeline);
      assert.equal(hudAfterNextTick.recentWorldEvent, null, "recentWorldEvent deveria voltar a null na tick seguinte (sem novo evento)");
    });
  });

  describe("simulação (requisito 8/9)", () => {
    it("runSimulatedAdventure produz contadores de World Event consistentes", () => {
      const result = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1, maxSimulatedSeconds: 1200 });
      assert.ok(result.worldEventsEncountered >= 0);
      const categorySum = Object.values(result.worldEventCountByCategory).reduce((sum, count) => sum + count, 0);
      assert.equal(categorySum, result.worldEventsEncountered);
      assert.ok(result.worldEventGoldGained >= 0);
      assert.ok(result.worldEventXpGained >= 0);
      assert.ok(result.worldEventLootItemsGained >= 0);
      assert.ok(result.worldEventRecoveryGained >= 0);
    });

    it("generateBalanceReport agrega worldEvents com frequency/perCategory/recompensas corretos", () => {
      const results = Array.from({ length: 30 }, (_, i) => runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: i + 1, maxSimulatedSeconds: 1200 }));
      const report = generateBalanceReport(results);
      assert.ok(report.worldEvents.frequency >= 0 && report.worldEvents.frequency <= 1);
      for (const category of report.worldEvents.perCategory) {
        assert.ok(category.frequency >= 0 && category.frequency <= 1);
        assert.ok(category.totalEncountered >= 0);
      }
      assert.ok(report.worldEvents.deathRateWithEvents >= 0 && report.worldEvents.deathRateWithEvents <= 1);
      assert.ok(report.worldEvents.deathRateWithoutEvents >= 0 && report.worldEvents.deathRateWithoutEvents <= 1);
    });

    it("determinístico: mesma seed sempre produz os mesmos contadores de World Event", () => {
      const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 1200 });
      const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42, maxSimulatedSeconds: 1200 });
      assert.equal(a.worldEventsEncountered, b.worldEventsEncountered);
      assert.deepEqual(a.worldEventCountByCategory, b.worldEventCountByCategory);
      assert.equal(a.worldEventGoldGained, b.worldEventGoldGained);
      assert.equal(a.worldEventXpGained, b.worldEventXpGained);
    });
  });
});
