import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession, createAdventureSessionFromConfiguration } from "./session.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { generateRareMap } from "../raremap/generator.js";
import { generateCorruptedMap } from "../mapcorruption/generator.js";
import { buildAtlasState, deriveUnlockedMapIds } from "../atlas/atlasRegistry.js";
import { loadMapIntoDevice, prepareAdventureConfiguration } from "../atlas/mapDevice.js";
import type { AdventureConfiguration } from "../atlas/types.js";

// Sprint 36 — Atlas Phase I. Fase 8: "Adventure -> Atlas -> Map Device
// -> Rare Map -> Corrupted Map -> Adventure" real pela primeira vez —
// createAdventureSessionFromConfiguration() é o único ponto novo, e
// delega 100% para createAdventureSession() (intocada desde a Sprint 34).

function strongHero(suffix: string) {
  const build = new CharacterBuild(`atlas-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`atlas-hero-${suffix}`, 30);
  const equipment = new Equipment(`atlas-hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

describe("createAdventureSessionFromConfiguration() (Fase 5) — delega 100% para createAdventureSession()", () => {
  it("com um RareMap na AdventureConfiguration: mesma sessão que createAdventureSession() 6-arg produziria", () => {
    const rareMap = generateRareMap(21, { rarity: "rare", mapId: "bosque-sussurrante" });
    const configuration: AdventureConfiguration = { mapId: rareMap.mapId, rareMap };

    const viaConfiguration = createAdventureSessionFromConfiguration("via-config", strongHero("cfg"), configuration, 1, 0);
    const viaDirectCall = createAdventureSession("via-direct", strongHero("direct"), rareMap.mapId, 1, 0, rareMap);

    assert.deepEqual(viaConfiguration.activeMapModifiers, viaDirectCall.activeMapModifiers);
    assert.equal(viaConfiguration.currentMapId, viaDirectCall.currentMapId);
    assert.equal(viaConfiguration.currentRegion, viaDirectCall.currentRegion);
  });

  it("com um CorruptedMap na AdventureConfiguration: activeMapModifiers recebe exatamente CorruptedMap.mods", () => {
    const rareMap = generateRareMap(22, { rarity: "rare", mapId: "pantano-podre" });
    const corrupted = generateCorruptedMap(rareMap, 77);
    const configuration: AdventureConfiguration = { mapId: corrupted.mapId, rareMap: corrupted };

    const session = createAdventureSessionFromConfiguration("via-corrupted", strongHero("corrupted"), configuration, 1, 0);
    assert.deepEqual(session.activeMapModifiers, corrupted.mods);
    assert.equal(session.currentRegion, "pantano-podre");
  });

  it("sem rareMap na AdventureConfiguration (só mapId): produz o mesmo resultado de sempre, activeMapModifiers vazio", () => {
    const configuration: AdventureConfiguration = { mapId: "colinas-aridas" };
    const session = createAdventureSessionFromConfiguration("via-plain", strongHero("plain"), configuration, 1, 0);
    assert.deepEqual(session.activeMapModifiers, []);
    assert.equal(session.currentRegion, "colinas-aridas");
  });
});

describe("Pipeline real ponta a ponta (Fase 9 preparação): Atlas -> Map Device -> Rare Map -> Corrupted Map -> Adventure", () => {
  it("um Node desbloqueado do Atlas alimenta generateRareMap() -> generateCorruptedMap() -> Map Device -> Adventure, com efeito real no combate", () => {
    const unlockedMapIds = deriveUnlockedMapIds(30);
    const atlasState = buildAtlasState({ unlockedMapIds, completedMapIds: [], favoriteMapIds: [] });
    const node = atlasState.nodes.find((n) => n.id === "bosque-sussurrante");
    assert.ok(node && node.unlocked);

    let tested = false;
    for (let seed = 1; seed <= 60 && !tested; seed++) {
      const rareMap = generateRareMap(seed, { rarity: "rare", mapId: node!.mapId });
      const corrupted = generateCorruptedMap(rareMap, seed * 31);
      if (corrupted.mods.length === 0) continue;

      const device = loadMapIntoDevice(corrupted);
      const configuration = prepareAdventureConfiguration(device);

      const baseline = createAdventureSession("atlas-pipeline-base", strongHero(`base-${seed}`), node!.mapId, 4242, 0);
      const withAtlas = createAdventureSessionFromConfiguration("atlas-pipeline-mod", strongHero(`mod-${seed}`), configuration, 4242, 0);

      const timelineA = createAdventureTimeline(baseline.sessionId);
      const timelineB = createAdventureTimeline(withAtlas.sessionId);
      advanceDungeonTick(baseline, timelineA, { currentTime: 1000 });
      advanceDungeonTick(withAtlas, timelineB, { currentTime: 1000 });

      if (withAtlas.statistics.damageDealt !== baseline.statistics.damageDealt) {
        tested = true;
      }
    }
    assert.ok(tested, "esperava ao menos 1 seed (em 60) onde o Mapa Corrompido, vindo do Atlas via Map Device, alterasse o combate real");
  });
});

describe("Compatibilidade (Fase 7) — createAdventureSession() direta continua 100% intocada", () => {
  it("createAdventureSession() com 5 argumentos (sem mapa) continua idêntica a antes desta Sprint", () => {
    const a = createAdventureSession("compat-atlas-a", strongHero("compat-a"), "bosque-sussurrante", 999, 0);
    const b = createAdventureSession("compat-atlas-b", strongHero("compat-b"), "bosque-sussurrante", 999, 0);
    assert.deepEqual(a.activeMapModifiers, []);
    assert.deepEqual(b.activeMapModifiers, []);
  });

  it("createAdventureSession() com RareMapInstance direta (Sprint 34) continua funcionando sem passar pelo Atlas", () => {
    const rareMap = generateRareMap(23, { rarity: "rare", mapId: "bosque-sussurrante" });
    const session = createAdventureSession("compat-atlas-rm", strongHero("compat-rm"), "bosque-sussurrante", 1, 0, rareMap);
    assert.deepEqual(session.activeMapModifiers, rareMap.mods);
  });
});
