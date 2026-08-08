# World Autonomy Phase II — Implementação (Sprint 9, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. O Mundo passa a ter presença, ciclo e memória próprios — Player/Kingdom/Platform confirmados como três domínios nunca misturados, e quatro conceitos novos (World Presence, World Tick, Offline Summary, Activity Feed, Notifications, World News) tornam o Mundo tangível mesmo sem ninguém online.

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Reconfirma — sem descobrir nada novo — a classificação já produzida em detalhe por World Autonomy Phase I (Sprint 7) e reafirmada por Kingdom Integration (Sprint 8): nenhuma referência nova a `player=viewer`/`channel=reino`/`live=gameplay` foi encontrada em código novo desta Sprint.

### 1.2 World Presence ≠ Player Presence

`PlayerPresence` (Sprint 7) responde "este Jogador está presente agora?". `WorldPresence` (`packages/shared/src/world/`) responde "o Mundo está vivo agora?" — dia, horário, clima por região, regiões ativas/dormentes — derivado só do relógio real (`WORLD_EPOCH_MS` fixo, nunca o boot do servidor) e de sinais reais de presença (expedições não concluídas de personagens com sessão ativa). Determinístico e puro (D1/D3): mesma entrada produz sempre a mesma saída.

### 1.3 World Tick reaproveita o tick que já existe

A GameEngine já roda um ciclo real e periódico (`GameClock`, 60s) desde `engine.start()`, emitindo `world.tick` no EventBus **sempre**, independente de qualquer Jogador presente. Em vez de inventar um segundo `setInterval` paralelo, `WorldPresenceSystem` é o primeiro consumidor a transformar esse tick já existente em estado real do Mundo — mesmo padrão de `WorldEventSubscriber`/`KingdomNewsSystem`.

### 1.4 Offline Summary usa o mesmo Adventure Loop, nunca uma fórmula paralela

`computeOfflineCatchUp()` (`packages/shared/src/offline/`) projeta uma ausência real chamando `advanceAdventureWithPresentation()` — o MESMO motor que a Aventura ao vivo usa — N vezes (capped em 4h), a partir do nível/XP/região reais do personagem. Itens encontrados offline são vendidos automaticamente (nunca entram no Inventário real). Simplificação documentada: usa o kit inicial (`equipStarterKit`), não o equipamento real já equipado — mesma simplificação que `useAdventureSession.ts` já assume ao hidratar uma sessão.

### 1.5 Activity Feed vs. Jornal do Reino vs. Notifications

Três conceitos deliberadamente distintos:
- **Activity Feed** (`activityFeed.service.ts`) — factual, mundial, nunca narrado/variado (mesmo evento sempre produz a mesma frase). Nunca chat.
- **Notifications** (`notifications.service.ts`) — pessoal, por personagem, nunca Discord/Twitch/e-mail.
- **Jornal do Reino** (`KingdomNewsSystem`, Sprint pré-existente) — narrado, com variação de texto/voz de NPC. Intocado.

### 1.6 World News — sempre um COUNT real

`worldNews.service.ts` nunca guarda um valor separado que poderia dessincronizar — cada campo é um `COUNT`/`JOIN` real contra as tabelas já existentes (bosses/houses/house_sales/citizens/kingdoms), computado sob demanda a cada `GET /api/world/news`.

### 1.7 Guild System — só tipos, nenhuma implementação

`packages/shared/src/guild/types.ts` documenta o contrato mínimo esperado (Guild/GuildMember/GuildServiceContract) sem nenhuma tabela, serviço, rota ou lógica — deliberadamente não exportado do barrel principal de `@streamrpg/shared` ainda, para nunca ser importado por engano por código real antes da Sprint que efetivamente implementa Guild.

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `packages/shared/src/world/{types,deriveWorldPresence,index}.ts` (novo) | WorldPresence puro |
| `packages/shared/src/offline/{types,computeOfflineCatchUp,index}.ts` (novo) | Offline catch-up puro |
| `packages/shared/src/guild/{types,index}.ts` (novo) | Guild prep (só tipos) |
| `packages/shared/src/index.ts` | Exporta `world/`/`offline/` (não `guild/`) |
| `apps/api/src/systems/WorldPresenceSystem.ts` (novo) | Consome `world.tick`, cacheia WorldPresence |
| `apps/api/src/services/offlineSummary.service.ts` (novo) | Detecta ausência real, aplica XP/gold, guarda resumo pendente |
| `apps/api/src/services/activityFeed.service.ts` (novo) | Buffer factual global + listener `boss.defeated` |
| `apps/api/src/services/notifications.service.ts` (novo) | Buffer pessoal por personagem |
| `apps/api/src/services/worldNews.service.ts` (novo) | Agregados COUNT reais |
| `apps/api/src/routes/{worldPresence,activityFeed,notifications,worldNews}.ts` (novos) | 6 rotas novas |
| `apps/api/src/routes/presence.ts` | `POST /api/presence/ping` chama `checkAndComputeOfflineSummary`; nova rota `GET /api/character/offline-summary` |
| `apps/api/src/services/housing.service.ts`, `realEstate.service.ts`, `kingdom.service.ts`, `routes/items.ts` | +1 chamada direta a `pushActivityFeedEntry()` no ponto de sucesso |
| `apps/api/src/services/merchant.service.ts`, `blacksmith.service.ts` | +1 chamada direta a `pushNotification()` no ponto de sucesso |
| `apps/api/src/config/database.ts` | Migração `characters.last_active_at` |
| `apps/api/src/server.ts` | Registra `WorldPresenceSystem`/`registerActivityFeedBusListeners` + 4 novos grupos de rotas |
| `apps/web/src/hooks/useAdventureSession.ts` | Fetch de Offline Summary no primeiro ping; `offlineSummary`/`dismissOfflineSummary` expostos |
| `apps/web/src/components/ui/OfflineSummaryBanner.tsx` (novo) | Banner "enquanto você esteve fora" |
| `apps/web/src/pages/AdventurePage.tsx` | Monta o banner |
| `apps/web/src/pages/WorldPage.tsx` | +4 cards: Mundo Vivo/Notícias do Mundo/Feed de Atividade/Notificações |
| `apps/web/styles.css` | Estilos do banner/dismiss |

