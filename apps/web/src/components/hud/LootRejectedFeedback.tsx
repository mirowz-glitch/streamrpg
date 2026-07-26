import type { LootRejectedFeedback as LootRejectedFeedbackEntry } from "../../hooks/useAdventureSession";

interface LootRejectedFeedbackProps {
  entries: LootRejectedFeedbackEntry[];
}

// Player Feedback & Retention — Vertical Slice Phase I — Fase 3 (Loot
// Feedback): achado #3 do playtest anterior — itens apareciam sem
// nenhuma explicação de por que não foram equipados. Linguagem
// simples de propósito ("seu equipamento atual já é melhor"), nunca
// "Power Score X <= Y" — o número exato já aparece separado, no
// LootPopup, pra quem quiser comparar.
export function LootRejectedFeedback({ entries }: LootRejectedFeedbackProps) {
  if (entries.length === 0) return null;

  return (
    <div className="hud-loot-rejected-feedback">
      {entries.map((entry) => (
        <p key={entry.instanceId} className="hud-loot-rejected-feedback-line">
          <strong>{entry.itemName}</strong> não foi equipado — o que você já tem no slot {entry.slotLabel} ainda é melhor.
        </p>
      ))}
    </div>
  );
}
