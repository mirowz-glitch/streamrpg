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
  useEffect(() => {
    if (reaction && !hasRemembered("traveller_listener_recorded")) {
      remember("traveller_listener_recorded");
      recordEvent("traveller_listener");
    }
  }, [reaction]);

  return (
    <section className="city-building-screen">
      <h2>📜 Casa dos Viajantes</h2>
      <NpcIntro npc={NPCS.viajante} echoContext={echoContext} />
      <p className="hint">Histórias contadas por gente comum. Ninguém sabe se são verdade.</p>
      {reaction ? <p className="hint">{reaction}</p> : null}
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      {kingdomMemoryLine ? <p className="hint">{kingdomMemoryLine}</p> : null}

      <button type="button" className="traveller-random-btn" onClick={handleRandomStory}>
        🎲 História Aleatória
      </button>

      <CodexLayout
        sidebar={<StoryShelf stories={TRAVELLER_STORIES} selectedId={selectedId} onSelect={setSelectedId} />}
        reader={<StoryReader key={selectedStory?.id ?? "empty"} story={selectedStory} />}
      />
    </section>
  );
}
