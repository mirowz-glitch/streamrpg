# World Autonomy Phase I — Implementação (Sprint 7, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. O jogo funciona de ponta a ponta — login, personagem, Aventura/Idle, Reino, Casa, Mercado — sem nenhuma dependência obrigatória de Twitch. Twitch continua existindo, agora estritamente como integração opcional.

## 1. Arquitetura

### 1.1 Auditoria (Fase 1) — achados reais, com evidência de código

A auditoria (grep + leitura direta) confirmou que este codebase tem **dois sistemas de progressão paralelos e desconectados**:

1. **Adventure/Idle Engine** (`packages/shared` + `useAdventureSession.ts`) — a progressão real de todo jogador desde a Sprint "Global Idle System". Zero acoplamento de Twitch, confirmado por toda validação deste projeto até aqui.
2. **Stack legado de ping/sessão/XP/Boss/Prestígio** (`SessionManager`, `XPSystem`, `WelcomeRewardSystem`, `BossSpawnSystem`, `kingdom-prestige.service.ts`) — o overlay original de Twitch, ancorado num "canal" (login Twitch de um streamer).

O achado mais severo: **`XPSystem`/`WelcomeRewardSystem`/`BossSpawnSystem` só produzem efeito quando `presence.isLive(channelId)` retorna `true`** — e até esta Sprint, `presence` era sempre `twitchPresenceProvider`, cujo `isLive()` chama a API real da Twitch (`services/twitch.service.ts`). Ou seja: **Bosses nunca nasciam, XP de ping nunca era concedido, e a recompensa de boas-vindas nunca disparava para nenhum Jogador sem uma live Twitch de verdade acontecendo agora** — mesmo que ele estivesse jogando ativamente via Adventure/Idle.

Reforçando o achado: `usePing.ts`/`/api/ping` (o mecanismo que alimenta `SessionManager`) exige um `channel` (`"Informe o canal da live (login Twitch do streamer)"`) — um Jogador direto, que nunca passou por `?canal=<streamer>` na URL, nunca gera nenhuma Sessão real. O stack inteiro (1) é inerte por padrão para um Jogador solo e (2) mesmo quando ativo, é Twitch-gated.

Também confirmado: `routes/auth.ts`'s `GET /api/auth/callback` era, até esta Sprint, o **único** caminho de criação de conta — inteiramente Twitch-OAuth-específico. `profiles.twitch_id`/`streamer_channels.twitch_id` já eram nullable/desacoplados desde Identity Core, mas nada além de Twitch de fato criava uma conta.

Classificação completa:

| Achado | Categoria | Ação |
|---|---|---|
| `XPSystem`/`WelcomeRewardSystem`/`BossSpawnSystem` gated por `twitchPresenceProvider.isLive()` | **gameplay** (bloqueante) | Corrigido (Fase 3/4) |
| `routes/auth.ts` callback 100% Twitch-específico, único criador de conta | **gameplay** (bloqueante) | Corrigido (Fase 7) |
| `usePing`/`SessionManager` exigem um "canal" digitado | **gameplay** (bloqueante) | Corrigido (Fase 3, novo heartbeat) |
| `kingdom-prestige.service.ts` (6 cargos, Hall da Fama) lê `viewer_sessions`/`channel_rankings` | **legado** | Não tocado — já documentado desde Kingdom Domain/Citizen System, decisão deliberada de não migrar nesta Sprint |
| `channel.service.ts`, `routes/overlay.ts`, `routes/ranking.ts` (parâmetro `channel`) | **integração** | Não tocado — Overlay é feature de streamer, correto ficar Twitch-específico |
| `identity.service.ts` subquery em `viewer_sessions.first_ping_at` (Fundador) | **legado residual** | Não tocado, não bloqueante |
| `engine/types.ts`'s `channelId` em ~15 arquivos, fisicamente = `streamer_channels.id` | **social/vocabulário** | Não renomeado — já nomeado como débito de uma Sprint futura de migração real de `streamer_channels` → `kingdoms`, fora do escopo aqui (D7, sem refatoração destrutiva) |
| Economy Core/Merchant/Blacksmith/Salvage/Housing/Real Estate/Kingdom Domain/Citizen System | **economia/social já corretos** | Confirmado zero acoplamento de Twitch (nenhuma dessas tabelas tem `channel_id`) |

