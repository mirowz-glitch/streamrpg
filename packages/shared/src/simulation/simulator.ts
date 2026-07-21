import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../adventure/session.js";
import { equipStarterKit } from "../adventure/starterKit.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "../presentation/presentationLayer.js";
import type { PresentationEvent } from "../presentation/types.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { isDungeonExpedition } from "../dungeon/dungeonDefinitions.js";
import { getExpeditionDefinition } from "../expeditions/expeditionDefinitions.js";
import { FACTION_DEFINITIONS } from "../factions/factionDefinitions.js";
import { deriveFactionReputation } from "../factions/factionProgress.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import { ITEM_GEN_RARITIES } from "../itemgen/rarities.js";
import type { BalanceSimulationOptions, SimulatedAdventureOptions, SimulatedAdventureResult } from "./types.js";

// 22s/tick: suposição de UX pra um jogador de primeira viagem que
// acompanha os popups/animações/celebrações da Presentation Layer e da
// Progression UI (loot popup, equipment pulse, level-up banner,
// floating numbers) antes de clicar em "Avançar" de novo — mais realista
// que um clique instantâneo. Calibrado junto com xpRewardForKill()
// (xp.ts) via o próprio Simulador.
const DEFAULT_SECONDS_PER_TICK = 22;
// 10 minutos — a janela pedida pela Sprint ("primeira experiência
// jogável durante os primeiros 10 minutos").
const DEFAULT_MAX_SIMULATED_SECONDS = 600;
const DEFAULT_CLASS_ID = "warrior";
const DEFAULT_INVENTORY_CAPACITY = 24;
const SIM_CHARACTER_PREFIX = "sim";

// As duas únicas regiões cuja Encounter Table começa em nível 1
// (bosque-sussurrante/pantano-podre, ver worldencounter/
// encounterTables.ts) — a única apropriada pra um personagem recém-
// criado. Nenhuma região nova, só a leitura do que já existe.
//
// Vertical Slice — Player Journey, Retention & First Hour Experience
// Phase I — Fase 3: pântano-podre deixou de ser uma região de entrada
// (levelRange.min subiu de 1 pra 5, ver encounterTables.ts, pra dar
// espaço real de jogo em bosque-sussurrante antes da transição — ver
// nota em biomes.ts sobre a reordenação de BIOME_PROGRESSION). Um
// personagem nível 1 gerado direto em pântano-podre (como o Simulador
// fazia antes, 50/50 com bosque) enfrentaria inimigos artificialmente
// escalados pro nível 5, um cenário que nunca acontece em jogo real —
// mesma lição já aplicada a toda região com gate de nível > 1.
export const STARTER_REGION_IDS = ["bosque-sussurrante"];

// Biomes, Regions & World Progression Phase I — requisito 8: "regiões
// alcançadas, tempo por região, mortes por região, loot por região,
// objetivos concluídos por região." Reconstrói em que região cada tick
// aconteceu a partir dos próprios RegionEntered já emitidos (Objective
// System) — nenhum estado novo guardado durante o laço, só uma
// varredura da Timeline depois que a aventura termina (mesmo princípio
// de "observar eventos existentes" do resto do projeto).
interface RegionSegment {
  regionId: string;
  fromTick: number;
  toTick: number;
}

function buildRegionSegments(startRegionId: string, events: readonly PresentationEvent[], finalTick: number): RegionSegment[] {
  const boundaries: { regionId: string; fromTick: number }[] = [{ regionId: startRegionId, fromTick: 0 }];
  for (const event of events) {
    if (event.kind === "RegionEntered") boundaries.push({ regionId: event.regionId, fromTick: event.tickIndex });
  }
  return boundaries.map((boundary, index) => ({
    regionId: boundary.regionId,
    fromTick: boundary.fromTick,
    toTick: index + 1 < boundaries.length ? boundaries[index + 1].fromTick : finalTick,
  }));
}

function regionAtTick(segments: readonly RegionSegment[], tickIndex: number): string {
  const segment = segments.find((s) => tickIndex >= s.fromTick && tickIndex < s.toTick);
  return (segment ?? segments[segments.length - 1]).regionId;
}

// Balance, Pacing & Player Experience Phase I — Fase 1: "mesma técnica
// de fronteira" já usada em dungeon/dungeonController.ts
// (findMostRecentExpeditionId), reescrita aqui só porque aquela função
// é privada/não-exportada (mesmo princípio de sempre — reaproveitar o
// FORMATO, nunca chamar direto uma função interna de outro módulo).
function isCurrentlyInDungeon(events: readonly PresentationEvent[]): boolean {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionStarted") return isDungeonExpedition(event.expeditionId);
    if (event.kind === "ExpeditionCompleted" || event.kind === "ExpeditionFailed") return false;
  }
  return false;
}

