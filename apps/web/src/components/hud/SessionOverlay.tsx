import type { AdventureStatistics } from "@streamrpg/shared";

interface SessionOverlayProps {
  statistics: AdventureStatistics;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// HUD & Gameplay UI Phase I — requisito 9: Session Overlay. Todos os
// valores vêm direto de AdventureStatistics (Adventure Loop, já
// existente, intocado) — este componente só formata pra exibição.
export function SessionOverlay({ statistics }: SessionOverlayProps) {
  return (
    <section className="hud-session-overlay">
      <span className="hud-session-overlay-item">⏱ {formatElapsed(statistics.elapsedTime)}</span>
      <span className="hud-session-overlay-item">🗺 {statistics.encountersCompleted} encontros</span>
      <span className="hud-session-overlay-item">☠️ {statistics.enemiesKilled} derrotados</span>
      <span className="hud-session-overlay-item">🎁 {statistics.itemsFound} itens achados</span>
      <span className="hud-session-overlay-item">🛡️ {statistics.itemsEquipped} equipados</span>
      <span className="hud-session-overlay-item">💥 {statistics.damageDealt.toFixed(0)} dano causado</span>
      <span className="hud-session-overlay-item">🩸 {statistics.damageTaken.toFixed(0)} dano sofrido</span>
    </section>
  );
}
