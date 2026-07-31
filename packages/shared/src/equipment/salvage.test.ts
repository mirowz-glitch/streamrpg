import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateSaleValue } from "../economy/saleValue.js";
import { calculateSalvageRewards } from "./salvage.js";
import type { ItemRarity } from "../types.js";

const RARITIES: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

test("calculateSalvageRewards grows with rarity", () => {
  const amounts = RARITIES.map(
    (rarity) => calculateSalvageRewards({ rarity, upgrade_level: 0, power_score: 10 })[0].amount,
  );
  for (let i = 1; i < amounts.length; i += 1) {
    assert.ok(amounts[i] > amounts[i - 1]);
  }
});

test("calculateSalvageRewards grows with upgrade_level (itens investidos rendem mais)", () => {
  const level0 = calculateSalvageRewards({ rarity: "rare", upgrade_level: 0, power_score: 30 })[0].amount;
  const level3 = calculateSalvageRewards({ rarity: "rare", upgrade_level: 3, power_score: 30 })[0].amount;
  assert.equal(level3, level0 + 3 * 6);
  assert.ok(level3 > level0);
});

test("calculateSalvageRewards retorna uma lista com resourceId materials", () => {
  const rewards = calculateSalvageRewards({ rarity: "common", upgrade_level: 0, power_score: 5 });
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].resourceId, "materials");
  assert.ok(Number.isInteger(rewards[0].amount));
  assert.ok(rewards[0].amount > 0);
});

test("calculateSalvageRewards é determinístico e puro", () => {
  const a = calculateSalvageRewards({ rarity: "epic", upgrade_level: 2, power_score: 40 });
  const b = calculateSalvageRewards({ rarity: "epic", upgrade_level: 2, power_score: 40 });
  assert.deepEqual(a, b);
});

test("calculateSalvageRewards lança erro para itens sem power_score (catálogo fixo, não elegível)", () => {
  assert.throws(() => calculateSalvageRewards({ rarity: "common", upgrade_level: 0, power_score: null }));
});

describe("invariante econômica (Seção 3 da prep doc) — régua mais frouxa que Blacksmith", () => {
  test("o rendimento em materials nunca é zero nem negativo, em qualquer raridade/nível", () => {
    for (const rarity of RARITIES) {
      for (const level of [0, 1, 5, 10]) {
        const amount = calculateSalvageRewards({ rarity, upgrade_level: level, power_score: 10 })[0].amount;
        assert.ok(amount > 0, `${rarity} lvl${level}: amount=${amount} deveria ser positivo`);
      }
    }
  });

  test("recursos concedidos por materials permanecem numa ordem de grandeza comparável ao valor de venda em Ouro (nenhum dos dois domina completamente)", () => {
    for (const rarity of RARITIES) {
      const materials = calculateSalvageRewards({ rarity, upgrade_level: 0, power_score: 10 })[0].amount;
      const gold = calculateSaleValue({ rarity, min_level: 1 });
      assert.ok(materials > 0 && gold > 0);
    }
  });
});
