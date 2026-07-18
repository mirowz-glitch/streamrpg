import { useEffect, useMemo, useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { MUSEUM_ENTRIES } from "../../lib/museum";
import { MuseumShelf } from "../museum/MuseumShelf";
import { MuseumReader } from "../museum/MuseumReader";
import { CodexLayout } from "../codex/CodexLayout";
import { pickOfTheDay } from "../../lib/dailyRotation";
import { useReactiveGlow } from "../../hooks/useReactiveGlow";
import { hasRemembered, remember } from "../../lib/playerMemory";
import { recordEvent } from "../../lib/personalTimeline";
import { buildCollectionInsightContext, getMuseumInsight } from "../../lib/collectionInsights";
import { getHeroJourneyPlaceLine } from "../../lib/npcDialogue";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { feedbackClassName } from "../../lib/uiFeedback";
import { EMPTY_ECHO_CONTEXT, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { getKingdomMemoryLine } from "../../lib/kingdomMemory";
import type { PlayerFacts } from "../../lib/playerFacts";
import { getMuseumDiscoveryCandidates } from "../../lib/discoveryChains";
import { getMuseumBookThreadCandidates } from "../../lib/knowledgeThreads";
import { getNextSteps } from "../../lib/knowledgeNetwork";
import { MUSEUM_HIGHLIGHT_PRIORITY, getSingleHighlight } from "../../lib/liveReadiness";
import { getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";
import { buildKingdomEvolutionContext, getKingdomEvolutionLine } from "../../lib/kingdomEvolution";
import { buildBuildingProgressionContext, getBuildingStage, getBuildingStageClass, type BuildingStage } from "../../lib/buildingProgression";
import { buildReactiveWorldContext, getReactiveClass, getReactiveState } from "../../lib/reactiveWorld";
import { buildWorldVisualContext, getWorldVisualClass } from "../../lib/worldVisualState";

// Sprint Building Visual State Phase I — decoração puramente visual por
// estágio (sem texto/narrativa); estágio nunca decidido aqui.
const MUSEUM_DECOR: Record<BuildingStage, string> = {
  "stage-1": "🏺",
  "stage-2": "🏺🏺",
  "stage-3": "🏛️",
  "stage-4": "🏛️ 🖼️",
};
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";

interface MuseumBuildingProps {
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Expedition Discovery Phase IV (Knowledge Rewards) —
  // repassado só até MuseumReader; MuseumBuilding nunca decide nada
  // com isso.
  echoContext?: ExpeditionEchoContext;
  // Sprint Kingdom Memory Phase I — mesmo PlayerFacts já calculado por
  // CityPage (nenhum fetch novo); opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Kingdom Museum — infraestrutura do Museu do Reino, dentro da
// Cidade, reutilizando a mesma arquitetura da Biblioteca/Bestiário.
// Catálogo estático (`MUSEUM_ENTRIES`), nenhuma leitura/escrita no
// backend. Curador Alaric apresenta o lugar; o catálogo de registros
// aparece abaixo.
export function MuseumBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }: MuseumBuildingProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const selectedEntry = MUSEUM_ENTRIES.find((entry) => entry.id === selectedEntryId) ?? null;

  // Sprint Retention 01 (Coleções precisam parecer coleções) — mesma
  // filosofia já usada em IdentityPanel.tsx ("Títulos desbloqueados
  // (X/Y)"): contagem simples de desbloqueados sobre o total, nunca
  // porcentagem, nenhum dado novo (`locked` já existe em MuseumEntry).
  const unlockedEntriesCount = MUSEUM_ENTRIES.filter((e) => !e.locked).length;

  // Sprint Living World (Phase I) — "Peça em destaque": só entre os
  // registros desbloqueados, determinístico por dia.
  const entryOfTheDay = useMemo(() => {
    const unlocked = MUSEUM_ENTRIES.filter((e) => !e.locked);
    return unlocked.length > 0 ? pickOfTheDay(unlocked) : null;
  }, []);

  // Sprint Reactive World Phase I — primeira visita vs visitas
  // seguintes; a segunda categoria também vira o marco `museum_return`,
  // uma única vez.
  const isFirstVisit = useReactiveGlow("museum_first_visit");
  useEffect(() => {
    if (!isFirstVisit && !hasRemembered("museum_return_recorded")) {
      remember("museum_return_recorded");
      recordEvent("museum_return");
    }
  }, [isFirstVisit]);
  const reaction = isFirstVisit ? "O passado costuma receber poucos visitantes." : "Vejo que voltou.";

  // Sprint Collections & Discovery Phase I — primeira observação de
  // coleção do Museu (antes só tinha o total estático "X/Y catalogados",
  // igual pra todo jogador); alimentada pelo novo `museum_entry_viewed`
  // que MuseumReader.tsx passou a registrar.
  const insightCtx = buildCollectionInsightContext();
  const collectionInsight = getMuseumInsight(insightCtx);

  // Sprint Hero Journey Phase I — lembrança ligada ao LUGAR (não a um
  // NPC), mesmo padrão de WorldPresenceLine/Collection Insight;
  // reaproveita o mesmo museumEntriesViewed acima, nenhum dado novo.
  const placeMemory = getHeroJourneyPlaceLine("museu", { totalMinutes: 0, museumEntriesViewed: insightCtx.museumEntriesViewed });
  useEffect(() => {
    if (!placeMemory) return;
    remember(placeMemory.memoryKey);
  }, [placeMemory]);

  // Sprint Environmental Storytelling Phase I — detalhe físico do
  // lugar, sem relação com o jogador.
  const environmentalLine = getEnvironmentalLine("museu");
  const worldSimulationLine = getWorldSimulationLine("museu");
  const landmarkIdentityLine = getLandmarkIdentityLine("museu");
  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (peça coberta pra restauração), sem sinal
  // reativo aqui (nenhum evento real determina qual peça está em
  // restauração).
  const cityAmbientLine = getCityAmbientLine("museu");
  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("museu");
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Museu + Expedição/
  // Discovery), nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("museu", buildWorldCohesionContext(worldPresenceCtx, echoContext));

  // Sprint Kingdom Memory Phase I — "Depois de muito estudo" (exemplo
  // quase literal do brief): a memória do Museu reage a `booksRead`
  // (estudo na Biblioteca), não a museumEntriesViewed — cruzamento
  // deliberado do próprio brief, evita repetir o sinal que Collection
  // Insight já usa neste mesmo prédio. Nunca afirma que foi o jogador.
  const kingdomMemoryLine = playerFacts
    ? getKingdomMemoryLine(
        "museu",
        { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
        echoContext.approach,
      )
    : null;

  // Sprint Kingdom Evolution Phase I — evolução estrutural do Reino,
  // reage a museumEntriesViewed (Collection Insights), nenhum dado novo.
  const kingdomEvolutionLine = playerFacts
    ? getKingdomEvolutionLine("museu", buildKingdomEvolutionContext(playerFacts, insightCtx, worldPresenceCtx))
    : null;

  // Sprint Building Progression Phase I — evolução visual estrutural
  // (4 estágios fixos, reage a museumEntriesViewed), preparada pra
  // sprites futuras; nenhum texto/hint, só uma classe CSS.
  const buildingStageClass = playerFacts
    ? getBuildingStageClass("museu", buildBuildingProgressionContext(playerFacts, insightCtx))
    : null;
  const buildingStage = playerFacts
    ? getBuildingStage("museu", buildBuildingProgressionContext(playerFacts, insightCtx))
    : null;
  // Sprint Kingdom Reactive World Phase I — estado visual leve (reage a
  // museumEntriesViewed), preparado pra sprites/efeitos futuros; nenhum
  // texto novo.
  const reactiveClass = playerFacts
    ? getReactiveClass("museu", buildReactiveWorldContext(playerFacts, insightCtx))
    : null;
  // Sprint World Visual States Phase I — traduz o mesmo ReactiveState
  // acima pro vocabulário visual comum (4 estados); nenhum dado novo.
  const worldVisualClass = playerFacts
    ? getWorldVisualClass(
        "building",
        buildWorldVisualContext({ buildingReactiveState: getReactiveState("museu", buildReactiveWorldContext(playerFacts, insightCtx)) }),
      )
    : null;

  // Sprint Live Readiness Phase I (First 5 Minutes) — antes um OR entre
  // 2 sinais tratados como um só, aplicado à seção inteira (nunca
  // decidia QUAL dos dois era o motivo real). Dívida eliminada: mesmo
  // comportamento do Bestiário (brief) — nextSteps (Discovery Chain +
  // Knowledge Thread já combinados por getNextSteps, sem Creature
  // Ecology/Expedition Echo, que não existem pra Museu) e Collection
  // Insight disputam via a camada central; nunca os dois ao mesmo
  // tempo. `placeMemory` (Hero Journey) continua fora desta arbitragem
  // — não é um dos candidatos nomeados pelo brief pra esta tela, segue
  // exibido como sempre, sem destaque.
  const hasNextSteps = selectedEntry
    ? getNextSteps([getMuseumDiscoveryCandidates(selectedEntry.id), getMuseumBookThreadCandidates(selectedEntry)], echoContext.approach)
        .length > 0
    : false;
  const museumHighlightKey = getSingleHighlight(MUSEUM_HIGHLIGHT_PRIORITY, {
    nextSteps: hasNextSteps,
    collectionInsight: collectionInsight !== null,
  });
  const museumFeedbackCls = feedbackClassName("softGlow");
  const readerFeedbackState = museumHighlightKey === "nextSteps" ? "softGlow" : null;

  return (
    <section className={`city-building-screen city-building-museu${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`}>
      <h2>🖼️ Museu do Reino</h2>
      {buildingStage ? <p className="building-decor">{MUSEUM_DECOR[buildingStage]}</p> : null}
      <NpcIntro npc={NPCS.curador} />
      <p className="hint">Onde a história da comunidade fica registrada — parte dela, ao menos.</p>
      <h3 className="identity-subtitle">
        Registros catalogados ({unlockedEntriesCount}/{MUSEUM_ENTRIES.length})
      </h3>
      {entryOfTheDay ? (
        <p className="hint city-of-the-day">
          <span>🖼️ Peça em destaque:</span> {entryOfTheDay.title}
        </p>
      ) : null}

      <CodexLayout
        sidebar={
          <MuseumShelf entries={MUSEUM_ENTRIES} selectedEntryId={selectedEntryId} onSelectEntry={setSelectedEntryId} />
        }
        reader={
          <MuseumReader
            key={selectedEntry?.id ?? "empty"}
            entry={selectedEntry}
            echoContext={echoContext}
            feedbackState={readerFeedbackState}
          />
        }
      />

      {/* Sprint Live Readiness Phase III (Polish & Bug Hunt) — 9 linhas
          ambientes; movidas pra depois da estante/leitor interativo.
          Nenhuma removida, nenhum dado/lógica alterado — só reordenado. */}
      <p className="hint">{reaction}</p>
      {collectionInsight ? (
        <p className={`hint${museumHighlightKey === "collectionInsight" ? ` ${museumFeedbackCls}` : ""}`}>{collectionInsight}</p>
      ) : null}
      {placeMemory ? <p className="hint">{placeMemory.line}</p> : null}
      <WorldPresenceLine building="museu" ctx={worldPresenceCtx} />
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
