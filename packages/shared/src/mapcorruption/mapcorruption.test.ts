import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateCorruptedMap, rollCorruptionOutcome } from "./generator.js";
import { generateRareMap } from "../raremap/generator.js";
import { getMapModifier } from "../mapmods/mapModifierRegistry.js";
import type { CorruptionOutcome } from "./types.js";
import type { RareMapInstance } from "../raremap/types.js";

// Sprint 35 — Corrupted Maps Phase I. Fase 8: cobertura de
// generateCorruptedMap() — "Recebe RareMapInstance. Retorna
// CorruptedMap. Nunca inicia Adventure. Nunca altera sessão."

function fixtureRareMap(mapId = "bosque-sussurrante", mods: string[] = ["monster-damage-up"]): RareMapInstance {
  return { mapId, rarity: "rare", tier: 1, mods, instanceId: `raremap-${mapId}-fixture`, seed: 1 };
}

describe("generateCorruptedMap() (Fase 3) — determinístico, puro", () => {
  it("mesma RareMapInstance + mesma seed sempre produz o mesmo CorruptedMap", () => {
    const rareMap = fixtureRareMap();
    const a = generateCorruptedMap(rareMap, 555);
    const b = generateCorruptedMap(rareMap, 555);
    assert.deepEqual(a, b);
  });

  it("seeds diferentes produzem resultados tipicamente diferentes (amostra de 30)", () => {
    const rareMap = fixtureRareMap();
    const outcomes = new Set<CorruptionOutcome>();
    for (let seed = 1; seed <= 30; seed++) {
      outcomes.add(generateCorruptedMap(rareMap, seed).corruptionOutcome);
    }
    assert.ok(outcomes.size > 1, "esperava mais de 1 resultado distinto em 30 seeds");
  });

  it("nunca altera mapId/rarity do Rare Map original — 'Nunca altera Map/Region/Enemy Pool' (Decisões Oficiais)", () => {
    const rareMap = fixtureRareMap("fortaleza-sombria");
    for (let seed = 1; seed <= 50; seed++) {
      const corrupted = generateCorruptedMap(rareMap, seed);
      assert.equal(corrupted.mapId, "fortaleza-sombria");
      assert.equal(corrupted.rarity, "rare");
    }
  });

  it("corrupted é sempre true, e sourceInstanceId aponta pro RareMapInstance original", () => {
    const rareMap = fixtureRareMap();
    const corrupted = generateCorruptedMap(rareMap, 10);
    assert.equal(corrupted.corrupted, true);
    assert.equal(corrupted.sourceInstanceId, rareMap.instanceId);
  });

  it("instanceId do CorruptedMap é sempre diferente do instanceId do RareMapInstance original", () => {
    const rareMap = fixtureRareMap();
    const corrupted = generateCorruptedMap(rareMap, 10);
    assert.notEqual(corrupted.instanceId, rareMap.instanceId);
  });
});

