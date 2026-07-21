// Combat Presentation Layer Phase I — tipos isolados de propósito.
//
// Decisão de arquitetura (confirmada com o usuário antes de
// implementar): "Não alterar Adventure Loop" nesta Sprint significa
// que advanceAdventure() continua um call opaco que resolve um
// encontro INTEIRO por chamada, sem expor nenhum evento por golpe
// individual (cada resolveCombat() interno). Por isso os eventos
// desta camada são reconstruídos a partir de um diff ANTES/DEPOIS do
// AdventureSession + do AdventureTickResult que advanceAdventure() já
// devolve — nunca inventados, sempre derivados de dado real, mas na
// granularidade de UM TICK (um encontro inteiro), não de uma troca de
// golpe individual. Consequência honesta disso, documentada em cada
// lugar relevante: `CriticalHit`/`Miss` (requisito 2) e os floating
// numbers `critical`/`miss` (requisito 3) EXISTEM como tipos —
// preparados — mas nunca são emitidos de verdade nesta fase, porque
// essa informação (quantos hits foram crítico/miss dentro do tick)
// não existe em nenhum lugar observável de fora sem alterar o Adventure
// Loop.

// Requisito 2 — Presentation Events. Cada evento carrega `tickIndex`
// (qual chamada de advanceAdventureWithPresentation() o gerou) e
// `timestamp` (o mesmo `currentTime` passado pro tick) — o suficiente
// pra reconstruir a sequência completa depois (requisito 6, Adventure
// Timeline / replay futuro).
export interface PresentationEventBase {
  tickIndex: number;
  timestamp: number;
}

