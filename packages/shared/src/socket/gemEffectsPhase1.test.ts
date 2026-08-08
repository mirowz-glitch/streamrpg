/**
 * Sprint 21 — Gem Effects Phase I. Cobertura de GemEffect/
 * GemEffectRegistry/Resolver (Fase 11) — tudo puro, sem I/O.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";
import { getGemEffect, listGemEffects, listEnabledGemEffects, listGemEffectsByType, EXAMPLE_GEM_EFFECT_REGISTRY } from "./gemEffectRegistry.js";
import { EXAMPLE_GEM_DEFINITION_REGISTRY } from "./gemRegistry.js";
import {
  resolveGemEffectForGemType,
  resolveActiveGemEffects,
  applyGemEffectsToStats,
  zeroResolvedCharacterStats,
  type ActiveGemEffect,
} from "./gemEffectResolver.js";
import { createSocketConfiguration } from "./sockets.js";
import type { GemEffectStatType } from "./gemEffect.js";

describe("GemEffect / GemEffectRegistry (Fase 2/3/4)", () => {
  test("os 7 tipos de exemplo QA existem, um GemEffect cada", () => {
    const types: GemEffectStatType[] = ["attack", "defense", "critical", "life", "mana", "attackSpeed", "magic"];
    for (const type of types) {
      const matches = listGemEffectsByType(EXAMPLE_GEM_EFFECT_REGISTRY, type);
      assert.equal(matches.length, 1, `esperava exatamente 1 GemEffect pro tipo "${type}"`);
    }
  });

  test("getGemEffect devolve undefined pra um id desconhecido — nunca inventa", () => {
    assert.equal(getGemEffect(EXAMPLE_GEM_EFFECT_REGISTRY, "nao-existe"), undefined);
  });

  test("listEnabledGemEffects só devolve os enabled", () => {
    const all = listGemEffects(EXAMPLE_GEM_EFFECT_REGISTRY);
    const enabled = listEnabledGemEffects(EXAMPLE_GEM_EFFECT_REGISTRY);
    assert.equal(all.length, enabled.length); // todos enabled hoje
  });

  test("attack/defense usam percent, os outros 5 usam flat (Fase 1: só attack/defense têm stat-base real)", () => {
    assert.equal(EXAMPLE_GEM_EFFECT_REGISTRY["attack-percent-1"]!.scaling, "percent");
    assert.equal(EXAMPLE_GEM_EFFECT_REGISTRY["defense-percent-1"]!.scaling, "percent");
    for (const id of ["critical-flat-1", "life-flat-1", "mana-flat-1", "attackspeed-flat-1", "magic-flat-1"]) {
      assert.equal(EXAMPLE_GEM_EFFECT_REGISTRY[id]!.scaling, "flat");
    }
  });
});

describe("GemDefinition.effectId (Fase 3/4)", () => {
  test("toda GemDefinition com categoria dentre os 7 tipos de efeito tem um effectId resolvível", () => {
    const withEffect = ["ruby-1", "ruby-2", "ruby-3", "sapphire-1", "emerald-1", "onyx-1", "amethyst-1", "citrine-1", "opal-1"];
    for (const id of withEffect) {
      const def = EXAMPLE_GEM_DEFINITION_REGISTRY[id]!;
      assert.ok(def.effectId, `Gema "${id}" deveria ter effectId`);
      assert.ok(EXAMPLE_GEM_EFFECT_REGISTRY[def.effectId!], `effectId de "${id}" não resolve a nenhum GemEffect`);
    }
  });

  test("topaz-1 (categoria utility, fora dos 7 tipos) não tem effectId — nunca inventa um efeito", () => {
    assert.equal(EXAMPLE_GEM_DEFINITION_REGISTRY["topaz-1"]!.effectId, undefined);
  });

  test("as 10 Gemas de exemplo cobrem os 7 tipos de GemEffectStatType", () => {
    const coveredTypes = new Set<GemEffectStatType>();
    for (const def of Object.values(EXAMPLE_GEM_DEFINITION_REGISTRY)) {
      if (!def.effectId) continue;
      const effect = EXAMPLE_GEM_EFFECT_REGISTRY[def.effectId];
      if (effect) coveredTypes.add(effect.type);
    }
    assert.equal(coveredTypes.size, 7);
  });
});

describe("Effect Resolver (Fase 5)", () => {
  test("resolveGemEffectForGemType resolve pro efeito certo quando Gema+Efeito estão enabled", () => {
    const effect = resolveGemEffectForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY, "ruby-3");
    assert.ok(effect);
    assert.equal(effect!.id, "attack-percent-1");
  });

  test("resolveGemEffectForGemType devolve undefined pra gemType sem GemDefinition — nunca lança", () => {
    assert.equal(resolveGemEffectForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY, "gema-inexistente"), undefined);
  });

  test("resolveGemEffectForGemType devolve undefined pra Gema sem effectId (topaz-1)", () => {
    assert.equal(resolveGemEffectForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY, "topaz-1"), undefined);
  });

  test("resolveActiveGemEffects só considera Sockets filled com Gema conhecida", () => {
    const sockets = createSocketConfiguration(3, 111);
    sockets.sockets[0]!.state = "filled";
    sockets.sockets[1]!.state = "empty";
    sockets.sockets[2]!.state = "filled";
    const socketGemTypes: Record<string, string> = {
      [sockets.sockets[0]!.id]: "ruby-1",
      // socket 2 filled mas sem entrada em socketGemTypes — nunca lança
    };
    const active = resolveActiveGemEffects(sockets, socketGemTypes, EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY);
    assert.equal(active.length, 1);
    assert.equal(active[0]!.gemType, "ruby-1");
  });

  test("resolveActiveGemEffects devolve [] pra sockets/socketGemTypes null", () => {
    assert.deepEqual(resolveActiveGemEffects(null, null, EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY), []);
  });
});

describe("applyGemEffectsToStats (Fase 6)", () => {
  test("percent aplica sobre o stat-base real, nunca sobre 0 quando a base é real", () => {
    const base = { ...zeroResolvedCharacterStats(), attack: 100 };
    const active: ActiveGemEffect[] = [{ socketId: "s1", gemType: "ruby-1", effect: EXAMPLE_GEM_EFFECT_REGISTRY["attack-percent-1"]! }];
    const result = applyGemEffectsToStats(base, active);
    assert.equal(result.attack, 105);
  });

  test("flat soma direto, independente da base", () => {
    const base = zeroResolvedCharacterStats();
    const active: ActiveGemEffect[] = [{ socketId: "s1", gemType: "emerald-1", effect: EXAMPLE_GEM_EFFECT_REGISTRY["life-flat-1"]! }];
    const result = applyGemEffectsToStats(base, active);
    assert.equal(result.life, 30);
  });

  test("múltiplos efeitos do mesmo tipo sempre leem a MESMA base (ordem não muda o resultado)", () => {
    const base = { ...zeroResolvedCharacterStats(), attack: 100 };
    const active: ActiveGemEffect[] = [
      { socketId: "s1", gemType: "ruby-1", effect: EXAMPLE_GEM_EFFECT_REGISTRY["attack-percent-1"]! },
      { socketId: "s2", gemType: "ruby-2", effect: EXAMPLE_GEM_EFFECT_REGISTRY["attack-percent-1"]! },
    ];
    const result = applyGemEffectsToStats(base, active);
    // 100 + 5 (5% de 100) + 5 (5% de 100, NUNCA 5% de 105) = 110
    assert.equal(result.attack, 110);
  });

  test("nunca muta o objeto `base` recebido", () => {
    const base = { ...zeroResolvedCharacterStats(), attack: 100 };
    const frozenCopy = { ...base };
    applyGemEffectsToStats(base, [{ socketId: "s1", gemType: "ruby-1", effect: EXAMPLE_GEM_EFFECT_REGISTRY["attack-percent-1"]! }]);
    assert.deepEqual(base, frozenCopy);
  });

  test("nenhum efeito ativo devolve os mesmos valores da base", () => {
    const base = { ...zeroResolvedCharacterStats(), attack: 42 };
    assert.deepEqual(applyGemEffectsToStats(base, []), base);
  });
});

describe("cobertura cruzada com o catálogo real de Bases (Sprint 20)", () => {
  test("o catálogo real de Bases (itemgen/baseItems.ts) continua intocado por esta Sprint", () => {
    // não hardcoda a contagem (outra Sprint pode adicionar Bases) — só
    // confirma que o catálogo continua não-vazio e legível daqui, sem
    // nenhuma dependência nova desta Sprint sobre ele.
    assert.ok(ITEM_GEN_BASE_ITEMS.length > 0);
  });
});
