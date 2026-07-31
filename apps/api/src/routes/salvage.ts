import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { dismantleItem } from "../services/salvage.service.js";
import { getCharacterIdByProfileId } from "./character.js";

// Salvage Phase I — única rota desta Sprint (mesma disciplina de
// routes/merchant.ts/routes/blacksmith.ts: só autentica, valida o shape
// do body, e delega inteiramente a salvage.service.ts — nenhuma regra
// de elegibilidade/recompensa/remoção vive aqui).
export const salvageRoutes = [
  route("POST", "/api/salvage", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { character_item_id?: number };
      if (!body.character_item_id) {
        json(res, 400, { error: "character_item_id is required" });
        return;
      }
      const result = dismantleItem(characterId, body.character_item_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, {
        item: result.item,
        rewards: result.rewards,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Salvage failed";
      json(res, 400, { error: message });
    }
  }),
];
