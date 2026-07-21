import { memo } from "react";
import type { EquippedItem, ItemSlot } from "@streamrpg/shared";
import { getCombatAttributes } from "@streamrpg/shared";
import { RARITY_COLOR, RARITY_LABEL } from "../../lib/rarity";

const SLOT_ORDER: ItemSlot[] = ["weapon", "armor", "helmet", "boots", "amulet", "ring"];

const SLOT_LABEL: Record<ItemSlot, string> = {
  weapon: "Arma",
  armor: "Armadura",
  helmet: "Elmo",
  boots: "Botas",
  amulet: "Amuleto",
  ring: "Anel",
};

interface AttributeChip {
  icon: string;
  value: number;
}

// Sprint Character Page — UX Polish Phase I — mesmo cálculo/dado de
// sempre (getCombatAttributes, isMagic, uti_bonus > 0); só passa a
// devolver ícone+valor em vez de um texto verboso ("ATQ Físico +18" →
// "⚔ +18"), pra reduzir ruído técnico na tela. Nenhuma lógica nova.
function attributeChips(item: EquippedItem): AttributeChip[] {
  const attrs = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  if (item.slot === "weapon") {
    const isMagic = attrs.attackMagic > attrs.attackPhysical;
    return [{ icon: "⚔", value: isMagic ? attrs.attackMagic : attrs.attackPhysical }];
  }
  const isMagic = attrs.resistanceMagic > attrs.resistancePhysical;
  const resist = isMagic ? attrs.resistanceMagic : attrs.resistancePhysical;
  const chips: AttributeChip[] = [{ icon: "🛡", value: resist }];
  if (item.uti_bonus > 0) chips.push({ icon: "✨", value: item.uti_bonus });
  return chips;
}

// Sprint Identity & Progression — todo slot sempre visível, mesmo vazio
// ("Não equipado"). Antes, CharacterPage só listava os slots que tinham
// algo equipado; um jogador com 2 dos 6 slots vazios não tinha como saber
// que aqueles slots existiam.
//
// Sprint Performance Optimization — memo evita recalcular os 6 slots
// (inclui getCombatAttributes por item equipado) toda vez que o Perfil
// re-renderiza por um motivo sem relação ao equipamento.
export const EquipmentSlots = memo(function EquipmentSlots({ equipped }: { equipped: EquippedItem[] }) {
  return (
    <div className="equipment-grid">
      {SLOT_ORDER.map((slot) => {
        const item = equipped.find((e) => e.slot === slot);
        return (
          <div
            key={slot}
            className={`equipment-slot${item ? " equipment-slot-filled equipment-slot-rarity" : ""}`}
            style={item ? { borderLeftColor: RARITY_COLOR[item.rarity] } : undefined}
          >
            <span className="equipment-slot-label">{SLOT_LABEL[slot]}</span>
            {/* Sprint Character Page — Adventure Goals Phase I — sem
                descrição de item aqui de propósito: EquippedItem (shared
                types) não tem campo `description` (só InventoryItem tem,
                usado na tela de Inventário, fora do escopo). Reforçamos
                a raridade com a borda esquerda colorida em vez de
                inventar um texto que não existe. */}
            {item ? (
              <>
                <span className="equipment-slot-item" style={{ color: RARITY_COLOR[item.rarity] }}>
                  {item.name}
                </span>
                <span className="equipment-slot-meta">
                  <span className="equipment-rarity" style={{ color: RARITY_COLOR[item.rarity] }}>
                    {RARITY_LABEL[item.rarity]}
                  </span>
                  {attributeChips(item).map((chip, i) => (
                    <span key={i} className="equipment-attr-chip">
                      {chip.icon} +{chip.value}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              <span className="equipment-slot-empty">Não equipado</span>
            )}
          </div>
        );
      })}
    </div>
  );
});
