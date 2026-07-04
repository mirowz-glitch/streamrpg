# StreamRPG — API Reference

> Gerado automaticamente a partir de `apps/api/src/routes/*.ts` em
> 2026-07-04. 24 rotas no total. Roteamento próprio (não Express) via
> `apps/api/src/middleware/router.ts` — `route(method, path, handler)`,
> `path` pode conter `:param`. Autenticação via cookie de sessão
> (`streamrpg_session`), resolvida uma vez por request em
> `resolveAuth()` (`middleware/auth.ts`) e injetada como `ctx.profileId`.
> `requireAuth(ctx)` lança se não houver sessão válida — todo handler
> autenticado captura isso num `try/catch` e responde `401`.

## Auth — `apps/api/src/routes/auth.ts`

### `GET /api/auth/login`
- **Entrada**: nenhuma.
- **Saída**: `{ url: string }` — URL de autorização OAuth da Twitch.
- **Efeito colateral**: seta cookie `oauth_state` (CSRF state, 10 min).
- **Quem usa**: `apps/web/src/pages/LoginPage.tsx` (via `lib/api.ts:getLoginUrl`).
- **Dependências**: `services/auth.service.ts:getTwitchAuthUrl`.
- **Observações**: nenhuma autenticação exigida (é o próprio início do login).

### `GET /api/auth/callback`
- **Entrada**: query `?code=` (Twitch OAuth code).
- **Saída**: `302` redirect para `/app/character` + cookie de sessão. Erro: `400`/`500` JSON.
- **Efeito colateral**: cria `profiles` (se novo) + `characters` (via `createCharacter`) + `streamer_channels` (via `connectStreamerChannel`, o próprio Twitch login vira um canal automaticamente) + `sessions`.
- **Quem usa**: navegador, redirecionado pela própria Twitch.
- **Arquivos envolvidos**: `services/auth.service.ts` (troca de code por token, fetch do usuário), `routes/character.ts:createCharacter`, `services/channel.service.ts:connectStreamerChannel`.
- **Observações**: todo profile novo já vira automaticamente um `streamer_channel` — é assim que qualquer espectador também pode ser "streamer" sem etapa extra.

### `GET /api/auth/me`
- **Entrada**: cookie de sessão.
- **Saída**: `{ profile: { id, username, avatar_url, email, created_at } }`. `401` se não autenticado.
- **Quem usa**: `apps/web/src/hooks/useAuth.ts`, chamado por praticamente toda página do app.
- **Observações**: nenhuma escrita.

### `POST /api/auth/logout`
- **Entrada**: cookie de sessão.
- **Saída**: `{ ok: true }` + limpa o cookie.
- **Efeito colateral**: `destroySession()` — remove a linha de `sessions`.
- **Quem usa**: botão "Sair" em `CharacterPage.tsx`.

### `GET /health`
- **Entrada**: nenhuma.
- **Saída**: `{ ok: true, ping_interval_seconds: 60, overlay_poll_seconds: 5, xp_per_ping: 10 }` — valores **hardcoded no handler**, não lidos de `@streamrpg/shared` (risco de desalinhamento se as constantes reais mudarem).
- **Quem usa**: ninguém internamente ainda; existe para monitoramento externo.

## Character — `apps/api/src/routes/character.ts`

### `GET /api/character`
- **Entrada**: cookie de sessão.
- **Saída**: `CharacterResponse` (level/xp/xp_to_next/percent/gold/total_minutes/avatar_url/primary_channel_id/equipped[]/combat/created_at).
- **Quem usa**: `hooks/useCharacter.ts` — consumido por `CharacterPage`, `CityPage` (via `BlacksmithBuilding`/`BankBuilding`/`ArenaBuilding`), `WelcomeCard`.
- **Dependências**: `getCombatAttributes()` (`SQLiteCharacterRepository`), `getEquippedItems()` (`drop.service.ts`), `getProgress()` (`@streamrpg/shared`).
- **Observações**: nenhuma escrita. `combat` é derivado (level + equipamento), não uma coluna própria.

### `PATCH /api/character`
- **Entrada**: `{ display_name: string }`.
- **Saída**: `CharacterResponse` atualizado.
- **Quem usa**: nenhum ponto do frontend chama isto hoje (endpoint existe, sem UI que o exponha) — **candidato a uso futuro, já pronto**.

