import { useFirstVisit } from "../../hooks/useFirstVisit";
import type { OnboardingFlag } from "../../lib/onboarding";

interface GuideBubbleProps {
  flag: OnboardingFlag;
  message: string;
}

// Sprint New Player Journey — mensagem discreta de contexto, mostrada
// uma única vez por página (Perfil/Cidade/Mundo/Ranking). A mesma flag
// que controla a mensagem também alimenta "Primeiros Passos" e o brilho
// do menu — um único visto, três efeitos.
export function GuideBubble({ flag, message }: GuideBubbleProps) {
  const isFirstVisit = useFirstVisit(flag);
  if (!isFirstVisit) return null;

  return (
    <p className="guide-bubble">
      <span className="guide-bubble-icon" aria-hidden="true">
        💬
      </span>
      {message}
    </p>
  );
}
