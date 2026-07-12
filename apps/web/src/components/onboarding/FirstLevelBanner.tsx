import { useEffect, useRef, useState } from "react";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface FirstLevelBannerProps {
  level: number;
}

const LAST_SEEN_LEVEL_KEY = "streamrpg_last_seen_level";

// Sprint New Player Journey — momento memorável do primeiro level up.
// Não existe infraestrutura de som no projeto, então o "mesmo princípio"
// do primeiro item vira só destaque visual (pulso CSS), nunca uma
// alteração em Level/XP.
//
// Sprint Gameplay First (Phase II) — depois desse primeiro momento
// especial, TODO level up seguinte também ganha a mesma celebração
// visual (mesmo pulso CSS reaproveitado, nenhum efeito novo). Antes
// desta Sprint, level up > 1 não tinha NENHUM feedback: o
// `lastPing.leveled_up` que existia era permanentemente `false` desde a
// migração de XP para o Engine assíncrono (débito já registrado — XP
// agora é concedida por tick, não pela resposta do ping). Sem botão de
// fechar: aparece sozinho e não repete no nível seguinte, mesmo
// princípio de "watermark" já usado em InventoryPage/useReactiveGlow —
// evita falso positivo pra quem já tinha nível alto antes desta função
// existir (só celebra alta real, nunca a primeira leitura do watermark).
export function FirstLevelBanner({ level }: FirstLevelBannerProps) {
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_level_announced"));

  const previousLevelRef = useRef<number | null>(null);
  const [celebrateLevel, setCelebrateLevel] = useState<number | null>(null);

  useEffect(() => {
    if (previousLevelRef.current === null) {
      const stored = localStorage.getItem(LAST_SEEN_LEVEL_KEY);
      previousLevelRef.current = stored === null ? level : Number(stored);
    }
    if (level > previousLevelRef.current) {
      setCelebrateLevel(level);
    }
    previousLevelRef.current = level;
    localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(level));
  }, [level]);

  if (level < 2) return null;

  if (!dismissed) {
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

  if (celebrateLevel !== null) {
    return (
      <div className="first-level-banner">
        <span className="first-level-banner-icon">🎉</span>
        <div>
          <strong>Nível {celebrateLevel}!</strong>
          <p>Seu aventureiro ficou mais forte.</p>
        </div>
      </div>
    );
  }

  return null;
}
