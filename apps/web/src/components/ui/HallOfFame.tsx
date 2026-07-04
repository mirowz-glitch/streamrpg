import { memo } from "react";
import type { KingdomHallOfFameSlot } from "@streamrpg/shared";

interface HallOfFameProps {
  slots: KingdomHallOfFameSlot[];
}

// Sprint Performance Optimization — cargo extraído para memoizar por
// item; um slot só muda quando o ocupante muda de verdade (Kingdom
// Prestige System já garante isso via kingdom_roles).
const HallOfFameSlotItem = memo(function HallOfFameSlotItem({ slot }: { slot: KingdomHallOfFameSlot }) {
  return (
    <li className="hall-of-fame-slot">
      <span className="hall-of-fame-icon">{slot.icon}</span>
      <div className="hall-of-fame-role">
        <strong>{slot.role_name}</strong>
        {slot.holder ? (
          <span className="hall-of-fame-holder">{slot.holder.display_name}</span>
        ) : (
          <span className="hall-of-fame-empty">Ainda sem ocupante</span>
        )}
      </div>
    </li>
  );
});

// Sprint Kingdom Prestige System, Etapa 2 — sempre os 6 cargos, mesmo
// quando ninguém ocupa um deles ainda (holder null vira "Ainda sem
// ocupante", nunca some da lista — o Reino já tem 6 posições esperando).
export function HallOfFame({ slots }: HallOfFameProps) {
  return (
    <ul className="hall-of-fame-list">
      {slots.map((slot) => (
        <HallOfFameSlotItem key={slot.role} slot={slot} />
      ))}
    </ul>
  );
}
