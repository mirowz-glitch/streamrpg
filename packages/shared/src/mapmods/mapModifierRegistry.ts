import type { MapModifier, MapModifierCategory, MapModifierId } from "./types.js";

// Fase 3/4 — Registry data-driven: "nunca switch, nunca if gigante."
// Os 8 exemplos literais do brief, "nada além disso" — nenhum Mod
// inventado sem lastro no texto do brief. Todo `weight` neutro (10 —
// mesmo peso pra todos, já que a rolagem em si não existe ainda) e todo
// `tier` 1 (ver types.ts) — "sem balanceamento" (Fase 6).
export const MAP_MODIFIER_REGISTRY: readonly MapModifier[] = [
  {
    id: "monster-damage-up",
    name: "Fúria",
    category: "combat",
    tier: 1,
    weight: 10,
    magnitudePercent: 20,
    description: "Monstros causam +20% de dano.",
    enabled: true,
  },
  {
    id: "monster-life-up",
    name: "Vigor",
    category: "combat",
    tier: 1,
    weight: 10,
    magnitudePercent: 40,
    description: "Monstros possuem +40% de vida.",
    enabled: true,
  },
  {
    id: "gold-quantity-up",
    name: "Fortuna",
    category: "economy",
    tier: 1,
    weight: 10,
    magnitudePercent: 35,
    description: "+35% de quantidade de ouro.",
    enabled: true,
  },
  {
    id: "elite-chance-up",
    name: "Vanguarda",
    category: "encounter",
    tier: 1,
    weight: 10,
    magnitudePercent: 25,
    description: "+25% de chance de Elite.",
    enabled: true,
  },
  {
    id: "experience-up",
    name: "Sabedoria",
    category: "progression",
    tier: 1,
    weight: 10,
    magnitudePercent: 15,
    description: "+15% de experiência.",
    enabled: true,
  },
  {
    id: "loot-quantity-up",
    name: "Fartura",
    category: "economy",
    tier: 1,
    weight: 10,
    magnitudePercent: 20,
    description: "+20% de quantidade de loot.",
    enabled: true,
  },
  {
    id: "rarity-up",
    name: "Cobiça",
    category: "economy",
    tier: 1,
    weight: 10,
    magnitudePercent: 30,
    description: "+30% de raridade.",
    enabled: true,
  },
  {
    id: "boss-power-up",
    name: "Tirania",
    category: "encounter",
    tier: 1,
    weight: 10,
    // Único dos 8 exemplos literais do brief sem percentual ("Boss mais
    // forte", nunca "Boss +X%") — `magnitudePercent: 0` é deliberado,
    // não "sem efeito": inventar um número aqui violaria "nunca um
    // número novo" (Fase 6). Uma Sprint futura que precise de um valor
    // real terá que buscá-lo em texto novo, nunca aqui.
    magnitudePercent: 0,
    description: "O Boss deste mapa é mais forte.",
    enabled: true,
  },
] as const;

export function getMapModifier(id: MapModifierId): MapModifier | undefined {
  return MAP_MODIFIER_REGISTRY.find((mod) => mod.id === id);
}

export function listMapModifiers(): readonly MapModifier[] {
  return MAP_MODIFIER_REGISTRY;
}

export function listMapModifiersByCategory(category: MapModifierCategory): readonly MapModifier[] {
  return MAP_MODIFIER_REGISTRY.filter((mod) => mod.category === category);
}
