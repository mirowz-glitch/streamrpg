import type { AdventureStatistics } from "../adventure/types.js";

// Gameplay Balance & First Playable Experience Phase I — tipos
// isolados de propósito. O Simulador é um OBSERVADOR externo (mesmo
// espírito da Presentation Layer sobre o Adventure Loop): nunca
// duplica lógica de combate/loot/XP, só chama
// advanceAdventureWithPresentation() em loop e registra o que já
// acontece de verdade.

export interface SimulatedAdventureOptions {
  regionId: string;
  seed: number;
  classId?: string;
  // "Tempo" aqui é uma suposição de UX documentada, não uma medição
  // real: cada tick representa um clique em "Avançar" (um encontro
  // inteiro resolvido). Assume-se que um jogador real leva em média
  // `secondsPerTick` segundos por clique (ler popups, acompanhar
  // animações, decidir) — ver simulator.ts.
  secondsPerTick?: number;
  maxSimulatedSeconds?: number;
  inventoryCapacity?: number;
  autoEquip?: boolean;
  // Recovery & Adventure Flow Phase I — requisito 6: "gerar comparação
  // antes x depois" — desligar a Recovery Layer reproduz exatamente o
  // comportamento "antes" desta Sprint (advanceAdventureWithPresentation
  // puro), sem precisar de um segundo caminho de código. Default: true
  // (a Recovery Layer é o comportamento real da demo a partir de agora).
  enableRecovery?: boolean;
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 10: "executar 100 Dungeons completas" de forma confiável exige
  // medir UMA Expedição específica, não esperar que a seleção
  // automática (selectExpeditionDefinitionId, aleatória entre
  // candidatas do mesmo bioma inicial) a sorteie por acaso. Quando
  // presente, pré-registra um ExpeditionStarted pra esta Expedição
  // ANTES da 1ª tick real (ver simulator.ts) — o Expedition Controller
  // (intocado) então só continua rastreando o progresso dela
  // normalmente, exatamente como faria se a tivesse sorteado sozinho.
  // Nunca usado pela demo real (apps/web/), só pelo Simulador.
  forceExpeditionId?: string;
}

