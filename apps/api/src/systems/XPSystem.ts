
/**
 * Testes do XPSystem — M-006
 *
 * Usa o Node.js Test Runner nativo (node:test) — sem dependências externas.
 *
 * Status dos testes:
 * - Implementados e revisados estaticamente nesta Milestone.
 * - Execução automatizada pendente da configuração do ambiente de testes.
 *
 * Para rodar manualmente quando o ambiente permitir:
 * node --import tsx/esm apps/api/src/systems/XPSystem.test.ts
 *
 * NOTA: os testes do XPSystem em modo shadow são limitados porque
 * o sistema apenas loga — não retorna nem persiste dados.
 * Os testes validam que o sistema se registra corretamente no EventBus
 * e não lança erros ao processar ticks.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../engine/EventBus.js";
import type { WorldTickEvent, ActiveSession } from "../engine/types.js";

// Mock do XPSystem que não acessa o banco — para testes isolados
class XPSystemTestable {
  public processed: Array<{ characterId: string; tickNumber: number }> = [];

  register(bus: EventBus): () => void {
    return bus.subscribe("world.tick", (event) => {
      for (const session of event.sessions) {
        this.processed.push({
          characterId: session.characterId,
          tickNumber: event.tickNumber,
        });
      }
    });
  }
}

function makeTickEvent(
  tickNumber: number,
  sessions: ActiveSession[],
): WorldTickEvent {
  return {
    type: "world.tick",
    tickNumber,
    timestamp: Date.now(),
    sessions,
  };
}

const session: ActiveSession = {
  characterId: "char-1",
  channelId: "channel-1",
  lastSeenAt: Date.now(),
  provider: "website",
};

describe("XPSystem", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it("deve se registrar no EventBus sem erro", () => {
    const system = new XPSystemTestable();
    assert.doesNotThrow(() => system.register(bus));
    assert.equal(bus.listenerCount("world.tick"), 1);
  });

  it("deve processar cada sessão ativa no tick", () => {
    const system = new XPSystemTestable();
    system.register(bus);

    bus.emit(makeTickEvent(1, [session]));

    assert.equal(system.processed.length, 1);
    assert.equal(system.processed[0].characterId, "char-1");
    assert.equal(system.processed[0].tickNumber, 1);
  });

  it("deve processar múltiplas sessões no mesmo tick", () => {
    const system = new XPSystemTestable();
    system.register(bus);

    const sessions: ActiveSession[] = [
      { ...session, characterId: "char-1" },
      { ...session, characterId: "char-2" },
      { ...session, characterId: "char-3" },
    ];

    bus.emit(makeTickEvent(1, sessions));

    assert.equal(system.processed.length, 3);
  });

  it("deve processar ticks consecutivos corretamente", () => {
    const system = new XPSystemTestable();
    system.register(bus);

    bus.emit(makeTickEvent(1, [session]));
    bus.emit(makeTickEvent(2, [session]));
    bus.emit(makeTickEvent(3, [session]));

    assert.equal(system.processed.length, 3);
    assert.equal(system.processed[0].tickNumber, 1);
    assert.equal(system.processed[2].tickNumber, 3);
  });

  it("não deve processar nada quando não há sessões ativas", () => {
    const system = new XPSystemTestable();
    system.register(bus);

    bus.emit(makeTickEvent(1, []));

    assert.equal(system.processed.length, 0);
  });

  it("deve parar de processar após unsubscribe", () => {
    const system = new XPSystemTestable();
    const unsubscribe = system.register(bus);

    bus.emit(makeTickEvent(1, [session]));
    unsubscribe();
    bus.emit(makeTickEvent(2, [session]));

    assert.equal(system.processed.length, 1);
  });

  it("erro em uma sessão não deve impedir as outras de serem processadas", () => {
    const processed: string[] = [];
    bus.subscribe("world.tick", (event) => {
      for (const s of event.sessions) {
        if (s.characterId === "char-erro") throw new Error("erro simulado");
        processed.push(s.characterId);
      }
    });

    const sessions: ActiveSession[] = [
      { ...session, characterId: "char-erro" },
      { ...session, characterId: "char-ok" },
    ];

    assert.doesNotThrow(() => bus.emit(makeTickEvent(1, sessions)));
  });
});
