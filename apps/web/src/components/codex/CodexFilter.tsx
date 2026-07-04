import { memo } from "react";

export interface CodexFilterOption {
  value: string;
  label: string;
}

interface CodexFilterProps {
  allLabel: string;
  options: CodexFilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

// Sprint Codex Framework — uma linha de chips de filtro (categoria,
// tipo, periculosidade, status, ano — qualquer dimensão de uma
// dimensão só). Não renderiza o `<div>` externo — quem chama decide o
// wrapper (`.book-category-filter` para o filtro principal,
// `.creature-filter-row` para filtros secundários), exatamente como
// cada sistema já fazia antes desta Sprint.
export const CodexFilter = memo(function CodexFilter({ allLabel, options, selected, onSelect }: CodexFilterProps) {
  return (
    <>
      <button
        type="button"
        className={`book-category-chip${selected === null ? " book-category-chip-active" : ""}`}
        onClick={() => onSelect(null)}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`book-category-chip${selected === option.value ? " book-category-chip-active" : ""}`}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </>
  );
});