export interface SimulatedAdventureResult {
  regionId: string;
  seed: number;
  survived: boolean;
  simulatedSeconds: number;
  ticks: number;
  finalLevel: number;
  statistics: AdventureStatistics;
  xpGained: number;
  // Contagem de LootDropped por raridade ao longo de toda a sessão —
  // varrendo só a própria Adventure Timeline já produzida, nunca uma
  // nova consulta ao Inventory/Item Generator.
  rarityCounts: Record<string, number>;
  // Recovery & Adventure Flow Phase I — requisito 7: soma de todo
  // RecoveryApplied.lifeHealed da sessão (0 quando enableRecovery é
  // false, ou quando nenhuma recuperação ainda ocorreu).
  lifeRecovered: number;
  // Objectives, Missions & Player Goals Phase I — requisito 9: quantos
  // ObjectiveCompleted aconteceram nesta sessão, quanto XP bônus eles
  // concederam no total, e em que segundo simulado cada um aconteceu
  // (usado pra calcular "tempo médio por objetivo" no relatório).
  objectivesCompleted: number;
  objectiveXpBonusGranted: number;
  objectiveCompletionSeconds: number[];
  // Biomes, Regions & World Progression Phase I — requisito 8: "regiões
  // alcançadas, tempo por região, mortes por região, loot por região,
  // objetivos concluídos por região" — reconstruído a partir dos
  // RegionEntered já emitidos (ver simulator.ts: buildRegionSegments),
  // nenhum estado extra guardado durante o laço de simulação.
  regionsVisited: string[];
  perRegionSeconds: Record<string, number>;
  perRegionItemsFound: Record<string, number>;
  perRegionObjectivesCompleted: Record<string, number>;
  diedInRegion: string | null;
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 8: "elites
  // encontrados, mini-bosses encontrados, taxa de vitória, loot obtido,
  // XP adicional" — contado varrendo EliteEncounter/MiniBossEncounter/
  // EliteDefeated/MiniBossDefeated já emitidos (ver presentation/types.ts
  // sobre os dois canais de observação, vitória e derrota). `encountered`
  // >= `defeated` sempre (derrota é encontrado sem derrotado).
  eliteEncountered: number;
  eliteDefeated: number;
  miniBossEncountered: number;
  miniBossDefeated: number;
  variantXpBonusGranted: number;
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 8: "eventos encontrados; frequência; bioma; recompensa; impacto na
  // sobrevivência; XP; loot" — contado varrendo WorldEventStarted/
  // TreasureOpened/MerchantFound/ShrineBlessing/DiscoveryMade já
  // emitidos (mesmo princípio de "observar eventos existentes" de
  // sempre). `worldEventRecoveryGained` fica SEPARADO de
  // `lifeRecovered` (Recovery Layer) de propósito — são dois
  // mecanismos de cura genuinamente diferentes (percentual por
  // encontro x quantidade fixa de Shrine), nunca a mesma fonte.
  worldEventsEncountered: number;
  worldEventCountByCategory: Record<string, number>;
  worldEventGoldGained: number;
  worldEventXpGained: number;
  worldEventLootItemsGained: number;
  worldEventRecoveryGained: number;
  // Expeditions, Checkpoints & Long Session Progression Phase I —
  // requisito 9: "duração média, checkpoints atingidos, conclusão,
  // falhas, elites, mini-bosses, eventos, loot, XP" — os "elites/
  // mini-bosses/eventos/loot" já vêm dos campos acima (a Expedição só
  // organiza os MESMOS encontros, nunca duplica a contagem); aqui só o
  // que é genuinamente novo desta Sprint (início/checkpoint/conclusão/
  // falha/recompensa final), contado varrendo ExpeditionStarted/
  // ExpeditionCheckpointReached/ExpeditionCompleted/ExpeditionFailed já
  // emitidos.
  expeditionsStarted: number;
  expeditionsCompleted: number;
  expeditionsFailed: number;
  expeditionCheckpointsReached: number;
  expeditionXpGained: number;
  expeditionGoldGained: number;
  averageExpeditionDurationSeconds: number;
  // Factions, Reputation & World Consequences Phase I — requisito 7:
  // "reputação média; ranks; bônus; distribuição" — contado varrendo
  // ReputationChanged/ReputationRankUp já emitidos (mesmo princípio de
  // "observar eventos existentes" de sempre). `factionFinalReputation`/
  // `factionFinalRank` sempre têm uma entrada por facção (0/"neutro"
  // quando nenhum gatilho a alcançou nesta execução).
  factionFinalReputation: Record<string, number>;
  factionFinalRank: Record<string, string>;
  reputationEventsCount: number;
  rankUpEventsCount: number;
  factionXpBonusGained: number;
  factionGoldBonusGained: number;
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 10: "taxa de conclusão; derrotas no Boss; tempo médio; XP; loot;
  // reputação" — contado varrendo FinalBossEncounter/FinalBossDefeated/
  // DungeonCompleted já emitidos (mesmo princípio de "observar eventos
  // existentes" de sempre). `dungeonsStarted`/`dungeonsFailed`
  // distinguem Expedições-Dungeon das Expedições regulares já contadas
  // em `expeditionsStarted`/`expeditionsFailed` acima (que somam TODAS
  // as Expedições, não só Dungeons).
  dungeonsStarted: number;
  dungeonsCompleted: number;
  dungeonsFailed: number;
  finalBossEncountered: number;
  finalBossDefeated: number;
  dungeonXpGranted: number;
  dungeonGoldGranted: number;
  dungeonReputationGranted: number;
  averageDungeonDurationSeconds: number;
  // Boss Balance Report (pedido explícito do usuário após a entrega da
  // Sprint) — "verificar se o Boss é realmente um clímax." Capturado AO
  // VIVO durante o laço de ticks (não reconstruído depois): precisa do
  // estado real de `session.character` no EXATO instante da derrota
  // (HP restante), e do `AttackHit`/`RecoveryApplied` da MESMA tick
  // (mesma limitação estrutural de sempre — combate resolve inteiro por
  // tick, "duração da luta" nunca tem granularidade menor que 1 tick).
  // Somas simples (não arrays) — cada execução tipicamente enfrenta o
  // Chefe no máximo 1-2 vezes; o Relatório divide pelo total de
  // encontros/derrotas agregados entre todas as execuções.
  bossDamageDealtTotal: number;
  bossDamageTakenTotal: number;
  bossHealthPercentAfterDefeatTotal: number;
  bossRecoveryCountBeforeFirstEncounter: number;
  bossFirstEncounterTicks: number;
  // Balance, Pacing & Player Experience Phase I — Fase 1 (Diagnóstico):
  // capturado AO VIVO durante o laço de ticks pelo MESMO motivo já
  // documentado acima pro Boss Balance Report — precisa do estado real
  // de `session.character` no exato instante (HP corrente/máximo), que
  // um passe pós-hoc não reconstrói.
  //
  // "Tempo até o 1º Elite/Mini-Boss/World Event": -1 quando nunca
  // aconteceu nesta execução (ausência de dado, nunca um "tempo
  // infinito" fabricado).
  secondsToFirstElite: number;
  secondsToFirstMiniBoss: number;
  secondsToFirstWorldEvent: number;
  // "HP médio/mínimo": soma de (currentLife/maximumLife*100) a cada
  // tick + contagem de amostras (pra média ponderada corretamente ao
  // agregar entre execuções de duração diferente no Relatório).
  hpPercentSum: number;
  hpPercentSamples: number;
  minHpPercentObserved: number;
  // "Mortes por Elite/Mini-Boss/Boss": causa da morte, derivada do
  // mesmo sinal já usado por Elites/Mini-Bosses (session.currentEncounter
  // nunca é zerado quando o personagem morre lutando) + FinalBossEncounter
  // (Chefe Final, ver dungeon/) — "normal" quando nenhum variant/Chefe
  // estava envolvido, `null` quando a execução sobreviveu.
  deathCause: "elite" | "miniboss" | "boss" | "normal" | null;
  // "Cura desperdiçada" (overheal): a parte de cada RecoveryApplied.lifeHealed
  // que excedeu o quanto realmente faltava pra encher a vida (lifeHealed
  // - (lifeAfter - lifeBefore)) — sempre >= 0, computável só observando
  // o próprio evento já existente (RecoveryApplied já carrega os 3
  // campos), nenhuma captura ao vivo adicional necessária.
  lifeWasted: number;
  // Dungeon: recuperação de checkpoint recebida/desperdiçada (mesmo
  // princípio de `lifeWasted` acima, mas só pra ExpeditionCheckpointReached),
  // e HP % antes/depois de cada checkpoint (pra medir "HP ao entrar/sair
  // do checkpoint" pedido na Fase 1).
  dungeonRecoveryReceived: number;
  dungeonRecoveryWasted: number;
  checkpointHpBeforePercentSum: number;
  checkpointHpAfterPercentSum: number;
  checkpointHpSamples: number;
  // Dungeon: morte ANTES de avistar o Chefe (0 ou 1) vs morte NA MESMA
  // tick em que o Chefe foi avistado sem derrotá-lo (0 ou 1) — só
  // preenchido quando a execução de fato morreu dentro de uma Dungeon.
  dungeonDeathBeforeBoss: number;
  dungeonDeathAtBoss: number;
  // Facções: tempo (em ticks) até a 1ª vez que QUALQUER facção alcança
  // os ranks "amigavel"/"respeitado" — -1 quando nunca aconteceu.
  ticksToAmigavel: number;
  ticksToRespeitado: number;
  // Loot: Power Score final equipado por slot (do último ItemEquipped
  // de cada slotId) — usado no Relatório pra apontar "slots mais
  // fracos" (média mais baixa entre execuções).
  finalSlotPowerScores: Record<string, number>;
  // Dungeon: checkpoints atingidos ENQUANTO uma Dungeon estava ativa
  // (distinto de `expeditionCheckpointsReached`, que soma TODAS as
  // Expedições).
  dungeonCheckpointsReached: number;

  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 1 (Jornada Completa/5, "timeline de marcos"): tempo
  // (segundos simulados) até cada marco da jornada, -1 quando nunca
  // aconteceu nesta execução (ausência de dado, mesmo princípio de
  // secondsToFirstElite/MiniBoss/WorldEvent acima). Elite/MiniBoss/
  // WorldEvent já existiam (Sprint anterior) — só os que faltavam pra
  // completar a timeline pedida (1º item, 1ª conclusão de Expedição, 1º
  // início de Dungeon, 1ª derrota do Chefe) são adicionados aqui.
  secondsToFirstItem: number;
  secondsToFirstExpeditionCompletion: number;
  secondsToFirstDungeonStart: number;
  secondsToFirstBossDefeat: number;
  // Fase 1 (Progressão de Equipamentos): "tempo até primeiro upgrade;
  // upgrades consecutivos; períodos longos sem upgrade." Um "upgrade" =
  // ItemEquipped cujo powerScore excede o previousPowerScore (ambos já
  // carregados pelo evento existente, ver presentation/types.ts) — nunca
  // uma nova noção de "melhoria" inventada. `longestGapWithoutUpgradeSeconds`
  // inclui o intervalo final (do último upgrade até o fim da sessão),
  // pra não esconder um "deserto de loot" que só começa perto do fim.
  firstUpgradeSeconds: number;
  upgradeCount: number;
  longestGapWithoutUpgradeSeconds: number;
  // Fase 1 (Ritmo): "tempo médio gasto em combate/recuperação/
  // exploração/checkpoints/boss." Cada tick é classificado por
  // PRIORIDADE (boss > checkpoint > combate > exploração > recuperação
  // > outro) a partir dos PresentationEvent já emitidos nele — nenhuma
  // nova categoria de tick inventada, só uma leitura classificatória do
  // que a própria tick já continha. Soma em segundos (ticks *
  // secondsPerTick), reconstruído com o mesmo princípio de
  // `secondsPerTick` já usado em todo o resto do Simulador.
  rhythmCombatSeconds: number;
  rhythmRecoverySeconds: number;
  rhythmExplorationSeconds: number;
  rhythmCheckpointSeconds: number;
  rhythmBossSeconds: number;
  // Fase 1 (Curva de Dificuldade, "por região"): "HP médio restante;
  // dano recebido; dano causado; recuperação utilizada; recuperação
  // desperdiçada." HP% é capturado AO VIVO (mesmo motivo de hpPercentSum
  // global: precisa do estado exato de `session.character` a cada
  // tick, um passe pós-hoc não reconstrói) lendo `session.currentRegion`
  // no mesmo instante. Dano/recuperação são somados PÓS-HOC a partir de
  // AttackHit/RecoveryApplied já existentes, cruzados com a região via
  // `regionAtTick` (mesmo helper já usado por perRegionItemsFound) —
  // "taxa de morte"/"causa da morte" por região já são deriváveis no
  // Relatório cruzando `diedInRegion` (já existente) com `deathCause`
  // (já existente), sem precisar de mais um campo aqui.
  perRegionHpPercentSum: Record<string, number>;
  perRegionHpPercentSamples: Record<string, number>;
  perRegionDamageDealt: Record<string, number>;
  perRegionDamageTaken: Record<string, number>;
  perRegionRecoveryReceived: Record<string, number>;
  perRegionRecoveryWasted: Record<string, number>;

