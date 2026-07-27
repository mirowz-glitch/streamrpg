import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildEconomicEvent } from "./events.js";
import type { ResourceTransaction } from "./types.js";

function transaction(overrides: Partial<ResourceTransaction> = {}): ResourceTransaction {
  return {
    id: "tx_1",
    resourceId: "gold",
    kind: "credit",
    amount: 50,
    origin: "loot:region-1",
    destination: "character:abc",
    timestamp: 1000,
    result: "success",
    ...overrides,
  };
}

describe("buildEconomicEvent", () => {
  test("crédito bem-sucedido vira ResourceGranted", () => {
    const event = buildEconomicEvent(transaction({ kind: "credit", result: "success" }));
    assert.equal(event.kind, "ResourceGranted");
  });

  test("débito bem-sucedido vira ResourceSpent", () => {
    const event = buildEconomicEvent(transaction({ kind: "debit", result: "success" }));
    assert.equal(event.kind, "ResourceSpent");
  });

  test("crédito rejeitado (quantidade inválida) vira TransactionFailed, não ResourceGranted", () => {
    const event = buildEconomicEvent(transaction({ kind: "credit", result: "rejected-invalid-amount" }));
    assert.equal(event.kind, "TransactionFailed");
  });

  test("débito rejeitado (saldo insuficiente) vira TransactionFailed, não ResourceSpent", () => {
    const event = buildEconomicEvent(
      transaction({ kind: "debit", result: "rejected-insufficient-balance" }),
    );
    assert.equal(event.kind, "TransactionFailed");
  });

  test("o evento carrega o transactionId, resourceId, amount, origem/destino e timestamp originais", () => {
    const tx = transaction({ id: "tx_42", resourceId: "materials", amount: 3, origin: "x", destination: "y", timestamp: 555 });
    const event = buildEconomicEvent(tx);
    assert.equal(event.transactionId, "tx_42");
    assert.equal(event.resourceId, "materials");
    assert.equal(event.amount, 3);
    assert.equal(event.origin, "x");
    assert.equal(event.destination, "y");
    assert.equal(event.timestamp, 555);
  });

  test("funciona identicamente para qualquer ResourceId, sem caso especial por recurso", () => {
    for (const resourceId of ["gold", "materials", "reputation", "essence", "token"] as const) {
      const event = buildEconomicEvent(transaction({ resourceId, kind: "credit", result: "success" }));
      assert.equal(event.kind, "ResourceGranted");
      assert.equal(event.resourceId, resourceId);
    }
  });
});
