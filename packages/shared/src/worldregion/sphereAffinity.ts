import type { SphereTypeId } from "../itemization/spheres.js";
import type { BiomeTypeId } from "./types.js";

// Fase 6 — Sphere Drop: "As Esferas também passam a possuir afinidade."
// Os 4 exemplos literais do brief (Fortuna->Ruínas, Purificação->
// Templos, Lapidação->Montanhas, Maldição->Castelos) são preservados
// exatamente. Dois ids não recebem entrada, por decisão deliberada:
// - "ascension": não citado pelo brief nesta Fase — deixado neutro
//   (omissão real, mesma disciplina de "nunca inventar dado" já usada
//   por DEFAULT_SPHERE_DROP_TABLE, Sprint 13/24).
// - "uncertainty": o brief é explícito — "Nunca possui afinidade. Pode
//   aparecer em qualquer lugar. Sempre extremamente rara." Omitida por
//   CONTRATO, não por esquecimento; `getSphereAffinity("uncertainty", *)`
//   sempre devolve o neutro (1), nunca lida como "favorecida" nem
//   "desfavorecida" em bioma nenhum.
//
// Nenhum consumidor real lê esta tabela ainda — `rollSphereDrop()`
// (spheredrop/rollSphereDrop.ts) continua orientado só por `SphereSource`
// (adventure/dungeon/boss/world_boss/world_event/future_raid), nunca por
// bioma.
export const SPHERE_BIOME_AFFINITY: Readonly<Partial<Record<SphereTypeId, Partial<Record<BiomeTypeId, number>>>>> = {
  fortune: { ruins: 2 },
  purification: { temple: 2 },
  lapidation: { mountains: 2 },
  curse: { castle: 2 },
};

export function getSphereAffinity(sphereId: SphereTypeId, biome: BiomeTypeId): number {
  return SPHERE_BIOME_AFFINITY[sphereId]?.[biome] ?? 1;
}

export function getSphereAffinitiesForBiome(biome: BiomeTypeId): Partial<Record<SphereTypeId, number>> {
  const result: Partial<Record<SphereTypeId, number>> = {};
  for (const [sphereId, affinities] of Object.entries(SPHERE_BIOME_AFFINITY)) {
    const weight = affinities?.[biome];
    if (weight !== undefined) result[sphereId as SphereTypeId] = weight;
  }
  return result;
}
