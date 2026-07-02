import {
  GOLD_PER_PING,
  PING_COOLDOWN_MS,
  XP_PER_PING,
  getProgress,
} from "@streamrpg/shared";
import type { PingResponse } from "@streamrpg/shared";
import { getDb, nowUnix, todayDate } from "../config/database.js";
import { ensureChannel } from "./channel.service.js";
import { isChannelLive } from "./twitch.service.js";

export async function applyPing(
  characterId: string,
  channelLogin: string,
): Promise<PingResponse> {
  const db = getDb();
  const character = db
    .prepare("SELECT xp, level, gold, last_ping_at FROM characters WHERE id = ?")
    .get(characterId) as {
      xp: number;
      level: number;
      gold: number;
      last_ping_at: number | null;
    } | undefined;

  if (!character) {
    throw new Error("Character not found");
  }

  const now = nowUnix();
  if (character.last_ping_at) {
    const elapsedMs = (now - character.last_ping_at) * 1000;
    if (elapsedMs < PING_COOLDOWN_MS) {
      const progress = getProgress(character.xp);
      return {
        xp_gained: 0,
        gold_gained: 0,
        new_xp: progress.xp,
        level: progress.level,
        leveled_up: false,
        xp_to_next: progress.xp_to_next,
        percent: progress.percent,
        cooldown_seconds: Math.ceil((PING_COOLDOWN_MS - elapsedMs) / 1000),
        drop: null,
      };
    }
  }

  const live = await isChannelLive(channelLogin);
  if (!live) {
    const progress = getProgress(character.xp);
    return {
      xp_gained: 0,
      gold_gained: 0,
      new_xp: progress.xp,
      level: progress.level,
      leveled_up: false,
      xp_to_next: progress.xp_to_next,
      percent: progress.percent,
      cooldown_seconds: 60,
      drop: null,
    };
  }

  const channel = ensureChannel(channelLogin);
  const progress = getProgress(character.xp);

  // XP, level, welcome reward e drop são responsabilidade exclusiva da
  // Engine (XPSystem/WelcomeRewardSystem/DropSystem via EventBus) a
  // partir da Sprint E4 — este endpoint não concede mais nenhum deles.
  // Gold ainda não migrou para a Engine, então continua sendo concedido
  // aqui diretamente.
  const goldGain = GOLD_PER_PING;
  const newGold = character.gold + goldGain;
  const sessionDate = todayDate();

  db.prepare(
    `UPDATE characters
     SET gold = ?, last_ping_at = ?,
         primary_channel_id = COALESCE(primary_channel_id, ?), updated_at = ?
     WHERE id = ?`,
  ).run(newGold, now, channel.id, now, characterId);

  const existingSession = db
    .prepare(
      `SELECT id FROM viewer_sessions
       WHERE character_id = ? AND channel_id = ? AND session_date = ?`,
    )
    .get(characterId, channel.id, sessionDate) as { id: number } | undefined;

  if (existingSession) {
    db.prepare(
      `UPDATE viewer_sessions
       SET last_ping_at = ?, ping_count = ping_count + 1, minutes_watched = minutes_watched + 1,
           xp_earned = xp_earned + ?, gold_earned = gold_earned + ?
       WHERE id = ?`,
    ).run(now, XP_PER_PING, goldGain, existingSession.id);
  } else {
    db.prepare(
      `INSERT INTO viewer_sessions
       (character_id, channel_id, session_date, first_ping_at, last_ping_at, ping_count, minutes_watched, xp_earned, gold_earned)
       VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)`,
    ).run(characterId, channel.id, sessionDate, now, now, XP_PER_PING, goldGain);
  }

  db.prepare(
    `INSERT INTO channel_rankings (channel_id, character_id, total_xp, sessions_count, last_ping_at, updated_at)
     VALUES (?, ?, ?, 1, ?, ?)
     ON CONFLICT(channel_id, character_id) DO UPDATE SET
       total_xp = excluded.total_xp,
       sessions_count = channel_rankings.sessions_count + 1,
       last_ping_at = excluded.last_ping_at,
       updated_at = excluded.updated_at`,
  ).run(channel.id, characterId, character.xp, now, now);

  refreshChannelPositions(channel.id);

  // xp_gained/leveled_up/drop ficam sempre "vazios": a Engine concede
  // isso de forma assíncrona via tick, desacoplada desta resposta HTTP
  // (débito de UI conhecido — ver UI-001).
  return {
    xp_gained: 0,
    gold_gained: goldGain,
    new_xp: progress.xp,
    level: progress.level,
    leveled_up: false,
    xp_to_next: progress.xp_to_next,
    percent: progress.percent,
    cooldown_seconds: PING_COOLDOWN_MS / 1000,
    drop: null,
  };
}

