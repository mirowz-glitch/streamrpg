import { json, readBody, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { getCurrentExpedition } from "../services/expedition-status.service.js";
import { getCharacterIdByProfileId } from "./character.js";
import { SQLiteExpeditionRepository } from "../infrastructure/SQLiteExpeditionRepository.js";

// Sprint Expedition System — leitura autenticada, mesmo padrão de
// /api/character. A expedição em si só avança via ExpeditionSystem
// reagindo a eventos reais do EventBus.
//
// Sprint Expedition Choice Phase III — Meaningful Consequences: a
// única escrita desta rota (POST /approach) não é um comando de
// gameplay (não avança estado, não gera Encounter, não concede nada)
// — só registra a abordagem escolhida pelo jogador, travada na
// primeira vez (mesmo repositório que ExpeditionSystem já usa,
// nenhuma lógica duplicada).
const expeditionRepository = new SQLiteExpeditionRepository();

export const expeditionRoutes = [
  route("GET", "/api/expedition/current", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const expedition = getCurrentExpedition(characterId);
      json(res, 200, { expedition });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/expedition/approach", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { option?: string };
      if (body.option !== "investigate" && body.option !== "continue") {
        json(res, 400, { error: "option must be 'investigate' or 'continue'" });
        return;
      }
      const expedition = await expeditionRepository.findActiveByCharacter(characterId);
      if (!expedition) {
        json(res, 404, { error: "No active expedition" });
        return;
      }
      const applied = await expeditionRepository.setApproach(expedition.id, characterId, body.option);
      json(res, 200, { applied });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
