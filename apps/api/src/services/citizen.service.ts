/**
 * Citizen — Sprint Citizen System (Vision 2.0, Sprint 3) + Citizen
 * Progression (Vision 2.0, Sprint 4)
 *
 * A ligação permanente entre Character e Kingdom (docs/design/
 * citizen-system.md) — pertencimento nunca depende de viewer_sessions/
 * channel_rankings/live (ver docs/design/citizen-system-implementation.md
 * Fase 1, auditoria). Um personagem escolhe residir num Reino; a escolha
 * é reversível (trocar de Reino é permitido, per citizen-system.md Seção
 * 4), mas nunca automática por audiência.
 *
 * Join/Leave/Get/List (Sprint 3): implementa só o Estágio 2 (Residente)
 * dos 5 estágios documentados — `rank` nasce sempre "residente" ao
 * entrar.
 *
 * promote/demote/getRank/updateRank (Sprint 4, docs/design/
 * citizen-progression-implementation.md): infraestrutura pura para mover
 * um personagem um passo na escada (CITIZEN_RANK_ORDER). Nenhum critério
 * automático de promoção (tempo de residência, expedições, Bosses) é
 * implementado aqui — essas funções nunca são chamadas por nenhum
 * gatilho de jogo nesta Sprint, só existem para uma Sprint futura (ou
 * uso administrativo) decidir quando chamá-las.
 *
 * Responsabilidade única: Join/Leave/Get/List/Promote/Demote/Rank.
 * Nenhuma lógica política (eleição, conquista), econômica (impostos,
 * Tesouro) ou de guerra — tudo isso é escopo de Sprints futuras
 * (Housing, Kingdom Treasury, Kingdom Wars, ver docs/design/
 * new-roadmap.md).
 */
import { randomUUID } from "node:crypto";
import { CITIZEN_RANK_ORDER, type Citizen, type CitizenRank, type CitizenStatus, type PersistedCitizenRank } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

interface CitizenRow {
  id: string;
  character_id: string;
  kingdom_id: string;
  joined_at: number;
  status: CitizenStatus;
  rank: PersistedCitizenRank;
  notes: string | null;
  last_activity: number;
  is_founder: number;
  is_leader: number;
  character_display_name: string;
}

// is_founder/is_leader/character_display_name nunca são colunas de
// `citizens` — sempre derivados aqui via join (ver comentário em
// packages/shared/src/types.ts).
const SELECT_CITIZEN = `
  SELECT
    c.id, c.character_id, c.kingdom_id, c.joined_at, c.status, c.rank, c.notes, c.last_activity,
    CASE WHEN ch.profile_id = k.founder_profile_id THEN 1 ELSE 0 END AS is_founder,
    CASE WHEN ch.profile_id = k.leader_profile_id THEN 1 ELSE 0 END AS is_leader,
    ch.display_name AS character_display_name
  FROM citizens c
  JOIN characters ch ON ch.id = c.character_id
  JOIN kingdoms k ON k.id = c.kingdom_id
`;

function toCitizen(row: CitizenRow): Citizen {
  return {
    id: row.id,
    character_id: row.character_id,
    kingdom_id: row.kingdom_id,
    joined_at: new Date(row.joined_at * 1000).toISOString(),
    status: row.status,
    rank: row.rank,
    is_founder: Boolean(row.is_founder),
    is_leader: Boolean(row.is_leader),
    notes: row.notes,
    last_activity: new Date(row.last_activity * 1000).toISOString(),
    character_display_name: row.character_display_name,
  };
}

function getRowById(id: string): CitizenRow {
  return getDb().prepare(`${SELECT_CITIZEN} WHERE c.id = ?`).get(id) as unknown as CitizenRow;
}

export type JoinKingdomResult =
  | { success: true; citizen: Citizen }
  | { success: false; reason: "kingdom-not-found" | "already-citizen" };

/**
 * Entra num Reino. Se o personagem já é cidadão ativo de outro Reino,
 * troca (atualiza a mesma linha, reinicia joined_at/rank — per
 * citizen-system.md Seção 4, "reinicia o relógio de cidadania"). Se já é
 * cidadão ativo deste mesmo Reino, é um no-op reportado como erro
 * (nada a fazer). Nenhuma consequência de troca (impostos, penalidade)
 * é aplicada — per Fase 7 do brief ("apenas troca, nada mais").
 */
