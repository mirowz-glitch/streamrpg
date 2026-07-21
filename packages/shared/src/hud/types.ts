import type { AdventureStatistics } from "../adventure/types.js";
import type { PresentationEvent } from "../presentation/types.js";
import type { XpProgress } from "../xp.js";

// HUD & Gameplay UI Phase I — tipos isolados de propósito. HUD State é
// a ÚNICA transformação entre Adventure Session/Presentation Layer e
// os componentes de UI — "nenhum cálculo de gameplay pode sair da UI"
// vale ao contrário também: nenhum componente lê AdventureSession/
// Presentation Layer diretamente, todos consomem só este shape.

// Requisito 3 — Região Atual: "Nome, Dificuldade, Nível recomendado.
// Tudo derivado da Region existente. Nenhum texto hardcoded."
//
// `name` vem de getRegionName() (regions.ts, real). `recommendedLevelRange`
// vem do levelRange da Encounter Table dessa região (World Encounter
// System, real) — `null` quando a região ainda não tem uma (nem toda
// região tinha Enemy Template ainda, ver worldencounter/
// encounterTables.ts). `difficulty` é uma classificação NOVA, derivada
// unicamente do `recommendedLevelRange.min` (não um texto hardcoded
// por região — é a MESMA regra pra qualquer região, ver
// deriveHudState.ts) — dado novo introduzido aqui, na camada de HUD,
// exatamente como a Sprint pede ("dado novo deve vir apenas da
// Presentation Layer/HUD State").
// Biomes, Regions & World Progression Phase I — requisito 1: "Cada
// região deve possuir: clima, descrição curta, identidade visual." Só
// não-nulo pra regiões com BiomeDefinition (worldencounter/biomes.ts)
// — "porto-do-amanhecer" e as regiões ainda sem bioma continuam
// funcionando exatamente como antes (null, honesto, nunca inventado).
export interface HudBiomeInfo {
  order: number;
  climate: string;
  description: string;
  difficultyLabel: string;
  visualTheme: { color: string; icon: string };
}

export interface HudRegionInfo {
  id: string;
  name: string;
  recommendedLevelRange: { min: number; max: number } | null;
  difficulty: string | null;
  // Requisito 1 — null quando a região não tem BiomeDefinition ainda
  // (mesmo princípio de recommendedLevelRange/difficulty null).
  biome: HudBiomeInfo | null;
}

// Requisito 4 — Encontro Atual: "Explorando / Em combate / Encontro
// concluído", derivado só de AdventureSession.currentEncounter e do
// último Presentation Event relevante — nunca inferido além disso.
export type HudEncounterState = "sem-encontro" | "em-combate" | "concluido";

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/7: `variant`/
// `auraColor`/`auraIcon` vêm direto de `session.currentEncounter.variant`
// (World Encounter, real) — só populado enquanto o encontro ainda está
// em andamento (mesma limitação de `state`/`enemiesAlive` acima: um
// Elite/Mini-Boss que o jogador já derrotou some daqui na tick
// seguinte, junto com o resto de `currentEncounter` — ver
// recentEliteEncounter/recentMiniBossEncounter abaixo pra celebração
// pontual). "normal" e `null`/`null` sempre que não há Elite/Mini-Boss
// ativo (nenhuma inferência além do que `WorldEncounter` já carrega).
export interface HudEncounterInfo {
  state: HudEncounterState;
  enemiesTotal: number;
  enemiesAlive: number;
  enemiesDefeated: number;
  variant: "normal" | "elite" | "miniboss";
  auraColor: string | null;
  auraIcon: string | null;
}

// Requisito 10 — Estado da Sessão: só os estados observáveis com o
// Adventure Loop de hoje (explorando/em-combate/derrota) realmente
// acontecem; "vitoria"/"encerrada" existem como tipos preparados (não
// há condição de vitória nem encerramento explícito no Adventure Loop
// ainda) — nunca inferidos, documentado em deriveHudState.ts.
export type HudSessionStatus = "explorando" | "em-combate" | "vitoria" | "derrota" | "encerrada";