  // Boss Accessibility & Endgame Balance Phase I — Fase 1 (Estado do
  // Personagem no momento em que o Boss é encontrado): capturado AO
  // VIVO no exato tick de FinalBossEncounter (ver simulator.ts) — -1
  // quando o Boss nunca foi encontrado nesta execução (ausência de
  // dado, mesmo princípio de sempre).
  bossEncounterCharacterLevel: number;
  bossEncounterMaxLife: number;
  bossEncounterHpPercent: number;
  // "DPS estimado" = dano físico x velocidade de ataque no momento do
  // encontro (sem considerar crítico) — aproximação simples e honesta,
  // documentada em simulator.ts, não uma 2ª fonte de verdade de dano.
  bossEncounterEstimatedDps: number;
  bossEncounterGold: number;
  bossEncounterReputationTotal: number;
  bossEncounterAverageRarityScore: number;
  bossEncounterEncountersCompleted: number;
  bossEncounterCheckpointsUsed: number;
  // Fase 1 (Boss Fight): "HP restante do Boss ao morrer" — o inverso
  // de bossHealthPercentAfterDefeatTotal (que só existe pra vitórias).
  // -1 quando o personagem nunca perdeu pra ele (nunca encontrou, ou
  // sempre venceu).
  bossHpPercentRemainingOnPlayerLoss: number;
}

