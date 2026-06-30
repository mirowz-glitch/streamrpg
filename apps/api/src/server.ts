import { createServer } from "node:http";
import { env } from "./config/env.js";
import { handleStatic, buildWebOnce } from "./config/bundler.js";
import { closeDb, getDb } from "./config/database.js";
import { resolveAuth } from "./middleware/auth.js";
import { matchRoute, json, type Route } from "./middleware/router.js";
import { authRoutes } from "./routes/auth.js";
import { characterRoutes } from "./routes/character.js";
import { itemsRoutes } from "./routes/items.js";
import { overlayRoutes } from "./routes/overlay.js";
import { pingRoutes } from "./routes/ping.js";
import { rankingRoutes } from "./routes/ranking.js";
import { seedItems } from "./services/items.service.js";

const routes: Route[] = [
  ...authRoutes,
  ...pingRoutes,
  ...characterRoutes,
  ...overlayRoutes,
  ...rankingRoutes,
  ...itemsRoutes,
];

getDb();
seedItems();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", env.baseUrl);
    const ctx = await resolveAuth(req);

    if (url.pathname.startsWith("/api/") || url.pathname === "/health") {
      const matched = matchRoute(routes, req.method ?? "GET", url.pathname);
      if (matched) {
        await matched.route.handler(req, res, ctx, matched.params);
        return;
      }
      json(res, 404, { error: "Not found" });
      return;
    }

    const served = await handleStatic(req, res);
    if (!served) {
      json(res, 404, { error: "Not found" });
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      json(res, 500, { error: "Internal server error" });
    }
  }
});

async function start() {
  await buildWebOnce();
  server.listen(env.port, () => {
    console.log(`StreamRPG running on http://localhost:${env.port}`);
    if (!env.twitchClientId) {
      console.log("Warning: TWITCH_CLIENT_ID not set — configure .env for OAuth");
    }
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGINT", () => {
  closeDb();
  server.close(() => process.exit(0));
});
