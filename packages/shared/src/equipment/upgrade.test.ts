import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateSaleValue } from "../economy/saleValue.js";
import { calculateUpgrade, calculateUpgradeCost } from "./upgrade.js";
import type { ItemRarity } from "../types.js";

const RARITIES: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

test("calculateUpgradeCost grows with rarity", () => {
  const costs = RARITIES.map((rarity) => calculateUpgradeCost({ rarity, upgrade_level: 0 }));
  for (let i = 1; i < costs.length; i += 1) {
    assert.ok(costs[i] > costs[i - 1]);
  }
});

test("calculateUpgradeCost grows with upgrade_level", () => {
  const level0 = calculateUpgradeCost({ rarity: "rare", upgrade_level: 0 });
  const level3 = calculateUpgradeCost({ rarity: "rare", upgrade_level: 3 });
  assert.equal(level3, level0 + 3 * 15);
});

test("calculateUpgradeCost is a pure integer, deterministic", () => {
  const a = calculateUpgradeCost({ rarity: "epic", upgrade_level: 2 });
  const b = calculateUpgradeCost({ rarity: "epic", upgrade_level: 2 });
  assert.equal(a, b);
  assert.equal(Number.isInteger(a), true);
});

test("calculateUpgrade returns nextLevel/cost/newPowerScore", () => {
  const result = calculateUpgrade({ rarity: "rare", upgrade_level: 2, power_score: 50 });
  assert.equal(result.nextLevel, 3);
  assert.equal(result.cost, calculateUpgradeCost({ rarity: "rare", upgrade_level: 2 }));
  assert.equal(result.newPowerScore, 55);
});

test("calculateUpgrade throws for items without power_score", () => {
  assert.throws(() => calculateUpgrade({ rarity: "common", upgrade_level: 0, power_score: null }));
});

// Blacksmith Phase I Seção 3 — invariante econômica anti-incentivo
// perverso: melhorar nunca pode ser mais barato que vender e recomprar.
test("upgrade cost always exceeds sale value, at upgrade_level 0, for every rarity", () => {
  for (const rarity of RARITIES) {
    const cost = calculateUpgradeCost({ rarity, upgrade_level: 0 });
    const saleValue = calculateSaleValue({ rarity, min_level: 1 });
    assert.ok(cost > saleValue, `${rarity}: cost=${cost} should exceed saleValue=${saleValue}`);
  }
});

test("upgrade cost always exceeds sale value at higher upgrade levels too", () => {
  for (const rarity of RARITIES) {
    for (const level of [1, 5, 10]) {
      const cost = calculateUpgradeCost({ rarity, upgrade_level: level });
      const saleValue = calculateSaleValue({ rarity, min_level: 1 });
      assert.ok(cost > saleValue, `${rarity} lvl${level}: cost=${cost} should exceed saleValue=${saleValue}`);
    }
  }
});
