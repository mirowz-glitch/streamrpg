import { countFirstStepsDone, FIRST_STEPS_TOTAL } from "../../lib/onboarding";

const STAGES = ["Iniciante", "Aventureiro", "Explorador", "Veterano"];

interface JourneyProgressProps {
  totalMinutesWatched: number;
}

// Sprint New Player Journey — "Linha da Jornada": puramente visual,
// nunca o Level do personagem. O estágio vem de quantos dos 5
// Primeiros Passos já foram cumpridos (0-1 → Iniciante, 2-3 →
// Aventureiro, 4 → Explorador, 5/5 → Veterano) — nenhum dado novo,
// só uma leitura diferente do mesmo progresso de FirstSteps.
function stageIndex(done: number): number {
  if (done >= FIRST_STEPS_TOTAL) return 3;
  if (done >= 4) return 2;
  if (done >= 2) return 1;
  return 0;
}

export function JourneyProgress({ totalMinutesWatched }: JourneyProgressProps) {
  const done = countFirstStepsDone(totalMinutesWatched);
  const current = stageIndex(done);

  return (
    <div className="journey-progress">
      {STAGES.map((stage, index) => (
        <span key={stage} className={`journey-stage${index <= current ? " journey-stage-active" : ""}`}>
          {stage}
          {index < STAGES.length - 1 ? <span className="journey-stage-arrow">→</span> : null}
        </span>
      ))}
    </div>
  );
}
