/**
 * Testes do Account Service — Sprint Identity Core (Vision 2.0), Fase 4/8.
 * Mesma ressalva de ambiente já documentada em salvage.service.test.ts/
 * economy.service.test.ts: `DB_PATH=":memory:"` só é honrado se nenhum
 * outro arquivo da suíte completa já importou `config/env.js` primeiro —
 * identificadores únicos por execução + limpeza em `after()`.
 */
process.env.DB_PATH = ":memory:";

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../config/database.js";
import { linkAccount, findProfileByAccount, listAccountsForProfile } from "./account.service.js";

const RUN_ID = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
const PROFILE_ID = `profile-account-test-${RUN_ID}`;
const OTHER_PROFILE_ID = `profile-account-test-other-${RUN_ID}`;

before(() => {
  const db = getDb();
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(PROFILE_ID, "AccountTester");
  db.prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(OTHER_PROFILE_ID, "AccountTesterOther");
});

after(() => {
  const db = getDb();
  db.prepare(`DELETE FROM profiles WHERE id IN (?, ?)`).run(PROFILE_ID, OTHER_PROFILE_ID);
});

describe("account.service", () => {
  test("uma Pessoa pode existir sem twitch_id (profiles.twitch_id não é mais NOT NULL)", () => {
    // A própria criação em before() já prova isso — este teste só afirma
    // explicitamente o que a migração de schema promete (Fase 4/8).
    const row = getDb().prepare(`SELECT twitch_id FROM profiles WHERE id = ?`).get(PROFILE_ID) as {
      twitch_id: string | null;
    };
    assert.equal(row.twitch_id, null);
  });

  test("linkAccount cria um vínculo novo e findProfileByAccount resolve de volta pro mesmo profileId", () => {
    const providerUserId = `twitch-user-${RUN_ID}`;
    const account = linkAccount(PROFILE_ID, "twitch", providerUserId);

    assert.equal(account.profile_id, PROFILE_ID);
    assert.equal(account.provider, "twitch");
    assert.equal(account.provider_user_id, providerUserId);

    const resolved = findProfileByAccount("twitch", providerUserId);
    assert.equal(resolved, PROFILE_ID);
  });

  test("linkAccount é idempotente — vincular o mesmo (provider, provider_user_id) de novo não duplica", () => {
    const providerUserId = `twitch-user-idempotent-${RUN_ID}`;
    linkAccount(PROFILE_ID, "twitch", providerUserId);
    linkAccount(PROFILE_ID, "twitch", providerUserId);

    const accounts = listAccountsForProfile(PROFILE_ID).filter((a) => a.provider_user_id === providerUserId);
    assert.equal(accounts.length, 1);
  });

  test("uma Pessoa pode ter múltiplos Vínculos de provedores diferentes (docs/design/identity-core.md Seção 2)", () => {
    const localProfileId = `${PROFILE_ID}-multi`;
    getDb().prepare(`INSERT INTO profiles (id, username) VALUES (?, ?)`).run(localProfileId, "MultiAccountTester");

    linkAccount(localProfileId, "twitch", `twitch-${RUN_ID}`);
    linkAccount(localProfileId, "google", `google-${RUN_ID}`);
    linkAccount(localProfileId, "discord", `discord-${RUN_ID}`);

    const accounts = listAccountsForProfile(localProfileId);
    assert.equal(accounts.length, 3);
    assert.deepEqual(
      accounts.map((a) => a.provider).sort(),
      ["discord", "google", "twitch"],
    );

    getDb().prepare(`DELETE FROM profiles WHERE id = ?`).run(localProfileId);
  });

  test("o mesmo (provider, provider_user_id) nunca pode pertencer a duas Pessoas diferentes (UNIQUE constraint)", () => {
    const providerUserId = `twitch-user-conflict-${RUN_ID}`;
    linkAccount(PROFILE_ID, "twitch", providerUserId);

    assert.throws(() => linkAccount(OTHER_PROFILE_ID, "twitch", providerUserId));
  });

  test("findProfileByAccount devolve null para um Vínculo que nunca existiu", () => {
    const resolved = findProfileByAccount("twitch", `twitch-nunca-existiu-${RUN_ID}`);
    assert.equal(resolved, null);
  });
});
