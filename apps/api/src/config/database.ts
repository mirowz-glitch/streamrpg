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

  // Vertical Slice — Persistent Player Experience Phase I — a Aventura
  // (packages/shared: Item Generator, protegido nesta Sprint) gera itens
  // por `baseItemId` procedural + Power Score, um modelo diferente do
  // catálogo fixo já existente aqui (slug/name/rarity/slot fixos,
  // services/items.service.ts). Em vez de um catálogo paralelo (proibido:
  // "não criar novos sistemas"), cada item encontrado na Aventura vira uma
  // linha NOVA nesta MESMA tabela `items` (mesmo mecanismo de sempre:
  // items -> character_items -> equipped_items) — `base_item_id`/
  // `power_score` só guardam o dado extra que o catálogo fixo não tinha
  // motivo pra ter. NULL para todo o catálogo já existente (nenhum item
  // fixo "ganha" um Power Score retroativamente).
  const itemColumnsV2 = database
    .prepare("PRAGMA table_info(items)")
    .all() as Array<{ name: string }>;

  const hasBaseItemId = itemColumnsV2.some((col) => col.name === "base_item_id");
  if (!hasBaseItemId) {
    database.exec("ALTER TABLE items ADD COLUMN base_item_id TEXT");
    console.log("[Migration] items.base_item_id adicionada.");
  }

  const hasPowerScore = itemColumnsV2.some((col) => col.name === "power_score");
  if (!hasPowerScore) {
    database.exec("ALTER TABLE items ADD COLUMN power_score INTEGER");
    console.log("[Migration] items.power_score adicionada.");
  }

  // Blacksmith Phase I — rastreia quantas vezes um item já foi
  // melhorado (Power Score sozinho não diz "quantas vezes", só "quanto
  // vale agora" — o Ferreiro precisa do contador pra calcular o próximo
  // custo, que cresce a cada melhoria). Default 0 para todo o catálogo
  // existente (nenhum item "nasce" melhorado).
  const hasUpgradeLevel = itemColumnsV2.some((col) => col.name === "upgrade_level");
  if (!hasUpgradeLevel) {
    database.exec("ALTER TABLE items ADD COLUMN upgrade_level INTEGER NOT NULL DEFAULT 0");
    console.log("[Migration] items.upgrade_level adicionada.");
  }

  // Sprint Identity Core (Vision 2.0) — profiles.twitch_id deixa de ser
  // NOT NULL (uma Pessoa não exige mais Twitch para existir). SQLite não
  // suporta ALTER COLUMN DROP NOT NULL — a única forma correta é
  // reconstruir a tabela (padrão documentado do próprio SQLite:
  // CREATE nova → copiar dados → DROP antiga → RENAME). Feito dentro de
  // uma transação, com foreign_keys desligado durante a troca (nenhuma
  // linha filha é tocada — só o nome/definição da tabela pai muda, então
  // isso é seguro; religado logo depois). Idempotente: só roda se a
  // coluna hoje ainda for NOT NULL (PRAGMA table_info.notnull === 1).
  const profileColumns = database
    .prepare("PRAGMA table_info(profiles)")
    .all() as Array<{ name: string; notnull: number }>;
  const twitchIdStillRequired = profileColumns.some(
    (col) => col.name === "twitch_id" && col.notnull === 1,
  );
  if (twitchIdStillRequired) {
    database.exec("PRAGMA foreign_keys = OFF;");
    database.exec("BEGIN TRANSACTION;");
    try {
      database.exec(`
        CREATE TABLE profiles_new (
          id TEXT PRIMARY KEY,
          twitch_id TEXT UNIQUE,
          username TEXT NOT NULL,
          avatar_url TEXT,
          email TEXT,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
          updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
        );
      `);
      database.exec(`
        INSERT INTO profiles_new (id, twitch_id, username, avatar_url, email, created_at, updated_at)
        SELECT id, twitch_id, username, avatar_url, email, created_at, updated_at FROM profiles;
      `);
      database.exec("DROP TABLE profiles;");
      database.exec("ALTER TABLE profiles_new RENAME TO profiles;");
      database.exec("COMMIT;");
      console.log("[Migration] profiles.twitch_id não é mais NOT NULL (rebuild de tabela).");
    } catch (err) {
      database.exec("ROLLBACK;");
      throw err;
    } finally {
      database.exec("PRAGMA foreign_keys = ON;");
    }
  }

  // World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — Offline
  // Summary precisa de um "quando este personagem foi visto pela última
  // vez" independente de Twitch (o `last_ping_at` já existente é escrito
  // só pelo fluxo legado `/api/ping`, que exige um canal). Populado a
  // partir de agora para personagens já existentes (nenhuma ausência
  // retroativa é inventada na primeira migração); atualizado depois só
  // por `POST /api/presence/ping` (routes/presence.ts).
  const characterColumnsV2 = database
    .prepare("PRAGMA table_info(characters)")
    .all() as Array<{ name: string }>;
  const hasLastActiveAt = characterColumnsV2.some((col) => col.name === "last_active_at");
  if (!hasLastActiveAt) {
    database.exec("ALTER TABLE characters ADD COLUMN last_active_at INTEGER");
    database.exec(`UPDATE characters SET last_active_at = strftime('%s','now') WHERE last_active_at IS NULL`);
    console.log("[Migration] characters.last_active_at adicionada e populada com o momento atual.");
  }

  // Sprint 11 — Persistent Items + Affixes: "Nenhum item procedural
  // poderá perder informação ao ser salvo. Nunca mais." Mesmo mecanismo
  // de sempre (ALTER TABLE items ADD COLUMN, nunca uma segunda tabela
  // de item — ver hasBaseItemId/hasPowerScore acima). `affixes`/
  // `history` são JSON serializado como TEXT (mesmo padrão já usado por
  // `houses.history`); `quality`/`potential` idem. `craft_state` é
  // sempre 'open' pro catálogo fixo e para todo item já dropado antes
  // desta migração (nenhum item antigo nasce retroativamente selado).
  const itemColumnsV3 = database.prepare("PRAGMA table_info(items)").all() as Array<{ name: string }>;

  const hasItemLevel = itemColumnsV3.some((col) => col.name === "item_level");
  if (!hasItemLevel) {
    database.exec("ALTER TABLE items ADD COLUMN item_level INTEGER");
    console.log("[Migration] items.item_level adicionada.");
  }

  const hasSeed = itemColumnsV3.some((col) => col.name === "seed");
  if (!hasSeed) {
    database.exec("ALTER TABLE items ADD COLUMN seed INTEGER");
    console.log("[Migration] items.seed adicionada.");
  }

  const hasAffixes = itemColumnsV3.some((col) => col.name === "affixes");
  if (!hasAffixes) {
    database.exec("ALTER TABLE items ADD COLUMN affixes TEXT NOT NULL DEFAULT '[]'");
    console.log("[Migration] items.affixes adicionada (default '[]').");
  }

  const hasPotential = itemColumnsV3.some((col) => col.name === "potential");
  if (!hasPotential) {
    database.exec("ALTER TABLE items ADD COLUMN potential TEXT");
    console.log("[Migration] items.potential adicionada.");
  }

  const hasQuality = itemColumnsV3.some((col) => col.name === "quality");
  if (!hasQuality) {
    database.exec(`ALTER TABLE items ADD COLUMN quality TEXT NOT NULL DEFAULT '{"value":0,"scalesAttribute":""}'`);
    console.log("[Migration] items.quality adicionada (default value:0).");
  }

  const hasCraftState = itemColumnsV3.some((col) => col.name === "craft_state");
  if (!hasCraftState) {
    database.exec("ALTER TABLE items ADD COLUMN craft_state TEXT NOT NULL DEFAULT 'open'");
    console.log("[Migration] items.craft_state adicionada (default 'open').");
  }

  const hasHistory = itemColumnsV3.some((col) => col.name === "history");
  if (!hasHistory) {
    database.exec("ALTER TABLE items ADD COLUMN history TEXT");
    console.log("[Migration] items.history adicionada.");
  }

  // Sprint 15 — Sockets + Gem System (Foundation): mesmo mecanismo de
  // sempre (ALTER TABLE items ADD COLUMN, nunca uma segunda tabela de
  // item) — `sockets` é a `SocketConfiguration` inteira serializada
  // (mesmo padrão JSON-como-TEXT de `affixes`/`potential`). `NULL` pro
  // catálogo fixo e para todo item já dropado antes desta migração
  // (nenhum item antigo ganha Sockets retroativos — mesma disciplina
  // de `potential`/`history` na Sprint 11).
  const hasSockets = itemColumnsV3.some((col) => col.name === "sockets");
  if (!hasSockets) {
    database.exec("ALTER TABLE items ADD COLUMN sockets TEXT");
    console.log("[Migration] items.sockets adicionada.");
  }
}

export function getDb(): DatabaseSync {
  if (!db) {
    mkdirSync(dirname(env.dbPath), { recursive: true });
    db = new DatabaseSync(env.dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    // Merchant Phase I — achado real ao rodar a suíte completa: dois
    // arquivos de teste distintos (cada um seu próprio processo, ambos
    // apontando pro mesmo arquivo real quando DB_PATH=":memory:" não é
    // honrado a tempo — ver economy.service.test.ts) colidiram com
    // "database is locked" (SQLITE_BUSY) ao escrever ao mesmo tempo.
    // Sem busy_timeout, node:sqlite falha IMEDIATAMENTE em vez de
    // esperar a outra transação liberar o lock — o mesmo problema
    // aconteceria em produção com duas requisições genuinamente
    // concorrentes (ex.: dois personagens vendendo ao mesmo tempo).
    db.exec("PRAGMA busy_timeout = 5000;");
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
