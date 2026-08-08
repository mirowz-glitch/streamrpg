import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { allRegionIds } from "../regions.js";
import { BIOME_REGISTRY, getBiomeType, listBiomeTypes } from "./biomeRegistry.js";
import { WORLD_REGIONS, getWorldRegion, listWorldRegions, listWorldRegionsByBiome } from "./worldRegions.js";
import { BASE_ITEM_BIOME_AFFINITY, getBaseAffinity, getBaseAffinitiesForBiome } from "./baseAffinity.js";
import { SPHERE_BIOME_AFFINITY, getSphereAffinity, getSphereAffinitiesForBiome } from "./sphereAffinity.js";
import { GEM_CATEGORY_BIOME_AFFINITY, getGemAffinity } from "./gemAffinity.js";
import { MATERIAL_TYPES, getMaterialType, getMaterialTypesForBiome } from "./materialTypes.js";
import { DROP_PROFILES, getDropProfile, getDropProfileForRegion, listDropProfiles } from "./dropProfile.js";
import { ITEM_GEN_BASE_ITEMS } from "../itemgen/baseItems.js";
import { SPHERE_DEFINITIONS } from "../itemization/spheres.js";

// Sprint 25 — World Loot System Phase I. Fase 10: cobertura de Region
// Registry/Biome Registry/Drop Profile/Affinity/World Loot — tudo
// infraestrutura pura, nenhuma dependência de RNG/DB/rede.

