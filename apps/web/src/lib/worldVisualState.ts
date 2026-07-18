import type { WorldEventCategory } from "@streamrpg/shared";
import type { ExpeditionReactiveState } from "./expeditionReactiveState";
import type { ReactiveState } from "./reactiveWorld";

export type VisualSurface = "city" | "character" | "expedition" | "npc" | "building";

export type VisualState = "idle" | "active" | "important" | "celebration";

export interface WorldVisualContext {
  // Superfície "city" (WorldPresenceContext).
  worldEventCategory?: WorldEventCategory;
  playersOnline?: number;
  // Superfície "character" (PlayerFacts + Legacy).
  hasFounderTitle?: boolean;
  hasActiveLegacy?: boolean;
  // Superfície "expedition" (ExpeditionReactiveState, já calculado).
  expeditionReactiveState?: ExpeditionReactiveState;
  // Superfície "npc" (camadas já existentes de NpcIntro).
  hasLivingConsequence?: boolean;
  hasHeroJourney?: boolean;
  // Superfície "building" (ReactiveState, já calculado).
  buildingReactiveState?: ReactiveState;
}

export function buildWorldVisualContext(input: Partial<WorldVisualContext>): WorldVisualContext {
  return { ...input };
}

const HIGH_POPULATION_THRESHOLD = 5;

const EXPEDITION_STATE_TO_VISUAL: Record<ExpeditionReactiveState, VisualState> = {
  danger: "important",
  exploring: "active",
  returning: "active",
  watching: "idle",
  normal: "idle",
};

const BUILDING_STATE_TO_VISUAL: Record<ReactiveState, VisualState> = {
  growing: "celebration",
  important: "important",
  busy: "active",
  active: "active",
  normal: "idle",
};

// Pura: mesma entrada, mesma saída, sempre. Nenhum dado novo — só
// reaproveita PlayerFacts/WorldPresenceContext/ExpeditionReactiveState/
// ReactiveState/getLegacyLine já existentes, traduzidos pra um único
// vocabulário visual (4 estados) comum às 5 superfícies principais.
export function getWorldVisualState(surface: VisualSurface, ctx: WorldVisualContext): VisualState {
  switch (surface) {
    case "city":
      if (ctx.worldEventCategory === "militar") return "important";
      if ((ctx.playersOnline ?? 0) >= HIGH_POPULATION_THRESHOLD) return "active";
      return "idle";
    case "character":
      if (ctx.hasFounderTitle) return "celebration";
      if (ctx.hasActiveLegacy) return "important";
      return "idle";
    case "expedition":
      return ctx.expeditionReactiveState ? EXPEDITION_STATE_TO_VISUAL[ctx.expeditionReactiveState] : "idle";
    case "npc":
      if (ctx.hasLivingConsequence) return "important";
      if (ctx.hasHeroJourney) return "active";
      return "idle";
    case "building":
      return ctx.buildingReactiveState ? BUILDING_STATE_TO_VISUAL[ctx.buildingReactiveState] : "idle";
  }
}

export function getWorldVisualClass(surface: VisualSurface, ctx: WorldVisualContext): string {
  return `visual-${getWorldVisualState(surface, ctx)}`;
}