export interface BalanceSimulationOptions {
  runs?: number;
  regionIds?: string[];
  seedBase?: number;
  secondsPerTick?: number;
  maxSimulatedSeconds?: number;
  enableRecovery?: boolean;
}

// Balance, Pacing & Player Experience Phase I — Fase 1 (Sobrevivência):
// "HP médio; HP mínimo; mortes por região/Elite/Mini-Boss/Boss" —
// `averageHpPercent`/`minHpPercentObserved` são médias ponderadas por
// amostra (não por execução — execuções mais longas contribuem mais
// amostras, refletindo honestamente onde o tempo de jogo realmente foi
// gasto). `deathsByX` somam 100% de `deathRate` (mutuamente exclusivos).
export interface SurvivalStats {
  averageSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  deathRate: number;
  averageHpPercent: number;
  minHpPercentObserved: number;
  deathsByElite: number;
  deathsByMiniBoss: number;
  deathsByBoss: number;
  deathsByNormal: number;
}

// Fase 1 (Progressão): "XP por minuto; ouro por minuto; loot por
// minuto; tempo até 1º Elite/Mini-Boss/World Event." Os "por minuto"
// são derivados diretamente de campos JÁ existentes
// (xpGained/statistics.goldFound/statistics.itemsFound / simulatedSeconds)
// — nenhuma captura nova precisou ser adicionada ao Simulador pra eles.
// `averageSecondsToFirstX` só considera execuções em que aquele evento
// de fato aconteceu (ausência de dado, nunca "infinito" fabricado).
export interface ProgressionStats {
  averageFinalLevel: number;
  levelDistribution: Record<number, number>;
  averageXpGained: number;
  xpPerMinute: number;
  goldPerMinute: number;
  lootPerMinute: number;
  averageSecondsToFirstElite: number;
  averageSecondsToFirstMiniBoss: number;
  averageSecondsToFirstWorldEvent: number;
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 1 (Curva de Progressão): "tempo até 1ª conclusão de
  // Expedição; tempo até 1ª Dungeon; tempo até 1º Boss." Mesmo princípio
  // de ausência de dado (-1 filtrado) já usado acima.
  averageSecondsToFirstItem: number;
  averageSecondsToFirstExpeditionCompletion: number;
  averageSecondsToFirstDungeonStart: number;
  averageSecondsToFirstBossEncounter: number;
  averageSecondsToFirstBossDefeat: number;
}

