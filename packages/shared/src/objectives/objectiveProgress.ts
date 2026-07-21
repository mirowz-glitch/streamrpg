import { ITEM_GEN_RARITIES } from "../itemgen/rarities.js";
import type { AdventureSession } from "../adventure/types.js";
import type { AdventureTimeline, PresentationEvent } from "../presentation/types.js";
import { getObjectiveDefinition, selectObjectiveId } from "./objectiveDefinitions.js";
import type { ObjectiveDefinition, ObjectiveProgressSnapshot } from "./types.js";

// Requisito 12 — Performance: "observar eventos existentes, nunca
// reprocessar toda a sessão". O objetivo ATIVO e seu progresso são
// puramente derivados da Adventure Timeline (mesmo princípio de
// bestItemFound/sessionHistory em hud/deriveHudState.ts), mas o
// intervalo varrido nunca é a sessão inteira: reinicia a cada
// ObjectiveCompleted (a "fronteira" abaixo) — só os eventos do
// objetivo ATUAL são olhados, nunca os de objetivos já concluídos.

function rarityRank(rarityId: string): number {
  const index = ITEM_GEN_RARITIES.findIndex((rarity) => rarity.id === rarityId);
  return index === -1 ? 0 : index;
}

function countObjectiveCompletions(events: readonly PresentationEvent[]): number {
  let count = 0;
  for (const event of events) {
    if (event.kind === "ObjectiveCompleted") count++;
  }
  return count;
}

function lastCompletedObjectiveId(events: readonly PresentationEvent[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ObjectiveCompleted") return event.objectiveId;
  }
  return null;
}

// Requisito 6 — a "fronteira": o tickIndex do ObjectiveCompleted mais
// recente (-1 se nenhum ainda) — eventos ATÉ essa tick (inclusive)
// pertencem ao objetivo anterior, nunca ao atual.
function boundaryTickIndex(events: readonly PresentationEvent[]): number {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].kind === "ObjectiveCompleted") return events[i].tickIndex;
  }
  return -1;
}

