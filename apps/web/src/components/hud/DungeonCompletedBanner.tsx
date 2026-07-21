import type { CombatAnimation } from "@streamrpg/shared";

interface DungeonCompletedBannerProps {
  active: CombatAnimation[];
}

interface DungeonCompletedPayload {
  name: string;
  bossName: string;
  xpAmount: number;
  goldAmount: number;
}

// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
// 9: "resumo especial da Expedição" quando ela é uma Dungeon (o Chefe
// Final foi derrotado durante ela) — banner PRÓPRIO, distinto do
// banner de conclusão normal de Expedição (ExpeditionCheckpointBanner),
// que continua disparando na mesma tick por baixo (requisito 7:
// DungeonCompleted nunca substitui ExpeditionCompleted).
export function DungeonCompletedBanner({ active }: DungeonCompletedBannerProps) {
  const animation = active.find((entry) => entry.type === "dungeon-completed");
  if (!animation) return null;

  const payload = animation.payload as unknown as DungeonCompletedPayload;
  return (
    <div className="hud-dungeon-completed-banner">
      <span className="hud-dungeon-completed-banner-label">Dungeon Concluída</span>
      <span className="hud-dungeon-completed-banner-title">{payload.name}</span>
      <span className="hud-dungeon-completed-banner-detail">Chefe Final derrotado: {payload.bossName}</span>
      <span className="hud-dungeon-completed-banner-detail">
        +{payload.xpAmount} XP, +{payload.goldAmount} ouro
      </span>
    </div>
  );
}
