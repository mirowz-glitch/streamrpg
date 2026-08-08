/**
 * House — Sprint Housing Phase I (Vision 2.0, Sprint 5)
 *
 * A Casa como primeiro ativo verdadeiramente permanente do mundo
 * (docs/design/housing-phase1.md). Uma Casa pertence ao Reino, nunca ao
 * personagem — o personagem é apenas o proprietário atual. Mesmo
 * princípio de fundação-permanente/posse-transitória já aplicado a
 * Kingdom (`kingdom-domain-2.0.md` Seção 1), um nível abaixo.
 *
 * Responsabilidade única: Create/Get/List/ListKingdom/TransferOwnership.
 * Nenhuma compra, venda, imposto, abandono, demolição, upgrade,
 * decoração ou cosmético — tudo isso é escopo de Sprints futuras
 * (Real Estate, Kingdom Treasury, ver docs/design/new-roadmap.md).
 *
 * Construir exige cidadania ativa no Reino alvo (per housing-phase1.md
 * Seção 3, "Um cidadão constrói num lote disponível do bairro") — a
 * pergunta "quem pode construir?", deixada em aberto por
 * citizen-progression-implementation.md Fase 8, é respondida aqui: basta
 * ser cidadão ativo (Residente ou acima), nenhum rank mínimo maior é
 * exigido nesta Sprint.
 */
import { randomUUID } from "node:crypto";
import type { House, HouseHistoryEvent, HouseStatus } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";
import { getCitizen } from "./citizen.service.js";
import { pushActivityFeedEntry } from "./activityFeed.service.js";

interface HouseRow {
  id: string;
  kingdom_id: string;
  district: string | null;
  plot: string | null;
  name: string;
  current_owner_character_id: string;
  original_builder_character_id: string;
  created_at: number;
  status: HouseStatus;
  house_type: string;
  history: string;
  current_owner_display_name: string;
  original_builder_display_name: string;
  kingdom_name: string;
}

// current_owner_display_name/original_builder_display_name/kingdom_name
// nunca são colunas de `houses` — sempre derivados aqui via join (ver
// comentário em packages/shared/src/types.ts).
const SELECT_HOUSE = `
  SELECT
    h.id, h.kingdom_id, h.district, h.plot, h.name, h.current_owner_character_id,
    h.original_builder_character_id, h.created_at, h.status, h.house_type, h.history,
    owner.display_name AS current_owner_display_name,
    builder.display_name AS original_builder_display_name,
    k.name AS kingdom_name
  FROM houses h
  JOIN characters owner ON owner.id = h.current_owner_character_id
  JOIN characters builder ON builder.id = h.original_builder_character_id
  JOIN kingdoms k ON k.id = h.kingdom_id
`;

function toHouse(row: HouseRow): House {
  return {
    id: row.id,
    kingdom_id: row.kingdom_id,
    district: row.district,
    plot: row.plot,
    name: row.name,
    current_owner_character_id: row.current_owner_character_id,
    original_builder_character_id: row.original_builder_character_id,
    created_at: new Date(row.created_at * 1000).toISOString(),
    status: row.status,
    house_type: row.house_type,
    history: JSON.parse(row.history) as HouseHistoryEvent[],
    current_owner_display_name: row.current_owner_display_name,
    original_builder_display_name: row.original_builder_display_name,
    kingdom_name: row.kingdom_name,
  };
}

function getRowById(id: string): HouseRow {
  return getDb().prepare(`${SELECT_HOUSE} WHERE h.id = ?`).get(id) as unknown as HouseRow;
}

export interface CreateHouseInput {
  kingdom_id: string;
  name: string;
  district?: string;
  plot?: string;
  house_type?: string;
}

export type CreateHouseResult =
  | { success: true; house: House }
  | { success: false; reason: "kingdom-not-found" | "invalid-name" | "not-a-citizen" };

/**
 * Constrói uma Casa. O construtor vira também o proprietário atual
 * inicial — mesmo padrão de founder=leader do Kingdom Domain. Exige
 * cidadania ativa no Reino alvo (ver comentário do módulo).
 */
