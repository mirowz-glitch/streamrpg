interface CodexPaginationProps {
  pageIndex: number;
  totalPages: number;
  onChange: (index: number) => void;
}

// Sprint Codex Framework — navegação de página do reader, mesma
// `.book-reader-nav` de sempre (era duplicada idêntica em BookReader/
// CreatureReader/MuseumReader).
export function CodexPagination({ pageIndex, totalPages, onChange }: CodexPaginationProps) {
  return (
    <div className="book-reader-nav">
      <button type="button" onClick={() => onChange(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0}>
        ← Página anterior
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages - 1, pageIndex + 1))}
        disabled={pageIndex >= totalPages - 1}
      >
        Página seguinte →
      </button>
    </div>
  );
}
