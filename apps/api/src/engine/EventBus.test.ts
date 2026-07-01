/**
 * Testes do EventBus — M-004
 *
 * Usa o Node.js Test Runner nativo (node:test) — sem dependências externas.
 *
 * Status dos testes:
 * - Implementados e revisados estaticamente nesta Milestone.
 * - Execução automatizada pendente da configuração do ambiente de testes.
 *
 * Para rodar manualmente quando o ambiente permitir:
 * node --import tsx/esm apps/api/src/engine/EventBus.test.ts
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "./EventBus.js";
import type { XPGrantedEvent, DropGrantedEvent } from "./types.js";

// Fixtures — eventos válidos para uso nos testes
const xpEvent: XPGrantedEvent = {
  type: "xp.granted",
  characterId: "char-1",
  channelId: "channel-1",
  amount: 10,
  newTotalXp: 110,
  newLevel: 2,
  leveledUp: false,
  timestamp: Date.now(),
};

const dropEvent: DropGrantedEvent = {
  type: "drop.granted",
  characterId: "char-1",
  channelId: "channel-1",
  itemId: 42,
  itemName: "Espada de Madeira",
  itemRarity: "common",
  itemSlot: "weapon",
  timestamp: Date.now(),
};

describe("EventBus", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe("subscribe e emit", () => {
    it("deve chamar handler inscrito quando evento é emitido", () => {
      const received: XPGrantedEvent[] = [];
      bus.subscribe("xp.granted", (event) => received.push(event));
      bus.emit(xpEvent);
      assert.equal(received.length, 1);
      assert.equal(received[0].characterId, "char-1");
    });

    it("não deve chamar handler de tipo diferente", () => {
      const received: DropGrantedEvent[] = [];
      bus.subscribe("drop.granted", (event) => received.push(event));
      bus.emit(xpEvent);
      assert.equal(received.length, 0);
    });

    it("deve suportar múltiplos handlers para o mesmo tipo", () => {
      const results: string[] = [];
      bus.subscribe("xp.granted", () => results.push("A"));
      bus.subscribe("xp.granted", () => results.push("B"));
      bus.emit(xpEvent);
      assert.deepEqual(results, ["A", "B"]);
    });

    it("deve suportar handlers para tipos diferentes simultaneamente", () => {
      const xpReceived: XPGrantedEvent[] = [];
      const dropReceived: DropGrantedEvent[] = [];

      bus.subscribe("xp.granted", (e) => xpReceived.push(e));
      bus.subscribe("drop.granted", (e) => dropReceived.push(e));

      bus.emit(xpEvent);
      bus.emit(dropEvent);

      assert.equal(xpReceived.length, 1);
      assert.equal(dropReceived.length, 1);
    });

    it("não deve chamar nenhum handler se nenhum estiver inscrito", () => {
      assert.doesNotThrow(() => bus.emit(xpEvent));
    });
  });

  describe("unsubscribe", () => {
    it("deve remover handler via função retornada por subscribe", () => {
      const received: XPGrantedEvent[] = [];
      const unsubscribe = bus.subscribe("xp.granted", (e) => received.push(e));

      bus.emit(xpEvent);
      assert.equal(received.length, 1);

      unsubscribe();
      bus.emit(xpEvent);
      assert.equal(received.length, 1); // não deve ter aumentado
    });

    it("deve remover apenas o handler correto quando há múltiplos", () => {
      const results: string[] = [];
      const unsubscribeA = bus.subscribe("xp.granted", () => results.push("A"));
      bus.subscribe("xp.granted", () => results.push("B"));

      unsubscribeA();
      bus.emit(xpEvent);

      assert.deepEqual(results, ["B"]);
    });

    it("chamar unsubscribe duas vezes não deve causar erro", () => {
      const unsubscribe = bus.subscribe("xp.granted", () => {});
      assert.doesNotThrow(() => {
        unsubscribe();
        unsubscribe();
      });
    });
  });

  describe("isolamento de erros", () => {
    it("erro em um handler não deve impedir os outros de executar", () => {
      const safeRan: boolean[] = [];

      bus.subscribe("xp.granted", () => { throw new Error("handler com erro"); });
      bus.subscribe("xp.granted", () => safeRan.push(true));

      assert.doesNotThrow(() => bus.emit(xpEvent));
      assert.equal(safeRan.length, 1);
    });

    it("erro assíncrono em handler não deve propagar para emit", (t, done) => {
      bus.subscribe("xp.granted", async () => {
        throw new Error("erro async");
      });

      assert.doesNotThrow(() => bus.emit(xpEvent));

      // aguarda um tick para garantir que a Promise rejeitada foi tratada
      setTimeout(() => done(), 10);
    });
  });

  describe("listenerCount", () => {
    it("deve retornar 0 quando não há handlers", () => {
      assert.equal(bus.listenerCount("xp.granted"), 0);
    });

    it("deve retornar o número correto de handlers", () => {
      bus.subscribe("xp.granted", () => {});
      bus.subscribe("xp.granted", () => {});
      assert.equal(bus.listenerCount("xp.granted"), 2);
    });

    it("deve decrementar após unsubscribe", () => {
      const unsub = bus.subscribe("xp.granted", () => {});
      assert.equal(bus.listenerCount("xp.granted"), 1);
      unsub();
      assert.equal(bus.listenerCount("xp.granted"), 0);
    });
  });

  describe("clear", () => {
    it("deve remover todos os handlers de todos os tipos", () => {
      bus.subscribe("xp.granted", () => {});
      bus.subscribe("drop.granted", () => {});
      bus.clear();

      assert.equal(bus.listenerCount("xp.granted"), 0);
      assert.equal(bus.listenerCount("drop.granted"), 0);
    });

    it("não deve emitir para handlers após clear", () => {
      const received: XPGrantedEvent[] = [];
      bus.subscribe("xp.granted", (e) => received.push(e));
      bus.clear();
      bus.emit(xpEvent);
      assert.equal(received.length, 0);
    });
  });
});
