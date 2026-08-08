/**
 * Sprint 22 — Living Combat Phase I, Fase 8/12. Cobertura de
 * `getCharacterByProfileId`'s `combatSnapshot` — o único ponto que
 * agrega o Combat Resolver (packages/shared) através de TODOS os itens
 * equipados de um personagem real. Substitui a suíte da Sprint 21
 * (`activeGemEffects`/`resolvedStats`, removidos — "nunca duas
 * versões", agora tudo passa por `combatSnapshot`). Mesma ressalva de
 * ambiente já documentada em gem.service.test.ts: `DB_PATH=":memory:"`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { createSocketConfiguration, getItemPower, type SocketConfiguration } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, equipItem } from "../services/drop.service.js";
import { createGemForTesting, socketGem } from "../services/gem.service.js";
import { getCharacterByProfileId } from "./character.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-chareffect-test-${RUN_ID}`;
const CHARACTER_ID = `char-chareffect-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-chareffect-test-${RUN_ID}`,
    "GemEffectTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Gem Effect Tester",
    0,
  );
  // Desincroniza deliberadamente `items.id` de `character_items.id`
  // (5 linhas de `items` sem `character_items` correspondente,
  // avançando só a sequência de `items`) — sem isso, num banco
  // `:memory:` novo, as duas sequências crescem 1:1 e um teste que
  // confunde `character_item_id` com `item_id` (o bug real encontrado
  // na Fase 12, Browser Validation da Sprint 21) passaria por
  // coincidência. O mesmo canário protege o Combat Snapshot desta
  // Sprint, que também depende de `item.item_id` (não `character_item_id`)
  // pra consultar `gems.socketed_item_id`.
  for (let i = 0; i < 5; i++) {
    db.prepare(`INSERT INTO items (slug, name, rarity, slot) VALUES (?, ?, ?, ?)`).run(`decoy-item-${RUN_ID}-${i}`, "Decoy", "common", "weapon");
  }
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM gems WHERE character_id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

function grantEquippedItemWithSockets(slot: string, socketCount = 2) {
  const item = grantAdventureLoot(CHARACTER_ID, null, {
    baseItemId: `test-item-${Math.random().toString(36).slice(2)}`,
    name: "Item de Teste de Efeito",
    rarity: "rare",
    slot,
    powerScore: 10,
  });
  const config: SocketConfiguration = createSocketConfiguration(socketCount, 54321);
  getDb().prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(config), item.item_id);
  equipItem(CHARACTER_ID, item.id);
  return { item, config };
}

describe("getCharacterByProfileId — Combat Snapshot (Sprint 22)", () => {
  test("personagem sem nenhum item equipado ainda tem um combatSnapshot real (Base Attributes de nível/classe)", async () => {
    const character = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(character);
    assert.ok(character!.combatSnapshot.life > 0, "vida base do personagem (Character Build) nunca é 0, mesmo sem equipamento");
    assert.equal(character!.combatSnapshot.itemScore, 0);
  });

  test("combat (campo legado) é sourceado do MESMO combatSnapshot, nunca um segundo cálculo", async () => {
    grantEquippedItemWithSockets("weapon", 1);
    const character = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(character);
    assert.equal(character!.combat.attack_physical, character!.combatSnapshot.attack);
    assert.equal(character!.combat.attack_magic, character!.combatSnapshot.magic);
    assert.equal(character!.combat.resistance_physical, character!.combatSnapshot.defense);
  });

  test("Gema com efeito socketada num item equipado eleva o combatSnapshot (flat)", async () => {
    const { item, config } = grantEquippedItemWithSockets("armor", 1);
    // Canário: prova que item.id (character_item_id) e item.item_id
    // (items.id) são REALMENTE diferentes nesta suíte — protege contra
    // o bug real de ID trocado encontrado na Sprint 21.
    assert.notEqual(item.id, item.item_id);

    const before = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(before);
    const lifeBefore = before!.combatSnapshot.life;

    const gem = createGemForTesting(CHARACTER_ID, "emerald-1", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const after = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(after);
    assert.equal(after!.combatSnapshot.life, lifeBefore + 30);
  });

  test("Gema com efeito percent (attack) soma 5% sobre o attack do EQUIPAMENTO (getItemPower), nunca sobre o physicalDamage de Base Attributes do personagem", async () => {
    const { item, config } = grantEquippedItemWithSockets("weapon", 1);
    // O item é "rare"/"weapon" — mesma base usada por getItemPower em
    // realEquipmentStats.ts, nunca duplicada aqui como número mágico.
    const itemFlatAttack = getItemPower(item.rarity, item.slot).attack;
    const before = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(before);

    const gem = createGemForTesting(CHARACTER_ID, "ruby-3", 3);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const after = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(after);
    // Ponto flutuante: diferença acumulada por várias somas (derived +
    // equipamento + gema) — comparar com tolerância, nunca igualdade exata.
    assert.ok(Math.abs(after!.combatSnapshot.attack - before!.combatSnapshot.attack - itemFlatAttack * 0.05) < 1e-9);
  });

  test("Gema sem GemDefinition registrada (gemType desconhecido) nunca lança e nunca altera o combatSnapshot", async () => {
    const { item, config } = grantEquippedItemWithSockets("boots", 1);
    const before = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(before);

    const gem = createGemForTesting(CHARACTER_ID, "gema-sem-catalogo-nem-efeito", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const after = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(after);
    assert.deepEqual(after!.combatSnapshot, before!.combatSnapshot);
  });

  test("itemScore soma power_score de todos os itens equipados", async () => {
    const before = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(before);
    grantEquippedItemWithSockets("gloves", 1);
    const after = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(after);
    assert.equal(after!.combatSnapshot.itemScore, before!.combatSnapshot.itemScore + 10);
  });
});

describe("getCharacterByProfileId — GemBehaviors (Sprint 23 — Sockets & Gems Phase II)", () => {
  test("Rubi socketado aparece em activeGemBehaviors = MESMA lista de combatSnapshot.activeBehaviors, nunca duplicada", async () => {
    const { item, config } = grantEquippedItemWithSockets("helmet", 1);
    const before = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(before);
    const countBefore = before!.activeGemBehaviors.length;

    const gem = createGemForTesting(CHARACTER_ID, "ruby-1", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const after = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(after);
    assert.equal(after!.activeGemBehaviors.length, countBefore + 1);
    const newEntry = after!.activeGemBehaviors.find((b) => b.gemType === "ruby-1");
    assert.ok(newEntry);
    assert.equal(newEntry!.behaviorKind, "onHitBonusFireDamage");
    assert.equal(newEntry!.gemDisplayName, "Rubi I");
    // "nunca duplicar" — mesma referência de array, não duas cópias
    // recalculadas separadamente.
    assert.equal(after!.activeGemBehaviors, after!.combatSnapshot.activeBehaviors);
  });

  test("Gema sem behaviorId (citrine-1) nunca aparece em activeGemBehaviors", async () => {
    const { item, config } = grantEquippedItemWithSockets("belt", 1);
    const before = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(before);
    const countBefore = before!.activeGemBehaviors.length;

    const gem = createGemForTesting(CHARACTER_ID, "citrine-1", 1);
    const socketed = socketGem(CHARACTER_ID, gem.id, item.id, config.sockets[0].id);
    assert.equal(socketed.success, true);

    const after = await getCharacterByProfileId(PROFILE_ID);
    assert.ok(after);
    assert.equal(after!.activeGemBehaviors.length, countBefore);
    assert.equal(after!.activeGemBehaviors.some((b) => b.gemType === "citrine-1"), false);
  });
});
