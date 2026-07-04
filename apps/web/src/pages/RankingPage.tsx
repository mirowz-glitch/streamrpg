import { memo, useEffect, useState } from "react";
import type { RankingEntry, RankingResponse } from "@streamrpg/shared";
import { getProgress } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { XpBar } from "../components/ui/XpBar";
import { FramedAvatar } from "../components/ui/FramedAvatar";
import { api } from "../lib/api";
import { getStoredChannel } from "../hooks/usePing";
import { GuideBubble } from "../components/onboarding/GuideBubble";

// XP que falta para alcançar a posição imediatamente acima — pura
// subtração sobre o xp total já retornado pela API, nenhum cálculo de
// jogo novo. O líder (#1) não tem "acima" — mostra-se um destaque próprio.
function xpGapToAbove(entries: RankingEntry[], index: number): number | null {
  if (index === 0) return null;
  return entries[index - 1].xp - entries[index].xp;
}

interface RankingRowProps {
  entry: RankingEntry;
  gap: number | null;
  isLeader: boolean;
}

// Sprint Performance Optimization — linha extraída para memoizar; até
// 50 entradas por Ranking (LIMIT já existente em xp.service.ts), cada
// uma só precisa re-renderizar quando a própria entrada muda.
const RankingRow = memo(function RankingRow({ entry, gap, isLeader }: RankingRowProps) {
  const progress = getProgress(entry.xp);
  return (
    <li className="ranking-entry">
      <div className="ranking-entry-top">
        <span className="ranking-position">#{entry.position}</span>
        <FramedAvatar avatarUrl={entry.avatar_url} frameTier={entry.frame_tier} baseClassName="ranking-avatar" />
        <div className="ranking-entry-name">
          <strong>{entry.display_name}</strong>
          <span className="ranking-entry-meta">
            Nv. {entry.level} · {entry.xp} XP · {entry.total_minutes} min
          </span>
        </div>
        {/* Sprint Founder Identity & Prestige — espaço antes
            reservado, agora com o título equipado real. */}
        <span className="ranking-title-slot">{entry.title_name ? `👑 ${entry.title_name}` : ""}</span>
      </div>
      {/* Sprint Kingdom Prestige System, Etapa 7 — só aparece
          com o Ranking filtrado por canal (cargo é um
          conceito de Reino, ver role_icons no shared). */}
      {entry.role_icons.length > 0 ? <span className="ranking-role-icons">{entry.role_icons.join(" ")}</span> : null}
      <XpBar percent={progress.percent} />
      <span className="ranking-gap">
        {isLeader ? "🏆 Líder do ranking" : `${gap} XP para alcançar #${entry.position - 1}`}
      </span>
    </li>
  );
});

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
      <GuideBubble flag="ranking_seen" message="Compare seu progresso com outros aventureiros." />
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
          <p className="loading-state">Carregando ranking...</p>
        ) : data.entries.length === 0 ? (
          <div className="empty-state">
            <p>Ninguém no ranking ainda.</p>
            <p className="hint">Assista uma live com o ping ativo para aparecer aqui.</p>
          </div>
        ) : (
          <ol className="ranking-list">
            {data.entries.map((entry, index) => (
              <RankingRow
                key={entry.character_id}
                entry={entry}
                gap={xpGapToAbove(data.entries, index)}
                isLeader={index === 0}
              />
            ))}
          </ol>
        )}
        {data?.my_position ? <p className="ranking-my-position">Sua posição: #{data.my_position}</p> : null}
      </div>
    </main>
  );
}
