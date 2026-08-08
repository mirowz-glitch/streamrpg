/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 8 — rota
 * pública, mesmo princípio de `/api/world/presence`/`/api/world/feed`.
 */
import { json, route } from "../middleware/router.js";
import { getWorldNews } from "../services/worldNews.service.js";

export const worldNewsRoutes = [
  route("GET", "/api/world/news", async (_req, res) => {
    json(res, 200, getWorldNews());
  }),
];
