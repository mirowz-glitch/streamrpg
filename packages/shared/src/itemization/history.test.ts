import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createItemHistory, deriveItemLegacyFromHistory, appendItemHistoryEvent, recordKingdomVisit } from "./history.js";

// Sprint 10 — Itemization 2.0 prep, Fase 6. Mesmo princípio de "nunca
// apagar" já usado por Housing/Real Estate — cobre só a criação e a
// derivação pura, nenhuma persistência real existe ainda.
describe("createItemHistory", () => {
  test("um item novo começa com 1 dono e um único evento 'created'", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    assert.equal(history.ownerCount, 1);
    assert.equal(history.firstOwnerCharacterId, "character-1");
    assert.equal(history.currentOwnerCharacterId, "character-1");
    assert.equal(history.events.length, 1);
    assert.equal(history.events[0]!.event, "created");
  });

  test("playersKilledWith começa em 0 — PvP não existe até Kingdom Wars (roadmap item 12)", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    assert.equal(history.playersKilledWith, 0);
  });
});

describe("deriveItemLegacyFromHistory", () => {
  test("deriva ownerCount/bossesWitnessed/kingdomsVisited direto do histórico, sem reinventar nada", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history.ownerCount = 3;
    history.bossesDefeatedWith = 2;
    history.kingdomsVisited = ["kingdom-a", "kingdom-b"];

    const legacy = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-11T00:00:00.000Z");
    assert.equal(legacy.ownerCount, 3);
    assert.equal(legacy.bossesWitnessed, 2);
    assert.equal(legacy.kingdomsVisited, 2);
    assert.equal(legacy.ageInDays, 10);
  });

  test("ageInDays nunca é negativo, mesmo com timestamps invertidos por engano", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-10T00:00:00.000Z");
    const legacy = deriveItemLegacyFromHistory(history, "2026-01-10T00:00:00.000Z", "2026-01-01T00:00:00.000Z");
    assert.equal(legacy.ageInDays, 0);
  });

  test("determinístico: mesma entrada produz sempre a mesma saída", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const first = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    const second = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    assert.deepEqual(first, second);
  });
});

// Sprint 14 — Legendary Items + Legacy System, Fase 3/5: os campos novos
// de ItemLegacy (economia/posse), que só existem depois que
// "sold"/"salvaged" viraram eventos reais.
describe("deriveItemLegacyFromHistory (Sprint 14: economia/posse)", () => {
  test("soldCount/highestSalePrice derivam dos eventos 'sold', pegando o maior preço", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sold", "character-1", "100", "2026-01-02T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sold", "character-1", "250", "2026-01-03T00:00:00.000Z");

    const legacy = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    assert.equal(legacy.soldCount, 2);
    assert.equal(legacy.highestSalePrice, 250);
  });

  test("nunca vendido: soldCount 0, highestSalePrice null", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const legacy = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    assert.equal(legacy.soldCount, 0);
    assert.equal(legacy.highestSalePrice, null);
  });

  test("salvagedCount conta eventos 'salvaged'", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "salvaged", "character-1", "materials:5", "2026-01-02T00:00:00.000Z");
    const legacy = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    assert.equal(legacy.salvagedCount, 1);
  });

  test("sphereEventsCount soma 'sphere_applied' + 'sealed'", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sphere_applied", "character-1", "fortune", "2026-01-02T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sealed", "character-1", "curse", "2026-01-03T00:00:00.000Z");
    const legacy = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    assert.equal(legacy.sphereEventsCount, 2);
  });

  test("firstOwnerCharacterId/currentOwnerCharacterId são passthrough do history", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const legacy = deriveItemLegacyFromHistory(history, "2026-01-01T00:00:00.000Z", "2026-01-05T00:00:00.000Z");
    assert.equal(legacy.firstOwnerCharacterId, "character-1");
    assert.equal(legacy.currentOwnerCharacterId, "character-1");
  });
});

describe("recordKingdomVisit (Sprint 14, Fase 6)", () => {
  test("primeira visita a um Reino anexa 'kingdom_visited' e adiciona ao array deduplicado", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const updated = recordKingdomVisit(history, "kingdom-a", "character-1", "2026-01-02T00:00:00.000Z");
    assert.deepEqual(updated.kingdomsVisited, ["kingdom-a"]);
    assert.equal(updated.events.length, 2);
    assert.equal(updated.events[1]!.event, "kingdom_visited");
    assert.equal(updated.events[1]!.detail, "kingdom-a");
  });

  test("visitar o MESMO Reino de novo é um no-op — nunca duplica no array nem no log", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = recordKingdomVisit(history, "kingdom-a", "character-1", "2026-01-02T00:00:00.000Z");
    const again = recordKingdomVisit(history, "kingdom-a", "character-1", "2026-01-03T00:00:00.000Z");
    assert.deepEqual(again.kingdomsVisited, ["kingdom-a"]);
    assert.equal(again.events.length, 2);
  });

  test("um segundo Reino DIFERENTE soma ao array, nunca substitui", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = recordKingdomVisit(history, "kingdom-a", "character-1", "2026-01-02T00:00:00.000Z");
    history = recordKingdomVisit(history, "kingdom-b", "character-1", "2026-01-03T00:00:00.000Z");
    assert.deepEqual(history.kingdomsVisited, ["kingdom-a", "kingdom-b"]);
  });
});

// Sprint 11 — Persistent Items + Affixes, Fase 6: `appendItemHistoryEvent`
// vira a função REAL de escrita (apps/api/src/services/drop.service.ts,
// sphere.service.ts) — append-only, nunca muta o histórico recebido.
describe("appendItemHistoryEvent", () => {
  test("anexa um evento novo sem apagar os já existentes", () => {
    const original = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const updated = appendItemHistoryEvent(original, "upgraded", "character-1", "power_score -> 42", "2026-01-02T00:00:00.000Z");
    assert.equal(updated.events.length, 2);
    assert.equal(updated.events[0]!.event, "created");
    assert.equal(updated.events[1]!.event, "upgraded");
    assert.equal(updated.events[1]!.detail, "power_score -> 42");
  });

  test("nunca muta o histórico recebido (devolve um objeto novo)", () => {
    const original = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const originalEventCount = original.events.length;
    appendItemHistoryEvent(original, "sealed", "character-1", "sphere:curse", "2026-01-02T00:00:00.000Z");
    assert.equal(original.events.length, originalEventCount);
  });
});
