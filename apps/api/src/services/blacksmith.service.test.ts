/**
 * Testes do Blacksmith Phase I (Fase 10). Mesma ressalva de ambiente já
 * documentada em economy.service.test.ts/merchant.service.test.ts:
 * `DB_PATH=":memory:"` só é honrado se nenhum outro arquivo da suíte
 * completa já importou `config/env.js` primeiro — por isso,
 * identificadores únicos por execução + limpeza em `after()`, nunca
 * dependendo de isolamento de processo por arquivo.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { calculateUpgradeCost } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, equipItem, getEquippedItems } from "./drop.service.js";
import { getCharacterResourceBalance, creditCharacterResourceInTransaction, debitCharacterResourceInTransaction } from "./economy.service.js";
import { upgradeItem } from "./blacksmith.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-blacksmith-test-${RUN_ID}`;
const CHARACTER_ID = `char-blacksmith-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-blacksmith-test-${RUN_ID}`,
    "BlacksmithTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Blacksmith Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

// Mesmo achado já documentado em merchant.service.test.ts:
// grantAdventureLoot() grava min_level=1 hardcoded — os itens de teste
// abaixo sempre nascem min_level=1, upgrade_level=0.
function grantAndEquipTestItem(rarity = "rare", powerScore = 10) {
  const item = grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: `test-item-${Math.random().toString(36).slice(2)}`,
    name: "Machado de Teste",
    rarity,
    slot: "weapon",
    powerScore,
  });
  equipItem(CHARACTER_ID, item.id);
  return item;
}

function giveGold(amount: number) {
  const outcome = creditCharacterResourceInTransaction(CHARACTER_ID, "gold", amount, "test:setup", "test");
  assert.equal(outcome.transaction.result, "success");
}

describe("blacksmith.service — melhoria válida", () => {
  test("melhora um item equipado, debita o Ouro certo e aumenta o Power Score", () => {
    const item = grantAndEquipTestItem("rare", 10);
    giveGold(1000);
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const expectedCost = calculateUpgradeCost({ rarity: "rare", upgrade_level: 0 });

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.cost, expectedCost);
    assert.equal(result.newPowerScore, 15);
    assert.equal(result.newUpgradeLevel, 1);
    assert.equal(result.newGoldBalance, goldBefore - expectedCost);
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), goldBefore - expectedCost);

    const equipped = getEquippedItems(CHARACTER_ID);
    const updated = equipped.find((i) => i.character_item_id === item.id);
    assert.ok(updated);
    assert.equal(updated?.power_score, 15);
    assert.equal(updated?.upgrade_level, 1);
  });
});

describe("blacksmith.service — raridades do Item Generator (bug fix)", () => {
  // World Autonomy Phase II (Vision 2.0, Sprint 9) — mesma causa raiz
  // documentada em merchant.service.test.ts: BASE_COST_BY_RARITY
  // (equipment/upgrade.ts) só conhece as 5 raridades de ItemRarity, e a
  // raridade crua do Item Generator ("magic"/"unique") não batia com
  // nenhuma chave, produzindo custo NaN. Corrigido na persistência
  // (drop.service.ts, normalizeItemRarity).
  test("melhora um item 'magic' cobrando o custo de 'uncommon', nunca NaN", () => {
    const item = grantAndEquipTestItem("magic", 10);
    giveGold(1000);
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const expectedCost = calculateUpgradeCost({ rarity: "uncommon", upgrade_level: 0 });

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.ok(!Number.isNaN(result.cost), "cost nunca deveria ser NaN");
    assert.equal(result.cost, expectedCost);
    assert.equal(result.newGoldBalance, goldBefore - expectedCost);
  });

  test("melhora um item 'unique' cobrando o custo de 'legendary', nunca NaN", () => {
    const item = grantAndEquipTestItem("unique", 10);
    giveGold(1000);
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const expectedCost = calculateUpgradeCost({ rarity: "legendary", upgrade_level: 0 });

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.ok(!Number.isNaN(result.cost), "cost nunca deveria ser NaN");
    assert.equal(result.cost, expectedCost);
    assert.equal(result.newGoldBalance, goldBefore - expectedCost);
  });
});

describe("blacksmith.service — Ouro insuficiente", () => {
  test("rejeita a melhoria sem debitar nem alterar o item", () => {
    const item = grantAndEquipTestItem("legendary", 20);
    // saldo atual do personagem pode ter sobras de testes anteriores;
    // zera explicitamente debitando tudo antes de testar insuficiência.
    const current = getCharacterResourceBalance(CHARACTER_ID, "gold");
    if (current > 0) {
      debitCharacterResourceInTransaction(CHARACTER_ID, "gold", current, "test:reset", "test");
    }

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "debit-rejected");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), 0);

    const equipped = getEquippedItems(CHARACTER_ID);
    const stillThere = equipped.find((i) => i.character_item_id === item.id);
    assert.equal(stillThere?.power_score, 20);
    assert.equal(stillThere?.upgrade_level, 0);
  });
});

describe("blacksmith.service — item inexistente", () => {
  test("rejeita a melhoria de um character_item_id que não existe", () => {
    const result = upgradeItem(CHARACTER_ID, 999_999_999);
    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-found");
  });
});

describe("blacksmith.service — item não equipado", () => {
  test("rejeita a melhoria de um item que existe mas não está equipado (escopo: só equipados)", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-item-unequipped-${Math.random().toString(36).slice(2)}`,
      name: "Elmo de Teste",
      rarity: "common",
      slot: "helmet",
      powerScore: 5,
    });

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-found");
  });
});

describe("blacksmith.service — item sem power_score", () => {
  test("rejeita a melhoria de um item de catálogo fixo (sem power_score)", () => {
    const db = getDb();
    const insert = db
      .prepare(
        `INSERT INTO items (slug, name, description, rarity, slot, min_level)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(`fixed-catalog-item-${RUN_ID}`, "Item de Catálogo Fixo", "", "common", "shield", 1);
    const itemId = Number(insert.lastInsertRowid);
    const characterItem = db
      .prepare(
        `INSERT INTO character_items (character_id, item_id, obtained_at) VALUES (?, ?, ?)`,
      )
      .run(CHARACTER_ID, itemId, Math.floor(Date.now() / 1000));
    const characterItemId = Number(characterItem.lastInsertRowid);
    db.prepare(
      `INSERT INTO equipped_items (character_id, slot, character_item_id, equipped_at) VALUES (?, ?, ?, ?)`,
    ).run(CHARACTER_ID, "shield", characterItemId, Math.floor(Date.now() / 1000));

    const result = upgradeItem(CHARACTER_ID, characterItemId);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-not-eligible");
  });
});

describe("blacksmith.service — emissão de eventos", () => {
  test("uma melhoria bem-sucedida emite ResourceSpent com resourceId gold e o custo correto", () => {
    const item = grantAndEquipTestItem("common", 5);
    giveGold(1000);
    const expectedCost = calculateUpgradeCost({ rarity: "common", upgrade_level: 0 });

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.event.kind, "ResourceSpent");
    assert.equal(result.event.resourceId, "gold");
    assert.equal(result.event.amount, expectedCost);
    assert.equal(result.event.origin, "blacksmith:upgrade");
    assert.equal(result.event.destination, `item:${item.id}`);
  });
});

describe("blacksmith.service — persistência (resource_transactions)", () => {
  test("a melhoria registra uma transação de auditoria com origin blacksmith:upgrade", () => {
    const item = grantAndEquipTestItem("uncommon", 8);
    giveGold(1000);

    const result = upgradeItem(CHARACTER_ID, item.id);
    assert.equal(result.success, true);

    const row = getDb()
      .prepare(
        `SELECT resource_id, kind, origin, destination, result FROM resource_transactions
         WHERE character_id = ? AND destination = ? ORDER BY id DESC LIMIT 1`,
      )
      .get(CHARACTER_ID, `item:${item.id}`) as
      | { resource_id: string; kind: string; origin: string; destination: string; result: string }
      | undefined;

    assert.ok(row, "deveria existir uma linha de auditoria pra esta melhoria");
    assert.equal(row?.resource_id, "gold");
    assert.equal(row?.kind, "debit");
    assert.equal(row?.origin, "blacksmith:upgrade");
    assert.equal(row?.result, "success");
  });
});

describe("blacksmith.service — item selado (Sprint 11, Fase 9)", () => {
  test("rejeita a melhoria de um item selado pela Esfera da Maldição, sem debitar nem mudar power_score", () => {
    const item = grantAndEquipTestItem("rare", 10);
    giveGold(1000);
    const db = getDb();
    db.prepare(`UPDATE items SET craft_state = 'sealed' WHERE id = (SELECT item_id FROM character_items WHERE id = ?)`).run(item.id);
    const goldBefore = getCharacterResourceBalance(CHARACTER_ID, "gold");

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-sealed");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), goldBefore);

    const equipped = getEquippedItems(CHARACTER_ID).find((i) => i.character_item_id === item.id);
    assert.equal(equipped?.power_score, 10);
    assert.equal(equipped?.upgrade_level, 0);
  });
});

describe("blacksmith.service — mecanismo de rollback", () => {
  // Mesmo raciocínio já documentado em merchant.service.test.ts: não há
  // forma honesta de forçar applyItemUpgrade() a falhar depois do débito
  // sem simular corrupção de banco. Este teste prova o MECANISMO que
  // upgradeItem() depende: debitar dentro de uma transação aberta pelo
  // chamador (debitCharacterResourceInTransaction, sem BEGIN/COMMIT
  // próprios) e reverter com ROLLBACK desfaz o débito por completo.
  test("reverter a transação externa desfaz um débito já aplicado por debitCharacterResourceInTransaction", () => {
    giveGold(1000);
    const before = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const db = getDb();
    db.exec("BEGIN");
    try {
      const outcome = debitCharacterResourceInTransaction(CHARACTER_ID, "gold", 100, "test:rollback", "test");
      assert.equal(outcome.transaction.result, "success");
      throw new Error("falha forçada, simulando a segunda escrita (power_score) falhando");
    } catch {
      db.exec("ROLLBACK");
    }
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), before);
  });
});
