/**
 * Kingdom Prestige — Sprint Kingdom Prestige System
 *
 * Identidade coletiva de um canal (Reino) — nunca do personagem. Todo
 * dado aqui é leitura pura sobre o que já existe (channel_rankings,
 * bosses/boss_rewards, expeditions, viewer_sessions): nenhuma tabela de
 * XP/Gold/Drop/Combat/Boss/Economy/Expedição/Encounter é escrita por este
 * arquivo. A única escrita própria é `kingdom_roles` — "quem ocupa cada
 * cargo agora" —, diferente de Títulos/Molduras (Founder Identity): um
 * cargo pode trocar de dono, nunca é um desbloqueio permanente.
 *
 * Etapa 8 (preparar infraestrutura): `getKingdomPrestige()` é o único
 * ponto de leitura que um sistema futuro (regiões, NPCs, eventos, Bosses,
 * dungeons, temporadas) precisaria importar para gatear algo por
 * Prestígio. Nada consome isso ainda — nenhuma dessas features existe
 * nesta Sprint, só a leitura pronta para ser usada quando essa decisão
 * for tomada em outro lugar.
 */
import type {
  ChannelKingdomState,
  KingdomAchievement,
  KingdomHallOfFameSlot,
  KingdomPrestige,
  KingdomRoleSlug,
} from "@streamrpg/shared";
import { KINGDOM_ROLE_CATALOG } from "@streamrpg/shared";
import { getDb } from "../config/database.js";

type Db = ReturnType<typeof getDb>;

const MAX_ACHIEVEMENTS_PER_CHANNEL = 10;
const achievementsByChannel = new Map<string, KingdomAchievement[]>();
let achievementSeq = 0;

export function resolveChannelId(channelLogin: string): string | null {
  const row = getDb()
    .prepare(`SELECT id FROM streamer_channels WHERE id = ?`)
    .get(channelLogin.toLowerCase()) as { id: string } | undefined;
  return row?.id ?? null;
}

// ============================================================
// Cálculo de quem ocupa cada cargo agora — cada função, uma leitura pura,
// nenhuma escrita. "Membro" de um Reino é definido por ter ao menos uma
// linha em viewer_sessions ou channel_rankings para este canal — nunca
// por Expedições (que nunca carregam channelId, Etapa Expedition System),
// por isso Grande Explorador/Herói do Reino usam viewer_sessions como
// ponte para saber "quem deste canal" antes de olhar o dado global de
// expeditions do personagem.
// ============================================================

interface RoleWinner {
  characterId: string;
  value: number;
}

function computeGuardiao(db: Db, channelId: string): RoleWinner | null {
  const row = db
    .prepare(
      `SELECT character_id, total_xp FROM channel_rankings
       WHERE channel_id = ? AND total_xp > 0
       ORDER BY total_xp DESC, character_id ASC LIMIT 1`,
    )
    .get(channelId) as { character_id: string; total_xp: number } | undefined;
  return row ? { characterId: row.character_id, value: row.total_xp } : null;
}

function computeCampeaoBosses(db: Db, channelId: string): RoleWinner | null {
  const row = db
    .prepare(
      `SELECT br.character_id AS character_id, COUNT(*) AS c
       FROM boss_rewards br
       JOIN bosses b ON b.id = br.boss_id
       WHERE b.channel_id = ? AND br.outcome = 'defeated'
       GROUP BY br.character_id
       ORDER BY c DESC, br.character_id ASC
       LIMIT 1`,
    )
    .get(channelId) as { character_id: string; c: number } | undefined;
  return row ? { characterId: row.character_id, value: row.c } : null;
}

function computeGrandeExplorador(db: Db, channelId: string): RoleWinner | null {
  const row = db
    .prepare(
      `SELECT vs.character_id AS character_id, COUNT(DISTINCT e.destination_region_id) AS c
       FROM (SELECT DISTINCT character_id FROM viewer_sessions WHERE channel_id = ?) vs
       JOIN expeditions e ON e.character_id = vs.character_id AND e.status = 'completed'
       GROUP BY vs.character_id
       ORDER BY c DESC, vs.character_id ASC
       LIMIT 1`,
    )
    .get(channelId) as { character_id: string; c: number } | undefined;
  return row && row.c > 0 ? { characterId: row.character_id, value: row.c } : null;
}

