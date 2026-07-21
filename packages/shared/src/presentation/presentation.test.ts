import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession, getSessionResult } from "../adventure/session.js";
import { advanceAdventure } from "../adventure/adventureLoop.js";
import { createAdventureTimeline, advanceAdventureWithPresentation } from "./presentationLayer.js";
import { toHealthBarState } from "./healthBar.js";
import { estimateLifeLeech, deriveFloatingNumbers } from "./floatingNumbers.js";
import { xpRewardForKill, MAX_LEVEL, getProgress } from "../xp.js";

function strongHero(suffix = "1") {
  const build = new CharacterBuild(`hero-${suffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`hero-${suffix}`, 30);
  const equipment = new Equipment(`hero-${suffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  const character = strongHero(suffix);
  return createAdventureSession(`session-${suffix}`, character, regionId, seed, 0);
}

describe("Combat Presentation Layer Phase I", () => {
  describe("todos os eventos", () => {
    it("um tick com encontro gerado produz EncounterStarted + AttackStarted", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const { events } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      assert.ok(events.some((e) => e.kind === "EncounterStarted"));
      assert.ok(events.some((e) => e.kind === "AttackStarted"));
    });

    it("AttackHit reflete o delta real de damageDealt/damageTaken do tick", () => {
      const session = freshSession("bosque-sussurrante", 7);
      const timeline = createAdventureTimeline(session.sessionId);
      const { events } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const attackHit = events.find((e) => e.kind === "AttackHit");
      assert.ok(attackHit);
      assert.equal(attackHit!.damageDealt, session.statistics.damageDealt);
      assert.ok(attackHit!.damageDealt > 0);
    });

    it("EnemyKilled reflete o count real de enemiesKilledThisTick", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const { tickResult, events } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const enemyKilled = events.find((e) => e.kind === "EnemyKilled");
      assert.ok(enemyKilled);
      assert.equal(enemyKilled!.count, tickResult.enemiesKilledThisTick);
    });

    it("LootDropped carrega item/raridade/powerScore/origem reais, batendo com o Inventory de verdade", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let lootEvents: ReturnType<typeof advanceAdventureWithPresentation>["events"] = [];
      for (let i = 0; i < 20 && lootEvents.filter((e) => e.kind === "LootDropped").length === 0; i++) {
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        lootEvents = events;
        if (!tickResult.characterAlive) break;
      }
      const drops = lootEvents.filter((e) => e.kind === "LootDropped");
      assert.ok(drops.length > 0, "esperava ao menos um LootDropped antes de morrer ou esgotar tentativas");
      for (const drop of drops) {
        if (drop.kind !== "LootDropped") continue;
        const slot = session.character.inventory.findById(drop.instanceId);
        assert.ok(slot?.item);
        assert.equal(drop.baseItemId, slot!.item!.baseItemId);
        assert.equal(drop.rarity, slot!.item!.rarity);
        assert.equal(drop.powerScore, slot!.item!.powerScore);
        assert.equal(drop.regionId, "colinas-aridas");
      }
    });

    it("ItemEquipped só aparece quando autoEquip está ligado e um item foi de fato equipado", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let equipEvents: ReturnType<typeof advanceAdventureWithPresentation>["events"] = [];
      for (let i = 0; i < 20 && equipEvents.filter((e) => e.kind === "ItemEquipped").length === 0; i++) {
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { autoEquip: true, currentTime: 1000 * (i + 1) });
        equipEvents = events;
        if (!tickResult.characterAlive) break;
      }
      const equips = equipEvents.filter((e) => e.kind === "ItemEquipped");
      assert.ok(equips.length > 0, "esperava ao menos um ItemEquipped com autoEquip ligado");
      for (const equip of equips) {
        if (equip.kind !== "ItemEquipped") continue;
        const equippedItem = session.character.equipment.getEquippedItem(equip.slotId);
        assert.ok(equippedItem);
        assert.equal(equip.baseItemId, equippedItem!.baseItemId);
        assert.equal(typeof equip.previousPowerScore, "number");
        assert.ok(equip.previousPowerScore >= 0);
        assert.ok(equip.previousPowerScore <= equip.powerScore, "Auto Equip só troca por um item de Power Score maior ou igual");
      }
    });

    it("CharacterDied só aparece quando o personagem morre de verdade", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      let died = false;
      for (let i = 0; i < 30 && !died; i++) {
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const diedEvent = events.some((e) => e.kind === "CharacterDied");
        assert.equal(diedEvent, !tickResult.characterAlive);
        died = !tickResult.characterAlive;
      }
      assert.ok(died, "esperava que o personagem morresse em até 30 encontros seguidos sem cura");
    });

    it("regressão: item encontrado E auto-equipado na MESMA tick ainda produz LootDropped (não só ItemEquipped)", () => {
      // Reproduz um caso real encontrado no smoke test: quando o Auto
      // Equip do Adventure Loop equipa um item na mesma tick em que ele
      // foi encontrado, o item nunca chega a "sobrar" no Inventory
      // (equipItem() já remove de lá por dentro) — uma versão inicial
      // desta camada diferenciava só o Inventory antes/depois e perdia
      // o LootDropped por completo nesse caso. Esta seed reproduz
      // exatamente isso na 2ª tick.
      // Elites, Mini-Bosses & Risk/Reward Phase I — seed atualizada de
      // 42 para 15; World Events, Dynamic Encounters & Exploration
      // Phase I — de 15 para 11: cada vez que generateEncounter()
      // (World Encounter) ganha uma rolagem NOVA no início (variante
      // Normal/Elite/Mini-Boss, depois a rolagem de World Event), o
      // stream de RNG desloca pra toda seed já existente (não é
      // regressão de comportamento, só consequência de reaproveitar a
      // MESMA técnica determinística de sempre; ver worldencounter/
      // generator.ts).
      const character = strongHero("regression");
      const session = createAdventureSession("session-regression", character, "colinas-aridas", 11, 0);
      const timeline = createAdventureTimeline(session.sessionId);

      advanceAdventureWithPresentation(session, timeline, { autoEquip: true, currentTime: 1000 });
      const { events } = advanceAdventureWithPresentation(session, timeline, { autoEquip: true, currentTime: 2000 });

      const drop = events.find((e) => e.kind === "LootDropped");
      const equip = events.find((e) => e.kind === "ItemEquipped");
      assert.ok(equip, "esperava um ItemEquipped nesta seed conhecida");
      assert.ok(drop, "esperava um LootDropped correspondente, mesmo o item nunca tendo 'sobrado' no Inventory");
      assert.equal(equip!.baseItemId, drop!.baseItemId);
      assert.ok(events.indexOf(drop!) < events.indexOf(equip!), "LootDropped deveria vir antes de ItemEquipped");
    });

    it("EncounterFinished só aparece quando encountersCompleted realmente incrementa", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const before = session.statistics.encountersCompleted;
      const { events } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const finished = events.some((e) => e.kind === "EncounterFinished");
      assert.equal(finished, session.statistics.encountersCompleted > before);
    });

    it("CriticalHit e Miss nunca são emitidos nesta fase (granularidade por tick, documentado)", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      for (let i = 0; i < 5; i++) {
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        assert.ok(!events.some((e) => e.kind === "CriticalHit"));
        assert.ok(!events.some((e) => e.kind === "Miss"));
        if (!tickResult.characterAlive) break;
      }
    });
  });

  describe("sequência correta", () => {
    it("EncounterStarted sempre vem antes de EncounterFinished no mesmo tick", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      const { events } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const startedIndex = events.findIndex((e) => e.kind === "EncounterStarted");
      const finishedIndex = events.findIndex((e) => e.kind === "EncounterFinished");
      if (startedIndex >= 0 && finishedIndex >= 0) {
        assert.ok(startedIndex < finishedIndex);
      }
    });

    it("LootDropped sempre vem antes de ItemEquipped pro mesmo item, quando ambos existem", () => {
      const session = freshSession("colinas-aridas", 3);
      const timeline = createAdventureTimeline(session.sessionId);
      for (let i = 0; i < 20; i++) {
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { autoEquip: true, currentTime: 1000 * (i + 1) });
        const dropIndex = events.findIndex((e) => e.kind === "LootDropped");
        const equipIndex = events.findIndex((e) => e.kind === "ItemEquipped");
        if (dropIndex >= 0 && equipIndex >= 0) {
          assert.ok(dropIndex < equipIndex);
        }
        if (!tickResult.characterAlive) break;
      }
    });

    it("a Adventure Timeline acumula eventos de múltiplos ticks em ordem, com tickIndex crescente", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const timeline = createAdventureTimeline(session.sessionId);
      advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      advanceAdventureWithPresentation(session, timeline, { currentTime: 2000 });
      advanceAdventureWithPresentation(session, timeline, { currentTime: 3000 });
      assert.equal(timeline.events.length > 0, true);
      let lastTickIndex = -1;
      for (const event of timeline.events) {
        assert.ok(event.tickIndex >= lastTickIndex);
        lastTickIndex = event.tickIndex;
      }
      assert.equal(timeline.nextTickIndex, 3);
    });
  });

  describe("determinismo", () => {
    it("mesma sessão inicial + mesma sequência de ticks sempre produz a mesma Adventure Timeline", () => {
      function run(): unknown {
        const session = freshSession("bosque-sussurrante", 42, "det");
        const timeline = createAdventureTimeline(session.sessionId);
        advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
        advanceAdventureWithPresentation(session, timeline, { currentTime: 2000 });
        return timeline;
      }
      assert.deepEqual(run(), run());
    });

    it("advanceAdventureWithPresentation nunca altera o resultado do gameplay: mesma seed produz o mesmo AdventureTickResult e o mesmo estado final de sessão que advanceAdventure() puro", () => {
      // Engine Observability & Event Derivation Phase I — mesmo suffix
      // (mesmo sessionId) nos dois: `tickResult.lootDrops[].instanceId`
      // agora embute o sessionId (mesmo formato que o Adventure Loop já
      // usava antes, só que agora exposto no retorno da tick) — sessões
      // com nomes diferentes produziriam instanceIds diferentes por
      // construção, o que não é o que este teste quer medir (equivalência
      // de GAMEPLAY, não de identidade de sessão).
      const sessionPure = freshSession("bosque-sussurrante", 99, "pure-presented");
      const sessionPresented = freshSession("bosque-sussurrante", 99, "pure-presented");

      const tickResultPure = advanceAdventure(sessionPure, { currentTime: 1000 });

      const timeline = createAdventureTimeline(sessionPresented.sessionId);
      const { tickResult: tickResultPresented } = advanceAdventureWithPresentation(sessionPresented, timeline, { currentTime: 1000 });

      assert.deepEqual(tickResultPresented, tickResultPure);
      assert.deepEqual(getSessionResult(sessionPresented).statistics, getSessionResult(sessionPure).statistics);
      assert.equal(sessionPresented.character.currentLife, sessionPure.character.currentLife);
    });
  });

  describe("progressão (XP & Level Up) — Progression & Player Retention Phase I", () => {
    it("cada abate concede xpRewardForKill(nível atual) de XP ao Character Build, refletido em timeline.totalXpGranted (Adventure Loop continua sem nenhuma noção de XP)", () => {
      const session = freshSession("bosque-sussurrante", 1, "xp-grant");
      const timeline = createAdventureTimeline(session.sessionId);

      const xpBefore = session.character.characterBuild.experience;
      const levelBefore = session.character.characterBuild.level;
      const { tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 });
      const expectedXp = tickResult.enemiesKilledThisTick * xpRewardForKill(levelBefore);

      assert.equal(session.character.characterBuild.experience, xpBefore + expectedXp);
      assert.equal(timeline.totalXpGranted, expectedXp);
    });

    it("emite LevelUp se e somente se o nível do Character Build realmente mudou naquele tick, usando a curva real de xp.ts", () => {
      // Personagem forte o bastante pra sobreviver com folga (mesmo
      // espírito de strongHero), mas ainda longe do MAX_LEVEL — e
      // posicionado a poucos XP do próximo nível, pra que o abate
      // GARANTIDO da próxima tick cruze o limiar de forma determinística
      // (leveling na curva real é exponencial: um hero maximizado nunca
      // mais levelaria, mesmo com xpRewardForKill escalando por nível).
      const build = new CharacterBuild("hero-levelup", "warrior", 0);
      for (let i = 0; i < 5; i++) build.addExperience(20000);
      const inventory = new Inventory("hero-levelup", 30);
      const equipment = new Equipment("hero-levelup");
      const character = createAdventureCharacter(build, inventory, equipment);

      const progressBefore = getProgress(character.characterBuild.experience);
      assert.ok(progressBefore.level < MAX_LEVEL, "teste pressupõe um nível ainda não máximo");
      character.characterBuild.addExperience(Math.max(0, progressBefore.xp_to_next - 5));

      const session = createAdventureSession("session-levelup", character, "bosque-sussurrante", 5, 0);
      const timeline = createAdventureTimeline(session.sessionId);

      let sawLevelUp = false;
      for (let i = 0; i < 10 && !sawLevelUp; i++) {
        const levelBefore = session.character.characterBuild.level;
        const { events, tickResult } = advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
        const levelUpEvent = events.find((e) => e.kind === "LevelUp");
        const levelAfter = session.character.characterBuild.level;

        assert.equal(Boolean(levelUpEvent), levelAfter > levelBefore, "LevelUp deve aparecer se e só se o nível realmente mudou");
        if (levelUpEvent && levelUpEvent.kind === "LevelUp") {
          assert.equal(levelUpEvent.level, levelAfter);
          assert.equal(levelUpEvent.previousLevel, levelBefore);
          sawLevelUp = true;
        }
        if (!tickResult.characterAlive) break;
      }
      assert.ok(sawLevelUp, "esperava LevelUp assim que o próximo abate cruzasse o limiar de XP");
    });
  });

  describe("health bars", () => {
    it("toHealthBarState calcula o percentual correto, sem nenhuma regra de combate", () => {
      assert.deepEqual(toHealthBarState(50, 100), { current: 50, maximum: 100, percent: 50 });
      assert.deepEqual(toHealthBarState(0, 100), { current: 0, maximum: 100, percent: 0 });
      assert.deepEqual(toHealthBarState(100, 100), { current: 100, maximum: 100, percent: 100 });
      assert.deepEqual(toHealthBarState(10, 0), { current: 10, maximum: 0, percent: 0 });
    });
  });

  describe("floating numbers", () => {
    it("estimateLifeLeech nunca é negativo e reflete o delta real de vida + dano recebido", () => {
      assert.equal(estimateLifeLeech(100, 120, 30), 50);
      assert.equal(estimateLifeLeech(100, 90, 0), 0);
    });

    it("deriveFloatingNumbers só produz damage/lifeLeech quando os valores são > 0", () => {
      const numbers = deriveFloatingNumbers(0, 1000, 50, 0, 0);
      assert.equal(numbers.length, 1);
      assert.equal(numbers[0].kind, "damage");
      assert.equal(numbers[0].target, "enemy");
    });

    it("deriveFloatingNumbers nunca produz critical/miss", () => {
      const numbers = deriveFloatingNumbers(0, 1000, 50, 30, 10);
      assert.ok(!numbers.some((n) => n.kind === "critical" || n.kind === "miss"));
    });
  });

  describe("performance", () => {
    it("100 ticks com presentation completam rapidamente", () => {
      const session = freshSession("bosque-sussurrante", 1, "perf");
      const timeline = createAdventureTimeline(session.sessionId);
      const maxLife = session.character.currentLife;
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        session.character.currentLife = maxLife;
        advanceAdventureWithPresentation(session, timeline, { currentTime: 1000 * (i + 1) });
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 3000, `100 ticks levaram ${elapsedMs}ms, esperava < 3000ms`);
    });
  });
});
