/**
 * Sprint 18 — Fase 4: DiscoverableBase. Consulta pura sobre o que uma
 * Base declara suportar — "nada fixo, tudo data-driven". Nunca decide
 * elegibilidade de roll sozinha (isso continua sendo
 * `isBaseEligibleForUncertainty`/`BaseTransformationPool`,
 * transformation/resolver.ts) — só expõe o que já está declarado.
 */
import type { DiscoverableBase, DiscoverableBaseRegistry } from "./types.js";

export function getDiscoverableBase(registry: DiscoverableBaseRegistry, baseItemId: string): DiscoverableBase | undefined {
  return registry[baseItemId];
}

export function baseSupportsMythic(registry: DiscoverableBaseRegistry, baseItemId: string): boolean {
  return registry[baseItemId]?.supportsMythic === true;
}

export function baseSupportsUncertainty(registry: DiscoverableBaseRegistry, baseItemId: string): boolean {
  return registry[baseItemId]?.supportsUncertainty === true;
}