function computeMembroAntigo(db: Db, channelId: string): RoleWinner | null {
  const row = db
    .prepare(
      `SELECT character_id, MIN(first_ping_at) AS t
       FROM viewer_sessions
       WHERE channel_id = ?
       GROUP BY character_id
       ORDER BY t ASC, character_id ASC
       LIMIT 1`,
    )
    .get(channelId) as { character_id: string; t: number } | undefined;
  return row ? { characterId: row.character_id, value: row.t } : null;
}

// Streak calculado em JS sobre os session_date distintos (um por dia,
// garantido pelo UNIQUE de viewer_sessions) — mais simples e honesto do
// que tentar expressar "maior sequência de dias consecutivos" em SQL puro
// no node:sqlite.
function computeMaiorSequencia(db: Db, channelId: string): RoleWinner | null {
  const rows = db
    .prepare(
      `SELECT character_id, session_date FROM viewer_sessions
       WHERE channel_id = ?
       ORDER BY character_id ASC, session_date ASC`,
    )
    .all(channelId) as Array<{ character_id: string; session_date: string }>;

  let bestCharacter: string | null = null;
  let bestStreak = 0;
  let currentCharacter: string | null = null;
  let currentStreak = 0;
  let previousDate: Date | null = null;

  const flush = () => {
    if (currentCharacter && currentStreak > bestStreak) {
      bestStreak = currentStreak;
      bestCharacter = currentCharacter;
    }
  };

  for (const row of rows) {
    const date = new Date(`${row.session_date}T00:00:00Z`);
    if (row.character_id !== currentCharacter) {
      flush();
      currentCharacter = row.character_id;
      currentStreak = 1;
      previousDate = date;
      continue;
    }
    const diffDays = previousDate ? Math.round((date.getTime() - previousDate.getTime()) / 86_400_000) : 1;
    currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
    previousDate = date;
  }
  flush();

  return bestCharacter && bestStreak > 0 ? { characterId: bestCharacter, value: bestStreak } : null;
}

// Composto (XP no canal + Bosses derrotados no canal + regiões
// descobertas) em vez de minutos assistidos puros — deliberado: minutos
// sozinhos recompensariam só "deixar a live aberta" (Etapa 10 da
// Review). Pesos ilustrativos, mesma honestidade de todo valor não
// calibrado do projeto.
function computeHeroiReino(db: Db, channelId: string): RoleWinner | null {
  const members = db
    .prepare(`SELECT character_id, total_xp FROM channel_rankings WHERE channel_id = ?`)
    .all(channelId) as Array<{ character_id: string; total_xp: number }>;
  if (members.length === 0) return null;

  const bossCounts = new Map<string, number>();
  for (const row of db
    .prepare(
      `SELECT br.character_id AS character_id, COUNT(*) AS c
       FROM boss_rewards br JOIN bosses b ON b.id = br.boss_id
       WHERE b.channel_id = ? AND br.outcome = 'defeated'
       GROUP BY br.character_id`,
    )
    .all(channelId) as Array<{ character_id: string; c: number }>) {
    bossCounts.set(row.character_id, row.c);
  }

  const regionCounts = new Map<string, number>();
  for (const row of db
    .prepare(
      `SELECT vs.character_id AS character_id, COUNT(DISTINCT e.destination_region_id) AS c
       FROM (SELECT DISTINCT character_id FROM viewer_sessions WHERE channel_id = ?) vs
       JOIN expeditions e ON e.character_id = vs.character_id AND e.status = 'completed'
       GROUP BY vs.character_id`,
    )
    .all(channelId) as Array<{ character_id: string; c: number }>) {
    regionCounts.set(row.character_id, row.c);
  }

  let best: RoleWinner | null = null;
  for (const member of members) {
    const score = member.total_xp + (bossCounts.get(member.character_id) ?? 0) * 50 + (regionCounts.get(member.character_id) ?? 0) * 20;
    if (score <= 0) continue;
    if (!best || score > best.value || (score === best.value && member.character_id < best.characterId)) {
      best = { characterId: member.character_id, value: score };
    }
  }
  return best;
}

const ROLE_COMPUTERS: Record<KingdomRoleSlug, (db: Db, channelId: string) => RoleWinner | null> = {
  guardiao: computeGuardiao,
  "campeao-bosses": computeCampeaoBosses,
  "grande-explorador": computeGrandeExplorador,
  "heroi-reino": computeHeroiReino,
  "membro-antigo": computeMembroAntigo,
  "maior-sequencia": computeMaiorSequencia,
};

