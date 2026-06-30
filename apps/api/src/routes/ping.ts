import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { applyPing } from "../services/xp.service.js";
import { getCharacterIdByProfileId } from "./character.js";
import { sessionManager } from "../engine/SessionManager.js";

export const pingRoutes = [
  route("POST", "/api/ping", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { channel?: string };
      const channel = body.channel?.trim().toLowerCase();
      if (!channel) {
        json(res, 400, { error: "channel is required (Twitch login of the streamer)" });
        return;
      }

      sessionManager.reportPresent(characterId, channel);

      const result = await applyPing(characterId, channel);
      json(res, 200, result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ping failed";
      const status = message === "Unauthorized" ? 401 : 500;
      json(res, status, { error: message });
    }
  }),
];
