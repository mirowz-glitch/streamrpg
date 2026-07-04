import type { ReactNode } from "react";
import { CodexEmptyState } from "./CodexEmptyState";

interface CodexSidebarProps {
  toolbar: ReactNode;
  isEmpty: boolean;
  emptyMessage: string;
  children?: ReactNode;
}

// Sprint Codex Framework — painel esquerdo genérico (era BookShelf/
// CreatureCatalog/MuseumShelf). Mesma estrutura `.book-shelf` de sempre:
// toolbar (busca + filtros) e, abaixo, ou a mensagem vazia ou a lista.
export function CodexSidebar({ toolbar, isEmpty, emptyMessage, children }: CodexSidebarProps) {
  return (
    <div className="book-shelf">
      {toolbar}
      {isEmpty ? <CodexEmptyState message={emptyMessage} /> : <div className="book-shelf-list">{children}</div>}
    </div>
  );
}
