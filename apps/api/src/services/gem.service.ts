import type { DatabaseSync } from "node:sqlite";
import {
  EquipmentLockError,
  appendGemHistoryEvent,
  createGemHistory,
  setSocketState,
  resolveGemDisplayName,
  resolveGemEffectForGemType,
  EXAMPLE_GEM_DEFINITION_REGISTRY,
  EXAMPLE_GEM_EFFECT_REGISTRY,
  type Gem,
  type GemHistory,
  type GemQuality,
  type GemTier,
  type GemType,
  type SocketConfiguration,
} from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import { equipmentLock } from "./equipmentLock.service.js";

/**
 * Sprint 15 — Sockets + Gem System (Foundation). Orquestrador único de
 * inserção/remoção/troca de Gema — mesmo padrão de sphere.service.ts
 * (posse → validação → transação SQL única → histórico append-only).
 *
 * "Gemas... nunca alteram a identidade do Item" — nenhuma função aqui
 * toca `affixes`/`power_score`/`rarity`; só `items.sockets` (o ESTADO
 * dos Sockets: vazio/preenchido) e a própria linha de `gems`.
 *
 * "Não implementar: efeitos das Gemas, XP, Level" — `level`/
 * `experience` são colunas persistidas (Fase 6), mas NENHUMA função
 * aqui as lê ou escreve além do valor inicial de criação.
 */

export type SocketGemFailureReason =
  | "item-not-found"
  | "gem-not-found"
  | "gem-not-owned"
  | "socket-not-found"
  | "socket-occupied"
  | "no-sockets-on-item"
  | "item-locked";

export interface SocketGemSuccess {
  success: true;
  gem: Gem;
}
export type SocketGemResult = SocketGemSuccess | { success: false; reason: SocketGemFailureReason };

interface GemRow {
  id: number;
  character_id: string;
  gem_type: string;
  tier: number;
  quality: string;
  level: number;
  experience: number;
  history: string;
  socketed_item_id: number | null;
  socketed_socket_id: string | null;
}

function mapGemRow(row: GemRow): Gem {
  return {
    id: row.id,
    characterId: row.character_id,
    gemType: row.gem_type as GemType,
    tier: row.tier as GemTier,
    quality: JSON.parse(row.quality) as GemQuality,
    level: row.level,
    experience: row.experience,
    history: JSON.parse(row.history) as GemHistory,
    socketedItemId: row.socketed_item_id,
    socketedSocketId: row.socketed_socket_id,
  };
}

/** Todas as Gemas do personagem — socketadas e soltas. */
export function listCharacterGems(characterId: string): Gem[] {
  const rows = getDb().prepare(`SELECT * FROM gems WHERE character_id = ? ORDER BY created_at DESC`).all(characterId) as Record<string, unknown>[];
  return rows.map((row) => mapGemRow(row as unknown as GemRow));
}

/**
 * Sprint 20 — Fase 10: nome da Gema por Socket, pra UI mínima
 * ("Sockets vazios, Sockets ocupados, nome da Gema" — brief). Chamada
 * só quando o item já tem ao menos um Socket `filled` (ver
 * `drop.service.ts`) — evita 1 query por item pra a esmagadora maioria
 * (itens sem Socket ocupado algum).
 */
export function getSocketGemDisplayNames(itemId: number): Record<string, string> {
  const rows = getDb()
    .prepare(`SELECT gem_type, socketed_socket_id FROM gems WHERE socketed_item_id = ? AND socketed_socket_id IS NOT NULL`)
    .all(itemId) as { gem_type: string; socketed_socket_id: string }[];
  const names: Record<string, string> = {};
  for (const row of rows) {
    names[row.socketed_socket_id] = resolveGemDisplayName(EXAMPLE_GEM_DEFINITION_REGISTRY, row.gem_type);
  }
  return names;
}

/**
 * Sprint 21 — Gem Effects Phase I, Fase 5: mesma consulta de
 * `getSocketGemDisplayNames`, mas devolve o `gemType` CRU (não o nome
 * de exibição) — é isso que `resolveActiveGemEffects()` (packages/shared)
 * precisa pra encontrar a `GemDefinition`/`GemEffect` correspondente.
 * Nunca duplica a query — `getSocketGemDisplayNames` continua existindo
 * separado porque resolve pra um vocabulário diferente (nome, não id).
 */
export function getSocketGemTypes(itemId: number): Record<string, string> {
  const rows = getDb()
    .prepare(`SELECT gem_type, socketed_socket_id FROM gems WHERE socketed_item_id = ? AND socketed_socket_id IS NOT NULL`)
    .all(itemId) as { gem_type: string; socketed_socket_id: string }[];
  const types: Record<string, string> = {};
  for (const row of rows) {
    types[row.socketed_socket_id] = row.gem_type;
  }
  return types;
}

