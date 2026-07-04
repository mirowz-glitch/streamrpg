import { OVERLAY_ACTIVE_SECONDS } from "@streamrpg/shared";
import type { OverlayResponse } from "@streamrpg/shared";
import { env } from "../config/env.js";
import { json, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { connectStreamerChannel, getStreamerDashboard } from "../services/channel.service.js";
import { getEquippedWeaponName } from "../services/drop.service.js";
import { getOverlayViewers } from "../services/xp.service.js";
import { getBossState } from "../services/boss-status.service.js";
import { getExpeditionCompactForCharacters } from "../services/expedition-status.service.js";
import { getIdentityCompactForCharacters } from "../services/identity.service.js";
import { getHallOfFameHighlights, resolveChannelId } from "../services/kingdom-prestige.service.js";
import { getDb } from "../config/database.js";

export const overlayRoutes = [
  route("GET", "/api/overlay/:channel/viewers", async (_req, res, _ctx, params) => {
    const channel = params.channel.toLowerCase();
    const baseViewers = getOverlayViewers(channel);
    const characterIds = baseViewers.map((v) => v.id);
    const expeditionByCharacter = getExpeditionCompactForCharacters(characterIds);
    const identityByCharacter = getIdentityCompactForCharacters(characterIds);
    const viewers = baseViewers.map((viewer) => ({
      ...viewer,
      equipped_weapon: getEquippedWeaponName(viewer.id),
      expedition: expeditionByCharacter.get(viewer.id) ?? null,
      title_name: identityByCharacter.get(viewer.id)?.title_name ?? null,
    }));

    // Sprint Kingdom Prestige System, Etapa 5 — só os cargos mais
    // importantes, nunca os 6 (getHallOfFameHighlights já filtra).
    const channelId = resolveChannelId(channel);
    const response: OverlayResponse = {
      channel,
      viewers,
      total: viewers.length,
      updated_at: new Date().toISOString(),
      hall_of_fame_highlights: channelId ? getHallOfFameHighlights(channelId) : [],
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    json(res, 200, response);
  }),

  // Sprint Boss Experience — só leitura (boss-status.service.ts), público
  // como o de viewers acima. Nenhuma regra de jogo aqui.
  route("GET", "/api/overlay/:channel/boss", async (_req, res, _ctx, params) => {
    const channel = params.channel.toLowerCase();
    const state = getBossState(channel);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    json(res, 200, state);
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
