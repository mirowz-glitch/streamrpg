import { useEffect, useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { TRAVELLER_STORIES } from "../../lib/travellerStories";
import { StoryShelf } from "../travellerHouse/StoryShelf";
import { StoryReader } from "../travellerHouse/StoryReader";
import { CodexLayout } from "../codex/CodexLayout";
import { getRecentEvents, recordEvent } from "../../lib/personalTimeline";
import { hasRemembered, remember } from "../../lib/playerMemory";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { EMPTY_ECHO_CONTEXT, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { getKingdomMemoryLine } from "../../lib/kingdomMemory";
import { buildCollectionInsightContext } from "../../lib/collectionInsights";
import type { PlayerFacts } from "../../lib/playerFacts";
import { getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";
import { buildKingdomEvolutionContext, getKingdomEvolutionLine } from "../../lib/kingdomEvolution";
import { buildBuildingProgressionContext, getBuildingStage, getBuildingStageClass, type BuildingStage } from "../../lib/buildingProgression";
import { buildReactiveWorldContext, getReactiveClass, getReactiveState } from "../../lib/reactiveWorld";
import { buildWorldVisualContext, getWorldVisualClass } from "../../lib/worldVisualState";

// Sprint Building Visual State Phase I — decoração puramente visual por
// estágio (sem texto/narrativa); estágio nunca decidido aqui.
const TRAVELLER_HOUSE_DECOR: Record<BuildingStage, string> = {
  "stage-1": "🎒",
  "stage-2": "🎒🎒",
  "stage-3": "🗺️",
  "stage-4": "🎒🎒 🗺️",
};

interface TravellerHouseBuildingProps {
  // Sprint Expedition Echoes Phase I — repassado só até NpcIntro
  // (Idris, um dos exemplos do brief); TravellerHouseBuilding nunca
  // decide nada com isso.
  echoContext?: ExpeditionEchoContext;
  // Sprint Kingdom Memory Phase I — mesmo PlayerFacts já calculado por
  // CityPage (nenhum fetch novo); opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Traveller Stories (MVP) — infraestrutura da Casa dos
// Viajantes, mesma arquitetura de Biblioteca/Bestiário/Museu/Taverna.
// Catálogo estático (`TRAVELLER_STORIES`), nenhuma leitura/escrita no
// backend. Idris apresenta o lugar; "História Aleatória" é só um atalho
// que seleciona uma entrada aleatória do mesmo catálogo — nenhum estado
// novo além do já usado para a seleção normal.
export function TravellerHouseBuilding({ echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }: TravellerHouseBuildingProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedStory = TRAVELLER_STORIES.find((story) => story.id === selectedId) ?? null;

  const handleRandomStory = () => {
    const random = TRAVELLER_STORIES[Math.floor(Math.random() * TRAVELLER_STORIES.length)];
    setSelectedId(random.id);
  };

  // Sprint Reactive World Phase I — reação de reconhecimento por volume
  // (Personal Timeline, alimentado por StoryReader); ao cruzar o limiar
  // pela primeira vez, também vira o marco `traveller_listener`, uma
  // única vez.
  const storiesRead = getRecentEvents(20).filter((e) => e.kind === "story_read").length;
  const reaction = storiesRead >= 6 ? "Você gosta de ouvir histórias." : null;
  const environmentalLine = getEnvironmentalLine("casa-dos-viajantes");
  const worldSimulationLine = getWorldSimulationLine("casa-dos-viajantes");
  const landmarkIdentityLine = getLandmarkIdentityLine("casa-dos-viajantes");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (mochilas encostadas), sem sinal reativo aqui
  // (Casa dos Viajantes nunca recebeu worldPresenceCtx).
  const cityAmbientLine = getCityAmbientLine("casa-dos-viajantes");
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("casa-dos-viajantes");
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Casa dos Viajantes +
  // Expedição), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("casa-dos-viajantes", buildWorldCohesionContext(undefined, echoContext));
  // Sprint Kingdom Memory Phase I — "Depois de longa jornada" (exemplo
  // quase literal do brief): reage a PlayerFacts (totalMinutes), nunca
  // afirma que foi o jogador.
  const insightCtx = buildCollectionInsightContext();
  const kingdomMemoryLine = playerFacts
    ? getKingdomMemoryLine(
        "casa-dos-viajantes",
        { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
        echoContext.approach,
      )
    : null;

  // Sprint Kingdom Evolution Phase I — evolução estrutural do Reino,
  // reage a creaturesViewed (Collection Insights), nenhum dado novo.
  const kingdomEvolutionLine = playerFacts
    ? getKingdomEvolutionLine("casa-dos-viajantes", buildKingdomEvolutionContext(playerFacts, insightCtx))
    : null;
  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, reage a regionsDiscovered), preparada pra
  // sprites futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = playerFacts
    ? getBuildingStageClass("casa-dos-viajantes", buildBuildingProgressionContext(playerFacts))
    : null;
  const buildingStage = playerFacts
    ? getBuildingStage("casa-dos-viajantes", buildBuildingProgressionContext(playerFacts))
    : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // regionsDiscovered), preparado pra sprites/efeitos futuros; nenhum
  // texto novo.
  const reactiveClass = playerFacts
    ? getReactiveClass("casa-dos-viajantes", buildReactiveWorldContext(playerFacts))
    : null;
  // Sprint World Visual States Phase I — traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum (4 estados); nenhum dado novo.
  const worldVisualClass = playerFacts
    ? getWorldVisualClass(
        "building",
        buildWorldVisualContext({ buildingReactiveState: getReactiveState("casa-dos-viajantes", buildReactiveWorldContext(playerFacts)) }),
      )
    : null;
  useEffect(() => {
    if (reaction && !hasRemembered("traveller_listener_recorded")) {
      remember("traveller_listener_recorded");
      recordEvent("traveller_listener");
    }
  }, [reaction]);

  return (
    <section className={`city-building-screen city-building-viajantes${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`}>
      <h2>📜 Casa dos Viajantes</h2>
      {buildingStage ? <p className="building-decor">{TRAVELLER_HOUSE_DECOR[buildingStage]}</p> : null}
      <NpcIntro npc={NPCS.viajante} echoContext={echoContext} />
      <p className="hint">Histórias contadas por gente comum. Ninguém sabe se são verdade.</p>

      <button type="button" className="traveller-random-btn" onClick={handleRandomStory}>
        🎲 História Aleatória
      </button>

      <CodexLayout
        sidebar={<StoryShelf stories={TRAVELLER_STORIES} selectedId={selectedId} onSelect={setSelectedId} />}
        reader={<StoryReader key={selectedStory?.id ?? "empty"} story={selectedStory} />}
      />

      {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — 8 linhas
          ambientes; movidas pra depois do botão/estante interativos.
          Nenhuma removida, nenhum dado/lógica alterado — só reordenado. */}
      {reaction ? <p className="hint">{reaction}</p> : null}
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
