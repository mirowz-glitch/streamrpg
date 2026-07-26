import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSeededRandom } from "./rng.js";
import { EFFECTIVE_MAX_ITEM_LEVEL, getAffixEnvelope, expectedAffixValue, rollContinuousAffixValue, identityTierForValue } from "./continuousScaling.js";
import { ITEM_GEN_PREFIXES } from "./prefixes.js";
import { MAX_LEVEL } from "../xp.js";

describe("Continuous Affix Scaling Phase I", () => {
  it("EFFECTIVE_MAX_ITEM_LEVEL é exatamente MAX_LEVEL (xp.ts) — não eleva o teto de nível do personagem", () => {
    assert.equal(EFFECTIVE_MAX_ITEM_LEVEL, MAX_LEVEL);
  });

  it("expectedAffixValue: em itemLevel=0 retorna o mínimo do envelope, em itemLevel>=EFFECTIVE_MAX_ITEM_LEVEL retorna o máximo", () => {
    const envelope = { globalMin: 20, globalMax: 100 };
    assert.equal(expectedAffixValue(envelope, 0), 20);
    assert.equal(expectedAffixValue(envelope, EFFECTIVE_MAX_ITEM_LEVEL), 100);
    assert.equal(expectedAffixValue(envelope, EFFECTIVE_MAX_ITEM_LEVEL + 20), 100, "acima do teto continua grudado no máximo, nunca ultrapassa");
  });

  it("expectedAffixValue cresce monotonicamente com o Item Level (nenhum platô/degrau no meio do caminho)", () => {
    const envelope = { globalMin: 10, globalMax: 110 };
    let previous = -Infinity;
    for (let itemLevel = 0; itemLevel <= EFFECTIVE_MAX_ITEM_LEVEL; itemLevel++) {
      const value = expectedAffixValue(envelope, itemLevel);
      assert.ok(value >= previous, `valor esperado deveria ser não-decrescente (nível ${itemLevel}: ${value} < anterior ${previous})`);
      previous = value;
    }
  });

  it("getAffixEnvelope agrupa por `group`, não por mod individual — Healthy/Vigorous/Massive/of the Bear (todos group 'life') compartilham o MESMO envelope", () => {
    const lifeEnvelope = getAffixEnvelope("life");
    // Envelope combinado esperado: min = 10 (Healthy T2), max = 110 (Massive T1 / of the Bear T1).
    assert.equal(lifeEnvelope.globalMin, 10);
    assert.equal(lifeEnvelope.globalMax, 110);
  });

  it("getAffixEnvelope lança erro para group desconhecido (nenhum group inventado)", () => {
    assert.throws(() => getAffixEnvelope("group-que-nao-existe"), /group desconhecido/);
  });

  it("rollContinuousAffixValue nunca produz um valor fora de [globalMin, globalMax]", () => {
    const envelope = { globalMin: 20, globalMax: 100 };
    const rng = createSeededRandom(12345);
    for (let itemLevel = 0; itemLevel <= 40; itemLevel += 2) {
      for (let i = 0; i < 50; i++) {
        const value = rollContinuousAffixValue(rng, envelope, itemLevel);
        assert.ok(value >= envelope.globalMin && value <= envelope.globalMax, `valor ${value} fora do envelope [${envelope.globalMin},${envelope.globalMax}] no nível ${itemLevel}`);
      }
    }
  });

  it("identityTierForValue escolhe o tier cujo centro está mais próximo do valor rolado, usando os tiers do PRÓPRIO mod", () => {
    const cruel = ITEM_GEN_PREFIXES.find((mod) => mod.id === "prefix_cruel")!;
    // Cruel: T4[20-39,centro 29.5] T3[40-59,centro 49.5] T2[60-79,centro 69.5] T1[80-100,centro 90].
    assert.equal(identityTierForValue(cruel.tiers, 25), 4);
    assert.equal(identityTierForValue(cruel.tiers, 50), 3);
    assert.equal(identityTierForValue(cruel.tiers, 70), 2);
    assert.equal(identityTierForValue(cruel.tiers, 95), 1);
  });

  it("determinismo: mesma seed + mesmo Item Level produz sempre o mesmo valor rolado", () => {
    const envelope = { globalMin: 10, globalMax: 110 };
    const a = rollContinuousAffixValue(createSeededRandom(777), envelope, 20);
    const b = rollContinuousAffixValue(createSeededRandom(777), envelope, 20);
    assert.equal(a, b);
  });
});
