import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { generateItem } from "../itemgen/generator.js";
import { createSeededRandom } from "../itemgen/rng.js";
import type { ItemGenGeneratedItem } from "../itemgen/types.js";
import { createDefaultQuality } from "../itemization/types.js";
import { rerollAffixValues, removeRandomAffix, addRandomAffix, increaseQuality } from "./sphereCrafting.js";

// "sword" (itemgen/baseItems.ts) sempre tem tags físicas — usado em
// itemLevel alto (60) pra garantir prefixos/sufixos reais na maioria
// das seeds, evitando um item vazio de afixos em qualquer teste que
// dependa de ter pelo menos 1.
function findGeneratedItemWithAffixes(): ItemGenGeneratedItem {
  for (let seed = 1; seed < 200; seed++) {
    const item = generateItem("sword", 60, seed);
    if (item.prefixes.length + item.suffixes.length > 0) return item;
  }
  throw new Error("nenhuma seed testada produziu afixos — dados do Item Generator mudaram?");
}

describe("rerollAffixValues (Esfera da Fortuna)", () => {
  test("mantém modId/type/group/name/statLabel/tags/tier de cada afixo, só troca o value", () => {
    const item = findGeneratedItemWithAffixes();
    const affixes = [...item.prefixes, ...item.suffixes];
    const rng = createSeededRandom(999);

    const rerolled = rerollAffixValues(affixes, item.itemLevel, rng);

    assert.equal(rerolled.length, affixes.length);
    for (let i = 0; i < affixes.length; i++) {
      assert.equal(rerolled[i]!.modId, affixes[i]!.modId);
      assert.equal(rerolled[i]!.type, affixes[i]!.type);
      assert.equal(rerolled[i]!.group, affixes[i]!.group);
      assert.equal(rerolled[i]!.name, affixes[i]!.name);
      assert.equal(rerolled[i]!.statLabel, affixes[i]!.statLabel);
      assert.deepEqual(rerolled[i]!.tags, affixes[i]!.tags);
      assert.equal(rerolled[i]!.tier, affixes[i]!.tier);
    }
  });

  test("determinístico: o mesmo rng produz sempre o mesmo resultado", () => {
    const item = findGeneratedItemWithAffixes();
    const affixes = [...item.prefixes, ...item.suffixes];
    const first = rerollAffixValues(affixes, item.itemLevel, createSeededRandom(42));
    const second = rerollAffixValues(affixes, item.itemLevel, createSeededRandom(42));
    assert.deepEqual(first, second);
  });

  test("afixo com modId desconhecido é deixado intacto (defensivo, nunca inventa um valor)", () => {
    const fakeAffix = { modId: "nao-existe", type: "prefix" as const, group: "x", name: "X", statLabel: "X", tags: [], tier: 1, value: 5 };
    const rerolled = rerollAffixValues([fakeAffix], 60, createSeededRandom(1));
    assert.deepEqual(rerolled, [fakeAffix]);
  });

  test("lista vazia devolve lista vazia", () => {
    assert.deepEqual(rerollAffixValues([], 60, createSeededRandom(1)), []);
  });
});

describe("removeRandomAffix (Esfera da Purificação)", () => {
  test("remove exatamente 1 afixo, nunca mais que isso", () => {
    const item = findGeneratedItemWithAffixes();
    const affixes = [...item.prefixes, ...item.suffixes];
    const result = removeRandomAffix(affixes, createSeededRandom(7));
    assert.equal(result.affixes.length, affixes.length - 1);
    assert.ok(result.removed);
  });

  test("o afixo removido não aparece mais na lista resultante", () => {
    const item = findGeneratedItemWithAffixes();
    const affixes = [...item.prefixes, ...item.suffixes];
    const result = removeRandomAffix(affixes, createSeededRandom(7));
    assert.ok(!result.affixes.some((a) => a.modId === result.removed!.modId && a === result.removed));
  });

  test("lista vazia: removed é null, nada muda", () => {
    const result = removeRandomAffix([], createSeededRandom(1));
    assert.equal(result.removed, null);
    assert.deepEqual(result.affixes, []);
  });
});

describe("addRandomAffix (Esfera da Ascensão)", () => {
  test("adiciona exatamente 1 afixo elegível, respeitando grupo/exclusão do Item Generator", () => {
    const item = generateItem("sword", 60, 5);
    const existing = [...item.prefixes, ...item.suffixes];
    const result = addRandomAffix("sword", existing, item.itemLevel, createSeededRandom(3));
    if (result.added) {
      assert.equal(result.affixes.length, existing.length + 1);
      const groups = result.affixes.map((a) => a.group);
      assert.equal(new Set(groups).size, groups.length, "nenhum grupo duplicado após adicionar");
    } else {
      assert.deepEqual(result.affixes, existing);
    }
  });

  test("baseItemId desconhecido devolve added: null, nunca lança erro", () => {
    const result = addRandomAffix("item-que-nao-existe", [], 60, createSeededRandom(1));
    assert.equal(result.added, null);
    assert.deepEqual(result.affixes, []);
  });

  test("determinístico: mesmo rng produz sempre o mesmo afixo adicionado", () => {
    const item = generateItem("sword", 60, 5);
    const existing = [...item.prefixes, ...item.suffixes];
    const first = addRandomAffix("sword", existing, item.itemLevel, createSeededRandom(11));
    const second = addRandomAffix("sword", existing, item.itemLevel, createSeededRandom(11));
    assert.deepEqual(first, second);
  });
});

describe("increaseQuality (Esfera da Lapidação)", () => {
  test("incrementa value entre 1 e 3, nunca altera scalesAttribute", () => {
    const quality = createDefaultQuality();
    const result = increaseQuality(quality, createSeededRandom(1));
    assert.ok(result.value >= 1 && result.value <= 3);
    assert.equal(result.scalesAttribute, quality.scalesAttribute);
  });

  test("nunca ultrapassa 20 (teto documentado)", () => {
    const quality = { value: 19, scalesAttribute: "" };
    const result = increaseQuality(quality, createSeededRandom(1));
    assert.ok(result.value <= 20);
  });

  test("nunca muta o objeto recebido", () => {
    const quality = createDefaultQuality();
    increaseQuality(quality, createSeededRandom(1));
    assert.equal(quality.value, 0);
  });
});
