import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MAP_MODIFIER_REGISTRY,
  getMapModifier,
  listMapModifiers,
  listMapModifiersByCategory,
} from "./mapModifierRegistry.js";
import type { MapModifierCategory } from "./types.js";

// Sprint 32 — Map Modifiers Phase I. Fase 8: cobertura do Registry —
// pura infraestrutura, sem RNG/DB/rede, nenhum consumidor real ainda
// (nenhum sistema de combate/encontro/loot/economia lê nada daqui).

describe("MapModifier Registry (Fase 3/4) — 8 exemplos literais do brief, 'nada além disso'", () => {
  test("exatamente 8 Mods, ids únicos, todos enabled", () => {
    assert.equal(MAP_MODIFIER_REGISTRY.length, 8);
    const ids = MAP_MODIFIER_REGISTRY.map((mod) => mod.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const mod of listMapModifiers()) {
      assert.equal(mod.enabled, true);
    }
  });

  test("todo Mod é Tier 1 nesta Fase — 'sem balanceamento', nenhuma progressão de tier inventada", () => {
    for (const mod of listMapModifiers()) {
      assert.equal(mod.tier, 1);
    }
  });

  test("todo Mod tem peso positivo (neutro, 10) — rolagem ponderada real fica pra uma Sprint futura", () => {
    for (const mod of listMapModifiers()) {
      assert.equal(mod.weight, 10);
    }
  });

  test("os 8 exemplos literais do brief batem exatamente (categoria + percentual)", () => {
    const expected: Record<string, { category: MapModifierCategory; magnitudePercent: number }> = {
      "monster-damage-up": { category: "combat", magnitudePercent: 20 },
      "monster-life-up": { category: "combat", magnitudePercent: 40 },
      "gold-quantity-up": { category: "economy", magnitudePercent: 35 },
      "elite-chance-up": { category: "encounter", magnitudePercent: 25 },
      "experience-up": { category: "progression", magnitudePercent: 15 },
      "loot-quantity-up": { category: "economy", magnitudePercent: 20 },
      "rarity-up": { category: "economy", magnitudePercent: 30 },
      "boss-power-up": { category: "encounter", magnitudePercent: 0 },
    };
    assert.deepEqual(new Set(Object.keys(expected)), new Set(MAP_MODIFIER_REGISTRY.map((m) => m.id)));
    for (const [id, spec] of Object.entries(expected)) {
      const mod = getMapModifier(id)!;
      assert.ok(mod, `Mod "${id}" não encontrado no Registry`);
      assert.equal(mod.category, spec.category);
      assert.equal(mod.magnitudePercent, spec.magnitudePercent);
    }
  });

  test("getMapModifier devolve undefined pra um id desconhecido", () => {
    assert.equal(getMapModifier("nao-existe"), undefined);
  });

  test("listMapModifiersByCategory filtra corretamente e cobre as 4 categorias reais", () => {
    const categories: MapModifierCategory[] = ["combat", "encounter", "economy", "progression"];
    let total = 0;
    for (const category of categories) {
      const mods = listMapModifiersByCategory(category);
      assert.ok(mods.length > 0, `categoria "${category}" sem nenhum Mod`);
      for (const mod of mods) assert.equal(mod.category, category);
      total += mods.length;
    }
    assert.equal(total, MAP_MODIFIER_REGISTRY.length);
  });

  test("nenhuma categoria além das 4 documentadas existe no Registry", () => {
    const allowed = new Set<MapModifierCategory>(["combat", "encounter", "economy", "progression"]);
    for (const mod of listMapModifiers()) {
      assert.ok(allowed.has(mod.category), `categoria inesperada "${mod.category}" no Mod "${mod.id}"`);
    }
  });
});
