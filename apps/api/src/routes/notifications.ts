/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 7 — sempre
 * autenticada (`requireAuth`): notificação é pessoal, nunca pública.
 */
import { requireAuth } from "../middleware/auth.js";
import { json, route } from "../middleware/router.js";
import { getCharacterIdByProfileId } from "./character.js";
import { dismissNotifications, getNotifications } from "../services/notifications.service.js";

export const notificationsRoutes = [
  route("GET", "/api/notifications", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { notifications: getNotifications(characterId) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch notifications";
      json(res, message === "Unauthorized" ? 401 : 500, { error: message });
    }
  }),

  route("POST", "/api/notifications/dismiss", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      dismissNotifications(characterId);
      json(res, 200, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to dismiss notifications";
      json(res, message === "Unauthorized" ? 401 : 500, { error: message });
    }
  }),
];
