/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — Offline
 * Summary: "seu personagem continuou existindo enquanto você esteve
 * fora." Distinto de Simulator (simulation/) — o Simulator existe para
 * TESTAR balance com personagens sintéticos nível 1; este módulo existe
 * para PROJETAR o que um personagem REAL (nível/xp/região reais) teria
 * feito durante um intervalo real de ausência, usando o MESMO motor
 * (advanceAdventureWithPresentation) que a Aventura ao vivo usa —
 * nenhuma lógica de combate/loot/XP duplicada.
 */
export interface OfflineCatchUpInput {
  /** Nível real do personagem (getProgress().level, characters.xp). */
  characterLevel: number;
  /** XP já acumulado DENTRO do nível atual (mesmo campo que characters.xp guarda). */
  characterXp: number;
  /** Região real onde o personagem está (expeditions.current_region_id, ou STARTING_REGION_ID). */
  regionId: string;
  /** Tempo real de ausência, em ms — o chamador já aplica o cap (ver MAX_OFFLINE_MS). */
  elapsedMs: number;
  /** Seed determinística — mesmo valor produz sempre o mesmo resultado (nunca Math.random). */
  seed: number;
}

export interface OfflineSummary {
  elapsedMs: number;
  ticksSimulated: number;
  enemiesKilled: number;
  itemsFound: number;
  itemsAutoSold: number;
  goldFromAutoSold: number;
  xpGained: number;
  leveledUp: boolean;
  finalLevel: number;
  characterSurvived: boolean;
}