describe("Resultados possíveis (Fase 4) — os 6 exemplos literais do brief", () => {
  it("'nothing': mods e tier idênticos ao Rare Map original", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", ["monster-damage-up", "rarity-up"]);
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "nothing") {
        found = true;
        const corrupted = generateCorruptedMap(rareMap, seed);
        assert.deepEqual(corrupted.mods, rareMap.mods);
        assert.equal(corrupted.tier, rareMap.tier);
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'nothing' em 500 seeds");
  });

  it("'add-one-modifier': exatamente +1 Mod novo, nenhum removido", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", ["monster-damage-up"]);
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "add-one-modifier") {
        found = true;
        assert.equal(result.addedMods.length, 1);
        assert.equal(result.removedMods.length, 0);
        const corrupted = generateCorruptedMap(rareMap, seed);
        assert.equal(corrupted.mods.length, rareMap.mods.length + 1);
        assert.ok(rareMap.mods.every((id) => corrupted.mods.includes(id)), "Mods originais preservados");
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'add-one-modifier' em 500 seeds");
  });

  it("'add-two-modifiers': exatamente +2 Mods novos, distintos entre si e dos originais", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", ["monster-damage-up"]);
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "add-two-modifiers") {
        found = true;
        assert.equal(result.addedMods.length, 2);
        assert.notEqual(result.addedMods[0], result.addedMods[1]);
        const corrupted = generateCorruptedMap(rareMap, seed);
        assert.equal(new Set(corrupted.mods).size, corrupted.mods.length, "sem duplicatas no resultado final");
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'add-two-modifiers' em 500 seeds");
  });

  it("'replace-one-add-two': remove 1 Mod existente (quando havia algum) e adiciona 2 novos", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", ["monster-damage-up", "rarity-up"]);
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "replace-one-add-two") {
        found = true;
        assert.equal(result.removedMods.length, 1);
        assert.equal(result.addedMods.length, 2);
        assert.ok(rareMap.mods.includes(result.removedMods[0]));
        const corrupted = generateCorruptedMap(rareMap, seed);
        assert.ok(!corrupted.mods.includes(result.removedMods[0]), "Mod removido não deveria sobrar no resultado final");
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'replace-one-add-two' em 500 seeds");
  });

  it("'replace-one-add-two' com Rare Map sem nenhum Mod: nunca remove (nada pra remover), só adiciona 2", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", []);
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "replace-one-add-two") {
        found = true;
        assert.equal(result.removedMods.length, 0);
        assert.equal(result.addedMods.length, 2);
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'replace-one-add-two' em 500 seeds mesmo sem Mods originais");
  });

  it("'increase-tier': tier +1 (até o máximo 3), mods intocados", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", ["monster-damage-up"]);
    let found = false;
    for (let seed = 1; seed <= 500 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "increase-tier") {
        found = true;
        const corrupted = generateCorruptedMap(rareMap, seed);
        assert.equal(corrupted.tier, 2);
        assert.deepEqual(corrupted.mods, rareMap.mods);
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'increase-tier' em 500 seeds");

    // Tier já no máximo (3): increase-tier nunca ultrapassa MAX_TIER.
    const maxedRareMap: RareMapInstance = { ...rareMap, tier: 3 };
    for (let seed = 1; seed <= 500; seed++) {
      const result = rollCorruptionOutcome(maxedRareMap, seed);
      if (result.outcome === "increase-tier") {
        const corrupted = generateCorruptedMap(maxedRareMap, seed);
        assert.equal(corrupted.tier, 3);
        assert.equal(result.tierIncreased, false, "tier já estava no máximo — nunca deveria reportar aumento");
        break;
      }
    }
  });

  it("'brick': substitui os Mods por TODOS os Mods reais elegíveis, tier vai para o máximo (3) — 'extremamente difícil'", () => {
    const rareMap = fixtureRareMap("bosque-sussurrante", ["monster-damage-up"]);
    let found = false;
    for (let seed = 1; seed <= 2000 && !found; seed++) {
      const result = rollCorruptionOutcome(rareMap, seed);
      if (result.outcome === "brick") {
        found = true;
        const corrupted = generateCorruptedMap(rareMap, seed);
        assert.equal(corrupted.tier, 3);
        assert.ok(corrupted.mods.length >= 7, `esperava a maioria/todos os Mods reais ativos, obteve ${corrupted.mods.length}`);
        for (const modId of corrupted.mods) {
          assert.ok(getMapModifier(modId)?.enabled, `Mod "${modId}" deveria ser um MapModifier real e habilitado`);
        }
      }
    }
    assert.ok(found, "esperava encontrar o resultado 'brick' em 2000 seeds (peso baixo, 5/100)");
  });
});

describe("Adventure usando CorruptedMap (Fase 5) — reutiliza generateRareMap() real, ponta a ponta", () => {
  it("generateCorruptedMap() aceita um RareMapInstance real (não hand-crafted) gerado por generateRareMap()", () => {
    const rareMap = generateRareMap(7, { rarity: "rare", mapId: "bosque-sussurrante" });
    const corrupted = generateCorruptedMap(rareMap, 99);
    assert.equal(corrupted.mapId, rareMap.mapId);
    assert.equal(corrupted.sourceInstanceId, rareMap.instanceId);
    assert.equal(corrupted.corrupted, true);
  });
});
