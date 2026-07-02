/**
 * SQLiteBossParticipationRepository — Sprint B2 (Participação)
 *
 * Implementação concreta do BossParticipationRepository usando SQLite.
 *
 * Só persiste/consulta "quem participou" e "quanto" (ticksPresent). Nenhum
 * dano, nenhuma regra de jogo — isso vive no BossParticipationSystem.
 */
import { getDb } from "../config/database.js";
import type {
  BossParticipationRepository,
  BossParticipationSnapshot,
} from "../engine/types.js";

interface ParticipationRow {
  boss_id: string;
  character_id: string;
  ticks_present: number;
  first_seen_at: number;
  last_seen_at: number;
}

function mapRow(row: ParticipationRow): BossParticipationSnapshot {
  return {
    bossId: row.boss_id,
    characterId: row.character_id,
    ticksPresent: row.ticks_present,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
  };
}

export class SQLiteBossParticipationRepository implements BossParticipationRepository {
  async recordPresence(
    bossId: string,
    characterId: string,
    timestamp: number,
  ): Promise<BossParticipationSnapshot> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000);

    db.prepare(
      `INSERT INTO boss_participation (boss_id, character_id, ticks_present, first_seen_at, last_seen_at)
       VALUES (?, ?, 1, ?, ?)
       ON CONFLICT(boss_id, character_id) DO UPDATE SET
         ticks_present = ticks_present + 1,
         last_seen_at = excluded.last_seen_at`,
    ).run(bossId, characterId, now, now);

    const row = db
      .prepare(
        `SELECT boss_id, character_id, ticks_present, first_seen_at, last_seen_at
         FROM boss_participation WHERE boss_id = ? AND character_id = ?`,
      )
      .get(bossId, characterId) as ParticipationRow;

    return mapRow(row);
  }

  async listByBoss(bossId: string): Promise<BossParticipationSnapshot[]> {
    const rows = getDb()
      .prepare(
        `SELECT boss_id, character_id, ticks_present, first_seen_at, last_seen_at
         FROM boss_participation WHERE boss_id = ?`,
      )
      .all(bossId) as ParticipationRow[];
    return rows.map(mapRow);
  }
}
