import type { HudRecentRecovery } from "@streamrpg/shared";

interface RecoveryBadgeProps {
  recovery: HudRecentRecovery | null;
}

// Recovery & Adventure Flow Phase I — requisito 5: "sem lógica nova na
// UI" — este componente só formata HudState.recentRecovery (já
// derivado do RecoveryApplied real, Recovery Layer). Mesmo padrão
// transitório de ProgressionCelebration (Progression & Player
// Retention Phase I): não usa o Animation Controller, só reflete o
// HudState recomputado a cada tick — só aparece na tick exata em que a
// cura aconteceu.
export function RecoveryBadge({ recovery }: RecoveryBadgeProps) {
  if (!recovery) return null;

  return (
    <div className="hud-recovery-badge">
      <span className="hud-recovery-badge-label">Recuperação</span>
      <span className="hud-recovery-badge-value">+{recovery.lifeHealed.toFixed(0)} HP</span>
    </div>
  );
}
