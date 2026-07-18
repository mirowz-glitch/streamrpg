import type { Entity } from "../../lib/entity";

interface NpcSpriteProps {
  entity: Entity;
}

// Sprint World Simulation — Living NPCs Phase I — NPC ganha aparência
// própria por tipo (círculo/retângulo/escudo/mochila), só CSS (sem PNG/
// SVG/canvas). Mesmo contrato de posição/opacidade que EntityMarker já
// usa pras outras entidades. `variant` aqui é o TIPO do NPC (villager/
// merchant/guard/traveller) — não um animationState: NPCs nunca
// combatem/retornam, só caminham devagar (WorldSimulationPreview.tsx
// decide a posição; nenhuma lógica de jogo aqui).
export function NpcSprite({ entity }: NpcSpriteProps) {
  return (
    <div
      className={`entity-marker npc-sprite npc-sprite-${entity.variant}`}
      style={{ left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }}
    />
  );
}
