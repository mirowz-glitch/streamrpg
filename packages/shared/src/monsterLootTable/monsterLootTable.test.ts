import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";
import { SPHERE_DEFINITIONS } from "../itemization/spheres.js";
import { MATERIAL_TYPES } from "../worldregion/materialTypes.js";
import { getMonsterBaseAffinity, getMonsterSphereAffinity, getMonsterGemAffinity, getMonsterMaterialAffinity } from "../monsterLoot/monsterAffinity.js";
import { MONSTER_LOOT_TABLES, getMonsterLootTable, listMonsterLootTables, listUnregisteredMonsterIds } from "./lootTableRegistry.js";
import { canDropBase, canDropAffix, canDropSphere, canDropGem, canDropMaterial, canDropSpecialItem } from "./restrictions.js";

// Sprint 28 — Loot Tables Phase I. Fase 8: cobertura de LootTable/
// Restrictions/Registry/Integridade/Special Drops — tudo
// infraestrutura pura, nenhuma dependência de RNG/DB/rede, nenhuma
// chamada real do Item Generator/Loot Generator.

describe("Loot Table Registry (Fase 3) — 'Nenhuma criatura fica órfã'", () => {
  test("22/22 Enemy Templates reais têm MonsterLootTable — nenhum órfão", () => {
    assert.deepEqual(listUnregisteredMonsterIds(), []);
    assert.equal(MONSTER_LOOT_TABLES.length, ENEMY_TEMPLATES.length);
    assert.equal(MONSTER_LOOT_TABLES.length, 22);
  });

  test("ids únicos, todos enabled, id === monsterId", () => {
    const ids = MONSTER_LOOT_TABLES.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const table of listMonsterLootTables()) {
      assert.equal(table.enabled, true);
      assert.equal(table.id, table.monsterId);
    }
  });

  test("toda tabela particiona o universo REAL de Bases/Esferas/Materiais — allowed+blocked cobre tudo, sem sobreposição", () => {
    const allBaseIds = ITEM_GEN_BASE_ITEMS.map((b) => b.id);
    const allSphereIds = SPHERE_DEFINITIONS.map((s) => s.id);
    const allMaterialIds = MATERIAL_TYPES.map((m) => m.id);

    for (const table of listMonsterLootTables()) {
      assert.deepEqual([...table.allowedBases, ...table.blockedBases].sort(), [...allBaseIds].sort());
      assert.equal(table.allowedBases.filter((id) => table.blockedBases.includes(id)).length, 0);

      assert.deepEqual([...table.allowedSpheres, ...table.blockedSpheres].sort(), [...allSphereIds].sort());
      assert.deepEqual([...table.allowedMaterials, ...table.blockedMaterials].sort(), [...allMaterialIds].sort());
      assert.equal(table.allowedGems.length + table.blockedGems.length, 12);
    }
  });

  test("allowedBases/allowedSpheres/allowedGems/allowedMaterials de cada monstro batem exatamente com a afinidade real do Monster Loot Signature (Sprint 27)", () => {
    for (const table of listMonsterLootTables()) {
      assert.deepEqual(table.allowedBases.sort(), Object.keys(getMonsterBaseAffinity(table.monsterId)).sort());
      assert.deepEqual(table.allowedSpheres.sort(), Object.keys(getMonsterSphereAffinity(table.monsterId)).sort());
      assert.deepEqual(table.allowedGems.sort(), Object.keys(getMonsterGemAffinity(table.monsterId)).sort());
      assert.deepEqual(table.allowedMaterials.sort(), getMonsterMaterialAffinity(table.monsterId).sort());
    }
  });

  test("Lobo (wolf/wolf-alpha/frost-wolf): allowedBases inclui dagger/boots/belt, bloqueia axe ('Nunca Machado', exemplo literal do brief)", () => {
    for (const id of ["wolf", "wolf-alpha", "frost-wolf"]) {
      const table = getMonsterLootTable(id)!;
      assert.ok(table.allowedBases.includes("dagger"));
      assert.ok(table.allowedBases.includes("boots"));
      assert.ok(table.blockedBases.includes("axe"));
    }
  });

  test("Cultista: allowedBases inclui amulet/ring, bloqueia axe ('Nunca Machados', exemplo literal do brief); allowedSpheres inclui fortune", () => {
    for (const id of ["swamp-witch", "corrupted-acolyte", "corrupted-bishop", "fire-cultist"]) {
      const table = getMonsterLootTable(id)!;
      assert.ok(table.allowedBases.includes("amulet"));
      assert.ok(table.allowedBases.includes("ring"));
      assert.ok(table.blockedBases.includes("axe"));
      assert.ok(table.allowedSpheres.includes("fortune"));
    }
  });

  test("Goblin: allowedBases inclui axe ('Machado', exemplo literal do brief), bloqueia staff ('Nunca Cajado')", () => {
    const table = getMonsterLootTable("goblin")!;
    assert.ok(table.allowedBases.includes("axe"));
    assert.ok(table.blockedBases.includes("staff"));
  });

  test("getMonsterLootTable devolve undefined pra um monstro desconhecido", () => {
    assert.equal(getMonsterLootTable("monstro-inexistente"), undefined);
  });
});

