import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";
import { getMonsterLootTable } from "./lootTableRegistry.js";

// Fase 5 — Loot Restrictions: "Criar funções puras... Nenhuma chamada
// real." Nenhuma destas funções é importada por `itemgen/generator.ts`,
// `lootgen/generator.ts` ou `lootidentity/resolve.ts` — só por testes.
//
// Regra de decisão, igual pras 5 funções: `blockedX` sempre vence sobre
// `allowedX` (uma entrada nunca pode estar nas duas listas ao mesmo
// tempo, por construção — `partition()` em lootTableRegistry.ts garante
// isso); uma tabela desabilitada (`enabled: false`) ou um monstro sem
// tabela registrada bloqueia tudo, por padrão seguro (nunca "permite
// tudo" na ausência de dado).
function isAllowed(monsterId: string, id: string, pickAllowed: (table: ReturnType<typeof getMonsterLootTable>) => readonly string[], pickBlocked: (table: ReturnType<typeof getMonsterLootTable>) => readonly string[]): boolean {
  const table = getMonsterLootTable(monsterId);
  if (!table || !table.enabled) return false;
  if (pickBlocked(table).includes(id)) return false;
  return pickAllowed(table).includes(id);
}

export function canDropBase(monsterId: string, baseItemId: string): boolean {
  return isAllowed(monsterId, baseItemId, (t) => t?.allowedBases ?? [], (t) => t?.blockedBases ?? []);
}

export function canDropAffix(monsterId: string, affixTag: string): boolean {
  return isAllowed(monsterId, affixTag, (t) => t?.allowedAffixes ?? [], (t) => t?.blockedAffixes ?? []);
}

export function canDropSphere(monsterId: string, sphereId: SphereTypeId): boolean {
  return isAllowed(monsterId, sphereId, (t) => t?.allowedSpheres ?? [], (t) => t?.blockedSpheres ?? []);
}

export function canDropGem(monsterId: string, gemCategory: GemCategory): boolean {
  return isAllowed(monsterId, gemCategory, (t) => t?.allowedGems ?? [], (t) => t?.blockedGems ?? []);
}

export function canDropMaterial(monsterId: string, materialId: string): boolean {
  return isAllowed(monsterId, materialId, (t) => t?.allowedMaterials ?? [], (t) => t?.blockedMaterials ?? []);
}

export function canDropSpecialItem(monsterId: string, specialDropId: string): boolean {
  const table = getMonsterLootTable(monsterId);
  if (!table || !table.enabled) return false;
  return table.specialDrops.some((drop) => drop.id === specialDropId);
}
