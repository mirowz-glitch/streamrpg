import type { HealthBarState } from "./types.js";

// Requisito 4 — Health Bars: "atualização visual apenas. Nenhuma
// regra nova." Conversão pura current/maximum -> percentual (0-100,
// sempre dentro dos limites mesmo com valores fora do esperado) —
// nunca decide nada sobre o combate em si.
export function toHealthBarState(current: number, maximum: number): HealthBarState {
  const percent = maximum > 0 ? Math.max(0, Math.min(100, Math.round((current / maximum) * 100))) : 0;
  return { current, maximum, percent };
}
