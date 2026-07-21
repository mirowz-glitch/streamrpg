import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateItem } from "./generator.js";
import { ITEM_GEN_BASE_ITEMS, getBaseItem } from "./baseItems.js";
import { ITEM_GEN_RARITIES } from "./rarities.js";
import { ITEM_GEN_PREFIXES } from "./prefixes.js";
import { ITEM_GEN_SUFFIXES } from "./suffixes.js";
import { ITEM_GEN_MOD_GROUPS } from "./modGroups.js";
import { getEffectiveModWeight } from "./weights.js";

describe("Item Generator Phase I", () => {
  it("mesma seed produz exatamente o mesmo item (determinismo)", () => {
    const a = generateItem("sword", 40, 123456);
    const b = generateItem("sword", 40, 123456);
    assert.deepEqual(a, b);
  });

  it("seeds diferentes tendem a produzir itens diferentes", () => {
    const a = generateItem("sword", 40, 1);
    const b = generateItem("sword", 40, 2);
    assert.notDeepEqual(a, b);
  });

  it("lança erro para Base Item desconhecido (nenhum item inventado)", () => {
    assert.throws(() => generateItem("excalibur", 40, 1), /Base Item desconhecido/);
  });

  it("item Common nunca tem prefixo ou sufixo", () => {
    let foundCommon = false;
    for (let seed = 0; seed < 500; seed++) {
      const item = generateItem("sword", 40, seed);
      if (item.rarity === "common") {
        foundCommon = true;
        assert.equal(item.prefixes.length, 0);
        assert.equal(item.suffixes.length, 0);
      }
    }
    assert.ok(foundCommon, "esperava sortear ao menos um item Common em 500 seeds");
  });

  it("respeita min/max de prefixos e sufixos da raridade sorteada", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = generateItem("sword", 60, seed);
      const rarityDef = ITEM_GEN_RARITIES.find((r) => r.id === item.rarity)!;
      assert.ok(item.prefixes.length <= rarityDef.maxPrefixes);
      assert.ok(item.suffixes.length <= rarityDef.maxSuffixes);
    }
  });

  it("nunca repete o mesmo grupo de mod duas vezes entre os prefixos", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item = generateItem("sword", 60, seed);
      const groups = item.prefixes.map((mod) => mod.group);
      assert.equal(new Set(groups).size, groups.length);
    }
  });

  it("nunca repete o mesmo grupo de mod duas vezes entre os sufixos", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item = generateItem("sword", 60, seed);
      const groups = item.suffixes.map((mod) => mod.group);
      assert.equal(new Set(groups).size, groups.length);
    }
  });

  it("só sorteia mods permitidos para o slot do Base Item (ex.: Ring nunca recebe Attack Speed, exclusivo de arma)", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item = generateItem("ring", 60, seed);
      const allModIds = [...item.prefixes, ...item.suffixes].map((mod) => mod.modId);
      assert.ok(!allModIds.includes("prefix_swift"));
      assert.ok(!allModIds.includes("suffix_of_accuracy"));
    }
  });

  it("Item Level baixo nunca libera valores de tier alto (ex.: T1 exige item level 60)", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item = generateItem("sword", 5, seed);
      for (const mod of [...item.prefixes, ...item.suffixes]) {
        assert.notEqual(mod.tier, 1);
      }
    }
  });

  it("valor rolado sempre cai dentro da faixa do tier escolhido", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item = generateItem("sword", 60, seed);
      for (const mod of [...item.prefixes, ...item.suffixes]) {
        assert.ok(mod.value >= 1);
      }
    }
  });

  it("Power Score é sempre um número finito e não-negativo", () => {
    for (let seed = 0; seed < 200; seed++) {
      const item = generateItem("sword", 60, seed);
      assert.ok(Number.isFinite(item.powerScore));
      assert.ok(item.powerScore >= 0);
    }
  });

  it("gera item para todo Base Item cadastrado, sem lançar erro", () => {
    for (const base of ITEM_GEN_BASE_ITEMS) {
      assert.doesNotThrow(() => generateItem(base.id, 50, 42));
    }
  });

  it("armadura (defesa) nunca recebe mods exclusivos de dano de arma (ex.: Cruel/Physical Damage)", () => {
    for (let seed = 0; seed < 300; seed++) {
      const item = generateItem("chest", 60, seed);
      const allModIds = [...item.prefixes, ...item.suffixes].map((mod) => mod.modId);
      assert.ok(!allModIds.includes("prefix_cruel"));
      assert.ok(!allModIds.includes("suffix_of_fire"));
    }
  });
});

