import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { IdleDriver } from "./idleDriver.js";

// Idle Loop Implementation Phase I — cobre exatamente os cenários
// pedidos na Sprint (início automático, pausa, retomada, e o gate de
// "bloqueado" que substitui a temporização fixa por animação/banner
// ainda tocando). Determinístico: `now` é sempre passado explicitamente,
// nunca lido do relógio real — mesmo padrão de AnimationController.test.
describe("IdleDriver", () => {
  test("começa em execução e dispara o primeiro tick imediatamente (explorar desde a chegada, sem espera inicial)", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    assert.equal(driver.getStatus(), "running");
    assert.equal(driver.shouldTick(1_000, false), true);
  });

  test("não dispara de novo antes do intervalo configurado ter passado", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    assert.equal(driver.shouldTick(1_000, false), true);
    assert.equal(driver.shouldTick(1_500, false), false, "só 500ms se passaram, intervalo é 2500ms");
    assert.equal(driver.shouldTick(3_600, false), true, "2600ms se passaram desde o último tick, deve disparar");
  });

  test("bloqueado (ex.: animação/banner ainda tocando) nunca dispara, mesmo com o intervalo esgotado", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    driver.shouldTick(1_000, false);
    assert.equal(driver.shouldTick(10_000, true), false);
    // Assim que o bloqueio some, dispara na primeira checagem seguinte —
    // não perde o tick, só adia.
    assert.equal(driver.shouldTick(10_050, false), true);
  });

  test("pause() interrompe os ticks até resume()", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    driver.shouldTick(1_000, false);
    driver.pause();
    assert.equal(driver.getStatus(), "paused");
    assert.equal(driver.shouldTick(10_000, false), false, "pausado não deve disparar mesmo com o tempo passando");

    driver.resume();
    assert.equal(driver.getStatus(), "running");
    assert.equal(driver.shouldTick(20_000, false), true, "resume() reinicia a contagem a partir de agora");
    assert.equal(driver.shouldTick(21_000, false), false, "só 1000ms desde o resume, ainda não é hora");
  });

  test("stop() é terminal até um novo start() (equivalente a morte, ver Seção 4 do documento de design)", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    driver.shouldTick(1_000, false);
    driver.stop();
    assert.equal(driver.getStatus(), "stopped");
    assert.equal(driver.shouldTick(50_000, false), false);

    driver.start();
    assert.equal(driver.getStatus(), "running");
    assert.equal(driver.shouldTick(60_000, false), true, "start() reinicia a contagem (equivalente a Reiniciar após morte)");
  });

  test("resume() enquanto já está em execução não reinicia a contagem (idempotente)", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    driver.shouldTick(1_000, false);
    driver.resume(); // não estava pausado, deve ser um no-op
    assert.equal(driver.shouldTick(3_000, false), false, "só 2000ms desde o tick original em 1000, ainda não chegou aos 2500ms");
    assert.equal(driver.shouldTick(3_600, false), true, "2600ms desde o tick original, agora sim");
  });

  // Global Idle System Phase I — "tempo até o próximo avanço" (campo de
  // Estado Global, Fase 4 do documento de design).
  test("msUntilNextTick() reflete corretamente o tempo restante, null quando pausado/parado, 0 antes do primeiro tick", () => {
    const driver = new IdleDriver({ intervalMs: 2500 });
    assert.equal(driver.msUntilNextTick(1_000), 0, "antes do primeiro tick, dispara na próxima checagem");

    driver.shouldTick(1_000, false);
    assert.equal(driver.msUntilNextTick(1_600), 1900, "1900ms restantes dos 2500ms configurados");
    assert.equal(driver.msUntilNextTick(4_000), 0, "intervalo já esgotado, não fica negativo");

    driver.pause();
    assert.equal(driver.msUntilNextTick(1_600), null, "pausado não tem 'próximo avanço'");

    driver.stop();
    assert.equal(driver.msUntilNextTick(1_600), null, "parado também não tem 'próximo avanço'");
  });
});
