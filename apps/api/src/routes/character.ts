import { randomUUID } from "node:crypto";
import { getProgress, buildCombatSnapshot } from "@streamrpg/shared";
import type { CharacterResponse } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { readBody, json, route } from "../middleware/router.js";
import { getEquippedItems } from "../services/drop.service.js";
import { resolveAllActiveGemEffectsForEquippedItems, resolveAllActiveGemBehaviorsForEquippedItems } from "../services/combatSnapshot.service.js";
import { SQLiteCharacterRepository } from "../infrastructure/SQLiteCharacterRepository.js";

// Instância só de leitura, reaproveitada em cada chamada — mesmo padrão
// de instanciação leve já usado em outros pontos da API (sem estado
// próprio, sem custo de manter viva entre requisições).
const characterRepository = new SQLiteCharacterRepository();

export async function getCharacterByProfileId(profileId: string): Promise<CharacterResponse | null> {
  const row = getDb()
    .prepare(
      `SELECT c.id, c.display_name, c.xp, c.gold, c.total_minutes, c.primary_channel_id, c.created_at, p.avatar_url
       FROM characters c
       JOIN profiles p ON p.id = c.profile_id
       WHERE c.profile_id = ?`,
    )
    .get(profileId) as
    | {
        id: string;
        display_name: string;
        xp: number;
        gold: number;
        total_minutes: number;
        primary_channel_id: string | null;
        created_at: number;
        avatar_url: string | null;
      }
    | undefined;

  if (!row) return null;

  const progress = getProgress(row.xp);
  const equipped = getEquippedItems(row.id);
  // Sprint Equipment Experience — sus/uti/level continuam vindo daqui
  // (fora do vocabulário de 7 stats do Combat Snapshot, Sprint 22);
  // attack/defense/etc NÃO são mais lidos deste objeto, ver combatSnapshot abaixo.
  const legacyCombat = await characterRepository.getCombatAttributes(row.id);

  // Sprint 21/22 — Effect Resolver (packages/shared, puro) através de
  // TODOS os itens equipados — extraído pra services/combatSnapshot.service.ts
  // (Fase 7) pra ser reusado por BossCombatSystem também, nunca duplicado.
  const allActiveEffects = resolveAllActiveGemEffectsForEquippedItems(equipped);
  // Sprint 23 — Sockets & Gems Phase II, Fase 9: mesmo padrão pro
  // Behavior Resolver.
  const allActiveBehaviors = resolveAllActiveGemBehaviorsForEquippedItems(equipped);

  // Sprint 22 — Living Combat Phase I, Fase 2/3/8: o Combat Resolver
  // único (packages/shared/src/combat/combatSnapshot.ts) — o MESMO que
  // Adventure/Idle/Dungeon/Boss agora consultam. Base Attributes reais
  // (nível real via `row.xp`, mesma classe hardcoded "warrior" que o
  // cliente já usa) + itens equipados reais + efeitos/comportamentos de
  // Gema ativos.
  const combatSnapshot = buildCombatSnapshot(row.id, row.xp, equipped, allActiveEffects, allActiveBehaviors);

  return {
    id: row.id,
    display_name: row.display_name,
    level: progress.level,
    xp: progress.xp,
    xp_to_next: progress.xp_to_next,
    percent: progress.percent,
    gold: row.gold,
    total_minutes: row.total_minutes,
    avatar_url: row.avatar_url,
    primary_channel_id: row.primary_channel_id,
    equipped: equipped.map((e) => ({
      slot: e.slot,
      character_item_id: e.character_item_id,
      item_id: e.item_id,
      name: e.name,
      rarity: e.rarity as CharacterResponse["equipped"][number]["rarity"],
      damage_type: e.damage_type,
      uti_bonus: e.uti_bonus,
      min_level: e.min_level,
      power_score: e.power_score,
      upgrade_level: e.upgrade_level,
      // Sprint 11, Fase 11 — "toda API que retorna um Item deve
      // retornar Afixos/Histórico/Potencial/Qualidade/Craft State" —
      // já vêm completos de getEquippedItems() (drop.service.ts), só
      // repassados aqui (este .map() é um allowlist manual, não um
      // spread — precisa listar cada campo explicitamente).
      item_level: e.item_level,
      seed: e.seed,
      affixes: e.affixes,
      potential: e.potential,
      quality: e.quality,
      craft_state: e.craft_state,
      history: e.history,
      // Sprint 14 — Legendary Items + Legacy System, Fase 8: mesmo
      // allowlist manual, 3 campos novos (sempre derivados por
      // getEquippedItems, nunca calculados aqui).
      legacy: e.legacy,
      legacyEvents: e.legacyEvents,
      legacySummary: e.legacySummary,
      // Sprint 15 — Sockets + Gem System (Foundation), Fase 8: mesmo
      // allowlist manual.
      sockets: e.sockets,
      // Sprint 16 — Economy Foundation, Fase 9: mesmo allowlist manual.
      uncertaintyEligible: e.uncertaintyEligible,
      // Sprint 18 — Mythic Foundation, Fase 6/10: mesmo allowlist manual.
      mythicOrigin: e.mythicOrigin,
      // Sprint 19 — Base Identity, Fase 10: mesmo allowlist manual.
      baseIdentity: e.baseIdentity,
      // Sprint 20 — Sockets & Gemas Phase I, Fase 10: mesmo allowlist manual.
      socketGems: e.socketGems,
      // Sprint 21 — Gem Effects Phase I, Fase 8: mesmo allowlist manual.
      socketGemEffects: e.socketGemEffects,
    })),
    combat: {
      attack_physical: combatSnapshot.attack,
      attack_magic: combatSnapshot.magic,
      resistance_physical: combatSnapshot.defense,
      resistance_magic: 0,
      sus: legacyCombat?.susBase ?? 0,
      uti: legacyCombat?.utiBonus ?? 0,
    },
    // Sprint 22 — Living Combat Phase I, Fase 2/3/8.
    combatSnapshot,
    // Sprint 23 — Sockets & Gems Phase II, Fase 9: "Nunca duplicar" —
    // a MESMA lista de `combatSnapshot.activeBehaviors`, só exposta
    // também no nível raiz com o nome que o brief pede.
    activeGemBehaviors: combatSnapshot.activeBehaviors,
    created_at: new Date(row.created_at * 1000).toISOString(),
  };
}

