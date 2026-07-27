// Economy Core Phase I — modelo genérico de recursos. Nenhuma regra do
// Ledger/Transaction Layer pode assumir que só Ouro existe: toda lógica
// opera sobre ResourceId, nunca sobre um literal específico como "gold".
export type ResourceId = "gold" | "materials" | "reputation" | "essence" | "token";

export const RESOURCE_IDS: readonly ResourceId[] = [
  "gold",
  "materials",
  "reputation",
  "essence",
  "token",
];

export type TransactionKind = "credit" | "debit";

// "rejected-*" nunca muta saldo — a validação acontece ANTES de qualquer
// escrita, então uma transação rejeitada não precisa de rollback: ela
// nunca chegou a alterar nada. Ver economy/ledger.ts.
export type TransactionResult =
  | "success"
  | "rejected-insufficient-balance"
  | "rejected-invalid-amount";

// Origem/destino são identificadores livres (ex.: "loot:region-1",
// "merchant:sell", "character:<id>") — o Ledger nunca interpreta esses
// valores, só os registra. Quem os define é quem chama a Transaction
// Layer (uma Sprint futura, ex. Merchant).
export interface ResourceTransaction {
  id: string;
  resourceId: ResourceId;
  kind: TransactionKind;
  amount: number;
  origin: string;
  destination: string;
  timestamp: number;
  result: TransactionResult;
}

// A forma que qualquer chamador (Merchant, Blacksmith, futuras Sprints)
// usa para pedir uma transação — nunca chamam o Ledger diretamente.
export interface TransactionRequest {
  resourceId: ResourceId;
  amount: number;
  origin: string;
  destination: string;
}
