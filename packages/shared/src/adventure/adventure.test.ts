import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CharacterBuild } from "../characterbuild/characterBuild.js";
import { Inventory } from "../inventory/inventory.js";
import { Equipment } from "../equipment/equipment.js";
import { createAdventureCharacter, createAdventureSession, getSessionResult } from "./session.js";
import { advanceAdventure } from "./adventureLoop.js";
import { tryAutoEquip } from "./autoEquip.js";
import { generateItem } from "../itemgen/generator.js";

function strongHero(sessionSuffix = "1") {
  const build = new CharacterBuild(`hero-${sessionSuffix}`, "warrior", 0);
  for (let i = 0; i < 20; i++) build.addExperience(20000);
  const inventory = new Inventory(`hero-${sessionSuffix}`, 30);
  const equipment = new Equipment(`hero-${sessionSuffix}`);
  return createAdventureCharacter(build, inventory, equipment);
}

function freshSession(regionId = "bosque-sussurrante", seed = 1, suffix = "1") {
  const character = strongHero(suffix);
  return createAdventureSession(`session-${suffix}`, character, regionId, seed, 0);
}

describe("Adventure Loop Phase I", () => {
  describe("sessão completa", () => {
    it("createAdventureSession começa sem encontro ativo, com estatísticas zeradas", () => {
      const session = freshSession();
      assert.equal(session.currentEncounter, null);
      assert.deepEqual(session.statistics, {
        encountersCompleted: 0,
        enemiesKilled: 0,
        damageDealt: 0,
        damageTaken: 0,
        itemsFound: 0,
        itemsEquipped: 0,
        goldFound: 0,
        elapsedTime: 0,
      });
    });

    it("um tick completo resolve um encontro inteiro (personagem forte vence Wolves)", () => {
      const session = freshSession("bosque-sussurrante", 1);
      const tickResult = advanceAdventure(session, { currentTime: 1000 });
      assert.equal(tickResult.encounterGenerated, true);
      assert.ok(tickResult.enemiesEncountered > 0);
      assert.equal(tickResult.characterAlive, true);
      assert.equal(session.currentEncounter, null, "encontro deveria ter sido totalmente resolvido e encerrado");
      assert.equal(session.statistics.encountersCompleted, 1);
      assert.equal(session.statistics.enemiesKilled, tickResult.enemiesEncountered);
    });

    it("lança erro ao chamar advanceAdventure numa sessão cujo personagem já morreu", () => {
      const session = freshSession();
      session.character.currentLife = 0;
      assert.throws(() => advanceAdventure(session), /já está morto/);
    });
  });

  describe("múltiplos encontros", () => {
    it("chamadas sucessivas de advanceAdventure geram e resolvem um novo encontro a cada vez", () => {
      const session = freshSession("bosque-sussurrante", 5);
      advanceAdventure(session, { currentTime: 1000 });
      advanceAdventure(session, { currentTime: 2000 });
      advanceAdventure(session, { currentTime: 3000 });
      assert.equal(session.statistics.encountersCompleted, 3);
      assert.ok(session.statistics.enemiesKilled >= 3);
    });
  });

  describe("combate", () => {
    it("damageDealt/damageTaken são acumulados de verdade a cada tick", () => {
      const session = freshSession("bosque-sussurrante", 7);
      advanceAdventure(session, { currentTime: 1000 });
      assert.ok(session.statistics.damageDealt > 0);
      // damageTaken pode ser 0 se o herói nunca tomar dano de fato
      // (depende dos rolls), então só garantimos que é um número válido.
      assert.ok(Number.isFinite(session.statistics.damageTaken));
      assert.ok(session.statistics.damageTaken >= 0);
    });
  });

  describe("loot", () => {
    it("itens encontrados são adicionados de verdade ao Inventory do personagem", () => {
      const session = freshSession("colinas-aridas", 3);
      // colinas-aridas tem dropChance mais alto (bandit/bandit_captain);
      // roda até achar ao menos 1 item ou esgotar tentativas.
      let found = 0;
      for (let i = 0; i < 20 && found === 0; i++) {
        const tick = advanceAdventure(session, { currentTime: 1000 * (i + 1) });
        found = session.statistics.itemsFound;
        if (!tick.characterAlive) break;
      }
      assert.ok(found > 0, "esperava encontrar ao menos 1 item antes de morrer ou esgotar as tentativas");
      const filledSlots = session.character.inventory.items.filter((slot) => slot.item !== null).length;
      assert.equal(filledSlots, found);
    });
  });

  describe("auto equip", () => {
    it("tryAutoEquip equipa um item que aumenta o Power Score do slot vazio", () => {
      const character = strongHero("equip1");
      const item = generateItem("sword", 60, 1);
      character.inventory.addItem("drop-1", item);
      const equipped = tryAutoEquip(character, "drop-1", item);
      assert.equal(equipped, true);
      assert.deepEqual(character.equipment.getEquippedItem("weapon"), item);
    });

    it("tryAutoEquip nunca troca por um item pior (Power Score menor)", () => {
      const character = strongHero("equip2");
      const strongItem = { ...generateItem("sword", 60, 1), powerScore: 999 };
      const weakItem = { ...generateItem("sword", 60, 2), powerScore: 1 };
      character.inventory.addItem("drop-strong", strongItem);
      character.inventory.addItem("drop-weak", weakItem);
      assert.equal(tryAutoEquip(character, "drop-strong", strongItem), true);
      assert.equal(tryAutoEquip(character, "drop-weak", weakItem), false);
      assert.deepEqual(character.equipment.getEquippedItem("weapon"), strongItem);
    });

    it("advanceAdventure com autoEquip:true equipa itens de verdade durante a aventura", () => {
      const session = freshSession("colinas-aridas", 3);
      let equippedAny = false;
      for (let i = 0; i < 20 && !equippedAny; i++) {
        const tick = advanceAdventure(session, { autoEquip: true, currentTime: 1000 * (i + 1) });
        equippedAny = session.statistics.itemsEquipped > 0;
        if (!tick.characterAlive) break;
      }
      assert.ok(equippedAny, "esperava equipar ao menos 1 item automaticamente antes de morrer ou esgotar as tentativas");
    });

    it("sem autoEquip (padrão), itens encontrados nunca são equipados sozinhos", () => {
      // Sem cura entre encontros (nenhuma Sprint implementou descanso
      // ainda), o herói pode legitimamente morrer depois de vários
      // encontros seguidos — paramos assim que isso acontecer.
      const session = freshSession("colinas-aridas", 3);
      for (let i = 0; i < 10; i++) {
        const tick = advanceAdventure(session, { currentTime: 1000 * (i + 1) });
        if (!tick.characterAlive) break;
      }
      assert.equal(session.statistics.itemsEquipped, 0);
    });
  });

  describe("estatísticas", () => {
    it("elapsedTime reflete currentTime - startTime, de forma determinística", () => {
      const session = freshSession("bosque-sussurrante", 1);
      advanceAdventure(session, { currentTime: 5000 });
      assert.equal(session.statistics.elapsedTime, 5000 - session.startTime);
    });

    it("getSessionResult devolve um resumo consistente com o estado da sessão", () => {
      const session = freshSession("bosque-sussurrante", 1);
      advanceAdventure(session, { currentTime: 1000 });
      const result = getSessionResult(session);
      assert.equal(result.sessionId, session.sessionId);
      assert.equal(result.characterId, session.character.characterBuild.characterId);
      assert.equal(result.region, session.currentRegion);
      assert.deepEqual(result.statistics, session.statistics);
      assert.equal(result.alive, true);
      assert.equal(result.currentLife, session.character.currentLife);
    });
  });

  describe("determinismo", () => {
    it("mesma sessão inicial + mesma sequência de ticks sempre produz o mesmo resultado final", () => {
      function run(): unknown {
        const session = freshSession("bosque-sussurrante", 42, "det");
        advanceAdventure(session, { currentTime: 1000 });
        advanceAdventure(session, { currentTime: 2000 });
        return getSessionResult(session);
      }
      assert.deepEqual(run(), run());
    });
  });

  describe("performance", () => {
    it("100 ticks completam rapidamente", () => {
      // Mede a performance de resolver encontros, não a sobrevivência —
      // sem nenhum sistema de descanso implementado ainda, o herói
      // levaria dano cumulativo por 100 encontros seguidos e morreria
      // no meio do teste; restauramos a vida entre ticks só pra medir o
      // throughput de advanceAdventure() em si.
      const session = freshSession("bosque-sussurrante", 1, "perf");
      const maxLife = session.character.currentLife;
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        session.character.currentLife = maxLife;
        advanceAdventure(session, { currentTime: 1000 * (i + 1) });
      }
      const elapsedMs = Date.now() - start;
      assert.ok(elapsedMs < 3000, `100 ticks levaram ${elapsedMs}ms, esperava < 3000ms`);
    });
  });
});
