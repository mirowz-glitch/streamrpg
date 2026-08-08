import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { SPHERE_DEFINITIONS, SPHERE_REGISTRY, getSphereDefinition, canApplySphere, validateSphere, applySphere } from "./spheres.js";

// Sprint 10 — Itemization 2.0 prep, Fase 7. Cobre só a infraestrutura
// (dados + a única regra real desta Fase: um item selado nunca aceita
// outra Esfera) — nenhuma lógica de aplicação real existe ainda.
describe("SPHERE_DEFINITIONS", () => {
  test("as 6 Esferas previstas pelo brief existem, cada uma com id único", () => {
    // Sprint 16 — Economy Foundation: "uncertainty" (Esfera da
    // Incerteza) somada às 5 originais — lista atualizada de propósito,
    // nunca removida (o teste continua cobrindo a mesma garantia:
    // nenhum id duplicado, todo id previsto presente).
    const ids = SPHERE_DEFINITIONS.map((sphere) => sphere.id);
    assert.deepEqual(new Set(ids).size, ids.length);
    assert.deepEqual(
      [...ids].sort(),
      ["ascension", "curse", "fortune", "lapidation", "purification", "uncertainty"].sort(),
    );
  });

  test("getSphereDefinition() encontra cada Esfera prevista", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      assert.equal(getSphereDefinition(sphere.id).id, sphere.id);
    }
  });

  test("getSphereDefinition() lança erro pra um id desconhecido — nunca inventa uma Esfera", () => {
    // @ts-expect-error - id inválido de propósito, pra confirmar o guard em runtime
    assert.throws(() => getSphereDefinition("nao-existe"));
  });

  test("Esfera da Maldição é a única com target 'craft_state' — a garantia de que ela sela, nenhuma outra", () => {
    const sealers = SPHERE_DEFINITIONS.filter((sphere) => sphere.effect.target === "craft_state");
    assert.equal(sealers.length, 1);
    assert.equal(sealers[0]!.id, "curse");
  });
});

describe("canApplySphere", () => {
  test("item 'open' aceita qualquer Esfera (única regra real desta Fase, verificada, nunca aplicada)", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      assert.equal(canApplySphere("open", sphere.id), true);
    }
  });

  test("item 'sealed' (após a Esfera da Maldição) nunca aceita nenhuma Esfera — nem outra Maldição", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      assert.equal(canApplySphere("sealed", sphere.id), false);
    }
  });
});

// Sprint 11 introduziu validação/aplicação reais só pra Maldição.
// Sprint 12 (Crafting Phase I) torna as outras 4 reais também (efeito
// sobre afixos/quality, ver crafting/sphereCrafting.ts) —
// `validateSphere()` agora só recusa por item selado, nunca mais por
// "sphere-not-implemented".
describe("validateSphere", () => {
  test("curse em item 'open' é válida", () => {
    assert.deepEqual(validateSphere("open", "curse"), { ok: true });
  });

  test("curse em item 'sealed' é recusada por 'item-sealed'", () => {
    assert.deepEqual(validateSphere("sealed", "curse"), { ok: false, reason: "item-sealed" });
  });

  test("as outras 4 Esferas também são válidas em item 'open' (Sprint 12: todas reais agora)", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      if (sphere.id === "curse") continue;
      assert.deepEqual(validateSphere("open", sphere.id), { ok: true });
    }
  });

  test("as outras 4 Esferas também são recusadas em item 'sealed'", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      if (sphere.id === "curse") continue;
      assert.deepEqual(validateSphere("sealed", sphere.id), { ok: false, reason: "item-sealed" });
    }
  });
});

describe("applySphere (transição de craft_state — só a Maldição)", () => {
  test("curse em item 'open' sela o item (craftState -> 'sealed')", () => {
    assert.deepEqual(applySphere("open", "curse"), { success: true, newCraftState: "sealed" });
  });

  test("curse em item já 'sealed' falha (não sela duas vezes)", () => {
    const result = applySphere("sealed", "curse");
    assert.equal(result.success, false);
    assert.equal(result.reason, "item-sealed");
  });
});

// Sprint 24 — Economy Foundation II, Fase 4: SPHERE_REGISTRY é o mesmo
// dado de SPHERE_DEFINITIONS, só num formato de lookup por chave —
// nunca uma segunda fonte de verdade.
describe("SPHERE_REGISTRY", () => {
  test("tem exatamente as mesmas 6 Esferas de SPHERE_DEFINITIONS, chaveadas por id", () => {
    assert.deepEqual(Object.keys(SPHERE_REGISTRY).sort(), SPHERE_DEFINITIONS.map((s) => s.id).sort());
  });

  test("cada entrada é a MESMA referência de objeto de SPHERE_DEFINITIONS (nunca uma cópia divergente)", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      assert.equal(SPHERE_REGISTRY[sphere.id], sphere);
    }
  });

  test("getSphereDefinition() continua devolvendo exatamente o mesmo objeto que SPHERE_REGISTRY (implementação trocou, contrato não)", () => {
    for (const sphere of SPHERE_DEFINITIONS) {
      assert.equal(getSphereDefinition(sphere.id), SPHERE_REGISTRY[sphere.id]);
    }
  });
});
