import { randomBytes, randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  requireAuth,
  setSessionCookie,
} from "../middleware/auth.js";
import { json, route } from "../middleware/router.js";
import {
  exchangeTwitchCode,
  fetchTwitchUser,
  getTwitchAuthUrl,
} from "../services/auth.service.js";
import { getDb, nowUnix } from "../config/database.js";
import { createCharacter } from "./character.js";
import { connectStreamerChannel } from "../services/channel.service.js";

export const authRoutes = [
  route("GET", "/api/auth/login", (_req, res) => {
    const state = randomBytes(16).toString("hex");
    res.setHeader("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);
    json(res, 200, { url: getTwitchAuthUrl(state) });
  }),

  route("GET", "/api/auth/callback", async (req, res) => {
    const url = new URL(req.url ?? "/", env.baseUrl);
    const code = url.searchParams.get("code");
    if (!code) {
      json(res, 400, { error: "Missing code" });
      return;
    }

    try {
      const tokens = await exchangeTwitchCode(code);
      const twitchUser = await fetchTwitchUser(tokens.access_token);
      const db = getDb();
      const now = nowUnix();

      let profile = db
        .prepare("SELECT id FROM profiles WHERE twitch_id = ?")
        .get(twitchUser.id) as { id: string } | undefined;

      if (!profile) {
        const profileId = randomUUID();
        db.prepare(
          `INSERT INTO profiles (id, twitch_id, username, avatar_url, email, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(
          profileId,
          twitchUser.id,
          twitchUser.login,
          twitchUser.profile_image_url,
          twitchUser.email ?? null,
          now,
        );
        createCharacter(profileId, twitchUser.display_name);
        profile = { id: profileId };
      } else {
        db.prepare(
          `UPDATE profiles SET username = ?, avatar_url = ?, email = ?, updated_at = ?
           WHERE id = ?`,
        ).run(
          twitchUser.login,
          twitchUser.profile_image_url,
          twitchUser.email ?? null,
          now,
          profile.id,
        );
      }

      connectStreamerChannel(
        profile.id,
        twitchUser.id,
        twitchUser.login,
        twitchUser.display_name,
        twitchUser.profile_image_url,
      );

      const sessionId = createSession(profile.id);
      res.writeHead(302, {
        Location: "/app/character",
        "Set-Cookie": setSessionCookie(sessionId),
      });
      res.end();
    } catch (err) {
      console.error(err);
      json(res, 500, { error: "Authentication failed" });
    }
  }),

  route("GET", "/api/auth/me", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const profile = getDb()
        .prepare("SELECT id, username, avatar_url, email, created_at FROM profiles WHERE id = ?")
        .get(profileId) as {
          id: string;
          username: string;
          avatar_url: string | null;
          email: string | null;
          created_at: number;
        };

      json(res, 200, {
        profile: {
          ...profile,
          created_at: new Date(profile.created_at * 1000).toISOString(),
        },
      });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/auth/logout", (_req, res, ctx) => {
    if (ctx.sessionId) {
      destroySession(ctx.sessionId);
    }
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie(),
    });
    res.end(JSON.stringify({ ok: true }));
  }),

  route("GET", "/health", (_req, res) => {
    json(res, 200, {
      ok: true,
      ping_interval_seconds: 60,
      overlay_poll_seconds: 5,
      xp_per_ping: 10,
    });
  }),
];
