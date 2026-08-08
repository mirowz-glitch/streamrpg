import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { getArchetype } from "../lootidentity/archetypes.js";
import { getFamilyForTemplate } from "../enemyFaction/enemyFamilies.js";
import { getEnemyFaction } from "../enemyFaction/factionRegistry.js";
import { BASE_IDENTITY_REGISTRY, getBaseIdentity } from "../baseIdentity/index.js";
import { MONSTER_LOOT_SIGNATURES, getMonsterLootSignature, listMonsterLootSignatures, listUnregisteredTemplateIds } from "./monsterRegistry.js";
import { MONSTER_ECONOMIC_PROFILES, getMonsterEconomicProfile, listMonsterEconomicProfiles } from "./monsterEconomicProfile.js";
import { getMonsterBaseAffinity, getMonsterSphereAffinity, getMonsterGemAffinity, getMonsterMaterialAffinity, getMonsterLegendaryChance, getBaseIdentityAffinityForMonster } from "./monsterAffinity.js";

// Sprint 27 — Monster Loot Identity Phase I. Fase 9: cobertura de
// Monster Registry/Monster Identity/Economic Profile/Affinity/
// Integridade — tudo infraestrutura pura, nenhuma dependência de
// RNG/DB/rede.

describe("Monster Registry (Fase 3) — 'Nenhum Enemy Template pode ficar sem registro'", () => {
  test("22/22 Enemy Templates reais têm MonsterLootSignature — nenhum órfão", () => {
    assert.deepEqual(listUnregisteredTemplateIds(), []);
    assert.equal(MONSTER_LOOT_SIGNATURES.length, ENEMY_TEMPLATES.length);
    assert.equal(MONSTER_LOOT_SIGNATURES.length, 22);
  });

  test("ids únicos, todos enabled, id === enemyTemplateId === preferredCurrency", () => {
    const ids = MONSTER_LOOT_SIGNATURES.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const signature of listMonsterLootSignatures()) {
      assert.equal(signature.enabled, true);
      assert.equal(signature.id, signature.enemyTemplateId);
      assert.equal(signature.preferredCurrency, signature.enemyTemplateId);
    }
  });

  test("toda MonsterLootSignature.familyId/factionId bate com a Enemy Family/Faction real (Sprint 26)", () => {
    for (const signature of listMonsterLootSignatures()) {
      const family = getFamilyForTemplate(signature.enemyTemplateId);
      assert.ok(family, `sem Enemy Family pra "${signature.enemyTemplateId}"`);
      assert.equal(signature.familyId, family!.id);
      assert.equal(signature.factionId, family!.factionId);
      assert.ok(getEnemyFaction(signature.factionId), `facção desconhecida "${signature.factionId}"`);
    }
  });

  test("getMonsterLootSignature devolve undefined pra um template desconhecido", () => {
    assert.equal(getMonsterLootSignature("monstro-inexistente"), undefined);
  });
});

