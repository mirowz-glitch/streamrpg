import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getItemPower } from "../items.js";
import type { ActiveGemEffect } from "../socket/gemEffectResolver.js";
import type { ActiveGemBehavior } from "../socket/gemBehaviorResolver.js";
import { EXAMPLE_GEM_BEHAVIOR_REGISTRY } from "../socket/gemBehaviorRegistry.js";
import type { EquippedItem } from "../types.js";
import { calculateCharacterStatsFromEquippedItems } from "../equipment/realEquipmentStats.js";
import { buildCombatSnapshot, finalStatsToCombatSnapshot } from "./combatSnapshot.js";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { combineFinalStats, calculateFinalStats } from "../characterbuild/finalStats.js";
import { Equipment } from "../equipment/equipment.js";

function equippedItem(overrides: Partial<EquippedItem> = {}): EquippedItem {
  return {
    slot: "weapon",
    character_item_id: 1,
    item_id: 1,
    name: "Item de Teste",
    rarity: "common",
    damage_type: "physical",
    uti_bonus: 0,
    min_level: 1,
    power_score: 10,
    upgrade_level: 0,
    item_level: null,
    seed: null,
    affixes: [],
    potential: null,
    quality: { value: 0, scalesAttribute: "" },
    craft_state: "open",
    history: null,
    legacy: null,
    legacyEvents: [],
    legacySummary: null,
    sockets: null,
    uncertaintyEligible: false,
    mythicOrigin: null,
    baseIdentity: null,
    socketGems: null,
    socketGemEffects: null,
    ...overrides,
  };
}

function gemEffect(overrides: Partial<ActiveGemEffect["effect"]> = {}): ActiveGemEffect {
  return {
    socketId: "socket-1",
    gemType: "test-gem",
    effect: {
      id: "test-effect",
      type: "life",
      value: 30,
      scaling: "flat",
      description: "Vida +30",
      enabled: true,
      ...overrides,
    },
  };
}

describe("Sprint 22 — Living Combat Phase I: calculateCharacterStatsFromEquippedItems", () => {
  test("nenhum item equipado, nenhum efeito de Gema: CharacterStats totalmente zerado", () => {
    const stats = calculateCharacterStatsFromEquippedItems([], []);
    assert.equal(stats.attack, 0);
    assert.equal(stats.defense, 0);
    assert.equal(stats.life, 0);
    assert.equal(stats.mana, 0);
    assert.equal(stats.critical, 0);
    assert.equal(stats.attackSpeed, 0);
    assert.equal(stats.spellDamage, 0);
    assert.equal(stats.powerScore, 0);
  });

  test("Base (raridade+slot) soma attack via getItemPower, mesma fórmula do Equipment-class path", () => {
    const item = equippedItem({ slot: "weapon", rarity: "rare" });
    const stats = calculateCharacterStatsFromEquippedItems([item], []);
    const expected = getItemPower("rare", "weapon");
    assert.equal(stats.attack, expected.attack);
    assert.equal(stats.defense, expected.defense);
  });

  test("afixos reais (statLabel) somam via o mesmo STAT_LABEL_BUCKET de calculateCharacterStats", () => {
    const item = equippedItem({
      slot: "armor",
      rarity: "common",
      affixes: [{ modId: "m1", type: "prefix", group: "g", name: "Força", statLabel: "Physical Damage", tags: [], tier: 1, value: 25 }],
    });
    const stats = calculateCharacterStatsFromEquippedItems([item], []);
    const base = getItemPower("common", "armor");
    assert.equal(stats.attack, 25);
    assert.equal(stats.defense, base.defense);
  });

  test("Base Identity Implicit Mods (percent) somam sobre a base real do item — Elmo concede +5% Resistência Física sobre a defesa", () => {
    const item = equippedItem({ slot: "helmet", rarity: "rare", baseIdentity: { displayName: "Elmo", tier: 2, potential: "medium" } });
    const stats = calculateCharacterStatsFromEquippedItems([item], []);
    const baseDefense = getItemPower("rare", "helmet").defense;
    assert.equal(stats.defense, baseDefense + baseDefense * 0.05);
  });

  test("item sem baseIdentity (catálogo fixo) nunca lança e nunca soma Implicit Mod nenhum", () => {
    const item = equippedItem({ slot: "helmet", rarity: "rare", baseIdentity: null });
    const stats = calculateCharacterStatsFromEquippedItems([item], []);
    assert.equal(stats.defense, getItemPower("rare", "helmet").defense);
  });

  test("Gem Effects (flat) somam direto no stat mapeado", () => {
    const item = equippedItem();
    const stats = calculateCharacterStatsFromEquippedItems([item], [gemEffect({ type: "life", value: 30, scaling: "flat" })]);
    assert.equal(stats.life, 30);
  });

  test("Gem Effects (percent) leem o flat somado por TODOS os itens, nunca o resultado parcial de outra Gema", () => {
    const items = [equippedItem({ character_item_id: 1, slot: "weapon", rarity: "epic" }), equippedItem({ character_item_id: 2, slot: "weapon", rarity: "common" })];
    const flatAttack = getItemPower("epic", "weapon").attack + getItemPower("common", "weapon").attack;
    const effects: ActiveGemEffect[] = [gemEffect({ type: "attack", value: 10, scaling: "percent" }), gemEffect({ type: "attack", value: 10, scaling: "percent" })];
    const stats = calculateCharacterStatsFromEquippedItems(items, effects);
    // Ordem-independente: cada gema de 10% aplica sobre o MESMO flatAttack, nunca cumulativo.
    assert.equal(stats.attack, flatAttack + flatAttack * 0.1 + flatAttack * 0.1);
  });

  test("Gem Effect type 'magic' mapeia pra spellDamage (mesmo destino de Implicit Mods de dano mágico)", () => {
    const stats = calculateCharacterStatsFromEquippedItems([equippedItem()], [gemEffect({ type: "magic", value: 8, scaling: "flat" })]);
    assert.equal(stats.spellDamage, 8);
  });

  test("powerScore soma o power_score de todos os itens equipados", () => {
    const items = [equippedItem({ character_item_id: 1, power_score: 10 }), equippedItem({ character_item_id: 2, power_score: 25 })];
    const stats = calculateCharacterStatsFromEquippedItems(items, []);
    assert.equal(stats.powerScore, 35);
  });
});

