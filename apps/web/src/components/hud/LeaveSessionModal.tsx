// Player Feedback & Retention — Vertical Slice Phase I — Fase 1
// (Session Safety): "nunca permitir perda silenciosa de progresso" —
// este modal é o que intercepta a navegação (via useBlocker, chamado
// por quem usa este componente) e obriga uma confirmação explícita
// antes de descartar uma sessão de demonstração com progresso real.
// Puramente apresentação: não decide QUANDO bloquear (isso é do
// chamador, com base em isDemoSession + progresso já feito), só
// desenha a confirmação em si.
interface LeaveSessionModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LeaveSessionModal({ onConfirm, onCancel }: LeaveSessionModalProps) {
  return (
    <div className="hud-leave-session-overlay" role="alertdialog" aria-modal="true" aria-labelledby="leave-session-title">
      <div className="hud-leave-session-modal">
        <h2 id="leave-session-title">Sair da Aventura?</h2>
        <p>Você está numa sessão de demonstração. Todo o progresso desta Aventura — nível, itens, abates — será perdido se você sair agora.</p>
        <div className="hud-leave-session-actions">
          <button type="button" className="hud-leave-session-stay" onClick={onCancel}>
            Continuar jogando
          </button>
          <button type="button" className="hud-leave-session-leave" onClick={onConfirm}>
            Sair mesmo assim
          </button>
        </div>
      </div>
    </div>
  );
}
