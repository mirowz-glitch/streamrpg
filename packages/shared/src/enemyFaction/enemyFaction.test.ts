import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { getArchetype } from "../lootidentity/archetypes.js";
import { BIOME_REGISTRY } from "../worldregion/biomeRegistry.js";
import { ENEMY_FACTION_REGISTRY, getEnemyFaction, listEnemyFactions } from "./factionRegistry.js";
import { ENEMY_FAMILIES, getEnemyFamily, listEnemyFamilies, getFamilyForTemplate, listFamiliesForFaction, listUnfamiliedTemplateIds } from "./enemyFamilies.js";
import { FACTION_ECONOMY_PROFILES, getFactionEconomyProfile, listFactionEconomyProfiles } from "./factionEconomyProfile.js";
import { getFactionBaseAffinity, getFactionSphereAffinity, getFactionGemAffinity, getFactionMaterialAffinity } from "./factionAffinity.js";
import { FACTION_DROP_PROFILES, getFactionDropProfile, listFactionDropProfiles } from "./factionDropProfile.js";

// Sprint 26 — Enemy Factions Phase I. Fase 9: cobertura de Faction
// Registry/Enemy Families/Faction Economy/Affinity/Drop Profiles —
// tudo infraestrutura pura, nenhuma dependência de RNG/DB/rede.

describe("Faction Registry (Fase 3)", () => {
  test("os 10 exemplos literais do brief estão presentes, ids únicos", () => {
    assert.equal(ENEMY_FACTION_REGISTRY.length, 10);
    const ids = ENEMY_FACTION_REGISTRY.map((f) => f.id);
    assert.equal(new Set(ids).size, ids.length);
    const names = ENEMY_FACTION_REGISTRY.map((f) => f.name);
    for (const expected of ["Goblins", "Mortos-Vivos", "Cultistas", "Bandidos", "Orcs", "Demônios", "Bestas", "Humanos", "Império", "Mercenários"]) {
      assert.ok(names.includes(expected), `esperava "${expected}" no Faction Registry`);
    }
  });

  test("toda facção vem enabled, com hostileTo vazio (infra pura desta Sprint)", () => {
    for (const faction of listEnemyFactions()) {
      assert.equal(faction.enabled, true);
      assert.deepEqual(faction.hostileTo, []);
    }
  });

  test("toda facção referencia um FactionEconomyProfile e um DropProfile reais, mesmo id", () => {
    for (const faction of listEnemyFactions()) {
      assert.equal(faction.economyProfile, faction.id);
      assert.equal(faction.dropProfile, faction.id);
      assert.ok(getFactionEconomyProfile(faction.economyProfile), `sem economy profile pra "${faction.id}"`);
      assert.ok(getFactionDropProfile(faction.dropProfile), `sem drop profile pra "${faction.id}"`);
    }
  });

  test("toda facção.preferredBiomes referencia um bioma real do Biome Registry (Sprint 25)", () => {
    const biomeIds = new Set(BIOME_REGISTRY.map((b) => b.id));
    for (const faction of listEnemyFactions()) {
      for (const biome of faction.preferredBiomes) {
        assert.ok(biomeIds.has(biome), `facção "${faction.id}" aponta pra bioma desconhecido "${biome}"`);
      }
    }
  });

  test("getEnemyFaction devolve undefined pra um id desconhecido", () => {
    assert.equal(getEnemyFaction("nao-existe"), undefined);
  });

  test("Orcs/Humanos/Mercenários ficam com preferredBiomes vazio — inertes, sem Família real ainda", () => {
    for (const id of ["orcs", "humanos", "mercenarios"]) {
      assert.deepEqual(getEnemyFaction(id)?.preferredBiomes, []);
    }
  });
});

