/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 3 — cobre o
 * achado central: WorldPresenceSystem reage a "world.tick" (evento que
 * a GameEngine já emite sozinha a cada ciclo, independente de qualquer
 * Jogador presente) e nunca depende de canal/viewer/live.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../config/database.js";
import { EventBus } from "../engine/EventBus.js";
import type { WorldTickEvent } from "../engine/types.js";
import { WorldPresenceSystem, getWorldPresence } from "./WorldPresenceSystem.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-wtick-${RUN_ID}`;
const CHARACTER_ID = `character-wtick-${RUN_ID}`;
const EXPEDITION_ID = `expedition-wtick-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_ID, "WTickPlayer");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "WTick Hero",
  );
  db.prepare(
    `INSERT INTO expeditions
       (id, character_id, origin_region_id, destination_region_id, current_region_id, status, status_started_at, total_estimated_ticks, started_at)
     VALUES (?, ?, ?, ?, ?, 'exploring', ?, 10, ?)`,
  ).run(EXPEDITION_ID, CHARACTER_ID, "porto-do-amanhecer", "bosque-sussurrante", "bosque-sussurrante", Date.now(), Date.now());
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM expeditions WHERE id = ?`).run(EXPEDITION_ID);
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

describe("WorldPresenceSystem", () => {
  test("getWorldPresence() nunca retorna null, mesmo antes de qualquer world.tick", () => {
    const presence = getWorldPresence();
    assert.ok(presence.dayCount >= 1);
    assert.ok(["madrugada", "manha", "tarde", "noite"].includes(presence.timeOfDay));
  });

  test("world.tick com sessão numa região com expedição não concluída marca a região active", () => {
    const bus = new EventBus();
    new WorldPresenceSystem().register(bus);

    const event: WorldTickEvent = {
      type: "world.tick",
      tickNumber: 1,
      timestamp: Date.now(),
      sessions: [{ characterId: CHARACTER_ID, channelId: CHARACTER_ID, lastSeenAt: Date.now(), provider: "world" }],
    };
    bus.emit(event);

    const presence = getWorldPresence();
    assert.equal(presence.regionActivity["bosque-sussurrante"], "active");
  });

  test("world.tick sem nenhuma sessão -> todas as regiões dormant (o Mundo continua existindo sem ninguém online)", () => {
    const bus = new EventBus();
    new WorldPresenceSystem().register(bus);

    const event: WorldTickEvent = { type: "world.tick", tickNumber: 2, timestamp: Date.now(), sessions: [] };
    bus.emit(event);

    const presence = getWorldPresence();
    for (const activity of Object.values(presence.regionActivity)) {
      assert.equal(activity, "dormant");
    }
  });

  test("nunca depende de channelId como identificador de região — só expeditions.current_region_id", () => {
    const bus = new EventBus();
    new WorldPresenceSystem().register(bus);

    const event: WorldTickEvent = {
      type: "world.tick",
      tickNumber: 3,
      timestamp: Date.now(),
      sessions: [{ characterId: CHARACTER_ID, channelId: "canal-twitch-qualquer", lastSeenAt: Date.now(), provider: "twitch" }],
    };
    bus.emit(event);

    const presence = getWorldPresence();
    assert.equal(presence.regionActivity["bosque-sussurrante"], "active");
  });
});
