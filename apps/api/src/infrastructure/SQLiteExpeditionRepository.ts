/**
 * SQLiteExpeditionRepository — Sprint Expedition System (Sprint Encounter
 * System adicionou current_encounter_category/icon).
 *
 * Só persiste/consulta estado de expedição — nenhuma regra de jogo vive
 * aqui (quando criar, quando avançar de estado, qual Encounter mostrar é
 * responsabilidade do ExpeditionSystem). Mesmo padrão de
 * SQLiteBossRepository.ts.
 */
import { randomUUID } from "node:crypto";
import { getDb } from "../config/database.js";
import type {
  EncounterCategory,
  EncounterSnapshot,
  ExpeditionRepository,
  ExpeditionSnapshot,
  ExpeditionStatus,
} from "../engine/types.js";

interface ExpeditionRow {
  id: string;
  character_id: string;
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
}

const SELECT_COLUMNS = `id, character_id, origin_region_id, destination_region_id, current_region_id,
       status, status_started_at, progress_ticks, total_estimated_ticks, current_event,
       current_encounter_category, current_encounter_icon, started_at, completed_at`;

function mapRow(row: ExpeditionRow): ExpeditionSnapshot {
  return {
    id: row.id,
    characterId: row.character_id,
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
  };
}

export class SQLiteExpeditionRepository implements ExpeditionRepository {
  async findActiveByCharacter(characterId: string): Promise<ExpeditionSnapshot | null> {
    const row = getDb()
      .prepare(`SELECT ${SELECT_COLUMNS} FROM expeditions WHERE character_id = ? AND status != 'completed'`)
      .get(characterId) as ExpeditionRow | undefined;
    return row ? mapRow(row) : null;
  }

  async create(
    characterId: string,
    originRegionId: string,
    destinationRegionId: string,
    totalEstimatedTicks: number,
    timestamp: number,
  ): Promise<ExpeditionSnapshot> {
    const id = randomUUID();
    getDb()
      .prepare(
        `INSERT INTO expeditions
           (id, character_id, origin_region_id, destination_region_id, current_region_id,
            status, status_started_at, progress_ticks, total_estimated_ticks, current_event,
            current_encounter_category, current_encounter_icon, started_at)
         VALUES (?, ?, ?, ?, ?, 'preparing', ?, 0, ?, NULL, NULL, NULL, ?)`,
      )
      .run(id, characterId, originRegionId, destinationRegionId, originRegionId, timestamp, totalEstimatedTicks, timestamp);

    return {
      id,
      characterId,
      originRegionId,
      destinationRegionId,
      currentRegionId: originRegionId,
      status: "preparing",
      statusStartedAt: timestamp,
      progressTicks: 0,
      totalEstimatedTicks,
      currentEvent: null,
      currentEncounterCategory: null,
      currentEncounterIcon: null,
      startedAt: timestamp,
      completedAt: null,
    };
  }

  async advance(
    expeditionId: string,
    status: ExpeditionStatus,
    statusStartedAt: number,
    progressTicks: number,
    encounter: EncounterSnapshot | null,
    currentRegionId: string,
  ): Promise<ExpeditionSnapshot> {
    const db = getDb();
    db.prepare(
      `UPDATE expeditions
       SET status = ?, status_started_at = ?, progress_ticks = ?, current_event = ?,
           current_encounter_category = ?, current_encounter_icon = ?, current_region_id = ?
       WHERE id = ? AND status != 'completed'`,
    ).run(
      status,
      statusStartedAt,
      progressTicks,
      encounter?.text ?? null,
      encounter?.category ?? null,
      encounter?.icon ?? null,
      currentRegionId,
      expeditionId,
    );

    const updated = db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM expeditions WHERE id = ?`)
      .get(expeditionId) as ExpeditionRow | undefined;
    if (!updated) {
      throw new Error(`ExpeditionRepository: expedição ${expeditionId} não encontrada ao avançar`);
    }
    return mapRow(updated);
  }

  async complete(expeditionId: string, timestamp: number): Promise<ExpeditionSnapshot> {
    const db = getDb();
    db.prepare(
      `UPDATE expeditions SET status = 'completed', completed_at = ? WHERE id = ? AND status != 'completed'`,
    ).run(timestamp, expeditionId);

    const row = db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM expeditions WHERE id = ?`)
      .get(expeditionId) as ExpeditionRow | undefined;
    if (!row) {
      throw new Error(`ExpeditionRepository: expedição ${expeditionId} não encontrada ao concluir`);
    }
    return mapRow(row);
  }
}