describe("Enemy Families (Fase 4)", () => {
  test("toda EnemyFamily.templateIds referencia um Enemy Template real de enemy/templates.ts", () => {
    const realIds = new Set(ENEMY_TEMPLATES.map((t) => t.id));
    for (const family of listEnemyFamilies()) {
      for (const templateId of family.templateIds) {
        assert.ok(realIds.has(templateId), `Família "${family.id}" referencia template desconhecido "${templateId}"`);
      }
    }
  });

  test("todo Enemy Template real pertence a exatamente uma Família — 'Cada família pertence exatamente a uma Facção', e cada template pertence exatamente a uma família", () => {
    assert.deepEqual(listUnfamiliedTemplateIds(), []);

    const seen = new Map<string, string>();
    for (const family of ENEMY_FAMILIES) {
      for (const templateId of family.templateIds) {
        assert.equal(seen.has(templateId), false, `template "${templateId}" aparece em mais de uma Família (${seen.get(templateId)} e ${family.id})`);
        seen.set(templateId, family.id);
      }
    }
    assert.equal(seen.size, ENEMY_TEMPLATES.length);
  });

  test("toda EnemyFamily.factionId referencia uma Facção real do Registry", () => {
    for (const family of listEnemyFamilies()) {
      assert.ok(getEnemyFaction(family.factionId), `Família "${family.id}" referencia facção desconhecida "${family.factionId}"`);
    }
  });

  test("getFamilyForTemplate encontra a família certa; template desconhecido devolve undefined", () => {
    assert.equal(getFamilyForTemplate("wolf")?.id, "familia-lobo");
    assert.equal(getFamilyForTemplate("dark-knight")?.id, "familia-cavaleiro-negro");
    assert.equal(getFamilyForTemplate("monstro-inexistente"), undefined);
  });

  test("listFamiliesForFaction devolve só as famílias daquela facção", () => {
    const bestasFamilies = listFamiliesForFaction("bestas").map((f) => f.id).sort();
    assert.deepEqual(bestasFamilies, ["familia-aranha", "familia-hiena", "familia-javali", "familia-lobo"]);
  });

  test("getEnemyFamily encontra por id; id desconhecido devolve undefined", () => {
    assert.equal(getEnemyFamily("familia-goblin")?.factionId, "goblins");
    assert.equal(getEnemyFamily("nao-existe"), undefined);
  });

  test("Cavaleiro Negro e Boss (fortaleza-sombria) pertencem à mesma família e à Facção Império — valida o exemplo do usuário ('preciso farmar os Cavaleiros Negros')", () => {
    const family = getFamilyForTemplate("dark-knight");
    assert.ok(family);
    assert.ok(family!.templateIds.includes("boss"));
    assert.equal(family!.factionId, "imperio");
  });
});

describe("Faction Economy Profile (Fase 5)", () => {
  test("10 perfis, um por facção, ids únicos e todos enabled", () => {
    assert.equal(FACTION_ECONOMY_PROFILES.length, 10);
    for (const faction of listEnemyFactions()) {
      const profile = getFactionEconomyProfile(faction.id);
      assert.ok(profile, `sem economy profile pra "${faction.id}"`);
      assert.equal(profile!.enabled, true);
    }
  });

  test("os 5 exemplos literais do brief têm exatamente a tendência descrita, resto neutro", () => {
    assert.equal(getFactionEconomyProfile("goblins")?.goldTendency, 1.5);
    assert.equal(getFactionEconomyProfile("mortos-vivos")?.materialsTendency, 1.5);
    assert.equal(getFactionEconomyProfile("cultistas")?.sphereTendency, 1.5);
    assert.equal(getFactionEconomyProfile("imperio")?.equipmentTendency, 1.5);
    assert.equal(getFactionEconomyProfile("bestas")?.gemTendency, 1.5);
  });

  test("nenhuma facção tem tendência alta em TODAS as 5 categorias ao mesmo tempo — nunca uma fonte 'melhor em tudo'", () => {
    for (const profile of listFactionEconomyProfiles()) {
      const values = [profile.goldTendency, profile.materialsTendency, profile.sphereTendency, profile.gemTendency, profile.equipmentTendency];
      const aboveNeutral = values.filter((v) => v > 1).length;
      assert.ok(aboveNeutral <= 1, `facção "${profile.id}" tem mais de 1 categoria acima do neutro: ${JSON.stringify(profile)}`);
    }
  });

  test("facções sem exemplo literal (Bandidos/Orcs/Demônios/Humanos/Mercenários) ficam totalmente neutras", () => {
    for (const id of ["bandidos", "orcs", "demonios", "humanos", "mercenarios"]) {
      const profile = getFactionEconomyProfile(id)!;
      assert.equal(profile.goldTendency, 1);
      assert.equal(profile.materialsTendency, 1);
      assert.equal(profile.sphereTendency, 1);
      assert.equal(profile.gemTendency, 1);
      assert.equal(profile.equipmentTendency, 1);
    }
  });
});

