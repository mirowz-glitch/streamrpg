interface CodexHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

// Sprint Codex Framework — cabeçalho do reader (título + subtítulo
// opcional). Mesmas classes `.book-reader-title`/`.book-reader-author`
// de sempre. `icon` é opcional porque a Biblioteca nunca colocou ícone
// no título do reader (só Bestiário/Museu fazem `{icon} {nome}`).
export function CodexHeader({ icon, title, subtitle }: CodexHeaderProps) {
  return (
    <>
      <h3 className="book-reader-title">{icon ? `${icon} ${title}` : title}</h3>
      {subtitle ? <span className="book-reader-author">{subtitle}</span> : null}
    </>
  );
}
