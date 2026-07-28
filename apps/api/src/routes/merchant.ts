import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { sellItem } from "../services/merchant.service.js";
import { getCharacterIdByProfileId } from "./character.js";

// Merchant Phase I — única rota desta Sprint (Fase 5: "não escrever SQL
// fora da camada de persistência; nenhuma lógica econômica na API").
// Esta rota só autentica, valida o shape do body, e delega inteiramente
// a merchant.service.ts — nenhuma regra de preço/crédito/remoção vive
// aqui.
export const merchantRoutes = [
  route("POST", "/api/merchant/sell", async (req, res, ctx) => {
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
      const result = sellItem(characterId, body.character_item_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, {
        item: result.item,
        sale_value: result.saleValue,
        gold: result.newGoldBalance,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sell failed";
      json(res, 400, { error: message });
    }
  }),
];
