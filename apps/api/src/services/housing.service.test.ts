/**
 * Testes do Housing Service — Sprint Housing Phase I (Vision 2.0,
 * Sprint 5), Fase 10. Mesma ressalva de ambiente já documentada em
 * citizen.service.test.ts: `DB_PATH=":memory:"` só é honrado se nenhum
 * outro arquivo da suíte completa já importou `config/env.js` primeiro —
 * identificadores únicos por execução + limpeza em `after()`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getDb } from "../config/database.js";
import { createKingdom } from "./kingdom.service.js";
import { joinKingdom } from "./citizen.service.js";
import { createHouse, getHouse, listHouses, listKingdomHouses, transferOwnership } from "./housing.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_A = `profile-house-a-${RUN_ID}`;
const PROFILE_B = `profile-house-b-${RUN_ID}`;
const PROFILE_OUTSIDER = `profile-house-outsider-${RUN_ID}`;
const CHARACTER_A = randomUUID();
const CHARACTER_B = randomUUID();
const CHARACTER_OUTSIDER = randomUUID();

let kingdomAlpha: string;
let kingdomBeta: string;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_A, "HouseTesterA");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_B, "HouseTesterB");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_OUTSIDER, "HouseTesterOutsider");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_A,
    PROFILE_A,
    "Construtor A",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_B,
    PROFILE_B,
    "Cidadao B",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_OUTSIDER,
    PROFILE_OUTSIDER,
    "Outsider",
  );

  const alpha = createKingdom(PROFILE_A, { name: `Reino Casa Alpha ${RUN_ID}` });
  const beta = createKingdom(PROFILE_B, { name: `Reino Casa Beta ${RUN_ID}` });
  if (!alpha.success || !beta.success) throw new Error("setup failed to found kingdoms");
  kingdomAlpha = alpha.kingdom.id;
  kingdomBeta = beta.kingdom.id;

  joinKingdom(CHARACTER_A, kingdomAlpha);
  joinKingdom(CHARACTER_B, kingdomBeta);
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM houses WHERE kingdom_id IN (?, ?)`).run(kingdomAlpha, kingdomBeta);
  db.prepare(`DELETE FROM citizens WHERE character_id IN (?, ?)`).run(CHARACTER_A, CHARACTER_B);
  db.prepare(`DELETE FROM kingdoms WHERE id IN (?, ?)`).run(kingdomAlpha, kingdomBeta);
  db.prepare(`DELETE FROM characters WHERE id IN (?, ?, ?)`).run(CHARACTER_A, CHARACTER_B, CHARACTER_OUTSIDER);
  db.prepare(`DELETE FROM profiles WHERE id IN (?, ?, ?)`).run(PROFILE_A, PROFILE_B, PROFILE_OUTSIDER);
});

describe("createHouse", () => {
  test("rejeita kingdom_id inexistente", () => {
    const result = createHouse(CHARACTER_A, { kingdom_id: "reino-que-nao-existe", name: "Casa" });
    assert.deepEqual(result, { success: false, reason: "kingdom-not-found" });
  });

  test("rejeita nome vazio", () => {
    const result = createHouse(CHARACTER_A, { kingdom_id: kingdomAlpha, name: "   " });
    assert.deepEqual(result, { success: false, reason: "invalid-name" });
  });

  test("rejeita quem não é cidadão do Reino alvo", () => {
    const result = createHouse(CHARACTER_OUTSIDER, { kingdom_id: kingdomAlpha, name: "Casa" });
    assert.deepEqual(result, { success: false, reason: "not-a-citizen" });
  });

  test("rejeita cidadão de um Reino diferente do alvo", () => {
    const result = createHouse(CHARACTER_B, { kingdom_id: kingdomAlpha, name: "Casa" });
    assert.deepEqual(result, { success: false, reason: "not-a-citizen" });
  });

  test("constrói a Casa com construtor = proprietário inicial e histórico com 1 evento 'built'", () => {
    const result = createHouse(CHARACTER_A, { kingdom_id: kingdomAlpha, name: `Casa da Colina ${RUN_ID}`, district: "Bairro Velho" });
    assert.equal(result.success, true);
    if (!result.success) return;

    assert.equal(result.house.kingdom_id, kingdomAlpha);
    assert.equal(result.house.current_owner_character_id, CHARACTER_A);
    assert.equal(result.house.original_builder_character_id, CHARACTER_A);
    assert.equal(result.house.status, "active");
    assert.equal(result.house.house_type, "residencia");
    assert.equal(result.house.district, "Bairro Velho");
    assert.equal(result.house.current_owner_display_name, "Construtor A");
    assert.equal(result.house.original_builder_display_name, "Construtor A");
    assert.equal(result.house.history.length, 1);
    assert.equal(result.house.history[0].event, "built");
    assert.equal(result.house.history[0].from_character_id, null);
    assert.equal(result.house.history[0].to_character_id, CHARACTER_A);
  });
});

describe("getHouse / listHouses / listKingdomHouses", () => {
  test("getHouse encontra a Casa recém-construída", () => {
    const created = createHouse(CHARACTER_A, { kingdom_id: kingdomAlpha, name: `Casa Buscável ${RUN_ID}` });
    assert.equal(created.success, true);
    if (!created.success) return;

    const found = getHouse(created.house.id);
    assert.deepEqual(found, created.house);
  });

  test("listKingdomHouses só lista Casas do Reino informado", () => {
    createHouse(CHARACTER_B, { kingdom_id: kingdomBeta, name: `Casa Beta ${RUN_ID}` });

    const alphaHouses = listKingdomHouses(kingdomAlpha);
    const betaHouses = listKingdomHouses(kingdomBeta);
    assert.ok(alphaHouses.every((h) => h.kingdom_id === kingdomAlpha));
    assert.ok(betaHouses.every((h) => h.kingdom_id === kingdomBeta));
    assert.ok(betaHouses.some((h) => h.name === `Casa Beta ${RUN_ID}`));
  });

  test("listHouses inclui Casas de qualquer Reino", () => {
    const all = listHouses();
    assert.ok(all.some((h) => h.kingdom_id === kingdomAlpha));
    assert.ok(all.some((h) => h.kingdom_id === kingdomBeta));
  });
});

describe("transferOwnership", () => {
  test("rejeita Casa inexistente", () => {
    const result = transferOwnership("casa-que-nao-existe", CHARACTER_B);
    assert.deepEqual(result, { success: false, reason: "house-not-found" });
  });

  test("rejeita personagem de destino inexistente", () => {
    const created = createHouse(CHARACTER_A, { kingdom_id: kingdomAlpha, name: `Casa Transferível ${RUN_ID}` });
    assert.equal(created.success, true);
    if (!created.success) return;

    const result = transferOwnership(created.house.id, "personagem-que-nao-existe");
    assert.deepEqual(result, { success: false, reason: "character-not-found" });
  });

  test("transfere posse, preserva o construtor original e acrescenta evento ao histórico", () => {
    const created = createHouse(CHARACTER_A, { kingdom_id: kingdomAlpha, name: `Casa a Transferir ${RUN_ID}` });
    assert.equal(created.success, true);
    if (!created.success) return;

    const result = transferOwnership(created.house.id, CHARACTER_OUTSIDER);
    assert.equal(result.success, true);
    if (!result.success) return;

    assert.equal(result.house.current_owner_character_id, CHARACTER_OUTSIDER);
    assert.equal(result.house.original_builder_character_id, CHARACTER_A);
    assert.equal(result.house.history.length, 2);
    assert.equal(result.house.history[1].event, "transferred");
    assert.equal(result.house.history[1].from_character_id, CHARACTER_A);
    assert.equal(result.house.history[1].to_character_id, CHARACTER_OUTSIDER);
  });
});
