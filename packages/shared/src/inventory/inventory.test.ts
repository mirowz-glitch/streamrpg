import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Inventory } from "./inventory.js";
import { validateGeneratedItem } from "./validation.js";
import { generateItem } from "../itemgen/generator.js";
import type { ItemGenGeneratedItem } from "../itemgen/types.js";

function realItem(seed = 1): ItemGenGeneratedItem {
  return generateItem("sword", 40, seed);
}

describe("Inventory System Phase I", () => {
  describe("addItem", () => {
    it("adiciona um item válido no primeiro slot livre e devolve success com o slotIndex", () => {
      const inventory = new Inventory("char-1", 5);
      const result = inventory.addItem("drop-1", realItem());
      assert.deepEqual(result, { success: true, slotIndex: 0 });
      assert.equal(inventory.getItem(0)?.baseItemId, "sword");
    });

    it("preenche sempre o menor índice livre disponível (determinismo)", () => {
      const inventory = new Inventory("char-1", 5);
      inventory.addItem("drop-1", realItem(1));
      inventory.addItem("drop-2", realItem(2));
      inventory.addItem("drop-3", realItem(3));
      inventory.removeItem("drop-2"); // libera o slot 1
      const result = inventory.addItem("drop-4", realItem(4));
      assert.equal(result.success, true);
      assert.equal((result as { slotIndex: number }).slotIndex, 1);
    });

    it("incrementa version a cada addItem bem-sucedido", () => {
      const inventory = new Inventory("char-1", 5);
      assert.equal(inventory.version, 0);
      inventory.addItem("drop-1", realItem());
      assert.equal(inventory.version, 1);
    });

    it("rejeita instanceId inválido (vazio) sem alterar o inventário", () => {
      const inventory = new Inventory("char-1", 5);
      const result = inventory.addItem("", realItem());
      assert.deepEqual(result, { success: false, reason: "invalid_instance_id" });
      assert.equal(inventory.version, 0);
    });

    it("rejeita item duplicado (mesmo instanceId duas vezes)", () => {
      const inventory = new Inventory("char-1", 5);
      inventory.addItem("drop-1", realItem());
      const result = inventory.addItem("drop-1", realItem(2));
      assert.deepEqual(result, { success: false, reason: "duplicate_instance_id" });
    });

    it("rejeita item com Base Item inexistente", () => {
      const inventory = new Inventory("char-1", 5);
      const invalid = { ...realItem(), baseItemId: "excalibur" };
      const result = inventory.addItem("drop-1", invalid);
      assert.deepEqual(result, { success: false, reason: "invalid_base_item" });
    });

    it("rejeita item com Power Score inválido (negativo)", () => {
      const inventory = new Inventory("char-1", 5);
      const invalid = { ...realItem(), powerScore: -5 };
      const result = inventory.addItem("drop-1", invalid);
      assert.deepEqual(result, { success: false, reason: "invalid_power_score" });
    });

    it("rejeita item com prefixo inexistente", () => {
      const inventory = new Inventory("char-1", 5);
      const base = realItem();
      const fakePrefix = {
        modId: "prefix_does_not_exist",
        type: "prefix",
        group: "fake",
        name: "Fake",
        statLabel: "Fake Stat",
        tags: [],
        tier: 1,
        value: 1,
      };
      const invalid = { ...base, prefixes: [fakePrefix as any] };
      const result = inventory.addItem("drop-1", invalid);
      assert.deepEqual(result, { success: false, reason: "invalid_prefix" });
    });

    it("rejeita item com sufixo inexistente", () => {
      const inventory = new Inventory("char-1", 5);
      const base = realItem();
      const invalid = { ...base, suffixes: [{ modId: "suffix_does_not_exist", type: "suffix", group: "x", name: "x", statLabel: "x", tags: [], tier: 1, value: 1 } as any] };
      const result = inventory.addItem("drop-1", invalid);
      assert.deepEqual(result, { success: false, reason: "invalid_suffix" });
    });

    it("rejeita item com seed inválida (NaN)", () => {
      const inventory = new Inventory("char-1", 5);
      const invalid = { ...realItem(), seed: NaN };
      const result = inventory.addItem("drop-1", invalid);
      assert.deepEqual(result, { success: false, reason: "invalid_seed" });
    });

    it("inventário cheio: recusa novo item quando não há slot livre", () => {
      const inventory = new Inventory("char-1", 2);
      inventory.addItem("drop-1", realItem(1));
      inventory.addItem("drop-2", realItem(2));
      const result = inventory.addItem("drop-3", realItem(3));
      assert.deepEqual(result, { success: false, reason: "inventory_full" });
    });

    it("inventário de capacidade 0 nunca aceita nenhum item", () => {
      const inventory = new Inventory("char-1", 0);
      const result = inventory.addItem("drop-1", realItem());
      assert.deepEqual(result, { success: false, reason: "inventory_full" });
    });
  });

  describe("removeItem", () => {
    it("remove um item existente e devolve success + o item removido", () => {
      const inventory = new Inventory("char-1", 5);
      const item = realItem();
      inventory.addItem("drop-1", item);
      const result = inventory.removeItem("drop-1");
      assert.equal(result.success, true);
      assert.deepEqual((result as { removedItem: ItemGenGeneratedItem }).removedItem, item);
      assert.equal(inventory.getItem(0), null);
    });

    it("devolve failure para instanceId inexistente, sem lançar exceção", () => {
      const inventory = new Inventory("char-1", 5);
      assert.doesNotThrow(() => {
        const result = inventory.removeItem("nao-existe");
        assert.deepEqual(result, { success: false, reason: "not_found" });
      });
    });

    it("remover um item nunca apaga ou desloca outro slot", () => {
      const inventory = new Inventory("char-1", 5);
      inventory.addItem("drop-1", realItem(1));
      inventory.addItem("drop-2", realItem(2));
      inventory.addItem("drop-3", realItem(3));
      inventory.removeItem("drop-2");
      assert.notEqual(inventory.getItem(0), null);
      assert.equal(inventory.getItem(1), null);
      assert.notEqual(inventory.getItem(2), null);
      assert.equal(inventory.findById("drop-1")?.slotIndex, 0);
      assert.equal(inventory.findById("drop-3")?.slotIndex, 2);
    });

    it("incrementa version a cada removeItem bem-sucedido, mas não em falha", () => {
      const inventory = new Inventory("char-1", 5);
      inventory.addItem("drop-1", realItem());
      const versionAfterAdd = inventory.version;
      inventory.removeItem("nao-existe");
      assert.equal(inventory.version, versionAfterAdd);
      inventory.removeItem("drop-1");
      assert.equal(inventory.version, versionAfterAdd + 1);
    });

    it("permite re-adicionar um item depois de removido (slot liberado de verdade)", () => {
      const inventory = new Inventory("char-1", 1);
      inventory.addItem("drop-1", realItem(1));
      assert.deepEqual(inventory.addItem("drop-2", realItem(2)), { success: false, reason: "inventory_full" });
      inventory.removeItem("drop-1");
      const result = inventory.addItem("drop-2", realItem(2));
      assert.equal(result.success, true);
    });
  });

  describe("busca", () => {
    it("getItem/findBySlot: acesso O(1) por posição, slot vazio devolve null", () => {
      const inventory = new Inventory("char-1", 3);
      inventory.addItem("drop-1", realItem());
      assert.notEqual(inventory.getItem(0), null);
      assert.equal(inventory.getItem(1), null);
      assert.equal(inventory.findBySlot(1)?.item, null);
      assert.equal(inventory.getItem(99), null, "posição fora do range devolve null, não lança");
    });

    it("findById: acesso O(1) por instanceId, inexistente devolve null", () => {
      const inventory = new Inventory("char-1", 3);
      inventory.addItem("drop-1", realItem());
      assert.equal(inventory.findById("drop-1")?.instanceId, "drop-1");
      assert.equal(inventory.findById("nao-existe"), null);
    });

    it("findItem: busca por predicado arbitrário (ex.: por raridade)", () => {
      const inventory = new Inventory("char-1", 10);
      for (let seed = 0; seed < 10; seed++) {
        inventory.addItem(`drop-${seed}`, realItem(seed));
      }
      const found = inventory.findItem((item) => item.rarity === "magic" || item.rarity === "rare" || item.rarity === "unique");
      // Não afirmamos que ache (depende da rolagem), só que a API funciona sem lançar e devolve slot+item coerentes quando acha.
      if (found) {
        assert.ok(found.item);
        assert.notEqual(found.item!.rarity, "common");
      }
    });
  });

  describe("expandCapacity", () => {
    it("aumenta a capacidade sem alterar os itens já existentes", () => {
      const inventory = new Inventory("char-1", 2);
      inventory.addItem("drop-1", realItem(1));
      inventory.addItem("drop-2", realItem(2));
      inventory.expandCapacity(3);
      assert.equal(inventory.capacity, 5);
      assert.notEqual(inventory.getItem(0), null);
      assert.notEqual(inventory.getItem(1), null);
      const result = inventory.addItem("drop-3", realItem(3));
      assert.equal(result.success, true);
      assert.equal((result as { slotIndex: number }).slotIndex, 2);
    });

    it("rejeita additionalSlots inválido", () => {
      const inventory = new Inventory("char-1", 2);
      assert.throws(() => inventory.expandCapacity(0));
      assert.throws(() => inventory.expandCapacity(-1));
      assert.throws(() => inventory.expandCapacity(1.5));
    });
  });

  describe("determinismo", () => {
    it("a mesma sequência de operações produz sempre o mesmo snapshot final", () => {
      function run(): unknown {
        const inventory = new Inventory("char-1", 5);
        inventory.addItem("drop-1", realItem(1));
        inventory.addItem("drop-2", realItem(2));
        inventory.removeItem("drop-1");
        inventory.addItem("drop-3", realItem(3));
        return inventory.toSnapshot();
      }
      assert.deepEqual(run(), run());
    });
  });

  describe("validação de integridade (validateGeneratedItem)", () => {
    it("aceita um item real gerado pelo Item Generator", () => {
      assert.equal(validateGeneratedItem(realItem()), null);
    });

    it("rejeita item level inválido (negativo)", () => {
      assert.equal(validateGeneratedItem({ ...realItem(), itemLevel: -1 }), "invalid_item_level");
    });

    it("rejeita raridade inexistente", () => {
      assert.equal(validateGeneratedItem({ ...realItem(), rarity: "mythic" as any }), "invalid_rarity");
    });
  });

  describe("performance", () => {
    it("1000 addItem + 1000 findById completam rapidamente num inventário grande", () => {
      const inventory = new Inventory("char-1", 1000);
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        inventory.addItem(`drop-${i}`, realItem(i));
      }
      for (let i = 0; i < 1000; i++) {
        inventory.findById(`drop-${i}`);
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 2000, `1000 addItem + 1000 findById levaram ${elapsedMs}ms, esperava < 2000ms`);
    });
  });
});
