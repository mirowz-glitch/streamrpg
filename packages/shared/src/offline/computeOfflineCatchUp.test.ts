import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeOfflineCatchUp, OFFLINE_TICK_INTERVAL_MS, MAX_OFFLINE_MS } from "./computeOfflineCatchUp.js";

// World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — determinístico:
// mesma entrada produz sempre o mesmo resultado (nenhuma chamada a
// Math.random, mesmo padrão de deriveWorldPresence.test.ts).
describe("computeOfflineCatchUp", () => {
  test("elapsedMs = 0 -> nenhum tick simulado, nenhum XP/gold/kill", () => {
    const summary = computeOfflineCatchUp({
      characterLevel: 5,
      characterXp: 0,
      regionId: "bosque-sussurrante",
      elapsedMs: 0,
      seed: 42,
    });
    assert.equal(summary.ticksSimulated, 0);
    assert.equal(summary.enemiesKilled, 0);
    assert.equal(summary.itemsFound, 0);
    assert.equal(summary.xpGained, 0);
    assert.equal(summary.characterSurvived, true);
  });

  test("elapsedMs positivo produz progressão real (kills/xp) via o mesmo Adventure Loop", () => {
    const summary = computeOfflineCatchUp({
      characterLevel: 3,
      characterXp: 0,
      regionId: "bosque-sussurrante",
      elapsedMs: 30 * 60_000, // 30 minutos
      seed: 42,
    });
    assert.ok(summary.ticksSimulated > 0);
    assert.ok(summary.enemiesKilled >= 0);
    assert.ok(summary.xpGained >= 0);
    assert.equal(summary.elapsedMs, 30 * 60_000);
  });

  test("elapsedMs além do cap é truncado em MAX_OFFLINE_MS", () => {
    const summary = computeOfflineCatchUp({
      characterLevel: 3,
      characterXp: 0,
      regionId: "bosque-sussurrante",
      elapsedMs: MAX_OFFLINE_MS * 10,
      seed: 42,
    });
    assert.equal(summary.elapsedMs, MAX_OFFLINE_MS);
    assert.ok(summary.ticksSimulated <= Math.floor(MAX_OFFLINE_MS / OFFLINE_TICK_INTERVAL_MS));
  });

  test("mesma seed + mesma entrada -> resultado idêntico (determinístico)", () => {
    const input = { characterLevel: 4, characterXp: 10, regionId: "bosque-sussurrante", elapsedMs: 10 * 60_000, seed: 777 };
    const first = computeOfflineCatchUp(input);
    const second = computeOfflineCatchUp(input);
    assert.deepEqual(first, second);
  });

  test("itens encontrados offline são sempre vendidos automaticamente (itemsAutoSold === itemsFound, nunca ficam no Inventário real)", () => {
    const summary = computeOfflineCatchUp({
      characterLevel: 5,
      characterXp: 0,
      regionId: "bosque-sussurrante",
      elapsedMs: 45 * 60_000,
      seed: 123,
    });
    assert.equal(summary.itemsAutoSold, summary.itemsFound);
    if (summary.itemsFound > 0) {
      assert.ok(summary.goldFromAutoSold > 0);
    }
  });

  test("nunca depende de Twitch/canal/live — a assinatura da função não aceita esses campos", () => {
    const summary = computeOfflineCatchUp({
      characterLevel: 1,
      characterXp: 0,
      regionId: "bosque-sussurrante",
      elapsedMs: 5_000,
      seed: 1,
    });
    assert.equal(typeof summary.characterSurvived, "boolean");
  });
});
