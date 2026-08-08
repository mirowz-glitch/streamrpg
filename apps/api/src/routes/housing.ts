/**
 * Housing — Sprint Housing Phase I (Vision 2.0, Sprint 5)
 *
 * Cinco rotas mínimas: construir, listar todas, buscar por id, listar
 * por Reino, transferir posse. Nenhuma rota de Mercado (comprar/vender)
 * — isso é escopo de Real Estate Phase I.
 *
 * `PUT /api/house/:id/owner` é infraestrutura administrativa pura —
 * autentica o chamador, mas não verifica que ele é o dono atual da Casa
 * nem exige nenhuma autoridade especial (mesma classe de risco já
 * nomeada em `POST /api/citizen/rank`, Sprint Citizen Progression).
 * Nenhuma tela desta Sprint expõe uma ação de jogador que chame essa
 * rota (HousingPage.tsx é só leitura + construção) — ver "Problemas
 * Encontrados" em docs/design/housing-phase1-implementation.md.
 */
import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import {
  createHouse,
  getHouse,
  listHouses,
  listKingdomHouses,
  transferOwnership,
} from "../services/housing.service.js";
import { getCharacterIdByProfileId } from "./character.js";

export const housingRoutes = [
  route("POST", "/api/houses", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}") as {
        kingdom_id?: string;
        name?: string;
        district?: string;
        plot?: string;
        house_type?: string;
      };
      if (!body.kingdom_id || !body.name) {
        json(res, 400, { error: "kingdom_id and name are required" });
        return;
      }
      const result = createHouse(characterId, {
        kingdom_id: body.kingdom_id,
        name: body.name,
        district: body.district,
        plot: body.plot,
        house_type: body.house_type,
      });
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 201, { house: result.house });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create house";
      json(res, 400, { error: message });
    }
  }),

  route("GET", "/api/houses", (_req, res) => {
    json(res, 200, { houses: listHouses() });
  }),

  route("GET", "/api/house/:id", (_req, res, _ctx, params) => {
    const house = getHouse(params.id);
    if (!house) {
      json(res, 404, { error: "House not found" });
      return;
    }
    json(res, 200, { house });
  }),

  route("GET", "/api/kingdom/:id/houses", (_req, res, _ctx, params) => {
    json(res, 200, { houses: listKingdomHouses(params.id) });
  }),

  route("PUT", "/api/house/:id/owner", async (req, res, ctx, params) => {
    try {
      requireAuth(ctx);
      const body = JSON.parse((await readBody(req)) || "{}") as { new_owner_character_id?: string };
      if (!body.new_owner_character_id) {
        json(res, 400, { error: "new_owner_character_id is required" });
        return;
      }
      const result = transferOwnership(params.id, body.new_owner_character_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { house: result.house });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to transfer ownership";
      json(res, 400, { error: message });
    }
  }),
];