// Fase 1 (Progressão de Equipamentos): "tempo até 1º upgrade; upgrades
// consecutivos; períodos longos sem upgrade; slots mais atrasados;
// raridade média por região." `upgradesPerMinute` reaproveita a mesma
// convenção de taxa-por-minuto já usada em ProgressionStats.
export interface EquipmentProgressionStats {
  averageSecondsToFirstUpgrade: number;
  averageUpgradeCount: number;
  upgradesPerMinute: number;
  averageLongestGapWithoutUpgradeSeconds: number;
  // Fase 2 (Loot): "deserto de loot" — fração de execuções cujo maior
  // intervalo sem upgrade excede `LOOT_DESERT_THRESHOLD_SECONDS`
  // (definido em report.ts, mesmo princípio de limiar ilustrativo já
  // usado em todo o resto do projeto).
  lootDesertRate: number;
}

// Fase 1 (Ritmo): "tempo médio gasto em combate/recuperação/exploração/
// checkpoints/boss." Cada campo é a MÉDIA (segundos) entre execuções —
// não precisam somar 100% do tempo total (alguns ticks não se encaixam
// em nenhuma categoria, ver simulator.ts).
export interface RhythmStats {
  averageCombatSeconds: number;
  averageRecoverySeconds: number;
  averageExplorationSeconds: number;
  averageCheckpointSeconds: number;
  averageBossSeconds: number;
}

// Fase 1 (Jornada do Jogador): "gerar uma timeline automática... medir
// quanto tempo leva para cada marco." Cada marco reaproveita uma média
// JÁ calculada em algum lugar do relatório (nenhum novo cálculo
// duplicado) — só reorganizados aqui na ordem cronológica esperada.
export interface JourneyMilestone {
  label: string;
  averageSeconds: number;
}

