/**
 * boss-status.service.ts — Sprint Boss Experience
 *
 * Só leitura, para apresentação. Nenhuma regra de jogo vive aqui — quem
 * decide nascimento/combate/recompensa continua sendo
 * BossSpawnSystem/BossCombatSystem/BossRewardSystem, intocados por esta
 * Sprint. Este arquivo só consulta o que esses Systems já gravaram nas
 * tabelas já existentes (bosses, boss_participation, boss_rewards) —
 * nenhuma tabela/coluna nova.
 *
 * "Nome" do Boss não existe em nenhuma coluna do schema — não inventado
 * aqui. O identificador mostrado ao jogador é o `tier`, que é real.
 */
import type { BossParticipantSummary, BossRewardSummary, BossStateSnapshot } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

// Janela em que um Boss recém-resolvido continua aparecendo (tela de
// vitória/fuga) antes de "desaparecer" — decisão de apresentação, não
// uma regra de jogo. Ilustrativo, não calibrado, mesma convenção de
// honestidade já usada em outros placeholders do projeto.
const RECENT_RESOLUTION_WINDOW_SECONDS = 30;

interface BossRow {
  id: string;
  status: string;
  tier: number;
  max_hp: number;
  current_hp: number;
  ends_at: number | null;
  resolved_at: number | null;
}

const EMPTY_STATE: BossStateSnapshot = {
  active: false,
  status: null,
  tier: null,
  current_hp: null,
  max_hp: null,
  ends_at: null,
  resolved_at: null,
  participant_count: 0,
  participants: [],
  rewards: null,
};

function getParticipants(db: ReturnType<typeof getDb>, bossId: string): {
  count: number;
  names: BossParticipantSummary[];
} {
  const count = (
    db.prepare(`SELECT COUNT(*) AS c FROM boss_participation WHERE boss_id = ?`).get(bossId) as { c: number }
  ).c;

  // Lista de nomes limitada a 30 (mesmo espírito do LIMIT 20 já usado em
  // getOverlayViewers) — usada só para o log de "fulano entrou", não para
  // a contagem exibida (essa vem do COUNT(*) acima, sempre exata).
  const names = db
    .prepare(
      `SELECT bp.character_id, c.display_name
       FROM boss_participation bp
       JOIN characters c ON c.id = bp.character_id
       WHERE bp.boss_id = ?
       ORDER BY bp.first_seen_at ASC
       LIMIT 30`,
    )
    .all(bossId) as unknown as BossParticipantSummary[];

  return { count, names };
}

export function getBossState(channelLogin: string): BossStateSnapshot {
  const db = getDb();
  const channelId = channelLogin.toLowerCase();

  const current = db
    .prepare(
      `SELECT id, status, tier, max_hp, current_hp, ends_at, resolved_at
       FROM bosses WHERE channel_id = ? AND status IN ('awaiting', 'active')`,
    )
    .get(channelId) as BossRow | undefined;

  if (current) {
    const { count, names } = getParticipants(db, current.id);
    return {
      active: true,
      status: current.status as "awaiting" | "active",
      tier: current.tier,
      current_hp: current.current_hp,
      max_hp: current.max_hp,
      ends_at: current.ends_at,
      resolved_at: null,
      participant_count: count,
      participants: names,
      rewards: null,
    };
  }

  const now = nowUnix();
  const recentlyResolved = db
    .prepare(
      `SELECT id, status, tier, max_hp, current_hp, ends_at, resolved_at
       FROM bosses
       WHERE channel_id = ? AND status IN ('defeated', 'escaped') AND resolved_at >= ?
       ORDER BY resolved_at DESC LIMIT 1`,
    )
    .get(channelId, now - RECENT_RESOLUTION_WINDOW_SECONDS) as BossRow | undefined;

  if (!recentlyResolved) {
    return EMPTY_STATE;
  }

  const { count, names } = getParticipants(db, recentlyResolved.id);
  const rewards = db
    .prepare(
      `SELECT br.character_id, c.display_name, br.xp_granted, i.name AS item_name, i.rarity AS item_rarity
       FROM boss_rewards br
       JOIN characters c ON c.id = br.character_id
       LEFT JOIN items i ON i.id = br.item_id
       WHERE br.boss_id = ?
       ORDER BY br.xp_granted DESC`,
    )
    .all(recentlyResolved.id) as unknown as BossRewardSummary[];

  return {
    active: true,
    status: recentlyResolved.status as "defeated" | "escaped",
    tier: recentlyResolved.tier,
    current_hp: recentlyResolved.current_hp,
    max_hp: recentlyResolved.max_hp,
    ends_at: null,
    resolved_at: recentlyResolved.resolved_at,
    participant_count: count,
    participants: names,
    rewards,
  };
}
