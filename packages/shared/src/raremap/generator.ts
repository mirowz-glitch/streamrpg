import { createSeededRandom, pickWeighted, pickWeightedMany, randomInt } from "../itemgen/rng.js";
import { listMapDefinitions } from "../worldmap/mapRegistry.js";
import { listMapModifiers } from "../mapmods/mapModifierRegistry.js";
import type { RareMap, RareMapInstance, RareMapRarity, RareMapTier } from "./types.js";

// Fase 4 — "Quantidade de Mods... Infraestrutura. Sem balanceamento
// definitivo." Os 3 exemplos literais do brief, exatos: Normal 0,
// Magic 1-2, Rare 3-5. `"unique"` nunca aparece aqui — chave ausente
// de propósito, `generateRareMap()` nunca rola essa raridade nesta
// Sprint (ver types.ts).
const MOD_COUNT_RANGE: Record<Exclude<RareMapRarity, "unique">, { min: number; max: number }> = {
  normal: { min: 0, max: 0 },
  magic: { min: 1, max: 2 },
  rare: { min: 3, max: 5 },
};

// Fase 4 — distribuição de raridade: nenhum número deste tipo é citado
// no brief ("sem balanceamento definitivo" cobre isto também) — pesos
// arbitrários, só pra que `generateRareMap()` sem `options.rarity`
// explícito produza uma amostra plausível (a maioria Normal, Rare
// raro) em vez de travar sem uma escolha. Nunca produz `"unique"`
// (fora do pool, não só peso 0 — "fora de escopo" é literal).
const RARITY_ROLL_OPTIONS: { rarity: Exclude<RareMapRarity, "unique">; weight: number }[] = [
  { rarity: "normal", weight: 60 },
  { rarity: "magic", weight: 30 },
  { rarity: "rare", weight: 10 },
];

export interface GenerateRareMapOptions {
  // Ausente = `generateRareMap()` escolhe um Mapa real (Fase 3:
  // "escolher um mapa") entre todos os `MapDefinition` reais
  // (worldmap/mapRegistry.ts). Presente = o chamador já sabe pra qual
  // Mapa quer rolar (ex.: o mesmo Mapa que o jogador já vai explorar) —
  // mesmo princípio de "ausente = comportamento automático, presente =
  // força um cenário" já usado em todo `GenerateLootOptions`/
  // `GenerateMonsterLootOverrides` (lootgen/lootidentity).
  mapId?: string;
  rarity?: Exclude<RareMapRarity, "unique">;
  tier?: RareMapTier;
}

// Fase 3 — Generator: "escolher um mapa; definir quantidade de Mods;
// escolher Mods. Nunca abrir mapas. Nunca iniciar Adventure." Puro e
// determinístico (mesma seed = mesmo RareMapInstance, sempre) — mesmo
// padrão de todo Generator já real no projeto (generateEncounter(),
// generateLoot(), generateItem()).
//
// "Escolher Mods" reaproveita `pickWeightedMany()` (itemgen/rng.ts) —
// a MESMA função que já escolhe Prefixos/Sufixos sem repetição — sobre
// `MapModifier.weight` (mapmods/mapModifierRegistry.ts), um campo que
// existe desde a Sprint 32 mas nunca teve nenhum consumidor real até
// agora ("existe só pra já ter o campo certo quando uma Sprint futura
// precisar sortear Mods" — literalmente esta Sprint). O pool é
// filtrado por `mod.enabled && mod.tier <= tier` — nunca um Mod raro
// que a instância não deveria poder rolar, embora hoje (todo Mod real
// é Tier 1) isso nunca filtre nada de verdade.
export function generateRareMap(seed: number, options: GenerateRareMapOptions = {}): RareMapInstance {
  const rng = createSeededRandom(seed);

  const maps = listMapDefinitions();
  const chosenMap = options.mapId ? maps.find((map) => map.id === options.mapId) : maps[randomInt(rng, 0, maps.length - 1)];
  if (!chosenMap) {
    throw new Error(`Rare Map Generator: Mapa desconhecido "${options.mapId}"`);
  }

  const rarity = options.rarity ?? pickWeighted(rng, RARITY_ROLL_OPTIONS).rarity;
  const tier: RareMapTier = options.tier ?? (randomInt(rng, 1, 3) as RareMapTier);

  const modCount = randomInt(rng, MOD_COUNT_RANGE[rarity].min, MOD_COUNT_RANGE[rarity].max);
  const eligibleMods = listMapModifiers().filter((mod) => mod.enabled && mod.tier <= tier);
  const mods = pickWeightedMany(rng, eligibleMods, modCount).map((mod) => mod.id);

  const rareMap: RareMap = { mapId: chosenMap.id, rarity, tier, mods };
  return {
    ...rareMap,
    instanceId: `raremap-${chosenMap.id}-${seed}`,
    seed,
  };
}
