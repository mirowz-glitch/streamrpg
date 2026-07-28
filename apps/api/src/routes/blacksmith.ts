import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { upgradeItem } from "../services/blacksmith.service.js";
import { getCharacterIdByProfileId } from "./character.js";

// Blacksmith Phase I — única rota desta Sprint (mesma disciplina de
// routes/merchant.ts: só autentica, valida o shape do body, e delega
// inteiramente a blacksmith.service.ts — nenhuma regra de
// custo/débito/melhoria vive aqui).
export const blacksmithRoutes = [
  route("POST", "/api/blacksmith/upgrade", async (req, res, ctx) => {
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
      const result = upgradeItem(characterId, body.character_item_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, {
        item: result.item,
        cost: result.cost,
        power_score: result.newPowerScore,
        upgrade_level: result.newUpgradeLevel,
        gold: result.newGoldBalance,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upgrade failed";
      json(res, 400, { error: message });
    }
  }),
];
