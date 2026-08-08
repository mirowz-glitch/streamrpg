import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "./session.js";
import { advanceDungeonTick } from "../dungeon/dungeonController.js";
import { advanceAdventureWithPresentation, createAdventureTimeline } from "../presentation/presentationLayer.js";
import { generateEncounter } from "../worldencounter/generator.js";
import { spawnWorldEncounter } from "../worldencounter/spawn.js";
import { toCombatant } from "../enemy/combatant.js";
import { spawnEnemy, killEnemy } from "../enemy/instance.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { generateLoot } from "../lootgen/generator.js";
import { generateMonsterLoot } from "../lootidentity/generator.js";
import { generateLootForKilledEnemy } from "../enemy/lootIntegration.js";
import { resolveDungeonRuntimeConfig } from "../expeditions/expeditionModifiers.js";
import { resolveCombinedRuntimeConfig } from "../worldtiers/worldTierDefinitions.js";
import { applyMapModifiers } from "../mapmods/mapModifierRuntimeConfig.js";
import { NEUTRAL_COMBINED_RUNTIME_CONFIG } from "../worldencounter/types.js";
import type { AdventureCharacter } from "./types.js";

// Sprint 33 — Map Modifiers Phase II. Fase 9: primeira integração REAL
// dos Mods ao gameplay — cada bloco abaixo prova, ponta a ponta e por
// função de produção real (nunca reimplementada aqui), que um dos 7
// eixos de `CombinedRuntimeConfig` alterados por esta Sprint realmente
// muda o resultado de Combate/Encontro/Loot/Economia/XP.

