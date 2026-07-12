import { useMemo, useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { CREATURES } from "../../lib/bestiary";
import { CreatureCatalog } from "../bestiary/CreatureCatalog";
import { CreatureReader } from "../bestiary/CreatureReader";
import { CodexLayout } from "../codex/CodexLayout";
import { pickOfTheDay } from "../../lib/dailyRotation";
import { GuideBubble } from "../onboarding/GuideBubble";
import { buildCollectionInsightContext, getBestiaryInsight } from "../../lib/collectionInsights";
import type { WorldPresenceContext } from "../../lib/worldPresence";
import { WorldPresenceLine } from "../ui/WorldPresenceLine";
import { EMPTY_ECHO_CONTEXT, getCreatureEchoLine, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { getKingdomMemoryLine } from "../../lib/kingdomMemory";
import type { PlayerFacts } from "../../lib/playerFacts";
import { getCreatureEcologyCandidates } from "../../lib/creatureEcology";
import { getCreatureDiscoveryCandidates } from "../../lib/discoveryChains";
import { getCreatureThreadCandidates } from "../../lib/knowledgeThreads";
import { getNextSteps } from "../../lib/knowledgeNetwork";
import { getRegionName } from "../../lib/bestiary";
import { BESTIARY_HIGHLIGHT_PRIORITY, getSingleHighlight } from "../../lib/liveReadiness";
import { feedbackClassName } from "../../lib/uiFeedback";

interface BestiaryBuildingProps {
  worldPresenceCtx?: WorldPresenceContext;
  // Sprint Expedition Echoes Phase I — substitui o `expeditionApproach`
  // solto da Sprint anterior (dívida técnica eliminada nesta auditoria,
  // ver expeditionEchoes.ts). Repassado até CreatureReader e NpcIntro;
  // BestiaryBuilding nunca decide nada com isso.
  echoContext?: ExpeditionEchoContext;
  // Sprint Kingdom Memory Phase I — mesmo PlayerFacts já calculado por
  // CityPage (nenhum fetch novo); opcional/default nulo, retrocompat.
  playerFacts?: PlayerFacts | null;
}

// Sprint Bestiary System — infraestrutura do Bestiário, dentro da
// Cidade, reutilizando a mesma arquitetura da Biblioteca. Catálogo
// estático (`CREATURES`), nenhuma leitura/escrita no backend. Erudito
// Yannick apresenta o lugar; o catálogo de criaturas aparece abaixo.
export function BestiaryBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }: BestiaryBuildingProps) {
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);
  const selectedCreature = CREATURES.find((creature) => creature.id === selectedCreatureId) ?? null;

  // Sprint Retention 01 (Coleções precisam parecer coleções) — mesma
  // filosofia já usada em IdentityPanel.tsx ("Títulos desbloqueados
  // (X/Y)"): contagem simples de desbloqueadas sobre o total, nunca
  // porcentagem, nenhum dado novo (`locked` já existe em CreatureDefinition).
  const unlockedCreaturesCount = CREATURES.filter((c) => !c.locked).length;

  // Sprint Living World (Phase I) — "Criatura observada recentemente":
  // só entre as não bloqueadas, determinístico por dia.
  const creatureOfTheDay = useMemo(() => {
    const unlocked = CREATURES.filter((c) => !c.locked);
    return unlocked.length > 0 ? pickOfTheDay(unlocked) : null;
  }, []);

  // Sprint Collections & Discovery Phase I — antes calculado aqui
  // dentro; agora vem da camada central (lib/collectionInsights.ts),
  // mesma fonte (Personal Timeline) e mesmo texto de sempre.
  const insightCtx = buildCollectionInsightContext();
  const reaction = getBestiaryInsight(insightCtx);

  // Sprint Kingdom Memory Phase I — "Depois de muitas criaturas"
  // (exemplo quase literal do brief): limiar mais alto que Collection
  // Insight (creaturesViewed>=6, tom em primeira pessoa) pra
  // representar a próxima camada — nunca afirma que foi o jogador.
  const kingdomMemoryLine = playerFacts
    ? getKingdomMemoryLine(
        "bestiario",
        { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
        echoContext.approach,
      )
    : null;

  // Sprint Live Readiness Phase I (First 5 Minutes) — a tela do
  // Bestiário inteira (prédio + registro aberto) tem 4 sinais reais
  // possíveis; nunca mais de 1 vence (lib/liveReadiness.ts). "nextSteps"
  // representa Discovery Chain + Knowledge Thread já combinados (mesmo
  // getNextSteps que CreatureReader usa) — nunca recalculado com uma
  // segunda lógica, mesma função pura chamada daqui só pra saber se
  // existe, o próprio CreatureReader calcula o texto de novo pra
  // exibir.
  const hasCreatureEcology = selectedCreature ? getCreatureEcologyCandidates(selectedCreature).length > 0 : false;
  const hasNextSteps = selectedCreature
    ? getNextSteps(
        [getCreatureDiscoveryCandidates(selectedCreature), getCreatureThreadCandidates(selectedCreature)],
        echoContext.approach,
      ).length > 0
    : false;
  const hasExpeditionEcho = selectedCreature
    ? getCreatureEchoLine(getRegionName(selectedCreature.regionId), echoContext) !== null
    : false;
  const bestiaryHighlightKey = getSingleHighlight(BESTIARY_HIGHLIGHT_PRIORITY, {
    creatureEcology: hasCreatureEcology,
    nextSteps: hasNextSteps,
    expeditionEcho: hasExpeditionEcho,
    collectionInsight: reaction !== null,
  });
  const bestiaryFeedbackCls = feedbackClassName(bestiaryHighlightKey === "collectionInsight" ? "softGlow" : null);
  const readerFeedbackState =
    bestiaryHighlightKey === "creatureEcology" || bestiaryHighlightKey === "nextSteps" || bestiaryHighlightKey === "expeditionEcho"
      ? "softGlow"
      : null;

  return (
    <section className="city-building-screen">
      <h2>🔬 Bestiário</h2>
      <NpcIntro npc={NPCS.erudito} />
      <GuideBubble flag="bestiary_seen" message="Toda criatura já avistada no Reino vira um registro permanente aqui." />
      <p className="hint">Um registro de tudo que já foi visto — e do pouco que já foi entendido.</p>
      <h3 className="identity-subtitle">
        Criaturas registradas ({unlockedCreaturesCount}/{CREATURES.length})
      </h3>
      {reaction ? <p className={`hint${bestiaryFeedbackCls ? ` ${bestiaryFeedbackCls}` : ""}`}>{reaction}</p> : null}
      <WorldPresenceLine building="bestiario" ctx={worldPresenceCtx} />
      {kingdomMemoryLine ? <p className="hint">{kingdomMemoryLine}</p> : null}
      {creatureOfTheDay ? (
        <p className="hint city-of-the-day">
          <span>{creatureOfTheDay.icon} Observada recentemente:</span> {creatureOfTheDay.name}
        </p>
      ) : null}

      <CodexLayout
        sidebar={
          <CreatureCatalog
            creatures={CREATURES}
            selectedCreatureId={selectedCreatureId}
            onSelectCreature={setSelectedCreatureId}
          />
        }
        reader={
          <CreatureReader
            key={selectedCreature?.id ?? "empty"}
            creature={selectedCreature}
            echoContext={echoContext}
            feedbackState={readerFeedbackState}
          />
        }
      />
    </section>
  );
}
