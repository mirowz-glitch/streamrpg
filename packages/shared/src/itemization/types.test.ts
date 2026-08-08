import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { derivePotentialFromSeed, createDefaultQuality } from "./types.js";

// Sprint 11 — Persistent Items + Affixes, Fase 3/4: cobre a derivação
// determinística do Item Potential (mesmo seed do Item Generator,
// nenhuma nova fonte de RNG) e o valor neutro do Item Quality.
describe("derivePotentialFromSeed", () => {
  test("determinístico: mesmo seed produz sempre o mesmo ceilingFraction", () => {
    const first = derivePotentialFromSeed(12345, "2026-01-01T00:00:00.000Z");
    const second = derivePotentialFromSeed(12345, "2026-01-01T00:00:00.000Z");
    assert.deepEqual(first, second);
  });

  test("seeds diferentes tendem a produzir ceilingFraction diferente", () => {
    const a = derivePotentialFromSeed(1, "2026-01-01T00:00:00.000Z");
    const b = derivePotentialFromSeed(2, "2026-01-01T00:00:00.000Z");
    assert.notEqual(a.ceilingFraction, b.ceilingFraction);
  });

  test("ceilingFraction sempre entre 0.6 e 1.0 (a faixa documentada)", () => {
    for (const seed of [0, 1, 42, 999999, 2147483647]) {
      const potential = derivePotentialFromSeed(seed, "2026-01-01T00:00:00.000Z");
      assert.ok(potential.ceilingFraction >= 0.6 && potential.ceilingFraction <= 1.0);
    }
  });

  test("rolledAt reflete exatamente o timestamp recebido", () => {
    const potential = derivePotentialFromSeed(7, "2026-03-15T12:00:00.000Z");
    assert.equal(potential.rolledAt, "2026-03-15T12:00:00.000Z");
  });
});

describe("createDefaultQuality", () => {
  test("nasce em value: 0, sem atributo escalado (nenhum craft ainda aconteceu)", () => {
    assert.deepEqual(createDefaultQuality(), { value: 0, scalesAttribute: "" });
  });
});
