/**
 * Sprint 20 — Sockets & Gemas Phase I. Cobertura de SocketLayout/
 * GemDefinition/GemRegistry/SocketCompatibility (Fase 12) — tudo puro,
 * sem I/O.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";
import { getSocketLayout, resolveSocketCountFromLayout, exampleMaxSocketsForTier } from "./socketLayout.js";
import { EXAMPLE_SOCKET_LAYOUT_REGISTRY } from "./exampleSocketLayouts.js";
import { getGemDefinition, listGemDefinitions, listEnabledGemDefinitions, listGemDefinitionsByCategory, EXAMPLE_GEM_DEFINITION_REGISTRY } from "./gemRegistry.js";
import { getSocketCompatibility, isGemCompatibleWithBase, EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY } from "./socketCompatibility.js";

describe("SocketLayout (Fase 3)", () => {
  test("toda Base real de itemgen/baseItems.ts tem um SocketLayout registrado", () => {
    for (const base of ITEM_GEN_BASE_ITEMS) {
      const layout = getSocketLayout(EXAMPLE_SOCKET_LAYOUT_REGISTRY, base.id);
      assert.ok(layout, `Base "${base.id}" não tem SocketLayout`);
      assert.equal(layout!.baseId, base.id);
      assert.ok(layout!.maxSockets <= 6);
      assert.ok(layout!.minSockets <= layout!.maxSockets);
    }
  });

  test("getSocketLayout devolve undefined pra um id desconhecido", () => {
    assert.equal(getSocketLayout(EXAMPLE_SOCKET_LAYOUT_REGISTRY, "nao-existe"), undefined);
  });

  test("resolveSocketCountFromLayout: roll 0 sempre produz a menor contagem (peso maior primeiro)", () => {
    const layout = EXAMPLE_SOCKET_LAYOUT_REGISTRY.sword!;
    assert.equal(resolveSocketCountFromLayout(layout, 0), 0);
  });

  test("resolveSocketCountFromLayout: roll perto de 1 produz a maior contagem (menor peso)", () => {
    const layout = EXAMPLE_SOCKET_LAYOUT_REGISTRY.sword!;
    assert.equal(resolveSocketCountFromLayout(layout, 0.9999), layout.maxSockets);
  });

  test("resolveSocketCountFromLayout: layout sem pesos cai pro minSockets, nunca lança", () => {
    const empty = { baseId: "x", minSockets: 2, maxSockets: 4, weights: [] };
    assert.equal(resolveSocketCountFromLayout(empty, 0.5), 2);
  });

  test("exampleMaxSocketsForTier: Tier mais alto nunca produz menos Sockets que Tier mais baixo, sempre capado em 6", () => {
    assert.ok(exampleMaxSocketsForTier(1) <= exampleMaxSocketsForTier(4));
    assert.ok(exampleMaxSocketsForTier(5) <= 6);
  });
});

describe("GemDefinition / GemRegistry (Fase 4/5/6)", () => {
  test("getGemDefinition acha o exemplo 'Rubi III'", () => {
    const def = getGemDefinition(EXAMPLE_GEM_DEFINITION_REGISTRY, "ruby-3");
    assert.ok(def);
    assert.equal(def!.displayName, "Rubi III");
    assert.equal(def!.tier, 3);
  });

  test("devolve undefined pra um id desconhecido — nunca inventa", () => {
    assert.equal(getGemDefinition(EXAMPLE_GEM_DEFINITION_REGISTRY, "nao-existe"), undefined);
  });

  test("listEnabledGemDefinitions só devolve as enabled", () => {
    const all = listGemDefinitions(EXAMPLE_GEM_DEFINITION_REGISTRY);
    const enabled = listEnabledGemDefinitions(EXAMPLE_GEM_DEFINITION_REGISTRY);
    assert.equal(all.length, enabled.length); // todas enabled hoje
  });

  test("listGemDefinitionsByCategory filtra corretamente", () => {
    const attackGems = listGemDefinitionsByCategory(EXAMPLE_GEM_DEFINITION_REGISTRY, "attack");
    assert.ok(attackGems.length > 0);
    assert.ok(attackGems.every((g) => g.category === "attack"));
  });

  test("nenhuma GemDefinition expõe level/experience/quality — filosofia 'nunca evolui'", () => {
    for (const def of listGemDefinitions(EXAMPLE_GEM_DEFINITION_REGISTRY)) {
      assert.equal("level" in def, false);
      assert.equal("experience" in def, false);
      assert.equal("quality" in def, false);
    }
  });
});

describe("Socket Compatibility (Fase 7)", () => {
  test("Arma aceita Attack/Critical/Support (exemplo literal do brief)", () => {
    assert.equal(isGemCompatibleWithBase(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "sword", "attack"), true);
    assert.equal(isGemCompatibleWithBase(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "sword", "critical"), true);
    assert.equal(isGemCompatibleWithBase(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "sword", "support"), true);
    assert.equal(isGemCompatibleWithBase(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "sword", "life"), false);
  });

  test("Armadura aceita Defense/Life/Utility (exemplo literal do brief)", () => {
    const compat = getSocketCompatibility(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "chest")!;
    assert.deepEqual(compat.acceptedCategories.sort(), ["defense", "life", "utility"].sort());
  });

  test("Anel aceita Magic/Support/Mana (exemplo literal do brief)", () => {
    const compat = getSocketCompatibility(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "ring")!;
    assert.deepEqual(compat.acceptedCategories.sort(), ["magic", "mana", "support"].sort());
  });

  test("uma Base fora do registro nunca bloqueia — 'sem restrição conhecida'", () => {
    assert.equal(isGemCompatibleWithBase(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, "nao-existe", "fire"), true);
  });

  test("todas as 13 Bases reais têm uma SocketCompatibility registrada", () => {
    for (const base of ITEM_GEN_BASE_ITEMS) {
      assert.ok(getSocketCompatibility(EXAMPLE_SOCKET_COMPATIBILITY_REGISTRY, base.id), `Base "${base.id}" sem SocketCompatibility`);
    }
  });
});
