# StreamRPG — Database Reference

> Gerado automaticamente a partir de `apps/api/src/config/schema.ts` +
> `apps/api/src/config/database.ts` (migrações) em 2026-07-04. SQLite via
> `node:sqlite` (`DatabaseSync`), modo WAL, `PRAGMA foreign_keys = ON`.
> 19 tabelas. Sem ORM — todo acesso é SQL puro via `db.prepare(...)`.
> Migrações são idempotentes (checam `PRAGMA table_info` antes de rodar,
> seguro repetir a cada boot).

## profiles
Um por login Twitch (espectador ou streamer — sem distinção de papel).

| Coluna | Tipo | Notas |
|---|---|---|
| id | TEXT PK | uuid |
| twitch_id | TEXT UNIQUE | id numérico da Twitch |
| username | TEXT | login |
| avatar_url | TEXT? | |
| email | TEXT? | |
| created_at / updated_at | INTEGER | |

- **Escreve**: `routes/auth.ts` (callback OAuth).
- **Lê**: praticamente todo serviço que precisa de `display_name`/`avatar_url` via join com `characters`.
- **Nunca deve tocar**: nenhum System de gameplay escreve aqui diretamente.

## streamer_channels
Um por canal Twitch — **todo profile já vira um canal automaticamente no login** (`connectStreamerChannel`), não é uma ação separada de "virar streamer".

| Coluna | Tipo | Notas |
|---|---|---|
| id | TEXT PK | = login em minúsculas (não um uuid — convenção usada em todo o projeto) |
| twitch_id | TEXT UNIQUE | |
| display_name | TEXT | |
| avatar_url | TEXT? | |
| owner_profile_id | TEXT? FK→profiles | SET NULL on delete |
| is_pro | INTEGER (bool) | nunca setado por nenhum fluxo hoje — placeholder |
| settings | TEXT | JSON, default `'{}'`, **nunca lido nem escrito por nenhum código hoje** |
| created_at / updated_at | INTEGER | |

- **Escreve**: `channel.service.ts` (`ensureChannel`/`connectStreamerChannel`).
- **Lê**: quase todo serviço channel-scoped (Boss, Kingdom Prestige, World).
- **Gargalo**: `id = login.toLowerCase()` é uma convenção implícita repetida em várias rotas (`overlay.ts`, `ranking.ts`, `kingdom-prestige.service.ts`) em vez de centralizada numa função única — risco de divergência se alguém esquecer o `.toLowerCase()` num ponto novo.

## characters
Um por profile (1:1). O personagem em si.

| Coluna | Tipo | Notas |
|---|---|---|
| id | TEXT PK | |
| profile_id | TEXT UNIQUE FK→profiles | CASCADE |
| display_name | TEXT | |
| level | INTEGER | default 1 — **na prática, `level` real é sempre derivado de `xp` via `getProgress()`; esta coluna existe mas fica desatualizada** (ver Gargalos) |
| xp | INTEGER | fonte da verdade de progressão |
| gold | REAL | |
| total_minutes | INTEGER | |
| primary_channel_id | TEXT? FK→streamer_channels | SET NULL |
| last_ping_at | INTEGER? | |
| is_shadow_banned | INTEGER (bool) | existe, usado em filtros de Ranking/Overlay; nenhum fluxo de UI concede isso ainda (só manual/futuro) |
| first_join_reward_at | INTEGER? | migração; controla Welcome Reward (uma vez) |
| sus_base | INTEGER | default 0 — **placeholder até Classes existir** |
| equipped_title_id | INTEGER? FK→titles | |
| equipped_frame_id | INTEGER? FK→frames | |
| created_at / updated_at | INTEGER | |

- **Escreve**: `xp.service.ts` (gold/xp/last_ping_at via ping), `XPSystemV2`/`WelcomeRewardSystem` (via `CharacterRepository.applyXP`), `identity.service.ts` (equipped_title_id/equipped_frame_id).
- **Lê**: virtualmente todo sistema.
- **Gargalo real**: a coluna `level` nunca é escrita depois da criação (fica sempre 1) — todo `level` exibido na UI vem de `getProgress(xp).level`, calculado em runtime. Isso é seguro hoje (nenhum código lê a coluna `level` diretamente), mas é uma coluna morta que pode confundir quem for escrever SQL novo direto no banco.

