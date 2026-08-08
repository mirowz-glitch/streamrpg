/**
 * Account — Sprint Identity Core (Vision 2.0)
 *
 * O Vínculo de Autenticação (docs/design/identity-core.md Seção 2): uma
 * Pessoa (`profiles`) pode ter zero, um, ou vários Vínculos (Google/
 * Discord/E-mail/Twitch/Kick/YouTube), nunca o inverso. Nenhum provedor é
 * dono da Pessoa — só prova quem ela é.
 *
 * Esta é a arquitetura pronta para os futuros provedores (Login Providers
 * Sprint) — nesta Sprint, o único chamador real é `routes/auth.ts`'s
 * callback do Twitch, provando que o formato funciona ponta a ponta sem
 * nenhum OAuth novo ser implementado.
 */
import { randomUUID } from "node:crypto";
import type { Account, AuthProvider } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

interface AccountRow {
  id: string;
  profile_id: string;
  provider: AuthProvider;
  provider_user_id: string;
  connected_at: number;
}

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    profile_id: row.profile_id,
    provider: row.provider,
    provider_user_id: row.provider_user_id,
    connected_at: new Date(row.connected_at * 1000).toISOString(),
  };
}

/**
 * Vincula um provedor a uma Pessoa já existente. Idempotente: se este
 * exato (provider, provider_user_id) já estiver vinculado a este mesmo
 * profileId, não faz nada (UNIQUE (provider, provider_user_id) já
 * garante isso a nível de banco — este INSERT OR IGNORE só evita que o
 * chamador precise checar antes).
 *
 * Não decide o que fazer se (provider, provider_user_id) já pertencer a
 * OUTRO profileId — isso é a "fusão de contas" nomeada como risco em
 * aberto em identity-core.md Seção 7, deliberadamente fora de escopo
 * desta Sprint. O UNIQUE constraint rejeita esse caso (lança), o chamador
 * decide o que fazer com o erro.
 */
export function linkAccount(profileId: string, provider: AuthProvider, providerUserId: string): Account {
  const db = getDb();
  const now = nowUnix();

  const existing = db
    .prepare(`SELECT * FROM accounts WHERE profile_id = ? AND provider = ? AND provider_user_id = ?`)
    .get(profileId, provider, providerUserId) as AccountRow | undefined;
  if (existing) return toAccount(existing);

  const id = randomUUID();
  db.prepare(
    `INSERT INTO accounts (id, profile_id, provider, provider_user_id, connected_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, profileId, provider, providerUserId, now);

  return toAccount({ id, profile_id: profileId, provider, provider_user_id: providerUserId, connected_at: now });
}

/**
 * Resolve qual Pessoa (profileId) já possui este Vínculo, se existir.
 * Este é o ponto de entrada que um futuro callback de Login Provider
 * chamaria primeiro ("essa pessoa já existe?") antes de decidir criar
 * uma Pessoa nova.
 */
export function findProfileByAccount(provider: AuthProvider, providerUserId: string): string | null {
  const row = getDb()
    .prepare(`SELECT profile_id FROM accounts WHERE provider = ? AND provider_user_id = ?`)
    .get(provider, providerUserId) as { profile_id: string } | undefined;
  return row?.profile_id ?? null;
}

export function listAccountsForProfile(profileId: string): Account[] {
  const rows = getDb()
    .prepare(`SELECT * FROM accounts WHERE profile_id = ? ORDER BY connected_at ASC`)
    .all(profileId) as unknown as AccountRow[];
  return rows.map(toAccount);
}
