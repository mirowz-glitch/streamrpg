// Sprint Codex Framework — selo de status ("🔒 Bloqueado" / "📘 Conhecido"
// / "✅ Lido" na Biblioteca, e equivalentes no Bestiário/Museu). Mesma
// classe `.book-card-status` de sempre (Bestiário usa `.creature-card-status`,
// que tem estilo próprio — ver CodexCard) — cada sistema já monta o texto
// completo (ícone + label) antes de passar para cá.
export function CodexStatusBadge({ label, className = "book-card-status" }: { label: string; className?: string }) {
  return <span className={className}>{label}</span>;
}
