import type { CombatAnimation } from "@streamrpg/shared";

interface ObjectiveCompletedBannerProps {
  active: CombatAnimation[];
}

interface ObjectiveCompletedPayload {
  objectiveId: string;
  objectiveName: string;
  xpBonus: number;
}

// Objectives, Missions & Player Goals Phase I — requisito 8: mesmo
// padrão de LevelUpBanner — nenhum setTimeout próprio, visibilidade
// 100% dirigida pelo Animation Controller centralizado. O dado exibido
// vem só do payload da própria animação "objective-completed"
// (handlers.ts), copiado do ObjectiveCompletedEvent real (Objective
// System).
export function ObjectiveCompletedBanner({ active }: ObjectiveCompletedBannerProps) {
  const animation = active.find((entry) => entry.type === "objective-completed");
  if (!animation) return null;

  const payload = animation.payload as unknown as ObjectiveCompletedPayload;

  return (
    <div className="hud-objective-completed-banner">
      <span className="hud-objective-completed-banner-title">Objetivo concluído: {payload.objectiveName}</span>
      <span className="hud-objective-completed-banner-reward">+{payload.xpBonus} XP bônus</span>
    </div>
  );
}
