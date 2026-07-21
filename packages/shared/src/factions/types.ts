// Factions, Reputation & World Consequences Phase I — tipos isolados
// de propósito, prefixados `Faction*`.
//
// "A Facção apenas observa eventos existentes. Nunca controla
// combate": este módulo nunca cria uma nova regra de combate/encontro
// — só observa Presentation Events já produzidos pela cadeia existente
// (Expedition Controller -> Objective System -> Recovery -> Presentation
// -> Adventure Loop, todos intocados) e deriva reputação/rank/bônus a
// partir deles.

// Requisito 4 — Consequências: "preparar suporte para descontos, loot
// melhor, objetivos exclusivos, expedições especiais. Nesta Sprint
// implementar apenas: bônus de XP, bônus de ouro." Mesmo princípio de
// Future Hooks já usado em ExpeditionReward.guaranteedLootTableId/
// ObjectiveReward.itemRewardId — aceitos por tipagem, nunca lidos por
// nenhuma lógica real ainda.
export interface FactionReward {
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  discountPercent?: number;
  exclusiveObjectiveIds?: string[];
  specialExpeditionIds?: string[];
}

// Requisito 3 — Rank de Reputação: uma escada data-driven de patamares,
// cada um com seu próprio limiar mínimo e recompensa — "nenhum switch
// gigante" (nenhuma lógica em factionProgress.ts/factionController.ts
// decide comportamento por `id` de rank, só compara `reputation` contra
// `minReputation`).
export interface FactionRank {
  id: string;
  name: string;
  minReputation: number;
  reward: FactionReward;
}

// Requisito 1 — Faction Definition: id/nome/descrição/regiões/
// alinhamento/reputação(ranks), tudo num registro só.
//
// `regions` — "cada facção possui regiões": a lista de biomas onde essa
// facção é a autoridade local (usado só pra decidir qual facção é
// "Facção Atual" na HUD, ver factionProgress.ts — nunca pra restringir
// ONDE a reputação pode subir, já que Mercadores Livres/Culto das
// Ruínas ganham reputação por gatilhos que podem acontecer em qualquer
// bioma).
export interface FactionDefinition {
  id: string;
  name: string;
  description: string;
  regions: string[];
  alignment: string;
  ranks: FactionRank[];
}

// Requisito 5 — snapshot que a HUD State consome pra renderizar
// "Facção Atual" (nome/barra/rank), sempre derivado (nunca um contador
// paralelo — ver factionProgress.ts: reputation vem do último
// ReputationChanged.newReputation da facção na Timeline).
export interface FactionProgressSnapshot {
  factionId: string;
  factionName: string;
  reputation: number;
  rankId: string;
  rankName: string;
  percentToNextRank: number;
  nextRankName: string | null;
}
