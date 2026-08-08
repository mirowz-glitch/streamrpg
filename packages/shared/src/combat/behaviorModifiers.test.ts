import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveOffensiveBehaviorModifiers,
  resolveChillChancePercent,
  resolveDefensiveDamageMultiplier,
  resolveRegenBonus,
} from "./behaviorModifiers.js";
import type { ActiveBehaviorSummary } from "./combatSnapshot.js";

function behavior(overrides: Partial<ActiveBehaviorSummary> = {}): ActiveBehaviorSummary {
  return {
    socketId: "socket-1",
    gemType: "test-gem",
    gemDisplayName: "Gema de Teste",
    effectDescription: null,
    behaviorId: "test-behavior",
    behaviorKind: "onHitBonusFireDamage",
    magnitude: 0,
    behaviorDescription: "",
    ...overrides,
  };
}

describe("Sprint 23 — behaviorModifiers.ts: resolveOffensiveBehaviorModifiers", () => {
  test("nenhum Behavior ativo: nenhum dano bônus, multiplicador de crítico neutro (1)", () => {
    const result = resolveOffensiveBehaviorModifiers([], 10);
    assert.equal(result.bonusFlatDamage, 0);
    assert.equal(result.criticalChanceMultiplier, 1);
  });

  test("Rubi soma bonusFlatDamage direto, sem afetar o crítico", () => {
    const result = resolveOffensiveBehaviorModifiers([behavior({ behaviorKind: "onHitBonusFireDamage", magnitude: 3 })], 10);
    assert.equal(result.bonusFlatDamage, 3);
    assert.equal(result.criticalChanceMultiplier, 1);
  });

  test("Ônix soma pontos percentuais de crítico via multiplicador, nunca um valor fixo", () => {
    const result = resolveOffensiveBehaviorModifiers([behavior({ behaviorKind: "bonusCriticalChance", magnitude: 5 })], 10);
    assert.equal(result.bonusFlatDamage, 0);
    // (10 + 5) / 10 = 1.5 — o pipeline multiplica isso pelo baseChance real, nunca substitui.
    assert.equal(result.criticalChanceMultiplier, 1.5);
  });

  test("baseCriticalChance 0 nunca divide por zero — multiplicador neutro", () => {
    const result = resolveOffensiveBehaviorModifiers([behavior({ behaviorKind: "bonusCriticalChance", magnitude: 5 })], 0);
    assert.equal(result.criticalChanceMultiplier, 1);
  });

  test("Rubi + Ônix somam independentemente (Build combinando dois Behaviors ofensivos)", () => {
    const result = resolveOffensiveBehaviorModifiers(
      [behavior({ behaviorKind: "onHitBonusFireDamage", magnitude: 3 }), behavior({ behaviorKind: "bonusCriticalChance", magnitude: 2 })],
      10,
    );
    assert.equal(result.bonusFlatDamage, 3);
    assert.equal(result.criticalChanceMultiplier, 1.2);
  });
});

describe("Sprint 23 — behaviorModifiers.ts: resolveChillChancePercent", () => {
  test("sem Safira ativa: 0% de chance", () => {
    assert.equal(resolveChillChancePercent([]), 0);
  });

  test("Safira soma seu magnitude como % de chance", () => {
    assert.equal(resolveChillChancePercent([behavior({ behaviorKind: "chanceToChill", magnitude: 10 })]), 10);
  });

  test("outros Behaviors (não-chill) nunca contribuem pra chance de congelar", () => {
    assert.equal(resolveChillChancePercent([behavior({ behaviorKind: "bonusResistance", magnitude: 50 })]), 0);
  });
});

describe("Sprint 23 — behaviorModifiers.ts: resolveDefensiveDamageMultiplier", () => {
  test("sem Ametista e sem chill: multiplicador neutro (1)", () => {
    assert.equal(resolveDefensiveDamageMultiplier([], false), 1);
  });

  test("Ametista reduz o multiplicador em magnitude% (5% -> 0.95)", () => {
    assert.equal(resolveDefensiveDamageMultiplier([behavior({ behaviorKind: "bonusResistance", magnitude: 5 })], false), 0.95);
  });

  test("chill procced reduz o dano pela metade — combinado MULTIPLICATIVAMENTE com resistência, nunca somado", () => {
    const multiplier = resolveDefensiveDamageMultiplier([behavior({ behaviorKind: "bonusResistance", magnitude: 5 })], true);
    assert.equal(multiplier, 0.95 * 0.5);
  });

  test("multiplicador nunca fica negativo mesmo com resistência somando mais de 100%", () => {
    const multiplier = resolveDefensiveDamageMultiplier(
      [behavior({ behaviorKind: "bonusResistance", magnitude: 80 }), behavior({ behaviorKind: "bonusResistance", magnitude: 80 })],
      false,
    );
    assert.ok(multiplier >= 0);
  });
});

describe("Sprint 23 — behaviorModifiers.ts: resolveRegenBonus", () => {
  test("sem Esmeralda ativa: 0 de regen bônus", () => {
    assert.equal(resolveRegenBonus([]), 0);
  });

  test("Esmeralda soma seu magnitude como vida flat", () => {
    assert.equal(resolveRegenBonus([behavior({ behaviorKind: "regenPerTick", magnitude: 4 })]), 4);
  });

  test("múltiplas Esmeraldas somam (2 sockets, mesma Build)", () => {
    assert.equal(
      resolveRegenBonus([behavior({ socketId: "s1", behaviorKind: "regenPerTick", magnitude: 4 }), behavior({ socketId: "s2", behaviorKind: "regenPerTick", magnitude: 4 })]),
      8,
    );
  });
});
