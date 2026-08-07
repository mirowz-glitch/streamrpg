import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadMapIntoDevice, prepareAdventureConfiguration } from "./mapDevice.js";
import { generateWaystone } from "../waystone/generator.js";
import { generateRareMap } from "../raremap/generator.js";
import { generateCorruptedMap } from "../mapcorruption/generator.js";

// Sprint 37 — Waystones Phase I. Fase 8: "Map Device passa a aceitar
// WaystoneInstance... Continuar aceitando RareMap, CorruptedMap sem
// regressões."

describe("Map Device aceita WaystoneInstance (Fase 4)", () => {
  it("um Waystone real produz AdventureConfiguration com mapId correto e rareMap SEMPRE undefined (Waystone nunca carrega Mods)", () => {
    const waystone = generateWaystone(31, { mapId: "picos-congelados" });
    const device = loadMapIntoDevice(waystone);
    const configuration = prepareAdventureConfiguration(device);

    assert.equal(configuration.mapId, "picos-congelados");
    assert.equal(configuration.rareMap, undefined);
  });

  it("nunca muta o WaystoneInstance recebido", () => {
    const waystone = generateWaystone(32, { mapId: "litoral-quebrado" });
    const snapshot = JSON.parse(JSON.stringify(waystone));
    const device = loadMapIntoDevice(waystone);
    prepareAdventureConfiguration(device);
    assert.deepEqual(waystone, snapshot);
  });
});

describe("Map Device continua aceitando RareMap/CorruptedMap sem regressões (Fase 7)", () => {
  it("RareMapInstance continua produzindo rareMap preenchido em AdventureConfiguration, exatamente como na Sprint 36", () => {
    const rareMap = generateRareMap(33, { rarity: "rare", mapId: "bosque-sussurrante" });
    const device = loadMapIntoDevice(rareMap);
    const configuration = prepareAdventureConfiguration(device);
    assert.equal(configuration.mapId, rareMap.mapId);
    assert.deepEqual(configuration.rareMap, rareMap);
  });

  it("CorruptedMap continua produzindo rareMap preenchido em AdventureConfiguration, exatamente como na Sprint 36", () => {
    const rareMap = generateRareMap(34, { rarity: "rare", mapId: "deserto-de-vidro" });
    const corrupted = generateCorruptedMap(rareMap, 88);
    const device = loadMapIntoDevice(corrupted);
    const configuration = prepareAdventureConfiguration(device);
    assert.equal(configuration.mapId, corrupted.mapId);
    assert.deepEqual(configuration.rareMap, corrupted);
  });
});