export function joinKingdom(characterId: string, kingdomId: string): JoinKingdomResult {
  const db = getDb();
  const kingdom = db.prepare(`SELECT id FROM kingdoms WHERE id = ?`).get(kingdomId);
  if (!kingdom) return { success: false, reason: "kingdom-not-found" };

  const now = nowUnix();
  const existing = db.prepare(`SELECT id, kingdom_id, status FROM citizens WHERE character_id = ?`).get(
    characterId,
  ) as { id: string; kingdom_id: string; status: CitizenStatus } | undefined;

  if (existing && existing.status === "active" && existing.kingdom_id === kingdomId) {
    return { success: false, reason: "already-citizen" };
  }

  if (existing) {
    db.prepare(
      `UPDATE citizens SET kingdom_id = ?, joined_at = ?, status = 'active', rank = 'residente', last_activity = ?
       WHERE id = ?`,
    ).run(kingdomId, now, now, existing.id);
    return { success: true, citizen: toCitizen(getRowById(existing.id)) };
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO citizens (id, character_id, kingdom_id, joined_at, status, rank, last_activity)
     VALUES (?, ?, ?, ?, 'active', 'residente', ?)`,
  ).run(id, characterId, kingdomId, now, now);
  return { success: true, citizen: toCitizen(getRowById(id)) };
}

export type LeaveKingdomResult = { success: true } | { success: false; reason: "not-a-citizen" };

/**
 * Sai do Reino atual. A linha não é apagada (status vira 'left') —
 * mantém o registro de que aquele personagem já residiu ali, sem
 * implementar a história completa multi-Reino (fora de escopo desta
 * Sprint).
 */
export function leaveKingdom(characterId: string): LeaveKingdomResult {
  const db = getDb();
  const existing = db.prepare(`SELECT id FROM citizens WHERE character_id = ? AND status = 'active'`).get(
    characterId,
  ) as { id: string } | undefined;
  if (!existing) return { success: false, reason: "not-a-citizen" };

  db.prepare(`UPDATE citizens SET status = 'left', last_activity = ? WHERE id = ?`).run(nowUnix(), existing.id);
  return { success: true };
}

/** Cidadania ativa do personagem, ou null se ele não pertence a nenhum Reino agora. */
export function getCitizen(characterId: string): Citizen | null {
  const row = getDb()
    .prepare(`${SELECT_CITIZEN} WHERE c.character_id = ? AND c.status = 'active'`)
    .get(characterId) as unknown as CitizenRow | undefined;
  return row ? toCitizen(row) : null;
}

/** Todos os cidadãos ativos, de qualquer Reino — utilitário de domínio completo (Fase 4 do brief). */
export function listCitizens(): Citizen[] {
  const rows = getDb()
    .prepare(`${SELECT_CITIZEN} WHERE c.status = 'active' ORDER BY c.joined_at ASC`)
    .all() as unknown as CitizenRow[];
  return rows.map(toCitizen);
}

/** Cidadãos ativos de um Reino específico, mais antigos primeiro. */
export function listKingdomCitizens(kingdomId: string): Citizen[] {
  const rows = getDb()
    .prepare(`${SELECT_CITIZEN} WHERE c.kingdom_id = ? AND c.status = 'active' ORDER BY c.joined_at ASC`)
    .all(kingdomId) as unknown as CitizenRow[];
  return rows.map(toCitizen);
}

// ============================================================
// Citizen Progression (Sprint 4) — mover na escada, sem critério
// automático. "Visitante" nunca aparece como valor de retorno de
// promote/demote/updateRank (essas funções só operam sobre uma linha
// `citizens` já existente) — só getRank() devolve "visitante", para o
// caso derivado de "sem cidadania ativa".
// ============================================================

/** Rank atual do personagem, incluindo o caso derivado "visitante" (sem cidadania ativa). */
export function getRank(characterId: string): CitizenRank {
  return getCitizen(characterId)?.rank ?? "visitante";
}

export type ChangeRankResult =
  | { success: true; rank: PersistedCitizenRank }
  | { success: false; reason: "not-a-citizen" | "already-max-rank" | "already-min-rank" | "invalid-rank" };

/** Promove um estágio na escada (residente→cidadao→veterano→lenda). Nunca pula estágio. */
export function promote(characterId: string): ChangeRankResult {
  const current = getDb()
    .prepare(`SELECT id, rank FROM citizens WHERE character_id = ? AND status = 'active'`)
    .get(characterId) as { id: string; rank: PersistedCitizenRank } | undefined;
  if (!current) return { success: false, reason: "not-a-citizen" };

  const index = CITIZEN_RANK_ORDER.indexOf(current.rank);
  if (index === CITIZEN_RANK_ORDER.length - 1) return { success: false, reason: "already-max-rank" };

  const nextRank = CITIZEN_RANK_ORDER[index + 1];
  getDb().prepare(`UPDATE citizens SET rank = ?, last_activity = ? WHERE id = ?`).run(nextRank, nowUnix(), current.id);
  return { success: true, rank: nextRank };
}

/** Rebaixa um estágio na escada. Nunca rebaixa abaixo de 'residente' — sair do Reino (leaveKingdom) é o caminho para "visitante". */
export function demote(characterId: string): ChangeRankResult {
  const current = getDb()
    .prepare(`SELECT id, rank FROM citizens WHERE character_id = ? AND status = 'active'`)
    .get(characterId) as { id: string; rank: PersistedCitizenRank } | undefined;
  if (!current) return { success: false, reason: "not-a-citizen" };

  const index = CITIZEN_RANK_ORDER.indexOf(current.rank);
  if (index === 0) return { success: false, reason: "already-min-rank" };

  const previousRank = CITIZEN_RANK_ORDER[index - 1];
  getDb().prepare(`UPDATE citizens SET rank = ?, last_activity = ? WHERE id = ?`).run(previousRank, nowUnix(), current.id);
  return { success: true, rank: previousRank };
}

/**
 * Define o rank diretamente (infraestrutura administrativa/futura, não
 * exposta a nenhuma ação de jogador na UI desta Sprint — ver Limitações
 * em citizen-progression-implementation.md).
 */
export function updateRank(characterId: string, rank: PersistedCitizenRank): ChangeRankResult {
  if (!CITIZEN_RANK_ORDER.includes(rank)) return { success: false, reason: "invalid-rank" };

  const current = getDb()
    .prepare(`SELECT id FROM citizens WHERE character_id = ? AND status = 'active'`)
    .get(characterId) as { id: string } | undefined;
  if (!current) return { success: false, reason: "not-a-citizen" };

  getDb().prepare(`UPDATE citizens SET rank = ?, last_activity = ? WHERE id = ?`).run(rank, nowUnix(), current.id);
  return { success: true, rank };
}
