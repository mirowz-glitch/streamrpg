import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { XpBar } from "../components/ui/XpBar";
import { AppNav } from "../components/ui/AppNav";
import { BossCard } from "../components/ui/BossCard";
import { ExpeditionPanel } from "../components/ui/ExpeditionPanel";
import { EquipmentSlots } from "../components/ui/EquipmentSlots";
import { Feedback } from "../components/ui/Feedback";
import { FramedAvatar } from "../components/ui/FramedAvatar";
import { IdentityPanel } from "../components/ui/IdentityPanel";
import { StatsRow } from "../components/ui/StatsRow";
import { useAuth } from "../hooks/useAuth";
import { useCharacter } from "../hooks/useCharacter";
import { useIdentity } from "../hooks/useIdentity";
import { useKingdomRole } from "../hooks/useKingdomRole";
import { usePing } from "../hooks/usePing";
import { WelcomeCard } from "../components/onboarding/WelcomeCard";
import { GuideBubble } from "../components/onboarding/GuideBubble";
import { FirstSteps } from "../components/onboarding/FirstSteps";
import { JourneyProgress } from "../components/onboarding/JourneyProgress";
import { EldrinGuide } from "../components/onboarding/EldrinGuide";
import { FirstItemCard } from "../components/onboarding/FirstItemCard";
import { FirstLevelBanner } from "../components/onboarding/FirstLevelBanner";
import { FirstBossBanner } from "../components/onboarding/FirstBossBanner";
import { NewTitleModal } from "../components/onboarding/NewTitleModal";

// Sprint Identity & Progression — indicador visual único, soma dos
// atributos já mostrados na grade abaixo. Não é um stat de combate: o
// BossCombatSystem nunca lê este número, só existe para dar ao jogador um
// "seu personagem está mais forte" de relance, sem abrir a calculadora.
function totalPower(combat: { attack_physical: number; attack_magic: number; resistance_physical: number; resistance_magic: number; sus: number; uti: number }): number {
  return (
    combat.attack_physical +
    combat.attack_magic +
    combat.resistance_physical +
    combat.resistance_magic +
    combat.sus +
    combat.uti
  );
}

export function CharacterPage() {
  const { profile, logout } = useAuth();
  const { character, loading, refresh } = useCharacter(!!profile);
  const { identity, equipTitle, unequipTitle, equipFrame, unequipFrame } = useIdentity(!!profile);
  const [channelInput, setChannelInput] = useState("");
  const { lastPing, cooldownMs, ping, canPing, error, channel, setChannel } = usePing(
    !!profile,
    channelInput || undefined,
  );
  const kingdomRoles = useKingdomRole(channel || undefined, !!profile);

  // Sprint Performance Optimization — referências estáveis para que o
  // memo de IdentityPanel funcione (senão uma arrow function nova a
  // cada render do CharacterPage anularia a comparação de props).
  const handleEquipTitle = useCallback((titleId: number) => void equipTitle(titleId), [equipTitle]);
  const handleUnequipTitle = useCallback(() => void unequipTitle(), [unequipTitle]);
  const handleEquipFrame = useCallback((frameId: number) => void equipFrame(frameId), [equipFrame]);
  const handleUnequipFrame = useCallback(() => void unequipFrame(), [unequipFrame]);

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

      <WelcomeCard channelDisplayName={channel || null} />

      <div className="card">
        {loading || !character ? (
          <p className="loading-state">Carregando personagem...</p>
        ) : (
          <>
            <GuideBubble flag="profile_seen" message="Aqui você acompanha seu aventureiro." />
            <JourneyProgress totalMinutesWatched={character.total_minutes} />

            <div className="character-header">
              <FramedAvatar
                avatarUrl={character.avatar_url}
                frameTier={identity?.equipped_frame?.tier ?? null}
                baseClassName="character-avatar"
              />
              <div>
                <h1>{character.display_name}</h1>
                {identity?.equipped_title ? <p className="character-title">👑 {identity.equipped_title.name}</p> : null}
                <div className="character-badges">
                  <span className="badge-class" title="Classes chegam em uma Sprint futura">
                    Aventureiro
                  </span>
                  <span className="badge-level">Nível {character.level}</span>
                </div>
              </div>
            </div>

            <FirstLevelBanner level={character.level} />

            <XpBar percent={character.percent} label={`${character.xp} XP no nível · faltam ${character.xp_to_next} para o próximo nível`} />

            <StatsRow
              items={[
                { label: "Gold", value: character.gold.toFixed(1) },
                { label: "Minutos assistidos", value: character.total_minutes },
                { label: "Poder Total", value: totalPower(character.combat), highlight: true },
              ]}
            />

            <FirstBossBanner channel={channel || undefined} />
            <BossCard channel={channel || undefined} />

            {channel && kingdomRoles.length > 0 ? (
              <p className="character-kingdom-roles">
                Cargo{kingdomRoles.length > 1 ? "s" : ""} no Reino de {channel}:{" "}
                {kingdomRoles.map((role) => `${role.icon} ${role.name}`).join(" · ")}
              </p>
            ) : null}

            <ExpeditionPanel enabled={!!profile} />

            {identity ? (
              <IdentityPanel
                identity={identity}
                onEquipTitle={handleEquipTitle}
                onUnequipTitle={handleUnequipTitle}
                onEquipFrame={handleEquipFrame}
                onUnequipFrame={handleUnequipFrame}
              />
            ) : null}

            <FirstItemCard />

            <section className="equipment-section">
              <h2>Equipamento</h2>
              <EquipmentSlots equipped={character.equipped} />
            </section>

            <FirstSteps totalMinutesWatched={character.total_minutes} />
            <EldrinGuide />

            {identity ? <NewTitleModal identity={identity} onEquipTitle={handleEquipTitle} /> : null}

            <section className="power-summary">
              <h2>Atributos de combate</h2>
              <div className="power-grid">
                <div><span>ATQ Físico</span><strong>{character.combat.attack_physical}</strong></div>
                <div><span>ATQ Mágico</span><strong>{character.combat.attack_magic}</strong></div>
                <div><span>Resistência Física</span><strong>{character.combat.resistance_physical}</strong></div>
                <div><span>Resistência Mágica</span><strong>{character.combat.resistance_magic}</strong></div>
                <div><span>SUS</span><strong>{character.combat.sus}</strong></div>
                <div><span>UTI</span><strong>{character.combat.uti}</strong></div>
              </div>
            </section>

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
              {error ? <Feedback kind="error">{error}</Feedback> : null}
              {lastPing?.leveled_up ? <Feedback kind="level-up">Level up! Agora você é nível {lastPing.level}.</Feedback> : null}
              {lastPing?.drop?.dropped && lastPing.drop.item ? (
                <Feedback kind="drop-alert">
                  Drop: {lastPing.drop.item.name} ({lastPing.drop.item.rarity})
                </Feedback>
              ) : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
