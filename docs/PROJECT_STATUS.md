# StreamRPG — Project Status

> Documento gerado automaticamente a partir do estado real do código em
> 2026-07-04. Objetivo: qualquer IA (ou pessoa) que abra este repositório
> pela primeira vez deve conseguir entender o projeto inteiro em poucos
> minutos, sem precisar ler todo o histórico de Sprints.

## 1. O que é o StreamRPG

Um RPG persistente multiplataforma que nasceu como overlay de Twitch. A
premissa central: **"seu personagem vive enquanto você assiste a live"**.
Um espectador entra com login Twitch, escolhe o canal que está
assistindo, e a cada `ping` (a cada ~60s de presença real) seu
personagem ganha XP, Gold e chance de item. Bosses, Expedições e um
sistema de Reino (Kingdom) rodam automaticamente por trás, movidos por
um `world.tick` de 60s — o jogo "acontece" mesmo quando o jogador não
está clicando em nada.

## 2. Stack e monorepo

```
streamrpg/
├── apps/api/          — backend (Node.js, node:sqlite, HTTP puro sem framework)
├── apps/web/          — frontend (React 19 + react-router-dom 7, esbuild)
├── packages/shared/   — tipos e regras puras compartilhadas entre api/web
└── data/streamrpg.db  — SQLite (WAL mode), único arquivo de dado real
```

- **Runtime**: Node.js 22+ (usa `node:sqlite`, API nativa experimental — não usa `better-sqlite3` nem nenhum ORM).
- **Backend**: `node:http` cru — não usa Express/Fastify. Roteamento próprio em `apps/api/src/middleware/router.ts`.
- **Frontend**: React 19, `react-router-dom` 7 (`createBrowserRouter`), sem Redux/Zustand/nenhum state manager — só hooks + `useState`/`useEffect` por página.
- **Build**: `esbuild` (não Vite/webpack/Next). Bundle com code-splitting (`splitting: true`) desde a Sprint Performance Optimization — cada página é um `React.lazy` próprio.
- **CSS**: um único `apps/web/styles.css` global, sem CSS-in-JS, sem Tailwind.
- **Dev loop**: `npm run dev` (`tsx watch apps/api/src/server.ts`) — o servidor compila o frontend com esbuild na subida e serve os arquivos estáticos ele mesmo (`apps/api/src/config/bundler.ts`). Não existe um dev-server separado para o frontend.
- **Sem testes automatizados wired em CI** — existem alguns `.test.ts` antigos em `apps/api/src/engine/` (EventBus/GameClock/GameEngine) e `SQLiteCharacterRepository.test.ts`, mas não há script `npm test` no `package.json`. A convenção real de verificação usada em toda Sprint é: harness `.mjs` descartável no diretório de scratchpad, rodado via `npx tsx`, batendo no EventBus real com um banco isolado.

## 3. Arquitetura do backend — Engine/EventBus/Systems

Este é o núcleo conceitual mais importante do projeto e a peça que mais
frequentemente confunde quem lê o código pela primeira vez.

```
GameClock  →  emite um tick a cada 60s
    ↓
GameEngine  →  em cada tick, pergunta ao SessionManager "quem está presente?"
    ↓            e emite um WorldTickEvent no EventBus
EventBus   →  pub/sub em memória (apps/api/src/engine/EventBus.ts)
    ↓
Systems    →  cada um se inscreve em eventos específicos, nunca chama outro System diretamente
```

**Regra de ouro (várias Sprints repetem isso explicitamente):** Systems
nunca se chamam entre si. Um System só reage a eventos que já existem no
`EventBus` e só escreve no seu próprio Repository. Toda comunicação entre
sistemas é via evento, nunca chamada direta.

### Taxonomia de eventos (`apps/api/src/engine/types.ts`)

- **Gameplay/Character** (`xp.granted`, `level.up`, `drop.granted`,
  `expedition.*`, `identity.*`): carregam `characterId`, **nunca**
  `channelId`. Progressão pertence ao personagem, nunca ao canal.
- **Platform/Session** (`session.started`, `world.tick`): carregam
  `characterId` + `channelId` — representam presença.
- **World** (`boss.*`, `kingdom.role_changed`): carregam `channelId`,
  normalmente sem `characterId` (exceção documentada:
  `kingdom.role_changed` carrega os dois, por precisar dizer "quem"
  passou a ocupar o cargo).

`apps/api/src/engine/types.ts` é intencionalmente livre de qualquer
dependência externa (nem Twitch, nem SQLite, nem `@streamrpg/shared`) —
é o contrato mais estável do projeto.

### Systems ativos hoje (registrados em `server.ts`, todos reagem a `world.tick` salvo indicação contrária)

