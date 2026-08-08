import type { EnemyFaction } from "./types.js";

// Fase 3 — Faction Registry. Os 10 exemplos literais do brief. `id` de
// cada facção também é o `id` do seu `FactionEconomyProfile` (Fase 5) e
// do seu `DropProfile` (Fase 6) — mesmo padrão 1:1 já usado por
// `WorldRegion.dropProfile` na Sprint 25 (nunca uma segunda convenção
// de nomeação).
//
// `hostileTo` fica `[]` em TODAS as facções por decisão explícita desta
// Sprint: o brief pede o campo como infraestrutura ("Nenhuma IA. Só
// identidade"), mas não dá nenhum exemplo literal de qual facção é
// hostil a qual — diferente de Faction Economy/Affinity, que têm
// exemplos concretos no brief. Inventar pares de hostilidade sem lastro
// violaria a mesma disciplina de "nunca inventar dado" já usada em toda
// Sprint anterior. Fica pronto pra uma Sprint futura de "facções em
// guerra" (citada explicitamente pelo usuário como próximo passo)
// preencher com decisões de lore reais.
//
// `preferredBiomes` é sempre derivado de onde as Enemy Families
// REAIS desta facção realmente vivem (enemyFamilies.ts -> enemy/
// templates.ts -> region -> worldregion/worldRegions.ts) — nunca
// inventado. Facções sem nenhuma Enemy Family real ainda (Orcs/
// Humanos/Mercenários) ficam com `preferredBiomes: []`, registradas
// mas inertes — mesmo padrão de "world_event"/"future_raid" (Sprint 24)
// e "temple" sem região real (Sprint 25).
export const ENEMY_FACTION_REGISTRY: readonly EnemyFaction[] = [
  {
    id: "goblins",
    name: "Goblins",
    description: "Bandos oportunistas que vivem da pilhagem rápida, nunca de conquista organizada.",
    culture: "Tribal, oportunista, hierarquia frágil baseada em força bruta momentânea.",
    economyProfile: "goblins",
    dropProfile: "goblins",
    preferredBiomes: ["swamp"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "mortos-vivos",
    name: "Mortos-Vivos",
    description: "Restos animados de um passado esquecido, movidos por instinto, não por vontade.",
    culture: "Sem cultura própria — ecoam fragmentos de quem foram em vida.",
    economyProfile: "mortos-vivos",
    dropProfile: "mortos-vivos",
    preferredBiomes: ["ruins"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "cultistas",
    name: "Cultistas",
    description: "Devotos de rituais proibidos, espalhados em pequenos grupos por lugares esquecidos do mundo.",
    culture: "Fé oculta, conhecimento perigoso, lealdade a algo maior que qualquer região.",
    economyProfile: "cultistas",
    dropProfile: "cultistas",
    preferredBiomes: ["ruins", "swamp", "desert"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "bandidos",
    name: "Bandidos",
    description: "Grupos organizados que controlam rotas e emboscam viajantes por lucro.",
    culture: "Pragmática, hierárquica, lealdade comprada por uma parte do saque.",
    economyProfile: "bandidos",
    dropProfile: "bandidos",
    preferredBiomes: ["plains"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "orcs",
    name: "Orcs",
    description: "Ainda sem nenhuma Família real registrada — facção reservada para conteúdo futuro.",
    culture: "Não documentada ainda.",
    economyProfile: "orcs",
    dropProfile: "orcs",
    preferredBiomes: [],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "demonios",
    name: "Demônios",
    description: "Entidades de origem incerta, associadas a fogo e corrupção antiga.",
    culture: "Alheia às noções humanas de sociedade — poder e apetite, nada mais.",
    economyProfile: "demonios",
    dropProfile: "demonios",
    preferredBiomes: ["desert"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "bestas",
    name: "Bestas",
    description: "Fauna selvagem do mundo, sem organização política — território e instinto.",
    culture: "Nenhuma — natureza pura.",
    economyProfile: "bestas",
    dropProfile: "bestas",
    preferredBiomes: ["forest", "plains", "mountains"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "humanos",
    name: "Humanos",
    description: "Ainda sem nenhuma Família real registrada — facção reservada para conteúdo futuro.",
    culture: "Não documentada ainda.",
    economyProfile: "humanos",
    dropProfile: "humanos",
    preferredBiomes: [],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "imperio",
    name: "Império",
    description: "Uma força de conquista antiga, remanescente em fortalezas e construtos que ainda obedecem sua vontade.",
    culture: "Militarista, hierárquica, obcecada por ordem e poder duradouro.",
    economyProfile: "imperio",
    dropProfile: "imperio",
    preferredBiomes: ["caves", "mountains", "castle"],
    hostileTo: [],
    enabled: true,
  },
  {
    id: "mercenarios",
    name: "Mercenários",
    description: "Ainda sem nenhuma Família real registrada — facção reservada para conteúdo futuro.",
    culture: "Não documentada ainda.",
    economyProfile: "mercenarios",
    dropProfile: "mercenarios",
    preferredBiomes: [],
    hostileTo: [],
    enabled: true,
  },
] as const;

export function getEnemyFaction(id: string): EnemyFaction | undefined {
  return ENEMY_FACTION_REGISTRY.find((faction) => faction.id === id);
}

export function listEnemyFactions(): readonly EnemyFaction[] {
  return ENEMY_FACTION_REGISTRY;
}
