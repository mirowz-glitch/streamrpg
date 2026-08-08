import { getBaseAffinitiesForBiome } from "./baseAffinity.js";
import { getGemAffinitiesForBiome } from "./gemAffinity.js";
import { getMaterialTypesForBiome } from "./materialTypes.js";
import { getSphereAffinitiesForBiome } from "./sphereAffinity.js";
import type { DropProfile, WorldRegion } from "./types.js";
import { WORLD_REGIONS } from "./worldRegions.js";

// Fase 3 — Drop Profile: "Define: raridade, bases, esferas, gemas,
// materiais, ouro. Nunca gera Item. Só define o perfil." Cada campo é
// só um multiplicador (1 = neutro) — nenhum consumidor real
// (itemgen/generator.ts, lootgen/, lootidentity/) lê nada deste módulo
// ainda. `baseAffinity`/`sphereAffinity`/`gemAffinity` são sempre
// DERIVADOS do bioma da região (Fase 5/6, baseAffinity.ts/
// sphereAffinity.ts/gemAffinity.ts) — nunca uma segunda fonte de
// verdade divergente; um Drop Profile nunca declara afinidade própria.
//
// `rarityWeightMultipliers` fica vazio (`{}`) em toda região — "não
// balancear ainda" (Fase 5 do brief) é literal: nenhuma raridade é
// favorecida por nenhuma região nesta Sprint. `goldMultiplier` fica em
// 1 pelo mesmo motivo.
function buildDropProfileForRegion(region: WorldRegion): DropProfile {
  return {
    id: region.dropProfile,
    rarityWeightMultipliers: {},
    baseAffinity: getBaseAffinitiesForBiome(region.biome),
    sphereAffinity: getSphereAffinitiesForBiome(region.biome),
    gemAffinity: getGemAffinitiesForBiome(region.biome),
    materialTypes: getMaterialTypesForBiome(region.biome).map((material) => material.id),
    goldMultiplier: 1,
    enabled: region.enabled,
  };
}

export const DROP_PROFILES: readonly DropProfile[] = WORLD_REGIONS.map(buildDropProfileForRegion);

export function getDropProfile(id: string): DropProfile | undefined {
  return DROP_PROFILES.find((profile) => profile.id === id);
}

export function getDropProfileForRegion(regionId: string): DropProfile | undefined {
  const region = WORLD_REGIONS.find((r) => r.id === regionId);
  if (!region) return undefined;
  return getDropProfile(region.dropProfile);
}

export function listDropProfiles(): readonly DropProfile[] {
  return DROP_PROFILES;
}
