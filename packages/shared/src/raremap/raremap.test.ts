import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateRareMap } from "./generator.js";
import { listMapDefinitions } from "../worldmap/mapRegistry.js";
import { getMapModifier } from "../mapmods/mapModifierRegistry.js";
import type { RareMapRarity } from "./types.js";

// Sprint 34 — Rare Maps Phase I. Fase 8: cobertura de generateRareMap()
// — "escolher um mapa; definir quantidade de Mods; escolher Mods.
// Nunca abrir mapas. Nunca iniciar Adventure."

describe("generateRareMap() (Fase 3) — determinístico, puro", () => {
  it("mesma seed sempre produz o mesmo RareMapInstance", () => {
    const a = generateRareMap(777);
    const b = generateRareMap(777);
    assert.deepEqual(a, b);
  });

  it("seeds diferentes produzem instâncias tipicamente diferentes (amostra de 20)", () => {
    const results = Array.from({ length: 20 }, (_, i) => generateRareMap(1000 + i));
    const distinctMapIds = new Set(results.map((r) => r.mapId));
    const distinctModCounts = new Set(results.map((r) => r.mods.length));
    assert.ok(distinctMapIds.size > 1, "esperava variação real de Mapa em 20 seeds");
    assert.ok(distinctModCounts.size > 1, "esperava variação real de quantidade de Mods em 20 seeds");
  });

  it("sempre escolhe um Mapa real (worldmap/mapRegistry.ts), nunca um id inventado", () => {
    const realIds = new Set(listMapDefinitions().map((map) => map.id));
    for (let seed = 1; seed <= 100; seed++) {
      const result = generateRareMap(seed);
      assert.ok(realIds.has(result.mapId), `seed ${seed}: mapId "${result.mapId}" não é um MapDefinition real`);
    }
  });

  it("options.mapId força o Mapa escolhido", () => {
    const result = generateRareMap(5, { mapId: "fortaleza-sombria" });
    assert.equal(result.mapId, "fortaleza-sombria");
  });

  it("options.mapId desconhecido lança erro (nunca inventa um Mapa)", () => {
    assert.throws(() => generateRareMap(5, { mapId: "mapa-inexistente" }));
  });

  it("nunca produz rarity 'unique' — fora de escopo desta Sprint (Fase 4)", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const result = generateRareMap(seed);
      assert.notEqual(result.rarity, "unique");
    }
  });

  it("quantidade de Mods respeita a faixa exata da raridade (Fase 4): normal=0, magic=1-2, rare=3-5", () => {
    const ranges: Record<Exclude<RareMapRarity, "unique">, { min: number; max: number }> = {
      normal: { min: 0, max: 0 },
      magic: { min: 1, max: 2 },
      rare: { min: 3, max: 5 },
    };
    for (const rarity of Object.keys(ranges) as (keyof typeof ranges)[]) {
      for (let seed = 1; seed <= 60; seed++) {
        const result = generateRareMap(seed, { rarity });
        const { min, max } = ranges[rarity];
        assert.ok(
          result.mods.length >= min && result.mods.length <= max,
          `rarity "${rarity}" seed ${seed}: esperava ${min}-${max} Mods, obteve ${result.mods.length}`,
        );
      }
    }
  });

  it("nunca repete o mesmo Mod duas vezes na mesma instância", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const result = generateRareMap(seed, { rarity: "rare" });
      assert.equal(new Set(result.mods).size, result.mods.length, `seed ${seed}: Mods duplicados em ${JSON.stringify(result.mods)}`);
    }
  });

  it("todo Mod escolhido é um MapModifier real e habilitado (mapmods/mapModifierRegistry.ts)", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const result = generateRareMap(seed, { rarity: "rare" });
      for (const modId of result.mods) {
        const mod = getMapModifier(modId);
        assert.ok(mod, `seed ${seed}: Mod "${modId}" não existe no Registry`);
        assert.equal(mod!.enabled, true);
      }
    }
  });

  it("options.tier gateia mod.tier <= tier (hoje sempre no-op, todo Mod real é Tier 1)", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const result = generateRareMap(seed, { rarity: "rare", tier: 1 });
      for (const modId of result.mods) {
        assert.ok(getMapModifier(modId)!.tier <= 1);
      }
    }
  });

  it("instanceId é determinístico e único por (mapId, seed)", () => {
    const a = generateRareMap(42, { mapId: "bosque-sussurrante" });
    const b = generateRareMap(42, { mapId: "fortaleza-sombria" });
    assert.notEqual(a.instanceId, b.instanceId);
    assert.equal(a.instanceId, `raremap-bosque-sussurrante-42`);
  });
});
