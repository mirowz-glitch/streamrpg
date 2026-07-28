import {
  ResourceLedger,
  requestCredit,
  requestDebit,
  RESOURCE_IDS,
  type ResourceId,
  type TransactionOutcome,
  type ResourceLedgerPersistence,
  type ResourceLedgerSnapshot,
} from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

/**
 * Economy Core Phase I — persistência (Fase 5).
 *
 * Responsabilidade única desta camada: traduzir o que o Resource
 * Ledger/Transaction Layer (packages/shared/src/economy) já decidiu para
 * o schema SQL, atomicamente. Nenhuma regra econômica nasce aqui — só
 * leitura/escrita de saldo já validado pelo Ledger.
 *
 * Exceção deliberada de mapeamento: "gold" continua lido/escrito em
 * `characters.gold` (coluna existente, já usada em produção por
 * `routes/character.ts`) em vez de `character_resources` — evita
 * duplicar/desincronizar um saldo que já existe. Qualquer outro
 * `ResourceId` usa `character_resources` normalmente. Esta ramificação
 * vive SÓ aqui — o Ledger em packages/shared nunca sabe que "gold" é
 * tratado diferente; para ele é só mais um ResourceId (ver
 * docs/design/economy-core-phase1.md Seção 0).
 */
function loadBalance(characterId: string, resourceId: ResourceId): number {
  const db = getDb();
  if (resourceId === "gold") {
    const row = db
      .prepare("SELECT gold FROM characters WHERE id = ?")
      .get(characterId) as { gold: number } | undefined;
    return row?.gold ?? 0;
  }
  const row = db
    .prepare(
      "SELECT balance FROM character_resources WHERE character_id = ? AND resource_id = ?",
    )
    .get(characterId, resourceId) as { balance: number } | undefined;
  return row?.balance ?? 0;
}

function writeBalance(
  characterId: string,
  resourceId: ResourceId,
  newBalance: number,
  timestampSeconds: number,
): void {
  const db = getDb();
  if (resourceId === "gold") {
    db.prepare("UPDATE characters SET gold = ?, updated_at = ? WHERE id = ?").run(
      newBalance,
      timestampSeconds,
      characterId,
    );
    return;
  }
  db.prepare(
    `INSERT INTO character_resources (character_id, resource_id, balance, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (character_id, resource_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at`,
  ).run(characterId, resourceId, newBalance, timestampSeconds);
}

