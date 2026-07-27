import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type { RecentFind } from "./backpackFinds.js";
import type { BackpackSignals } from "./backpackSignals.js";
import { buildCitySuggestions } from "./citySuggestions.js";

// City Foundation Phase I — Fase 4 ("Sugestões Inteligentes"). Confirma
// que (a) o Mercador reage a QUALQUER achado recente (equipado ou
// não), (b) o Ferreiro reage SÓ a achados auto-equipados (peças novas
// de verdade no personagem), (c) a sugestão geral só aparece com a
// mochila "cheia", (d) nenhuma sugestão aparece sem nenhum sinal real.
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

describe("buildCitySuggestions", () => {
  test("sem nenhum achado recente e mochila normal: nenhuma sugestão", () => {
    const result = buildCitySuggestions([], signals());
    assert.equal(result.merchant, null);
    assert.equal(result.blacksmith, null);
    assert.equal(result.general, null);
  });

  test("Mercador reage a QUALQUER achado recente, mesmo não-equipado", () => {
    const result = buildCitySuggestions([find({ autoEquipped: false })], signals());
    assert.notEqual(result.merchant, null);
  });

  test("Ferreiro só reage a achados AUTO-EQUIPADOS — um achado comum não-equipado não é suficiente", () => {
    const result = buildCitySuggestions([find({ autoEquipped: false })], signals());
    assert.equal(result.blacksmith, null);
  });

  test("Ferreiro reage quando existe pelo menos um achado auto-equipado", () => {
    const result = buildCitySuggestions([find({ autoEquipped: true })], signals());
    assert.notEqual(result.blacksmith, null);
  });

  test("sugestão geral só aparece com a mochila 'cheia'", () => {
    assert.equal(buildCitySuggestions([], signals({ fullness: "leve" })).general, null);
    assert.equal(buildCitySuggestions([], signals({ fullness: "normal" })).general, null);
    assert.notEqual(buildCitySuggestions([], signals({ fullness: "cheia" })).general, null);
  });
});
