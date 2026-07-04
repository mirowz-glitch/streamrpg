interface CodexSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Sprint Codex Framework — campo de busca genérico. Mesma
// `.book-search-input` de sempre, usada tal como já era por Biblioteca/
// Bestiário/Museu.
export function CodexSearch({ value, onChange, placeholder }: CodexSearchProps) {
  return (
    <input
      type="search"
      className="book-search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
