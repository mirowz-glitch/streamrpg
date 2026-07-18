/**
 * Identity — Sprint Founder Identity & Prestige
 *
 * Títulos e Molduras são puramente cosméticos — nenhuma linha aqui
 * concede XP, Gold, poder de combate ou altera qualquer regra de
 * Expedição/Encounter/Boss. Mesmo padrão de catálogo já usado para Itens
 * (`items.service.ts`): conteúdo em banco, seed idempotente, nenhuma
 * lógica de desbloqueio hardcoded fora daqui.
 *
 * Todo critério de desbloqueio é uma leitura pura sobre dados que já
 * existem (characters.created_at/level/total_minutes, boss_rewards,
 * expeditions, viewer_sessions) — nenhum novo evento é emitido pelos
 * sistemas de XP/Gold/Boss/Combat/Expedição/Encounter para alimentar
 * isso; quem observa esses dados é só este serviço.
 */
import type { FrameTier, IdentityProfile } from "@streamrpg/shared";
import { getDb } from "../config/database.js";

export interface TitleCatalogEntry {
  slug: string;
  name: string;
  description: string;
}

export interface FrameCatalogEntry {
  slug: string;
  name: string;
  tier: FrameTier;
}

// Apenas alguns títulos/molduras para validar a infraestrutura (Etapa 7
// pede explicitamente "não implementar dezenas") — crescer o catálogo no
// futuro é só adicionar linhas aqui e em checkTitleUnlocked/
// checkFrameUnlocked, nunca alterar schema ou o resto do sistema.
export const TITLE_CATALOG: TitleCatalogEntry[] = [
  { slug: "primeiro-aventureiro", name: "Primeiro Aventureiro", description: "O primeiro personagem já criado em todo o StreamRPG." },
  { slug: "founder-alpha", name: "Founder Alpha", description: "Um dos primeiros 50 aventureiros de toda a plataforma." },
  { slug: "primeiro-reino", name: "Primeiro Reino", description: "O primeiro a assistir em pelo menos um Reino." },
  { slug: "explorador", name: "Explorador", description: "Concluiu expedições em 3 ou mais regiões diferentes." },
  { slug: "boss-slayer", name: "Boss Slayer", description: "Participou da derrota de pelo menos um Boss." },
  { slug: "veterano", name: "Veterano", description: "Acumulou 300 minutos ou mais assistindo lives." },
];

export const FRAME_CATALOG: FrameCatalogEntry[] = [
  { slug: "moldura-bronze", name: "Moldura de Bronze", tier: "bronze" },
  { slug: "moldura-prata", name: "Moldura de Prata", tier: "prata" },
  { slug: "moldura-ouro", name: "Moldura de Ouro", tier: "ouro" },
  { slug: "moldura-fundador", name: "Moldura de Fundador", tier: "fundador" },
  { slug: "moldura-alpha", name: "Moldura Alpha", tier: "alpha" },
  { slug: "moldura-evento", name: "Moldura de Evento", tier: "evento" },
];

export function seedIdentityCatalog(): void {
  const db = getDb();
  const insertTitle = db.prepare(`INSERT OR IGNORE INTO titles (slug, name, description) VALUES (?, ?, ?)`);
  for (const title of TITLE_CATALOG) {
    insertTitle.run(title.slug, title.name, title.description);
  }
  const insertFrame = db.prepare(`INSERT OR IGNORE INTO frames (slug, name, tier) VALUES (?, ?, ?)`);
  for (const frame of FRAME_CATALOG) {
    insertFrame.run(frame.slug, frame.name, frame.tier);
  }
}

// ============================================================
// Critérios de desbloqueio — cada um, uma leitura pura, nenhuma escrita.
// Valores (300 minutos, 3 regiões, 50 primeiros) são ilustrativos, mesma
// honestidade de todo número não calibrado do projeto.
// ============================================================

function isFirstAdventurerEver(db: ReturnType<typeof getDb>, characterId: string): boolean {
  const row = db.prepare(`SELECT id FROM characters ORDER BY created_at ASC, id ASC LIMIT 1`).get() as
    | { id: string }
    | undefined;
  return row?.id === characterId;
}

