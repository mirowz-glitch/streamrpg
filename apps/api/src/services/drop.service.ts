import type { DamageType, InventoryItem, ItemSlot } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";

// Exportada para reaproveitamento em xp.service.ts (Sprint Player
// Feedback Bridge) — o mesmo mapeamento de linha, sem duplicar a lógica.
export function mapInventoryRow(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as number,
    item_id: row.item_id as number,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string,
    rarity: row.rarity as InventoryItem["rarity"],
    slot: row.slot as ItemSlot,
    min_level: row.min_level as number,
    is_equipped: Boolean(row.is_equipped),
    equipped_slot: (row.equipped_slot as ItemSlot | null) ?? null,
    obtained_at: new Date((row.obtained_at as number) * 1000).toISOString(),
    // Sprint Equipment Experience — colunas já existentes no banco desde
    // a Sprint Character Attributes Schema, agora expostas pela API.
    damage_type: (row.damage_type as DamageType | undefined) ?? "physical",
    uti_bonus: (row.uti_bonus as number | undefined) ?? 0,
  };
}

export function listInventory(characterId: string): InventoryItem[] {
  const rows = getDb()
    .prepare(
      `SELECT ci.id, ci.item_id, ci.obtained_at, i.slug, i.name, i.description, i.rarity, i.slot, i.min_level,
              i.damage_type, i.uti_bonus,
              CASE WHEN e.character_item_id IS NOT NULL THEN 1 ELSE 0 END AS is_equipped,
              e.slot AS equipped_slot
       FROM character_items ci
       JOIN items i ON i.id = ci.item_id
       LEFT JOIN equipped_items e ON e.character_item_id = ci.id
       WHERE ci.character_id = ?
       ORDER BY ci.obtained_at DESC`,
    )
    .all(characterId) as Record<string, unknown>[];

  return rows.map(mapInventoryRow);
}

export function equipItem(characterId: string, characterItemId: number): InventoryItem {
  const db = getDb();
  const owned = db
    .prepare(
      `SELECT ci.id, ci.character_id, i.slot, i.min_level, c.level
       FROM character_items ci
       JOIN items i ON i.id = ci.item_id
       JOIN characters c ON c.id = ci.character_id
       WHERE ci.id = ? AND ci.character_id = ?`,
    )
    .get(characterItemId, characterId) as
    | { id: number; character_id: string; slot: ItemSlot; min_level: number; level: number }
    | undefined;

  if (!owned) {
    throw new Error("Item not found in inventory");
  }

  if (owned.level < owned.min_level) {
    throw new Error(`Requires level ${owned.min_level}`);
  }

  db.prepare("DELETE FROM equipped_items WHERE character_id = ? AND slot = ?").run(characterId, owned.slot);
  db.prepare(
    `INSERT INTO equipped_items (character_id, slot, character_item_id, equipped_at)
     VALUES (?, ?, ?, ?)`,
  ).run(characterId, owned.slot, characterItemId, nowUnix());

  const item = listInventory(characterId).find((i) => i.id === characterItemId);
  if (!item) {
    throw new Error("Failed to equip item");
  }
  return item;
}

export function unequipItem(characterId: string, slot: ItemSlot): void {
  getDb()
    .prepare("DELETE FROM equipped_items WHERE character_id = ? AND slot = ?")
    .run(characterId, slot);
}

export function getEquippedItems(characterId: string) {
  return getDb()
    .prepare(
      `SELECT e.slot, e.character_item_id, i.name, i.rarity, i.damage_type, i.uti_bonus
       FROM equipped_items e
       JOIN character_items ci ON ci.id = e.character_item_id
       JOIN items i ON i.id = ci.item_id
       WHERE e.character_id = ?`,
    )
    .all(characterId) as Array<{
      slot: ItemSlot;
      character_item_id: number;
      name: string;
      rarity: string;
      damage_type: DamageType;
      uti_bonus: number;
    }>;
}

export function getEquippedWeaponName(characterId: string): string | null {
  const row = getDb()
    .prepare(
      `SELECT i.name FROM equipped_items e
       JOIN character_items ci ON ci.id = e.character_item_id
       JOIN items i ON i.id = ci.item_id
       WHERE e.character_id = ? AND e.slot = 'weapon'`,
    )
    .get(characterId) as { name: string } | undefined;
  return row?.name ?? null;
}
