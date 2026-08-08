/**
 * Sprint 19 — Base Identity. Cobertura de BaseIdentity/BaseRegistry/
 * Implicit Mods/Base Tier/Base Potential (Fase 12) — tudo puro, sem
 * I/O. Inclui um teste de integridade cruzando com o catálogo REAL do
 * Item Generator (itemgen/baseItems.ts) — "toda Base registrada" (Fase
 * 3) precisa ser verificável, não só declarado em prosa.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";
import { BASE_IDENTITY_REGISTRY } from "./baseIdentities.js";
import { getBaseIdentity, listBaseIdentities, listEnabledBaseIdentities, listBaseIdentitiesByTag } from "./registry.js";
import { formatImplicitModifier, formatImplicitModifiers } from "./implicitMods.js";
import { comparePotential, compareTier, POTENTIAL_LABEL } from "./basePotential.js";

describe("BaseRegistry (Fase 3) — integridade contra o catálogo real", () => {
  test("toda Base de itemgen/baseItems.ts tem uma BaseIdentity correspondente", () => {
    for (const base of ITEM_GEN_BASE_ITEMS) {
      const identity = getBaseIdentity(BASE_IDENTITY_REGISTRY, base.id);
      assert.ok(identity, `Base "${base.id}" não tem BaseIdentity registrada`);
      assert.equal(identity!.id, base.id);
      assert.equal(identity!.category, base.category);
    }
  });

  test("nenhuma BaseIdentity órfã (id que não existe no catálogo real)", () => {
    const realIds = new Set(ITEM_GEN_BASE_ITEMS.map((b) => b.id));
    for (const identity of listBaseIdentities(BASE_IDENTITY_REGISTRY)) {
      assert.ok(realIds.has(identity.id), `BaseIdentity "${identity.id}" não corresponde a nenhuma Base real`);
    }
  });

  test("getBaseIdentity devolve undefined pra um id desconhecido — nunca inventa", () => {
    assert.equal(getBaseIdentity(BASE_IDENTITY_REGISTRY, "nao-existe"), undefined);
  });

  test("listEnabledBaseIdentities só devolve as enabled", () => {
    const enabled = listEnabledBaseIdentities(BASE_IDENTITY_REGISTRY);
    assert.equal(enabled.length, listBaseIdentities(BASE_IDENTITY_REGISTRY).length); // todas as 13 estão enabled hoje
    assert.ok(enabled.every((i) => i.enabled));
  });

  test("listBaseIdentitiesByTag filtra corretamente (ex.: 'critical')", () => {
    const critical = listBaseIdentitiesByTag(BASE_IDENTITY_REGISTRY, "critical");
    assert.ok(critical.length > 0);
    assert.ok(critical.every((i) => i.tags.includes("critical")));
    assert.ok(critical.some((i) => i.id === "bow"));
  });
});

describe("BaseIdentity — campos mínimos (Fase 2)", () => {
  test("toda entrada tem os 10 campos obrigatórios preenchidos", () => {
    for (const identity of listBaseIdentities(BASE_IDENTITY_REGISTRY)) {
      assert.ok(identity.id);
      assert.ok(identity.displayName);
      assert.ok(["weapon", "armor", "accessory"].includes(identity.category));
      assert.ok(identity.requiredLevel >= 1);
      assert.ok(Array.isArray(identity.implicitMods));
      assert.ok(identity.description.length > 0);
      assert.ok(Array.isArray(identity.tags));
      assert.equal(typeof identity.enabled, "boolean");
      assert.ok(["low", "medium", "high", "exceptional"].includes(identity.potential));
      assert.ok([1, 2, 3, 4, 5].includes(identity.tier));
    }
  });

  test("weaponClass só é não-nulo pra category 'weapon'; armorClass só pra 'armor'", () => {
    for (const identity of listBaseIdentities(BASE_IDENTITY_REGISTRY)) {
      if (identity.category === "weapon") {
        assert.ok(identity.weaponClass !== null);
        assert.equal(identity.armorClass, null);
      } else if (identity.category === "armor") {
        assert.ok(identity.armorClass !== null);
        assert.equal(identity.weaponClass, null);
      } else {
        assert.equal(identity.weaponClass, null);
        assert.equal(identity.armorClass, null);
      }
    }
  });
});

describe("Implicit Mods (Fase 4) — infraestrutura, nunca aplicado", () => {
  test("formatImplicitModifier formata percent/flat corretamente", () => {
    assert.equal(formatImplicitModifier({ statLabel: "Velocidade de Ataque", value: 8, unit: "percent" }), "+8% Velocidade de Ataque");
    assert.equal(formatImplicitModifier({ statLabel: "Vida Máxima", value: 10, unit: "flat" }), "+10 Vida Máxima");
  });

  test("formatImplicitModifiers formata a lista inteira, preservando ordem", () => {
    const mods = [
      { statLabel: "A", value: 1, unit: "percent" as const },
      { statLabel: "B", value: 2, unit: "flat" as const },
    ];
    assert.deepEqual(formatImplicitModifiers(mods), ["+1% A", "+2 B"]);
  });

  test("os 4 exemplos literais do brief batem exatamente (sword/axe/bow/ring)", () => {
    assert.equal(formatImplicitModifier(BASE_IDENTITY_REGISTRY.sword!.implicitMods[0]!), "+8% Velocidade de Ataque");
    assert.equal(formatImplicitModifier(BASE_IDENTITY_REGISTRY.axe!.implicitMods[0]!), "+12% Dano");
    assert.equal(formatImplicitModifier(BASE_IDENTITY_REGISTRY.bow!.implicitMods[0]!), "+6% Chance de Acerto Crítico");
    assert.equal(formatImplicitModifier(BASE_IDENTITY_REGISTRY.ring!.implicitMods[0]!), "+8% Magia");
  });
});

describe("Base Potential / Base Tier (Fase 6/7) — ordem canônica", () => {
  test("comparePotential ordena low < medium < high < exceptional", () => {
    assert.ok(comparePotential("low", "medium") < 0);
    assert.ok(comparePotential("medium", "high") < 0);
    assert.ok(comparePotential("high", "exceptional") < 0);
    assert.equal(comparePotential("high", "high"), 0);
  });

  test("compareTier ordena numericamente", () => {
    assert.ok(compareTier(1, 5) < 0);
    assert.ok(compareTier(5, 1) > 0);
    assert.equal(compareTier(3, 3), 0);
  });

  test("POTENTIAL_LABEL cobre os 4 valores", () => {
    assert.equal(POTENTIAL_LABEL.low, "Low");
    assert.equal(POTENTIAL_LABEL.exceptional, "Exceptional");
  });

  test("'ring' é Potential 'exceptional' — única Base com caminho real pra Mítico (Sprint 18)", () => {
    assert.equal(BASE_IDENTITY_REGISTRY.ring!.potential, "exceptional");
  });
});

describe("Base Lore (Fase 8) — tudo opcional", () => {
  test("uma Base sem lore nenhuma ainda é válida (objeto vazio)", () => {
    assert.deepEqual(BASE_IDENTITY_REGISTRY.axe!.lore, {});
  });

  test("uma Base com lore parcial só preenche o que tem, nunca inventa os outros campos", () => {
    const ringLore = BASE_IDENTITY_REGISTRY.ring!.lore;
    assert.ok(ringLore.origin);
    assert.equal(ringLore.civilization, undefined);
    assert.equal(ringLore.era, undefined);
  });
});
