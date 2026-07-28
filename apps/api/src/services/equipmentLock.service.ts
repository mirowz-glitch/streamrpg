import { EquipmentLockManager } from "@streamrpg/shared";

/**
 * Singleton do EquipmentLockManager — Equipment Locking & Concurrency
 * Phase I.
 *
 * DECISÃO TEMPORÁRIA: este singleton funciona corretamente apenas em
 * ambientes de processo único (mesmo modelo já documentado em
 * SessionManager.ts). Se o projeto escalar para múltiplas réplicas ou
 * workers, esta instância precisará ser substituída por uma
 * implementação distribuída (ex: Redis) sem alterar a interface
 * pública (`tryAcquire`/`release`/`withLock`).
 *
 * Reaproveitado por todo consumidor que muta equipamento nesta mesma
 * API: drop.service.ts (equipItem), blacksmith.service.ts (upgradeItem),
 * merchant.service.ts (sellItem) — uma única instância compartilhada,
 * nunca uma por serviço (senão o lock de um nunca veria o do outro).
 */
export const equipmentLock = new EquipmentLockManager();
