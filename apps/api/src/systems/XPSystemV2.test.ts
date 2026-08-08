/**
 * Testes de XPSystemV2 — Sprint Identity Core (Vision 2.0), Fase 9.
 *
 * Antes desta Sprint, `checkLiveStatusPerChannel` chamava
 * `isChannelLive()` (services/twitch.service.ts) diretamente — para
 * testar este código de verdade, seria preciso mockar um `fetch` global
 * contra a API da Twitch. Depois do refactor de `PresenceProvider`
 * (engine/types.ts), a mesma lógica é testável com um provider falso,
 * sem nenhuma dependência de rede ou de uma plataforma específica —
 * exatamente a prova concreta que a Auditoria da Engine (Fase 9) pedia.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PresenceProvider } from "../engine/types.js";
import { checkLiveStatusPerChannel, reduceSessionsToCharacters } from "./XPSystemV2.js";

function fakePresence(liveChannels: Set<string>): PresenceProvider {
  return {
    isLive: async (contextId: string) => liveChannels.has(contextId),
  };
}

function session(characterId: string, channelId: string) {
  return { characterId, channelId, lastSeenAt: Date.now(), provider: "website" };
}

describe("checkLiveStatusPerChannel (PresenceProvider injetado, nunca Twitch direto)", () => {
  it("consulta cada canal único uma única vez, independente de quantas sessões apontam pra ele", async () => {
    let callCount = 0;
    const presence: PresenceProvider = {
      isLive: async (contextId) => {
        callCount += 1;
        return contextId === "canal-a";
      },
    };

    const sessions = [session("char-1", "canal-a"), session("char-2", "canal-a"), session("char-3", "canal-b")];
    const result = await checkLiveStatusPerChannel(sessions, presence);

    assert.equal(callCount, 2); // canal-a e canal-b, nunca 3
    assert.equal(result.get("canal-a"), true);
    assert.equal(result.get("canal-b"), false);
  });

  it("trata um canal como offline se o PresenceProvider lançar um erro (comportamento conservador preservado)", async () => {
    const presence: PresenceProvider = {
      isLive: async () => {
        throw new Error("provider indisponível");
      },
    };

    const result = await checkLiveStatusPerChannel([session("char-1", "canal-com-erro")], presence);
    assert.equal(result.get("canal-com-erro"), false);
  });

  it("um provider falso (sem nenhuma chamada de rede real) é suficiente pra exercitar o caminho — prova que a Engine não depende mais de Twitch pra ser testada", async () => {
    const presence = fakePresence(new Set(["canal-ao-vivo"]));
    const result = await checkLiveStatusPerChannel(
      [session("char-1", "canal-ao-vivo"), session("char-2", "canal-offline")],
      presence,
    );
    assert.equal(result.get("canal-ao-vivo"), true);
    assert.equal(result.get("canal-offline"), false);
  });
});

describe("reduceSessionsToCharacters (inalterado por esta Sprint, cobertura nova)", () => {
  it("um personagem com uma sessão num canal offline e outra num canal ao vivo conta como ao vivo", () => {
    const liveByChannel = new Map([
      ["canal-offline", false],
      ["canal-ao-vivo", true],
    ]);
    const sessions = [session("char-1", "canal-offline"), session("char-1", "canal-ao-vivo")];

    const result = reduceSessionsToCharacters(sessions, liveByChannel);
    assert.equal(result.get("char-1"), true);
  });

  it("um personagem sem nenhuma sessão em canal ao vivo conta como offline", () => {
    const liveByChannel = new Map([["canal-offline", false]]);
    const result = reduceSessionsToCharacters([session("char-1", "canal-offline")], liveByChannel);
    assert.equal(result.get("char-1"), false);
  });
});
