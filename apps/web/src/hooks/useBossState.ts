import { useEffect, useRef, useState } from "react";
import type { BossStateSnapshot } from "@streamrpg/shared";
import { api } from "../lib/api";
import { isSameData } from "../lib/compare";
import { DEFAULT_POLL_MS } from "../lib/pollIntervals";

export interface BossLogEvent {
  id: string;
  text: string;
}

let eventSeq = 0;
function mkEvent(text: string): BossLogEvent {
  eventSeq += 1;
  return { id: `boss-evt-${eventSeq}`, text };
}

/**
 * Sprint Boss Experience — poll simples (mesmo mecanismo já usado pelo
 * Overlay, 5s), sem WebSocket/SSE. O "histórico de eventos" é derivado
 * comparando o snapshot atual com o anterior — nenhum dado novo do
 * backend, só diferença entre dois polls já reais.
 */
export function useBossState(channel: string | undefined, pollMs = DEFAULT_POLL_MS) {
  const [state, setState] = useState<BossStateSnapshot | null>(null);
  const [events, setEvents] = useState<BossLogEvent[]>([]);
  const prevRef = useRef<BossStateSnapshot | null>(null);

  useEffect(() => {
    if (!channel) return;
    let cancelled = false;

    function load() {
      void api
        .get<BossStateSnapshot>(`/api/overlay/${encodeURIComponent(channel!)}/boss`)
        .then((data) => {
          if (cancelled) return;
          const prev = prevRef.current;
          // Sprint Performance Optimization — dado idêntico ao último
          // poll não pode disparar nenhuma das transições abaixo; pular
          // cedo evita um setState (e a re-renderização que viria com
          // ele) sempre que nada realmente mudou.
          if (isSameData(prev, data)) return;
          const newEvents: BossLogEvent[] = [];

          if ((!prev || !prev.active) && data.active && data.status === "awaiting") {
            newEvents.push(mkEvent("Um Boss apareceu — aguardando início"));
          }
          if (prev?.status === "awaiting" && data.status === "active") {
            newEvents.push(mkEvent("Boss entrou em combate!"));
          }
          if (
            prev?.status === "active" &&
            data.status === "active" &&
            prev.current_hp !== null &&
            data.current_hp !== null &&
            data.current_hp < prev.current_hp
          ) {
            newEvents.push(mkEvent(`Boss perdeu ${prev.current_hp - data.current_hp} HP`));
          }
          if (prev?.active && data.active) {
            const prevIds = new Set(prev.participants.map((p) => p.character_id));
            for (const participant of data.participants) {
              if (!prevIds.has(participant.character_id)) {
                newEvents.push(mkEvent(`${participant.display_name} entrou na luta`));
              }
            }
          }
          if (prev?.status === "active" && data.status === "defeated") {
            newEvents.push(mkEvent("Boss derrotado!"));
          }
          if (prev?.status === "active" && data.status === "escaped") {
            newEvents.push(mkEvent("Boss fugiu..."));
          }
          if (prev?.active && !data.active) {
            newEvents.push(mkEvent("Aguardando o próximo Boss"));
          }

          if (newEvents.length > 0) {
            setEvents((old) => [...old, ...newEvents].slice(-6));
          }
          prevRef.current = data;
          setState(data);
        })
        .catch(() => undefined);
    }

    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [channel, pollMs]);

  return { state, events };
}
