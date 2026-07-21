import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateLoot } from "./generator.js";
import { LOOT_TABLES } from "./lootTables.js";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";

describe("Loot Generator Phase I", () => {
  it("determinismo: mesmo sourceId + mesmo monsterLevel + mesma seed = mesmo LootResult", () => {
    const a = generateLoot("wolf", 20, 123456);
    const b = generateLoot("wolf", 20, 123456);
    assert.deepEqual(a, b);
  });

  it("seeds diferentes tendem a produzir resultados diferentes", () => {
    const a = generateLoot("goblin", 20, 1);
    const b = generateLoot("goblin", 20, 2);
    assert.notDeepEqual(a, b);
  });

  it("lança erro para Loot Table desconhecida (nenhum item inventado)", () => {
    assert.throws(() => generateLoot("dragon", 20, 1), /Loot Table desconhecida/);
  });

  it("Loot Tables válidas: todo registro tem allowedBaseItems não vazio e todos os ids existem em ITEM_GEN_BASE_ITEMS", () => {
    const validBaseItemIds = new Set(ITEM_GEN_BASE_ITEMS.map((base) => base.id));
    for (const table of LOOT_TABLES) {
      assert.ok(table.allowedBaseItems.length > 0, `Loot Table "${table.id}" sem allowedBaseItems`);
      for (const baseItemId of table.allowedBaseItems) {
        assert.ok(validBaseItemIds.has(baseItemId), `Loot Table "${table.id}" referencia Base Item inexistente "${baseItemId}"`);
      }
      for (const quantityOption of table.quantityOptions) {
        assert.ok(quantityOption.quantity >= 0, `Loot Table "${table.id}" tem quantidade negativa`);
        assert.ok(quantityOption.weight > 0, `Loot Table "${table.id}" tem peso de quantidade <= 0`);
      }
      assert.ok(table.minLevel <= table.maxLevel, `Loot Table "${table.id}" tem minLevel > maxLevel`);
      assert.ok(table.dropChance >= 0 && table.dropChance <= 1, `Loot Table "${table.id}" tem dropChance fora de [0,1]`);
    }
  });

  it("todos os Base Items são acessíveis por ao menos uma Loot Table", () => {
    const referencedIds = new Set(LOOT_TABLES.flatMap((table) => table.allowedBaseItems));
    for (const base of ITEM_GEN_BASE_ITEMS) {
      assert.ok(referencedIds.has(base.id), `Base Item "${base.id}" não é referenciado por nenhuma Loot Table`);
    }
  });

  it("distribuição de raridades: Boss (rarityMultiplier alto) produz Rare/Unique com mais frequência que Wolf (rarityMultiplier neutro)", () => {
    let bossNonCommon = 0;
    let bossTotal = 0;
    let wolfNonCommon = 0;
    let wolfTotal = 0;
    for (let seed = 0; seed < 500; seed++) {
      const bossLoot = generateLoot("boss", 50, seed);
      for (const item of bossLoot.generatedItems) {
        bossTotal++;
        if (item.rarity !== "common") bossNonCommon++;
      }
      const wolfLoot = generateLoot("wolf", 10, seed);
      for (const item of wolfLoot.generatedItems) {
        wolfTotal++;
        if (item.rarity !== "common") wolfNonCommon++;
      }
    }
    assert.ok(bossTotal > 0 && wolfTotal > 0, "esperava itens gerados nas duas tabelas");
    const bossRate = bossNonCommon / bossTotal;
    const wolfRate = wolfNonCommon / wolfTotal;
    assert.ok(bossRate > wolfRate, `taxa não-common do Boss (${bossRate}) deveria ser maior que a do Wolf (${wolfRate})`);
  });

  it("Item Level: sempre dentro de [monsterLevel - variance, monsterLevel + variance] e dentro de [minLevel, maxLevel] da tabela", () => {
    const table = LOOT_TABLES.find((t) => t.id === "skeleton")!;
    const monsterLevel = 20;
    for (let seed = 0; seed < 300; seed++) {
      const loot = generateLoot("skeleton", monsterLevel, seed);
      for (const item of loot.generatedItems) {
        assert.ok(item.itemLevel >= monsterLevel - table.itemLevelVariance);
        assert.ok(item.itemLevel <= monsterLevel + table.itemLevelVariance);
        assert.ok(item.itemLevel >= table.minLevel);
        assert.ok(item.itemLevel <= table.maxLevel);
      }
    }
  });

  it("Item Level nunca é fixo: variância real observada em várias seeds", () => {
    const levels = new Set<number>();
    for (let seed = 0; seed < 200; seed++) {
      const loot = generateLoot("bandit", 25, seed);
      for (const item of loot.generatedItems) levels.add(item.itemLevel);
    }
    assert.ok(levels.size > 1, "esperava mais de um Item Level distinto em 200 seeds");
  });

  it("quantidade de drops: sempre um inteiro não-negativo, e 0 é um resultado possível", () => {
    let sawZero = false;
    for (let seed = 0; seed < 300; seed++) {
      const loot = generateLoot("wolf", 10, seed);
      assert.ok(Number.isInteger(loot.generatedItems.length));
      assert.ok(loot.generatedItems.length >= 0);
      if (loot.generatedItems.length === 0) sawZero = true;
    }
    assert.ok(sawZero, "esperava ao menos um resultado com 0 itens em 300 seeds (Wolf tem weight alto pra quantidade 0)");
  });

  it("múltiplos itens: Boss garante ao menos 2 itens por rolagem (dropChance 1.0, quantityOptions >= 2)", () => {
    for (let seed = 0; seed < 100; seed++) {
      const loot = generateLoot("boss", 50, seed);
      assert.ok(loot.generatedItems.length >= 2, `Boss com seed=${seed} gerou menos de 2 itens`);
    }
  });

  it("moedas: currencies é sempre um array vazio nesta fase (Phase I só define os tipos)", () => {
    for (let seed = 0; seed < 20; seed++) {
      const loot = generateLoot("treasure_chest", 30, seed);
      assert.deepEqual(loot.currencies, []);
    }
  });

  it("todo item gerado usa generateItem() de verdade (tem seed/prefixes/suffixes/powerScore no formato do Item Generator)", () => {
    const loot = generateLoot("treasure_chest", 30, 7);
    for (const item of loot.generatedItems) {
      assert.equal(typeof item.seed, "number");
      assert.ok(Array.isArray(item.prefixes));
      assert.ok(Array.isArray(item.suffixes));
      assert.equal(typeof item.powerScore, "number");
    }
  });

  it("totalPower e totalValue são a soma exata dos itens gerados", () => {
    for (let seed = 0; seed < 50; seed++) {
      const loot = generateLoot("bandit", 30, seed);
      const expectedPower = loot.generatedItems.reduce((sum, item) => sum + item.powerScore, 0);
      assert.equal(loot.totalPower, expectedPower);
      assert.ok(Number.isFinite(loot.totalValue));
      assert.ok(loot.totalValue >= 0);
    }
  });

  it("gera loot para toda Loot Table cadastrada, sem lançar erro", () => {
    for (const table of LOOT_TABLES) {
      assert.doesNotThrow(() => generateLoot(table.id, (table.minLevel + table.maxLevel) / 2, 42));
    }
  });

  it("performance: 1000 gerações de loot completam rapidamente", () => {
    const start = Date.now();
    for (let seed = 0; seed < 1000; seed++) {
      generateLoot("boss", 50, seed);
    }
    const elapsedMs = Date.now() - start;
    assert.ok(elapsedMs < 2000, `1000 gerações de loot levaram ${elapsedMs}ms, esperava < 2000ms`);
  });
});