// Fase 1 (Loot): "raridade média; upgrades encontrados; upgrades
// equipados; slots mais fracos; itens nunca utilizados; ouro
// acumulado." `averageItemsNeverUsed` é uma aproximação honesta
// (itemsFound - itemsEquipped, o Inventory não distingue "nunca visto"
// de "visto e descartado" — dado que falta, não lógica que falta).
// `weakestSlotId` é o slot com a menor média de Power Score final entre
// as execuções que chegaram a equipar algo nele.
export interface LootStats {
  averageItemsFound: number;
  averageItemsEquipped: number;
  rarityCounts: Record<string, number>;
  // Fase 1 (Loot): "raridade média" — índice médio ponderado da
  // raridade dentro de ITEM_GEN_RARITIES (itemgen/rarities.ts), a
  // própria ordem já usada como tabela de dados pelo Item Generator
  // (0 = common, ..., N-1 = a raridade mais alta definida). Nenhuma
  // ordem nova é inventada aqui.
  averageRarityScore: number;
  averageItemsNeverUsed: number;
  averageGoldAccumulated: number;
  slotAveragePowerScore: Record<string, number>;
  weakestSlotId: string | null;
}

export interface CombatStats {
  averageDamageDealt: number;
  averageDamageTaken: number;
  averageEncountersCompleted: number;
}

// Recovery & Adventure Flow Phase I — requisito 7: "HP recuperado / HP
// perdido / eficiência da recuperação / sobrevivência". `efficiency` =
// lifeRecovered / damageTaken (0 quando não houve dano nenhum) — mede
// se a cura está acompanhando o dano recebido, não um valor absoluto.
// Fase 1 (Recovery): "HP recuperado; HP perdido; overheal; cura
// desperdiçada; eficiência." `averageOverheal` observa só o próprio
// RecoveryApplied (lifeHealed - (lifeAfter-lifeBefore)) — nenhuma
// captura nova, só uma leitura adicional do mesmo evento já existente.
export interface RecoveryStats {
  averageLifeRecovered: number;
  averageLifeLost: number;
  efficiency: number;
  averageOverheal: number;
}

// Objectives, Missions & Player Goals Phase I — requisito 9/10:
// "objetivos concluídos, tempo médio, bônus de XP, taxa de conclusão."
// `averageFirstObjectiveSeconds` mede especificamente o requisito 10
// ("primeiro objetivo concluído em menos de 2 minutos") separado da
// média geral entre objetivos.
export interface ObjectiveStats {
  averageObjectivesCompleted: number;
  averageSecondsPerObjective: number;
  averageFirstObjectiveSeconds: number;
  averageXpBonusGranted: number;
  completionRate: number;
}

export interface RegionBreakdown {
  regionId: string;
  runs: number;
  deaths: number;
  deathRate: number;
  averageSurvivalSeconds: number;
  averageFinalLevel: number;
}

// Biomes, Regions & World Progression Phase I — requisito 8/9: uma
// linha por região JÁ ALCANÇADA (não só a região inicial, como
// RegionBreakdown acima) — "tempo por região, mortes por região, loot
// por região, objetivos concluídos por região". `reachRate` = fração
// das execuções que chegou a visitar esta região (evidência de
// "progressão contínua", requisito 9).
export interface RegionProgressionBreakdown {
  regionId: string;
  runsReached: number;
  reachRate: number;
  averageSecondsSpent: number;
  deaths: number;
  deathRate: number;
  averageItemsFound: number;
  averageObjectivesCompleted: number;
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 1 (Curva de Dificuldade): "HP médio restante; dano
  // recebido; dano causado; causa da morte; recuperação utilizada;
  // recuperação desperdiçada," tudo por região.
  averageHpPercent: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  averageRecoveryReceived: number;
  averageRecoveryWasted: number;
  deathsByElite: number;
  deathsByMiniBoss: number;
  deathsByBoss: number;
  deathsByNormal: number;
}

// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 8/9: "elites
// encontrados, mini-bosses encontrados, taxa de vitória, loot obtido,
// XP adicional." `winRate` = defeated/encountered (1 quando nenhum foi
// encontrado — sem dado, não "0% de vitória"); `frequency` = execuções
// com ao menos 1 encontro / total de execuções, o dado que o requisito
// 9 ("frequência correta?") verifica contra `variantChances` da tabela.
export interface VariantEncounterStats {
  totalEncountered: number;
  totalDefeated: number;
  winRate: number;
  runsWithEncounter: number;
  frequency: number;
}