export function createHouse(builderCharacterId: string, input: CreateHouseInput): CreateHouseResult {
  const db = getDb();
  const kingdom = db.prepare(`SELECT id FROM kingdoms WHERE id = ?`).get(input.kingdom_id);
  if (!kingdom) return { success: false, reason: "kingdom-not-found" };

  const name = input.name.trim();
  if (!name) return { success: false, reason: "invalid-name" };

  const citizen = getCitizen(builderCharacterId);
  if (!citizen || citizen.kingdom_id !== input.kingdom_id) {
    return { success: false, reason: "not-a-citizen" };
  }

  const id = randomUUID();
  const now = nowUnix();
  const history: HouseHistoryEvent[] = [
    { event: "built", from_character_id: null, to_character_id: builderCharacterId, at: new Date(now * 1000).toISOString() },
  ];

  db.prepare(
    `INSERT INTO houses (id, kingdom_id, district, plot, name, current_owner_character_id, original_builder_character_id, created_at, house_type, history)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.kingdom_id,
    input.district?.trim() || null,
    input.plot?.trim() || null,
    name,
    builderCharacterId,
    builderCharacterId,
    now,
    input.house_type?.trim() || "residencia",
    JSON.stringify(history),
  );

  // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — Activity
  // Feed: housing.service.ts nunca teve EventBus (auditoria da Sprint
  // Kingdom Domain) — chamada direta no ponto de sucesso, mesmo
  // princípio de KingdomNewsSystem sem retrofitar um mecanismo novo
  // neste domínio.
  pushActivityFeedEntry("🏠", `Uma nova casa, ${name}, foi construída.`, now * 1000);

  return { success: true, house: toHouse(getRowById(id)) };
}

export function getHouse(id: string): House | null {
  const row = getDb().prepare(`${SELECT_HOUSE} WHERE h.id = ?`).get(id) as unknown as HouseRow | undefined;
  return row ? toHouse(row) : null;
}

/** Todas as Casas ativas, mais recentes primeiro. */
export function listHouses(): House[] {
  const rows = getDb()
    .prepare(`${SELECT_HOUSE} WHERE h.status = 'active' ORDER BY h.created_at DESC`)
    .all() as unknown as HouseRow[];
  return rows.map(toHouse);
}

/** Casas ativas de um Reino específico, mais recentes primeiro. */
export function listKingdomHouses(kingdomId: string): House[] {
  const rows = getDb()
    .prepare(`${SELECT_HOUSE} WHERE h.kingdom_id = ? AND h.status = 'active' ORDER BY h.created_at DESC`)
    .all(kingdomId) as unknown as HouseRow[];
  return rows.map(toHouse);
}

export type TransferOwnershipResult =
  | { success: true; house: House }
  | { success: false; reason: "house-not-found" | "character-not-found" };

export interface TransferOwnershipOptions {
  // Sprint Real Estate Phase I — "sold" registra que a transferência
  // aconteceu através de uma venda real (com `price`), distinta da
  // transferência administrativa pura ("transferred", o default,
  // preservado para nenhum chamador existente quebrar). A regra de
  // "quem pode ficar dono" (transferOwnership em si) nunca muda — só o
  // tipo de evento gravado no histórico. Ver realEstate.service.ts.
  event?: "transferred" | "sold";
  price?: number;
}

/**
 * Transferência de posse — infraestrutura pura, nenhuma regra de compra
 * embutida aqui (Real Estate Phase I decide o preço/pagamento ANTES de
 * chamar esta função, dentro da mesma transação SQL). Nunca há
 * verificação de preço/pagamento nesta função por design: ela só move o
 * ponteiro de posse e registra o fato, exatamente como fazia antes de
 * Real Estate existir. `original_builder_character_id` nunca muda.
 * Acrescenta um evento ao histórico append-only, nunca reescreve os
 * anteriores.
 */
export function transferOwnership(
  houseId: string,
  newOwnerCharacterId: string,
  options?: TransferOwnershipOptions,
): TransferOwnershipResult {
  const db = getDb();
  const existing = db.prepare(`SELECT current_owner_character_id, history FROM houses WHERE id = ?`).get(houseId) as
    | { current_owner_character_id: string; history: string }
    | undefined;
  if (!existing) return { success: false, reason: "house-not-found" };

  const newOwner = db.prepare(`SELECT id FROM characters WHERE id = ?`).get(newOwnerCharacterId);
  if (!newOwner) return { success: false, reason: "character-not-found" };

  const history = JSON.parse(existing.history) as HouseHistoryEvent[];
  history.push({
    event: options?.event ?? "transferred",
    from_character_id: existing.current_owner_character_id,
    to_character_id: newOwnerCharacterId,
    at: new Date(nowUnix() * 1000).toISOString(),
    ...(options?.price !== undefined ? { price: options.price } : {}),
  });

  db.prepare(`UPDATE houses SET current_owner_character_id = ?, history = ? WHERE id = ?`).run(
    newOwnerCharacterId,
    JSON.stringify(history),
    houseId,
  );

  return { success: true, house: toHouse(getRowById(houseId)) };
}
