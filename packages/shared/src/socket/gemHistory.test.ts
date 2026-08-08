import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createGemHistory, appendGemHistoryEvent } from "./gemHistory.js";

describe("createGemHistory", () => {
  test("uma Gema nova começa com um único evento 'created'", () => {
    const history = createGemHistory("character-1", "2026-01-01T00:00:00.000Z");
    assert.equal(history.events.length, 1);
    assert.equal(history.events[0]!.event, "created");
    assert.equal(history.events[0]!.characterId, "character-1");
  });
});

describe("appendGemHistoryEvent", () => {
  test("anexa um evento novo sem apagar os já existentes", () => {
    const original = createGemHistory("character-1", "2026-01-01T00:00:00.000Z");
    const updated = appendGemHistoryEvent(original, "socketed", "character-1", "item:42,socket:socket-1", "2026-01-02T00:00:00.000Z");
    assert.equal(updated.events.length, 2);
    assert.equal(updated.events[0]!.event, "created");
    assert.equal(updated.events[1]!.event, "socketed");
    assert.equal(updated.events[1]!.detail, "item:42,socket:socket-1");
  });

  test("nunca muta o histórico recebido (devolve um objeto novo)", () => {
    const original = createGemHistory("character-1", "2026-01-01T00:00:00.000Z");
    const originalCount = original.events.length;
    appendGemHistoryEvent(original, "unsocketed", "character-1", null, "2026-01-02T00:00:00.000Z");
    assert.equal(original.events.length, originalCount);
  });

  test("uma sequência inserção -> remoção -> troca preserva TODOS os eventos, nada é apagado", () => {
    let history = createGemHistory("character-1", "2026-01-01T00:00:00.000Z");
    history = appendGemHistoryEvent(history, "socketed", "character-1", "item:1", "2026-01-02T00:00:00.000Z");
    history = appendGemHistoryEvent(history, "unsocketed", "character-1", "item:1", "2026-01-03T00:00:00.000Z");
    history = appendGemHistoryEvent(history, "swapped", "character-1", "item:1->item:2", "2026-01-04T00:00:00.000Z");
    assert.equal(history.events.length, 4);
    assert.deepEqual(
      history.events.map((e) => e.event),
      ["created", "socketed", "unsocketed", "swapped"],
    );
  });
});
