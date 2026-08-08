import { randomBytes, randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import {
  clearSessionCookie,
  createSession,
  destroySession,
  requireAuth,
  setSessionCookie,
} from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import {
  exchangeTwitchCode,
  fetchTwitchUser,
  getTwitchAuthUrl,
} from "../services/auth.service.js";
import { getDb, nowUnix } from "../config/database.js";
import { createCharacter } from "./character.js";
import { connectStreamerChannel } from "../services/channel.service.js";
import { linkAccount, findProfileByAccount } from "../services/account.service.js";

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
        await createCharacter(profileId, twitchUser.display_name);
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

      // Sprint Identity Core (Vision 2.0) — Twitch passa a ser um Vínculo
      // de Autenticação (docs/design/identity-core.md), nunca a própria
      // Pessoa. Aditivo: profiles.twitch_id continua sendo lido/escrito
      // como antes (compatibilidade), esta chamada só garante que a
      // arquitetura de Account round-tripa de ponta a ponta com o único
      // login real que já existe.
      linkAccount(profile.id, "twitch", twitchUser.id);

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

  /**
   * World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 7 — Login
   * Providers (docs/design/login-providers.md) nomeia Google/Discord/
   * E-mail como "login core" (MVP), Twitch/Kick/YouTube como integração
   * opcional. Google/Discord/Kick/YouTube exigem credenciais de app OAuth
   * reais que este ambiente não tem configuradas — E-mail é o único dos
   * seis provedores que não depende de nenhum serviço externo, por isso é
   * o escolhido para provar a equivalência real desta Sprint: mesmo
   * fluxo de account.service.ts (findProfileByAccount -> cria Pessoa se
   * necessário -> linkAccount -> createSession), chega exatamente na
   * mesma forma de Character que o callback Twitch acima sempre criou —
   * sem nenhuma vantagem, sem nenhum campo a mais.
   */
  route("POST", "/api/auth/email", async (req, res) => {
    try {
      const body = JSON.parse(await readBody(req)) as { email?: string };
      const email = body.email?.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        json(res, 400, { error: "Valid email is required" });
        return;
      }

      const db = getDb();
      let profileId = findProfileByAccount("email", email);

      if (!profileId) {
        const existingByEmailColumn = db
          .prepare("SELECT id FROM profiles WHERE email = ?")
          .get(email) as { id: string } | undefined;

        if (existingByEmailColumn) {
          profileId = existingByEmailColumn.id;
        } else {
          const newProfileId = randomUUID();
          const username = email.split("@")[0];
          db.prepare(
            `INSERT INTO profiles (id, username, email, updated_at) VALUES (?, ?, ?, ?)`,
          ).run(newProfileId, username, email, nowUnix());
          await createCharacter(newProfileId, username);
          profileId = newProfileId;
        }
      }

      linkAccount(profileId, "email", email);

      const sessionId = createSession(profileId);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": setSessionCookie(sessionId),
      });
      res.end(JSON.stringify({ ok: true }));
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