## Items — `apps/api/src/routes/items.ts`

### `GET /api/items`
- **Entrada**: cookie de sessão.
- **Saída**: `{ items: InventoryItem[] }` — inventário completo (equipado + não-equipado).
- **Quem usa**: `InventoryPage.tsx`, `onboarding/FirstItemCard.tsx` (detecta "primeiro item" comparando contagem).
- **Dependências**: `drop.service.ts:listInventory`.

### `POST /api/items/equip`
- **Entrada**: `{ character_item_id: number }`.
- **Saída**: `{ item: InventoryItem }`. `400` se item não existe/já equipado incorretamente.
- **Efeito colateral**: escreve `equipped_items` (upsert por slot).
- **Quem usa**: `InventoryPage.tsx`.

### `POST /api/items/unequip`
- **Entrada**: `{ slot: ItemSlot }`.
- **Saída**: `{ ok: true, items: InventoryItem[] }`.
- **Quem usa**: `InventoryPage.tsx`.

## Ping — `apps/api/src/routes/ping.ts`

### `POST /api/ping`
- **Entrada**: `{ channel: string }` (login Twitch do streamer).
- **Saída**: `PingResponse` (xp_gained/gold_gained/new_xp/level/leveled_up/xp_to_next/percent/cooldown_seconds/drop).
- **Efeito colateral**: `sessionManager.reportPresent()` (marca presença — é isso que alimenta `ActiveSession[]` do próximo `world.tick`); `applyPing()` grava `viewer_sessions`/`channel_rankings`, concede **Gold diretamente** (fora da Engine — ver PROJECT_STATUS §4) e verifica se o canal está de fato ao vivo na Twitch antes de conceder qualquer coisa.
- **Quem usa**: `hooks/usePing.ts` — chamado automaticamente a cada ~60s por `CharacterPage`.
- **Dependências**: `services/xp.service.ts:applyPing`, `services/twitch.service.ts:isChannelLive`, `services/channel.service.ts:ensureChannel`.
- **Observações**: XP/Level/Drop **não** são concedidos aqui de verdade — este endpoint só relata o que a Engine (via `world.tick`) já concedeu de forma assíncrona desde o ping anterior (comparação contra um checkpoint em memória, `computePingFeedback`). Gold é a exceção: ainda concedido de forma síncrona aqui mesmo.

## Expedition — `apps/api/src/routes/expedition.ts`

### `GET /api/expedition/current`
- **Entrada**: cookie de sessão.
- **Saída**: `{ expedition: ExpeditionResponse | null }`.
- **Quem usa**: `hooks/useExpedition.ts` (poll de 5s) → `ExpeditionPanel`, `ExpeditionCompact` (Overlay).
- **Observações**: só leitura — a expedição avança via `ExpeditionSystem` reagindo a `world.tick`, nunca por esta rota.

## Identity — `apps/api/src/routes/identity.ts`

### `GET /api/identity/me`
- **Saída**: `IdentityProfile` (título/moldura equipados, listas de títulos/molduras com `unlocked`/`unlocked_at`, stats: `bosses_defeated`, `regions_discovered`, `first_expedition_at`).
- **Quem usa**: `hooks/useIdentity.ts` → `IdentityPanel`, `CharacterPage` (moldura do avatar), `NewTitleModal`.

### `POST /api/identity/equip-title` `{ title_id }`
### `POST /api/identity/unequip-title`
### `POST /api/identity/equip-frame` `{ frame_id }`
### `POST /api/identity/unequip-frame`
- Todas retornam `IdentityProfile` atualizado; `equip-*` recusa (`400`) se o título/moldura não está desbloqueado. Desbloqueio em si **nunca** acontece por rota HTTP — só o `IdentitySystem` concede, reagindo a `world.tick`.

## Kingdom — `apps/api/src/routes/kingdom.ts`

### `GET /api/kingdom/:channel/me`
- **Saída**: `{ roles: CharacterKingdomRole[] }` — cargos que o personagem autenticado ocupa **naquele canal específico**.
- **Quem usa**: `hooks/useKingdomRole.ts` → linha "Cargo(s) no Reino de X" em `CharacterPage`.
- **Observações**: só leitura; cargos mudam de dono só via `KingdomPrestigeSystem`.

