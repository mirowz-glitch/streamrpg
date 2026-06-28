import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { env } from "./env.js";
import { SCHEMA } from "./schema.js";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    mkdirSync(dirname(env.dbPath), { recursive: true });
    db = new DatabaseSync(env.dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(SCHEMA);
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