export interface EliteMiniBossStats {
  elite: VariantEncounterStats;
  miniBoss: VariantEncounterStats;
  averageVariantXpBonus: number;
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 8/9: "eventos encontrados; frequência; bioma; recompensa; impacto na
// sobrevivência; XP; loot." `frequency` aqui é POR CATEGORIA — a fração
// de execuções que viu ao menos 1 evento dessa categoria (mesmo
// princípio de `VariantEncounterStats.frequency`, Elites/Mini-Bosses).
export interface WorldEventCategoryBreakdown {
  category: string;
  totalEncountered: number;
  averagePerRun: number;
  frequency: number;
}

export interface WorldEventStats {
  totalEncountered: number;
  averagePerRun: number;
  frequency: number;
  perCategory: WorldEventCategoryBreakdown[];
  averageGoldGained: number;
  averageXpGained: number;
  averageLootItemsGained: number;
  averageRecoveryGained: number;
  // "Impacto na sobrevivência": taxa de morte comparada entre execuções
  // que encontraram ao menos 1 World Event e as que não encontraram
  // nenhum — o dado mais honesto disponível pra medir impacto sem
  // inventar uma correlação causal que o Simulador não consegue provar
  // sozinho.
  deathRateWithEvents: number;
  deathRateWithoutEvents: number;
}

// Expeditions, Checkpoints & Long Session Progression Phase I —
// requisito 9: "duração média, checkpoints atingidos, conclusão,
// falhas, elites, mini-bosses, eventos, loot, XP" — os "elites/mini-
// bosses/eventos/loot" já aparecem em `eliteMiniBoss`/`worldEvents`
// acima (a Expedição só organiza os MESMOS encontros, nunca duplica a
// contagem); aqui só o que é genuinamente novo (início/checkpoint/
// conclusão/falha/recompensa final). `averageCheckpointsReached` é por
// EXPEDIÇÃO ENCERRADA (concluída ou falhada), não por execução —
// mistura os dois numeradores daria uma média sem significado quando
// uma execução tem 0 expedições encerradas.
export interface ExpeditionStats {
  totalStarted: number;
  totalCompleted: number;
  totalFailed: number;
  completionRate: number;
  averageCheckpointsReached: number;
  averageDurationSeconds: number;
  averageXpGained: number;
  averageGoldGained: number;
}

// Factions, Reputation & World Consequences Phase I — requisito 7/8:
// "reputação média; ranks; bônus; distribuição" — uma linha por
// facção com a reputação média alcançada (ao fim de cada execução) e a
// distribuição de rank final entre todas as execuções.
export interface FactionBreakdown {
  factionId: string;
  factionName: string;
  averageFinalReputation: number;
  rankDistribution: Record<string, number>;
}

// Fase 1 (Facções): "tempo até Amigável; tempo até Respeitado" — só
// considera execuções em que QUALQUER facção de fato alcançou aquele
// rank (ausência de dado, nunca "infinito" fabricado).
export interface FactionStats {
  perFaction: FactionBreakdown[];
  averageReputationEventsPerRun: number;
  averageRankUpsPerRun: number;
  averageXpBonusGranted: number;
  averageGoldBonusGranted: number;
  averageSecondsToAmigavel: number;
  averageSecondsToRespeitado: number;
}

// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
// 10/11: "taxa de conclusão; derrotas no Boss; tempo médio; XP; loot;
// reputação" + "Boss impossível? Boss trivial? recompensa excessiva?
// insuficiente?" `bossWinRate` cai pra 1 (não "0%") quando o Chefe nunca
// foi encontrado — ausência de dado, mesmo princípio de
// VariantEncounterStats.winRate (Elites/Mini-Bosses).
export interface DungeonStats {
  totalStarted: number;
  totalCompleted: number;
  totalFailed: number;
  completionRate: number;
  bossEncountered: number;
  bossDefeated: number;
  bossWinRate: number;
  averageDurationSeconds: number;
  averageXpGranted: number;
  averageGoldGranted: number;
  averageReputationGranted: number;
  boss: BossBalanceStats;
  // Balance, Pacing & Player Experience Phase I — Fase 1 (Dungeon):
  // "encontros médios; checkpoints utilizados; recuperação recebida;
  // recuperação desperdiçada; mortes antes do Boss; mortes no Boss."
  // `averageEncountersCompleted` reaproveita a MESMA contagem genérica
  // já existente por execução (nenhum campo novo — soma de
  // `statistics.encountersCompleted` só das execuções que tentaram a
  // Dungeon, ver report.ts). `averageCheckpointHpBeforePercent`/`...AfterPercent`
  // medem o "HP ao entrar/sair do checkpoint" pedido explicitamente.
  averageEncountersCompleted: number;
  averageCheckpointsUsed: number;
  averageRecoveryReceived: number;
  averageRecoveryWasted: number;
  averageCheckpointHpBeforePercent: number;
  averageCheckpointHpAfterPercent: number;
  deathsBeforeBoss: number;
  deathsAtBoss: number;
}

// Boss Balance Report — pedido explícito do usuário: "verificar se o
// Boss é realmente percebido como um clímax", não só uma extensão
// arquitetural correta. `fightDurationSeconds` é sempre exatamente
// `secondsPerTick` (documentado honestamente, não fabricado): o
// combate resolve inteiro dentro de UMA tick (Adventure Loop, invariante
// já documentada em presentation/types.ts) — não existe granularidade
// menor pra medir "quanto tempo durou a luta em si". Como proxy real de
// ritmo, `averageSecondsUntilEncountered` mede quanto tempo decorre
// ATÉ o Chefe aparecer (isso sim varia de execução pra execução).
// `averageHealthPercentAfterDefeat` cai pra 0 (não NaN) quando o Chefe
// nunca foi derrotado — ausência de dado.
export interface BossBalanceStats {
  averageDamageDealtPerFight: number;
  averageDamageTakenPerFight: number;
  averageDpsDealt: number;
  averageDpsTaken: number;
  averageHealthPercentAfterDefeat: number;
  averageRecoveryCountBeforeFight: number;
  averageSecondsUntilEncountered: number;
  fightDurationSeconds: number;
  completionRateWithBossEncountered: number;
  completionRateWithoutBossEncountered: number;
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Boss Balance Report atualizado: "taxa de chegada; tempo
  // até derrotar o Chefe." `arrivalRate` = execuções que encontraram o
  // Chefe / total de execuções (distinto de `bossWinRate`, que já
  // existia — este mede quem CHEGA, não quem VENCE). `averageSecondsUntilDefeated`
  // só considera execuções que de fato derrotaram o Chefe (ausência de
  // dado, nunca "infinito" fabricado).
  arrivalRate: number;
  averageSecondsUntilDefeated: number;
}

// Boss Accessibility & Endgame Balance Phase I — Fase 1 (Estado do
// Personagem no momento em que o Boss é encontrado): médias entre as
// execuções que de fato o encontraram — só `averageBossHpPercentRemainingOnLoss`
// é calculada sobre as execuções que PERDERAM pra ele especificamente
// (ausência de dado quando nenhuma execução perdeu, ver report.ts).
export interface BossEncounterProfileStats {
  averageCharacterLevel: number;
  averageMaxLife: number;
  averageHpPercent: number;
  averageEstimatedDps: number;
  averageGold: number;
  averageReputationTotal: number;
  averageRarityScore: number;
  averageEncountersCompleted: number;
  averageCheckpointsUsed: number;
  averageBossHpPercentRemainingOnLoss: number;
}

export interface BalanceReport {
  totalRuns: number;
  survival: SurvivalStats;
  progression: ProgressionStats;
  loot: LootStats;
  combat: CombatStats;
  recovery: RecoveryStats;
  objectives: ObjectiveStats;
  perRegion: RegionBreakdown[];
  regionProgression: RegionProgressionBreakdown[];
  eliteMiniBoss: EliteMiniBossStats;
  worldEvents: WorldEventStats;
  expeditions: ExpeditionStats;
  factions: FactionStats;
  dungeon: DungeonStats;
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 1 (itens 3/4/5): ritmo, progressão de equipamentos e
  // a timeline de marcos da jornada.
  equipmentProgression: EquipmentProgressionStats;
  rhythm: RhythmStats;
  journeyTimeline: JourneyMilestone[];
  // Boss Accessibility & Endgame Balance Phase I — Fase 1 (Estado do
  // Personagem no momento em que o Boss é encontrado).
  bossEncounterProfile: BossEncounterProfileStats;
  // Requisito 10 — "derivadas apenas das estatísticas coletadas":
  // nunca menciona uma região/inimigo por nome fora do que os próprios
  // dados agregados apontarem.
  recommendations: string[];
}