function recordTransaction(
  characterId: string,
  outcome: TransactionOutcome,
  timestampSeconds: number,
): void {
  getDb()
    .prepare(
      `INSERT INTO resource_transactions
         (character_id, resource_id, kind, amount, origin, destination, result, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      characterId,
      outcome.transaction.resourceId,
      outcome.transaction.kind,
      outcome.transaction.amount,
      outcome.transaction.origin,
      outcome.transaction.destination,
      outcome.transaction.result,
      timestampSeconds,
    );
}

/**
 * Núcleo de um crédito/débito, SEM abrir transação própria: lê o saldo
 * atual, delega a decisão (aceitar/rejeitar) ao Ledger genérico, grava
 * o novo saldo (só se aceito) e registra a transação (sempre, aceita ou
 * rejeitada). Quem chama esta função é responsável por já estar dentro
 * de um `BEGIN`/`COMMIT`/`ROLLBACK` — ver ADR-0001
 * (`docs/architecture/adr/0001-economy-service-transaction-composition.md`)
 * para por que essa separação existe: SQLite não suporta `BEGIN`
 * aninhado, então um chamador (ex.: Merchant Service) que precisa
 * combinar este crédito com OUTRA escrita (remover um item) na mesma
 * transação não pode usar a variante que já abre sua própria transação.
 */
function performTransaction(
  characterId: string,
  resourceId: ResourceId,
  amount: number,
  origin: string,
  destination: string,
  kind: "credit" | "debit",
): TransactionOutcome {
  const eventTimestamp = Date.now();
  const rowTimestamp = nowUnix();
  const currentBalance = loadBalance(characterId, resourceId);
  const ledger = new ResourceLedger({ [resourceId]: currentBalance });
  const request = { resourceId, amount, origin, destination };
  const outcome =
    kind === "credit"
      ? requestCredit(ledger, request, eventTimestamp)
      : requestDebit(ledger, request, eventTimestamp);

  if (outcome.transaction.result === "success") {
    writeBalance(characterId, resourceId, ledger.getBalance(resourceId), rowTimestamp);
  }
  recordTransaction(characterId, outcome, rowTimestamp);
  return outcome;
}

/**
 * Executa um crédito/débito atomicamente, abrindo e fechando sua
 * própria transação SQL. Uso: qualquer chamador que só precisa mexer
 * neste saldo, isoladamente (não combinado com outra escrita).
 *
 * Atomicidade: `DatabaseSync` (node:sqlite) é síncrono e Node é
 * single-threaded — nenhum `await` existe entre a leitura do saldo e a
 * escrita, então nenhuma outra requisição pode intercalar no meio desta
 * função. `BEGIN`/`COMMIT`/`ROLLBACK` garantem, adicionalmente, que as
 * duas escritas (saldo + log) sejam tudo-ou-nada mesmo se um erro
 * inesperado interromper o meio do caminho — a peça genuinamente nova
 * identificada em `docs/design/gold-architecture-phase1.md` Seção 4.
 */
function runAtomicTransaction(
  characterId: string,
  resourceId: ResourceId,
  amount: number,
  origin: string,
  destination: string,
  kind: "credit" | "debit",
): TransactionOutcome {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const outcome = performTransaction(characterId, resourceId, amount, origin, destination, kind);
    db.exec("COMMIT");
    return outcome;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function creditCharacterResource(
  characterId: string,
  resourceId: ResourceId,
  amount: number,
  origin: string,
  destination: string,
): TransactionOutcome {
  return runAtomicTransaction(characterId, resourceId, amount, origin, destination, "credit");
}

export function debitCharacterResource(
  characterId: string,
  resourceId: ResourceId,
  amount: number,
  origin: string,
  destination: string,
): TransactionOutcome {
  return runAtomicTransaction(characterId, resourceId, amount, origin, destination, "debit");
}

/**
 * Variante de `creditCharacterResource` que NÃO abre sua própria
 * transação — o chamador precisa já estar dentro de um
 * `BEGIN`/`COMMIT`/`ROLLBACK` (ver ADR-0001). Usada pelo Merchant
 * Service (Fase 3, Sprint Merchant Phase I) para combinar o crédito de
 * Ouro com a remoção do item vendido numa única transação atômica.
 */
export function creditCharacterResourceInTransaction(
  characterId: string,
  resourceId: ResourceId,
  amount: number,
  origin: string,
  destination: string,
): TransactionOutcome {
  return performTransaction(characterId, resourceId, amount, origin, destination, "credit");
}

export function getCharacterResourceBalance(characterId: string, resourceId: ResourceId): number {
  return loadBalance(characterId, resourceId);
}

/**
 * Implementação do `ResourceLedgerPersistence` (porta definida em
 * `packages/shared/src/economy/persistence.ts`). Nenhum chamador usa
 * isto ainda nesta Sprint (sem consumidor real) — prepara a peça que a
 * Sprint Merchant vai precisar: carregar/gravar o saldo de TODOS os
 * `ResourceId` de um personagem de uma vez, via snapshot.
 */
export const sqliteResourceLedgerPersistence: ResourceLedgerPersistence = {
  load(characterId: string): ResourceLedgerSnapshot | null {
    const balances: Partial<Record<ResourceId, number>> = {};
    for (const resourceId of RESOURCE_IDS) {
      balances[resourceId] = loadBalance(characterId, resourceId);
    }
    return { balances };
  },
  save(characterId: string, snapshot: ResourceLedgerSnapshot): void {
    const timestampSeconds = nowUnix();
    for (const resourceId of Object.keys(snapshot.balances) as ResourceId[]) {
      const amount = snapshot.balances[resourceId];
      if (typeof amount === "number") {
        writeBalance(characterId, resourceId, amount, timestampSeconds);
      }
    }
  },
};
