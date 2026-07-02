export const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  twitch_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS streamer_channels (
  id TEXT PRIMARY KEY,
  twitch_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  owner_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  is_pro INTEGER NOT NULL DEFAULT 0,
  settings TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  gold REAL NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  primary_channel_id TEXT REFERENCES streamer_channels(id) ON DELETE SET NULL,
  last_ping_at INTEGER,
  is_shadow_banned INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS viewer_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL REFERENCES streamer_channels(id) ON DELETE CASCADE,
  session_date TEXT NOT NULL,
  first_ping_at INTEGER NOT NULL,
  last_ping_at INTEGER NOT NULL,
  ping_count INTEGER NOT NULL DEFAULT 1,
  minutes_watched INTEGER NOT NULL DEFAULT 1,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  gold_earned REAL NOT NULL DEFAULT 0,
  UNIQUE (character_id, channel_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_viewer_sessions_channel_date
  ON viewer_sessions(channel_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_viewer_sessions_last_ping
  ON viewer_sessions(last_ping_at DESC);

CREATE TABLE IF NOT EXISTS channel_rankings (
  channel_id TEXT NOT NULL REFERENCES streamer_channels(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  last_ping_at INTEGER,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  PRIMARY KEY (channel_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_rankings_position
  ON channel_rankings(channel_id, total_xp DESC);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rarity TEXT NOT NULL,
  slot TEXT NOT NULL,
  min_level INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS character_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  obtained_channel_id TEXT REFERENCES streamer_channels(id) ON DELETE SET NULL,
  obtained_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_character_items_character
  ON character_items(character_id, obtained_at DESC);

CREATE TABLE IF NOT EXISTS equipped_items (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  character_item_id INTEGER NOT NULL REFERENCES character_items(id) ON DELETE CASCADE,
  equipped_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  PRIMARY KEY (character_id, slot)
);

CREATE TABLE IF NOT EXISTS drop_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  rarity TEXT NOT NULL,
  rolled_value REAL NOT NULL,
  threshold REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS bosses (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL REFERENCES streamer_channels(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'awaiting',
  tier INTEGER NOT NULL DEFAULT 1,
  max_hp INTEGER NOT NULL,
  current_hp INTEGER NOT NULL,
  invocation_deadline INTEGER NOT NULL,
  activated_at INTEGER,
  ends_at INTEGER,
  resolved_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_bosses_channel_status
  ON bosses(channel_id, status);

-- Só um Boss "awaiting" ou "active" por canal por vez (Sprint técnica do
-- BossSystem, capítulo 6/Nascimento — um Boss por canal, canais
-- independentes entre si).
CREATE UNIQUE INDEX IF NOT EXISTS idx_bosses_one_active_per_channel
  ON bosses(channel_id) WHERE status IN ('awaiting', 'active');

-- Sprint B2 (Participação) — responde só "quem participou" e "quanto".
-- Nenhum dano, nenhum log de golpe: isso é escopo da B3 (Combate), não
-- criado aqui. PRIMARY KEY (boss_id, character_id) já serve como índice
-- para "listar participantes de um Boss" (leftmost prefix) — nenhum
-- índice extra necessário.
CREATE TABLE IF NOT EXISTS boss_participation (
  boss_id TEXT NOT NULL REFERENCES bosses(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  ticks_present INTEGER NOT NULL DEFAULT 0,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  PRIMARY KEY (boss_id, character_id)
);

-- Sprint B4 (Recompensas) — registra o que cada participante recebeu de
-- um Boss já resolvido. PRIMARY KEY (boss_id, character_id) serve dois
-- papéis: índice natural para "o que este personagem recebeu deste Boss"
-- e guarda de idempotência (mesmo Boss nunca é processado duas vezes
-- para o mesmo personagem). item_id nulo significa "não ganhou item" —
-- não é erro, é o resultado esperado pra quem não venceu a loteria de
-- vagas de item (ou pra outcome = 'escaped', que nunca concede item).
CREATE TABLE IF NOT EXISTS boss_rewards (
  boss_id TEXT NOT NULL REFERENCES bosses(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  xp_granted INTEGER NOT NULL,
  item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('defeated', 'escaped')),
  granted_at INTEGER NOT NULL,
  PRIMARY KEY (boss_id, character_id)
);
`;
