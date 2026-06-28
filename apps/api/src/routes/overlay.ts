import { OVERLAY_ACTIVE_SECONDS } from "@streamrpg/shared";
import type { OverlayResponse } from "@streamrpg/shared";
import { env } from "../config/env.js";
import { json, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { connectStreamerChannel, getStreamerDashboard } from "../services/channel.service.js";
import { getEquippedWeaponName } from "../services/drop.service.js";
import { getOverlayViewers } from "../services/xp.service.js";
import { getDb } from "../config/database.js";

export const overlayRoutes = [
  route("GET", "/api/overlay/:channel/viewers", async (_req, res, _ctx, params) => {
    const channel = params.channel.toLowerCase();
    const viewers = getOverlayViewers(channel).map((viewer) => ({
      ...viewer,
      equipped_weapon: getEquippedWeaponName(viewer.id),
    }));

    const response: OverlayResponse = {
      channel,
      viewers,
      total: viewers.length,
      updated_at: new Date().toISOString(),
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    json(res, 200, response);
  }),

  route("GET", "/api/streamer/dashboard", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const profile = getDb()
        .prepare("SELECT username FROM profiles WHERE id = ?")
        .get(profileId) as { username: string };
      const dashboard = getStreamerDashboard(profile.username.toLowerCase(), env.baseUrl);
      if (!dashboard) {
        json(res, 404, { error: "Channel not connected. Call POST /api/streamer/connect first." });
        return;
      }
      json(res, 200, dashboard);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/streamer/connect", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const profile = getDb()
        .prepare("SELECT username, avatar_url, twitch_id FROM profiles WHERE id = ?")
        .get(profileId) as { username: string; avatar_url: string | null; twitch_id: string };

      const channel = connectStreamerChannel(
        profileId,
        profile.twitch_id,
        profile.username,
        profile.username,
        profile.avatar_url,
      );

      json(res, 200, {
        channel: {
          id: channel.id,
          display_name: channel.display_name,
          overlay_url: `${env.baseUrl}/overlay/${channel.id}`,
        },
      });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];

export { OVERLAY_ACTIVE_SECONDS };
