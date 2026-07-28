import { randomUUID } from "node:crypto";
import type { DamageType, InventoryItem, ItemRarity, ItemSlot } from "@streamrpg/shared";
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
    // Blacksmith Phase I — coluna já existente (Item Generator), agora
    // exposta pela API.
    power_score: (row.power_score as number | null | undefined) ?? null,
    upgrade_level: (row.upgrade_level as number | undefined) ?? 0,
  };
}

export function listInventory(characterId: string): InventoryItem[] {
  const rows = getDb()
    .prepare(
      `SELECT ci.id, ci.item_id, ci.obtained_at, i.slug, i.name, i.description, i.rarity, i.slot, i.min_level,
              i.damage_type, i.uti_bonus, i.power_score, i.upgrade_level,
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

// Vertical Slice — Persistent Player Experience Phase I — a Aventura
// (packages/shared: Item Generator, protegido/intocado nesta Sprint)
// gera itens por `baseItemId` procedural (rarity/slot num vocabulário
// próprio, ver itemgen/) — diferente do catálogo fixo que este serviço
// já gerenciava. Em vez de um catálogo paralelo (proibido: "não criar
// novos sistemas"), cada item encontrado vira uma linha NOVA nesta
// MESMA tabela `items` (slug único por instância, já que cada rolagem
// procedural é única) — dali em diante é um item de catálogo comum,
// gerenciado pelos MESMOS equipItem/listInventory/unequipItem de
// sempre, nenhuma lógica de equipar/desequipar nova.
export interface AdventureLootInput {
  baseItemId: string;
  name: string;
  rarity: string;
  slot: string;
  powerScore: number;
}

export function grantAdventureLoot(characterId: string, channelId: string | null, loot: AdventureLootInput): InventoryItem {
  const db = getDb();
  const slug = `adventure-${loot.baseItemId}-${randomUUID()}`;
  const insert = db
    .prepare(
      `INSERT INTO items (slug, name, description, rarity, slot, min_level, base_item_id, power_score)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(slug, loot.name, "", loot.rarity, loot.slot, loot.baseItemId, loot.powerScore);
  const itemId = Number(insert.lastInsertRowid);

  const characterItem = db
    .prepare(
      `INSERT INTO character_items (character_id, item_id, obtained_channel_id, obtained_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(characterId, itemId, channelId, nowUnix());
  const characterItemId = Number(characterItem.lastInsertRowid);

  const item = listInventory(characterId).find((i) => i.id === characterItemId);
  if (!item) {
    throw new Error("Failed to grant adventure loot");
  }
  return item;
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

// Merchant Phase I — Fase 3/4/5: remove um item da mochila do jogador —
// mesmo sistema de inventário de sempre (character_items), nenhuma
// tabela/lógica nova. Quem chama isto (merchant.service.ts) já validou
// posse/estado do item antes; esta função só garante, na própria query,
// que o item pertence ao personagem informado (defesa em profundidade,
// nunca confia só na validação de quem chamou). Não apaga a linha de
// `items` (o catálogo procedural) — cada item da Aventura já é uma
// linha única (grantAdventureLoot), removê-la deixaria órfã pra sempre
// qualquer referência futura de auditoria; a linha órfã em `items` é
// dado morto inofensivo, não um bug (ver docs/design/merchant-phase1.md
// "Problemas Encontrados").
export function removeItem(characterId: string, characterItemId: number): void {
  const db = getDb();
  db.prepare("DELETE FROM equipped_items WHERE character_id = ? AND character_item_id = ?").run(
    characterId,
    characterItemId,
  );
  const result = db
    .prepare("DELETE FROM character_items WHERE id = ? AND character_id = ?")
    .run(characterItemId, characterId);
  if (result.changes === 0) {
    throw new Error("Item not found in inventory");
  }
}

export function getEquippedItems(characterId: string) {
  return getDb()
    .prepare(
      `SELECT e.slot, e.character_item_id, i.name, i.rarity, i.damage_type, i.uti_bonus,
              i.min_level, i.power_score, i.upgrade_level
       FROM equipped_items e
       JOIN character_items ci ON ci.id = e.character_item_id
       JOIN items i ON i.id = ci.item_id
       WHERE e.character_id = ?`,
    )
    .all(characterId) as Array<{
      slot: ItemSlot;
      character_item_id: number;
      name: string;
      rarity: ItemRarity;
      damage_type: DamageType;
      uti_bonus: number;
      min_level: number;
      power_score: number | null;
      upgrade_level: number;
    }>;
}

// Blacksmith Phase I — Fase 6: única função que escreve o novo estado de
// um item melhorado. Nenhuma regra de upgrade vive aqui — quem chama já
// calculou `newPowerScore`/`newUpgradeLevel` (packages/shared, função
// pura). Esta camada só executa a escrita, dentro da transação aberta
// pelo blacksmith.service.ts (mesmo padrão de removeItem/ADR-0001).
export function applyItemUpgrade(
  characterId: string,
  characterItemId: number,
  newPowerScore: number,
  newUpgradeLevel: number,
): void {
  const db = getDb();
  const owned = db
    .prepare(
      `SELECT ci.item_id FROM character_items ci
       WHERE ci.id = ? AND ci.character_id = ?`,
    )
    .get(characterItemId, characterId) as { item_id: number } | undefined;
  if (!owned) {
    throw new Error("Item not found in inventory");
  }
  db.prepare("UPDATE items SET power_score = ?, upgrade_level = ? WHERE id = ?").run(
    newPowerScore,
    newUpgradeLevel,
    owned.item_id,
  );
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
