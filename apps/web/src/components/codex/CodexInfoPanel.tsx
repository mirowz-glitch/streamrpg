interface CodexInfoPanelProps {
  message: string;
  hint?: string;
}

// Sprint Codex Framework — mensagem de bloqueio + dica opcional, mesmas
// classes `.book-reader-locked-message`/`.hint` de sempre.
export function CodexInfoPanel({ message, hint }: CodexInfoPanelProps) {
  return (
    <>
      <p className="book-reader-locked-message">{message}</p>
      {hint ? <p className="hint">{hint}</p> : null}
    </>
  );
}
