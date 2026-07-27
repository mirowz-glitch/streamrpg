import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ResourceLedger } from "./ledger.js";

describe("ResourceLedger — criação de recursos", () => {
  test("um Ledger novo tem saldo 0 para qualquer ResourceId, sem precisar de criação explícita", () => {
    const ledger = new ResourceLedger();
    assert.equal(ledger.getBalance("gold"), 0);
    assert.equal(ledger.getBalance("materials"), 0);
    assert.equal(ledger.getBalance("reputation"), 0);
    assert.equal(ledger.getBalance("essence"), 0);
    assert.equal(ledger.getBalance("token"), 0);
  });

  test("pode ser inicializado com saldos existentes (para reconstruir a partir de persistência)", () => {
    const ledger = new ResourceLedger({ gold: 100, materials: 5 });
    assert.equal(ledger.getBalance("gold"), 100);
    assert.equal(ledger.getBalance("materials"), 5);
    assert.equal(ledger.getBalance("reputation"), 0);
  });
});

describe("ResourceLedger — crédito", () => {
  test("credit() soma ao saldo e retorna uma transação de sucesso", () => {
    const ledger = new ResourceLedger();
    const tx = ledger.credit("gold", 50, "loot:region-1", "character:abc", 1000);
    assert.equal(ledger.getBalance("gold"), 50);
    assert.equal(tx.result, "success");
    assert.equal(tx.kind, "credit");
    assert.equal(tx.resourceId, "gold");
    assert.equal(tx.amount, 50);
    assert.equal(tx.origin, "loot:region-1");
    assert.equal(tx.destination, "character:abc");
    assert.equal(tx.timestamp, 1000);
  });

  test("créditos sucessivos acumulam", () => {
    const ledger = new ResourceLedger();
    ledger.credit("gold", 10, "a", "b", 1);
    ledger.credit("gold", 20, "a", "b", 2);
    assert.equal(ledger.getBalance("gold"), 30);
  });
});

describe("ResourceLedger — débito", () => {
  test("debit() subtrai do saldo quando suficiente", () => {
    const ledger = new ResourceLedger({ gold: 100 });
    const tx = ledger.debit("gold", 30, "merchant:sell", "character:abc", 1000);
    assert.equal(ledger.getBalance("gold"), 70);
    assert.equal(tx.result, "success");
    assert.equal(tx.kind, "debit");
  });

  test("debitar o saldo inteiro deixa o saldo em exatamente 0", () => {
    const ledger = new ResourceLedger({ gold: 50 });
    ledger.debit("gold", 50, "a", "b", 1);
    assert.equal(ledger.getBalance("gold"), 0);
  });
});

describe("ResourceLedger — saldo insuficiente / saldo negativo", () => {
  test("debit() além do saldo é rejeitado, sem mutar o saldo", () => {
    const ledger = new ResourceLedger({ gold: 10 });
    const tx = ledger.debit("gold", 50, "a", "b", 1);
    assert.equal(tx.result, "rejected-insufficient-balance");
    assert.equal(ledger.getBalance("gold"), 10);
  });

  test("saldo nunca fica negativo, mesmo após múltiplas tentativas de débito excessivo", () => {
    const ledger = new ResourceLedger({ gold: 5 });
    ledger.debit("gold", 100, "a", "b", 1);
    ledger.debit("gold", 6, "a", "b", 2);
    assert.equal(ledger.getBalance("gold"), 5);
    assert.ok(ledger.getBalance("gold") >= 0);
  });
});

describe("ResourceLedger — recursos inexistentes", () => {
  test("consultar um recurso nunca creditado retorna 0, nunca lança erro", () => {
    const ledger = new ResourceLedger();
    assert.equal(ledger.getBalance("token"), 0);
  });

  test("debitar um recurso nunca creditado é rejeitado por saldo insuficiente, não por erro", () => {
    const ledger = new ResourceLedger();
    const tx = ledger.debit("essence", 1, "a", "b", 1);
    assert.equal(tx.result, "rejected-insufficient-balance");
  });
});

