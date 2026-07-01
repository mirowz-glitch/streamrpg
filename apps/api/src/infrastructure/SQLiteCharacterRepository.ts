/**
 * SQLiteCharacterRepository — M-007
 *
 * Implementação concreta do CharacterRepository usando SQLite.
 *
 * Esta classe é a única que conhece o banco de dados no contexto
 * dos sistemas de jogo. Todo acesso a dados de personagem pelos
 * sistemas deve passar por aqui — nunca por getDb() direto.
 *
 * O XPSystem e outros sistemas dependem da interface CharacterRepository
 * definida em engine/types.ts — nunca desta classe diretamente.
 * Isso permite trocar a implementação (ex: PostgreSQL, Redis cache)
 * sem alterar nenhum sistema de jogo.
 *
 * MÉTODOS IMPLEMENTADOS:
 * - findById(): leitura — usado pelo XPSystem em modo shadow (M-006/M-007)
 * - applyXP(): escrita — implementado mas não usado até M-008+
 * - addMinutesWatched(): escrita — implementado mas não usado até M-008+
 *
 * NÃO conhece:
 * - EventBus, GameEngine, GameClock
 * - Frontend, Twitch ou Railway
 * - Nenhum sistema de jogo (XPSystem, DropSystem, etc.)
 */

import { getDb, nowUnix } from "../config/database.js";
import { getProgress } from "@streamrpg/shared";
import type {
  CharacterRepository,
  CharacterSnapshot,
  XPResult,
} from "../engine/types.js";

export class SQLiteCharacterRepository implements CharacterRepository {
  /**
   * Busca um personagem pelo ID.
   * Retorna null se não encontrado.
   *
   * Usado pelo XPSystem em modo shadow para obter o display_name
   * antes de logar o XP que seria concedido.
   */
  async findById(id: string): Promise<CharacterSnapshot | null> {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT id, display_name, level, xp, gold
         FROM characters
         WHERE id = ?`,
      )
      .get(id) as {
        id: string;
        display_name: string;
        level: number;
        xp: number;
        gold: number;
      } | undefined;

    if (!row) return null;

    return {
      id: row.id,
      displayName: row.display_name,
      level: row.level,
      totalXp: row.xp,
      gold: row.gold,
    };
  }

  /**
   * Aplica XP a um personagem e retorna o resultado da operação.
   *
   * Calcula o novo nível automaticamente usando getProgress() do shared.
   * Atualiza xp, level e last_ping_at no banco atomicamente.
   *
   * ATENÇÃO: este método NÃO é chamado ainda — está preparado para M-008+
   * quando o XPSystem assumir o controle oficial da progressão.
   */
  async applyXP(
    characterId: string,
    amount: number,
    timestamp: number,
  ): Promise<XPResult> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000); // converte ms para unix seconds

    const current = db
      .prepare("SELECT xp, level FROM characters WHERE id = ?")
      .get(characterId) as { xp: number; level: number } | undefined;

    if (!current) {
      throw new Error(`CharacterRepository: character ${characterId} not found`);
    }

    const oldLevel = current.level;
    const newTotalXp = current.xp + amount;
    const progress = getProgress(newTotalXp);
    const newLevel = progress.level;

    db.prepare(
      `UPDATE characters
       SET xp = ?, level = ?, last_ping_at = ?, updated_at = ?
       WHERE id = ?`,
    ).run(newTotalXp, newLevel, now, now, characterId);

    return {
      characterId,
      xpGained: amount,
      newTotalXp,
      oldLevel,
      newLevel,
      leveledUp: newLevel > oldLevel,
    };
  }

  /**
   * Incrementa o total de minutos assistidos de um personagem.
   *
   * ATENÇÃO: este método NÃO é chamado ainda — está preparado para M-008+
   */
  async addMinutesWatched(
    characterId: string,
    minutes: number,
  ): Promise<void> {
    getDb()
      .prepare(
        `UPDATE characters
         SET total_minutes = total_minutes + ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(minutes, nowUnix(), characterId);
  }
}
