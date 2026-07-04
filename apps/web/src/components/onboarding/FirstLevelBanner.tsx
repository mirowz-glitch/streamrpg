import { useState } from "react";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface FirstLevelBannerProps {
  level: number;
}

// Sprint New Player Journey — momento memorável do primeiro level up.
// Não existe infraestrutura de som no projeto, então o "mesmo princípio"
// do primeiro item vira só destaque visual (pulso CSS), nunca uma
// alteração em Level/XP.
export function FirstLevelBanner({ level }: FirstLevelBannerProps) {
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_level_announced"));

  if (dismissed || level < 2) return null;

  return (
    <div className="first-level-banner">
      <span className="first-level-banner-icon">🎉</span>
      <div>
        <strong>Primeiro Level Up!</strong>
        <p>Seu aventureiro alcançou o nível {level}.</p>
      </div>
      <button
        type="button"
        onClick={() => {
          setFlag("first_level_announced");
          setDismissed(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}