function isFounderAlpha(db: ReturnType<typeof getDb>, characterId: string): boolean {
  const target = db.prepare(`SELECT created_at FROM characters WHERE id = ?`).get(characterId) as
    | { created_at: number }
    | undefined;
  if (!target) return false;
  const rank = db.prepare(`SELECT COUNT(*) AS c FROM characters WHERE created_at <= ?`).get(target.created_at) as {
    c: number;
  };
  return rank.c <= 50;
}

function isFirstInAnyKingdom(db: ReturnType<typeof getDb>, characterId: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 FROM viewer_sessions vs
       WHERE vs.character_id = ?
       AND vs.first_ping_at = (SELECT MIN(first_ping_at) FROM viewer_sessions WHERE channel_id = vs.channel_id)
       LIMIT 1`,
    )
    .get(characterId);
  return !!row;
}

function isExplorer(db: ReturnType<typeof getDb>, characterId: string): boolean {
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT destination_region_id) AS c FROM expeditions
       WHERE character_id = ? AND status = 'completed'`,
    )
    .get(characterId) as { c: number };
  return row.c >= 3;
}

function isBossSlayer(db: ReturnType<typeof getDb>, characterId: string): boolean {
  const row = db
    .prepare(`SELECT 1 FROM boss_rewards WHERE character_id = ? AND outcome = 'defeated' LIMIT 1`)
    .get(characterId);
  return !!row;
}

function isVeteran(db: ReturnType<typeof getDb>, characterId: string): boolean {
  const row = db.prepare(`SELECT total_minutes FROM characters WHERE id = ?`).get(characterId) as
    | { total_minutes: number }
    | undefined;
  return (row?.total_minutes ?? 0) >= 300;
}

const TITLE_CHECKS: Record<string, (db: ReturnType<typeof getDb>, characterId: string) => boolean> = {
  "primeiro-aventureiro": isFirstAdventurerEver,
  "founder-alpha": isFounderAlpha,
  "primeiro-reino": isFirstInAnyKingdom,
  explorador: isExplorer,
  "boss-slayer": isBossSlayer,
  veterano: isVeteran,
};

// Molduras Fundador/Alpha reaproveitam exatamente os mesmos critérios dos
// títulos equivalentes — a moldura é só uma segunda representação visual
// do mesmo marco, não um segundo critério. "Evento" fica deliberadamente
// sem critério (sempre false) — reservada para quando um World Event
// real conceder molduras, ainda não decidido em nenhum documento.
const FRAME_CHECKS: Record<string, (db: ReturnType<typeof getDb>, characterId: string) => boolean> = {
  "moldura-bronze": (db, characterId) => {
    const row = db.prepare(`SELECT level FROM characters WHERE id = ?`).get(characterId) as
      | { level: number }
      | undefined;
    return (row?.level ?? 0) >= 5;
  },
  "moldura-prata": (db, characterId) => {
    const row = db.prepare(`SELECT level FROM characters WHERE id = ?`).get(characterId) as
      | { level: number }
      | undefined;
    return (row?.level ?? 0) >= 15;
  },
  "moldura-ouro": (db, characterId) => {
    const row = db.prepare(`SELECT level FROM characters WHERE id = ?`).get(characterId) as
      | { level: number }
      | undefined;
    return (row?.level ?? 0) >= 25;
  },
  "moldura-fundador": isFirstInAnyKingdom,
  "moldura-alpha": isFounderAlpha,
  "moldura-evento": () => false,
};

export interface UnlockedIdentity {
  titleId: number;
  slug: string;
  name: string;
}

/**
 * Avalia todos os títulos/molduras ainda não desbloqueados por este
 * personagem e concede os que passarem no critério. Retorna só os que
 * acabaram de ser concedidos agora (para o System emitir evento) — nunca
 * re-concede um já existente (PRIMARY KEY (character_id, title_id) já
 * impede duplicação, mas o filtro abaixo evita até tentar).
 */
