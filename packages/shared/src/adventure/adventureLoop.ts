import { createSeededRandom, randomInt } from "../itemgen/rng.js";
import { generateEncounter } from "../worldencounter/generator.js";
import { spawnWorldEncounter } from "../worldencounter/spawn.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { killEnemy, applyCombatResultToEnemy } from "../enemy/instance.js";
import { toCombatant } from "../enemy/combatant.js";
import { generateLootForKilledEnemy } from "../enemy/lootIntegration.js";
import { resolveCombat } from "../combat/combatEngine.js";
import { toAdventureCombatant } from "./session.js";
import { tryAutoEquip } from "./autoEquip.js";
import type { AdventureSession, AdventureTickResult, LootDropRecord } from "./types.js";

export interface AdvanceAdventureOptions {
  autoEquip?: boolean;
  currentTime?: number;
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
    const recipe = generateEncounter(session.currentRegion, playerLevel, recipeSeed);
    session.currentEncounter = spawnWorldEncounter(recipe);
    encounterGenerated = true;
  }

  const encounter = session.currentEncounter;
  let enemiesKilledThisTick = 0;
  let itemsFoundThisTick = 0;
  let itemsEquippedThisTick = 0;
  const lootDrops: LootDropRecord[] = [];

  // Engine Observability & Event Derivation Phase I — capturados AQUI,
  // antes de `session.currentEncounter` poder ser zerado (linha 150
  // abaixo) ou de qualquer tentativa de `addItem()`: fatos do encontro
  // em si, nunca inferidos por diff de Inventory/Equipment depois.
  // Elite/MiniBoss têm sempre exatamente 1 inimigo no grupo (garantido
  // pelo World Encounter Generator), daí `enemies[0]`.
  const encounterVariant = encounter.variant;
  const variantEnemyTemplateId = encounterVariant !== "normal" ? (encounter.enemies[0]?.templateId ?? null) : null;

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

      const attackResult = resolveCombat({
        attacker: playerCombatant,
        target: enemyCombatant,
        seed: randomInt(rng, 0, 2_147_483_647),
        timestamp: currentTime,
        attackType: "physical",
      });

      enemy = applyCombatResultToEnemy(enemy, attackResult);
      session.statistics.damageDealt += attackResult.damage;
      session.character.currentLife = Math.min(
        playerCombatant.finalStats.maximumLife,
        session.character.currentLife + attackResult.lifeLeech,
      );

      if (enemy.currentLife <= 0) break;

      const counterResult = resolveCombat({
        attacker: enemyCombatant,
        target: playerCombatant,
        seed: randomInt(rng, 0, 2_147_483_647),
        timestamp: currentTime,
        attackType: "physical",
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
      const loot = generateLootForKilledEnemy(killResult, killResult.instance, lootSeed);

      for (const item of loot.generatedItems) {
        const instanceId = `${session.sessionId}-item-${randomInt(rng, 0, 2_147_483_647)}`;
        const addResult = session.character.inventory.addItem(instanceId, item);

        // Engine Observability & Event Derivation Phase I — o fato "o
        // Loot Generator produziu este item" é registrado SEMPRE, com
        // `stored` indicando o resultado real de `addItem()`; nenhuma
        // regra de loot/probabilidade muda aqui, só o que fica visível
        // pra quem consome o resultado da tick.
        lootDrops.push({ instanceId, baseItemId: item.baseItemId, rarity: item.rarity, powerScore: item.powerScore, stored: addResult.success });

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
    encounterVariant,
    variantEnemyTemplateId,
    variantEnemyDefeated,
  };
}
