/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — cobre o
 * buffer factual (nunca narrado/variado, ao contrário do Jornal do
 * Reino) e a única fonte deste módulo que usa EventBus (boss.defeated).
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../engine/EventBus.js";
import type { BossDefeatedEvent } from "../engine/types.js";
import { getActivityFeed, pushActivityFeedEntry, registerActivityFeedBusListeners } from "./activityFeed.service.js";

describe("activityFeed.service", () => {
  test("pushActivityFeedEntry adiciona uma entrada real, getActivityFeed devolve mais recente primeiro", () => {
    pushActivityFeedEntry("🏠", "Uma nova casa, Teste, foi construída.", 1_000);
    pushActivityFeedEntry("👑", "O Reino Teste foi fundado.", 2_000);
    const feed = getActivityFeed();
    assert.ok(feed.length >= 2);
    assert.equal(feed[0].timestamp >= feed[1].timestamp, true);
  });

  test("nunca varia o texto — mesmo tipo de evento sempre produz a mesma frase (distinto do Jornal do Reino)", () => {
    pushActivityFeedEntry("💰", "Uma casa foi comprada por 100 de ouro.");
    pushActivityFeedEntry("💰", "Uma casa foi comprada por 200 de ouro.");
    const feed = getActivityFeed();
    assert.ok(feed.every((entry) => !entry.text.includes("Boatos") && !entry.text.includes("Dizem")));
  });

  test("boss.defeated (EventBus real) empurra uma entrada factual", () => {
    const bus = new EventBus();
    registerActivityFeedBusListeners(bus);

    const event: BossDefeatedEvent = { type: "boss.defeated", channelId: "canal-x", bossId: "boss-1", timestamp: 5_000 };
    bus.emit(event);

    const feed = getActivityFeed();
    assert.ok(feed.some((entry) => entry.text === "Um Boss foi derrotado." && entry.timestamp === 5_000));
  });

  test("buffer nunca cresce indefinidamente (cap de 20 entradas)", () => {
    for (let i = 0; i < 30; i++) {
      pushActivityFeedEntry("✨", `Entrada ${i}`, i);
    }
    assert.ok(getActivityFeed().length <= 20);
  });
});
