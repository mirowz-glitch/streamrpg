import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OverlayResponse } from "@streamrpg/shared";
import { XpBar } from "../components/ui/XpBar";
import { api } from "../lib/api";

export function OverlayPage() {
  const { channel = "" } = useParams();
  const [data, setData] = useState<OverlayResponse | null>(null);

  useEffect(() => {
    if (!channel) return;
    const load = () => {
      void api
        .get<OverlayResponse>(`/api/overlay/${encodeURIComponent(channel)}/viewers`)
        .then(setData)
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, 5000);
    return () => window.clearInterval(id);
  }, [channel]);

  return (
    <main className="page overlay-page">
      <header className="overlay-header">
        <h2>StreamRPG · {channel}</h2>
        <span className="overlay-count">{data?.total ?? 0} viewers ativos</span>
      </header>
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
                  <div className="overlay-meta">
                    Nv. {viewer.level}
                    {viewer.equipped_weapon ? ` · ${viewer.equipped_weapon}` : ""}
                  </div>
                </div>
              </div>
              <XpBar percent={viewer.percent} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
