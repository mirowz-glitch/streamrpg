import { advanceFactionTick } from "../factions/factionController.js";
import { getFactionDefinition, getFactionForRegion, getRankForReputation } from "../factions/factionDefinitions.js";
import { deriveFactionReputation } from "../factions/factionProgress.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { getExpeditionDefinition } from "../expeditions/expeditionDefinitions.js";
import { resolveDungeonRuntimeConfig } from "../expeditions/expeditionModifiers.js";
import { resolveCombinedRuntimeConfig } from "../worldtiers/worldTierDefinitions.js";
import { applyMapModifiers } from "../mapmods/mapModifierRuntimeConfig.js";
import { generateLoot } from "../lootgen/generator.js";
import { getRegionItemLevelAnchor } from "../regions.js";
import type { AdvanceAdventureOptions } from "../adventure/adventureLoop.js";
import type { AdventureSession, AdventureTickResult } from "../adventure/types.js";
import type { AdventureTimeline, FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import type { RecoveryResult } from "../recovery/types.js";
import type { ObjectiveProgressSnapshot } from "../objectives/types.js";
import { getFinalBossTemplateId, isDungeonExpedition } from "./dungeonDefinitions.js";

export interface AdvanceDungeonTickResult {
  tickResult: AdventureTickResult;
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
  recovery: RecoveryResult;
  objective: ObjectiveProgressSnapshot;
}

// Requisito 4 — Recompensa Final: valores ilustrativos, calibrados
// empiricamente via o Simulador antes da entrega (ver
// scripts/runBalanceSimulation.ts). Somados por cima do que o abate
// normal do Mini-Boss já concede (loot próprio + 40-120 ouro, ver
// enemy/lootIntegration.ts) — "recompensa do Chefe Final", não uma
// substituição da recompensa de Mini-Boss já existente.
const FINAL_BOSS_XP_REWARD = 800;
const FINAL_BOSS_GOLD_REWARD = 250;
// Requisito 3 — Reputação: bem maior que o +10 de um MiniBossDefeated
// comum (factions/factionController.ts) — derrotar o Chefe Final de
// uma Dungeon é um feito muito mais raro/significativo.
const FINAL_BOSS_REPUTATION = 30;
// Seed offset só pra não correlacionar com nenhum outro roll de loot já
// existente (909 = ouro de Mini-Boss; 1001-5001 = seedOffset das Loot
// Tables) — não precisa ser "mágico", só distinto.
const FINAL_BOSS_LOOT_SEED_OFFSET = 7001;
// Usado só se a ExpeditionDefinition ativa não tiver
// `reward.guaranteedLootTableId` por algum motivo (nunca deveria
// acontecer pra uma Dungeon real, ver expeditions/expeditionDefinitions.ts)
// — dado que falta, nunca lógica que falta.
const FINAL_BOSS_LOOT_TABLE_FALLBACK = "final-boss-relic";
// Requisito 5 — "item único": reforça a chance de Unique por cima do
// que a própria Loot Table já concede (rarityMultiplier 4.0, ver
// lootgen/lootTables.ts) — as duas camadas combinadas tornam Unique a
// raridade mais provável, não só possível.
const FINAL_BOSS_UNIQUE_BIAS = 6;

function findMostRecentExpeditionId(events: readonly PresentationEvent[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionStarted") return event.expeditionId;
  }
  return null;
}

function findExpeditionStartTick(events: readonly PresentationEvent[], expeditionId: string): number | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.kind === "ExpeditionStarted" && event.expeditionId === expeditionId) return event.tickIndex;
  }
  return null;
}

