import type { CharacterResponse, ChannelKingdomState, IdentityProfile } from "@streamrpg/shared";
import { HallOfFame } from "../ui/HallOfFame";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { FOUNDER_TITLE_SLUGS } from "../../lib/identity";
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";
import type { CharacterKingdomRole } from "../../hooks/useKingdomRole";
import { buildPlayerFacts } from "../../lib/playerFacts";
import { getCharacterStage, STAGE_GUILD_AMBIENT } from "../../lib/characterPresence";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";
import { EMPTY_ECHO_CONTEXT, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";

interface GuildBuildingProps {
  kingdom: ChannelKingdomState | null;
  identity: IdentityProfile | null;
  character?: CharacterResponse | null;
  kingdomRoles?: CharacterKingdomRole[];
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint World Cohesion Phase I (Connected World) — mesmo contexto já
  // buscado por CityPage (approach da expedição atual); GuildBuilding
  // nunca decide nada com isso além de repassar pra camada central.
  echoContext?: ExpeditionEchoContext;
}

// Sprint Capital City — reaproveita getHallOfFame (Sprint Kingdom
// Prestige System) e as Títulos de Fundador (Sprint Founder Identity &
// Prestige); nenhum dado novo, nenhuma consulta nova.
export function GuildBuilding({
  kingdom,
  identity,
  character,
  kingdomRoles,
  worldPresenceCtx,
  echoContext = EMPTY_ECHO_CONTEXT,
}: GuildBuildingProps) {
  const founderTitles = identity?.titles.filter((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)) ?? [];
  const environmentalLine = getEnvironmentalLine("guilda");
  const worldSimulationLine = getWorldSimulationLine("guilda");
  const landmarkIdentityLine = getLandmarkIdentityLine("guilda");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (mapas/banco fora do lugar), 2 variantes fixas
  // que rotacionam por dia (sem sinal reativo, mesmo mecanismo de
  // Environmental Storytelling/World Simulation quando há mais de uma
  // variante fixa).
  const cityAmbientLine = getCityAmbientLine("guilda");
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("guilda");
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Guilda + Taverna/Kingdom
  // Reputation), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("guilda", buildWorldCohesionContext(worldPresenceCtx, echoContext));

  return (
    <section className="city-building-screen">
      <h2>🏛️ Guilda</h2>
      <NpcIntro npc={NPCS.guildmaster} />
      <p className="hint">O Hall da Fama do Reino — quem carrega os cargos mais importantes hoje.</p>
      <WorldPresenceLine building="guilda" ctx={worldPresenceCtx} />
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      {character && identity ? (
        <p className="hint">
          {STAGE_GUILD_AMBIENT[getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles ?? []))]}
        </p>
      ) : null}

      {kingdom ? (
        <HallOfFame slots={kingdom.hall_of_fame} />
      ) : (
        <p className="hint">Informe um Reino na Praça Central para ver o Hall da Fama.</p>
      )}

      <h3 className="identity-subtitle">Fundadores</h3>
      {founderTitles.length > 0 ? (
        <ul className="city-founder-list">
          {founderTitles.map((title) => (
            <li key={title.id}>👑 {title.name}</li>
          ))}
        </ul>
      ) : (
        <p className="hint">Nenhum título de fundador conquistado ainda.</p>
      )}
    </section>
  );
}
