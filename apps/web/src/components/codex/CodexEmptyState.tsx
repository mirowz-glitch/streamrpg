// Sprint Codex Framework — mensagem de "nada encontrado"/"escolha um
// item", reaproveitada tanto na estante (sidebar) quanto no reader.
// Mesma classe `.hint` de sempre.
export function CodexEmptyState({ message }: { message: string }) {
  return <p className="hint">{message}</p>;
}
