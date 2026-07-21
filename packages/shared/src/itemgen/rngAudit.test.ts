import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSeededRandom, randomInt, pickWeighted } from "./rng.js";

// Engine Audit — RNG, Determinism & System Validation Phase I. Testes
// que codificam as conclusões da auditoria estatística (ver
// scripts/auditRng*.ts e reports/rng-audit-*.md) como guarda de
// regressão — NENHUMA lógica de jogo alterada nesta Sprint, só
// validação do que já existe.
describe("Engine Audit — RNG, Determinism & System Validation Phase I", () => {
  describe("determinismo", () => {
    it("mesma seed sempre produz a mesma sequência", () => {
      const a = createSeededRandom(12345);
      const b = createSeededRandom(12345);
      const seqA = Array.from({ length: 20 }, () => a());
      const seqB = Array.from({ length: 20 }, () => b());
      assert.deepEqual(seqA, seqB);
    });

    it("seeds diferentes produzem sequências diferentes (não é uma constante disfarçada)", () => {
      const a = createSeededRandom(1);
      const b = createSeededRandom(2);
      const seqA = Array.from({ length: 10 }, () => a());
      const seqB = Array.from({ length: 10 }, () => b());
      assert.notDeepEqual(seqA, seqB);
    });

    it("cada valor gerado está sempre no intervalo [0, 1)", () => {
      const rng = createSeededRandom(777);
      for (let i = 0; i < 10000; i++) {
        const value = rng();
        assert.ok(value >= 0 && value < 1, `valor fora do intervalo: ${value}`);
      }
    });
  });

  describe("distribuição estatística (Fase 2 — Diagnóstico Estatístico)", () => {
    it("createSeededRandom produz distribuição aproximadamente uniforme em 100.000 amostras (10 baldes, desvio < 5%)", () => {
      const rng = createSeededRandom(42);
      const buckets = new Array(10).fill(0);
      const n = 100_000;
      for (let i = 0; i < n; i++) {
        const value = rng();
        const bucket = Math.min(9, Math.floor(value * 10));
        buckets[bucket]++;
      }
      const expected = n / 10;
      for (const count of buckets) {
        const deviation = Math.abs(count - expected) / expected;
        assert.ok(deviation < 0.05, `balde com desvio de ${(deviation * 100).toFixed(1)}% (esperado < 5%)`);
      }
    });

    it("pickWeighted respeita a proporção dos pesos em 100.000 amostras (desvio < 5%)", () => {
      const rng = createSeededRandom(2024);
      const options = [
        { id: "normal", weight: 0.61 },
        { id: "elite", weight: 0.04 },
        { id: "miniboss", weight: 0.35 },
      ];
      const counts: Record<string, number> = { normal: 0, elite: 0, miniboss: 0 };
      const n = 100_000;
      for (let i = 0; i < n; i++) counts[pickWeighted(rng, options).id]++;
      for (const option of options) {
        const observedRate = counts[option.id] / n;
        const deviation = Math.abs(observedRate - option.weight) / option.weight;
        assert.ok(deviation < 0.05, `"${option.id}": taxa observada ${(observedRate * 100).toFixed(2)}% vs. esperada ${(option.weight * 100).toFixed(2)}% (desvio ${(deviation * 100).toFixed(1)}%)`);
      }
    });

    it("seeds consecutivas (base+0, base+1, base+2, ...) não produzem autocorrelação lag-1 significativa em 50.000 draws", () => {
      // Fase 2 — hipótese de correlação entre seeds consecutivas: mede a
      // autocorrelação lag-1 da série `createSeededRandom(base+i)().
      // Coeficientes |r| < 0.02 são consistentes com ausência de
      // correlação linear (ruído estatístico esperado em qualquer
      // amostra finita) — ver relatório completo (rng-audit-statistical.md)
      // pra a mesma medição em 5 sistemas de jogo diferentes.
      const n = 50_000;
      const series: number[] = new Array(n);
      for (let i = 0; i < n; i++) {
        const rng = createSeededRandom(1000 + i);
        series[i] = rng();
      }
      const mean = series.reduce((s, v) => s + v, 0) / n;
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) denominator += (series[i] - mean) ** 2;
      for (let i = 0; i < n - 1; i++) numerator += (series[i] - mean) * (series[i + 1] - mean);
      const autocorrelation = denominator > 0 ? numerator / denominator : 0;
      assert.ok(Math.abs(autocorrelation) < 0.02, `autocorrelação lag-1 de ${autocorrelation.toFixed(4)} (esperado < 0.02 em valor absoluto)`);
    });

    it("randomInt(min, max) nunca produz valores fora do intervalo, em 100.000 amostras", () => {
      const rng = createSeededRandom(99);
      for (let i = 0; i < 100_000; i++) {
        const value = randomInt(rng, 5, 15);
        assert.ok(value >= 5 && value <= 15, `valor fora do intervalo: ${value}`);
      }
    });
  });
});
