import type { CombatResult } from "../combat/types.js";
import { computeEnemyFinalStats } from "./enemyStats.js";
import type { EnemyInstance, EnemyTemplate, KillEnemyResult, SpawnEnemyOptions } from "./types.js";

// Requisito 4 — spawnEnemy(): "Recebe: template, seed, level. Retorna:
// Enemy Instance. Determinística." Mesmo (template, seed, level)
// sempre produz a mesma Enemy Instance — `instanceId` é derivado
// deterministicamente de `template.id` + `seed` (nunca um UUID
// aleatório), e os 10 Final Enemy Stats vêm só de Template+Level+
// Growth (enemyStats.ts, sem RNG). A única exceção é `spawnTime`
// quando `options.spawnTime` não é informado (default `Date.now()`,
// mesmo padrão do `timestamp` do Combat Engine) — passe um valor
// explícito pra reprodutibilidade total.
export function spawnEnemy(
  template: EnemyTemplate,
  seed: number,
  level: number,
  options: SpawnEnemyOptions = {},
): EnemyInstance {
  if (level < template.levelRange.min || level > template.levelRange.max) {
    throw new Error(
      `Enemy System: nível ${level} fora do levelRange do template "${template.id}" (${template.levelRange.min}-${template.levelRange.max})`,
    );
  }

  const finalStats = computeEnemyFinalStats(template, level);

  // Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1: o
  // snapshot de vida (nunca recalculado depois, ver comentário do tipo
  // em types.ts) já nasce multiplicado quando o World Encounter marca
  // esta instância como Elite (`options.statMultipliers`) —
  // `toCombatant()` aplica o MESMO multiplicador ao dano em todo
  // recálculo de combate (ver combatant.ts), lendo os mesmos valores
  // guardados abaixo em `futureState`. Ausente = comportamento idêntico
  // a antes (multiplicador 1, `futureState: {}`).
  const lifeMultiplier = options.statMultipliers?.life ?? 1;
  const maximumLife = finalStats.maximumLife * lifeMultiplier;

  return {
    instanceId: `${template.id}-${seed}`,
    templateId: template.id,
    seed,
    level,
    currentLife: maximumLife,
    maximumLife,
    alive: true,
    spawnTime: options.spawnTime ?? Date.now(),
    position: options.position ?? null,
    futureState: options.variant ? { variant: options.variant, statMultipliers: options.statMultipliers } : {},
  };
}

// Requisito 5 — killEnemy(): "marcar morto, registrar timestamp,
// preparar Loot Generator. Nunca gerar loot diretamente." Devolve só o
// `lootIdentityId` do Template — quem chama decide QUANDO (e se)
// gerar o loot de verdade (ver lootIntegration.ts).
export function killEnemy(instance: EnemyInstance, template: EnemyTemplate, deathTime: number = Date.now()): KillEnemyResult {
  if (!instance.alive) {
    throw new Error(`Enemy System: instância "${instance.instanceId}" já está morta`);
  }
  if (instance.templateId !== template.id) {
    throw new Error(
      `Enemy System: template "${template.id}" não corresponde à instância "${instance.instanceId}" (templateId "${instance.templateId}")`,
    );
  }

  return {
    instance: { ...instance, alive: false, currentLife: 0 },
    deathTime,
    lootIdentityId: template.lootIdentityId,
  };
}

// Requisito 8 — Integração com Combat Engine: aplica o resultado de um
// resolveCombat() (Combat Engine, quando esta instância é o alvo) de
// volta na Enemy Instance. Puro — devolve uma instância nova, nunca
// muta a recebida ("toda instância deverá ser independente").
export function applyCombatResultToEnemy(instance: EnemyInstance, result: CombatResult): EnemyInstance {
  return { ...instance, currentLife: result.remainingLife };
}
