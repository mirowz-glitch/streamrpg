/**
 * Sprint 18 — Mythic Foundation. Cobertura de Registry/Pools/Discovery/
 * MythicDefinition (Fase 12) — tudo puro, sem I/O.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getMythicDefinition, listMythicDefinitions, listDiscoverableMythics, findMythicDefinitionByRevealedName, isMythicUncertaintyExclusive } from "./registry.js";
import { getDiscoverableBase, baseSupportsMythic, baseSupportsUncertainty } from "./discoverableBases.js";
import { recordMythicDiscovery, getMythicDiscovery } from "./discovery.js";
import { groupWeightsByPool, hasMythicPool } from "./hiddenPools.js";
import { EXAMPLE_MYTHIC_REGISTRY, EXAMPLE_DISCOVERABLE_BASES, isMythicDisplayName } from "./exampleMythics.js";
import { deriveMythicOrigin } from "./mythicLegacy.js";
import { EXAMPLE_BASE_TRANSFORMATION_POOL, EXAMPLE_BASE_TRANSFORMATIONS, resolveUncertaintyOutcome } from "../transformation/index.js";
import type { MythicDiscoveryRegistry } from "./types.js";
import type { ItemHistoryEvent } from "../itemization/history.js";

describe("MythicRegistry (Fase 2/3)", () => {
  test("getMythicDefinition acha o exemplo registrado", () => {
    const def = getMythicDefinition(EXAMPLE_MYTHIC_REGISTRY, "ring-of-the-first-king");
    assert.ok(def);
    assert.equal(def!.displayName, "Anel do Primeiro Rei");
    assert.equal(def!.exclusiveSource, "uncertainty");
    assert.equal(def!.rarity, "legendary");
  });

  test("devolve undefined pra um id desconhecido — nunca inventa", () => {
    assert.equal(getMythicDefinition(EXAMPLE_MYTHIC_REGISTRY, "nao-existe"), undefined);
  });

  test("listMythicDefinitions/listDiscoverableMythics só devolvem os enabled+discoverable", () => {
    const all = listMythicDefinitions(EXAMPLE_MYTHIC_REGISTRY);
    const discoverable = listDiscoverableMythics(EXAMPLE_MYTHIC_REGISTRY);
    assert.equal(all.length, 1);
    assert.equal(discoverable.length, 1);
  });

  test("findMythicDefinitionByRevealedName liga o nome revelado ao Registry", () => {
    const found = findMythicDefinitionByRevealedName(EXAMPLE_MYTHIC_REGISTRY, "Anel do Primeiro Rei");
    assert.ok(found);
    assert.equal(found!.id, "ring-of-the-first-king");
    assert.equal(findMythicDefinitionByRevealedName(EXAMPLE_MYTHIC_REGISTRY, "Espada Comum"), undefined);
  });

  // Sprint 24 — Economy Foundation II, Fase 4: "uncertaintyOnly" do
  // brief já é `MythicDefinition.exclusiveSource === "uncertainty"`
  // (Sprint 18) — este predicado só nomeia o conceito.
  test("isMythicUncertaintyExclusive: Anel do Primeiro Rei é exclusivo da Incerteza", () => {
    const def = getMythicDefinition(EXAMPLE_MYTHIC_REGISTRY, "ring-of-the-first-king")!;
    assert.equal(isMythicUncertaintyExclusive(def), true);
  });

  test("isMythicUncertaintyExclusive: false pra qualquer outra fonte exclusiva", () => {
    assert.equal(isMythicUncertaintyExclusive({ exclusiveSource: "world_event" }), false);
    assert.equal(isMythicUncertaintyExclusive({ exclusiveSource: "npc" }), false);
  });
});

describe("DiscoverableBase (Fase 4)", () => {
  test("ring e ancient-ring suportam Mítico; sword/staff não", () => {
    assert.equal(baseSupportsMythic(EXAMPLE_DISCOVERABLE_BASES, "ring"), true);
    assert.equal(baseSupportsMythic(EXAMPLE_DISCOVERABLE_BASES, "ancient-ring"), true);
    assert.equal(baseSupportsMythic(EXAMPLE_DISCOVERABLE_BASES, "sword"), false);
    assert.equal(baseSupportsMythic(EXAMPLE_DISCOVERABLE_BASES, "staff"), false);
  });

  test("uma Base fora do registro nunca suporta nada — nunca lança", () => {
    assert.equal(baseSupportsMythic(EXAMPLE_DISCOVERABLE_BASES, "axe"), false);
    assert.equal(baseSupportsUncertainty(EXAMPLE_DISCOVERABLE_BASES, "axe"), false);
    assert.equal(getDiscoverableBase(EXAMPLE_DISCOVERABLE_BASES, "axe"), undefined);
  });

  test("possibleTransformations referencia ids reais de BaseTransformation", () => {
    const base = getDiscoverableBase(EXAMPLE_DISCOVERABLE_BASES, "ancient-ring")!;
    const realIds = new Set(EXAMPLE_BASE_TRANSFORMATIONS.map((t) => t.id));
    for (const id of base.possibleTransformations) {
      assert.ok(realIds.has(id), `possibleTransformations referencia um id inexistente: ${id}`);
    }
  });
});

describe("Discovery (Fase 5) — append-only, first-write-wins", () => {
  test("a primeira chamada cria o registro e marca isFirstDiscovery", () => {
    const empty: MythicDiscoveryRegistry = {};
    const result = recordMythicDiscovery(empty, "ring-of-the-first-king", "char-1", "kingdom-a", "2026-01-01T00:00:00.000Z", "server-1");
    assert.equal(result.isFirstDiscovery, true);
    assert.equal(result.record.firstCharacterId, "char-1");
    assert.equal(getMythicDiscovery(result.registry, "ring-of-the-first-king")!.firstCharacterId, "char-1");
  });

  test("uma segunda chamada pro MESMO mythicId nunca sobrescreve — devolve o registro original", () => {
    const first = recordMythicDiscovery({}, "ring-of-the-first-king", "char-1", "kingdom-a", "2026-01-01T00:00:00.000Z", "server-1");
    const second = recordMythicDiscovery(first.registry, "ring-of-the-first-king", "char-2", "kingdom-b", "2026-01-02T00:00:00.000Z", "server-1");
    assert.equal(second.isFirstDiscovery, false);
    assert.equal(second.record.firstCharacterId, "char-1");
    assert.equal(second.registry, first.registry); // mesma referência — nunca cria um objeto novo quando não é a primeira vez
  });

  test("nunca muta o registry recebido — pura", () => {
    const empty: MythicDiscoveryRegistry = {};
    recordMythicDiscovery(empty, "mythic-x", "char-1", null, "2026-01-01T00:00:00.000Z", "server-1");
    assert.deepEqual(empty, {});
  });
});

describe("Hidden Pools (Fase 7)", () => {
  test("groupWeightsByPool agrupa os pesos da Base 'ring' pelos 5 pools", () => {
    const snapshot = groupWeightsByPool(EXAMPLE_BASE_TRANSFORMATION_POOL.ring);
    assert.equal(snapshot.common.length, 1);
    assert.equal(snapshot.rare.length, 1);
    assert.equal(snapshot.epic.length, 1);
    assert.equal(snapshot.legendary.length, 0);
    assert.equal(snapshot.mythic.length, 1);
    assert.equal(snapshot.mythic[0]!.transformationId, "ring-of-the-first-king");
  });

  test("hasMythicPool detecta a Base com Pool Mítico, sem revelar peso/chance", () => {
    assert.equal(hasMythicPool(EXAMPLE_BASE_TRANSFORMATION_POOL.ring), true);
    assert.equal(hasMythicPool(EXAMPLE_BASE_TRANSFORMATION_POOL["ancient-ring"]), true);
    assert.equal(hasMythicPool(EXAMPLE_BASE_TRANSFORMATION_POOL.sword), false);
    assert.equal(hasMythicPool(undefined), false);
  });
});

describe("Fase 8 — cadeia QA 'Anel Antigo' (ancient-ring)", () => {
  test("os 3 exemplos existem e formam a cadeia narrativa do brief", () => {
    const twisted = EXAMPLE_BASE_TRANSFORMATIONS.find((t) => t.id === "ancient-ring-twisted")!;
    const consecrated = EXAMPLE_BASE_TRANSFORMATIONS.find((t) => t.id === "ancient-ring-consecrated")!;
    const mythic = EXAMPLE_BASE_TRANSFORMATIONS.find((t) => t.id === "ancient-ring-of-the-first-king")!;
    assert.equal(twisted.revealedName, "Anel Retorcido");
    assert.equal(consecrated.revealedName, "Anel Consagrado");
    assert.equal(mythic.revealedName, "Anel do Primeiro Rei");
    assert.equal(mythic.outcome, "mythic_reveal");
    assert.equal(mythic.exclusiveSource, "uncertainty");
  });

  test("resolveUncertaintyOutcome funciona ponta-a-ponta pra 'ancient-ring' — sempre um dos 3 outcomes, nunca 'nada aconteceu'", () => {
    for (let i = 0; i < 50; i++) {
      const roll = i / 50;
      const result = resolveUncertaintyOutcome("ancient-ring", "rare", 1, EXAMPLE_BASE_TRANSFORMATION_POOL, EXAMPLE_BASE_TRANSFORMATIONS, roll);
      assert.ok(["Anel Retorcido", "Anel Consagrado", "Anel do Primeiro Rei"].includes(result.revealedName));
    }
  });

  test("isMythicDisplayName reconhece o nome do Mítico de exemplo", () => {
    assert.equal(isMythicDisplayName("Anel do Primeiro Rei"), true);
    assert.equal(isMythicDisplayName("Anel Retorcido"), false);
  });
});

describe("deriveMythicOrigin (Fase 6 — Legacy)", () => {
  function makeEvents(overrides: Partial<ItemHistoryEvent> = {}): ItemHistoryEvent[] {
    return [
      { event: "created", characterId: "char-1", detail: null, at: "2026-01-01T00:00:00.000Z" },
      { event: "mythic_revealed", characterId: "char-1", detail: "Anel do Primeiro Rei", at: "2026-01-02T00:00:00.000Z", ...overrides },
    ];
  }

  test("item sem evento mythic_revealed nunca é Mítico", () => {
    const origin = deriveMythicOrigin([{ event: "created", characterId: "char-1", detail: null, at: "2026-01-01T00:00:00.000Z" }], EXAMPLE_MYTHIC_REGISTRY, {});
    assert.equal(origin.isMythic, false);
    assert.equal(origin.mythicId, null);
  });

  test("item com mythic_revealed reconhecido resolve id/displayName", () => {
    const origin = deriveMythicOrigin(makeEvents(), EXAMPLE_MYTHIC_REGISTRY, {});
    assert.equal(origin.isMythic, true);
    assert.equal(origin.mythicId, "ring-of-the-first-king");
    assert.equal(origin.displayName, "Anel do Primeiro Rei");
    assert.equal(origin.isFirstDiscovery, false); // sem registro de Discovery ainda
  });

  test("isFirstDiscovery só é true quando characterId+at do evento batem com o registro de Discovery", () => {
    const events = makeEvents();
    const discovery = recordMythicDiscovery({}, "ring-of-the-first-king", "char-1", "kingdom-a", "2026-01-02T00:00:00.000Z", "server-1");
    const origin = deriveMythicOrigin(events, EXAMPLE_MYTHIC_REGISTRY, discovery.registry);
    assert.equal(origin.isFirstDiscovery, true);
  });

  test("um segundo item que revela o MESMO Mítico depois nunca é marcado como first discovery", () => {
    // Discovery já pertence a char-1 (mesmo cenário do teste acima).
    const discovery = recordMythicDiscovery({}, "ring-of-the-first-king", "char-1", "kingdom-a", "2026-01-02T00:00:00.000Z", "server-1");
    const laterEvents = makeEvents({ characterId: "char-2", at: "2026-01-05T00:00:00.000Z" });
    const origin = deriveMythicOrigin(laterEvents, EXAMPLE_MYTHIC_REGISTRY, discovery.registry);
    assert.equal(origin.isMythic, true);
    assert.equal(origin.isFirstDiscovery, false);
  });

  test("um nome revelado desconhecido do Registry ainda marca isMythic, sem inventar id", () => {
    const origin = deriveMythicOrigin(makeEvents({ detail: "Item Mítico Nunca Registrado" }), EXAMPLE_MYTHIC_REGISTRY, {});
    assert.equal(origin.isMythic, true);
    assert.equal(origin.mythicId, null);
    assert.equal(origin.displayName, "Item Mítico Nunca Registrado");
  });
});
