/**
 * Sprint 21 — Gem Effects Phase I, Fase 3. Único ponto de leitura de
 * `GemEffect` — mesmo princípio de `gemRegistry.ts` (Sprint 20):
 * funções puras, sem I/O, "nada hardcoded" em nenhum serviço da API.
 */
import type { GemEffect, GemEffectRegistry, GemEffectStatType } from "./gemEffect.js";

export function getGemEffect(registry: GemEffectRegistry, effectId: string): GemEffect | undefined {
  return registry[effectId];
}

export function listGemEffects(registry: GemEffectRegistry): GemEffect[] {
  return Object.values(registry);
}

export function listEnabledGemEffects(registry: GemEffectRegistry): GemEffect[] {
  return listGemEffects(registry).filter((effect) => effect.enabled);
}

export function listGemEffectsByType(registry: GemEffectRegistry, type: GemEffectStatType): GemEffect[] {
  return listGemEffects(registry).filter((effect) => effect.type === type);
}

/**
 * Fase 4 — os 7 tipos de exemplo QA, um `GemEffect` por tipo. "Não
 * criar centenas de efeitos" — exatamente 7, o mínimo pedido pelo
 * brief. `attack`/`defense` usam `percent` (têm stat-base real hoje,
 * ver gemEffect.ts); os outros 5 usam `flat` (stat-base ainda 0 em
 * `/api/character`, `percent` resolveria sempre pra 0 — decisão
 * documentada em `docs/design/gem-effects-phase1.md`).
 */
export const EXAMPLE_GEM_EFFECT_REGISTRY: GemEffectRegistry = {
  "attack-percent-1": { id: "attack-percent-1", type: "attack", value: 5, scaling: "percent", enabled: true, description: "Ataque +5%" },
  "defense-percent-1": { id: "defense-percent-1", type: "defense", value: 5, scaling: "percent", enabled: true, description: "Defesa +5%" },
  "critical-flat-1": { id: "critical-flat-1", type: "critical", value: 2, scaling: "flat", enabled: true, description: "Crítico +2%" },
  "life-flat-1": { id: "life-flat-1", type: "life", value: 30, scaling: "flat", enabled: true, description: "Vida +30" },
  "mana-flat-1": { id: "mana-flat-1", type: "mana", value: 15, scaling: "flat", enabled: true, description: "Mana +15" },
  "attackspeed-flat-1": { id: "attackspeed-flat-1", type: "attackSpeed", value: 3, scaling: "flat", enabled: true, description: "Velocidade de Ataque +3" },
  "magic-flat-1": { id: "magic-flat-1", type: "magic", value: 8, scaling: "flat", enabled: true, description: "Magia +8" },
};
