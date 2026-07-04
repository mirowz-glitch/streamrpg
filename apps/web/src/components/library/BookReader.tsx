import type { BookDefinition } from "../../lib/library";
import { CodexReader } from "../codex/CodexReader";

interface BookReaderProps {
  book: BookDefinition | null;
}

// Sprint Codex Framework — painel direito do códice, agora sobre o
// CodexReader genérico. A Biblioteca é a única das três que mostra o
// título/autor reais mesmo com o livro bloqueado — por isso
// `lockedTitle`/`lockedSubtitle` usam os dados reais do livro, ao
// contrário de Bestiário/Museu.
export function BookReader({ book }: BookReaderProps) {
  return (
    <CodexReader
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
      pages={book?.pages ?? []}
    />
  );
}
