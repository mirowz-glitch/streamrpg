import type { FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import { getAnimationPreset } from "./presets.js";
import type { AnimationType, CombatAnimation } from "./types.js";

let sequenceCounter = 0;

// Requisito 11 — "reutilizável": id sempre único, nunca reaproveitado,
// mesmo entre chamadas diferentes de buildAnimationsForTick(). Um
// contador monotônico simples é suficiente e determinístico (sem
// depender de Math.random()/crypto).
function nextAnimationId(): string {
  sequenceCounter += 1;
  return `anim-${sequenceCounter}`;
}

function makeAnimation(type: AnimationType, timestamp: number, payload: Record<string, unknown>): CombatAnimation {
  const preset = getAnimationPreset(type);
  return {
    id: nextAnimationId(),
    type,
    timestamp,
    duration: preset.duration,
    priority: preset.priority,
    payload,
  };
}

// Requisito 6 — "brilho pela raridade": mapeamento direto raridade
// real (ItemGenRarityId) -> variante de animação, tabela pura, nenhum
// `if`.
const LOOT_ANIMATION_BY_RARITY: Record<string, AnimationType> = {
  common: "loot-drop-common",
  magic: "loot-drop-magic",
  rare: "loot-drop-rare",
  unique: "loot-drop-unique",
};

// Requisito 9 — "cada Presentation Event deve gerar 0 ou mais
// animações": um handler por `PresentationEvent.kind` conhecido;
// kinds sem handler (EncounterStarted/AttackStarted/AttackHit/
// EncounterFinished) geram 0 animações nesta fase — não é omissão,
// é o "0" do próprio requisito (Attack Hit já vira animação via
// FloatingNumberEvent "damage", não precisa de uma segunda aqui).
function animationsForPresentationEvent(event: PresentationEvent, timestamp: number): CombatAnimation[] {
  switch (event.kind) {
    case "EnemyKilled":
      return [makeAnimation("enemy-death", timestamp, { count: event.count })];
    case "LootDropped": {
      const type = LOOT_ANIMATION_BY_RARITY[event.rarity] ?? "loot-drop-common";
      return [
        makeAnimation(type, timestamp, {
          instanceId: event.instanceId,
          baseItemId: event.baseItemId,
          rarity: event.rarity,
          powerScore: event.powerScore,
          regionId: event.regionId,
        }),
      ];
    }
    case "ItemEquipped": {
      const delta = event.powerScore - event.previousPowerScore;
      const type = delta > 0 ? "equipment-pulse-upgrade" : delta < 0 ? "equipment-pulse-downgrade" : "equipment-pulse-neutral";
      return [
        makeAnimation(type, timestamp, {
          slotId: event.slotId,
          baseItemId: event.baseItemId,
          rarity: event.rarity,
          powerScore: event.powerScore,
          previousPowerScore: event.previousPowerScore,
          delta,
        }),
      ];
    }
    case "CharacterDied":
      return [makeAnimation("character-death", timestamp, {})];
    // Progression & Player Retention Phase I — requisito 2: consome só
    // os dados já existentes no próprio LevelUpEvent (Presentation
    // Layer), nenhum cálculo novo de progressão aqui.
    case "LevelUp":
      return [makeAnimation("level-up", timestamp, { level: event.level, previousLevel: event.previousLevel })];
    // Objectives, Missions & Player Goals Phase I — requisito 8:
    // consome só os dados já existentes no próprio ObjectiveCompleted
    // (Objective System), nenhum cálculo novo.
    case "ObjectiveCompleted":
      return [
        makeAnimation("objective-completed", timestamp, {
          objectiveId: event.objectiveId,
          objectiveName: event.objectiveName,
          xpBonus: event.xpBonus,
        }),
      ];
    // Biomes, Regions & World Progression Phase I — requisito 7: banner
    // de desbloqueio; "RegionEntered" (a mesma tick, sempre junto) não
    // tem animação própria — já fica registrado no feed de eventos.
    case "RegionUnlocked":
      return [makeAnimation("region-unlocked", timestamp, { previousRegionId: event.previousRegionId, newRegionId: event.newRegionId })];
    // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 7: consome
    // só os dados já existentes no próprio evento (Presentation Layer),
    // nenhum cálculo novo.
    case "EliteEncounter":
      return [makeAnimation("elite-encounter", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, regionId: event.regionId })];
    case "MiniBossEncounter":
      return [makeAnimation("miniboss-encounter", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, regionId: event.regionId })];
    case "EliteDefeated":
      return [makeAnimation("elite-defeated", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, xpBonus: event.xpBonus })];
    case "MiniBossDefeated":
      return [makeAnimation("miniboss-defeated", timestamp, { enemyTemplateId: event.enemyTemplateId, enemyName: event.enemyName, xpBonus: event.xpBonus })];
    // World Events, Dynamic Encounters & Exploration Phase I —
    // requisito 7: banner dispara em "WorldEventStarted" (o "surgiu"),
    // mesmo padrão de EliteEncounter/MiniBossEncounter. A recompensa em
    // si (loot/cura) já ganha feedback pelas animações EXISTENTES
    // (loot-drop-*/floating-number-heal, disparadas pelos próprios
    // LootDropped/floating number "heal" que presentationLayer.ts já
    // produz) — "sem lógica nova" pro requisito 7 também vale aqui.
    // WorldEventCompleted/TreasureOpened/MerchantFound/ShrineBlessing/
    // DiscoveryMade/AmbushTriggered não precisam de animação própria.
    case "WorldEventStarted":
      return [makeAnimation("world-event-discovered", timestamp, { explorationEventId: event.explorationEventId, name: event.name, category: event.category })];
    // Expeditions, Checkpoints & Long Session Progression Phase I —
    // requisito 8: consome só os dados já existentes no próprio evento
    // (expeditions/expeditionController.ts), nenhum cálculo novo.
    // "ExpeditionStarted" não tem animação própria (só registrado no
    // feed) — mesmo tratamento de "RegionEntered".
    case "ExpeditionCheckpointReached":
      return [
        makeAnimation("expedition-checkpoint", timestamp, {
          expeditionId: event.expeditionId,
          checkpointIndex: event.checkpointIndex,
          checkpointsTotal: event.checkpointsTotal,
          recoveryAmount: event.recoveryAmount,
        }),
      ];
    case "ExpeditionCompleted":
      return [
        makeAnimation("expedition-completed", timestamp, {
          expeditionId: event.expeditionId,
          name: event.name,
          xpAmount: event.xpAmount,
          goldAmount: event.goldAmount,
        }),
      ];
    case "ExpeditionFailed":
      return [makeAnimation("expedition-failed", timestamp, { expeditionId: event.expeditionId, name: event.name })];
    // Factions, Reputation & World Consequences Phase I — requisito 6:
    // consome só os dados já existentes no próprio evento
    // (factions/factionController.ts), nenhum cálculo novo.
    // "ReputationChanged" não tem animação própria (só registrado no
    // feed) — mesmo tratamento de "ExpeditionStarted"/"RegionEntered".
    case "ReputationRankUp":
      return [
        makeAnimation("faction-rank-up", timestamp, {
          factionId: event.factionId,
          factionName: event.factionName,
          rankId: event.rankId,
          rankName: event.rankName,
          xpBonusPercent: event.xpBonusPercent,
          goldBonusPercent: event.goldBonusPercent,
        }),
      ];
    // First Dungeon, Final Boss & Complete Game Loop Phase I —
    // requisito 9: consome só os dados já existentes no próprio evento
    // (dungeon/dungeonController.ts), nenhum cálculo novo.
    case "FinalBossEncounter":
      return [
        makeAnimation("final-boss-encounter", timestamp, {
          enemyTemplateId: event.enemyTemplateId,
          enemyName: event.enemyName,
          regionId: event.regionId,
        }),
      ];
    case "FinalBossDefeated":
      return [
        makeAnimation("final-boss-defeated", timestamp, {
          enemyTemplateId: event.enemyTemplateId,
          enemyName: event.enemyName,
          xpAmount: event.xpAmount,
          goldAmount: event.goldAmount,
        }),
      ];
    case "DungeonCompleted":
      return [
        makeAnimation("dungeon-completed", timestamp, {
          expeditionId: event.expeditionId,
          name: event.name,
          bossName: event.bossName,
          xpAmount: event.xpAmount,
          goldAmount: event.goldAmount,
        }),
      ];
    default:
      return [];
  }
}

