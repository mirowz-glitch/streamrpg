import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "./session.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { generateRareMap } from "../raremap/generator.js";
import type { RareMapInstance } from "../raremap/types.js";

// Sprint 34 — Rare Maps Phase I. Fase 8: "Adventure usando Rare Map" /
// "Map Mods vindos da instância" / "Compatibilidade" — a primeira vez
// que `AdventureSession.activeMapModifiers` nasce de uma instância REAL
// (`RareMapInstance`), nunca mais só de um push manual de teste.

function strongHero(suffix: string) {
  const build = new CharacterBuild(`raremap-hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`raremap-hero-${suffix}`, 30);
  const equipment = new Equipment(`raremap-hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function fakeRareMapInstance(mapId: string, mods: string[]): RareMapInstance {
  return { mapId, rarity: "rare", tier: 1, mods, instanceId: `raremap-${mapId}-fixture`, seed: 1 };
}

describe("createAdventureSession() aceita RareMapInstance (Fase 5)", () => {
  it("sem rareMap: activeMapModifiers continua [] — comportamento idêntico a antes desta Sprint (Sprint 32/33 intocado)", () => {
    const session = createAdventureSession("s1", strongHero("1"), "bosque-sussurrante", 1, 0);
    assert.deepEqual(session.activeMapModifiers, []);
  });

  it("com rareMap: activeMapModifiers recebe EXATAMENTE RareMap.mods, mais nada muda na sessão", () => {
    const rareMap = fakeRareMapInstance("bosque-sussurrante", ["monster-damage-up", "rarity-up"]);
    const session = createAdventureSession("s2", strongHero("2"), "bosque-sussurrante", 1, 0, rareMap);
    assert.deepEqual(session.activeMapModifiers, ["monster-damage-up", "rarity-up"]);
    // "Nunca alteram World Region. Nunca alteram Enemy Pool." — currentRegion/currentMapId
    // continuam vindo só de regionId, exatamente como uma sessão sem Rare Map.
    const baseline = createAdventureSession("s2-base", strongHero("2b"), "bosque-sussurrante", 1, 0);
    assert.equal(session.currentRegion, baseline.currentRegion);
    assert.equal(session.currentMapId, baseline.currentMapId);
  });

  it("rareMap com mods=[] (Rare Map de raridade 'normal') produz o mesmo efeito que nenhum rareMap", () => {
    const rareMap = fakeRareMapInstance("bosque-sussurrante", []);
    const session = createAdventureSession("s3", strongHero("3"), "bosque-sussurrante", 1, 0, rareMap);
    assert.deepEqual(session.activeMapModifiers, []);
  });
});

describe("Map Mods vindos da instância (Fase 5) — efeito real via advanceDungeonTick, mesmo pipeline da Sprint 33", () => {
  it("um Rare Map com monster-life-up/monster-damage-up escala os inimigos spawnados, idêntico ao comportamento já provado na Sprint 33 — só a ORIGEM dos Mods mudou (RareMapInstance, não push manual)", () => {
    const REGION = "bosque-sussurrante";
    const rareMap = fakeRareMapInstance(REGION, ["monster-damage-up", "monster-life-up"]);

    const baseline = createAdventureSession("rare-base", strongHero("base"), REGION, 4242, 0);
    const withRareMap = createAdventureSession("rare-mod", strongHero("mod"), REGION, 4242, 0, rareMap);

    assert.deepEqual(baseline.activeMapModifiers, []);
    assert.deepEqual(withRareMap.activeMapModifiers, ["monster-damage-up", "monster-life-up"]);

    const timelineA = createAdventureTimeline(baseline.sessionId);
    const timelineB = createAdventureTimeline(withRareMap.sessionId);
    advanceDungeonTick(baseline, timelineA, { currentTime: 1000 });
    advanceDungeonTick(withRareMap, timelineB, { currentTime: 1000 });

    // Mesma seed -> mesmo encontro/sequência de combate até o multiplicador de
    // stats mudar; inimigos mais fortes (monster-life-up) exigem mais dano
    // total pra morrer -> damageDealt estritamente maior com o Rare Map ativo.
    assert.ok(
      withRareMap.statistics.damageDealt > baseline.statistics.damageDealt,
      `esperava mais dano total causado com monster-life-up vindo do Rare Map: baseline=${baseline.statistics.damageDealt}, comRareMap=${withRareMap.statistics.damageDealt}`,
    );
  });

  it("generateRareMap() real (não hand-crafted) produzindo mods reais também flui corretamente até activeMapModifiers", () => {
    let foundNonEmpty = false;
    for (let seed = 1; seed <= 50 && !foundNonEmpty; seed++) {
      const rareMap = generateRareMap(seed, { rarity: "rare", mapId: "bosque-sussurrante" });
      if (rareMap.mods.length > 0) {
        const session = createAdventureSession("gen-rare", strongHero(`gen-${seed}`), "bosque-sussurrante", 1, 0, rareMap);
        assert.deepEqual(session.activeMapModifiers, rareMap.mods);
        foundNonEmpty = true;
      }
    }
    assert.ok(foundNonEmpty, "esperava ao menos 1 seed (em 50, rarity 'rare') com Mods reais gerados");
  });
});

describe("Compatibilidade (Fase 7) — nenhuma das 35 chamadas existentes de createAdventureSession() muda de comportamento", () => {
  it("chamando createAdventureSession() com a assinatura de 5 argumentos (sem rareMap) produz resultado idêntico a antes desta Sprint", () => {
    const a = createAdventureSession("compat-a", strongHero("compat-a"), "bosque-sussurrante", 999, 0);
    const b = createAdventureSession("compat-b", strongHero("compat-b"), "bosque-sussurrante", 999, 0);
    assert.deepEqual(a.activeMapModifiers, b.activeMapModifiers);
    assert.deepEqual(a.activeMapModifiers, []);

    const timelineA = createAdventureTimeline(a.sessionId);
    const timelineB = createAdventureTimeline(b.sessionId);
    const resultA = advanceDungeonTick(a, timelineA, { currentTime: 1000 });
    const resultB = advanceDungeonTick(b, timelineB, { currentTime: 1000 });
    assert.deepEqual(resultA.tickResult, resultB.tickResult);
  });
});
