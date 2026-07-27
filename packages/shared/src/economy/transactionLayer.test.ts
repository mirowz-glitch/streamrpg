import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ResourceLedger } from "./ledger.js";
import { requestCredit, requestDebit } from "./transactionLayer.js";

describe("Transaction Layer — requestCredit", () => {
  test("delega ao Ledger e emite um evento ResourceGranted em caso de sucesso", () => {
    const ledger = new ResourceLedger();
    const { transaction, event } = requestCredit(
      ledger,
      { resourceId: "gold", amount: 50, origin: "loot:region-1", destination: "character:abc" },
      1000,
    );
    assert.equal(transaction.result, "success");
    assert.equal(ledger.getBalance("gold"), 50);
    assert.equal(event.kind, "ResourceGranted");
    assert.equal(event.transactionId, transaction.id);
    assert.equal(event.resourceId, "gold");
    assert.equal(event.amount, 50);
  });

  test("quantidade inválida emite TransactionFailed, sem mutar saldo", () => {
    const ledger = new ResourceLedger();
    const { transaction, event } = requestCredit(
      ledger,
      { resourceId: "gold", amount: 0, origin: "a", destination: "b" },
      1000,
    );
    assert.equal(transaction.result, "rejected-invalid-amount");
    assert.equal(event.kind, "TransactionFailed");
    assert.equal(ledger.getBalance("gold"), 0);
  });
});

describe("Transaction Layer — requestDebit", () => {
  test("delega ao Ledger e emite um evento ResourceSpent em caso de sucesso", () => {
    const ledger = new ResourceLedger({ gold: 100 });
    const { transaction, event } = requestDebit(
      ledger,
      { resourceId: "gold", amount: 30, origin: "merchant:sell", destination: "character:abc" },
      1000,
    );
    assert.equal(transaction.result, "success");
    assert.equal(ledger.getBalance("gold"), 70);
    assert.equal(event.kind, "ResourceSpent");
  });

  test("saldo insuficiente emite TransactionFailed, sem mutar saldo", () => {
    const ledger = new ResourceLedger({ gold: 10 });
    const { transaction, event } = requestDebit(
      ledger,
      { resourceId: "gold", amount: 999, origin: "a", destination: "b" },
      1000,
    );
    assert.equal(transaction.result, "rejected-insufficient-balance");
    assert.equal(event.kind, "TransactionFailed");
    assert.equal(ledger.getBalance("gold"), 10);
  });
});

describe("Transaction Layer — múltiplos tipos de recurso", () => {
  test("requestCredit/requestDebit funcionam identicamente para qualquer ResourceId, sem caso especial", () => {
    const ledger = new ResourceLedger();
    for (const resourceId of ["gold", "materials", "reputation", "essence", "token"] as const) {
      const { transaction } = requestCredit(
        ledger,
        { resourceId, amount: 10, origin: "a", destination: "b" },
        1,
      );
      assert.equal(transaction.result, "success");
      assert.equal(ledger.getBalance(resourceId), 10);
    }
  });
});
