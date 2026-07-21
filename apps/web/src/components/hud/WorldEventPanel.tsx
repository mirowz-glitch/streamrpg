import type { HudRecentWorldEvent } from "@streamrpg/shared";

interface WorldEventPanelProps {
  worldEvent: HudRecentWorldEvent | null;
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 6: "Evento Mundial / Tesouro Esquecido / Abra o baú abandonado" —
// pequena seção consumindo só HudState.recentWorldEvent (já derivado
// por deriveHudState.ts), nunca lógica nova. Só não-nulo na tick exata
// em que um World Event aconteceu (mesmo padrão de ObjectiveCard, que
// sempre existe, vs. banners "recentX", que somem).
export function WorldEventPanel({ worldEvent }: WorldEventPanelProps) {
  if (!worldEvent) return null;

  return (
    <section className="hud-world-event-panel">
      <span className="hud-world-event-panel-label">Evento Mundial</span>
      <span className="hud-world-event-panel-name">{worldEvent.name}</span>
      <p className="hud-world-event-panel-description">{worldEvent.description}</p>
    </section>
  );
}
