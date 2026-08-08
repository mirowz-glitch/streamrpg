/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — Offline
 * Summary. "Seu personagem continua existindo enquanto você está fora":
 * ao retornar, o Jogador recebe um resumo real do que aconteceu,
 * calculado pelo MESMO Adventure Loop da Aventura ao vivo
 * (computeOfflineCatchUp, packages/shared) — nunca uma fórmula
 * estatística paralela, nunca depende de Twitch/canal/live.
 */
import { computeOfflineCatchUp, getProgress, STARTER_REGION_IDS, type OfflineSummary } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";
import { SQLiteCharacterRepository } from "../infrastructure/SQLiteCharacterRepository.js";

const characterRepository = new SQLiteCharacterRepository();

// Só vale a pena computar/mostrar um resumo se a ausência foi real (não
// só o intervalo normal entre dois ticks do IdleDriver, 2.5s, nem o
// intervalo normal entre dois heartbeats, 60s) — mesmo espírito de
// "afk"/"offline" já usado em derivePlayerPresence (presence/).
const MIN_ABSENCE_MS = 3 * 60_000;

// Um resumo pendente por personagem, consumido uma única vez (mesmo
// padrão de buffer em memória já usado por KingdomNewsSystem/
// WorldPresenceSystem nesta Sprint) — nunca uma tabela nova só pra um
// aviso de "bem-vindo de volta".
const pendingSummaries = new Map<string, OfflineSummary>();

// STARTER_REGION_IDS[0] (simulation/simulator.ts) — a única região com
// Encounter Table apropriada pra um personagem sem nenhuma expedição
// ainda (porto-do-amanhecer, STARTING_REGION_ID de regions.ts, é um hub
// seguro SEM Encounter Table — nunca resolveria um encontro real).
const FALLBACK_REGION_ID = STARTER_REGION_IDS[0];

function resolveCurrentRegionId(characterId: string): string {
  const row = getDb()
    .prepare(
      `SELECT current_region_id FROM expeditions WHERE character_id = ? ORDER BY created_at DESC LIMIT 1`,
    )
    .get(characterId) as { current_region_id: string } | undefined;
  return row?.current_region_id ?? FALLBACK_REGION_ID;
}

/**
 * Chamado a cada heartbeat de presença (POST /api/presence/ping) — dona
 * única da escrita de `last_active_at` (nunca duas fontes de verdade
 * pra "quando foi visto por último"). Se a ausência desde a última
 * chamada foi real, computa e guarda um resumo pendente ANTES de
 * atualizar `last_active_at` para agora — nunca aplica a mesma ausência
 * duas vezes.
 */
export async function checkAndComputeOfflineSummary(characterId: string): Promise<void> {
  const db = getDb();
  const row = db
    .prepare(`SELECT xp, last_active_at FROM characters WHERE id = ?`)
    .get(characterId) as { xp: number; last_active_at: number | null } | undefined;

  if (row && row.last_active_at !== null) {
    const elapsedMs = Date.now() - row.last_active_at * 1000;
    if (elapsedMs >= MIN_ABSENCE_MS) {
      const progress = getProgress(row.xp);
      const summary = computeOfflineCatchUp({
        characterLevel: progress.level,
        characterXp: progress.xp,
        regionId: resolveCurrentRegionId(characterId),
        elapsedMs,
        seed: row.last_active_at,
      });

      if (summary.xpGained > 0) {
        await characterRepository.applyXP(characterId, summary.xpGained, Date.now());
      }
      if (summary.goldFromAutoSold > 0) {
        await characterRepository.grantGold(characterId, summary.goldFromAutoSold);
      }

      pendingSummaries.set(characterId, summary);
    }
  }

  db.prepare(`UPDATE characters SET last_active_at = ? WHERE id = ?`).run(nowUnix(), characterId);
}

/** Consome (uma única vez) o resumo pendente de um personagem, se houver. */
export function consumePendingOfflineSummary(characterId: string): OfflineSummary | null {
  const summary = pendingSummaries.get(characterId);
  if (!summary) return null;
  pendingSummaries.delete(characterId);
  return summary;
}
