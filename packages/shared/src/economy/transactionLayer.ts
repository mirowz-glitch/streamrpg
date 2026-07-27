import type { ResourceLedger } from "./ledger.js";
import type { ResourceTransaction, TransactionRequest } from "./types.js";
import { buildEconomicEvent, type EconomicEvent } from "./events.js";

export interface TransactionOutcome {
  transaction: ResourceTransaction;
  event: EconomicEvent;
}

/**
 * Transaction Layer — Economy Core Phase I (Fase 4).
 *
 * Único caminho permitido para alterar um saldo. Nenhum chamador
 * (React, rota de API, sistema futuro) deve invocar
 * `ledger.credit()`/`ledger.debit()` diretamente — sempre por aqui, para
 * que toda mutação de saldo produza, sem exceção, um evento econômico
 * correspondente (ver docs/process/code-review-checklist.md).
 *
 * `requestCredit`/`requestDebit` não duplicam a lógica do Ledger — só
 * orquestram: delegam a decisão (aceitar/rejeitar) ao Ledger e derivam o
 * evento a partir do resultado real da transação.
 */
export function requestCredit(
  ledger: ResourceLedger,
  request: TransactionRequest,
  timestamp: number,
): TransactionOutcome {
  const transaction = ledger.credit(
    request.resourceId,
    request.amount,
    request.origin,
    request.destination,
    timestamp,
  );
  return { transaction, event: buildEconomicEvent(transaction) };
}

export function requestDebit(
  ledger: ResourceLedger,
  request: TransactionRequest,
  timestamp: number,
): TransactionOutcome {
  const transaction = ledger.debit(
    request.resourceId,
    request.amount,
    request.origin,
    request.destination,
    timestamp,
  );
  return { transaction, event: buildEconomicEvent(transaction) };
}
