import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { getLootTable } from "../lootgen/lootTables.js";
import { generateLoot } from "../lootgen/generator.js";
import { getMonsterLootTable } from "../monsterLootTable/lootTableRegistry.js";
import { rollSpecialDropForMonster, SPECIAL_DROP_CHANCE } from "../monsterLootTable/specialDropRoll.js";
import { generateMonsterLoot } from "./generator.js";

// Sprint 29 — Loot Integration Phase I. Fase 9: cobertura de MonsterLootTable
// Integration/Loot Generator/Region Influence/Biome Influence/Special
// Drops/Fallback seguro — a primeira Sprint desta série que exercita o
// pipeline REAL de drop (generateMonsterLoot -> generateLoot ->
// generateItem), nunca mockado.

describe("Fase 2 — Monster Loot Table gate (allow/block real)", () => {
  test("Goblin nunca produz um item de Base bloqueado (staff) em 300 rolagens reais — exemplo literal do brief", () => {
    const table = getMonsterLootTable("goblin")!;
    assert.ok(table.blockedBases.includes("staff"), "pré-condição: staff deveria estar bloqueado pro Goblin");
    for (let seed = 1; seed <= 300; seed++) {
      const loot = generateMonsterLoot("goblin", 20, seed, { dropChanceOverride: 1, minimumQuantity: 1 });
      for (const item of loot.generatedItems) {
        assert.notEqual(item.baseItemId, "staff", `Goblin produziu Cajado (staff) na seed ${seed} — gate falhou`);
      }
    }
  });

  test("Cultista (swamp-witch) nunca produz axe (Machado) em 300 rolagens reais — exemplo literal do brief", () => {
    const table = getMonsterLootTable("swamp-witch")!;
    assert.ok(table.blockedBases.includes("axe"));
    for (let seed = 1; seed <= 300; seed++) {
      const loot = generateMonsterLoot("swamp-witch", 20, seed, { dropChanceOverride: 1, minimumQuantity: 1 });
      for (const item of loot.generatedItems) {
        assert.notEqual(item.baseItemId, "axe");
      }
    }
  });

  test("Lobo nunca produz um item fora de dagger/boots/belt (allowedBases real) em 300 rolagens", () => {
    const table = getMonsterLootTable("wolf")!;
    for (let seed = 1; seed <= 300; seed++) {
      const loot = generateMonsterLoot("wolf", 15, seed, { dropChanceOverride: 1, minimumQuantity: 1 });
      for (const item of loot.generatedItems) {
        assert.ok(table.allowedBases.includes(item.baseItemId), `Lobo produziu Base fora do allow-list: ${item.baseItemId}`);
      }
    }
  });
});

describe("Fase 8 — Integridade: nenhum monstro fica sem loot, nenhuma interseção fica vazia", () => {
  test("todos os 22 Enemy Templates reais: interseção entre Loot Table real e Monster Loot Table nunca é vazia", () => {
    for (const template of ENEMY_TEMPLATES) {
      const realTable = getLootTable(template.id);
      const monsterTable = getMonsterLootTable(template.id);
      assert.ok(realTable, `sem Loot Table real pra "${template.id}"`);
      assert.ok(monsterTable, `sem Monster Loot Table pra "${template.id}"`);
      const intersection = realTable!.allowedBaseItems.filter((id) => monsterTable!.allowedBases.includes(id));
      assert.ok(intersection.length > 0, `"${template.id}": interseção vazia entre Loot Table real e Monster Loot Table`);
    }
  });

  test("todos os 22 Enemy Templates reais: generateMonsterLoot() nunca lança erro, sempre devolve itens quando dropChance=1", () => {
    for (const template of ENEMY_TEMPLATES) {
      const loot = generateMonsterLoot(template.id, 20, 42, { dropChanceOverride: 1, minimumQuantity: 1 });
      assert.ok(loot.generatedItems.length >= 1, `"${template.id}" não produziu nenhum item com dropChance=1/minimumQuantity=1`);
    }
  });

  test("fallback seguro: allowedBaseItemIds sem NENHUMA sobreposição com a Loot Table real nunca quebra o Loot Generator, nunca fica sem item", () => {
    const loot = generateLoot("wolf", 10, 1, {
      dropChanceOverride: 1,
      minimumQuantity: 1,
      allowedBaseItemIds: ["id-que-nao-existe-em-nenhuma-tabela"],
    });
    assert.ok(loot.generatedItems.length >= 1, "fallback deveria produzir item mesmo com interseção vazia");
  });
});

