import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "../src/presentation/presentationLayer.js";
import { advanceDungeonTick } from "../src/dungeon/dungeonController.js";
import { calculateSaleValue } from "../src/economy/saleValue.js";
import { calculateUpgradeCost } from "../src/equipment/upgrade.js";
import { calculateSalvageRewards } from "../src/equipment/salvage.js";
import { getBaseItem } from "../src/itemgen/baseItems.js";
import type { ItemRarity } from "../src/types.js";

void advanceAdventureWithPresentation; // referenced only to keep import group consistent with other scripts; not called directly here

// RC-1 Fase 4 — Balanceamento Inicial (ajustada): "quero números reais,
// não opiniões." Mesmo princípio de todo script em scripts/ (auditRng*,
// runProgressionEconomyAudit): orquestra o motor real
// (advanceDungeonTick, intocado) em loop próprio — necessário aqui
// porque runSimulatedAdventure() (simulation/simulator.ts) só devolve
// um RESUMO agregado por execução, não uma linha do tempo de "em que
// segundo o personagem cruzou o nível N" ou "qual era o Power Score
// médio equipado NAQUELE momento" — o que esta Fase pede explicitamente
// (tempo até nível 10/20/30, Power Score por checkpoint de nível).
// Fase 4 é explícita: "não quero alterar taxas/fórmulas/RNG/
// multiplicadores" — este script só OBSERVA, nunca chama nenhuma
// função de mutação de balanceamento.
const SECONDS_PER_TICK = 22;
const MAX_SIMULATED_SECONDS = 3 * 3600; // 3h simuladas — teto generoso pra alcançar nível 30 na maioria das execuções
const RUNS = 30;
const REGION_ID = "bosque-sussurrante";
const CLASS_ID = "warrior";
const LEVEL_CHECKPOINTS = [1, 5, 10, 20, 30];

// Mesma tradução já usada em produção (apps/web/src/hooks/useAdventureSession.ts,
// RARITY_TO_PERSISTED) — nunca uma segunda tabela inventada aqui.
const RARITY_TO_SIMPLE: Record<string, ItemRarity> = {
  common: "common",
  magic: "uncommon",
  rare: "rare",
  unique: "legendary",
};

interface UnequippedLootSample {
  rarity: ItemRarity;
  minLevel: number;
}

interface RunResult {
  seed: number;
  finalLevel: number;
  simulatedSeconds: number;
  xpGained: number;
  goldFound: number;
  itemsByRarity: Record<string, number>;
  eliteDefeated: number;
  miniBossDefeated: number;
  bossDefeated: number;
  secondsToLevel: Map<number, number>;
  powerScoreAtLevelCheckpoint: Map<number, number>;
  unequippedLoot: UnequippedLootSample[];
  autoEquipUpgradeEvents: { rarityGen: string; powerScore: number; previousPowerScore: number }[];
  equippedPowerScoreSeries: number[]; // uma amostra por level-up real, pra checar platô/regressão
}

function averageEquippedPowerScore(equipment: Equipment): number {
  const scores = equipment.items.map((slot) => slot.item?.powerScore).filter((v): v is number => typeof v === "number");
  if (scores.length === 0) return 0;
  return scores.reduce((sum, v) => sum + v, 0) / scores.length;
}

