import { useEffect } from "react";
import type { BookDefinition } from "../../lib/library";
import { getBookRelated, getBookRecommendations } from "../../lib/knowledgeLinks";
import { getBookDiscoveryCandidates } from "../../lib/discoveryChains";
import { pickKnowledge } from "../../lib/knowledgeRewards";
import { EMPTY_ECHO_CONTEXT, getBookEchoLine, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import { recordEvent } from "../../lib/personalTimeline";
import { hasRemembered, remember } from "../../lib/playerMemory";
import { CodexReader } from "../codex/CodexReader";
import type { UiFeedbackState } from "../../lib/uiFeedback";

interface BookReaderProps {
  book: BookDefinition | null;
  // Sprint Expedition Echoes Phase I — opcional/default vazio: toda
  // chamada existente sem o prop continua com o comportamento de
  // sempre.
  echoContext?: ExpeditionEchoContext;
  // Sprint Live Readiness Phase I (First 5 Minutes) — já decidida por
  // LibraryBuilding (lib/liveReadiness.ts); BookReader nunca decide
  // sozinho, só repassa pro CodexReader (mesmo padrão já usado por
  // CreatureReader).
  feedbackState?: UiFeedbackState | null;
}

// Sprint Codex Framework — painel direito do códice, agora sobre o
// CodexReader genérico. A Biblioteca é a única das três que mostra o
// título/autor reais mesmo com o livro bloqueado — por isso
// `lockedTitle`/`lockedSubtitle` usam os dados reais do livro, ao
// contrário de Bestiário/Museu.
export function BookReader({ book, echoContext = EMPTY_ECHO_CONTEXT, feedbackState = null }: BookReaderProps) {
  // Sprint Reactive World Phase I — cada livro desbloqueado
  // efetivamente aberto vira um registro no Personal Timeline (usado
  // por LibraryBuilding pra decidir a reação de "vários"/"muitos
  // livros"); o primeiro livro de todos também vira o marco
  // `first_book_read`, uma única vez.
  useEffect(() => {
    if (!book || book.locked) return;
    recordEvent("book_read", { bookId: book.id });
    if (!hasRemembered("first_book_read")) {
      remember("first_book_read");
      recordEvent("first_book_read", { bookId: book.id });
    }
  }, [book]);

  // Sprint Living Knowledge — "Relacionados": página extra ao final,
  // só quando alguma criatura do Bestiário cita este livro (via
  // `connections.bookId`). Mesmo padrão do CreatureReader.
  const related = book ? getBookRelated(book.id) : [];
  // Sprint Discovery Graph (Phase I) — "Leitura recomendada": outros
  // livros da mesma categoria, mesmo padrão de página extra.
  const recommendations = book ? getBookRecommendations(book.id) : [];
  const pages = book?.pages ?? [];
  const withRelated =
    related.length > 0
      ? [...pages, `**Relacionados**\n\n${related.map((r) => `**${r.label}:** ${r.value}`).join("\n\n")}`]
      : pages;
  const allPages =
    recommendations.length > 0
      ? [...withRelated, `**Leitura recomendada**\n\n${recommendations.map((b) => `**${b.title}** — ${b.author}`).join("\n\n")}`]
      : withRelated;

  // Sprint Discovery Chains Phase I — no máximo uma sugestão, reaproveita
  // o mesmo getBookRelated já usado em "Relacionados" acima, só
  // fraseada como sugestão em vez de lista factual.
  //
  // Sprint Expedition Discovery Phase IV (Knowledge Rewards) —
  // "Investigate" revela até 3 conexões reais quando existirem
  // (pickKnowledge); "Continue"/nenhuma escolha mantêm exatamente 1,
  // como sempre.
  const discoveryLines = book ? pickKnowledge(getBookDiscoveryCandidates(book.id), echoContext.approach) : [];

  // Sprint Expedition Echoes Phase I — reaproveita `related` (já
  // calculado acima) pra achar a "Região" real deste livro, se
  // existir; no máximo um eco, só quando a expedição atual do jogador
  // tem essa mesma região como destino.
  const bookRegionName = related.find((m) => m.label === "Região")?.value ?? null;
  const echoLine = book ? getBookEchoLine(bookRegionName, echoContext) : null;

  return (
    <CodexReader
      feedbackState={feedbackState}
      isEmpty={!book}
      emptyMessage="Escolha um livro na estante ao lado."
      locked={book?.locked ?? false}
      lockedTitle={book?.title ?? ""}
      lockedSubtitle={book?.author}
      lockedMessage="🔒 Este livro ainda está bloqueado."
      unlockCondition={book?.unlockCondition ?? ""}
      title={book?.title ?? ""}
      subtitle={book?.author}
      description={book?.description ?? ""}
      facts={
        discoveryLines.length > 0 || echoLine
          ? [
              ...(discoveryLines.length > 0 ? [{ label: "Descoberta", value: discoveryLines.join(" ") }] : []),
              ...(echoLine ? [{ label: "Eco da Expedição", value: echoLine }] : []),
            ]
          : undefined
      }
      pages={allPages}
    />
  );
}
