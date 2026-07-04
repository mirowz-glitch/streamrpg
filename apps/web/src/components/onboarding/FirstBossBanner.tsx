import { useState } from "react";
import { useBossState } from "../../hooks/useBossState";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface FirstBossBannerProps {
  channel: string | undefined;
}

// Sprint New Player Journey — primeira vez que o Reino tem um Boss ativo
// enquanto o jogador está online. Reaproveita useBossState (Sprint Boss
// Experience) tal como já existe; nunca bloqueia nada, só chama atenção
// uma única vez.
export function FirstBossBanner({ channel }: FirstBossBannerProps) {
  const { state } = useBossState(channel);
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_boss_seen"));

  if (dismissed || !state?.active) return null;

  return (
    <div className="first-boss-banner">
      <span>⚔ O Reino precisa de você.</span>
      <button
        type="button"
        onClick={() => {
          setFlag("first_boss_seen");
          setDismissed(true);
        }}
      >
        ✕
      </button>
    </div>
  );
}