describe("Sprint 22 — combineFinalStats: mesma função combina Equipment-class E itens reais", () => {
  test("calculateFinalStats(build, equipment) continua produzindo o mesmo resultado de antes (regressão)", () => {
    const build = new CharacterBuild("char-regress", "warrior", 0);
    const equipment = new Equipment("char-regress");
    const finalStats = calculateFinalStats(build, equipment);
    const derived = build.getDerivedAttributes();
    assert.equal(finalStats.maximumLife, derived.maximumLife);
    assert.equal(finalStats.maximumMana, derived.maximumMana);
    assert.equal(finalStats.armor, derived.armor);
  });

  test("combineFinalStats soma mana/movementSpeed do CharacterStats real (campos novos desta Sprint)", () => {
    const build = new CharacterBuild("char-x", "warrior", 0);
    const derived = build.getDerivedAttributes();
    const equipmentStats = calculateCharacterStatsFromEquippedItems([equippedItem({ slot: "belt" })], [gemEffect({ type: "mana", value: 15, scaling: "flat" })]);
    const finalStats = combineFinalStats(derived, equipmentStats);
    assert.equal(finalStats.maximumMana, derived.maximumMana + 15);
  });
});

describe("Sprint 22 — Combat Snapshot: finalStatsToCombatSnapshot + buildCombatSnapshot", () => {
  test("finalStatsToCombatSnapshot traduz os nomes do brief a partir de FinalStats", () => {
    const build = new CharacterBuild("char-y", "warrior", 0);
    const equipment = new Equipment("char-y");
    const finalStats = calculateFinalStats(build, equipment);
    const snapshot = finalStatsToCombatSnapshot(finalStats, 42);
    assert.equal(snapshot.attack, finalStats.physicalDamage);
    assert.equal(snapshot.defense, finalStats.armor);
    assert.equal(snapshot.life, finalStats.maximumLife);
    assert.equal(snapshot.mana, finalStats.maximumMana);
    assert.equal(snapshot.critical, finalStats.criticalChance);
    assert.equal(snapshot.attackSpeed, finalStats.attackSpeed);
    assert.equal(snapshot.magic, finalStats.spellDamage);
    assert.equal(snapshot.powerScore, finalStats.powerScore);
    assert.equal(snapshot.itemScore, 42);
    assert.deepEqual(snapshot.derivedStats, {
      accuracy: finalStats.accuracy,
      movementSpeed: finalStats.movementSpeed,
      lifeLeech: finalStats.lifeLeech,
      resistances: finalStats.resistances,
    });
  });

  test("buildCombatSnapshot: personagem sem nenhum item equipado ainda tem Base Attributes reais (nível 1, classe warrior)", () => {
    const snapshot = buildCombatSnapshot("char-z", 0, [], []);
    const expectedDerived = new CharacterBuild("char-z", "warrior", 0).getDerivedAttributes();
    assert.equal(snapshot.life, expectedDerived.maximumLife);
    assert.equal(snapshot.attack, expectedDerived.physicalDamage);
    assert.equal(snapshot.itemScore, 0);
  });

  test("buildCombatSnapshot: itemScore soma power_score de todos os itens equipados, nunca incluso em powerScore", () => {
    const items = [equippedItem({ character_item_id: 1, power_score: 10 }), equippedItem({ character_item_id: 2, power_score: 25 })];
    const snapshot = buildCombatSnapshot("char-w", 0, items, []);
    assert.equal(snapshot.itemScore, 35);
  });

  test("buildCombatSnapshot: mesmo xp total sempre produz o mesmo Snapshot (determinístico)", () => {
    const items = [equippedItem({ slot: "weapon", rarity: "legendary" })];
    const a = buildCombatSnapshot("char-det", 5000, items, []);
    const b = buildCombatSnapshot("char-det", 5000, items, []);
    assert.deepEqual(a, b);
  });

  test("buildCombatSnapshot: Gema de vida eleva o life do Snapshot em relação ao personagem sem Gema", () => {
    const items = [equippedItem({ slot: "belt" })];
    const withoutGem = buildCombatSnapshot("char-gem", 0, items, []);
    const withGem = buildCombatSnapshot("char-gem", 0, items, [gemEffect({ type: "life", value: 30, scaling: "flat" })]);
    assert.equal(withGem.life, withoutGem.life + 30);
  });
});