## sessions
Sessão de login (cookie).

| Coluna | Tipo |
|---|---|
| id | TEXT PK (hex aleatório) |
| profile_id | TEXT FK→profiles CASCADE |
| expires_at | INTEGER |
| created_at | INTEGER |

- **Escreve/lê**: `middleware/auth.ts` exclusivamente.
- **Nunca deve tocar**: nenhum System de gameplay.

## viewer_sessions
Um registro por (personagem, canal, dia) — a "presença diária".

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| character_id | TEXT FK→characters CASCADE | |
| channel_id | TEXT FK→streamer_channels CASCADE | |
| session_date | TEXT | `YYYY-MM-DD` |
| first_ping_at / last_ping_at | INTEGER | |
| ping_count | INTEGER | |
| minutes_watched | INTEGER | |
| xp_earned / gold_earned | INTEGER/REAL | **duplica** o que já foi concedido em `characters` — histórico, não fonte da verdade |

- UNIQUE `(character_id, channel_id, session_date)`; índices em `(channel_id, session_date DESC)` e `(last_ping_at DESC)`.
- **Escreve**: `xp.service.ts:applyPing` (upsert por dia).
- **Lê**: `kingdom-prestige.service.ts` (Membro Mais Antigo, Maior Sequência, minutos assistidos), `identity.service.ts` (Primeiro Reino).
- **Gargalo**: é a tabela mais lida para cálculos derivados "pesados" (streak calculado em JS, não em SQL — ver `computeMaiorSequencia` em `kingdom-prestige.service.ts`). Cresce sem limite (uma linha por personagem por canal por dia, para sempre) — **candidata a arquivamento/purga futura**, nenhuma rotina de limpeza existe hoje.

## channel_rankings
Um por (canal, personagem) — o ranking local de um canal.

| Coluna | Tipo |
|---|---|
| channel_id | TEXT FK→streamer_channels CASCADE |
| character_id | TEXT FK→characters CASCADE |
| position | INTEGER |
| total_xp | INTEGER |
| sessions_count | INTEGER |
| last_ping_at | INTEGER? |
| updated_at | INTEGER |

PK `(channel_id, character_id)`. Índice `(channel_id, total_xp DESC)`.

- **Escreve**: `xp.service.ts:applyPing` (upsert) + `refreshChannelPositions()` (recalcula `position` de todo o canal a cada ping — **O(n) no número de membros do canal, a cada ping de qualquer um deles**).
- **Lê**: `ranking.ts`, `overlay.ts`, `kingdom-prestige.service.ts` (é a lista canônica de "quem é membro deste Reino").
- **Gargalo real**: `refreshChannelPositions` recalcula TODAS as posições do canal em toda chamada de ping — funciona bem com dezenas/centenas de membros, mas é o primeiro lugar que vai doer se um canal crescer para milhares de espectadores simultâneos.

## items
Catálogo de itens (seed idempotente, não gameplay dinâmico).

| Coluna | Tipo | Notas |
|---|---|---|
| id | INTEGER PK AUTOINCREMENT | |
| slug | TEXT UNIQUE | |
| name / description | TEXT | |
| rarity | TEXT | common/uncommon/rare/epic/legendary |
| slot | TEXT | weapon/armor/helmet/boots/amulet/ring |
| min_level | INTEGER | |
| is_active | INTEGER (bool) | |
| damage_type | TEXT | migração — physical/magic |
| uti_bonus | INTEGER | migração — default 0 |

- **Escreve**: só `items.service.ts:seedItems()` no boot (INSERT OR IGNORE).
- **Lê**: `drop.service.ts`, `SQLiteItemRepository.ts`.

## character_items
Um item concreto que um personagem possui.

| Coluna | Tipo |
|---|---|
| id | INTEGER PK AUTOINCREMENT |
| character_id | TEXT FK→characters CASCADE |
| item_id | INTEGER FK→items RESTRICT |
| obtained_channel_id | TEXT? FK→streamer_channels SET NULL |
| obtained_at | INTEGER |

Índice `(character_id, obtained_at DESC)`.

- **Escreve**: `DropSystem`/`BossRewardSystem` (via `ItemRepository.grantToCharacter`), `drop.service.ts` (caminho legado que preenche `obtained_channel_id` diretamente).
- **Lê**: `drop.service.ts:listInventory`, `onboarding/FirstItemCard.tsx` (via `/api/items`).

