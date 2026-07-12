import type { PresenceBuildingKey, WorldPresenceContext } from "../../lib/worldPresence";
import { getWorldPresenceLine } from "../../lib/worldPresence";

interface WorldPresenceLineProps {
  building: PresenceBuildingKey;
  ctx: WorldPresenceContext | undefined;
}

// Sprint Dynamic World Presence Phase I — só renderiza; toda decisão
// vive em lib/worldPresence.ts. Reaproveita a mesma classe `.hint` já
// usada por toda linha de ambientação do jogo — nenhum CSS novo, nenhum
// bloco novo.
export function WorldPresenceLine({ building, ctx }: WorldPresenceLineProps) {
  if (!ctx) return null;
  const line = getWorldPresenceLine(building, ctx);
  if (!line) return null;
  return <p className="hint">{line}</p>;
}
