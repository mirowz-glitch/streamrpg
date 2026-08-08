import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { InventoryItem } from "@streamrpg/shared";
import { buildSalvageOffers } from "./salvageOffers.js";

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

describe("buildSalvageOffers", () => {
  test("mochila vazia produz nenhuma oferta", () => {
    assert.deepEqual(buildSalvageOffers([]), []);
  });

  test("itens sem power_score (catálogo fixo) nunca viram oferta", () => {
    const offers = buildSalvageOffers([
      item({ id: 1, power_score: null }),
      item({ id: 2, power_score: 20 }),
    ]);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].item.id, 2);
  });

  test("itens EQUIPADOS também aparecem (diferente de Merchant/Blacksmith)", () => {
    const offers = buildSalvageOffers([item({ id: 1, is_equipped: true, power_score: 15 })]);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].item.is_equipped, true);
  });

  test("cada oferta traz as recompensas calculadas pela mesma função pura do servidor", () => {
    const offers = buildSalvageOffers([item({ rarity: "rare", upgrade_level: 2, power_score: 30 })]);
    assert.equal(offers.length, 1);
    assert.equal(offers[0].rewards.length, 1);
    assert.equal(offers[0].rewards[0].resourceId, "materials");
    assert.ok(offers[0].rewards[0].amount > 0);
  });
});