// Requisito 3/4/8 — Floating Numbers viram tanto o "impacto" (hit no
// inimigo/personagem) quanto o número flutuante em si — dois efeitos
// visuais distintos a partir do MESMO dado real (nenhum inventado).
// "critical"/"miss" nunca chegam aqui de verdade (Presentation Layer
// nunca produz esses kinds ainda), mas o `switch` já sabe o que fazer
// no dia em que existirem.
const FLOATING_NUMBER_ANIMATION: Record<FloatingNumberEvent["kind"], AnimationType> = {
  damage: "floating-number-damage",
  critical: "floating-number-critical",
  miss: "floating-number-miss",
  heal: "floating-number-heal",
  lifeLeech: "floating-number-lifeLeech",
};

function animationsForFloatingNumber(event: FloatingNumberEvent, timestamp: number): CombatAnimation[] {
  const animations: CombatAnimation[] = [];

  if (event.kind === "damage" || event.kind === "critical" || event.kind === "miss") {
    const hitType: AnimationType =
      event.target === "enemy"
        ? event.kind === "critical"
          ? "enemy-critical-hit"
          : event.kind === "miss"
            ? "enemy-miss"
            : "enemy-hit"
        : "character-hit";
    animations.push(makeAnimation(hitType, timestamp, { value: event.value, target: event.target }));
  }

  animations.push(makeAnimation(FLOATING_NUMBER_ANIMATION[event.kind], timestamp, { value: event.value, target: event.target }));

  return animations;
}

