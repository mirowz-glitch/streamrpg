import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "./session.js";
import { advanceAdventure } from "./adventureLoop.js";
import { listMapDefinitions } from "../worldmap/mapRegistry.js";
import { MAP_MODIFIER_REGISTRY } from "../mapmods/mapModifierRegistry.js";

// Sprint 32 — Map Modifiers Phase I. Fase 8: "Adventure Session" +
// "Compatibilidade" — `activeMapModifiers` existe, mas nunca produz
// nenhum efeito observável ainda (Fase 5: "apenas existem").

function strongHero(suffix = "1") {
  const build = new CharacterBuild(`hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`hero-${suffix}`, 30);
  const equipment = new Equipment(`hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  const character = strongHero(suffix);
  return createAdventureSession(`session-${suffix}`, character, regionId, seed, 0);
}

describe("AdventureSession.activeMapModifiers (Fase 5)", () => {
  it("createAdventureSession() sempre inicia com activeMapModifiers vazio — nenhuma rolagem existe ainda", () => {
    const session = freshSession("fortaleza-sombria", 3, "mods-1");
    assert.deepEqual(session.activeMapModifiers, []);
  });

  it("permanece vazio pra todos os 9 Mapas reais", () => {
    for (const map of listMapDefinitions()) {
      const session = freshSession(map.regionId, 5, `mods-all-${map.id}`);
      assert.deepEqual(session.activeMapModifiers, []);
    }
  });

  it("é um array mutável de MapModifierId — aceita ids reais do Registry por tipagem (scaffold pronto pra uma Sprint futura)", () => {
    const session = freshSession("bosque-sussurrante", 7, "mods-2");
    session.activeMapModifiers.push(MAP_MODIFIER_REGISTRY[0].id);
    assert.deepEqual(session.activeMapModifiers, [MAP_MODIFIER_REGISTRY[0].id]);
  });
});

describe("Compatibilidade (Fase 7) — presença de activeMapModifiers não muda nenhum comportamento real", () => {
  it("um tick completo de Adventure continua idêntico (personagem forte vence, sem nenhum efeito de Map Modifier aplicado)", () => {
    const session = freshSession("bosque-sussurrante", 1, "compat-1");
    const tickResult = advanceAdventure(session, { currentTime: 1000 });
    assert.equal(tickResult.encounterGenerated, true);
    assert.ok(tickResult.enemiesEncountered > 0);
    assert.equal(tickResult.characterAlive, true);
    assert.equal(session.currentEncounter, null);
    // Mesmo com Mods "presentes" na sessão (simulando um estado futuro),
    // advanceAdventure() nunca os lê — resultado idêntico ao caso vazio.
    session.activeMapModifiers.push("monster-damage-up", "gold-quantity-up");
    const secondSession = freshSession("bosque-sussurrante", 1, "compat-2");
    const secondTick = advanceAdventure(secondSession, { currentTime: 1000 });
    assert.deepEqual(
      { enemies: tickResult.enemiesEncountered, killed: tickResult.enemiesKilledThisTick },
      { enemies: secondTick.enemiesEncountered, killed: secondTick.enemiesKilledThisTick },
    );
  });
});
