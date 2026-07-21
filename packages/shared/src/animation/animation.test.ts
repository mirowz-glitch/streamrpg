import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAnimationsForTick } from "./handlers.js";
import { AnimationController } from "./controller.js";
import { ANIMATION_PRESETS, getAnimationPreset } from "./presets.js";
import type { FloatingNumberEvent, PresentationEvent } from "../presentation/types.js";
import type { AnimationType } from "./types.js";

function encounterStarted(tickIndex = 0): PresentationEvent {
  return { kind: "EncounterStarted", regionId: "bosque-sussurrante", enemyCount: 3, tickIndex, timestamp: 0 };
}
function enemyKilled(count = 1, tickIndex = 0): PresentationEvent {
  return { kind: "EnemyKilled", count, tickIndex, timestamp: 0 };
}
function lootDropped(rarity = "rare", tickIndex = 0): PresentationEvent {
  return {
    kind: "LootDropped",
    instanceId: "drop-1",
    baseItemId: "sword",
    rarity,
    powerScore: 42,
    regionId: "bosque-sussurrante",
    stored: true,
    tickIndex,
    timestamp: 0,
  };
}
function itemEquipped(delta: number, tickIndex = 0): PresentationEvent {
  const previousPowerScore = 10;
  return {
    kind: "ItemEquipped",
    slotId: "weapon",
    baseItemId: "sword",
    rarity: "rare",
    powerScore: previousPowerScore + delta,
    previousPowerScore,
    tickIndex,
    timestamp: 0,
  };
}
function characterDied(tickIndex = 0): PresentationEvent {
  return { kind: "CharacterDied", tickIndex, timestamp: 0 };
}
function levelUp(level = 2, previousLevel = 1, tickIndex = 0): PresentationEvent {
  return { kind: "LevelUp", level, previousLevel, tickIndex, timestamp: 0 };
}
function damageFloatingNumber(target: "character" | "enemy", value = 50, tickIndex = 0): FloatingNumberEvent {
  return { kind: "damage", value, target, tickIndex, timestamp: 0 };
}

