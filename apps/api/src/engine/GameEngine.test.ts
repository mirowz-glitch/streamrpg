/**
 * Testes da GameEngine — M-005
 *
 * Usa o Node.js Test Runner nativo (node:test) — sem dependências externas.
 *
 * Status dos testes:
 * - Implementados e revisados estaticamente nesta Milestone.
 * - Execução automatizada pendente da configuração do ambiente de testes.
 *
 * Para rodar manualmente quando o ambiente permitir:
 * node --import tsx/esm apps/api/src/engine/GameEngine.test.ts
 *
 * Todos os testes usam intervalos de milissegundos para não depender
 * de timers reais de 60 segundos.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { GameEngine } from "./GameEngine.js";
import { EventBus } from "./EventBus.js";
import type { GameContext, WorldTickEvent, ActiveSession } from "./types.js";

// Implementação mínima de GameContext para testes
function makeContext(sessions: ActiveSession[] = []): GameContext {
  return {
    getActiveSessions: () => sessions,
  };
}

describe("GameEngine", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe("ciclo de vida", () => {
    it("deve iniciar parado", () => {
      const engine = new GameEngine(bus, makeContext());
      assert.equal(engine.isRunning(), false);
    });

    it("deve iniciar após start()", () => {
      const engine = new GameEngine(bus, makeContext());
      engine.start();
      assert.equal(engine.isRunning(), true);
      engine.stop();
    });

    it("deve parar após stop()", () => {
      const engine = new GameEngine(bus, makeContext());
      engine.start();
      engine.stop();
      assert.equal(engine.isRunning(), false);
    });

    it("deve ignorar start() duplo", () => {
      const engine = new GameEngine(bus, makeContext());
      engine.start();
      engine.start();
      assert.equal(engine.isRunning(), true);
      engine.stop();
    });
  });

  describe("WorldTickEvent", () => {
    it("deve emitir WorldTickEvent no EventBus a cada tick", (t, done) => {
      const received: WorldTickEvent[] = [];
      bus.subscribe("world.tick", (event) => received.push(event));

      const engine = new GameEngine(bus, makeContext(), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        assert.ok(received.length >= 2, `esperado ≥2 ticks, recebeu ${received.length}`);
        done();
      }, 100);
    });

    it("deve incluir tickNumber sequencial no evento", (t, done) => {
      const received: WorldTickEvent[] = [];
      bus.subscribe("world.tick", (event) => received.push(event));

      const engine = new GameEngine(bus, makeContext(), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        for (let i = 0; i < received.length; i++) {
          assert.equal(received[i].tickNumber, i + 1);
        }
        done();
      }, 100);
    });

    it("deve incluir timestamp no evento", (t, done) => {
      const before = Date.now();
      bus.subscribe("world.tick", (event) => {
        assert.ok(event.timestamp >= before);
      });

      const engine = new GameEngine(bus, makeContext(), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        done();
      }, 50);
    });

    it("deve incluir sessões ativas no evento", (t, done) => {
      const session: ActiveSession = {
        characterId: "char-1",
        channelId: "channel-1",
        lastSeenAt: Date.now(),
        provider: "website",
      };

      const received: WorldTickEvent[] = [];
      bus.subscribe("world.tick", (event) => received.push(event));

      const engine = new GameEngine(bus, makeContext([session]), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        assert.ok(received.length >= 1);
        assert.equal(received[0].sessions.length, 1);
        assert.equal(received[0].sessions[0].characterId, "char-1");
        done();
      }, 50);
    });

    it("deve incluir sessões vazias quando não há jogadores ativos", (t, done) => {
      const received: WorldTickEvent[] = [];
      bus.subscribe("world.tick", (event) => received.push(event));

      const engine = new GameEngine(bus, makeContext([]), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        assert.ok(received.length >= 1);
        assert.equal(received[0].sessions.length, 0);
        done();
      }, 50);
    });

    it("não deve emitir ticks após stop()", (t, done) => {
      const received: WorldTickEvent[] = [];
      bus.subscribe("world.tick", (event) => received.push(event));

      const engine = new GameEngine(bus, makeContext(), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        const countAfterStop = received.length;

        setTimeout(() => {
          assert.equal(received.length, countAfterStop);
          done();
        }, 80);
      }, 50);
    });
  });

  describe("isolamento", () => {
    it("múltiplos subscribers devem receber o mesmo tick", (t, done) => {
      const receivedA: WorldTickEvent[] = [];
      const receivedB: WorldTickEvent[] = [];

      bus.subscribe("world.tick", (e) => receivedA.push(e));
      bus.subscribe("world.tick", (e) => receivedB.push(e));

      const engine = new GameEngine(bus, makeContext(), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        assert.equal(receivedA.length, receivedB.length);
        done();
      }, 80);
    });

    it("erro em subscriber não deve parar a Engine", (t, done) => {
      let tickCount = 0;

      bus.subscribe("world.tick", () => { throw new Error("subscriber com erro"); });
      bus.subscribe("world.tick", () => { tickCount++; });

      const engine = new GameEngine(bus, makeContext(), 30);
      engine.start();

      setTimeout(() => {
        engine.stop();
        assert.ok(tickCount >= 2, "engine deve continuar emitindo após erro em subscriber");
        done();
      }, 100);
    });
  });
});
