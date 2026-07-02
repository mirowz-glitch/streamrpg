/**
 * SQLiteBossRepository — Sprint B1 (Nascimento)
 *
 * Implementação concreta do BossRepository usando SQLite.
 *
 * Só persiste/consulta estado de Boss — nenhuma regra de jogo (condição
 * de nascimento, cálculo de cooldown, cálculo de tier) vive aqui. Isso é
 * responsabilidade do BossSpawnSystem. Ver engine/types.ts para o
 * contrato completo e docs/technical-design/boss-system.md para o design.
 */
import { randomUUID } from "node:crypto";
import { getDb, nowUnix } from "../config/database.js";
import type { BossRepository, BossSnapshot, BossStatus } from "../engine/types.js";

interface BossRow {
  id: string;
  channel_id: string;
  status: BossStatus;
  tier: number;
  max_hp: number;
  current_hp: number;
  invocation_deadline: number;
  activated_at: number | null;
  ends_at: number | null;
  resolved_at: number | null;
}

const SELECT_COLUMNS = `id, channel_id, status, tier, max_hp, current_hp,
       invocation_deadline, activated_at, ends_at, resolved_at`;

function mapRow(row: BossRow): BossSnapshot {
  return {
    id: row.id,
    channelId: row.channel_id,
    status: row.status,
    tier: row.tier,
    maxHp: row.max_hp,
    currentHp: row.current_hp,
    invocationDeadline: row.invocation_deadline,
    activatedAt: row.activated_at,
    endsAt: row.ends_at,
    resolvedAt: row.resolved_at,
  };
}

export class SQLiteBossRepository implements BossRepository {
  async findById(bossId: string): Promise<BossSnapshot | null> {
    const row = getDb()
      .prepare(`SELECT ${SELECT_COLUMNS} FROM bosses WHERE id = ?`)
      .get(bossId) as BossRow | undefined;
    return row ? mapRow(row) : null;
  }

  async findActiveOrAwaiting(channelId: string): Promise<BossSnapshot | null> {
    const row = getDb()
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM bosses
         WHERE channel_id = ? AND status IN ('awaiting', 'active')`,
      )
      .get(channelId) as BossRow | undefined;
    return row ? mapRow(row) : null;
  }

  async findLastResolved(channelId: string): Promise<BossSnapshot | null> {
    const row = getDb()
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM bosses
         WHERE channel_id = ? AND status IN ('defeated', 'escaped')
         ORDER BY resolved_at DESC LIMIT 1`,
      )
      .get(channelId) as BossRow | undefined;
    return row ? mapRow(row) : null;
  }

  async create(
    channelId: string,
    tier: number,
    maxHp: number,
    invocationDeadline: number,
  ): Promise<BossSnapshot> {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO bosses (id, channel_id, status, tier, max_hp, current_hp, invocation_deadline)
         VALUES (?, ?, 'awaiting', ?, ?, ?, ?)`,
      )
      .run(id, channelId, tier, maxHp, maxHp, invocationDeadline);

    return {
      id,
      channelId,
      status: "awaiting",
      tier,
      maxHp,
      currentHp: maxHp,
      invocationDeadline,
      activatedAt: null,
      endsAt: null,
      resolvedAt: null,
    };
  }

  async activate(bossId: string, endsAt: number): Promise<BossSnapshot> {
    const db = getDb();
    const now = nowUnix();
    db.prepare(
      `UPDATE bosses SET status = 'active', activated_at = ?, ends_at = ?
       WHERE id = ? AND status = 'awaiting'`,
    ).run(now, endsAt, bossId);

    const row = db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM bosses WHERE id = ?`)
      .get(bossId) as BossRow | undefined;

    if (!row) {
      throw new Error(`BossRepository: boss ${bossId} não encontrado ao ativar`);
    }
    return mapRow(row);
  }

  async findAwaitingPastDeadline(now: number): Promise<BossSnapshot[]> {
    const rows = getDb()
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM bosses
         WHERE status = 'awaiting' AND invocation_deadline <= ?`,
      )
      .all(now) as BossRow[];
    return rows.map(mapRow);
  }

  async findAllActive(): Promise<BossSnapshot[]> {
    const rows = getDb()
      .prepare(`SELECT ${SELECT_COLUMNS} FROM bosses WHERE status = 'active'`)
      .all() as BossRow[];
    return rows.map(mapRow);
  }

  async applyDamage(bossId: string, amount: number): Promise<BossSnapshot> {
    const db = getDb();
    db.prepare(
      `UPDATE bosses SET current_hp = MAX(current_hp - ?, 0)
       WHERE id = ? AND status = 'active'`,
    ).run(amount, bossId);

    const row = db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM bosses WHERE id = ?`)
      .get(bossId) as BossRow | undefined;

    if (!row) {
      throw new Error(`BossRepository: boss ${bossId} não encontrado ao aplicar dano`);
    }
    return mapRow(row);
  }

  async resolve(
    bossId: string,
    status: "defeated" | "escaped",
    resolvedAt: number,
  ): Promise<BossSnapshot> {
    const db = getDb();
    db.prepare(
      `UPDATE bosses SET status = ?, resolved_at = ?
       WHERE id = ? AND status = 'active'`,
    ).run(status, resolvedAt, bossId);

    const row = db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM bosses WHERE id = ?`)
      .get(bossId) as BossRow | undefined;

    if (!row) {
      throw new Error(`BossRepository: boss ${bossId} não encontrado ao resolver`);
    }
    return mapRow(row);
  }
}
