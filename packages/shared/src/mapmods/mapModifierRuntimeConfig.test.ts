import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyMapModifiers } from "./mapModifierRuntimeConfig.js";
import { NEUTRAL_COMBINED_RUNTIME_CONFIG } from "../worldencounter/types.js";
import type { CombinedRuntimeConfig } from "../worldencounter/types.js";
import type { MapModifierId } from "./types.js";

// Sprint 33 — Map Modifiers Phase II. Fase 9: cobertura de
// applyMapModifiers() — o "ModifierResolver" real de Map Modifiers, o
// único ponto que traduz `MapModifierId[]` em multiplicadores reais de
// `CombinedRuntimeConfig`.

describe("applyMapModifiers() (Fase 2-6) — 'sempre multiplicadores, nunca fórmula nova'", () => {
  it("modifierIds ausente/vazio devolve a MESMA referência de base — nenhuma alocação/efeito quando não há Mod ativo", () => {
    assert.equal(applyMapModifiers(NEUTRAL_COMBINED_RUNTIME_CONFIG, undefined), NEUTRAL_COMBINED_RUNTIME_CONFIG);
    assert.equal(applyMapModifiers(NEUTRAL_COMBINED_RUNTIME_CONFIG, []), NEUTRAL_COMBINED_RUNTIME_CONFIG);
  });

  it("cada um dos 7 Mods com eixo real multiplica exatamente o campo esperado por (1 + magnitudePercent/100) do Registry, mais nada", () => {
    const expected: Record<string, { axis: keyof CombinedRuntimeConfig; percent: number }> = {
      "monster-damage-up": { axis: "enemyDamageMultiplier", percent: 20 },
      "monster-life-up": { axis: "enemyLifeMultiplier", percent: 40 },
      "elite-chance-up": { axis: "eliteChanceMultiplier", percent: 25 },
      "gold-quantity-up": { axis: "rewardMultiplier", percent: 35 },
      "experience-up": { axis: "xpMultiplier", percent: 15 },
      "loot-quantity-up": { axis: "lootMultiplier", percent: 20 },
      "rarity-up": { axis: "lootRarityMultiplier", percent: 30 },
    };
    for (const [id, spec] of Object.entries(expected)) {
      const result = applyMapModifiers(NEUTRAL_COMBINED_RUNTIME_CONFIG, [id as MapModifierId]);
      for (const key of Object.keys(NEUTRAL_COMBINED_RUNTIME_CONFIG) as (keyof CombinedRuntimeConfig)[]) {
        const expectedValue = key === spec.axis ? 1 + spec.percent / 100 : 1;
        assert.ok(
          Math.abs(result[key] - expectedValue) < 1e-9,
          `Mod "${id}" alterou "${key}" incorretamente: esperado ${expectedValue}, obteve ${result[key]}`,
        );
      }
    }
  });

  it("boss-power-up (Fase 6) não altera nenhum campo — reconhecido como ponto oficial de integração, ainda sem efeito", () => {
    const result = applyMapModifiers(NEUTRAL_COMBINED_RUNTIME_CONFIG, ["boss-power-up"]);
    assert.deepEqual(result, NEUTRAL_COMBINED_RUNTIME_CONFIG);
  });

  it("múltiplos Mods em eixos diferentes combinam de forma independente — cada um só afeta o seu próprio campo", () => {
    const result = applyMapModifiers(NEUTRAL_COMBINED_RUNTIME_CONFIG, ["monster-damage-up", "gold-quantity-up", "rarity-up"]);
    assert.ok(Math.abs(result.enemyDamageMultiplier - 1.2) < 1e-9);
    assert.ok(Math.abs(result.rewardMultiplier - 1.35) < 1e-9);
    assert.ok(Math.abs(result.lootRarityMultiplier - 1.3) < 1e-9);
    assert.equal(result.enemyLifeMultiplier, 1);
    assert.equal(result.eliteChanceMultiplier, 1);
    assert.equal(result.xpMultiplier, 1);
    assert.equal(result.lootMultiplier, 1);
  });

  it("aplica POR CIMA de uma base já não-neutra (ex.: World Tier + Dungeon Modifiers já combinados) — multiplicativo, nunca substitui", () => {
    const base: CombinedRuntimeConfig = { ...NEUTRAL_COMBINED_RUNTIME_CONFIG, enemyDamageMultiplier: 1.6, rewardMultiplier: 1.15 };
    const result = applyMapModifiers(base, ["monster-damage-up", "gold-quantity-up"]);
    assert.ok(Math.abs(result.enemyDamageMultiplier - 1.6 * 1.2) < 1e-9);
    assert.ok(Math.abs(result.rewardMultiplier - 1.15 * 1.35) < 1e-9);
  });
});
