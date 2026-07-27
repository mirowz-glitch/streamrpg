import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { RecentFind } from "./backpackFinds.js";
import type { BackpackSignals } from "./backpackSignals.js";
import { buildCityWelcomeLines } from "./cityWelcome.js";

// City Foundation Phase I — Fase 2 ("Cidade Viva"). Confirma que o
// resumo (a) sempre abre com a mesma frase de chegada, (b) menciona a
// contagem real de achados recentes quando existem, (c) nunca inventa
// atividade quando a mochila está vazia, (d) reage à mochila cheia
// mesmo sem achados recentes.
function find(overrides: Partial<RecentFind> = {}): RecentFind {
  return {
    instanceId: "i1",
    name: "Adaga",
    rarity: "common",
    rarityLabel: "Comum",
    regionName: "Bosque Sussurrante",
    timestamp: 1000,
    autoEquipped: false,
    ...overrides,
  };
}

function signals(overrides: Partial<BackpackSignals> = {}): BackpackSignals {
  return { fullness: "normal", manyRecentFinds: false, suggestCityVisit: false, ...overrides };
}

describe("buildCityWelcomeLines", () => {
  test("sempre abre com a mesma frase de chegada", () => {
    const lines = buildCityWelcomeLines([], signals());
    assert.equal(lines[0], "Você acaba de retornar da expedição.");
  });

  test("com achados recentes, menciona a contagem real e sugere Ferreiro/Mercador", () => {
    const lines = buildCityWelcomeLines([find(), find({ instanceId: "i2" })], signals());
    assert.ok(lines.some((line) => line.includes("2 novos itens")));
    assert.ok(lines.some((line) => line.includes("Ferreiro")));
    assert.ok(lines.some((line) => line.includes("Mercador")));
  });

  test("sem achados recentes e mochila normal: nunca inventa atividade", () => {
    const lines = buildCityWelcomeLines([], signals({ fullness: "normal" }));
    assert.ok(!lines.some((line) => line.includes("Ferreiro") || line.includes("Mercador")));
  });

  test("sem achados recentes mas mochila cheia: reage ao acúmulo, não a um achado inexistente", () => {
    const lines = buildCityWelcomeLines([], signals({ fullness: "cheia" }));
    assert.ok(lines.some((line) => line.includes("cheia")));
  });

  test("um único item usa singular ('1 novo item', não '1 novos itens')", () => {
    const lines = buildCityWelcomeLines([find()], signals());
    assert.ok(lines.some((line) => line.includes("1 novo item.")));
  });
});
