import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { EXAMPLE_GEM_DEFINITION_REGISTRY } from "./gemRegistry.js";
import { EXAMPLE_GEM_BEHAVIOR_REGISTRY, getGemBehavior, listGemBehaviorsByKind } from "./gemBehaviorRegistry.js";
import { resolveGemBehaviorForGemType, resolveActiveGemBehaviors } from "./gemBehaviorResolver.js";
import { createSocketConfiguration } from "./sockets.js";
import type { GemBehaviorKind } from "./gemBehavior.js";

describe("Sprint 23 — Sockets & Gems Phase II: GemBehavior / GemBehaviorRegistry", () => {
  test("os 6 comportamentos do brief existem, um por gema nomeada", () => {
    const kinds: GemBehaviorKind[] = ["onHitBonusFireDamage", "chanceToChill", "regenPerTick", "manaPerTick", "bonusCriticalChance", "bonusResistance"];
    for (const kind of kinds) {
      const matches = listGemBehaviorsByKind(EXAMPLE_GEM_BEHAVIOR_REGISTRY, kind);
      assert.equal(matches.length, 1, `esperava exatamente 1 GemBehavior pro tipo "${kind}"`);
    }
  });

  test("getGemBehavior devolve undefined pra id inexistente — nunca lança", () => {
    assert.equal(getGemBehavior(EXAMPLE_GEM_BEHAVIOR_REGISTRY, "id-inexistente"), undefined);
  });
});

describe("Sprint 23 — Behavior Resolver (gemBehaviorResolver.ts)", () => {
  test("resolveGemBehaviorForGemType resolve pro comportamento certo quando Gema+Behavior estão enabled (Rubi -> fogo)", () => {
    const behavior = resolveGemBehaviorForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY, "ruby-1");
    assert.ok(behavior);
    assert.equal(behavior!.kind, "onHitBonusFireDamage");
  });

  test("topaz-1 (sem effectId) tem behaviorId real — primeiro papel do Topázio no jogo", () => {
    const behavior = resolveGemBehaviorForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY, "topaz-1");
    assert.ok(behavior);
    assert.equal(behavior!.kind, "manaPerTick");
  });

  test("onyx-1: effectId e behaviorId nunca são o mesmo conceito (defense-effect vs. crit-behavior)", () => {
    const behavior = resolveGemBehaviorForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY, "onyx-1");
    assert.ok(behavior);
    assert.equal(behavior!.kind, "bonusCriticalChance");
    assert.notEqual(EXAMPLE_GEM_DEFINITION_REGISTRY["onyx-1"]!.effectId, EXAMPLE_GEM_DEFINITION_REGISTRY["onyx-1"]!.behaviorId);
  });

  test("resolveGemBehaviorForGemType devolve undefined pra gemType sem GemDefinition — nunca lança", () => {
    assert.equal(resolveGemBehaviorForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY, "gema-inexistente"), undefined);
  });

  test("resolveGemBehaviorForGemType devolve undefined pra Gema sem behaviorId (citrine-1)", () => {
    assert.equal(resolveGemBehaviorForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY, "citrine-1"), undefined);
  });

  test("resolveActiveGemBehaviors só considera Sockets filled com Gema conhecida", () => {
    const sockets = createSocketConfiguration(3, 222);
    sockets.sockets[0]!.state = "filled";
    sockets.sockets[1]!.state = "empty";
    sockets.sockets[2]!.state = "filled";
    const socketGemTypes: Record<string, string> = {
      [sockets.sockets[0]!.id]: "sapphire-1",
      // socket 2 filled mas sem entrada em socketGemTypes — nunca lança
    };
    const active = resolveActiveGemBehaviors(sockets, socketGemTypes, EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY);
    assert.equal(active.length, 1);
    assert.equal(active[0]!.gemType, "sapphire-1");
    assert.equal(active[0]!.behavior.kind, "chanceToChill");
  });

  test("resolveActiveGemBehaviors devolve [] pra sockets/socketGemTypes null", () => {
    assert.deepEqual(resolveActiveGemBehaviors(null, null, EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_BEHAVIOR_REGISTRY), []);
  });
});
