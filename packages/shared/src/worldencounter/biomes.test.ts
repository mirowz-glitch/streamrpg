import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BIOME_PROGRESSION, getBiomeDefinition, getNextBiome } from "./biomes.js";
import { checkRegionUnlock } from "./regionProgression.js";
import { getEncounterTable } from "./encounterTables.js";
import { getEnemyTemplate } from "../enemy/templates.js";
import { getLootTable } from "../lootgen/lootTables.js";
import { getLootIdentity } from "../lootidentity/lootIdentities.js";
import { getArchetype } from "../lootidentity/archetypes.js";

describe("Biomes, Regions & World Progression Phase I", () => {
  describe("biomas (requisito 1)", () => {
    it("toda BiomeDefinition referencia uma região com Encounter Table real (nenhum levelRange duplicado/inventado)", () => {
      for (const biome of BIOME_PROGRESSION) {
        const table = getEncounterTable(biome.regionId);
        assert.ok(table, `esperava uma Encounter Table pra "${biome.regionId}"`);
      }
    });

    it("a ordem de progressão é sequencial (1..N sem buracos nem repetição)", () => {
      const orders = BIOME_PROGRESSION.map((b) => b.order).sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        assert.equal(orders[i], i + 1);
      }
    });

    it("getNextBiome devolve o bioma de order+1, e undefined pro último da sequência", () => {
      const first = BIOME_PROGRESSION.find((b) => b.order === 1)!;
      const second = BIOME_PROGRESSION.find((b) => b.order === 2)!;
      assert.equal(getNextBiome(first.regionId)?.regionId, second.regionId);

      const last = BIOME_PROGRESSION.find((b) => b.order === BIOME_PROGRESSION.length)!;
      assert.equal(getNextBiome(last.regionId), undefined);
    });

    it("getBiomeDefinition devolve undefined pra uma região sem bioma (ex.: porto-do-amanhecer)", () => {
      assert.equal(getBiomeDefinition("porto-do-amanhecer"), undefined);
    });
  });

  describe("desbloqueio automático (requisito 4)", () => {
    it("não desbloqueia enquanto o nível não atinge o mínimo do próximo bioma", () => {
      const first = BIOME_PROGRESSION.find((b) => b.order === 1)!;
      const second = BIOME_PROGRESSION.find((b) => b.order === 2)!;
      const secondTable = getEncounterTable(second.regionId)!;
      const result = checkRegionUnlock(first.regionId, secondTable.levelRange.min - 1, []);
      assert.equal(result.unlocked, false);
      assert.equal(result.newRegionId, null);
    });

    it("desbloqueia exatamente quando o nível atinge o mínimo do próximo bioma", () => {
      const first = BIOME_PROGRESSION.find((b) => b.order === 1)!;
      const second = BIOME_PROGRESSION.find((b) => b.order === 2)!;
      const secondTable = getEncounterTable(second.regionId)!;
      const result = checkRegionUnlock(first.regionId, secondTable.levelRange.min, []);
      assert.equal(result.unlocked, true);
      assert.equal(result.newRegionId, second.regionId);
    });

    it("nunca desbloqueia uma região já desbloqueada antes (unlockedRegionIds)", () => {
      const first = BIOME_PROGRESSION.find((b) => b.order === 1)!;
      const second = BIOME_PROGRESSION.find((b) => b.order === 2)!;
      const secondTable = getEncounterTable(second.regionId)!;
      const result = checkRegionUnlock(first.regionId, secondTable.levelRange.min + 50, [second.regionId]);
      assert.equal(result.unlocked, false);
    });

    it("o último bioma da sequência nunca desbloqueia nada (não há próximo)", () => {
      const last = BIOME_PROGRESSION.find((b) => b.order === BIOME_PROGRESSION.length)!;
      const result = checkRegionUnlock(last.regionId, 999, []);
      assert.equal(result.unlocked, false);
      assert.equal(result.newRegionId, null);
    });

    it("uma região fora da sequência de biomas nunca desbloqueia nada", () => {
      const result = checkRegionUnlock("porto-do-amanhecer", 999, []);
      assert.equal(result.unlocked, false);
      assert.equal(result.newRegionId, null);
    });
  });

  describe("identidade de monstros e loot regional (requisito 2/3)", () => {
    const newMonsterIds = ["boar", "spider", "hyena", "stone-construct"];

    it("todo monstro novo tem Enemy Template + Loot Table + Loot Identity + Archetype real (nenhum id órfão)", () => {
      for (const monsterId of newMonsterIds) {
        const template = getEnemyTemplate(monsterId);
        assert.ok(template, `esperava um Enemy Template pra "${monsterId}"`);

        const lootTable = getLootTable(monsterId);
        assert.ok(lootTable, `esperava uma Loot Table pra "${monsterId}"`);

        const identity = getLootIdentity(monsterId);
        assert.ok(identity, `esperava uma Monster Loot Identity pra "${monsterId}"`);

        const archetype = getArchetype(identity!.archetypeId);
        assert.ok(archetype, `esperava um Archetype real ("${identity!.archetypeId}") — nenhum arquétipo novo deveria ter sido criado`);
      }
    });

    it("bosque-sussurrante/colinas-aridas/minas-abandonadas referenciam só Enemy Templates que existem de verdade", () => {
      for (const regionId of ["bosque-sussurrante", "colinas-aridas", "minas-abandonadas"]) {
        const table = getEncounterTable(regionId)!;
        for (const entry of table.entries) {
          assert.ok(getEnemyTemplate(entry.enemyTemplateId), `"${regionId}" referencia um Enemy Template desconhecido: "${entry.enemyTemplateId}"`);
        }
      }
    });
  });
});