// Requisito 8 — Simulação Automatizada: "reutilizando o Adventure Loop
// existente... nenhuma alteração no gameplay, o simulador apenas
// observa." Chama exatamente a mesma advanceAdventureWithPresentation()
// que a demo real (apps/web/src/hooks/useAdventureSession.ts) e os
// testes de todas as Sprints anteriores já usam — nenhuma lógica de
// combate/loot/XP duplicada aqui, só um laço que avança ticks e
// registra o resultado real.
export function runSimulatedAdventure(options: SimulatedAdventureOptions): SimulatedAdventureResult {
  const secondsPerTick = options.secondsPerTick ?? DEFAULT_SECONDS_PER_TICK;
  const maxSimulatedSeconds = options.maxSimulatedSeconds ?? DEFAULT_MAX_SIMULATED_SECONDS;
  const classId = options.classId ?? DEFAULT_CLASS_ID;

  const characterId = `${SIM_CHARACTER_PREFIX}-${options.regionId}-${options.seed}`;
  const build = new CharacterBuild(characterId, classId, 0);
  const inventory = new Inventory(characterId, options.inventoryCapacity ?? DEFAULT_INVENTORY_CAPACITY);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, classId, options.seed);

  const session = createAdventureSession(`${characterId}-session`, character, options.regionId, options.seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);

  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 10: pré-registra a Expedição forçada (quando pedida) ANTES da 1ª
  // tick real — o Expedition Controller (intocado) vê um
  // ExpeditionStarted já presente e simplesmente continua rastreando
  // essa Expedição, em vez de sortear uma nova (ver
  // expeditionController.ts: "if (!beforeExpedition)"). `nextTickIndex`
  // avança pra 1 logo em seguida, garantindo que a 1ª tick REAL nunca
  // reutilize o tickIndex 0 já usado por este evento sintético.
  if (options.forceExpeditionId) {
    const definition = getExpeditionDefinition(options.forceExpeditionId);
    if (definition) {
      timeline.events.push({
        kind: "ExpeditionStarted",
        expeditionId: definition.id,
        name: definition.name,
        regionId: session.currentRegion,
        tickIndex: 0,
        timestamp: 0,
      });
      timeline.nextTickIndex = 1;
    }
  }

  let ticks = 0;
  let survived = true;
  let lifeRecovered = 0;
  // Recovery & Adventure Flow Phase I — requisito 6: "gerar comparação
  // antes x depois" sem duplicar o laço — enableRecovery=false reproduz
  // exatamente o comportamento "antes" (advanceAdventureWithPresentation
  // puro, sem a Recovery Layer).
  const enableRecovery = options.enableRecovery ?? true;

  // Boss Balance Report — capturado AO VIVO durante o laço (não
  // reconstruído depois via um segundo passe pela Timeline): precisa do
  // estado real de `session.character` no EXATO instante da derrota
  // (HP restante), que muda tick a tick — um passe pós-hoc não
  // conseguiria reconstruir "qual era o máximo de vida NAQUELE momento".
  let bossDamageDealtTotal = 0;
  let bossDamageTakenTotal = 0;
  let bossHealthPercentAfterDefeatTotal = 0;
  let bossRecoveryCountBeforeFirstEncounter = 0;
  let bossFirstEncounterTicks = -1;
  let recoveryEventsSoFar = 0;

  // Balance, Pacing & Player Experience Phase I — Fase 1: capturado AO
  // VIVO pelo MESMO motivo do bloco do Boss acima (precisa do estado
  // real de `session.character`/`session.currentEncounter` no exato
  // instante, não reconstruível num passe pós-hoc).
  let secondsToFirstElite = -1;
  let secondsToFirstMiniBoss = -1;
  let secondsToFirstWorldEvent = -1;
  let hpPercentSum = 0;
  let hpPercentSamples = 0;
  let minHpPercentObserved = 100;
  const perRegionHpPercentSum: Record<string, number> = {};
  const perRegionHpPercentSamples: Record<string, number> = {};
  let deathCause: "elite" | "miniboss" | "boss" | "normal" | null = null;
  let dungeonDeathBeforeBoss = 0;
  let dungeonDeathAtBoss = 0;
  let checkpointHpBeforePercentSum = 0;
  let checkpointHpAfterPercentSum = 0;
  let checkpointHpSamples = 0;
  let ticksToAmigavel = -1;
  let ticksToRespeitado = -1;
  let dungeonRecoveryReceivedAccumulator = 0;
  let dungeonRecoveryWastedAccumulator = 0;
  let lifeWasted = 0;

  // Boss Accessibility & Endgame Balance Phase I — Fase 1 (Estado do
  // Personagem no momento em que o Boss é encontrado): captura AO VIVO
  // no EXATO tick de FinalBossEncounter (nível/vida/gear/ouro/reputação
  // não são reconstruíveis depois — o personagem continua evoluindo
  // nos ticks seguintes). `-1`/`null` = Boss nunca encontrado nesta
  // execução (ausência de dado, mesmo princípio de sempre).
  let bossEncounterCharacterLevel = -1;
  let bossEncounterMaxLife = -1;
  let bossEncounterHpPercent = -1;
  let bossEncounterEstimatedDps = -1;
  let bossEncounterGold = -1;
  let bossEncounterReputationTotal = -1;
  let bossEncounterAverageRarityScore = -1;
  let bossEncounterEncountersCompleted = -1;
  let bossEncounterCheckpointsUsed = -1;
  // "HP restante do Boss ao morrer" (o inverso de bossHealthPercentAfterDefeatTotal
  // acima, que só existe pra VITÓRIAS): quanto de vida o Chefe ainda
  // tinha quando o personagem perdeu pra ele — só a 1ª derrota conta
  // (mesmo princípio de "1ª ocorrência" já usado em todo o resto).
  let bossHpPercentRemainingOnPlayerLoss = -1;
  // Contador vivo de checkpoints DENTRO da Dungeon (espelha o mesmo
  // `dungeonCheckpointsReached` calculado pós-hoc mais abaixo, mas
  // precisa existir AO VIVO aqui pra poder ser lido no exato instante
  // do encontro com o Chefe).
  let liveDungeonCheckpointsSoFar = 0;

  while (ticks * secondsPerTick < maxSimulatedSeconds) {
    ticks++;
    const currentTime = ticks * secondsPerTick * 1000;
    const tickOptions = { autoEquip: options.autoEquip ?? true, currentTime };
    const finalStatsBeforeTick = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    const hpPercentBeforeTick = finalStatsBeforeTick.maximumLife > 0 ? (session.character.currentLife / finalStatsBeforeTick.maximumLife) * 100 : 0;

    if (enableRecovery) {
      // First Dungeon, Final Boss & Complete Game Loop Phase I —
      // advanceDungeonTick() já envolve o Faction Controller (que já
      // envolve Expedition/Objective/Recovery/Presentation) por baixo,
      // então este é o único ponto de entrada real da demo/simulador a
      // partir de agora (a mesma ÚNICA linha que muda a cada Sprint).
      const { tickResult, recovery, events } = advanceDungeonTick(session, timeline, tickOptions);
      lifeRecovered += recovery.lifeHealed;

      if (bossFirstEncounterTicks === -1 && events.some((event) => event.kind === "FinalBossEncounter")) {
        bossFirstEncounterTicks = ticks;
        bossRecoveryCountBeforeFirstEncounter = recoveryEventsSoFar;

        // Boss Accessibility & Endgame Balance Phase I — Fase 1: "estado
        // do personagem no momento em que o Boss é encontrado." Usa
        // `finalStatsBeforeTick`/`hpPercentBeforeTick` (já calculados no
        // TOPO do laço, ANTES de advanceDungeonTick rodar) — não o
        // estado pós-tick: o combate contra o Chefe resolve inteiro
        // NESTA MESMA tick (Adventure Loop, invariante documentada em
        // presentation/types.ts), então o estado pós-tick já reflete o
        // resultado da luta (inclusive HP=0 se o personagem morreu) —
        // capturar isso como "estado ao ENCONTRAR o Chefe" fabricaria um
        // 0% de HP artificial pra toda derrota imediata, não o estado
        // real de chegada.
        bossEncounterCharacterLevel = session.character.characterBuild.level;
        bossEncounterMaxLife = finalStatsBeforeTick.maximumLife;
        bossEncounterHpPercent = Math.max(0, hpPercentBeforeTick);
        // "DPS estimado": dano físico x velocidade de ataque, sem
        // considerar crítico — aproximação simples e transparente
        // (documentada, não uma 2ª fonte de verdade de dano real).
        bossEncounterEstimatedDps = finalStatsBeforeTick.physicalDamage * finalStatsBeforeTick.attackSpeed;
        bossEncounterGold = session.statistics.goldFound;
        bossEncounterReputationTotal = FACTION_DEFINITIONS.reduce((sum, definition) => sum + deriveFactionReputation(definition.id, timeline), 0);
        bossEncounterEncountersCompleted = session.statistics.encountersCompleted;
        bossEncounterCheckpointsUsed = liveDungeonCheckpointsSoFar;
        const equippedRarities = session.character.equipment.items
          .map((slot) => slot.item?.rarity)
          .filter((rarity): rarity is NonNullable<typeof rarity> => rarity !== undefined && rarity !== null);
        const rarityRanks = equippedRarities.map((rarity) => ITEM_GEN_RARITIES.findIndex((definition) => definition.id === rarity)).filter((rank) => rank >= 0);
        bossEncounterAverageRarityScore = rarityRanks.length > 0 ? rarityRanks.reduce((sum, rank) => sum + rank, 0) / rarityRanks.length : 0;
      }
      for (const event of events) {
        if (event.kind === "RecoveryApplied") recoveryEventsSoFar++;
      }
      const bossDefeatedEvent = events.find((event) => event.kind === "FinalBossDefeated");
      if (bossDefeatedEvent) {
        const attackHitEvent = events.find((event) => event.kind === "AttackHit");
        if (attackHitEvent && attackHitEvent.kind === "AttackHit") {
          bossDamageDealtTotal += attackHitEvent.damageDealt;
          bossDamageTakenTotal += attackHitEvent.damageTaken;
        }
        const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
        bossHealthPercentAfterDefeatTotal +=
          finalStats.maximumLife > 0 ? Math.max(0, (session.character.currentLife / finalStats.maximumLife) * 100) : 0;
      }

      // Fase 1 — "tempo até 1º Elite/Mini-Boss/World Event".
      if (secondsToFirstElite === -1 && events.some((event) => event.kind === "EliteEncounter")) secondsToFirstElite = ticks * secondsPerTick;
      if (secondsToFirstMiniBoss === -1 && events.some((event) => event.kind === "MiniBossEncounter")) secondsToFirstMiniBoss = ticks * secondsPerTick;
      if (secondsToFirstWorldEvent === -1 && events.some((event) => event.kind === "WorldEventStarted")) secondsToFirstWorldEvent = ticks * secondsPerTick;

      // Fase 1 — "tempo até Amigável/Respeitado" (qualquer facção).
      if (ticksToAmigavel === -1 && events.some((event) => event.kind === "ReputationRankUp" && event.rankId === "amigavel")) ticksToAmigavel = ticks;
      if (ticksToRespeitado === -1 && events.some((event) => event.kind === "ReputationRankUp" && event.rankId === "respeitado")) ticksToRespeitado = ticks;

      // Fase 1 — "HP médio/HP mínimo": amostrado após cada tick real.
      const finalStatsAfterTick = calculateFinalStats(session.character.characterBuild, session.character.equipment);
      const hpPercentAfterTick = finalStatsAfterTick.maximumLife > 0 ? Math.max(0, (session.character.currentLife / finalStatsAfterTick.maximumLife) * 100) : 0;
      hpPercentSum += hpPercentAfterTick;
      hpPercentSamples++;
      if (hpPercentAfterTick < minHpPercentObserved) minHpPercentObserved = hpPercentAfterTick;

      // Vertical Slice — Player Journey, Retention & First Hour Experience
      // Phase I — Fase 1 (Curva de Dificuldade, "por região"): "HP médio
      // restante" — mesma amostra acima, só também somada por
      // `session.currentRegion` (o mesmo campo já lido por
      // ExpeditionController pra selecionar a Expedição da região atual).
      perRegionHpPercentSum[session.currentRegion] = (perRegionHpPercentSum[session.currentRegion] ?? 0) + hpPercentAfterTick;
      perRegionHpPercentSamples[session.currentRegion] = (perRegionHpPercentSamples[session.currentRegion] ?? 0) + 1;

      // Fase 1 — Dungeon: "HP ao entrar/sair do checkpoint; recuperação
      // recebida/desperdiçada." `hpPercentBeforeTick` foi capturado
      // ANTES desta tick rodar (topo do laço) — a melhor aproximação
      // honesta de "HP ao entrar no checkpoint" possível sem
      // granularidade menor que 1 tick (mesma limitação estrutural já
      // documentada pro Boss).
      const checkpointEvent = events.find((event) => event.kind === "ExpeditionCheckpointReached");
      if (checkpointEvent && checkpointEvent.kind === "ExpeditionCheckpointReached") {
        checkpointHpBeforePercentSum += hpPercentBeforeTick;
        checkpointHpAfterPercentSum += hpPercentAfterTick;
        checkpointHpSamples++;
        if (isCurrentlyInDungeon(timeline.events)) liveDungeonCheckpointsSoFar++;
      }
      // "Cura desperdiçada" (overheal): a parte de `recovery.lifeHealed`
      // que excedeu o quanto realmente faltava (lifeHealed - (lifeAfter
      // - lifeBefore)) — reaproveita o MESMO `recovery` já destructurado
      // acima (Recovery Layer, intocada), nenhuma nova captura.
      if (recovery.applied) {
        const overheal = Math.max(0, recovery.lifeHealed - (recovery.lifeAfter - recovery.lifeBefore));
        lifeWasted += overheal;
        if (isCurrentlyInDungeon(timeline.events)) {
          dungeonRecoveryReceivedAccumulator += recovery.lifeHealed;
          dungeonRecoveryWastedAccumulator += overheal;
        }
      }

      if (!tickResult.characterAlive) {
        survived = false;
        // Fase 1 — Sobrevivência: causa da morte. "boss" quando o Chefe
        // Final foi avistado NESTA MESMA tick (mesmo princípio de
        // EliteEncounter/MiniBossEncounter — session.currentEncounter
        // nunca é zerado quando o personagem morre lutando); senão o
        // `variant` do encontro ainda em andamento.
        if (events.some((event) => event.kind === "FinalBossEncounter")) {
          deathCause = "boss";
          // Boss Accessibility & Endgame Balance Phase I — Fase 1 (Boss
          // Fight): "HP restante do Boss ao morrer" — o inverso de
          // bossHealthPercentAfterDefeatTotal (que só existe pra
          // vitórias). `session.currentEncounter` continua preenchido
          // quando o personagem morre no meio de um encontro (mesmo
          // princípio já documentado em adventure/types.ts).
          if (bossHpPercentRemainingOnPlayerLoss === -1 && session.currentEncounter && session.currentEncounter.enemies.length > 0) {
            const boss = session.currentEncounter.enemies[0];
            bossHpPercentRemainingOnPlayerLoss = boss.maximumLife > 0 ? Math.max(0, (boss.currentLife / boss.maximumLife) * 100) : 0;
          }
        } else {
          const variant = session.currentEncounter?.variant;
          deathCause = variant === "elite" ? "elite" : variant === "miniboss" ? "miniboss" : "normal";
        }
        if (isCurrentlyInDungeon(timeline.events)) {
          if (deathCause === "boss") dungeonDeathAtBoss = 1;
          else dungeonDeathBeforeBoss = 1;
        }
        break;
      }
    } else {
      const { tickResult } = advanceAdventureWithPresentation(session, timeline, tickOptions);
      if (!tickResult.characterAlive) {
        survived = false;
        break;
      }
    }
  }

  const rarityCounts: Record<string, number> = {};
  const objectiveCompletionSeconds: number[] = [];
  let objectiveXpBonusGranted = 0;
  let eliteEncountered = 0;
  let eliteDefeated = 0;
  let miniBossEncountered = 0;
  let miniBossDefeated = 0;
  let variantXpBonusGranted = 0;
  let worldEventsEncountered = 0;
  const worldEventCountByCategory: Record<string, number> = {};
  let worldEventGoldGained = 0;
  let worldEventXpGained = 0;
  let worldEventLootItemsGained = 0;
  let worldEventRecoveryGained = 0;
  let expeditionsStarted = 0;
  let expeditionsCompleted = 0;
  let expeditionsFailed = 0;
  let expeditionCheckpointsReached = 0;
  let expeditionXpGained = 0;
  let expeditionGoldGained = 0;
  const expeditionDurationTicks: number[] = [];
  let currentExpeditionStartTick: number | null = null;
  // Factions, Reputation & World Consequences Phase I — requisito 7:
  // "reputação média, ranks, bônus, distribuição" — mesmo princípio de
  // "observar eventos existentes" já usado por todo o resto desta
  // função. `factionFinalReputation`/`factionFinalRank` guardam o
  // ÚLTIMO valor visto por facção (o próprio ReputationChanged mais
  // recente já carrega o total acumulado, `newReputation` — nenhuma
  // soma paralela necessária). `xpBonusGranted`/`goldBonusGranted`
  // (campos do próprio ReputationChanged) somados diretamente — o
  // Simulador nunca reconstrói a porcentagem/rank sozinho.
  const factionFinalReputation: Record<string, number> = {};
  const factionFinalRank: Record<string, string> = {};
  let reputationEventsCount = 0;
  let rankUpEventsCount = 0;
  let factionXpBonusGained = 0;
  let factionGoldBonusGained = 0;
  // First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
  // 10: mesmo princípio de "observar eventos existentes" — só conta
  // ExpeditionStarted/Failed cujo `expeditionId` é uma Dungeon
  // (isDungeonExpedition), distinto dos contadores genéricos de
  // Expedição acima (que somam TODAS as Expedições).
  let dungeonsStarted = 0;
  let dungeonsCompleted = 0;
  let dungeonsFailed = 0;
  let finalBossEncountered = 0;
  let finalBossDefeated = 0;
  let dungeonXpGranted = 0;
  let dungeonGoldGranted = 0;
  let dungeonReputationGranted = 0;
  const dungeonDurationTicks: number[] = [];
  let currentDungeonStartTick: number | null = null;
  // Balance, Pacing & Player Experience Phase I — Fase 1 (Dungeon):
  // "checkpoints utilizados" — só os atingidos ENQUANTO uma Dungeon
  // estava ativa (`dungeonActive` acompanhado sequencialmente, mesmo
  // princípio de `currentDungeonStartTick` acima, evita reescanear a
  // Timeline inteira por evento como `isCurrentlyInDungeon` faria).
  // Fase 1 (Loot): "slots mais fracos" — guarda o Power Score do
  // ÚLTIMO ItemEquipped por slot (o estado final do equipamento).
  let dungeonActive = false;
  let dungeonCheckpointsReached = 0;
  const finalSlotPowerScores: Record<string, number> = {};
  // Vertical Slice — Player Journey, Retention & First Hour Experience
  // Phase I — Fase 1 (timeline de marcos): "tempo até 1º item/1ª
  // conclusão de Expedição/1º início de Dungeon/1ª derrota do Chefe" —
  // todos derivados aqui, no MESMO passe pós-hoc já existente, lendo o
  // `tickIndex` que cada PresentationEvent já carrega (nenhuma captura
  // ao vivo nova precisou ser adicionada ao laço de ticks pra isso,
  // distinto de HP%/checkpoint HP, que exigem o estado exato no
  // instante — aqui só "aconteceu e quando", já registrado no evento).
  let firstItemTick = -1;
  let firstExpeditionCompletionTick = -1;
  let firstDungeonStartTick = -1;
  let firstBossDefeatTick = -1;
  // Fase 1 (Progressão de Equipamentos): "tempo até 1º upgrade;
  // upgrades consecutivos; períodos longos sem upgrade." Um "upgrade" =
  // ItemEquipped cujo powerScore excede o previousPowerScore (ambos já
  // carregados pelo evento, presentation/types.ts) — cada ocorrência
  // guarda seu tickIndex pra depois calcular o maior intervalo (Fase 1,
  // "deserto de loot").
  const upgradeTicks: number[] = [];
  for (const event of timeline.events) {
    if (event.kind === "LootDropped" && firstItemTick === -1) firstItemTick = event.tickIndex;
    if (event.kind === "ExpeditionCompleted" && firstExpeditionCompletionTick === -1) firstExpeditionCompletionTick = event.tickIndex;
    if (event.kind === "ExpeditionStarted" && firstDungeonStartTick === -1 && isDungeonExpedition(event.expeditionId)) {
      firstDungeonStartTick = event.tickIndex;
    }
    if (event.kind === "FinalBossDefeated" && firstBossDefeatTick === -1) firstBossDefeatTick = event.tickIndex;
    if (event.kind === "ItemEquipped" && event.powerScore > event.previousPowerScore) upgradeTicks.push(event.tickIndex);
    if (event.kind === "LootDropped") {
      rarityCounts[event.rarity] = (rarityCounts[event.rarity] ?? 0) + 1;
    }
    if (event.kind === "ItemEquipped") {
      finalSlotPowerScores[event.slotId] = event.powerScore;
    }
    if (event.kind === "ObjectiveCompleted") {
      objectiveCompletionSeconds.push(event.tickIndex * secondsPerTick);
      objectiveXpBonusGranted += event.xpBonus;
    }
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 8: mesmo
    // princípio de "observar eventos existentes" já usado por todo o
    // resto desta função — nenhum estado extra guardado durante o laço.
    if (event.kind === "EliteEncounter") eliteEncountered++;
    if (event.kind === "EliteDefeated") {
      eliteDefeated++;
      variantXpBonusGranted += event.xpBonus;
    }
    if (event.kind === "MiniBossEncounter") miniBossEncountered++;
    if (event.kind === "MiniBossDefeated") {
      miniBossDefeated++;
      variantXpBonusGranted += event.xpBonus;
    }
    // World Events, Dynamic Encounters & Exploration Phase I — requisito
    // 8: mesmo princípio acima — nenhum estado extra além dos contadores.
    if (event.kind === "WorldEventStarted") {
      worldEventsEncountered++;
      worldEventCountByCategory[event.category] = (worldEventCountByCategory[event.category] ?? 0) + 1;
    }
    if (event.kind === "TreasureOpened") {
      worldEventGoldGained += event.goldAmount;
      worldEventLootItemsGained += event.itemCount;
    }
    if (event.kind === "MerchantFound") worldEventGoldGained += event.goldAmount;
    if (event.kind === "ShrineBlessing") {
      worldEventGoldGained += event.goldAmount;
      worldEventXpGained += event.xpAmount;
      worldEventRecoveryGained += event.recoveryAmount;
    }
    if (event.kind === "DiscoveryMade") worldEventXpGained += event.xpAmount;
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 9: mesmo princípio de "observar eventos existentes" —
    // `expeditionDurationTicks` reconstrói a duração real (em ticks)
    // de cada expedição CONCLUÍDA ou FALHADA, comparando o tickIndex de
    // encerramento contra o do ExpeditionStarted correspondente mais
    // recente (nenhum estado paralelo — só um ponteiro pro início ainda
    // aberto).
    if (event.kind === "ExpeditionStarted") {
      expeditionsStarted++;
      currentExpeditionStartTick = event.tickIndex;
    }
    if (event.kind === "ExpeditionCheckpointReached") {
      expeditionCheckpointsReached++;
      if (dungeonActive) dungeonCheckpointsReached++;
    }
    if (event.kind === "ExpeditionCompleted") {
      expeditionsCompleted++;
      expeditionXpGained += event.xpAmount;
      expeditionGoldGained += event.goldAmount;
      if (currentExpeditionStartTick !== null) {
        expeditionDurationTicks.push(event.tickIndex - currentExpeditionStartTick);
        currentExpeditionStartTick = null;
      }
    }
    if (event.kind === "ExpeditionFailed") {
      expeditionsFailed++;
      if (currentExpeditionStartTick !== null) {
        expeditionDurationTicks.push(event.tickIndex - currentExpeditionStartTick);
        currentExpeditionStartTick = null;
      }
    }
    // Factions, Reputation & World Consequences Phase I — requisito 7.
    if (event.kind === "ReputationChanged") {
      reputationEventsCount++;
      factionFinalReputation[event.factionId] = event.newReputation;
      factionXpBonusGained += event.xpBonusGranted;
      factionGoldBonusGained += event.goldBonusGranted;
    }
    if (event.kind === "ReputationRankUp") {
      rankUpEventsCount++;
      factionFinalRank[event.factionId] = event.rankId;
    }
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 10.
    if (event.kind === "ExpeditionStarted") {
      dungeonActive = isDungeonExpedition(event.expeditionId);
      if (dungeonActive) {
        dungeonsStarted++;
        currentDungeonStartTick = event.tickIndex;
      }
    }
    if (event.kind === "FinalBossEncounter") finalBossEncountered++;
    if (event.kind === "FinalBossDefeated") finalBossDefeated++;
    if (event.kind === "DungeonCompleted") {
      dungeonsCompleted++;
      dungeonXpGranted += event.xpAmount;
      dungeonGoldGranted += event.goldAmount;
      dungeonActive = false;
      if (currentDungeonStartTick !== null) {
        dungeonDurationTicks.push(event.tickIndex - currentDungeonStartTick);
        currentDungeonStartTick = null;
      }
    }
    if (event.kind === "ExpeditionFailed" && isDungeonExpedition(event.expeditionId)) {
      dungeonsFailed++;
      dungeonActive = false;
      if (currentDungeonStartTick !== null) {
        dungeonDurationTicks.push(event.tickIndex - currentDungeonStartTick);
        currentDungeonStartTick = null;
      }
    }
    if (event.kind === "ReputationChanged" && event.reason === "FinalBossDefeated") {
      dungeonReputationGranted += event.delta;
    }
  }
  // Fase 1 (Progressão de Equipamentos): "maior período sem upgrade" —
  // inclui o intervalo ANTES do 1º upgrade e o intervalo DEPOIS do
  // último até o fim da sessão (`ticks`), pra não esconder um "deserto
  // de loot" que só começa perto do início ou do fim.
  let longestGapWithoutUpgradeTicks = 0;
  if (upgradeTicks.length === 0) {
    longestGapWithoutUpgradeTicks = ticks;
  } else {
    longestGapWithoutUpgradeTicks = Math.max(upgradeTicks[0], ticks - upgradeTicks[upgradeTicks.length - 1]);
    for (let i = 1; i < upgradeTicks.length; i++) {
      longestGapWithoutUpgradeTicks = Math.max(longestGapWithoutUpgradeTicks, upgradeTicks[i] - upgradeTicks[i - 1]);
    }
  }

  // Fase 1 (Ritmo): "tempo médio em combate/recuperação/exploração/
  // checkpoints/boss" — cada TICK (não cada evento) é classificado por
  // prioridade (boss > checkpoint > combate > exploração > recuperação)
  // a partir dos PresentationEvent que ela contém; ticks sem nenhuma
  // dessas categorias (raro — todo tick real inclui ao menos um
  // combate ou World Event) simplesmente não somam em nenhum balde,
  // dado real, não fabricado.
  const EXPLORATION_CATEGORIES = new Set(["treasure", "merchant", "shrine", "discovery"]);
  let rhythmCombatTicks = 0;
  let rhythmRecoveryTicks = 0;
  let rhythmExplorationTicks = 0;
  let rhythmCheckpointTicks = 0;
  let rhythmBossTicks = 0;
  let currentRhythmTickIndex = -1;
  let currentRhythmPriority = 0;
  const flushRhythmTick = () => {
    if (currentRhythmTickIndex === -1) return;
    if (currentRhythmPriority === 5) rhythmBossTicks++;
    else if (currentRhythmPriority === 4) rhythmCheckpointTicks++;
    else if (currentRhythmPriority === 3) rhythmCombatTicks++;
    else if (currentRhythmPriority === 2) rhythmExplorationTicks++;
    else if (currentRhythmPriority === 1) rhythmRecoveryTicks++;
  };
  for (const event of timeline.events) {
    if (event.tickIndex !== currentRhythmTickIndex) {
      flushRhythmTick();
      currentRhythmTickIndex = event.tickIndex;
      currentRhythmPriority = 0;
    }
    let priority = 0;
    if (event.kind === "FinalBossEncounter") priority = 5;
    else if (event.kind === "ExpeditionCheckpointReached") priority = 4;
    else if (event.kind === "EncounterFinished") priority = 3;
    else if (event.kind === "WorldEventStarted" && EXPLORATION_CATEGORIES.has(event.category)) priority = 2;
    else if (event.kind === "RecoveryApplied") priority = 1;
    if (priority > currentRhythmPriority) currentRhythmPriority = priority;
  }
  flushRhythmTick();

  const averageDungeonDurationSeconds =
    dungeonDurationTicks.length > 0
      ? (dungeonDurationTicks.reduce((sum, value) => sum + value, 0) / dungeonDurationTicks.length) * secondsPerTick
      : 0;
  const averageExpeditionDurationSeconds =
    expeditionDurationTicks.length > 0
      ? (expeditionDurationTicks.reduce((sum, value) => sum + value, 0) / expeditionDurationTicks.length) * secondsPerTick
      : 0;

  // Requisito 7 — "distribuição": toda facção aparece no resultado,
  // mesmo quando nenhum gatilho a alcançou nesta execução (0 de
  // reputação, rank "neutro" — o ponto de partida real de toda
  // facção, ver factionDefinitions.ts: standardRanks()[0]).
  for (const definition of FACTION_DEFINITIONS) {
    if (!(definition.id in factionFinalReputation)) factionFinalReputation[definition.id] = 0;
    if (!(definition.id in factionFinalRank)) factionFinalRank[definition.id] = definition.ranks[0].id;
  }

  // Biomes, Regions & World Progression Phase I — requisito 8.
  const segments = buildRegionSegments(options.regionId, timeline.events, ticks);
  const regionsVisited = segments.map((segment) => segment.regionId);
  const perRegionSeconds: Record<string, number> = {};
  for (const segment of segments) {
    const seconds = (segment.toTick - segment.fromTick) * secondsPerTick;
    perRegionSeconds[segment.regionId] = (perRegionSeconds[segment.regionId] ?? 0) + seconds;
  }
  const perRegionItemsFound: Record<string, number> = {};
  const perRegionObjectivesCompleted: Record<string, number> = {};
  // Fase 1 (Curva de Dificuldade, "por região"): "dano recebido; dano
  // causado; recuperação utilizada; recuperação desperdiçada" — somados
  // aqui a partir de AttackHit/RecoveryApplied já existentes, cruzados
  // com a região via `regionAtTick` (mesmo helper já usado acima pra
  // itens/objetivos, nenhuma nova reconstrução de região).
  const perRegionDamageDealt: Record<string, number> = {};
  const perRegionDamageTaken: Record<string, number> = {};
  const perRegionRecoveryReceived: Record<string, number> = {};
  const perRegionRecoveryWasted: Record<string, number> = {};
  for (const event of timeline.events) {
    if (event.kind === "LootDropped") {
      const regionId = regionAtTick(segments, event.tickIndex);
      perRegionItemsFound[regionId] = (perRegionItemsFound[regionId] ?? 0) + 1;
    }
    if (event.kind === "ObjectiveCompleted") {
      const regionId = regionAtTick(segments, event.tickIndex);
      perRegionObjectivesCompleted[regionId] = (perRegionObjectivesCompleted[regionId] ?? 0) + 1;
    }
    if (event.kind === "AttackHit") {
      const regionId = regionAtTick(segments, event.tickIndex);
      perRegionDamageDealt[regionId] = (perRegionDamageDealt[regionId] ?? 0) + event.damageDealt;
      perRegionDamageTaken[regionId] = (perRegionDamageTaken[regionId] ?? 0) + event.damageTaken;
    }
    if (event.kind === "RecoveryApplied") {
      const regionId = regionAtTick(segments, event.tickIndex);
      perRegionRecoveryReceived[regionId] = (perRegionRecoveryReceived[regionId] ?? 0) + event.lifeHealed;
      const overheal = Math.max(0, event.lifeHealed - (event.lifeAfter - event.lifeBefore));
      perRegionRecoveryWasted[regionId] = (perRegionRecoveryWasted[regionId] ?? 0) + overheal;
    }
  }
  const diedInRegion = survived ? null : regionAtTick(segments, ticks);

  return {
    regionId: options.regionId,
    seed: options.seed,
    survived,
    simulatedSeconds: session.statistics.elapsedTime / 1000,
    ticks,
    finalLevel: session.character.characterBuild.level,
    statistics: { ...session.statistics },
    xpGained: timeline.totalXpGranted,
    rarityCounts,
    lifeRecovered,
    objectivesCompleted: objectiveCompletionSeconds.length,
    objectiveXpBonusGranted,
    objectiveCompletionSeconds,
    regionsVisited,
    perRegionSeconds,
    perRegionItemsFound,
    perRegionObjectivesCompleted,
    diedInRegion,
    eliteEncountered,
    eliteDefeated,
    miniBossEncountered,
    miniBossDefeated,
    variantXpBonusGranted,
    worldEventsEncountered,
    worldEventCountByCategory,
    worldEventGoldGained,
    worldEventXpGained,
    worldEventLootItemsGained,
    worldEventRecoveryGained,
    expeditionsStarted,
    expeditionsCompleted,
    expeditionsFailed,
    expeditionCheckpointsReached,
    expeditionXpGained,
    expeditionGoldGained,
    averageExpeditionDurationSeconds,
    factionFinalReputation,
    factionFinalRank,
    reputationEventsCount,
    rankUpEventsCount,
    factionXpBonusGained,
    factionGoldBonusGained,
    dungeonsStarted,
    dungeonsCompleted,
    dungeonsFailed,
    finalBossEncountered,
    finalBossDefeated,
    dungeonXpGranted,
    dungeonGoldGranted,
    dungeonReputationGranted,
    averageDungeonDurationSeconds,
    bossDamageDealtTotal,
    bossDamageTakenTotal,
    bossHealthPercentAfterDefeatTotal,
    bossRecoveryCountBeforeFirstEncounter,
    bossFirstEncounterTicks,
    secondsToFirstElite,
    secondsToFirstMiniBoss,
    secondsToFirstWorldEvent,
    hpPercentSum,
    hpPercentSamples,
    minHpPercentObserved: hpPercentSamples > 0 ? minHpPercentObserved : 100,
    deathCause,
    lifeWasted,
    dungeonRecoveryReceived: dungeonRecoveryReceivedAccumulator,
    dungeonRecoveryWasted: dungeonRecoveryWastedAccumulator,
    checkpointHpBeforePercentSum,
    checkpointHpAfterPercentSum,
    checkpointHpSamples,
    dungeonDeathBeforeBoss,
    dungeonDeathAtBoss,
    ticksToAmigavel,
    ticksToRespeitado,
    finalSlotPowerScores,
    dungeonCheckpointsReached,
    secondsToFirstItem: firstItemTick === -1 ? -1 : firstItemTick * secondsPerTick,
    secondsToFirstExpeditionCompletion: firstExpeditionCompletionTick === -1 ? -1 : firstExpeditionCompletionTick * secondsPerTick,
    secondsToFirstDungeonStart: firstDungeonStartTick === -1 ? -1 : firstDungeonStartTick * secondsPerTick,
    secondsToFirstBossDefeat: firstBossDefeatTick === -1 ? -1 : firstBossDefeatTick * secondsPerTick,
    firstUpgradeSeconds: upgradeTicks.length === 0 ? -1 : upgradeTicks[0] * secondsPerTick,
    upgradeCount: upgradeTicks.length,
    longestGapWithoutUpgradeSeconds: longestGapWithoutUpgradeTicks * secondsPerTick,
    rhythmCombatSeconds: rhythmCombatTicks * secondsPerTick,
    rhythmRecoverySeconds: rhythmRecoveryTicks * secondsPerTick,
    rhythmExplorationSeconds: rhythmExplorationTicks * secondsPerTick,
    rhythmCheckpointSeconds: rhythmCheckpointTicks * secondsPerTick,
    rhythmBossSeconds: rhythmBossTicks * secondsPerTick,
    perRegionHpPercentSum,
    perRegionHpPercentSamples,
    perRegionDamageDealt,
    perRegionDamageTaken,
    perRegionRecoveryReceived,
    perRegionRecoveryWasted,
    bossEncounterCharacterLevel,
    bossEncounterMaxLife,
    bossEncounterHpPercent,
    bossEncounterEstimatedDps,
    bossEncounterGold,
    bossEncounterReputationTotal,
    bossEncounterAverageRarityScore,
    bossEncounterEncountersCompleted,
    bossEncounterCheckpointsUsed,
    bossHpPercentRemainingOnPlayerLoss,
  };
}

