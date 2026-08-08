import type { SphereTypeId } from "../itemization/spheres.js";
import type { GemCategory } from "../socket/gemDefinition.js";
import { getBaseAffinitiesForBiome } from "../worldregion/baseAffinity.js";
import { getSphereAffinitiesForBiome } from "../worldregion/sphereAffinity.js";
import { getGemAffinitiesForBiome } from "../worldregion/gemAffinity.js";
import { getMaterialTypesForBiome } from "../worldregion/materialTypes.js";
import { getMonsterLootSignature } from "../monsterLoot/monsterRegistry.js";
import type { MonsterLootSignature } from "../monsterLoot/types.js";
import { getMapDefinition } from "./mapRegistry.js";

// Fase 6 — Map Affinity: "Criar afinidade entre: Mapa -> Biome ->
// Monster -> Loot -> Economia." Camada fina de ACESSO — nunca uma
// segunda fonte de dado. "Mapa -> Biome" resolve lendo `MapDefinition.
// biome` e reaproveitando literalmente as tabelas por bioma da Sprint
// 25 (`worldregion/`); "Mapa -> Monster -> Loot" resolve lendo
// `MapDefinition.enemyPool` e devolvendo a `MonsterLootSignature` real
// (Sprint 27) de cada monstro do Pool — nunca um número novo em nenhum
// dos dois casos. "-> Economia" é o `MapEconomicProfile`
// (mapEconomicProfile.ts), lido separadamente.
export function getMapBaseAffinity(mapId: string): Partial<Record<string, number>> {
  const map = getMapDefinition(mapId);
  return map ? getBaseAffinitiesForBiome(map.biome) : {};
}

export function getMapSphereAffinity(mapId: string): Partial<Record<SphereTypeId, number>> {
  const map = getMapDefinition(mapId);
  return map ? getSphereAffinitiesForBiome(map.biome) : {};
}

export function getMapGemAffinity(mapId: string): Partial<Record<GemCategory, number>> {
  const map = getMapDefinition(mapId);
  return map ? getGemAffinitiesForBiome(map.biome) : {};
}

export function getMapMaterialIds(mapId: string): string[] {
  const map = getMapDefinition(mapId);
  return map ? getMaterialTypesForBiome(map.biome).map((material) => material.id) : [];
}

// "Mapa -> Monster -> Loot": a assinatura de loot real (Sprint 27) de
// cada monstro do Enemy Pool deste Mapa — nunca recalculada, só
// agregada.
export function getMapMonsterLootSignatures(mapId: string): MonsterLootSignature[] {
  const map = getMapDefinition(mapId);
  if (!map) return [];
  return map.enemyPool.map((monsterId) => getMonsterLootSignature(monsterId)).filter((signature): signature is MonsterLootSignature => signature !== undefined);
}
