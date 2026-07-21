import type { AdventureTimeline, PresentationEvent } from "../presentation/types.js";
import { getFactionDefinition, getFactionForRegion, getNextRank, getRankForReputation } from "./factionDefinitions.js";
import type { FactionProgressSnapshot } from "./types.js";

// Requisito 3 — "toda reputação varia por eventos existentes": nenhum
// contador paralelo em lugar nenhum — a reputação atual de uma facção é
// sempre o `newReputation` do ÚLTIMO ReputationChanged dessa facção na
// Timeline (0 se nunca aconteceu nenhum), mesmo princípio de
// deriveExpeditionProgress()/deriveObjectiveProgress() (derivação pura
// a partir de eventos já publicados).
function findLastReputationEvent(events: readonly PresentationEvent[], factionId: string): PresentationEvent | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ReputationChanged" && event.factionId === factionId) return event;
  }
  return null;
}

export function deriveFactionReputation(factionId: string, timeline: AdventureTimeline): number {
  const event = findLastReputationEvent(timeline.events, factionId);
  return event && event.kind === "ReputationChanged" ? event.newReputation : 0;
}

export function deriveFactionProgress(factionId: string, timeline: AdventureTimeline): FactionProgressSnapshot | null {
  const definition = getFactionDefinition(factionId);
  if (!definition) return null;

  const reputation = deriveFactionReputation(factionId, timeline);
  const rank = getRankForReputation(definition, reputation);
  const nextRank = getNextRank(definition, reputation);
  const percentToNextRank = nextRank
    ? Math.min(100, Math.max(0, Math.floor(((reputation - rank.minReputation) / (nextRank.minReputation - rank.minReputation)) * 100)))
    : 100;

  return {
    factionId: definition.id,
    factionName: definition.name,
    reputation,
    rankId: rank.id,
    rankName: rank.name,
    percentToNextRank,
    nextRankName: nextRank?.name ?? null,
  };
}

// Requisito 5 — "Facção Atual": a facção dona do bioma onde o jogador
// está agora (ver getFactionForRegion) — `null` só quando a região
// atual ainda não tem facção dona.
export function deriveCurrentFactionProgress(currentRegionId: string, timeline: AdventureTimeline): FactionProgressSnapshot | null {
  const faction = getFactionForRegion(currentRegionId);
  if (!faction) return null;
  return deriveFactionProgress(faction.id, timeline);
}
