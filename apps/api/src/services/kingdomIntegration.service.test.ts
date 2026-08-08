/**
 * Kingdom Integration Phase I (Vision 2.0, Sprint 8), Fase 8 — mesma
 * ressalva de ambiente já documentada em outros testes de serviço:
 * `DB_PATH=":memory:"` só é honrado se nenhum outro arquivo da suíte
 * completa já importou `config/env.js` primeiro — identificadores
 * únicos por execução + limpeza em `after()`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../config/database.js";
import { createKingdom } from "./kingdom.service.js";
import {
  connectKingdomIntegration,
  disconnectKingdomIntegration,
  getKingdomIntegration,
  listKingdomIntegrations,
} from "./kingdomIntegration.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_FOUNDER = `profile-kint-founder-${RUN_ID}`;

let kingdomId: string;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_FOUNDER, "KIntFounder");

  const kingdom = createKingdom(PROFILE_FOUNDER, { name: `Reino Integrado ${RUN_ID}` });
  if (!kingdom.success) throw new Error("setup failed to found kingdom");
  kingdomId = kingdom.kingdom.id;
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM kingdom_integrations WHERE kingdom_id = ?`).run(kingdomId);
  db.prepare(`DELETE FROM kingdoms WHERE id = ?`).run(kingdomId);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_FOUNDER);
});

describe("connectKingdomIntegration / listKingdomIntegrations / getKingdomIntegration", () => {
  test("um Reino novo não tem nenhuma integração — Kingdom nunca exige uma para existir", () => {
    assert.deepEqual(listKingdomIntegrations(kingdomId), []);
  });

  test("conecta uma integração Twitch", () => {
    const integration = connectKingdomIntegration(kingdomId, "twitch", {
      externalId: "canal-de-teste",
      displayName: "Canal de Teste",
    });
    assert.equal(integration.kingdom_id, kingdomId);
    assert.equal(integration.provider, "twitch");
    assert.equal(integration.external_id, "canal-de-teste");
    assert.equal(integration.display_name, "Canal de Teste");
    assert.equal(integration.status, "connected");
    assert.equal(integration.metadata, null);

    const list = listKingdomIntegrations(kingdomId);
    assert.equal(list.length, 1);
  });

  test("provider nunca é limitado a um enum fechado — qualquer string funciona (Discord, ou um provedor futuro qualquer)", () => {
    const integration = connectKingdomIntegration(kingdomId, "discord", {
      externalId: "guild-123",
      displayName: "Servidor de Teste",
    });
    assert.equal(integration.provider, "discord");

    const futureProvider = connectKingdomIntegration(kingdomId, "um-provedor-que-nao-existe-ainda", {
      externalId: "x",
      displayName: "Provedor Futuro",
    });
    assert.equal(futureProvider.provider, "um-provedor-que-nao-existe-ainda");
  });

  test("conectar Kick e YouTube ao mesmo Reino — todos os provedores tratados igual, nenhum privilegiado", () => {
    connectKingdomIntegration(kingdomId, "kick", { externalId: "canal-kick", displayName: "Kick" });
    connectKingdomIntegration(kingdomId, "youtube", { externalId: "canal-youtube", displayName: "YouTube" });

    const list = listKingdomIntegrations(kingdomId);
    const providers = list.map((i) => i.provider).sort();
    assert.deepEqual(providers, [
      "discord",
      "kick",
      "twitch",
      "um-provedor-que-nao-existe-ainda",
      "youtube",
    ]);
  });

  test("reconectar o mesmo provedor atualiza a linha em vez de duplicar", () => {
    connectKingdomIntegration(kingdomId, "twitch", { externalId: "canal-de-teste-novo", displayName: "Canal Novo" });

    const list = listKingdomIntegrations(kingdomId);
    const twitchIntegrations = list.filter((i) => i.provider === "twitch");
    assert.equal(twitchIntegrations.length, 1, "nunca deveria duplicar (kingdom_id, provider)");
    assert.equal(twitchIntegrations[0].external_id, "canal-de-teste-novo");
  });

  test("metadata é persistido e devolvido como objeto", () => {
    const integration = connectKingdomIntegration(kingdomId, "metadata-provider", {
      externalId: "x",
      displayName: "Com Metadata",
      metadata: { followers: 1200, verified: true },
    });
    assert.deepEqual(integration.metadata, { followers: 1200, verified: true });

    const fetched = getKingdomIntegration(integration.id);
    assert.deepEqual(fetched?.metadata, { followers: 1200, verified: true });
  });

  test("getKingdomIntegration devolve null para id inexistente", () => {
    assert.equal(getKingdomIntegration("id-que-nao-existe"), null);
  });
});

describe("disconnectKingdomIntegration", () => {
  test("rejeita id inexistente", () => {
    const result = disconnectKingdomIntegration("id-que-nao-existe");
    assert.deepEqual(result, { success: false, reason: "not-found" });
  });

  test("desconecta sem apagar a linha — status vira 'disconnected', continua em listKingdomIntegrations", () => {
    const integration = connectKingdomIntegration(kingdomId, "disconnect-test", {
      externalId: "x",
      displayName: "Para Desconectar",
    });

    const result = disconnectKingdomIntegration(integration.id);
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.integration.status, "disconnected");

    const stillListed = listKingdomIntegrations(kingdomId).find((i) => i.id === integration.id);
    assert.ok(stillListed, "desconectar nunca deveria remover a linha (histórico preservado)");
    assert.equal(stillListed?.status, "disconnected");
  });

  test("reconectar após desconectar volta o status para 'connected' na mesma linha", () => {
    const integration = connectKingdomIntegration(kingdomId, "reconnect-test", {
      externalId: "x",
      displayName: "Reconectar",
    });
    disconnectKingdomIntegration(integration.id);

    const reconnected = connectKingdomIntegration(kingdomId, "reconnect-test", {
      externalId: "x-novo",
      displayName: "Reconectado",
    });
    assert.equal(reconnected.id, integration.id, "deveria reusar a mesma linha, nunca criar uma segunda");
    assert.equal(reconnected.status, "connected");

    const list = listKingdomIntegrations(kingdomId).filter((i) => i.provider === "reconnect-test");
    assert.equal(list.length, 1);
  });
});
