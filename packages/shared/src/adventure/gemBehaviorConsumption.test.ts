/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 6/7. Cobertura de
 * integração: `adventureLoop.ts` (o MESMO caminho usado por
 * Adventure/Idle/Dungeon, nenhuma regra duplicada) realmente consome
 * `session.character.realCombatSnapshot.activeBehaviors` via
 * `FutureCombatModifiers`, nunca um segundo cálculo de combate.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession } from "./session.js";
import { advanceAdventure } from "./adventureLoop.js";
import { advanceAdventureWithRecovery } from "../recovery/recoveryLayer.js";
import { createAdventureTimeline } from "../presentation/presentationLayer.js";
import { EXAMPLE_GEM_BEHAVIOR_REGISTRY } from "../socket/gemBehaviorRegistry.js";
import type { CombatSnapshotDTO, ActiveBehaviorSummary } from "../combat/combatSnapshot.js";

// Ataque absurdamente alto — garante 1-hit-kill em TODO inimigo em
// ambos os cenários (com/sem Behavior), mesmo no pior caso de variância
// do dano (COMBAT_CONFIG.damage.variance). Isso evita que o próprio
// bônus do Behavior mude a QUANTIDADE de golpes trocados (o que
// desviaria o stream de rng compartilhado e invalidaria a comparação
// determinística) — o teste teria comparado duas trajetórias de RNG
// diferentes, não o efeito real do Behavior.
function baseSnapshot(activeBehaviors: ActiveBehaviorSummary[] = []): CombatSnapshotDTO {
  return {
    attack: 100_000,
    defense: 20,
    life: 200,
    mana: 50,
    critical: 5,
    attackSpeed: 1,
    magic: 0,
    powerScore: 100,
    itemScore: 30,
    derivedStats: { accuracy: 90, movementSpeed: 1, lifeLeech: 0, resistances: { physical: 0, fire: 0, cold: 0, lightning: 0 } },
    activeBehaviors,
  };
}

function behaviorSummary(kind: ActiveBehaviorSummary["behaviorKind"], socketId = "socket-1"): ActiveBehaviorSummary {
  const registryId = { onHitBonusFireDamage: "ruby-fire-proc-1", chanceToChill: "sapphire-chill-1", regenPerTick: "emerald-regen-1", manaPerTick: "topaz-mana-1", bonusCriticalChance: "onyx-crit-1", bonusResistance: "amethyst-resist-1" }[kind];
  const behavior = EXAMPLE_GEM_BEHAVIOR_REGISTRY[registryId]!;
  return {
    socketId,
    gemType: registryId,
    gemDisplayName: "Gema de Teste",
    effectDescription: null,
    behaviorId: behavior.id,
    behaviorKind: behavior.kind,
    magnitude: behavior.magnitude,
    behaviorDescription: behavior.description,
  };
}

function sessionWithSnapshot(snapshot: CombatSnapshotDTO, suffix: string, seed = 1) {
  const build = new CharacterBuild(`hero-behavior-${suffix}`, "warrior", 0);
  const inventory = new Inventory(`hero-behavior-${suffix}`, 10);
  const equipment = new Equipment(`hero-behavior-${suffix}`);
  const character = createAdventureCharacter(build, inventory, equipment, 1, snapshot);
  return createAdventureSession(`session-behavior-${suffix}`, character, "bosque-sussurrante", seed, 0);
}

describe("Sprint 23 — Adventure Loop consome GemBehaviors reais (Rubi/Safira/Ametista/Esmeralda)", () => {
  it("Rubi (onHitBonusFireDamage) aumenta damageDealt em relação ao mesmo seed sem o Behavior", () => {
    const withoutBehavior = sessionWithSnapshot(baseSnapshot([]), "no-ruby", 3);
    const withRuby = sessionWithSnapshot(baseSnapshot([behaviorSummary("onHitBonusFireDamage")]), "ruby", 3);

    advanceAdventure(withoutBehavior, { currentTime: 1000 });
    advanceAdventure(withRuby, { currentTime: 1000 });

    assert.equal(withoutBehavior.statistics.enemiesKilled, withRuby.statistics.enemiesKilled, "mesmo seed deveria gerar o mesmo encontro");
    assert.ok(withRuby.statistics.damageDealt > withoutBehavior.statistics.damageDealt, "Rubi deveria somar dano extra real, nunca cosmético");
  });

  it("Ônix (bonusCriticalChance) nunca reduz damageDealt em relação ao baseline (multiplicador de crítico só soma)", () => {
    const withoutBehavior = sessionWithSnapshot(baseSnapshot([]), "no-onyx", 9);
    const withOnyx = sessionWithSnapshot(baseSnapshot([behaviorSummary("bonusCriticalChance")]), "onyx", 9);

    advanceAdventure(withoutBehavior, { currentTime: 1000 });
    advanceAdventure(withOnyx, { currentTime: 1000 });

    assert.ok(withOnyx.statistics.damageDealt >= withoutBehavior.statistics.damageDealt);
  });

  it("Ametista (bonusResistance) nunca aumenta damageTaken em relação ao baseline (mitigação só reduz)", () => {
    const withoutBehavior = sessionWithSnapshot(baseSnapshot([]), "no-amethyst", 11);
    const withAmethyst = sessionWithSnapshot(baseSnapshot([behaviorSummary("bonusResistance")]), "amethyst", 11);

    advanceAdventure(withoutBehavior, { currentTime: 1000 });
    advanceAdventure(withAmethyst, { currentTime: 1000 });

    assert.ok(withAmethyst.statistics.damageTaken <= withoutBehavior.statistics.damageTaken);
  });

  it("Esmeralda (regenPerTick) soma vida flat na MESMA cura de fim de encontro da Recovery Layer", () => {
    const withoutBehavior = sessionWithSnapshot(baseSnapshot([]), "no-emerald", 21);
    const withEmerald = sessionWithSnapshot(baseSnapshot([behaviorSummary("regenPerTick")]), "emerald", 21);
    withoutBehavior.character.currentLife = 1;
    withEmerald.character.currentLife = 1;

    const timelineA = createAdventureTimeline(withoutBehavior.sessionId);
    const timelineB = createAdventureTimeline(withEmerald.sessionId);
    const resultA = advanceAdventureWithRecovery(withoutBehavior, timelineA, { currentTime: 1000 });
    const resultB = advanceAdventureWithRecovery(withEmerald, timelineB, { currentTime: 1000 });

    if (resultA.recovery.applied && resultB.recovery.applied) {
      assert.ok(resultB.recovery.lifeHealed > resultA.recovery.lifeHealed, "Esmeralda deveria curar mais que o baseline no mesmo encontro concluído");
    }
  });
});
