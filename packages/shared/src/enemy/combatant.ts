import type { Combatant } from "../combat/types.js";
import { computeEnemyFinalStats } from "./enemyStats.js";
import { ENEMY_DEFAULT_CRITICAL_MULTIPLIER } from "./config.js";
import type { EnemyInstance, EnemyTemplate } from "./types.js";

// Requisito 8 — Integração com Combat Engine: monta um Combatant (o
// tipo que resolveCombat() espera) a partir de uma Enemy Instance +
// seu Template. `finalStats` é sempre recalculado na hora (nunca
// guardado na instância — requisito 3); `currentLife` vem do snapshot
// já vivo da própria instância.
//
// Elites, Mini-Bosses & Risk/Reward Phase I — requisito 1: quando o
// World Encounter marcou esta instância como Elite (`futureState.
// statMultipliers.damage`, ver instance.ts/spawn.ts), o dano físico é
// multiplicado aqui, no MESMO recálculo que já acontece a cada troca
// de golpe — `attackType` do Adventure Loop é sempre "physical" (ver
// combat/damageTypes.ts), então só `physicalDamage` precisa do ajuste.
// Ausente = comportamento idêntico a antes (multiplicador 1).
export function toCombatant(instance: EnemyInstance, template: EnemyTemplate): Combatant {
  const finalStats = computeEnemyFinalStats(template, instance.level);
  const damageMultiplier = instance.futureState.statMultipliers?.damage ?? 1;
  return {
    finalStats: damageMultiplier === 1 ? finalStats : { ...finalStats, physicalDamage: finalStats.physicalDamage * damageMultiplier },
    criticalMultiplier: template.criticalMultiplier ?? ENEMY_DEFAULT_CRITICAL_MULTIPLIER,
    currentLife: instance.currentLife,
  };
}