/**
 * Sprint 21 — Fase 8: descrição do efeito por Socket, pra UI mínima
 * ("Na Gema: Ataque +5%"). Reaproveita `getSocketGemTypes()` +
 * `resolveGemEffectForGemType()` (o MESMO Resolver usado pra
 * `resolvedStats`/`activeGemEffects` do Character — nunca uma segunda
 * regra de "esta Gema tem efeito?").
 */
export function getSocketGemEffectDescriptions(itemId: number): Record<string, string> {
  const gemTypes = getSocketGemTypes(itemId);
  const descriptions: Record<string, string> = {};
  for (const [socketId, gemType] of Object.entries(gemTypes)) {
    const effect = resolveGemEffectForGemType(EXAMPLE_GEM_DEFINITION_REGISTRY, EXAMPLE_GEM_EFFECT_REGISTRY, gemType);
    if (effect) descriptions[socketId] = effect.description;
  }
  return descriptions;
}

/**
 * QA-only — nunca chamada por nenhuma rota HTTP real. "Nenhuma Gema
 * poderosa será criada" nesta Sprint — nenhum fluxo real de drop/craft
 * concede Gemas ainda. Mesmo princípio de `grantSphereForTesting()`
 * (sphere.service.ts, Sprint 12) e `scripts/qaGrantSpheres.ts`.
 */
export function createGemForTesting(characterId: string, gemType: GemType, tier: GemTier = 1): Gem {
  const nowIso = new Date().toISOString();
  const history = createGemHistory(characterId, nowIso);
  const quality: GemQuality = { value: 0 };
  const result = getDb()
    .prepare(
      `INSERT INTO gems (character_id, gem_type, tier, quality, level, experience, history)
       VALUES (?, ?, ?, ?, 1, 0, ?)`,
    )
    .run(characterId, gemType, tier, JSON.stringify(quality), JSON.stringify(history));
  return {
    id: Number(result.lastInsertRowid),
    characterId,
    gemType,
    tier,
    quality,
    level: 1,
    experience: 0,
    history,
    socketedItemId: null,
    socketedSocketId: null,
  };
}

function getItemSocketsInTransaction(db: DatabaseSync, itemId: number): SocketConfiguration | null {
  const row = db.prepare(`SELECT sockets FROM items WHERE id = ?`).get(itemId) as { sockets: string | null } | undefined;
  if (!row || !row.sockets) return null;
  return JSON.parse(row.sockets) as SocketConfiguration;
}

/**
 * Fase 5/6/7 — insere (ou TROCA, se a Gema já estava socketada em outro
 * lugar) uma Gema num Socket vazio de um item que o personagem possui.
 * Sem efeito algum concedido — só persistência (estado do Socket +
 * histórico da Gema). Mesmo Equipment Lock do Blacksmith/Merchant/
 * AutoEquip (reaproveitado, "diretriz permanente": nunca duplicar
 * infraestrutura) — protege contra o item ser vendido/melhorado no
 * meio da troca.
 */
export function socketGem(characterId: string, gemId: number, characterItemId: number, socketId: string): SocketGemResult {
  try {
    return equipmentLock.withLock(characterItemId, "gem:socket", () => {
      const db = getDb();

      const itemRow = db
        .prepare(`SELECT item_id FROM character_items WHERE id = ? AND character_id = ?`)
        .get(characterItemId, characterId) as { item_id: number } | undefined;
      if (!itemRow) return { success: false, reason: "item-not-found" };

      const gemRow = db.prepare(`SELECT * FROM gems WHERE id = ? AND character_id = ?`).get(gemId, characterId) as GemRow | undefined;
      if (!gemRow) return { success: false, reason: "gem-not-owned" };

      const sockets = getItemSocketsInTransaction(db, itemRow.item_id);
      if (!sockets || sockets.sockets.length === 0) return { success: false, reason: "no-sockets-on-item" };
      const targetSocket = sockets.sockets.find((s) => s.id === socketId);
      if (!targetSocket) return { success: false, reason: "socket-not-found" };
      if (targetSocket.state === "filled") return { success: false, reason: "socket-occupied" };

      const nowIso = new Date().toISOString();
      const wasSocketedElsewhere = gemRow.socketed_item_id !== null && gemRow.socketed_item_id !== itemRow.item_id;
      const detail = `item:${itemRow.item_id},socket:${socketId}`;
      let history = JSON.parse(gemRow.history) as GemHistory;
      history = appendGemHistoryEvent(history, wasSocketedElsewhere ? "swapped" : "socketed", characterId, detail, nowIso);

      db.exec("BEGIN");
      try {
        // Se a Gema já estava socketada em OUTRO item, esvazia o Socket
        // antigo primeiro — uma Gema nunca ocupa dois Sockets ao mesmo
        // tempo, "Podem sair. Podem ser substituídas." (filosofia).
        if (gemRow.socketed_item_id !== null && gemRow.socketed_socket_id !== null && wasSocketedElsewhere) {
          const oldSockets = getItemSocketsInTransaction(db, gemRow.socketed_item_id);
          if (oldSockets) {
            const cleared = setSocketState(oldSockets, gemRow.socketed_socket_id, "empty");
            db.prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(cleared), gemRow.socketed_item_id);
          }
        }

        const filled = setSocketState(sockets, socketId, "filled");
        db.prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(filled), itemRow.item_id);
        db.prepare(`UPDATE gems SET socketed_item_id = ?, socketed_socket_id = ?, history = ? WHERE id = ?`).run(
          itemRow.item_id,
          socketId,
          JSON.stringify(history),
          gemId,
        );
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }

      return {
        success: true,
        gem: mapGemRow({ ...gemRow, socketed_item_id: itemRow.item_id, socketed_socket_id: socketId, history: JSON.stringify(history) }),
      };
    });
  } catch (error) {
    if (error instanceof EquipmentLockError) return { success: false, reason: "item-locked" };
    throw error;
  }
}

