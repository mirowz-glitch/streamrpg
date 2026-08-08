import type { BiomeType, BiomeTypeId } from "./types.js";

// Fase 4 — Biome Registry. 9 tipos (8 exemplos literais do brief +
// "temple", nomeado só na Fase 6 — ver nota em types.ts). Cada tipo é
// uma IDENTIDADE reusável entre regiões (ex.: "mountains" pode
// descrever tanto Picos Congelados quanto uma região futura) — nunca um
// lugar em si, distinto de `WorldRegion`.
export const BIOME_REGISTRY: readonly BiomeType[] = [
  { id: "forest", name: "Floresta", description: "Copas densas, trilhas estreitas, caça abundante." },
  { id: "ruins", name: "Ruínas", description: "Estruturas antigas meio desmoronadas, história soterrada." },
  { id: "mountains", name: "Montanhas", description: "Picos e encostas íngremes, minério exposto, ar rarefeito." },
  { id: "swamp", name: "Pântano", description: "Água parada, vegetação apodrecida, terreno instável." },
  { id: "desert", name: "Deserto", description: "Areia e calor extremos, pouquíssima vida visível." },
  { id: "castle", name: "Castelo", description: "Fortificação erguida por mãos humanas, salões e muralhas." },
  { id: "caves", name: "Cavernas", description: "Túneis subterrâneos, escuridão, ecos." },
  { id: "plains", name: "Campos", description: "Terreno aberto, vegetação rasteira, pouco abrigo." },
  { id: "temple", name: "Templo", description: "Construção sagrada ou ritualística, propósito perdido no tempo." },
] as const;

export function getBiomeType(id: BiomeTypeId): BiomeType | undefined {
  return BIOME_REGISTRY.find((biome) => biome.id === id);
}

export function listBiomeTypes(): readonly BiomeType[] {
  return BIOME_REGISTRY;
}
