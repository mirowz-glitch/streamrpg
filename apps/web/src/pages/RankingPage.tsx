import { useEffect, useState } from "react";
import type { RankingResponse } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";
import { getStoredChannel } from "../hooks/usePing";

export function RankingPage() {
  const [data, setData] = useState<RankingResponse | null>(null);
  const [channel, setChannel] = useState(getStoredChannel());

  useEffect(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get<RankingResponse>(`/api/ranking${query}`).then(setData);
  }, [channel]);

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Ranking</h1>
        <label>
          Filtrar por canal
          <input
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="login do streamer (vazio = global)"
          />
        </label>
        {!data ? (
          <p>Carregando...</p>
        ) : (
          <ol className="ranking-list">
            {data.entries.map((entry) => (
              <li key={entry.character_id}>
                #{entry.position} {entry.display_name} — Nv. {entry.level} · {entry.xp} XP · {entry.total_minutes} min
              </li>
            ))}
          </ol>
        )}
        {data?.my_position ? <p>Sua posição: #{data.my_position}</p> : null}
      </div>
    </main>
  );
}
