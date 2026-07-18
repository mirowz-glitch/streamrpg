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
import { buildKingdomEvolutionContext, getKingdomEvolutionLine } from "../../lib/kingdomEvolution";
import { buildBuildingProgressionContext, getBuildingStage, getBuildingStageClass, type BuildingStage } from "../../lib/buildingProgression";
import { buildReactiveWorldContext, getReactiveClass, getReactiveState } from "../../lib/reactiveWorld";
import { buildWorldVisualContext, getWorldVisualClass } from "../../lib/worldVisualState";

// Sprint Building Visual State Phase I — decoração puramente visual por
// estágio (sem texto/narrativa); estágio nunca decidido aqui.
const GUILD_DECOR: Record<BuildingStage, string> = {
  "stage-1": "🗺️",
  "stage-2": "🗺️ 🖼️",
  "stage-3": "🗺️ 🖼️ 📜",
  "stage-4": "🏆 📜📜",
};

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
  // Sprint Kingdom Evolution Phase I — mesmo `facts` já calculado
  // abaixo pra STAGE_GUILD_AMBIENT; reage a hasKingdomRole (PlayerFacts),
  // nenhum dado novo, nenhum segundo buildPlayerFacts.
  const facts = character && identity ? buildPlayerFacts(character, identity, kingdomRoles ?? []) : null;
  const kingdomEvolutionLine = facts
    ? getKingdomEvolutionLine("guilda", buildKingdomEvolutionContext(facts, undefined, worldPresenceCtx))
    : null;
  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, reage a bossesDefeated), preparada pra sprites
  // futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = facts ? getBuildingStageClass("guilda", buildBuildingProgressionContext(facts)) : null;
  const buildingStage = facts ? getBuildingStage("guilda", buildBuildingProgressionContext(facts)) : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // bossesDefeated), preparado pra sprites/efeitos futuros; nenhum
  // texto novo.
  const reactiveClass = facts ? getReactiveClass("guilda", buildReactiveWorldContext(facts)) : null;
  // Sprint World Visual States Phase I — traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum (4 estados); nenhum dado novo.
  const worldVisualClass = facts
    ? getWorldVisualClass("building", buildWorldVisualContext({ buildingReactiveState: getReactiveState("guilda", buildReactiveWorldContext(facts)) }))
    : null;

  return (
    <section className={`city-building-screen city-building-guilda${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`}>
      <h2>🏛️ Guilda</h2>
      {buildingStage ? <p className="building-decor">{GUILD_DECOR[buildingStage]}</p> : null}
      <NpcIntro npc={NPCS.guildmaster} />
      <p className="hint">O Hall da Fama do Reino — quem carrega os cargos mais importantes hoje.</p>

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

      {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — 6 linhas
          ambientes; movidas pra depois do Hall da Fama/Fundadores (o
          conteúdo real deste prédio). Nenhuma removida, nenhum dado/
          lógica alterado — só reordenado. */}
      <WorldPresenceLine building="guilda" ctx={worldPresenceCtx} />
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      {kingdomEvolutionLine ? <p className="hint">{kingdomEvolutionLine}</p> : null}
      {facts ? <p className="hint">{STAGE_GUILD_AMBIENT[getCharacterStage(facts)]}</p> : null}
    </section>
  );
}
