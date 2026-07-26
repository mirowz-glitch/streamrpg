import type { CombatAnimation } from "@streamrpg/shared";

interface FinalBossBannerProps {
  active: CombatAnimation[];
}

interface EncounterPayload {
  enemyName: string;
}

interface DefeatedPayload {
  enemyName: string;
  xpAmount: number;
  goldAmount: number;
  // Vertical Slice — Unique Dungeon Relics & Boss Loot Phase I — Fase 4:
  // "Relíquia encontrada / Nome / Raridade." Ausentes (undefined) pra
  // qualquer Boss sem relíquia declarada (dungeon/uniqueRelicDefinitions.ts)
  // — mesmo tratamento condicional de sempre.
  relicName?: string;
  relicRarity?: string;
}

// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
// 9: "banner; animação; feed" ao surgir/derrotar o Chefe Final, mesmo
// padrão de EliteMiniBossBanner (visibilidade 100% dirigida pelo
// Animation Controller centralizado, nenhum setTimeout próprio). Um
// único componente cobre surgimento/derrota porque nunca aparecem
// simultaneamente na mesma tick.
export function FinalBossBanner({ active }: FinalBossBannerProps) {
  const encounterAnimation = active.find((entry) => entry.type === "final-boss-encounter");
  const defeatedAnimation = active.find((entry) => entry.type === "final-boss-defeated");

  if (encounterAnimation) {
    const payload = encounterAnimation.payload as unknown as EncounterPayload;
    return (
      <div className="hud-final-boss-banner hud-final-boss-banner-encounter">
        <span className="hud-final-boss-banner-label">Chefe Final Avistado</span>
        <span className="hud-final-boss-banner-title">{payload.enemyName}</span>
      </div>
    );
  }

  if (defeatedAnimation) {
    const payload = defeatedAnimation.payload as unknown as DefeatedPayload;
    return (
      <div className="hud-final-boss-banner hud-final-boss-banner-defeated">
        <span className="hud-final-boss-banner-label">Chefe Final Derrotado</span>
        <span className="hud-final-boss-banner-title">{payload.enemyName}</span>
        <span className="hud-final-boss-banner-detail">
          +{payload.xpAmount} XP, +{payload.goldAmount} ouro
        </span>
        {payload.relicName ? (
          <span className="hud-final-boss-banner-relic">
            Relíquia encontrada: {payload.relicName} ({payload.relicRarity})
          </span>
        ) : null}
      </div>
    );
  }

  return null;
}
