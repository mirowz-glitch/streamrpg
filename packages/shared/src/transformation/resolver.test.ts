import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { isBaseEligibleForUncertainty, resolveUncertaintyOutcome, isUncertaintyExclusive } from "./resolver.js";
import type { BaseTransformation, BaseTransformationPoolRegistry } from "./types.js";

const REGISTRY: BaseTransformationPoolRegistry = {
  sword: {
    baseItemId: "sword",
    enabled: true,
    weights: [
      { transformationId: "sword-worn", pool: "common", weight: 90 },
      { transformationId: "sword-king", pool: "legendary", weight: 10 },
    ],
  },
  gated: {
    baseItemId: "gated",
    enabled: true,
    weights: [
      { transformationId: "gated-floor", pool: "common", weight: 50 },
      { transformationId: "gated-t", pool: "epic", weight: 50 },
    ],
  },
  disabled: { baseItemId: "disabled", enabled: false, weights: [{ transformationId: "disabled-t", pool: "common", weight: 100 }] },
};

const TRANSFORMATIONS: BaseTransformation[] = [
  { id: "sword-worn", baseItemId: "sword", outcome: "downgrade", revealedName: "Espada Gasta", revealedRarity: "common", enabled: true, conditions: [], exclusiveSource: null },
  {
    id: "sword-king",
    baseItemId: "sword",
    outcome: "upgrade",
    revealedName: "Espada do Rei",
    revealedRarity: "legendary",
    enabled: true,
    conditions: [],
    exclusiveSource: "uncertainty",
  },
  { id: "gated-floor", baseItemId: "gated", outcome: "downgrade", revealedName: "Item Gasto", revealedRarity: "common", enabled: true, conditions: [], exclusiveSource: null },
  {
    id: "gated-t",
    baseItemId: "gated",
    outcome: "mythic_reveal",
    revealedName: "Item Mítico Condicional",
    revealedRarity: "legendary",
    enabled: true,
    conditions: [{ kind: "min_item_level", value: 50 }],
    exclusiveSource: "uncertainty",
  },
  { id: "disabled-t", baseItemId: "disabled", outcome: "reveal", revealedName: "Nunca Usado", revealedRarity: "epic", enabled: true, conditions: [], exclusiveSource: null },
];

describe("isBaseEligibleForUncertainty", () => {
  test("Base com pool.enabled=true é elegível", () => {
    assert.equal(isBaseEligibleForUncertainty("sword", REGISTRY), true);
  });

  test("Base ausente do registro NÃO é elegível", () => {
    assert.equal(isBaseEligibleForUncertainty("axe", REGISTRY), false);
  });

  test("Base presente mas com pool.enabled=false NÃO é elegível", () => {
    assert.equal(isBaseEligibleForUncertainty("disabled", REGISTRY), false);
  });
});

describe("resolveUncertaintyOutcome — a Esfera NUNCA falha", () => {
  test("todo roll possível (0 a quase-1) sempre devolve um TransformationOutcome real, nunca 'none'", () => {
    for (const roll of [0, 0.01, 0.25, 0.5, 0.75, 0.89, 0.9, 0.95, 0.999999]) {
      const result = resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, TRANSFORMATIONS, roll);
      assert.ok(["upgrade", "downgrade", "mutation", "reveal", "mythic_reveal"].includes(result.outcome));
      assert.ok(result.transformationId);
      assert.ok(result.revealedName);
    }
  });

  test("roll na fatia baixa produz a transformação de peso maior (downgrade, 90/100)", () => {
    const result = resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, TRANSFORMATIONS, 0.5);
    assert.equal(result.outcome, "downgrade");
    assert.equal(result.transformationId, "sword-worn");
  });

  test("roll na fatia alta produz a transformação de peso menor (upgrade, 10/100)", () => {
    const result = resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, TRANSFORMATIONS, 0.95);
    assert.equal(result.outcome, "upgrade");
    assert.equal(result.revealedName, "Espada do Rei");
  });

  test("determinístico: mesmo roll sempre produz o mesmo resultado", () => {
    const a = resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, TRANSFORMATIONS, 0.5);
    const b = resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, TRANSFORMATIONS, 0.5);
    assert.deepEqual(a, b);
  });

  test("lança erro para uma Base inelegível — nunca chamada pelo fluxo real sem checar antes", () => {
    assert.throws(() => resolveUncertaintyOutcome("axe", "common", 1, REGISTRY, TRANSFORMATIONS, 0.5));
  });
});

