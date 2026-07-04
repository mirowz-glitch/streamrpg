import { useEffect, useState } from "react";
import type { NpcDefinition } from "../../lib/npcs";
import { NpcPortrait } from "../city/NpcPortrait";
import {
  advanceEldrinStep,
  getEldrinStep,
  isFlagSet,
  ONBOARDING_FLAG_EVENT,
  type OnboardingFlag,
} from "../../lib/onboarding";

const ELDRIN: NpcDefinition = {
  key: "eldrin",
  name: "Eldrin",
  profession: "Guia do Reino",
  quote: "",
  description: "",
  icon: "🧙",
  color: "#4285f4",
  shape: "circle",
};

// Sprint New Player Journey — 3 falas, em ordem, nunca repetidas
// (avançadas por `eldrin_step`, nunca reiniciadas). Cada fala só aparece
// depois que o marco correspondente já aconteceu de verdade (mesmas
// flags de `welcome_seen`/`city_seen`/`tutorial_completed`).
const LINES: { after: OnboardingFlag; text: string }[] = [
  { after: "welcome_seen", text: "Comece conhecendo nossa Cidade." },
  { after: "city_seen", text: "Veja como seu personagem evolui." },
  { after: "tutorial_completed", text: "Nos encontramos novamente." },
];

export function EldrinGuide() {
  const [step, setStep] = useState(getEldrinStep);
  // Marcos (welcome_seen/city_seen/tutorial_completed) podem mudar por
  // ação de um componente IRMÃO (ex: WelcomeCard) na mesma página —
  // re-renderiza ao ouvir o evento em vez de esperar um remount.
  const [, forceRefresh] = useState(0);
  useEffect(() => {
    const onFlagChange = () => forceRefresh((n) => n + 1);
    window.addEventListener(ONBOARDING_FLAG_EVENT, onFlagChange);
    return () => window.removeEventListener(ONBOARDING_FLAG_EVENT, onFlagChange);
  }, []);

  if (step >= LINES.length) return null;
  const line = LINES[step];
  if (!isFlagSet(line.after)) return null;

  return (
    <div className="eldrin-guide">
      <NpcPortrait npc={ELDRIN} />
      <div className="eldrin-guide-text">
        <strong>{ELDRIN.name}</strong>
        <p>"{line.text}"</p>
      </div>
      <button
        type="button"
        className="eldrin-guide-dismiss"
        onClick={() => {
          advanceEldrinStep();
          setStep((s) => s + 1);
        }}
      >
        Entendi
      </button>
    </div>
  );
}