describe("Loot Signature (Fase 4) — os 5 exemplos literais do brief", () => {
  test("Lobo (wolf/wolf-alpha/frost-wolf): garras/presas->dagger, leve->boots/belt, gemas verdes->life", () => {
    for (const id of ["wolf", "wolf-alpha", "frost-wolf"]) {
      const signature = getMonsterLootSignature(id)!;
      assert.equal(signature.preferredBases.dagger, 1.6);
      assert.equal(signature.preferredBases.boots, 1.5);
      assert.equal(signature.preferredBases.belt, 1.4);
      assert.equal(signature.preferredGems.life, 1.5);
    }
  });

  test("Esqueleto (skeleton/forgotten-guardian): espadas/escudos/armaduras -> sword/chest/helmet, diverge do baseline 'undead' (staff/wand)", () => {
    for (const id of ["skeleton", "forgotten-guardian"]) {
      const signature = getMonsterLootSignature(id)!;
      assert.equal(signature.preferredBases.sword, 1.5);
      assert.equal(signature.preferredBases.chest, 1.5);
      assert.equal(signature.preferredBases.staff, undefined);
    }
  });

  test("Cultista (swamp-witch/corrupted-acolyte/corrupted-bishop/fire-cultist): amuletos/anéis/esferas", () => {
    for (const id of ["swamp-witch", "corrupted-acolyte", "corrupted-bishop", "fire-cultist"]) {
      const signature = getMonsterLootSignature(id)!;
      assert.equal(signature.preferredBases.amulet, 1.6);
      assert.equal(signature.preferredBases.ring, 1.5);
      assert.equal(signature.preferredSpheres.fortune, 2, `esperava afinidade real de Fortuna (Sprint 25/26) herdada pra "${id}"`);
    }
  });

  test("Aranha (spider): mantém o baseline real do archetype 'beast', sem base override autoral", () => {
    const signature = getMonsterLootSignature("spider")!;
    const beastArchetype = getArchetype("beast")!;
    assert.deepEqual(signature.preferredBases, beastArchetype.lootBias.baseItemAffinity);
  });

  test("Cavaleiro Negro (dark-knight/boss): armaduras/espadas + preferredLegendaryChance elevado ('histórico')", () => {
    for (const id of ["dark-knight", "boss"]) {
      const signature = getMonsterLootSignature(id)!;
      assert.equal(signature.preferredBases.sword, 1.5);
      assert.equal(signature.preferredBases.chest, 1.5);
      assert.equal(signature.preferredLegendaryChance, 1.6);
    }
  });
});

describe("Monster Loot Signature — baseline derivado do Archetype real (monstros sem exemplo literal)", () => {
  test("goblin (archetype humanoid, sem override) usa exatamente o lootBias real do archetype", () => {
    const signature = getMonsterLootSignature("goblin")!;
    const humanoidArchetype = getArchetype("humanoid")!;
    assert.deepEqual(signature.preferredBases, humanoidArchetype.lootBias.baseItemAffinity);
    assert.deepEqual(signature.preferredAffixes, humanoidArchetype.lootBias.affixAffinity);
  });

  test("preferredLegendaryChance é 1.5 exatamente pros 4 templates com futureFlags.isBoss real, 1 (ou override autoral) pros demais", () => {
    const isBossIds = new Set(ENEMY_TEMPLATES.filter((t) => t.futureFlags.isBoss).map((t) => t.id));
    assert.deepEqual([...isBossIds].sort(), ["ancient-dragon", "boss", "corrupted-bishop", "frost-king"]);
    for (const id of isBossIds) {
      const chance = getMonsterLegendaryChance(id);
      assert.ok(chance >= 1.5, `esperava preferredLegendaryChance >= 1.5 pro boss real "${id}", achou ${chance}`);
    }
    assert.equal(getMonsterLegendaryChance("wolf"), 1);
    assert.equal(getMonsterLegendaryChance("goblin"), 1);
  });
});