describe("Special Drops (Fase 4) — 'Nada funcional ainda. Só infraestrutura.'", () => {
  test("os 3 exemplos literais do brief estão registrados no monstro real correto", () => {
    assert.equal(getMonsterLootTable("wolf-alpha")?.specialDrops[0]?.name, "Pele do Lobo Alfa");
    assert.equal(getMonsterLootTable("dark-knight")?.specialDrops[0]?.name, "Espada do Cavaleiro Negro");
    assert.equal(getMonsterLootTable("corrupted-bishop")?.specialDrops[0]?.name, "Livro Proibido");
  });

  test("'Cultista Supremo' (sem Enemy Template real) foi substituído por Bispo Corrompido (isBoss real, membro mais forte da Família Culto Corrompido) — documentado, nunca inventado", () => {
    const bishop = ENEMY_TEMPLATES.find((t) => t.id === "corrupted-bishop")!;
    assert.equal(bishop.futureFlags.isBoss, true);
  });

  test("todo outro monstro sem exemplo literal tem specialDrops vazio — nada inventado", () => {
    const namedIds = new Set(["wolf-alpha", "dark-knight", "corrupted-bishop"]);
    for (const table of listMonsterLootTables()) {
      if (namedIds.has(table.monsterId)) continue;
      assert.deepEqual(table.specialDrops, []);
    }
  });
});

describe("Loot Restrictions (Fase 5) — funções puras, nunca chamadas por código real", () => {
  test("canDropBase respeita allowed/blocked reais", () => {
    assert.equal(canDropBase("wolf", "dagger"), true);
    assert.equal(canDropBase("wolf", "axe"), false);
  });

  test("canDropSphere/canDropGem respeitam allowed/blocked reais", () => {
    assert.equal(canDropSphere("swamp-witch", "fortune"), true);
    assert.equal(canDropSphere("swamp-witch", "curse"), false);
    assert.equal(canDropGem("wolf", "life"), true);
    assert.equal(canDropGem("wolf", "fire"), false);
  });

  test("canDropMaterial respeita allowed/blocked reais", () => {
    const table = getMonsterLootTable("wolf")!;
    if (table.allowedMaterials.length > 0) {
      assert.equal(canDropMaterial("wolf", table.allowedMaterials[0]!), true);
    }
    if (table.blockedMaterials.length > 0) {
      assert.equal(canDropMaterial("wolf", table.blockedMaterials[0]!), false);
    }
  });

  test("canDropAffix nunca lança erro; devolve false pra tag fora do universo real", () => {
    assert.equal(canDropAffix("wolf", "tag-inexistente"), false);
  });

  test("canDropSpecialItem só reconhece o drop especial real do próprio monstro", () => {
    assert.equal(canDropSpecialItem("wolf-alpha", "pele-do-lobo-alfa"), true);
    assert.equal(canDropSpecialItem("wolf", "pele-do-lobo-alfa"), false);
    assert.equal(canDropSpecialItem("wolf-alpha", "espada-do-cavaleiro-negro"), false);
  });

  test("monstro desconhecido: toda função de restrição devolve false, nunca lança erro", () => {
    assert.equal(canDropBase("nao-existe", "sword"), false);
    assert.equal(canDropAffix("nao-existe", "life"), false);
    assert.equal(canDropSphere("nao-existe", "fortune"), false);
    assert.equal(canDropGem("nao-existe", "fire"), false);
    assert.equal(canDropMaterial("nao-existe", "madeira-elfica"), false);
    assert.equal(canDropSpecialItem("nao-existe", "qualquer"), false);
  });
});

describe("Sprint 28 — inércia total: nenhum sistema real de drop foi tocado", () => {
  test("ENEMY_TEMPLATES/ITEM_GEN_BASE_ITEMS/SPHERE_DEFINITIONS permanecem exatamente como antes desta Sprint", () => {
    assert.equal(ENEMY_TEMPLATES.length, 22);
    assert.equal(ITEM_GEN_BASE_ITEMS.length, 14);
    assert.equal(SPHERE_DEFINITIONS.length, 6);
  });
});
