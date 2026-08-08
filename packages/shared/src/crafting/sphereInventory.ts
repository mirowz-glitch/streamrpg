/**
 * Sprint 12 — Crafting Phase I. Operações puras sobre `SphereInventory`
 * — nunca mutam o objeto recebido, sempre devolvem um novo (mesmo
 * princípio de `appendItemHistoryEvent`, Sprint 11). A persistência real
 * (tabela `character_spheres`) vive em `apps/api/src/services/
 * sphere.service.ts` — este módulo é a lógica, não o armazenamento.
 */
import type { SphereInventory, SphereStack } from "./types.js";
import type { SphereTypeId } from "../itemization/spheres.js";

export function createEmptySphereInventory(characterId: string): SphereInventory {
  return { characterId, stacks: [] };
}

export function getStackQuantity(inventory: SphereInventory, sphereId: SphereTypeId): number {
  return inventory.stacks.find((stack) => stack.sphereId === sphereId)?.quantity ?? 0;
}

export function hasSphere(inventory: SphereInventory, sphereId: SphereTypeId): boolean {
  return getStackQuantity(inventory, sphereId) > 0;
}

export function addToStack(inventory: SphereInventory, sphereId: SphereTypeId, amount: number): SphereInventory {
  if (amount <= 0) return inventory;
  const existing = inventory.stacks.find((stack) => stack.sphereId === sphereId);
  const stacks: SphereStack[] = existing
    ? inventory.stacks.map((stack) => (stack.sphereId === sphereId ? { ...stack, quantity: stack.quantity + amount } : stack))
    : [...inventory.stacks, { sphereId, quantity: amount }];
  return { ...inventory, stacks };
}

export interface ConsumeStackResult {
  inventory: SphereInventory;
  consumed: boolean;
}

/**
 * Consome exatamente 1 unidade — toda Esfera é gasta ao ser usada
 * (nunca reutilizável, nunca recarrega). Devolve `consumed: false` sem
 * alterar nada se o personagem não possuir a Esfera.
 */
export function consumeFromStack(inventory: SphereInventory, sphereId: SphereTypeId): ConsumeStackResult {
  const existing = inventory.stacks.find((stack) => stack.sphereId === sphereId);
  if (!existing || existing.quantity <= 0) {
    return { inventory, consumed: false };
  }
  const stacks =
    existing.quantity === 1
      ? inventory.stacks.filter((stack) => stack.sphereId !== sphereId)
      : inventory.stacks.map((stack) => (stack.sphereId === sphereId ? { ...stack, quantity: stack.quantity - 1 } : stack));
  return { inventory: { ...inventory, stacks }, consumed: true };
}
