import type { ReactNode } from "react";
import type { Entity } from "../../lib/entity";
import { PlayerSprite } from "./PlayerSprite";
import { EnemySprite } from "./EnemySprite";
import { LootSprite } from "./LootSprite";
import { NpcSprite } from "./NpcSprite";

interface EntityMarkerProps {
  entity: Entity;
  // Conteúdo textual opcional (ex.: "●", ainda usado pelo renderer
  // genérico abaixo) — só existe enquanto não houver sprite; o dia em
  // que `kind`/`variant` renderizarem uma imagem em vez de uma forma
  // CSS, este componente muda sozinho, nenhum call-site precisa saber
  // disso. Sprint World Simulation Phase X — primeiro exemplo disso:
  // `kind === "player"` já ignora `children`, delegado pro
  // PlayerSprite. Phase XI — mesma coisa pra `kind === "enemy"`. Phase
  // XII — mesma coisa pra `kind === "loot"`. Living NPCs Phase I —
  // mesma coisa pra `kind === "npc"`.
  children?: ReactNode;
}

// Sprint World Entities (Base Reutilizável) — único ponto de renderização
// visual pra qualquer entidade do mundo (jogador/inimigo/NPC/loot).
// Recebe só posição/variante/visibilidade já decididas por quem chama
// (nenhuma lógica de jogo aqui); hoje é uma forma CSS genérica
// (`entity-{kind}`/`entity-{kind}-{variant}` decidem a aparência via
// styles.css), no futuro pode virar `<img src={sprite}>` sem que nada
// fora deste arquivo precise mudar.
//
// Sprint World Simulation Phase X — EntityMarker continua sendo o único
// ponto de decisão de QUAL renderer usar; Player ganha o próprio
// (PlayerSprite), Enemy/Loot/futuras entidades continuam exatamente no
// `<div>` genérico abaixo, sem nenhuma mudança de comportamento.
//
// Sprint World Simulation — Entity Migration Phase XI — Enemy ganha o
// próprio renderer (EnemySprite); Loot/futuras entidades continuam
// exatamente no `<div>` genérico, sem nenhuma mudança.
//
// Sprint World Simulation — Entity Migration Phase XII — Loot ganha o
// próprio renderer (LootSprite); futuras entidades continuam exatamente
// no `<div>` genérico, sem nenhuma mudança.
//
// Sprint World Simulation — Living NPCs Phase I — NPC ganha o próprio
// renderer (NpcSprite); futuras entidades continuam exatamente no
// `<div>` genérico, sem nenhuma mudança.
export function EntityMarker({ entity, children }: EntityMarkerProps) {
  if (entity.kind === "player") {
    return <PlayerSprite entity={entity} />;
  }

  if (entity.kind === "enemy") {
    return <EnemySprite entity={entity} />;
  }

  if (entity.kind === "loot") {
    return <LootSprite entity={entity} />;
  }

  if (entity.kind === "npc") {
    return <NpcSprite entity={entity} />;
  }

  return (
    <div
      className={`entity-marker entity-${entity.kind} entity-${entity.kind}-${entity.variant}`}
      style={{ left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
