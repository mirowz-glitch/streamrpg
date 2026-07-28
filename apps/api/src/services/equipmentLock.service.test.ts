/**
 * Testes do Equipment Locking & Concurrency Phase I (Fase 4). Mesma
 * ressalva de ambiente já documentada em economy.service.test.ts:
 * `DB_PATH=":memory:"` só é honrado se nenhum outro arquivo da suíte
 * completa já importou `config/env.js` primeiro — por isso,
 * identificadores únicos por execução + limpeza em `after()`, nunca
 * dependendo de isolamento de processo por arquivo.
 *
 * `equipmentLock` é um singleton reaproveitado pela suíte inteira —
 * cada teste usa um `characterItemId` próprio (nunca reaproveitado
 * entre testes) pra nunca depender de limpeza de lock entre casos.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { EquipmentLockError } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, equipItem, getEquippedItems } from "./drop.service.js";
import {
  creditCharacterResourceInTransaction,
  debitCharacterResourceInTransaction,
  getCharacterResourceBalance,
} from "./economy.service.js";
import { equipmentLock } from "./equipmentLock.service.js";
import { upgradeItem } from "./blacksmith.service.js";
import { sellItem } from "./merchant.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-lock-test-${RUN_ID}`;
const CHARACTER_ID = `char-lock-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-lock-test-${RUN_ID}`,
    "LockTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Lock Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

function grantEquippedItem(overrides: { rarity?: string; slot?: string; powerScore?: number } = {}) {
  const item = grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: `test-item-${Math.random().toString(36).slice(2)}`,
    name: "Item de Teste de Lock",
    rarity: overrides.rarity ?? "rare",
    slot: overrides.slot ?? "weapon",
    powerScore: overrides.powerScore ?? 10,
  });
  equipItem(CHARACTER_ID, item.id);
  return item;
}

function giveGold(amount: number) {
  creditCharacterResourceInTransaction(CHARACTER_ID, "gold", amount, "test:setup", "test");
}

describe("equipmentLock — duas operações concorrentes no mesmo item", () => {
  test("a segunda operação é rejeitada enquanto a primeira segura o lock", () => {
    const item = grantEquippedItem();
    assert.equal(equipmentLock.tryAcquire(item.id, "op-a"), true);
    assert.equal(equipmentLock.tryAcquire(item.id, "op-b"), false);
    equipmentLock.release(item.id, "op-a");
  });
});

describe("equipmentLock — AutoEquip durante upgrade", () => {
  test("AutoEquip é rejeitado ao tentar trocar o item que o Ferreiro está melhorando", () => {
    const item = grantEquippedItem({ slot: "helmet" });
    const replacement = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-replacement-${Math.random().toString(36).slice(2)}`,
      name: "Elmo Substituto",
      rarity: "common",
      slot: "helmet",
      powerScore: 5,
    });

    // Simula o Blacksmith segurando o lock no meio de um upgrade (o
    // mesmo lock que upgradeItem() adquire internamente).
    assert.equal(equipmentLock.tryAcquire(item.id, "blacksmith:upgrade"), true);

    assert.throws(() => {
      equipItem(CHARACTER_ID, replacement.id, "autoequip");
    }, EquipmentLockError);

    // o item original continua equipado — a troca nunca aconteceu
    const equipped = getEquippedItems(CHARACTER_ID);
    const stillEquipped = equipped.find((i) => i.character_item_id === item.id);
    assert.ok(stillEquipped, "o item original deveria continuar equipado");

    equipmentLock.release(item.id, "blacksmith:upgrade");
  });

  test("depois de liberado, AutoEquip consegue trocar normalmente", () => {
    const item = grantEquippedItem({ slot: "ring" });
    const replacement = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-replacement-${Math.random().toString(36).slice(2)}`,
      name: "Anel Substituto",
      rarity: "common",
      slot: "ring",
      powerScore: 5,
    });

    const swapped = equipItem(CHARACTER_ID, replacement.id, "autoequip");
    assert.equal(swapped.id, replacement.id);
    assert.equal(swapped.is_equipped, true);
  });
});

describe("equipmentLock — tentativa de vender item bloqueado", () => {
  test("sellItem retorna item-locked se outra operação segura o lock", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-sell-locked-${Math.random().toString(36).slice(2)}`,
      name: "Item Trancado",
      rarity: "common",
      slot: "boots",
      powerScore: 5,
    });
    // não equipado, então normalmente venderia — mas está travado
    assert.equal(equipmentLock.tryAcquire(item.id, "outra-operacao"), true);

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    if (result.success) return;
    assert.equal(result.reason, "item-locked");

    equipmentLock.release(item.id, "outra-operacao");
  });
});

describe("equipmentLock — desbloqueio após sucesso", () => {
  test("upgradeItem libera o lock automaticamente após uma melhoria bem-sucedida", () => {
    const item = grantEquippedItem({ rarity: "common", powerScore: 5 });
    giveGold(1000);

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    assert.equal(equipmentLock.isLocked(item.id), false);
  });

  test("sellItem libera o lock automaticamente após uma venda bem-sucedida", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-sell-success-${Math.random().toString(36).slice(2)}`,
      name: "Item Vendável",
      rarity: "common",
      slot: "boots",
      powerScore: 5,
    });

    const result = sellItem(CHARACTER_ID, item.id);

    assert.equal(result.success, true);
    assert.equal(equipmentLock.isLocked(item.id), false);
  });
});

describe("equipmentLock — desbloqueio após falha", () => {
  test("upgradeItem libera o lock mesmo quando o Ouro é insuficiente", () => {
    const item = grantEquippedItem({ rarity: "legendary", powerScore: 20, slot: "amulet" });
    const balance = getCharacterResourceBalance(CHARACTER_ID, "gold");
    if (balance > 0) {
      debitCharacterResourceInTransaction(CHARACTER_ID, "gold", balance, "test:reset", "test");
    }

    const result = upgradeItem(CHARACTER_ID, item.id);

    assert.equal(result.success, false);
    assert.equal(equipmentLock.isLocked(item.id), false);
  });

  test("sellItem libera o lock mesmo quando o item não existe", () => {
    const nonExistentId = 999_999_999;
    const result = sellItem(CHARACTER_ID, nonExistentId);
    assert.equal(result.success, false);
    assert.equal(equipmentLock.isLocked(nonExistentId), false);
  });
});
