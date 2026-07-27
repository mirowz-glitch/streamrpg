import type { HudState, PresentationEvent } from "@streamrpg/shared";
import { getBaseItem } from "@streamrpg/shared";
import { rarityLabel } from "./adventureLiveState";

// Living World Phase II — Fase 2 ("Jornada Atual"): responde, em
// linguagem natural, "o que aconteceu nos últimos minutos?" — nenhum
// evento novo, nenhuma consulta nova: só reorganiza `hudState
// .recentEvents` (a MESMA janela que o diário já usa, packages/shared/
// src/hud/deriveHudState.ts DEFAULT_RECENT_EVENT_LIMIT=20) num
// resumo de poucas frases, do jeito que o brief pediu literalmente:
// "Você atravessou a Floresta Sombria. Derrotou 6 Goblins. Encontrou
// uma Espada de Ferro. Chegou ao próximo checkpoint."

type EncounterFinishedEvent = Extract<PresentationEvent, { kind: "EncounterFinished" }>;
type LootDroppedEvent = Extract<PresentationEvent, { kind: "LootDropped" }>;

function totalKillsInWindow(events: readonly PresentationEvent[]): number {
  return events
    .filter((event): event is EncounterFinishedEvent => event.kind === "EncounterFinished")
    .reduce((total, event) => total + event.enemiesKilled, 0);
}

// Mesmo critério de "melhor item" que HudState.bestItemFound já usa
// (maior powerScore) — só restrito à janela recente, não a sessão
// inteira, porque "Jornada Atual" é sobre "agora", não sobre recordes.
function bestLootInWindow(events: readonly PresentationEvent[]): LootDroppedEvent | null {
  let best: LootDroppedEvent | null = null;
  for (const event of events) {
    if (event.kind === "LootDropped" && (!best || event.powerScore > best.powerScore)) best = event;
  }
  return best;
}

function findLast<T extends PresentationEvent["kind"]>(
  events: readonly PresentationEvent[],
  kind: T,
): Extract<PresentationEvent, { kind: T }> | null {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].kind === kind) return events[i] as Extract<PresentationEvent, { kind: T }>;
  }
  return null;
}

export function buildJourneySummary(hudState: HudState): string[] {
  const events = hudState.recentEvents;
  const lines: string[] = [`Sua jornada continua em ${hudState.region.name}.`];

  const bossDefeated = findLast(events, "FinalBossDefeated");
  const miniBossDefeated = findLast(events, "MiniBossDefeated");
  if (bossDefeated) {
    lines.push(`Derrotou o Chefe ${bossDefeated.enemyName}!`);
  } else if (miniBossDefeated) {
    lines.push(`Derrotou o Mini-Boss ${miniBossDefeated.enemyName}!`);
  }

  const levelUp = findLast(events, "LevelUp");
  if (levelUp) lines.push(`Alcançou o nível ${levelUp.level}.`);

  const kills = totalKillsInWindow(events);
  if (kills > 0) lines.push(`Derrotou ${kills} ${kills === 1 ? "inimigo" : "inimigos"}.`);

  const bestLoot = bestLootInWindow(events);
  if (bestLoot) {
    const name = getBaseItem(bestLoot.baseItemId)?.name ?? bestLoot.baseItemId;
    lines.push(`Encontrou ${name} (${rarityLabel(bestLoot.rarity)}).`);
  }

  const checkpoint = findLast(events, "ExpeditionCheckpointReached");
  if (checkpoint) lines.push("Chegou a um novo checkpoint da expedição.");

  if (lines.length === 1) lines.push("Por enquanto, a jornada segue tranquila.");

  return lines;
}
