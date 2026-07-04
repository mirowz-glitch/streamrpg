import { json, route } from "../middleware/router.js";
import { getRanking } from "../services/xp.service.js";
import { getIdentityCompactForCharacters } from "../services/identity.service.js";
import { getRoleIconsForCharacters, resolveChannelId } from "../services/kingdom-prestige.service.js";

export const rankingRoutes = [
  route("GET", "/api/ranking", async (req, res, ctx) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const channel = url.searchParams.get("channel");
    const data = getRanking(channel, ctx.profileId);
    // Sprint Founder Identity & Prestige — título/moldura equipados,
    // mesclados aqui na rota (não em xp.service.ts) para não tocar na
    // lógica de posição/XP do Ranking, mesmo padrão já usado em
    // overlay.ts para expedição/equipamento.
    const identityByCharacter = getIdentityCompactForCharacters(data.entries.map((e) => e.character_id));
    // Sprint Kingdom Prestige System, Etapa 7 — cargo é um conceito de
    // Reino: só existe quando o Ranking está filtrado por canal (mesmo
    // motivo pelo qual data.channel pode ser null no Ranking global).
    const channelId = channel ? resolveChannelId(channel) : null;
    const roleIconsByCharacter = channelId
      ? getRoleIconsForCharacters(channelId, data.entries.map((e) => e.character_id))
      : new Map<string, string[]>();
    const entries = data.entries.map((entry) => ({
      ...entry,
      title_name: identityByCharacter.get(entry.character_id)?.title_name ?? null,
      frame_tier: identityByCharacter.get(entry.character_id)?.frame_tier ?? null,
      role_icons: roleIconsByCharacter.get(entry.character_id) ?? [],
    }));
    json(res, 200, { ...data, entries });
  }),
];