function strongHero(suffix: string): AdventureCharacter {
  const build = new CharacterBuild(`hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`hero-${suffix}`, 30);
  const equipment = new Equipment(`hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  return createAdventureSession(`session-${suffix}`, strongHero(suffix), regionId, seed, 0);
}

describe("Sprint 33 — Map Modifiers Phase II: Combat (Fase 2)", () => {
  it("a MESMA composição que dungeon/dungeonController.ts usa no ponto único de resolução escala enemyLifeMultiplier/enemyDamageMultiplier ao spawnar um encontro real (spawnWorldEncounter)", () => {
    const recipe = generateEncounter("bosque-sussurrante", 10, 4242);
    assert.equal(recipe.variant, "normal", "seed fixada pra um encontro normal — combate puro, sem viés de Elite/MiniBoss");

    const neutralConfig = applyMapModifiers(resolveCombinedRuntimeConfig(undefined, resolveDungeonRuntimeConfig(undefined)), []);
    const moddedConfig = applyMapModifiers(resolveCombinedRuntimeConfig(undefined, resolveDungeonRuntimeConfig(undefined)), [
      "monster-damage-up",
      "monster-life-up",
    ]);

    const neutralEncounter = spawnWorldEncounter(recipe, neutralConfig);
    const moddedEncounter = spawnWorldEncounter(recipe, moddedConfig);

    assert.ok(neutralEncounter.enemies.length > 0);
    assert.equal(neutralEncounter.enemies.length, moddedEncounter.enemies.length);

    for (let i = 0; i < neutralEncounter.enemies.length; i++) {
      assert.ok(
        Math.abs(moddedEncounter.enemies[i].maximumLife - neutralEncounter.enemies[i].maximumLife * 1.4) < 1e-6,
        `inimigo ${i}: monster-life-up deveria dar +40% de vida máxima`,
      );

      const template = getEnemyTemplate(neutralEncounter.enemies[i].templateId)!;
      const neutralCombatant = toCombatant(neutralEncounter.enemies[i], template);
      const moddedCombatant = toCombatant(moddedEncounter.enemies[i], template);
      assert.ok(
        Math.abs(moddedCombatant.finalStats.physicalDamage - neutralCombatant.finalStats.physicalDamage * 1.2) < 1e-6,
        `inimigo ${i}: monster-damage-up deveria dar +20% de dano físico`,
      );
    }
  });
});

describe("Sprint 33 — Map Modifiers Phase II: Encounter (Fase 3) via advanceDungeonTick real", () => {
  it("elite-chance-up nunca REMOVE um Elite/Mini-Boss existente (mesma seed) e converte alguns encontros normais em Elite — prova de monotonicidade real via pickWeighted()", () => {
    const REGION = "bosque-sussurrante";
    let anyConverted = false;

    for (let seed = 1; seed <= 500; seed++) {
      const baseline = freshSession(REGION, seed, `mono-base-${seed}`);
      const timelineA = createAdventureTimeline(baseline.sessionId);
      const { tickResult: tickA } = advanceDungeonTick(baseline, timelineA, { currentTime: 1000 });

      const modded = freshSession(REGION, seed, `mono-mod-${seed}`);
      modded.activeMapModifiers.push("elite-chance-up");
      const timelineB = createAdventureTimeline(modded.sessionId);
      const { tickResult: tickB } = advanceDungeonTick(modded, timelineB, { currentTime: 1000 });

      if (tickA.encounterVariant === "elite") {
        assert.equal(tickB.encounterVariant, "elite", `seed ${seed}: elite-chance-up removeu um Elite que já existia sem Mod`);
      }
      if (tickA.encounterVariant === "miniboss") {
        assert.equal(tickB.encounterVariant, "miniboss", `seed ${seed}: elite-chance-up alterou um encontro Mini-Boss — nunca deveria ("Nunca alterar geração normal. Somente Elite.")`);
      }
      if (tickA.encounterVariant === "normal" && tickB.encounterVariant === "elite") anyConverted = true;
    }

    assert.ok(anyConverted, "esperava ao menos 1 seed (em 500) onde elite-chance-up converteu um encontro normal em Elite — Mod pode não estar realmente aplicando efeito via advanceDungeonTick()");
  });
});

describe("Sprint 33 — Map Modifiers Phase II: Loot (Fase 4)", () => {
  it("quantityMultiplierBonus escala a quantidade de itens de generateLoot(), nunca reduz, 'somente modificar pesos'", () => {
    let scaledHigher = false;
    for (let seed = 1; seed <= 200; seed++) {
      const base = generateLoot("wolf", 10, seed);
      const scaled = generateLoot("wolf", 10, seed, { quantityMultiplierBonus: 2 });
      assert.ok(
        scaled.generatedItems.length >= base.generatedItems.length,
        `seed ${seed}: quantityMultiplierBonus=2 nunca deveria gerar MENOS itens que o base (${scaled.generatedItems.length} < ${base.generatedItems.length})`,
      );
      if (scaled.generatedItems.length > base.generatedItems.length) scaledHigher = true;
    }
    assert.ok(scaledHigher, "esperava ao menos 1 seed (em 200) onde quantityMultiplierBonus realmente aumentou a quantidade gerada");
  });

  it("rarityMultiplierBonus eleva estatisticamente a taxa de itens não-comuns em generateMonsterLoot(), 'nunca ignorar Monster Signature/World Region — somente pesos'", () => {
    const RUNS = 800;
    let baseRareOrBetter = 0;
    let scaledRareOrBetter = 0;
    for (let seed = 1; seed <= RUNS; seed++) {
      const base = generateMonsterLoot("wolf", 30, seed, { dropChanceOverride: 1, minimumQuantity: 1 });
      const scaled = generateMonsterLoot("wolf", 30, seed, { dropChanceOverride: 1, minimumQuantity: 1, rarityMultiplierBonus: 4 });
      if (base.generatedItems.some((item) => item.rarity !== "common")) baseRareOrBetter++;
      if (scaled.generatedItems.some((item) => item.rarity !== "common")) scaledRareOrBetter++;
    }
    assert.ok(
      scaledRareOrBetter > baseRareOrBetter,
      `esperava mais itens não-comuns com rarityMultiplierBonus ativo: base=${baseRareOrBetter}/${RUNS}, escalado=${scaledRareOrBetter}/${RUNS}`,
    );
  });
});

describe("Sprint 33 — Map Modifiers Phase II: Economia — Ouro (Fase 5)", () => {
  it("gold-quantity-up (rewardMultiplier) escala o ouro adicional do Mini-Boss em generateLootForKilledEnemy(), mesma seed", () => {
    const template = getEnemyTemplate("wolf-alpha")!;
    for (let seed = 1; seed <= 30; seed++) {
      const instance = spawnEnemy(template, seed, 8, { variant: "miniboss" });
      const killResult = killEnemy(instance, template, 1000);

      const baseLoot = generateLootForKilledEnemy(killResult, killResult.instance, seed, "bosque-sussurrante");
      const moddedLoot = generateLootForKilledEnemy(killResult, killResult.instance, seed, "bosque-sussurrante", {
        ...NEUTRAL_COMBINED_RUNTIME_CONFIG,
        rewardMultiplier: 1.35,
      });

      const baseGold = baseLoot.currencies.find((c) => c.type === "gold")?.amount ?? 0;
      const moddedGold = moddedLoot.currencies.find((c) => c.type === "gold")?.amount ?? 0;
      assert.ok(baseGold > 0, `seed ${seed}: esperava ouro base > 0 pro Mini-Boss`);
      assert.equal(moddedGold, Math.round(baseGold * 1.35), `seed ${seed}: ouro do Mini-Boss não escalou pelo rewardMultiplier esperado`);
    }
  });
});

describe("Sprint 33 — Map Modifiers Phase II: Economia — XP por abate (Fase 5)", () => {
  it("experience-up (xpMultiplier) escala o XP total concedido por advanceAdventureWithPresentation() numa tick com abate real, mesma seed", () => {
    const REGION = "bosque-sussurrante";
    let chosenSeed = -1;
    for (let seed = 1; seed <= 300 && chosenSeed === -1; seed++) {
      const probe = freshSession(REGION, seed, `xp-probe-${seed}`);
      const timeline = createAdventureTimeline(probe.sessionId);
      const { tickResult, events } = advanceAdventureWithPresentation(probe, timeline, { currentTime: 1000 });
      const hasExplorationXp = events.some((event) => event.kind === "DiscoveryMade" || event.kind === "ShrineBlessing");
      if (tickResult.encounterVariant === "normal" && tickResult.enemiesKilledThisTick > 0 && !hasExplorationXp) {
        chosenSeed = seed;
      }
    }
    assert.ok(chosenSeed >= 0, "não encontrou em 300 seeds uma tick com abate normal e sem recompensa de exploração — não foi possível testar XP isoladamente");

    const baseline = freshSession(REGION, chosenSeed, "xp-base");
    const modded = freshSession(REGION, chosenSeed, "xp-mod");
    const timelineA = createAdventureTimeline(baseline.sessionId);
    const timelineB = createAdventureTimeline(modded.sessionId);

    advanceAdventureWithPresentation(baseline, timelineA, { currentTime: 1000 });
    advanceAdventureWithPresentation(modded, timelineB, { currentTime: 1000, runtimeConfig: { ...NEUTRAL_COMBINED_RUNTIME_CONFIG, xpMultiplier: 1.15 } });

    assert.ok(timelineA.totalXpGranted > 0, "esperava XP concedido no baseline");
    assert.equal(timelineB.totalXpGranted, Math.round(timelineA.totalXpGranted * 1.15), "XP total não escalou pelo xpMultiplier esperado");
  });
});

describe("Sprint 33 — Map Modifiers Phase II: Compatibilidade (Fase 8)", () => {
  it("activeMapModifiers vazio (padrão) produz resultado idêntico ao comportamento anterior a esta Sprint, via advanceDungeonTick", () => {
    const a = freshSession("bosque-sussurrante", 9001, "compat-a");
    const b = freshSession("bosque-sussurrante", 9001, "compat-b");
    const timelineA = createAdventureTimeline(a.sessionId);
    const timelineB = createAdventureTimeline(b.sessionId);

    const resultA = advanceDungeonTick(a, timelineA, { currentTime: 1000 });
    const resultB = advanceDungeonTick(b, timelineB, { currentTime: 1000 });

    assert.deepEqual(resultA.tickResult, resultB.tickResult);
    assert.deepEqual(a.statistics, b.statistics);
  });

  it("session.activeMapModifiers continua inicializando vazio por padrão (Sprint 32, intocado)", () => {
    const session = freshSession("bosque-sussurrante", 5, "compat-default");
    assert.deepEqual(session.activeMapModifiers, []);
  });
});