describe("Faction Affinity (Fase 6) — derivada, nunca inventada", () => {
  test("getFactionBaseAffinity(bestas) é exatamente a união dos lootBias.baseItemAffinity reais dos archetypes das suas famílias (beast)", () => {
    const beastArchetype = getArchetype("beast")!;
    const result = getFactionBaseAffinity("bestas");
    assert.deepEqual(result, beastArchetype.lootBias.baseItemAffinity);
  });

  test("getFactionBaseAffinity(imperio) une os archetypes 'construct' e 'humanoid' (Família Construto + Família Cavaleiro Negro/Boss)", () => {
    const result = getFactionBaseAffinity("imperio");
    const constructArchetype = getArchetype("construct")!;
    const humanoidArchetype = getArchetype("humanoid")!;
    const bossArchetype = getArchetype("boss")!;
    for (const [baseItemId, weight] of Object.entries(constructArchetype.lootBias.baseItemAffinity)) {
      assert.equal(result[baseItemId], Math.max(weight!, humanoidArchetype.lootBias.baseItemAffinity[baseItemId] ?? 0, bossArchetype.lootBias.baseItemAffinity[baseItemId] ?? 0));
    }
  });

  test("facção sem nenhuma família real (orcs) tem afinidade de base vazia", () => {
    assert.deepEqual(getFactionBaseAffinity("orcs"), {});
  });

  test("getFactionSphereAffinity/getFactionGemAffinity/getFactionMaterialAffinity derivam de worldregion via preferredBiomes — facção sem bioma preferido fica vazia", () => {
    assert.deepEqual(getFactionSphereAffinity("humanos"), {});
    assert.deepEqual(getFactionGemAffinity("mercenarios"), {});
    assert.deepEqual(getFactionMaterialAffinity("orcs"), []);
  });

  test("Cultistas (preferredBiomes inclui 'ruins') herda a afinidade real de Fortuna->Ruínas já registrada na Sprint 25", () => {
    const sphereAffinity = getFactionSphereAffinity("cultistas");
    assert.equal(sphereAffinity.fortune, 2);
  });

  test("Bestas (preferredBiomes inclui 'forest') herda a afinidade real de gema 'life'->Floresta já registrada na Sprint 25", () => {
    const gemAffinity = getFactionGemAffinity("bestas");
    assert.equal(gemAffinity.life, 2);
  });

  test("id de facção desconhecido devolve estruturas vazias, nunca lança erro", () => {
    assert.deepEqual(getFactionSphereAffinity("nao-existe"), {});
    assert.deepEqual(getFactionGemAffinity("nao-existe"), {});
    assert.deepEqual(getFactionMaterialAffinity("nao-existe"), []);
  });
});

describe("Faction Drop Profile (Fase 2/6) — 'Nunca gera Item. Só define o perfil.'", () => {
  test("um DropProfile por facção, mesmo id, todos enabled", () => {
    assert.equal(FACTION_DROP_PROFILES.length, 10);
    for (const faction of listEnemyFactions()) {
      const profile = getFactionDropProfile(faction.id);
      assert.ok(profile);
      assert.equal(profile!.id, faction.id);
      assert.equal(profile!.enabled, true);
    }
  });

  test("rarityWeightMultipliers vazio e goldMultiplier neutro em toda facção — a tendência de ouro vive só em FactionEconomyProfile, nunca duplicada aqui", () => {
    for (const profile of listFactionDropProfiles()) {
      assert.deepEqual(profile.rarityWeightMultipliers, {});
      assert.equal(profile.goldMultiplier, 1);
    }
  });

  test("baseAffinity/sphereAffinity/gemAffinity/materialTypes do perfil batem exatamente com as funções de derivação (Fase 6)", () => {
    for (const faction of listEnemyFactions()) {
      const profile = getFactionDropProfile(faction.id)!;
      assert.deepEqual(profile.baseAffinity, getFactionBaseAffinity(faction.id));
      assert.deepEqual(profile.sphereAffinity, getFactionSphereAffinity(faction.id));
      assert.deepEqual(profile.gemAffinity, getFactionGemAffinity(faction.id));
      assert.deepEqual(profile.materialTypes, getFactionMaterialAffinity(faction.id));
    }
  });

  test("getFactionDropProfile devolve undefined pra uma facção desconhecida", () => {
    assert.equal(getFactionDropProfile("nao-existe"), undefined);
  });
});

describe("Sprint 26 — inércia total: nenhum sistema real de drop foi tocado", () => {
  test("ENEMY_TEMPLATES (enemy/templates.ts) permanece com exatamente 22 entradas, mesmas de antes desta Sprint", () => {
    assert.equal(ENEMY_TEMPLATES.length, 22);
  });

  test("MonsterArchetype (lootidentity/archetypes.ts) permanece com exatamente os mesmos 8 archetypes", () => {
    for (const id of ["beast", "undead", "humanoid", "bandit", "mage", "construct", "demon", "boss"]) {
      assert.ok(getArchetype(id), `archetype "${id}" deveria continuar existindo intocado`);
    }
  });
});
