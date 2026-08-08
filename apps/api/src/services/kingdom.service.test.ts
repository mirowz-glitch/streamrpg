/**
 * Testes do Kingdom Service — Sprint Kingdom Domain 2.0 (Vision 2.0,
 * Sprint 2), Fase 10. Mesma ressalva de ambiente já documentada em
 * account.service.test.ts/salvage.service.test.ts: `DB_PATH=":memory:"`
 * só é honrado se nenhum outro arquivo da suíte completa já importou
 * `config/env.js` primeiro — identificadores únicos por execução +
 * limpeza em `after()`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../config/database.js";
import { createKingdom, getKingdomById, getKingdomBySlug, listKingdoms, slugify } from "./kingdom.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-kingdom-test-${RUN_ID}`;

before(() => {
  getDb().prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_ID, "KingdomFounderTester");
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM kingdoms WHERE founder_profile_id = ?`).run(PROFILE_ID);
  db.prepare(`DELETE FROM profiles WHERE id = ?`).run(PROFILE_ID);
});

describe("slugify", () => {
  test("normaliza acentos, espaços e maiúsculas", () => {
    assert.equal(slugify("Reino da Karol"), "reino-da-karol");
    assert.equal(slugify("Reino Hardcöre!"), "reino-hardcore");
    assert.equal(slugify("  espaços   extras  "), "espacos-extras");
  });
});

describe("createKingdom", () => {
  test("funda um Reino com founder = leader inicial, status active, visibility public por padrão", () => {
    const result = createKingdom(PROFILE_ID, { name: `Reino Oficial ${RUN_ID}` });
    assert.equal(result.success, true);
    if (!result.success) return;

    assert.equal(result.kingdom.founder_profile_id, PROFILE_ID);
    assert.equal(result.kingdom.leader_profile_id, PROFILE_ID);
    assert.equal(result.kingdom.status, "active");
    assert.equal(result.kingdom.visibility, "public");
    assert.equal(result.kingdom.description, "");
  });

  test("gera slug automaticamente a partir do nome quando nenhum é informado", () => {
    const result = createKingdom(PROFILE_ID, { name: `Reino da Karol ${RUN_ID}` });
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.kingdom.slug, slugify(`Reino da Karol ${RUN_ID}`));
  });

  test("rejeita nome vazio", () => {
    const result = createKingdom(PROFILE_ID, { name: "   " });
    assert.deepEqual(result, { success: false, reason: "invalid-name" });
  });

  test("rejeita slug já em uso", () => {
    const name = `Reino Duplicado ${RUN_ID}`;
    const first = createKingdom(PROFILE_ID, { name });
    assert.equal(first.success, true);

    const second = createKingdom(PROFILE_ID, { name: `${name} (outro nome, mesmo slug)`, slug: name });
    assert.deepEqual(second, { success: false, reason: "slug-taken" });
  });
});

describe("getKingdomBySlug / getKingdomById / listKingdoms", () => {
  test("getKingdomBySlug encontra o Reino recém-criado", () => {
    const created = createKingdom(PROFILE_ID, { name: `Reino Buscável ${RUN_ID}` });
    assert.equal(created.success, true);
    if (!created.success) return;

    const found = getKingdomBySlug(created.kingdom.slug);
    assert.deepEqual(found, created.kingdom);
  });

  test("getKingdomById encontra o Reino recém-criado", () => {
    const created = createKingdom(PROFILE_ID, { name: `Reino Por Id ${RUN_ID}` });
    assert.equal(created.success, true);
    if (!created.success) return;

    const found = getKingdomById(created.kingdom.id);
    assert.deepEqual(found, created.kingdom);
  });

  test("getKingdomBySlug devolve null para um slug que nunca existiu", () => {
    assert.equal(getKingdomBySlug(`nunca-existiu-${RUN_ID}`), null);
  });

  test("listKingdoms inclui um Reino recém-fundado", () => {
    const created = createKingdom(PROFILE_ID, { name: `Reino Listável ${RUN_ID}` });
    assert.equal(created.success, true);
    if (!created.success) return;

    const all = listKingdoms();
    assert.ok(all.some((k) => k.id === created.kingdom.id));
  });
});