### 1.2 PlayerPresence (Fase 2)

Novo módulo `packages/shared/src/presence/` (types.ts + derivePresence.ts + index.ts, mesmo formato de módulo já usado por `idle/`/`economy/`): `PlayerPresence = "online" | "offline" | "idle" | "in_adventure" | "in_kingdom" | "afk"`, derivado por `derivePlayerPresence()` — função pura (D1/D3), sem I/O, a partir de sinais 100% reais (`lastSeenAt`, `isAdventuring`, `isCitizenOfKingdom`), nunca de `isLive()`/Twitch. 8 testes.

### 1.3 Player Session (Fase 3)

`Login → Character → Player Session → Idle Loop → World`: a peça que faltava era presença automática, sem "canal". Duas mudanças conectadas:

- **`apps/api/src/services/presence.service.ts`** — novo `playerPresenceProvider: PresenceProvider`, cujo `isLive(contextId)` responde "este contextId tem uma Sessão ativa no `SessionManager` agora?" — nenhuma chamada de rede, nenhuma Twitch. `twitchPresenceProvider` continua existindo, intocado, disponível para uma futura integração opcional.
- **`apps/api/src/routes/presence.ts`** (novo) — `POST /api/presence/ping`, autenticado, sem parâmetro `channel`: resolve o characterId da sessão e chama `sessionManager.reportPresent(characterId, characterId, "world")` — o próprio personagem é seu "canal", nenhum streamer necessário.
- **`apps/web/src/hooks/useAdventureSession.ts`** — novo heartbeat (`ensurePresenceHeartbeatStarted()`, 60s, mesmo padrão de proteção/singleton de `ensureIdleDriverStarted()`), disparado automaticamente para todo Jogador autenticado assim que o singleton nasce — nenhuma tela nova, nenhuma ação manual.

### 1.4 World Loop independente (Fase 4)

Em `server.ts`, `XPSystem`/`WelcomeRewardSystem`/`BossSpawnSystem` passam a receber `playerPresenceProvider` em vez de `twitchPresenceProvider` — **zero linha alterada dentro dos três Systems**, só qual `PresenceProvider` a fronteira de composição injeta (exatamente o ponto de extensão que a Sprint Identity Core já havia preparado, nunca usado até agora). Como cada System deriva sua lista de contextIds a partir das próprias sessões ativas, qualquer contextId checado já tem, por construção, pelo menos uma Sessão — o "gate de audiência" vira uma confirmação de presença real.

### 1.5 Kingdoms — confirmação (Fase 5)

Nenhuma mudança de código. Confirmado por leitura de `kingdom.service.ts`/schema: `kingdoms` nunca teve `channel_id`/`twitch_id`, Kingdom Domain e Citizen System já garantiam isso desde suas próprias Sprints.

### 1.6 Streamer como Kingdom Integration (Fase 6)

Nova tabela aditiva `kingdom_integrations` (kingdom_id, provider CHECK IN twitch/kick/youtube, external_channel_id, UNIQUE(kingdom_id, provider)) + `kingdomIntegration.service.ts` (`connectKingdomIntegration`/`listKingdomIntegrations`). Puramente infraestrutura, per o brief — nenhuma rota, nenhuma UI, nenhuma regra de liderança lê esta tabela ainda. 4 testes confirmam: um Reino novo não tem integração nenhuma (Kingdom nunca exige uma para existir); Twitch/Kick/YouTube são tratados exatamente igual; reconectar atualiza em vez de duplicar.

### 1.7 Login unificado (Fase 7)

Login Providers (`docs/design/login-providers.md`) nomeia Google/Discord/E-mail como "login core"; Twitch/Kick/YouTube como integração opcional. Google/Discord/Kick/YouTube exigem credenciais de app OAuth reais que este ambiente não tem configuradas — **E-mail foi implementado como prova real de equivalência** (o único dos seis que não depende de nenhum serviço externo): `POST /api/auth/email` reusa exatamente o mesmo fluxo do `account.service.ts` já construído em Identity Core (`findProfileByAccount` → cria Pessoa se necessário, mesmo `createCharacter()` do callback Twitch → `linkAccount(..., "email", ...)` → `createSession()`), chegando na mesma forma de Character, sem nenhuma vantagem/diferença — validado em Browser Validation (Seção 11).

### 1.8 Web (Fase 8)