// Requisito 9 — Timeline Playback: "tudo ordenado automaticamente".
// Floating numbers (o IMPACTO — hit no inimigo/personagem) sempre
// tocam ANTES dos Presentation Events (a CONSEQUÊNCIA — morte/loot/
// equip): cronologicamente, o golpe acontece, e só DEPOIS o inimigo
// morre, solta loot, é equipado. Dentro de cada um dos dois grupos, a
// ordem é a mesma em que a Presentation Layer já produziu os dados
// (ela mesma garante, ex.: LootDropped antes de ItemEquipped) —
// nenhuma decisão nova de ordenação além dessa. Cada animação é
// encadeada sequencialmente: só começa quando a duração da anterior
// termina (o exemplo do requisito: EnemyKilled -> Enemy Fade -> Loot
// Popup -> Loot Jump -> Equipment Pulse é literalmente essa cadeia,
// já depois do(s) hit(s) que causaram a morte).
export function buildAnimationsForTick(
  events: readonly PresentationEvent[],
  floatingNumbers: readonly FloatingNumberEvent[],
  baseTimestamp: number,
): CombatAnimation[] {
  const result: CombatAnimation[] = [];
  let cursor = baseTimestamp;

  for (const floatingNumber of floatingNumbers) {
    const animations = animationsForFloatingNumber(floatingNumber, cursor);
    result.push(...animations);
    cursor += Math.max(...animations.map((animation) => animation.duration));
  }

  for (const event of events) {
    const animations = animationsForPresentationEvent(event, cursor);
    if (animations.length === 0) continue;
    result.push(...animations);
    cursor += Math.max(...animations.map((animation) => animation.duration));
  }

  return result;
}
