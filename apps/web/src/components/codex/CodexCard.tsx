import { memo } from "react";
import { CodexStatusBadge } from "./CodexStatusBadge";
import { feedbackClassName, type UiFeedbackState } from "../../lib/uiFeedback";

// Sprint Codex Framework — os dois "temas" de card que já existiam:
// Biblioteca/Museu usavam `.book-card-*` (destaque roxo); Bestiário usa
// `.creature-card-*` (destaque verde, e sufixos `-name`/`-meta` em vez
// de `-title`/`-author`). Mantido como duas famílias de classes fixas
// para não alterar nenhuma cor/estilo existente.
const VARIANT_CLASSES = {
  book: {
    root: "book-card",
    selected: "book-card-selected",
    locked: "book-card-locked",
    icon: "book-card-icon",
    info: "book-card-info",
    title: "book-card-title",
    meta: "book-card-author",
    status: "book-card-status",
  },
  creature: {
    root: "creature-card",
    selected: "creature-card-selected",
    locked: "creature-card-locked",
    icon: "creature-card-icon",
    info: "creature-card-info",
    title: "creature-card-name",
    meta: "creature-card-meta",
    status: "creature-card-status",
  },
} as const;

interface CodexCardProps {
  variant?: keyof typeof VARIANT_CLASSES;
  icon: string;
  title: string;
  meta: string;
  statusLabel: string;
  locked: boolean;
  selected: boolean;
  onSelect: () => void;
  // Sprint Reactive UI (World Feedback Phase I) — opcional/default
  // nulo: toda chamada existente sem o prop continua com o
  // comportamento de sempre. CodexCard nunca decide o estado sozinho,
  // só pergunta a lib/uiFeedback.ts e aplica a classe correspondente.
  feedbackState?: UiFeedbackState | null;
}

// Sprint Codex Framework — item de estante genérico. Era BookCard/
// CreatureCard/MuseumCard, três arquivos quase idênticos (ícone + título
// + linha de meta-informação + selo de status); agora é um só. Cada
// sistema só decide o que vira `meta` (autor, "tipo · periculosidade",
// "categoria · ano") e qual `variant` de classes usar.
export const CodexCard = memo(function CodexCard({
  variant = "book",
  icon,
  title,
  meta,
  statusLabel,
  locked,
  selected,
  onSelect,
  feedbackState = null,
}: CodexCardProps) {
  const cls = VARIANT_CLASSES[variant];
  const feedbackCls = feedbackClassName(feedbackState);
  return (
    <button
      type="button"
      className={`${cls.root}${selected ? ` ${cls.selected}` : ""}${locked ? ` ${cls.locked}` : ""}${feedbackCls ? ` ${feedbackCls}` : ""}`}
      onClick={onSelect}
    >
      <span className={cls.icon}>{icon}</span>
      <span className={cls.info}>
        <strong className={cls.title}>{title}</strong>
        <span className={cls.meta}>{meta}</span>
        <CodexStatusBadge label={statusLabel} className={cls.status} />
      </span>
    </button>
  );
});
