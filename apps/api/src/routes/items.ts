import { requireAuth } from "../middleware/auth.js";
import { json, readBody, route } from "../middleware/router.js";
import { equipItem, findEquippedItemCatalogId, grantAdventureLoot, isRealUpgradeForSlot, listInventory, recordItemHistoryEvent, unequipItem } from "../services/drop.service.js";
import { applySphereToItem, getSphereInventory, grantSphereDrop } from "../services/sphere.service.js";
import { listCharacterGems, socketGem, unsocketGem } from "../services/gem.service.js";
import type { ItemAffix, ItemSlot, SphereTypeId, SphereSource } from "@streamrpg/shared";
import { getCharacterIdByProfileId } from "./character.js";
import { pushActivityFeedEntry } from "../services/activityFeed.service.js";

// World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — "unique" é o
// tier mais alto do Item Generator (itemgen/rarities.ts), equivalente a
// "lendário/mítico" pro propósito do Activity Feed — nenhum tier novo
// inventado, só o que já existe reconhecido como digno de nota.
const NOTABLE_RARITY = "unique";

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
        // Sprint 11 — Persistent Items + Affixes: opcionais, populados
        // pelo cliente (useAdventureSession.ts) sempre que o
        // LootDropped/LootDropRecord já carrega o item completo do Item
        // Generator — nunca exigidos, pra não quebrar nenhum outro
        // chamador existente deste endpoint.
        itemLevel?: number;
        seed?: number;
        prefixes?: ItemAffix[];
        suffixes?: ItemAffix[];
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
        itemLevel: body.itemLevel,
        seed: body.seed,
        prefixes: body.prefixes,
        suffixes: body.suffixes,
      });
      // RC-1 Fase 3 — Integração: o cliente decide "autoEquip: true"
      // comparando com uma Equipment local que nunca sabe o que já está
      // equipado de verdade (sempre nasce com o kit inicial — ver
      // useAdventureSession.ts). Sem esta checagem, o servidor aceitava
      // cegamente e um drop fraco podia substituir equipamento real bom.
      // isRealUpgradeForSlot() reaplica a MESMA regra que tryAutoEquip()
      // já pretendia garantir ("só troca se for estritamente maior"),
      // agora contra o item real (equipped_items), não o fake.
      if (body.autoEquip && isRealUpgradeForSlot(characterId, item.slot, item.power_score ?? 0)) {
        // Equipment Locking & Concurrency Phase I — Fase 3: identifica
        // o AutoEquip como dono do lock, distinto do clique manual
        // "Equipar" abaixo (docs/design/equipment-locking-phase1.md).
        item = equipItem(characterId, item.id, "autoequip");
      }
      if (body.rarity === NOTABLE_RARITY) {
        pushActivityFeedEntry("✨", `Um item lendário foi encontrado: ${body.name}.`);
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

  // Sprint 12, Crafting Phase I — as 5 Esferas têm efeito real agora
  // (sphere.service.ts). Exige posse (character_spheres) — sem loja,
  // sem drop definitivo nesta Sprint (só scripts/qaGrantSpheres.ts).
  route("POST", "/api/items/sphere", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { character_item_id?: number; sphereId?: SphereTypeId };
      if (!body.character_item_id || !body.sphereId) {
        json(res, 400, { error: "character_item_id and sphereId are required" });
        return;
      }
      const result = applySphereToItem(characterId, body.character_item_id, body.sphereId);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { ok: true, sphereId: result.sphereId, detail: result.detail, item: result.item });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sphere application failed";
      json(res, 400, { error: message });
    }
  }),

  // Sprint 12, Crafting Phase I — inventário de Esferas do personagem
  // (só leitura; escrita é QA-only, ver scripts/qaGrantSpheres.ts).
  route("GET", "/api/items/spheres", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { spheres: getSphereInventory(characterId) });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  // Sprint 16 — Economy Foundation: a Esfera da Incerteza é uma Esfera
  // como as outras (mesma posse/consumo, `applySphereToItem`), só com
  // um endpoint dedicado (Fase 6 explícito) em vez de reusar
  // `/api/items/sphere` — nenhuma duplicação de orquestração, é o MESMO
  // `applySphereToItem(characterId, characterItemId, "uncertainty")`.
  route("POST", "/api/items/uncertainty", async (req, res, ctx) => {
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
      const result = applySphereToItem(characterId, body.character_item_id, "uncertainty");
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { ok: true, detail: result.detail, item: result.item, history: result.item.history, legacy: result.item.legacy });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Uncertainty application failed";
      json(res, 400, { error: message });
    }
  }),

  // Sprint 13 — Sphere Economy Phase I, Fase 7: caminho real de
  // persistência de Esferas encontradas em Adventure/Dungeon/Boss
  // (packages/shared só emite o fato `SphereDropped`; quem grava em
  // `character_spheres` é sempre apps/api). World Boss não passa por
  // aqui — é gravado direto por BossRewardSystem.ts, que já roda
  // server-side. Nunca cria/edita item — só `character_spheres`.
  route("POST", "/api/items/sphere-drop", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { sphereId?: SphereTypeId; source?: SphereSource };
      if (!body.sphereId || !body.source) {
        json(res, 400, { error: "sphereId and source are required" });
        return;
      }
      await grantSphereDrop(characterId, body.sphereId, body.source);
      json(res, 200, { ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sphere drop grant failed";
      json(res, 400, { error: message });
    }
  }),

  // Sprint 14 — Legendary Items + Legacy System, Fase 4: Legado por
  // combate. Chamado quando o Adventure Loop deriva `FinalBossDefeated`
  // (packages/shared, protegido) — grava "boss_defeated_with" na arma
  // ATUALMENTE equipada (a única "testemunha" identificável do abate;
  // itens do catálogo compartilhado, como recompensa de World Boss, não
  // têm `history` — no-op documentado, ver relatório da Sprint).
  route("POST", "/api/items/boss-defeated", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { enemyName?: string };
      const weapon = findEquippedItemCatalogId(characterId, "weapon");
      if (weapon) {
        recordItemHistoryEvent(weapon.itemId, weapon.history, "boss_defeated_with", characterId, body.enemyName ?? null);
      }
      json(res, 200, { ok: true, recorded: weapon !== null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Boss-defeated record failed";
      json(res, 400, { error: message });
    }
  }),

  // Sprint 15 — Sockets + Gem System (Foundation), Fase 8: leitura das
  // Gemas do personagem (socketadas e soltas) — mesmo padrão só-leitura
  // de GET /api/items/spheres (escrita real ainda é QA-only, ver
  // scripts/qaGrantGems.ts; "nenhuma Gema poderosa será criada" nesta
  // Sprint).
  route("GET", "/api/items/gems", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, { gems: listCharacterGems(characterId) });
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  // Sprint 15, Fase 8: insere (ou troca de lugar) uma Gema num Socket
  // vazio de um item que o personagem possui — só persistência
  // (estado do Socket + histórico da Gema), nenhum efeito de gameplay
  // concedido (gem.service.ts).
  route("POST", "/api/items/gem/socket", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { gemId?: number; character_item_id?: number; socketId?: string };
      if (!body.gemId || !body.character_item_id || !body.socketId) {
        json(res, 400, { error: "gemId, character_item_id and socketId are required" });
        return;
      }
      const result = socketGem(characterId, body.gemId, body.character_item_id, body.socketId);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { ok: true, gem: result.gem });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gem socket failed";
      json(res, 400, { error: message });
    }
  }),

  // Sprint 15, Fase 8: remove uma Gema do Socket que ela ocupa — ela
  // volta a ficar solta na posse do personagem, com level/xp/history
  // preservados ("Podem sair" — filosofia, gem.service.ts).
  route("POST", "/api/items/gem/unsocket", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { gemId?: number };
      if (!body.gemId) {
        json(res, 400, { error: "gemId is required" });
        return;
      }
      const result = unsocketGem(characterId, body.gemId);
      if (!result.success) {
        json(res, 400, { error: result.reason });
        return;
      }
      json(res, 200, { ok: true, gem: result.gem });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gem unsocket failed";
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
