/**
 * Real Estate — Sprint Real Estate Phase I (Vision 2.0, Sprint 6)
 *
 * O Mercado Imobiliário do Reino (docs/design/real-estate.md). Uma Casa
 * (Housing Phase I) passa a poder trocar de proprietário através de uma
 * venda real entre jogadores — o primeiro fluxo verdadeiramente
 * peer-to-peer do Economy Core: até aqui, Merchant/Blacksmith/Salvage
 * sempre moviam Gold entre um personagem e "o sistema" (venda a NPC,
 * upgrade); aqui o Gold sai de um personagem e entra em outro real.
 *
 * Nenhum imposto, leilão automático, abandono ou tomada pelo Reino —
 * tudo isso é escopo de Sprints futuras (Kingdom Treasury, ver
 * docs/design/new-roadmap.md). `buyHouse` nunca altera `houses`
 * diretamente — sempre delega a `transferOwnership()` (Housing Phase I),
 * per Fase 4 do brief ("nunca duplicar regra"). Todo movimento de Gold
 * passa pelo Transaction Layer do Economy Core (`debit/creditCharacter
 * ResourceInTransaction`) — nunca um UPDATE direto de `characters.gold`.
 */
import { randomUUID } from "node:crypto";
import type { HouseSale, HouseSaleStatus } from "@streamrpg/shared";
import { getDb, nowUnix } from "../config/database.js";
import {
  creditCharacterResourceInTransaction,
  debitCharacterResourceInTransaction,
  getCharacterResourceBalance,
} from "./economy.service.js";
import { getHouse, transferOwnership } from "./housing.service.js";
import { pushActivityFeedEntry } from "./activityFeed.service.js";

interface HouseSaleRow {
  id: string;
  house_id: string;
  seller_character_id: string;
  asking_price: number;
  created_at: number;
  status: HouseSaleStatus;
  buyer_character_id: string | null;
  sold_at: number | null;
  house_name: string;
  kingdom_name: string;
  seller_display_name: string;
}

// house_name/kingdom_name/seller_display_name nunca são colunas de
// `house_sales` — sempre derivados aqui via join (mesmo padrão de
// House/Citizen).
const SELECT_SALE = `
  SELECT
    s.id, s.house_id, s.seller_character_id, s.asking_price, s.created_at, s.status,
    s.buyer_character_id, s.sold_at,
    h.name AS house_name,
    k.name AS kingdom_name,
    seller.display_name AS seller_display_name
  FROM house_sales s
  JOIN houses h ON h.id = s.house_id
  JOIN kingdoms k ON k.id = h.kingdom_id
  JOIN characters seller ON seller.id = s.seller_character_id
`;

function toSale(row: HouseSaleRow): HouseSale {
  return {
    id: row.id,
    house_id: row.house_id,
    seller_character_id: row.seller_character_id,
    asking_price: row.asking_price,
    created_at: new Date(row.created_at * 1000).toISOString(),
    status: row.status,
    buyer_character_id: row.buyer_character_id,
    sold_at: row.sold_at ? new Date(row.sold_at * 1000).toISOString() : null,
    house_name: row.house_name,
    kingdom_name: row.kingdom_name,
    seller_display_name: row.seller_display_name,
  };
}

function getRowById(id: string): HouseSaleRow | undefined {
  return getDb().prepare(`${SELECT_SALE} WHERE s.id = ?`).get(id) as unknown as HouseSaleRow | undefined;
}

export type CreateSaleResult =
  | { success: true; sale: HouseSale }
  | { success: false; reason: "house-not-found" | "not-the-owner" | "invalid-price" | "already-listed" };

