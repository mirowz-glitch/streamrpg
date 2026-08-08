/**
 * Kingdom Integration — Kingdom Integration Phase I (Vision 2.0, Sprint 8)
 *
 * `GET /api/kingdom/integrations` (2 segmentos, estática) precisa ser
 * registrada ANTES de `GET /api/kingdom/:slug` (routes/kingdoms.ts, 2
 * segmentos, dinâmica) em server.ts — mesmo número de segmentos, o
 * roteador (middleware/router.ts) casa na ordem do array e trataria
 * "integrations" como um slug de Reino se a ordem fosse invertida
 * (mesma classe de bug já documentada em Real Estate Phase I).
 * `GET /api/kingdom/:id/integrations` (3 segmentos) não colide com
 * `/api/kingdom/:channel/me` (Kingdom Prestige), `/api/kingdom/:id/
 * citizens` (Citizen System) nem `/api/kingdom/:id/houses` (Housing) —
 * sufixo literal sempre distinto.
 */
import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { getCitizen } from "../services/citizen.service.js";
import { getCharacterIdByProfileId } from "./character.js";
import {
  connectKingdomIntegration,
  disconnectKingdomIntegration,
  listKingdomIntegrations,
} from "../services/kingdomIntegration.service.js";

function resolveOwnKingdomId(profileId: string): string | null {
  const characterId = getCharacterIdByProfileId(profileId);
  if (!characterId) return null;
  const citizen = getCitizen(characterId);
  return citizen?.kingdom_id ?? null;
}

export const kingdomIntegrationRoutes = [
  route("POST", "/api/kingdom/integration", async (req, res, ctx) => {
    try {
      requireAuth(ctx);
      const body = JSON.parse(await readBody(req)) as {
        kingdom_id?: string;
        provider?: string;
        external_id?: string;
        display_name?: string;
        metadata?: Record<string, unknown>;
      };
      if (!body.kingdom_id || !body.provider || !body.external_id || !body.display_name) {
        json(res, 400, { error: "kingdom_id, provider, external_id and display_name are required" });
        return;
      }
      const integration = connectKingdomIntegration(body.kingdom_id, body.provider, {
        externalId: body.external_id,
        displayName: body.display_name,
        metadata: body.metadata,
      });
      json(res, 201, { integration });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect integration";
      const status = message === "Unauthorized" ? 401 : 400;
      json(res, status, { error: message });
    }
  }),

  route("DELETE", "/api/kingdom/integration/:id", async (_req, res, ctx, params) => {
    try {
      requireAuth(ctx);
      const result = disconnectKingdomIntegration(params.id);
      if (!result.success) {
        json(res, 404, { error: result.reason });
        return;
      }
      json(res, 200, { integration: result.integration });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  // Variante "meu Reino": resolve a partir da cidadania do próprio
  // chamador — mesmo padrão de GET /api/citizen (self) vs. GET
  // /api/kingdom/:id/citizens (explícito) já usado em routes/citizen.ts.
  route("GET", "/api/kingdom/integrations", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const kingdomId = resolveOwnKingdomId(profileId);
      if (!kingdomId) {
        json(res, 200, { integrations: [] });
        return;
      }
      json(res, 200, { integrations: listKingdomIntegrations(kingdomId) });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("GET", "/api/kingdom/:id/integrations", (_req, res, _ctx, params) => {
    json(res, 200, { integrations: listKingdomIntegrations(params.id) });
  }),
];