export interface HudRecentLoot {
  instanceId: string;
  baseItemId: string;
  rarity: string;
  powerScore: number;
  regionId: string;
  tickIndex: number;
}

// Requisito 7 — Equipment Popup: `delta` vem só de `powerScore -
// previousPowerScore`, os dois já presentes no próprio
// ItemEquippedEvent (Presentation Layer) — nunca uma nova consulta ao
// Equipment System.
export interface HudRecentEquip {
  slotId: string;
  baseItemId: string;
  rarity: string;
  powerScore: number;
  previousPowerScore: number;
  delta: number;
  tickIndex: number;
}

// Progression & Player Retention Phase I — requisito 2: mesmo
// reempacotamento que toRecentLoot/toRecentEquip já fazem pra
// LootDropped/ItemEquipped, agora pro LevelUpEvent (Presentation
// Layer).
export interface HudLevelUpInfo {
  level: number;
  previousLevel: number;
  tickIndex: number;
}

// Requisito 3 — Resumo ao Final da Aventura: todo campo vem direto de
// AdventureStatistics + do total de XP concedido pela Presentation
// Layer (AdventureTimeline.totalXpGranted) — nenhum dado novo
// calculado, só reunidos num único painel.
export interface HudSessionSummary {
  elapsedTime: number;
  enemiesKilled: number;
  damageDealt: number;
  damageTaken: number;
  itemsFound: number;
  itemsEquipped: number;
  xpGained: number;
}

// Requisito 4 — Histórico da Sessão: agregados simples derivados só de
// AdventureStatistics + contagem de eventos "EncounterStarted" já
// existentes na Adventure Timeline — nenhuma consulta nova.
export interface HudSessionHistory {
  encountersCompleted: number;
  encountersStarted: number;
  survivalRate: number;
  averageDps: number;
  damagePerEncounter: number;
  itemsPerEncounter: number;
}

// Requisito 6 — Recorde de Dano: a menor granularidade observável de
// fora do Adventure Loop nesta fase é "dano causado num tick inteiro"
// (ver nota em presentation/types.ts sobre por que hits individuais
// não são observáveis) — é essa a unidade usada aqui.
export interface HudDamageRecord {
  damageDealt: number;
  tickIndex: number;
}

// Recovery & Adventure Flow Phase I — requisito 5: mesmo
// reempacotamento que toRecentLoot/toLevelUpInfo já fazem, agora pro
// RecoveryApplied (Recovery Layer) — "sem lógica nova na UI", o
// componente só formata isto pra exibição.
export interface HudRecentRecovery {
  lifeBefore: number;
  lifeHealed: number;
  lifeAfter: number;
  reason: string;
  tickIndex: number;
}

// Objectives, Missions & Player Goals Phase I — requisito 1/5: "todo
// personagem deve possuir exatamente um objetivo ativo" — por isso
// `currentObjective` NUNCA é null (diferente de recentLoot/
// recentRecovery, que só existem depois de algo acontecer). `percent`
// é uma conversão puramente aritmética de progress/target, mesmo
// princípio de HealthBarState.
export interface HudObjectiveInfo {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  percent: number;
}

// Requisito 6/8 — mesmo reempacotamento que toRecentLoot/toLevelUpInfo
// já fazem, agora pro ObjectiveCompleted (Objective System) — só
// não-nulo na tick exata da conclusão, pra UI celebrar uma única vez.
export interface HudObjectiveCompletedInfo {
  objectiveId: string;
  objectiveName: string;
  xpBonus: number;
  tickIndex: number;
}

