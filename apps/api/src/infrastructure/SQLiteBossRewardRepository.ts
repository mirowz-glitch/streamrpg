/**
 * SQLiteBossRewardRepository — Sprint B4 (Recompensas)
 *
 * Implementação concreta do BossRewardRepository usando SQLite.
 *
 * Só persiste/consulta "o que cada personagem recebeu de um Boss" —
 * nenhuma regra de jogo (quanto XP, quem ganha item) vive aqui. Isso é
 * responsabilidade do BossRewardSystem.
 */
import { getDb } from "../config/database.js";
import type {
  BossRewardRepository,
  BossRewardSnapshot,
} from "../engine/types.js";

interface RewardRow {
  boss_id: string;
  character_id: string;
  xp_granted: number;
  item_id: number | null;
  outcome: "defeated" | "escaped";
  granted_at: number;
}

function mapRow(row: RewardRow): BossRewardSnapshot {
  return {
    bossId: row.boss_id,
    characterId: row.character_id,
    xpGranted: row.xp_granted,
    itemId: row.item_id,
    outcome: row.outcome,
    grantedAt: row.granted_at,
  };
}

export class SQLiteBossRewardRepository implements BossRewardRepository {
  async hasRewarded(bossId: string, characterId: string): Promise<boolean> {
    const row = getDb()
      .prepare(
        `SELECT 1 FROM boss_rewards WHERE boss_id = ? AND character_id = ?`,
      )
      .get(bossId, characterId);
    return row !== undefined;
  }

  async recordReward(
    bossId: string,
    characterId: string,
    xpGranted: number,
    itemId: number | null,
    outcome: "defeated" | "escaped",
    timestamp: number,
  ): Promise<BossRewardSnapshot> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000);

    db.prepare(
      `INSERT INTO boss_rewards (boss_id, character_id, xp_granted, item_id, outcome, granted_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(bossId, characterId, xpGranted, itemId, outcome, now);

    return {
      bossId,
      characterId,
      xpGranted,
      itemId,
      outcome,
      grantedAt: now,
    };
  }
}
