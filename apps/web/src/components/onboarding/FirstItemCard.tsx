import { useEffect, useState } from "react";
import type { InventoryItem } from "@streamrpg/shared";
import { api } from "../../lib/api";
import { RARITY_COLOR, RARITY_LABEL } from "../../lib/rarity";
import { isFlagSet, setFlag } from "../../lib/onboarding";

// Sprint New Player Journey — apresentação especial na primeira vez que
// o jogador tem QUALQUER item (reaproveita /api/items, já existente;
// nenhuma mudança em Drop/Economy). Mostrado uma única vez — não altera
// o que o Drop concede, só celebra o que ele já concedeu.
export function FirstItemCard() {
  const [firstItem, setFirstItem] = useState<InventoryItem | null>(null);
  const [dismissed, setDismissed] = useState(() => isFlagSet("first_item_announced"));

  useEffect(() => {
    if (isFlagSet("first_item_announced")) return;
    void api
      .get<{ items: InventoryItem[] }>("/api/items")
      .then((data) => {
        if (data.items.length === 0) return;
        const earliest = [...data.items].sort((a, b) => a.id - b.id)[0];
        setFirstItem(earliest);
      })
      .catch(() => undefined);
  }, []);

  if (dismissed || !firstItem) return null;

  return (
    <div className="card first-item-card">
      <p className="landing-example-tag">Seu primeiro equipamento</p>
      <strong style={{ color: RARITY_COLOR[firstItem.rarity], fontSize: "1.2rem" }}>{firstItem.name}</strong>
      <span className="hint">{RARITY_LABEL[firstItem.rarity]}</span>
      <p className="item-desc">{firstItem.description}</p>
      <button
        type="button"
        onClick={() => {
          setFlag("first_item_announced");
          setDismissed(true);
        }}
      >
        Guardar no inventário
      </button>
    </div>
  );
}