describe("Sprint 23 — Sockets & Gems Phase II: Combat Snapshot activeBehaviors", () => {
  test("buildCombatSnapshot sem Gemas socketadas: activeBehaviors vazio", () => {
    const snapshot = buildCombatSnapshot("char-no-behavior", 0, [], []);
    assert.deepEqual(snapshot.activeBehaviors, []);
  });

  test("buildCombatSnapshot cruza ActiveGemBehavior + ActiveGemEffect pelo mesmo socketId+gemType (Rubi tem os dois)", () => {
    const activeBehaviors: ActiveGemBehavior[] = [{ socketId: "socket-1", gemType: "ruby-1", behavior: EXAMPLE_GEM_BEHAVIOR_REGISTRY["ruby-fire-proc-1"]! }];
    const activeEffects: ActiveGemEffect[] = [
      { socketId: "socket-1", gemType: "ruby-1", effect: { id: "attack-flat-1", type: "attack", value: 8, scaling: "flat", description: "Ataque +8", enabled: true } },
    ];
    const snapshot = buildCombatSnapshot("char-behavior", 0, [], activeEffects, activeBehaviors);
    assert.equal(snapshot.activeBehaviors.length, 1);
    const [summary] = snapshot.activeBehaviors;
    assert.equal(summary!.gemType, "ruby-1");
    assert.equal(summary!.behaviorKind, "onHitBonusFireDamage");
    assert.equal(summary!.effectDescription, "Ataque +8");
  });

  test("buildCombatSnapshot: Behavior sem GemEffect correspondente ainda produz a linha, com effectDescription null (Topázio)", () => {
    const activeBehaviors: ActiveGemBehavior[] = [{ socketId: "socket-2", gemType: "topaz-1", behavior: EXAMPLE_GEM_BEHAVIOR_REGISTRY["topaz-mana-1"]! }];
    const snapshot = buildCombatSnapshot("char-behavior-only", 0, [], [], activeBehaviors);
    assert.equal(snapshot.activeBehaviors.length, 1);
    assert.equal(snapshot.activeBehaviors[0]!.effectDescription, null);
    assert.equal(snapshot.activeBehaviors[0]!.behaviorKind, "manaPerTick");
  });

  test("buildCombatSnapshot: um GemEffect de outro socket nunca vaza pra dentro de um ActiveBehaviorSummary sem match", () => {
    const activeBehaviors: ActiveGemBehavior[] = [{ socketId: "socket-1", gemType: "ruby-1", behavior: EXAMPLE_GEM_BEHAVIOR_REGISTRY["ruby-fire-proc-1"]! }];
    const activeEffects: ActiveGemEffect[] = [
      { socketId: "socket-9", gemType: "outra-gema", effect: { id: "x", type: "attack", value: 1, scaling: "flat", description: "não deve casar", enabled: true } },
    ];
    const snapshot = buildCombatSnapshot("char-no-cross", 0, [], activeEffects, activeBehaviors);
    assert.equal(snapshot.activeBehaviors[0]!.effectDescription, null);
  });
});
