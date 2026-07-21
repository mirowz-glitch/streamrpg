// Objectives, Missions & Player Goals Phase I — tipos isolados de
// propósito. "Data driven, sem switch gigante": cada objetivo é UM
// registro (objectiveDefinitions.ts) — nenhuma lógica por-id em nenhum
// lugar deste módulo.

// Requisito 4 — os 5 tipos iniciais. Um switch único (objectiveProgress.ts)
// mapeia cada tipo pra qual evento observável ele conta — nunca um
// segundo switch por objetivo individual.
//
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 5: 3 tipos
// novos, mesmo princípio — cada um só observa os eventos que a
// extensão aditiva de presentationLayer.ts já publica
// (EliteDefeated/MiniBossDefeated/EncounterFinished), nunca uma
// segunda lógica de detecção. Adicionar estes tipos aqui/em
// objectiveProgress.ts é reaproveitar o Objective System como CONTEÚDO
// (novos dados + um novo `case` no mesmo switch já existente) — o
// próprio wrapper (objectiveLayer.ts, "System" protegido nesta Sprint)
// permanece intocado.
// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 10: 4 tipos novos, mesmo princípio de defeat-elite/defeat-miniboss —
// cada um só observa os eventos que a extensão aditiva de
// presentationLayer.ts já publica (TreasureOpened/MerchantFound/
// ShrineBlessing/DiscoveryMade), nunca uma segunda lógica de detecção.
export type ObjectiveType =
  | "kill"
  | "survival"
  | "level"
  | "loot"
  | "equipment"
  | "defeat-elite"
  | "defeat-miniboss"
  | "survive-after-elite"
  | "open-treasure"
  | "find-merchant"
  | "receive-blessing"
  | "discover-worldevent"
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 11: 4 tipos novos, mesmo princípio — cada um só observa
  // os eventos que expeditions/expeditionController.ts já publica
  // (ExpeditionCompleted/ExpeditionCheckpointReached), nunca uma
  // segunda lógica de detecção.
  | "complete-expedition"
  | "reach-checkpoints"
  | "complete-expedition-no-death"
  | "complete-expedition-with-worldevent"
  // Factions, Reputation & World Consequences Phase I — requisito 9: 3
  // tipos novos, mesmo princípio — cada um só observa os eventos que
  // factions/factionController.ts já publica (ReputationRankUp/
  // ReputationChanged), nunca uma segunda lógica de detecção.
  | "reach-faction-rank"
  | "help-merchants"
  | "discover-ruins"
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 6: 2 tipos novos ("Derrote o Guardião Esquecido"/"Conclua uma
  // Dungeon") — cada um só observa os eventos que
  // dungeon/dungeonController.ts já publica (FinalBossDefeated/
  // DungeonCompleted), nunca uma segunda lógica de detecção. "Complete
  // a Fortaleza Sombria" reaproveita o tipo "survival" JÁ existente com
  // `regionId: "fortaleza-sombria"` (mesmo princípio de "bosque-hunt"/
  // "pantano-survival" — objetivo regional, granularidade já suficiente,
  // nenhum tipo novo necessário).
  | "defeat-final-boss"
  | "complete-dungeon";

// Requisito 7 — Recompensas: "preparar suporte para XP, ouro, itens,
// desbloqueios. Nesta Sprint implementar apenas: XP bônus." Os outros 3
// campos existem como Future Hooks — mesmo princípio de
// EnemyFutureFlags/AdventureFutureHooks/RecoveryConfig — aceitos por
// tipagem, nunca lidos por nenhuma lógica real ainda.
export interface ObjectiveReward {
  xpBonus?: number;
  goldBonus?: number;
  itemRewardId?: string;
  unlockId?: string;
}

// Requisito 2 — Objetivo Data Driven: id/nome/descrição/condição
// (`type`+`target`+`targetRarity`)/recompensa, tudo num registro só.
// `soundId` — requisito 8 ("som preparado"): nunca lido por nenhuma
// lógica real nesta Sprint, só reservado pro dia em que efeitos sonoros
// existirem.
export interface ObjectiveDefinition {
  id: string;
  name: string;
  description: string;
  type: ObjectiveType;
  target: number;
  // Só lido por objetivos do tipo "loot" — raridade MÍNIMA aceita (uma
  // raridade mais rara também conta, ver objectiveProgress.ts).
  targetRarity?: string;
  reward: ObjectiveReward;
  soundId?: string;
  // Biomes, Regions & World Progression Phase I — requisito 5:
  // "Objetivos Regionais... derivados da região atual." Quando
  // presente, este objetivo só é elegível pra seleção enquanto
  // session.currentRegion === regionId (ver objectiveDefinitions.ts:
  // selectObjectiveId). Ausente = elegível em qualquer região (todos os
  // objetivos genéricos já existentes continuam assim).
  regionId?: string;
}

// Requisito 1/5 — snapshot do objetivo ativo + progresso, o shape que a
// HUD State consome pra renderizar a barra de progresso.
export interface ObjectiveProgressSnapshot {
  objective: ObjectiveDefinition;
  progress: number;
  target: number;
  complete: boolean;
  // Quantos objetivos já foram concluídos nesta sessão — usado pela
  // seleção determinística do próximo objetivo (objectiveDefinitions.ts).
  completedCount: number;
}
