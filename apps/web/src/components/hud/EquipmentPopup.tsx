import type { CombatAnimation } from "@streamrpg/shared";

interface EquipmentPopupProps {
  active: CombatAnimation[];
}

interface EquipmentPulsePayload {
  slotId: string;
  baseItemId: string;
  powerScore: number;
  previousPowerScore: number;
  delta: number;
}

const EQUIPMENT_ANIMATION_TYPES = new Set(["equipment-pulse-upgrade", "equipment-pulse-downgrade", "equipment-pulse-neutral"]);

// Combat Feel & Animation System Phase I — requisito 7/11: sem
// setTimeout próprio (era assim na Sprint anterior) — dirigido pelo
// Animation Controller centralizado. `delta` já vem pronto no payload
// da animação, calculado em handlers.ts SÓ a partir de
// `powerScore`/`previousPowerScore` do próprio ItemEquippedEvent —
// nunca uma nova consulta ao Equipment System.
export function EquipmentPopup({ active }: EquipmentPopupProps) {
  const animation = active.find((entry) => EQUIPMENT_ANIMATION_TYPES.has(entry.type));
  if (!animation) return null;

  const equip = animation.payload as unknown as EquipmentPulsePayload;
  const isPositive = equip.delta >= 0;

  return (
    <div className={`hud-equipment-popup ${isPositive ? "hud-equipment-popup-positive" : "hud-equipment-popup-negative"}`}>
      <span className="hud-equipment-popup-title">{equip.baseItemId}</span>
      <span className="hud-equipment-popup-line">Slot: {equip.slotId}</span>
      <span className="hud-equipment-popup-line">Power Score: {equip.powerScore}</span>
      <span className="hud-equipment-popup-delta">
        {isPositive ? "+" : ""}
        {equip.delta}
      </span>
    </div>
  );
}