function refreshChannelPositions(channelId: string): void {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT character_id FROM channel_rankings
       WHERE channel_id = ?
       ORDER BY total_xp DESC, last_ping_at DESC`,
    )
    .all(channelId) as Array<{ character_id: string }>;

  const update = db.prepare(
    "UPDATE channel_rankings SET position = ? WHERE channel_id = ? AND character_id = ?",
  );

  rows.forEach((row, index) => {
    update.run(index + 1, channelId, row.character_id);
  });
}

export function getOverlayViewers(channelLogin: string) {
  const db = getDb();
  const channel = db
    .prepare("SELECT id FROM streamer_channels WHERE id = ?")
    .get(channelLogin.toLowerCase()) as { id: string } | undefined;

  if (!channel) {
    return [];
  }

  const cutoff = nowUnix() - 300;
  const rows = db
    .prepare(
      `SELECT c.id, c.display_name, c.xp, p.avatar_url
       FROM channel_rankings cr
       JOIN characters c ON c.id = cr.character_id
       JOIN profiles p ON p.id = c.profile_id
       WHERE cr.channel_id = ? AND cr.last_ping_at >= ? AND c.is_shadow_banned = 0
       ORDER BY cr.total_xp DESC
       LIMIT 20`,
    )
    .all(channel.id, cutoff) as Array<{
      id: string;
      display_name: string;
      xp: number;
      avatar_url: string | null;
    }>;

  return rows.map((row) => {
    const progress = getProgress(row.xp);
    return {
      id: row.id,
      display_name: row.display_name,
      level: progress.level,
      xp: progress.xp,
      percent: progress.percent,
      avatar_url: row.avatar_url,
    };
  });
}

export function getRanking(channelLogin: string | null, profileId: string | null) {
  const db = getDb();
  let channelId: string | null = null;

  if (channelLogin) {
    const channel = db
      .prepare("SELECT id FROM streamer_channels WHERE id = ?")
      .get(channelLogin.toLowerCase()) as { id: string } | undefined;
    channelId = channel?.id ?? null;
  }

  const rows = channelId
    ? (db
        .prepare(
          `SELECT cr.position, c.id AS character_id, c.display_name, c.xp, c.total_minutes, p.avatar_url
           FROM channel_rankings cr
           JOIN characters c ON c.id = cr.character_id
           JOIN profiles p ON p.id = c.profile_id
           WHERE cr.channel_id = ? AND c.is_shadow_banned = 0
           ORDER BY cr.position ASC
           LIMIT 50`,
        )
        .all(channelId) as Array<{
        position: number;
        character_id: string;
        display_name: string;
        xp: number;
        total_minutes: number;
        avatar_url: string | null;
      }>)
    : (db
        .prepare(
          `SELECT c.id AS character_id, c.display_name, c.xp, c.total_minutes, p.avatar_url
           FROM characters c
           JOIN profiles p ON p.id = c.profile_id
           WHERE c.is_shadow_banned = 0
           ORDER BY c.xp DESC
           LIMIT 50`,
        )
        .all() as Array<{
        position?: number;
        character_id: string;
        display_name: string;
        xp: number;
        total_minutes: number;
        avatar_url: string | null;
      }>);

  let myPosition: number | null = null;
  if (profileId) {
    const mine = db
      .prepare("SELECT id FROM characters WHERE profile_id = ?")
      .get(profileId) as { id: string } | undefined;
    if (mine) {
      const idx = rows.findIndex((r) => r.character_id === mine.id);
      myPosition = idx >= 0 ? (rows[idx].position ?? idx + 1) : null;
    }
  }

  return {
    channel: channelId,
    entries: rows.map((row, i) => {
      const progress = getProgress(row.xp);
      return {
        position: row.position ?? i + 1,
        character_id: row.character_id,
        display_name: row.display_name,
        level: progress.level,
        xp: row.xp,
        total_minutes: row.total_minutes,
        avatar_url: row.avatar_url,
      };
    }),
    my_position: myPosition,
  };
}
