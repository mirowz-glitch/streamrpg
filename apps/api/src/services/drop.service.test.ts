/**
 * Testes do Sprint 11 — Persistent Items + Affixes (Fase 2-6). Mesma
 * ressalva de ambiente já documentada em blacksmith.service.test.ts:
 * `DB_PATH=":memory:"` só é honrado se nenhum outro arquivo da suíte
 * completa já importou `config/env.js` primeiro.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import type { ItemAffix } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { grantAdventureLoot, listInventory, applyItemUpgrade, equipItem, getEquippedItems, findEquippedItemCatalogId, isRealUpgradeForSlot, recordItemHistoryEvent } from "./drop.service.js";
import { joinKingdom, leaveKingdom } from "./citizen.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-drop-test-${RUN_ID}`;
const CHARACTER_ID = `char-drop-test-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, twitch_id, username) VALUES (?, ?, ?)`).run(
    PROFILE_ID,
    `twitch-drop-test-${RUN_ID}`,
    "DropTester",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name, gold) VALUES (?, ?, ?, ?)`).run(
    CHARACTER_ID,
    PROFILE_ID,
    "Drop Tester",
    0,
  );
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM citizens WHERE character_id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM kingdoms WHERE id = ?`).run(`kingdom-drop-test-${RUN_ID}`);
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

const SAMPLE_PREFIX: ItemAffix = { modId: "test-prefix", type: "prefix", group: "life", name: "Vigoroso", statLabel: "+Vida", tags: [], tier: 1, value: 10 };
const SAMPLE_SUFFIX: ItemAffix = { modId: "test-suffix", type: "suffix", group: "fire", name: "das Chamas", statLabel: "+Dano de Fogo", tags: [], tier: 2, value: 5 };

describe("drop.service — grantAdventureLoot persiste os campos do Sprint 11 (Fase 2-6)", () => {
  test("um item com afixos completos nunca perde prefixos/sufixos/itemLevel/seed na persistência", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-affixed-${Math.random().toString(36).slice(2)}`,
      name: "Espada Afixada de Teste",
      rarity: "rare",
      slot: "weapon",
      powerScore: 30,
      itemLevel: 42,
      seed: 987654321,
      prefixes: [SAMPLE_PREFIX],
      suffixes: [SAMPLE_SUFFIX],
    });

    assert.equal(item.item_level, 42);
    assert.equal(item.seed, 987654321);
    assert.equal(item.affixes.length, 2);
    assert.deepEqual(
      item.affixes.find((a) => a.type === "prefix"),
      SAMPLE_PREFIX,
    );
    assert.deepEqual(
      item.affixes.find((a) => a.type === "suffix"),
      SAMPLE_SUFFIX,
    );
  });

  test("Potential é derivado do seed (determinístico) quando seed está presente", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-potential-${Math.random().toString(36).slice(2)}`,
      name: "Item com Potencial",
      rarity: "common",
      slot: "helmet",
      powerScore: 5,
      seed: 111,
    });

    assert.ok(item.potential);
    assert.ok(item.potential!.ceilingFraction >= 0.6 && item.potential!.ceilingFraction <= 1.0);
  });

  test("sem seed, Potential fica null — nunca inventa um valor", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-no-seed-${Math.random().toString(36).slice(2)}`,
      name: "Item sem Seed",
      rarity: "common",
      slot: "boots",
      powerScore: 5,
    });

    assert.equal(item.potential, null);
  });

  test("Quality nasce em value: 0, craft_state nasce 'open'", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-quality-${Math.random().toString(36).slice(2)}`,
      name: "Item Padrão",
      rarity: "common",
      slot: "gloves",
      powerScore: 5,
    });

    assert.deepEqual(item.quality, { value: 0, scalesAttribute: "" });
    assert.equal(item.craft_state, "open");
  });

  test("History nasce com o evento 'created', dono = characterId", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-history-${Math.random().toString(36).slice(2)}`,
      name: "Item Histórico",
      rarity: "common",
      slot: "amulet",
      powerScore: 5,
    });

    assert.ok(item.history);
    assert.equal(item.history!.firstOwnerCharacterId, CHARACTER_ID);
    assert.equal(item.history!.events.length, 1);
    assert.equal(item.history!.events[0]!.event, "created");
  });

  test("sem prefixos/sufixos, affixes persiste como array vazio (não undefined)", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-empty-affixes-${Math.random().toString(36).slice(2)}`,
      name: "Item Sem Afixos",
      rarity: "common",
      slot: "ring",
      powerScore: 5,
    });

    assert.deepEqual(item.affixes, []);
  });

  test("listInventory() lê de volta exatamente os mesmos afixos persistidos (nenhuma perda no round-trip)", () => {
    const created = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-roundtrip-${Math.random().toString(36).slice(2)}`,
      name: "Item Round-trip",
      rarity: "rare",
      slot: "belt",
      powerScore: 20,
      itemLevel: 10,
      seed: 555,
      prefixes: [SAMPLE_PREFIX],
      suffixes: [SAMPLE_SUFFIX],
    });

    const reread = listInventory(CHARACTER_ID).find((i) => i.id === created.id);
    assert.ok(reread);
    assert.deepEqual(reread!.affixes, created.affixes);
    assert.equal(reread!.item_level, created.item_level);
    assert.equal(reread!.seed, created.seed);
  });
});

// Sprint 14 — Legendary Items + Legacy System.
describe("drop.service — Legacy (Sprint 14, Fase 2/8)", () => {
  test("um item com history ganha legacy/legacyEvents/legacySummary derivados automaticamente", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-legacy-${Math.random().toString(36).slice(2)}`,
      name: "Item com Legado",
      rarity: "common",
      slot: "shield",
      powerScore: 5,
    });

    assert.ok(item.legacy);
    assert.equal(item.legacy!.ownerCount, 1);
    assert.equal(item.legacy!.soldCount, 0);
    assert.equal(item.legacy!.highestSalePrice, null);
    assert.equal(item.legacyEvents.length, 1);
    assert.equal(item.legacyEvents[0]!.type, "created");
    assert.ok(item.legacySummary);
    assert.equal(item.legacySummary!.title, null);
  });
});

describe("drop.service — findEquippedItemCatalogId/recordItemHistoryEvent (Fase 4)", () => {
  test("findEquippedItemCatalogId acha o item_id do slot equipado, null se nada equipado", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-boss-legacy-${Math.random().toString(36).slice(2)}`,
      name: "Arma de Teste",
      rarity: "common",
      slot: "weapon",
      powerScore: 5,
    });
    assert.equal(findEquippedItemCatalogId(CHARACTER_ID, "weapon"), null);
    equipItem(CHARACTER_ID, item.id);
    const found = findEquippedItemCatalogId(CHARACTER_ID, "weapon");
    assert.ok(found);
    assert.equal(found!.itemId, item.item_id);
  });

  test("recordItemHistoryEvent anexa 'boss_defeated_with' sem apagar o histórico existente", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-boss-record-${Math.random().toString(36).slice(2)}`,
      name: "Arma de Chefe",
      rarity: "common",
      slot: "weapon",
      powerScore: 5,
    });
    equipItem(CHARACTER_ID, item.id);
    const found = findEquippedItemCatalogId(CHARACTER_ID, "weapon")!;
    recordItemHistoryEvent(found.itemId, found.history, "boss_defeated_with", CHARACTER_ID, "Dragão de Teste");

    const equipped = getEquippedItems(CHARACTER_ID).find((i) => i.character_item_id === item.id)!;
    assert.equal(equipped.history!.events.length, 2);
    assert.equal(equipped.history!.events[1]!.event, "boss_defeated_with");
    assert.equal(equipped.history!.events[1]!.detail, "Dragão de Teste");
  });
});

// RC-1 Fase 3 — Integração: achado real — o cliente decide "autoEquip:
// true" comparando com uma Equipment local que nunca sabe o que já
// está equipado de verdade (ver useAdventureSession.ts, sempre nasce
// com o kit inicial). Sem isRealUpgradeForSlot(), o servidor aceitava
// cegamente e um drop fraco podia substituir equipamento real bom.
describe("drop.service — isRealUpgradeForSlot (RC-1 Fase 3)", () => {
  test("slot vazio: qualquer power_score positivo é upgrade", () => {
    assert.equal(isRealUpgradeForSlot(CHARACTER_ID, "gloves", 1), true);
  });

  test("slot ocupado: só é upgrade se o novo power_score for estritamente maior que o real equipado", () => {
    const strong = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-upgrade-gate-strong-${Math.random().toString(36).slice(2)}`,
      name: "Peitoral Forte de Teste",
      rarity: "rare",
      slot: "chest",
      powerScore: 50,
    });
    equipItem(CHARACTER_ID, strong.id);

    assert.equal(isRealUpgradeForSlot(CHARACTER_ID, "chest", 30), false, "power_score menor nunca é upgrade");
    assert.equal(isRealUpgradeForSlot(CHARACTER_ID, "chest", 50), false, "power_score igual nunca é upgrade (só estritamente maior)");
    assert.equal(isRealUpgradeForSlot(CHARACTER_ID, "chest", 51), true, "power_score maior é upgrade real");
  });
});

describe("drop.service — Legado do Reino (Sprint 14, Fase 6)", () => {
  // `leaveKingdom` garante que os testes seguintes deste ARQUIVO (ex.:
  // applyItemUpgrade) voltem a criar itens sem 'kingdom_visited' — sem
  // isso, o segundo teste abaixo (joinKingdom) vazaria estado pro resto
  // da suíte, quebrando `assert.equal(history.events.length, 2)` em
  // applyItemUpgrade (viraria 3, com o evento extra).
  after(() => {
    leaveKingdom(CHARACTER_ID);
  });

  test("um item nasce sem 'kingdom_visited' quando o personagem não pertence a nenhum Reino", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-no-kingdom-${Math.random().toString(36).slice(2)}`,
      name: "Item Sem Reino",
      rarity: "common",
      slot: "ring",
      powerScore: 5,
    });
    assert.equal(item.history!.kingdomsVisited.length, 0);
    assert.ok(!item.history!.events.some((e) => e.event === "kingdom_visited"));
  });

  test("um item nasce com 'kingdom_visited' quando o personagem pertence a um Reino", () => {
    const db = getDb();
    const kingdomId = `kingdom-drop-test-${RUN_ID}`;
    db.prepare(`INSERT INTO kingdoms (id, name, slug) VALUES (?, ?, ?)`).run(kingdomId, "Reino de Teste", `reino-teste-${RUN_ID}`);
    joinKingdom(CHARACTER_ID, kingdomId);

    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-with-kingdom-${Math.random().toString(36).slice(2)}`,
      name: "Item Com Reino",
      rarity: "common",
      slot: "amulet",
      powerScore: 5,
    });

    assert.deepEqual(item.history!.kingdomsVisited, [kingdomId]);
    assert.ok(item.history!.events.some((e) => e.event === "kingdom_visited" && e.detail === kingdomId));
  });
});

describe("drop.service — applyItemUpgrade nunca apaga histórico (Fase 9)", () => {
  test("uma melhoria anexa um evento 'upgraded' ao histórico existente, sem apagar o 'created'", () => {
    const item = grantAdventureLoot(CHARACTER_ID, null, {
      baseItemId: `test-upgrade-history-${Math.random().toString(36).slice(2)}`,
      name: "Item pra Melhorar",
      rarity: "common",
      slot: "shield",
      powerScore: 10,
    });
    equipItem(CHARACTER_ID, item.id);

    applyItemUpgrade(CHARACTER_ID, item.id, 15, 1);

    const equipped = getEquippedItems(CHARACTER_ID).find((i) => i.character_item_id === item.id);
    assert.ok(equipped);
    assert.ok(equipped!.history);
    assert.equal(equipped!.history!.events.length, 2);
    assert.equal(equipped!.history!.events[0]!.event, "created");
    assert.equal(equipped!.history!.events[1]!.event, "upgraded");
    assert.equal(equipped!.power_score, 15);
    assert.equal(equipped!.upgrade_level, 1);
  });
});
