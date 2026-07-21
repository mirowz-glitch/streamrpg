import { advanceAdventure } from "../adventure/adventureLoop.js";
import type { AdvanceAdventureOptions } from "../adventure/adventureLoop.js";
import type { AdventureSession, AdventureTickResult, LootDropRecord } from "../adventure/types.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { VARIANT_XP_MULTIPLIERS } from "../worldencounter/eliteModifiers.js";
import { generateEncounter } from "../worldencounter/generator.js";
import { getExplorationEventDefinition } from "../worldevents/worldEventDefinitions.js";
import type { ExplorationEventReward } from "../worldevents/types.js";
import { generateLoot } from "../lootgen/generator.js";
import { ITEM_GEN_RARITIES } from "../itemgen/rarities.js";
import { calculateFinalStats } from "../characterbuild/finalStats.js";
import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import { xpRewardForKill } from "../xp.js";
import { deriveFloatingNumbers, estimateLifeLeech } from "./floatingNumbers.js";
import type { AdventureTimeline, FloatingNumberEvent, PresentationEvent } from "./types.js";

function rarityRank(rarityId: string): number {
  const index = ITEM_GEN_RARITIES.findIndex((rarity) => rarity.id === rarityId);
  return index === -1 ? 0 : index;
}

interface AppliedExplorationReward {
  xpAmount: number;
  goldAmount: number;
  recoveryAmount: number;
  lootItemCount: number;
  bestLootRarity: string | null;
  lootDrops: LootDropRecord[];
}

// World Events, Dynamic Encounters & Exploration Phase I — requisito
// 4/12: "reutilizar apenas sistemas existentes... nunca reimplementar."
// Cada campo de `reward` já usa um mecanismo que já existe em algum
// lugar do projeto: ouro soma direto em `session.statistics.goldFound`
// (mesmo campo já incrementado pelo Adventure Loop pra loot de
// monstro, e pelo Mini-Boss na Sprint anterior); XP entra no MESMO
// pool somado a `xpAwarded` logo abaixo (nunca uma segunda curva);
// recuperação usa o MESMO clamp `Math.min(maximumLife, ...)` que a
// Recovery Layer já usa (calculateFinalStats(), Character Build, só
// lido, nunca alterado); loot chama generateLoot() (Loot Generator,
// só lido) com um `lootTableId` que já existe em lootgen/lootTables.ts
// (ex.: "treasure_chest") — os itens entram no Inventory via
// addItem() (já existente). Engine Observability & Event Derivation
// Phase I — cada item vira um `LootDropRecord` (retornado em
// `lootDrops`) independente de `addItem()` ter sucesso; quem chama
// esta função emite os `LootDropped` correspondentes logo abaixo,
// nunca mais por diff de Inventory/Equipment.
function applyExplorationEventReward(
  session: AdventureSession,
  reward: ExplorationEventReward,
  playerLevel: number,
  lootSeed: number,
): AppliedExplorationReward {
  let recoveryAmount = 0;
  if (reward.recoveryAmount) {
    const finalStats = calculateFinalStats(session.character.characterBuild, session.character.equipment);
    const lifeBefore = session.character.currentLife;
    const lifeAfter = Math.min(finalStats.maximumLife, lifeBefore + reward.recoveryAmount);
    recoveryAmount = lifeAfter - lifeBefore;
    session.character.currentLife = lifeAfter;
  }

  const goldAmount = reward.goldAmount ?? 0;
  if (goldAmount > 0) {
    session.statistics.goldFound += goldAmount;
  }

  let lootItemCount = 0;
  let bestLootRarity: string | null = null;
  // Engine Observability & Event Derivation Phase I — mesmo padrão do
  // Adventure Loop (adventureLoop.ts): todo item que o Loot Generator
  // produz vira um `LootDropRecord` com `stored` refletindo o resultado
  // real de `addItem()`, SEMPRE, independente de sucesso. `lootItemCount`/
  // `bestLootRarity` continuam contando só o que entrou de verdade
  // (usado por `TreasureOpened`, que descreve o que o jogador ganhou —
  // nenhuma regra de gameplay muda aqui).
  const lootDrops: LootDropRecord[] = [];
  if (reward.lootTableId) {
    const loot = generateLoot(reward.lootTableId, playerLevel, lootSeed);
    for (let i = 0; i < loot.generatedItems.length; i++) {
      const item = loot.generatedItems[i];
      const instanceId = `${session.sessionId}-explorationevent-${lootSeed}-${i}`;
      const addResult = session.character.inventory.addItem(instanceId, item);
      lootDrops.push({ instanceId, baseItemId: item.baseItemId, rarity: item.rarity, powerScore: item.powerScore, stored: addResult.success });
      if (addResult.success) {
        lootItemCount++;
        if (!bestLootRarity || rarityRank(item.rarity) > rarityRank(bestLootRarity)) bestLootRarity = item.rarity;
      }
    }
  }

  return { xpAmount: reward.xpAmount ?? 0, goldAmount, recoveryAmount, lootItemCount, bestLootRarity, lootDrops };
}