// Requisito 8 — "100 aventuras, personagem nível 1, equipamento
// inicial": distribui as execuções pelas regiões iniciais (default:
// as duas regiões nível 1) pra também produzir "mortes por região"
// (requisito 9) comparável entre elas.
export function runBalanceSimulation(options: BalanceSimulationOptions = {}): SimulatedAdventureResult[] {
  const runs = options.runs ?? 100;
  const regionIds = options.regionIds ?? STARTER_REGION_IDS;
  const seedBase = options.seedBase ?? 1;

  const results: SimulatedAdventureResult[] = [];
  for (let i = 0; i < runs; i++) {
    const regionId = regionIds[i % regionIds.length];
    results.push(
      runSimulatedAdventure({
        regionId,
        seed: seedBase + i,
        secondsPerTick: options.secondsPerTick,
        maxSimulatedSeconds: options.maxSimulatedSeconds,
        enableRecovery: options.enableRecovery,
      }),
    );
  }
  return results;
}

export interface DungeonSimulationOptions {
  count?: number;
  expeditionId?: string;
  seedBase?: number;
  secondsPerTick?: number;
  maxSimulatedSeconds?: number;
}

const DEFAULT_DUNGEON_EXPEDITION_ID = "queda-da-fortaleza-sombria";
// Orçamento bem maior que o padrão de 600s (10 minutos): a Dungeon
// espera ~220 encontros (~4840s no ritmo de 22s/tick) — um orçamento
// curto demais confundiria "a sessão simulada acabou antes do tempo"
// com "a Dungeon é impossível de completar", que é exatamente o que o
// requisito 11 pede pra medir de verdade.
const DEFAULT_DUNGEON_MAX_SIMULATED_SECONDS = 12000;