export function evaluateAndGrantUnlocks(
  characterId: string,
  timestamp: number,
): { titles: UnlockedIdentity[]; frames: UnlockedIdentity[] } {
  const db = getDb();
  const grantedTitles: UnlockedIdentity[] = [];
  const grantedFrames: UnlockedIdentity[] = [];

  const unlockedTitleIds = new Set(
    (db.prepare(`SELECT title_id FROM character_titles WHERE character_id = ?`).all(characterId) as Array<{
      title_id: number;
    }>).map((r) => r.title_id),
  );
  const titleRows = db.prepare(`SELECT id, slug, name FROM titles WHERE is_active = 1`).all() as Array<{
    id: number;
    slug: string;
    name: string;
  }>;
  for (const title of titleRows) {
    if (unlockedTitleIds.has(title.id)) continue;
    const check = TITLE_CHECKS[title.slug];
    if (check && check(db, characterId)) {
      db.prepare(`INSERT OR IGNORE INTO character_titles (character_id, title_id, unlocked_at) VALUES (?, ?, ?)`).run(
        characterId,
        title.id,
        timestamp,
      );
      grantedTitles.push({ titleId: title.id, slug: title.slug, name: title.name });
    }
  }

  const unlockedFrameIds = new Set(
    (db.prepare(`SELECT frame_id FROM character_frames WHERE character_id = ?`).all(characterId) as Array<{
      frame_id: number;
    }>).map((r) => r.frame_id),
  );
  const frameRows = db.prepare(`SELECT id, slug, name FROM frames WHERE is_active = 1`).all() as Array<{
    id: number;
    slug: string;
    name: string;
  }>;
  for (const frame of frameRows) {
    if (unlockedFrameIds.has(frame.id)) continue;
    const check = FRAME_CHECKS[frame.slug];
    if (check && check(db, characterId)) {
      db.prepare(`INSERT OR IGNORE INTO character_frames (character_id, frame_id, unlocked_at) VALUES (?, ?, ?)`).run(
        characterId,
        frame.id,
        timestamp,
      );
      grantedFrames.push({ titleId: frame.id, slug: frame.slug, name: frame.name });
    }
  }

  return { titles: grantedTitles, frames: grantedFrames };
}

export function equipTitle(characterId: string, titleId: number): boolean {
  const db = getDb();
  const owned = db
    .prepare(`SELECT 1 FROM character_titles WHERE character_id = ? AND title_id = ?`)
    .get(characterId, titleId);
  if (!owned) return false;
  db.prepare(`UPDATE characters SET equipped_title_id = ? WHERE id = ?`).run(titleId, characterId);
  return true;
}

export function unequipTitle(characterId: string): void {
  getDb().prepare(`UPDATE characters SET equipped_title_id = NULL WHERE id = ?`).run(characterId);
}

export function equipFrame(characterId: string, frameId: number): boolean {
  const db = getDb();
  const owned = db
    .prepare(`SELECT 1 FROM character_frames WHERE character_id = ? AND frame_id = ?`)
    .get(characterId, frameId);
  if (!owned) return false;
  db.prepare(`UPDATE characters SET equipped_frame_id = ? WHERE id = ?`).run(frameId, characterId);
  return true;
}

export function unequipFrame(characterId: string): void {
  getDb().prepare(`UPDATE characters SET equipped_frame_id = NULL WHERE id = ?`).run(characterId);
}

// ============================================================
// Leitura para a API (Perfil, Overlay, Ranking) — `IdentityProfile` é o
// contrato HTTP, definido em @streamrpg/shared (mesmo padrão de
// BossStateSnapshot/ExpeditionResponse), não redeclarado aqui.
// ============================================================

