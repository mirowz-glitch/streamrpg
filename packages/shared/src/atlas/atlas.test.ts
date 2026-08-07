import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listAtlasMapIds, buildAtlasState, getAtlasNode, deriveUnlockedMapIds } from "./atlasRegistry.js";
import { loadMapIntoDevice, prepareAdventureConfiguration } from "./mapDevice.js";
import { listMapDefinitions } from "../worldmap/mapRegistry.js";
import { generateRareMap } from "../raremap/generator.js";
import { generateCorruptedMap } from "../mapcorruption/generator.js";
import type { AtlasProgress } from "./types.js";

// Sprint 36 — Atlas Phase I. Fase 8: cobertura de "Atlas Registry" e
// "Map Device" — "O Atlas não cria mapas. O Atlas organiza mapas."

const EMPTY_PROGRESS: AtlasProgress = { unlockedMapIds: [], completedMapIds: [], favoriteMapIds: [] };

describe("Atlas Registry (Fase 3) — 9 mapas reais, nada procedural", () => {
  it("listAtlasMapIds() devolve exatamente os mesmos ids de listMapDefinitions() (worldmap/, Sprint 30)", () => {
    const atlasIds = listAtlasMapIds();
    const mapIds = listMapDefinitions().map((m) => m.id);
    assert.deepEqual([...atlasIds].sort(), [...mapIds].sort());
    assert.equal(atlasIds.length, 9);
  });

  it("buildAtlasState() produz 1 AtlasNode por Mapa real, id === mapId sempre", () => {
    const state = buildAtlasState(EMPTY_PROGRESS);
    assert.equal(state.nodes.length, 9);
    for (const node of state.nodes) {
      assert.equal(node.id, node.mapId);
    }
  });

  it("AtlasNode.tier é sempre igual a MapDefinition.dangerLevel do mesmo Mapa — nunca uma escala nova", () => {
    const state = buildAtlasState(EMPTY_PROGRESS);
    for (const map of listMapDefinitions()) {
      const node = state.nodes.find((n) => n.id === map.id);
      assert.ok(node, `esperava um Node para o Mapa ${map.id}`);
      assert.equal(node!.tier, map.dangerLevel);
    }
  });

  it("connections nunca inclui porto-do-amanhecer/planicie-dourada (sem Mapa real) e sempre é subconjunto dos 9 ids reais", () => {
    const state = buildAtlasState(EMPTY_PROGRESS);
    const realIds = new Set(state.nodes.map((n) => n.id));
    for (const node of state.nodes) {
      assert.ok(!node.connections.includes("porto-do-amanhecer"));
      assert.ok(!node.connections.includes("planicie-dourada"));
      for (const connectionId of node.connections) {
        assert.ok(realIds.has(connectionId), `conexão "${connectionId}" deveria ser um dos 9 Mapas reais`);
      }
    }
  });

  it("bosque-sussurrante conecta com pantano-podre — reaproveita REGION_GRAPH real, nunca um grafo novo", () => {
    const node = getAtlasNode("bosque-sussurrante", EMPTY_PROGRESS);
    assert.ok(node);
    assert.ok(node!.connections.includes("pantano-podre"));
  });

  it("getAtlasNode() para um mapId inexistente devolve undefined", () => {
    assert.equal(getAtlasNode("mapa-que-nao-existe", EMPTY_PROGRESS), undefined);
  });

  it("unlocked/completed/favorite resolvidos exatamente a partir do AtlasProgress recebido, nunca um estado próprio", () => {
    const progress: AtlasProgress = {
      unlockedMapIds: ["bosque-sussurrante", "pantano-podre"],
      completedMapIds: ["bosque-sussurrante"],
      favoriteMapIds: ["fortaleza-sombria"],
    };
    const state = buildAtlasState(progress);
    const bosque = state.nodes.find((n) => n.id === "bosque-sussurrante")!;
    const pantano = state.nodes.find((n) => n.id === "pantano-podre")!;
    const colinas = state.nodes.find((n) => n.id === "colinas-aridas")!;
    const fortaleza = state.nodes.find((n) => n.id === "fortaleza-sombria")!;

    assert.equal(bosque.unlocked, true);
    assert.equal(bosque.completed, true);
    assert.equal(bosque.favorite, false);

    assert.equal(pantano.unlocked, true);
    assert.equal(pantano.completed, false);

    assert.equal(colinas.unlocked, false);
    assert.equal(colinas.completed, false);

    assert.equal(fortaleza.favorite, true);
    assert.equal(fortaleza.unlocked, false);
  });

  it("dois buildAtlasState() com o mesmo AtlasProgress produzem resultados idênticos — puro, sem estado escondido", () => {
    const progress: AtlasProgress = { unlockedMapIds: ["bosque-sussurrante"], completedMapIds: [], favoriteMapIds: [] };
    assert.deepEqual(buildAtlasState(progress), buildAtlasState(progress));
  });
});

describe("deriveUnlockedMapIds() (Fase 2/3) — mesma régua de nível de checkRegionUnlock(), nunca uma segunda", () => {
  it("nível 1 sempre inclui bosque-sussurrante (levelRange.min 1)", () => {
    const unlocked = deriveUnlockedMapIds(1);
    assert.ok(unlocked.includes("bosque-sussurrante"));
  });

  it("nível 1 nunca inclui fortaleza-sombria (levelRange.min 30)", () => {
    const unlocked = deriveUnlockedMapIds(1);
    assert.ok(!unlocked.includes("fortaleza-sombria"));
  });

  it("nível 30 (MAX_LEVEL) inclui todos os 9 Mapas reais", () => {
    const unlocked = deriveUnlockedMapIds(30);
    assert.equal(unlocked.length, 9);
  });

  it("nível maior nunca desbloqueia menos Mapas que um nível menor (monotônico)", () => {
    const low = deriveUnlockedMapIds(5).length;
    const high = deriveUnlockedMapIds(25).length;
    assert.ok(high >= low);
  });
});

describe("Map Device (Fase 4) — recebe RareMap/CorruptedMap, devolve AdventureConfiguration, nunca mais que isso", () => {
  it("loadMapIntoDevice() + prepareAdventureConfiguration() com um RareMapInstance real: mapId/rareMap corretos", () => {
    const rareMap = generateRareMap(11, { rarity: "rare", mapId: "bosque-sussurrante" });
    const device = loadMapIntoDevice(rareMap);
    const configuration = prepareAdventureConfiguration(device);
    assert.equal(configuration.mapId, rareMap.mapId);
    assert.deepEqual(configuration.rareMap, rareMap);
  });

  it("loadMapIntoDevice() + prepareAdventureConfiguration() com um CorruptedMap real: mapId/rareMap corretos", () => {
    const rareMap = generateRareMap(12, { rarity: "rare", mapId: "pantano-podre" });
    const corrupted = generateCorruptedMap(rareMap, 99);
    const device = loadMapIntoDevice(corrupted);
    const configuration = prepareAdventureConfiguration(device);
    assert.equal(configuration.mapId, corrupted.mapId);
    assert.deepEqual(configuration.rareMap, corrupted);
  });

  it("nunca muta o Mapa recebido — o objeto original permanece intacto depois de passar pelo Device", () => {
    const rareMap = generateRareMap(13, { rarity: "rare", mapId: "colinas-aridas" });
    const snapshot = JSON.parse(JSON.stringify(rareMap));
    const device = loadMapIntoDevice(rareMap);
    prepareAdventureConfiguration(device);
    assert.deepEqual(rareMap, snapshot);
  });
});