function runOne(seed: number): RunResult {
  const characterId = `fase4-${seed}`;
  const build = new CharacterBuild(characterId, CLASS_ID, 0);
  const inventory = new Inventory(characterId, 24);
  const equipment = new Equipment(characterId);
  const character = createAdventureCharacter(build, inventory, equipment);
  equipStarterKit(character, CLASS_ID, seed);
  const session = createAdventureSession(`${characterId}-session`, character, REGION_ID, seed, 0);
  const timeline = createAdventureTimeline(session.sessionId);

  const itemsByRarity: Record<string, number> = { common: 0, magic: 0, rare: 0, unique: 0 };
  const secondsToLevel = new Map<number, number>();
  const powerScoreAtLevelCheckpoint = new Map<number, number>();
  const unequippedLoot: UnequippedLootSample[] = [];
  const autoEquipUpgradeEvents: RunResult["autoEquipUpgradeEvents"] = [];
  const equippedPowerScoreSeries: number[] = [];
  let eliteDefeated = 0;
  let miniBossDefeated = 0;
  let bossDefeated = 0;
  let lastLevel = character.characterBuild.level;
  let lastLoggedLevel = 0;

  let ticks = 0;
  while (ticks * SECONDS_PER_TICK < MAX_SIMULATED_SECONDS && session.character.currentLife > 0) {
    ticks++;
    const currentTime = ticks * SECONDS_PER_TICK * 1000;
    const { events } = advanceDungeonTick(session, timeline, { autoEquip: true, currentTime });
    const nowSeconds = ticks * SECONDS_PER_TICK;
    const currentLevel = session.character.characterBuild.level;

    if (currentLevel > lastLevel) {
      for (let lvl = lastLevel + 1; lvl <= currentLevel; lvl++) {
        if (!secondsToLevel.has(lvl)) secondsToLevel.set(lvl, nowSeconds);
      }
      lastLevel = currentLevel;
    }
    for (const checkpoint of LEVEL_CHECKPOINTS) {
      if (currentLevel >= checkpoint && checkpoint > lastLoggedLevel && !powerScoreAtLevelCheckpoint.has(checkpoint)) {
        powerScoreAtLevelCheckpoint.set(checkpoint, averageEquippedPowerScore(session.character.equipment));
      }
    }
    lastLoggedLevel = Math.max(lastLoggedLevel, ...LEVEL_CHECKPOINTS.filter((c) => currentLevel >= c), 0);

    for (const event of events) {
      if (event.kind === "LootDropped") {
        if (event.rarity in itemsByRarity) itemsByRarity[event.rarity]++;
        const base = getBaseItem(event.baseItemId);
        unequippedLoot.push({
          rarity: RARITY_TO_SIMPLE[event.rarity] ?? "common",
          minLevel: base?.requirements?.level ?? 1,
        });
      }
      if (event.kind === "ItemEquipped") {
        // "removida do inventário" pelo AutoEquip — não é mais loot livre
        // pra vender/desmontar; um upgrade real de gear, nunca contado
        // duas vezes no potencial de Merchant/Salvage abaixo.
        unequippedLoot.pop();
        if (event.powerScore > event.previousPowerScore) {
          autoEquipUpgradeEvents.push({ rarityGen: event.rarity, powerScore: event.powerScore, previousPowerScore: event.previousPowerScore });
          equippedPowerScoreSeries.push(averageEquippedPowerScore(session.character.equipment));
        }
      }
      if (event.kind === "EliteDefeated") eliteDefeated++;
      if (event.kind === "MiniBossDefeated") miniBossDefeated++;
      if (event.kind === "FinalBossDefeated") bossDefeated++;
    }
  }

  return {
    seed,
    finalLevel: session.character.characterBuild.level,
    simulatedSeconds: ticks * SECONDS_PER_TICK,
    xpGained: session.character.characterBuild.experience,
    goldFound: session.statistics.goldFound,
    itemsByRarity,
    eliteDefeated,
    miniBossDefeated,
    bossDefeated,
    secondsToLevel,
    powerScoreAtLevelCheckpoint,
    unequippedLoot,
    autoEquipUpgradeEvents,
    equippedPowerScoreSeries,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function main() {
  const runs: RunResult[] = [];
  for (let i = 0; i < RUNS; i++) runs.push(runOne(1000 + i));

  const totalHours = runs.reduce((sum, r) => sum + r.simulatedSeconds, 0) / 3600;
  const totalMinutes = totalHours * 60;

  const xpPerMinute = average(runs.map((r) => r.xpGained / (r.simulatedSeconds / 60)));
  const goldPerMinute = average(runs.map((r) => r.goldFound / (r.simulatedSeconds / 60)));
  const levelsPerHour = average(runs.map((r) => r.finalLevel / (r.simulatedSeconds / 3600)));

  function timeToLevel(level: number) {
    const samples = runs.map((r) => r.secondsToLevel.get(level)).filter((v): v is number => v !== undefined);
    return { reachedBy: samples.length, totalRuns: runs.length, averageSeconds: average(samples) };
  }

  const itemsByRarityTotal = runs.reduce(
    (acc, r) => {
      for (const key of Object.keys(r.itemsByRarity)) acc[key] = (acc[key] ?? 0) + r.itemsByRarity[key];
      return acc;
    },
    {} as Record<string, number>,
  );
  const eliteTotal = runs.reduce((sum, r) => sum + r.eliteDefeated, 0);
  const miniBossTotal = runs.reduce((sum, r) => sum + r.miniBossDefeated, 0);
  const bossTotal = runs.reduce((sum, r) => sum + r.bossDefeated, 0);

  function itemsPerHour(count: number) {
    return count / totalHours;
  }

  function powerScoreAt(level: number) {
    const samples = runs.map((r) => r.powerScoreAtLevelCheckpoint.get(level)).filter((v): v is number => v !== undefined);
    return { reachedBy: samples.length, average: average(samples) };
  }

  // Merchant/Salvage "potencial": aplica a MESMA função pura que o
  // servidor usa (saleValue.ts/salvage.ts) sobre o loot real gerado e
  // NUNCA equipado por esta simulação — não é uma suposição de
  // comportamento, é o valor real que aquele loot real renderia se
  // fosse vendido/desmontado (o jogador escolhe qual das duas ações
  // fazer com cada item; os dois números juntos não devem ser somados
  // como se fossem cumulativos).
  let potentialMerchantGoldTotal = 0;
  let potentialSalvageMaterialsTotal = 0;
  for (const r of runs) {
    for (const item of r.unequippedLoot) {
      potentialMerchantGoldTotal += calculateSaleValue({ rarity: item.rarity, min_level: item.minLevel });
      potentialSalvageMaterialsTotal += calculateSalvageRewards({ rarity: item.rarity, upgrade_level: 0, power_score: 1 })[0].amount;
    }
  }
  const potentialMerchantGoldPerHour = potentialMerchantGoldTotal / totalHours;
  const potentialSalvageMaterialsPerHour = potentialSalvageMaterialsTotal / totalHours;

  // Blacksmith: não é medível via simulação (é uma ação deliberada do
  // jogador sobre o item JÁ equipado, nunca disparada automaticamente
  // pelo AutoEquip) — reportamos a TABELA de custo real (mesma função
  // pura do servidor), não uma taxa/hora inventada.
  const blacksmithCostSamples = (["common", "uncommon", "rare", "epic", "legendary"] as ItemRarity[]).map((rarity) => ({
    rarity,
    costAtUpgradeLevel0: calculateUpgradeCost({ rarity, upgrade_level: 0 }),
    costAtUpgradeLevel5: calculateUpgradeCost({ rarity, upgrade_level: 5 }),
  }));

  // AutoEquip: cresce continuamente? platô? regressão?
  const allUpgradeSeries = runs.map((r) => r.equippedPowerScoreSeries);
  let regressionCount = 0;
  let totalTransitions = 0;
  for (const series of allUpgradeSeries) {
    for (let i = 1; i < series.length; i++) {
      totalTransitions++;
      if (series[i] < series[i - 1]) regressionCount++;
    }
  }
  const averageUpgradesPerRun = average(runs.map((r) => r.autoEquipUpgradeEvents.length));

  const report = {
    meta: { runs: RUNS, maxSimulatedSeconds: MAX_SIMULATED_SECONDS, secondsPerTick: SECONDS_PER_TICK, totalSimulatedHours: totalHours },
    progression: {
      xpPerMinute,
      levelsPerHour,
      averageFinalLevel: average(runs.map((r) => r.finalLevel)),
      timeToLevel10: timeToLevel(10),
      timeToLevel20: timeToLevel(20),
      timeToLevel30: timeToLevel(30),
      runsSurvivedFullDuration: runs.filter((r) => r.simulatedSeconds >= MAX_SIMULATED_SECONDS).length,
    },
    economy: {
      goldPerMinute,
      goldPerHour: goldPerMinute * 60,
      potentialMerchantGoldPerHour,
      potentialSalvageMaterialsPerHour,
      blacksmithCostTable: blacksmithCostSamples,
    },
    loot: {
      itemsByRarityTotal,
      itemsPerHour: {
        common: itemsPerHour(itemsByRarityTotal.common ?? 0),
        magic: itemsPerHour(itemsByRarityTotal.magic ?? 0),
        rare: itemsPerHour(itemsByRarityTotal.rare ?? 0),
        unique: itemsPerHour(itemsByRarityTotal.unique ?? 0),
        elite: itemsPerHour(eliteTotal),
        miniBoss: itemsPerHour(miniBossTotal),
        boss: itemsPerHour(bossTotal),
      },
    },
    equipment: {
      powerScoreAtLevel1: powerScoreAt(1),
      powerScoreAtLevel5: powerScoreAt(5),
      powerScoreAtLevel10: powerScoreAt(10),
      powerScoreAtLevel20: powerScoreAt(20),
      powerScoreAtLevel30: powerScoreAt(30),
    },
    autoEquip: {
      averageUpgradesPerRun,
      totalTransitionsObserved: totalTransitions,
      regressionsObserved: regressionCount,
      regressionRate: totalTransitions > 0 ? regressionCount / totalTransitions : 0,
    },
    extremeCaseScan: {
      maxGoldInAnySingleRun: Math.max(...runs.map((r) => r.goldFound)),
      maxGoldPerMinuteInAnySingleRun: Math.max(...runs.map((r) => r.goldFound / (r.simulatedSeconds / 60))),
      minLevelsAfter30Min: Math.min(
        ...runs.map((r) => {
          const at30min = [...r.secondsToLevel.entries()].filter(([, s]) => s <= 1800).map(([lvl]) => lvl);
          return at30min.length > 0 ? Math.max(...at30min) : 1;
        }),
      ),
      uniqueDropRatePercent: ((itemsByRarityTotal.unique ?? 0) / Object.values(itemsByRarityTotal).reduce((a, b) => a + b, 0)) * 100,
    },
  };

  const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "fase4-metrics-audit.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nRelatório salvo em ${outPath}`);
}

main();
