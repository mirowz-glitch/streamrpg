import { useEffect, useRef, useState } from "react";
import { useBossState } from "../../hooks/useBossState";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface FirstBossBannerProps {
  channel: string | undefined;
}

const REAPPEAR_DURATION_MS = 5000;

// Sprint New Player Journey — primeira vez que o Reino tem um Boss ativo
// enquanto o jogador está online. Reaproveita useBossState (Sprint Boss
// Experience) tal como já existe; nunca bloqueia nada, só chama atenção
// uma única vez.
//
// Sprint Gameplay Feel 03 (Bosses precisam parecer eventos do reino) —
// depois desse primeiro momento especial (banner acima, dismissado
// manualmente), TODO Boss novo que aparecer depois também merece ser
// percebido — antes desta Sprint, ficava só silenciosamente dentro da
// lista "Últimos eventos" do BossCard. Mesma técnica de detectar a
// transição "não ativo → ativo/aguardando" que useBossState já usa
// internamente pra gerar o evento "Um Boss apareceu" — só que aqui vira
// um banner leve, sem botão, que some sozinho (mesmo princípio das
// Sprints Gameplay Feel 01/02). `hasBaselineRef` evita o falso positivo
// de mostrar o banner logo no primeiro mount/refresh se um Boss já
// estava ativo antes do componente montar.
export function FirstBossBanner({ channel }: FirstBossBannerProps) {
  const { state } = useBossState(channel);
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_boss_seen"));

  const wasActiveRef = useRef(false);
  const hasBaselineRef = useRef(false);
  const [justAppeared, setJustAppeared] = useState(false);

  useEffect(() => {
    if (!state) return;
    const isNowAwaiting = state.active && state.status === "awaiting";
    if (hasBaselineRef.current && !wasActiveRef.current && isNowAwaiting) {
      setJustAppeared(true);
    }
    wasActiveRef.current = state.active;
    hasBaselineRef.current = true;
  }, [state]);

  useEffect(() => {
    if (!justAppeared) return;
    const timer = window.setTimeout(() => setJustAppeared(false), REAPPEAR_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [justAppeared]);

  if (!state?.active) return null;

  if (!dismissed) {
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

  if (justAppeared) {
    return (
      <div className="first-boss-banner">
        <span>⚔ Um Boss apareceu no Reino!</span>
      </div>
    );
  }

  return null;
}
