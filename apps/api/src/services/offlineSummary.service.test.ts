/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — cobre o
 * ciclo real: ausência persistida -> heartbeat de retorno -> resumo
 * computado + XP/gold aplicados -> resumo consumido uma única vez.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb, nowUnix } from "../config/database.js";
import { checkAndComputeOfflineSummary, consumePendingOfflineSummary } from "./offlineSummary.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-offline-${RUN_ID}`;
const CHARACTER_ID = `character-offline-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_ID, "OfflinePlayer");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, level, xp, gold) VALUES (?, ?, ?, 5, 200, 0)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Offline Hero",
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

describe("checkAndComputeOfflineSummary / consumePendingOfflineSummary", () => {
  test("last_active_at nulo (personagem nunca deu heartbeat) -> nenhum resumo, só grava last_active_at", async () => {
    await checkAndComputeOfflineSummary(CHARACTER_ID);
    assert.equal(consumePendingOfflineSummary(CHARACTER_ID), null);

    const row = getDb().prepare(`SELECT last_active_at FROM characters WHERE id = ?`).get(CHARACTER_ID) as {
      last_active_at: number;
    };
    assert.ok(row.last_active_at > 0);
  });

  test("ausência curta (menor que o mínimo) -> nenhum resumo", async () => {
    getDb()
      .prepare(`UPDATE characters SET last_active_at = ? WHERE id = ?`)
      .run(nowUnix() - 30, CHARACTER_ID); // 30s atrás
    await checkAndComputeOfflineSummary(CHARACTER_ID);
    assert.equal(consumePendingOfflineSummary(CHARACTER_ID), null);
  });

  test("ausência real -> resumo computado, XP/gold aplicados ao personagem real, consumido uma única vez", async () => {
    const before = getDb().prepare(`SELECT xp, gold FROM characters WHERE id = ?`).get(CHARACTER_ID) as {
      xp: number;
      gold: number;
    };

    getDb()
      .prepare(`UPDATE characters SET last_active_at = ? WHERE id = ?`)
      .run(nowUnix() - 20 * 60, CHARACTER_ID); // 20 minutos atrás
    await checkAndComputeOfflineSummary(CHARACTER_ID);

    const summary = consumePendingOfflineSummary(CHARACTER_ID);
    assert.ok(summary);
    assert.ok(summary!.ticksSimulated > 0);

    const after = getDb().prepare(`SELECT xp, gold FROM characters WHERE id = ?`).get(CHARACTER_ID) as {
      xp: number;
      gold: number;
    };
    if (summary!.xpGained > 0) assert.ok(after.xp > before.xp);
    if (summary!.goldFromAutoSold > 0) assert.ok(after.gold > before.gold);

    // consumido uma única vez — a segunda chamada devolve null.
    assert.equal(consumePendingOfflineSummary(CHARACTER_ID), null);
  });

  test("nunca depende de Twitch/canal/live — checkAndComputeOfflineSummary só recebe characterId", async () => {
    await checkAndComputeOfflineSummary(CHARACTER_ID);
    // não lança erro, não pede nenhum parâmetro de canal.
    assert.ok(true);
  });
});
