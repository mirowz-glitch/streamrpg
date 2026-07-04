import type { ReactNode } from "react";

type FeedbackKind = "notice" | "error" | "level-up" | "drop-alert";

interface FeedbackProps {
  kind: FeedbackKind;
  children: ReactNode;
}

// Sprint Identity & Progression — consolida o markup de feedback que
// antes se repetia em CharacterPage e InventoryPage (cada uma com seu
// próprio <p className="...">), sem criar nenhum evento novo: as classes
// (notice/error/level-up/drop-alert) já existiam em styles.css.
export function Feedback({ kind, children }: FeedbackProps) {
  return <p className={kind}>{children}</p>;
}
