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
import { worldRoutes } from "./routes/world.js";
import { expeditionRoutes } from "./routes/expedition.js";
import { identityRoutes } from "./routes/identity.js";
import { kingdomRoutes } from "./routes/kingdom.js";
import { chronicleRoutes } from "./routes/chronicle.js";
import { seedItems } from "./services/items.service.js";
import { seedIdentityCatalog } from "./services/identity.service.js";
import { sessionManager } from "./engine/SessionManager.js";
import { EventBus } from "./engine/EventBus.js";
import { GameEngine } from "./engine/GameEngine.js";
import { XPSystem } from "./systems/XPSystemV2.js";
import { WelcomeRewardSystem } from "./systems/WelcomeRewardSystem.js";
import { FirstItemQuestSystem } from "./systems/FirstItemQuestSystem.js";
import { DropSystem } from "./systems/DropSystem.js";
import { BossSpawnSystem } from "./systems/BossSpawnSystem.js";
import { BossParticipationSystem } from "./systems/BossParticipationSystem.js";
import { BossCombatSystem } from "./systems/BossCombatSystem.js";
import { BossRewardSystem } from "./systems/BossRewardSystem.js";
import { SQLiteCharacterRepository } from "./infrastructure/SQLiteCharacterRepository.js";
import { SQLiteItemRepository } from "./infrastructure/SQLiteItemRepository.js";
import { SQLiteBossRepository } from "./infrastructure/SQLiteBossRepository.js";
import { SQLiteBossParticipationRepository } from "./infrastructure/SQLiteBossParticipationRepository.js";
import { SQLiteBossRewardRepository } from "./infrastructure/SQLiteBossRewardRepository.js";
import { SQLiteChronicleRepository } from "./infrastructure/SQLiteChronicleRepository.js";
import { ChronicleSystem } from "./systems/ChronicleSystem.js";
import { RandomProviderImpl } from "./infrastructure/RandomProviderImpl.js";
import { SQLiteExpeditionRepository } from "./infrastructure/SQLiteExpeditionRepository.js";
import { ExpeditionSystem } from "./systems/ExpeditionSystem.js";
import { IdentitySystem } from "./systems/IdentitySystem.js";
import { KingdomPrestigeSystem } from "./systems/KingdomPrestigeSystem.js";
import { DebugEventSubscriber } from "./debug/DebugEventSubscriber.js";
import { WorldEventSubscriber } from "./services/world-state.service.js";
import { KingdomNewsSystem } from "./systems/KingdomNewsSystem.js";

const routes: Route[] = [
  ...authRoutes,
  ...pingRoutes,
  ...characterRoutes,
  ...overlayRoutes,
  ...rankingRoutes,
  ...itemsRoutes,
  ...worldRoutes,
  ...expeditionRoutes,
  ...identityRoutes,
  ...kingdomRoutes,
  ...chronicleRoutes,
];

getDb();
seedItems();
seedIdentityCatalog();

const characterRepository = new SQLiteCharacterRepository();
const bus = new EventBus();
sessionManager.setEventBus(bus);
const engine = new GameEngine(bus, sessionManager);
const xpSystem = new XPSystem(characterRepository);
xpSystem.register(bus);
const welcomeRewardSystem = new WelcomeRewardSystem(characterRepository);
welcomeRewardSystem.register(bus);
const itemRepository = new SQLiteItemRepository();
const randomProvider = new RandomProviderImpl();
const dropSystem = new DropSystem(itemRepository, randomProvider);
dropSystem.register(bus);

// Sprint First 120 Seconds — item inicial equipado + missão "equipar seu
// primeiro item", reaproveitando characterRepository/itemRepository já
// existentes acima. source: "quest" no xp.granted já é ignorado pelo
// DropSystem (só reage a source === "tick"), nenhuma alteração lá.
const firstItemQuestSystem = new FirstItemQuestSystem(characterRepository, itemRepository);
firstItemQuestSystem.register(bus);

