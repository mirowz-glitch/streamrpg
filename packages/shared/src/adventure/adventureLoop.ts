import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import { generateEncounter } from "../worldencounter/generator.js";
import { spawnWorldEncounter } from "../worldencounter/spawn.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { killEnemy, applyCombatResultToEnemy } from "../enemy/instance.js";
import { toCombatant } from "../enemy/combatant.js";
import { generateLootForKilledEnemy } from "../enemy/lootIntegration.js";
import { resolveCombat } from "../combat/combatEngine.js";
import { resolveOffensiveBehaviorModifiers, resolveChillChancePercent, resolveDefensiveDamageMultiplier } from "../combat/behaviorModifiers.js";
import type { ActiveBehaviorSummary } from "../combat/combatSnapshot.js";
import { toAdventureCombatant } from "./session.js";
import { tryAutoEquip } from "./autoEquip.js";
import { rollSphereDrop } from "../spheredrop/rollSphereDrop.js";
import type { SphereSource } from "../spheredrop/types.js";
import type { CombinedRuntimeConfig } from "../worldencounter/types.js";
import type { AdventureSession, AdventureTickResult, LootDropRecord, SphereDropRecord } from "./types.js";

export interface AdvanceAdventureOptions {
  autoEquip?: boolean;
  currentTime?: number;
  // Vertical Slice — Dungeon Modifier Runtime Integration Phase I —
  // Fase 1/2: o RuntimeConfig já resolvido (nunca uma lista de ids de
  // modificador) — mesmo princípio de `autoEquip`/`currentTime`: um
  // campo opcional que atravessa TODA a cadeia de wrappers
  // (dungeonController -> factionController -> expeditionController ->
  // objectiveLayer -> recoveryLayer -> presentationLayer -> aqui) sem
  // que nenhum deles precise saber o que é — só quem resolve
  // (dungeon/dungeonController.ts) e quem consome de verdade
  // (generateEncounter()/spawnWorldEncounter() logo abaixo,
  // recovery/recoveryLayer.ts) leem este campo. `undefined` (fora de
  // uma Dungeon, ou sessão/Simulador que nunca passa isso) = mesmo
  // comportamento de sempre, sem nenhum "modo especial".
  //
  // Vertical Slice — World Tiers & Endgame Scaling Phase I — Fase 2:
  // agora sempre um `CombinedRuntimeConfig` (World Tier x Dungeon
  // Modifiers já combinados por dungeon/dungeonController.ts) — este
  // arquivo continua sem saber que World Tiers existem, só ganhou 2
  // campos novos no MESMO objeto que já lia.
  runtimeConfig?: CombinedRuntimeConfig;
  // Sprint 13 — Sphere Economy Phase I, Fase 4: mesmo princípio de
  // `runtimeConfig` acima — um campo opcional resolvido UMA vez por
  // `dungeon/dungeonController.ts` (o único lugar que sabe "existe uma
  // Expedição-Dungeon ativa agora", via `isDungeonExpedition()`) e
  // atravessando a mesma cadeia de wrappers sem que nenhum deles
  // precise entender Dungeons. `undefined`/`false` fora de uma Dungeon
  // (incluindo todo Simulador/teste que nunca passa isso) = mesmo
  // comportamento de sempre (fonte de Esfera "adventure").
  inDungeon?: boolean;
}