/** Anuncia uma Casa à venda. Só o proprietário atual pode anunciar. */
export function createSale(sellerCharacterId: string, houseId: string, askingPrice: number): CreateSaleResult {
  const house = getHouse(houseId);
  if (!house) return { success: false, reason: "house-not-found" };
  if (house.current_owner_character_id !== sellerCharacterId) return { success: false, reason: "not-the-owner" };
  if (!Number.isFinite(askingPrice) || askingPrice <= 0) return { success: false, reason: "invalid-price" };

  const db = getDb();
  const existingActive = db
    .prepare(`SELECT id FROM house_sales WHERE house_id = ? AND status = 'active'`)
    .get(houseId);
  if (existingActive) return { success: false, reason: "already-listed" };

  const id = randomUUID();
  db.prepare(
    `INSERT INTO house_sales (id, house_id, seller_character_id, asking_price, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(id, houseId, sellerCharacterId, askingPrice, nowUnix());

  const row = getRowById(id);
  return { success: true, sale: toSale(row as HouseSaleRow) };
}

export type CancelSaleResult =
  | { success: true }
  | { success: false; reason: "sale-not-found" | "not-the-seller" | "not-active" };

/** Retira um anúncio. Só o vendedor original pode cancelar. */
export function cancelSale(callerCharacterId: string, saleId: string): CancelSaleResult {
  const row = getRowById(saleId);
  if (!row) return { success: false, reason: "sale-not-found" };
  if (row.seller_character_id !== callerCharacterId) return { success: false, reason: "not-the-seller" };
  if (row.status !== "active") return { success: false, reason: "not-active" };

  getDb().prepare(`UPDATE house_sales SET status = 'cancelled' WHERE id = ?`).run(saleId);
  return { success: true };
}

export type BuyHouseResult =
  | { success: true; sale: HouseSale; newBuyerGoldBalance: number }
  | {
      success: false;
      reason: "sale-not-found" | "not-active" | "cannot-buy-own-house" | "debit-rejected";
    };

/**
 * Compra uma Casa anunciada. Um único fluxo atômico: debita o Ouro do
 * comprador, credita o Ouro do vendedor, transfere a posse da Casa
 * (registrando o evento "sold" com o preço no histórico, via
 * `transferOwnership()`) e marca o anúncio como vendido — tudo dentro de
 * UMA transação SQL (mesmo padrão de composição do Blacksmith Service,
 * ADR-0001). Se o débito for rejeitado (saldo insuficiente), nada mais
 * acontece.
 */
export function buyHouse(buyerCharacterId: string, saleId: string): BuyHouseResult {
  const row = getRowById(saleId);
  if (!row) return { success: false, reason: "sale-not-found" };
  if (row.status !== "active") return { success: false, reason: "not-active" };
  if (row.seller_character_id === buyerCharacterId) return { success: false, reason: "cannot-buy-own-house" };

  const db = getDb();
  db.exec("BEGIN");
  try {
    const debitOutcome = debitCharacterResourceInTransaction(
      buyerCharacterId,
      "gold",
      row.asking_price,
      "realestate:buy",
      `house:${row.house_id}`,
    );
    if (debitOutcome.transaction.result !== "success") {
      db.exec("ROLLBACK");
      return { success: false, reason: "debit-rejected" };
    }

    creditCharacterResourceInTransaction(
      row.seller_character_id,
      "gold",
      row.asking_price,
      `house:${row.house_id}`,
      "realestate:sell",
    );

    transferOwnership(row.house_id, buyerCharacterId, { event: "sold", price: row.asking_price });

    db.prepare(
      `UPDATE house_sales SET status = 'sold', buyer_character_id = ?, sold_at = ? WHERE id = ?`,
    ).run(buyerCharacterId, nowUnix(), saleId);

    db.exec("COMMIT");

    // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — Activity
    // Feed: FORA da transação SQL (nunca deve poder fazer um ROLLBACK
    // de ouro/posse por causa de um buffer em memória), mesmo espírito
    // de "efeito colateral read-only, nunca parte da regra de negócio".
    pushActivityFeedEntry("💰", `Uma casa foi comprada por ${row.asking_price} de ouro.`);

    return {
      success: true,
      sale: toSale(getRowById(saleId) as HouseSaleRow),
      newBuyerGoldBalance: getCharacterResourceBalance(buyerCharacterId, "gold"),
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

/** Todos os anúncios ativos, mais recentes primeiro. */
export function listSales(): HouseSale[] {
  const rows = getDb()
    .prepare(`${SELECT_SALE} WHERE s.status = 'active' ORDER BY s.created_at DESC`)
    .all() as unknown as HouseSaleRow[];
  return rows.map(toSale);
}

export function getSale(id: string): HouseSale | null {
  const row = getRowById(id);
  return row ? toSale(row) : null;
}
