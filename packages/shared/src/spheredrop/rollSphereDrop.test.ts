/**
 * Sprint 13 — Sphere Economy Phase I (World Distribution). Testa só a
 * função pura `rollSphereDrop()` + a tabela padrão — nenhuma dependência
 * de Adventure/Dungeon/API aqui (esses ficam em adventure.test.ts/
 * presentation.test.ts, que já testam o pipeline completo).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSeededRandom } from "../itemgen/rng.js";
import { rollSphereDrop } from "./rollSphereDrop.js";
import { DEFAULT_SPHERE_DROP_TABLE } from "./sphereDropTable.js";
import type { SphereTable } from "./types.js";

describe("Sphere Economy Phase I — rollSphereDrop", () => {
  it("dropChance 0 nunca produz uma Esfera, não importa o rng", () => {
    const table: SphereTable = {
      ...DEFAULT_SPHERE_DROP_TABLE,
      adventure: { source: "adventure", dropChance: 0, weights: [{ sphereId: "fortune", weight: 1 }] },
    };
    for (let i = 0; i < 50; i++) {
      const result = rollSphereDrop("adventure", () => 0, table);
      assert.equal(result.sphereId, null);
    }
  });

  it("dropChance 1 sempre produz uma Esfera do pool", () => {
    const table: SphereTable = {
      ...DEFAULT_SPHERE_DROP_TABLE,
      adventure: { source: "adventure", dropChance: 1, weights: [{ sphereId: "fortune", weight: 1 }] },
    };
    const result = rollSphereDrop("adventure", () => 0, table);
    assert.equal(result.sphereId, "fortune");
  });

  it("uma fonte com weights vazio nunca dropa, mesmo com dropChance 1", () => {
    const table: SphereTable = { ...DEFAULT_SPHERE_DROP_TABLE, adventure: { source: "adventure", dropChance: 1, weights: [] } };
    const result = rollSphereDrop("adventure", () => 0, table);
    assert.equal(result.sphereId, null);
  });

  it("um sphereId ausente do pool (weight 0 ou omitido) nunca é sorteado — Adventure nunca dropa Maldição/Ascensão (Fase 3)", () => {
    const rng = createSeededRandom(777);
    for (let i = 0; i < 5000; i++) {
      const result = rollSphereDrop("adventure", rng);
      assert.notEqual(result.sphereId, "curse");
      assert.notEqual(result.sphereId, "ascension");
    }
  });

  it("Dungeon pode dropar Ascensão, mas nunca Maldição (Fase 4)", () => {
    const rng = createSeededRandom(321);
    let sawAscension = false;
    for (let i = 0; i < 5000; i++) {
      const result = rollSphereDrop("dungeon", rng);
      assert.notEqual(result.sphereId, "curse");
      if (result.sphereId === "ascension") sawAscension = true;
    }
    assert.ok(sawAscension, "esperava ao menos uma Ascensão em 5000 rolagens de Dungeon");
  });

  it("World Boss é a única fonte com chance significativa de Maldição (Fase 6)", () => {
    const rng = createSeededRandom(999);
    let sawCurse = false;
    for (let i = 0; i < 2000; i++) {
      const result = rollSphereDrop("world_boss", rng);
      if (result.sphereId === "curse") sawCurse = true;
    }
    assert.ok(sawCurse, "esperava ao menos uma Maldição em 2000 rolagens de World Boss");
  });

  it("determinístico: a mesma sequência de rng sempre produz o mesmo resultado", () => {
    const rngA = createSeededRandom(42);
    const rngB = createSeededRandom(42);
    const resultsA = Array.from({ length: 100 }, () => rollSphereDrop("boss", rngA));
    const resultsB = Array.from({ length: 100 }, () => rollSphereDrop("boss", rngB));
    assert.deepEqual(resultsA, resultsB);
  });

  it("todas as 4 fontes originais da tabela padrão existem e têm dropChance > 0", () => {
    for (const source of ["adventure", "dungeon", "boss", "world_boss"] as const) {
      const pool = DEFAULT_SPHERE_DROP_TABLE[source];
      assert.ok(pool, `esperava um pool pra fonte ${source}`);
      assert.ok(pool.dropChance > 0, `esperava dropChance > 0 pra fonte ${source}`);
      assert.ok(pool.weights.length > 0, `esperava ao menos 1 peso pra fonte ${source}`);
    }
  });
});

describe("Sprint 24 — Economy Foundation II: novas fontes (world_event/future_raid) inertes", () => {
  it("world_event e future_raid existem na tabela padrão, mas nunca dropam Esfera nenhuma", () => {
    for (const source of ["world_event", "future_raid"] as const) {
      const pool = DEFAULT_SPHERE_DROP_TABLE[source];
      assert.ok(pool, `esperava um pool pra fonte ${source}`);
      assert.equal(pool.dropChance, 0);
      assert.deepEqual(pool.weights, []);
    }
  });

  it("rollSphereDrop nunca produz Esfera pras 2 fontes novas, mesmo com rng sempre 0 (o caso mais generoso)", () => {
    for (const source of ["world_event", "future_raid"] as const) {
      for (let i = 0; i < 50; i++) {
        const result = rollSphereDrop(source, () => 0);
        assert.equal(result.sphereId, null);
      }
    }
  });

  it("nenhuma das 4 fontes originais mudou de comportamento com a extensão do tipo (mesmo resultado determinístico de antes)", () => {
    const rng = createSeededRandom(42);
    const results = Array.from({ length: 200 }, () => rollSphereDrop("boss", rng));
    const sphereIds = results.map((r) => r.sphereId);
    assert.ok(sphereIds.some((id) => id !== null), "esperava ao menos alguma Esfera em 200 rolagens de boss");
    assert.ok(sphereIds.every((id) => id === null || ["fortune", "purification", "lapidation", "ascension", "curse"].includes(id)));
  });
});

describe("Sprint 24 — SphereWeight: campos de gating são infraestrutura pura (nunca lidos por rollSphereDrop)", () => {
  it("uma entrada com minimumLevel/minimumZone/minimumBossTier/futureSeason definidos continua sorteável normalmente — os campos não bloqueiam nada ainda", () => {
    const table: SphereTable = {
      ...DEFAULT_SPHERE_DROP_TABLE,
      adventure: {
        source: "adventure",
        dropChance: 1,
        weights: [{ sphereId: "fortune", weight: 1, minimumLevel: 999, minimumZone: "regiao-inexistente", minimumBossTier: 99, futureSeason: "temporada-inexistente" }],
      },
    };
    const result = rollSphereDrop("adventure", () => 0, table);
    assert.equal(result.sphereId, "fortune", "os campos de gating são infraestrutura — nenhum deles é lido ainda, então nunca impedem o sorteio");
  });

  it("nenhuma entrada real de DEFAULT_SPHERE_DROP_TABLE define os campos de gating novos — zero mudança de comportamento hoje", () => {
    for (const pool of Object.values(DEFAULT_SPHERE_DROP_TABLE)) {
      for (const weight of pool.weights) {
        assert.equal(weight.minimumLevel, undefined);
        assert.equal(weight.minimumZone, undefined);
        assert.equal(weight.minimumBossTier, undefined);
        assert.equal(weight.futureSeason, undefined);
      }
    }
  });
});
