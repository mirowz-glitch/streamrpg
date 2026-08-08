/**
 * Sprint 19 — Fase 3: BaseRegistry. Único ponto de leitura de
 * `BaseIdentity` — "nunca hardcoded, toda Base registrada". Funções
 * puras, sem I/O, mesmo princípio de `mythic/registry.ts` (Sprint 18).
 */
import type { BaseIdentity, BaseIdentityRegistry, BaseIdentitySummary, BaseIdentityTag } from "./types.js";

export function getBaseIdentity(registry: BaseIdentityRegistry, baseId: string): BaseIdentity | undefined {
  return registry[baseId];
}

export function listBaseIdentities(registry: BaseIdentityRegistry): BaseIdentity[] {
  return Object.values(registry);
}

export function listEnabledBaseIdentities(registry: BaseIdentityRegistry): BaseIdentity[] {
  return listBaseIdentities(registry).filter((identity) => identity.enabled);
}

/** Fase 5 — consulta por Tag, pronta pro dia em que Craft/Sockets/Gemas/Boss/NPC/Mercado precisarem filtrar Bases por identidade ("nunca repetir lógica"). */
export function listBaseIdentitiesByTag(registry: BaseIdentityRegistry, tag: BaseIdentityTag): BaseIdentity[] {
  return listBaseIdentities(registry).filter((identity) => identity.tags.includes(tag));
}

/** Fase 10 — resumo mínimo pra UI/API. `undefined` pra um `baseId` fora do registro (catálogo fixo pré-Sprint 11, ou id desconhecido) — nunca inventa uma identidade que a Base não tem. */
export function getBaseIdentitySummary(registry: BaseIdentityRegistry, baseId: string): BaseIdentitySummary | undefined {
  const identity = registry[baseId];
  if (!identity) return undefined;
  return { displayName: identity.displayName, tier: identity.tier, potential: identity.potential };
}
