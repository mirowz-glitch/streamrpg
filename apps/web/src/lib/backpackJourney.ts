import type { HudState, PresentationEvent } from "@streamrpg/shared";
import { getBaseItem } from "@streamrpg/shared";
import { rarityLabel } from "./adventureLiveState";

// Backpack Experience Phase I — Fase 3 ("História da Mochila" /
// "Última Jornada"). Mesmo PADRÃO de `adventureJourney.ts
// buildJourneySummary()` (agregar a janela recente em poucas frases,
// nunca uma por evento) — mas um utilitário NOVO, não uma reexportação:
// `buildJourneySummary` resume a AVENTURA inteira (combate, chefe,
// checkpoint); "Última Jornada" resume só o que a Mochila recebeu
// (itens), um eixo de agregação diferente sobre a MESMA janela
// (`hudState.recentEvents`) — mesma fonte, pergunta diferente.
type LootDroppedEvent = Extract<PresentationEvent, { kind: "LootDropped" }>;

const RARITY_RANK: Record<string, number> = { common: 0, magic: 1, rare: 2, unique: 3 };

function bestRarityInWindow(loots: readonly LootDroppedEvent[]): string | null {
  let best: string | null = null;
  for (const event of loots) {
    if (!best || (RARITY_RANK[event.rarity] ?? 0) > (RARITY_RANK[best] ?? 0)) best = event.rarity;
  }
  return best;
}

function findLastAutoEquip(events: readonly PresentationEvent[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind !== "ItemEquipped") continue;
    const wasAutoEquip = events.some(
      (candidate) => candidate.kind === "LootDropped" && candidate.tickIndex === event.tickIndex && candidate.baseItemId === event.baseItemId,
    );
    if (wasAutoEquip) return getBaseItem(event.baseItemId)?.name ?? event.baseItemId;
  }
  return null;
}

export function buildLastJourneySummary(hudState: HudState): string[] {
  const events = hudState.recentEvents;
  const loots = events.filter((event): event is LootDroppedEvent => event.kind === "LootDropped");
  const lines: string[] = [`Você retornou de ${hudState.region.name}.`];

  if (loots.length === 0) {
    lines.push("Nenhum item novo ainda nesta jornada.");
    return lines;
  }

  lines.push(`Encontrou ${loots.length} ${loots.length === 1 ? "item" : "itens"}.`);

  const bestRarity = bestRarityInWindow(loots);
  if (bestRarity && bestRarity !== "common") lines.push(`Um deles era ${rarityLabel(bestRarity)}.`);

  const autoEquippedName = findLastAutoEquip(events);
  if (autoEquippedName) lines.push(`Equipou automaticamente ${autoEquippedName}.`);

  return lines;
}
