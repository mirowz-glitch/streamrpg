// Player Feedback & Retention — Vertical Slice Phase I — Fase 1
// (Session Safety): banner PERMANENTE (não uma animação transitória
// como o resto do HUD) — fica visível durante toda a Aventura enquanto
// a sessão for uma demonstração (sem login válido, `useAdventureSession`
// nunca conseguiu confirmar um personagem real). Achado #1 do playtest
// da Sprint anterior: o jogador podia subir de nível, derrotar um Elite
// e equipar itens reais sem NENHUM aviso de que nada disso seria salvo
// ao sair da aba — este componente existe só pra isso nunca mais
// acontecer sem aviso.
export function SessionSafetyBanner() {
  return (
    <div className="hud-session-safety-banner" role="status">
      <span className="hud-session-safety-banner-icon" aria-hidden="true">
        ⚠️
      </span>
      <span className="hud-session-safety-banner-text">
        <strong>Sessão de demonstração.</strong> Seu progresso nesta Aventura não está sendo salvo — ele será perdido se você sair desta aba. Faça login para
        salvar de verdade.
      </span>
    </div>
  );
}
