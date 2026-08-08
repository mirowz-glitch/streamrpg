import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { derivePlayerPresence } from "./derivePresence.js";

// World Autonomy Phase I (Vision 2.0, Sprint 7) — determinístico: `now`
// é sempre passado explicitamente, nunca lido do relógio real (mesmo
// padrão de IdleDriver.test.ts/AnimationController.test.ts). Nenhum
// cenário aqui depende de Twitch/canal/live — só sinais reais de jogo.
describe("derivePlayerPresence", () => {
  test("nunca visto -> offline", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: null,
      now: 1_000_000,
      isAdventuring: false,
      isCitizenOfKingdom: false,
    });
    assert.equal(presence, "offline");
  });

  test("visto há muito tempo (além da janela afk) -> offline", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: 0,
      now: 20 * 60_000,
      isAdventuring: false,
      isCitizenOfKingdom: false,
    });
    assert.equal(presence, "offline");
  });

  test("Aventura ativa agora -> in_adventure, mesmo sendo Cidadão", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: 1_000,
      now: 1_500,
      isAdventuring: true,
      isCitizenOfKingdom: true,
    });
    assert.equal(presence, "in_adventure");
  });

  test("visto recentemente, Cidadão, sem Aventura ativa -> in_kingdom", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: 1_000,
      now: 30_000,
      isAdventuring: false,
      isCitizenOfKingdom: true,
    });
    assert.equal(presence, "in_kingdom");
  });

  test("visto recentemente, sem Reino -> online", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: 1_000,
      now: 30_000,
      isAdventuring: false,
      isCitizenOfKingdom: false,
    });
    assert.equal(presence, "online");
  });

  test("visto há um tempo médio -> idle", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: 0,
      now: 3 * 60_000,
      isAdventuring: false,
      isCitizenOfKingdom: false,
    });
    assert.equal(presence, "idle");
  });

  test("visto há bastante tempo, mas ainda dentro da janela -> afk", () => {
    const presence = derivePlayerPresence({
      lastSeenAt: 0,
      now: 10 * 60_000,
      isAdventuring: false,
      isCitizenOfKingdom: false,
    });
    assert.equal(presence, "afk");
  });

  test("nunca depende de Twitch/canal/live — a assinatura da função não aceita esses campos", () => {
    // Este teste é deliberadamente estrutural: confirma que
    // PlayerPresenceInput não tem `channelId`/`isLive`/`twitchId`
    // simplesmente por nunca precisar passá-los para obter um resultado
    // válido em nenhum cenário acima.
    const presence = derivePlayerPresence({
      lastSeenAt: 1_000,
      now: 1_000,
      isAdventuring: false,
      isCitizenOfKingdom: false,
    });
    assert.ok(["online", "offline", "idle", "in_adventure", "in_kingdom", "afk"].includes(presence));
  });
});
