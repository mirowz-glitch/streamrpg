/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 3 — expõe o
 * WorldPresence (horário/dia/clima/regiões ativas) computado pelo
 * WorldPresenceSystem a cada "world.tick". Rota pública (sem
 * `requireAuth`) de propósito: o Mundo existe e continua avançando
 * mesmo sem login — o mesmo princípio já aplicado a `GET /api/kingdom/
 * :id/integrations` (pública, explícita).
 */
import { json, route } from "../middleware/router.js";
import { getWorldPresence } from "../systems/WorldPresenceSystem.js";

export const worldPresenceRoutes = [
  route("GET", "/api/world/presence", async (_req, res) => {
    json(res, 200, getWorldPresence());
  }),
];
