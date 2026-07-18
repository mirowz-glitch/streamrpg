import type { Entity } from "../../lib/entity";

interface EnemySpriteProps {
  entity: Entity;
}

// Sprint World Simulation — Entity Migration Phase XI — Enemy ganha uma
// forma própria por categoria (círculo/losango/hexágono/quadrado/
// estrela), só CSS (sem PNG/SVG/canvas). Mesmo contrato de
// posição/opacidade que EntityMarker já usava pro Enemy — só o visual
// muda, nenhuma lógica nova (`variant` só decide a classe CSS). Enemy
// continua totalmente parado: nenhuma animação nova aqui, o único
// tremor do mundo continua sendo o do Player em combate.
export function EnemySprite({ entity }: EnemySpriteProps) {
  return (
    <div
      className={`entity-marker enemy-sprite enemy-sprite-${entity.variant}`}
      style={{ left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }}
    />
  );
}
