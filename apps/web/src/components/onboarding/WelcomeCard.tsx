import { useState } from "react";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface WelcomeCardProps {
  channelDisplayName: string | null;
}

// Sprint New Player Journey — card de boas-vindas do Reino, mostrado só
// no primeiro login (flag `welcome_seen`, nunca mais depois de
// dispensado). Nenhum dado novo: o nome do Reino já vem do canal que o
// próprio jogador informou (mesmo canal usado por BossCard/Expedição).
export function WelcomeCard({ channelDisplayName }: WelcomeCardProps) {
  const [dismissed, setDismissed] = useState(() => isFlagSet("welcome_seen"));

  if (dismissed) return null;

  return (
    <div className="card welcome-card">
      <h2 className="welcome-card-title">
        🏰 Bem-vindo ao Reino{channelDisplayName ? ` de ${channelDisplayName}` : ""}
      </h2>
      <p>Você acaba de iniciar sua jornada.</p>
      <p className="hint">Enquanto acompanha esta comunidade, seu aventureiro irá:</p>
      <ul className="welcome-card-list">
        <li>⚔ Evoluir</li>
        <li>🎒 Encontrar equipamentos</li>
        <li>🌎 Explorar o mundo</li>
        <li>👑 Conquistar títulos</li>
      </ul>
      <p className="welcome-card-wish">Boa sorte.</p>
      {/* Vertical Slice — Commercial Readiness & First Playable
          Experience Phase I — Fase 1/2: este botão só dispensa o card
          (setFlag/setDismissed), nunca navega pra lugar nenhum — "Começar
          aventura" prometia uma ação que não acontecia (achado da
          auditoria hands-on: o clique não leva a /app/adventure). Rótulo
          trocado por um que reflita o que o botão de fato faz. */}
      <button
        type="button"
        onClick={() => {
          setFlag("welcome_seen");
          setDismissed(true);
        }}
      >
        Entendido, vamos lá!
      </button>
    </div>
  );
}
