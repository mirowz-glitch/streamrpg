import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateEncounter } from "./generator.js";
import { spawnWorldEncounter } from "./spawn.js";
import { ENCOUNTER_TABLES, getEncounterTable } from "./encounterTables.js";
import { getEnemyTemplate } from "../enemy/templates.js";

describe("World Encounter System Phase I", () => {
  describe("integridade de dados", () => {
    it("toda Encounter Table referencia Enemy Templates que existem de verdade", () => {
      for (const table of ENCOUNTER_TABLES) {
        for (const entry of table.entries) {
          assert.ok(
            getEnemyTemplate(entry.enemyTemplateId),
            `região "${table.regionId}" referencia Enemy Template inexistente "${entry.enemyTemplateId}"`,
          );
        }
      }
    });

    it("toda Encounter Table tem levelRange e packSizeOptions válidos", () => {
      for (const table of ENCOUNTER_TABLES) {
        assert.ok(table.levelRange.min <= table.levelRange.max, `região "${table.regionId}" tem levelRange invertido`);
        assert.ok(table.packSizeOptions.length > 0, `região "${table.regionId}" sem packSizeOptions`);
        for (const option of table.packSizeOptions) {
          assert.ok(option.slots >= 1);
          assert.ok(option.weight > 0);
        }
        for (const entry of table.entries) {
          assert.ok(entry.minimumGroup >= 1);
          assert.ok(entry.minimumGroup <= entry.maximumGroup);
          assert.ok(entry.minimumLevel <= entry.maximumLevel);
        }
      }
    });
  });

  describe("regiões", () => {
    it("lança erro para região sem Encounter Table", () => {
      assert.throws(() => generateEncounter("planicie-dourada", 10, 1), /região sem Encounter Table/);
    });

    it("gera encontro com sucesso para toda região cadastrada", () => {
      for (const table of ENCOUNTER_TABLES) {
        const midLevel = Math.round((table.levelRange.min + table.levelRange.max) / 2);
        assert.doesNotThrow(() => generateEncounter(table.regionId, midLevel, 1));
      }
    });
  });

  describe("pesos", () => {
    // Biomes, Regions & World Progression Phase I — bosque-sussurrante
    // ganhou Boar/Spider como "Identidade de Monstros" adicional (ver
    // enemy/templates.ts) — Wolf continua maioria (peso 60 vs 25/15),
    // mas a região deixou de ter um único entry.
    it("bosque-sussurrante produz Wolf com muito mais frequência que Boar/Spider (peso 60 vs 25/15)", () => {
      let wolfCount = 0;
      let otherCount = 0;
      for (let seed = 0; seed < 500; seed++) {
        const result = generateEncounter("bosque-sussurrante", 8, seed);
        for (const group of result.groups) {
          if (group.enemyTemplateId === "wolf") wolfCount++;
          else otherCount++;
        }
      }
      assert.ok(wolfCount > otherCount, `esperava Wolf (${wolfCount}) mais frequente que Boar+Spider somados (${otherCount})`);
    });

    it("colinas-aridas (Bandit peso 80 vs Bandit Captain peso 20) produz Bandit com muito mais frequência", () => {
      let banditCount = 0;
      let captainCount = 0;
      for (let seed = 0; seed < 500; seed++) {
        const result = generateEncounter("colinas-aridas", 25, seed);
        for (const group of result.groups) {
          if (group.enemyTemplateId === "bandit") banditCount++;
          if (group.enemyTemplateId === "bandit_captain") captainCount++;
        }
      }
      assert.ok(banditCount > 0 && captainCount > 0, "esperava ver os dois tipos em 500 seeds");
      assert.ok(banditCount > captainCount * 2, `Bandit (${banditCount}) deveria aparecer bem mais que Bandit Captain (${captainCount})`);
    });
  });

  describe("determinismo", () => {
    it("mesmo regionId + mesmo playerLevel + mesma seed sempre produz o mesmo EncounterResult", () => {
      const a = generateEncounter("bosque-sussurrante", 10, 42);
      const b = generateEncounter("bosque-sussurrante", 10, 42);
      assert.deepEqual(a, b);
    });

    it("seeds diferentes tendem a produzir resultados diferentes", () => {
      const a = generateEncounter("colinas-aridas", 25, 1);
      const b = generateEncounter("colinas-aridas", 25, 2);
      assert.notDeepEqual(a, b);
    });

    it("spawnWorldEncounter é determinístico ponta a ponta (mesma receita = mesmas Enemy Instances)", () => {
      // spawnWorldEncounter() não recebe spawnTime explícito — cada
      // EnemyInstance usa Date.now() como default (mesmo padrão de
      // timestamp/deathTime no resto do projeto). Isso é o único campo
      // genuinamente não-determinístico do resultado (podendo variar
      // 1ms entre as duas chamadas abaixo, achado real ao rodar a
      // suíte inteira junto com outras); comparamos tudo ignorando só
      // esse campo.
      const recipe = generateEncounter("bosque-sussurrante", 10, 999);
      const a = spawnWorldEncounter(recipe);
      const b = spawnWorldEncounter(recipe);
      const stripSpawnTime = (encounter: typeof a) => ({
        ...encounter,
        enemies: encounter.enemies.map(({ spawnTime, ...rest }) => rest),
      });
      assert.deepEqual(stripSpawnTime(a), stripSpawnTime(b));
    });
  });

  describe("escalonamento", () => {
    it("o nível de cada grupo nunca sai da interseção região x entry x template", () => {
      for (let seed = 0; seed < 300; seed++) {
        const result = generateEncounter("colinas-aridas", 30, seed);
        const table = getEncounterTable("colinas-aridas")!;
        for (const group of result.groups) {
          const entry = table.entries.find((e) => e.enemyTemplateId === group.enemyTemplateId)!;
          const template = getEnemyTemplate(group.enemyTemplateId)!;
          const min = Math.max(table.levelRange.min, entry.minimumLevel, template.levelRange.min);
          const max = Math.min(table.levelRange.max, entry.maximumLevel, template.levelRange.max);
          assert.ok(group.level >= min && group.level <= max, `nível ${group.level} fora de [${min},${max}] pra ${group.enemyTemplateId}`);
        }
      }
    });

    it("fortaleza-sombria clampa o Boss numa faixa mais estreita que a do próprio Enemy Template (60-80 vs 20-80)", () => {
      for (let seed = 0; seed < 100; seed++) {
        const result = generateEncounter("fortaleza-sombria", 40, seed);
        for (const group of result.groups) {
          assert.ok(group.level >= 60, `Boss nível ${group.level} deveria respeitar o mínimo regional de 60`);
        }
      }
    });

    it("nível nunca é fixo: variância real observada em várias seeds", () => {
      const levels = new Set<number>();
      for (let seed = 0; seed < 200; seed++) {
        const result = generateEncounter("colinas-aridas", 30, seed);
        for (const group of result.groups) levels.add(group.level);
      }
      assert.ok(levels.size > 1, "esperava mais de um nível distinto em 200 seeds");
    });
  });

  describe("grupos", () => {
    it("quantidade de cada grupo respeita minimumGroup/maximumGroup do entry", () => {
      const table = getEncounterTable("bosque-sussurrante")!;
      const entry = table.entries[0];
      for (let seed = 0; seed < 300; seed++) {
        const result = generateEncounter("bosque-sussurrante", 8, seed);
        for (const group of result.groups) {
          assert.ok(group.count >= entry.minimumGroup && group.count <= entry.maximumGroup);
          assert.equal(group.instanceSeeds.length, group.count);
        }
      }
    });

    it("minas-abandonadas produz encontros com múltiplos grupos (composição) em algumas seeds", () => {
      // Vertical Slice — Player Journey, Retention & First Hour Experience
      // Phase I — Fase 3 (Encounter Tables): colinas-aridas deixou de
      // demonstrar composição multi-grupo (packSizeOptions reduzido a
      // 100% de 1 slot, corrigindo um "gauntlet" de 100% de taxa de
      // morte causado pela reordenação de BIOME_PROGRESSION — ver
      // biomes.ts/encounterTables.ts). Minas-abandonadas já tinha a
      // MESMA composição multi-grupo (packSizeOptions com slots:2,
      // stone-construct + skeleton) desde a Sprint de Biomas — assume o
      // papel de demonstração deste teste, nenhum dado novo.
      let sawMultipleGroups = false;
      for (let seed = 0; seed < 200 && !sawMultipleGroups; seed++) {
        const result = generateEncounter("minas-abandonadas", 15, seed);
        if (result.groups.length > 1) sawMultipleGroups = true;
      }
      assert.ok(sawMultipleGroups, "esperava ao menos um encontro com mais de 1 grupo em 200 seeds");
    });

    it("cada instanceSeed dentro de um grupo é único (evita colisão de instanceId no Enemy System)", () => {
      for (let seed = 0; seed < 100; seed++) {
        const result = generateEncounter("bosque-sussurrante", 8, seed);
        for (const group of result.groups) {
          assert.equal(new Set(group.instanceSeeds).size, group.instanceSeeds.length);
        }
      }
    });
  });

  describe("spawn", () => {
    it("spawnWorldEncounter nunca é chamado dentro de generateEncounter (a receita não contém EnemyInstance nenhuma)", () => {
      const result = generateEncounter("bosque-sussurrante", 8, 1);
      assert.ok(!("enemies" in result));
    });

    it("spawnWorldEncounter produz o número certo de Enemy Instances, todas vivas", () => {
      const recipe = generateEncounter("colinas-aridas", 30, 5);
      const encounter = spawnWorldEncounter(recipe);
      const expectedTotal = recipe.groups.reduce((sum, g) => sum + g.count, 0);
      assert.equal(encounter.enemies.length, expectedTotal);
      for (const enemy of encounter.enemies) {
        assert.equal(enemy.alive, true);
        assert.equal(enemy.currentLife, enemy.maximumLife);
      }
    });

    it("cada Enemy Instance spawnada tem o nível do seu grupo e um instanceId distinto", () => {
      const recipe = generateEncounter("bosque-sussurrante", 8, 777);
      const encounter = spawnWorldEncounter(recipe);
      const instanceIds = new Set(encounter.enemies.map((e) => e.instanceId));
      assert.equal(instanceIds.size, encounter.enemies.length, "instanceIds deveriam ser todos únicos");
      for (const enemy of encounter.enemies) {
        const group = recipe.groups.find((g) => g.enemyTemplateId === enemy.templateId)!;
        assert.equal(enemy.level, group.level);
      }
    });
  });

  describe("performance", () => {
    it("1000 gerações + spawns completam rapidamente", () => {
      const start = Date.now();
      for (let seed = 0; seed < 1000; seed++) {
        const recipe = generateEncounter("colinas-aridas", 30, seed);
        spawnWorldEncounter(recipe);
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 3000, `1000 iterações levaram ${elapsedMs}ms, esperava < 3000ms`);
    });
  });
});