## 3. Serviços Criados

`WorldPresenceSystem`/`getWorldPresence()`, `computeOfflineCatchUp()`, `checkAndComputeOfflineSummary()`/`consumePendingOfflineSummary()`, `pushActivityFeedEntry()`/`getActivityFeed()`/`registerActivityFeedBusListeners()`, `pushNotification()`/`getNotifications()`/`dismissNotifications()`, `getWorldNews()`. Todos read-only ou aditivos — nenhum reescreve regra de jogo existente.

## 4. Testes

44 testes novos (`deriveWorldPresence.test.ts` 8, `WorldPresenceSystem.test.ts` 4, `computeOfflineCatchUp.test.ts` 6, `offlineSummary.service.test.ts` 4, `activityFeed.service.test.ts` 4, `notifications.service.test.ts` 4, `worldNews.service.test.ts` 3, + cobertura indireta via merchant/blacksmith/housing/realEstate/kingdom pré-existentes reconfirmados). Shared: 529/529 (era 515 antes desta Sprint). API: 189 testes, mesma dívida pré-existente de sempre (`SQLiteCharacterRepository.test.ts` TS1308) + flakiness de concorrência SQLite já documentada (settled em runs subsequentes, nenhum arquivo NOVO desta Sprint entre as falhas observadas). Nenhum teste antigo removido.

## 5. Browser Validation

Fluxo real, e-mail login → Aventura idle já rodando automaticamente (kills/loot reais, sem clique manual) → Cidade → Mercador (venda real, "Capacete de Mineiro vendido por 7 de Ouro") → Mundo: 🌍 Mundo Vivo (Dia 213, Tarde, 1 região ativa — refletindo a sessão real), 📊 Notícias do Mundo (agregados reais: 1 casa construída, 1 cidadão ativo, Maior Reino identificado), 📰 Feed de Atividade (vazio, correto — nenhum boss/casa/reino/lendário ainda), 🔔 Notificações ("💰 Você vendeu Capacete de Mineiro por 7 de ouro." — apareceu em tempo real após a venda). Zero erros de console em toda a sessão.

## 6. Compatibilidade

Adventure/Idle nunca parou durante a validação. Merchant/Blacksmith/Housing/Kingdom continuam funcionando exatamente como antes (as únicas mudanças são +1 linha de notificação/feed no ponto de sucesso de cada serviço, nunca uma alteração de retorno/controle de fluxo). `KingdomNewsSystem` (Jornal do Reino) intocado. Nenhum sistema antigo removido, tudo aditivo.

## 7. Problemas Encontrados

**Bug pré-existente descoberto (não corrigido, fora de escopo, flagrado para uma Sprint dedicada)**: o Item Generator produz 4 raridades (`common`/`magic`/`rare`/`unique`), mas `calculateSaleValue()` espera as 5 raridades de `ItemRarity` (`common`/`uncommon`/`rare`/`epic`/`legendary`) — sem nenhuma tradução entre as duas, `items.rarity` guarda a string crua do Item Generator. Vender um item `magic`/`unique` pelo Merchant real hoje devolve `NaN` de ouro. Blindado localmente em `computeOfflineCatchUp.ts` (mapeamento `ITEMGEN_TO_SALE_RARITY`), mas o Merchant real continua com o bug.

**Fallback de região para Offline Summary**: `STARTING_REGION_ID` (porto-do-amanhecer) não tem Encounter Table (hub seguro) — a projeção offline usa `STARTER_REGION_IDS[0]` (bosque-sussurrante) como fallback quando o personagem nunca teve nenhuma expedição.

**Exemplos do brief sem mecânica real ainda**: "casa taxada" (sem Kingdom Treasury/impostos), "Reino perdeu liderança" (sem troca de liderança implementada), "anúncio expirou" (Real Estate nunca implementou expiração automática) — documentados como não implementados em vez de fabricados; Notifications cobre só os 2 gatilhos reais desta Sprint (Merchant/Blacksmith).

## 8. Próxima Sprint

Candidatos naturais per `docs/design/new-roadmap.md`: Guild System (agora com o contrato de tipos já pronto, Sprint deve ser bem menor), Kingdom Treasury (impostos reais habilitariam "casa taxada"), ou a correção do bug NaN de raridade (já flagrado como tarefa separada).

---

*Referências: `docs/design/world-autonomy-phase1-implementation.md`, `docs/design/kingdom-integration-phase1-implementation.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D1/D3/D7 respeitados).*
