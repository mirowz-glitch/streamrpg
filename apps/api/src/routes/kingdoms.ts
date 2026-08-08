/**
 * Kingdom Domain — Sprint Kingdom Domain 2.0 (Vision 2.0, Sprint 2)
 *
 * Três rotas mínimas, nada além disso: listar, buscar por slug, fundar.
 * Nenhuma rota de edição, exclusão ou troca de liderança — essas
 * pertencem a Sprints futuras (Citizen System em diante). Nome do arquivo
 * (plural, `kingdoms.ts`) deliberadamente distinto de `routes/kingdom.ts`
 * (o Kingdom Prestige System já existente, rotas de cargo/canal — modelo
 * antigo, não tocado aqui); as duas convivem sem colisão de padrão de
 * URL: `/api/kingdom/:slug` (2 segmentos) nunca casa com
 * `/api/kingdom/:channel/me` (3 segmentos).
 */
import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { createKingdom, getKingdomBySlug, listKingdoms } from "../services/kingdom.service.js";

export const kingdomDomainRoutes = [
  route("GET", "/api/kingdoms", (_req, res) => {
    json(res, 200, { kingdoms: listKingdoms() });
  }),

  route("GET", "/api/kingdom/:slug", (_req, res, _ctx, params) => {
    const kingdom = getKingdomBySlug(params.slug);
    if (!kingdom) {
      json(res, 404, { error: "Kingdom not found" });
      return;
    }
    json(res, 200, { kingdom });
  }),

  route("POST", "/api/kingdom", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const body = JSON.parse(await readBody(req)) as { name?: string; description?: string; slug?: string };
      if (!body.name || !body.name.trim()) {
        json(res, 400, { error: "name is required" });
        return;
      }
      const result = createKingdom(profileId, { name: body.name, description: body.description, slug: body.slug });
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 201, { kingdom: result.kingdom });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create kingdom";
      json(res, 400, { error: message });
    }
  }),
];
