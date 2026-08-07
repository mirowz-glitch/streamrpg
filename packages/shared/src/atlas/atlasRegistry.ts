import { listMapDefinitions, getMapDefinition } from "../worldmap/mapRegistry.js";
import { REGION_GRAPH } from "../regions.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import type { AtlasNode, AtlasProgress, AtlasState } from "./types.js";

// Fase 3 — "Registrar os 9 mapas reais... Nada procedural." Reaproveita
// `listMapDefinitions()` (worldmap/mapRegistry.ts, Sprint 30) como a
// ÚNICA fonte de "quais mapas existem" — nunca uma segunda lista
// digitada à mão. Os 9 mapas reais (das 11 WorldRegions) já são
// exatamente os mesmos 9 que `BIOME_PROGRESSION`/`REGION_PROGRESSION_ORDER`
// enumeram — nenhuma região sem conteúdo de combate (porto-do-amanhecer/
// planicie-dourada) nunca vira Node.
const REAL_MAP_IDS = new Set(listMapDefinitions().map((map) => map.id));

// `connections` reaproveita `REGION_GRAPH` (regions.ts, grafo de viagem
// já real) filtrado apenas aos ids que também são um Mapa real — as 2
// regiões sem Mapa nunca aparecem como Node nem como conexão de um Node
// vizinho.
function buildConnections(mapId: string): string[] {
  const neighbors = REGION_GRAPH[mapId]?.neighbors ?? [];
  return neighbors.filter((id) => REAL_MAP_IDS.has(id));
}

function resolveAtlasNode(mapId: string, tier: number, progress: AtlasProgress): AtlasNode {
  return {
    id: mapId,
    mapId,
    tier,
    connections: buildConnections(mapId),
    unlocked: progress.unlockedMapIds.includes(mapId),
    completed: progress.completedMapIds.includes(mapId),
    favorite: progress.favoriteMapIds.includes(mapId),
  };
}

export function listAtlasMapIds(): string[] {
  return listMapDefinitions().map((map) => map.id);
}

// Fase 3 — o Atlas inteiro de um jogador, reconstruído puramente a
// partir do catálogo real de Mapas (worldmap/) + do que o chamador sabe
// sobre este jogador (`AtlasProgress`). Nunca guardado entre chamadas.
export function buildAtlasState(progress: AtlasProgress): AtlasState {
  const nodes = listMapDefinitions().map((map) => resolveAtlasNode(map.id, map.dangerLevel, progress));
  return { nodes };
}

export function getAtlasNode(mapId: string, progress: AtlasProgress): AtlasNode | undefined {
  const map = getMapDefinition(mapId);
  if (!map) return undefined;
  return resolveAtlasNode(map.id, map.dangerLevel, progress);
}

// Fase 2/3 — deriva `unlockedMapIds` PURAMENTE do nível do personagem,
// reaproveitando a MESMA régua de nível real que `checkRegionUnlock()`
// (worldencounter/regionProgression.ts) já usa pro desbloqueio
// incremental de verdade — nunca uma segunda régua. Conveniência pra
// quem não tem uma `AdventureTimeline` à mão (ex.: uma tela de Atlas que
// só conhece o nível do personagem); nunca substitui
// `AdventureTimeline.unlockedRegionIds` como fonte, quando disponível.
export function deriveUnlockedMapIds(characterLevel: number): string[] {
  return listMapDefinitions()
    .filter((map) => {
      const table = getEncounterTable(map.id);
      return table !== undefined && characterLevel >= table.levelRange.min;
    })
    .map((map) => map.id);
}
