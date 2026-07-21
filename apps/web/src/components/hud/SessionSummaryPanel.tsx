import type { HudSessionSummary } from "@streamrpg/shared";

interface SessionSummaryPanelProps {
  summary: HudSessionSummary;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Progression & Player Retention Phase I — requisito 3: todos os
// valores vêm de HudState.sessionSummary (Adventure Session/Timeline,
// já existente) — este componente só formata pra exibição.
export function SessionSummaryPanel({ summary }: SessionSummaryPanelProps) {
  return (
    <section className="hud-session-summary">
      <h2 className="hud-session-summary-title">Resumo da Aventura</h2>
      <div className="hud-session-summary-grid">
        <span>⏱ Tempo jogado: {formatElapsed(summary.elapsedTime)}</span>
        <span>☠️ Inimigos derrotados: {summary.enemiesKilled}</span>
        <span>💥 Dano causado: {summary.damageDealt.toFixed(0)}</span>
        <span>🩸 Dano recebido: {summary.damageTaken.toFixed(0)}</span>
        <span>🎁 Itens encontrados: {summary.itemsFound}</span>
        <span>🛡️ Itens equipados: {summary.itemsEquipped}</span>
        <span>✨ XP obtida: {summary.xpGained}</span>
      </div>
    </section>
  );
}
