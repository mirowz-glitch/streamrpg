import { memo, useMemo } from "react";
import type { TimelineEvent } from "@streamrpg/shared";

interface TimelineProps {
  events: TimelineEvent[];
  idleFlavor: string;
}

// Sprint Performance Optimization — item extraído da lista para poder
// memoizar por evento: cada `TimelineEvent` já existente é imutável (o
// backend nunca reescreve um evento passado), então a mesma entrada
// nunca precisa ser re-renderizada duas vezes.
const TimelineItem = memo(function TimelineItem({ event }: { event: TimelineEvent }) {
  return (
    <li>
      <span className="timeline-time">
        {new Date(event.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
      </span>
      <span>{event.text}</span>
    </li>
  );
});

// Sprint World Simulation — mostra os eventos reais (Parte 2) mais
// recentes primeiro; quando não há nenhum (buffer em memória vazio desde
// que o servidor subiu), mostra a mensagem derivada do estado atual em
// vez de uma lista vazia (Parte 3) — nunca as duas coisas ao mesmo tempo.
export function Timeline({ events, idleFlavor }: TimelineProps) {
  // Sprint Performance Optimization — só recalcula a cópia invertida
  // quando `events` realmente muda (nova referência do array vindo do
  // poll), não a cada re-renderização da página que contém a Timeline.
  const reversed = useMemo(() => [...events].reverse(), [events]);

  if (events.length === 0) {
    return <p className="timeline-idle">{idleFlavor}</p>;
  }

  return (
    <ul className="timeline-list">
      {reversed.map((event) => (
        <TimelineItem key={event.id} event={event} />
      ))}
    </ul>
  );
}
