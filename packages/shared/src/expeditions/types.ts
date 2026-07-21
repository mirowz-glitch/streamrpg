// Expeditions, Checkpoints & Long Session Progression Phase I — tipos
// isolados de propósito, prefixados `Expedition*`.
//
// Nota de nomenclatura: `ExpeditionStatus`/`ExpeditionCompact`/
// `ExpeditionResponse`/`ExpeditionApproach` já existem em ../types.ts —
// são o sistema NARRATIVO de expedição mais antigo (texto de
// exploração com estados "preparing/exploring/combating/resting/
// returning/completed" e escolhas do jogador via API, apps/api/), um
// sistema completamente diferente e intocado por esta Sprint. Os
// identificadores exatos aqui (`ExpeditionDefinition`/`ExpeditionReward`/
// `ExpeditionProgressSnapshot`) não colidem em compilação (nomes
// diferentes), mas o CONCEITO "Expedição" aqui é outro: a estrutura
// mecânica de checkpoints/recompensa desta Sprint, derivada
// inteiramente de Presentation Events do Adventure Loop — nunca o
// sistema de exploração textual da API.
//
// "A Expedição é apenas um orquestrador externo":
// este módulo nunca cria uma nova regra de combate/loot/XP — só
// organiza os encontros existentes (Adventure Loop, intocado) numa
// estrutura maior (início → trechos → checkpoint → trechos → final).

// Requisito 12 — Recompensa Final: "preparar suporte para ouro, XP,
// item garantido. Nesta Sprint implementar apenas: XP, ouro." Mesmo
// princípio de Future Hooks já usado em EnemyFutureFlags/RecoveryConfig/
// ExplorationEventReward.lootTableId — `guaranteedLootTableId` aceito
// por tipagem, nunca lido por nenhuma lógica real ainda.
export interface ExpeditionReward {
  xpAmount?: number;
  goldAmount?: number;
  guaranteedLootTableId?: string;
}

// Requisito 1 — Expedition Definition: id/nome/descrição/bioma inicial/
// biomas permitidos/duração esperada/quantidade de checkpoints/
// recompensa final/dificuldade, tudo num registro só, "sem switch
// gigante" (nenhuma lógica em expeditionController.ts/expeditionProgress.ts
// lê `id` pra decidir comportamento especial).
//
// `expectedEncounters` é a unidade MECÂNICA real de "duração esperada"
// (requisito 1) — os checkpoints e a conclusão são sempre frações
// inteiras dela (ver expeditionProgress.ts), determinístico e nunca
// dependente de relógio de parede. `expectedSeconds` é só descritivo
// (relatório/flavor), reaproveitando a MESMA suposição de UX
// (segundos por tick) já documentada no Simulador — nunca usado pra
// decidir progresso de verdade.
export interface ExpeditionDefinition {
  id: string;
  name: string;
  description: string;
  startBiome: string;
  allowedBiomes: string[];
  expectedEncounters: number;
  expectedSeconds: number;
  checkpointCount: number;
  reward: ExpeditionReward;
  difficulty: string;
}

// Requisito 4 — Progressão: "encontros concluídos, elites derrotados,
// mini-bosses derrotados, eventos encontrados, objetivos concluídos,
// regiões desbloqueadas. Tudo derivado dos eventos já existentes.
// Nenhum contador paralelo." `null` quando nenhuma expedição está
// ativa (ainda não começou, ou a última já concluiu/falhou) — mesmo
// princípio de HudObjectiveInfo (Objective System), só que aqui o
// "sempre existe um" não vale: uma expedição só nasce quando o
// Expedition Controller decide auto-iniciar uma (ver
// expeditionController.ts).
export interface ExpeditionProgressSnapshot {
  expeditionId: string;
  name: string;
  description: string;
  difficulty: string;
  encountersCompleted: number;
  expectedEncounters: number;
  percent: number;
  checkpointsReached: number;
  checkpointsTotal: number;
  elitesDefeated: number;
  miniBossesDefeated: number;
  worldEventsFound: number;
  objectivesCompleted: number;
  regionsUnlocked: number;
  diedDuringExpedition: boolean;
  complete: boolean;
  startTickIndex: number;
}