## equipped_items
O que está equipado agora, um por slot.

| Coluna | Tipo |
|---|---|
| character_id | TEXT FK→characters CASCADE |
| slot | TEXT |
| character_item_id | INTEGER FK→character_items CASCADE |
| equipped_at | INTEGER |

PK `(character_id, slot)` — garante um item por slot, sem índice extra.

- **Escreve/lê**: `drop.service.ts` (`equipItem`/`unequipItem`/`getEquippedItems`).

## drop_log
Log histórico de todo drop rolado (inclusive os que não deram item).

| Coluna | Tipo |
|---|---|
| id | INTEGER PK AUTOINCREMENT |
| character_id / channel_id | TEXT (sem FK declarada — atenção) |
| item_id | INTEGER (sem FK declarada) |
| rarity | TEXT |
| rolled_value / threshold | REAL |
| created_at | INTEGER |

- **Escreve**: `DropSystem`.
- **Lê**: ninguém hoje — **é só um log de auditoria, nunca consumido por UI ou relatório**. Candidato a index/purga se crescer demais.
- **Observação de schema**: é a única tabela do projeto com colunas que parecem FK (`character_id`, `channel_id`, `item_id`) mas **não têm `REFERENCES` declarado** — inconsistência real, provavelmente porque é um log e nunca precisou de integridade referencial, mas vale registrar.

## bosses
Um Boss por vez por canal (garantido por índice único parcial).

| Coluna | Tipo | Notas |
|---|---|---|
| id | TEXT PK | |
| channel_id | TEXT FK→streamer_channels CASCADE | |
| status | TEXT | default 'awaiting' — awaiting/active/defeated/escaped |
| tier | INTEGER | |
| max_hp / current_hp | INTEGER | |
| invocation_deadline | INTEGER | |
| activated_at / ends_at / resolved_at | INTEGER? | |
| created_at | INTEGER | |

Índice `(channel_id, status)`. **Índice único parcial** `channel_id WHERE status IN ('awaiting','active')` — é isso que garante "um Boss por canal por vez" no nível do banco, não só na lógica do System.

- **Escreve**: `BossSpawnSystem` (cria/ativa), `BossCombatSystem` (dano/resolve).
- **Lê**: `boss-status.service.ts`, `kingdom-prestige.service.ts` (Campeão dos Bosses, Prestígio), `onboarding/FirstBossBanner.tsx` (via rota).

## boss_participation
Presença acumulada por personagem numa luta específica.

| Coluna | Tipo |
|---|---|
| boss_id | TEXT FK→bosses CASCADE |
| character_id | TEXT FK→characters CASCADE |
| ticks_present | INTEGER |
| first_seen_at / last_seen_at | INTEGER |

PK `(boss_id, character_id)` — serve de índice natural e de idempotência.

- **Escreve/lê**: `BossParticipationSystem`, `BossRewardSystem` (para saber quem participou e distribuir recompensa).

## boss_rewards
O que cada personagem recebeu de um Boss já resolvido.

| Coluna | Tipo |
|---|---|
| boss_id | TEXT FK→bosses CASCADE |
| character_id | TEXT FK→characters CASCADE |
| xp_granted | INTEGER |
| item_id | INTEGER? FK→items SET NULL |
| outcome | TEXT CHECK ('defeated','escaped') |
| granted_at | INTEGER |

PK `(boss_id, character_id)` — garante que o mesmo Boss nunca gera recompensa duas vezes para o mesmo personagem.

- **Escreve**: `BossRewardSystem`.
- **Lê**: `identity.service.ts` (Boss Slayer, contagem de Bosses derrotados), `kingdom-prestige.service.ts` (Campeão dos Bosses, Herói do Reino), `boss-status.service.ts`.

## expeditions
"O que o personagem está fazendo agora" — nunca uma segunda fonte de XP/Gold/Drop.