// Requisito 3 — Reputação: mesma técnica de
// factions/factionController.ts (applyReputationChange), reescrita aqui
// porque aquela função é privada/não-exportada (mesmo princípio de
// "reutilizar a constante pública + replicar o formato" já usado pela
// Recovery de Checkpoint na Sprint de Expedições — nunca chamar direto
// uma função interna de outro módulo).
function applyDungeonReputationChange(
  timeline: AdventureTimeline,
  events: PresentationEvent[],
  factionId: string,
  amount: number,
  reason: string,
  tickIndex: number,
  timestamp: number,
): void {
  const definition = getFactionDefinition(factionId);
  if (!definition) return;

  const before = deriveFactionReputation(factionId, timeline);
  const after = before + amount;

  const changedEvent: PresentationEvent = {
    kind: "ReputationChanged",
    factionId: definition.id,
    factionName: definition.name,
    delta: amount,
    newReputation: after,
    reason,
    xpBonusGranted: 0,
    goldBonusGranted: 0,
    tickIndex,
    timestamp,
  };
  events.push(changedEvent);
  timeline.events.push(changedEvent);

  const rankBefore = getRankForReputation(definition, before);
  const rankAfter = getRankForReputation(definition, after);
  if (rankAfter.id !== rankBefore.id) {
    const rankUpEvent: PresentationEvent = {
      kind: "ReputationRankUp",
      factionId: definition.id,
      factionName: definition.name,
      rankId: rankAfter.id,
      rankName: rankAfter.name,
      xpBonusPercent: rankAfter.reward.xpBonusPercent ?? 0,
      goldBonusPercent: rankAfter.reward.goldBonusPercent ?? 0,
      tickIndex,
      timestamp,
    };
    events.push(rankUpEvent);
    timeline.events.push(rankUpEvent);
  }
}

