import type { HudSessionHistory } from "@streamrpg/shared";

interface SessionHistoryPanelProps {
  history: HudSessionHistory;
}

// Progression & Player Retention Phase I — requisito 4: agregados
// derivados só de AdventureStatistics + Adventure Timeline
// (HudState.sessionHistory) — este componente só formata.
export function SessionHistoryPanel({ history }: SessionHistoryPanelProps) {
  return (
    <section className="hud-session-history">
      <span className="hud-session-history-item">
        🗺 {history.encountersCompleted}/{history.encountersStarted} encontros concluídos
      </span>
      <span className="hud-session-history-item">🛡️ {history.survivalRate.toFixed(0)}% sobrevivência</span>
      <span className="hud-session-history-item">⚔️ {history.averageDps.toFixed(1)} DPS médio</span>
      <span className="hud-session-history-item">🩸 {history.damagePerEncounter.toFixed(0)} dano/encontro</span>
      <span className="hud-session-history-item">🎁 {history.itemsPerEncounter.toFixed(1)} itens/encontro</span>
    </section>
  );
}
