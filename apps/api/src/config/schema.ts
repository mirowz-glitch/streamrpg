export const SCHEMA = `
-- Sprint Identity Core (Vision 2.0) — twitch_id NÃO é mais NOT NULL aqui:
-- uma Pessoa não exige mais uma identidade Twitch para existir. Bancos já
-- existentes (que criaram esta tabela antes desta Sprint, com a constraint
-- antiga) são corrigidos por runMigrations() em database.ts (rebuild de
-- tabela — SQLite não tem ALTER COLUMN DROP NOT NULL). Nenhum código novo
-- deve tratar profiles.twitch_id como a identidade — ver a tabela
-- accounts abaixo, o vínculo de autenticação real (docs/design/
-- identity-core.md).
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  twitch_id TEXT UNIQUE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Sprint Identity Core (Vision 2.0) — o Vínculo de Autenticação
-- (docs/design/identity-core.md Seção 2): uma Pessoa (profiles) pode ter
-- zero, um, ou vários vínculos (Google/Discord/E-mail/Twitch/Kick/
-- YouTube), nunca o inverso. Nenhum provedor é dono da Pessoa — só prova
-- quem ela é. Nesta Sprint só "twitch" é populado de verdade (login real);
-- os demais provedores só existem como valor possível da coluna provider,
-- arquitetura pronta sem OAuth implementado (ver docs/design/
-- login-providers.md — "Sem OAuth" é explícito nesta Sprint).
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('twitch', 'google', 'discord', 'kick', 'youtube', 'email')),
  provider_user_id TEXT NOT NULL,
  connected_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_profile
  ON accounts(profile_id);

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

-- Sprint Expedition System — representação pura de "o que o personagem
-- está fazendo agora", nunca uma segunda fonte de XP/Gold/Drop/Combate.
-- origin/destination/current_region_id são ids de região do World
-- Design (packages/shared/src/regions.ts), nunca validados contra uma
-- tabela própria — regiões continuam sendo conteúdo estático, não dado
-- de banco (mesma decisão já usada para o catálogo de regiões do World
-- Simulation).
CREATE TABLE IF NOT EXISTS expeditions (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  origin_region_id TEXT NOT NULL,
  destination_region_id TEXT NOT NULL,
  current_region_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preparing',
  status_started_at INTEGER NOT NULL,
  progress_ticks INTEGER NOT NULL DEFAULT 0,
  total_estimated_ticks INTEGER NOT NULL,
  current_event TEXT,
  started_at INTEGER NOT NULL,
  completed_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_expeditions_character
  ON expeditions(character_id, created_at DESC);

-- Só uma expedição não concluída por personagem por vez — mesmo padrão
-- de índice parcial único já usado para "um Boss ativo por canal"
-- (idx_bosses_one_active_per_channel).
CREATE UNIQUE INDEX IF NOT EXISTS idx_expeditions_one_active_per_character
  ON expeditions(character_id) WHERE status != 'completed';

CREATE INDEX IF NOT EXISTS idx_expeditions_destination
  ON expeditions(destination_region_id);

-- Sprint Founder Identity & Prestige — catálogo de Títulos e Molduras,
-- mesmo padrão já usado para o catálogo de Itens (linha 79): conteúdo
-- extensível via seed, nunca hardcoded em código de gameplay. Nenhuma
-- das duas tabelas concede XP/Gold/poder — são puramente cosméticas.
CREATE TABLE IF NOT EXISTS titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS frames (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- PRIMARY KEY (character_id, title_id) é, ao mesmo tempo, o índice
-- natural de consulta e a garantia de não-duplicação (Etapa 8) — mesmo
-- papel que já cumpre em boss_rewards/boss_participation.
CREATE TABLE IF NOT EXISTS character_titles (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  title_id INTEGER NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (character_id, title_id)
);

CREATE TABLE IF NOT EXISTS character_frames (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  frame_id INTEGER NOT NULL REFERENCES frames(id) ON DELETE CASCADE,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (character_id, frame_id)
);

-- Sprint Kingdom Prestige System — diferente de titles/frames acima
-- (desbloqueio permanente por personagem), um cargo é "quem ocupa agora"
-- por CANAL: PRIMARY KEY (channel_id, role_slug) garante um único
-- ocupante por cargo por Reino, e o ocupante é substituído (UPDATE) — não
-- acumulado — quando outro personagem ultrapassa o critério do cargo.
CREATE TABLE IF NOT EXISTS kingdom_roles (
  channel_id TEXT NOT NULL REFERENCES streamer_channels(id) ON DELETE CASCADE,
  role_slug TEXT NOT NULL,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  held_since INTEGER NOT NULL,
  PRIMARY KEY (channel_id, role_slug)
);

-- Sprint Kingdom Chronicles (MVP) — "Livro" permanente por personagem,
-- ao contrário da Timeline/Jornal do Reino (buffers em memória, perdidos
-- a cada reinício do servidor): cada linha aqui é definitiva. chapter_key
-- identifica QUAL marco é aquele (ex: "arrival", "first_boss") — usado
-- por ChronicleSystem para garantir no máximo uma entrada por
-- personagem para os marcos "primeira vez" (INSERT condicional via
-- NOT EXISTS, nunca um segundo caminho de escrita). Marcos que se
-- repetem legitimamente (título desbloqueado, cargo assumido, drop raro)
-- usam o mesmo chapter_key em várias linhas — cada uma é, por natureza,
-- um evento novo e raro, não duplicação.
CREATE TABLE IF NOT EXISTS character_chronicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  chapter_key TEXT NOT NULL,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_character_chronicles_character
  ON character_chronicles(character_id, created_at ASC);

-- Economy Core Phase I — saldo genérico por recurso (Fase 5). "gold" é
-- DELIBERADAMENTE excluído desta tabela: characters.gold continua sendo
-- a única fonte de verdade para Ouro (evita duplicar/desincronizar um
-- saldo que já existe e já é lido/escrito por rotas em produção); esta
-- tabela cobre os demais ResourceId (materials, reputation, essence,
-- token, e futuros) desde o primeiro dia. Ver
-- apps/api/src/services/economy.service.ts para a fronteira exata.
CREATE TABLE IF NOT EXISTS character_resources (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  PRIMARY KEY (character_id, resource_id)
);

-- Log de auditoria (Fase 3/7) — nunca a fonte do saldo (nem para "gold"
-- nem para os demais recursos); só um registro append-only de cada
-- transação, aceita ou rejeitada, para investigação futura ("por que meu
-- saldo mudou de X para Y").
CREATE TABLE IF NOT EXISTS resource_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('credit', 'debit')),
  amount REAL NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_resource_transactions_character
  ON resource_transactions(character_id, created_at DESC);

-- Sprint Kingdom Domain 2.0 (Vision 2.0, Sprint 2) — o Reino como domínio
-- permanente do mundo, nunca uma live/canal/plataforma (docs/design/
-- kingdom-domain-2.0.md). Tabela NOVA e ADITIVA, deliberadamente separada
-- de streamer_channels (o modelo antigo, ainda em uso por Kingdom
-- Prestige/Boss/City nesta Sprint — não tocado, não migrado; ver Fase 7
-- de docs/design/kingdom-domain-implementation.md). founder_profile_id
-- nunca muda depois de fundado (fato histórico permanente);
-- leader_profile_id é quem lidera agora (hoje sempre = founder, já que
-- liderança plugável/Coroa/Eleição/Guilda/Conquista é escopo do Citizen
-- System e de Sprints futuras, nunca implementadas aqui). "history" (do
-- brief) é deliberadamente NÃO uma coluna aqui — mapeia para uma futura
-- tabela de Crônica do Reino, mesmo padrão de character_chronicles, fora
-- de escopo desta Sprint ("sem implementar funcionalidades futuras").
CREATE TABLE IF NOT EXISTS kingdoms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  founder_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  leader_profile_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dormant')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  banner TEXT,
  symbol TEXT,
  motto TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_kingdoms_slug
  ON kingdoms(slug);

CREATE INDEX IF NOT EXISTS idx_kingdoms_status
  ON kingdoms(status);

-- Sprint Citizen System (Vision 2.0, Sprint 3) — a ligação permanente
-- entre Character e Kingdom (docs/design/citizen-system.md), substituindo
-- "assistiu = membro" por "escolheu morar". Tabela NOVA e ADITIVA,
-- separada de streamer_channels/viewer_sessions/channel_rankings (o
-- modelo antigo, ainda em uso por Kingdom Prestige nesta Sprint — não
-- tocado, ver Fase 1 de docs/design/citizen-system-implementation.md).
-- character_id é UNIQUE: um personagem só pode ter uma linha aqui por
-- vez (Fase 7 do brief — "um personagem só pode pertencer a um Reino por
-- vez"). Trocar de Reino atualiza a mesma linha (kingdom_id + joined_at
-- reiniciam, per citizen-system.md Seção 4) em vez de criar uma segunda
-- linha; sair (leave) marca status='left' sem apagar a linha — nenhuma
-- consequência de troca (impostos, penalidade, histórico multi-Reino
-- completo) é implementada aqui, per Fase 7/DoD do brief ("apenas troca,
-- nada mais"). is_founder/is_leader são deliberadamente NÃO colunas
-- aqui — ver comentário em packages/shared/src/types.ts.
CREATE TABLE IF NOT EXISTS citizens (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL UNIQUE REFERENCES characters(id) ON DELETE CASCADE,
  kingdom_id TEXT NOT NULL REFERENCES kingdoms(id) ON DELETE CASCADE,
  joined_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left')),
  rank TEXT NOT NULL DEFAULT 'residente' CHECK (rank IN ('residente', 'cidadao', 'veterano', 'lenda')),
  notes TEXT,
  last_activity INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_citizens_kingdom
  ON citizens(kingdom_id, status);

-- Sprint Housing Phase I (Vision 2.0, Sprint 5) — a Casa como primeiro
-- ativo verdadeiramente permanente do mundo (docs/design/
-- housing-phase1.md). Tabela NOVA e ADITIVA. current_owner_character_id
-- e original_builder_character_id nunca usam ON DELETE CASCADE/SET NULL
-- deliberadamente — uma Casa nunca deveria perder seu construtor
-- original nem ficar sem dono por causa da exclusão de um personagem (a
-- própria filosofia da Sprint: "a casa permanece no mundo... o
-- histórico nunca desaparece"). district/plot são texto livre — a
-- divisão real em bairros com capacidade é escopo futuro. O campo
-- history é um log append-only serializado em JSON (ver HouseHistoryEvent em
-- packages/shared/src/types.ts) — nunca editado, só recebe novas
-- entradas a cada fato (construção, transferência).
CREATE TABLE IF NOT EXISTS houses (
  id TEXT PRIMARY KEY,
  kingdom_id TEXT NOT NULL REFERENCES kingdoms(id) ON DELETE CASCADE,
  district TEXT,
  plot TEXT,
  name TEXT NOT NULL,
  current_owner_character_id TEXT NOT NULL REFERENCES characters(id),
  original_builder_character_id TEXT NOT NULL REFERENCES characters(id),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned')),
  house_type TEXT NOT NULL DEFAULT 'residencia',
  history TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_houses_kingdom
  ON houses(kingdom_id, status);

-- Sprint Real Estate Phase I (Vision 2.0, Sprint 6) — o Mercado
-- Imobiliário do Reino (docs/design/real-estate.md). Tabela NOVA e
-- ADITIVA, separada de houses — nunca escrita diretamente por esta
-- feature; a única forma de mudar o dono de uma Casa continua sendo
-- transferOwnership() (housing.service.ts), reaproveitado por
-- realEstate.service.ts (Fase 4 do brief, "nunca duplicar regra").
-- status cobre o ciclo trivial desta Sprint: 'active' (anunciada) →
-- 'sold' ou 'cancelled' — nenhum leilão, imposto ou tomada pelo Reino.
CREATE TABLE IF NOT EXISTS house_sales (
  id TEXT PRIMARY KEY,
  house_id TEXT NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  seller_character_id TEXT NOT NULL REFERENCES characters(id),
  asking_price REAL NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  buyer_character_id TEXT REFERENCES characters(id),
  sold_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_house_sales_house
  ON house_sales(house_id, status);

CREATE INDEX IF NOT EXISTS idx_house_sales_status
  ON house_sales(status);

-- Kingdom Integration Phase I (Vision 2.0, Sprint 8) -- Streamer vira
-- apenas uma Integracao de Reino, nunca um requisito, nunca dono do
-- Reino. Tabela nova e aditiva: um Reino pode ter zero, uma ou varias
-- integracoes. A coluna provider e deliberadamente sem CHECK fechado
-- (era CHECK IN twitch/kick/youtube na Sprint anterior) -- o brief e
-- explicito: nao limitar providers, nunca usar enum Twitch-only.
-- Desconectar nunca apaga a linha (status vira disconnected), mesma
-- filosofia de nunca apagar historico ja usada por Housing/Real
-- Estate -- reconectar o mesmo provider atualiza a linha existente de
-- volta para connected em vez de duplicar.
CREATE TABLE IF NOT EXISTS kingdom_integrations (
  id TEXT PRIMARY KEY,
  kingdom_id TEXT NOT NULL REFERENCES kingdoms(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected')),
  connected_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  metadata TEXT,
  UNIQUE (kingdom_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_kingdom_integrations_kingdom
  ON kingdom_integrations(kingdom_id);

-- Sprint 12 (Crafting Phase I, Sphere System) -- posse de Esferas por
-- personagem. "Esferas nao podem ser compradas... entram no mundo
-- apenas por gameplay" -- esta tabela so guarda QUANTIDADE possuida,
-- nunca um catalogo de loja. Nenhuma linha eh criada por nenhum fluxo
-- de compra/drop real ainda (ver scripts/qaGrantSpheres.ts, a UNICA
-- fonte de escrita nesta Sprint). PRIMARY KEY composta (character_id,
-- sphere_id) -- no maximo uma pilha por Esfera por personagem, mesmo
-- padrao de UPSERT ja usado por character_resources (Economy Core).
CREATE TABLE IF NOT EXISTS character_spheres (
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  sphere_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (character_id, sphere_id)
);

-- Sprint 15 (Sockets + Gem System, Foundation) -- uma Gema tem
-- identidade PROPRIA (id/tier/quality/level/experience/history),
-- diferente de Esfera (fungivel, so quantidade) -- por isso cada linha
-- eh UMA instancia, mesmo padrao da tabela items (nao um par
-- character/quantidade como character_spheres). socketed_item_id
-- referencia items.id (o catalogo procedural, nunca character_items
-- -- a mesma linha de item sobrevive a venda/desmontagem, ver Sprint 14);
-- NULL = Gema solta na posse do personagem, nunca socketada ainda ou
-- removida de um item. ON DELETE SET NULL -- se a linha de item um
-- dia for removida por outro motivo, a Gema nunca eh apagada junto
-- (ela sobrevive, so fica solta) -- "Gemas nunca alteram a
-- identidade do Item" tambem quer dizer o inverso: o item nunca
-- carrega a Gema pra sua propria morte.
CREATE TABLE IF NOT EXISTS gems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  gem_type TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  quality TEXT NOT NULL DEFAULT '{"value":0}',
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  history TEXT NOT NULL,
  socketed_item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  socketed_socket_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS idx_gems_character
  ON gems(character_id);
CREATE INDEX IF NOT EXISTS idx_gems_socketed_item
  ON gems(socketed_item_id);

-- Sprint 18 (Mythic Foundation) -- registro global de quem foi o
-- PRIMEIRO a revelar cada Item Mitico no servidor (mythic_id como
-- PRIMARY KEY -- no maximo UMA linha por Mitico, para sempre). "Nunca
-- apagar. Nunca sobrescrever." -- a camada de servico so faz INSERT
-- OR IGNORE (mesmo espirito first-write-wins de
-- mythic/discovery.ts, packages/shared); nenhum UPDATE/DELETE real
-- nesta tabela jamais. first_kingdom_id fica NULL quando o
-- personagem que revelou nao pertencia a nenhum Reino no momento --
-- sem FK pra kingdoms porque um Reino pode em tese deixar de existir
-- (nunca acontece por design, mas a tabela nao deve travar nesse
-- caso hipotetico). "Sem ranking, sem UI" -- nenhuma coluna de
-- ordenacao/contagem, so o fato pontual.
CREATE TABLE IF NOT EXISTS mythic_discoveries (
  mythic_id TEXT PRIMARY KEY,
  first_character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  first_kingdom_id TEXT,
  first_at TEXT NOT NULL,
  server TEXT NOT NULL
);
`;
