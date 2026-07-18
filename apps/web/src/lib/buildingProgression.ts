import type { PlayerFacts, EquipmentTier } from "./playerFacts";
import type { CollectionInsightContext } from "./collectionInsights";
import type { WorldPresenceContext } from "./worldPresence";

// Sprint Building Progression Phase I — camada central, sem estado, sem
// persistência, sem backend/API/tabela/sprite novo: "em que estágio esta
// construção parece estar?". Nunca humor/clima/evento/memória/
// reputação/legado/NPC/narrativa/micro evento/atividade (tudo isso já
// existe em outras camadas) — é só a evolução VISUAL estrutural, 4
// estágios fixos por prédio, preparada para sprites futuras trocarem a
// classe por uma imagem sem tocar em nenhuma regra de negócio (toda a
// decisão vive aqui, nunca no componente).
export type BuildingStage = "stage-1" | "stage-2" | "stage-3" | "stage-4";

// Inclui "bestiario" (fora de CityPlace, que o exclui deliberadamente
// para as camadas narrativas) porque o Bestiário tem seu próprio
// critério de progressão nesta Sprint (creaturesViewed).
export type BuildingProgressionPlace =
  | "praca"
  | "ferreiro"
  | "biblioteca"
  | "museu"
  | "bestiario"
  | "guilda"
  | "taverna"
  | "casa-dos-viajantes"
  | "portao-norte"
  | "arena";

export interface BuildingProgressionContext {
  facts: PlayerFacts;
  booksRead: number;
  creaturesViewed: number;
  museumEntriesViewed: number;
  playersOnline: number;
}

// Reaproveita PlayerFacts + CollectionInsightContext (já calculados por
// CityPage) + WorldPresenceContext (players_online) — nenhum dado novo.
export function buildBuildingProgressionContext(
  facts: PlayerFacts,
  insightCtx?: Partial<Pick<CollectionInsightContext, "booksRead" | "creaturesViewed" | "museumEntriesViewed">>,
  worldPresenceCtx?: WorldPresenceContext,
): BuildingProgressionContext {
  return {
    facts,
    booksRead: insightCtx?.booksRead ?? 0,
    creaturesViewed: insightCtx?.creaturesViewed ?? 0,
    museumEntriesViewed: insightCtx?.museumEntriesViewed ?? 0,
    playersOnline: worldPresenceCtx?.playersOnline ?? 0,
  };
}

// Nenhum número mágico espalhado pelo arquivo — cada critério tem sua
// própria constante nomeada, usada uma única vez.
const BOOKS_READ_THRESHOLDS = [2, 4, 8] as const;
const MUSEUM_ENTRIES_THRESHOLDS = [1, 3, 6] as const;
const CREATURES_VIEWED_THRESHOLDS = [2, 4, 8] as const;
const GUILD_BOSSES_THRESHOLDS = [1, 3, 6] as const;
const ARENA_BOSSES_THRESHOLDS = [1, 4, 8] as const;
const REGIONS_DISCOVERED_THRESHOLDS = [3, 6, 9] as const;
const TOTAL_MINUTES_THRESHOLDS = [60, 180, 480] as const;
const PRACA_REGIONS_THRESHOLDS = [3, 6, 9] as const;
const HIGH_POPULATION_THRESHOLD = 5;

const EQUIPMENT_TIER_STAGE: Record<EquipmentTier, BuildingStage> = {
  none: "stage-1",
  weak: "stage-2",
  notable: "stage-3",
  strong: "stage-4",
};

const STAGE_RANK: Record<BuildingStage, number> = { "stage-1": 1, "stage-2": 2, "stage-3": 3, "stage-4": 4 };

function stageFromThresholds(value: number, thresholds: readonly [number, number, number]): BuildingStage {
  if (value >= thresholds[2]) return "stage-4";
  if (value >= thresholds[1]) return "stage-3";
  if (value >= thresholds[0]) return "stage-2";
  return "stage-1";
}

function bumpStage(stage: BuildingStage, amount: number): BuildingStage {
  const rank = Math.min(4, Math.max(1, STAGE_RANK[stage] + amount));
  return `stage-${rank}` as BuildingStage;
}

// Pura: mesma entrada, mesma saída, sempre. Nenhum componente decide o
// estágio sozinho.
export function getBuildingStage(place: BuildingProgressionPlace, ctx: BuildingProgressionContext): BuildingStage {
  switch (place) {
    case "biblioteca":
      return stageFromThresholds(ctx.booksRead, BOOKS_READ_THRESHOLDS);
    case "museu":
      return stageFromThresholds(ctx.museumEntriesViewed, MUSEUM_ENTRIES_THRESHOLDS);
    case "bestiario":
      return stageFromThresholds(ctx.creaturesViewed, CREATURES_VIEWED_THRESHOLDS);
    case "guilda":
      return stageFromThresholds(ctx.facts.bossesDefeated, GUILD_BOSSES_THRESHOLDS);
    case "ferreiro":
      return EQUIPMENT_TIER_STAGE[ctx.facts.equipmentTier];
    case "arena":
      return stageFromThresholds(ctx.facts.bossesDefeated, ARENA_BOSSES_THRESHOLDS);
    case "casa-dos-viajantes":
      return stageFromThresholds(ctx.facts.regionsDiscovered, REGIONS_DISCOVERED_THRESHOLDS);
    case "taverna":
      return stageFromThresholds(ctx.facts.totalMinutes, TOTAL_MINUTES_THRESHOLDS);
    case "portao-norte":
      return ctx.facts.hasKingdomRole ? "stage-4" : "stage-1";
    case "praca": {
      const base = stageFromThresholds(ctx.facts.regionsDiscovered, PRACA_REGIONS_THRESHOLDS);
      return ctx.playersOnline >= HIGH_POPULATION_THRESHOLD ? bumpStage(base, 1) : base;
    }
  }
}

// Único ponto de integração pra sprites futuras: hoje devolve só uma
// classe CSS vazia ("building-stage-N"); no futuro, o mesmo estágio
// (ainda decidido só aqui) pode virar `src` de uma <img> em vez de uma
// classe, sem tocar em nenhuma regra acima.
export function getBuildingStageClass(place: BuildingProgressionPlace, ctx: BuildingProgressionContext): string {
  return `building-${getBuildingStage(place, ctx)}`;
}
