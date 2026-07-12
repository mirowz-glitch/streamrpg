import { useMemo, useState } from "react";
import type { BookCategory as BookCategorySlug, BookDefinition } from "../../lib/library";
import { BOOK_CATEGORIES } from "../../lib/library";
import { filterKnowledge, KnowledgeStatus, searchKnowledge, type KnowledgeEntry } from "../../lib/knowledge";
import { CodexSidebar } from "../codex/CodexSidebar";
import { CodexToolbar } from "../codex/CodexToolbar";
import { CodexCategoryList } from "../codex/CodexCategoryList";
import { CodexCard } from "../codex/CodexCard";
import { resolveFeedback } from "../../lib/uiFeedback";

const STATUS_LABEL: Record<BookDefinition["status"], string> = {
  bloqueado: "🔒 Bloqueado",
  conhecido: "📘 Conhecido",
  lido: "✅ Lido",
};

const KNOWLEDGE_STATUS: Record<BookDefinition["status"], KnowledgeStatus> = {
  bloqueado: KnowledgeStatus.Locked,
  conhecido: KnowledgeStatus.Discovered,
  lido: KnowledgeStatus.Read,
};

interface BookShelfProps {
  books: BookDefinition[];
  selectedBookId: string | null;
  onSelectBook: (id: string) => void;
  // Sprint Reactive UI (World Feedback Phase I) — opcional/default
  // nulo: o "Recomendado do dia" já existia como texto (LibraryBuilding);
  // aqui o mesmo id só decide um destaque discreto no card real da
  // estante, nunca um dado novo.
  highlightedBookId?: string | null;
}

// Sprint Knowledge System — painel esquerdo do códice, agora sem lógica
// de busca/filtro própria: cada livro vira uma `KnowledgeEntry` e
// `searchKnowledge`/`filterKnowledge` fazem o resto. A Biblioteca nunca
// excluiu livros bloqueados da busca — por isso `searchText` é sempre o
// título real (nunca `""`), preservando o comportamento original sem
// precisar de um parâmetro especial.
export function BookShelf({ books, selectedBookId, onSelectBook, highlightedBookId = null }: BookShelfProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BookCategorySlug | null>(null);

  const filtered = useMemo(() => {
    const entries: KnowledgeEntry<BookCategorySlug>[] = books.map((book) => ({
      id: book.id,
      source: "biblioteca",
      title: book.title,
      category: book.category,
      status: KNOWLEDGE_STATUS[book.status],
      searchText: book.title,
    }));

    const matched = filterKnowledge(searchKnowledge(entries, query), [{ select: (e) => e.category, value: category }]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return books.filter((book) => matchedIds.has(book.id));
  }, [books, query, category]);

  return (
    <CodexSidebar
      toolbar={
        <CodexToolbar searchValue={query} onSearchChange={setQuery} searchPlaceholder="Pesquisar pelo título...">
          <CodexCategoryList categories={BOOK_CATEGORIES} selected={category} onSelect={setCategory} />
        </CodexToolbar>
      }
      isEmpty={filtered.length === 0}
      emptyMessage="Nenhum livro encontrado."
    >
      {filtered.map((book) => {
        const bookCategory = BOOK_CATEGORIES.find((c) => c.slug === book.category);
        return (
          <CodexCard
            key={book.id}
            icon={bookCategory?.icon ?? "📖"}
            title={book.title}
            meta={book.author}
            statusLabel={STATUS_LABEL[book.status]}
            locked={book.locked}
            selected={book.id === selectedBookId}
            onSelect={() => onSelectBook(book.id)}
            feedbackState={resolveFeedback(book.id === highlightedBookId, "highlight")}
          />
        );
      })}
    </CodexSidebar>
  );
}
