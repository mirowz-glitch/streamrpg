/**
 * Testes do Salvage Phase I (Fase 9). Mesma ressalva de ambiente já
 * documentada em economy.service.test.ts/merchant.service.test.ts/
 * blacksmith.service.test.ts: `DB_PATH=":memory:"` só é honrado se
 * nenhum outro arquivo da suíte completa já importou `config/env.js`
 * primeiro — por isso, identificadores únicos por execução + limpeza em
 * `after()`, nunca dependendo de isolamento de processo por arquivo.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { calculateSalvageRewards } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, equipItem, listInventory } from "./drop.service.js";
import { getCharacterResourceBalance, creditCharacterResourceInTransaction } from "./economy.service.js";
import { equipmentLock } from "./equipmentLock.service.js";
import { dismantleItem } from "./salvage.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-salvage-test-${RUN_ID}`;
const CHARACTER_ID = `char-salvage-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-salvage-test-${RUN_ID}`,
    "SalvageTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Salvage Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

function grantTestItem(rarity = "rare", powerScore = 10, slot = "weapon") {
  return grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: `test-item-${Math.random().toString(36).slice(2)}`,
    name: "Item de Teste de Salvage",
    rarity,
    slot,
    powerScore,
  });
}

describe("salvage.service — desmontagem válida", () => {
  test("desmonta um item não equipado, credita materials e remove o item", () => {
    const item = grantTestItem("rare", 20);
    const balanceBefore = getCharacterResourceBalance(CHARACTER_ID, "materials");
    const expectedRewards = calculateSalvageRewards({ rarity: "rare", upgrade_level: 0, power_score: 20 });

    const result = dismantleItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.deepEqual(result.rewards, expectedRewards);
    assert.equal(
      getCharacterResourceBalance(CHARACTER_ID, "materials"),
      balanceBefore + expectedRewards[0].amount,
    );

    const remaining = listInventory(CHARACTER_ID);
    assert.ok(!remaining.some((i) => i.id === item.id), "item deveria ter sido removido da mochila");
  });
});

describe("salvage.service — item equipado (diferente de Merchant)", () => {
  test("desmonta um item EQUIPADO diretamente, sem exigir desequipar primeiro", () => {
    const item = grantTestItem("uncommon", 15, "helmet");
    equipItem(CHARACTER_ID, item.id);
    const balanceBefore = getCharacterResourceBalance(CHARACTER_ID, "materials");

    const result = dismantleItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.ok(getCharacterResourceBalance(CHARACTER_ID, "materials") > balanceBefore);

    const remaining = listInventory(CHARACTER_ID);
    assert.ok(!remaining.some((i) => i.id === item.id), "item equipado também deveria ter sido removido");
  });
});

describe("salvage.service — item inexistente", () => {
  test("rejeita a desmontagem de um character_item_id que não existe", () => {
    const result = dismantleItem(CHARACTER_ID, 999_999_999);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-found");
  });
});

describe("salvage.service — item sem power_score", () => {
  test("rejeita a desmontagem de um item de catálogo fixo (sem power_score)", () => {
    const db = getDb();
    const insert = db
      .prepare(
        `INSERT INTO items (slug, name, description, rarity, slot, min_level)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(`fixed-catalog-item-salvage-${RUN_ID}`, "Item de Catálogo Fixo", "", "common", "shield", 1);
    const itemId = Number(insert.lastInsertRowid);
    const characterItem = db
      .prepare(`INSERT INTO character_items (character_id, item_id, obtained_at) VALUES (?, ?, ?)`)
      .run(CHARACTER_ID, itemId, Math.floor(Date.now() / 1000));
    const characterItemId = Number(characterItem.lastInsertRowid);

    const result = dismantleItem(CHARACTER_ID, characterItemId);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-eligible");
  });
});

describe("salvage.service — item bloqueado (integração com Equipment Lock)", () => {
  test("rejeita a desmontagem se outra operação segura o lock do item", () => {
    const item = grantTestItem("common", 5);
    assert.equal(equipmentLock.tryAcquire(item.id, "blacksmith:upgrade"), true);

    const result = dismantleItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-locked");

    // o item nunca foi removido, o lock de outra operação continua intacto
    const remaining = listInventory(CHARACTER_ID);
    assert.ok(remaining.some((i) => i.id === item.id), "item não deveria ter sido removido enquanto travado");

    equipmentLock.release(item.id, "blacksmith:upgrade");
  });

  test("libera o lock automaticamente após uma desmontagem bem-sucedida", () => {
    const item = grantTestItem("common", 5);
    const result = dismantleItem(CHARACTER_ID, item.id);
    assert.equal(result.success, true);
    assert.equal(equipmentLock.isLocked(item.id), false);
  });

  test("libera o lock automaticamente mesmo quando o item não existe", () => {
    const nonExistentId = 888_888_888;
    dismantleItem(CHARACTER_ID, nonExistentId);
    assert.equal(equipmentLock.isLocked(nonExistentId), false);
  });
});

describe("salvage.service — cálculo correto dos recursos", () => {
  test("o rendimento aumenta com upgrade_level (item investido rende mais)", () => {
    // grantAdventureLoot não aceita upgrade_level diretamente — simula
    // um item já melhorado escrevendo a coluna direto (mesmo padrão de
    // teste já usado em blacksmith.service.test.ts pra fixtures que a
    // API pública não cobre).
    const item = grantTestItem("epic", 40);
    const db = getDb();
    db.prepare(`UPDATE items SET upgrade_level = ? WHERE id = ?`).run(3, item.item_id);

    const result = dismantleItem(CHARACTER_ID, item.id);
    assert.equal(result.success, true);
    if (!result.success) return;
    const expected = calculateSalvageRewards({ rarity: "epic", upgrade_level: 3, power_score: 40 });
    assert.deepEqual(result.rewards, expected);
  });
});

describe("salvage.service — emissão de eventos", () => {
  test("uma desmontagem bem-sucedida emite ResourceGranted com resourceId materials", () => {
    const item = grantTestItem("uncommon", 12);
    const expectedRewards = calculateSalvageRewards({ rarity: "uncommon", upgrade_level: 0, power_score: 12 });

    const result = dismantleItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.events.length, 1);
    assert.equal(result.events[0].kind, "ResourceGranted");
    assert.equal(result.events[0].resourceId, "materials");
    assert.equal(result.events[0].amount, expectedRewards[0].amount);
    assert.equal(result.events[0].origin, "salvage:dismantle");
    assert.equal(result.events[0].destination, `item:${item.id}`);
  });
});

describe("salvage.service — persistência (resource_transactions)", () => {
  test("a desmontagem registra uma transação de auditoria com origin salvage:dismantle", () => {
    const item = grantTestItem("common", 8);
    const result = dismantleItem(CHARACTER_ID, item.id);
    assert.equal(result.success, true);

    const row = getDb()
      .prepare(
        `SELECT resource_id, kind, origin, destination, result FROM resource_transactions
         WHERE character_id = ? AND destination = ? ORDER BY id DESC LIMIT 1`,
      )
      .get(CHARACTER_ID, `item:${item.id}`) as
      | { resource_id: string; kind: string; origin: string; destination: string; result: string }
      | undefined;

    assert.ok(row, "deveria existir uma linha de auditoria pra esta desmontagem");
    assert.equal(row?.resource_id, "materials");
    assert.equal(row?.kind, "credit");
    assert.equal(row?.origin, "salvage:dismantle");
    assert.equal(row?.result, "success");
  });
});

describe("salvage.service — mecanismo de rollback", () => {
  // Mesmo raciocínio já documentado em merchant.service.test.ts/
  // blacksmith.service.test.ts: não há forma honesta de forçar
  // removeItem() a falhar depois do crédito sem simular corrupção de
  // banco. Este teste prova o MECANISMO que dismantleItem() depende:
  // creditar materials dentro de uma transação aberta pelo chamador
  // (creditCharacterResourceInTransaction, sem BEGIN/COMMIT próprios) e
  // reverter com ROLLBACK desfaz o crédito por completo.
  test("reverter a transação externa desfaz um crédito de materials já aplicado", () => {
    const before = getCharacterResourceBalance(CHARACTER_ID, "materials");
    const db = getDb();
    db.exec("BEGIN");
    try {
      const outcome = creditCharacterResourceInTransaction(CHARACTER_ID, "materials", 999, "test:rollback", "test");
      assert.equal(outcome.transaction.result, "success");
      throw new Error("falha forçada, simulando a segunda escrita (remoção do item) falhando");
    } catch {
      db.exec("ROLLBACK");
    }
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "materials"), before);
  });
});
