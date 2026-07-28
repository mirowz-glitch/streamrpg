import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { EquippedItem } from "@streamrpg/shared";
import { buildBlacksmithOffers } from "./blacksmithOffers.js";

function equippedItem(overrides: Partial<EquippedItem> = {}): EquippedItem {
  return {
    slot: "weapon",
    character_item_id: 1,
    name: "Adaga",
    rarity: "common",
    damage_type: "physical",
    uti_bonus: 0,
    min_level: 1,
    power_score: 10,
    upgrade_level: 0,
    ...overrides,
  };
}

describe("buildBlacksmithOffers", () => {
  test("nenhum item equipado produz nenhuma oferta", () => {
    assert.deepEqual(buildBlacksmithOffers([]), []);
  });

  test("itens sem power_score (catálogo fixo) nunca viram oferta", () => {
    const offers = buildBlacksmithOffers([
      equippedItem({ character_item_id: 1, power_score: null }),
      equippedItem({ character_item_id: 2, power_score: 20 }),
    ]);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].item.character_item_id, 2);
  });

  test("cada oferta traz o resultado calculado pela mesma função pura do servidor", () => {
    const offers = buildBlacksmithOffers([equippedItem({ rarity: "rare", upgrade_level: 2, power_score: 30 })]);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].upgrade.nextLevel, 3);
    assert.equal(offers[0].upgrade.newPowerScore, 35);
    assert.ok(offers[0].upgrade.cost > 0);
  });
});
