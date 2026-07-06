import { useEffect, useState } from "react";
import type { WorldStateResponse } from "@streamrpg/shared";
import { AppNav } from "../components/ui/AppNav";
import { Timeline } from "../components/ui/Timeline";
import { KingdomNews } from "../components/ui/KingdomNews";
import { WorldEventCard } from "../components/ui/WorldEventCard";
import { RegionGallery } from "../components/ui/RegionGallery";
import { HallOfFame } from "../components/ui/HallOfFame";
import { StatsRow } from "../components/ui/StatsRow";
import { api } from "../lib/api";
import { getStoredChannel, setStoredChannel } from "../hooks/usePing";
import { GuideBubble } from "../components/onboarding/GuideBubble";
import { isSameData } from "../lib/compare";
import { CLOCK_TICK_MS, WORLD_POLL_MS } from "../lib/pollIntervals";

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function WorldPage() {
  const [data, setData] = useState<WorldStateResponse | null>(null);
  const [clock, setClock] = useState(() => formatClock(Date.now()));
  // Sprint Kingdom Prestige System — mesmo padrão `?channel=` já usado
  // pelo Ranking: sem canal, a página mostra só o agregado global (como
  // antes desta Sprint); com canal, também mostra o Reino específico.
  const [channel, setChannel] = useState(getStoredChannel());

  useEffect(() => {
    const load = () => {
      const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
      void api
        .get<WorldStateResponse>(`/api/world/state${query}`)
        .then((next) => {
          // Sprint Performance Optimization — devolver a mesma referência
          // quando o poll não trouxe nada novo faz o React pular a
          // re-renderização (em vez de recriar toda a árvore do Mundo a
          // cada 10s só para repetir o que já estava na tela).
          setData((prev) => (isSameData(prev, next) ? prev : next));
        })
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, WORLD_POLL_MS);
    return () => window.clearInterval(id);
  }, [channel]);

  // Relógio do Reino é só o horário real do servidor (server_time),
  // reapresentado com tema de mundo — nada inventado, atualizado a cada
  // segundo localmente para dar sensação de "algo está acontecendo agora"
  // sem precisar de um novo poll por segundo.
  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!data) {
    return (
      <main className="page">
        <AppNav />
        <div className="card">
          <p className="loading-state">Carregando o Reino...</p>
        </div>
      </main>
    );
  }

  const { panel, kingdom, stats, timeline, idle_flavor, most_visited_regions, encounter_stats, channel_kingdom, news, current_event } = data;

  return (
    <main className="page">
      <AppNav />
      <GuideBubble flag="world_seen" message="As expedições acontecem automaticamente." />

      <div className="card">
        <label>
          Ver o Reino de um canal
          <input
            value={channel}
            onChange={(e) => {
              const value = e.target.value;
              setChannel(value);
              setStoredChannel(value);
            }}
            placeholder="login do streamer (vazio = visão global)"
          />
        </label>
      </div>

      {channel_kingdom ? (
        <div className="card kingdom-banner">
          <h1>Reino de {channel_kingdom.channel_display_name}</h1>
          <div className="kingdom-prestige">
            <span className="kingdom-prestige-label">Prestígio do Reino</span>
            <strong className="kingdom-prestige-score">{channel_kingdom.prestige.score}</strong>
          </div>
          <ul className="kingdom-stats-list">
            <li>{channel_kingdom.prestige.breakdown.members_count} membro{channel_kingdom.prestige.breakdown.members_count === 1 ? "" : "s"}</li>
            <li>{channel_kingdom.prestige.breakdown.bosses_defeated} Boss{channel_kingdom.prestige.breakdown.bosses_defeated === 1 ? "" : "es"} derrotado{channel_kingdom.prestige.breakdown.bosses_defeated === 1 ? "" : "s"}</li>
            <li>{channel_kingdom.prestige.breakdown.total_xp} XP acumulado por este Reino</li>
            <li>{channel_kingdom.prestige.breakdown.total_minutes_watched} minutos assistidos</li>
            <li>{channel_kingdom.prestige.breakdown.regions_discovered} região{channel_kingdom.prestige.breakdown.regions_discovered === 1 ? "" : "ões"} descoberta{channel_kingdom.prestige.breakdown.regions_discovered === 1 ? "" : "s"}</li>
          </ul>

          <h2 className="kingdom-stats-title">Hall da Fama</h2>
          <HallOfFame slots={channel_kingdom.hall_of_fame} />

          <h2 className="kingdom-stats-title">Últimas conquistas</h2>
          {channel_kingdom.recent_achievements.length === 0 ? (
            <p className="hint">Nenhuma troca de cargo registrada ainda nesta sessão do servidor.</p>
          ) : (
            <ul className="kingdom-stats-list">
              {channel_kingdom.recent_achievements.map((achievement) => (
                <li key={achievement.id}>{achievement.text}</li>
              ))}
            </ul>
          )}
        </div>
      ) : channel ? (
        <div className="card">
          <p className="hint">Nenhum Reino encontrado para "{channel}" ainda — assista uma live com o ping ativo para criá-lo.</p>
        </div>
      ) : null}

      <div className="card">
        <h1>Mundo</h1>
        <StatsRow
          items={[
            { label: "Horário do Reino", value: clock },
            { label: "Tick atual", value: panel.current_tick > 0 ? panel.current_tick : "—" },
            { label: "Jogadores online", value: panel.players_online },
            {
              label: "Boss ativo",
              value: panel.bosses_active_now > 0 ? panel.bosses_active_now : "Nenhum",
              highlight: true,
            },
          ]}
        />
        <p className="hint">
          Último evento: {panel.last_event ? panel.last_event.text : idle_flavor}
        </p>
      </div>

      <WorldEventCard event={current_event} />

      <div className="card">
        <h2>Linha do tempo</h2>
        <Timeline events={timeline} idleFlavor={idle_flavor} />
      </div>

      <div className="card">
        <h2>📰 Notícias do Reino</h2>
        <KingdomNews items={news} />
      </div>

      <div className="card">
        <h1>Estado do Reino</h1>
        <StatsRow
          items={[
            { label: "Jogadores ativos", value: kingdom.players_active },
            {
              label: "Boss",
              value: kingdom.bosses_active_now > 0 ? `${kingdom.bosses_active_now} ativo(s)` : "Nenhum ativo",
            },
            {
              label: "Exploração",
              value: `${kingdom.expeditions_active} expedição${kingdom.expeditions_active === 1 ? "" : "ões"} em andamento`,
            },
            { label: "Gold em circulação", value: kingdom.gold_in_circulation.toFixed(1) },
          ]}
        />

        <h2 className="kingdom-stats-title">O Reino em números</h2>
        <ul className="kingdom-stats-list">
          <li>O Reino possui {stats.adventurers_total} aventureiro{stats.adventurers_total === 1 ? "" : "s"}.</li>
          <li>O Reino derrotou {stats.bosses_defeated_total} Boss{stats.bosses_defeated_total === 1 ? "" : "es"}.</li>
          <li>O Reino encontrou {stats.items_found_total} ite{stats.items_found_total === 1 ? "m" : "ns"}.</li>
        </ul>

        {most_visited_regions.length > 0 ? (
          <>
            <h2 className="kingdom-stats-title">Regiões mais visitadas</h2>
            <ul className="kingdom-stats-list">
              {most_visited_regions.map((region) => (
                <li key={region.region_id}>
                  {region.region_name} — {region.visits} expedição{region.visits === 1 ? "" : "ões"}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="card">
        <h1>Encontros do Reino</h1>
        {encounter_stats.recent.length === 0 ? (
          <p className="hint">Nenhum encontro registrado ainda nesta sessão do servidor.</p>
        ) : (
          <ul className="encounter-recent-list">
            {encounter_stats.recent.slice(0, 8).map((event) => (
              <li key={event.id}>
                <span className="encounter-recent-icon">{event.encounter.icon}</span> {event.encounter.text}
                <span className="encounter-recent-region"> · {event.region_name}</span>
              </li>
            ))}
          </ul>
        )}

        {encounter_stats.most_active_regions.length > 0 ? (
          <>
            <h2 className="kingdom-stats-title">Regiões mais movimentadas</h2>
            <ul className="kingdom-stats-list">
              {encounter_stats.most_active_regions.map((region) => (
                <li key={region.region_id}>
                  {region.region_name} — {region.count} encontro{region.count === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {encounter_stats.most_common_categories.length > 0 ? (
          <>
            <h2 className="kingdom-stats-title">Tipos de encontro mais frequentes</h2>
            <ul className="kingdom-stats-list">
              {encounter_stats.most_common_categories.map((cat) => (
                <li key={cat.category}>
                  {cat.icon} {cat.category} — {cat.count}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="card">
        <h1>Regiões do Reino</h1>
        <RegionGallery />
      </div>
    </main>
  );
}