`LoginPage.tsx`: formulário mínimo de e-mail (input + botão, sem redesenho). Corrigido o card "👑 Reino" (badge trocado de "Requer login Twitch" para "Requer login" — falso desde Kingdom Domain/Citizen System, Reino não exige Twitch especificamente) e o card de clareza "O que precisa de login?" (renomeado "Com login Twitch" → "Com uma conta (qualquer uma)", texto reescrito para não afirmar mais que Mundo/Reino exigem Twitch). `HowItWorks.tsx`/`WelcomeCard.tsx`/`FirstBossBanner.tsx`/`StreamerPage.tsx` conferidos — já corretos (Twitch já enquadrado como opcional, ou página legitimamente escopada só para quem já usa a integração).

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `packages/shared/src/presence/{types,derivePresence,index}.ts` (novo) | PlayerPresence |
| `packages/shared/src/presence/derivePresence.test.ts` (novo) | 8 testes |
| `packages/shared/src/index.ts` | Exporta `presence/` |
| `apps/api/src/services/presence.service.ts` | `playerPresenceProvider` (novo, adicional a `twitchPresenceProvider`) |
| `apps/api/src/services/presence.service.test.ts` (novo) | 4 testes |
| `apps/api/src/routes/presence.ts` (novo) | `POST /api/presence/ping` |
| `apps/api/src/server.ts` | Registra `presenceRoutes`; troca provider de XPSystem/WelcomeRewardSystem/BossSpawnSystem |
| `apps/api/src/routes/auth.ts` | `POST /api/auth/email` |
| `apps/api/src/config/schema.ts` | Nova tabela `kingdom_integrations` (aditiva) |
| `packages/shared/src/types.ts` | `KingdomIntegrationProvider`, `KingdomIntegration` |
| `apps/api/src/services/kingdomIntegration.service.ts` (novo) | `connectKingdomIntegration`/`listKingdomIntegrations` |
| `apps/api/src/services/kingdomIntegration.service.test.ts` (novo) | 4 testes |
| `apps/web/src/hooks/useAdventureSession.ts` | Heartbeat de presença (`ensurePresenceHeartbeatStarted`) |
| `apps/web/src/hooks/useAdventureSession.test.ts` | +3 testes de heartbeat |
| `apps/web/src/pages/LoginPage.tsx` | Formulário de e-mail; textos corrigidos |

## 3. Player Presence

Ver Seção 1.2. `derivePlayerPresence()` prioriza: sem sinal → `offline`; Aventura ativa agora → `in_adventure`; visto recentemente + Cidadão → `in_kingdom`; visto recentemente, sem Reino → `online`; visto há um tempo médio → `idle`; além disso → `afk`.

## 4. World Loop independente

Ver Seção 1.4. Verificado em Browser Validation: heartbeat `POST /api/presence/ping` retornou 200 automaticamente, sem nenhuma aba Twitch/live aberta, para um personagem criado via e-mail.

## 5. Login unificado

Ver Seções 1.7/1.8. `POST /api/auth/email` chega na mesma forma de Character que o callback Twitch — mesmo `createCharacter()`, mesma tabela `characters`, mesmo cookie de sessão (`middleware/auth.ts`, já agnóstico desde Identity Core).

## 6. Compatibilidade

Confirmado via Browser Validation com um personagem 100% criado por e-mail (zero Twitch): Adventure/Idle (progressão contínua, Nível 1→5 durante toda a validação), Merchant (venda real), Blacksmith (upgrade real, upgrade_level 0→1), Salvage (desmontagem real, +materials), Kingdom (entrou em Reino Oficial), Citizen (cidadania registrada), Housing (construiu uma Casa), Real Estate (anunciou, tentativa de auto-compra corretamente rejeitada com `cannot-buy-own-house`, cancelou). Zero regressão, zero erro de console em toda a sessão.

## 7. Testes

19 testes novos: 8 (`derivePresence.test.ts`) + 4 (`presence.service.test.ts`) + 4 (`kingdomIntegration.service.test.ts`) + 3 (`useAdventureSession.test.ts`, heartbeat). Shared: 515/515. API: 163-164/164 em 3 execuções, falhas confinadas à dívida SQLITE_BUSY/`SQLiteCharacterRepository.test.ts` já documentada — nunca nos arquivos novos desta Sprint. Nenhum teste antigo removido.

