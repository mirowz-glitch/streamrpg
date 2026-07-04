import { json, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { getCurrentExpedition } from "../services/expedition-status.service.js";
import { getCharacterIdByProfileId } from "./character.js";

// Sprint Expedition System — leitura autenticada, mesmo padrão de
// /api/character. Nenhuma escrita: a expedição só avança via
// ExpeditionSystem reagindo a eventos reais do EventBus.
export const expeditionRoutes = [
  route("GET", "/api/expedition/current", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const expedition = getCurrentExpedition(characterId);
      json(res, 200, { expedition });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
