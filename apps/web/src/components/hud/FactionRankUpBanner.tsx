import type { CombatAnimation } from "@streamrpg/shared";

interface FactionRankUpBannerProps {
  active: CombatAnimation[];
}

interface RankUpPayload {
  factionName: string;
  rankName: string;
  xpBonusPercent: number;
  goldBonusPercent: number;
}

// Factions, Reputation & World Consequences Phase I — requisito 6:
// banner de subida de rank, mesmo padrão de LevelUpBanner/
// ExpeditionCheckpointBanner (visibilidade 100% dirigida pelo Animation
// Controller centralizado, nenhum setTimeout próprio).
// "ReputationChanged" (a variação comum, frequente) não tem banner —
// só aparece no feed.
export function FactionRankUpBanner({ active }: FactionRankUpBannerProps) {
  const animation = active.find((entry) => entry.type === "faction-rank-up");
  if (!animation) return null;

  const payload = animation.payload as unknown as RankUpPayload;
  return (
    <div className="hud-faction-rankup-banner">
      <span className="hud-faction-rankup-banner-label">Reputação em ascensão</span>
      <span className="hud-faction-rankup-banner-title">
        {payload.factionName}: {payload.rankName}
      </span>
      {payload.xpBonusPercent > 0 || payload.goldBonusPercent > 0 ? (
        <span className="hud-faction-rankup-banner-detail">
          +{payload.xpBonusPercent}% XP, +{payload.goldBonusPercent}% ouro em Expedições
        </span>
      ) : null}
    </div>
  );
}
