import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { InventoryItem } from "@streamrpg/shared";
import { buildMerchantOffers } from "./merchantOffers.js";

function item(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 1,
    item_id: 1,
    slug: "adaga",
    name: "Adaga",
    description: "",
    rarity: "common",
    slot: "weapon",
    min_level: 1,
    is_equipped: false,
    equipped_slot: null,
    obtained_at: new Date().toISOString(),
    damage_type: "physical",
    uti_bonus: 0,
    power_score: null,
    upgrade_level: 0,
    ...overrides,
  };
}

describe("buildMerchantOffers", () => {
  test("inventário vazio produz nenhuma oferta", () => {
    assert.deepEqual(buildMerchantOffers([]), []);
  });

  test("itens equipados nunca viram oferta", () => {
    const offers = buildMerchantOffers([item({ id: 1, is_equipped: true }), item({ id: 2, is_equipped: false })]);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].item.id, 2);
  });

  test("cada oferta traz o valor de venda calculado pela mesma função pura do servidor", () => {
    const offers = buildMerchantOffers([item({ rarity: "rare", min_level: 5 })]);
    assert.equal(offers.length, 1);
    assert.ok(offers[0].saleValue > 0);
    // rare > common no mesmo nível — confirma que a raridade influencia o preview
    const commonOffers = buildMerchantOffers([item({ rarity: "common", min_level: 5 })]);
    assert.ok(offers[0].saleValue > commonOffers[0].saleValue);
  });
});
