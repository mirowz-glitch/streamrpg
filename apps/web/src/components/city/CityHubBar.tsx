import type { TimelineEvent, WorldStateResponse } from "@streamrpg/shared";
import { StatsRow } from "../ui/StatsRow";

interface CityHubBarProps {
  worldState: WorldStateResponse | null;
  clock: string;
  channelDisplayName: string | null;
}

// Sprint NPCs Vivos — Praça Central como HUB de verdade. Tudo aqui
// reaproveita dados já lidos por CityPage via /api/world/state (mesmo
// endpoint que a página Mundo já usa) — nenhuma consulta nova, nenhum
// campo inventado. "Último Boss derrotado" é o evento mais recente da
// Timeline que menciona um Boss derrotado (a Timeline já é um dado real,
// só filtrado aqui) — não existe uma coluna dedicada para isso, então em
// vez de inventar uma, esta é a leitura honesta possível hoje (some
// quando o servidor reinicia, mesma limitação já aceita pela Timeline).
function findLastBossDefeated(worldState: WorldStateResponse | null): TimelineEvent | null {
  if (!worldState) return null;
  return [...worldState.timeline].reverse().find((e) => e.text.includes("Boss foi derrotado")) ?? null;
}

export function CityHubBar({ worldState, clock, channelDisplayName }: CityHubBarProps) {
  const lastBossDefeated = findLastBossDefeated(worldState);

  return (
    <div className="city-hub-bar">
      <div className="city-hub-banner">
        <span className="city-hub-crest" aria-hidden="true">
          🛡️
        </span>
        <strong>{channelDisplayName ?? "Reino do StreamRPG"}</strong>
      </div>
      <StatsRow
        items={[
          { label: "Relógio da Capital", value: clock },
          { label: "População online", value: worldState?.panel.players_online ?? 0 },
          { label: "Expedições ativas", value: worldState?.kingdom.expeditions_active ?? 0 },
          {
            label: "Último Boss derrotado",
            value: lastBossDefeated
              ? new Date(lastBossDefeated.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              : "Nenhum ainda",
          },
        ]}
      />
    </div>
  );
}
