/**
 * Expedition Status — Sprint Expedition System (Sprint Encounter System
 * adicionou o campo `encounter`).
 *
 * Camada de apresentação pura, mesmo espírito de boss-status.service.ts
 * e world-state.service.ts: só leitura, nenhuma regra de jogo, `SELECT`
 * direto (sem passar pelo ExpeditionRepository, mesma convenção já usada
 * pelos outros dois serviços de status).
 */
import { getRegionName } from "@streamrpg/shared";
import type { EncounterSummary, ExpeditionResponse, ExpeditionStatus, RegionVisitSummary } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { calculateOverallProgress, estimatedSecondsRemaining } from "../systems/ExpeditionSystem.js";
import type { EncounterCategory, ExpeditionApproach, ExpeditionSnapshot } from "../engine/types.js";

interface ExpeditionRow {
  id: string;
  origin_region_id: string;
  destination_region_id: string;
  current_region_id: string;
  status: ExpeditionStatus;
  status_started_at: number;
  progress_ticks: number;
  total_estimated_ticks: number;
  current_event: string | null;
  current_encounter_category: EncounterCategory | null;
  current_encounter_icon: string | null;
  started_at: number;
  completed_at: number | null;
  approach: ExpeditionApproach | null;
}

function rowToSnapshot(row: ExpeditionRow): ExpeditionSnapshot {
  return {
    id: row.id,
    characterId: "", // não necessário para a camada de apresentação
    originRegionId: row.origin_region_id,
    destinationRegionId: row.destination_region_id,
    currentRegionId: row.current_region_id,
    status: row.status,
    statusStartedAt: row.status_started_at,
    progressTicks: row.progress_ticks,
    totalEstimatedTicks: row.total_estimated_ticks,
    currentEvent: row.current_event,
    currentEncounterCategory: row.current_encounter_category,
    currentEncounterIcon: row.current_encounter_icon,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    // Sprint Expedition Consequences Phase I — agora lido de verdade:
    // vira a base de `expeditionConsequences.ts` no cliente
    // (CreatureReader/ExpeditionCompact), que não têm acesso ao estado
    // local do ExpeditionPanel (Phase II).
    approach: row.approach,
  };
}

function encounterFromSnapshot(snapshot: ExpeditionSnapshot): EncounterSummary | null {
  if (!snapshot.currentEncounterCategory || !snapshot.currentEvent) return null;
  return {
    category: snapshot.currentEncounterCategory,
    icon: snapshot.currentEncounterIcon ?? "",
    text: snapshot.currentEvent,
  };
}

const ROW_COLUMNS = `id, character_id, origin_region_id, destination_region_id, current_region_id, status,
       status_started_at, progress_ticks, total_estimated_ticks, current_event,
       current_encounter_category, current_encounter_icon, started_at, completed_at, approach`;

export function getCurrentExpedition(characterId: string): ExpeditionResponse | null {
  const row = getDb()
    .prepare(`SELECT ${ROW_COLUMNS} FROM expeditions WHERE character_id = ? AND status != 'completed'`)
    .get(characterId) as (ExpeditionRow & { character_id: string }) | undefined;
  if (!row) return null;

  const snapshot = rowToSnapshot(row);
  return {
    id: snapshot.id,
    origin_region_id: snapshot.originRegionId,
    origin_region_name: getRegionName(snapshot.originRegionId),
    destination_region_id: snapshot.destinationRegionId,
    destination_region_name: getRegionName(snapshot.destinationRegionId),
    current_region_id: snapshot.currentRegionId,
    current_region_name: getRegionName(snapshot.currentRegionId),
    status: snapshot.status,
    progress_percent: calculateOverallProgress(snapshot),
    encounter: encounterFromSnapshot(snapshot),
    estimated_seconds_remaining: estimatedSecondsRemaining(snapshot),
    started_at: new Date(snapshot.startedAt * 1000).toISOString(),
    approach: snapshot.approach,
  };
}

export interface ExpeditionCompactForCharacter {
  region_name: string;
  status: ExpeditionStatus;
  progress_percent: number;
  encounter: EncounterSummary | null;
  approach: ExpeditionApproach | null;
}

export function getExpeditionCompactForCharacters(
  characterIds: string[],
): Map<string, ExpeditionCompactForCharacter> {
  const result = new Map<string, ExpeditionCompactForCharacter>();
  if (characterIds.length === 0) return result;

  const placeholders = characterIds.map(() => "?").join(",");
  const rows = getDb()
    .prepare(`SELECT ${ROW_COLUMNS} FROM expeditions WHERE character_id IN (${placeholders}) AND status != 'completed'`)
    .all(...characterIds) as unknown as Array<ExpeditionRow & { character_id: string }>;

  for (const row of rows) {
    const snapshot = rowToSnapshot(row);
    result.set(row.character_id, {
      region_name: getRegionName(snapshot.currentRegionId),
      status: snapshot.status,
      progress_percent: calculateOverallProgress(snapshot),
      encounter: encounterFromSnapshot(snapshot),
      approach: snapshot.approach,
    });
  }
  return result;
}

export function countActiveExpeditions(): number {
  const row = getDb().prepare(`SELECT COUNT(*) AS c FROM expeditions WHERE status != 'completed'`).get() as {
    c: number;
  };
  return row.c;
}

export function getMostVisitedRegions(limit = 5): RegionVisitSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT destination_region_id, COUNT(*) AS visits
       FROM expeditions
       GROUP BY destination_region_id
       ORDER BY visits DESC
       LIMIT ?`,
    )
    .all(limit) as Array<{ destination_region_id: string; visits: number }>;

  return rows.map((row) => ({
    region_id: row.destination_region_id,
    region_name: getRegionName(row.destination_region_id),
    visits: row.visits,
  }));
}

// Exportado só para o harness poder calcular o tempo estimado restante
// sem duplicar a lógica de ExpeditionSystem.ts.
export { estimatedSecondsRemaining };