// Requisito arquitetural — "Nenhuma Layer nova." Chama
// advanceFactionTick() (protegido nesta Sprint — INTOCADO, só
// reutilizado, já envolvendo Expedition/Objective/Recovery/Presentation
// por baixo) exatamente como useAdventureSession.ts/o Simulador já
// chamavam antes, e só ACRESCENTA por cima: observa MiniBossEncounter/
// MiniBossDefeated/ExpeditionCompleted já publicados nesta tick e
// decide, com base neles, se o Chefe Final de uma Dungeon apareceu/foi
// derrotado/a Dungeon foi concluída — concedendo a recompensa especial
// (XP/ouro/item/reputação, todos reaproveitando Progression/Loot/
// Factions já existentes) só nesse caso. Nenhuma regra de combate/
// encontro/expedição é movida pra cá.
export function advanceDungeonTick(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: AdvanceAdventureOptions = {},
): AdvanceDungeonTickResult {
  const timestamp = options.currentTime ?? Date.now();

  // Vertical Slice — Dungeon Modifier Runtime Integration Phase I —
  // Fase 1/2: o ÚNICO ponto de resolução ("Dungeon -> ModifierResolver
  // -> RuntimeConfig -> Combat/Recovery/Encounter/Rewards/HUD") de todo
  // o projeto. Lido pela MESMA técnica que "Qual Expedição estava ativa
  // durante esta tick" logo abaixo (findMostRecentExpeditionId) — mas
  // ANTES de chamar a cadeia de baixo, então nunca inclui uma Expedição
  // que esta MESMA tick esteja prestes a auto-iniciar (só passa a valer
  // a partir da tick seguinte — mesmo tipo de defasagem de uma tick já
  // aceito em toda leitura "antes" desta cadeia, ex.: beforeExpedition
  // em expeditionController.ts). `options.runtimeConfig` explícito
  // (ex.: um teste/Simulador que queira forçar um cenário) sempre
  // vence a resolução automática.
  //
  // Vertical Slice — World Tiers & Endgame Scaling Phase I — Fase 2:
  // "Runtime Final = World Tier + Dungeon Modifiers." Este continua o
  // ÚNICO lugar que resolve os dois — `resolveCombinedRuntimeConfig()`
  // (worldtiers/worldTierDefinitions.ts) lê `session.worldTier` (a
  // escolha do jogador, persistente na sessão) + o
  // DungeonRuntimeConfig já resolvido abaixo, e devolve o
  // CombinedRuntimeConfig único que toda a cadeia de baixo (e
  // Combat/Encounter/Recovery/Rewards/HUD, todos já ligados na Sprint
  // anterior) consome sem saber que World Tiers existem.
  //
  // Sprint 33 — Map Modifiers Phase II, Fase 2-6: mesmo ponto único
  // agora também dobra Map Modifiers por CIMA do resultado de World
  // Tier + Dungeon Modifiers (`applyMapModifiers()`,
  // mapmods/mapModifierRuntimeConfig.ts) — "Runtime Final = World Tier
  // + Dungeon Modifiers + Map Modifiers", ainda um único
  // CombinedRuntimeConfig, ainda o único formato que desce pra
  // Combat/Encounter/Loot/Rewards. `session.activeMapModifiers` vazio
  // (padrão desde Sprint 32) devolve o config inalterado — nenhuma
  // regressão quando nenhum Mod está ativo.
  const activeExpeditionIdBeforeTick = findMostRecentExpeditionId(timeline.events);
  const activeDefinitionBeforeTick = activeExpeditionIdBeforeTick ? getExpeditionDefinition(activeExpeditionIdBeforeTick) : undefined;
  const dungeonRuntimeConfig = resolveDungeonRuntimeConfig(activeDefinitionBeforeTick?.modifiers);
  const optionsWithRuntimeConfig: AdvanceAdventureOptions = {
    ...options,
    runtimeConfig:
      options.runtimeConfig ??
      applyMapModifiers(resolveCombinedRuntimeConfig(session.worldTier, dungeonRuntimeConfig), session.activeMapModifiers),
    // Sprint 13 — Sphere Economy Phase I, Fase 4: reusa o MESMO
    // `activeExpeditionIdBeforeTick` que já resolve o
    // DungeonRuntimeConfig acima — "existe uma Expedição-Dungeon ativa
    // agora" é exatamente a pergunta que `isDungeonExpedition()` já
    // respondia pra outro propósito (Requisito 7, DungeonCompleted,
    // abaixo); reaproveitada aqui pela mesma razão de sempre: nunca
    // recalcular o que já foi resolvido.
    inDungeon: options.inDungeon ?? (activeExpeditionIdBeforeTick ? isDungeonExpedition(activeExpeditionIdBeforeTick) : false),
  };

  const { tickResult, events, floatingNumbers, recovery, objective } = advanceFactionTick(session, timeline, optionsWithRuntimeConfig);
  const tickIndex = timeline.nextTickIndex - 1;

  // "Qual Expedição estava ativa durante esta tick" — deliberadamente
  // pelo ÚLTIMO ExpeditionStarted já publicado (não
  // deriveExpeditionProgress(), que já devolveria `null` se um
  // ExpeditionCompleted TAMBÉM tiver disparado nesta MESMA tick — ex.:
  // o Chefe Final é literalmente o último encontro esperado).
  const activeExpeditionId = findMostRecentExpeditionId(timeline.events);
  const bossTemplateId = activeExpeditionId ? getFinalBossTemplateId(activeExpeditionId) : undefined;

  const tickEvents = [...events];

  if (bossTemplateId) {
    for (const event of tickEvents) {
      if (event.kind === "MiniBossEncounter" && event.enemyTemplateId === bossTemplateId) {
        const encounterEvent: PresentationEvent = {
          kind: "FinalBossEncounter",
          enemyTemplateId: event.enemyTemplateId,
          enemyName: event.enemyName,
          regionId: event.regionId,
          tickIndex,
          timestamp,
        };
        events.push(encounterEvent);
        timeline.events.push(encounterEvent);
      }

      if (event.kind === "MiniBossDefeated" && event.enemyTemplateId === bossTemplateId) {
        const template = getEnemyTemplate(bossTemplateId);
        const enemyName = template?.name ?? event.enemyName;

        session.character.characterBuild.addExperience(FINAL_BOSS_XP_REWARD);
        session.statistics.goldFound += FINAL_BOSS_GOLD_REWARD;

        const defeatedEvent: PresentationEvent = {
          kind: "FinalBossDefeated",
          enemyTemplateId: bossTemplateId,
          enemyName,
          xpAmount: FINAL_BOSS_XP_REWARD,
          goldAmount: FINAL_BOSS_GOLD_REWARD,
          tickIndex,
          timestamp,
        };
        events.push(defeatedEvent);
        timeline.events.push(defeatedEvent);

        // Requisito 5 — Loot Exclusivo: reutiliza generateLoot() (Loot
        // Generator, intocado) com a Loot Table da própria
        // ExpeditionDefinition (reward.guaranteedLootTableId — Future
        // Hook preparado desde a Sprint de Expedições, lido de verdade
        // pela primeira vez aqui).
        const expeditionDefinition = activeExpeditionId ? getExpeditionDefinition(activeExpeditionId) : undefined;
        const lootTableId = expeditionDefinition?.reward.guaranteedLootTableId ?? FINAL_BOSS_LOOT_TABLE_FALLBACK;
        const lootSeed = session.seed + tickIndex + FINAL_BOSS_LOOT_SEED_OFFSET;
        // Region-Anchored Item Level — Implementation Validation Phase I:
        // getRegionItemLevelAnchor(session.currentRegion) substitui
        // session.character.characterBuild.level como base do Item
        // Level do loot garantido — XP/recompensa do Chefe Final
        // (FINAL_BOSS_XP_REWARD/FINAL_BOSS_GOLD_REWARD, acima) e o
        // próprio nível do personagem continuam intocados.
        const loot = generateLoot(lootTableId, getRegionItemLevelAnchor(session.currentRegion), lootSeed, {
          dropChanceOverride: 1,
          minimumQuantity: 1,
          rarityWeightMultipliers: { unique: FINAL_BOSS_UNIQUE_BIAS },
        });

        for (let i = 0; i < loot.generatedItems.length; i++) {
          const generatedItem = { ...loot.generatedItems[i], sourceVariant: "miniboss" as const, sourceEnemyTemplateId: bossTemplateId };
          const instanceId = `${session.sessionId}-finalboss-${tickIndex}-${i}`;
          const addResult = session.character.inventory.addItem(instanceId, generatedItem);
          // Engine Observability & Event Derivation Phase I — mesmo
          // padrão de adventureLoop.ts/presentationLayer.ts: o loot
          // garantido do Chefe Final é um fato do engine, publicado
          // mesmo quando o Inventory está cheio (`stored: false`) — só
          // gate era `addResult.success`, o que apagava o evento pro
          // loot mais importante do jogo exatamente quando o Inventory
          // saturado (comum em sessões longas) coincidia com a vitória.
          const lootDroppedEvent: PresentationEvent = {
            kind: "LootDropped",
            instanceId,
            baseItemId: generatedItem.baseItemId,
            rarity: generatedItem.rarity,
            powerScore: generatedItem.powerScore,
            regionId: session.currentRegion,
            stored: addResult.success,
            itemLevel: generatedItem.itemLevel,
            seed: generatedItem.seed,
            prefixes: generatedItem.prefixes,
            suffixes: generatedItem.suffixes,
            tickIndex,
            timestamp,
          };
          events.push(lootDroppedEvent);
          timeline.events.push(lootDroppedEvent);
        }

        // Requisito 3/4 — Reputação: a facção dona da região de origem
        // do Chefe (getFactionForRegion(template.region) — reaproveita
        // exatamente a mesma regra que decide "Facção Atual" na HUD,
        // nunca uma facção hardcoded aqui).
        const rewardFaction = template ? getFactionForRegion(template.region) : undefined;
        if (rewardFaction) {
          applyDungeonReputationChange(timeline, events, rewardFaction.id, FINAL_BOSS_REPUTATION, "FinalBossDefeated", tickIndex, timestamp);
        }
      }
    }
  }

  // Requisito 7 — DungeonCompleted: especialização de ExpeditionCompleted
  // pra uma Expedição-Dungeon cujo Chefe já foi derrotado em algum ponto
  // da mesma Expedição (fronteira desde o ExpeditionStarted
  // correspondente — nunca a Expedição inteira, evita confundir com o
  // Chefe de uma Dungeon ANTERIOR na mesma Timeline).
  for (const event of tickEvents) {
    if (event.kind !== "ExpeditionCompleted" || !isDungeonExpedition(event.expeditionId)) continue;

    const startTick = findExpeditionStartTick(timeline.events, event.expeditionId);
    const bossDefeatedDuringExpedition =
      startTick !== null && timeline.events.some((e) => e.kind === "FinalBossDefeated" && e.tickIndex >= startTick);
    if (!bossDefeatedDuringExpedition) continue;

    const dungeonBossTemplateId = getFinalBossTemplateId(event.expeditionId)!;
    const bossTemplate = getEnemyTemplate(dungeonBossTemplateId);
    const dungeonCompletedEvent: PresentationEvent = {
      kind: "DungeonCompleted",
      expeditionId: event.expeditionId,
      name: event.name,
      bossName: bossTemplate?.name ?? "",
      encountersCompleted: event.encountersCompleted,
      xpAmount: event.xpAmount,
      goldAmount: event.goldAmount,
      tickIndex,
      timestamp,
    };
    events.push(dungeonCompletedEvent);
    timeline.events.push(dungeonCompletedEvent);
  }

  return { tickResult, events, floatingNumbers, recovery, objective };
}
