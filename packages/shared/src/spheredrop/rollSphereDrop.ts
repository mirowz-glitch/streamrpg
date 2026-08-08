import { pickWeighted, type ItemGenRandom } from "../itemgen/rng.js";
import { DEFAULT_SPHERE_DROP_TABLE } from "./sphereDropTable.js";
import type { SphereSource, SphereTable, SphereDropResult } from "./types.js";

/**
 * Sprint 13 — Sphere Economy Phase I. Única função de decisão desta
 * Sprint — pura, determinística por `rng` (mesmo `ItemGenRandom` já
 * usado por todo o resto do Item Generator/Loot Generator, D1: nenhuma
 * nova fonte de RNG). `table` é injetável (default
 * `DEFAULT_SPHERE_DROP_TABLE`) só para permitir teste com tabelas
 * artificiais sem precisar mockar módulo nenhum.
 */
export function rollSphereDrop(source: SphereSource, rng: ItemGenRandom, table: SphereTable = DEFAULT_SPHERE_DROP_TABLE): SphereDropResult {
  const pool = table[source];
  if (!pool || pool.weights.length === 0) {
    return { source, sphereId: null };
  }

  if (rng() >= pool.dropChance) {
    return { source, sphereId: null };
  }

  const eligible = pool.weights.filter((candidate) => candidate.weight > 0);
  if (eligible.length === 0) {
    return { source, sphereId: null };
  }

  const chosen = pickWeighted(rng, eligible);
  return { source, sphereId: chosen.sphereId };
}
