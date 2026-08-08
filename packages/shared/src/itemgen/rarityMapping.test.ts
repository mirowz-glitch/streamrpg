import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeItemRarity } from "./rarityMapping.js";

// World Autonomy Phase II (Vision 2.0, Sprint 9) — bug fix. Cobre as duas
// entradas reais que este módulo precisa traduzir: as 4 raridades do Item
// Generator (itemgen/rarities.ts) e as 5 já válidas de `ItemRarity`
// (types.ts), que devem passar direto (sem isso, "uncommon"/"epic" —
// usados hoje nos fixtures de merchant/salvage/blacksmith.service.test.ts —
// virariam "common" incorretamente).
describe("normalizeItemRarity", () => {
  test("raridades do Item Generator são traduzidas para ItemRarity", () => {
    assert.equal(normalizeItemRarity("common"), "common");
    assert.equal(normalizeItemRarity("magic"), "uncommon");
    assert.equal(normalizeItemRarity("rare"), "rare");
    assert.equal(normalizeItemRarity("unique"), "legendary");
  });

  test("raridades já válidas de ItemRarity passam direto, sem remapear", () => {
    assert.equal(normalizeItemRarity("common"), "common");
    assert.equal(normalizeItemRarity("uncommon"), "uncommon");
    assert.equal(normalizeItemRarity("rare"), "rare");
    assert.equal(normalizeItemRarity("epic"), "epic");
    assert.equal(normalizeItemRarity("legendary"), "legendary");
  });

  test("valor desconhecido cai em common (fallback defensivo)", () => {
    assert.equal(normalizeItemRarity("nao-existe"), "common");
  });
});