// BossSystem (Sprints B1-B4, docs/technical-design/boss-system.md) — código
// já existia e era validado via harness isolado, mas nunca era registrado
// no EventBus real. Conectado aqui pela primeira vez (Sprint Boss
// Integration). Reaproveita characterRepository/itemRepository/
// randomProvider já existentes acima — nenhuma instância nova além dos
// Repositories próprios de Boss.
const bossRepository = new SQLiteBossRepository();
const bossParticipationRepository = new SQLiteBossParticipationRepository();
const bossRewardRepository = new SQLiteBossRewardRepository();
const bossSpawnSystem = new BossSpawnSystem(bossRepository);
bossSpawnSystem.register(bus);
const bossParticipationSystem = new BossParticipationSystem(bossRepository, bossParticipationRepository);
bossParticipationSystem.register(bus);
const bossCombatSystem = new BossCombatSystem(bossRepository, characterRepository, randomProvider);
bossCombatSystem.register(bus);
const bossRewardSystem = new BossRewardSystem(
  bossParticipationRepository,
  bossRewardRepository,
  characterRepository,
  itemRepository,
  randomProvider,
);
bossRewardSystem.register(bus);

// Sprint Kingdom Chronicles (MVP) — o "Livro" permanente de cada
// personagem. Reaproveita bossParticipationRepository já existente
// acima (boss.defeated não carrega characterId, então este System
// consulta os mesmos participantes que o BossRewardSystem já lê).
const chronicleRepository = new SQLiteChronicleRepository();
const chronicleSystem = new ChronicleSystem(chronicleRepository, bossParticipationRepository);
chronicleSystem.register(bus);

// Sprint Expedition System — representação de "o que o personagem está
// fazendo agora" (região/estado/progresso). Nunca concede XP/Gold/Drop,
// nunca calcula dano — reaproveita randomProvider já existente, nenhuma
// instância nova além do Repository próprio de Expedition.
const expeditionRepository = new SQLiteExpeditionRepository();
const expeditionSystem = new ExpeditionSystem(expeditionRepository, randomProvider);
expeditionSystem.register(bus);

// Sprint Founder Identity & Prestige — puramente cosmético (Títulos e
// Molduras). Só observa dados que já existem (level, total_minutes,
// boss_rewards, expeditions, viewer_sessions), nenhuma escrita em
// nenhum outro sistema.
const identitySystem = new IdentitySystem();
identitySystem.register(bus);

// Sprint Kingdom Prestige System — identidade coletiva de CANAL (Hall da
// Fama, Prestígio). Só observa dados que já existem (channel_rankings,
// bosses/boss_rewards, expeditions, viewer_sessions), nenhuma escrita em
// nenhum outro sistema.
const kingdomPrestigeSystem = new KingdomPrestigeSystem();
kingdomPrestigeSystem.register(bus);

// Destacável por configuração — ver debug/DebugEventSubscriber.ts.
// Removendo esta linha (e a variável de ambiente), nenhum comportamento
// de jogo muda.
if (env.debugEventSubscriber) {
  new DebugEventSubscriber().register(bus);
  console.log("[server] DebugEventSubscriber ativo (DEBUG_EVENT_SUBSCRIBER=true)");
}

// Sprint World Simulation — sempre ativo (não é uma ferramenta de debug,
// é o que alimenta o painel "Mundo"/"Estado do Reino"). Só observa
// eventos que já existem no EventBus, mesmo princípio do
// DebugEventSubscriber: nenhuma regra de jogo, remoção não muda
// comportamento de gameplay algum (só o painel deixaria de atualizar).
new WorldEventSubscriber().register(bus);

// Sprint Kingdom News (MVP) — "Jornal do Reino", buffer próprio e
// separado da Timeline acima; mesmo espírito (sempre ativo, read-only,
// nenhuma regra de jogo, remoção seria inócua).
new KingdomNewsSystem().register(bus);

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
