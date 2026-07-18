import { useEffect } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { TavernRumor } from "../tavern/TavernRumor";
import { AdventurerTable } from "../tavern/AdventurerTable";
import { WallNotes } from "../tavern/WallNotes";
import { NightSongs } from "../tavern/NightSongs";
import { GuideBubble } from "../onboarding/GuideBubble";
import { useReactiveGlow } from "../../hooks/useReactiveGlow";
import { hasRemembered, remember } from "../../lib/playerMemory";
import { recordEvent } from "../../lib/personalTimeline";
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { EMPTY_ECHO_CONTEXT, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { getKingdomMemoryLine } from "../../lib/kingdomMemory";
import { buildCollectionInsightContext } from "../../lib/collectionInsights";
import type { PlayerFacts } from "../../lib/playerFacts";
import { buildMicroEventContext, getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";
import { buildKingdomEvolutionContext, getKingdomEvolutionLine } from "../../lib/kingdomEvolution";
import { buildBuildingProgressionContext, getBuildingStage, getBuildingStageClass, type BuildingStage } from "../../lib/buildingProgression";
import { buildReactiveWorldContext, getReactiveClass, getReactiveState } from "../../lib/reactiveWorld";
import { buildWorldVisualContext, getWorldVisualClass } from "../../lib/worldVisualState";

// Sprint Building Visual State Phase I — decoração puramente visual por
// estágio (sem texto/narrativa); estágio nunca decidido aqui.
const TAVERN_DECOR: Record<BuildingStage, string> = {
  "stage-1": "🍺",
  "stage-2": "🍺🍺",
  "stage-3": "🛢️",
  "stage-4": "🛢️ 🍗",
};

interface TavernBuildingProps {
  // Sprint Dynamic World Presence Phase I — mesmo contexto que qualquer
  // outro prédio recebe agora (categoria do evento + população, já
  // buscados por CityPage); a categoria também alimenta o
  // reconhecimento da Greta (Sprint Gameplay Presence Phase I), sem
  // precisar de um prop separado pra isso.
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Expedition Echoes Phase I — repassado só até NpcIntro
  // (Greta, um dos exemplos do brief); TavernBuilding nunca decide nada
  // com isso.
  echoContext?: ExpeditionEchoContext;
  // Sprint Kingdom Memory Phase I — mesmo PlayerFacts já calculado por
  // CityPage (nenhum fetch novo); opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Tavern Stories (MVP) — a primeira Taverna viva do StreamRPG.
// Puro conteúdo/apresentação: nenhuma mecânica, nenhuma economia, nenhum
// combate — só os quatro blocos pedidos, cada um seu próprio catálogo
// estático (lib/tavern.ts).
export function TavernBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }: TavernBuildingProps) {
  // Sprint Reactive World Phase I — primeira visita vs visitas
  // seguintes; a segunda categoria também vira o marco `tavern_regular`,
  // uma única vez.
  const isFirstVisit = useReactiveGlow("tavern_first_visit");
  useEffect(() => {
    if (!isFirstVisit && !hasRemembered("tavern_regular_recorded")) {
      remember("tavern_regular_recorded");
      recordEvent("tavern_regular");
    }
  }, [isFirstVisit]);
  const reaction = isFirstVisit ? "O rosto ainda é novo por aqui." : "Já está virando freguês.";
  const environmentalLine = getEnvironmentalLine("taverna");
  const worldSimulationLine = getWorldSimulationLine("taverna", { worldEventCategory: worldPresenceCtx?.eventCategory });
  const landmarkIdentityLine = getLandmarkIdentityLine("taverna");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (canecas ainda úmidas), objeto diferente da
  // cadeira vazia já usada por Environmental Storytelling pro mesmo
  // lugar.
  const cityAmbientLine = getCityAmbientLine("taverna");
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("taverna", buildMicroEventContext(worldPresenceCtx));
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Taverna + World
  // Presence), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("taverna", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  // Sprint Kingdom Memory Phase I — "Depois de muitos Bosses" (exemplo
  // quase literal do brief): nunca afirma que foi o jogador, sempre
  // tom coletivo/indireto. Reage a PlayerFacts (bossesDefeated), nunca
  // a current_event — eixo oposto de World Presence/World Simulation
  // acima.
  const insightCtxForMemory = buildCollectionInsightContext();
  const kingdomMemoryLine = playerFacts
    ? getKingdomMemoryLine(
        "taverna",
        { facts: playerFacts, booksRead: insightCtxForMemory.booksRead, creaturesViewed: insightCtxForMemory.creaturesViewed },
        echoContext.approach,
      )
    : null;

  // Sprint Kingdom Evolution Phase I — evolução estrutural do Reino,
  // reage a totalMinutes (PlayerFacts), nenhum dado novo.
  const kingdomEvolutionLine = playerFacts
    ? getKingdomEvolutionLine("taverna", buildKingdomEvolutionContext(playerFacts, undefined, worldPresenceCtx))
    : null;
  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, reage a totalMinutes), preparada pra sprites
  // futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = playerFacts
    ? getBuildingStageClass("taverna", buildBuildingProgressionContext(playerFacts))
    : null;
  const buildingStage = playerFacts ? getBuildingStage("taverna", buildBuildingProgressionContext(playerFacts)) : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // totalMinutes), preparado pra sprites/efeitos futuros; nenhum texto
  // novo.
  const reactiveClass = playerFacts ? getReactiveClass("taverna", buildReactiveWorldContext(playerFacts)) : null;
  // Sprint World Visual States Phase I — traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum (4 estados); nenhum dado novo.
  const worldVisualClass = playerFacts
    ? getWorldVisualClass("building", buildWorldVisualContext({ buildingReactiveState: getReactiveState("taverna", buildReactiveWorldContext(playerFacts)) }))
    : null;

  return (
    <section className={`city-building-screen city-building-taverna${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`}>
      <h2>🍺 Taverna</h2>
      {buildingStage ? <p className="building-decor">{TAVERN_DECOR[buildingStage]}</p> : null}
      <NpcIntro npc={NPCS.taverneira} worldEventCategory={worldPresenceCtx?.eventCategory} echoContext={echoContext} />
      <GuideBubble flag="tavern_seen" message="Rumores daqui nunca são confirmados — mas quase todos apontam pra algo real." />
      <p className="hint">Onde o Reino descansa, conversa e inventa histórias.</p>

      <div className="tavern-grid">
        <TavernRumor />
        <AdventurerTable />
        <WallNotes />
        <NightSongs />
      </div>

      {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — 8 linhas
          ambientes; movidas pra depois do conteúdo interativo (Rumor/
          Mesa/Recados/Canções). Nenhuma removida, nenhum dado/lógica
          alterado — só reordenado. */}
      <p className="hint">{reaction}</p>
      <WorldPresenceLine building="taverna" ctx={worldPresenceCtx} />
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      {kingdomMemoryLine ? <p className="hint">{kingdomMemoryLine}</p> : null}
      {kingdomEvolutionLine ? <p className="hint">{kingdomEvolutionLine}</p> : null}
    </section>
  );
}
