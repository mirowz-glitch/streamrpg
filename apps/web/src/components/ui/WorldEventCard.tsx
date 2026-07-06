import type { CurrentWorldEventResponse } from "@streamrpg/shared";

interface WorldEventCardProps {
  event: CurrentWorldEventResponse;
}

function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "menos de 1 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `~${hours}h${minutes > 0 ? `${minutes}min` : ""}`;
  return `~${minutes} min`;
}

// Sprint Kingdom Events (MVP) — card único "Evento Atual": nome, ícone,
// descrição, tempo restante (até a próxima virada de dia) e, quando
// existir, um comentário de NPC — puramente ambiental, nenhum botão,
// nenhuma interação.
export function WorldEventCard({ event }: WorldEventCardProps) {
  return (
    <div className="card world-event-card">
      <h2>🌍 Evento Atual</h2>
      <div className="world-event-header">
        <span className="world-event-icon">{event.icon}</span>
        <strong className="world-event-name">{event.name}</strong>
      </div>
      <p className="world-event-description">{event.description}</p>
      <p className="hint">
        {event.duration_label} · {formatRemaining(event.seconds_remaining)} restantes
      </p>
      {event.npc_comment ? (
        <p className="world-event-npc-comment">
          {event.npc_comment.npc_icon} {event.npc_comment.npc_name}: "{event.npc_comment.text}"
        </p>
      ) : null}
    </div>
  );
}