export type UnsocketGemFailureReason = "gem-not-owned" | "gem-not-socketed" | "item-locked";
export interface UnsocketGemSuccess {
  success: true;
  gem: Gem;
}
export type UnsocketGemResult = UnsocketGemSuccess | { success: false; reason: UnsocketGemFailureReason };

/** Fase 5/6/7 — remove uma Gema do Socket que ela ocupa, ela volta a ficar solta na posse do personagem. */
export function unsocketGem(characterId: string, gemId: number): UnsocketGemResult {
  const db = getDb();
  const gemRow = db.prepare(`SELECT * FROM gems WHERE id = ? AND character_id = ?`).get(gemId, characterId) as GemRow | undefined;
  if (!gemRow) return { success: false, reason: "gem-not-owned" };
  if (gemRow.socketed_item_id === null || gemRow.socketed_socket_id === null) return { success: false, reason: "gem-not-socketed" };

  try {
    return equipmentLock.withLock(gemRow.socketed_item_id, "gem:unsocket", () => {
      const nowIso = new Date().toISOString();
      const detail = `item:${gemRow.socketed_item_id},socket:${gemRow.socketed_socket_id}`;
      const history = appendGemHistoryEvent(JSON.parse(gemRow.history) as GemHistory, "unsocketed", characterId, detail, nowIso);

      db.exec("BEGIN");
      try {
        const sockets = getItemSocketsInTransaction(db, gemRow.socketed_item_id!);
        if (sockets) {
          const cleared = setSocketState(sockets, gemRow.socketed_socket_id!, "empty");
          db.prepare(`UPDATE items SET sockets = ? WHERE id = ?`).run(JSON.stringify(cleared), gemRow.socketed_item_id);
        }
        db.prepare(`UPDATE gems SET socketed_item_id = NULL, socketed_socket_id = NULL, history = ? WHERE id = ?`).run(
          JSON.stringify(history),
          gemId,
        );
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }

      return { success: true, gem: mapGemRow({ ...gemRow, socketed_item_id: null, socketed_socket_id: null, history: JSON.stringify(history) }) };
    });
  } catch (error) {
    if (error instanceof EquipmentLockError) return { success: false, reason: "item-locked" };
    throw error;
  }
}

/**
 * Sprint 15 — Fase 10 (Compatibilidade). Chamada por Merchant/Salvage
 * ANTES de `removeItem()` remover a posse — mesmo princípio já usado
 * pela Sprint 14 para "sold"/"salvaged" no Item History: uma Gema
 * nunca pode ficar socketada num item que o personagem não possui
 * mais. Devolve a(s) Gema(s) pra posse solta do personagem (nunca as
 * apaga — "Gemas... nunca alteram a identidade do Item", e o inverso
 * também vale: o item nunca leva a Gema junto pra sua remoção da
 * mochila). Não altera Economia (gold/materiais) — só bookkeeping do
 * sistema de Gemas.
 */
export function unsocketAllGemsForItem(itemId: number, reason: "sold" | "salvaged"): void {
  const db = getDb();
  const gemRows = (db.prepare(`SELECT * FROM gems WHERE socketed_item_id = ?`).all(itemId) as Record<string, unknown>[]).map(
    (row) => row as unknown as GemRow,
  );
  if (gemRows.length === 0) return;

  const nowIso = new Date().toISOString();
  for (const gemRow of gemRows) {
    const history = appendGemHistoryEvent(
      JSON.parse(gemRow.history) as GemHistory,
      "unsocketed",
      gemRow.character_id,
      `item:${itemId},reason:${reason}`,
      nowIso,
    );
    db.prepare(`UPDATE gems SET socketed_item_id = NULL, socketed_socket_id = NULL, history = ? WHERE id = ?`).run(
      JSON.stringify(history),
      gemRow.id,
    );
  }
}