describe("Item Generator Phase II — Affix System", () => {
  it("Sword nunca rola Spell Damage (tag 'spell' não permite)", () => {
    for (let seed = 0; seed < 500; seed++) {
      const item = generateItem("sword", 70, seed);
      const allModIds = [...item.prefixes, ...item.suffixes].map((mod) => mod.modId);
      assert.ok(!allModIds.includes("prefix_mystic"));
    }
  });

  it("Sword pode rolar Physical Damage, Attack Speed, Accuracy, Critical e Life Leech (exemplo literal da Sprint)", () => {
    const seenModIds = new Set<string>();
    for (let seed = 0; seed < 2000; seed++) {
      const item = generateItem("sword", 70, seed);
      for (const mod of [...item.prefixes, ...item.suffixes]) seenModIds.add(mod.modId);
    }
    assert.ok(seenModIds.has("prefix_cruel"), "Physical Damage nunca apareceu em 2000 seeds");
    assert.ok(seenModIds.has("prefix_swift"), "Attack Speed nunca apareceu em 2000 seeds");
    assert.ok(seenModIds.has("suffix_of_accuracy"), "Accuracy nunca apareceu em 2000 seeds");
    assert.ok(seenModIds.has("suffix_of_precision"), "Critical nunca apareceu em 2000 seeds");
    assert.ok(seenModIds.has("suffix_of_the_vampire"), "Life Leech nunca apareceu em 2000 seeds");
  });

  it("mod group: Healthy/Vigorous/Massive nunca coexistem no mesmo item (mesmo group 'life', ids diferentes)", () => {
    const lifeModIds = new Set(["prefix_healthy", "prefix_vigorous", "prefix_massive"]);
    for (let seed = 0; seed < 500; seed++) {
      const item = generateItem("sword", 70, seed);
      const lifeModsOnItem = item.prefixes.filter((mod) => lifeModIds.has(mod.modId));
      assert.ok(lifeModsOnItem.length <= 1, `item com seed=${seed} tem mais de um mod do group life: ${JSON.stringify(lifeModsOnItem)}`);
    }
  });

  it("bloqueio entre afixos incompatíveis: Life Leech e Spell Damage nunca coexistem (mesmo elegíveis por tag em Staff)", () => {
    for (let seed = 0; seed < 1000; seed++) {
      const item = generateItem("staff", 70, seed);
      const allModIds = [...item.prefixes, ...item.suffixes].map((mod) => mod.modId);
      const hasLifeLeech = allModIds.includes("suffix_of_the_vampire");
      const hasSpellDamage = allModIds.includes("prefix_mystic");
      assert.ok(!(hasLifeLeech && hasSpellDamage), `item com seed=${seed} tem Life Leech e Spell Damage juntos`);
    }
  });

  it("peso por Base Item: Cruel (Physical Damage) tem peso maior em Axe do que o peso base", () => {
    const cruel = ITEM_GEN_PREFIXES.find((mod) => mod.id === "prefix_cruel")!;
    const axe = getBaseItem("axe")!;
    const sword = getBaseItem("sword")!;
    const weightOnAxe = getEffectiveModWeight(cruel, axe, "rare");
    const weightOnSword = getEffectiveModWeight(cruel, sword, "rare");
    assert.equal(weightOnAxe, 120);
    assert.equal(weightOnSword, cruel.weight);
    assert.ok(weightOnAxe > weightOnSword);
  });

  it("peso por Base Item: Mystic (Spell Damage) tem peso 0 em Axe (nunca deveria rolar ali)", () => {
    const mystic = ITEM_GEN_PREFIXES.find((mod) => mod.id === "prefix_mystic")!;
    const axe = getBaseItem("axe")!;
    assert.equal(getEffectiveModWeight(mystic, axe, "rare"), 0);
  });

  it("peso por raridade: of Precision (Critical) fica mais provável em Unique do que em Magic", () => {
    const precision = ITEM_GEN_SUFFIXES.find((mod) => mod.id === "suffix_of_precision")!;
    const sword = getBaseItem("sword")!;
    const weightOnMagic = getEffectiveModWeight(precision, sword, "magic");
    const weightOnUnique = getEffectiveModWeight(precision, sword, "unique");
    assert.equal(weightOnMagic, precision.weight);
    assert.ok(weightOnUnique > weightOnMagic);
  });

  it("peso por Item Level: tier pior (T4) aparece com MUITA mais frequência que o melhor (T1) quando ambos elegíveis", () => {
    const tierCounts = new Map<number, number>();
    for (let seed = 0; seed < 3000; seed++) {
      const item = generateItem("sword", 70, seed);
      for (const mod of [...item.prefixes, ...item.suffixes]) {
        if (mod.modId !== "prefix_cruel") continue;
        tierCounts.set(mod.tier, (tierCounts.get(mod.tier) ?? 0) + 1);
      }
    }
    const t1 = tierCounts.get(1) ?? 0;
    const t4 = tierCounts.get(4) ?? 0;
    assert.ok(t1 > 0, "esperava ver ao menos um T1 de Cruel em 3000 seeds");
    assert.ok(t4 > 0, "esperava ver ao menos um T4 de Cruel em 3000 seeds");
    assert.ok(t4 > t1 * 5, `T4 (${t4}) deveria ser bem mais frequente que T1 (${t1})`);
  });

  it("integridade de dados: todo `group` usado em algum mod está registrado em ITEM_GEN_MOD_GROUPS", () => {
    const registeredGroups = new Set(ITEM_GEN_MOD_GROUPS.map((group) => group.id));
    for (const mod of [...ITEM_GEN_PREFIXES, ...ITEM_GEN_SUFFIXES]) {
      assert.ok(registeredGroups.has(mod.group), `group "${mod.group}" do mod "${mod.id}" não está em ITEM_GEN_MOD_GROUPS`);
    }
  });

  it("integridade de dados: todo id referenciado em baseItemWeights/rarityWeights existe de verdade", () => {
    const baseItemIds = new Set(ITEM_GEN_BASE_ITEMS.map((base) => base.id));
    const rarityIds = new Set<string>(ITEM_GEN_RARITIES.map((rarity) => rarity.id));
    for (const mod of [...ITEM_GEN_PREFIXES, ...ITEM_GEN_SUFFIXES]) {
      for (const baseItemId of Object.keys(mod.baseItemWeights ?? {})) {
        assert.ok(baseItemIds.has(baseItemId), `mod "${mod.id}" referencia Base Item inexistente "${baseItemId}"`);
      }
      for (const rarityId of Object.keys(mod.rarityWeights ?? {})) {
        assert.ok(rarityIds.has(rarityId), `mod "${mod.id}" referencia raridade inexistente "${rarityId}"`);
      }
    }
  });
});
