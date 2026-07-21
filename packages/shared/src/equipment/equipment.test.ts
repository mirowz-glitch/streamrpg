import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Equipment } from "./equipment.js";
import { calculateCharacterStats } from "./stats.js";
import { Inventory } from "../inventory/inventory.js";
import { generateItem } from "../itemgen/generator.js";
import type { ItemGenGeneratedItem } from "../itemgen/types.js";

function sword(seed = 1, itemLevel = 60): ItemGenGeneratedItem {
  return generateItem("sword", itemLevel, seed);
}
function ring(seed = 1, itemLevel = 60): ItemGenGeneratedItem {
  return generateItem("ring", itemLevel, seed);
}
function helmet(seed = 1, itemLevel = 60): ItemGenGeneratedItem {
  return generateItem("helmet", itemLevel, seed);
}

function setup(capacity = 5) {
  const inventory = new Inventory("char-1", capacity);
  const equipment = new Equipment("char-1");
  return { inventory, equipment };
}

describe("Equipment System Phase I", () => {
  describe("equipar", () => {
    it("equipa um item válido do inventário no slot correto", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword());
      const result = equipment.equipItem(inventory, "weapon", "drop-1");
      assert.deepEqual(result, { success: true, equipmentSlotId: "weapon", previousItem: null });
      assert.equal(equipment.getEquippedItem("weapon")?.baseItemId, "sword");
    });

    it("remove o item do inventário ao equipar (não fica duplicado nos dois lugares)", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword());
      equipment.equipItem(inventory, "weapon", "drop-1");
      assert.equal(inventory.findById("drop-1"), null);
    });

    it("incrementa version a cada equipItem bem-sucedido", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword());
      assert.equal(equipment.version, 0);
      equipment.equipItem(inventory, "weapon", "drop-1");
      assert.equal(equipment.version, 1);
    });

    it("slot inválido: rejeita equipmentSlotId que não existe", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword());
      const result = equipment.equipItem(inventory, "cloak", "drop-1");
      assert.deepEqual(result, { success: false, reason: "invalid_slot" });
      assert.equal(inventory.findById("drop-1")?.item?.baseItemId, "sword", "item não deveria ter saído do inventário");
    });

    it("item inexistente no inventário: rejeita instanceId que não existe", () => {
      const { inventory, equipment } = setup();
      const result = equipment.equipItem(inventory, "weapon", "nao-existe");
      assert.deepEqual(result, { success: false, reason: "item_not_found" });
    });

    it("tipo errado: rejeita equipar uma espada no slot de Elmo", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword());
      const result = equipment.equipItem(inventory, "helmet", "drop-1");
      assert.deepEqual(result, { success: false, reason: "wrong_item_type" });
      assert.equal(inventory.findById("drop-1")?.item?.baseItemId, "sword", "item não deveria ter saído do inventário");
    });

    it("item inválido (Base Item inexistente): rejeita sem tocar no inventário", () => {
      // O Inventory já recusa item inválido no próprio addItem() (mesma
      // validateGeneratedItem()), então pra exercitar a checagem
      // PRÓPRIA do Equipment (defesa em profundidade, caso o item
      // chegue até aqui por algum outro caminho) simulamos um
      // findById() que devolve um item inválido sem passar pelo
      // addItem() normal.
      const { inventory, equipment } = setup();
      const invalid = { ...sword(), baseItemId: "excalibur" };
      inventory.findById = () => ({ slotIndex: 0, instanceId: "drop-1", item: invalid, quantity: 1 });
      const result = equipment.equipItem(inventory, "weapon", "drop-1");
      assert.deepEqual(result, { success: false, reason: "invalid_base_item" });
    });
  });

  describe("desequipar", () => {
    it("desequipa e devolve o item pro inventário", () => {
      const { inventory, equipment } = setup();
      const item = sword();
      inventory.addItem("drop-1", item);
      equipment.equipItem(inventory, "weapon", "drop-1");
      const result = equipment.unequipItem(inventory, "weapon");
      assert.equal(result.success, true);
      assert.deepEqual((result as { item: ItemGenGeneratedItem }).item, item);
      assert.equal(equipment.getEquippedItem("weapon"), null);
      assert.deepEqual(inventory.findById("drop-1")?.item, item);
    });

    it("slot inválido: rejeita equipmentSlotId que não existe", () => {
      const { equipment, inventory } = setup();
      const result = equipment.unequipItem(inventory, "cloak");
      assert.deepEqual(result, { success: false, reason: "invalid_slot" });
    });

    it("slot vazio: rejeita desequipar um slot sem nada", () => {
      const { inventory, equipment } = setup();
      const result = equipment.unequipItem(inventory, "weapon");
      assert.deepEqual(result, { success: false, reason: "empty_slot" });
    });

    it("inventário cheio: recusa desequipar e nunca perde o item (continua equipado)", () => {
      const inventory = new Inventory("char-1", 1);
      const equipment = new Equipment("char-1");
      inventory.addItem("drop-1", sword(1));
      equipment.equipItem(inventory, "weapon", "drop-1");
      // Inventory tem capacidade 1 e está vazio agora (o item foi pro
      // Equipment) — enche com outro item pra simular "sem espaço".
      inventory.addItem("drop-2", sword(2));
      const result = equipment.unequipItem(inventory, "weapon");
      assert.deepEqual(result, { success: false, reason: "inventory_full" });
      assert.notEqual(equipment.getEquippedItem("weapon"), null, "item deveria continuar equipado, nunca perdido");
    });

    it("incrementa version a cada unequipItem bem-sucedido, mas não em falha", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword());
      equipment.equipItem(inventory, "weapon", "drop-1");
      const versionAfterEquip = equipment.version;
      equipment.unequipItem(inventory, "cloak");
      assert.equal(equipment.version, versionAfterEquip);
      equipment.unequipItem(inventory, "weapon");
      assert.equal(equipment.version, versionAfterEquip + 1);
    });
  });

  describe("troca de arma", () => {
    it("equipar uma nova arma quando já existe uma equipada troca automaticamente, devolvendo a antiga pro inventário", () => {
      const { inventory, equipment } = setup();
      const swordA = sword(1);
      const swordB = sword(2);
      inventory.addItem("drop-a", swordA);
      inventory.addItem("drop-b", swordB);

      equipment.equipItem(inventory, "weapon", "drop-a");
      const result = equipment.equipItem(inventory, "weapon", "drop-b");

      assert.equal(result.success, true);
      assert.deepEqual((result as { previousItem: ItemGenGeneratedItem }).previousItem, swordA);
      assert.deepEqual(equipment.getEquippedItem("weapon"), swordB);
      assert.deepEqual(inventory.findById("drop-a")?.item, swordA, "a espada antiga deveria estar de volta no inventário");
      assert.equal(inventory.findById("drop-b"), null, "a espada nova não deveria mais estar no inventário");
    });

    it("a troca nunca perde nem duplica itens (inventário + equipamento somam sempre 2 espadas)", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-a", sword(1));
      inventory.addItem("drop-b", sword(2));
      equipment.equipItem(inventory, "weapon", "drop-a");
      equipment.equipItem(inventory, "weapon", "drop-b");

      const inventoryCount = inventory.items.filter((s) => s.item !== null).length;
      const equipmentCount = equipment.items.filter((s) => s.item !== null).length;
      assert.equal(inventoryCount + equipmentCount, 2);
    });
  });

  describe("dois anéis", () => {
    it("permite equipar dois anéis diferentes em Ring 1 e Ring 2 simultaneamente", () => {
      const { inventory, equipment } = setup();
      const ringA = ring(1);
      const ringB = ring(2);
      inventory.addItem("drop-a", ringA);
      inventory.addItem("drop-b", ringB);

      const resultA = equipment.equipItem(inventory, "ring1", "drop-a");
      const resultB = equipment.equipItem(inventory, "ring2", "drop-b");

      assert.equal(resultA.success, true);
      assert.equal(resultB.success, true);
      assert.deepEqual(equipment.getEquippedItem("ring1"), ringA);
      assert.deepEqual(equipment.getEquippedItem("ring2"), ringB);
    });

    it("desequipar um anel não afeta o outro", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-a", ring(1));
      inventory.addItem("drop-b", ring(2));
      equipment.equipItem(inventory, "ring1", "drop-a");
      equipment.equipItem(inventory, "ring2", "drop-b");

      equipment.unequipItem(inventory, "ring1");

      assert.equal(equipment.getEquippedItem("ring1"), null);
      assert.notEqual(equipment.getEquippedItem("ring2"), null);
    });
  });

  describe("stats corretos", () => {
    it("Equipment vazio produz CharacterStats zerado", () => {
      const { equipment } = setup();
      const stats = calculateCharacterStats(equipment);
      assert.deepEqual(stats, {
        life: 0,
        attack: 0,
        defense: 0,
        spellDamage: 0,
        critical: 0,
        accuracy: 0,
        attackSpeed: 0,
        lifeLeech: 0,
        resistances: { physical: 0, fire: 0, cold: 0, lightning: 0 },
        powerScore: 0,
      });
    });

    it("uma espada equipada soma o dano base (baseDamage) em attack e o baseAttackSpeed", () => {
      const { inventory, equipment } = setup();
      const item = sword(1, 1); // itemLevel baixo -> menos chance de mods, mais fácil isolar o base
      inventory.addItem("drop-1", item);
      equipment.equipItem(inventory, "weapon", "drop-1");
      const stats = calculateCharacterStats(equipment);
      const expectedBaseAttack = (8 + 14) / 2; // sword baseDamage min/max (itemgen/baseItems.ts)
      const modAttack = [...item.prefixes, ...item.suffixes]
        .filter((mod) => ["Physical Damage", "Fire Damage", "Cold Damage", "Lightning Damage"].includes(mod.statLabel))
        .reduce((sum, mod) => sum + mod.value, 0);
      assert.equal(stats.attack, expectedBaseAttack + modAttack);
      assert.equal(stats.attackSpeed, 1.2 + (modSum(item, "Attack Speed")));
    });

    it("um elmo equipado soma o baseDefense em defense", () => {
      const { inventory, equipment } = setup();
      const item = helmet(1, 1);
      inventory.addItem("drop-1", item);
      equipment.equipItem(inventory, "helmet", "drop-1");
      const stats = calculateCharacterStats(equipment);
      assert.equal(stats.defense, 12); // helmet baseDefense (itemgen/baseItems.ts)
    });

    it("mods de Life somam em stats.life; Strength (fora dos 10 stats pedidos) é ignorado", () => {
      const { inventory, equipment } = setup();
      let found = false;
      for (let seed = 0; seed < 200 && !found; seed++) {
        const item = generateItem("chest", 70, seed);
        const lifeMods = [...item.prefixes, ...item.suffixes].filter((mod) => mod.statLabel === "Life");
        if (lifeMods.length === 0) continue;
        found = true;
        const inv = new Inventory("char-life", 1);
        const eq = new Equipment("char-life");
        inv.addItem("drop", item);
        eq.equipItem(inv, "chest", "drop");
        const stats = calculateCharacterStats(eq);
        const expectedLife = lifeMods.reduce((sum, mod) => sum + mod.value, 0);
        assert.equal(stats.life, expectedLife);
      }
      assert.ok(found, "esperava achar ao menos um item com mod de Life em 200 seeds");
    });

    it("resistências ficam sempre zeradas (nenhum mod do Item Generator concede resistência ainda)", () => {
      const { inventory, equipment } = setup();
      inventory.addItem("drop-1", sword(1, 70));
      equipment.equipItem(inventory, "weapon", "drop-1");
      const stats = calculateCharacterStats(equipment);
      assert.deepEqual(stats.resistances, { physical: 0, fire: 0, cold: 0, lightning: 0 });
    });
  });

  describe("Power Score", () => {
    it("Character Stats powerScore é a soma exata do powerScore de cada item equipado", () => {
      const { inventory, equipment } = setup();
      const sw = sword(1, 60);
      const hlm = helmet(2, 60);
      inventory.addItem("drop-sword", sw);
      inventory.addItem("drop-helmet", hlm);
      equipment.equipItem(inventory, "weapon", "drop-sword");
      equipment.equipItem(inventory, "helmet", "drop-helmet");
      const stats = calculateCharacterStats(equipment);
      assert.equal(stats.powerScore, sw.powerScore + hlm.powerScore);
    });
  });

  describe("determinismo", () => {
    it("a mesma sequência de equip/unequip produz sempre o mesmo CharacterStats", () => {
      function run(): unknown {
        const inventory = new Inventory("char-1", 5);
        const equipment = new Equipment("char-1");
        inventory.addItem("drop-1", sword(10, 60));
        inventory.addItem("drop-2", helmet(20, 60));
        equipment.equipItem(inventory, "weapon", "drop-1");
        equipment.equipItem(inventory, "helmet", "drop-2");
        equipment.unequipItem(inventory, "helmet");
        equipment.equipItem(inventory, "helmet", "drop-2");
        return calculateCharacterStats(equipment);
      }
      assert.deepEqual(run(), run());
    });
  });
});

function modSum(item: ItemGenGeneratedItem, statLabel: string): number {
  return [...item.prefixes, ...item.suffixes]
    .filter((mod) => mod.statLabel === statLabel)
    .reduce((sum, mod) => sum + mod.value, 0);
}
