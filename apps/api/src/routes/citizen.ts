/**
 * Citizen — Sprint Citizen System (Vision 2.0, Sprint 3) + Citizen
 * Progression (Vision 2.0, Sprint 4)
 *
 * Seis rotas mínimas: entrar num Reino, sair, ver a cidadania do próprio
 * jogador, listar cidadãos de um Reino, consultar rank, atualizar rank.
 * `/api/kingdom/:id/citizens` não colide com `/api/kingdom/:channel/me`
 * (routes/kingdom.ts, Kingdom Prestige) nem com `/api/kingdom/:slug`
 * (routes/kingdoms.ts) — o roteador casa por regex totalmente ancorada
 * por rota (middleware/router.ts), e o sufixo literal ("/citizens" vs.
 * "/me") nunca é igual.
 *
 * `POST /api/citizen/rank` (Fase 6, Sprint 4) é infraestrutura pura —
 * atualiza o rank diretamente, sem nenhum critério de elegibilidade
 * verificado aqui (tempo de residência, contribuição). Nenhuma tela
 * desta Sprint expõe uma ação de jogador que chame esta rota (a UI é só
 * leitura, ver KingdomsPage.tsx) — ela existe para uma Sprint futura (ou
 * uso administrativo) decidir quando/como promover automaticamente. Ver
 * "Limitações" em docs/design/citizen-progression-implementation.md.
 */
import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import {
  getCitizen,
  getRank,
  joinKingdom,
  leaveKingdom,
  listKingdomCitizens,
  updateRank,
} from "../services/citizen.service.js";
import { getCharacterIdByProfileId } from "./character.js";
import type { PersistedCitizenRank } from "@streamrpg/shared";

function resolveCharacterId(profileId: string): string | null {
  return getCharacterIdByProfileId(profileId);
}

export const citizenRoutes = [
  route("POST", "/api/kingdom/join", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = resolveCharacterId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}") as { kingdom_id?: string };
      if (!body.kingdom_id) {
        json(res, 400, { error: "kingdom_id is required" });
        return;
      }
      const result = joinKingdom(characterId, body.kingdom_id);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { citizen: result.citizen });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join kingdom";
      json(res, 400, { error: message });
    }
  }),

  route("POST", "/api/kingdom/leave", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = resolveCharacterId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const result = leaveKingdom(characterId);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to leave kingdom";
      json(res, 400, { error: message });
    }
  }),

  route("GET", "/api/citizen", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = resolveCharacterId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { citizen: getCitizen(characterId) });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("GET", "/api/kingdom/:id/citizens", (_req, res, _ctx, params) => {
    json(res, 200, { citizens: listKingdomCitizens(params.id) });
  }),

  route("GET", "/api/citizen/rank", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = resolveCharacterId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { rank: getRank(characterId) });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/citizen/rank", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = resolveCharacterId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}") as { rank?: PersistedCitizenRank };
      if (!body.rank) {
        json(res, 400, { error: "rank is required" });
        return;
      }
      const result = updateRank(characterId, body.rank);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { rank: result.rank });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update rank";
      json(res, 400, { error: message });
    }
  }),
];
