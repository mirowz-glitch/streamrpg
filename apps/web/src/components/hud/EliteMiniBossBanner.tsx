import type { CombatAnimation } from "@streamrpg/shared";

interface EliteMiniBossBannerProps {
  active: CombatAnimation[];
}

interface EncounterPayload {
  enemyName: string;
  regionId: string;
}

interface DefeatedPayload {
  enemyName: string;
  xpBonus: number;
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: "banner,
// aura, animação, feed" — mesmo padrão de LevelUpBanner/
// RegionUnlockBanner (nenhum setTimeout próprio, visibilidade 100%
// dirigida pelo Animation Controller centralizado). Um único componente
// cobre os 4 banners (Elite/Mini-Boss x Surgiu/Derrotado) porque nunca
// aparecem simultaneamente na mesma tick (ver presentationLayer.ts:
// "surgiu" e "derrotado" do MESMO variant sempre disparam juntos —
// Elite e Mini-Boss nunca no mesmo tick, já que cada tick resolve um
// único encontro).
export function EliteMiniBossBanner({ active }: EliteMiniBossBannerProps) {
  const encounterAnimation = active.find((entry) => entry.type === "elite-encounter" || entry.type === "miniboss-encounter");
  const defeatedAnimation = active.find((entry) => entry.type === "elite-defeated" || entry.type === "miniboss-defeated");

  if (encounterAnimation) {
    const payload = encounterAnimation.payload as unknown as EncounterPayload;
    const isMiniBoss = encounterAnimation.type === "miniboss-encounter";
    return (
      <div className={`hud-variant-banner hud-variant-banner-encounter ${isMiniBoss ? "hud-variant-banner-miniboss" : "hud-variant-banner-elite"}`}>
        <span className="hud-variant-banner-label">{isMiniBoss ? "Mini-Boss surgiu" : "Elite surgiu"}</span>
        <span className="hud-variant-banner-title">{payload.enemyName}</span>
      </div>
    );
  }

  if (defeatedAnimation) {
    const payload = defeatedAnimation.payload as unknown as DefeatedPayload;
    const isMiniBoss = defeatedAnimation.type === "miniboss-defeated";
    return (
      <div className={`hud-variant-banner hud-variant-banner-defeated ${isMiniBoss ? "hud-variant-banner-miniboss" : "hud-variant-banner-elite"}`}>
        <span className="hud-variant-banner-label">{isMiniBoss ? "Mini-Boss derrotado" : "Elite derrotado"}</span>
        <span className="hud-variant-banner-title">
          {payload.enemyName} (+{payload.xpBonus} XP)
        </span>
      </div>
    );
  }

  return null;
}
