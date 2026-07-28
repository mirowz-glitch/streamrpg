import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { equipItem, grantAdventureLoot, listInventory, unequipItem } from "../services/drop.service.js";
import type { ItemSlot } from "@streamrpg/shared";
import { getCharacterIdByProfileId } from "./character.js";

export const itemsRoutes = [
  route("GET", "/api/items", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { items: listInventory(characterId) });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  // Vertical Slice — Persistent Player Experience Phase I — Fase 2/3/4:
  // reaproveita grantAdventureLoot() (mesmas tabelas items/
  // character_items de sempre) + equipItem() já existente logo abaixo —
  // nenhuma lógica de equipar nova, só o caminho de criação do item que
  // faltava pra itens gerados pela Aventura (packages/shared, protegida).
  route("POST", "/api/items/loot", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as {
        baseItemId?: string;
        name?: string;
        rarity?: string;
        slot?: string;
        powerScore?: number;
        autoEquip?: boolean;
      };
      if (!body.baseItemId || !body.name || !body.rarity || !body.slot) {
        json(res, 400, { error: "baseItemId, name, rarity and slot are required" });
        return;
      }
      let item = grantAdventureLoot(characterId, null, {
        baseItemId: body.baseItemId,
        name: body.name,
        rarity: body.rarity,
        slot: body.slot,
        powerScore: body.powerScore ?? 0,
      });
      if (body.autoEquip) {
        // Equipment Locking & Concurrency Phase I — Fase 3: identifica
        // o AutoEquip como dono do lock, distinto do clique manual
        // "Equipar" abaixo (docs/design/equipment-locking-phase1.md).
        item = equipItem(characterId, item.id, "autoequip");
      }
      json(res, 200, { item });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Loot failed";
      json(res, 400, { error: message });
    }
  }),

  route("POST", "/api/items/equip", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { character_item_id?: number };
      if (!body.character_item_id) {
        json(res, 400, { error: "character_item_id is required" });
        return;
      }
      const item = equipItem(characterId, body.character_item_id);
      json(res, 200, { item });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Equip failed";
      json(res, 400, { error: message });
    }
  }),

  route("POST", "/api/items/unequip", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { slot?: ItemSlot };
      if (!body.slot) {
        json(res, 400, { error: "slot is required" });
        return;
      }
      unequipItem(characterId, body.slot);
      json(res, 200, { ok: true, items: listInventory(characterId) });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unequip failed";
      json(res, 400, { error: message });
    }
  }),
];
