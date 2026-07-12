import { useState } from "react";
import type { CodexFact } from "../../lib/codex";
import { BookPage } from "../library/BookPage";
import { CodexEmptyState } from "./CodexEmptyState";
import { CodexHeader } from "./CodexHeader";
import { CodexInfoPanel } from "./CodexInfoPanel";
import { CodexFacts } from "./CodexFacts";
import { CodexPagination } from "./CodexPagination";
import { feedbackClassName, type UiFeedbackState } from "../../lib/uiFeedback";

interface CodexReaderProps {
  isEmpty: boolean;
  emptyMessage: string;
  locked: boolean;
  lockedTitle: string;
  lockedSubtitle?: string;
  lockedMessage: string;
  unlockCondition: string;
  icon?: string;
  title: string;
  subtitle?: string;
  description: string;
  facts?: CodexFact[];
  pages: string[];
  // Sprint Reactive UI (World Feedback Phase I) — opcional/default
  // nulo: toda chamada existente sem o prop continua com o
  // comportamento de sempre. CodexReader nunca decide o estado
  // sozinho, só aplica a classe que quem chama já resolveu via
  // lib/uiFeedback.ts.
  feedbackState?: UiFeedbackState | null;
}

// Sprint Codex Framework — painel direito genérico (era BookReader/
// CreatureReader/MuseumReader). Preserva a única divergência real que
// já existia entre os três: a Biblioteca sempre mostrava o título/autor
// reais mesmo com o livro bloqueado, enquanto Bestiário/Museu mostravam
// um título genérico ("Criatura desconhecida"/"Registro desconhecido")
// sem subtítulo — por isso `lockedTitle`/`lockedSubtitle` são passados
// por quem chama, em vez de derivados aqui.
export function CodexReader({
  isEmpty,
  emptyMessage,
  locked,
  lockedTitle,
  lockedSubtitle,
  lockedMessage,
  unlockCondition,
  icon,
  title,
  subtitle,
  description,
  facts,
  pages,
  feedbackState = null,
}: CodexReaderProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const feedbackCls = feedbackClassName(feedbackState);

  if (isEmpty) {
    return (
      <div className="book-reader book-reader-empty">
        <CodexEmptyState message={emptyMessage} />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="book-reader book-reader-locked">
        <CodexHeader title={lockedTitle} subtitle={lockedSubtitle} />
        <CodexInfoPanel message={lockedMessage} hint={`Condição de desbloqueio: ${unlockCondition}`} />
      </div>
    );
  }

  const totalPages = pages.length;
  const currentPage = pages[Math.min(pageIndex, totalPages - 1)];

  return (
    <div className={`book-reader${feedbackCls ? ` ${feedbackCls}` : ""}`}>
      <CodexHeader icon={icon} title={title} subtitle={subtitle} />
      <p className="book-reader-description">{description}</p>

      {facts && facts.length > 0 ? <CodexFacts facts={facts} /> : null}

      <BookPage content={currentPage} pageNumber={pageIndex + 1} totalPages={totalPages} />

      <CodexPagination pageIndex={pageIndex} totalPages={totalPages} onChange={setPageIndex} />
    </div>
  );
}
