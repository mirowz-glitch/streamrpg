import type { GemCategory } from "../socket/gemDefinition.js";
import type { BiomeTypeId } from "./types.js";

// Fase 3 — Drop Profile lista "gemas" como um dos campos que define.
// Reaproveita `GemCategory` (socket/gemDefinition.ts, Sprint 20/21) —
// nunca um id de Gema individual, mesmo nível de granularidade que
// `sphereAffinity.ts` usa por Esfera (tipo, não instância). Cobertura
// parcial deliberada (5 das 12 categorias): só as combinações com uma
// leitura temática clara — o resto fica neutro, mesma disciplina de
// "nunca inventar afinidade sem lastro" já usada em baseAffinity.ts/
// sphereAffinity.ts.
export const GEM_CATEGORY_BIOME_AFFINITY: Readonly<Partial<Record<GemCategory, Partial<Record<BiomeTypeId, number>>>>> = {
  fire: { desert: 2 },
  ice: { mountains: 2 },
  life: { forest: 2 },
  defense: { castle: 2 },
  magic: { temple: 2 },
};

export function getGemAffinity(category: GemCategory, biome: BiomeTypeId): number {
  return GEM_CATEGORY_BIOME_AFFINITY[category]?.[biome] ?? 1;
}

export function getGemAffinitiesForBiome(biome: BiomeTypeId): Partial<Record<GemCategory, number>> {
  const result: Partial<Record<GemCategory, number>> = {};
  for (const [category, affinities] of Object.entries(GEM_CATEGORY_BIOME_AFFINITY)) {
    const weight = affinities?.[biome];
    if (weight !== undefined) result[category as GemCategory] = weight;
  }
  return result;
}
