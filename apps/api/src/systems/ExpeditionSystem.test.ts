/**
 * Testes de ExpeditionSystem — Sprint Expedition Choice Phase III
 * (Meaningful Consequences).
 *
 * Usa o Node.js Test Runner nativo (node:test), mesmo padrão de
 * EventBus.test.ts/GameEngine.test.ts.
 *
 * Cobre só o que esta Sprint mudou: `getApproachWeight` (peso puro por
 * categoria+abordagem) e a distribuição resultante em "exploring" via
 * simulação Monte Carlo com um RandomProvider determinístico (seeded
 * LCG) — confirma que o deslocamento fica na faixa de 3-8 pontos
 * percentuais pedida pelo Balance da Sprint, sem depender de rodar o
 * ExpeditionSystem inteiro (que exige EventBus/DB reais).
 *
 * Para rodar manualmente:
 * node --import tsx/esm apps/api/src/systems/ExpeditionSystem.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getApproachWeight } from "./ExpeditionSystem.js";
import type { EncounterCategory } from "../engine/types.js";

// Mesmas 8 categorias reais do pool de "exploring" (natureza x2,
// clima x2, descoberta x2, misterio x1, comercio x1) — nenhuma
// categoria nova, mesmo pool já definido em ENCOUNTERS_BY_STATE.
const EXPLORING_CATEGORIES: EncounterCategory[] = [
  "natureza",
  "natureza",
  "clima",
  "clima",
  "descoberta",
  "descoberta",
  "misterio",
  "comercio",
];

function shareOf(categories: EncounterCategory[], approach: "investigate" | "continue" | null, target: EncounterCategory): number {
  const weights = categories.map((c) => getApproachWeight(c, approach));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const targetWeight = categories.reduce((sum, c, i) => (c === target ? sum + weights[i] : sum), 0);
  return targetWeight / total;
}

describe("getApproachWeight", () => {
  it("retorna 1 (nenhum viés) pra toda categoria quando approach é null — comportamento idêntico ao de antes desta Sprint", () => {
    const categories: EncounterCategory[] = [
      "natureza",
      "combate",
      "descoberta",
      "descanso",
      "misterio",
      "comercio",
      "clima",
      "ruinas",
    ];
    for (const category of categories) {
      assert.equal(getApproachWeight(category, null), 1);
    }
  });

  it("'investigate' favorece descoberta e misterio, e reduz natureza/clima/comercio", () => {
    assert.ok(getApproachWeight("descoberta", "investigate") > 1);
    assert.ok(getApproachWeight("misterio", "investigate") > 1);
    assert.ok(getApproachWeight("natureza", "investigate") < 1);
    assert.ok(getApproachWeight("clima", "investigate") < 1);
    assert.ok(getApproachWeight("comercio", "investigate") < 1);
  });

  it("'continue' favorece natureza/comercio, e reduz descoberta/misterio", () => {
    assert.ok(getApproachWeight("natureza", "continue") > 1);
    assert.ok(getApproachWeight("comercio", "continue") > 1);
    assert.ok(getApproachWeight("descoberta", "continue") < 1);
    assert.ok(getApproachWeight("misterio", "continue") < 1);
  });

  it("nunca zera nem inverte a possibilidade de uma categoria (peso sempre > 0) — nunca vira obrigatório/proibido", () => {
    const approaches: Array<"investigate" | "continue"> = ["investigate", "continue"];
    const categories: EncounterCategory[] = [
      "natureza",
      "combate",
      "descoberta",
      "descanso",
      "misterio",
      "comercio",
      "clima",
      "ruinas",
    ];
    for (const approach of approaches) {
      for (const category of categories) {
        assert.ok(getApproachWeight(category, approach) > 0);
      }
    }
  });
});

describe("Balance: deslocamento de 'exploring' fica entre 3 e 8 pontos percentuais", () => {
  it("'investigate' desloca a fatia de 'descoberta' em 3-8pp a mais que o baseline (25%, 2/8)", () => {
    const baseline = shareOf(EXPLORING_CATEGORIES, null, "descoberta");
    const withApproach = shareOf(EXPLORING_CATEGORIES, "investigate", "descoberta");
    const deltaPoints = (withApproach - baseline) * 100;
    assert.ok(deltaPoints >= 3 && deltaPoints <= 8, `esperado entre 3 e 8pp, recebido ${deltaPoints.toFixed(2)}pp`);
  });

  it("'continue' desloca a fatia de 'descoberta' em 3-8pp a menos que o baseline", () => {
    const baseline = shareOf(EXPLORING_CATEGORIES, null, "descoberta");
    const withApproach = shareOf(EXPLORING_CATEGORIES, "continue", "descoberta");
    const deltaPoints = (baseline - withApproach) * 100;
    assert.ok(deltaPoints >= 3 && deltaPoints <= 8, `esperado entre 3 e 8pp, recebido ${deltaPoints.toFixed(2)}pp`);
  });

  it("'continue' desloca a fatia de 'natureza' em 3-8pp a mais que o baseline (50%, 4/8)", () => {
    const baseline = shareOf(EXPLORING_CATEGORIES, null, "natureza");
    const withApproach = shareOf(EXPLORING_CATEGORIES, "continue", "natureza");
    const deltaPoints = (withApproach - baseline) * 100;
    assert.ok(deltaPoints >= 3 && deltaPoints <= 8, `esperado entre 3 e 8pp, recebido ${deltaPoints.toFixed(2)}pp`);
  });

  it("a diferença nunca é grande o bastante pra tornar uma categoria obrigatória (nenhuma fatia passa de 60%)", () => {
    for (const approach of ["investigate", "continue"] as const) {
      for (const category of ["natureza", "clima", "descoberta", "misterio", "comercio"] as const) {
        const share = shareOf(EXPLORING_CATEGORIES, approach, category);
        assert.ok(share < 0.6, `${category}/${approach} ficou em ${(share * 100).toFixed(1)}%, alto demais`);
      }
    }
  });
});