## 8. Typecheck / Build

Shared, API, Web: zero erros novos, mesma baseline de dívida pré-existente exata (`SQLiteCharacterRepository.test.ts` TS1308, `EventBus.test.ts`/`GameEngine.test.ts`, `SQLiteBossParticipationRepository.ts`/`SQLiteBossRepository.ts` TS2352). `npm run build:web` limpa.

## 9. Browser Validation

Fluxo completo (Email substituindo Google — ver Seção 10): Login por e-mail (conta nova criada automaticamente) → CharacterPage com Adventure já rodando (idle iniciado sozinho) → confirmado `POST /api/presence/ping` 200 (heartbeat automático, sem canal) → Merchant (venda real, +7 Gold) → Blacksmith (upgrade real, confirmado que exige item equipado, não item qualquer — comportamento correto do sistema, não bug) → Salvage (desmontagem real, +materials) → Reinos (entrou em Reino Oficial) → Housing (construiu Casa) → Mercado Imobiliário (anunciou, auto-compra corretamente rejeitada, cancelou) → Adventure (idle nunca parou, Nível 1→5 durante toda a sessão). Nenhuma aba Twitch/live aberta em nenhum momento. Zero erros de console.

## 10. Compatibilidade e Problemas Encontrados

**Substituição Google → E-mail no fluxo mandatório**: o brief pede "Google Login" como primeiro passo da Fase 13. Este ambiente não tem credenciais de app OAuth do Google (nem Discord/Kick/YouTube) configuradas — implementar OAuth real para qualquer um desses exigiria registrar um app externo, fora do que é responsável fazer sem credenciais reais fornecidas pelo usuário. E-mail foi escolhido como substituto porque (a) é "login core" per `login-providers.md`, no mesmo nível de Google/Discord, e (b) não depende de nenhum serviço externo — provando o ponto central da Sprint ("o jogo funciona sem Twitch") de forma real e testável, não simulada. `account.service.ts`/`AuthProvider` já generalizam para os seis provedores; só falta, numa Sprint futura de Cross Platform, registrar apps OAuth reais para Google/Discord/Kick/YouTube.

**Blacksmith exige item equipado**: durante a validação, tentar upgrade num item não-equipado retornou `item-not-found` — não é um bug desta Sprint, é o comportamento correto e pré-existente do Blacksmith (upgrade é sobre "seu equipamento, sempre à mostra"), só documentado aqui porque a validação inicialmente tropeçou nele antes de escolher um item equipado.

**World Boss (legado) agora tecnicamente alcançável sem Twitch, mas com semântica de "por canal" que não faz mais sentido para um Jogador solo**: com `playerPresenceProvider`, `BossSpawnSystem` passa a considerar "presente" qualquer characterId com heartbeat — mas a keying original de Boss é "um Boss por canal" (pensada para uma audiência compartilhada). Nenhuma mudança de design foi feita aqui (fora de escopo, per "não implementar Eventos/Guerra"); nomeado como decisão real pendente para a Sprint World Events, que já é responsável por repensar gatilhos de evento compartilhado vs. solo.

**`channelId` não renomeado**: confirmado, mas deliberadamente não tocado — ~15 arquivos (`engine/types.ts` e consumidores) já documentavam essa dívida desde antes desta Sprint, como trabalho de uma Sprint futura de migração real `streamer_channels` → `kingdoms` (D7, sem refatoração destrutiva de blast radius grande).

## 11. Próxima Sprint

Nenhuma indicada explicitamente no brief desta Sprint. Candidatos naturais, per `docs/design/new-roadmap.md`: Kingdom Treasury (item 6, já adiado por Real Estate Phase I) ou o início real de Cross Platform (item 11) — agora que Identity Core + Login Providers (parcial, e-mail) e Kingdom Domain estão prontos, Cross Platform poderia formalizar `kingdom_integrations` (Fase 6 desta Sprint) com rotas/UI reais, e registrar credenciais OAuth reais para Google/Discord se o usuário as fornecer.

---

*Referências: `docs/design/world-foundation-4.0.md`, `docs/design/identity-core.md`, `docs/design/login-providers.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/citizen-system.md`, `docs/design/new-roadmap.md`, `docs/architecture/decisions.md` (D1/D2/D3/D6/D7 respeitados).*
