import { useEffect, useRef, useState } from "react";
import type { InventoryItem, ItemSlot } from "@streamrpg/shared";
import { getItemPower, getCombatAttributes } from "@streamrpg/shared";
import { api } from "../lib/api";
import { AppNav } from "../components/ui/AppNav";
import { Feedback } from "../components/ui/Feedback";
import { RARITY_COLOR } from "../lib/rarity";

const SLOT_ORDER: ItemSlot[] = ["weapon", "armor", "helmet", "boots", "amulet", "ring"];

const SLOT_LABEL: Record<ItemSlot, string> = {
  weapon: "Arma",
  armor: "Armadura",
  helmet: "Elmo",
  boots: "Botas",
  amulet: "Amuleto",
  ring: "Anel",
};

// Sprint Equipment Experience — watermark de "visto" fica só no navegador
// (localStorage), sem nenhuma coluna/tabela nova. Mesmo padrão já sugerido
// na Player Visibility Review para o delta de Ranking.
const SEEN_WATERMARK_KEY = "streamrpg_inventory_seen_watermark";

function sumPower(rarity: InventoryItem["rarity"], slot: ItemSlot): number {
  const power = getItemPower(rarity, slot);
  return power.attack + power.defense;
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<number>>(new Set());

  // Capturado uma vez, no mount — fica estável durante toda a visita,
  // para as tags "NOVO" não sumirem sozinhas enquanto o jogador olha a
  // página. A próxima visita (novo mount) já lê o valor atualizado.
  const seenWatermarkRef = useRef<number>(Number(localStorage.getItem(SEEN_WATERMARK_KEY) ?? 0));

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.get<{ items: InventoryItem[] }>("/api/items");
      setItems(data.items);
      if (data.items.length > 0) {
        const maxId = Math.max(...data.items.map((i) => i.id));
        const stored = Number(localStorage.getItem(SEEN_WATERMARK_KEY) ?? 0);
        if (maxId > stored) {
          localStorage.setItem(SEEN_WATERMARK_KEY, String(maxId));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isNew(item: InventoryItem): boolean {
    return item.id > seenWatermarkRef.current && !acknowledgedIds.has(item.id);
  }

  function getEquippedInSlot(slot: ItemSlot): InventoryItem | null {
    return items.find((i) => i.is_equipped && i.equipped_slot === slot) ?? null;
  }

  // Etapa 2 — "⬆ Melhor disponível": qual item não-equipado, dentro do
  // mesmo slot, tem o maior poder entre TODOS os itens do slot (não só
  // "melhor que o equipado", o melhor de todos). Mesmo cálculo de poder
  // já usado (getItemPower), nenhuma fórmula nova.
  function getBestAvailableIdBySlot(): Record<string, number> {
    const bySlot: Record<string, InventoryItem[]> = {};
    for (const item of items) {
      (bySlot[item.slot] ??= []).push(item);
    }
    const best: Record<string, number> = {};
    for (const [slot, slotItems] of Object.entries(bySlot)) {
      let bestItem: InventoryItem | null = null;
      let bestPower = -1;
      for (const item of slotItems) {
        const power = sumPower(item.rarity, item.slot);
        if (power > bestPower) {
          bestPower = power;
          bestItem = item;
        }
      }
      if (bestItem && !bestItem.is_equipped) {
        best[slot] = bestItem.id;
      }
    }
    return best;
  }

  async function equip(characterItemId: number) {
    setMessage(null);
    const itemToEquip = items.find((i) => i.id === characterItemId);
    const previousEquipped = itemToEquip ? getEquippedInSlot(itemToEquip.slot) : null;
    try {
      await api.post("/api/items/equip", { character_item_id: characterItemId });
      setAcknowledgedIds((prev) => new Set(prev).add(characterItemId));
      setMessage(buildEquipFeedback(itemToEquip, previousEquipped));
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

  function renderPower(item: InventoryItem) {
    const power = getItemPower(item.rarity, item.slot);
    if (item.slot === "weapon") {
      return `ATQ ${power.attack}`;
    }
    return `DEF ${power.defense}`;
  }

  const bestAvailableBySlot = getBestAvailableIdBySlot();

  const bySlot: Partial<Record<ItemSlot, InventoryItem[]>> = {};
  for (const item of items) {
    (bySlot[item.slot] ??= []).push(item);
  }

  return (
    <main className="page">
      <AppNav />
      <div className="card">
        <h1>Inventário</h1>
        {message ? <Feedback kind="notice">{message}</Feedback> : null}
        {loading ? (
          <p className="loading-state">Carregando inventário...</p>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>Seu inventário está vazio.</p>
            <p className="hint">Continue assistindo — drops têm boa chance a cada minuto de presença.</p>
          </div>
        ) : (
          SLOT_ORDER.filter((slot) => bySlot[slot]?.length).map((slot) => (
            <div key={slot} className="inventory-group">
              <h2 className="inventory-group-title">{SLOT_LABEL[slot]}</h2>
              <ul className="inventory-list">
                {bySlot[slot]!.map((item) => {
                  const equippedInSlot = getEquippedInSlot(item.slot);
                  return (
                    <li
                      key={item.id}
                      className={`inventory-item rarity-border-${item.rarity}`}
                    >
                      <div>
                        <strong style={{ color: RARITY_COLOR[item.rarity] ?? "#fff" }}>{item.name}</strong>
                        {item.is_equipped ? <span className="badge-equipped">EQUIPADO</span> : null}
                        {isNew(item) ? <span className="badge-new">NOVO</span> : null}
                        {bestAvailableBySlot[item.slot] === item.id ? (
                          <span className="badge-best">⬆ Melhor disponível</span>
                        ) : null}
                        <div className="item-meta">
                          {item.rarity} · {item.slot} · nv. {item.min_level} · {renderPower(item)}
                          {item.damage_type === "magic" ? " · mágico" : ""}
                          {item.is_equipped ? ` · equipado (${item.equipped_slot})` : ""}
                        </div>
                        {!item.is_equipped ? (
                          <div className="item-compare">{renderComparisonDetail(item, equippedInSlot)}</div>
                        ) : null}
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
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

// Etapa 3 — comparação detalhada, nunca escondendo números. Arma: ATQ
// antes → depois, com delta. Demais slots: Resistência Física/Mágica e
// UTI, cada um com seu próprio delta.
function renderComparisonDetail(item: InventoryItem, equipped: InventoryItem | null) {
  const next = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  const prev = equipped ? getCombatAttributes(equipped.rarity, equipped.slot, equipped.damage_type) : null;

  if (item.slot === "weapon") {
    // Cada lado rotulado com o próprio tipo — uma arma física equipada
    // nunca deve aparecer rotulada como "Mágico" só porque a candidata é
    // mágica (achado real, encontrado testando no navegador).
    const tipoNovo = next.attackMagic > next.attackPhysical ? "Mágico" : "Físico";
    const tipoAntigo = prev ? (prev.attackMagic > prev.attackPhysical ? "Mágico" : "Físico") : tipoNovo;
    const novoAtq = next.attackMagic > next.attackPhysical ? next.attackMagic : next.attackPhysical;
    const antigoAtq = prev ? (prev.attackMagic > prev.attackPhysical ? prev.attackMagic : prev.attackPhysical) : 0;
    const delta = novoAtq - antigoAtq;
    const mesmoTipo = tipoAntigo === tipoNovo;
    return (
      <div className="item-comparison">
        {equipped ? (
          <>
            <div className="comparison-row">
              <span>{equipped.name}</span>
              <span>ATQ {tipoAntigo} +{antigoAtq}</span>
            </div>
            <div className="comparison-arrow">↓</div>
          </>
        ) : null}
        <div className="comparison-row">
          <span>{item.name}</span>
          <span>ATQ {tipoNovo} +{novoAtq}</span>
        </div>
        {mesmoTipo ? (
          <div className={delta >= 0 ? "comparison-delta-positive" : "comparison-delta-negative"}>
            ({delta >= 0 ? "+" : ""}
            {delta})
          </div>
        ) : equipped ? (
          <div className="comparison-delta-neutral">troca de tipo — não é o mesmo eixo de dano</div>
        ) : null}
      </div>
    );
  }

  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (equipped?.uti_bonus ?? 0);
  return (
    <div className="item-comparison">
      <div>
        {deltaFisica >= 0 ? "+" : ""}
        {deltaFisica} Resistência Física
      </div>
      <div>
        {deltaMagica >= 0 ? "+" : ""}
        {deltaMagica} Resistência Mágica
      </div>
      <div>
        {deltaUti >= 0 ? "+" : ""}
        {deltaUti} UTI
      </div>
    </div>
  );
}

// Etapa 6 — feedback imediato após equipar, com os números reais do
// ganho (nunca só "Item equipado!").
function buildEquipFeedback(item: InventoryItem | undefined, previous: InventoryItem | null): string {
  if (!item) return "Item equipado!";

  const next = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  const prev = previous ? getCombatAttributes(previous.rarity, previous.slot, previous.damage_type) : null;
  const parts = ["Equipado!"];

  if (item.slot === "weapon") {
    const tipoNovo = next.attackMagic > next.attackPhysical ? "Mágico" : "Físico";
    const tipoAntigo = prev ? (prev.attackMagic > prev.attackPhysical ? "Mágico" : "Físico") : tipoNovo;
    const novoAtq = next.attackMagic > next.attackPhysical ? next.attackMagic : next.attackPhysical;
    const antigoAtq = prev ? (prev.attackMagic > prev.attackPhysical ? prev.attackMagic : prev.attackPhysical) : 0;
    if (prev && tipoAntigo !== tipoNovo) {
      parts.push(`Tipo de dano mudou de ${tipoAntigo} para ${tipoNovo} · ATQ ${tipoNovo} ${novoAtq}`);
    } else {
      const delta = novoAtq - antigoAtq;
      parts.push(`ATQ ${tipoNovo} ${delta >= 0 ? "+" : ""}${delta}`);
    }
    return parts.join(" ");
  }

  const deltaFisica = next.resistancePhysical - (prev?.resistancePhysical ?? 0);
  const deltaMagica = next.resistanceMagic - (prev?.resistanceMagic ?? 0);
  const deltaUti = item.uti_bonus - (previous?.uti_bonus ?? 0);
  if (deltaFisica !== 0) parts.push(`Resistência Física ${deltaFisica >= 0 ? "+" : ""}${deltaFisica}`);
  if (deltaMagica !== 0) parts.push(`Resistência Mágica ${deltaMagica >= 0 ? "+" : ""}${deltaMagica}`);
  if (deltaUti !== 0) parts.push(`UTI ${deltaUti >= 0 ? "+" : ""}${deltaUti}`);
  return parts.join(" · ");
}
