import { toHealthBarState } from "@streamrpg/shared";
import { ProgressBar } from "../ui/ProgressBar";

interface HealthBarProps {
  currentLife: number;
  maximumLife: number;
}

// HUD & Gameplay UI Phase I — requisito 2: componente reutilizável,
// recebe só currentLife/maximumLife. O percentual vem de
// toHealthBarState() (Presentation Layer, já existente) — nunca
// recalculado aqui; este componente só renderiza porcentagem/barra/
// valor numérico, nenhuma regra de combate.
export function HealthBar({ currentLife, maximumLife }: HealthBarProps) {
  const state = toHealthBarState(currentLife, maximumLife);

  return (
    <div className="hud-health-bar">
      <ProgressBar percent={state.percent} variant="life" label="Vida" />
      <span className="hud-health-bar-value">
        {Math.round(state.current)} / {Math.round(state.maximum)} ({state.percent}%)
      </span>
    </div>
  );
}
