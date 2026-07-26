import type { HudExpeditionInfo } from "@streamrpg/shared";
import { ProgressBar } from "../ui/ProgressBar";

interface ExpeditionCardProps {
  expedition: HudExpeditionInfo | null;
}

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 7: "cartão compacto... consumindo apenas HudState." `null`
// (nenhuma expedição ativa agora) simplesmente não renderiza nada —
// mesmo tratamento de EncounterPanel/outros painéis condicionais.
export function ExpeditionCard({ expedition }: ExpeditionCardProps) {
  if (!expedition) return null;

  return (
    <section className="hud-expedition-card">
      <div className="hud-expedition-card-header">
        <span className="hud-expedition-card-label">Expedição</span>
        <span className="hud-expedition-card-name">{expedition.name}</span>
      </div>
      <ProgressBar percent={expedition.percent} variant="expedition-compact" label="Progresso da expedição" />
      <span className="hud-expedition-card-checkpoint">
        Checkpoint {expedition.checkpointsReached}/{expedition.checkpointsTotal}
      </span>
      <div className="hud-expedition-card-stats">
        <span>
          {expedition.encountersCompleted} encontro{expedition.encountersCompleted === 1 ? "" : "s"}
        </span>
        {expedition.elitesDefeated > 0 ? (
          <span>
            {expedition.elitesDefeated} Elite{expedition.elitesDefeated === 1 ? "" : "s"}
          </span>
        ) : null}
        {expedition.miniBossesDefeated > 0 ? (
          <span>
            {expedition.miniBossesDefeated} Mini-Boss{expedition.miniBossesDefeated === 1 ? "" : "es"}
          </span>
        ) : null}
        {expedition.worldEventsFound > 0 ? (
          <span>
            {expedition.worldEventsFound} Evento{expedition.worldEventsFound === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      {expedition.finalBoss ? (
        <div className="hud-expedition-card-boss">
          <span className="hud-expedition-card-boss-label">Boss Final</span>
          <span className="hud-expedition-card-boss-name">{expedition.finalBoss.bossName}</span>
          <ProgressBar
            percent={expedition.finalBoss.defeated ? 0 : (expedition.finalBoss.healthPercent ?? 100)}
            variant="boss"
            label="Vida do Chefe Final"
          />
        </div>
      ) : null}
      {/* Vertical Slice — World Tiers & Endgame Scaling Phase I — Fase 4:
          "WT3 / +32%." Mesma seção que já existia pros Dungeon
          Modifiers (Sprint anterior) — só passa a aparecer também
          quando SÓ o World Tier está ativo (sem nenhum Dungeon
          Modifier), e o rótulo do Tier entra ao lado do bônus já
          existente. Nenhuma tela nova. */}
      {expedition.activeModifiers.length > 0 || expedition.worldTier ? (
        <div className="hud-expedition-card-modifiers">
          <span className="hud-expedition-card-modifiers-label">
            🔺{expedition.worldTier ? ` ${expedition.worldTier}` : ""} Modificadores
            {expedition.rewardBonusPercent !== 0 ? ` (+${expedition.rewardBonusPercent}% recompensa)` : ""}
          </span>
          {expedition.activeModifiers.length > 0 ? (
            <div className="hud-expedition-card-modifiers-list">
              {expedition.activeModifiers.map((modifier) => (
                <span key={modifier.id} className="hud-expedition-card-modifier-chip">
                  {modifier.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
