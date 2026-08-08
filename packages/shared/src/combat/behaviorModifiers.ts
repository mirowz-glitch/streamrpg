/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 6/7/8. Tradução única de
 * `ActiveBehaviorSummary[]` (Combat Snapshot) para os hooks já
 * existentes do Combat Engine (`FutureCombatModifiers`) e da Recovery
 * Layer — "nenhuma regra duplicada": Adventure, Dungeon (mesmo motor)
 * e Boss (parcialmente, ver Fase 8) leem TUDO daqui, nunca reescrevem
 * a tradução por conta própria.
 */
import type { ActiveBehaviorSummary } from "./combatSnapshot.js";

// Fase 6 — Safira: quando o Chill proca, o contra-ataque recebido
// nesta mesma tick tem seu dano reduzido pela metade. Valor fixo de
// exemplo QA ("nada de balanceamento definitivo"), documentado aqui,
// nunca espalhado.
const CHILL_DAMAGE_MULTIPLIER = 0.5;

export interface ResolvedOffensiveBehaviors {
  bonusFlatDamage: number;
  criticalChanceMultiplier: number;
}

/**
 * Rubi (`onHitBonusFireDamage`) e Ônix (`bonusCriticalChance`) — os
 * dois comportamentos que afetam o ATAQUE de quem os carrega.
 * `criticalChanceMultiplier` converte os pontos percentuais fixos de
 * Ônix pro vocabulário multiplicativo que `FutureCombatModifiers` já
 * usa (`rollCritical`, pipeline.ts) — nunca um campo novo pra crítico,
 * reusa o hook existente. Sem chance-base real (`baseCriticalChance
 * <= 0`), o bônus não tem o que multiplicar — resulta em `1` (nenhum
 * efeito), nunca uma divisão por zero.
 */
export function resolveOffensiveBehaviorModifiers(activeBehaviors: readonly ActiveBehaviorSummary[], baseCriticalChance: number): ResolvedOffensiveBehaviors {
  let bonusFlatDamage = 0;
  let bonusCriticalPoints = 0;
  for (const active of activeBehaviors) {
    if (active.behaviorKind === "onHitBonusFireDamage") bonusFlatDamage += active.magnitude;
    if (active.behaviorKind === "bonusCriticalChance") bonusCriticalPoints += active.magnitude;
  }
  const criticalChanceMultiplier = baseCriticalChance > 0 ? (baseCriticalChance + bonusCriticalPoints) / baseCriticalChance : 1;
  return { bonusFlatDamage, criticalChanceMultiplier };
}

/** Safira (`chanceToChill`) — soma de todas as % de chance ativas (0-100), pra quem chama rolar contra RNG próprio. */
export function resolveChillChancePercent(activeBehaviors: readonly ActiveBehaviorSummary[]): number {
  return activeBehaviors.filter((active) => active.behaviorKind === "chanceToChill").reduce((sum, active) => sum + active.magnitude, 0);
}

/**
 * Ametista (`bonusResistance`, sempre ativa) + Safira (`chill`, só
 * quando `chillProcced` já foi decidido por fora, ver
 * `resolveChillChancePercent`) — os dois comportamentos que reduzem o
 * dano RECEBIDO. Multiplicativos entre si (nunca somados), mesmo
 * princípio de `damageMultiplier` do pipeline.
 */
export function resolveDefensiveDamageMultiplier(activeBehaviors: readonly ActiveBehaviorSummary[], chillProcced: boolean): number {
  let multiplier = 1;
  for (const active of activeBehaviors) {
    if (active.behaviorKind === "bonusResistance") multiplier *= 1 - active.magnitude / 100;
  }
  if (chillProcced) multiplier *= CHILL_DAMAGE_MULTIPLIER;
  return Math.max(0, multiplier);
}

/** Esmeralda (`regenPerTick`) — soma de vida flat extra, somada à cura de fim de encontro já existente (Recovery Layer). */
export function resolveRegenBonus(activeBehaviors: readonly ActiveBehaviorSummary[]): number {
  return activeBehaviors.filter((active) => active.behaviorKind === "regenPerTick").reduce((sum, active) => sum + active.magnitude, 0);
}