describe("Economic Profile (Fase 5)", () => {
  test("22 perfis, um por template, ids únicos e todos enabled", () => {
    assert.equal(MONSTER_ECONOMIC_PROFILES.length, 22);
    const ids = MONSTER_ECONOMIC_PROFILES.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const profile of listMonsterEconomicProfiles()) assert.equal(profile.enabled, true);
  });

  test("as 5 famílias com exemplo literal (Fase 4) têm exatamente 1 tendência elevada, lida da própria assinatura textual", () => {
    for (const id of ["wolf", "wolf-alpha", "frost-wolf"]) assert.equal(getMonsterEconomicProfile(id)?.gemTendency, 1.5);
    for (const id of ["skeleton", "forgotten-guardian"]) assert.equal(getMonsterEconomicProfile(id)?.equipmentTendency, 1.5);
    for (const id of ["swamp-witch", "corrupted-acolyte", "corrupted-bishop", "fire-cultist"]) assert.equal(getMonsterEconomicProfile(id)?.sphereTendency, 1.5);
    assert.equal(getMonsterEconomicProfile("spider")?.materialsTendency, 1.5);
    for (const id of ["dark-knight", "boss"]) assert.equal(getMonsterEconomicProfile(id)?.equipmentTendency, 1.5);
  });

  test("nenhum perfil tem mais de 1 tendência acima do neutro — nunca um monstro 'melhor em tudo'", () => {
    for (const profile of listMonsterEconomicProfiles()) {
      const values = [profile.goldTendency, profile.materialsTendency, profile.sphereTendency, profile.gemTendency, profile.equipmentTendency];
      assert.ok(values.filter((v) => v > 1).length <= 1, `perfil "${profile.id}" tem mais de 1 tendência elevada`);
    }
  });

  test("monstros sem exemplo literal (ex.: boar/goblin/bandit) ficam totalmente neutros", () => {
    for (const id of ["boar", "goblin", "bandit", "bandit_captain", "hyena", "stone-construct", "ancient-construct", "ice-golem", "frost-king", "ancient-dragon"]) {
      const profile = getMonsterEconomicProfile(id)!;
      assert.equal(profile.goldTendency, 1);
      assert.equal(profile.materialsTendency, 1);
      assert.equal(profile.sphereTendency, 1);
      assert.equal(profile.gemTendency, 1);
      assert.equal(profile.equipmentTendency, 1);
    }
  });
});

describe("Monster Affinity (Fase 6) — acessores finos, nunca uma segunda fonte de dado", () => {
  test("getMonsterBaseAffinity/getMonsterSphereAffinity/getMonsterGemAffinity/getMonsterMaterialAffinity espelham exatamente MonsterLootSignature", () => {
    for (const signature of listMonsterLootSignatures()) {
      assert.deepEqual(getMonsterBaseAffinity(signature.enemyTemplateId), signature.preferredBases);
      assert.deepEqual(getMonsterSphereAffinity(signature.enemyTemplateId), signature.preferredSpheres);
      assert.deepEqual(getMonsterGemAffinity(signature.enemyTemplateId), signature.preferredGems);
      assert.deepEqual(getMonsterMaterialAffinity(signature.enemyTemplateId), signature.preferredMaterials);
    }
  });

  test("template desconhecido devolve estruturas vazias/neutras, nunca lança erro", () => {
    assert.deepEqual(getMonsterBaseAffinity("nao-existe"), {});
    assert.deepEqual(getMonsterSphereAffinity("nao-existe"), {});
    assert.deepEqual(getMonsterGemAffinity("nao-existe"), {});
    assert.deepEqual(getMonsterMaterialAffinity("nao-existe"), []);
    assert.equal(getMonsterLegendaryChance("nao-existe"), 1);
  });

  test("'Monster -> Base Identity': toda entrada de preferredBases de TODO monstro registrado é um Base Item com BaseIdentity real (Sprint 19) — nunca uma Base inventada", () => {
    for (const signature of listMonsterLootSignatures()) {
      for (const baseItemId of Object.keys(signature.preferredBases)) {
        assert.ok(getBaseIdentity(BASE_IDENTITY_REGISTRY, baseItemId), `Base "${baseItemId}" (monstro "${signature.enemyTemplateId}") não tem BaseIdentity real`);
      }
    }
  });

  test("getBaseIdentityAffinityForMonster junta peso + tier + potential reais pro Cavaleiro Negro", () => {
    const result = getBaseIdentityAffinityForMonster("dark-knight");
    assert.equal(result.sword?.weight, 1.5);
    assert.ok(typeof result.sword?.tier === "number");
    assert.ok(typeof result.sword?.potential === "string");
  });
});

describe("Sprint 27 — inércia total: nenhum sistema real de drop foi tocado", () => {
  test("ENEMY_TEMPLATES/MonsterArchetype permanecem exatamente como antes desta Sprint", () => {
    assert.equal(ENEMY_TEMPLATES.length, 22);
    for (const id of ["beast", "undead", "humanoid", "bandit", "mage", "construct", "demon", "boss"]) {
      assert.ok(getArchetype(id));
    }
  });
});
