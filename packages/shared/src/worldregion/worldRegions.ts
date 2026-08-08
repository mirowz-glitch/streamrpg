import { REGION_GRAPH } from "../regions.js";
import { BIOME_PROGRESSION } from "../worldencounter/biomes.js";
import type { BiomeTypeId, WorldRegion } from "./types.js";

// Fase 1 (Auditoria) — achado central desta Sprint: `id`/`name` de
// TODA WorldRegion abaixo reaproveitam, sem exceção, os 11 `regionId`
// reais de `regions.ts` (REGION_GRAPH) — a mesma disciplina de "nunca
// inventar região" já usada por `worldencounter/biomes.ts` ("Cavernas
// Antigas -> Minas Abandonadas"). `biome` deriva do `climate`/
// `description` já autorados em `BIOME_PROGRESSION` (worldencounter/
// biomes.ts) — nenhuma lore nova, só uma categorização por cima de
// texto que já existia.
//
// `dangerLevel` reaproveita o `order` de `BIOME_PROGRESSION` (1-9, a
// MESMA sequência de progressão empírica já validada por Sprints
// anteriores — nunca uma escala nova e paralela). Duas regiões não têm
// `BiomeDefinition` (nunca tiveram Encounter Table/combate real —
// comentário em `worldencounter/encounterTables.ts`): `porto-do-
// amanhecer` (hub seguro) e `planicie-dourada` (nó do grafo de viagem
// sem conteúdo ainda). Para essas duas, `dangerLevel` é um valor
// autoral documentado aqui, não derivado de nenhum dado existente:
// `porto-do-amanhecer` = 0 (hub, literalmente sem combate);
// `planicie-dourada` = 2, mesmo patamar de `pantano-podre` (order 2),
// por ser vizinha direta do hub no grafo, no mesmo "primeiro anel" que
// bosque-sussurrante/pantano-podre/colinas-aridas.
//
// `economyTier` (1-3, "cada região possui economia própria" — Fase 8)
// é derivado de `dangerLevel` em 3 faixas (0-3/4-6/7-9), EXCETO
// `porto-do-amanhecer`: apesar de dangerLevel 0, é o hub comercial
// central do jogo (Cidade) — economyTier 3 é uma decisão autoral
// explícita, documentada aqui, não uma inconsistência.
function economyTierFromDanger(dangerLevel: number): number {
  if (dangerLevel <= 3) return 1;
  if (dangerLevel <= 6) return 2;
  return 3;
}

interface RegionSeed {
  id: string;
  biome: BiomeTypeId;
  dangerLevel: number;
  economyTierOverride?: number;
}

const REGION_SEEDS: readonly RegionSeed[] = [
  { id: "porto-do-amanhecer", biome: "plains", dangerLevel: 0, economyTierOverride: 3 },
  { id: "bosque-sussurrante", biome: "forest", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "bosque-sussurrante")!.order },
  { id: "pantano-podre", biome: "swamp", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "pantano-podre")!.order },
  { id: "colinas-aridas", biome: "plains", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "colinas-aridas")!.order },
  { id: "planicie-dourada", biome: "plains", dangerLevel: 2 },
  { id: "minas-abandonadas", biome: "caves", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "minas-abandonadas")!.order },
  { id: "ruinas-esquecidas", biome: "ruins", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "ruinas-esquecidas")!.order },
  { id: "picos-congelados", biome: "mountains", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "picos-congelados")!.order },
  { id: "litoral-quebrado", biome: "ruins", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "litoral-quebrado")!.order },
  { id: "deserto-de-vidro", biome: "desert", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "deserto-de-vidro")!.order },
  { id: "fortaleza-sombria", biome: "castle", dangerLevel: BIOME_PROGRESSION.find((b) => b.regionId === "fortaleza-sombria")!.order },
];

// `enabled: true` pra todas — as 11 já são regiões reais e alcançáveis
// (ou hub, ou aguardando Enemy Template próprio, nunca "desativada" por
// design). O campo existe pra uma região futura poder nascer desligada.
export const WORLD_REGIONS: readonly WorldRegion[] = REGION_SEEDS.map((seed) => ({
  id: seed.id,
  name: REGION_GRAPH[seed.id]?.name ?? seed.id,
  biome: seed.biome,
  dangerLevel: seed.dangerLevel,
  economyTier: seed.economyTierOverride ?? economyTierFromDanger(seed.dangerLevel),
  dropProfile: seed.id,
  enabled: true,
}));

export function getWorldRegion(regionId: string): WorldRegion | undefined {
  return WORLD_REGIONS.find((region) => region.id === regionId);
}

export function listWorldRegions(): readonly WorldRegion[] {
  return WORLD_REGIONS;
}

export function listWorldRegionsByBiome(biome: BiomeTypeId): readonly WorldRegion[] {
  return WORLD_REGIONS.filter((region) => region.biome === biome);
}
