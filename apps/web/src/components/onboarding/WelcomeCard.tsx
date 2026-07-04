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
      <button
        type="button"
        onClick={() => {
          setFlag("welcome_seen");
          setDismissed(true);
        }}
      >
        Começar aventura
      </button>
    </div>
  );
}
