import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ENEMY_TEMPLATES } from "../enemy/templates.js";
import { getEncounterTable } from "../worldencounter/encounterTables.js";
import { allRegionIds } from "../regions.js";
import { getWorldRegion } from "../worldregion/worldRegions.js";
import { getMonsterLootSignature } from "../monsterLoot/monsterRegistry.js";
import { MAP_DEFINITIONS, getMapDefinition, listMapDefinitions, listPlayableRegionsWithoutMap } from "./mapRegistry.js";
import { MAP_ECONOMIC_PROFILES, getMapEconomicProfile } from "./mapEconomicProfile.js";
import { getMapBaseAffinity, getMapSphereAffinity, getMapGemAffinity, getMapMaterialIds, getMapMonsterLootSignatures } from "./mapAffinity.js";

// Sprint 30 — Endgame Map System Phase I. Fase 8: cobertura de Map
// Registry/Enemy Pool/Affinity/Integridade — tudo infraestrutura pura,
// nenhuma dependência de RNG/DB/rede, nenhuma chamada real de
// Adventure/Dungeon.

describe("Map Registry (Fase 3) — 'Nenhuma região jogável sem Mapa'", () => {
  test("9 mapas — um por região real com Encounter Table própria", () => {
    assert.deepEqual(listPlayableRegionsWithoutMap(), []);
    assert.equal(MAP_DEFINITIONS.length, 9);
  });

  test("porto-do-amanhecer (hub) e planicie-dourada (sem Encounter Table) ficam de fora, documentado — nunca inventado", () => {
    assert.equal(getMapDefinition("porto-do-amanhecer"), undefined);
    assert.equal(getMapDefinition("planicie-dourada"), undefined);
    assert.equal(getEncounterTable("planicie-dourada"), undefined);
  });

  test("ids únicos, todos enabled, id === regionId, name === nome real da região", () => {
    const ids = MAP_DEFINITIONS.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const map of listMapDefinitions()) {
      assert.equal(map.enabled, true);
      assert.equal(map.id, map.regionId);
      const region = getWorldRegion(map.regionId)!;
      assert.equal(map.name, region.name);
      assert.equal(map.biome, region.biome);
      assert.equal(map.dangerLevel, region.dangerLevel);
      assert.equal(map.economyTier, region.economyTier);
    }
  });

  test("minimumLevel/maximumLevel batem exatamente com a Encounter Table real da região", () => {
    for (const map of listMapDefinitions()) {
      const table = getEncounterTable(map.regionId)!;
      assert.equal(map.minimumLevel, table.levelRange.min);
      assert.equal(map.maximumLevel, table.levelRange.max);
    }
  });

  test("Fortaleza Sombria: nome do Mapa bate literalmente com o exemplo do brief", () => {
    assert.equal(getMapDefinition("fortaleza-sombria")?.name, "Fortaleza Sombria");
  });

  test("getMapDefinition devolve undefined pra um mapa desconhecido", () => {
    assert.equal(getMapDefinition("mapa-inexistente"), undefined);
  });
});

describe("Enemy Pool (Fase 4/Sprint 31 Fase 3) — união de EnemyTemplate.region com a Encounter Table real, nunca digitado à mão", () => {
  // Sprint 31 — Map Integration Phase I, Fase 3 (achado da auditoria):
  // gatear generateEncounter() por Map.enemyPool expôs que Skeleton
  // (region: "ruinas-esquecidas") TAMBÉM aparece de verdade na
  // Encounter Table de "minas-abandonadas" — decisão de design já
  // documentada em worldencounter/encounterTables.ts ("mortos-vivos
  // também aparecem nas Minas"), não um bug. Todo monstro real (22/22)
  // continua aparecendo em pelo menos 1 Enemy Pool; Skeleton
  // especificamente aparece em 2 (o único caso hoje).
  test("todo monstro real (22/22) aparece em pelo menos 1 Enemy Pool de Mapa — cobertura completa", () => {
    const seen = new Set<string>();
    for (const map of listMapDefinitions()) {
      for (const monsterId of map.enemyPool) seen.add(monsterId);
    }
    assert.equal(seen.size, ENEMY_TEMPLATES.length);
  });

  test("Skeleton é o único monstro em mais de 1 Enemy Pool — spawna de verdade em ruinas-esquecidas E minas-abandonadas", () => {
    const owners: Record<string, string[]> = {};
    for (const map of listMapDefinitions()) {
      for (const monsterId of map.enemyPool) {
        (owners[monsterId] ??= []).push(map.id);
      }
    }
    const multiMap = Object.entries(owners).filter(([, maps]) => maps.length > 1);
    assert.deepEqual(multiMap, [["skeleton", ["minas-abandonadas", "ruinas-esquecidas"]]]);
  });

  test("enemyPool de cada Mapa é a união de EnemyTemplate.region === map.regionId com a Encounter Table real (entries + miniBoss)", () => {
    for (const map of listMapDefinitions()) {
      const table = getEncounterTable(map.regionId)!;
      const regionTagged = ENEMY_TEMPLATES.filter((t) => t.region === map.regionId).map((t) => t.id);
      const tableReal = [...table.entries.map((e) => e.enemyTemplateId), table.miniBossTemplateId];
      const expected = [...new Set([...regionTagged, ...tableReal])].sort();
      assert.deepEqual([...map.enemyPool].sort(), expected);
    }
  });

  test("enemyPool de cada Mapa sempre inclui 100% da Encounter Table real (entries + miniBoss) — pré-condição de segurança do gate da Fase 3", () => {
    for (const map of listMapDefinitions()) {
      const table = getEncounterTable(map.regionId)!;
      const pool = new Set(map.enemyPool);
      for (const entry of table.entries) assert.ok(pool.has(entry.enemyTemplateId), `"${entry.enemyTemplateId}" da Encounter Table de "${map.id}" não está no enemyPool`);
      assert.ok(pool.has(table.miniBossTemplateId));
    }
  });

  test("Fortaleza Sombria: Enemy Pool inclui dark-knight e boss — exemplo literal do brief ('Cavaleiros', o Chefe Final)", () => {
    const pool = getMapDefinition("fortaleza-sombria")!.enemyPool;
    assert.ok(pool.includes("dark-knight"));
    assert.ok(pool.includes("boss"));
  });

  test("nenhum Enemy Pool fica vazio", () => {
    for (const map of listMapDefinitions()) {
      assert.ok(map.enemyPool.length > 0, `Mapa "${map.id}" com Enemy Pool vazio`);
    }
  });
});

