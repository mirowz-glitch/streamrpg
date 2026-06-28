import { json, route } from "../middleware/router.js";
import { getRanking } from "../services/xp.service.js";

export const rankingRoutes = [
  route("GET", "/api/ranking", async (req, res, ctx) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const channel = url.searchParams.get("channel");
    const data = getRanking(channel, ctx.profileId);
    json(res, 200, data);
  }),
];
