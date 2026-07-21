import type { HudObjectiveInfo } from "@streamrpg/shared";
import { ProgressBar } from "../ui/ProgressBar";

interface ObjectiveCardProps {
  objective: HudObjectiveInfo;
}

// Objectives, Missions & Player Goals Phase I — requisito 1/5:
// "Objetivo Atual" + barra de progresso, atualização automática — este
// componente só formata HudState.currentObjective (já derivado pelo
// Objective System), nunca calcula progresso sozinho.
export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  return (
    <section className="hud-objective-card">
      <div className="hud-objective-card-header">
        <span className="hud-objective-card-label">Objetivo Atual</span>
        <span className="hud-objective-card-name">{objective.name}</span>
      </div>
      <p className="hud-objective-card-description">{objective.description}</p>
      <ProgressBar percent={objective.percent} variant="objective" label="Progresso do objetivo" />
      <span className="hud-objective-card-progress">
        {objective.progress} / {objective.target}
      </span>
    </section>
  );
}
