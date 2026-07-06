/**
 * SQLiteChronicleRepository — Sprint Kingdom Chronicles (MVP)
 *
 * Implementação concreta do ChronicleRepository. Ao contrário da
 * Timeline/Jornal do Reino (buffers em memória, perdidos a cada reinício
 * do servidor), esta é a única fonte do "Livro" de um personagem —
 * permanente, por design.
 */
import { getDb } from "../config/database.js";
import type { ChronicleEntrySnapshot, ChronicleRepository } from "../engine/types.js";

export class SQLiteChronicleRepository implements ChronicleRepository {
  /**
   * Grava a entrada só se este personagem ainda não tiver nenhuma com
   * este chapterKey — o `WHERE NOT EXISTS` dentro do próprio INSERT
   * fecha a janela de corrida sem precisar de uma segunda checagem
   * (mesmo espírito de markWelcomeRewardGranted, mas sem precisar de uma
   * coluna dedicada por marco: chapterKey já identifica qual é).
   */
  async insertOnce(
    characterId: string,
    chapterKey: string,
    icon: string,
    title: string,
    text: string,
    timestamp: number,
  ): Promise<boolean> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000);
    const result = db
      .prepare(
        `INSERT INTO character_chronicles (character_id, chapter_key, icon, title, text, created_at)
         SELECT ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM character_chronicles WHERE character_id = ? AND chapter_key = ?
         )`,
      )
      .run(characterId, chapterKey, icon, title, text, now, characterId, chapterKey);
    return result.changes > 0;
  }

  async insertAlways(
    characterId: string,
    chapterKey: string,
    icon: string,
    title: string,
    text: string,
    timestamp: number,
  ): Promise<void> {
    const db = getDb();
    const now = Math.floor(timestamp / 1000);
    db.prepare(
      `INSERT INTO character_chronicles (character_id, chapter_key, icon, title, text, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(characterId, chapterKey, icon, title, text, now);
  }

  async listByCharacter(characterId: string): Promise<ChronicleEntrySnapshot[]> {
    const rows = getDb()
      .prepare(
        `SELECT id, chapter_key, icon, title, text, created_at
         FROM character_chronicles
         WHERE character_id = ?
         ORDER BY created_at ASC, id ASC`,
      )
      .all(characterId) as Array<{
        id: number;
        chapter_key: string;
        icon: string;
        title: string;
        text: string;
        created_at: number;
      }>;

    return rows.map((row) => ({
      id: row.id,
      chapterKey: row.chapter_key,
      icon: row.icon,
      title: row.title,
      text: row.text,
      createdAt: row.created_at,
    }));
  }
}
