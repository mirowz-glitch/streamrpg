import { createSeededRandom, pickWeighted, randomInt } from "../itemgen/rng.js";
import { listMapDefinitions } from "../worldmap/mapRegistry.js";
import type { Waystone, WaystoneInstance, WaystoneRarity, WaystoneTier } from "./types.js";

// Fase 3 — Generator: "escolher um Mapa; definir raridade/tier. Nunca
// abrir mapas. Nunca iniciar Adventure." Puro e determinístico (mesma
// seed = mesma WaystoneInstance, sempre) — mesmo padrão de todo
// Generator já real no projeto (generateRareMap(), generateEncounter(),
// generateLoot()). Nunca reaproveita `RARITY_ROLL_OPTIONS` de
// raremap/generator.ts (não exportado, e cada Generator sempre define
// sua PRÓPRIA tabela de pesos — mesmo princípio já usado por
// mapcorruption/generator.ts, que nunca importou os pesos de
// raremap/generator.ts apesar de ambos rolarem raridade/tier).
const RARITY_ROLL_OPTIONS: { rarity: Exclude<WaystoneRarity, "unique">; weight: number }[] = [
  { rarity: "normal", weight: 60 },
  { rarity: "magic", weight: 30 },
  { rarity: "rare", weight: 10 },
];

export interface GenerateWaystoneOptions {
  // Ausente = `generateWaystone()` escolhe um Mapa real entre todos os
  // `MapDefinition` reais (worldmap/mapRegistry.ts). Presente = o
  // chamador já sabe qual Node do Atlas quer abrir — mesmo princípio de
  // "ausente = automático, presente = força um cenário" já usado por
  // `GenerateRareMapOptions` (raremap/generator.ts).
  mapId?: string;
  rarity?: Exclude<WaystoneRarity, "unique">;
  tier?: WaystoneTier;
}

// Fase 3 — nunca produz `"unique"` (mesma decisão de escopo de
// `generateRareMap()`, Sprint 34 — "Mapa Unique: fora de escopo").
export function generateWaystone(seed: number, options: GenerateWaystoneOptions = {}): WaystoneInstance {
  const rng = createSeededRandom(seed);

  const maps = listMapDefinitions();
  const chosenMap = options.mapId ? maps.find((map) => map.id === options.mapId) : maps[randomInt(rng, 0, maps.length - 1)];
  if (!chosenMap) {
    throw new Error(`Waystone Generator: Mapa desconhecido "${options.mapId}"`);
  }

  const rarity = options.rarity ?? pickWeighted(rng, RARITY_ROLL_OPTIONS).rarity;
  const tier: WaystoneTier = options.tier ?? (randomInt(rng, 1, 3) as WaystoneTier);

  const waystone: Waystone = { mapId: chosenMap.id, tier, rarity };
  return {
    ...waystone,
    instanceId: `waystone-${chosenMap.id}-${seed}`,
    seed,
  };
}