export function getIdentityProfile(characterId: string): IdentityProfile {
  const db = getDb();
  const character = db
    .prepare(`SELECT created_at, equipped_title_id, equipped_frame_id FROM characters WHERE id = ?`)
    .get(characterId) as { created_at: number; equipped_title_id: number | null; equipped_frame_id: number | null };

  const allTitles = db.prepare(`SELECT id, slug, name, description FROM titles WHERE is_active = 1`).all() as Array<{
    id: number;
    slug: string;
    name: string;
    description: string;
  }>;
  const unlockedTitleRows = db
    .prepare(`SELECT title_id, unlocked_at FROM character_titles WHERE character_id = ?`)
    .all(characterId) as Array<{ title_id: number; unlocked_at: number }>;
  const unlockedTitleMap = new Map(unlockedTitleRows.map((r) => [r.title_id, r.unlocked_at]));

  const allFrames = db.prepare(`SELECT id, slug, name, tier FROM frames WHERE is_active = 1`).all() as Array<{
    id: number;
    slug: string;
    name: string;
    tier: FrameTier;
  }>;
  const unlockedFrameRows = db
    .prepare(`SELECT frame_id, unlocked_at FROM character_frames WHERE character_id = ?`)
    .all(characterId) as Array<{ frame_id: number; unlocked_at: number }>;
  const unlockedFrameMap = new Map(unlockedFrameRows.map((r) => [r.frame_id, r.unlocked_at]));

  const firstExpedition = db
    .prepare(`SELECT MIN(started_at) AS t FROM expeditions WHERE character_id = ?`)
    .get(characterId) as { t: number | null };
  const bossesDefeated = db
    .prepare(`SELECT COUNT(*) AS c FROM boss_rewards WHERE character_id = ? AND outcome = 'defeated'`)
    .get(characterId) as { c: number };
  const regionsDiscovered = db
    .prepare(`SELECT COUNT(DISTINCT destination_region_id) AS c FROM expeditions WHERE character_id = ? AND status = 'completed'`)
    .get(characterId) as { c: number };

  const equippedTitleRow = character.equipped_title_id ? allTitles.find((t) => t.id === character.equipped_title_id) : null;
  const equippedFrameRow = character.equipped_frame_id ? allFrames.find((f) => f.id === character.equipped_frame_id) : null;

  return {
    equipped_title: equippedTitleRow
      ? { id: equippedTitleRow.id, name: equippedTitleRow.name, description: equippedTitleRow.description }
      : null,
    equipped_frame: equippedFrameRow ? { id: equippedFrameRow.id, name: equippedFrameRow.name, tier: equippedFrameRow.tier } : null,
    titles: allTitles.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      unlocked: unlockedTitleMap.has(t.id),
      // Bug fix (Live Readiness pós-live) — `unlocked_at` vem de
      // `evaluateAndGrantUnlocks`, gravado com o `timestamp` do
      // WorldTickEvent (Date.now(), já em milissegundos) — nunca em
      // segundos como `characters.created_at` (esse sim usa o DEFAULT
      // `strftime('%s','now')` do SQLite). Multiplicar por 1000 de novo
      // aqui produzia uma data ~56000 anos no futuro.
      unlocked_at: unlockedTitleMap.has(t.id) ? new Date(unlockedTitleMap.get(t.id)!).toISOString() : null,
    })),
    frames: allFrames.map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      tier: f.tier,
      unlocked: unlockedFrameMap.has(f.id),
      unlocked_at: unlockedFrameMap.has(f.id) ? new Date(unlockedFrameMap.get(f.id)!).toISOString() : null,
    })),
    created_at: new Date(character.created_at * 1000).toISOString(),
    // Bug fix (Live Readiness pós-live) — `expeditions.started_at` é
    // gravado por SQLiteExpeditionRepository.create() com o `timestamp`
    // do SessionStartedEvent/WorldTickEvent (Date.now(), milissegundos),
    // nunca pelo DEFAULT `strftime('%s','now')` do SQLite (que é
    // segundos, usado por characters.created_at acima). Mesmo bug do
    // unlocked_at: multiplicar por 1000 de novo produzia "25/07/58477"
    // em vez da data real.
    first_expedition_at: firstExpedition.t ? new Date(firstExpedition.t).toISOString() : null,
    bosses_defeated: bossesDefeated.c,
    regions_discovered: regionsDiscovered.c,
  };
}

export interface IdentityCompact {
  title_name: string | null;
  frame_tier: FrameTier | null;
}

export function getIdentityCompactForCharacters(characterIds: string[]): Map<string, IdentityCompact> {
  const result = new Map<string, IdentityCompact>();
  if (characterIds.length === 0) return result;

  const placeholders = characterIds.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT c.id AS character_id, t.name AS title_name, f.tier AS frame_tier
       FROM characters c
       LEFT JOIN titles t ON t.id = c.equipped_title_id
       LEFT JOIN frames f ON f.id = c.equipped_frame_id
       WHERE c.id IN (${placeholders})`,
    )
    .all(...characterIds) as unknown as Array<{ character_id: string; title_name: string | null; frame_tier: FrameTier | null }>;

  for (const row of rows) {
    result.set(row.character_id, { title_name: row.title_name, frame_tier: row.frame_tier });
  }
  return result;
}

