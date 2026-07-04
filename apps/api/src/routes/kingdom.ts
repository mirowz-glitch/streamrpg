import { json, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { getRolesForCharacterInChannel } from "../services/kingdom-prestige.service.js";
import { getCharacterIdByProfileId } from "./character.js";

// Sprint Kingdom Prestige System, Etapa 6 — "Cargo atual dentro do
// Reino" no Perfil. Mesmo padrão de leitura autenticada de identity.ts;
// nenhuma escrita aqui — cargos só mudam de dono via KingdomPrestigeSystem
// (reage a world.tick), nunca por uma rota HTTP.
export const kingdomRoutes = [
  route("GET", "/api/kingdom/:channel/me", async (_req, res, ctx, params) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const roles = getRolesForCharacterInChannel(params.channel.toLowerCase(), characterId);
      json(res, 200, { roles });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
