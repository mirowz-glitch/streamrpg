import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ENEMY_TEMPLATES, getEnemyTemplate } from "./templates.js";
import { spawnEnemy, killEnemy, applyCombatResultToEnemy } from "./instance.js";
import { computeEnemyBaseAttributes, computeEnemyFinalStats } from "./enemyStats.js";
import { toCombatant } from "./combatant.js";
import { generateLootForKilledEnemy } from "./lootIntegration.js";
import { resolveCombat } from "../combat/combatEngine.js";
import { MONSTER_LOOT_IDENTITIES } from "../lootidentity/lootIdentities.js";
import { getArchetype } from "../lootidentity/archetypes.js";

describe("Enemy System Phase I", () => {
  describe("integridade de dados", () => {
    it("todo Enemy Template referencia um Archetype e uma Loot Identity que existem de verdade", () => {
      for (const template of ENEMY_TEMPLATES) {
        assert.ok(getArchetype(template.archetype), `template "${template.id}" referencia archetype inexistente "${template.archetype}"`);
        assert.ok(
          MONSTER_LOOT_IDENTITIES.some((identity) => identity.monsterId === template.lootIdentityId),
          `template "${template.id}" referencia lootIdentityId inexistente "${template.lootIdentityId}"`,
        );
      }
    });
  });

  describe("spawn", () => {
    it("spawnEnemy cria uma Enemy Instance viva com os campos esperados", () => {
      const template = getEnemyTemplate("wolf")!;
      const instance = spawnEnemy(template, 42, 5);
      assert.equal(instance.templateId, "wolf");
      assert.equal(instance.seed, 42);
      assert.equal(instance.level, 5);
      assert.equal(instance.alive, true);
      assert.equal(instance.currentLife, instance.maximumLife);
      assert.ok(instance.maximumLife > 0);
      assert.equal(instance.position, null);
      assert.deepEqual(instance.futureState, {});
    });

    it("instanceId é derivado deterministicamente de templateId + seed", () => {
      const template = getEnemyTemplate("wolf")!;
      const a = spawnEnemy(template, 42, 5);
      const b = spawnEnemy(template, 42, 5);
      const c = spawnEnemy(template, 43, 5);
      assert.equal(a.instanceId, b.instanceId);
      assert.notEqual(a.instanceId, c.instanceId);
    });

    it("rejeita nível fora do levelRange do template", () => {
      const template = getEnemyTemplate("wolf")!;
      assert.throws(() => spawnEnemy(template, 1, template.levelRange.max + 1));
      assert.throws(() => spawnEnemy(template, 1, template.levelRange.min - 1));
    });

    it("aceita spawnTime/position explícitos via options", () => {
      const template = getEnemyTemplate("wolf")!;
      const instance = spawnEnemy(template, 1, 5, { spawnTime: 1000, position: { x: 10, y: 20 } });
      assert.equal(instance.spawnTime, 1000);
      assert.deepEqual(instance.position, { x: 10, y: 20 });
    });

    it("spawna com sucesso todo Enemy Template cadastrado, no meio do próprio levelRange", () => {
      for (const template of ENEMY_TEMPLATES) {
        const midLevel = Math.round((template.levelRange.min + template.levelRange.max) / 2);
        assert.doesNotThrow(() => spawnEnemy(template, 1, midLevel));
      }
    });
  });

  describe("level", () => {
    it("nível mínimo do template usa exatamente os baseStats (0 níveis de crescimento)", () => {
      const template = getEnemyTemplate("wolf")!;
      const attrs = computeEnemyBaseAttributes(template, template.levelRange.min);
      assert.deepEqual(attrs, template.baseStats);
    });

    it("nível maior sempre produz Final Enemy Stats maiores ou iguais", () => {
      const template = getEnemyTemplate("bandit")!;
      const low = computeEnemyFinalStats(template, template.levelRange.min);
      const high = computeEnemyFinalStats(template, template.levelRange.max);
      assert.ok(high.maximumLife >= low.maximumLife);
      assert.ok(high.physicalDamage >= low.physicalDamage);
      assert.ok(high.powerScore >= low.powerScore);
    });
  });

  describe("growth", () => {
    it("growth é aplicado linearmente a partir do nível 1 (mesma regra do Character Build)", () => {
      const template = getEnemyTemplate("skeleton")!;
      const level = template.levelRange.min + 5;
      const attrs = computeEnemyBaseAttributes(template, level);
      const expectedStrength = template.baseStats.strength + template.growth.strength * (level - 1);
      assert.equal(attrs.strength, expectedStrength);
    });

    it("cada Enemy Template cresce em pelo menos um atributo do nível mínimo ao máximo", () => {
      for (const template of ENEMY_TEMPLATES) {
        const low = computeEnemyBaseAttributes(template, template.levelRange.min);
        const high = computeEnemyBaseAttributes(template, template.levelRange.max);
        const grew = (["strength", "dexterity", "intelligence", "vitality"] as const).some((key) => high[key] > low[key]);
        assert.ok(grew, `template "${template.id}" não cresce em nenhum atributo entre ${template.levelRange.min} e ${template.levelRange.max}`);
      }
    });
  });

  describe("vida", () => {
    it("currentLife começa igual a maximumLife no spawn", () => {
      const template = getEnemyTemplate("boss")!;
      const instance = spawnEnemy(template, 1, 50);
      assert.equal(instance.currentLife, instance.maximumLife);
    });

    it("applyCombatResultToEnemy atualiza currentLife a partir de um Combat Result de verdade", () => {
      const template = getEnemyTemplate("wolf")!;
      let instance = spawnEnemy(template, 1, 10);
      const attackerCombatant = toCombatant(instance, template);
      const targetCombatant = toCombatant(instance, template);

      const result = resolveCombat({
        attacker: attackerCombatant,
        target: targetCombatant,
        seed: 5,
        timestamp: 0,
        attackType: "physical",
        guaranteedHit: true,
      });

      instance = applyCombatResultToEnemy(instance, result);
      assert.equal(instance.currentLife, result.remainingLife);
      assert.ok(instance.currentLife <= instance.maximumLife);
    });

    it("nunca fica com currentLife negativa mesmo levando dano acima da vida restante", () => {
      const template = getEnemyTemplate("goblin")!;
      let instance = spawnEnemy(template, 1, 5);
      const result = resolveCombat({
        attacker: { finalStats: { ...toCombatant(instance, template).finalStats, physicalDamage: 999999, criticalChance: 0 }, criticalMultiplier: 1, currentLife: 100 },
        target: toCombatant(instance, template),
        seed: 1,
        timestamp: 0,
        attackType: "physical",
        guaranteedHit: true,
      });
      instance = applyCombatResultToEnemy(instance, result);
      assert.equal(instance.currentLife, 0);
    });
  });

  describe("morte", () => {
    it("killEnemy marca a instância como morta e registra deathTime", () => {
      const template = getEnemyTemplate("goblin")!;
      const instance = spawnEnemy(template, 1, 5);
      const result = killEnemy(instance, template, 123456);
      assert.equal(result.instance.alive, false);
      assert.equal(result.instance.currentLife, 0);
      assert.equal(result.deathTime, 123456);
    });

    it("killEnemy nunca gera loot diretamente — só devolve o lootIdentityId", () => {
      const template = getEnemyTemplate("goblin")!;
      const instance = spawnEnemy(template, 1, 5);
      const result = killEnemy(instance, template, 1);
      assert.equal(result.lootIdentityId, template.lootIdentityId);
      assert.ok(!("generatedItems" in result), "KillEnemyResult não deveria ter itens gerados");
    });

    it("rejeita matar uma instância já morta", () => {
      const template = getEnemyTemplate("goblin")!;
      let instance = spawnEnemy(template, 1, 5);
      const killResult = killEnemy(instance, template);
      assert.throws(() => killEnemy(killResult.instance, template));
    });

    it("rejeita template que não corresponde à instância", () => {
      const wolfTemplate = getEnemyTemplate("wolf")!;
      const goblinTemplate = getEnemyTemplate("goblin")!;
      const instance = spawnEnemy(wolfTemplate, 1, 5);
      assert.throws(() => killEnemy(instance, goblinTemplate));
    });

    it("killEnemy não muta a instância recebida (devolve uma nova)", () => {
      const template = getEnemyTemplate("goblin")!;
      const instance = spawnEnemy(template, 1, 5);
      killEnemy(instance, template);
      assert.equal(instance.alive, true, "a instância original não deveria ter sido mutada");
    });
  });

  describe("determinismo", () => {
    it("mesmo template + mesmo nível sempre produz os mesmos Final Enemy Stats", () => {
      const template = getEnemyTemplate("bandit_captain")!;
      const a = computeEnemyFinalStats(template, 30);
      const b = computeEnemyFinalStats(template, 30);
      assert.deepEqual(a, b);
    });

    it("mesma seed produz o mesmo resultado de combate ao longo de toda a integração", () => {
      function run(): unknown {
        const template = getEnemyTemplate("wolf")!;
        const instance = spawnEnemy(template, 777, 10, { spawnTime: 0 });
        const combatant = toCombatant(instance, template);
        return resolveCombat({ attacker: combatant, target: combatant, seed: 42, timestamp: 0, attackType: "physical" });
      }
      assert.deepEqual(run(), run());
    });
  });

  describe("integração", () => {
    it("toCombatant produz um Combatant válido, consumível pelo Combat Engine", () => {
      const template = getEnemyTemplate("boss")!;
      const instance = spawnEnemy(template, 1, 50);
      const combatant = toCombatant(instance, template);
      assert.ok(combatant.finalStats.maximumLife > 0);
      assert.equal(combatant.currentLife, instance.currentLife);
      assert.equal(combatant.criticalMultiplier, template.criticalMultiplier);

      assert.doesNotThrow(() =>
        resolveCombat({ attacker: combatant, target: combatant, seed: 1, timestamp: 0, attackType: "physical" }),
      );
    });

    it("generateLootForKilledEnemy integra de ponta a ponta com Loot Identity/Loot Generator", () => {
      const template = getEnemyTemplate("boss")!;
      const instance = spawnEnemy(template, 1, 50);
      const killResult = killEnemy(instance, template);
      const loot = generateLootForKilledEnemy(killResult, instance, 1);
      assert.ok(Array.isArray(loot.generatedItems));
      assert.equal(typeof loot.totalPower, "number");
    });

    it("um Combatant sem criticalMultiplier no template usa o default centralizado", () => {
      const template = getEnemyTemplate("wolf")!;
      const instance = spawnEnemy(template, 1, 5);
      const combatant = toCombatant(instance, template);
      assert.equal(typeof combatant.criticalMultiplier, "number");
      assert.ok(combatant.criticalMultiplier > 0);
    });
  });

  describe("performance", () => {
    it("1000 spawns + resolveCombat completam rapidamente", () => {
      const template = getEnemyTemplate("bandit")!;
      const start = Date.now();
      for (let seed = 0; seed < 1000; seed++) {
        const instance = spawnEnemy(template, seed, 20, { spawnTime: 0 });
        const combatant = toCombatant(instance, template);
        resolveCombat({ attacker: combatant, target: combatant, seed, timestamp: 0, attackType: "physical" });
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 2000, `1000 iterações levaram ${elapsedMs}ms, esperava < 2000ms`);
    });
  });
});
