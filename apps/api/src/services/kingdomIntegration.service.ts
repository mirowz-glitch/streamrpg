/**
 * Kingdom Integration — Kingdom Integration Phase I (Vision 2.0, Sprint 8)
 *
 * "A plataforma pertence ao Reino, o Reino nunca pertence à plataforma."
 * Um Kingdom pode conectar Twitch, Kick, YouTube, Discord ou nenhuma —
 * `provider` nunca é uma union fechada (ver packages/shared/src/types.ts).
 * Integrações são anexos: este serviço nunca lê nem escreve a tabela
 * `kingdoms` — só a própria `kingdom_integrations`.
 *
 * Deliberadamente infraestrutura pura: nenhum OAuth real, nenhum chat,
 * drop, evento, notificação, webhook, tempo real ou benefício exclusivo
 * (per o brief desta Sprint).
 */
import { randomUUID } from "node:crypto";
import type { KingdomIntegration, KingdomIntegrationStatus } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

interface KingdomIntegrationRow {
  id: string;
  kingdom_id: string;
  provider: string;
  external_id: string;
  display_name: string;
  status: KingdomIntegrationStatus;
  connected_at: number;
  metadata: string | null;
}

function toKingdomIntegration(row: KingdomIntegrationRow): KingdomIntegration {
  return {
    id: row.id,
    kingdom_id: row.kingdom_id,
    provider: row.provider,
    external_id: row.external_id,
    display_name: row.display_name,
    status: row.status,
    connected_at: new Date(row.connected_at * 1000).toISOString(),
    metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : null,
  };
}

export interface ConnectKingdomIntegrationInput {
  externalId: string;
  displayName: string;
  metadata?: Record<string, unknown>;
}

/**
 * Conecta (ou reconecta) uma integração a um Reino. Idempotente por
 * (kingdom_id, provider) — UNIQUE constraint no schema garante no
 * máximo uma linha por provedor por Reino; reconectar (mesmo depois de
 * desconectado) atualiza a linha existente e marca `status: 'connected'`
 * de novo, nunca duplica.
 */
export function connectKingdomIntegration(
  kingdomId: string,
  provider: string,
  input: ConnectKingdomIntegrationInput,
): KingdomIntegration {
  const db = getDb();
  const now = nowUnix();
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

  const existing = db
    .prepare(`SELECT * FROM kingdom_integrations WHERE kingdom_id = ? AND provider = ?`)
    .get(kingdomId, provider) as KingdomIntegrationRow | undefined;

  if (existing) {
    db.prepare(
      `UPDATE kingdom_integrations SET external_id = ?, display_name = ?, status = 'connected', connected_at = ?, metadata = ? WHERE id = ?`,
    ).run(input.externalId, input.displayName, now, metadataJson, existing.id);
    return toKingdomIntegration({
      ...existing,
      external_id: input.externalId,
      display_name: input.displayName,
      status: "connected",
      connected_at: now,
      metadata: metadataJson,
    });
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO kingdom_integrations (id, kingdom_id, provider, external_id, display_name, status, connected_at, metadata)
     VALUES (?, ?, ?, ?, ?, 'connected', ?, ?)`,
  ).run(id, kingdomId, provider, input.externalId, input.displayName, now, metadataJson);

  return toKingdomIntegration({
    id,
    kingdom_id: kingdomId,
    provider,
    external_id: input.externalId,
    display_name: input.displayName,
    status: "connected",
    connected_at: now,
    metadata: metadataJson,
  });
}

export type DisconnectKingdomIntegrationResult =
  | { success: true; integration: KingdomIntegration }
  | { success: false; reason: "not-found" };

/**
 * Desconecta uma integração. Nunca apaga a linha — só marca `status:
 * 'disconnected'`, preservando o histórico de quando foi conectada e
 * a que canal externo (mesma filosofia de "nunca apagar" já aplicada a
 * Housing/Real Estate).
 */
export function disconnectKingdomIntegration(integrationId: string): DisconnectKingdomIntegrationResult {
  const db = getDb();
  const existing = db.prepare(`SELECT * FROM kingdom_integrations WHERE id = ?`).get(integrationId) as
    | KingdomIntegrationRow
    | undefined;
  if (!existing) return { success: false, reason: "not-found" };

  db.prepare(`UPDATE kingdom_integrations SET status = 'disconnected' WHERE id = ?`).run(integrationId);
  return { success: true, integration: toKingdomIntegration({ ...existing, status: "disconnected" }) };
}

/** Lista todas as integrações de um Reino (conectadas e desconectadas). */
export function listKingdomIntegrations(kingdomId: string): KingdomIntegration[] {
  const rows = getDb()
    .prepare(`SELECT * FROM kingdom_integrations WHERE kingdom_id = ? ORDER BY connected_at ASC`)
    .all(kingdomId) as unknown as KingdomIntegrationRow[];
  return rows.map(toKingdomIntegration);
}

export function getKingdomIntegration(integrationId: string): KingdomIntegration | null {
  const row = getDb().prepare(`SELECT * FROM kingdom_integrations WHERE id = ?`).get(integrationId) as
    | KingdomIntegrationRow
    | undefined;
  return row ? toKingdomIntegration(row) : null;
}