describe("ResourceLedger — transações inválidas", () => {
  test("amount <= 0 é rejeitado em crédito", () => {
    const ledger = new ResourceLedger();
    const tx = ledger.credit("gold", 0, "a", "b", 1);
    assert.equal(tx.result, "rejected-invalid-amount");
    assert.equal(ledger.getBalance("gold"), 0);
  });

  test("amount negativo é rejeitado em débito", () => {
    const ledger = new ResourceLedger({ gold: 10 });
    const tx = ledger.debit("gold", -5, "a", "b", 1);
    assert.equal(tx.result, "rejected-invalid-amount");
    assert.equal(ledger.getBalance("gold"), 10);
  });

  test("amount não finito (NaN/Infinity) é rejeitado", () => {
    const ledger = new ResourceLedger();
    assert.equal(ledger.credit("gold", NaN, "a", "b", 1).result, "rejected-invalid-amount");
    assert.equal(ledger.credit("gold", Infinity, "a", "b", 1).result, "rejected-invalid-amount");
  });
});

describe("ResourceLedger — rollback (estratégia: validar antes de mutar)", () => {
  test("uma transação rejeitada nunca muta o saldo — não há estado parcial para desfazer", () => {
    const ledger = new ResourceLedger({ gold: 20 });
    const before = ledger.getBalance("gold");
    ledger.debit("gold", 999, "a", "b", 1);
    ledger.credit("gold", -1, "a", "b", 2);
    assert.equal(ledger.getBalance("gold"), before);
  });
});

describe("ResourceLedger — atomicidade", () => {
  test("uma sequência credit→debit→debit-rejeitado mantém o saldo consistente com as operações aceitas", () => {
    const ledger = new ResourceLedger();
    ledger.credit("gold", 100, "a", "b", 1);
    ledger.debit("gold", 40, "a", "b", 2);
    ledger.debit("gold", 1000, "a", "b", 3); // rejeitado, não deveria afetar nada
    assert.equal(ledger.getBalance("gold"), 60);
  });

  test("toda transação (aceita ou rejeitada) é registrada no histórico, na ordem em que ocorreu", () => {
    const ledger = new ResourceLedger();
    ledger.credit("gold", 10, "a", "b", 1);
    ledger.debit("gold", 999, "a", "b", 2);
    ledger.debit("gold", 5, "a", "b", 3);
    const history = ledger.getTransactionHistory();
    assert.equal(history.length, 3);
    assert.equal(history[0].result, "success");
    assert.equal(history[1].result, "rejected-insufficient-balance");
    assert.equal(history[2].result, "success");
  });
});

describe("ResourceLedger — múltiplos tipos de recurso", () => {
  test("gold, materials e reputation mantêm saldos completamente independentes", () => {
    const ledger = new ResourceLedger();
    ledger.credit("gold", 100, "a", "b", 1);
    ledger.credit("materials", 5, "a", "b", 2);
    ledger.credit("reputation", 20, "a", "b", 3);
    ledger.debit("gold", 30, "a", "b", 4);

    assert.equal(ledger.getBalance("gold"), 70);
    assert.equal(ledger.getBalance("materials"), 5);
    assert.equal(ledger.getBalance("reputation"), 20);
    assert.equal(ledger.getBalance("essence"), 0);
    assert.equal(ledger.getBalance("token"), 0);
  });
});

describe("ResourceLedger — snapshot", () => {
  test("getSnapshot()/restoreFromSnapshot() preservam o estado exato", () => {
    const ledger = new ResourceLedger();
    ledger.credit("gold", 100, "a", "b", 1);
    ledger.credit("materials", 3, "a", "b", 2);
    const snapshot = ledger.getSnapshot();

    const restored = new ResourceLedger();
    restored.restoreFromSnapshot(snapshot);
    assert.equal(restored.getBalance("gold"), 100);
    assert.equal(restored.getBalance("materials"), 3);
  });
});
