import type { Entity } from "../../lib/entity";

interface PlayerSpriteProps {
  entity: Entity;
}

// Sprint World Simulation Phase X — primeiro personagem "de verdade" (só
// o Player; Enemy/Loot continuam quadrado/círculo). Placeholder
// temporário ("🧍", trocável por PNG/spritesheet depois) — o que importa
// é que a arquitetura continue igual: mesma className
// (`entity-marker entity-player entity-player-{variant}`) e mesma
// posição/opacidade inline que EntityMarker já usava, então
// walking/idle/returning/combat continuam reutilizando exatamente as
// mesmas regras CSS de sempre (incl. o tremor de combate, inalterado).
// `.player-sprite` só adiciona o balanço de caminhada (novo, só do
// sprite — nunca mudou o que já existia pra Enemy/Loot).
export function PlayerSprite({ entity }: PlayerSpriteProps) {
  return (
    <div
      className={`entity-marker entity-player entity-player-${entity.variant} player-sprite`}
      style={{ left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }}
    >
      🧍
    </div>
  );
}