| System | Reage a | Responsabilidade | Nunca faz |
|---|---|---|---|
| `XPSystemV2` | `world.tick` | Concede XP real por presença | Não decide Gold nem Drop |
| `WelcomeRewardSystem` | `xp.granted` (primeira vez) | XP bônus de boas-vindas, uma vez por personagem | — |
| `DropSystem` | `xp.granted` (source="tick") | Rola chance de item por rarity | Nunca dispara em welcome/boss |
| `BossSpawnSystem` | `world.tick` | Cria/ativa Boss por canal (1 por vez) | Não calcula dano |
| `BossParticipationSystem` | `world.tick` | Registra presença em luta de Boss | Não decide recompensa |
| `BossCombatSystem` | `world.tick` | Aplica dano canônico, resolve derrota/fuga | Não concede recompensa |
| `BossRewardSystem` | `boss.defeated`/`boss.escaped` | XP + sorteio de item por Boss resolvido | — |
| `ExpeditionSystem` | `world.tick` | Avança expedição (máquina de estados), gera Encounter narrativo | Nunca concede XP/Gold/Drop |
| `IdentitySystem` | `world.tick` | Avalia critérios de Título/Moldura, concede se satisfeito | Puramente cosmético |
| `KingdomPrestigeSystem` | `world.tick` | Recalcula os 6 cargos do Hall da Fama por canal ativo | Puramente cosmético |

`XPSystem.ts` (v1, "shadow mode", só logava) foi removido na Sprint
Engineering Cleanup — estava morto, substituído por `XPSystemV2`.

### Repositories

Cada System que precisa persistir dados recebe um Repository por
injeção de construtor (interface definida em `engine/types.ts`,
implementação concreta em `infrastructure/SQLite*Repository.ts`):
`CharacterRepository`, `ItemRepository`, `BossRepository`,
`BossParticipationRepository`, `BossRewardRepository`,
`ExpeditionRepository`. Repositories nunca decidem regra de jogo, só
leem/escrevem.

### `SessionManager`

Rastreia quem está "presente" (ping nos últimos 90s) por
`characterId:channelId`. É a fonte de `ActiveSession[]` que todo
`WorldTickEvent` carrega — todo System que precisa saber "quem está
aqui agora" lê isso do próprio evento, nunca consulta o
`SessionManager` diretamente de novo.

## 4. Sistemas — status real (não o que os nomes sugerem)

| Sistema | Status | Observação |
|---|---|---|
| **Autenticação (Twitch OAuth)** | ✅ Completo | Cookie de sessão simples (`sessions` table), sem JWT real apesar do env var `JWT_SECRET` existir como fallback não usado |
| **XP / Level / Progressão** | ✅ Completo (MVP) | `XP_PER_PING = 10` a cada ~60s de presença real; fórmula de nível em `packages/shared/src/xp.ts` |
| **Gold** | ⚠️ MVP, parcialmente fora da Engine | Gold ainda é concedido diretamente em `xp.service.ts` (`applyPing`), não via EventBus/System — decisão arquitetural registrada e **ainda não resolvida** (ver `[[project_streamrpg_gold_ownership_decision]]` na memória — Gold precisa de emissão (Engine) vs. ledger/spend transacional antes do Marketplace existir) |
| **Drops / Itens** | ✅ Completo (MVP) | Catálogo em `items.service.ts`, raridade→poder em `packages/shared/src/items.ts`; 6 slots de equipamento |
| **Boss** | ✅ Completo (MVP) | Spawn → Participação → Combate (fórmula canônica documentada) → Recompensa. Um Boss por canal por vez |
| **Expedições** | ✅ Completo (MVP) | Máquina de estados (preparing→exploring→combating→resting→returning→completed), viagem calculada por BFS no grafo de regiões |
| **Encounters** | ✅ Completo (MVP) | 8 categorias narrativas, texto ainda placeholder/genérico — **conteúdo real é o próximo passo natural**, não a infraestrutura |
| **Identity (Títulos/Molduras)** | ✅ Infraestrutura completa, catálogo pequeno | 6 títulos + 6 molduras hoje; arquitetura já suporta centenas sem migração de schema |
| **Kingdom Prestige (Hall da Fama)** | ✅ Completo (MVP) | 6 cargos por canal, recalculados a cada tick, Timeline integrada |
| **Capital City (hub)** | ✅ Completo (MVP) | 9 prédios hoje (Arena, Ferreiro, Mercador, Alquimista, Guilda, Banco, Portão Norte, Biblioteca, Bestiário) |
| **NPCs** | ✅ Infraestrutura completa, elenco pequeno | 9 NPCs fixos (um por prédio + Eldrin, o guia de onboarding), retrato ilustrado via CSS (forma+cor+ícone), sem arte real |
| **Biblioteca (Library)** | ✅ Infraestrutura completa, sem conteúdo | 5 livros placeholder, 10 categorias estruturadas, sem backend (catálogo estático no frontend) |
| **Bestiário (Bestiary)** | ✅ Infraestrutura completa, sem conteúdo | 5 criaturas placeholder, 8 tipos, reaproveita o `BookPage`/`renderMarkdownLite` da Biblioteca |
| **Landing Page** | ✅ Completo | Hero ilustrado em SVG, 6 destaques, mocks de Reino/Cidade/Perfil |
| **Onboarding (New Player Journey)** | ✅ Completo | Flags só em `localStorage`, nenhuma escrita no backend |
| **Classes** | 📄 Só design, zero código | `docs/design/classes-final-architecture.md` já fecha 4 arquétipos (Guerreiro/Druida/Caçador/Xamã) e o `Classe_mult`, mas **nenhuma linha de implementação existe** — `sus_base`/`Classe_mult` no Combat Model são placeholders neutros esperando isso |
| **Marketplace** | ❌ Não iniciado | Zero design fechado, zero código. Bloqueado pela decisão de Gold (item acima) |
| **Economy 1.0** | ❌ Não iniciado | Depende de Marketplace + decisão de Gold |
| **Quests** | ❌ Não iniciado | Só menção em `docs/gameplay-design/07-quests.md` (rascunho) |
| **Seasons** | ❌ Não iniciado | Capítulo 9 da Bible ainda "Placeholder" |
| **Kingdoms (design profundo)** | ⚠️ Parcial | Kingdom Prestige (cargos/Hall da Fama) existe; o conceito mais amplo de "Reino com território/guerra/política" do capítulo 8 da Bible não tem implementação |

