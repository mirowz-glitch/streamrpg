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

function attributeLine(item: EquippedItem): string {
  const attrs = getCombatAttributes(item.rarity, item.slot, item.damage_type);
  if (item.slot === "weapon") {
    const isMagic = attrs.attackMagic > attrs.attackPhysical;
    return `ATQ ${isMagic ? "Mágico" : "Físico"} +${isMagic ? attrs.attackMagic : attrs.attackPhysical}`;
  }
  const isMagic = attrs.resistanceMagic > attrs.resistancePhysical;
  const resist = isMagic ? attrs.resistanceMagic : attrs.resistancePhysical;
  const parts = [`Resistência ${isMagic ? "Mágica" : "Física"} +${resist}`];
  if (item.uti_bonus > 0) parts.push(`UTI +${item.uti_bonus}`);
  return parts.join(" · ");
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
          <div key={slot} className={`equipment-slot${item ? " equipment-slot-filled" : ""}`}>
            <span className="equipment-slot-label">{SLOT_LABEL[slot]}</span>
            {item ? (
              <>
                <span className="equipment-slot-item" style={{ color: RARITY_COLOR[item.rarity] }}>
                  {item.name}
                </span>
                <span className="equipment-slot-meta">
                  {RARITY_LABEL[item.rarity]} · {attributeLine(item)}
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
