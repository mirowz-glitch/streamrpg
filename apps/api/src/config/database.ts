import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "./env.js";
import { SCHEMA } from "./schema.js";

let db: DatabaseSync | null = null;

/**
 * Migrações idempotentes de schema.
 *
 * Cada migração verifica se já foi aplicada antes de rodar,
 * usando PRAGMA table_info para checar existência de colunas.
 * Seguro rodar em todo boot — só executa de fato na primeira vez.
 */
function runMigrations(database: DatabaseSync): void {
  const columns = database
    .prepare("PRAGMA table_info(characters)")
    .all() as Array<{ name: string }>;

  const hasWelcomeColumn = columns.some(
    (col) => col.name === "first_join_reward_at",
  );

  if (!hasWelcomeColumn) {
    database.exec(
      "ALTER TABLE characters ADD COLUMN first_join_reward_at INTEGER",
    );
    // Popula personagens já existentes para que NÃO recebam a
    // Welcome Reward retroativamente — só quem se cadastrar depois
    // desta migração terá first_join_reward_at = NULL na criação.
    database.exec(
      `UPDATE characters SET first_join_reward_at = strftime('%s','now') WHERE first_join_reward_at IS NULL`,
    );
    console.log(
      "[Migration] first_join_reward_at adicionada e populada para personagens existentes.",
    );
  }
}

export function getDb(): DatabaseSync {
  if (!db) {
    mkdirSync(dirname(env.dbPath), { recursive: true });
    db = new DatabaseSync(env.dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(SCHEMA);
    runMigrations(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
