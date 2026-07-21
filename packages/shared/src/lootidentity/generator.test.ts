import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateMonsterLoot } from "./generator.js";
import { resolveLootBias } from "./resolve.js";
import { getArchetype } from "./archetypes.js";
import { MONSTER_ARCHETYPES } from "./archetypes.js";
import { MONSTER_LOOT_IDENTITIES } from "./lootIdentities.js";
import type { MonsterArchetype, MonsterLootIdentity } from "./types.js";
import { LOOT_TABLES } from "../lootgen/lootTables.js";
import type { LootTable } from "../lootgen/types.js";
import { generateLoot } from "../lootgen/generator.js";

describe("Monster Loot Identity Phase I", () => {
  it("integridade de dados: toda Loot Identity referencia um Archetype que existe de verdade", () => {
    for (const identity of MONSTER_LOOT_IDENTITIES) {
      assert.ok(
        getArchetype(identity.archetypeId),
        `Loot Identity "${identity.monsterId}" referencia Archetype inexistente "${identity.archetypeId}"`,
      );
    }
  });

  it("integridade de dados: toda Loot Identity referencia uma Loot Table que existe de verdade (mesmo monsterId)", () => {
    const tableIds = new Set(LOOT_TABLES.map((table) => table.id));
    for (const identity of MONSTER_LOOT_IDENTITIES) {
      assert.ok(tableIds.has(identity.monsterId), `Loot Identity "${identity.monsterId}" não tem Loot Table correspondente`);
    }
  });

  it("lança erro para monstro sem Loot Identity (nenhum item inventado)", () => {
    assert.throws(() => generateMonsterLoot("dragon", 20, 1), /identidade desconhecida/);
  });

  it("afinidade correta: Wolf (Beast) favorece Dagger/Boots/Belt", () => {
    const bias = resolveLootBias("wolf");
    assert.ok((bias.baseItemAffinity.dagger ?? 1) > 1);
    assert.ok((bias.baseItemAffinity.boots ?? 1) > 1);
    assert.ok((bias.baseItemAffinity.belt ?? 1) > 1);
  });

  it("afinidade correta: Mage favorece Staff/Wand/Amulet", () => {
    const mage = getArchetype("mage")!;
    assert.ok(mage.lootBias.baseItemAffinity.staff! > 1);
    assert.ok(mage.lootBias.baseItemAffinity.wand! > 1);
    assert.ok(mage.lootBias.baseItemAffinity.amulet! > 1);
  });

  it("pesos corretos: Bandit Captain tem Rarity Bias mais forte que um Bandit raso (mesmo Archetype)", () => {
    const banditBias = resolveLootBias("bandit");
    const captainBias = resolveLootBias("bandit_captain");
    assert.equal(banditBias.rarityBias.rare ?? 1, 1, "Bandit raso não deveria ter override de raridade");
    assert.equal(captainBias.rarityBias.rare, 2);
    assert.equal(captainBias.rarityBias.unique, 0.2);
  });

  it("raridade correta: Wolf tem Rare x0.5 e Unique x0 (exemplo literal da Sprint)", () => {
    const bias = resolveLootBias("wolf");
    assert.equal(bias.rarityBias.rare, 0.5);
    assert.equal(bias.rarityBias.unique, 0);
  });

  it("raridade correta: Boss tem Rare x4 e Unique x1 (exemplo literal da Sprint)", () => {
    const bias = resolveLootBias("boss");
    assert.equal(bias.rarityBias.rare, 4);
    assert.equal(bias.rarityBias.unique, 1);
  });

  it("Wolf nunca gera item Unique (multiplicador 0 zera completamente a raridade)", () => {
    for (let seed = 0; seed < 500; seed++) {
      const loot = generateMonsterLoot("wolf", 10, seed);
      for (const item of loot.generatedItems) {
        assert.notEqual(item.rarity, "unique");
      }
    }
  });

  it("Boss via Loot Identity produz Rare com mais frequência que o mesmo Boss sem identidade (Rare Bias x4 do Archetype)", () => {
    let withIdentityRares = 0;
    let withoutIdentityRares = 0;
    const samples = 500;
    for (let seed = 0; seed < samples; seed++) {
      const withIdentity = generateMonsterLoot("boss", 50, seed);
      for (const item of withIdentity.generatedItems) if (item.rarity === "rare") withIdentityRares++;
      const withoutIdentity = generateLoot("boss", 50, seed);
      for (const item of withoutIdentity.generatedItems) if (item.rarity === "rare") withoutIdentityRares++;
    }
    assert.ok(
      withIdentityRares > withoutIdentityRares,
      `com identidade (${withIdentityRares}) deveria ter mais Rare que sem (${withoutIdentityRares})`,
    );
  });

  it("Wolf sem Loot Identity ocasionalmente gera Unique; com Loot Identity, nunca (Unique x0 zera de verdade)", () => {
    // Wolf tem dropChance baixo (0.35) e Unique já é a raridade mais
    // rara do Item Generator (~1% da massa de peso) — precisa de uma
    // amostra grande pra ter uniques suficientes sem depender de sorte
    // (valor esperado ~25 em 20000 seeds, ver cálculo no PR).
    let withoutIdentityUniques = 0;
    for (let seed = 0; seed < 20000; seed++) {
      const withoutIdentity = generateLoot("wolf", 60, seed);
      for (const item of withoutIdentity.generatedItems) if (item.rarity === "unique") withoutIdentityUniques++;
    }
    assert.ok(withoutIdentityUniques > 0, "esperava ao menos um Unique em 20000 seeds sem Loot Identity");
    // (a ausência total de Unique COM identidade já é coberta pelo
    // teste "Wolf nunca gera item Unique" acima.)
  });

  it("Affix Affinity tem efeito real: Beast (Wolf) produz mods de tag 'life' com mais frequência que sem nenhum viés", () => {
    let withIdentityLifeMods = 0;
    let withIdentityTotalMods = 0;
    let withoutIdentityLifeMods = 0;
    let withoutIdentityTotalMods = 0;
    for (let seed = 0; seed < 800; seed++) {
      const withIdentity = generateMonsterLoot("wolf", 60, seed);
      for (const item of withIdentity.generatedItems) {
        for (const mod of [...item.prefixes, ...item.suffixes]) {
          withIdentityTotalMods++;
          if (mod.tags.includes("life")) withIdentityLifeMods++;
        }
      }
      const withoutIdentity = generateLoot("wolf", 60, seed);
      for (const item of withoutIdentity.generatedItems) {
        for (const mod of [...item.prefixes, ...item.suffixes]) {
          withoutIdentityTotalMods++;
          if (mod.tags.includes("life")) withoutIdentityLifeMods++;
        }
      }
    }
    assert.ok(withIdentityTotalMods > 0 && withoutIdentityTotalMods > 0, "esperava mods suficientes pra comparar taxas");
    const withIdentityRate = withIdentityLifeMods / withIdentityTotalMods;
    const withoutIdentityRate = withoutIdentityLifeMods / withoutIdentityTotalMods;
    assert.ok(
      withIdentityRate > withoutIdentityRate,
      `taxa de mods 'life' com identidade (${withIdentityRate}) deveria ser maior que sem (${withoutIdentityRate})`,
    );
  });

  it("determinismo: mesmo monsterId + mesmo monsterLevel + mesma seed = mesmo LootResult", () => {
    const a = generateMonsterLoot("boss", 50, 777);
    const b = generateMonsterLoot("boss", 50, 777);
    assert.deepEqual(a, b);
  });

  it("compatibilidade com Loot Generator: treasure_chest (não é criatura, sem Loot Identity) continua funcionando via generateLoot() puro", () => {
    assert.doesNotThrow(() => generateLoot("treasure_chest", 30, 1));
  });

  it("compatibilidade com Loot Generator: generateMonsterLoot() sempre devolve o mesmo formato de LootResult que generateLoot()", () => {
    const loot = generateMonsterLoot("goblin", 15, 5);
    assert.ok(Array.isArray(loot.generatedItems));
    assert.ok(Array.isArray(loot.currencies));
    assert.equal(typeof loot.totalPower, "number");
    assert.equal(typeof loot.totalValue, "number");
    assert.equal(typeof loot.seed, "number");
  });

  it("novos arquétipos e monstros sem alterar lógica: dado novo (Archetype + Loot Identity + Loot Table) funciona sem tocar resolve.ts/generator.ts", () => {
    // Simula literalmente o que a Sprint pede pra "adicionar um novo
    // arquétipo e um novo monstro": só inserir registros nas tabelas,
    // nenhuma mudança de código. MONSTER_ARCHETYPES/
    // MONSTER_LOOT_IDENTITIES/LOOT_TABLES são arrays exportados — o
    // teste empurra um registro novo em cada um (igual seria feito no
    // arquivo de dados de verdade) e confirma que a MESMA lógica já
    // existente resolve tudo sozinha.
    const testArchetype: MonsterArchetype = {
      id: "test_archetype_ooze",
      name: "Ooze",
      tags: ["ooze", "acid"],
      lootBias: {
        baseItemAffinity: { belt: 2.0 },
        affixAffinity: { life: 1.8 },
        rarityBias: { rare: 1.5 },
      },
      currencyBias: { craft_material: 1.3 },
      futureCraftBias: {},
    };
    const testTable: LootTable = {
      id: "test_monster_ooze",
      weight: 100,
      minLevel: 1,
      maxLevel: 20,
      itemLevelVariance: 1,
      dropChance: 1.0,
      allowedBaseItems: ["belt", "boots"],
      baseItemWeights: { belt: 50, boots: 50 },
      rarityMultiplier: 1.0,
      quantityMultiplier: 1.0,
      quantityOptions: [{ quantity: 1, weight: 100 }],
      seedOffset: 9999,
    };
    const testIdentity: MonsterLootIdentity = {
      monsterId: "test_monster_ooze",
      archetypeId: "test_archetype_ooze",
    };

    MONSTER_ARCHETYPES.push(testArchetype);
    LOOT_TABLES.push(testTable);
    MONSTER_LOOT_IDENTITIES.push(testIdentity);

    try {
      const bias = resolveLootBias("test_monster_ooze");
      assert.equal(bias.baseItemAffinity.belt, 2.0);
      assert.equal(bias.rarityBias.rare, 1.5);

      const loot = generateMonsterLoot("test_monster_ooze", 10, 1);
      assert.equal(loot.generatedItems.length, 1);
      assert.ok(["belt", "boots"].includes(loot.generatedItems[0].baseItemId));
    } finally {
      MONSTER_ARCHETYPES.pop();
      LOOT_TABLES.pop();
      MONSTER_LOOT_IDENTITIES.pop();
    }
  });
});