// Requisito 4 — um switch único (não um switch POR objetivo — todos os
// objetivos do mesmo `type` compartilham a mesma regra de progresso).
function computeProgress(objective: ObjectiveDefinition, session: AdventureSession, eventsSinceBoundary: readonly PresentationEvent[]): number {
  switch (objective.type) {
    case "kill":
      return eventsSinceBoundary.reduce((sum, event) => sum + (event.kind === "EnemyKilled" ? event.count : 0), 0);
    case "survival":
      return eventsSinceBoundary.filter((event) => event.kind === "EncounterFinished").length;
    case "level":
      // Absoluto, não incremental: "Alcance o nível X" já conta como
      // cumprido se o personagem já estiver nesse nível ou acima.
      return session.character.characterBuild.level;
    case "loot": {
      const targetRank = rarityRank(objective.targetRarity ?? "magic");
      const found = eventsSinceBoundary.some((event) => event.kind === "LootDropped" && rarityRank(event.rarity) >= targetRank);
      return found ? 1 : 0;
    }
    case "equipment": {
      const upgraded = eventsSinceBoundary.some((event) => event.kind === "ItemEquipped" && event.powerScore > event.previousPowerScore);
      return upgraded ? 1 : 0;
    }
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 5: cada
    // `case` só conta os eventos que a extensão aditiva de
    // presentationLayer.ts já publica — nenhuma lógica de detecção
    // nova, mesmo princípio de "kill"/"survival" acima.
    case "defeat-elite":
      return eventsSinceBoundary.filter((event) => event.kind === "EliteDefeated").length;
    case "defeat-miniboss":
      return eventsSinceBoundary.filter((event) => event.kind === "MiniBossDefeated").length;
    case "survive-after-elite": {
      let lastEliteDefeatedTick = -1;
      for (const event of eventsSinceBoundary) {
        if (event.kind === "EliteDefeated") lastEliteDefeatedTick = event.tickIndex;
      }
      if (lastEliteDefeatedTick === -1) return 0;
      return eventsSinceBoundary.filter((event) => event.kind === "EncounterFinished" && event.tickIndex > lastEliteDefeatedTick).length;
    }
    // World Events, Dynamic Encounters & Exploration Phase I —
    // requisito 10: cada `case` só conta os eventos que a extensão
    // aditiva de presentationLayer.ts já publica — mesmo princípio de
    // defeat-elite/defeat-miniboss acima.
    case "discover-worldevent":
      return eventsSinceBoundary.filter((event) => event.kind === "DiscoveryMade").length;
    case "open-treasure":
      return eventsSinceBoundary.filter((event) => event.kind === "TreasureOpened").length;
    case "find-merchant":
      return eventsSinceBoundary.filter((event) => event.kind === "MerchantFound").length;
    case "receive-blessing":
      return eventsSinceBoundary.filter((event) => event.kind === "ShrineBlessing").length;
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 11: cada `case` só conta os eventos que
    // expeditions/expeditionController.ts já publica — mesmo princípio
    // de defeat-elite/open-treasure acima. `diedDuringExpedition`/
    // `worldEventsFound` já vêm prontos no próprio ExpeditionCompleted
    // (calculados pela Expedição, que já varre a janela inteira) —
    // nenhuma segunda varredura de eventos cruzados aqui.
    case "complete-expedition":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCompleted").length;
    case "reach-checkpoints":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCheckpointReached").length;
    case "complete-expedition-no-death":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCompleted" && !event.diedDuringExpedition).length;
    case "complete-expedition-with-worldevent":
      return eventsSinceBoundary.filter((event) => event.kind === "ExpeditionCompleted" && event.worldEventsFound > 0).length;
    // Factions, Reputation & World Consequences Phase I — requisito 9:
    // cada `case` só conta os eventos que factions/factionController.ts
    // já publica — mesmo princípio de complete-expedition/open-treasure
    // acima. "reach-faction-rank" conta especificamente o rank
    // "respeitado" (não QUALQUER rank-up) via o campo `rankId` que o
    // próprio ReputationRankUp já carrega.
    case "reach-faction-rank":
      return eventsSinceBoundary.filter((event) => event.kind === "ReputationRankUp" && event.rankId === "respeitado").length;
    case "help-merchants":
      return eventsSinceBoundary.filter((event) => event.kind === "ReputationChanged" && event.factionId === "mercadores-livres").length;
    case "discover-ruins":
      return eventsSinceBoundary.filter((event) => event.kind === "ReputationChanged" && event.factionId === "culto-das-ruinas").length;
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 6: cada `case` só conta os eventos que
    // dungeon/dungeonController.ts já publica — mesmo princípio de
    // defeat-elite/complete-expedition acima.
    case "defeat-final-boss":
      return eventsSinceBoundary.filter((event) => event.kind === "FinalBossDefeated").length;
    case "complete-dungeon":
      return eventsSinceBoundary.filter((event) => event.kind === "DungeonCompleted").length;
    default:
      return 0;
  }
}

// Requisito 1 — "todo personagem deve possuir exatamente um objetivo
// ativo": pura, determinística — mesma AdventureSession + mesma
// Timeline (mesmo conteúdo) sempre produzem o mesmo snapshot, sem
// nenhum estado próprio guardado em lugar nenhum além da própria
// Timeline (o log de ObjectiveCompleted já é a única fonte de verdade
// de "quantos objetivos já passaram e qual foi o último").
export function deriveObjectiveProgress(session: AdventureSession, timeline: AdventureTimeline): ObjectiveProgressSnapshot {
  const events = timeline.events;
  const completedCount = countObjectiveCompletions(events);
  const previousObjectiveId = lastCompletedObjectiveId(events);
  const objectiveId = selectObjectiveId(session.seed, completedCount, previousObjectiveId, session.currentRegion);
  const objective = getObjectiveDefinition(objectiveId);
  if (!objective) {
    throw new Error(`Objective System: objetivo desconhecido "${objectiveId}"`);
  }

  const boundary = boundaryTickIndex(events);
  const eventsSinceBoundary = events.filter((event) => event.tickIndex > boundary);
  const progress = computeProgress(objective, session, eventsSinceBoundary);

  return {
    objective,
    progress,
    target: objective.target,
    complete: progress >= objective.target,
    completedCount,
  };
}
