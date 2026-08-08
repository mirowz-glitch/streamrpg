/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — rota pública
 * (sem `requireAuth`) de propósito: o Feed do Mundo é visível mesmo sem
 * login, mesmo princípio já aplicado a `GET /api/world/presence`.
 */
import { json, route } from "../middleware/router.js";
import { getActivityFeed } from "../services/activityFeed.service.js";

export const activityFeedRoutes = [
  route("GET", "/api/world/feed", async (_req, res) => {
    json(res, 200, { entries: getActivityFeed() });
  }),
];
