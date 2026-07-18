import type { Entity } from "../../lib/entity";

interface LootSpriteProps {
  entity: Entity;
}

// Sprint World Simulation — Entity Migration Phase XII — Loot ganha uma
// aparência distinta por tipo (bolsa/baú/pilha de moedas/pergaminho), só
// CSS (sem PNG/SVG/canvas). Mesmo contrato de posição/opacidade que
// EntityMarker já usava pro Loot (visible/opacity/transition) — só o
// visual muda, nenhuma lógica nova (`variant` só decide a classe CSS).
// Sem animação, sem mudança de posição.
export function LootSprite({ entity }: LootSpriteProps) {
  return (
    <div
      className={`entity-marker loot-sprite loot-sprite-${entity.variant}`}
      style={{ left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }}
    />
  );
}