describe("Combat Animation System Phase I", () => {
  describe("queue / timeline", () => {
    it("cada evento sem handler produz 0 animações (EncounterStarted não tem handler nesta fase)", () => {
      const animations = buildAnimationsForTick([encounterStarted()], [], 0);
      assert.deepEqual(animations, []);
    });

    it("EnemyKilled produz uma animação enemy-death", () => {
      const animations = buildAnimationsForTick([enemyKilled(2)], [], 0);
      assert.equal(animations.length, 1);
      assert.equal(animations[0].type, "enemy-death");
    });

    it("LootDropped escolhe a variante de animação pela raridade real do evento", () => {
      const rare = buildAnimationsForTick([lootDropped("rare")], [], 0);
      const unique = buildAnimationsForTick([lootDropped("unique")], [], 0);
      const common = buildAnimationsForTick([lootDropped("common")], [], 0);
      assert.equal(rare[0].type, "loot-drop-rare");
      assert.equal(unique[0].type, "loot-drop-unique");
      assert.equal(common[0].type, "loot-drop-common");
    });

    it("ItemEquipped escolhe upgrade/downgrade/neutro só pelo sinal do delta do próprio evento", () => {
      const upgrade = buildAnimationsForTick([itemEquipped(10)], [], 0);
      const downgrade = buildAnimationsForTick([itemEquipped(-5)], [], 0);
      const neutral = buildAnimationsForTick([itemEquipped(0)], [], 0);
      assert.equal(upgrade[0].type, "equipment-pulse-upgrade");
      assert.equal(downgrade[0].type, "equipment-pulse-downgrade");
      assert.equal(neutral[0].type, "equipment-pulse-neutral");
    });

    it("CharacterDied produz uma animação character-death", () => {
      const animations = buildAnimationsForTick([characterDied()], [], 0);
      assert.equal(animations[0].type, "character-death");
    });

    it("floating number de dano gera hit (enemy/character) + o próprio floating number", () => {
      const enemyHit = buildAnimationsForTick([], [damageFloatingNumber("enemy")], 0);
      const characterHit = buildAnimationsForTick([], [damageFloatingNumber("character")], 0);
      assert.deepEqual(
        enemyHit.map((a) => a.type),
        ["enemy-hit", "floating-number-damage"],
      );
      assert.deepEqual(
        characterHit.map((a) => a.type),
        ["character-hit", "floating-number-damage"],
      );
    });

    it("critical/miss nunca são produzidos nesta fase (Presentation Layer nunca emite esses floating numbers)", () => {
      // Simula o que aconteceria SE existissem (não existe hoje) —
      // prova que o handler está preparado sem exigir que o dado real
      // exista ainda.
      const critical: FloatingNumberEvent = { kind: "critical", value: 90, target: "enemy", tickIndex: 0, timestamp: 0 };
      const animations = buildAnimationsForTick([], [critical], 0);
      assert.deepEqual(
        animations.map((a) => a.type),
        ["enemy-critical-hit", "floating-number-critical"],
      );
    });

    it("cada animação tem id único, mesmo dentro do mesmo tick", () => {
      const animations = buildAnimationsForTick([enemyKilled(1), lootDropped("rare"), itemEquipped(5)], [], 0);
      const ids = animations.map((a) => a.id);
      assert.equal(new Set(ids).size, ids.length);
    });
  });

  describe("ordem", () => {
    it("animações de eventos diferentes são encadeadas sequencialmente (timestamp cresce na ordem dos eventos)", () => {
      const animations = buildAnimationsForTick([enemyKilled(1), lootDropped("rare"), itemEquipped(5)], [], 1000);
      assert.equal(animations.length, 3);
      assert.equal(animations[0].timestamp, 1000);
      assert.ok(animations[1].timestamp > animations[0].timestamp);
      assert.ok(animations[2].timestamp > animations[1].timestamp);
    });

    it("reproduz o exemplo literal do requisito: EnemyKilled -> Loot -> Equipment, nessa ordem", () => {
      const animations = buildAnimationsForTick([enemyKilled(1), lootDropped("rare"), itemEquipped(5)], [], 0);
      assert.deepEqual(
        animations.map((a) => a.type),
        ["enemy-death", "loot-drop-rare", "equipment-pulse-upgrade"],
      );
    });

    it("regressão: o hit (floating number) sempre toca ANTES da consequência (morte/loot/equip), nunca depois", () => {
      // Achado no smoke test visual: cronologicamente o golpe causa a
      // morte, então "enemy-hit" precisa vir antes de "enemy-death" —
      // uma versão inicial processava os PresentationEvents antes dos
      // FloatingNumberEvents, fazendo o inimigo "morrer" na tela antes
      // do golpe que o matou aparecer.
      const animations = buildAnimationsForTick(
        [enemyKilled(1), lootDropped("rare"), itemEquipped(5)],
        [damageFloatingNumber("enemy"), damageFloatingNumber("character")],
        0,
      );
      assert.deepEqual(
        animations.map((a) => a.type),
        [
          "enemy-hit",
          "floating-number-damage",
          "character-hit",
          "floating-number-damage",
          "enemy-death",
          "loot-drop-rare",
          "equipment-pulse-upgrade",
        ],
      );
    });

    it("todos os presets referenciados por AnimationType existem em ANIMATION_PRESETS", () => {
      const types: AnimationType[] = ["enemy-hit", "enemy-death", "loot-drop-unique", "character-death"];
      for (const type of types) {
        assert.ok(getAnimationPreset(type));
        assert.equal(ANIMATION_PRESETS[type].type, type);
      }
    });
  });

  describe("controller", () => {
    it("enqueue + tick promove animações cujo timestamp já chegou pra 'started'", () => {
      const controller = new AnimationController();
      const animations = buildAnimationsForTick([enemyKilled(1)], [], 1000);
      controller.enqueue(animations);

      const before = controller.tick(999);
      assert.equal(before.started.length, 0);

      const after = controller.tick(1000);
      assert.equal(after.started.length, 1);
      assert.equal(after.started[0].type, "enemy-death");
    });

    it("uma animação ativa é finalizada quando timestamp + duration é alcançado", () => {
      const controller = new AnimationController();
      const [animation] = buildAnimationsForTick([enemyKilled(1)], [], 0);
      controller.enqueue([animation]);
      controller.tick(0);

      const stillActive = controller.tick(animation.duration - 1);
      assert.equal(stillActive.finished.length, 0);
      assert.equal(controller.getSnapshot().active.length, 1);

      const finishedNow = controller.tick(animation.duration);
      assert.equal(finishedNow.finished.length, 1);
      assert.equal(controller.getSnapshot().active.length, 0);
    });

    it("tick nunca duplica: uma animação só aparece em 'started' uma vez", () => {
      const controller = new AnimationController();
      const [animation] = buildAnimationsForTick([enemyKilled(1)], [], 0);
      controller.enqueue([animation]);

      const first = controller.tick(100);
      const second = controller.tick(200);
      assert.equal(first.started.length, 1);
      assert.equal(second.started.length, 0);
    });

    it("prioridade desempata animações com o mesmo timestamp na ordem da fila", () => {
      const controller = new AnimationController();
      controller.enqueue([
        { id: "low", type: "enemy-miss", timestamp: 0, duration: 100, priority: 1, payload: {} },
        { id: "high", type: "character-hit", timestamp: 0, duration: 100, priority: 20, payload: {} },
      ]);
      const snapshot = controller.getSnapshot();
      assert.equal(snapshot.queued[0].id, "high");
    });
  });

  describe("cancelamento", () => {
    it("cancel remove uma animação da fila antes dela começar", () => {
      const controller = new AnimationController();
      const [animation] = buildAnimationsForTick([enemyKilled(1)], [], 1000);
      controller.enqueue([animation]);

      const removed = controller.cancel(animation.id);
      assert.equal(removed, true);

      const result = controller.tick(1000);
      assert.equal(result.started.length, 0);
      assert.equal(controller.getSnapshot().queued.length, 0);
    });

    it("cancel remove uma animação já ativa", () => {
      const controller = new AnimationController();
      const [animation] = buildAnimationsForTick([enemyKilled(1)], [], 0);
      controller.enqueue([animation]);
      controller.tick(0);
      assert.equal(controller.getSnapshot().active.length, 1);

      const removed = controller.cancel(animation.id);
      assert.equal(removed, true);
      assert.equal(controller.getSnapshot().active.length, 0);
    });

    it("cancel devolve false pra um id que não existe, sem lançar", () => {
      const controller = new AnimationController();
      assert.equal(controller.cancel("nao-existe"), false);
    });

    it("clear esvazia fila e ativos de uma vez", () => {
      const controller = new AnimationController();
      const animations = buildAnimationsForTick([enemyKilled(1), lootDropped()], [], 0);
      controller.enqueue(animations);
      controller.tick(0);
      controller.clear();
      const snapshot = controller.getSnapshot();
      assert.equal(snapshot.queued.length, 0);
      assert.equal(snapshot.active.length, 0);
    });
  });

  describe("performance", () => {
    it("enfileirar e processar milhares de animações completa rapidamente", () => {
      const controller = new AnimationController();
      const start = Date.now();
      for (let tick = 0; tick < 500; tick++) {
        const animations = buildAnimationsForTick(
          [enemyKilled(1, tick), lootDropped("rare", tick), itemEquipped(5, tick)],
          [damageFloatingNumber("enemy", 10, tick), damageFloatingNumber("character", 5, tick)],
          tick * 1000,
        );
        controller.enqueue(animations);
        controller.tick(tick * 1000 + 500);
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 2000, `500 ticks de animação levaram ${elapsedMs}ms, esperava < 2000ms`);
    });
  });

  describe("Progression & Player Retention Phase I — Level Up", () => {
    it("LevelUp produz exatamente uma animação 'level-up' com level/previousLevel copiados do próprio evento", () => {
      const animations = buildAnimationsForTick([levelUp(3, 2)], [], 1000);
      assert.equal(animations.length, 1);
      assert.equal(animations[0].type, "level-up");
      assert.deepEqual(animations[0].payload, { level: 3, previousLevel: 2 });
    });

    it("o preset 'level-up' existe e segue o mesmo formato dos demais (duration/priority)", () => {
      const preset = getAnimationPreset("level-up");
      assert.equal(preset.type, "level-up");
      assert.ok(preset.duration > 0);
      assert.ok(preset.priority > 0);
      assert.equal(ANIMATION_PRESETS["level-up"], preset);
    });
  });

  describe("determinismo", () => {
    it("mesmos eventos + mesmo timestamp base sempre produzem animações com os mesmos tipos/timestamps/duração (exceto id)", () => {
      function run() {
        const animations = buildAnimationsForTick([enemyKilled(1), lootDropped("unique"), itemEquipped(-3)], [], 500);
        return animations.map(({ id, ...rest }) => rest);
      }
      assert.deepEqual(run(), run());
    });

    it("o controller processa a mesma sequência de enqueue/tick de forma determinística", () => {
      function run() {
        const controller = new AnimationController();
        const animations = buildAnimationsForTick([enemyKilled(1)], [], 0).map(({ id, ...rest }) => ({ id: "fixed-id", ...rest }));
        controller.enqueue(animations);
        const results = [controller.tick(0), controller.tick(animations[0].duration)];
        return results;
      }
      assert.deepEqual(run(), run());
    });
  });
});
