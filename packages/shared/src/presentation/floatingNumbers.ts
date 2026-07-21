import type { FloatingNumberEvent } from "./types.js";

// Requisito 3 — Life Leech estimado: derivado algebricamente do delta
// real de vida do personagem e do dano real recebido no tick (nenhum
// valor inventado):
//
//   deltaVida = -danoRecebido + curaDeLeech (antes do clamp em maximumLife)
//   => curaDeLeech = deltaVida + danoRecebido
//
// Duas imprecisões conhecidas, documentadas em vez de escondidas:
// - Se o personagem estava perto da vida máxima, o clamp em
//   maximumLife (Adventure Loop) pode ter "cortado" parte da cura real
//   — a estimativa fica subestimada nesse caso, nunca superestimada.
// - Se o personagem morreu neste tick, a vida final é 0 por definição
//   (Combat Engine nunca permite vida negativa) — a estimativa perde
//   sentido prático aqui, mas continua nunca negativa.
export function estimateLifeLeech(currentLifeBefore: number, currentLifeAfter: number, damageTakenDelta: number): number {
  const rawEstimate = currentLifeAfter - currentLifeBefore + damageTakenDelta;
  return Math.max(0, rawEstimate);
}

// Requisito 3 — Floating Numbers derivados do que REALMENTE aconteceu
// no tick (deltas de dano/vida) — "damage"/"heal"/"lifeLeech" só
// aparecem quando o valor correspondente é > 0; "critical"/"miss"
// nunca são produzidos aqui (ver nota em types.ts).
export function deriveFloatingNumbers(
  tickIndex: number,
  timestamp: number,
  damageDealtDelta: number,
  damageTakenDelta: number,
  lifeLeechEstimate: number,
): FloatingNumberEvent[] {
  const numbers: FloatingNumberEvent[] = [];

  if (damageDealtDelta > 0) {
    numbers.push({ kind: "damage", value: damageDealtDelta, target: "enemy", tickIndex, timestamp });
  }
  if (damageTakenDelta > 0) {
    numbers.push({ kind: "damage", value: damageTakenDelta, target: "character", tickIndex, timestamp });
  }
  if (lifeLeechEstimate > 0) {
    numbers.push({ kind: "lifeLeech", value: lifeLeechEstimate, target: "character", tickIndex, timestamp });
  }

  return numbers;
}
