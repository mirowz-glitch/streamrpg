/**
 * Testes do GameClock
 *
 * Usa o Node.js Test Runner nativo (node:test) — sem dependências externas.
 *
 * Status dos testes:
 * - Implementados e revisados estaticamente nesta Milestone.
 * - Execução automatizada pendente da configuração do ambiente de testes
 *   (script npm test, CI pipeline ou acesso ao terminal do projeto).
 *
 * Para rodar manualmente quando o ambiente permitir:
 * node --import tsx/esm apps/api/src/engine/GameClock.test.ts
 *
 * Todos os testes usam intervalos de milissegundos para não depender
 * de timers reais de 60 segundos.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GameClock } from "./GameClock.js";

describe("GameClock", () => {
  describe("construção", () => {
    it("deve criar um clock com intervalo padrão de 60000ms", () => {
      const clock = new GameClock();
      assert.equal(clock.isRunning(), false);
      assert.equal(clock.getCurrentTick(), 0);
    });

    it("deve criar um clock com intervalo customizado", () => {
      const clock = new GameClock(1000);
      assert.equal(clock.isRunning(), false);
    });

    it("deve lançar erro se intervalMs for zero ou negativo", () => {
      assert.throws(() => new GameClock(0), /intervalMs must be greater than 0/);
      assert.throws(() => new GameClock(-1), /intervalMs must be greater than 0/);
    });
  });

  describe("start e stop", () => {
    it("deve iniciar e parar corretamente", () => {
      const clock = new GameClock(50);
      assert.equal(clock.isRunning(), false);
      clock.start();
      assert.equal(clock.isRunning(), true);
      clock.stop();
      assert.equal(clock.isRunning(), false);
    });

    it("deve ignorar start() duplo sem criar dois intervalos", (t, done) => {
      const clock = new GameClock(50);
      const ticks: number[] = [];

      clock.onTick((tick) => ticks.push(tick.tickNumber));
      clock.start();
      clock.start();

      setTimeout(() => {
        clock.stop();
        assert.ok(ticks.length <= 3, `esperado ≤3 ticks, recebeu ${ticks.length}`);
        done();
      }, 160);
    });

    it("deve poder ser reiniciado após stop()", () => {
      const clock = new GameClock(50);
      clock.start();
      clock.stop();
      clock.start();
      assert.equal(clock.isRunning(), true);
      clock.stop();
    });
  });

  describe("ticks", () => {
    it("deve emitir ticks com tickNumber sequencial", (t, done) => {
      const clock = new GameClock(30);
      const received: number[] = [];

      clock.onTick((tick) => received.push(tick.tickNumber));
      clock.start();

      setTimeout(() => {
        clock.stop();
        assert.ok(received.length >= 2, "deve ter recebido pelo menos 2 ticks");
        for (let i = 0; i < received.length; i++) {
          assert.equal(received[i], i + 1);
        }
        done();
      }, 100);
    });

    it("deve incluir timestamp e intervalMs no tick", (t, done) => {
      const before = Date.now();
      const clock = new GameClock(30);

      clock.onTick((tick) => {
        clock.stop();
        assert.ok(tick.timestamp >= before);
        assert.equal(tick.intervalMs, 30);
        assert.equal(tick.tickNumber, 1);
        done();
      });

      clock.start();
    });

    it("não deve emitir ticks após stop()", (t, done) => {
      const clock = new GameClock(30);
      const received: number[] = [];

      clock.onTick((tick) => received.push(tick.tickNumber));
      clock.start();

      setTimeout(() => {
        clock.stop();
        const countAfterStop = received.length;

        setTimeout(() => {
          assert.equal(received.length, countAfterStop, "não deve ter novos ticks após stop");
          done();
        }, 80);
      }, 50);
    });
  });

  describe("callbacks", () => {
    it("deve suportar múltiplos callbacks no mesmo tick", (t, done) => {
      const clock = new GameClock(30);
      const results: string[] = [];

      clock.onTick(() => results.push("A"));
      clock.onTick(() => results.push("B"));
      clock.start();

      setTimeout(() => {
        clock.stop();
        assert.ok(results.includes("A"));
        assert.ok(results.includes("B"));
        done();
      }, 50);
    });

    it("deve retornar função de unsubscribe que remove o callback", (t, done) => {
      const clock = new GameClock(30);
      const received: number[] = [];

      const unsubscribe = clock.onTick((tick) => received.push(tick.tickNumber));
      clock.start();

      setTimeout(() => {
        unsubscribe();
        const countBeforeUnsub = received.length;

        setTimeout(() => {
          clock.stop();
          assert.equal(received.length, countBeforeUnsub, "callback removido não deve receber mais ticks");
          done();
        }, 80);
      }, 50);
    });

    it("erro em um callback não deve impedir os outros de executar", (t, done) => {
      const clock = new GameClock(30);
      const safeCallbackRan: boolean[] = [];

      clock.onTick(() => { throw new Error("callback com erro"); });
      clock.onTick(() => safeCallbackRan.push(true));
      clock.start();

      setTimeout(() => {
        clock.stop();
        assert.ok(safeCallbackRan.length > 0, "callback seguro deve ter executado mesmo após erro no anterior");
        done();
      }, 50);
    });
  });

  describe("forceTickNow", () => {
    it("deve emitir tick imediatamente sem depender do intervalo", () => {
      const clock = new GameClock(60_000);
      const received: number[] = [];

      clock.onTick((tick) => received.push(tick.tickNumber));
      clock.forceTickNow();

      assert.equal(received.length, 1);
      assert.equal(received[0], 1);
    });

    it("deve incrementar tickNumber mesmo sem estar rodando", () => {
      const clock = new GameClock(60_000);
      clock.forceTickNow();
      clock.forceTickNow();
      assert.equal(clock.getCurrentTick(), 2);
    });
  });
});
