import { useEffect, useState } from "react";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface FirstStepsProps {
  totalMinutesWatched: number;
}

interface StepDef {
  label: string;
  done: boolean;
}

// Sprint New Player Journey — painel "Primeiros Passos". Cada item usa
// só ações que já existem (visitar uma página, assistir a live) —
// nenhuma recompensa, só orientação. Some sozinho (via `tutorial_completed`)
// assim que os 5 itens estiverem marcados.
export function FirstSteps({ totalMinutesWatched }: FirstStepsProps) {
  const [, forceRefresh] = useState(0);

  useEffect(() => {
    // Estar no Perfil já cumpre este passo, mesmo que o GuideBubble desta
    // página ainda não tenha marcado a flag no mesmo commit.
    if (!isFlagSet("profile_seen")) {
      setFlag("profile_seen");
      forceRefresh((n) => n + 1);
    }
  }, []);

  const steps: StepDef[] = [
    { label: "Entrar no Perfil", done: isFlagSet("profile_seen") },
    { label: "Conhecer a Cidade", done: isFlagSet("city_seen") },
    { label: "Ver o Ranking", done: isFlagSet("ranking_seen") },
    { label: "Explorar o Mundo", done: isFlagSet("world_seen") },
    { label: "Assistir alguns minutos da live", done: totalMinutesWatched > 0 },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  useEffect(() => {
    if (doneCount === steps.length && !isFlagSet("tutorial_completed")) {
      setFlag("tutorial_completed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount]);

  if (isFlagSet("tutorial_completed")) return null;

  return (
    <section className="first-steps">
      <h2>Primeiros Passos</h2>
      <ul className="first-steps-list">
        {steps.map((step) => (
          <li key={step.label} className={step.done ? "first-steps-done" : ""}>
            <span className="first-steps-check">{step.done ? "☑" : "☐"}</span>
            {step.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
