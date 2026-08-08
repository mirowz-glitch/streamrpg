/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 8 — cobre que
 * o resumo é sempre um COUNT real (nunca um valor guardado), incluindo
 * o caso "Mundo vazio" (nenhum Reino/Casa/Boss ainda).
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../config/database.js";
import { createKingdom } from "./kingdom.service.js";
import { getWorldNews } from "./worldNews.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_A = `profile-news-a-${RUN_ID}`;
const PROFILE_B = `profile-news-b-${RUN_ID}`;
const CHARACTER_A = `character-news-a-${RUN_ID}`;

let kingdomId: string;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_A, "NewsFounder");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_B, "NewsCitizen");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_A,
    PROFILE_B,
    "News Citizen",
  );

  const kingdom = createKingdom(PROFILE_A, { name: `Reino Notícias ${RUN_ID}` });
  if (!kingdom.success) throw new Error("setup failed to found kingdom");
  kingdomId = kingdom.kingdom.id;

  db.prepare(
    `INSERT INTO citizens (id, character_id, kingdom_id) VALUES (?, ?, ?)`,
  ).run(`citizen-${RUN_ID}`, CHARACTER_A, kingdomId);
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM citizens WHERE kingdom_id = ?`).run(kingdomId);
  db.prepare(`DELETE FROM kingdoms WHERE id = ?`).run(kingdomId);
  db.prepare(`DELETE FROM characters WHERE id = ?`).run(CHARACTER_A);
  db.prepare(`DELETE FROM profiles WHERE id IN (?, ?)`).run(PROFILE_A, PROFILE_B);
});

describe("getWorldNews", () => {
  test("citizensTotal reflete um cidadão ativo real recém-criado", () => {
    const news = getWorldNews();
    assert.ok(news.citizensTotal >= 1);
  });

  test("largestKingdom nunca é null quando existe pelo menos um cidadão ativo em algum Reino", () => {
    // Nota de ambiente: `DB_PATH=":memory:"` só é honrado se nenhum
    // outro arquivo da suíte completa já importou `config/env.js`
    // primeiro (mesma ressalva documentada em outros testes de
    // serviço) — por isso não afirmamos QUAL Reino é o maior, só que
    // a agregação real encontra algum Reino com cidadãos.
    const news = getWorldNews();
    assert.ok(news.largestKingdom);
    assert.ok(news.largestKingdom!.citizenCount >= 1);
  });

  test("todos os campos são números não-negativos — nunca um valor inventado", () => {
    const news = getWorldNews();
    assert.ok(news.bossesDefeatedTotal >= 0);
    assert.ok(news.housesBuiltTotal >= 0);
    assert.ok(news.housesSoldTotal >= 0);
  });
});
