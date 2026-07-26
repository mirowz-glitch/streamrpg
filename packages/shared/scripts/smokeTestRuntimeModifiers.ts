import { generateEncounter } from "../src/worldencounter/generator.js";
import { spawnWorldEncounter } from "../src/worldencounter/spawn.js";
import { toCombatant } from "../src/enemy/combatant.js";
import { getEnemyTemplate } from "../src/enemy/templates.js";
import { NEUTRAL_DUNGEON_RUNTIME_CONFIG } from "../src/worldencounter/types.js";
import type { DungeonRuntimeConfig } from "../src/worldencounter/types.js";
import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline } from "../src/presentation/presentationLayer.js";
import { advanceAdventureWithRecovery } from "../src/recovery/recoveryLayer.js";

// Vertical Slice — Dungeon Modifier Runtime Integration Phase I —
// Smoke Test (curto, sem sessões longas): prova que o RuntimeConfig
// resolvido realmente altera o comportamento dos sistemas consumidores
// (Encounter/Combat/Recovery), não só metadados/recompensa (já
// validado na Sprint anterior).
const lines: string[] = [];
lines.push("# Smoke Test — Vertical Slice: Dungeon Modifier Runtime Integration Phase I");
lines.push("");
let allPassed = true;
function check(name: string, passed: boolean) {
  lines.push(`- [${passed ? "OK" : "FALHOU"}] ${name}`);
  if (!passed) allPassed = false;
}

// --- Combat: enemyLifeMultiplier/enemyDamageMultiplier realmente
// escalam vida/dano do inimigo spawnado (não só metadado) ---
lines.push("## Combat — vida/dano de inimigo");
{
  const regionId = "bosque-sussurrante";
  const level = 5;
  let normalSeed = 0;
  let recipe = generateEncounter(regionId, level, normalSeed);
  while (recipe.variant !== "normal" && normalSeed < 1000) {
    normalSeed++;
    recipe = generateEncounter(regionId, level, normalSeed);
  }
  check("achou uma seed com encontro 'normal' pra medir sem ruído de variante", recipe.variant === "normal");

  const boosted: DungeonRuntimeConfig = { ...NEUTRAL_DUNGEON_RUNTIME_CONFIG, enemyLifeMultiplier: 1.5, enemyDamageMultiplier: 1.5 };
  const baseline = spawnWorldEncounter(recipe);
  const modified = spawnWorldEncounter(recipe, boosted);

  const template = getEnemyTemplate(baseline.enemies[0].templateId)!;
  const baselineDamage = toCombatant(baseline.enemies[0], template).finalStats.physicalDamage;
  const modifiedDamage = toCombatant(modified.enemies[0], template).finalStats.physicalDamage;

  check(
    `enemyLifeMultiplier 1.5x: vida do inimigo escala de ${baseline.enemies[0].maximumLife.toFixed(1)} pra ${modified.enemies[0].maximumLife.toFixed(1)}`,
    Math.abs(modified.enemies[0].maximumLife - baseline.enemies[0].maximumLife * 1.5) < 1e-6,
  );
  check(
    `enemyDamageMultiplier 1.5x: dano físico escala de ${baselineDamage.toFixed(1)} pra ${modifiedDamage.toFixed(1)}`,
    Math.abs(modifiedDamage - baselineDamage * 1.5) < 1e-6,
  );
}
lines.push("");

// --- Encounter: eliteChanceMultiplier/miniBossChanceMultiplier
// realmente mudam a taxa observada (não só o campo do config) ---
lines.push("## Encounter — chance de Elite/Mini-Boss");
{
  const regionId = "ruinas-esquecidas";
  const level = 15;
  const trials = 4000;
  const baselineConfig = NEUTRAL_DUNGEON_RUNTIME_CONFIG;
  const boostedConfig: DungeonRuntimeConfig = { ...NEUTRAL_DUNGEON_RUNTIME_CONFIG, eliteChanceMultiplier: 3, miniBossChanceMultiplier: 3 };

  let baselineVariants = 0;
  let boostedVariants = 0;
  for (let seed = 0; seed < trials; seed++) {
    if (generateEncounter(regionId, level, seed, baselineConfig).variant !== "normal") baselineVariants++;
    if (generateEncounter(regionId, level, seed, boostedConfig).variant !== "normal") boostedVariants++;
  }
  const baselineRate = baselineVariants / trials;
  const boostedRate = boostedVariants / trials;
  check(
    `taxa combinada Elite+MiniBoss sobe com o multiplicador 3x: ${(baselineRate * 100).toFixed(1)}% -> ${(boostedRate * 100).toFixed(1)}% (em ${trials} seeds)`,
    boostedRate > baselineRate * 2,
  );
}
lines.push("");

// --- Recovery: healingMultiplier realmente reduz a cura aplicada ---
lines.push("## Recovery — cura reduzida");
{
  function freshDamagedSession(suffix: string) {
    const build = new CharacterBuild(`smoke-${suffix}`, "warrior", 0);
    const inventory = new Inventory(`smoke-${suffix}`, 30);
    const equipment = new Equipment(`smoke-${suffix}`);
    const character = createAdventureCharacter(build, inventory, equipment);
    equipStarterKit(character, "warrior", 42);
    character.currentLife = Math.floor(character.currentLife * 0.5);
    const session = createAdventureSession(`smoke-recovery-${suffix}`, character, "bosque-sussurrante", 42, 0);
    const timeline = createAdventureTimeline(session.sessionId);
    return { session, timeline };
  }

  function healedAmountWith(runtimeConfig: DungeonRuntimeConfig | undefined): number {
    const { session, timeline } = freshDamagedSession(runtimeConfig ? "reduced" : "baseline");
    let healed = 0;
    for (let tick = 0; tick < 30 && session.character.currentLife > 0 && healed === 0; tick++) {
      const { recovery } = advanceAdventureWithRecovery(session, timeline, { currentTime: (tick + 1) * 22000, runtimeConfig });
      if (recovery.applied) healed = recovery.lifeHealed;
    }
    return healed;
  }

  const baselineHealed = healedAmountWith(undefined);
  const reducedHealed = healedAmountWith({ ...NEUTRAL_DUNGEON_RUNTIME_CONFIG, healingMultiplier: 0.5 });

  check(`cura aconteceu na sessão baseline (${baselineHealed.toFixed(2)} de vida)`, baselineHealed > 0);
  check(
    `healingMultiplier 0.5x reduz a cura pela metade: ${baselineHealed.toFixed(2)} -> ${reducedHealed.toFixed(2)}`,
    reducedHealed > 0 && Math.abs(reducedHealed - baselineHealed * 0.5) < 1e-6,
  );
}
lines.push("");

lines.push(`**Resultado geral: ${allPassed ? "TODAS as verificações passaram." : "ALGUMA verificação falhou — ver acima."}**`);
console.log(lines.join("\n"));
if (!allPassed) process.exit(1);
