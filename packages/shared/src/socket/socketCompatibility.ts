/**
 * Sprint 20 — Fase 7: Socket Compatibility. "Nem toda Gema entra em
 * qualquer Item." Infraestrutura pura — `isGemCompatibleWithBase()`
 * existe e é testável, mas NÃO é chamada por `gem.service.ts`
 * (`socketGem()`) nesta Sprint: `socketGem()` já está em produção
 * desde a Sprint 15, e adicionar uma checagem de compatibilidade ali
 * seria uma mudança de COMPORTAMENTO real pra um consumidor já
 * existente — "infraestrutura apenas" (mesmo princípio de Implicit
 * Mods nunca aplicados, `baseIdentity/`, Sprint 19).
 *
 * Chaveado por `baseId` (não por `ItemGenCategory`) — os 3 exemplos do
 * brief ("Arma", "Armadura", "Anel") descrevem famílias inteiras, mas
 * "Anel" já é mais específico que "acessório" (ex.: um Cinto não
 * necessariamente aceita as mesmas categorias que um Anel) — chavear
 * por Base individual (as 13 reais, mesmo catálogo de
 * `itemgen/baseItems.ts`) é estritamente mais preciso e nunca perde a
 * possibilidade de futuramente agrupar por categoria.
 */
import type { GemCategory } from "./gemDefinition.js";

export interface SocketCompatibility {
  baseId: string;
  acceptedCategories: GemCategory[];
}

export type SocketCompatibilityRegistry = Record<string, SocketCompatibility>;

export function getSocketCompatibility(registry: SocketCompatibilityRegistry, baseId: string): SocketCompatibility | undefined {
  return registry[baseId];
}

/**
 * `undefined` (Base fora do registro) é tratado como "sem restrição
 * conhecida" → aceita qualquer categoria — nunca bloqueia um Item que
 * ainda não tem regra declarada (mesmo espírito de "nunca inventa uma
 * restrição que o dado não sustenta", usado em toda esta Sprint).
 */
export function isGemCompatibleWithBase(registry: SocketCompatibilityRegistry, baseId: string, category: GemCategory): boolean {
  const compatibility = registry[baseId];
  if (!compatibility) return true;
  return compatibility.acceptedCategories.includes(category);
}

// --- Exemplo de referência (Fase 12), cobrindo as 13 Bases reais ---

const WEAPON_CATEGORIES: GemCategory[] = ["attack", "critical", "support"];
const ARMOR_CATEGORIES: GemCategory[] = ["defense", "life", "utility"];
const RING_AMULET_CATEGORIES: GemCategory[] = ["magic", "support", "mana"];
const BELT_CATEGORIES: GemCategory[] = ["life", "utility", "support"];

function weaponCompat(baseId: string): SocketCompatibility {
  return { baseId, acceptedCategories: WEAPON_CATEGORIES };
}
function armorCompat(baseId: string): SocketCompatibility {
  return { baseId, acceptedCategories: ARMOR_CATEGORIES };
}

export const EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY: SocketCompatibilityRegistry = {
  sword: weaponCompat("sword"),
  axe: weaponCompat("axe"),
  bow: weaponCompat("bow"),
  dagger: weaponCompat("dagger"),
  staff: weaponCompat("staff"),
  wand: weaponCompat("wand"),
  mace: weaponCompat("mace"),
  helmet: armorCompat("helmet"),
  chest: armorCompat("chest"),
  gloves: armorCompat("gloves"),
  boots: armorCompat("boots"),
  ring: { baseId: "ring", acceptedCategories: RING_AMULET_CATEGORIES },
  amulet: { baseId: "amulet", acceptedCategories: RING_AMULET_CATEGORIES },
  belt: { baseId: "belt", acceptedCategories: BELT_CATEGORIES },
};
