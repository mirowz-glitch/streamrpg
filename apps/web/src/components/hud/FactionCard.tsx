import type { HudFactionInfo } from "@streamrpg/shared";
import { ProgressBar } from "../ui/ProgressBar";

interface FactionCardProps {
  faction: HudFactionInfo | null;
}

// Factions, Reputation & World Consequences Phase I — requisito 5:
// "Facção Atual / barra / rank" — mockup literal da Sprint. `null`
// (região atual sem facção dona ainda) simplesmente não renderiza
// nada, mesmo tratamento de ExpeditionCard/EncounterPanel.
export function FactionCard({ faction }: FactionCardProps) {
  if (!faction) return null;

  return (
    <section className="hud-faction-card">
      <div className="hud-faction-card-header">
        <span className="hud-faction-card-label">Facção Atual</span>
        <span className="hud-faction-card-name">{faction.factionName}</span>
      </div>
      <ProgressBar percent={faction.percentToNextRank} variant="expedition-compact" label="Progresso de reputação" />
      <div className="hud-faction-card-footer">
        <span className="hud-faction-card-rank">{faction.rankName}</span>
        {faction.nextRankName ? <span className="hud-faction-card-next">Próximo: {faction.nextRankName}</span> : null}
      </div>
    </section>
  );
}
