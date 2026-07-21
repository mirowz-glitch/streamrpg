import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveCombat } from "./combatEngine.js";
import type { CombatContext, Combatant } from "./types.js";

function emptyFinalStats() {
  return {
    maximumLife: 0,
    maximumMana: 0,
    physicalDamage: 0,
    spellDamage: 0,
    criticalChance: 0,
    accuracy: 0,
    attackSpeed: 0,
    movementSpeed: 0,
    armor: 0,
    lifeLeech: 0,
    resistances: { physical: 0, fire: 0, cold: 0, lightning: 0 },
    powerScore: 0,
  };
}

function combatant(overrides: Partial<Combatant["finalStats"]> = {}, currentLife = 500, criticalMultiplier = 1.5): Combatant {
  return {
    finalStats: { ...emptyFinalStats(), ...overrides },
    criticalMultiplier,
    currentLife,
  };
}

function context(overrides: Partial<CombatContext> = {}): CombatContext {
  return {
    attacker: combatant({ physicalDamage: 100, accuracy: 200, criticalChance: 0 }),
    target: combatant({ armor: 0 }, 500),
    seed: 1,
    timestamp: 0,
    attackType: "physical",
    ...overrides,
  };
}

describe("Combat Engine Phase I", () => {
  describe("hit", () => {
    it("accuracy muito alta (200) acerta com frequência consistente com a fórmula (accuracy / (accuracy + baselineEvasion))", () => {
      // accuracy=200, baselineEvasion=100 (config.ts) -> hitChance
      // teórica = 200/300 ~= 66,7%. Não deveria ser >150/200 (75%) —
      // o teste original assumia isso errado; o valor certo é ~133/200.
      let hits = 0;
      for (let seed = 0; seed < 200; seed++) {
        const result = resolveCombat(context({ seed }));
        if (!result.miss) hits++;
      }
      assert.ok(hits > 110 && hits < 155, `esperava algo em torno de 66,7% (~133/200), obteve ${hits}/200`);
    });

    it("accuracy extrema (quase 100% de hit chance) acerta na grande maioria das seeds", () => {
      let hits = 0;
      for (let seed = 0; seed < 200; seed++) {
        const ctx = context({ seed, attacker: combatant({ physicalDamage: 100, accuracy: 2000, criticalChance: 0 }) });
        const result = resolveCombat(ctx);
        if (!result.miss) hits++;
      }
      assert.ok(hits > 170, `esperava a maioria acertar com accuracy extrema, obteve ${hits}/200`);
    });

    it("guaranteedHit sempre acerta, mesmo com accuracy 0", () => {
      for (let seed = 0; seed < 50; seed++) {
        const ctx = context({
          seed,
          guaranteedHit: true,
          attacker: combatant({ physicalDamage: 100, accuracy: 0 }),
        });
        const result = resolveCombat(ctx);
        assert.equal(result.miss, false);
      }
    });
  });

  describe("miss", () => {
    it("accuracy 0 (sem guaranteedHit) erra na grande maioria das seeds", () => {
      let misses = 0;
      for (let seed = 0; seed < 200; seed++) {
        const ctx = context({ seed, attacker: combatant({ physicalDamage: 100, accuracy: 0 }) });
        const result = resolveCombat(ctx);
        if (result.miss) misses++;
      }
      assert.ok(misses > 150, `esperava a maioria errar com accuracy 0, obteve ${misses}/200`);
    });

    it("miss sempre produz damage=0, critical=false, lifeLeech=0 e remainingLife inalterada", () => {
      let foundMiss = false;
      for (let seed = 0; seed < 200 && !foundMiss; seed++) {
        const ctx = context({ seed, attacker: combatant({ physicalDamage: 100, accuracy: 0 }), target: combatant({}, 321) });
        const result = resolveCombat(ctx);
        if (!result.miss) continue;
        foundMiss = true;
        assert.equal(result.damage, 0);
        assert.equal(result.critical, false);
        assert.equal(result.lifeLeech, 0);
        assert.equal(result.remainingLife, 321);
      }
      assert.ok(foundMiss, "esperava achar ao menos um miss em 200 seeds");
    });
  });

  describe("critical", () => {
    it("criticalChance 100% sempre produz critical=true e dano maior que sem crítico", () => {
      const baseCtx = context({
        attacker: combatant({ physicalDamage: 100, accuracy: 200, criticalChance: 0 }, 500, 2.0),
        guaranteedHit: true,
      });
      const critCtx = { ...baseCtx, attacker: { ...baseCtx.attacker, finalStats: { ...baseCtx.attacker.finalStats, criticalChance: 100 } } };

      const noCritResult = resolveCombat(baseCtx);
      const critResult = resolveCombat(critCtx);

      assert.equal(critResult.critical, true);
      assert.ok(critResult.damage > noCritResult.damage, "dano crítico deveria ser maior que o dano normal");
    });

    it("criticalChance 0% nunca produz critical=true", () => {
      for (let seed = 0; seed < 200; seed++) {
        const ctx = context({ seed, guaranteedHit: true, attacker: combatant({ physicalDamage: 100, accuracy: 200, criticalChance: 0 }) });
        const result = resolveCombat(ctx);
        assert.equal(result.critical, false);
      }
    });
  });

  describe("armor", () => {
    it("mais armor no alvo reduz o dano recebido", () => {
      const noArmor = resolveCombat(context({ guaranteedHit: true, target: combatant({ armor: 0 }, 1000) }));
      const withArmor = resolveCombat(context({ guaranteedHit: true, target: combatant({ armor: 500 }, 1000) }));
      assert.ok(withArmor.damage < noArmor.damage, "dano com armor deveria ser menor que sem armor");
    });

    it("armor não afeta dano do tipo Chaos (bypassa mitigação, convenção clássica de ARPG)", () => {
      const noArmor = resolveCombat(context({ guaranteedHit: true, attackType: "chaos", target: combatant({ armor: 0 }, 1000) }));
      const withArmor = resolveCombat(context({ guaranteedHit: true, attackType: "chaos", target: combatant({ armor: 99999 }, 1000) }));
      assert.equal(withArmor.damage, noArmor.damage);
    });
  });

  describe("life leech", () => {
    it("lifeLeech > 0 produz um valor de cura proporcional ao dano causado", () => {
      const ctx = context({
        guaranteedHit: true,
        attacker: combatant({ physicalDamage: 100, accuracy: 200, criticalChance: 0, lifeLeech: 10 }),
      });
      const result = resolveCombat(ctx);
      assert.ok(result.lifeLeech > 0);
      assert.ok(result.lifeLeech < result.damage, "leech de 10% deveria ser bem menor que o dano total");
    });

    it("lifeLeech 0 nunca produz cura", () => {
      const ctx = context({ guaranteedHit: true, attacker: combatant({ physicalDamage: 100, accuracy: 200, lifeLeech: 0 }) });
      const result = resolveCombat(ctx);
      assert.equal(result.lifeLeech, 0);
    });
  });

  describe("zero damage", () => {
    it("attacker sem physicalDamage produz dano 0, sem lançar erro", () => {
      const ctx = context({ guaranteedHit: true, attacker: combatant({ physicalDamage: 0, accuracy: 200, criticalChance: 0 }) });
      const result = resolveCombat(ctx);
      assert.equal(result.damage, 0);
      assert.equal(result.lifeLeech, 0);
    });

    it("tipos de dano ainda não funcionais (Fire/Cold/Lightning/Chaos) sempre produzem dano 0 hoje", () => {
      for (const attackType of ["fire", "cold", "lightning", "chaos"] as const) {
        const ctx = context({ guaranteedHit: true, attackType, attacker: combatant({ physicalDamage: 100, accuracy: 200 }) });
        const result = resolveCombat(ctx);
        assert.equal(result.damage, 0, `${attackType} deveria ser 0 nesta fase`);
      }
    });
  });

  describe("dead target", () => {
    it("atacar um alvo já com currentLife 0 mantém remainingLife em 0, nunca negativa", () => {
      const ctx = context({ guaranteedHit: true, target: combatant({ armor: 0 }, 0) });
      const result = resolveCombat(ctx);
      assert.equal(result.remainingLife, 0);
    });

    it("dano maior que a vida restante nunca deixa remainingLife negativa", () => {
      const ctx = context({
        guaranteedHit: true,
        attacker: combatant({ physicalDamage: 100000, accuracy: 200, criticalChance: 0 }),
        target: combatant({ armor: 0 }, 50),
      });
      const result = resolveCombat(ctx);
      assert.equal(result.remainingLife, 0);
      assert.ok(result.remainingLife >= 0);
    });
  });

  describe("determinismo", () => {
    it("mesmo Combat Context (mesma seed) sempre produz o mesmo Combat Result", () => {
      const ctx = context({ seed: 42 });
      assert.deepEqual(resolveCombat(ctx), resolveCombat(ctx));
    });

    it("seeds diferentes tendem a produzir resultados diferentes", () => {
      const a = resolveCombat(context({ seed: 1 }));
      const b = resolveCombat(context({ seed: 2 }));
      assert.notDeepEqual(a, b);
    });

    it("resolveCombat nunca muta os Combatants recebidos", () => {
      const attacker = combatant({ physicalDamage: 100, accuracy: 200 });
      const target = combatant({ armor: 0 }, 500);
      const attackerCopy = JSON.parse(JSON.stringify(attacker));
      const targetCopy = JSON.parse(JSON.stringify(target));
      resolveCombat({ attacker, target, seed: 1, timestamp: 0, attackType: "physical", guaranteedHit: true });
      assert.deepEqual(attacker, attackerCopy);
      assert.deepEqual(target, targetCopy);
    });
  });

  describe("performance", () => {
    it("10000 resolveCombat() completam rapidamente", () => {
      const start = Date.now();
      for (let seed = 0; seed < 10000; seed++) {
        resolveCombat(context({ seed }));
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 2000, `10000 resoluções levaram ${elapsedMs}ms, esperava < 2000ms`);
    });
  });
});
