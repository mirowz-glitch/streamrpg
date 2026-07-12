import { useEffect, useMemo, useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { BOOKS } from "../../lib/library";
import { BookShelf } from "../library/BookShelf";
import { BookReader } from "../library/BookReader";
import { CodexLayout } from "../codex/CodexLayout";
import { pickOfTheDay } from "../../lib/dailyRotation";
import { GuideBubble } from "../onboarding/GuideBubble";
import { useReactiveGlow } from "../../hooks/useReactiveGlow";
import { buildCollectionInsightContext, getLibraryInsight } from "../../lib/collectionInsights";
import { getHeroJourneyPlaceLine } from "../../lib/npcDialogue";
import { getWorldSimulationLine } from "../../lib/worldSimulation";
import { getLandmarkIdentityLine } from "../../lib/landmarkIdentity";
import { getEnvironmentalLine } from "../../lib/environmentalStorytelling";
import { useCharacter } from "../../hooks/useCharacter";
import { remember } from "../../lib/playerMemory";
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";
import { getBookRelated } from "../../lib/knowledgeLinks";
import { EMPTY_ECHO_CONTEXT, getLibraryEchoLine, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { getCityAmbientLine } from "../../lib/cityAmbientState";
import { getKingdomMemoryLine } from "../../lib/kingdomMemory";
import type { PlayerFacts } from "../../lib/playerFacts";
import { getBookDiscoveryCandidates } from "../../lib/discoveryChains";
import { LIBRARY_HIGHLIGHT_PRIORITY, getSingleHighlight } from "../../lib/liveReadiness";
import { buildMicroEventContext, getMicroEvent } from "../../lib/microEvents";
import { buildWorldCohesionContext, getWorldCohesionLine } from "../../lib/worldCohesion";
import { feedbackClassName } from "../../lib/uiFeedback";

interface LibraryBuildingProps {
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Expedition Echoes Phase I — opcional/default vazio: repassado
  // até BookReader; LibraryBuilding só usa pra decidir a linha de eco
  // do próprio prédio (abaixo).
  echoContext?: ExpeditionEchoContext;
  // Sprint Kingdom Memory Phase I — mesmo PlayerFacts já calculado por
  // CityPage (nenhum fetch novo); opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Library System — infraestrutura da Biblioteca, dentro da
// Cidade. Catálogo estático (`BOOKS`), nenhuma leitura/escrita no
// backend. Bibliotecária Miriam apresenta o lugar; a lista de livros
// aparece logo abaixo (Etapa "Interface").
export function LibraryBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }: LibraryBuildingProps) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const selectedBook = BOOKS.find((book) => book.id === selectedBookId) ?? null;
  const { character } = useCharacter(true);

  // Sprint Retention 01 (Coleções precisam parecer coleções) — mesma
  // filosofia já usada em IdentityPanel.tsx ("Títulos desbloqueados
  // (X/Y)"): contagem simples de desbloqueados sobre o total, nunca
  // porcentagem, nenhum dado novo (`locked` já existe em BookDefinition).
  const unlockedBooksCount = BOOKS.filter((b) => !b.locked).length;

  // Sprint Living World (Phase I) — "Livro recomendado do dia": só
  // entre os desbloqueados, pra recomendação nunca cair num livro que
  // o jogador ainda não pode abrir.
  const bookOfTheDay = useMemo(() => {
    const unlocked = BOOKS.filter((b) => !b.locked);
    return unlocked.length > 0 ? pickOfTheDay(unlocked) : null;
  }, []);

  // Sprint Reactive World Phase I — pequena reação de reconhecimento:
  // primeira visita à Biblioteca, ou nível de leitura acumulada (via
  // Personal Timeline, alimentado por BookReader), nunca as duas juntas.
  const isFirstVisit = useReactiveGlow("library_first_visit");
  // Sprint Collections & Discovery Phase I — o ramo do "booksRead" antes
  // calculado aqui dentro agora vem da camada central
  // (lib/collectionInsights.ts), mesmos textos de sempre; o ramo de
  // primeira visita continua aqui (conceito diferente, não é coleção).
  const insightCtx = buildCollectionInsightContext();
  const reaction = isFirstVisit ? "Você parece curioso." : getLibraryInsight(insightCtx);

  // Sprint Hero Journey Phase I — lembrança ligada ao LUGAR (não a um
  // NPC), mesmo padrão de WorldPresenceLine/Collection Insight: só faz
  // sentido dizer "você demorou pra descobrir este lugar" exatamente na
  // visita em que ele é descoberto, combinado com muito tempo de jogo já
  // acumulado (character.total_minutes) — nunca um sinal isolado.
  const placeMemory = getHeroJourneyPlaceLine("biblioteca", {
    totalMinutes: character?.total_minutes ?? 0,
    isFirstVisitToPlace: isFirstVisit,
  });
  useEffect(() => {
    if (!placeMemory) return;
    remember(placeMemory.memoryKey);
  }, [placeMemory]);

  // Sprint Environmental Storytelling Phase I — detalhe físico do
  // lugar, sem relação com o jogador (nunca duplica placeMemory acima,
  // que fala do PROGRESSO do jogador nesta Biblioteca).
  const environmentalLine = getEnvironmentalLine("biblioteca");
  const worldSimulationLine = getWorldSimulationLine("biblioteca");
  const landmarkIdentityLine = getLandmarkIdentityLine("biblioteca");

  // Sprint Expedition Echoes Phase I — no máximo uma linha, só quando a
  // Biblioteca realmente tem algum livro conectado a essa região
  // (reaproveita getBookRelated, mesma função já usada por BookReader).
  const hasRegionRelatedBook = useMemo(
    () => echoContext.regionName !== null && BOOKS.some((b) => getBookRelated(b.id).some((m) => m.label === "Região" && m.value === echoContext.regionName)),
    [echoContext.regionName],
  );
  const libraryEchoLine = getLibraryEchoLine(hasRegionRelatedBook, echoContext);

  // Sprint Living City (Ambient Life Phase I) — vestígio físico de
  // atividade recente (cadeiras fora do lugar), sem sinal reativo aqui
  // (nenhum evento real muda cadeiras de posição) — rotação diária
  // pura não se aplica também, só 1 variante fixa por dia.
  const cityAmbientLine = getCityAmbientLine("biblioteca");

  // Sprint Living Kingdom Phase I (Micro Events) — pequena coisa
  // cotidiana acontecendo agora, sem motivo especial (nunca cita
  // jogador/NPC/World Event).
  const microEventLine = getMicroEvent("biblioteca", buildMicroEventContext(worldPresenceCtx));
  // Sprint World Cohesion Phase I (Connected World) — pequena conexão
  // natural entre dois sistemas já existentes (Biblioteca + Expedição),
  // nunca informação nova.
  const worldCohesionLine = getWorldCohesionLine("biblioteca", buildWorldCohesionContext(worldPresenceCtx, echoContext));

  // Sprint Kingdom Memory Phase I — "Depois de muitas regiões" (exemplo
  // quase literal do brief): nunca afirma que foi o jogador, sempre tom
  // coletivo/indireto. Reage a PlayerFacts (regionsDiscovered), eixo
  // oposto de World Presence/World Simulation acima.
  const kingdomMemoryLine = playerFacts
    ? getKingdomMemoryLine(
        "biblioteca",
        { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
        echoContext.approach,
      )
    : null;

  // Sprint Live Readiness Phase I (First 5 Minutes) — a tela da
  // Biblioteca inteira (prédio + livro aberto) tem 4 sinais reais
  // possíveis; nunca mais de 1 vence (lib/liveReadiness.ts). Knowledge
  // Thread não tem chave própria aqui: Livro nunca teve uma função de
  // Knowledge Threads própria (auditado desde Knowledge Network Phase
  // I), então não há um 5º candidato a inventar.
  const hasDiscoveryChain = selectedBook ? getBookDiscoveryCandidates(selectedBook.id).length > 0 : false;
  const libraryHighlightKey = getSingleHighlight(LIBRARY_HIGHLIGHT_PRIORITY, {
    bookOfTheDay: bookOfTheDay !== null,
    discoveryChain: hasDiscoveryChain,
    kingdomMemory: kingdomMemoryLine !== null,
    expeditionEcho: libraryEchoLine !== null,
  });
  const libraryFeedbackCls = feedbackClassName("softGlow");
  const readerFeedbackState = libraryHighlightKey === "discoveryChain" ? "softGlow" : null;

  return (
    <section className="city-building-screen">
      <h2>📚 Biblioteca</h2>
      <NpcIntro npc={NPCS.bibliotecaria} />
      <GuideBubble flag="library_seen" message="Cada livro daqui guarda um pedaço da história do Reino — nem tudo está confirmado." />
      <p className="hint">Um códice para cada história do Reino — algumas ainda por vir.</p>
      <h3 className="identity-subtitle">
        Livros catalogados ({unlockedBooksCount}/{BOOKS.length})
      </h3>
      {reaction ? <p className="hint">{reaction}</p> : null}
      {placeMemory ? <p className="hint">{placeMemory.line}</p> : null}
      <WorldPresenceLine building="biblioteca" ctx={worldPresenceCtx} />
      {environmentalLine ? <p className="hint">{environmentalLine}</p> : null}
      {worldSimulationLine ? <p className="hint">{worldSimulationLine}</p> : null}
      <p className="hint">{landmarkIdentityLine}</p>
      {libraryEchoLine ? (
        <p className={`hint${libraryHighlightKey === "expeditionEcho" ? ` ${libraryFeedbackCls}` : ""}`}>{libraryEchoLine}</p>
      ) : null}
      {cityAmbientLine ? <p className="hint">{cityAmbientLine}</p> : null}
      {microEventLine ? <p className="hint">{microEventLine}</p> : null}
      {worldCohesionLine ? <p className="hint">{worldCohesionLine}</p> : null}
      {kingdomMemoryLine ? (
        <p className={`hint${libraryHighlightKey === "kingdomMemory" ? ` ${libraryFeedbackCls}` : ""}`}>{kingdomMemoryLine}</p>
      ) : null}
      {bookOfTheDay ? (
        <p className={`hint city-of-the-day${libraryHighlightKey === "bookOfTheDay" ? ` ${libraryFeedbackCls}` : ""}`}>
          <span>📖 Recomendado do dia:</span> {bookOfTheDay.title} — {bookOfTheDay.author}
        </p>
      ) : null}

      <CodexLayout
        sidebar={
          <BookShelf
            books={BOOKS}
            selectedBookId={selectedBookId}
            onSelectBook={setSelectedBookId}
            highlightedBookId={bookOfTheDay?.id ?? null}
          />
        }
        reader={
          <BookReader
            key={selectedBook?.id ?? "empty"}
            book={selectedBook}
            echoContext={echoContext}
            feedbackState={readerFeedbackState}
          />
        }
      />
    </section>
  );
}
