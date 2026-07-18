import type { EncounterCategory, ExpeditionApproach, ExpeditionStatus } from "@streamrpg/shared";

export type ExpeditionReactiveState = "normal" | "watching" | "danger" | "exploring" | "returning";

export interface ExpeditionReactiveContext {
  status: ExpeditionStatus;
  progressPercent: number;
  approach: ExpeditionApproach | null;
  encounterCategory: EncounterCategory | null;
}

interface ExpeditionLike {
  status: ExpeditionStatus;
  progress_percent: number;
  approach: ExpeditionApproach | null;
  encounter: { category: EncounterCategory } | null;
}

export function buildExpeditionReactiveContext(expedition: ExpeditionLike): ExpeditionReactiveContext {
  return {
    status: expedition.status,
    progressPercent: expedition.progress_percent,
    approach: expedition.approach,
    encounterCategory: expedition.encounter?.category ?? null,
  };
}

const STATUS_TO_STATE: Record<ExpeditionStatus, ExpeditionReactiveState> = {
  preparing: "watching",
  exploring: "exploring",
  combating: "danger",
  resting: "watching",
  returning: "returning",
  completed: "normal",
};

export function getExpeditionReactiveState(ctx: ExpeditionReactiveContext): ExpeditionReactiveState {
  if (ctx.status === "completed") return "normal";
  if (ctx.encounterCategory === "descoberta") return "exploring";
  const base = STATUS_TO_STATE[ctx.status];
  // "quando houver empate": preparing e resting empatam em "watching" —
  // approach "investigate" (já escolhido antes, persiste a expedição
  // inteira) desempata a favor de "exploring". Combating/returning já
  // têm estado próprio e inequívoco, nunca desempatados por approach.
  if (base === "watching" && ctx.approach === "investigate") return "exploring";
  return base;
}

export function getExpeditionReactiveClass(ctx: ExpeditionReactiveContext): string {
  return `reactive-expedition-${getExpeditionReactiveState(ctx)}`;
}