describe("resolveUncertaintyOutcome — condições (Fase 4/9: suporte a pesos/condições)", () => {
  test("transformação com condição não satisfeita nunca é sorteada — o roll sempre cai no piso incondicional", () => {
    // itemLevel=1 nunca satisfaz min_item_level=50 do Mítico condicional — mesmo um roll
    // que cairia na fatia dele (se elegível) deve produzir o piso garantido (downgrade).
    const result = resolveUncertaintyOutcome("gated", "common", 1, REGISTRY, TRANSFORMATIONS, 0.99);
    assert.equal(result.outcome, "downgrade");
    assert.equal(result.transformationId, "gated-floor");
  });

  test("transformação com condição satisfeita pode ser sorteada", () => {
    const result = resolveUncertaintyOutcome("gated", "common", 60, REGISTRY, TRANSFORMATIONS, 0.99);
    assert.equal(result.outcome, "mythic_reveal");
    assert.equal(result.transformationId, "gated-t");
  });
});

describe("resolveUncertaintyOutcome — enabled (suporte a desligar sem remover)", () => {
  test("transformação com enabled=false nunca é sorteada — se for a única, lança erro de configuração (nunca 'none')", () => {
    const disabled: BaseTransformation[] = TRANSFORMATIONS.map((t) => (t.id === "sword-worn" ? { ...t, enabled: false } : t));
    // sword-worn desabilitada deixa só sword-king (peso 10) elegível — o roll ainda funciona.
    const result = resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, disabled, 0.5);
    assert.equal(result.transformationId, "sword-king");
  });

  test("todas as transformações de uma Base elegível desabilitadas -> erro de configuração explícito", () => {
    const allDisabled: BaseTransformation[] = TRANSFORMATIONS.map((t) => (t.baseItemId === "sword" ? { ...t, enabled: false } : t));
    assert.throws(() => resolveUncertaintyOutcome("sword", "common", 1, REGISTRY, allDisabled, 0.5));
  });
});

describe("resolveUncertaintyOutcome — Fase 5: Mítico extremamente raro", () => {
  const RING_REGISTRY: BaseTransformationPoolRegistry = {
    ring: {
      baseItemId: "ring",
      enabled: true,
      weights: [
        { transformationId: "ring-common", pool: "common", weight: 99_999 },
        { transformationId: "ring-mythic", pool: "mythic", weight: 1 },
      ],
    },
  };
  const RING_TRANSFORMATIONS: BaseTransformation[] = [
    { id: "ring-common", baseItemId: "ring", outcome: "downgrade", revealedName: "Anel Comum", revealedRarity: "common", enabled: true, conditions: [], exclusiveSource: null },
    {
      id: "ring-mythic",
      baseItemId: "ring",
      outcome: "mythic_reveal",
      revealedName: "Anel do Primeiro Rei",
      revealedRarity: "legendary",
      enabled: true,
      conditions: [],
      exclusiveSource: "uncertainty",
    },
  ];

  test("0,001% (1 em 100.000): só o último bucket de roll produz o Mítico", () => {
    const almostAll = resolveUncertaintyOutcome("ring", "common", 1, RING_REGISTRY, RING_TRANSFORMATIONS, 0.999985);
    assert.equal(almostAll.outcome, "downgrade");

    const theOne = resolveUncertaintyOutcome("ring", "common", 1, RING_REGISTRY, RING_TRANSFORMATIONS, 0.999995);
    assert.equal(theOne.outcome, "mythic_reveal");
    assert.equal(theOne.revealedName, "Anel do Primeiro Rei");
  });
});

// Sprint 24 — Economy Foundation II, Fase 4: "uncertaintyOnly" do brief
// já é `exclusiveSource === "uncertainty"` (Sprint 17) — este predicado
// só nomeia o conceito, nunca introduz um segundo campo.
describe("isUncertaintyExclusive", () => {
  test("Espada do Rei (exclusiveSource: 'uncertainty') é exclusiva da Incerteza", () => {
    const sword = TRANSFORMATIONS.find((t) => t.id === "sword-king")!;
    assert.equal(isUncertaintyExclusive(sword), true);
  });

  test("Espada Gasta (exclusiveSource: null) nunca é exclusiva", () => {
    const sword = TRANSFORMATIONS.find((t) => t.id === "sword-worn")!;
    assert.equal(isUncertaintyExclusive(sword), false);
  });

  test("todo TransformationOutcome com exclusiveSource !== 'uncertainty' (incluindo outras fontes futuras) nunca é 'uncertainty-exclusive'", () => {
    assert.equal(isUncertaintyExclusive({ exclusiveSource: "npc" }), false);
    assert.equal(isUncertaintyExclusive({ exclusiveSource: "world_event" }), false);
    assert.equal(isUncertaintyExclusive({ exclusiveSource: null }), false);
  });
});