export interface RoleChange {
  roleSlug: KingdomRoleSlug;
  roleName: string;
  characterId: string;
  previousCharacterId: string | null;
}

/**
 * Recalcula os 6 cargos deste canal e persiste só os que mudaram de dono.
 * Retorna as trocas reais (para o System emitir evento) — nunca
 * re-escreve um cargo cujo ocupante já é o vencedor calculado agora.
 */
export function evaluateAndUpdateRoles(channelId: string, timestamp: number): RoleChange[] {
  const db = getDb();
  const changes: RoleChange[] = [];

  for (const roleDef of KINGDOM_ROLE_CATALOG) {
    const winner = ROLE_COMPUTERS[roleDef.slug](db, channelId);
    if (!winner) continue;

    const current = db
      .prepare(`SELECT character_id FROM kingdom_roles WHERE channel_id = ? AND role_slug = ?`)
      .get(channelId, roleDef.slug) as { character_id: string } | undefined;

    if (current?.character_id === winner.characterId) continue;

    db.prepare(
      `INSERT INTO kingdom_roles (channel_id, role_slug, character_id, held_since)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(channel_id, role_slug) DO UPDATE SET
         character_id = excluded.character_id,
         held_since = excluded.held_since`,
    ).run(channelId, roleDef.slug, winner.characterId, timestamp);

    changes.push({
      roleSlug: roleDef.slug,
      roleName: roleDef.name,
      characterId: winner.characterId,
      previousCharacterId: current?.character_id ?? null,
    });
  }

  return changes;
}

// ============================================================
// Leitura para a API (Mundo, Overlay, Ranking, Perfil).
// ============================================================

export function getHallOfFame(channelId: string): KingdomHallOfFameSlot[] {
  const rows = getDb()
    .prepare(
      `SELECT kr.role_slug, kr.character_id, kr.held_since, c.display_name, p.avatar_url
       FROM kingdom_roles kr
       JOIN characters c ON c.id = kr.character_id
       JOIN profiles p ON p.id = c.profile_id
       WHERE kr.channel_id = ?`,
    )
    .all(channelId) as unknown as Array<{
    role_slug: KingdomRoleSlug;
    character_id: string;
    held_since: number;
    display_name: string;
    avatar_url: string | null;
  }>;

  const byRole = new Map(rows.map((r) => [r.role_slug, r]));

  return KINGDOM_ROLE_CATALOG.map((roleDef) => {
    const row = byRole.get(roleDef.slug);
    return {
      role: roleDef.slug,
      role_name: roleDef.name,
      icon: roleDef.icon,
      holder: row
        ? {
            character_id: row.character_id,
            display_name: row.display_name,
            avatar_url: row.avatar_url,
            held_since: new Date(row.held_since * 1000).toISOString(),
          }
        : null,
    };
  });
}

