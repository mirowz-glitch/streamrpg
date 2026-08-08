/**
 * Sprint 19 — Fase 6/7: Base Potential + Base Tier. Puramente
 * descritivo — nenhuma regra de gameplay lê isto ainda. Existe pra dar
 * uma ORDEM canônica ao vocabulário ("Low < Medium < High <
 * Exceptional"), evitando que uma futura UI/ferramenta de
 * balanceamento precise reinventar essa ordem (mesmo espírito de
 * `IMPORTANCE_ORDER`, itemization/legacy.ts, Sprint 14).
 */
import type { BaseIdentityPotential, BaseIdentityTier } from "./types.js";

const POTENTIAL_ORDER: BaseIdentityPotential[] = ["low", "medium", "high", "exceptional"];

export function comparePotential(a: BaseIdentityPotential, b: BaseIdentityPotential): number {
  return POTENTIAL_ORDER.indexOf(a) - POTENTIAL_ORDER.indexOf(b);
}

export function compareTier(a: BaseIdentityTier, b: BaseIdentityTier): number {
  return a - b;
}

export const POTENTIAL_LABEL: Record<BaseIdentityPotential, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  exceptional: "Exceptional",
};
