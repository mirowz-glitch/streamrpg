import type { BiomeTypeId, MaterialType } from "./types.js";

// Fase 7 — Materiais regionais. "Cada região gera materiais próprios.
// Ainda sem crafting. Apenas infraestrutura." Um catálogo de TIPOS
// (nome + bioma de origem), um por bioma — nunca um novo ResourceId:
// o recurso `"materials"` (economy/types.ts) continua um único contador
// escalar. Nenhum consumidor real (salvage.service.ts/economy.service.ts)
// lê este catálogo ainda.
export const MATERIAL_TYPES: readonly MaterialType[] = [
  { id: "madeira-elfica", name: "Madeira Élfica", biome: "forest" },
  { id: "fragmento-antigo", name: "Fragmento Antigo", biome: "ruins" },
  { id: "minerio-bruto", name: "Minério Bruto", biome: "mountains" },
  { id: "musgo-venenoso", name: "Musgo Venenoso", biome: "swamp" },
  { id: "vidro-de-areia", name: "Vidro de Areia", biome: "desert" },
  { id: "aco-forjado", name: "Aço Forjado", biome: "castle" },
  { id: "cristal-subterraneo", name: "Cristal Subterrâneo", biome: "caves" },
  { id: "fibra-selvagem", name: "Fibra Selvagem", biome: "plains" },
  { id: "po-sagrado", name: "Pó Sagrado", biome: "temple" },
] as const;

export function getMaterialType(id: string): MaterialType | undefined {
  return MATERIAL_TYPES.find((material) => material.id === id);
}

export function getMaterialTypesForBiome(biome: BiomeTypeId): readonly MaterialType[] {
  return MATERIAL_TYPES.filter((material) => material.biome === biome);
}
