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
  const characterColumns = database
    .prepare("PRAGMA table_info(characters)")
    .all() as Array<{ name: string }>;

  const hasWelcomeColumn = characterColumns.some(
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

  // Sprint Character Attributes Schema — SUS ainda não tem de onde ser
  // derivado (Classe não existe, capítulo 4 da Bible ainda Placeholder;
  // Combat Model já decidiu que equipamento não contribui para SUS no
  // MVP). Placeholder explícito em 0 até Classes existir e poder
  // sobrescrever este valor — nunca fica implícito.
  const hasSusColumn = characterColumns.some((col) => col.name === "sus_base");
  if (!hasSusColumn) {
    database.exec(
      "ALTER TABLE characters ADD COLUMN sus_base INTEGER NOT NULL DEFAULT 0",
    );
    console.log("[Migration] characters.sus_base adicionada (default 0, placeholder até Classes existir).");
  }

  const itemColumns = database
    .prepare("PRAGMA table_info(items)")
    .all() as Array<{ name: string }>;

  // damage_type: mesma coluna serve dois papéis, pelo mesmo motivo (tipo
  // elemental do item) — em armas, decide se o ATQ é físico ou mágico; em
  // armadura/elmo/botas/amuleto/anel, decide se a Resistência que o item
  // concede é física ou mágica. Default 'physical' para todo o catálogo
  // existente — nenhum item de hoje foi desenhado como mágico, então isso
  // não muda nenhum comportamento atual, só abre o campo para itens novos.
  const hasDamageType = itemColumns.some((col) => col.name === "damage_type");
  if (!hasDamageType) {
    database.exec(
      "ALTER TABLE items ADD COLUMN damage_type TEXT NOT NULL DEFAULT 'physical' CHECK (damage_type IN ('physical', 'magic'))",
    );
    console.log("[Migration] items.damage_type adicionada (default 'physical').");
  }

  // uti_bonus: contribuição bruta de UTI de um item equipado, somada em
  // runtime entre todos os itens equipados. Default 0 — nenhum valor de
  // calibração foi decidido nesta Sprint (é infraestrutura, não balanço).
  const hasUtiBonus = itemColumns.some((col) => col.name === "uti_bonus");
  if (!hasUtiBonus) {
    database.exec(
      "ALTER TABLE items ADD COLUMN uti_bonus INTEGER NOT NULL DEFAULT 0",
    );
    console.log("[Migration] items.uti_bonus adicionada (default 0).");
  }

  // Sprint Encounter System — o Encounter atual de uma expedição é só
  // texto + categoria + ícone, nunca uma recompensa: nenhuma tabela nova,
  // só duas colunas a mais na expedição já existente (mesma disciplina de
  // "sem banco complexo" pedida na Sprint). `current_event` (já existente)
  // continua sendo o texto narrativo; category/icon são novos.
  const expeditionColumns = database
    .prepare("PRAGMA table_info(expeditions)")
    .all() as Array<{ name: string }>;

  const hasEncounterCategory = expeditionColumns.some((col) => col.name === "current_encounter_category");
  if (!hasEncounterCategory) {
    database.exec("ALTER TABLE expeditions ADD COLUMN current_encounter_category TEXT");
    console.log("[Migration] expeditions.current_encounter_category adicionada.");
  }

  const hasEncounterIcon = expeditionColumns.some((col) => col.name === "current_encounter_icon");
  if (!hasEncounterIcon) {
    database.exec("ALTER TABLE expeditions ADD COLUMN current_encounter_icon TEXT");
    console.log("[Migration] expeditions.current_encounter_icon adicionada.");
  }

  // Sprint Expedition Choice Phase III — Meaningful Consequences. NULL
  // até o jogador escolher uma abordagem (Investigar/Seguir em Frente)
  // durante Exploring+Descoberta; usada só para enviesar levemente a
  // geração de Encounters (ExpeditionSystem.getApproachWeight) — nunca
  // uma recompensa, nunca XP/Gold/Item.
  const hasApproach = expeditionColumns.some((col) => col.name === "approach");
  if (!hasApproach) {
    database.exec("ALTER TABLE expeditions ADD COLUMN approach TEXT");
    console.log("[Migration] expeditions.approach adicionada.");
  }

  // Sprint Founder Identity & Prestige — só o título/moldura *equipado*
  // vive em characters (um de cada por vez, igual a equipped_items por
  // slot); a lista de desbloqueados vive em character_titles/
  // character_frames. Default NULL — nenhum personagem já existente
  // ganha um título retroativamente só por esta migração rodar.
  const hasEquippedTitle = characterColumns.some((col) => col.name === "equipped_title_id");
  if (!hasEquippedTitle) {
    database.exec("ALTER TABLE characters ADD COLUMN equipped_title_id INTEGER REFERENCES titles(id)");
    console.log("[Migration] characters.equipped_title_id adicionada.");
  }

  const hasEquippedFrame = characterColumns.some((col) => col.name === "equipped_frame_id");
  if (!hasEquippedFrame) {
    database.exec("ALTER TABLE characters ADD COLUMN equipped_frame_id INTEGER REFERENCES frames(id)");
    console.log("[Migration] characters.equipped_frame_id adicionada.");
  }

  // Sprint First 120 Seconds — mesmo padrão de first_join_reward_at:
  // concessão única (item inicial equipado + XP), reivindicada de forma
  // atômica pelo FirstItemQuestSystem. NULL para personagens já
  // existentes — não concede o item/XP retroativamente, só para quem
  // for criado depois desta migração.
  const hasFirstItemQuest = characterColumns.some((col) => col.name === "first_item_quest_completed_at");
  if (!hasFirstItemQuest) {
    database.exec("ALTER TABLE characters ADD COLUMN first_item_quest_completed_at INTEGER");
    database.exec(
      `UPDATE characters SET first_item_quest_completed_at = strftime('%s','now') WHERE first_item_quest_completed_at IS NULL`,
    );
    console.log(
      "[Migration] first_item_quest_completed_at adicionada e populada para personagens existentes.",
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
