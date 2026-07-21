import type { CombatAnimation } from "@streamrpg/shared";

interface ExpeditionCheckpointBannerProps {
  active: CombatAnimation[];
}

interface CheckpointPayload {
  checkpointIndex: number;
  checkpointsTotal: number;
  recoveryAmount: number;
}

interface CompletedPayload {
  name: string;
  xpAmount: number;
  goldAmount: number;
}

interface FailedPayload {
  name: string;
}

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 8: "quando atingir um checkpoint: banner, feed, animação.
// Mesmo padrão existente" — mesmo princípio de LevelUpBanner/
// EliteMiniBossBanner/WorldEventBanner (nenhum setTimeout próprio,
// visibilidade 100% dirigida pelo Animation Controller centralizado).
// Um único componente cobre checkpoint/conclusão/falha porque nunca
// aparecem simultaneamente na mesma tick.
export function ExpeditionCheckpointBanner({ active }: ExpeditionCheckpointBannerProps) {
  const checkpointAnimation = active.find((entry) => entry.type === "expedition-checkpoint");
  const completedAnimation = active.find((entry) => entry.type === "expedition-completed");
  const failedAnimation = active.find((entry) => entry.type === "expedition-failed");

  if (checkpointAnimation) {
    const payload = checkpointAnimation.payload as unknown as CheckpointPayload;
    return (
      <div className="hud-expedition-banner hud-expedition-banner-checkpoint">
        <span className="hud-expedition-banner-label">Checkpoint atingido</span>
        <span className="hud-expedition-banner-title">
          {payload.checkpointIndex}/{payload.checkpointsTotal}
        </span>
        {payload.recoveryAmount > 0 ? <span className="hud-expedition-banner-detail">+{payload.recoveryAmount.toFixed(0)} HP</span> : null}
      </div>
    );
  }

  if (completedAnimation) {
    const payload = completedAnimation.payload as unknown as CompletedPayload;
    return (
      <div className="hud-expedition-banner hud-expedition-banner-completed">
        <span className="hud-expedition-banner-label">Expedição concluída</span>
        <span className="hud-expedition-banner-title">{payload.name}</span>
        <span className="hud-expedition-banner-detail">
          +{payload.xpAmount} XP, +{payload.goldAmount} ouro
        </span>
      </div>
    );
  }

  if (failedAnimation) {
    const payload = failedAnimation.payload as unknown as FailedPayload;
    return (
      <div className="hud-expedition-banner hud-expedition-banner-failed">
        <span className="hud-expedition-banner-label">Expedição falhou</span>
        <span className="hud-expedition-banner-title">{payload.name}</span>
      </div>
    );
  }

  return null;
}
