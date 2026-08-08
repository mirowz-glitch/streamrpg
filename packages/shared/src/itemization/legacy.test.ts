/**
 * Sprint 14 — Legendary Items + Legacy System. Testa a classificação
 * pura de eventos (deriveLegacyEvents), o título automático
 * (deriveAutomaticTitle) e o resumo pronto pra UI (deriveLegacySummary)
 * — nenhuma dependência de banco, nenhuma mudança de gameplay (a
 * filosofia obrigatória desta Sprint: "só história, nunca poder").
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createItemHistory, appendItemHistoryEvent, type ItemHistoryEventType } from "./history.js";
import { deriveLegacyEvents, deriveAutomaticTitle, deriveLegacySummary } from "./legacy.js";

describe("deriveLegacyEvents", () => {
  test("um item recém-criado tem exatamente 1 LegacyEvent, categoria 'creation'", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const events = deriveLegacyEvents(history);
    assert.equal(events.length, 1);
    assert.equal(events[0]!.type, "created");
    assert.equal(events[0]!.category, "creation");
  });

  test("a PRIMEIRA ocorrência de um tipo é promovida um degrau de importância acima da 2ª+", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sold", "character-1", "100", "2026-01-02T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sold", "character-1", "200", "2026-01-03T00:00:00.000Z");

    const events = deriveLegacyEvents(history);
    const soldEvents = events.filter((e) => e.type === "sold");
    assert.equal(soldEvents.length, 2);
    // "sold" tem importance base "notable" — a primeira ocorrência sobe pra "major".
    assert.equal(soldEvents[0]!.importance, "major");
    assert.equal(soldEvents[1]!.importance, "notable");
  });

  test("importância nunca ultrapassa 'legendary' mesmo promovendo um evento já 'major'", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sealed", "character-1", "sphere:curse", "2026-01-02T00:00:00.000Z");
    const events = deriveLegacyEvents(history);
    const sealedEvent = events.find((e) => e.type === "sealed")!;
    // "sealed" já é "major" na base — promovido (1ª ocorrência) vira "legendary", nunca estoura.
    assert.equal(sealedEvent.importance, "legendary");
  });

  test("determinístico: mesma entrada produz sempre a mesma saída", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "upgraded", "character-1", "power_score -> 20", "2026-01-02T00:00:00.000Z");
    assert.deepEqual(deriveLegacyEvents(history), deriveLegacyEvents(history));
  });

  test("nunca inventa um evento que não está em history.events — mesmo tamanho de array", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "boss_defeated_with", "character-1", "Dragão", "2026-01-02T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "kingdom_visited", "character-1", "kingdom-a", "2026-01-03T00:00:00.000Z");
    assert.equal(deriveLegacyEvents(history).length, history.events.length);
  });

  test("Sprint 17 — um tipo de evento antigo/desconhecido (ex.: 'failed_reveal' já persistido) nunca lança, classifica via fallback craft/minor/private", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    // Simula um item persistido em Sprint anterior, cujo `history.events`
    // já contém um tipo removido do vocabulário atual (Fase 2 desta
    // Sprint removeu "failed_reveal"). `history.events` é append-only —
    // nunca reescrito — então a leitura precisa continuar funcionando.
    history.events.push({
      event: "failed_reveal" as ItemHistoryEventType,
      characterId: "character-1",
      detail: "legado de Sprint anterior",
      at: "2026-01-02T00:00:00.000Z",
    });

    assert.doesNotThrow(() => deriveLegacyEvents(history));
    const events = deriveLegacyEvents(history);
    const unknownEvent = events.find((e) => e.type === ("failed_reveal" as ItemHistoryEventType))!;
    assert.ok(unknownEvent);
    // Primeira ocorrência é promovida um degrau: minor -> notable.
    assert.equal(unknownEvent.category, "craft");
    assert.equal(unknownEvent.importance, "notable");
    assert.equal(unknownEvent.visibility, "private");
  });
});

describe("deriveAutomaticTitle (Fase 7 — só infraestrutura, nenhuma reivindicação global)", () => {
  test("um item nunca selado não ganha título", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    assert.equal(deriveAutomaticTitle("Espada Comum", history), null);
  });

  test("um item selado pela Esfera da Maldição ganha um título determinístico", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sealed", "character-1", "sphere:curse", "2026-01-02T00:00:00.000Z");
    const title = deriveAutomaticTitle("Espada Amaldiçoada", history);
    assert.ok(title);
    assert.ok(title!.includes("Espada Amaldiçoada"));
  });

  test("bosses derrotados sozinhos NUNCA produzem título (reivindicação global fora de escopo)", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "boss_defeated_with", "character-1", "Dragão", "2026-01-02T00:00:00.000Z");
    assert.equal(deriveAutomaticTitle("Espada do Caçador", history), null);
  });
});

describe("deriveLegacySummary (Fase 8/9)", () => {
  test("headline nunca inventa dono/idade que o histórico não sustenta", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const events = deriveLegacyEvents(history);
    const summary = deriveLegacySummary("Item de Teste", history, events, 5);
    assert.ok(summary.headline.includes("5 dias"));
    assert.ok(summary.headline.includes("1 dono"));
  });

  test("item recém-encontrado (idade 0) usa a frase curta, sem 'dias de história'", () => {
    const history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    const events = deriveLegacyEvents(history);
    const summary = deriveLegacySummary("Item Novo", history, events, 0);
    assert.ok(summary.headline.includes("recém-encontrado"));
  });

  test("highlights só inclui eventos públicos de importância major/legendary, mais recentes primeiro, capado em 5", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    for (let i = 0; i < 8; i++) {
      history = appendItemHistoryEvent(history, "boss_defeated_with", "character-1", `Chefe ${i}`, `2026-01-0${(i % 9) + 1}T00:00:00.000Z`);
    }
    const events = deriveLegacyEvents(history);
    const summary = deriveLegacySummary("Item de Teste", history, events, 10);
    assert.ok(summary.highlights.length <= 5);
    assert.ok(summary.highlights.every((h) => h.visibility === "public"));
  });

  test("título vem de deriveAutomaticTitle — nunca calculado de outro jeito", () => {
    let history = createItemHistory("adventure-loot", "character-1", "2026-01-01T00:00:00.000Z");
    history = appendItemHistoryEvent(history, "sealed", "character-1", "sphere:curse", "2026-01-02T00:00:00.000Z");
    const events = deriveLegacyEvents(history);
    const summary = deriveLegacySummary("Espada", history, events, 1);
    assert.equal(summary.title, deriveAutomaticTitle("Espada", history));
  });
});
