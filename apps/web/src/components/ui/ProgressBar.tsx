export type ProgressBarVariant = "xp" | "boss" | "expedition" | "expedition-compact";

interface ProgressBarProps {
  percent: number;
  variant?: ProgressBarVariant;
  label?: string;
}

// Extraído de 4 barras de progresso (XP, HP do Boss, progresso de
// Expedição normal/compacta) que repetiam a mesma estrutura
// track+fill, só trocando altura/gradiente. Cada variante mantém a
// aparência exata que já tinha (ver `.progress-bar-*` em styles.css).
export function ProgressBar({ percent, variant = "xp", label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={`progress-bar progress-bar-${variant}`} aria-label={label ?? "progress"}>
      <div className="progress-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
