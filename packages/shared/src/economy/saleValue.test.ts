import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateSaleValue } from "./saleValue.js";
import type { ItemRarity } from "../types.js";

describe("calculateSaleValue", () => {
  test("cada raridade tem um valor base diferente no mesmo nível", () => {
    const rarities: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
    const values = rarities.map((rarity) => calculateSaleValue({ rarity, min_level: 1 }));
    const unique = new Set(values);
    assert.equal(unique.size, rarities.length);
  });

  test("raridade mais alta sempre vale mais que a mais baixa, no mesmo nível", () => {
    const common = calculateSaleValue({ rarity: "common", min_level: 5 });
    const uncommon = calculateSaleValue({ rarity: "uncommon", min_level: 5 });
    const rare = calculateSaleValue({ rarity: "rare", min_level: 5 });
    const epic = calculateSaleValue({ rarity: "epic", min_level: 5 });
    const legendary = calculateSaleValue({ rarity: "legendary", min_level: 5 });
    assert.ok(common < uncommon);
    assert.ok(uncommon < rare);
    assert.ok(rare < epic);
    assert.ok(epic < legendary);
  });

  test("nível mais alto vale mais, na mesma raridade", () => {
    const low = calculateSaleValue({ rarity: "rare", min_level: 1 });
    const high = calculateSaleValue({ rarity: "rare", min_level: 20 });
    assert.ok(high > low);
  });

  test("sempre retorna um inteiro positivo", () => {
    const value = calculateSaleValue({ rarity: "common", min_level: 1 });
    assert.ok(Number.isInteger(value));
    assert.ok(value > 0);
  });

  test("determinístico: mesma entrada sempre produz o mesmo valor", () => {
    const a = calculateSaleValue({ rarity: "epic", min_level: 10 });
    const b = calculateSaleValue({ rarity: "epic", min_level: 10 });
    assert.equal(a, b);
  });
});