export function getKingdomPrestige(channelId: string): KingdomPrestige {
  const db = getDb();
  const totalXp = (
    db.prepare(`SELECT COALESCE(SUM(total_xp), 0) AS s FROM channel_rankings WHERE channel_id = ?`).get(channelId) as {
      s: number;
    }
  ).s;
  const membersCount = (
    db.prepare(`SELECT COUNT(*) AS c FROM channel_rankings WHERE channel_id = ?`).get(channelId) as { c: number }
  ).c;
  const bossesDefeated = (
    db.prepare(`SELECT COUNT(*) AS c FROM bosses WHERE channel_id = ? AND status = 'defeated'`).get(channelId) as {
      c: number;
    }
  ).c;
  const totalMinutes = (
    db.prepare(`SELECT COALESCE(SUM(minutes_watched), 0) AS s FROM viewer_sessions WHERE channel_id = ?`).get(
      channelId,
    ) as { s: number }
  ).s;
  const regionsDiscovered = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT e.destination_region_id) AS c
         FROM (SELECT DISTINCT character_id FROM viewer_sessions WHERE channel_id = ?) vs
         JOIN expeditions e ON e.character_id = vs.character_id AND e.status = 'completed'`,
      )
      .get(channelId) as { c: number }
  ).c;

  // Fórmula/pesos ilustrativos (Etapa 1: "nunca editar manualmente" — só
  // o score final nunca é editado à mão; os pesos abaixo são uma escolha
  // de apresentação, mesma honestidade de todo valor não calibrado do
  // projeto). Prestígio nunca alimenta XP/Gold/Combate — só o contrário
  // (Etapa 8, features futuras lendo este score).
  const score = Math.round(
    totalXp / 10 + bossesDefeated * 100 + membersCount * 10 + totalMinutes / 5 + regionsDiscovered * 15,
  );

  return {
    score,
    breakdown: {
      total_xp: totalXp,
      bosses_defeated: bossesDefeated,
      members_count: membersCount,
      total_minutes_watched: totalMinutes,
      regions_discovered: regionsDiscovered,
    },
  };
}

// Histórico de conquistas do Reino — igual à Timeline/histórico de
// Encounters (world-state.service.ts): buffer em memória por canal,
// populado por um subscriber de kingdom.role_changed, reinicia a cada
// boot do servidor (nenhuma tabela de log genérica existe, criar uma
// seria além do escopo desta Sprint).
export function pushKingdomAchievement(channelId: string, text: string, timestamp: number): void {
  achievementSeq += 1;
  const list = achievementsByChannel.get(channelId) ?? [];
  list.push({ id: `kingdom-achv-${achievementSeq}`, text, timestamp });
  achievementsByChannel.set(
    channelId,
    list.length > MAX_ACHIEVEMENTS_PER_CHANNEL ? list.slice(-MAX_ACHIEVEMENTS_PER_CHANNEL) : list,
  );
}

export function getRecentAchievements(channelId: string): KingdomAchievement[] {
  return [...(achievementsByChannel.get(channelId) ?? [])].reverse();
}

export function getChannelKingdomState(channelLogin: string): ChannelKingdomState | null {
  const channelId = resolveChannelId(channelLogin);
  if (!channelId) return null;
  const channel = getDb().prepare(`SELECT display_name FROM streamer_channels WHERE id = ?`).get(channelId) as {
    display_name: string;
  };

  return {
    channel: channelId,
    channel_display_name: channel.display_name,
    prestige: getKingdomPrestige(channelId),
    hall_of_fame: getHallOfFame(channelId),
    recent_achievements: getRecentAchievements(channelId),
  };
}

// Etapa 5 (Overlay) — só os cargos mais importantes, "sem poluir".
export function getHallOfFameHighlights(channelId: string): KingdomHallOfFameSlot[] {
  const highlightSlugs: KingdomRoleSlug[] = ["guardiao", "campeao-bosses"];
  return getHallOfFame(channelId).filter((slot) => highlightSlugs.includes(slot.role));
}

// Etapa 7 (Ranking) — ícones dos cargos que cada personagem ocupa hoje
// neste canal, em lote (mesmo padrão de getIdentityCompactForCharacters).
export function getRoleIconsForCharacters(channelId: string, characterIds: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  if (characterIds.length === 0) return result;

  const iconBySlug = new Map(KINGDOM_ROLE_CATALOG.map((r) => [r.slug, r.icon]));
  const placeholders = characterIds.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT character_id, role_slug FROM kingdom_roles WHERE channel_id = ? AND character_id IN (${placeholders})`,
    )
    .all(channelId, ...characterIds) as unknown as Array<{ character_id: string; role_slug: KingdomRoleSlug }>;

  for (const row of rows) {
    const list = result.get(row.character_id) ?? [];
    list.push(iconBySlug.get(row.role_slug) ?? "");
    result.set(row.character_id, list);
  }
  return result;
}

// Etapa 6 (Perfil) — cargo(s) que o personagem ocupa agora num canal
// específico (o mesmo canal que o Perfil já usa via usePing/BossCard).
export interface CharacterKingdomRole {
  slug: KingdomRoleSlug;
  name: string;
  icon: string;
}

export function getRolesForCharacterInChannel(channelLogin: string, characterId: string): CharacterKingdomRole[] {
  const channelId = resolveChannelId(channelLogin);
  if (!channelId) return [];
  const rows = getDb()
    .prepare(`SELECT role_slug FROM kingdom_roles WHERE channel_id = ? AND character_id = ?`)
    .all(channelId, characterId) as Array<{ role_slug: KingdomRoleSlug }>;
  const slugs = new Set(rows.map((r) => r.role_slug));
  return KINGDOM_ROLE_CATALOG.filter((r) => slugs.has(r.slug)).map((r) => ({ slug: r.slug, name: r.name, icon: r.icon }));
}