export type PresentationEvent =
  | (PresentationEventBase & { kind: "EncounterStarted"; regionId: string; enemyCount: number })
  | (PresentationEventBase & { kind: "AttackStarted"; enemyCount: number })
  | (PresentationEventBase & { kind: "AttackHit"; damageDealt: number; damageTaken: number })
  // Preparados, nunca emitidos nesta fase (ver nota acima).
  | (PresentationEventBase & { kind: "CriticalHit" })
  | (PresentationEventBase & { kind: "Miss" })
  | (PresentationEventBase & { kind: "EnemyKilled"; count: number })
  // Requisito 5 — Loot Presentation: Item/Raridade/Power Score/Origem.
  // "Origem" é a região (o que é observável de fora sem alterar
  // Adventure Loop/Enemy System) — não o inimigo específico que
  // dropou, porque essa identidade se perde quando o encontro é
  // encerrado com sucesso dentro do mesmo tick (ver types.ts do
  // Adventure Loop: `currentEncounter` vira `null`).
  // `stored` — Engine Observability & Event Derivation Phase I: agora
  // emitido pra TODO item que o Loot Generator produziu nesta tick,
  // mesmo quando `inventory.addItem()` falhou por falta de espaço
  // (`stored: false`) — antes, um item descartado simplesmente não
  // gerava nenhum LootDropped (causa raiz confirmada pela Engine Audit
  // Phase I: consumidores inferiam este evento por diff de Inventory,
  // então Inventory cheio apagava o evento mesmo o item tendo sido
  // gerado de verdade). `instanceId` continua sempre presente (mesmo
  // id que o Adventure Loop já gerava antes de tentar `addItem()`),
  // então nenhum consumidor existente quebra — só ganha um campo novo.
  | (PresentationEventBase & {
      kind: "LootDropped";
      instanceId: string;
      baseItemId: string;
      rarity: string;
      powerScore: number;
      regionId: string;
      stored: boolean;
    })
  // `previousPowerScore` — extensão aditiva da Sprint HUD & Gameplay
  // UI Phase I: o Equipment Popup precisa mostrar a diferença de Power
  // Score "usando apenas os dados do próprio evento, nunca consultar o
  // Equipment System novamente" — sem isso, o dado não existia aqui.
  // 0 quando o slot estava vazio antes de equipar. Puramente aditivo
  // (campo novo, nenhum existente mudou) — nenhuma chamada antiga a
  // advanceAdventureWithPresentation() muda de comportamento; o
  // "não alterar Presentation Layer" da Sprint de UI é sobre
  // COMPORTAMENTO de gameplay, e esta Sprint documenta explicitamente
  // que dado novo necessário pra UI deve vir daqui.
  | (PresentationEventBase & {
      kind: "ItemEquipped";
      slotId: string;
      baseItemId: string;
      rarity: string;
      powerScore: number;
      previousPowerScore: number;
    })
  | (PresentationEventBase & { kind: "EncounterFinished"; enemiesKilled: number })
  | (PresentationEventBase & { kind: "CharacterDied" })
  // Progression & Player Retention Phase I — requisito 2: único evento
  // desta Sprint sem um Presentation Event "irmão" já existente pra
  // reaproveitar (diferente de Best Item/Damage Record, que são só
  // derivados na HUD State a partir de LootDropped/AttackHit já
  // existentes) — Level Up não tem nenhum dado observável de fora sem
  // que ALGUÉM conceda XP primeiro, e o Adventure Loop nunca faz isso
  // (decisão confirmada com o usuário: mantê-lo intocado). Por isso
  // esta é a única extensão real de comportamento desta camada: ver
  // presentationLayer.ts.
  | (PresentationEventBase & { kind: "LevelUp"; level: number; previousLevel: number })
  // Recovery & Adventure Flow Phase I — requisito 4: mesmo princípio do
  // LevelUp (nenhum "irmão" já existente pra reaproveitar — cura entre
  // encontros nunca existiu antes desta Sprint) — mas quem produz este
  // evento é a Recovery Layer (packages/shared/src/recovery/), uma
  // camada NOVA e separada, nunca este arquivo/presentationLayer.ts.
  // "reason" é sempre "encounter-finished" nesta fase (o único motivo
  // real de recuperação implementado — ver recovery/types.ts).
  | (PresentationEventBase & { kind: "RecoveryApplied"; lifeBefore: number; lifeHealed: number; lifeAfter: number; reason: string })
  // Objectives, Missions & Player Goals Phase I — requisito 6: mesmo
  // princípio de LevelUp/RecoveryApplied (nenhum "irmão" já existente —
  // conclusão de objetivo nunca existiu antes desta Sprint). Produzido
  // pelo Objective System (packages/shared/src/objectives/), uma camada
  // NOVA e separada, nunca este arquivo/presentationLayer.ts.
  | (PresentationEventBase & { kind: "ObjectiveCompleted"; objectiveId: string; objectiveName: string; xpBonus: number })
  // Biomes, Regions & World Progression Phase I — requisito 6: mesmo
  // princípio de LevelUp/RecoveryApplied/ObjectiveCompleted — sem
  // "irmão" já existente, produzido pelo Objective System (extensão do
  // wrapper existente advanceAdventureWithObjectives, nunca um wrapper
  // novo — ver objectives/objectiveLayer.ts). "RegionUnlocked" dispara
  // uma única vez, no exato tick em que a faixa de nível do próximo
  // bioma é atingida; "RegionEntered" sempre acompanha (mesma tick),
  // já que o desbloqueio já move o personagem pra lá imediatamente
  // (sem mapa/viagem, conforme requisito 4: "Sem NPC. Sem mapa.").
  | (PresentationEventBase & { kind: "RegionUnlocked"; previousRegionId: string; newRegionId: string })
  | (PresentationEventBase & { kind: "RegionEntered"; regionId: string })
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 6: mesmo
  // princípio de LevelUp/RecoveryApplied/ObjectiveCompleted/
  // RegionUnlocked — sem "irmão" já existente, produzido por uma
  // extensão aditiva DENTRO desta MESMA camada (presentationLayer.ts,
  // decisão confirmada com o usuário: aceitável estender o diff
  // antes/depois já existente aqui, desde que nenhuma regra de
  // combate/encontro/progressão seja movida pra cá — só observação e
  // publicação de eventos, igual a todos os outros).
  //
  // "Surge" e "derrotado" chegam SEMPRE na mesma tick (nunca uma
  // notificação antecipada de "vai aparecer") — mesma limitação
  // estrutural já documentada pra EncounterStarted/EncounterFinished:
  // advanceAdventure() resolve um encontro inteiro (gerar + lutar +
  // concluir) numa única chamada opaca, então a única forma de saber
  // que um Elite/Mini-Boss existiu é RETROATIVA, depois do combate já
  // resolvido — nunca em tempo real, movimento por movimento.
  //
  // A identidade (Elite vs Mini-Boss) sobrevive fora do Adventure Loop
  // por DOIS canais complementares (ver presentationLayer.ts): (1) na
  // VITÓRIA, o item de loot marcado (`ItemGenGeneratedItem.
  // sourceVariant`, ver itemgen/types.ts/enemy/lootIntegration.ts) —
  // Elite/Mini-Boss SEMPRE dropam pelo menos 1 item (loot garantido,
  // requisito 4), sinal preciso, nunca heurística; (2) na DERROTA (o
  // personagem morre lutando), `session.currentEncounter` NUNCA é
  // zerado pelo Adventure Loop nesse caso (só zera "quando todos os
  // inimigos morrem"), então a identidade ainda está lá pra ser lida.
  // Combinados: `EliteEncounter`/`MiniBossEncounter` disparam em AMBOS
  // os casos (vitória ou derrota — é só "isto existiu"); `EliteDefeated`/
  // `MiniBossDefeated` só disparam na vitória (é só "isto foi
  // derrotado"). Nenhuma heurística em nenhum dos dois canais.
  | (PresentationEventBase & { kind: "EliteEncounter"; enemyTemplateId: string; enemyName: string; regionId: string })
  | (PresentationEventBase & { kind: "MiniBossEncounter"; enemyTemplateId: string; enemyName: string; regionId: string })
  | (PresentationEventBase & { kind: "EliteDefeated"; enemyTemplateId: string; enemyName: string; xpBonus: number })
  | (PresentationEventBase & { kind: "MiniBossDefeated"; enemyTemplateId: string; enemyName: string; xpBonus: number })
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 5: "WorldEventStarted, WorldEventCompleted" (nomes exatos do
  // requisito — os TIPOS de dados do módulo em si são
  // `ExplorationEvent*`, ver worldevents/types.ts, só pra não colidir
  // com `WorldEventCategory` já existente em ../types.ts, Sprint
  // Kingdom Events; os `kind` abaixo são só rótulos de união
  // discriminada, sem esse conflito). Mesmo princípio de
  // EliteEncounter/MiniBossEncounter: "surgiu" e "concluído" chegam
  // SEMPRE juntos, na mesma tick (ver nota completa em
  // presentationLayer.ts sobre a técnica de PREVISÃO usada aqui — a
  // única categoria de evento nesta Sprint que não usa nem o "sinal de
  // loot marcado" nem o "canal de derrota" de Elite/Mini-Boss, porque
  // Merchant/Shrine/Discovery não têm inimigo nenhum pra sobreviver à
  // resolução do tick).
  | (PresentationEventBase & { kind: "WorldEventStarted"; explorationEventId: string; name: string; category: string; regionId: string })
  | (PresentationEventBase & { kind: "WorldEventCompleted"; explorationEventId: string; name: string; category: string })
  | (PresentationEventBase & { kind: "TreasureOpened"; explorationEventId: string; itemCount: number; bestRarity: string | null; goldAmount: number })
  | (PresentationEventBase & { kind: "MerchantFound"; explorationEventId: string; goldAmount: number })
  | (PresentationEventBase & { kind: "ShrineBlessing"; explorationEventId: string; recoveryAmount: number; xpAmount: number; goldAmount: number })
  | (PresentationEventBase & { kind: "DiscoveryMade"; explorationEventId: string; xpAmount: number })
  | (PresentationEventBase & { kind: "AmbushTriggered"; explorationEventId: string; enemyCount: number })
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 6: "ExpeditionStarted, ExpeditionCheckpointReached,
  // ExpeditionCompleted, ExpeditionFailed. Derivados." Produzidos por
  // expeditions/expeditionController.ts (o orquestrador externo, nunca
  // por este arquivo/presentationLayer.ts — Presentation Layer
  // permanece 100% intocada nesta Sprint, diferente da Sprint de
  // Elites, onde uma extensão aditiva foi aprovada; aqui não há
  // nenhuma necessidade de tocar presentationLayer.ts, já que a
  // identidade da expedição sobrevive facilmente na própria Timeline —
  // ver expeditionProgress.ts).
  | (PresentationEventBase & { kind: "ExpeditionStarted"; expeditionId: string; name: string; regionId: string })
  | (PresentationEventBase & {
      kind: "ExpeditionCheckpointReached";
      expeditionId: string;
      checkpointIndex: number;
      checkpointsTotal: number;
      recoveryAmount: number;
    })
  | (PresentationEventBase & {
      kind: "ExpeditionCompleted";
      expeditionId: string;
      name: string;
      encountersCompleted: number;
      elitesDefeated: number;
      miniBossesDefeated: number;
      worldEventsFound: number;
      diedDuringExpedition: boolean;
      xpAmount: number;
      goldAmount: number;
    })
  | (PresentationEventBase & { kind: "ExpeditionFailed"; expeditionId: string; name: string; encountersCompleted: number })
  // Factions, Reputation & World Consequences Phase I — requisito 6:
  // "ReputationChanged, ReputationRankUp." Produzidos por
  // factions/factionController.ts (o orquestrador externo, nunca por
  // este arquivo/presentationLayer.ts — mesmo princípio de
  // ExpeditionStarted/ExpeditionCompleted acima: a identidade da facção
  // sobrevive facilmente na própria Timeline, sem precisar de nenhuma
  // técnica de diff dentro da Presentation Layer). `reason` é o `kind`
  // do Presentation Event que disparou a mudança (ex.: "ExpeditionCompleted",
  // "EliteDefeated") — só descritivo, nunca lido por nenhuma lógica.
  // `xpBonusGranted`/`goldBonusGranted` — requisito 4 (Bônus de XP/
  // Ouro): sempre presentes (0 quando este gatilho específico não
  // concede bônus, hoje só "ExpeditionCompleted" concede) — o Simulador
  // observa o bônus real diretamente daqui, nunca reconstruindo a
  // porcentagem/rank sozinho.
  | (PresentationEventBase & {
      kind: "ReputationChanged";
      factionId: string;
      factionName: string;
      delta: number;
      newReputation: number;
      reason: string;
      xpBonusGranted: number;
      goldBonusGranted: number;
    })
  | (PresentationEventBase & {
      kind: "ReputationRankUp";
      factionId: string;
      factionName: string;
      rankId: string;
      rankName: string;
      xpBonusPercent: number;
      goldBonusPercent: number;
    })
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 7: "FinalBossEncounter, FinalBossDefeated, DungeonCompleted.
  // Consumidos pela Presentation Layer." Produzidos por
  // dungeon/dungeonController.ts (o orquestrador externo mais recente,
  // nunca por este arquivo/presentationLayer.ts — mesmo princípio de
  // ExpeditionStarted/ReputationChanged acima: a identidade do Chefe
  // Final/da Dungeon sobrevive facilmente observando MiniBossEncounter/
  // MiniBossDefeated/ExpeditionCompleted já publicados, sem precisar de
  // nenhuma técnica de diff dentro da Presentation Layer).
  //
  // `FinalBossEncounter`/`FinalBossDefeated` espelham EXATAMENTE o
  // shape de EliteEncounter/MiniBossEncounter/EliteDefeated/
  // MiniBossDefeated (mesma limitação estrutural: "surge" e "derrotado"
  // chegam sempre na mesma tick, exceto quando o personagem morre
  // lutando contra o Boss sem derrotá-lo — só Encounter dispara nesse
  // caso) — são uma ESPECIALIZAÇÃO desses eventos genéricos, disparada
  // só quando `enemyTemplateId` bate com o Chefe Final designado da
  // Dungeon ativa (ver dungeon/dungeonDefinitions.ts). `xpAmount`/
  // `goldAmount` em FinalBossDefeated são a recompensa ESPECIAL do
  // Chefe (requisito 4), somada por cima do que o abate normal/
  // Mini-Boss já concede — o item único e a reputação vêm por eventos
  // JÁ existentes (`LootDropped`/`ReputationChanged`), nunca duplicados
  // aqui.
  | (PresentationEventBase & { kind: "FinalBossEncounter"; enemyTemplateId: string; enemyName: string; regionId: string })
  | (PresentationEventBase & { kind: "FinalBossDefeated"; enemyTemplateId: string; enemyName: string; xpAmount: number; goldAmount: number })
  // `DungeonCompleted` — especialização de ExpeditionCompleted pra uma
  // Expedição-Dungeon (tem Chefe Final designado) cujo Chefe já foi
  // derrotado em algum ponto da mesma Expedição (fronteira desde
  // ExpeditionStarted, mesma técnica de deriveExpeditionProgress()).
  // Sempre acompanha um ExpeditionCompleted normal na mesma tick (nunca
  // o substitui) — "resumo especial da Expedição" (requisito 9) que a
  // UI usa pra saber que ESTA conclusão de Expedição é a de uma
  // Dungeon, e mostrar o nome do Chefe derrotado.
  | (PresentationEventBase & {
      kind: "DungeonCompleted";
      expeditionId: string;
      name: string;
      bossName: string;
      encountersCompleted: number;
      xpAmount: number;
      goldAmount: number;
    });

export type PresentationEventKind = PresentationEvent["kind"];

// Requisito 3 — Floating Numbers: "damage"/"heal"/"lifeLeech" são
// derivados de números reais (delta de damageDealt/damageTaken/
// currentLife entre antes e depois do tick); "critical"/"miss" são só
// tipos preparados (ver nota no topo do arquivo), nunca produzidos por
// deriveFloatingNumbers() nesta fase.
export type FloatingNumberKind = "damage" | "critical" | "miss" | "heal" | "lifeLeech";

export interface FloatingNumberEvent {
  kind: FloatingNumberKind;
  value: number;
  target: "character" | "enemy";
  tickIndex: number;
  timestamp: number;
}

// Requisito 4 — Health Bars: "atualização visual apenas, nenhuma
// regra nova" — só uma conversão current/maximum -> percentual,
// puramente aritmética.
export interface HealthBarState {
  current: number;
  maximum: number;
  percent: number;
}

// Requisito 6 — Adventure Timeline: log completo, ordenado, de todos
// os Presentation Events já produzidos nesta sessão. `nextTickIndex`
// garante que cada tick tenha um índice único e crescente, mesmo que
// produza zero eventos.
export interface AdventureTimeline {
  sessionId: string;
  events: PresentationEvent[];
  nextTickIndex: number;
  // Progression & Player Retention Phase I — soma de todo XP concedido
  // nesta sessão (ver presentationLayer.ts). Vive aqui, não em
  // AdventureStatistics/Adventure Loop: XP-por-abate é uma decisão
  // desta camada (Presentation Layer), não do Adventure Loop, que
  // continua sem nenhuma noção de experiência.
  totalXpGranted: number;
  // Biomes, Regions & World Progression Phase I — regiões já
  // desbloqueadas nesta sessão (evita desbloquear a mesma região duas
  // vezes) — ver worldencounter/regionProgression.ts +
  // objectives/objectiveLayer.ts.
  unlockedRegionIds: string[];
}
