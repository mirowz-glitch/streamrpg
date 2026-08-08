/**
 * Testes do Citizen Service — Sprint Citizen System (Vision 2.0,
 * Sprint 3), Fase 10. Mesma ressalva de ambiente já documentada em
 * kingdom.service.test.ts: `DB_PATH=":memory:"` só é honrado se nenhum
 * outro arquivo da suíte completa já importou `config/env.js` primeiro —
 * identificadores únicos por execução + limpeza em `after()`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getDb } from "../config/database.js";
import { createKingdom } from "./kingdom.service.js";
import {
  demote,
  getCitizen,
  getRank,
  joinKingdom,
  leaveKingdom,
  listCitizens,
  listKingdomCitizens,
  promote,
  updateRank,
} from "./citizen.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_A = `profile-citizen-a-${RUN_ID}`;
const PROFILE_B = `profile-citizen-b-${RUN_ID}`;
const CHARACTER_A = randomUUID();
const CHARACTER_B = randomUUID();

let kingdomAlpha: string;
let kingdomBeta: string;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_A, "CitizenTesterA");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_B, "CitizenTesterB");
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_A,
    PROFILE_A,
    "Personagem A",
  );
  db.prepare(`INSERT INTO characters (id, profile_id, display_name) VALUES (?, ?, ?)`).run(
    CHARACTER_B,
    PROFILE_B,
    "Personagem B",
  );

  const alpha = createKingdom(PROFILE_A, { name: `Reino Alpha ${RUN_ID}` });
  const beta = createKingdom(PROFILE_B, { name: `Reino Beta ${RUN_ID}` });
  if (!alpha.success || !beta.success) throw new Error("setup failed to found kingdoms");
  kingdomAlpha = alpha.kingdom.id;
  kingdomBeta = beta.kingdom.id;
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM citizens WHERE character_id IN (?, ?)`).run(CHARACTER_A, CHARACTER_B);
  db.prepare(`DELETE FROM kingdoms WHERE id IN (?, ?)`).run(kingdomAlpha, kingdomBeta);
  db.prepare(`DELETE FROM characters WHERE id IN (?, ?)`).run(CHARACTER_A, CHARACTER_B);
  db.prepare(`DELETE FROM profiles WHERE id IN (?, ?)`).run(PROFILE_A, PROFILE_B);
});

describe("joinKingdom", () => {
  test("rejeita kingdom_id inexistente", () => {
    const result = joinKingdom(CHARACTER_A, "reino-que-nao-existe");
    assert.deepEqual(result, { success: false, reason: "kingdom-not-found" });
  });

  test("cria cidadania nova como residente ativo", () => {
    const result = joinKingdom(CHARACTER_A, kingdomAlpha);
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.citizen.character_id, CHARACTER_A);
    assert.equal(result.citizen.kingdom_id, kingdomAlpha);
    assert.equal(result.citizen.status, "active");
    assert.equal(result.citizen.rank, "residente");
    assert.equal(result.citizen.is_founder, true);
  });

  test("rejeita entrar de novo no mesmo Reino já ativo", () => {
    const result = joinKingdom(CHARACTER_A, kingdomAlpha);
    assert.deepEqual(result, { success: false, reason: "already-citizen" });
  });

  test("trocar de Reino atualiza a mesma linha (character_id continua único)", () => {
    const result = joinKingdom(CHARACTER_A, kingdomBeta);
    assert.equal(result.success, true);
    if (!result.success) return;
    assert.equal(result.citizen.kingdom_id, kingdomBeta);
    assert.equal(result.citizen.is_founder, false);

    const rows = getDb().prepare(`SELECT COUNT(*) AS c FROM citizens WHERE character_id = ?`).get(CHARACTER_A) as {
      c: number;
    };
    assert.equal(rows.c, 1);
  });
});

describe("leaveKingdom", () => {
  test("rejeita sair sem ser cidadão de nada", () => {
    const result = leaveKingdom(CHARACTER_B);
    assert.deepEqual(result, { success: false, reason: "not-a-citizen" });
  });

  test("sair marca status left e getCitizen passa a devolver null", () => {
    const joined = joinKingdom(CHARACTER_B, kingdomBeta);
    assert.equal(joined.success, true);

    const left = leaveKingdom(CHARACTER_B);
    assert.deepEqual(left, { success: true });

    assert.equal(getCitizen(CHARACTER_B), null);
  });
});

describe("getCitizen / listCitizens / listKingdomCitizens", () => {
  test("getCitizen encontra a cidadania ativa atual", () => {
    const citizen = getCitizen(CHARACTER_A);
    assert.ok(citizen);
    assert.equal(citizen?.kingdom_id, kingdomBeta);
  });

  test("listKingdomCitizens só lista cidadãos ativos do Reino informado", () => {
    const betaCitizens = listKingdomCitizens(kingdomBeta);
    assert.ok(betaCitizens.some((c) => c.character_id === CHARACTER_A));
    assert.ok(!betaCitizens.some((c) => c.character_id === CHARACTER_B));

    const alphaCitizens = listKingdomCitizens(kingdomAlpha);
    assert.ok(!alphaCitizens.some((c) => c.character_id === CHARACTER_A));
  });

  test("listCitizens inclui cidadãos ativos de qualquer Reino", () => {
    const all = listCitizens();
    assert.ok(all.some((c) => c.character_id === CHARACTER_A));
    assert.ok(!all.some((c) => c.character_id === CHARACTER_B));
  });
});

// Sprint Citizen Progression (Vision 2.0, Sprint 4), Fase 10. Reaproveita
// CHARACTER_A (cidadão ativo de kingdomBeta, rank 'residente' após o
// bloco joinKingdom acima) e CHARACTER_B (sem cidadania ativa, saiu no
// bloco leaveKingdom acima) — não precisa de fixture nova.
describe("getRank", () => {
  test("devolve 'visitante' para quem não tem cidadania ativa", () => {
    assert.equal(getRank(CHARACTER_B), "visitante");
  });

  test("devolve o rank persistido para um cidadão ativo", () => {
    assert.equal(getRank(CHARACTER_A), "residente");
  });
});

describe("promote / demote", () => {
  test("promote rejeita quem não é cidadão", () => {
    assert.deepEqual(promote(CHARACTER_B), { success: false, reason: "not-a-citizen" });
  });

  test("demote rejeita quem não é cidadão", () => {
    assert.deepEqual(demote(CHARACTER_B), { success: false, reason: "not-a-citizen" });
  });

  test("promote avança um estágio por vez, nunca pula", () => {
    assert.deepEqual(promote(CHARACTER_A), { success: true, rank: "cidadao" });
    assert.equal(getRank(CHARACTER_A), "cidadao");
    assert.deepEqual(promote(CHARACTER_A), { success: true, rank: "veterano" });
    assert.deepEqual(promote(CHARACTER_A), { success: true, rank: "lenda" });
  });

  test("promote rejeita além do topo da escada", () => {
    assert.deepEqual(promote(CHARACTER_A), { success: false, reason: "already-max-rank" });
  });

  test("demote recua um estágio por vez", () => {
    assert.deepEqual(demote(CHARACTER_A), { success: true, rank: "veterano" });
    assert.equal(getRank(CHARACTER_A), "veterano");
  });

  test("demote nunca desce abaixo de 'residente' (sair do Reino é o caminho para visitante)", () => {
    demote(CHARACTER_A);
    demote(CHARACTER_A);
    assert.equal(getRank(CHARACTER_A), "residente");
    assert.deepEqual(demote(CHARACTER_A), { success: false, reason: "already-min-rank" });
  });
});

describe("updateRank", () => {
  test("rejeita quem não é cidadão", () => {
    assert.deepEqual(updateRank(CHARACTER_B, "veterano"), { success: false, reason: "not-a-citizen" });
  });

  test("define o rank diretamente para um cidadão ativo", () => {
    assert.deepEqual(updateRank(CHARACTER_A, "lenda"), { success: true, rank: "lenda" });
    assert.equal(getRank(CHARACTER_A), "lenda");
  });
});
