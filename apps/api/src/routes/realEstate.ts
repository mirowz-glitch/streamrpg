/**
 * Real Estate — Sprint Real Estate Phase I (Vision 2.0, Sprint 6)
 *
 * Cinco rotas mínimas: anunciar, cancelar, comprar, listar anúncios,
 * buscar um anúncio. Todas autenticadas exceto as duas de leitura.
 * `POST /api/house/buy` é a única rota que move Gold entre jogadores —
 * inteiramente delegada a `realEstate.service.ts`'s `buyHouse()`,
 * nenhuma regra de preço/pagamento vive aqui.
 */
import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { buyHouse, cancelSale, createSale, getSale, listSales } from "../services/realEstate.service.js";
import { getCharacterIdByProfileId } from "./character.js";

export const realEstateRoutes = [
  route("POST", "/api/house/sell", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}") as { house_id?: string; asking_price?: number };
      if (!body.house_id || body.asking_price === undefined) {
        json(res, 400, { error: "house_id and asking_price are required" });
        return;
      }
      const result = createSale(characterId, body.house_id, body.asking_price);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 201, { sale: result.sale });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create sale";
      json(res, 400, { error: message });
    }
  }),

  route("POST", "/api/house/cancel", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}") as { sale_id?: string };
      if (!body.sale_id) {
        json(res, 400, { error: "sale_id is required" });
        return;
      }
      const result = cancelSale(characterId, body.sale_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel sale";
      json(res, 400, { error: message });
    }
  }),

  route("POST", "/api/house/buy", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}") as { sale_id?: string };
      if (!body.sale_id) {
        json(res, 400, { error: "sale_id is required" });
        return;
      }
      const result = buyHouse(characterId, body.sale_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { sale: result.sale, gold: result.newBuyerGoldBalance });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to buy house";
      json(res, 400, { error: message });
    }
  }),

  route("GET", "/api/house/sales", (_req, res) => {
    json(res, 200, { sales: listSales() });
  }),

  route("GET", "/api/house/sale/:id", (_req, res, _ctx, params) => {
    const sale = getSale(params.id);
    if (!sale) {
      json(res, 404, { error: "Sale not found" });
      return;
    }
    json(res, 200, { sale });
  }),
];