export async function createCharacter(profileId: string, displayName: string): Promise<CharacterResponse> {
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO characters (id, profile_id, display_name, level, xp, gold, total_minutes)
       VALUES (?, ?, ?, 1, 0, 0, 0)`,
    )
    .run(id, profileId, displayName);

  const character = await getCharacterByProfileId(profileId);
  if (!character) {
    throw new Error("Failed to create character");
  }
  return character;
}

export async function updateDisplayName(profileId: string, displayName: string): Promise<CharacterResponse | null> {
  getDb()
    .prepare(
      `UPDATE characters SET display_name = ?, updated_at = strftime('%s','now') WHERE profile_id = ?`,
    )
    .run(displayName, profileId);

  return getCharacterByProfileId(profileId);
}

export function getCharacterIdByProfileId(profileId: string): string | null {
  const row = getDb()
    .prepare("SELECT id FROM characters WHERE profile_id = ?")
    .get(profileId) as { id: string } | undefined;
  return row?.id ?? null;
}

export const characterRoutes = [
  route("GET", "/api/character", async (_req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const character = await getCharacterByProfileId(profileId);
      if (!character) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, character);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  // Vertical Slice — Persistent Player Experience Phase I — Fase 2/3/4:
  // a Aventura (packages/shared, client-state, protegida/intocada nesta
  // Sprint) passa a persistir seus próprios resultados aqui, em vez de
  // manter um personagem paralelo só no navegador. Reaproveita
  // characterRepository.applyXP() (já existente, mesmo método que
  // XPSystemV2/BossRewardSystem usam) — nenhuma fórmula de XP/nível
  // nova, só mais um chamador.
  route("POST", "/api/character/adventure/xp", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { amount?: number };
      const amount = Math.max(0, Math.round(body.amount ?? 0));
      if (amount > 0) {
        await characterRepository.applyXP(characterId, amount, Date.now());
      }
      const character = await getCharacterByProfileId(profileId);
      json(res, 200, character);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  // Fase 2/3/4: mesmo papel de /adventure/xp, pra ouro — reaproveita
  // characterRepository.grantGold() (novo método, mesmo padrão de
  // applyXP, só soma — nenhum sistema de gasto/economia criado).
  route("POST", "/api/character/adventure/gold", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const characterId = getCharacterIdByProfileId(profileId);
      if (!characterId) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      const body = JSON.parse(await readBody(req)) as { amount?: number };
      const amount = Math.max(0, body.amount ?? 0);
      if (amount > 0) {
        await characterRepository.grantGold(characterId, amount);
      }
      const character = await getCharacterByProfileId(profileId);
      json(res, 200, character);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),

  route("PATCH", "/api/character", async (req, res, ctx) => {
    try {
      const profileId = requireAuth(ctx);
      const body = JSON.parse(await readBody(req)) as { display_name?: string };
      if (!body.display_name?.trim()) {
        json(res, 400, { error: "display_name is required" });
        return;
      }
      const character = await updateDisplayName(profileId, body.display_name.trim());
      if (!character) {
        json(res, 404, { error: "Character not found" });
        return;
      }
      json(res, 200, character);
    } catch {
      json(res, 401, { error: "Unauthorized" });
    }
  }),
];
