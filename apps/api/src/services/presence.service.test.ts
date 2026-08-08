/**
 * World Autonomy Phase I (Vision 2.0, Sprint 7) — cobre o achado central
 * da Fase 1: `playerPresenceProvider.isLive()` nunca depende de
 * `isChannelLive()`/Twitch, só de SessionManager.reportPresent() já ter
 * sido chamado para o contextId consultado.
 */
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { sessionManager } from "../engine/SessionManager.js";
import { playerPresenceProvider, twitchPresenceProvider } from "./presence.service.js";

describe("playerPresenceProvider", () => {
  beforeEach(() => {
    sessionManager.clear();
  });

  test("isLive é false para um contextId sem nenhuma sessão registrada", async () => {
    const live = await playerPresenceProvider.isLive("personagem-nunca-visto");
    assert.equal(live, false);
  });

  test("isLive é true assim que reportPresent() registra o contextId — sem nenhuma chamada de rede/Twitch", async () => {
    sessionManager.reportPresent("character-1", "character-1", "world");
    const live = await playerPresenceProvider.isLive("character-1");
    assert.equal(live, true);
  });

  test("isLive não confunde contextIds diferentes", async () => {
    sessionManager.reportPresent("character-1", "character-1", "world");
    const live = await playerPresenceProvider.isLive("character-2");
    assert.equal(live, false);
  });

  test("twitchPresenceProvider continua exportado e distinto de playerPresenceProvider (integração opcional, não removida)", () => {
    assert.notEqual(twitchPresenceProvider, playerPresenceProvider);
    assert.equal(typeof twitchPresenceProvider.isLive, "function");
  });
});
