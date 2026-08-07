import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateWaystone } from "./generator.js";
import { listMapDefinitions } from "../worldmap/mapRegistry.js";

// Sprint 37 — Waystones Phase I. Fase 8: cobertura de "Waystone
// Generator" e "Waystone Registry" (a integração com o Map Registry
// real, worldmap/mapRegistry.ts, Sprint 30 — nenhum catálogo próprio
// foi criado).

describe("generateWaystone() (Fase 3) — determinístico, puro", () => {
  it("mesma seed sempre produz o mesmo WaystoneInstance", () => {
    const a = generateWaystone(555);
    const b = generateWaystone(555);
    assert.deepEqual(a, b);
  });

  it("seeds diferentes produzem WaystoneInstance tipicamente diferentes (amostra de 30)", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      seen.add(generateWaystone(seed).instanceId);
    }
    assert.ok(seen.size > 1, "esperava mais de 1 WaystoneInstance distinta em 30 seeds");
  });

  it("nunca produz rarity 'unique' (mesma decisão de escopo de generateRareMap(), Sprint 34)", () => {
    for (let seed = 1; seed <= 100; seed++) {
      assert.notEqual(generateWaystone(seed).rarity, "unique");
    }
  });

  it("tier sempre entre 1 e 3", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const tier = generateWaystone(seed).tier;
      assert.ok(tier >= 1 && tier <= 3);
    }
  });

  it("instanceId é sempre único e diferente da instanceId de um RareMap gerado com a mesma seed", () => {
    const waystone = generateWaystone(42);
    assert.ok(waystone.instanceId.startsWith("waystone-"));
  });
});

describe("Waystone Registry (Fase 8) — mapId sempre um MapDefinition real, nenhum catálogo próprio", () => {
  it("mapId gerado é sempre um dos 9 Mapas reais de listMapDefinitions()", () => {
    const realIds = new Set(listMapDefinitions().map((m) => m.id));
    for (let seed = 1; seed <= 100; seed++) {
      const waystone = generateWaystone(seed);
      assert.ok(realIds.has(waystone.mapId), `mapId "${waystone.mapId}" deveria ser um Mapa real`);
    }
  });

  it("options.mapId força o Mapa exato quando fornecido", () => {
    const waystone = generateWaystone(1, { mapId: "fortaleza-sombria" });
    assert.equal(waystone.mapId, "fortaleza-sombria");
  });

  it("lança erro claro para um mapId desconhecido — nunca inventa um Mapa", () => {
    assert.throws(() => generateWaystone(1, { mapId: "mapa-que-nao-existe" }));
  });

  it("options.rarity/options.tier forçam exatamente o valor pedido", () => {
    const waystone = generateWaystone(1, { rarity: "rare", tier: 3 });
    assert.equal(waystone.rarity, "rare");
    assert.equal(waystone.tier, 3);
  });
});
