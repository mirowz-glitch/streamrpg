/**
 * Testes do Merchant Phase I (Fase 9). Mesma ressalva de ambiente já
 * documentada em economy.service.test.ts: `DB_PATH=":memory:"` só é
 * honrado se nenhum outro arquivo da suíte completa já importou
 * `config/env.js` primeiro — por isso, identificadores únicos por
 * execução + limpeza em `after()`, nunca dependendo de isolamento de
 * processo por arquivo.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { calculateSaleValue } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, equipItem, listInventory } from "./drop.service.js";
import { getCharacterResourceBalance, creditCharacterResourceInTransaction } from "./economy.service.js";
import { sellItem } from "./merchant.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-merchant-test-${RUN_ID}`;
const CHARACTER_ID = `char-merchant-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-merchant-test-${RUN_ID}`,
    "MerchantTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Merchant Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

// Achado da Fase 1/9 desta Sprint: grantAdventureLoot() (drop.service.ts,
// pré-existente, fora de escopo) grava `min_level` hardcoded como `1` no
// INSERT — o parâmetro de nível nunca chega a ser usado. Todo item
// concedido por esta função tem min_level=1 na prática, então os testes
// abaixo calculam o valor esperado com min_level:1 (o valor REAL
// persistido), não um nível arbitrário — documentado em
// docs/design/merchant-phase1.md "Problemas Encontrados".
function grantTestItem(rarity = "rare") {
  return grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: `test-item-${Math.random().toString(36).slice(2)}`,
    name: "Espada de Teste",
    rarity,
    slot: "weapon",
    powerScore: 10,
  });
}

describe("merchant.service — venda simples", () => {
  test("vende um item válido, credita o Ouro certo e remove o item", () => {
    const item = grantTestItem("rare");
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const expectedValue = calculateSaleValue({ rarity: "rare", min_level: 1 });

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.saleValue, expectedValue);
    assert.equal(result.newGoldBalance, goldBefore + expectedValue);
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), goldBefore + expectedValue);

    const remaining = listInventory(CHARACTER_ID);
    assert.ok(!remaining.some((i) => i.id === item.id), "item deveria ter sido removido da mochila");
  });
});

// Sprint 14 — Legendary Items + Legacy System, Fase 3/5: o item some de
// `character_items` (listInventory), mas a linha de `items` (o
// catálogo procedural) sobrevive pra sempre — é ali que o evento
// "sold" fica gravado, lido de volta direto por SQL já que não existe
// mais um `character_item_id` pra consultar via listInventory().
describe("merchant.service — Legado (Sprint 14): evento 'sold' sobrevive à venda", () => {
  test("depois de vender, a linha de 'items' (não character_items) ganha um evento 'sold' com o preço", () => {
    const item = grantTestItem("rare");
    const expectedValue = calculateSaleValue({ rarity: "rare", min_level: 1 });

    const result = sellItem(CHARACTER_ID, item.id);
    assert.equal(result.success, true);

    const row = getDb().prepare(`SELECT history FROM items WHERE id = ?`).get(item.item_id) as { history: string };
    const history = JSON.parse(row.history);
    const soldEvent = history.events.find((e: { event: string }) => e.event === "sold");
    assert.ok(soldEvent, "esperava um evento 'sold' na linha órfã de items");
    assert.equal(soldEvent.detail, String(expectedValue));
    assert.equal(soldEvent.characterId, CHARACTER_ID);
  });
});

describe("merchant.service — raridades do Item Generator (bug fix)", () => {
  // World Autonomy Phase II (Vision 2.0, Sprint 9) — bug encontrado ao
  // construir o Offline Summary: grantAdventureLoot() persistia a
  // raridade crua do Item Generator ("magic"/"unique",
  // itemgen/rarities.ts), que não bate com nenhuma chave de
  // BASE_VALUE_BY_RARITY (economy/saleValue.ts, só as 5 raridades de
  // ItemRarity) — vender esses itens devolvia NaN de ouro. Corrigido em
  // drop.service.ts (normalizeItemRarity, na persistência); estes testes
  // provam que a venda real agora produz o valor correto, não NaN.
  test("vende um item 'magic' (Item Generator) e credita o valor de 'uncommon', nunca NaN", () => {
    const item = grantTestItem("magic");
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const expectedValue = calculateSaleValue({ rarity: "uncommon", min_level: 1 });

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.ok(!Number.isNaN(result.saleValue), "saleValue nunca deveria ser NaN");
    assert.equal(result.saleValue, expectedValue);
    assert.equal(result.newGoldBalance, goldBefore + expectedValue);
  });

  test("vende um item 'unique' (Item Generator) e credita o valor de 'legendary', nunca NaN", () => {
    const item = grantTestItem("unique");
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const expectedValue = calculateSaleValue({ rarity: "legendary", min_level: 1 });

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.ok(!Number.isNaN(result.saleValue), "saleValue nunca deveria ser NaN");
    assert.equal(result.saleValue, expectedValue);
    assert.equal(result.newGoldBalance, goldBefore + expectedValue);
  });
});

describe("merchant.service — item equipado", () => {
  test("rejeita a venda de um item equipado, sem alterar Ouro nem inventário", () => {
    const item = grantTestItem("common");
    equipItem(CHARACTER_ID, item.id);
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-equipped");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), goldBefore);
    const stillThere = listInventory(CHARACTER_ID).find((i) => i.id === item.id);
    assert.ok(stillThere, "item não deveria ter sido removido");
    assert.equal(stillThere?.is_equipped, true);
  });
});

describe("merchant.service — item inexistente", () => {
  test("rejeita a venda de um character_item_id que não existe", () => {
    const result = sellItem(CHARACTER_ID, 999_999_999);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-found");
  });
});

describe("merchant.service — inventário vazio", () => {
  test("personagem sem nenhum item também recebe item-not-found, não um erro", () => {
    const db = getDb();
    const emptyProfileId = `profile-empty-${RUN_ID}`;
    const emptyCharacterId = `char-empty-${RUN_ID}`;
    db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
      emptyProfileId,
      `twitch-empty-${RUN_ID}`,
      "EmptyTester",
    );
    db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
      emptyCharacterId,
      emptyProfileId,
      "Empty Tester",
      0,
    );

    const result = sellItem(emptyCharacterId, 1);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-found");

    db.prepare(`DELETE FROM characters WHERE id = ?`).run(emptyCharacterId);
    db.prepare(`DELETE FROM profiles WHERE id = ?`).run(emptyProfileId);
  });
});

describe("merchant.service — emissão de eventos", () => {
  test("uma venda bem-sucedida emite ResourceGranted com resourceId gold e o valor correto", () => {
    const item = grantTestItem("epic");
    const expectedValue = calculateSaleValue({ rarity: "epic", min_level: 1 });

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.event.kind, "ResourceGranted");
    assert.equal(result.event.resourceId, "gold");
    assert.equal(result.event.amount, expectedValue);
    assert.equal(result.event.origin, "merchant:sell");
    assert.equal(result.event.destination, `item:${item.id}`);
  });
});

describe("merchant.service — persistência (resource_transactions)", () => {
  test("a venda registra uma transação de auditoria com origin merchant:sell", () => {
    const item = grantTestItem("uncommon");
    const result = sellItem(CHARACTER_ID, item.id);
    assert.equal(result.success, true);

    const row = getDb()
      .prepare(
        `SELECT resource_id, kind, origin, destination, result FROM resource_transactions
         WHERE character_id = ? AND destination = ? ORDER BY id DESC LIMIT 1`,
      )
      .get(CHARACTER_ID, `item:${item.id}`) as
      | { resource_id: string; kind: string; origin: string; destination: string; result: string }
      | undefined;

    assert.ok(row, "deveria existir uma linha de auditoria pra esta venda");
    assert.equal(row?.resource_id, "gold");
    assert.equal(row?.kind, "credit");
    assert.equal(row?.origin, "merchant:sell");
    assert.equal(row?.result, "success");
  });
});

describe("merchant.service — mecanismo de rollback", () => {
  // sellItem() nunca alcança um estado "creditou mas não removeu" em
  // operação normal, porque listInventory() já garante posse/existência
  // ANTES de abrir a transação — não há forma honesta de forçar
  // removeItem() a falhar depois disso sem simular corrupção de banco.
  // Este teste prova, em vez disso, o MECANISMO de que sellItem()
  // depende: creditar dentro de uma transação aberta pelo chamador
  // (creditCharacterResourceInTransaction, sem BEGIN/COMMIT próprios) e
  // depois reverter com ROLLBACK desfaz o crédito por completo — a
  // mesma composição que sellItem() usa pra combinar crédito + remoção
  // atomicamente (ver ADR-0001).
  test("reverter a transação externa desfaz um crédito já aplicado por creditCharacterResourceInTransaction", () => {
    const before = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const db = getDb();
    db.exec("BEGIN");
    try {
      const outcome = creditCharacterResourceInTransaction(CHARACTER_ID, "gold", 999, "test:rollback", "test");
      assert.equal(outcome.transaction.result, "success");
      throw new Error("falha forçada, simulando a segunda escrita (remoção do item) falhando");
    } catch {
      db.exec("ROLLBACK");
    }
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), before);
  });
});
