import type { WorldEventCategory } from "@streamrpg/shared";
import type { PlayerFacts } from "./playerFacts";
import type { CollectionInsightContext } from "./collectionInsights";
import type { WorldPresenceContext } from "./worldPresence";
import type { BuildingProgressionPlace } from "./buildingProgression";

// Sprint Kingdom Reactive World Phase I — camada central, sem estado,
// sem persistência, sem backend/tabela/regra de progresso nova: "em que
// pequeno estado visual este prédio está agora?". Nunca texto novo —
// só um estado (normal/active/busy/important/growing), preparado pra
// virar sprite/efeito depois, decidido só aqui (nenhum Building decide
// sozinho).
export type ReactiveState = "normal" | "active" | "busy" | "important" | "growing";

export interface ReactiveWorldContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
  museumEntriesViewed: number;
  playersOnline: number;
  worldEventCategory?: WorldEventCategory;
}

// Reaproveita PlayerFacts + CollectionInsightContext + WorldPresenceContext
// (já calculados por CityPage) — nenhum dado novo.
export function buildReactiveWorldContext(
  facts: PlayerFacts,
  insightCtx?: Partial<Pick<CollectionInsightContext, "booksRead" | "creaturesViewed" | "museumEntriesViewed">>,
  worldPresenceCtx?: WorldPresenceContext,
): ReactiveWorldContext {
  return {
    facts,
    booksRead: insightCtx?.booksRead ?? 0,
    creaturesViewed: insightCtx?.creaturesViewed ?? 0,
    museumEntriesViewed: insightCtx?.museumEntriesViewed ?? 0,
    playersOnline: worldPresenceCtx?.playersOnline ?? 0,
    worldEventCategory: worldPresenceCtx?.eventCategory,
  };
}

const HIGH_POPULATION_THRESHOLD = 5;
const BOOKS_READ_GROWING_THRESHOLD = 6;
const MUSEUM_ENTRIES_IMPORTANT_THRESHOLD = 4;
const CREATURES_VIEWED_IMPORTANT_THRESHOLD = 6;
const GUILD_BOSSES_ACTIVE_THRESHOLD = 3;
const TAVERN_MINUTES_BUSY_THRESHOLD = 300;
const REGIONS_DISCOVERED_GROWING_THRESHOLD = 5;

// Pura: mesma entrada, mesma saída, sempre. Cada prédio depende de
// exatamente 1 sinal real (nunca combinado) — "normal" é sempre o
// estado padrão quando o sinal não bate.
export function getReactiveState(place: BuildingProgressionPlace, ctx: ReactiveWorldContext): ReactiveState {
  switch (place) {
    case "praca":
      return ctx.playersOnline >= HIGH_POPULATION_THRESHOLD ? "busy" : "normal";
    case "biblioteca":
      return ctx.booksRead >= BOOKS_READ_GROWING_THRESHOLD ? "growing" : "normal";
    case "museu":
      return ctx.museumEntriesViewed >= MUSEUM_ENTRIES_IMPORTANT_THRESHOLD ? "important" : "normal";
    case "bestiario":
      return ctx.creaturesViewed >= CREATURES_VIEWED_IMPORTANT_THRESHOLD ? "important" : "normal";
    case "guilda":
      return ctx.facts.bossesDefeated >= GUILD_BOSSES_ACTIVE_THRESHOLD ? "active" : "normal";
    case "ferreiro":
      return ctx.facts.equipmentTier === "strong" ? "busy" : "normal";
    case "arena":
      return ctx.worldEventCategory === "militar" ? "active" : "normal";
    case "taverna":
      return ctx.facts.totalMinutes >= TAVERN_MINUTES_BUSY_THRESHOLD ? "busy" : "normal";
    case "casa-dos-viajantes":
      return ctx.facts.regionsDiscovered >= REGIONS_DISCOVERED_GROWING_THRESHOLD ? "growing" : "normal";
    case "portao-norte":
      return ctx.facts.hasKingdomRole ? "important" : "normal";
  }
}

// Único ponto de integração pra sprites/efeitos futuros: hoje só uma
// classe CSS leve; no futuro o mesmo estado pode virar sprite iluminada/
// NPC se movendo, sem tocar em nenhuma regra acima.
export function getReactiveClass(place: BuildingProgressionPlace, ctx: ReactiveWorldContext): string {
  return `reactive-${getReactiveState(place, ctx)}`;
}
