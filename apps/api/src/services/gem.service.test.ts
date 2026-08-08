/**
 * Testes do Sprint 15 — Sockets + Gem System (Foundation), Fase 11.
 * Mesma ressalva de ambiente já documentada em
 * merchant.service.test.ts/salvage.service.test.ts: `DB_PATH=":memory:"`
 * só é honrado se nenhum outro arquivo da suíte completa já importou
 * `config/env.js` primeiro — por isso, identificadores únicos por
 * execução + limpeza em `after()`, nunca dependendo de isolamento de
 * processo por arquivo.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { createSocketConfiguration, type SocketConfiguration } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, listInventory } from "./drop.service.js";
import { dismantleItem } from "./salvage.service.js";
import { sellItem } from "./merchant.service.js";
import { equipmentLock } from "./equipmentLock.service.js";
import { createGemForTesting, listCharacterGems, socketGem, unsocketGem, getSocketGemDisplayNames } from "./gem.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-gem-test-${RUN_ID}`;
const CHARACTER_ID = `char-gem-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-gem-test-${RUN_ID}`,
    "GemTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Gem Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM gems WHERE character_id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

function grantTestItem(rarity = "rare", powerScore = 10, slot = "weapon") {
  return grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: `test-item-${Math.random().toString(36).slice(2)}`,
    name: "Item de Teste de Gema",
    rarity,
    slot,
    powerScore,
  });
}

// grantAdventureLoot() só gera Sockets quando um seed é informado
// (Fase 4) — a distribuição é determinística mas não-calibrada
// (deriveSocketCountFromSeed), então os testes escrevem uma
// SocketConfiguration conhecida direto na coluna, mesmo padrão já
// usado por blacksmith.service.test.ts/salvage.service.test.ts pra
// fixtures que a API pública não cobre (ex: upgrade_level).
function grantItemWithSockets(socketCount = 2) {
  const item = grantTestItem();
  const config: SocketConfiguration = createSocketConfiguration(socketCount, 12345);
  getDb().prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(config), item.item_id);
  return { item, config };
}

describe("gem.service — createGemForTesting / listCharacterGems", () => {
  test("cria uma Gema solta (não socketada) com history 'created'", () => {
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 2);
    assert.equal(gem.characterId, CHARACTER_ID);
    assert.equal(gem.tier, 2);
    assert.equal(gem.socketedItemId, null);
    assert.equal(gem.socketedSocketId, null);
    assert.equal(gem.history.events.length, 1);
    assert.equal(gem.history.events[0].event, "created");
  });

  test("lista todas as Gemas do personagem (soltas e socketadas)", () => {
    const before = listCharacterGems(CHARACTER_ID).length;
    createGemForTesting(CHARACTER_ID, "test-gem", 1);
    createGemForTesting(CHARACTER_ID, "test-gem", 1);
    assert.equal(listCharacterGems(CHARACTER_ID).length, before + 2);
  });
});

describe("gem.service — socketGem", () => {
  test("insere uma Gema num Socket vazio, marca o Socket como 'filled' e a Gema como socketada", () => {
    const { item, config } = grantItemWithSockets(2);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const socketId = config.sockets[0].id;

    const result = socketGem(CHARACTER_ID, gem.id, item.id, socketId);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.gem.socketedItemId, item.item_id);
    assert.equal(result.gem.socketedSocketId, socketId);
    assert.equal(result.gem.history.events.at(-1)?.event, "socketed");

    const row = getDb().prepare(`SELECT sockets FROM items WHERE id = ?`).get(item.item_id) as { sockets: string };
    const persisted = JSON.parse(row.sockets) as SocketConfiguration;
    assert.equal(persisted.sockets.find((s) => s.id === socketId)?.state, "filled");
  });

  test("rejeita socketar num Socket já preenchido", () => {
    const { item, config } = grantItemWithSockets(1);
    const gemA = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const gemB = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const socketId = config.sockets[0].id;

    const first = socketGem(CHARACTER_ID, gemA.id, item.id, socketId);
    assert.equal(first.success, true);

    const second = socketGem(CHARACTER_ID, gemB.id, item.id, socketId);
    assert.equal(second.success, false);
    if (second.success) return;
    assert.equal(second.reason, "socket-occupied");
  });

  test("rejeita socketar num item sem Sockets", () => {
    const item = grantTestItem();
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const result = socketGem(CHARACTER_ID, gem.id, item.id, "socket-1");
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "no-sockets-on-item");
  });

  test("socketar uma Gema já socketada em OUTRO item registra 'swapped' e libera o Socket antigo", () => {
    const first = grantItemWithSockets(1);
    const second = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);

    const firstResult = socketGem(CHARACTER_ID, gem.id, first.item.id, first.config.sockets[0].id);
    assert.equal(firstResult.success, true);

    const secondResult = socketGem(CHARACTER_ID, gem.id, second.item.id, second.config.sockets[0].id);
    assert.equal(secondResult.success, true);
    if (!secondResult.success) return;
    assert.equal(secondResult.gem.socketedItemId, second.item.item_id);
    assert.equal(secondResult.gem.history.events.at(-1)?.event, "swapped");

    const oldItemRow = getDb().prepare(`SELECT sockets FROM items WHERE id = ?`).get(first.item.item_id) as { sockets: string };
    const oldConfig = JSON.parse(oldItemRow.sockets) as SocketConfiguration;
    assert.equal(oldConfig.sockets[0].state, "empty");
  });

  test("respeita o Equipment Lock — rejeita socketar num item travado por outra operação", () => {
    const { item, config } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    assert.equal(equipmentLock.tryAcquire(item.id, "blacksmith:upgrade"), true);

    const result = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-locked");
    equipmentLock.release(item.id, "blacksmith:upgrade");
  });
});

describe("gem.service — unsocketGem", () => {
  test("remove a Gema do Socket, ela volta a ficar solta e o Socket volta a 'empty'", () => {
    const { item, config } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const result = unsocketGem(CHARACTER_ID, gem.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.gem.socketedItemId, null);
    assert.equal(result.gem.socketedSocketId, null);
    assert.equal(result.gem.history.events.at(-1)?.event, "unsocketed");

    const row = getDb().prepare(`SELECT sockets FROM items WHERE id = ?`).get(item.item_id) as { sockets: string };
    const persisted = JSON.parse(row.sockets) as SocketConfiguration;
    assert.equal(persisted.sockets[0].state, "empty");
  });

  test("rejeita desocketar uma Gema que já está solta", () => {
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const result = unsocketGem(CHARACTER_ID, gem.id);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "gem-not-socketed");
  });
});

// Sprint 15, Fase 10 (Compatibilidade): Merchant/Salvage nunca deixam
// uma Gema apontando pra um item que o personagem não possui mais.
describe("gem.service — compatibilidade (auto-unsocket em Merchant/Salvage)", () => {
  test("vender um item socketado desocketa a Gema automaticamente (Merchant)", () => {
    const { item, config } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const sellResult = sellItem(CHARACTER_ID, item.id);
    assert.equal(sellResult.success, true);

    const [gemAfter] = listCharacterGems(CHARACTER_ID).filter((g) => g.id === gem.id);
    assert.equal(gemAfter.socketedItemId, null);
    assert.equal(gemAfter.socketedSocketId, null);
    assert.equal(gemAfter.history.events.at(-1)?.event, "unsocketed");
  });

  test("desmontar (Salvage) um item socketado desocketa a Gema automaticamente", () => {
    const { item, config } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const dismantleResult = dismantleItem(CHARACTER_ID, item.id);
    assert.equal(dismantleResult.success, true);

    const [gemAfter] = listCharacterGems(CHARACTER_ID).filter((g) => g.id === gem.id);
    assert.equal(gemAfter.socketedItemId, null);
    assert.equal(gemAfter.socketedSocketId, null);
    assert.equal(gemAfter.history.events.at(-1)?.event, "unsocketed");
  });

  test("Blacksmith (upgrade) NUNCA remove o item — Gema socketada permanece socketada", () => {
    const { item, config } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "test-gem", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    // Confirma indiretamente via listInventory — o item ainda existe na
    // mochila do personagem (Blacksmith nunca chama removeItem()).
    const inventory = listInventory(CHARACTER_ID);
    assert.ok(inventory.some((i) => i.id === item.id));

    const [gemAfter] = listCharacterGems(CHARACTER_ID).filter((g) => g.id === gem.id);
    assert.equal(gemAfter.socketedItemId, item.item_id);
    assert.equal(gemAfter.socketedSocketId, config.sockets[0].id);
  });
});

describe("gem.service — getSocketGemDisplayNames (Sprint 20, Fase 10)", () => {
  test("mapeia Socket.id -> nome da Gema, usando o gemType cru quando não há GemDefinition registrada", () => {
    const { item, config } = grantItemWithSockets(2);
    const gem = createGemForTesting(CHARACTER_ID, "ruby-3", 3);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const names = getSocketGemDisplayNames(item.item_id);
    assert.equal(names[config.sockets[0].id], "Rubi III");
    assert.equal(config.sockets[1].id in names, false);
  });

  test("gemType sem GemDefinition registrada cai pro próprio gemType cru — nunca lança", () => {
    const { item, config } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "gema-de-qa-sem-catalogo", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const names = getSocketGemDisplayNames(item.item_id);
    assert.equal(names[config.sockets[0].id], "gema-de-qa-sem-catalogo");
  });

  test("item sem nenhum Socket filled devolve mapa vazio", () => {
    const { item } = grantItemWithSockets(2);
    assert.deepEqual(getSocketGemDisplayNames(item.item_id), {});
  });

  test("listInventory expõe socketGems: null pra item sem Socket ocupado, e o nome real pra item com Gema inserida", () => {
    const { item: itemA } = grantItemWithSockets(2);
    const { item: itemB, config: configB } = grantItemWithSockets(1);
    const gem = createGemForTesting(CHARACTER_ID, "ruby-1", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, itemB.id, configB.sockets[0].id);
    assert.equal(socketed.success, true);

    const inventory = listInventory(CHARACTER_ID);
    const foundA = inventory.find((i) => i.id === itemA.id)!;
    const foundB = inventory.find((i) => i.id === itemB.id)!;
    assert.equal(foundA.socketGems, null);
    assert.deepEqual(foundB.socketGems, { [configB.sockets[0].id]: "Rubi I" });
  });
});
