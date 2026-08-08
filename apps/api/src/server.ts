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
import { merchantRoutes } from "./routes/merchant.js";
import { blacksmithRoutes } from "./routes/blacksmith.js";
import { salvageRoutes } from "./routes/salvage.js";
import { kingdomDomainRoutes } from "./routes/kingdoms.js";
import { kingdomIntegrationRoutes } from "./routes/kingdomIntegration.js";
import { citizenRoutes } from "./routes/citizen.js";
import { housingRoutes } from "./routes/housing.js";
import { realEstateRoutes } from "./routes/realEstate.js";
import { presenceRoutes } from "./routes/presence.js";
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
import { WorldPresenceSystem } from "./systems/WorldPresenceSystem.js";
import { playerPresenceProvider } from "./services/presence.service.js";
import { worldPresenceRoutes } from "./routes/worldPresence.js";
import { registerActivityFeedBusListeners } from "./services/activityFeed.service.js";
import { activityFeedRoutes } from "./routes/activityFeed.js";
import { notificationsRoutes } from "./routes/notifications.js";
import { worldNewsRoutes } from "./routes/worldNews.js";

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
  ...merchantRoutes,
  ...blacksmithRoutes,
  ...salvageRoutes,
  // kingdomIntegrationRoutes ANTES de kingdomDomainRoutes: GET
  // /api/kingdom/integrations (rota estática) precisa ser testada
  // antes de GET /api/kingdom/:slug (rota dinâmica, kingdomDomainRoutes)
  // — mesmo número de segmentos, mesma classe de colisão já documentada
  // em Real Estate Phase I (ver routes/kingdomIntegration.ts).
  ...kingdomIntegrationRoutes,
  ...kingdomDomainRoutes,
  ...citizenRoutes,
  // realEstateRoutes ANTES de housingRoutes: GET /api/house/sales (rota
  // estática) precisa ser testada antes de GET /api/house/:id (rota
  // dinâmica, housingRoutes) — mesmo número de segmentos, o roteador
  // (middleware/router.ts) casa na ordem do array e devolveria "sales"
  // como se fosse um house id se a ordem fosse invertida. Ver Fase 6 de
  // docs/design/real-estate-phase1-implementation.md.
  ...realEstateRoutes,
  ...housingRoutes,
  ...presenceRoutes,
  ...worldPresenceRoutes,
  ...activityFeedRoutes,
  ...notificationsRoutes,
  ...worldNewsRoutes,
];

getDb();
seedItems();
seedIdentityCatalog();

const characterRepository = new SQLiteCharacterRepository();
const bus = new EventBus();
sessionManager.setEventBus(bus);
const engine = new GameEngine(bus, sessionManager);
// World Autonomy Phase I (Vision 2.0, Sprint 7) — XPSystem/
// WelcomeRewardSystem passam a usar playerPresenceProvider em vez de
// twitchPresenceProvider: presença real do Jogador (SessionManager),
// nunca "canal ao vivo na Twitch" (achado mais severo da Fase 1 —
// nenhum dos dois produzia efeito nenhum sem uma live Twitch real
// acontecendo). Nenhuma linha dos Systems muda — só qual
// PresenceProvider a fronteira de composição injeta (mesmo ponto de
// extensão que services/presence.service.ts já documentava desde a
// Sprint Identity Core). twitchPresenceProvider continua exportado,
// disponível para uma futura Sprint Cross Platform usá-lo como bônus
// opcional, nunca como requisito.
const xpSystem = new XPSystem(characterRepository, playerPresenceProvider);
xpSystem.register(bus);
const welcomeRewardSystem = new WelcomeRewardSystem(characterRepository, playerPresenceProvider);
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
const bossSpawnSystem = new BossSpawnSystem(bossRepository, playerPresenceProvider);
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

// World Autonomy Phase II (Vision 2.0, Sprint 9, Fase 3 — World Tick) —
// primeiro consumidor a transformar o "world.tick" que a GameEngine já
// emite sozinha (independente de qualquer Jogador presente) em estado
// real do Mundo (horário/dia/clima/regiões ativas). Mesmo padrão de
// WorldEventSubscriber/KingdomNewsSystem acima: sempre ativo, read-only,
// nenhuma regra de jogo.
new WorldPresenceSystem().register(bus);

// World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — Activity
// Feed: boss.defeated é o único dos 4 gatilhos deste Fase que já tinha
// EventBus; Housing/Kingdom/Real Estate/item lendário chamam
// pushActivityFeedEntry() direto no ponto de sucesso (ver cada serviço).
registerActivityFeedBusListeners(bus);

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
