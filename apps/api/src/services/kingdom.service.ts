/**
 * Kingdom — Sprint Kingdom Domain 2.0 (Vision 2.0, Sprint 2)
 *
 * O Reino como domínio permanente do mundo (docs/design/
 * kingdom-domain-2.0.md) — nunca uma live, canal, sessão ou plataforma.
 *
 * Responsabilidade única desta Sprint: criar/buscar/listar Reinos. Nenhuma
 * lógica política (troca de liderança, eleição, conquista), nenhuma
 * economia (Tesouro, impostos), nenhuma guerra — tudo isso é escopo de
 * Sprints futuras (Citizen System, Kingdom Treasury, Kingdom Wars, ver
 * docs/design/new-roadmap.md). Este serviço é deliberadamente pequeno.
 *
 * Tabela nova (`kingdoms`), separada de `streamer_channels` (o modelo
 * antigo, ainda em uso por Kingdom Prestige/Boss/City — não tocado aqui).
 */
import { randomUUID } from "node:crypto";
import type { Kingdom, KingdomStatus, KingdomVisibility } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";
import { pushActivityFeedEntry } from "./activityFeed.service.js";

interface KingdomRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  founder_profile_id: string | null;
  leader_profile_id: string | null;
  status: KingdomStatus;
  visibility: KingdomVisibility;
  banner: string | null;
  symbol: string | null;
  motto: string | null;
  created_at: number;
  updated_at: number;
}

function toKingdom(row: KingdomRow): Kingdom {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    founder_profile_id: row.founder_profile_id,
    leader_profile_id: row.leader_profile_id,
    status: row.status,
    visibility: row.visibility,
    banner: row.banner,
    symbol: row.symbol,
    motto: row.motto,
    created_at: new Date(row.created_at * 1000).toISOString(),
    updated_at: new Date(row.updated_at * 1000).toISOString(),
  };
}

/**
 * Normaliza um nome em slug (minúsculas, sem acento, hífens no lugar de
 * espaço/pontuação). Utilitário de formatação puro — não é regra de
 * negócio, só a mesma normalização que qualquer identificador legível-em-
 * URL precisa.
 */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CreateKingdomInput {
  name: string;
  description?: string;
  slug?: string;
}

export type CreateKingdomResult =
  | { success: true; kingdom: Kingdom }
  | { success: false; reason: "invalid-name" | "slug-taken" };

/**
 * Funda um Reino. `founderProfileId` vira também `leader_profile_id`
 * inicial — liderança plugável (Coroa/Eleito/Guilda/Conquista) é escopo
 * do Citizen System/Kingdom Domain futuro, não desta Sprint; hoje, quem
 * funda é sempre quem lidera.
 */
export function createKingdom(founderProfileId: string, input: CreateKingdomInput): CreateKingdomResult {
  const name = input.name.trim();
  if (!name) return { success: false, reason: "invalid-name" };

  const slug = input.slug ? slugify(input.slug) : slugify(name);
  if (!slug) return { success: false, reason: "invalid-name" };

  const db = getDb();
  const existing = db.prepare(`SELECT id FROM kingdoms WHERE slug = ?`).get(slug);
  if (existing) return { success: false, reason: "slug-taken" };

  const id = randomUUID();
  const now = nowUnix();
  db.prepare(
    `INSERT INTO kingdoms (id, name, slug, description, founder_profile_id, leader_profile_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, name, slug, input.description?.trim() ?? "", founderProfileId, founderProfileId, now, now);

  const row = db.prepare(`SELECT * FROM kingdoms WHERE id = ?`).get(id) as unknown as KingdomRow;

  // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — mesmo
  // princípio de housing.service.ts/realEstate.service.ts: chamada
  // direta no ponto de sucesso, sem retrofitar EventBus neste domínio.
  pushActivityFeedEntry("👑", `O Reino ${row.name} foi fundado.`, now * 1000);

  return { success: true, kingdom: toKingdom(row) };
}

export function getKingdomBySlug(slug: string): Kingdom | null {
  const row = getDb().prepare(`SELECT * FROM kingdoms WHERE slug = ?`).get(slug) as unknown as
    | KingdomRow
    | undefined;
  return row ? toKingdom(row) : null;
}

export function getKingdomById(id: string): Kingdom | null {
  const row = getDb().prepare(`SELECT * FROM kingdoms WHERE id = ?`).get(id) as unknown as KingdomRow | undefined;
  return row ? toKingdom(row) : null;
}

/**
 * Lista todos os Reinos públicos, mais recentes primeiro. Sem paginação
 * nesta Sprint (poucos Reinos existem no mundo agora) — mesma disciplina
 * de "não implementar infraestrutura sem uso real" já aplicada em Sprints
 * anteriores deste projeto.
 */
export function listKingdoms(): Kingdom[] {
  const rows = getDb()
    .prepare(`SELECT * FROM kingdoms WHERE visibility = 'public' ORDER BY created_at DESC`)
    .all() as unknown as KingdomRow[];
  return rows.map(toKingdom);
}
