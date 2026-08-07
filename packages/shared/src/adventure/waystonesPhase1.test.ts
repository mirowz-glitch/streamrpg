import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession, createAdventureSessionFromConfiguration } from "./session.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { generateWaystone } from "../waystone/generator.js";
import { generateRareMap } from "../raremap/generator.js";
import { generateCorruptedMap } from "../mapcorruption/generator.js";
import { loadMapIntoDevice, prepareAdventureConfiguration } from "../atlas/mapDevice.js";
import { buildAtlasState, deriveUnlockedMapIds } from "../atlas/atlasRegistry.js";

// Sprint 37 — Waystones Phase I. Fase 8: "Adventure continua igual.
// Apenas recebe AdventureConfiguration oriunda do Waystone. Nenhuma
// outra mudança." — a primeira vez que
// `AdventureSession.activeMapModifiers` nasce de um `WaystoneInstance`
// real, atravessando o mesmo Map Device/AdventureConfiguration da
// Sprint 36.

function strongHero(suffix: string) {
  const build = new CharacterBuild(`waystone-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`waystone-hero-${suffix}`, 30);
  const equipment = new Equipment(`waystone-hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

describe("Adventure via Waystone (Fase 5) — AdventureConfiguration sem Mods, mapa correto", () => {
  it("um Waystone real, via Map Device, produz activeMapModifiers vazio e currentRegion correto", () => {
    const waystone = generateWaystone(41, { mapId: "colinas-aridas" });
    const configuration = prepareAdventureConfiguration(loadMapIntoDevice(waystone));

    const session = createAdventureSessionFromConfiguration("waystone-session", strongHero("plain"), configuration, 1, 0);
    assert.deepEqual(session.activeMapModifiers, []);
    assert.equal(session.currentRegion, "colinas-aridas");
    assert.equal(session.currentMapId, "colinas-aridas");
  });

  it("é idêntico a createAdventureSession() sem nenhum Mapa (mesmo comportamento, caminho novo)", () => {
    const waystone = generateWaystone(42, { mapId: "bosque-sussurrante" });
    const configuration = prepareAdventureConfiguration(loadMapIntoDevice(waystone));

    const viaWaystone = createAdventureSessionFromConfiguration("via-waystone", strongHero("via-waystone"), configuration, 1, 0);
    const viaPlain = createAdventureSession("via-plain", strongHero("via-plain"), "bosque-sussurrante", 1, 0);
    assert.deepEqual(viaWaystone.activeMapModifiers, viaPlain.activeMapModifiers);
  });
});

describe("Pipeline completo (Fase 9 preparação): Atlas -> Waystone -> Map Device -> Adventure", () => {
  it("um Node desbloqueado do Atlas alimenta generateWaystone() -> Map Device -> AdventureConfiguration -> Adventure real", () => {
    const unlockedMapIds = deriveUnlockedMapIds(30);
    const atlasState = buildAtlasState({ unlockedMapIds, completedMapIds: [], favoriteMapIds: [] });
    const node = atlasState.nodes.find((n) => n.id === "minas-abandonadas");
    assert.ok(node && node.unlocked);

    const waystone = generateWaystone(43, { mapId: node!.mapId });
    const configuration = prepareAdventureConfiguration(loadMapIntoDevice(waystone));
    const session = createAdventureSessionFromConfiguration("atlas-waystone-pipeline", strongHero("pipeline"), configuration, 1, 0);

    assert.equal(session.currentRegion, node!.mapId);
    assert.deepEqual(session.activeMapModifiers, []);

    const timeline = createAdventureTimeline(session.sessionId);
    const result = advanceDungeonTick(session, timeline, { currentTime: 1000 });
    assert.ok(result.tickResult, "esperava um tick real de Adventure processado normalmente");
  });
});

describe("Compatibilidade (Fase 7) — Rare Maps/Corrupted Maps/Atlas continuam intocados", () => {
  it("createAdventureSessionFromConfiguration() com um RareMap continua produzindo Mods reais, exatamente como na Sprint 36", () => {
    const rareMap = generateRareMap(44, { rarity: "rare", mapId: "ruinas-esquecidas" });
    const configuration = prepareAdventureConfiguration(loadMapIntoDevice(rareMap));
    const session = createAdventureSessionFromConfiguration("compat-raremap", strongHero("compat-rm"), configuration, 1, 0);
    assert.deepEqual(session.activeMapModifiers, rareMap.mods);
  });

  it("createAdventureSessionFromConfiguration() com um CorruptedMap continua produzindo Mods reais, exatamente como na Sprint 36", () => {
    const rareMap = generateRareMap(45, { rarity: "rare", mapId: "picos-congelados" });
    const corrupted = generateCorruptedMap(rareMap, 55);
    const configuration = prepareAdventureConfiguration(loadMapIntoDevice(corrupted));
    const session = createAdventureSessionFromConfiguration("compat-corrupted", strongHero("compat-corrupted"), configuration, 1, 0);
    assert.deepEqual(session.activeMapModifiers, corrupted.mods);
  });

  it("createAdventureSession() direta (5/6 argumentos) continua 100% intocada", () => {
    const a = createAdventureSession("compat-waystone-a", strongHero("compat-a"), "bosque-sussurrante", 999, 0);
    assert.deepEqual(a.activeMapModifiers, []);

    const rareMap = generateRareMap(46, { rarity: "rare", mapId: "bosque-sussurrante" });
    const b = createAdventureSession("compat-waystone-b", strongHero("compat-b"), "bosque-sussurrante", 1, 0, rareMap);
    assert.deepEqual(b.activeMapModifiers, rareMap.mods);
  });
});
