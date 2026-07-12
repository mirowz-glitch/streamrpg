import { memo } from "react";
import { useBossState } from "../../hooks/useBossState";
import { ProgressBar } from "./ProgressBar";

interface BossCardProps {
  channel: string | undefined;
  compact?: boolean;
  // Sprint Gameplay Feel 03 — opcional (Overlay não tem "personagem
  // logado", só CharacterPage tem); quando presente, só serve pra
  // destacar a própria linha na lista de recompensas.
  myCharacterId?: string;
}

// Sprint Performance Optimization — memo evita re-renderizar o card
// inteiro (e seu polling próprio via useBossState) quando a página que o
// contém (Personagem/Overlay) re-renderiza por um motivo sem relação
// (ex: o cooldown do ping contando a cada segundo). O próprio
// useBossState continua atualizando este componente normalmente quando
// o Boss muda de verdade.
export const BossCard = memo(function BossCard({ channel, compact = false, myCharacterId }: BossCardProps) {
  const { state, events } = useBossState(channel);

  if (!state?.active) return null;

  const resolved = state.status === "defeated" || state.status === "escaped";
  const percent =
    state.max_hp && state.current_hp !== null ? Math.round((state.current_hp / state.max_hp) * 100) : 0;
  const secondsLeft = state.ends_at !== null ? Math.max(0, state.ends_at - Math.floor(Date.now() / 1000)) : null;

  if (resolved) {
    // Sprint Gameplay Feel 03 — "Boss derrotado" e "Boss fugiu" usavam a
    // MESMA cor (verde de vitória, `.boss-card-resolved`) pra qualquer
    // um dos dois desfechos. `.boss-card-escaped` é a única classe CSS
    // nova desta Sprint — pequena extensão, mesma convenção de cores já
    // usada no projeto (âmbar, já usado em level-up/legendário).
    const outcomeClass = state.status === "escaped" ? " boss-card-escaped" : "";
    return (
      <div className={`boss-card boss-card-resolved${outcomeClass}${compact ? " boss-card-compact" : ""}`}>
        <div className="boss-card-title">
          {state.status === "defeated" ? "🏆 Boss derrotado!" : "💨 Boss fugiu"}
        </div>
        {!compact && state.rewards && state.rewards.length > 0 ? (
          <ul className="boss-rewards-list">
            {state.rewards.map((r) => {
              const isMine = myCharacterId !== undefined && r.character_id === myCharacterId;
              return (
                <li key={r.character_id} className={isMine ? "boss-reward-mine" : undefined}>
                  {isMine ? "➤ Você" : r.display_name}: +{r.xp_granted} XP
                  {r.item_name ? ` · ${r.item_name} (${r.item_rarity})` : ""}
                </li>
              );
            })}
          </ul>
        ) : null}
        {!compact ? <BossEventLog events={events} /> : null}
      </div>
    );
  }

  return (
    <div className={`boss-card${compact ? " boss-card-compact" : ""}`}>
      <div className="boss-card-title">{state.status === "awaiting" ? "⚔️ BOSS APARECEU" : "⚔️ BOSS ATIVO"}</div>
      <div className="boss-card-name">Boss do Reino · Tier {state.tier}</div>
      {state.status === "active" ? (
        <>
          <ProgressBar percent={percent} variant="boss" />
          <div className="boss-card-stats">
            <span>
              {state.current_hp}/{state.max_hp} HP ({percent}%)
            </span>
            {secondsLeft !== null ? (
              <span>
                {Math.floor(secondsLeft / 60)}m {secondsLeft % 60}s restantes
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <p className="boss-card-hint">Aguardando o streamer invocar (ou o tempo acabar).</p>
      )}
      <div className="boss-card-participants">
        Jogadores lutando: <strong>{state.participant_count}</strong>
      </div>
      {!compact ? <BossEventLog events={events} /> : null}
    </div>
  );
});

function BossEventLog({ events }: { events: { id: string; text: string }[] }) {
  if (events.length === 0) return null;
  return (
    <div className="boss-event-log">
      <strong>Últimos eventos</strong>
      <ul>
        {events.map((e) => (
          <li key={e.id}>{e.text}</li>
        ))}
      </ul>
    </div>
  );
}
