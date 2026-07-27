import type {
  ResourceId,
  ResourceTransaction,
  TransactionKind,
  TransactionResult,
} from "./types.js";

// Snapshot puro (sem I/O) — o formato que uma Sprint futura de
// persistência (apps/api) grava/carrega. O Ledger nunca sabe COMO isso
// é armazenado; só sabe expor/receber este formato.
export interface ResourceLedgerSnapshot {
  balances: Partial<Record<ResourceId, number>>;
}

/**
 * Resource Ledger — Economy Core Phase I.
 *
 * Responsabilidades (Fase 3): adicionar/remover recursos, consultar e
 * validar saldo, impedir saldo negativo, registrar toda transação
 * (aceita ou rejeitada) para auditoria futura.
 *
 * Estratégia de rollback: uma transação inválida (quantidade <= 0) ou
 * com saldo insuficiente é REJEITADA antes de qualquer mutação — nunca
 * muta o saldo e depois desfaz. Isso elimina a necessidade de um
 * mecanismo de rollback em memória: "validar antes de escrever" já é,
 * por construção, seguro contra saldo negativo e contra estado parcial.
 *
 * Sem I/O, sem conhecimento de interface — completamente independente
 * de React e de qualquer mecanismo de persistência (D1/D8,
 * docs/architecture/decisions.md).
 */
export class ResourceLedger {
  private readonly balances = new Map<ResourceId, number>();
  private readonly transactions: ResourceTransaction[] = [];
  private sequence = 0;

  constructor(initialBalances?: Partial<Record<ResourceId, number>>) {
    if (initialBalances) {
      for (const resourceId of Object.keys(initialBalances) as ResourceId[]) {
        const amount = initialBalances[resourceId];
        if (typeof amount === "number") {
          this.balances.set(resourceId, amount);
        }
      }
    }
  }

  getBalance(resourceId: ResourceId): number {
    return this.balances.get(resourceId) ?? 0;
  }

  credit(
    resourceId: ResourceId,
    amount: number,
    origin: string,
    destination: string,
    timestamp: number,
  ): ResourceTransaction {
    if (!isValidAmount(amount)) {
      return this.record(resourceId, "credit", amount, origin, destination, timestamp, "rejected-invalid-amount");
    }
    this.balances.set(resourceId, this.getBalance(resourceId) + amount);
    return this.record(resourceId, "credit", amount, origin, destination, timestamp, "success");
  }

  debit(
    resourceId: ResourceId,
    amount: number,
    origin: string,
    destination: string,
    timestamp: number,
  ): ResourceTransaction {
    if (!isValidAmount(amount)) {
      return this.record(resourceId, "debit", amount, origin, destination, timestamp, "rejected-invalid-amount");
    }
    const current = this.getBalance(resourceId);
    if (current < amount) {
      return this.record(resourceId, "debit", amount, origin, destination, timestamp, "rejected-insufficient-balance");
    }
    this.balances.set(resourceId, current - amount);
    return this.record(resourceId, "debit", amount, origin, destination, timestamp, "success");
  }

  getTransactionHistory(): readonly ResourceTransaction[] {
    return this.transactions;
  }

  getSnapshot(): ResourceLedgerSnapshot {
    return { balances: Object.fromEntries(this.balances) as Partial<Record<ResourceId, number>> };
  }

  restoreFromSnapshot(snapshot: ResourceLedgerSnapshot): void {
    this.balances.clear();
    for (const resourceId of Object.keys(snapshot.balances) as ResourceId[]) {
      const amount = snapshot.balances[resourceId];
      if (typeof amount === "number") {
        this.balances.set(resourceId, amount);
      }
    }
  }

  private record(
    resourceId: ResourceId,
    kind: TransactionKind,
    amount: number,
    origin: string,
    destination: string,
    timestamp: number,
    result: TransactionResult,
  ): ResourceTransaction {
    this.sequence += 1;
    const transaction: ResourceTransaction = {
      id: `tx_${this.sequence}`,
      resourceId,
      kind,
      amount,
      origin,
      destination,
      timestamp,
      result,
    };
    this.transactions.push(transaction);
    return transaction;
  }
}

function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0;
}