// Requisito 2 — Adventure Tick: a ÚNICA função que orquestra um ciclo
// completo do pipeline (requisito arquitetural):
//
//   Encounter -> Combat -> Loot -> Inventory -> Equipment (Auto Equip
//   opcional) -> Character Progress -> Próximo Encounter
//
// "Tudo usando os sistemas existentes. Nenhuma lógica duplicada" —
// esta função só CHAMA generateEncounter()/spawnWorldEncounter()
// (World Encounter System), resolveCombat() (Combat Engine),
// toCombatant()/applyCombatResultToEnemy()/killEnemy()/
// generateLootForKilledEnemy() (Enemy System) e
// inventory.addItem()/equipment.equipItem() (Inventory/Equipment) —
// nenhum cálculo de dano/loot/stat é feito aqui.
//
// Um tick resolve UM encontro inteiro: gera (se não houver um em
// andamento), luta contra cada inimigo até a morte dele OU do
// personagem, processa loot de cada morte, e encerra o encontro
// quando todos os inimigos morrem. Se o personagem morrer no meio do
// encontro, o tick para ali — `currentEncounter` permanece preenchido
// (mostrando onde a aventura parou) e uma chamada seguinte a
// advanceAdventure() lança erro (sessão encerrada).
//
// Determinístico: todo número aleatório usado neste tick vem de UM
// stream de RNG seedado a partir de `session.seed` combinado com
// `session.statistics.encountersCompleted` (avança a cada encontro
// concluído) — nenhuma chamada a Math.random.
export function advanceAdventure(session: AdventureSession, options: AdvanceAdventureOptions = {}): AdventureTickResult {
  if (session.character.currentLife <= 0) {
    throw new Error(`Adventure Session: personagem "${session.sessionId}" já está morto, sessão encerrada`);
  }

  const currentTime = options.currentTime ?? Date.now();
  const rng = createSeededRandom(session.seed + session.statistics.encountersCompleted);

  let encounterGenerated = false;

  // 1. Gerar encontro (requisito 2) — só quando não há um em
  // andamento.
  if (!session.currentEncounter) {
    const playerLevel = session.character.characterBuild.level;
    const recipeSeed = randomInt(rng, 0, 2_147_483_647);
    const recipe = generateEncounter(session.currentRegion, playerLevel, recipeSeed, options.runtimeConfig);
    session.currentEncounter = spawnWorldEncounter(recipe, options.runtimeConfig);
    encounterGenerated = true;
  }

  const encounter = session.currentEncounter;
  let enemiesKilledThisTick = 0;
  let itemsFoundThisTick = 0;
  let itemsEquippedThisTick = 0;
  const lootDrops: LootDropRecord[] = [];
  const sphereDrops: SphereDropRecord[] = [];

  // Engine Observability & Event Derivation Phase I — capturados AQUI,
  // antes de `session.currentEncounter` poder ser zerado (linha 150
  // abaixo) ou de qualquer tentativa de `addItem()`: fatos do encontro
  // em si, nunca inferidos por diff de Inventory/Equipment depois.
  // Elite/MiniBoss têm sempre exatamente 1 inimigo no grupo (garantido
  // pelo World Encounter Generator), daí `enemies[0]`.
  const encounterVariant = encounter.variant;
  const variantEnemyTemplateId = encounterVariant !== "normal" ? (encounter.enemies[0]?.templateId ?? null) : null;

  // Sprint 13 — Sphere Economy Phase I: a fonte é decidida UMA vez por
  // tick (o `variant` de um encontro não muda no meio dele) — Elite/
  // MiniBoss (inclusive o Chefe Final de uma Dungeon, que é um
  // MiniBoss com template designado, ver dungeon/dungeonController.ts)
  // sempre vencem "dungeon" mesmo quando `options.inDungeon` é true:
  // "Boss" (Fase 5) é uma fonte estritamente melhor que "Dungeon"
  // (Fase 4), nunca as duas ao mesmo tempo.
  const sphereSource: SphereSource = encounterVariant !== "normal" ? "boss" : options.inDungeon ? "dungeon" : "adventure";

  // Sprint 23 — Sockets & Gems Phase II, Fase 6/7: Gem Behaviors ativos
  // do personagem, lidos direto do Combat Snapshot já resolvido (nunca
  // recalculados aqui) — mesma lista pro encontro inteiro (um Behavior
  // não muda no meio de um encontro, igual `sphereSource` acima).
  // Dungeon herda de graça (mesmo `advanceAdventure`, nenhuma lógica
  // paralela).
  const activeBehaviors: ActiveBehaviorSummary[] = session.character.realCombatSnapshot?.activeBehaviors ?? [];

  // 2/3. Executar combate contra cada inimigo do encontro, em ordem.
  for (let i = 0; i < encounter.enemies.length; i++) {
    let enemy = encounter.enemies[i];
    const template = getEnemyTemplate(enemy.templateId);
    if (!template) {
      throw new Error(`Adventure Session: Enemy Template desconhecido "${enemy.templateId}"`);
    }

    while (enemy.alive && enemy.currentLife > 0 && session.character.currentLife > 0) {
      const playerCombatant = toAdventureCombatant(session.character);
      const enemyCombatant = toCombatant(enemy, template);

      // Rubi (dano de fogo aditivo) + Ônix (crítico bônus) — os dois
      // Behaviors que afetam o ATAQUE do personagem, traduzidos pros
      // hooks já existentes do Combat Engine (`FutureCombatModifiers`).
      const offensiveModifiers = resolveOffensiveBehaviorModifiers(activeBehaviors, playerCombatant.finalStats.criticalChance);

      const attackResult = resolveCombat({
        attacker: playerCombatant,
        target: enemyCombatant,
        seed: randomInt(rng, 0, 2_147_483_647),
        timestamp: currentTime,
        attackType: "physical",
        futureModifiers: {
          bonusFlatDamage: offensiveModifiers.bonusFlatDamage,
          criticalChanceMultiplier: offensiveModifiers.criticalChanceMultiplier,
        },
      });

      enemy = applyCombatResultToEnemy(enemy, attackResult);
      session.statistics.damageDealt += attackResult.damage;
      session.character.currentLife = Math.min(
        playerCombatant.finalStats.maximumLife,
        session.character.currentLife + attackResult.lifeLeech,
      );

      if (enemy.currentLife <= 0) break;

      // Safira (congelar) — rolado aqui, contra o MESMO stream de rng
      // (D1: nenhuma nova fonte) — quando proca, reduz o contra-ataque
      // desta mesma tick. Ametista (resistência) é sempre ativa,
      // combinada multiplicativamente com o chill (nunca somada).
      const chillChancePercent = resolveChillChancePercent(activeBehaviors);
      const chillProcced = chillChancePercent > 0 && rng() < chillChancePercent / 100;
      const damageMultiplier = resolveDefensiveDamageMultiplier(activeBehaviors, chillProcced);

      const counterResult = resolveCombat({
        attacker: enemyCombatant,
        target: playerCombatant,
        seed: randomInt(rng, 0, 2_147_483_647),
        timestamp: currentTime,
        attackType: "physical",
        futureModifiers: { damageMultiplier },
      });

      session.character.currentLife = counterResult.remainingLife;
      session.statistics.damageTaken += counterResult.damage;
    }

    encounter.enemies[i] = enemy;

    // 4/5/6 — Resolver morte + gerar loot + adicionar ao inventário
    // (+ Auto Equip opcional).
    if (enemy.currentLife <= 0 && session.character.currentLife > 0) {
      const killResult = killEnemy(enemy, template, currentTime);
      encounter.enemies[i] = killResult.instance;
      enemiesKilledThisTick++;
      session.statistics.enemiesKilled++;

      const lootSeed = randomInt(rng, 0, 2_147_483_647);
      const loot = generateLootForKilledEnemy(killResult, killResult.instance, lootSeed, session.currentRegion, options.runtimeConfig);

      for (const item of loot.generatedItems) {
        const instanceId = `${session.sessionId}-item-${randomInt(rng, 0, 2_147_483_647)}`;
        const addResult = session.character.inventory.addItem(instanceId, item);

        // Engine Observability & Event Derivation Phase I — o fato "o
        // Loot Generator produziu este item" é registrado SEMPRE, com
        // `stored` indicando o resultado real de `addItem()`; nenhuma
        // regra de loot/probabilidade muda aqui, só o que fica visível
        // pra quem consome o resultado da tick.
        lootDrops.push({
          instanceId,
          baseItemId: item.baseItemId,
          rarity: item.rarity,
          powerScore: item.powerScore,
          stored: addResult.success,
          itemLevel: item.itemLevel,
          seed: item.seed,
          prefixes: item.prefixes,
          suffixes: item.suffixes,
        });

        if (!addResult.success) continue;

        itemsFoundThisTick++;
        session.statistics.itemsFound++;

        if (options.autoEquip && tryAutoEquip(session.character, instanceId, item)) {
          itemsEquippedThisTick++;
          session.statistics.itemsEquipped++;
        }
      }

      // requisito 3 — sempre 0 nesta fase (ver types.ts).
      session.statistics.goldFound += loot.currencies.length;

      // Sprint 13 — Sphere Economy Phase I: uma rolagem por MORTE (não
      // por item de loot) — mesmo espírito de `lootSeed` acima, MESMO
      // stream de `rng` (D1: nenhuma nova fonte de RNG). "Nunca
      // diretamente no inventário de itens" (Fase 7) — por isso isto
      // só produz um FATO (`SphereDropRecord`), nunca chama
      // `inventory.addItem()`; a persistência real em
      // `character_spheres` acontece fora do Engine (apps/api).
      const sphereRoll = rollSphereDrop(sphereSource, rng);
      if (sphereRoll.sphereId) {
        sphereDrops.push({ sphereId: sphereRoll.sphereId, source: sphereRoll.source });
      }
    }

    if (session.character.currentLife <= 0) break;
  }

  // 7. Encerrar encontro — só quando REALMENTE terminou (todos os
  // inimigos mortos); se o personagem morreu no meio, o encontro
  // permanece visível na sessão.
  const allEnemiesDead = encounter.enemies.every((instance) => !instance.alive);
  const variantEnemyDefeated = encounterVariant !== "normal" && allEnemiesDead && enemiesKilledThisTick > 0;
  if (allEnemiesDead) {
    session.statistics.encountersCompleted++;
    session.currentEncounter = null;
  }

  session.statistics.elapsedTime = currentTime - session.startTime;

  return {
    encounterGenerated,
    enemiesEncountered: encounter.enemies.length,
    enemiesKilledThisTick,
    itemsFoundThisTick,
    itemsEquippedThisTick,
    characterAlive: session.character.currentLife > 0,
    lootDrops,
    sphereDrops,
    encounterVariant,
    variantEnemyTemplateId,
    variantEnemyDefeated,
  };
}