// Biomes, Regions & World Progression Phase I — requisito 7: mesmo
// padrão de HudLevelUpInfo/HudObjectiveCompletedInfo — só não-nulo na
// tick exata do desbloqueio.
export interface HudRegionUnlockInfo {
  previousRegionId: string;
  newRegionId: string;
  newRegionName: string;
  tickIndex: number;
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 6/7: mesmo
// padrão de HudLevelUpInfo/HudRegionUnlockInfo — só não-nulo na tick
// exata em que o evento correspondente aconteceu, pra UI celebrar/
// anunciar uma única vez (banner/feed).
export interface HudVariantEncounterInfo {
  enemyTemplateId: string;
  enemyName: string;
  regionId: string;
  tickIndex: number;
}

export interface HudVariantDefeatedInfo {
  enemyTemplateId: string;
  enemyName: string;
  xpBonus: number;
  tickIndex: number;
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 6: "Evento Mundial / Tesouro Esquecido / Abra o baú abandonado" —
// mesmo padrão de HudLevelUpInfo/HudRegionUnlockInfo (só não-nulo na
// tick exata em que o evento aconteceu). `description` vem de
// getExplorationEventDefinition() (worldevents/, só lido) — o próprio
// WorldEventStarted (Presentation Layer) não carrega descrição, só
// id/nome/categoria/região.
export interface HudRecentWorldEvent {
  explorationEventId: string;
  name: string;
  description: string;
  category: string;
  tickIndex: number;
}

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 7: "cartão compacto... consumindo apenas HudState." Ao
// contrário de HudRecentWorldEvent/HudLevelUpInfo (um-tiro, some na
// tick seguinte), este é PERSISTENTE enquanto a expedição estiver
// ativa — mesmo princípio de HudObjectiveInfo (o objetivo atual também
// nunca "some" sozinho). `null` quando nenhuma expedição está ativa
// agora (ver deriveExpeditionProgress() — só nasce quando o Expedition
// Controller decide auto-iniciar uma).
// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito 8:
// "BOSS FINAL / nome / barra... apenas quando aplicável" — `null`
// sempre que a Expedição ativa não tem Chefe Final designado (a
// maioria das Expedições, ver dungeon/dungeonDefinitions.ts).
// `healthPercent` só é não-nulo enquanto o combate contra o Chefe está
// literalmente em andamento (mesma limitação estrutural de
// HudEncounterInfo).
export interface HudFinalBossInfo {
  bossName: string;
  encountered: boolean;
  defeated: boolean;
  healthPercent: number | null;
}

export interface HudExpeditionInfo {
  expeditionId: string;
  name: string;
  description: string;
  difficulty: string;
  percent: number;
  checkpointsReached: number;
  checkpointsTotal: number;
  encountersCompleted: number;
  expectedEncounters: number;
  elitesDefeated: number;
  miniBossesDefeated: number;
  worldEventsFound: number;
  // Requisito 8 — `null` quando esta Expedição não é uma Dungeon (sem
  // Chefe Final designado).
  finalBoss: HudFinalBossInfo | null;
}

// Factions, Reputation & World Consequences Phase I — requisito 5:
// "Facção Atual / barra / rank", mesmo princípio PERSISTENTE de
// HudExpeditionInfo (nunca some sozinho — a reputação de uma facção
// nunca "acaba"). `null` só quando a região atual ainda não tem facção
// dona (ver getFactionForRegion, factions/factionDefinitions.ts).
export interface HudFactionInfo {
  factionId: string;
  factionName: string;
  reputation: number;
  rankId: string;
  rankName: string;
  percentToNextRank: number;
  nextRankName: string | null;
}

// Requisito 1 — HUD State: todos os campos pedidos.
export interface HudState {
  currentLife: number;
  maximumLife: number;
  region: HudRegionInfo;
  encounter: HudEncounterInfo;
  recentLoot: HudRecentLoot | null;
  recentEquip: HudRecentEquip | null;
  lastDamageTaken: number | null;
  lastDamageDealt: number | null;
  sessionStatus: HudSessionStatus;
  elapsedTime: number;
  // Requisito 9 — Session Overlay: as estatísticas da própria
  // AdventureSession, reaproveitadas sem transformação.
  statistics: AdventureStatistics;
  // Requisito 5 — Feed de Eventos: os últimos N Presentation Events da
  // Adventure Timeline, na ordem em que aconteceram — "nunca
  // reconstruir eventos", só uma fatia da timeline já existente.
  recentEvents: PresentationEvent[];
  // Requisito 1 — Barra de XP: reaproveita XpProgress (xp.ts) tal
  // qual — nenhum cálculo novo de experiência.
  xpProgress: XpProgress;
  // Requisito 2 — Evento de Level Up: só não-nulo quando o evento mais
  // recente da Timeline for um LevelUp (mesmo padrão de
  // recentLoot/recentEquip — a UI usa `tickIndex` como key pra tocar a
  // celebração uma única vez).
  recentLevelUp: HudLevelUpInfo | null;
  // Requisito 5/7 — Destaque de Melhor Item / Estatísticas Permanentes:
  // maior Power Score entre todos os LootDropped já registrados nesta
  // sessão ("sem consultar novamente o Inventory ou Equipment" — varre
  // só a Timeline, nunca os dois sistemas).
  bestItemFound: HudRecentLoot | null;
  // Requisito 5 — só não-nulo na tick EXATA em que um item superou
  // todos os anteriores (pra UI celebrar uma única vez, não toda vez
  // que renderiza).
  newBestItemEvent: HudRecentLoot | null;
  // Requisito 6 — mesmo princípio do item, mas pro maior dano causado
  // num único tick.
  newDamageRecordEvent: HudDamageRecord | null;
  // Requisito 3 — só não-nulo quando a sessão termina em derrota (o
  // único fim de sessão que o Adventure Loop produz hoje — "vitória"/
  // "encerrada" não existem ainda, ver HudSessionStatus).
  sessionSummary: HudSessionSummary | null;
  // Requisito 4 — sempre presente (mesmo com 0 encontros — todo campo
  // cai em 0/100 nesse caso, nunca null).
  sessionHistory: HudSessionHistory;
  // Recovery & Adventure Flow Phase I — requisito 5: só não-nulo
  // quando o evento mais recente da Timeline for um RecoveryApplied
  // (mesmo padrão de recentLoot/recentLevelUp).
  recentRecovery: HudRecentRecovery | null;
  // Objectives, Missions & Player Goals Phase I — requisito 1/5:
  // sempre presente (nunca null — todo personagem sempre tem
  // exatamente um objetivo ativo).
  currentObjective: HudObjectiveInfo;
  // Requisito 6/8 — só não-nulo na tick exata em que o objetivo atual
  // foi concluído.
  recentObjectiveCompleted: HudObjectiveCompletedInfo | null;
  // Biomes, Regions & World Progression Phase I — requisito 7: só
  // não-nulo na tick exata em que uma região foi desbloqueada.
  recentRegionUnlock: HudRegionUnlockInfo | null;
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 6/7: só
  // não-nulo na tick exata do evento correspondente (mesmo padrão de
  // recentLevelUp/recentRegionUnlock acima).
  recentEliteEncounter: HudVariantEncounterInfo | null;
  recentMiniBossEncounter: HudVariantEncounterInfo | null;
  recentEliteDefeated: HudVariantDefeatedInfo | null;
  recentMiniBossDefeated: HudVariantDefeatedInfo | null;
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 6: só não-nulo na tick exata em que um World Event aconteceu.
  recentWorldEvent: HudRecentWorldEvent | null;
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 7: persistente enquanto houver uma expedição ativa
  // (nunca um-tiro, ver HudExpeditionInfo).
  expedition: HudExpeditionInfo | null;
  // Factions, Reputation & World Consequences Phase I — requisito 5:
  // persistente (nunca um-tiro, ver HudFactionInfo) — a facção dona da
  // região atual.
  faction: HudFactionInfo | null;
}
