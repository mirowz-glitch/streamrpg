import type { WorldStateResponse } from "@streamrpg/shared";
import { json, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getEncounterStats,
  getIdleFlavor,
  getKingdomState,
  getKingdomStats,
  getTimeline,
  getWorldPanel,
} from "../services/world-state.service.js";
import { getMostVisitedRegions } from "../services/expedition-status.service.js";
import { getChannelKingdomState } from "../services/kingdom-prestige.service.js";
import { getKingdomNews } from "../systems/KingdomNewsSystem.js";
import { EventOfTheDaySystem } from "../systems/EventOfTheDaySystem.js";

// Sprint Kingdom Events (MVP) — determinístico/sem estado, uma
// instância leve reaproveitada em cada chamada (mesmo padrão de
// characterRepository em character.ts).
const eventOfTheDaySystem = new EventOfTheDaySystem();

// Sprint World Simulation — mesmo padrão de leitura de character.ts/
// ranking.ts (autenticado, parte do app, não um overlay público). Nenhuma
// escrita, nenhuma regra de jogo: só agrega o que já existe em
// world-state.service.ts numa única resposta.
export const worldRoutes = [
  route("GET", "/api/world/state", async (req, res, ctx) => {
    try {
      requireAuth(ctx);
    } catch {
      json(res, 401, { error: "Unauthorized" });
      return;
    }

    // Sprint Kingdom Prestige System — mesmo padrão `?channel=` já usado
    // pelo Ranking: sem canal, a página Mundo mostra só o agregado
    // global (como antes desta Sprint); com canal, também mostra o
    // Reino específico (Banner/Prestígio/Hall da Fama/Estatísticas/
    // Últimas conquistas, Etapa 4).
    const url = new URL(req.url ?? "/", "http://localhost");
    const channel = url.searchParams.get("channel");

    const panel = getWorldPanel();
    const response: WorldStateResponse = {
      panel,
      kingdom: getKingdomState(),
      most_visited_regions: getMostVisitedRegions(5),
      encounter_stats: getEncounterStats(),
      stats: getKingdomStats(),
      timeline: getTimeline(),
      idle_flavor: getIdleFlavor(panel.players_online),
      news: getKingdomNews(),
      current_event: eventOfTheDaySystem.getCurrentEvent(Date.now()),
      channel_kingdom: channel ? getChannelKingdomState(channel) : null,
    };
    json(res, 200, response);
  }),
];
