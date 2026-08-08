/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 8 — World News:
 * um resumo agregado do Mundo inteiro, sempre computado a partir de
 * COUNTs reais nas tabelas já existentes — nunca uma cópia guardada
 * separadamente que poderia dessincronizar. "Automático" do ponto de
 * vista do Jogador (nunca precisa disparar nada, sempre está atual ao
 * consultar `GET /api/world/news`), sem precisar de um job agendado —
 * mesmo princípio de "o Mundo já existe" já usado por WorldPresence
 * (computado sob demanda antes do primeiro tick).
 */
import { getDb } from "../config/database.js";

export interface WorldNews {
  bossesDefeatedTotal: number;
  housesBuiltTotal: number;
  housesSoldTotal: number;
  citizensTotal: number;
  largestKingdom: { name: string; citizenCount: number } | null;
}

export function getWorldNews(): WorldNews {
  const db = getDb();

  const bossesDefeatedTotal = (
    db.prepare(`SELECT COUNT(*) as count FROM bosses WHERE status = 'defeated'`).get() as { count: number }
  ).count;

  const housesBuiltTotal = (db.prepare(`SELECT COUNT(*) as count FROM houses`).get() as { count: number }).count;

  const housesSoldTotal = (
    db.prepare(`SELECT COUNT(*) as count FROM house_sales WHERE status = 'sold'`).get() as { count: number }
  ).count;

  const citizensTotal = (
    db.prepare(`SELECT COUNT(*) as count FROM citizens WHERE status = 'active'`).get() as { count: number }
  ).count;

  const largestKingdomRow = db
    .prepare(
      `SELECT k.name as name, COUNT(c.id) as citizenCount
       FROM kingdoms k
       LEFT JOIN citizens c ON c.kingdom_id = k.id AND c.status = 'active'
       GROUP BY k.id
       ORDER BY citizenCount DESC, k.created_at ASC
       LIMIT 1`,
    )
    .get() as { name: string; citizenCount: number } | undefined;

  return {
    bossesDefeatedTotal,
    housesBuiltTotal,
    housesSoldTotal,
    citizensTotal,
    largestKingdom: largestKingdomRow && largestKingdomRow.citizenCount > 0 ? largestKingdomRow : null,
  };
}