describe("Fase 3 — Monster Loot Signature: influência leve, nunca domina o Archetype", () => {
  test("Esqueleto (undead) e Bispo Corrompido (undead) — mesmo Archetype, assinaturas divergentes — produzem distribuições de Base perceptivelmente diferentes", () => {
    const skeletonBases = new Set<string>();
    const bishopBases = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      const skeletonLoot = generateMonsterLoot("skeleton", 20, seed, { dropChanceOverride: 1, minimumQuantity: 1 });
      const bishopLoot = generateMonsterLoot("corrupted-bishop", 30, seed, { dropChanceOverride: 1, minimumQuantity: 1 });
      for (const item of skeletonLoot.generatedItems) skeletonBases.add(item.baseItemId);
      for (const item of bishopLoot.generatedItems) bishopBases.add(item.baseItemId);
    }
    assert.notDeepEqual([...skeletonBases].sort(), [...bishopBases].sort(), "Esqueleto e Bispo Corrompido (mesmo Archetype) deveriam produzir universos de Base diferentes");
  });
});

describe("Fase 4 — World Region: multiplicador leve, opcional, nunca quebra determinismo", () => {
  test("mesma seed + mesmo regionId sempre produz o mesmo resultado (determinismo preservado)", () => {
    const a = generateMonsterLoot("wolf", 10, 777, { regionId: "bosque-sussurrante" });
    const b = generateMonsterLoot("wolf", 10, 777, { regionId: "bosque-sussurrante" });
    assert.deepEqual(a, b);
  });

  test("omitir regionId produz exatamente o mesmo resultado que antes desta Sprint (nenhuma regressão pros 2 sites que já chamavam sem região)", () => {
    const withoutRegion = generateMonsterLoot("boss", 50, 777);
    const withUndefinedRegion = generateMonsterLoot("boss", 50, 777, { regionId: undefined });
    assert.deepEqual(withoutRegion, withUndefinedRegion);
  });

  test("regionId inválido (sem WorldRegion real) nunca lança erro — cai no comportamento sem influência de região", () => {
    assert.doesNotThrow(() => generateMonsterLoot("wolf", 10, 1, { regionId: "regiao-inexistente" }));
  });
});

describe("Fase 5 — Special Drops: rolagem real, determinística, extremamente rara, nenhum item novo", () => {
  test("é determinística: mesma seed sempre produz o mesmo resultado", () => {
    const a = rollSpecialDropForMonster("wolf-alpha", 12345);
    const b = rollSpecialDropForMonster("wolf-alpha", 12345);
    assert.deepEqual(a, b);
  });

  test("monstro sem specialDrops registrado nunca produz nada, em nenhuma seed", () => {
    for (let seed = 1; seed <= 50; seed++) {
      assert.equal(rollSpecialDropForMonster("goblin", seed), null);
    }
  });

  test("chance é extremamente rara (1/100.000) — em 1000 seeds sequenciais, nenhum acerto esperado (estatisticamente)", () => {
    let hits = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      if (rollSpecialDropForMonster("wolf-alpha", seed) !== null) hits++;
    }
    assert.ok(hits <= 1, `esperava ~0 acertos em 1000 seeds a 1/100.000, achou ${hits}`);
    assert.equal(SPECIAL_DROP_CHANCE, 1 / 100_000);
  });

  test("monstro desconhecido nunca lança erro", () => {
    assert.equal(rollSpecialDropForMonster("nao-existe", 1), null);
  });
});