## Overlay — `apps/api/src/routes/overlay.ts`

### `GET /api/overlay/:channel/viewers`
- **Entrada**: nenhuma autenticação (rota pública — é isso que a OBS Browser Source consome).
- **Saída**: `OverlayResponse` (viewers ativos nos últimos 90s, cada um com level/xp/percent/equipped_weapon/expedition/title_name; `hall_of_fame_highlights` com só os 2 cargos mais importantes).
- **Quem usa**: `OverlayPage.tsx` (poll de 5s), embutido via `/overlay/:channel` no navegador do streamer/OBS.
- **Dependências**: `xp.service.ts:getOverlayViewers`, `expedition-status.service.ts`, `identity.service.ts`, `kingdom-prestige.service.ts`.
- **Observações**: CORS liberado (`Access-Control-Allow-Origin: *`) de propósito — é consumido de fora do próprio domínio (OBS).

### `GET /api/overlay/:channel/boss`
- **Saída**: `BossStateSnapshot`. Pública, mesmo espírito da rota acima.
- **Quem usa**: `hooks/useBossState.ts` → `BossCard` (em `CharacterPage`, `OverlayPage`), `onboarding/FirstBossBanner.tsx`.

### `GET /api/streamer/dashboard`
- **Entrada**: cookie de sessão.
- **Saída**: `StreamerDashboard` (canal, viewers ativos/totais, overlay_url, preview do ranking). `404` se o profile nunca chamou `/api/streamer/connect`.
- **Quem usa**: `StreamerPage.tsx`.

### `POST /api/streamer/connect`
- **Saída**: `{ channel: { id, display_name, overlay_url } }`.
- **Efeito colateral**: upsert em `streamer_channels` associando `owner_profile_id`.
- **Observações**: redundante com o que `auth/callback` já faz automaticamente hoje (todo profile já vira canal no login) — mantido por compatibilidade/clareza explícita no fluxo do Streamer.

## Ranking — `apps/api/src/routes/ranking.ts`

### `GET /api/ranking`
- **Entrada**: query opcional `?channel=`.
- **Saída**: `RankingResponse` (até 50 entradas; sem `channel`, ranking global por XP; com `channel`, ranking daquele canal via `channel_rankings.position`). Cada entrada ganha `title_name`/`frame_tier` (Identity) e `role_icons` (Kingdom Prestige, só quando filtrado por canal).
- **Quem usa**: `RankingPage.tsx`.
- **Observações**: só leitura sobre `xp.service.ts:getRanking`; a fusão com Identity/Kingdom acontece na rota, não no service, de propósito (não misturar a lógica de posição/XP com apresentação).

## World — `apps/api/src/routes/world.ts`

### `GET /api/world/state`
- **Entrada**: cookie de sessão; query opcional `?channel=`.
- **Saída**: `WorldStateResponse` — `panel` (tick atual, jogadores online), `kingdom` (agregado **global**, nome herdado de antes do Kingdom Prestige existir), `most_visited_regions`, `encounter_stats`, `stats`, `timeline`, `idle_flavor`, e `channel_kingdom` (só populado com `?channel=`, é o Reino específico daquele canal — Prestígio/Hall da Fama/conquistas recentes).
- **Quem usa**: `WorldPage.tsx`, `CityPage.tsx` (via `CityHubBar`).
- **Observações**: é a rota mais "agregadora" do projeto — soma dados de quase todo outro sistema (Boss, Expedição, Encounter, Kingdom Prestige) numa única resposta.

## Resumo por método

| Método | Quantidade |
|---|---|
| GET | 17 |
| POST | 7 |
| PATCH | 1 (raramente usado hoje — nenhuma UI o chama) |

## Padrões observados em toda rota

- Toda rota autenticada segue o mesmo formato: `requireAuth(ctx)` dentro de um `try`, `catch` genérico devolvendo `401 { error: "Unauthorized" }`.
- Nenhuma rota usa validação de schema (zod/joi/etc) — os `body.campo?` são checados manualmente, um `if` por campo obrigatório.
- Toda resposta passa por `json(res, status, payload)` (`middleware/router.ts`) — nunca `res.end()` direto, exceto o redirect de OAuth callback e o logout (que precisam controlar headers/Set-Cookie).
- Rotas públicas (Overlay) são as únicas com CORS explícito.
