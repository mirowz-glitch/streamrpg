import { useState } from "react";
import type { IdentityProfile } from "@streamrpg/shared";
import { isFlagSet, setFlag } from "../../lib/onboarding";

interface NewTitleModalProps {
  identity: IdentityProfile | null;
  onEquipTitle: (titleId: number) => void;
}

// Sprint New Player Journey — destaque na primeira vez que o jogador tem
// QUALQUER título desbloqueado (Sprint Founder Identity & Prestige, dado
// já real). Nunca concede um título — só celebra o que o IdentitySystem
// já concedeu.
export function NewTitleModal({ identity, onEquipTitle }: NewTitleModalProps) {
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_title_announced"));

  const unlocked = identity?.titles.filter((t) => t.unlocked) ?? [];
  if (dismissed || unlocked.length === 0) return null;

  const mostRecent = [...unlocked].sort((a, b) => (b.unlocked_at ?? "").localeCompare(a.unlocked_at ?? ""))[0];

  function dismiss() {
    setFlag("first_title_announced");
    setDismissed(true);
  }

  return (
    <div className="modal-overlay">
      <div className="card new-title-modal">
        <h2>👑 Novo Título</h2>
        <strong className="new-title-modal-name">{mostRecent.name}</strong>
        <p className="hint">{mostRecent.description}</p>
        <div className="new-title-modal-actions">
          <button
            type="button"
            onClick={() => {
              onEquipTitle(mostRecent.id);
              dismiss();
            }}
          >
            Equipar agora
          </button>
          <button type="button" className="new-title-modal-later" onClick={dismiss}>
            Mais tarde
          </button>
        </div>
      </div>
    </div>
  );
}
