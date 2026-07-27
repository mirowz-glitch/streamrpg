import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { classifyBackpackFullness, deriveBackpackSignals } from "./backpackSignals.js";
import { DEMO_INVENTORY_CAPACITY } from "../hooks/useAdventureSession.js";

// Backpack Experience Phase I — Fase 5 ("Sinais de Mochila"): confirma
// que a classificação é puramente informativa (nenhum gate) e usa a
// MESMA referência de capacidade que o motor já define
// (DEMO_INVENTORY_CAPACITY) — nenhum número novo inventado.
describe("classifyBackpackFullness", () => {
  test("0 itens é sempre 'leve'", () => {
    assert.equal(classifyBackpackFullness(0), "leve");
  });

  test("perto da capacidade real é 'cheia'", () => {
    assert.equal(classifyBackpackFullness(DEMO_INVENTORY_CAPACITY), "cheia");
    assert.equal(classifyBackpackFullness(DEMO_INVENTORY_CAPACITY - 1), "cheia");
  });

  test("uma contagem intermediária é 'normal'", () => {
    const middle = Math.floor(DEMO_INVENTORY_CAPACITY / 2);
    assert.equal(classifyBackpackFullness(middle), "normal");
  });

  test("nunca lança nem retorna algo fora das 3 categorias, mesmo com contagens extremas", () => {
    for (const count of [0, 1, DEMO_INVENTORY_CAPACITY, DEMO_INVENTORY_CAPACITY * 5, -1]) {
      const result = classifyBackpackFullness(count);
      assert.ok(result === "leve" || result === "normal" || result === "cheia");
    }
  });
});

describe("deriveBackpackSignals", () => {
  test("mochila cheia sempre sugere visitar a cidade, mesmo com poucas descobertas recentes", () => {
    const signals = deriveBackpackSignals(DEMO_INVENTORY_CAPACITY, 0);
    assert.equal(signals.fullness, "cheia");
    assert.equal(signals.manyRecentFinds, false);
    assert.equal(signals.suggestCityVisit, true);
  });

  test("muitas descobertas recentes também sugerem visitar a cidade, mesmo com a mochila leve", () => {
    const signals = deriveBackpackSignals(0, 5);
    assert.equal(signals.fullness, "leve");
    assert.equal(signals.manyRecentFinds, true);
    assert.equal(signals.suggestCityVisit, true);
  });

  test("mochila normal com poucas descobertas recentes não sugere nada", () => {
    const middle = Math.floor(DEMO_INVENTORY_CAPACITY / 2);
    const signals = deriveBackpackSignals(middle, 1);
    assert.equal(signals.suggestCityVisit, false);
  });
});
