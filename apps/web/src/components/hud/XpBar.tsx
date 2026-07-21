import type { XpProgress } from "@streamrpg/shared";
import { ProgressBar } from "../ui/ProgressBar";

interface XpBarProps {
  xpProgress: XpProgress;
}

// Progression & Player Retention Phase I — requisito 1: XP atual, XP
// necessária pro próximo nível, porcentagem e nível atual vêm prontos
// de XpProgress (xp.ts, via HudState.xpProgress) — nenhum cálculo novo
// de experiência aqui, só formatação.
export function XpBar({ xpProgress }: XpBarProps) {
  return (
    <div className="hud-xp-bar">
      <div className="hud-xp-bar-header">
        <span className="hud-xp-bar-level">Nível {xpProgress.level}</span>
        <span className="hud-xp-bar-value">
          {xpProgress.xp} / {xpProgress.xp + xpProgress.xp_to_next} XP ({xpProgress.percent}%)
        </span>
      </div>
      <ProgressBar percent={xpProgress.percent} variant="xp" label="Experiência" />
    </div>
  );
}