## 5. Dependências entre sistemas (o que trava o quê)

```
Classes (não existe)
   → bloqueia: SUS real, Classe_mult real no Combat Model,
     qualquer balanceamento de dano definitivo

Gold ownership decision (não resolvida)
   → bloqueia: Marketplace, Economy 1.0
   → hoje Gold é concedido fora da Engine (xp.service.ts), não via EventBus

Marketplace (não existe)
   → bloqueia: Economy 1.0, qualquer "venda de item"

Identity/Library/Bestiary (infraestrutura pronta)
   → esperando: conteúdo real (não código) — ver IMPLEMENTATION_BACKLOG.md

Encounter (infraestrutura pronta, 8 categorias)
   → esperando: texto real por região/categoria (300 planejados)

Regiões (11, estáticas em packages/shared + apps/web/src/lib/regions.ts)
   → cada criatura do Bestiário e cada Encounter referencia um regionId
     real — nenhuma tabela de regiões no banco, é conteúdo estático
     compartilhado entre frontend e backend
```

## 6. Próximos gargalos reais (na ordem em que provavelmente vão doer)

1. **Decisão de Gold** — enquanto Gold continuar sendo escrito direto em
   `xp.service.ts` fora do EventBus, todo trabalho de Marketplace fica
   bloqueado. Esta é a decisão arquitetural mais adiada do projeto.
2. **Classes** — o design já está fechado (`docs/design/classes-final-architecture.md`),
   falta só implementar. Sem isso, `SUS`/`Classe_mult` continuam
   placeholders neutros e nenhum build de personagem é realmente
   diferente de outro.
3. **Conteúdo, não código** — Encounter, Identity, Library e Bestiary
   têm infraestrutura pronta para receber centenas/milhares de entradas.
   O gargalo agora é **escrever conteúdo**, não construir mais sistemas
   (ver ETAPA 5 / `IMPLEMENTATION_BACKLOG.md`).
4. **`node:sqlite` é experimental** — o projeto depende de uma API Node
   ainda marcada como experimental; upgrades de Node podem quebrar algo
   sem aviso.
5. **Sem testes automatizados em CI** — toda verificação depende de
   harnesses manuais rodados sob demanda. Qualquer regressão silenciosa
   entre Sprints só é pega se alguém rodar o harness certo.

## 7. Convenções de verificação (para quem for continuar o trabalho)

- **Typecheck**: criar um `tsconfig.check.json` temporário (extends do
  tsconfig real, `composite: false`, sem `references`) em `apps/api` ou
  `apps/web`, rodar `npx tsc -p tsconfig.check.json --noEmit`, comparar
  contra a baseline conhecida (29 erros pré-existentes em
  `apps/api`, todos em arquivos de teste antigos do Engine e dois casts
  de `SQLOutputValue` — nunca esses arquivos são alterados). Apagar o
  tsconfig temporário depois.
- **Build**: `npm run build:web` (esbuild, deve ficar limpo).
- **Harness real**: script `.mjs` em `scratchpad`, `DB_PATH` isolado,
  importa módulos compilados via `pathToFileURL` + `import()` dinâmico
  rodado com `npx tsx`, dirige o `EventBus` real (nunca mocks).
- **Browser**: `.claude/launch.json` define `streamrpg-dev` (porta
  4000); seed de dados direto no `data/streamrpg.db` real via script,
  cookie de sessão via `document.cookie`, sempre limpar os dados de
  teste ao final (confirmado por contagem zero).

## 8. Ver também

- `docs/API_REFERENCE.md` — todas as 23 rotas HTTP.
- `docs/DATABASE_REFERENCE.md` — todas as 19 tabelas.
- `docs/COMPONENT_MAP.md` — todos os componentes React.
- `docs/IMPLEMENTATION_BACKLOG.md` — infraestrutura pronta, aguardando conteúdo.
- `docs/PROJECT_SNAPSHOT_2026-07-04.md` — retrato técnico consolidado de hoje.
- `docs/UPLOAD_GUIDE.md` — o que enviar para outra IA entender o projeto rápido.
- `docs/ARCHITECTURE_INDEX.md` — índice de toda a documentação de design/Sprints anteriores (75+ documentos classificados).
