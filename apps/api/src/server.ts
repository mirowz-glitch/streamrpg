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
import { sessionManager } from "./engine/SessionManager.js";
import { EventBus } from "./engine/EventBus.js";
import { GameEngine } from "./engine/GameEngine.js";
import { XPSystem } from "./systems/XPSystem.js";

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

// Engine — núcleo do jogo
const bus = new EventBus();
const engine = new GameEngine(bus, sessionManager);

// Sistemas registrados no EventBus
const xpSystem = new XPSystem();
xpSystem.register(bus);

// Subscriber de diagnóstico da Engine
// TODO: remover antes da release formal
bus.subscribe("world.tick", (event) => {
  console.log(`[Engine] World Tick #${event.tickNumber} — sessões ativas: ${event.sessions.length}`);
});

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
  engine.start();
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
  engine.stop();
  closeDb();
  server.close(() => process.exit(0));
});
