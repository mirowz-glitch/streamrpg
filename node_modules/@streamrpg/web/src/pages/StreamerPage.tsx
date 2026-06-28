import { useEffect, useState } from "react";
import type { StreamerDashboard } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export function StreamerPage() {
  const { profile } = useAuth();
  const [dashboard, setDashboard] = useState<StreamerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    void api
      .get<StreamerDashboard>("/api/streamer/dashboard")
      .then(setDashboard)
      .catch(async () => {
        try {
          await api.post("/api/streamer/connect");
          const data = await api.get<StreamerDashboard>("/api/streamer/dashboard");
          setDashboard(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Falha ao carregar painel");
        }
      })
      .finally(() => setLoading(false));
  }, [profile]);

  if (!profile) {
    return (
      <main className="page">
        <div className="card">Faça login para acessar o painel do streamer.</div>
      </main>
    );
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Painel do Streamer</h1>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : dashboard ? (
          <>
            <p>Canal: <strong>{dashboard.channel.display_name}</strong></p>
            <p>Viewers ativos (5 min): {dashboard.active_viewers}</p>
            <p>Total de viewers: {dashboard.total_viewers}</p>
            <div className="obs-box">
              <h3>URL para OBS (Browser Source)</h3>
              <code>{dashboard.overlay_url}</code>
              <p className="hint">Polling a cada 5 segundos. Fundo transparente recomendado.</p>
            </div>
            {dashboard.ranking_preview.length > 0 ? (
              <>
                <h3>Top viewers</h3>
                <ol>
                  {dashboard.ranking_preview.map((entry) => (
                    <li key={entry.character_id}>
                      #{entry.position} {entry.display_name} — Nv. {entry.level}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
