import type { BiomeTypeId } from "./types.js";

// Fase 5 — Base Identity: "Cada Base começa a possuir afinidade. Não
// exclusividade." Os 4 exemplos literais do brief (Machado->Montanhas,
// Arco->Florestas, Cajado->Ruínas, Anel->Castelos) são preservados
// exatamente; os 10 Base Items restantes (`itemgen/baseItems.ts`, o
// catálogo REAL de 14 — nenhuma Base nova inventada aqui) recebem uma
// afinidade autoral estendida, na mesma lógica temática (arma pesada ->
// Cavernas/mineração, armadura -> Castelo/forja, acessório mágico ->
// Templo). Peso 2 = weapons/accessories "principais" do exemplo do
// brief; 1.5 = extensão autoral desta Sprint, deliberadamente mais
// discreta. Toda combinação Base/Bioma ausente daqui é NEUTRA (peso 1
// implícito) — "afinidade, não exclusividade": nenhuma Base deixa de
// poder aparecer em nenhum bioma.
//
// Nenhum consumidor real lê esta tabela ainda — nem itemgen/generator.ts
// nem lootIntegration.ts a importam.
export const BASE_ITEM_BIOME_AFFINITY: Readonly<Record<string, Partial<Record<BiomeTypeId, number>>>> = {
  axe: { mountains: 2 },
  bow: { forest: 2 },
  staff: { ruins: 2 },
  ring: { castle: 2 },
  sword: { plains: 1.5 },
  dagger: { swamp: 1.5 },
  wand: { temple: 1.5 },
  mace: { caves: 1.5 },
  helmet: { castle: 1.5 },
  chest: { castle: 1.5 },
  gloves: { caves: 1.5 },
  boots: { plains: 1.5 },
  amulet: { temple: 1.5 },
  belt: { desert: 1.5 },
};

export function getBaseAffinity(baseItemId: string, biome: BiomeTypeId): number {
  return BASE_ITEM_BIOME_AFFINITY[baseItemId]?.[biome] ?? 1;
}

export function getBaseAffinitiesForBiome(biome: BiomeTypeId): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [baseItemId, affinities] of Object.entries(BASE_ITEM_BIOME_AFFINITY)) {
    const weight = affinities[biome];
    if (weight !== undefined) result[baseItemId] = weight;
  }
  return result;
}