// Requisito 1 — Combat Presentation Layer: "ele apenas observa os
// eventos, nunca calcula gameplay." advanceAdventure() (Adventure
// Loop) é chamado exatamente como sempre foi, sem nenhuma alteração —
// esta função só tira um retrato de ANTES, deixa o Adventure Loop
// resolver o tick de verdade, tira um retrato de DEPOIS, e produz uma
// lista de Presentation Events (requisito 2) a partir da DIFERENÇA
// entre os dois. Nenhum número aqui influencia o resultado do tick —
// o retorno de advanceAdventure() (`AdventureTickResult`) e a
// AdventureSession mutada são exatamente o que seriam sem esta camada.
// Biomes, Regions & World Progression Phase I — `unlockedRegionIds`
// inicializado aqui pelo mesmo motivo de `totalXpGranted` (Progression
// Phase I): este é o ÚNICO lugar que constrói um AdventureTimeline —
// nenhuma lógica de derivação de evento mudou, só o shape inicial do
// objeto (mesmo padrão aditivo de sempre).
export function createAdventureTimeline(sessionId: string): AdventureTimeline {
  return { sessionId, events: [], nextTickIndex: 0, totalXpGranted: 0, unlockedRegionIds: [] };
}

export interface PresentationTickResult {
  tickResult: AdventureTickResult;
  events: PresentationEvent[];
  floatingNumbers: FloatingNumberEvent[];
}

