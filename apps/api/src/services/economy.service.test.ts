/**
 * Testes do Economy Core Phase I — camada de persistência (Fase 5/7).
 *
 * Tenta `DB_PATH=":memory:"` (suportado nativamente por `node:sqlite`)
 * para isolar de `./data/streamrpg.db` — mas quando rodado como parte da
 * suíte inteira (`--test 'src/**\/*.test.ts'`), todos os arquivos
 * compartilham um único processo, e `config/env.js` já pode ter sido
 * importado (fixando `env.dbPath` no valor real) antes desta linha
 * executar. Mesma limitação de ambiente já documentada em
 * `SQLiteCharacterRepository.test.ts` ("testes de integração com SQLite
 * requerem banco em memória ou fixture" — nunca resolvida). Por isso,
 * defensivamente: identificadores únicos por execução (nunca colidem,
 * memória ou arquivo real) + limpeza em `after()` (nunca deixa fixture
 * pra trás no banco real, se for nele que caiu).
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../config/database.js";
import {
  creditCharacterResource,
  debitCharacterResource,
  getCharacterResourceBalance,
  sqliteResourceLedgerPersistence,
} from "./economy.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-economy-test-${RUN_ID}`;
const CHARACTER_ID = `char-economy-test-${RUN_ID}`;

before(() => {
  const db = getDb(); // força criação do schema (SCHEMA já roda no getDb())
  db.prepare(
    `INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`,
  ).run(PROFILE_ID, `twitch-economy-test-${RUN_ID}`, "EconomyTester");
  db.prepare(
    `INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`,
  ).run(CHARACTER_ID, PROFILE_ID, "Economy Tester", 100);
});

after(() => {
  // Limpeza defensiva — se este arquivo tiver caído no banco real
  // (ver comentário de topo), nunca deixa fixture de teste pra trás.
  // ON DELETE CASCADE já remove character_resources/resource_transactions
  // ao apagar o personagem.
  const db = getDb();
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

describe("economy.service — gold usa characters.gold (nunca duplica em character_resources)", () => {
  test("creditCharacterResource('gold') atualiza characters.gold", () => {
    const outcome = creditCharacterResource(CHARACTER_ID, "gold", 50, "test:credit", "character:test");
    assert.equal(outcome.transaction.result, "success");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), 150);

    const row = getDb()
      .prepare("SELECT gold FROM characters WHERE id = ?")
      .get(CHARACTER_ID) as { gold: number };
    assert.equal(row.gold, 150);

    const resourceRow = getDb()
      .prepare("SELECT * FROM character_resources WHERE character_id = ? AND resource_id = 'gold'")
      .get(CHARACTER_ID);
    assert.equal(resourceRow, undefined, "gold nunca deveria criar uma linha em character_resources");
  });

  test("debitCharacterResource('gold') com saldo suficiente atualiza characters.gold", () => {
    const outcome = debitCharacterResource(CHARACTER_ID, "gold", 20, "test:debit", "character:test");
    assert.equal(outcome.transaction.result, "success");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), 130);
  });
});

describe("economy.service — materials usa character_resources", () => {
  test("creditCharacterResource('materials') cria/atualiza uma linha em character_resources", () => {
    const outcome = creditCharacterResource(CHARACTER_ID, "materials", 5, "test:credit", "character:test");
    assert.equal(outcome.transaction.result, "success");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "materials"), 5);

    const row = getDb()
      .prepare("SELECT balance FROM character_resources WHERE character_id = ? AND resource_id = 'materials'")
      .get(CHARACTER_ID) as { balance: number };
    assert.equal(row.balance, 5);
  });

  test("segundo crédito faz UPSERT (soma), não uma segunda linha", () => {
    creditCharacterResource(CHARACTER_ID, "materials", 3, "test:credit", "character:test");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "materials"), 8);

    const rows = getDb()
      .prepare("SELECT * FROM character_resources WHERE character_id = ? AND resource_id = 'materials'")
      .all(CHARACTER_ID);
    assert.equal(rows.length, 1);
  });
});

describe("economy.service — saldo insuficiente é rejeitado e não muda o banco", () => {
  test("debitCharacterResource além do saldo não altera a coluna/linha de saldo", () => {
    const before = getCharacterResourceBalance(CHARACTER_ID, "gold");
    const outcome = debitCharacterResource(CHARACTER_ID, "gold", 999999, "test:debit", "character:test");
    assert.equal(outcome.transaction.result, "rejected-insufficient-balance");
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "gold"), before);
  });
});

describe("economy.service — auditoria (resource_transactions)", () => {
  test("toda transação, aceita ou rejeitada, é registrada em resource_transactions", () => {
    const db = getDb();
    const before = (db
      .prepare("SELECT COUNT(*) AS n FROM resource_transactions WHERE character_id = ?")
      .get(CHARACTER_ID) as { n: number }).n;

    creditCharacterResource(CHARACTER_ID, "reputation", 10, "test:credit", "character:test");
    debitCharacterResource(CHARACTER_ID, "reputation", 999999, "test:debit", "character:test");

    const after = (db
      .prepare("SELECT COUNT(*) AS n FROM resource_transactions WHERE character_id = ?")
      .get(CHARACTER_ID) as { n: number }).n;
    assert.equal(after, before + 2);

    const rows = db
      .prepare(
        "SELECT result FROM resource_transactions WHERE character_id = ? AND resource_id = 'reputation' ORDER BY id",
      )
      .all(CHARACTER_ID) as Array<{ result: string }>;
    assert.equal(rows[0].result, "success");
    assert.equal(rows[1].result, "rejected-insufficient-balance");
  });
});

describe("economy.service — sqliteResourceLedgerPersistence", () => {
  test("load() devolve um snapshot com todos os ResourceId, refletindo o estado real do banco", () => {
    const snapshot = sqliteResourceLedgerPersistence.load(CHARACTER_ID);
    assert.ok(snapshot);
    assert.equal(snapshot!.balances.gold, getCharacterResourceBalance(CHARACTER_ID, "gold"));
    assert.equal(snapshot!.balances.materials, getCharacterResourceBalance(CHARACTER_ID, "materials"));
  });

  test("save() grava um snapshot completo, refletido depois por load()", () => {
    sqliteResourceLedgerPersistence.save(CHARACTER_ID, {
      balances: { essence: 42, token: 7 },
    });
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "essence"), 42);
    assert.equal(getCharacterResourceBalance(CHARACTER_ID, "token"), 7);

    const snapshot = sqliteResourceLedgerPersistence.load(CHARACTER_ID);
    assert.equal(snapshot!.balances.essence, 42);
    assert.equal(snapshot!.balances.token, 7);
  });
});