// Requisito 10 — "Executar 100 Dungeons completas": usa
// `forceExpeditionId` (ver types.ts) pra garantir que TODAS as `count`
// execuções realmente tentam a Dungeon designada desde a 1ª tick, em
// vez de depender da seleção aleatória (selectExpeditionDefinitionId)
// que só a escolheria em parte das execuções. Reaproveita
// runSimulatedAdventure() integralmente — nenhum laço de tick duplicado
// aqui.
export function runDungeonSimulation(options: DungeonSimulationOptions = {}): SimulatedAdventureResult[] {
  const count = options.count ?? 100;
  const expeditionId = options.expeditionId ?? DEFAULT_DUNGEON_EXPEDITION_ID;
  const seedBase = options.seedBase ?? 1;

  const definition = getExpeditionDefinition(expeditionId);
  if (!definition) {
    throw new Error(`Simulador: Expedição-Dungeon desconhecida "${expeditionId}"`);
  }

  // Seeds espaçadas (`i * 99991`, não `seedBase + i` puro): a receita de
  // cada encontro usa `createSeededRandom(session.seed + encountersCompleted)`
  // (contrato documentado em presentationLayer.ts) — seeds pequenas e
  // CONSECUTIVAS caem todas na mesma faixa estreita e correlacionada de
  // entrada pro RNG, suprimindo eventos raros (Elite/Mini-Boss) mesmo ao
  // longo de centenas de encontros (achado empírico já documentado em
  // factions/factions.test.ts — a MESMA causa raiz, aqui repetida numa
  // Dungeon inteira: uma única seed pequena nunca via o Chefe Final em
  // 400+ encontros simulados). Multiplicar por um primo grande espalha a
  // faixa de entrada o bastante pra amostrar o RNG de forma
  // representativa entre as `count` execuções.
  const results: SimulatedAdventureResult[] = [];
  for (let i = 0; i < count; i++) {
    results.push(
      runSimulatedAdventure({
        regionId: definition.startBiome,
        seed: seedBase + i * 99991,
        secondsPerTick: options.secondsPerTick,
        maxSimulatedSeconds: options.maxSimulatedSeconds ?? DEFAULT_DUNGEON_MAX_SIMULATED_SECONDS,
        forceExpeditionId: expeditionId,
      }),
    );
  }
  return results;
}
