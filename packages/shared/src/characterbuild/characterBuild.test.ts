import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "./characterBuild.js";
import { CHARACTER_CLASSES, getCharacterClass } from "./classes.js";
import { computeBaseAttributes } from "./baseAttributes.js";
import { calculateDerivedAttributes } from "./derivedAttributes.js";
import { calculateFinalStats } from "./finalStats.js";
import { Equipment } from "../equipment/equipment.js";
import { Inventory } from "../inventory/inventory.js";
import { generateItem } from "../itemgen/generator.js";
import { getLevel, xpForLevel } from "../xp.js";

function xpForLevelTotal(level: number): number {
  let total = 0;
  for (let lvl = 1; lvl < level; lvl++) total += xpForLevel(lvl);
  return total;
}

describe("Character Build Phase I", () => {
  describe("todas as classes", () => {
    for (const classDef of CHARACTER_CLASSES) {
      it(`classe "${classDef.id}" tem 4 Base Attributes e cresce a cada nível`, () => {
        const build = new CharacterBuild("char-1", classDef.id, 0);
        const level1 = build.getBaseAttributes();
        assert.deepEqual(level1, classDef.startingAttributes);

        const build30 = new CharacterBuild("char-1", classDef.id, xpForLevelTotal(30));
        const level30 = build30.getBaseAttributes();
        assert.ok(level30.strength >= level1.strength);
        assert.ok(level30.dexterity >= level1.dexterity);
        assert.ok(level30.intelligence >= level1.intelligence);
        assert.ok(level30.vitality >= level1.vitality);
      });
    }

    it("rejeita classe desconhecida", () => {
      assert.throws(() => new CharacterBuild("char-1", "necromancer", 0), /classe desconhecida/);
    });
  });

  describe("progressão", () => {
    it("nível 1 (0 XP) usa exatamente os atributos iniciais da classe, sem nenhum crescimento", () => {
      const classDef = getCharacterClass("warrior")!;
      const attrs = computeBaseAttributes(classDef, 1);
      assert.deepEqual(attrs, classDef.startingAttributes);
    });

    it("addExperience aumenta o XP e pode subir o nível", () => {
      const build = new CharacterBuild("char-1", "warrior", 0);
      assert.equal(build.level, 1);
      build.addExperience(xpForLevelTotal(10));
      assert.equal(build.level, 10);
    });

    it("addExperience rejeita valores negativos, sem alterar o estado", () => {
      const build = new CharacterBuild("char-1", "warrior", 100);
      assert.throws(() => build.addExperience(-1));
      assert.equal(build.experience, 100);
    });

    it("incrementa version a cada addExperience bem-sucedido", () => {
      const build = new CharacterBuild("char-1", "warrior", 0);
      assert.equal(build.version, 0);
      build.addExperience(10);
      assert.equal(build.version, 1);
    });
  });

  describe("level up", () => {
    it("o nível do Character Build é sempre igual ao de getLevel() (xp.ts) para a mesma experience", () => {
      for (const xp of [0, 100, 5000, 50000, 200000]) {
        const build = new CharacterBuild("char-1", "mage", xp);
        assert.equal(build.level, getLevel(xp));
      }
    });

    it("subir de nível nunca reduz nenhum Base Attribute", () => {
      const build = new CharacterBuild("char-1", "ranger", 0);
      let previous = build.getBaseAttributes();
      for (let level = 2; level <= 30; level++) {
        build.experience = xpForLevelTotal(level);
        const current = build.getBaseAttributes();
        assert.ok(current.strength >= previous.strength);
        assert.ok(current.dexterity >= previous.dexterity);
        assert.ok(current.intelligence >= previous.intelligence);
        assert.ok(current.vitality >= previous.vitality);
        previous = current;
      }
    });
  });

  describe("derived stats", () => {
    it("calculateDerivedAttributes calcula os 10 stats a partir de Base Attributes", () => {
      const base = { strength: 10, dexterity: 10, intelligence: 10, vitality: 10 };
      const derived = calculateDerivedAttributes(base);
      assert.equal(Object.keys(derived).length, 10);
      for (const value of Object.values(derived)) {
        assert.equal(typeof value, "number");
        assert.ok(Number.isFinite(value));
      }
    });

    it("mais Base Attributes sempre produz Derived Attributes maiores ou iguais (nenhuma fórmula negativa)", () => {
      const low = calculateDerivedAttributes({ strength: 5, dexterity: 5, intelligence: 5, vitality: 5 });
      const high = calculateDerivedAttributes({ strength: 50, dexterity: 50, intelligence: 50, vitality: 50 });
      for (const key of Object.keys(low) as (keyof typeof low)[]) {
        assert.ok(high[key] >= low[key], `${key}: high (${high[key]}) deveria ser >= low (${low[key]})`);
      }
    });

    it("Base Attributes vazios (tudo 0) ainda produz stats base (valores-base das fórmulas)", () => {
      const derived = calculateDerivedAttributes({ strength: 0, dexterity: 0, intelligence: 0, vitality: 0 });
      assert.equal(derived.maximumLife, 50);
      assert.equal(derived.maximumMana, 30);
      assert.equal(derived.physicalDamage, 0);
      assert.equal(derived.accuracy, 50);
      assert.equal(derived.movementSpeed, 100);
    });
  });

  describe("integração com Equipment", () => {
    it("calculateFinalStats combina Derived Attributes do Character Build com CharacterStats do Equipment", () => {
      const build = new CharacterBuild("char-1", "warrior", xpForLevelTotal(20));
      const inventory = new Inventory("char-1", 5);
      const equipment = new Equipment("char-1");

      const sword = generateItem("sword", 60, 1);
      inventory.addItem("drop-1", sword);
      equipment.equipItem(inventory, "weapon", "drop-1");

      const derived = build.getDerivedAttributes();
      const finalStats = calculateFinalStats(build, equipment);

      assert.ok(finalStats.physicalDamage >= derived.physicalDamage, "equipar uma arma nunca deveria diminuir o dano físico final");
      assert.ok(finalStats.powerScore >= derived.powerScore);
    });

    it("Equipment vazio: Final Stats é igual aos Derived Attributes do Character Build (mais os campos extras zerados)", () => {
      const build = new CharacterBuild("char-1", "cleric", 0);
      const equipment = new Equipment("char-1");
      const derived = build.getDerivedAttributes();
      const finalStats = calculateFinalStats(build, equipment);

      assert.equal(finalStats.maximumLife, derived.maximumLife);
      assert.equal(finalStats.maximumMana, derived.maximumMana);
      assert.equal(finalStats.physicalDamage, derived.physicalDamage);
      assert.equal(finalStats.armor, derived.armor);
      assert.equal(finalStats.lifeLeech, 0);
      assert.deepEqual(finalStats.resistances, { physical: 0, fire: 0, cold: 0, lightning: 0 });
    });

    it("Future Buffs/Passives/Talents somam de verdade quando fornecidos (pipeline pronto, sem sistema real ainda)", () => {
      const build = new CharacterBuild("char-1", "warrior", 0);
      const equipment = new Equipment("char-1");
      const withoutModifiers = calculateFinalStats(build, equipment);
      const withModifiers = calculateFinalStats(build, equipment, {
        buffs: { maximumLife: 100 },
        passives: { physicalDamage: 20 },
        talents: { criticalChance: 5 },
      });
      assert.equal(withModifiers.maximumLife, withoutModifiers.maximumLife + 100);
      assert.equal(withModifiers.physicalDamage, withoutModifiers.physicalDamage + 20);
      assert.equal(withModifiers.criticalChance, withoutModifiers.criticalChance + 5);
    });

    it("sem modifiers, calculateFinalStats produz exatamente o mesmo resultado de antes (nenhuma mudança de comportamento)", () => {
      const build = new CharacterBuild("char-1", "warrior", 12345);
      const equipment = new Equipment("char-1");
      assert.deepEqual(calculateFinalStats(build, equipment), calculateFinalStats(build, equipment, {}));
    });
  });

  describe("determinismo", () => {
    it("mesma classe + mesma experience sempre produz o mesmo Base/Derived Attributes", () => {
      function run(): unknown {
        const build = new CharacterBuild("char-1", "mage", 42000);
        return { base: build.getBaseAttributes(), derived: build.getDerivedAttributes() };
      }
      assert.deepEqual(run(), run());
    });

    it("mesma sequência de addExperience sempre produz o mesmo estado final", () => {
      function run(): unknown {
        const build = new CharacterBuild("char-1", "ranger", 0);
        build.addExperience(500);
        build.addExperience(1500);
        build.addExperience(3000);
        return { level: build.level, experience: build.experience, derived: build.getDerivedAttributes() };
      }
      assert.deepEqual(run(), run());
    });
  });

  describe("performance", () => {
    it("1000 criações de Character Build + cálculo de Final Stats completam rapidamente", () => {
      const equipment = new Equipment("char-perf");
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        const build = new CharacterBuild("char-perf", CHARACTER_CLASSES[i % CHARACTER_CLASSES.length].id, i * 100);
        calculateFinalStats(build, equipment);
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 2000, `1000 iterações levaram ${elapsedMs}ms, esperava < 2000ms`);
    });
  });
});
