import type { ReactNode } from "react";
import { CodexSearch } from "./CodexSearch";

interface CodexToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  children?: ReactNode;
}

// Sprint Codex Framework — busca + filtro(s), na mesma ordem/estrutura
// que os três sistemas já usavam (nenhum `<div>` extra: busca e filtros
// eram sempre filhos diretos de `.book-shelf`).
export function CodexToolbar({ searchValue, onSearchChange, searchPlaceholder, children }: CodexToolbarProps) {
  return (
    <>
      <CodexSearch value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
      {children}
    </>
  );
}
