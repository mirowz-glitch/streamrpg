import { useEffect } from "react";
import type { MuseumEntry } from "../../lib/museum";
import { MUSEUM_CATEGORIES } from "../../lib/museum";
import { recordEvent } from "../../lib/personalTimeline";
import { getMuseumDiscoveryCandidates } from "../../lib/discoveryChains";
import { getMuseumBookThreadCandidates } from "../../lib/knowledgeThreads";
import { getNextSteps } from "../../lib/knowledgeNetwork";
import { EMPTY_ECHO_CONTEXT, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { CodexReader } from "../codex/CodexReader";
import type { UiFeedbackState } from "../../lib/uiFeedback";

interface MuseumReaderProps {
  entry: MuseumEntry | null;
  // Sprint Expedition Discovery Phase IV (Knowledge Rewards) —
  // opcional/default vazio: toda chamada existente sem o prop continua
  // com o comportamento de sempre.
  echoContext?: ExpeditionEchoContext;
  // Sprint Live Readiness Phase I (First 5 Minutes) — já decidida por
  // MuseumBuilding (lib/liveReadiness.ts); MuseumReader nunca decide
  // sozinho, só repassa pro CodexReader.
  feedbackState?: UiFeedbackState | null;
}

// Sprint Codex Framework — painel direito, agora sobre o CodexReader
// genérico. Mesma divergência de Bestiário: título genérico e nenhum
// subtítulo quando bloqueado.
export function MuseumReader({ entry, echoContext = EMPTY_ECHO_CONTEXT, feedbackState = null }: MuseumReaderProps) {
  const category = entry ? MUSEUM_CATEGORIES.find((c) => c.slug === entry.category) : undefined;

  // Sprint Collections & Discovery Phase I — mesmo padrão já usado por
  // BookReader/CreatureReader (Sprint Reactive World Phase I): cada
  // registro efetivamente aberto vira um marco no Personal Timeline,
  // agora também consumido pela Collection Insights central
  // (lib/collectionInsights.ts). Faltava só pro Museu — Biblioteca e
  // Bestiário já tinham esse ponto de escrita.
  useEffect(() => {
    if (!entry || entry.locked) return;
    recordEvent("museum_entry_viewed", { entryId: entry.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry]);

  // Sprint Discovery Chains Phase I — reaproveita getMonumentRelatedEvents
  // (lib/knowledgeLinks.ts, pronta desde Discovery Graph Phase I); só
  // acende pra Monumentos com um acontecimento histórico real ligado
  // ("o que isto menciona").
  //
  // Sprint Knowledge Threads Phase I — livros reais da mesma categoria
  // ("misterios", único valor real compartilhado entre MuseumCategory
  // e BookCategory) — "o que é parecido com isto".
  //
  // Sprint Knowledge Network Phase I — as duas fontes acima eram
  // renderizadas como DUAS linhas separadas — dívida eliminada:
  // `getNextSteps` combina, remove repetições e decide quantos
  // revelar (pickKnowledge, cap 1/3 por Approach) — uma única linha
  // "Próximo Passo".
  const nextSteps = entry
    ? getNextSteps([getMuseumDiscoveryCandidates(entry.id), getMuseumBookThreadCandidates(entry)], echoContext.approach)
    : [];

  return (
    <CodexReader
      feedbackState={feedbackState}
      isEmpty={!entry}
      emptyMessage="Escolha um registro na estante ao lado."
      locked={entry?.locked ?? false}
      lockedTitle="Registro desconhecido"
      lockedMessage="🔒 Este registro ainda está bloqueado."
      unlockCondition={entry?.unlockCondition ?? ""}
      icon={entry?.icon}
      title={entry?.title ?? ""}
      subtitle={entry ? `Por ${entry.author} · ${entry.year}` : undefined}
      description={entry?.description ?? ""}
      facts={
        entry
          ? [
              { label: "Ala", value: category?.label ?? entry.category },
              { label: "Ano", value: entry.year },
              ...(nextSteps.length > 0 ? [{ label: "Próximo Passo", value: nextSteps.join(" ") }] : []),
            ]
          : []
      }
      pages={entry?.pages ?? []}
    />
  );
}
