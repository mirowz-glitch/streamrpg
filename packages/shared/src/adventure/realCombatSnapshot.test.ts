/**
 * Sprint 22 — Living Combat Phase I, Fase 4/5/6. Cobertura de
 * `AdventureCharacter.realCombatSnapshot`: quando presente,
 * `toAdventureCombatant()`/`getSessionResult()`/`createAdventureCharacter()`
 * usam o MESMO Combat Snapshot que Character API/Boss consultam (via
 * `combatSnapshotToFinalStats`), nunca o cálculo antigo
 * (Equipment-class/kit de sessão) — "nunca dois cálculos de combate".
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession, getSessionResult, toAdventureCombatant } from "./session.js";
import type { CombatSnapshotDTO } from "../combat/combatSnapshot.js";

function fakeSnapshot(overrides: Partial<CombatSnapshotDTO> = {}): CombatSnapshotDTO {
  return {
    attack: 999,
    defense: 888,
    life: 7777,
    mana: 555,
    critical: 42,
    attackSpeed: 3,
    magic: 111,
    powerScore: 250,
    itemScore: 60,
    derivedStats: { accuracy: 12, movementSpeed: 5, lifeLeech: 2, resistances: { physical: 1, fire: 2, cold: 3, lightning: 4 } },
    activeBehaviors: [],
    ...overrides,
  };
}

function characterWith(snapshot: CombatSnapshotDTO | undefined, suffix = "1") {
  const build = new CharacterBuild(`char-snap-${suffix}`, "warrior", 0);
  const inventory = new Inventory(`char-snap-${suffix}`, 10);
  const equipment = new Equipment(`char-snap-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment, 1.5, snapshot);
}

describe("Sprint 22 — AdventureCharacter.realCombatSnapshot", () => {
  it("createAdventureCharacter: sem snapshot, currentLife nasce do cálculo antigo (Equipment-class), comportamento inalterado", () => {
    const withoutSnapshot = characterWith(undefined, "a");
    const build = new CharacterBuild("char-plain", "warrior", 0);
    const derivedLife = build.getDerivedAttributes().maximumLife;
    assert.equal(withoutSnapshot.currentLife, derivedLife);
  });

  it("createAdventureCharacter: com snapshot, currentLife nasce de snapshot.life, nunca do cálculo antigo", () => {
    const snapshot = fakeSnapshot({ life: 12345 });
    const character = characterWith(snapshot, "b");
    assert.equal(character.currentLife, 12345);
  });

  it("toAdventureCombatant: com snapshot, finalStats vem inteiro de combatSnapshotToFinalStats (attack/defense/critical/etc reais)", () => {
    const snapshot = fakeSnapshot();
    const character = characterWith(snapshot, "c");
    const combatant = toAdventureCombatant(character);
    assert.equal(combatant.finalStats.physicalDamage, snapshot.attack);
    assert.equal(combatant.finalStats.armor, snapshot.defense);
    assert.equal(combatant.finalStats.maximumLife, snapshot.life);
    assert.equal(combatant.finalStats.maximumMana, snapshot.mana);
    assert.equal(combatant.finalStats.criticalChance, snapshot.critical);
    assert.equal(combatant.finalStats.spellDamage, snapshot.magic);
    assert.equal(combatant.finalStats.powerScore, snapshot.powerScore);
    assert.deepEqual(combatant.finalStats.resistances, snapshot.derivedStats.resistances);
  });

  it("toAdventureCombatant: sem snapshot, finalStats continua vindo de calculateFinalStats(characterBuild, equipment) — fallback nunca quebra", () => {
    const character = characterWith(undefined, "d");
    const combatant = toAdventureCombatant(character);
    assert.ok(combatant.finalStats.maximumLife > 0);
  });

  it("getSessionResult: prefere o mesmo snapshot pra maximumLife, nunca um terceiro cálculo", () => {
    const snapshot = fakeSnapshot({ life: 54321 });
    const character = characterWith(snapshot, "e");
    const session = createAdventureSession("session-snap", character, "bosque-sussurrante", 1, 0);
    const result = getSessionResult(session);
    assert.equal(result.maximumLife, 54321);
  });
});
