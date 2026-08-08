/**
 * Sprint 15 — Sockets + Gem System (Foundation). Testa só as funções
 * puras de `sockets.ts` — nenhuma dependência de banco/API.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MAX_SOCKETS } from "./types.js";
import { deriveSocketCountFromSeed, createSocketConfiguration, setSocketState, deriveSocketGroups, addSocketLink } from "./sockets.js";

describe("deriveSocketCountFromSeed", () => {
  test("nunca ultrapassa MAX_SOCKETS (6), nunca é negativo", () => {
    for (let seed = 0; seed < 2000; seed++) {
      const count = deriveSocketCountFromSeed(seed);
      assert.ok(count >= 0 && count <= MAX_SOCKETS, `seed ${seed} produziu ${count}`);
    }
  });

  test("determinístico: a mesma seed sempre produz a mesma contagem", () => {
    assert.equal(deriveSocketCountFromSeed(12345), deriveSocketCountFromSeed(12345));
  });

  test("todas as 7 contagens (0-6) aparecem em amostra suficiente — distribuição não degenerada", () => {
    const seen = new Set<number>();
    for (let seed = 0; seed < 5000; seed++) seen.add(deriveSocketCountFromSeed(seed));
    for (let n = 0; n <= MAX_SOCKETS; n++) {
      assert.ok(seen.has(n), `esperava ver a contagem ${n} em 5000 seeds`);
    }
  });
});

describe("createSocketConfiguration", () => {
  test("cria exatamente `count` Sockets, todos 'empty', sem links", () => {
    const config = createSocketConfiguration(4, 999);
    assert.equal(config.sockets.length, 4);
    assert.ok(config.sockets.every((s) => s.state === "empty"));
    assert.deepEqual(config.links, []);
  });

  test("0 Sockets produz uma configuração vazia válida (não um erro)", () => {
    const config = createSocketConfiguration(0, 1);
    assert.deepEqual(config.sockets, []);
  });

  test("nunca cria mais que MAX_SOCKETS mesmo se `count` pedir mais", () => {
    const config = createSocketConfiguration(99, 1);
    assert.equal(config.sockets.length, MAX_SOCKETS);
  });

  test("determinístico: a mesma seed produz sempre a mesma cor/forma por Socket", () => {
    const a = createSocketConfiguration(6, 42);
    const b = createSocketConfiguration(6, 42);
    assert.deepEqual(a, b);
  });

  test("ids dos Sockets são únicos e estáveis (socket-1, socket-2...)", () => {
    const config = createSocketConfiguration(3, 7);
    assert.deepEqual(
      config.sockets.map((s) => s.id),
      ["socket-1", "socket-2", "socket-3"],
    );
  });
});

describe("setSocketState", () => {
  test("muda o estado de um Socket específico, nunca muta a configuração recebida", () => {
    const original = createSocketConfiguration(2, 1);
    const updated = setSocketState(original, "socket-1", "filled");
    assert.equal(original.sockets[0]!.state, "empty");
    assert.equal(updated.sockets[0]!.state, "filled");
    assert.equal(updated.sockets[1]!.state, "empty");
  });

  test("um id inexistente é um no-op silencioso (nenhum Socket muda)", () => {
    const original = createSocketConfiguration(2, 1);
    const updated = setSocketState(original, "socket-99", "filled");
    assert.deepEqual(updated, original);
  });
});

describe("deriveSocketGroups (Fase 5)", () => {
  test("sem nenhum link, cada Socket é seu próprio grupo de 1", () => {
    const config = createSocketConfiguration(3, 1);
    const groups = deriveSocketGroups(config).map((g) => g.sort());
    assert.equal(groups.length, 3);
    assert.ok(groups.every((g) => g.length === 1));
  });

  test("dois Sockets linkados formam um único grupo de 2", () => {
    let config = createSocketConfiguration(3, 1);
    config = addSocketLink(config, "socket-1", "socket-2");
    const groups = deriveSocketGroups(config).map((g) => g.sort());
    assert.equal(groups.length, 2);
    assert.ok(groups.some((g) => g.length === 2 && g.includes("socket-1") && g.includes("socket-2")));
  });

  test("links transitivos (1-2, 2-3) formam UM grupo de 3, não dois grupos de 2", () => {
    let config = createSocketConfiguration(3, 1);
    config = addSocketLink(config, "socket-1", "socket-2");
    config = addSocketLink(config, "socket-2", "socket-3");
    const groups = deriveSocketGroups(config);
    assert.equal(groups.length, 1);
    assert.equal(groups[0]!.length, 3);
  });

  test("nunca persiste um segundo dado em paralelo — grupos sempre recalculados de `links`", () => {
    let config = createSocketConfiguration(2, 1);
    config = addSocketLink(config, "socket-1", "socket-2");
    const groupsA = deriveSocketGroups(config);
    const groupsB = deriveSocketGroups(config);
    assert.deepEqual(groupsA, groupsB);
  });
});

describe("addSocketLink", () => {
  test("nunca duplica o mesmo par, em qualquer ordem", () => {
    let config = createSocketConfiguration(2, 1);
    config = addSocketLink(config, "socket-1", "socket-2");
    const before = config.links.length;
    config = addSocketLink(config, "socket-2", "socket-1");
    assert.equal(config.links.length, before);
  });
});
