// Equipment Locking & Concurrency Phase I — Fase 2. Abstração pura de
// bloqueio temporário por item (character_item_id), sem I/O — mesma
// disciplina de todo módulo em packages/shared: nenhum import de
// node:sqlite/react, testável isoladamente.
//
// Por que isto existe mesmo com Node/node:sqlite sendo síncronos (ver
// docs/design/equipment-locking-phase1.md Seção 1 pra auditoria
// completa): hoje, dentro de UM processo, nenhuma operação real pode
// intercalar no meio de outra (DatabaseSync é síncrono, e mesmo as
// funções "async" dos repositórios legados só resolvem via microtask,
// nunca cedendo pra um novo callback de I/O antes de terminar). Este
// Lock não corrige uma corrupção hoje observável — é infraestrutura
// preventiva: (1) documenta explicitamente qual item está "em uso" por
// uma operação crítica, ao invés de depender de um invariante implícito
// que ninguém escreveu; (2) protege qualquer consumidor FUTURO que
// introduza uma escrita realmente assíncrona no meio do fluxo (ex.: uma
// validação externa); (3) dá uma API única que Salvage/Crafting podem
// reaproveitar sem precisar re-derivar esse raciocínio.
//
// Limite conhecido (mesmo já documentado em SessionManager.ts): este
// Lock é um Map em memória, válido só dentro de UM processo. Se a API
// escalar para múltiplas réplicas, esta implementação precisaria virar
// uma versão distribuída (Redis, por exemplo) sem mudar a interface
// pública.

export class EquipmentLockError extends Error {
  constructor(public readonly characterItemId: number) {
    super(`Equipment item ${characterItemId} is currently locked`);
    this.name = "EquipmentLockError";
  }
}

interface LockEntry {
  owner: string;
  acquiredAt: number;
}

// Segurança adicional (não o mecanismo principal): se algum bug futuro
// esquecer de liberar um lock, ele expira sozinho depois deste tempo —
// "o lock deve ser curto", nunca travar um item pra sempre.
const DEFAULT_STALE_LOCK_MS = 5000;

export class EquipmentLockManager {
  private readonly locks = new Map<number, LockEntry>();

  constructor(private readonly staleLockMs: number = DEFAULT_STALE_LOCK_MS) {}

  private isStale(entry: LockEntry, now: number): boolean {
    return now - entry.acquiredAt > this.staleLockMs;
  }

  isLocked(characterItemId: number, now: number = Date.now()): boolean {
    const entry = this.locks.get(characterItemId);
    if (!entry) return false;
    if (this.isStale(entry, now)) {
      this.locks.delete(characterItemId);
      return false;
    }
    return true;
  }

  /**
   * Tenta adquirir o lock de um item. Retorna `true` se conseguiu
   * (nenhum outro dono segurava o lock, ou o lock anterior expirou),
   * `false` se já está travado por outro dono.
   */
  tryAcquire(characterItemId: number, owner: string, now: number = Date.now()): boolean {
    if (this.isLocked(characterItemId, now)) return false;
    this.locks.set(characterItemId, { owner, acquiredAt: now });
    return true;
  }

  /**
   * Libera o lock de um item — só se o `owner` bater com quem adquiriu
   * (uma operação nunca libera o lock de outra por engano).
   */
  release(characterItemId: number, owner: string): void {
    const entry = this.locks.get(characterItemId);
    if (entry && entry.owner === owner) {
      this.locks.delete(characterItemId);
    }
  }

  /**
   * Fluxo completo Fase 2 — "Operação inicia → Lock do item →
   * Validação → Transação → Persistência → Unlock": adquire o lock,
   * executa `fn`, e SEMPRE libera ao final (sucesso ou falha) — nenhum
   * chamador precisa lembrar de liberar manualmente. Lança
   * `EquipmentLockError` se o item já estiver travado por outra
   * operação.
   */
  withLock<T>(characterItemId: number, owner: string, fn: () => T): T {
    if (!this.tryAcquire(characterItemId, owner)) {
      throw new EquipmentLockError(characterItemId);
    }
    try {
      return fn();
    } finally {
      this.release(characterItemId, owner);
    }
  }
}
