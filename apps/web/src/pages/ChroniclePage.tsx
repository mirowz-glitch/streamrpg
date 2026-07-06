import { useEffect, useState } from "react";
import type { ChronicleResponse } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

// Sprint Kingdom Chronicles (MVP) — o "Livro" de um personagem: capítulos
// permanentes, mais antigo primeiro (ordem de leitura de um livro real).
// Ao contrário da Timeline/Jornal do Reino, esta lista nunca é
// reordenada nem perdida — é a única tela do jogo que se propõe a ser
// relida meses depois.
export function ChroniclePage() {
  const { profile, loading } = useAuth();
  const [data, setData] = useState<ChronicleResponse | null>(null);

  useEffect(() => {
    if (!profile) return;
    void api
      .get<ChronicleResponse>("/api/chronicle")
      .then(setData)
      .catch(() => undefined);
  }, [profile]);

  if (!profile && !loading) {
    return (
      <main className="page">
        <AppNav />
        <div className="card">
          <p>Faça login para ver seu Livro.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>📖 Crônicas</h1>
        <p className="hint">O Livro do seu aventureiro — os momentos que ele contaria anos depois.</p>

        {!data ? (
          <p className="loading-state">Abrindo o Livro...</p>
        ) : data.entries.length === 0 ? (
          <p className="hint">Nenhum capítulo escrito ainda. A jornada está apenas começando.</p>
        ) : (
          <ul className="chronicle-list">
            {data.entries.map((entry) => (
              <li key={entry.id} className="chronicle-entry">
                <div className="chronicle-entry-header">
                  <span className="chronicle-entry-icon">{entry.icon}</span>
                  <strong className="chronicle-entry-title">{entry.title}</strong>
                  <span className="chronicle-entry-date">
                    {new Date(entry.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                </div>
                <p className="chronicle-entry-text">{entry.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
