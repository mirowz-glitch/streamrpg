/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 7 — cobre
 * isolamento por personagem e a natureza não-destrutiva da leitura.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { dismissNotifications, getNotifications, pushNotification } from "./notifications.service.js";

describe("notifications.service", () => {
  test("notificações de um personagem nunca aparecem para outro", () => {
    pushNotification("char-a", "💰", "Você vendeu Espada por 20 de ouro.");
    pushNotification("char-b", "⚒️", "A melhoria de Machado foi concluída (nível 1).");
    assert.equal(getNotifications("char-a").length, 1);
    assert.equal(getNotifications("char-b").length, 1);
    assert.ok(getNotifications("char-a")[0].text.includes("Espada"));
  });

  test("getNotifications é leitura não-destrutiva — chamar duas vezes devolve o mesmo conteúdo", () => {
    pushNotification("char-c", "💰", "Você vendeu Elmo por 10 de ouro.");
    const first = getNotifications("char-c");
    const second = getNotifications("char-c");
    assert.deepEqual(first, second);
  });

  test("dismissNotifications limpa só o personagem alvo", () => {
    pushNotification("char-d", "💰", "Você vendeu Botas por 5 de ouro.");
    pushNotification("char-e", "💰", "Você vendeu Luvas por 5 de ouro.");
    dismissNotifications("char-d");
    assert.equal(getNotifications("char-d").length, 0);
    assert.equal(getNotifications("char-e").length, 1);
  });

  test("nunca depende de Discord/Twitch — só characterId/icon/text", () => {
    pushNotification("char-f", "🔔", "Notificação genérica.");
    const list = getNotifications("char-f");
    assert.equal(typeof list[0].read, "boolean");
  });
});
