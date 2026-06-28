import { useEffect, useState } from "react";
import type { InventoryItem, ItemSlot } from "@streamrpg/shared";
import { api } from "../lib/api";
import { AppNav } from "../components/ui/AppNav";

const RARITY_COLOR: Record<string, string> = {
  common: "#9aa0a6",
  uncommon: "#34a853",
  rare: "#4285f4",
  epic: "#a142f4",
  legendary: "#fbbc04",
};

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.get<{ items: InventoryItem[] }>("/api/items");
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function equip(characterItemId: number) {
    setMessage(null);
    try {
      await api.post("/api/items/equip", { character_item_id: characterItemId });
      setMessage("Item equipado!");
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha ao equipar");
    }
  }

  async function unequip(slot: ItemSlot) {
    setMessage(null);
    try {
      const data = await api.post<{ items: InventoryItem[] }>("/api/items/unequip", { slot });
      setItems(data.items);
      setMessage("Item desequipado.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Falha ao desequipar");
    }
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Inventário</h1>
        {message ? <p className="notice">{message}</p> : null}
        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <p>Nenhum item ainda. Continue assistindo — drops têm ~0,8% de chance por ping.</p>
        ) : (
          <ul className="inventory-list">
            {items.map((item) => (
              <li key={item.id} className="inventory-item">
                <div>
                  <strong style={{ color: RARITY_COLOR[item.rarity] ?? "#fff" }}>{item.name}</strong>
                  <div className="item-meta">
                    {item.rarity} · {item.slot} · nv. {item.min_level}
                    {item.is_equipped ? ` · equipado (${item.equipped_slot})` : ""}
                  </div>
                  <p className="item-desc">{item.description}</p>
                </div>
                <div className="item-actions">
                  {item.is_equipped ? (
                    <button onClick={() => void unequip(item.slot)}>Desequipar</button>
                  ) : (
                    <button onClick={() => void equip(item.id)}>Equipar</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
