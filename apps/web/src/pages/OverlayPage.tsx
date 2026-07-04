import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { OverlayResponse } from "@streamrpg/shared";
import { XpBar } from "../components/ui/XpBar";
import { BossCard } from "../components/ui/BossCard";
import { ExpeditionCompact } from "../components/ui/ExpeditionCompact";
import { api } from "../lib/api";
import { isSameData } from "../lib/compare";
import { DEFAULT_POLL_MS } from "../lib/pollIntervals";

interface JoinLeaveEvent {
  id: string;
  text: string;
}

let joinLeaveSeq = 0;

// Mesmo padrão de diff client-side já usado em useBossState (Sprint Boss
// Experience) — nenhum evento novo do backend, só compara o poll atual
// (já existente, 5s) com o anterior para saber quem entrou/saiu.
function diffViewers(
  prev: OverlayResponse | null,
  current: OverlayResponse,
): JoinLeaveEvent[] {
  if (!prev) return [];
  const events: JoinLeaveEvent[] = [];
  const prevIds = new Set(prev.viewers.map((v) => v.id));
  const currentIds = new Set(current.viewers.map((v) => v.id));

  for (const viewer of current.viewers) {
    if (!prevIds.has(viewer.id)) {
      joinLeaveSeq += 1;
      events.push({ id: `join-${joinLeaveSeq}`, text: `${viewer.display_name} entrou` });
    }
  }
  for (const viewer of prev.viewers) {
    if (!currentIds.has(viewer.id)) {
      joinLeaveSeq += 1;
      events.push({ id: `leave-${joinLeaveSeq}`, text: `${viewer.display_name} saiu` });
    }
  }
  return events;
}

export function OverlayPage() {
  const { channel = "" } = useParams();
  const [data, setData] = useState<OverlayResponse | null>(null);
  const [log, setLog] = useState<JoinLeaveEvent[]>([]);
  const prevRef = useRef<OverlayResponse | null>(null);

  useEffect(() => {
    if (!channel) return;
    const load = () => {
      void api
        .get<OverlayResponse>(`/api/overlay/${encodeURIComponent(channel)}/viewers`)
        .then((next) => {
          // Sprint Performance Optimization — mesmo dado do poll
          // anterior não gera nenhum join/leave nem precisa re-renderizar
          // a lista de viewers.
          if (isSameData(prevRef.current, next)) return;
          const events = diffViewers(prevRef.current, next);
          if (events.length > 0) {
            setLog((old) => [...old, ...events].slice(-3));
          }
          prevRef.current = next;
          setData(next);
        })
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, DEFAULT_POLL_MS);
    return () => window.clearInterval(id);
  }, [channel]);

  return (
    <main className="page overlay-page">
      <header className="overlay-header">
        <h2>StreamRPG · {channel}</h2>
        <span className="overlay-count">{data?.total ?? 0} viewers ativos</span>
      </header>
      <BossCard channel={channel} compact />
      {data && data.hall_of_fame_highlights.some((slot) => slot.holder) ? (
        <ul className="overlay-hall-of-fame">
          {data.hall_of_fame_highlights
            .filter((slot) => slot.holder)
            .map((slot) => (
              <li key={slot.role}>
                {slot.icon} {slot.holder!.display_name}
              </li>
            ))}
        </ul>
      ) : null}
      {log.length > 0 ? (
        <ul className="overlay-log">
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      ) : null}
      {!data ? (
        <p className="overlay-empty">Aguardando viewers...</p>
      ) : data.viewers.length === 0 ? (
        <p className="overlay-empty">Nenhum viewer ativo nos últimos 5 minutos.</p>
      ) : (
        <ul className="overlay-list">
          {data.viewers.map((viewer) => (
            <li key={viewer.id} className="overlay-card">
              <div className="overlay-card-top">
                {viewer.avatar_url ? (
                  <img src={viewer.avatar_url} alt="" className="overlay-avatar" />
                ) : (
                  <div className="overlay-avatar placeholder" />
                )}
                <div>
                  <strong>{viewer.display_name}</strong>
                  {viewer.title_name ? <div className="overlay-title">👑 {viewer.title_name}</div> : null}
                  <div className="overlay-meta">
                    Nv. {viewer.level} · {viewer.xp} XP
                    {viewer.equipped_weapon ? ` · ${viewer.equipped_weapon}` : ""}
                  </div>
                </div>
              </div>
              <XpBar percent={viewer.percent} />
              {viewer.expedition ? <ExpeditionCompact expedition={viewer.expedition} /> : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
