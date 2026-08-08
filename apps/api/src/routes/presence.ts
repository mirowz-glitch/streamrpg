/**
 * World Autonomy Phase I (Vision 2.0, Sprint 7), Fase 3 — Player Session
 * infrastructure. Login -> Character -> Player Session -> Idle Loop ->
 * World: este heartbeat é o único passo que faltava nessa cadeia.
 *
 * `/api/ping` (rotas legadas, ver routes/ping.ts) exige um `channel`
 * (login Twitch de um streamer) para sequer registrar presença — um
 * Jogador que nunca chegou via `?canal=` nunca gera uma Sessão real
 * (achado da Fase 1). Esta rota resolve o mesmo `sessionManager.
 * reportPresent()`, mas usando o próprio characterId como contextId —
 * nenhum canal, nenhum streamer, nenhuma Twitch envolvida. Chamada pelo
 * heartbeat de `useAdventureSession.ts` (frontend) para todo Jogador
 * logado, automaticamente, sem nenhuma ação manual.
 */
import { requireAuth } from "../middleware/auth.js";
import { json, route } from "../middleware/router.js";
import { getCharacterIdByProfileId } from "./character.js";
import { sessionManager } from "../engine/SessionManager.js";
import { checkAndComputeOfflineSummary, consumePendingOfflineSummary } from "../services/offlineSummary.service.js";

export const presenceRoutes = [
  route("POST", "/api/presence/ping", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }

      sessionManager.reportPresent(characterId, characterId, "world");
      // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — toda
      // vez que o Jogador dá sinal de vida é a oportunidade de detectar
      // uma ausência real e persistir "visto pela última vez"
      // (sessionManager acima é só em memória, perdido a cada restart).
      await checkAndComputeOfflineSummary(characterId);

      json(res, 200, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Presence ping failed";
      const status = message === "Unauthorized" ? 401 : 500;
      json(res, status, { error: message });
    }
  }),

  // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — consumido
  // uma única vez pelo cliente ao voltar (bootstrap da sessão): `null`
  // quando não há nenhuma ausência real pendente (mesmo Jogador nunca
  // ficou fora tempo suficiente, ou já buscou este resumo antes).
  route("GET", "/api/character/offline-summary", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { summary: consumePendingOfflineSummary(characterId) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch offline summary";
      const status = message === "Unauthorized" ? 401 : 500;
      json(res, status, { error: message });
    }
  }),
];
