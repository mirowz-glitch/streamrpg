import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { getWorldRegion, listWorldRegions } from "../worldregion/worldRegions.js";
import type { MapDefinition } from "./types.js";

// Fase 3 — Map Registry: "Registrar todos os mapas existentes. Nenhum
// órfão." Escopo desta Sprint: um Mapa por região com conteúdo de
// combate REAL (Encounter Table própria) — `porto-do-amanhecer` (hub
// seguro, sem combate) e `planicie-dourada` (nó do grafo sem Enemy
// Template/Encounter Table ainda, ver worldencounter/encounterTables.ts)
// ficam de fora por não terem NADA real pra popular `enemyPool`/
// `minimumLevel`/`maximumLevel` — "nenhum órfão" é interpretado aqui
// como "nenhuma região JOGÁVEL sem Mapa", nunca "inventar conteúdo pras
// 2 regiões que ainda não têm nenhum".
//
// `id` de cada Mapa é o próprio `regionId` — Fase I não tem Rare/Unique
// Maps (explicitamente fora de escopo), então a relação Mapa<->Região é
// 1:1, mesmo padrão de referência direta já usado em toda a série
// (`WorldRegion.dropProfile`, `EnemyFaction.economyProfile`).
// `name` reaproveita o nome real da região (REGION_GRAPH) — nunca um
// nome de mapa inventado (o brief usa "Floresta Esquecida"/"Fortaleza
// Sombria" como exemplos ilustrativos; só "Fortaleza Sombria" bate 1:1
// com um nome real, os demais mapas usam o nome real da própria
// região).
// Sprint 31 — Map Integration Phase I, Fase 3 (achado da auditoria):
// esta Sprint passa a GATEAR de verdade a geração de encontro
// (worldencounter/generator.ts) por `Map.enemyPool` — o que expôs uma
// divergência real e pré-existente entre `EnemyTemplate.region` (a
// etiqueta "administrativa" de dono) e `EncounterTable.entries` (a
// lista REAL de quem spawna, worldencounter/encounterTables.ts): o
// Skeleton tem `region: "ruinas-esquecidas"`, mas TAMBÉM aparece na
// Encounter Table de "minas-abandonadas" — decisão de design já
// documentada lá ("mortos-vivos também aparecem nas Minas per
// docs/world-design/regions.md"), nunca um bug. `enemyPool` agora é a
// UNIÃO dos dois universos (nunca só um): a etiqueta administrativa
// (`EnemyTemplate.region`) MAIS todo `enemyTemplateId` real da
// Encounter Table (`entries` + `miniBossTemplateId`) — verificado por
// teste que, pra 8 das 9 regiões jogáveis, os dois universos já eram
// idênticos (união = no-op); só "minas-abandonadas" ganha o Skeleton a
// mais. Isso torna o gate da Fase 3 comprovadamente seguro (nenhum
// monstro que hoje aparece de verdade deixa de poder aparecer).
function buildMapDefinition(regionId: string): MapDefinition | undefined {
  const region = getWorldRegion(regionId);
  const encounterTable = getEncounterTable(regionId);
  if (!region || !encounterTable) return undefined;

  const regionTaggedIds = ENEMY_TEMPLATES.filter((template) => template.region === regionId).map((template) => template.id);
  const tableRealIds = [...encounterTable.entries.map((entry) => entry.enemyTemplateId), encounterTable.miniBossTemplateId];
  const enemyPool = [...new Set([...regionTaggedIds, ...tableRealIds])];

  return {
    id: regionId,
    name: region.name,
    regionId,
    biome: region.biome,
    minimumLevel: encounterTable.levelRange.min,
    maximumLevel: encounterTable.levelRange.max,
    enemyPool,
    dangerLevel: region.dangerLevel,
    economyTier: region.economyTier,
    enabled: true,
  };
}

export const MAP_DEFINITIONS: readonly MapDefinition[] = listWorldRegions()
  .map((region) => buildMapDefinition(region.id))
  .filter((map): map is MapDefinition => map !== undefined);

export function getMapDefinition(mapId: string): MapDefinition | undefined {
  return MAP_DEFINITIONS.find((map) => map.id === mapId);
}

export function listMapDefinitions(): readonly MapDefinition[] {
  return MAP_DEFINITIONS;
}

// Fase 3 — "nenhum órfão": toda região REAL com Encounter Table própria
// precisa ter um Mapa. Vazio hoje: as 9 regiões jogáveis (das 11 reais)
// estão todas cobertas.
export function listPlayableRegionsWithoutMap(): string[] {
  const mapped = new Set(MAP_DEFINITIONS.map((map) => map.regionId));
  return listWorldRegions()
    .filter((region) => getEncounterTable(region.id) !== undefined)
    .map((region) => region.id)
    .filter((id) => !mapped.has(id));
}
