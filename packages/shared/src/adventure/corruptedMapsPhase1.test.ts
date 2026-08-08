import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "./session.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { generateRareMap } from "../raremap/generator.js";
import { generateCorruptedMap } from "../mapcorruption/generator.js";
import type { CorruptedMap } from "../mapcorruption/types.js";

// Sprint 35 — Corrupted Maps Phase I. Fase 8: "Adventure usando
// CorruptedMap" / "Compatibilidade" — a primeira vez que
// `AdventureSession.activeMapModifiers` nasce de um `CorruptedMap`
// real, tratado exatamente como um Rare Map (Sprint 34) já era.

function strongHero(suffix: string) {
  const build = new CharacterBuild(`corrupt-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`corrupt-hero-${suffix}`, 30);
  const equipment = new Equipment(`corrupt-hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function fakeCorruptedMap(mapId: string, mods: string[]): CorruptedMap {
  return { mapId, rarity: "rare", tier: 3, mods, corrupted: true, corruptionOutcome: "brick", sourceInstanceId: "raremap-fixture", instanceId: "corrupted-fixture", seed: 1 };
}

describe("createAdventureSession() aceita CorruptedMap (Fase 5)", () => {
  it("com CorruptedMap: activeMapModifiers recebe EXATAMENTE CorruptedMap.mods, mais nada muda na sessão", () => {
    const corrupted = fakeCorruptedMap("bosque-sussurrante", ["monster-damage-up", "monster-life-up", "elite-chance-up"]);
    const session = createAdventureSession("cs1", strongHero("1"), "bosque-sussurrante", 1, 0, corrupted);
    assert.deepEqual(session.activeMapModifiers, corrupted.mods);

    const baseline = createAdventureSession("cs1-base", strongHero("1b"), "bosque-sussurrante", 1, 0);
    assert.equal(session.currentRegion, baseline.currentRegion);
    assert.equal(session.currentMapId, baseline.currentMapId);
  });

  it("CorruptedMap com mods=[] (resultado 'nothing' de um Rare Map sem Mods) produz o mesmo efeito que nenhum mapa", () => {
    const corrupted = fakeCorruptedMap("bosque-sussurrante", []);
    const session = createAdventureSession("cs2", strongHero("2"), "bosque-sussurrante", 1, 0, corrupted);
    assert.deepEqual(session.activeMapModifiers, []);
  });
});

describe("Map Mods vindos do CorruptedMap (Fase 5) — efeito real via advanceDungeonTick, mesmo pipeline da Sprint 33/34", () => {
  it("um Mapa Corrompido 'brick' com múltiplos Mods de combate escala os inimigos spawnados de verdade", () => {
    const REGION = "bosque-sussurrante";
    const corrupted = fakeCorruptedMap(REGION, ["monster-damage-up", "monster-life-up"]);

    const baseline = createAdventureSession("corrupt-base", strongHero("base"), REGION, 4242, 0);
    const withCorruption = createAdventureSession("corrupt-mod", strongHero("mod"), REGION, 4242, 0, corrupted);

    const timelineA = createAdventureTimeline(baseline.sessionId);
    const timelineB = createAdventureTimeline(withCorruption.sessionId);
    advanceDungeonTick(baseline, timelineA, { currentTime: 1000 });
    advanceDungeonTick(withCorruption, timelineB, { currentTime: 1000 });

    assert.ok(
      withCorruption.statistics.damageDealt > baseline.statistics.damageDealt,
      `esperava mais dano total causado com monster-life-up vindo do Mapa Corrompido: baseline=${baseline.statistics.damageDealt}, comCorrupcao=${withCorruption.statistics.damageDealt}`,
    );
  });

  it("pipeline real ponta a ponta: generateRareMap() -> generateCorruptedMap() -> createAdventureSession() -> activeMapModifiers", () => {
    let tested = false;
    for (let seed = 1; seed <= 60 && !tested; seed++) {
      const rareMap = generateRareMap(seed, { rarity: "rare", mapId: "bosque-sussurrante" });
      const corrupted = generateCorruptedMap(rareMap, seed * 31);
      if (corrupted.mods.length > 0) {
        const session = createAdventureSession("full-pipeline", strongHero(`pipe-${seed}`), "bosque-sussurrante", 1, 0, corrupted);
        assert.deepEqual(session.activeMapModifiers, corrupted.mods);
        tested = true;
      }
    }
    assert.ok(tested, "esperava ao menos 1 seed (em 60) onde o Mapa Corrompido carregava Mods reais");
  });
});

describe("Compatibilidade (Fase 7) — Rare Maps (Sprint 34) e comportamento padrão continuam intocados", () => {
  it("createAdventureSession() sem nenhum mapa (5 argumentos) produz resultado idêntico a antes desta Sprint", () => {
    const a = createAdventureSession("compat-a", strongHero("compat-a"), "bosque-sussurrante", 999, 0);
    const b = createAdventureSession("compat-b", strongHero("compat-b"), "bosque-sussurrante", 999, 0);
    assert.deepEqual(a.activeMapModifiers, []);
    assert.deepEqual(b.activeMapModifiers, []);

    const timelineA = createAdventureTimeline(a.sessionId);
    const timelineB = createAdventureTimeline(b.sessionId);
    const resultA = advanceDungeonTick(a, timelineA, { currentTime: 1000 });
    const resultB = advanceDungeonTick(b, timelineB, { currentTime: 1000 });
    assert.deepEqual(resultA.tickResult, resultB.tickResult);
  });

  it("passar um RareMapInstance normal (não corrompido) continua funcionando exatamente como na Sprint 34", () => {
    const rareMap = generateRareMap(3, { rarity: "rare", mapId: "bosque-sussurrante" });
    const session = createAdventureSession("compat-raremap", strongHero("compat-rm"), "bosque-sussurrante", 1, 0, rareMap);
    assert.deepEqual(session.activeMapModifiers, rareMap.mods);
  });
});