// Requisito 7 — Data Driven: nenhum evento é hardcoded pra uma região
// ou inimigo específico — tudo vem do diff genérico entre o estado da
// sessão antes/depois e do AdventureTickResult, os mesmos pra
// qualquer região/inimigo (Enemy Templates/Encounter Tables nunca são
// lidos por nome aqui).
export function advanceAdventureWithPresentation(
  session: AdventureSession,
  timeline: AdventureTimeline,
  options: AdvanceAdventureOptions = {},
): PresentationTickResult {
  const timestamp = options.currentTime ?? Date.now();
  const tickIndex = timeline.nextTickIndex;
  timeline.nextTickIndex++;

  // --- Retrato de ANTES ---
  // Engine Observability & Event Derivation Phase I — loot/variante não
  // são mais derivados por diff de Inventory/Equipment (ver
  // `tickResult.lootDrops`/`encounterVariant`/`variantEnemyTemplateId`/
  // `variantEnemyDefeated`, fatos do engine já devolvidos por
  // advanceAdventure()); só o Equipment continua precisando de um
  // retrato de ANTES, pra `ItemEquipped` (slot que mudou de instanceId).
  const beforeEquippedInstanceIds = new Map(session.character.equipment.items.map((slot) => [slot.slotId, slot.instanceId]));
  // Sprint HUD & Gameplay UI Phase I — extensão aditiva: guarda o
  // Power Score do que já estava equipado em cada slot ANTES do tick,
  // pra ItemEquipped poder carregar `previousPowerScore` sem precisar
  // consultar o Equipment System de novo depois.
  const beforeEquippedPowerScore = new Map(
    session.character.equipment.items.map((slot) => [slot.slotId, slot.item?.powerScore ?? 0]),
  );
  const beforeStatistics = { ...session.statistics };
  const beforeCurrentLife = session.character.currentLife;

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // arquitetural: "eventos do mundo são apenas mais um tipo de
  // encontro" — mas um evento sem combate (treasure/merchant/shrine/
  // discovery) resolve com ZERO inimigos DENTRO da mesma chamada opaca
  // de advanceAdventure() (Adventure Loop nunca muda: um encontro com
  // `enemies: []` já satisfaz "todos morreram" trivialmente), então sua
  // identidade se perde exatamente como a de um Elite/Mini-Boss
  // derrotado (ver nota em worldencounter/types.ts). Diferente daquele
  // caso, aqui não há item de loot garantido pra marcar (Merchant/
  // Shrine/Discovery não dropam nada) — a técnica usada é PREVISÃO:
  // generateEncounter() é pura e determinística, e o Adventure Loop só
  // a chama quando `!session.currentEncounter` (sempre verdade aqui,
  // ver invariante documentado em adventureLoop.ts), usando exatamente
  // a seed `session.seed + session.statistics.encountersCompleted`
  // (contrato público, já documentado ali). Replicar essa MESMA fórmula
  // aqui e chamar generateEncounter() UMA SEGUNDA VEZ, com os MESMOS
  // argumentos, produz OBRIGATORIAMENTE o mesmo EncounterResult (função
  // pura, sem estado global) — inclusive `explorationEventId`, ANTES do
  // Adventure Loop internamente gerar a mesma receita de verdade.
  // Nenhuma lógica de seleção é duplicada (a MESMA função é chamada,
  // não reimplementada); apenas uma segunda invocação, somente leitura.
  let predictedExplorationEvent = null as ReturnType<typeof getExplorationEventDefinition> | null;
  let predictedLootSeed = 0;
  if (!session.currentEncounter) {
    const predictionRng = createSeededRandom(session.seed + session.statistics.encountersCompleted);
    const predictedRecipeSeed = randomInt(predictionRng, 0, 2_147_483_647);
    const playerLevelBeforeTick = session.character.characterBuild.level;
    const predictedRecipe = generateEncounter(session.currentRegion, playerLevelBeforeTick, predictedRecipeSeed);
    if (predictedRecipe.explorationEventId) {
      predictedExplorationEvent = getExplorationEventDefinition(predictedRecipe.explorationEventId) ?? null;
      predictedLootSeed = predictedRecipeSeed;
    }
  }

  // --- O Adventure Loop de verdade, sem nenhuma alteração ---
  const tickResult = advanceAdventure(session, options);
  // Capturado ANTES da recompensa de World Event (que pode curar via
  // `recoveryAmount`) — sem isso, `estimateLifeLeech()` logo abaixo
  // confundiria a cura do Shrine com Life Leech de combate (os dois só
  // se distinguem pela ORIGEM do aumento de vida, nunca pelo valor).
  const lifeAfterCombatResolution = session.character.currentLife;

  // --- Retrato de DEPOIS + reconstrução dos eventos ---
  const events: PresentationEvent[] = [];
  const region = session.currentRegion;

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 4: a recompensa só é aplicada quando o encontro previsto REALMENTE
  // aconteceu nesta tick (`tickResult.encounterGenerated`) — evita
  // aplicar duas vezes se, por algum motivo futuro, a previsão rodasse
  // sem geração real. Aplicada ANTES do diff de loot/XP logo abaixo,
  // pra qualquer item de Treasure já entrar no MESMO `newItemSlots`
  // que detecta loot de monstro (nenhum LootDropped duplicado), e pro
  // XP de recompensa entrar na MESMA rolagem de LevelUp.
  const appliedExplorationReward =
    predictedExplorationEvent && tickResult.encounterGenerated
      ? applyExplorationEventReward(session, predictedExplorationEvent.reward, session.character.characterBuild.level, predictedLootSeed)
      : null;

  if (tickResult.encounterGenerated) {
    events.push({ kind: "EncounterStarted", regionId: region, enemyCount: tickResult.enemiesEncountered, tickIndex, timestamp });
    events.push({ kind: "AttackStarted", enemyCount: tickResult.enemiesEncountered, tickIndex, timestamp });
  }

  const damageDealtDelta = session.statistics.damageDealt - beforeStatistics.damageDealt;
  const damageTakenDelta = session.statistics.damageTaken - beforeStatistics.damageTaken;
  if (damageDealtDelta > 0 || damageTakenDelta > 0) {
    events.push({ kind: "AttackHit", damageDealt: damageDealtDelta, damageTaken: damageTakenDelta, tickIndex, timestamp });
  }

  if (tickResult.enemiesKilledThisTick > 0) {
    events.push({ kind: "EnemyKilled", count: tickResult.enemiesKilledThisTick, tickIndex, timestamp });
  }

  // Loot & Elites/Mini-Bosses — Engine Observability & Event Derivation
  // Phase I: `tickResult.lootDrops`/`encounterVariant`/
  // `variantEnemyTemplateId`/`variantEnemyDefeated` são fatos do engine
  // devolvidos diretamente por advanceAdventure() (adventureLoop.ts),
  // capturados ANTES de qualquer `addItem()`/de `currentEncounter` ser
  // zerado — não mais um diff de Inventory/Equipment depois do tick.
  // Isso corrige a causa raiz confirmada pela Engine Audit Phase I:
  // Inventory cheio fazia `addItem()` falhar e apagava a única pista
  // que existia de "um item apareceu"/"um Elite ou Mini-Boss foi
  // encontrado", mesmo o engine tendo processado tudo normalmente por
  // dentro. `encounterVariant`/`variantEnemyTemplateId` cobrem os dois
  // canais que antes eram separados (vitória via loot, derrota via
  // `session.currentEncounter`) com uma única fonte de verdade.
  const variantEnemyName = tickResult.variantEnemyTemplateId
    ? (getEnemyTemplate(tickResult.variantEnemyTemplateId)?.name ?? tickResult.variantEnemyTemplateId)
    : "";

  // Progression & Player Retention Phase I — requisito 1/2 — e
  // Gameplay Balance Phase I — requisito 4: XP por inimigo morto. O
  // Adventure Loop nunca concede XP (decisão confirmada com o usuário:
  // mantê-lo 100% intocado) — esta camada externa faz isso.
  // xpRewardForKill() (xp.ts) substitui o antigo XP_PER_PING reutilizado
  // na Sprint anterior por um valor calibrado especificamente pro
  // ritmo do Adventure Loop (ver xp.ts) — a curva de nível em si
  // continua inteiramente em getLevel()/getProgress(), intocada; só a
  // RECOMPENSA por abate foi calibrada.
  //
  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1/2: "XP
  // maior" — bônus somado à MESMA recompensa por abate, nunca uma
  // segunda curva (VARIANT_XP_MULTIPLIERS, eliteModifiers.ts).
  //
  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 4: XP de recompensa (Shrine/Discovery) somado ao MESMO pool, nunca
  // uma terceira curva — vem pronto de `applyExplorationEventReward()`.
  const levelBefore = session.character.characterBuild.level;
  const baseXpAwarded = tickResult.enemiesKilledThisTick * xpRewardForKill(levelBefore);
  // Engine Observability & Event Derivation Phase I — antes gated em
  // `variantKill` (só existia se o loot do Elite/Mini-Boss tivesse
  // conseguido `addItem()`); agora gated em `variantEnemyDefeated`, um
  // fato do engine que não depende do Inventory. Isto é uma CORREÇÃO
  // de bug (o jogador perdia o bônus de XP legítimo quando o Inventory
  // estava cheio no momento certo), não uma mudança de regra — o valor
  // do bônus em si (VARIANT_XP_MULTIPLIERS) continua intocado.
  const variantXpBonus =
    tickResult.variantEnemyDefeated && tickResult.encounterVariant !== "normal"
      ? Math.round(xpRewardForKill(levelBefore) * (VARIANT_XP_MULTIPLIERS[tickResult.encounterVariant] - 1))
      : 0;
  const explorationEventXpAmount = appliedExplorationReward?.xpAmount ?? 0;
  const xpAwarded = baseXpAwarded + variantXpBonus + explorationEventXpAmount;
  if (xpAwarded > 0) {
    session.character.characterBuild.addExperience(xpAwarded);
    timeline.totalXpGranted += xpAwarded;
  }
  const levelAfter = session.character.characterBuild.level;
  if (levelAfter > levelBefore) {
    events.push({ kind: "LevelUp", level: levelAfter, previousLevel: levelBefore, tickIndex, timestamp });
  }

  // Engine Observability & Event Derivation Phase I — `LootDropped`
  // emitido pra TODO `LootDropRecord` que o engine devolveu nesta tick
  // (combate + recompensa de World Event), `stored` carregando o
  // resultado real de `addItem()` — nunca mais um diff de Inventory/
  // Equipment que apaga o evento quando o Inventory está cheio.
  for (const drop of tickResult.lootDrops) {
    events.push({
      kind: "LootDropped",
      instanceId: drop.instanceId,
      baseItemId: drop.baseItemId,
      rarity: drop.rarity,
      powerScore: drop.powerScore,
      regionId: region,
      stored: drop.stored,
      tickIndex,
      timestamp,
    });
  }
  if (appliedExplorationReward) {
    for (const drop of appliedExplorationReward.lootDrops) {
      events.push({
        kind: "LootDropped",
        instanceId: drop.instanceId,
        baseItemId: drop.baseItemId,
        rarity: drop.rarity,
        powerScore: drop.powerScore,
        regionId: region,
        stored: drop.stored,
        tickIndex,
        timestamp,
      });
    }
  }

  // Requisito 6/7 — Elite/Mini-Boss "surgiu" (sempre publicado, vitória
  // ou derrota) e "foi derrotado" (só na vitória). Sempre no mesmo tick
  // em que o combate se resolveu (ver nota em types.ts sobre por que
  // nunca chega antecipado). Engine Observability & Event Derivation
  // Phase I — os dois sinais agora vêm de um único fato do engine
  // (`tickResult.encounterVariant`/`variantEnemyTemplateId`/
  // `variantEnemyDefeated`), não mais de loot bem-sucedido (vitória) +
  // `session.currentEncounter` (derrota) como dois canais separados.
  if (tickResult.encounterVariant !== "normal") {
    const enemyTemplateId = tickResult.variantEnemyTemplateId ?? "";
    const encounterKind = tickResult.encounterVariant === "elite" ? "EliteEncounter" : "MiniBossEncounter";
    events.push({ kind: encounterKind, enemyTemplateId, enemyName: variantEnemyName, regionId: region, tickIndex, timestamp });

    if (tickResult.variantEnemyDefeated) {
      if (tickResult.encounterVariant === "elite") {
        events.push({ kind: "EliteDefeated", enemyTemplateId, enemyName: variantEnemyName, xpBonus: variantXpBonus, tickIndex, timestamp });
      } else {
        events.push({ kind: "MiniBossDefeated", enemyTemplateId, enemyName: variantEnemyName, xpBonus: variantXpBonus, tickIndex, timestamp });
      }
    }
  }

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 5: "WorldEventStarted, WorldEventCompleted" sempre juntos (mesma
  // tick, mesma limitação estrutural de Elite/Mini-Boss) + o tipo
  // específico da categoria (requisito 5: "mais tipos quando
  // necessário"). Ambush não recebe uma recompensa própria (`reward`
  // sempre `{}`, ver worldEventDefinitions.ts) — quem concede XP/loot é
  // o combate real, já processado acima pelos mecanismos de sempre;
  // aqui só rotula o combate como Emboscada, pro banner/feed saberem.
  if (appliedExplorationReward && predictedExplorationEvent) {
    const explorationEventId = predictedExplorationEvent.id;
    const name = predictedExplorationEvent.name;
    const category = predictedExplorationEvent.category;
    events.push({ kind: "WorldEventStarted", explorationEventId, name, category, regionId: region, tickIndex, timestamp });
    events.push({ kind: "WorldEventCompleted", explorationEventId, name, category, tickIndex, timestamp });

    switch (category) {
      case "treasure":
        events.push({
          kind: "TreasureOpened",
          explorationEventId,
          itemCount: appliedExplorationReward.lootItemCount,
          bestRarity: appliedExplorationReward.bestLootRarity,
          goldAmount: appliedExplorationReward.goldAmount,
          tickIndex,
          timestamp,
        });
        break;
      case "merchant":
        events.push({ kind: "MerchantFound", explorationEventId, goldAmount: appliedExplorationReward.goldAmount, tickIndex, timestamp });
        break;
      case "shrine":
        events.push({
          kind: "ShrineBlessing",
          explorationEventId,
          recoveryAmount: appliedExplorationReward.recoveryAmount,
          xpAmount: appliedExplorationReward.xpAmount,
          goldAmount: appliedExplorationReward.goldAmount,
          tickIndex,
          timestamp,
        });
        break;
      case "discovery":
        events.push({ kind: "DiscoveryMade", explorationEventId, xpAmount: appliedExplorationReward.xpAmount, tickIndex, timestamp });
        break;
      case "ambush":
        events.push({ kind: "AmbushTriggered", explorationEventId, enemyCount: tickResult.enemiesEncountered, tickIndex, timestamp });
        break;
    }
  }

  // Equip: qualquer slot cujo instanceId mudou representa um
  // ItemEquipped real (Auto Equip do Adventure Loop, quando ligado).
  for (const slot of session.character.equipment.items) {
    const before = beforeEquippedInstanceIds.get(slot.slotId);
    if (slot.instanceId && slot.instanceId !== before && slot.item) {
      events.push({
        kind: "ItemEquipped",
        slotId: slot.slotId,
        baseItemId: slot.item.baseItemId,
        rarity: slot.item.rarity,
        powerScore: slot.item.powerScore,
        previousPowerScore: beforeEquippedPowerScore.get(slot.slotId) ?? 0,
        tickIndex,
        timestamp,
      });
    }
  }

  const encounterFinishedThisTick = session.statistics.encountersCompleted > beforeStatistics.encountersCompleted;
  if (encounterFinishedThisTick) {
    events.push({ kind: "EncounterFinished", enemiesKilled: tickResult.enemiesKilledThisTick, tickIndex, timestamp });
  }

  if (!tickResult.characterAlive) {
    events.push({ kind: "CharacterDied", tickIndex, timestamp });
  }

  const lifeLeechEstimate = estimateLifeLeech(beforeCurrentLife, lifeAfterCombatResolution, damageTakenDelta);
  const floatingNumbers = deriveFloatingNumbers(tickIndex, timestamp, damageDealtDelta, damageTakenDelta, lifeLeechEstimate);

  // World Events, Dynamic Encounters & Exploration Phase I — requisito
  // 4: reaproveita o MESMO FloatingNumberKind "heal" que a Recovery
  // Layer já usa (Recovery & Adventure Flow Phase I) — nenhum tipo
  // novo, mesmo efeito visual (número verde de cura).
  if (appliedExplorationReward && appliedExplorationReward.recoveryAmount > 0) {
    floatingNumbers.push({ kind: "heal", value: appliedExplorationReward.recoveryAmount, target: "character", tickIndex, timestamp });
  }

  timeline.events.push(...events);

  return { tickResult, events, floatingNumbers };
}
