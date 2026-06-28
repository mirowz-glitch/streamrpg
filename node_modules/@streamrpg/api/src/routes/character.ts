import { randomUUID } from "node:crypto";
import { getProgress } from "@streamrpg/shared";
import type { CharacterResponse } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { readBody, json, route } from "../middleware/router.js";
import { getEquippedItems } from "../services/drop.service.js";

export function getCharacterByProfileId(profileId: string): CharacterResponse | null {
  const row = getDb()
    .prepare(
      `SELECT c.id, c.display_name, c.xp, c.gold, c.total_minutes, c.primary_channel_id, c.created_at, p.avatar_url
       FROM characters c
       JOIN profiles p ON p.id = c.profile_id
       WHERE c.profile_id = ?`,
    )
    .get(profileId) as
    | {
        id: string;
        display_name: string;
        xp: number;
        gold: number;
        total_minutes: number;
        primary_channel_id: string | null;
        created_at: number;
        avatar_url: string | null;
      }
    | undefined;

  if (!row) return null;

  const progress = getProgress(row.xp);
  const equipped = getEquippedItems(row.id);

  return {
    id: row.id,
    display_name: row.display_name,
    level: progress.level,
    xp: progress.xp,
    xp_to_next: progress.xp_to_next,
    percent: progress.percent,
    gold: row.gold,
    total_minutes: row.total_minutes,
    avatar_url: row.avatar_url,
    primary_channel_id: row.primary_channel_id,
    equipped: equipped.map((e) => ({
      slot: e.slot,
      character_item_id: e.character_item_id,
      name: e.name,
      rarity: e.rarity as CharacterResponse["equipped"][number]["rarity"],
    })),
    created_at: new Date(row.created_at * 1000).toISOString(),
  };
}

export function createCharacter(profileId: string, displayName: string): CharacterResponse {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO characters (id, profile_id, display_name, level, xp, gold, total_minutes)
       VALUES (?, ?, ?, 1, 0, 0, 0)`,
    )
    .run(id, profileId, displayName);

  const character = getCharacterByProfileId(profileId);
  if (!character) {
    throw new Error("Failed to create character");
  }
  return character;
}

export function updateDisplayName(profileId: string, displayName: string): CharacterResponse | null {
  getDb()
    .prepare(
      `UPDATE characters SET display_name = ?, updated_at = strftime('%s','now') WHERE profile_id = ?`,
    )
    .run(displayName, profileId);

  return getCharacterByProfileId(profileId);
}

export function getCharacterIdByProfileId(profileId: string): string | null {
  const row = getDb()
    .prepare("SELECT id FROM characters WHERE profile_id = ?")
    .get(profileId) as { id: string } | undefined;
  return row?.id ?? null;
}

export const characterRoutes = [
  route("GET", "/api/character", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const character = getCharacterByProfileId(profileId);
      if (!character) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, character);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("PATCH", "/api/character", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const body = JSON.parse(await readBody(req)) as { display_name?: string };
      if (!body.display_name?.trim()) {
        json(res, 400, { error: "display_name is required" });
        return;
      }
      const character = updateDisplayName(profileId, body.display_name.trim());
      if (!character) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, character);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
