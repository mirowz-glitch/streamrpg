import type { ResourceLedgerSnapshot } from "./ledger.js";

/**
 * Contrato (porta) que uma implementação de persistência real (apps/api)
 * deve satisfazer — Fase 5. O Shared define a FORMA do carregamento/
 * gravação; nunca a implementação (SQL, arquivo, o que for). Nenhum
 * arquivo em packages/shared importa `node:sqlite` ou qualquer driver de
 * banco (D8, docs/architecture/decisions.md).
 */
export interface ResourceLedgerPersistence {
  load(ownerId: string): ResourceLedgerSnapshot | null;
  save(ownerId: string, snapshot: ResourceLedgerSnapshot): void;
}