| Coluna | Tipo | Notas |
|---|---|---|
| id | TEXT PK | |
| character_id | TEXT FK→characters CASCADE | |
| origin_region_id / destination_region_id / current_region_id | TEXT | ids de `packages/shared/src/regions.ts` — **não validados contra tabela própria**, regiões são conteúdo estático |
| status | TEXT | default 'preparing' — preparing/exploring/combating/resting/returning/completed |
| status_started_at | INTEGER | |
| progress_ticks / total_estimated_ticks | INTEGER | |
| current_event | TEXT? | texto narrativo do Encounter atual |
| current_encounter_category / current_encounter_icon | TEXT? | migração |
| started_at / completed_at | INTEGER/INTEGER? | |
| created_at | INTEGER | |

Índice `(character_id, created_at DESC)` e `(destination_region_id)`. **Índice único parcial** `character_id WHERE status != 'completed'` — garante uma expedição ativa por personagem por vez.

- **Escreve**: `ExpeditionSystem`.
- **Lê**: `expedition-status.service.ts`, `kingdom-prestige.service.ts` (Grande Explorador — via join com `viewer_sessions` para atribuir a um canal, já que expedições nunca carregam `channel_id`), `identity.service.ts` (Explorador).
- **Gargalo conceitual**: expedições são Character-scoped por princípio arquitetural (nunca carregam canal) — qualquer cálculo "por Reino" que precise de dado de expedição (Grande Explorador) precisa de um JOIN indireto via `viewer_sessions`, o que é uma aproximação ("membro do Reino", não "expedição feita neste Reino").

## titles / frames
Catálogos de Títulos e Molduras (cosmético puro).

**titles**: `id` PK, `slug` UNIQUE, `name`, `description`, `is_active`.
**frames**: `id` PK, `slug` UNIQUE, `name`, `tier`, `is_active`.

- **Escreve**: só `identity.service.ts:seedIdentityCatalog()` no boot.
- **Lê**: `identity.service.ts` inteiro.
- Hoje: 6 + 6 linhas. Arquitetura pronta para centenas sem migração — ver `IMPLEMENTATION_BACKLOG.md`.

## character_titles / character_frames
Desbloqueios permanentes (nunca revogados).

Ambas: `character_id` FK→characters CASCADE, `title_id`/`frame_id` FK→titles/frames CASCADE, `unlocked_at`. PK composta `(character_id, title_id)` / `(character_id, frame_id)` — natural + garante não-duplicação.

- **Escreve**: `IdentitySystem` via `identity.service.ts:evaluateAndGrantUnlocks`.
- **Lê**: `identity.service.ts` (perfil completo, compacto para Overlay/Ranking).

## kingdom_roles
Diferente de titles/frames: um cargo é **"quem ocupa agora"**, não um desbloqueio permanente — pode trocar de dono.

| Coluna | Tipo |
|---|---|
| channel_id | TEXT FK→streamer_channels CASCADE |
| role_slug | TEXT |
| character_id | TEXT FK→characters CASCADE |
| held_since | INTEGER |

PK `(channel_id, role_slug)` — garante um único ocupante por cargo por Reino; trocar de dono é um `UPDATE`, nunca uma segunda linha.

- **Escreve**: `KingdomPrestigeSystem`.
- **Lê**: `kingdom-prestige.service.ts` (Hall da Fama, ícones de cargo no Ranking, cargo do personagem no Perfil).

## Tabelas que existem só como conteúdo estático (fora do banco, para registro)

`packages/shared/src/regions.ts` (11 regiões) e `apps/web/src/lib/{npcs,library,bestiary}.ts` **não são tabelas** — são catálogos estáticos em código, deliberadamente (mesma decisão repetida em várias Sprints: "conteúdo, não dado de banco"). Se o volume de conteúdo crescer para milhares de linhas (Library/Bestiary planejam isso), migrar para tabela real é a primeira decisão de infraestrutura a revisitar.

## Resumo de acoplamento (quem nunca deve escrever em quem)

- **Nenhum System de Boss/Combat/Economy escreve em `kingdom_roles`, `titles`, `frames`, `character_titles`, `character_frames`** — essas são exclusivas de `IdentitySystem`/`KingdomPrestigeSystem`, que só **leem** as tabelas de gameplay.
- **`ExpeditionSystem` nunca escreve em `characters.xp`/`characters.gold`** — Expedição é puramente narrativa/presença.
- **Nenhuma rota HTTP escreve em `titles`/`frames`/`kingdom_roles`** — só leitura + equip/unequip do que já foi concedido.
