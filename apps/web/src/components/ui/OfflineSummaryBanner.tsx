import type { OfflineSummary } from "@streamrpg/shared";

// World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — "enquanto
// você esteve fora": o único ponto de contato visível de todo o Offline
// Summary. `summary` é `null` na esmagadora maioria das visitas (sem
// ausência real desde o último retorno) — o componente não renderiza
// nada nesse caso, nunca ocupa espaço "vazio".
export function OfflineSummaryBanner({
  summary,
  onDismiss,
}: {
  summary: OfflineSummary | null;
  onDismiss: () => void;
}) {
  if (!summary) return null;

  const minutes = Math.round(summary.elapsedMs / 60_000);

  return (
    <div className="card offline-summary-banner">
      <div className="offline-summary-header">
        <h2>Enquanto você esteve fora</h2>
        <button type="button" className="offline-summary-dismiss" onClick={onDismiss} aria-label="Fechar">
          ✕
        </button>
      </div>
      <p className="hint">
        Seu personagem continuou aventurando por {minutes} minuto{minutes === 1 ? "" : "s"} sem você.
      </p>
      <ul className="offline-summary-list">
        <li>⚔️ Derrotou {summary.enemiesKilled} inimigo{summary.enemiesKilled === 1 ? "" : "s"}.</li>
        {summary.itemsFound > 0 ? (
          <li>
            🎒 Encontrou {summary.itemsFound} ite{summary.itemsFound === 1 ? "m" : "ns"}, vendido{summary.itemsFound === 1 ? "" : "s"}{" "}
            automaticamente ao mercador.
          </li>
        ) : null}
        {summary.goldFromAutoSold > 0 ? <li>💰 Encontrou {summary.goldFromAutoSold} de ouro.</li> : null}
        {summary.xpGained > 0 ? <li>⭐ Ganhou {summary.xpGained} de experiência{summary.leveledUp ? ` — subiu para o nível ${summary.finalLevel}!` : "."}</li> : null}
        {!summary.characterSurvived ? <li>💀 Encontrou um desafio grande demais e precisou recuar.</li> : null}
      </ul>
      <p className="hint">Nenhuma interação exigiu Twitch — sua aventura nunca depende de uma live.</p>
    </div>
  );
}
