import { useState } from "react";
import { getLoginUrl } from "../lib/api";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await getLoginUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="card login-card">
        <h1>
          Stream<span style={{ color: "#9146ff" }}>RPG</span>
        </h1>
        <p>Ganhe XP assistindo lives na Twitch. Ping a cada 60 segundos, drops, ranking e overlay para OBS.</p>
        <button onClick={() => void handleLogin()} disabled={loading}>
          {loading ? "Redirecionando..." : "Entrar com Twitch"}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </div>
    </main>
  );
}
