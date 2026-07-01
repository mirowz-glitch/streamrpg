/**
 * SQLiteItemRepository — Sprint D1
 *
 * Implementação concreta do ItemRepository usando SQLite.
 *
 * Esta classe apenas consulta e persiste dados de itens — nenhuma
 * regra de jogo (chance de drop, seleção de raridade) vive aqui.
 * Quem chama já decide a raridade e o personagem; este Repository
 * só sabe responder "existe um item elegível?" e "conceda este item".
 *
 * Isolada, sem consumidores nesta Sprint.
 */
import { getDb } from "../config/database.js";
import type {
  ItemRepository,
  ItemSnapshot,
  GrantedItem,
} from "../engine/types.js";

export class SQLiteItemRepository implements ItemRepository {
  /**
   * Busca um item elegível aleatório para a raridade e nível informados.
   * Retorna null se não houver nenhum item ativo elegível.
   */
  async findEligible(
    rarity: string,
    characterLevel: number,
  ): Promise<ItemSnapshot | null> {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT id, slug, name, rarity, slot, min_level
         FROM items
         WHERE rarity = ? AND min_level <= ? AND is_active = 1
         ORDER BY RANDOM() LIMIT 1`,
      )
      .get(rarity, characterLevel) as {
        id: number;
        slug: string;
        name: string;
        rarity: string;
        slot: string;
        min_level: number;
      } | undefined;

    if (!row) return null;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      rarity: row.rarity,
      slot: row.slot,
      minLevel: row.min_level,
    };
  }

  /**
   * Concede um item a um personagem. obtained_at é preenchido pelo
   * DEFAULT do schema (strftime('%s','now')) — nenhum timestamp
   * explícito é passado ou controlado por este método.
   */
  async grantToCharacter(
    characterId: string,
    itemId: number,
    channelId: string,
  ): Promise<GrantedItem> {
    const db = getDb();

    const result = db
      .prepare(
        `INSERT INTO character_items (character_id, item_id, obtained_channel_id)
         VALUES (?, ?, ?)`,
      )
      .run(characterId, itemId, channelId);

    const row = db
      .prepare(
        `SELECT ci.id AS character_item_id, ci.obtained_at,
                i.id AS item_id, i.slug, i.name, i.rarity, i.slot, i.min_level
         FROM character_items ci
         JOIN items i ON i.id = ci.item_id
         WHERE ci.id = ?`,
      )
      .get(result.lastInsertRowid) as {
        character_item_id: number;
        obtained_at: number;
        item_id: number;
        slug: string;
        name: string;
        rarity: string;
        slot: string;
        min_level: number;
      } | undefined;

    if (!row) {
      throw new Error(`ItemRepository: falha ao ler item recém-concedido para personagem ${characterId}`);
    }

    return {
      characterItemId: row.character_item_id,
      item: {
        id: row.item_id,
        slug: row.slug,
        name: row.name,
        rarity: row.rarity,
        slot: row.slot,
        minLevel: row.min_level,
      },
      obtainedAt: row.obtained_at,
    };
  }
}
