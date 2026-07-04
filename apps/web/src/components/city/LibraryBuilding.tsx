import { useState } from "react";
import { NpcIntro } from "./NpcIntro";
import { NPCS } from "../../lib/npcs";
import { BOOKS } from "../../lib/library";
import { BookShelf } from "../library/BookShelf";
import { BookReader } from "../library/BookReader";
import { CodexLayout } from "../codex/CodexLayout";

// Sprint Library System — infraestrutura da Biblioteca, dentro da
// Cidade. Catálogo estático (`BOOKS`), nenhuma leitura/escrita no
// backend. Bibliotecária Miriam apresenta o lugar; a lista de livros
// aparece logo abaixo (Etapa "Interface").
export function LibraryBuilding() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const selectedBook = BOOKS.find((book) => book.id === selectedBookId) ?? null;

  return (
    <section className="city-building-screen">
      <h2>📚 Biblioteca</h2>
      <NpcIntro npc={NPCS.bibliotecaria} />
      <p className="hint">Um códice para cada história do Reino — algumas ainda por vir.</p>

      <CodexLayout
        sidebar={<BookShelf books={BOOKS} selectedBookId={selectedBookId} onSelectBook={setSelectedBookId} />}
        reader={<BookReader key={selectedBook?.id ?? "empty"} book={selectedBook} />}
      />
    </section>
  );
}
