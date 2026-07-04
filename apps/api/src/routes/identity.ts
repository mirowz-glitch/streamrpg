import { json, readBody, route } from "../middleware/router.js";
import { requireAuth } from "../middleware/auth.js";
import { equipFrame, equipTitle, getIdentityProfile, unequipFrame, unequipTitle } from "../services/identity.service.js";
import { getCharacterIdByProfileId } from "./character.js";

// Sprint Founder Identity & Prestige — leitura/equipar apenas.
// Desbloqueio real acontece no IdentitySystem (reage a world.tick),
// nunca por uma rota HTTP — equivalente ao mesmo padrão já usado por
// Boss/Expedição (o jogador nunca "solicita" um desbloqueio, só reage a
// presença real).
export const identityRoutes = [
  route("GET", "/api/identity/me", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, getIdentityProfile(characterId));
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/identity/equip-title", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { title_id?: number };
      if (typeof body.title_id !== "number") {
        json(res, 400, { error: "title_id is required" });
        return;
      }
      const ok = equipTitle(characterId, body.title_id);
      if (!ok) {
        json(res, 400, { error: "Title not unlocked" });
        return;
      }
      json(res, 200, getIdentityProfile(characterId));
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/identity/unequip-title", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      unequipTitle(characterId);
      json(res, 200, getIdentityProfile(characterId));
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/identity/equip-frame", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { frame_id?: number };
      if (typeof body.frame_id !== "number") {
        json(res, 400, { error: "frame_id is required" });
        return;
      }
      const ok = equipFrame(characterId, body.frame_id);
      if (!ok) {
        json(res, 400, { error: "Frame not unlocked" });
        return;
      }
      json(res, 200, getIdentityProfile(characterId));
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("POST", "/api/identity/unequip-frame", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      unequipFrame(characterId);
      json(res, 200, getIdentityProfile(characterId));
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
