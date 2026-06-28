import { useState } from "react";
import { Link } from "react-router-dom";
import { XpBar } from "../components/ui/XpBar";
import { AppNav } from "../components/ui/AppNav";
import { useAuth } from "../hooks/useAuth";
import { useCharacter } from "../hooks/useCharacter";
import { usePing } from "../hooks/usePing";

export function CharacterPage() {
  const { profile, logout } = useAuth();
  const { character, loading, refresh } = useCharacter(!!profile);
  const [channelInput, setChannelInput] = useState("");
  const { lastPing, cooldownMs, ping, canPing, error, channel, setChannel } = usePing(
    !!profile,
    channelInput || undefined,
  );

  if (!profile && !loading) {
    return (
      <main className="page">
        <div className="card">
          <p>Faça login para ver seu personagem.</p>
          <Link to="/login">Ir para login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <AppNav />
      <button className="logout-btn" onClick={() => void logout()}>
        Sair
      </button>

      <div className="card">
        {loading || !character ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div className="character-header">
              {character.avatar_url ? (
                <img src={character.avatar_url} alt="" className="character-avatar" />
              ) : null}
              <div>
                <h1>{character.display_name}</h1>
                <p>Nível {character.level} · {character.gold.toFixed(1)} ouro</p>
              </div>
            </div>

            <XpBar percent={character.percent} label={`${character.xp} XP no nível · faltam ${character.xp_to_next}`} />
            <p className="stat-line">Minutos assistidos: {character.total_minutes}</p>

            {character.equipped.length > 0 ? (
              <div className="equipped-list">
                <strong>Equipado:</strong>
                <ul>
                  {character.equipped.map((item) => (
                    <li key={item.slot}>
                      {item.slot}: {item.name} ({item.rarity})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="ping-box">
              <label htmlFor="channel">Canal da live (login Twitch)</label>
              <input
                id="channel"
                value={channelInput || channel}
                onChange={(e) => setChannelInput(e.target.value)}
                onBlur={() => {
                  if (channelInput.trim()) setChannel(channelInput.trim());
                }}
                placeholder="ex: nomedostreamer"
              />
              <button
                onClick={() => {
                  if (channelInput.trim()) setChannel(channelInput.trim());
                  void ping().then(() => refresh());
                }}
                disabled={!canPing}
              >
                {canPing ? "Ping (+10 XP)" : `Aguarde ${Math.ceil(cooldownMs / 1000)}s`}
              </button>
              {error ? <p className="error">{error}</p> : null}
              {lastPing?.leveled_up ? <p className="level-up">Level up!</p> : null}
              {lastPing?.drop?.dropped && lastPing.drop.item ? (
                <p className="drop-alert">Drop: {lastPing.drop.item.name} ({lastPing.drop.item.rarity})</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