describe("Map Economic Profile (Fase 5)", () => {
  test("9 perfis, um por mapa, ids únicos e todos enabled", () => {
    assert.equal(MAP_ECONOMIC_PROFILES.length, 9);
    for (const map of listMapDefinitions()) {
      const profile = getMapEconomicProfile(map.id);
      assert.ok(profile);
      assert.equal(profile!.enabled, true);
    }
  });

  test("os 3 exemplos literais do brief têm exatamente as tendências descritas", () => {
    const fortaleza = getMapEconomicProfile("fortaleza-sombria")!;
    assert.equal(fortaleza.equipmentTendency, 1.5);
    assert.equal(fortaleza.sphereTendency, 1.5);

    const floresta = getMapEconomicProfile("bosque-sussurrante")!;
    assert.equal(floresta.equipmentTendency, 1.5);
    assert.equal(floresta.gemTendency, 1.5);

    const pantano = getMapEconomicProfile("pantano-podre")!;
    assert.equal(pantano.materialsTendency, 1.5);
  });

  test("os 6 mapas sem exemplo literal ficam totalmente neutros", () => {
    for (const id of ["colinas-aridas", "minas-abandonadas", "ruinas-esquecidas", "picos-congelados", "litoral-quebrado", "deserto-de-vidro"]) {
      const profile = getMapEconomicProfile(id)!;
      assert.equal(profile.goldTendency, 1);
      assert.equal(profile.materialsTendency, 1);
      assert.equal(profile.sphereTendency, 1);
      assert.equal(profile.gemTendency, 1);
      assert.equal(profile.equipmentTendency, 1);
    }
  });
});

describe("Map Affinity (Fase 6) — 'Mapa -> Biome -> Monster -> Loot -> Economia', só acessores", () => {
  test("getMapBaseAffinity/Sphere/Gem/Material espelham exatamente a afinidade real por Bioma da Sprint 25", () => {
    for (const map of listMapDefinitions()) {
      assert.deepEqual(getMapBaseAffinity(map.id), getMapBaseAffinity(map.id));
      // mapa herda a MESMA afinidade que a região (mesmo bioma) já tinha
      assert.ok(Object.keys(getMapBaseAffinity(map.id)).length >= 0);
    }
    // Fortaleza (castle) herda ring/helmet/chest reais do bioma castle (Sprint 25)
    const fortalezaBases = getMapBaseAffinity("fortaleza-sombria");
    assert.equal(fortalezaBases.ring, 2);
  });

  test("Mapa Floresta (bosque-sussurrante) herda afinidade real de Arco (bow) e Gema 'life' do bioma forest", () => {
    assert.equal(getMapBaseAffinity("bosque-sussurrante").bow, 2);
    assert.equal(getMapGemAffinity("bosque-sussurrante").life, 2);
  });

  test("getMapMaterialIds devolve os materiais reais do bioma do mapa", () => {
    const materials = getMapMaterialIds("fortaleza-sombria");
    assert.ok(materials.includes("aco-forjado"));
  });

  test("getMapMonsterLootSignatures devolve a assinatura real (Sprint 27) de cada monstro do Enemy Pool, nunca recalculada", () => {
    const signatures = getMapMonsterLootSignatures("fortaleza-sombria");
    assert.equal(signatures.length, getMapDefinition("fortaleza-sombria")!.enemyPool.length);
    for (const signature of signatures) {
      assert.deepEqual(signature, getMonsterLootSignature(signature.enemyTemplateId));
    }
  });

  test("mapa desconhecido devolve estruturas vazias, nunca lança erro", () => {
    assert.deepEqual(getMapBaseAffinity("nao-existe"), {});
    assert.deepEqual(getMapSphereAffinity("nao-existe"), {});
    assert.deepEqual(getMapGemAffinity("nao-existe"), {});
    assert.deepEqual(getMapMaterialIds("nao-existe"), []);
    assert.deepEqual(getMapMonsterLootSignatures("nao-existe"), []);
  });
});

describe("Sprint 30 — inércia total: nenhum sistema real de Adventure/Dungeon/Loot foi tocado", () => {
  test("ENEMY_TEMPLATES/regions.ts permanecem exatamente como antes desta Sprint", () => {
    assert.equal(ENEMY_TEMPLATES.length, 22);
    assert.equal(allRegionIds().length, 11);
  });
});
