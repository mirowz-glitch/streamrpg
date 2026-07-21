import { getRegionName, type CombatAnimation } from "@streamrpg/shared";

interface RegionUnlockBannerProps {
  active: CombatAnimation[];
}

interface RegionUnlockedPayload {
  previousRegionId: string;
  newRegionId: string;
}

// Biomes, Regions & World Progression Phase I — requisito 7: mesmo
// padrão de LevelUpBanner/ObjectiveCompletedBanner — nenhum setTimeout
// próprio, visibilidade 100% dirigida pelo Animation Controller
// centralizado. O dado exibido vem só do payload da própria animação
// "region-unlocked" (handlers.ts), copiado do RegionUnlockedEvent real
// (Objective System). `getRegionName` é o mesmo lookup puro já usado
// em EventFeed.tsx, nunca lógica de jogo.
export function RegionUnlockBanner({ active }: RegionUnlockBannerProps) {
  const animation = active.find((entry) => entry.type === "region-unlocked");
  if (!animation) return null;

  const payload = animation.payload as unknown as RegionUnlockedPayload;

  return (
    <div className="hud-region-unlock-banner">
      <span className="hud-region-unlock-banner-label">Nova região desbloqueada</span>
      <span className="hud-region-unlock-banner-title">{getRegionName(payload.newRegionId)}</span>
    </div>
  );
}
