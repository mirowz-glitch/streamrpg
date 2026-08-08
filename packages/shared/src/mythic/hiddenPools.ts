/**
 * Sprint 18 — Fase 7: Hidden Pools. "A Esfera da Incerteza sempre
 * consulta primeiro a Pool da Base. Nunca criar regras especiais." Os
 * 5 pools (Common/Rare/Epic/Legendary/Mythic) já existem como rótulo
 * em `TransformationWeight.pool` (`TransformationRarityPool`, Sprint
 * 17 Fase 9) — este módulo só formaliza a leitura agrupada por pool,
 * nunca duplica ou substitui `BaseTransformationPool.weights`, que
 * continua sendo a ÚNICA fonte que `resolveUncertaintyOutcome`
 * (transformation/resolver.ts) lê pra resolver um roll. "Hidden" no
 * sentido de: o jogador nunca vê estes pools diretamente — só o
 * resultado final.
 */
import type { BaseTransformationPool, TransformationRarityPool, TransformationWeight } from "../transformation/types.js";

export type HiddenPoolSnapshot = Record<TransformationRarityPool, TransformationWeight[]>;

const EMPTY_POOL_SNAPSHOT: HiddenPoolSnapshot = { common: [], rare: [], epic: [], legendary: [], mythic: [] };

/** Agrupa os pesos de uma Base pelos 5 pools de raridade — pura leitura, nunca influencia o resolver. */
export function groupWeightsByPool(pool: BaseTransformationPool): HiddenPoolSnapshot {
  const snapshot: HiddenPoolSnapshot = { common: [], rare: [], epic: [], legendary: [], mythic: [] };
  for (const weight of pool.weights) {
    snapshot[weight.pool] = [...snapshot[weight.pool], weight];
  }
  return snapshot;
}

/** "Cada Base define peso/chance/enabled" — true se a Base tem QUALQUER entrada no Pool Mítico, sem revelar pesos/chance. */
export function hasMythicPool(pool: BaseTransformationPool | undefined): boolean {
  if (!pool) return false;
  return pool.weights.some((w) => w.pool === "mythic");
}

export { EMPTY_POOL_SNAPSHOT };
