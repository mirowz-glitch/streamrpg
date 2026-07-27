import type { ResourceId, ResourceTransaction } from "./types.js";

// Mesmo padrão da Presentation Layer (packages/shared/src/presentation/
// types.ts): um evento por OCORRÊNCIA, nunca dois eventos para a mesma
// transação. "TransactionSucceeded"/"TransactionFailed" e "ResourceGranted"/
// "ResourceSpent" (exemplos da Sprint) são colapsados em 3 kinds, não 4:
// um crédito bem-sucedido já É "ResourceGranted" (não emite também um
// "TransactionSucceeded" redundante); o mesmo vale para débito/
// "ResourceSpent". "TransactionFailed" cobre qualquer rejeição (saldo
// insuficiente ou quantidade inválida), de crédito ou débito — a razão
// exata já está no ResourceTransaction.result associado.
export type EconomicEventKind = "ResourceGranted" | "ResourceSpent" | "TransactionFailed";

// Sem `tickIndex`: diferente dos eventos de exploração (PresentationEvent),
// um evento econômico não nasce de um tick do IdleDriver — nasce de uma
// transação. `transactionId` cumpre o mesmo papel de identificador único
// que `tickIndex` cumpre para PresentationEvent, sem fingir uma origem
// que não existe.
export interface EconomicEvent {
  kind: EconomicEventKind;
  transactionId: string;
  resourceId: ResourceId;
  amount: number;
  origin: string;
  destination: string;
  timestamp: number;
}

export function buildEconomicEvent(transaction: ResourceTransaction): EconomicEvent {
  const kind: EconomicEventKind =
    transaction.result !== "success"
      ? "TransactionFailed"
      : transaction.kind === "credit"
        ? "ResourceGranted"
        : "ResourceSpent";
  return {
    kind,
    transactionId: transaction.id,
    resourceId: transaction.resourceId,
    amount: transaction.amount,
    origin: transaction.origin,
    destination: transaction.destination,
    timestamp: transaction.timestamp,
  };
}
