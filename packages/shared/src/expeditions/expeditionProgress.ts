import type { AdventureSession } from "../adventure/types.js";
import type { AdventureTimeline, PresentationEvent } from "../presentation/types.js";
import { getExpeditionDefinition } from "./expeditionDefinitions.js";
import type { ExpeditionDefinition, ExpeditionProgressSnapshot } from "./types.js";

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 4: "toda informação deve ser derivada dos eventos já
// existentes. Nenhum contador paralelo." Mesmo princípio de
// deriveObjectiveProgress() (Objective System) — a "fronteira" aqui é
// o último `ExpeditionStarted`/`ExpeditionCompleted`/`ExpeditionFailed`
// da Timeline: se o mais recente for Completed/Failed (ou nenhum dos 3
// nunca aconteceu), não há expedição ativa agora (`null` — quem decide
// iniciar uma nova é expeditionController.ts, nunca esta função, que
// só OBSERVA).
function findActiveExpeditionStart(events: readonly PresentationEvent[]): { expeditionId: string; tickIndex: number } | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionCompleted" || event.kind === "ExpeditionFailed") return null;
    if (event.kind === "ExpeditionStarted") return { expeditionId: event.expeditionId, tickIndex: event.tickIndex };
  }
  return null;
}

// Requisito 3 — Checkpoints: fronteiras uniformes entre o início e a
// conclusão ("Início -> Trechos -> Checkpoint -> Trechos -> Final").
// Com `checkpointCount` checkpoints, o checkpoint N (1-indexado) fica
// no encontro `round(expectedEncounters * N / (checkpointCount + 1))`
// — o "+1" garante que o ÚLTIMO checkpoint nunca coincide com a
// conclusão (o Final é sempre um marco à parte).
function checkpointThreshold(definition: ExpeditionDefinition, checkpointIndex: number): number {
  return Math.round((definition.expectedEncounters * checkpointIndex) / (definition.checkpointCount + 1));
}

function checkpointsReachedFor(encountersCompleted: number, definition: ExpeditionDefinition): number {
  let reached = 0;
  for (let i = 1; i <= definition.checkpointCount; i++) {
    if (encountersCompleted >= checkpointThreshold(definition, i)) reached = i;
  }
  return reached;
}

// Requisito 4 — pura, determinística: mesma AdventureSession + mesma
// Timeline (mesmo conteúdo) sempre produzem o mesmo snapshot. Só conta
// eventos JÁ existentes (EncounterFinished/EliteDefeated/
// MiniBossDefeated/WorldEventStarted/ObjectiveCompleted/RegionUnlocked/
// CharacterDied) dentro da janela desde o `ExpeditionStarted` mais
// recente — mesmo princípio de "fronteira" já usado por
// deriveObjectiveProgress().
export function deriveExpeditionProgress(session: AdventureSession, timeline: AdventureTimeline): ExpeditionProgressSnapshot | null {
  const active = findActiveExpeditionStart(timeline.events);
  if (!active) return null;

  const definition = getExpeditionDefinition(active.expeditionId);
  if (!definition) return null;

  const eventsSinceStart = timeline.events.filter((event) => event.tickIndex >= active.tickIndex);

  const encountersCompleted = eventsSinceStart.filter((event) => event.kind === "EncounterFinished").length;
  const elitesDefeated = eventsSinceStart.filter((event) => event.kind === "EliteDefeated").length;
  const miniBossesDefeated = eventsSinceStart.filter((event) => event.kind === "MiniBossDefeated").length;
  const worldEventsFound = eventsSinceStart.filter((event) => event.kind === "WorldEventStarted").length;
  const objectivesCompleted = eventsSinceStart.filter((event) => event.kind === "ObjectiveCompleted").length;
  const regionsUnlocked = eventsSinceStart.filter((event) => event.kind === "RegionUnlocked").length;
  const diedDuringExpedition = eventsSinceStart.some((event) => event.kind === "CharacterDied");

  const checkpointsReached = checkpointsReachedFor(encountersCompleted, definition);
  const percent = definition.expectedEncounters > 0 ? Math.min(100, Math.floor((encountersCompleted / definition.expectedEncounters) * 100)) : 100;

  return {
    expeditionId: definition.id,
    name: definition.name,
    description: definition.description,
    difficulty: definition.difficulty,
    encountersCompleted,
    expectedEncounters: definition.expectedEncounters,
    percent,
    checkpointsReached,
    checkpointsTotal: definition.checkpointCount,
    elitesDefeated,
    miniBossesDefeated,
    worldEventsFound,
    objectivesCompleted,
    regionsUnlocked,
    diedDuringExpedition,
    complete: encountersCompleted >= definition.expectedEncounters,
    startTickIndex: active.tickIndex,
  };
}
