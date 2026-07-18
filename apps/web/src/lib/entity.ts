// Sprint World Entities (Base Reutilizável) — pausa deliberada em novas
// camadas narrativas: esta camada é pura infraestrutura visual, sem
// texto/gameplay/regra nova. Descreve QUALQUER entidade do mundo
// (jogador, inimigo, NPC, loot) com o mesmo formato de dados — hoje
// renderizada só com formas CSS (EntityMarker.tsx), amanhã com sprite,
// sem precisar reescrever quem calcula posição/estado.
export type EntityKind = "player" | "enemy" | "npc" | "loot";

export interface EntityPosition {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  kind: EntityKind;
  // Chave de aparência (ex.: "walking" pro jogador, "misterio" pro
  // inimigo, "rare" pro loot) — decide só a classe CSS/sprite a usar,
  // nunca uma regra de jogo. Vocabulário livre por kind de propósito:
  // cada tipo de entidade já tem seu próprio conjunto de variantes
  // (Phases I-IX), unificar num único union cross-kind seria
  // artificial nesta etapa.
  variant: string;
  position: EntityPosition;
  visible: boolean;
}
