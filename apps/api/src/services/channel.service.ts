import { getProgress } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

export function ensureChannel(login: string, displayName?: string, avatarUrl?: string | null) {
  const id = login.toLowerCase();
  const db = getDb();
  const existing = db
    .prepare("SELECT id, display_name, avatar_url FROM streamer_channels WHERE id = ?")
    .get(id) as { id: string; display_name: string; avatar_url: string | null } | undefined;

  if (existing) {
    return existing;
  }

  db.prepare(
    `INSERT INTO streamer_channels (id, twitch_id, display_name, avatar_url)
     VALUES (?, ?, ?, ?)`,
  ).run(id, id, displayName ?? login, avatarUrl ?? null);

  return { id, display_name: displayName ?? login, avatar_url: avatarUrl ?? null };
}

export function connectStreamerChannel(
  profileId: string,
  twitchId: string,
  username: string,
  displayName: string,
  avatarUrl: string | null,
) {
  const db = getDb();
  const channelId = username.toLowerCase();
  const now = nowUnix();

  db.prepare(
    `INSERT INTO streamer_channels (id, twitch_id, display_name, avatar_url, owner_profile_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       twitch_id = excluded.twitch_id,
       display_name = excluded.display_name,
       avatar_url = excluded.avatar_url,
       owner_profile_id = excluded.owner_profile_id,
       updated_at = excluded.updated_at`,
  ).run(channelId, twitchId, displayName, avatarUrl, profileId, now);

  return db
    .prepare("SELECT * FROM streamer_channels WHERE id = ?")
    .get(channelId) as {
      id: string;
      display_name: string;
      twitch_id: string;
      avatar_url: string | null;
      is_pro: number;
      created_at: number;
    };
}

export function getStreamerDashboard(channelId: string, baseUrl: string) {
  const db = getDb();
  const channel = db
    .prepare("SELECT * FROM streamer_channels WHERE id = ?")
    .get(channelId) as {
      id: string;
      display_name: string;
      twitch_id: string;
      avatar_url: string | null;
      is_pro: number;
      created_at: number;
    } | undefined;

  if (!channel) {
    return null;
  }

  const cutoff = nowUnix() - 300;
  const activeViewers = db
    .prepare(
      `SELECT COUNT(*) AS c FROM channel_rankings
       WHERE channel_id = ? AND last_ping_at >= ?`,
    )
    .get(channelId, cutoff) as { c: number };

  const totalViewers = db
    .prepare("SELECT COUNT(*) AS c FROM channel_rankings WHERE channel_id = ?")
    .get(channelId) as { c: number };

  const rankingPreview = db
    .prepare(
      `SELECT cr.position, c.id AS character_id, c.display_name, c.xp, c.total_minutes, p.avatar_url
       FROM channel_rankings cr
       JOIN characters c ON c.id = cr.character_id
       JOIN profiles p ON p.id = c.profile_id
       WHERE cr.channel_id = ?
       ORDER BY cr.position ASC
       LIMIT 5`,
    )
    .all(channelId) as Array<{
      position: number;
      character_id: string;
      display_name: string;
      xp: number;
      total_minutes: number;
      avatar_url: string | null;
    }>;

  return {
    channel: {
      id: channel.id,
      display_name: channel.display_name,
      twitch_id: channel.twitch_id,
      avatar_url: channel.avatar_url,
      is_pro: Boolean(channel.is_pro),
      created_at: new Date(channel.created_at * 1000).toISOString(),
    },
    active_viewers: activeViewers.c,
    total_viewers: totalViewers.c,
    overlay_url: `${baseUrl}/overlay/${channel.id}`,
    ranking_preview: rankingPreview.map((row) => ({
      position: row.position,
      character_id: row.character_id,
      display_name: row.display_name,
      level: getProgress(row.xp).level,
      xp: row.xp,
      total_minutes: row.total_minutes,
      avatar_url: row.avatar_url,
    })),
  };
}
