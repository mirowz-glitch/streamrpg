import { RegionGallery } from "../ui/RegionGallery";
import { ExpeditionPanel } from "../ui/ExpeditionPanel";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { EMPTY_ECHO_CONTEXT, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { buildMicroEventContext, getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";

interface NorthGateBuildingProps {
  enabled: boolean;
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Expedition Echoes Phase I — repassado até RegionGallery e
  // NpcIntro (Sargento Roth); NorthGateBuilding nunca decide nada com
  // isso.
  echoContext?: ExpeditionEchoContext;
  // Sprint Gameplay Phase I (Expedition Specializations) — já calculada
  // por CityPage (mesmo playerFacts dos outros prédios); só repassada
  // até ExpeditionPanel, nunca decidida aqui.
  specializationLine?: string | null;
}

// Sprint Capital City — reaproveita RegionGallery (World Simulation) e
// ExpeditionPanel (Expedition System); nenhuma região é "trancada" hoje
// (nenhum mecanismo de bloqueio existe ainda — Kingdom Prestige System,
// Etapa 8, deixou isso preparado para o futuro), então todas aparecem
// como desbloqueadas, o que é honesto com o estado real do jogo. Sprint
// NPCs Vivos — Sargento Roth apresenta o prédio.
export function NorthGateBuilding({
  enabled,
  worldPresenceCtx,
  echoContext = EMPTY_ECHO_CONTEXT,
  specializationLine,
}: NorthGateBuildingProps) {
  // Sprint Environmental Storytelling Phase I — único lugar reativo ao
  // evento atual do Reino (categoria "militar", já real e existente),
  // escolhido por ser onde uma pista física de "passagem recente"
  // reforça o tema sem repetir o texto de World Presence pra "militar"
  // aqui ("Há mais guardas observando a estrada hoje." — sobre pessoas;
  // esta fala de uma marca no chão).
  const environmentalLine = getEnvironmentalLine("portao-norte", { worldEventCategory: worldPresenceCtx?.eventCategory });
  const worldSimulationLine = getWorldSimulationLine("portao-norte");
  const landmarkIdentityLine = getLandmarkIdentityLine("portao-norte");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (marcas de roda de carroça), objeto diferente
  // das pegadas já usadas por Environmental Storytelling pro mesmo
  // lugar (nunca a mesma ideia reformulada).
  const cityAmbientLine = getCityAmbientLine("portao-norte");
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("portao-norte", buildMicroEventContext(worldPresenceCtx));
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Portão Norte + Casa dos
  // Viajantes/Expedição), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("portao-norte", buildWorldCohesionContext(worldPresenceCtx, echoContext));

  return (
    <section className="city-building-screen">
      <h2>🚪 Portão Norte</h2>
      <NpcIntro npc={NPCS.guarda} echoContext={echoContext} />
      <p className="hint">A saída da Capital para o mundo — regiões desbloqueadas e sua expedição atual.</p>
      <WorldPresenceLine building="portao-norte" ctx={worldPresenceCtx} />
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      <ExpeditionPanel enabled={enabled} specializationLine={specializationLine} />
      <h3 className="identity-subtitle">Regiões desbloqueadas</h3>
      <RegionGallery echoContext={echoContext} />
    </section>
  );
}