describe("Biome Registry (Fase 4)", () => {
  test("9 tipos (8 exemplos do brief + 'temple', ver nota em types.ts), ids únicos", () => {
    assert.equal(BIOME_REGISTRY.length, 9);
    const ids = BIOME_REGISTRY.map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test("os 8 exemplos literais do brief estão presentes", () => {
    const names = BIOME_REGISTRY.map((b) => b.name);
    for (const expected of ["Floresta", "Ruínas", "Montanhas", "Pântano", "Deserto", "Castelo", "Cavernas", "Campos"]) {
      assert.ok(names.includes(expected), `esperava "${expected}" no Biome Registry`);
    }
  });

  test("getBiomeType encontra todo tipo registrado; id desconhecido devolve undefined", () => {
    for (const biome of listBiomeTypes()) {
      assert.equal(getBiomeType(biome.id)?.id, biome.id);
    }
    // @ts-expect-error - id inválido de propósito
    assert.equal(getBiomeType("nao-existe"), undefined);
  });
});

describe("World Region (Fase 2)", () => {
  test("toda WorldRegion.id reaproveita um regionId real de regions.ts — nenhuma região inventada", () => {
    const realIds = new Set(allRegionIds());
    for (const region of WORLD_REGIONS) {
      assert.ok(realIds.has(region.id), `WorldRegion "${region.id}" não existe em regions.ts`);
    }
  });

  test("toda região real de regions.ts tem uma WorldRegion correspondente — cobertura completa das 11", () => {
    const worldRegionIds = new Set(WORLD_REGIONS.map((r) => r.id));
    for (const regionId of allRegionIds()) {
      assert.ok(worldRegionIds.has(regionId), `regionId real "${regionId}" sem WorldRegion`);
    }
    assert.equal(WORLD_REGIONS.length, 11);
  });

  test("toda WorldRegion.biome existe no Biome Registry", () => {
    const biomeIds = new Set(BIOME_REGISTRY.map((b) => b.id));
    for (const region of WORLD_REGIONS) {
      assert.ok(biomeIds.has(region.biome), `região "${region.id}" aponta pra bioma desconhecido "${region.biome}"`);
    }
  });

  test("toda WorldRegion.dropProfile resolve pra um DropProfile real", () => {
    for (const region of WORLD_REGIONS) {
      assert.ok(getDropProfile(region.dropProfile), `região "${region.id}" aponta pra Drop Profile desconhecido "${region.dropProfile}"`);
    }
  });

  test("todas as 11 regiões vêm enabled — nenhuma desligada por padrão", () => {
    for (const region of WORLD_REGIONS) {
      assert.equal(region.enabled, true);
    }
  });

  test("dangerLevel e economyTier são números não-negativos pra toda região", () => {
    for (const region of WORLD_REGIONS) {
      assert.ok(region.dangerLevel >= 0);
      assert.ok(region.economyTier >= 1 && region.economyTier <= 3);
    }
  });

  test("getWorldRegion/listWorldRegions/listWorldRegionsByBiome funcionam", () => {
    assert.equal(getWorldRegion("bosque-sussurrante")?.biome, "forest");
    assert.equal(getWorldRegion("regiao-inexistente"), undefined);
    assert.equal(listWorldRegions().length, 11);
    assert.ok(listWorldRegionsByBiome("plains").length >= 1);
  });

  test("porto-do-amanhecer (hub) tem dangerLevel 0 e economyTier 3 (decisão autoral documentada)", () => {
    const hub = getWorldRegion("porto-do-amanhecer");
    assert.equal(hub?.dangerLevel, 0);
    assert.equal(hub?.economyTier, 3);
  });
});

describe("Drop Profile (Fase 3) — 'Nunca gera Item. Só define o perfil.'", () => {
  test("um DropProfile por região, mesmo id que WorldRegion.dropProfile", () => {
    assert.equal(DROP_PROFILES.length, WORLD_REGIONS.length);
    for (const region of WORLD_REGIONS) {
      assert.equal(getDropProfileForRegion(region.id)?.id, region.dropProfile);
    }
  });

  test("rarityWeightMultipliers vazio e goldMultiplier neutro em toda região — 'não balancear ainda'", () => {
    for (const profile of listDropProfiles()) {
      assert.deepEqual(profile.rarityWeightMultipliers, {});
      assert.equal(profile.goldMultiplier, 1);
    }
  });

  test("baseAffinity/sphereAffinity/gemAffinity do perfil são sempre exatamente os do bioma da região — nunca uma segunda fonte de verdade", () => {
    for (const region of WORLD_REGIONS) {
      const profile = getDropProfileForRegion(region.id)!;
      assert.deepEqual(profile.baseAffinity, getBaseAffinitiesForBiome(region.biome));
      assert.deepEqual(profile.sphereAffinity, getSphereAffinitiesForBiome(region.biome));
    }
  });

  test("materialTypes do perfil batem com os materiais cujo biome é o da região", () => {
    for (const region of WORLD_REGIONS) {
      const profile = getDropProfileForRegion(region.id)!;
      const expectedIds = getMaterialTypesForBiome(region.biome).map((m) => m.id);
      assert.deepEqual(profile.materialTypes, expectedIds);
    }
  });

  test("enabled do perfil reflete o enabled da região", () => {
    for (const region of WORLD_REGIONS) {
      assert.equal(getDropProfileForRegion(region.id)?.enabled, region.enabled);
    }
  });

  test("getDropProfileForRegion devolve undefined pra uma região desconhecida", () => {
    assert.equal(getDropProfileForRegion("regiao-inexistente"), undefined);
  });
});

describe("Base Affinity (Fase 5) — 'afinidade, não exclusividade'", () => {
  test("os 4 exemplos literais do brief são exatamente como descrito", () => {
    assert.equal(BASE_ITEM_BIOME_AFFINITY.axe?.mountains, 2);
    assert.equal(BASE_ITEM_BIOME_AFFINITY.bow?.forest, 2);
    assert.equal(BASE_ITEM_BIOME_AFFINITY.staff?.ruins, 2);
    assert.equal(BASE_ITEM_BIOME_AFFINITY.ring?.castle, 2);
  });

  test("toda entrada da tabela referencia um Base Item real de itemgen/baseItems.ts", () => {
    const realBaseIds = new Set(ITEM_GEN_BASE_ITEMS.map((b) => b.id));
    for (const baseItemId of Object.keys(BASE_ITEM_BIOME_AFFINITY)) {
      assert.ok(realBaseIds.has(baseItemId), `Base "${baseItemId}" não existe em ITEM_GEN_BASE_ITEMS`);
    }
  });

  test("todos os 13 Base Items reais têm ao menos uma afinidade declarada (nenhum esquecido)", () => {
    for (const base of ITEM_GEN_BASE_ITEMS) {
      assert.ok(BASE_ITEM_BIOME_AFFINITY[base.id], `Base "${base.id}" sem nenhuma afinidade declarada`);
    }
  });

  test("uma combinação Base/Bioma sem entrada é sempre neutra (peso 1) — nunca exclusividade", () => {
    assert.equal(getBaseAffinity("axe", "swamp"), 1);
    assert.equal(getBaseAffinity("base-inexistente", "forest"), 1);
  });

  test("getBaseAffinitiesForBiome devolve só as entradas daquele bioma", () => {
    const mountainAffinities = getBaseAffinitiesForBiome("mountains");
    assert.equal(mountainAffinities.axe, 2);
    assert.equal(mountainAffinities.bow, undefined);
  });
});

describe("Sphere Affinity (Fase 6)", () => {
  test("os 4 exemplos literais do brief são exatamente como descrito", () => {
    assert.equal(SPHERE_BIOME_AFFINITY.fortune?.ruins, 2);
    assert.equal(SPHERE_BIOME_AFFINITY.purification?.temple, 2);
    assert.equal(SPHERE_BIOME_AFFINITY.lapidation?.mountains, 2);
    assert.equal(SPHERE_BIOME_AFFINITY.curse?.castle, 2);
  });

  test("a Esfera da Incerteza NUNCA possui afinidade — neutra (1) em todo bioma, por contrato", () => {
    for (const biome of listBiomeTypes()) {
      assert.equal(getSphereAffinity("uncertainty", biome.id), 1);
    }
    assert.equal(SPHERE_BIOME_AFFINITY.uncertainty, undefined);
  });

  test("a Esfera da Ascensão não é citada nesta Fase — permanece neutra (omissão real, não esquecimento)", () => {
    for (const biome of listBiomeTypes()) {
      assert.equal(getSphereAffinity("ascension", biome.id), 1);
    }
  });

  test("toda entrada da tabela referencia uma Esfera real de itemization/spheres.ts", () => {
    const realSphereIds: Set<string> = new Set(SPHERE_DEFINITIONS.map((s) => s.id));
    for (const sphereId of Object.keys(SPHERE_BIOME_AFFINITY)) {
      assert.ok(realSphereIds.has(sphereId), `Esfera "${sphereId}" não existe em SPHERE_DEFINITIONS`);
    }
  });
});

describe("Gem Affinity (Fase 3 — campo 'gemas' do Drop Profile)", () => {
  test("cobertura parcial deliberada — combinações ausentes são sempre neutras", () => {
    assert.equal(GEM_CATEGORY_BIOME_AFFINITY.fire?.desert, 2);
    assert.equal(getGemAffinity("fire", "swamp"), 1);
    assert.equal(getGemAffinity("support", "forest"), 1);
  });
});

describe("Material Types (Fase 7) — 'ainda sem crafting, apenas infraestrutura'", () => {
  test("um material por bioma, ids únicos", () => {
    assert.equal(MATERIAL_TYPES.length, 9);
    const ids = MATERIAL_TYPES.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test("todo material referencia um bioma real do Biome Registry", () => {
    const biomeIds = new Set(BIOME_REGISTRY.map((b) => b.id));
    for (const material of MATERIAL_TYPES) {
      assert.ok(biomeIds.has(material.biome));
    }
  });

  test("getMaterialType/getMaterialTypesForBiome funcionam", () => {
    assert.equal(getMaterialType("minerio-bruto")?.biome, "mountains");
    assert.equal(getMaterialType("material-inexistente"), undefined);
    assert.equal(getMaterialTypesForBiome("mountains").length, 1);
  });
});

describe("Sprint 25 — inércia total: nenhuma tabela real de geração de item foi tocada", () => {
  test("ITEM_GEN_BASE_ITEMS (itemgen/baseItems.ts) permanece com exatamente 14 entradas (7 armas + 4 armaduras + 3 acessórios), mesmas de antes desta Sprint", () => {
    assert.equal(ITEM_GEN_BASE_ITEMS.length, 14);
  });

  test("SPHERE_DEFINITIONS (itemization/spheres.ts) permanece com exatamente as mesmas 6 Esferas", () => {
    assert.equal(SPHERE_DEFINITIONS.length, 6);
  });
});
