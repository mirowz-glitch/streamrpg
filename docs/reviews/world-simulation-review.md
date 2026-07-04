# World Simulation (MVP) — Review

Sprint de apresentação, conduzida enquanto o First Playtest continua
pausado aguardando uma live real. Nenhuma regra de gameplay, XP, Gold,
Drops, Combat, Boss, Economia ou Balance foi alterada — tudo aqui é
leitura de dados que já existiam (Engine em memória ou agregados de
banco) ou conteúdo já escrito no World Design.

## Missão

"Hoje o jogador vê números. Quero que ele veja um mundo." — duas fontes
de dado, nenhuma inventada:

1. **Estado ao vivo**: tick atual e diff de sessões, lidos diretamente do
   `EventBus` (mesmo padrão do `DebugEventSubscriber`, só que sempre
   ativo, não atrás de uma flag de debug); `sessionManager.getActiveCount()`
   já existente, sem nenhuma lógica nova de presença.
2. **Agregados de banco**: `COUNT`/`SUM` sobre `characters`, `bosses`,
   `character_items` — tabelas que já existiam, nenhuma nova.

## Parte 1 — Painel "Mundo"

Horário do Reino (relógio real do servidor, só reapresentado com tema),
Tick atual, Jogadores online, Boss ativo (contagem agregada de
`bosses` com status `awaiting`/`active`) e Último evento (o mais recente
da Timeline, ou a mensagem de estado quando ela está vazia).

## Parte 2 — Timeline

Novo `WorldEventSubscriber` (`world-state.service.ts`), registrado
incondicionalmente em `server.ts` — mesmo princípio do
`DebugEventSubscriber` (só observa eventos que já existem: `session.started`,
`level.up`, `drop.granted`, `boss.spawned/activated/defeated/escaped`, e o
diff de sessões a cada `world.tick` para derivar "saiu", já que não existe
um evento `session.ended` dedicado). Buffer em memória, cap de 20,
mais recente primeiro.

**Limitação honesta:** por ser só em memória, a Timeline começa vazia a
cada reinício do servidor — mostra "o que aconteceu desde que o mundo
ligou", não um histórico persistente. Não existe uma tabela de log de
eventos genérica no schema; criar uma seria além do escopo desta Sprint
("apenas apresentação").

**Gap conhecido, não inventado:** a lista de exemplo da Sprint incluía
"Equipou item." — não existe hoje nenhum evento de `EventBus` para
equipar (`equipItem()` em `drop.service.ts` só grava no banco, não emite
nada). Adicionar esse evento tocaria um arquivo listado em "Não alterar
Drops"; a Timeline simplesmente não mostra esse tipo de evento, em vez de
inventar um dado que não existe.

## Parte 3 — Sensação de atividade

`getIdleFlavor(playersOnline)` — three faixas reais (0 / 1-3 / 4+)
mapeadas para "O Reino está tranquilo." / "Poucos aventureiros ativos." /
"Exploradores continuam viajando pelo Reino." Mostrada no lugar da
Timeline quando ela está vazia, nunca junto.

## Parte 4 — Identidade das regiões

`RegionGallery` + `lib/regions.ts` — as 11 regiões já documentadas em
`docs/world-design/regions.md` (Porto do Amanhecer até Fortaleza
Sombria), cada uma com Nome, Descrição curta (a frase "Sensação" que o
próprio documento já usa), Dificuldade e Tema (campo "Atmosfera").
Nenhuma região nova, nenhum valor do World Design alterado — conteúdo
puramente transcrito para a UI.

**Gap conhecido, não inventado:** o painel "Mundo" não mostra "Região
atual" por jogador — não existe nenhuma coluna de localização/região no
schema (`characters`, `viewer_sessions` etc.), então esse campo exigiria
inventar um dado. Em vez disso, a galeria de regiões (Parte 4) cobre a
identidade das regiões de forma factual, sem fingir que o jogo já
rastreia onde cada personagem está.

## Parte 5 — Painel "Estado do Reino"

Jogadores ativos, Boss (contagem ativa agora), Gold em circulação
(`SUM(gold)`) — tudo somente leitura. "Exploração" mostra "Em breve": não
existe nenhum sistema de exploração/expedição implementado (World Design
é só narrativo, nunca virou mecânica), então o espaço foi reservado em
vez de preenchido com um número inventado.

## Parte 6 — Progressão coletiva

"O Reino possui X aventureiros" (`COUNT(*) FROM characters`), "O Reino
derrotou Y Bosses" (`COUNT(*) FROM bosses WHERE status='defeated'`), "O
Reino encontrou Z itens" (`COUNT(*) FROM character_items`, cobre drops de
tick e recompensas de Boss, as duas únicas fontes de item hoje). Todos os
três têm dado real por trás — nenhum foi omitido nem inventado.

## Parte 7 — Refatoração

Reaproveitado o padrão visual `.identity-stats`/`.identity-stat` (criado
na Sprint Identity & Progression) em vez de inventar um novo componente
de "cartão de estatística" — consistência entre as telas. Os tipos de
resposta (`WorldPanel`, `KingdomState`, `KingdomStats`, `TimelineEvent`)
são declarados uma única vez em `packages/shared/src/types.ts` e
importados por `world-state.service.ts`, mesmo padrão já usado por
`boss-status.service.ts`/`BossStateSnapshot` — sem duplicar a forma do
dado entre backend e o contrato HTTP.

## Parte 8 — Auditoria final

"O jogador sente que existe um mundo funcionando, ou só uma coleção de
telas?" — verificado ao vivo no navegador (ver Verificação abaixo): o
relógio avança sozinho, o tick incrementa de verdade a cada 60s, os
agregados (Gold em circulação, Bosses derrotados, itens encontrados)
mudam assim que o estado real do banco muda, e a galeria de regiões dá
identidade a cada trecho do mundo. A resposta é sim, com duas ressalvas
já documentadas acima (Timeline reseta ao reiniciar; "Região atual" por
jogador não existe) — nenhuma delas escondida.

## Arquivos alterados

**Novos:**
- `apps/api/src/services/world-state.service.ts`
- `apps/api/src/routes/world.ts`
- `apps/web/src/pages/WorldPage.tsx`
- `apps/web/src/components/ui/Timeline.tsx`
- `apps/web/src/components/ui/RegionGallery.tsx`
- `apps/web/src/lib/regions.ts`

**Modificados (aditivos):**
- `apps/api/src/server.ts` — registra `WorldEventSubscriber` (sempre
  ativo) e `worldRoutes`.
- `packages/shared/src/types.ts` — `TimelineEvent`, `WorldPanel`,
  `KingdomState`, `KingdomStats`, `WorldStateResponse`.
- `apps/web/src/lib/router.tsx` — rota `/app/world`.
- `apps/web/src/components/ui/AppNav.tsx` — link "Mundo".
- `apps/web/styles.css` — classes novas (`.timeline-*`, `.region-*`,
  `.kingdom-stats-*`).

## Verificação

- **Typecheck** (`apps/api`, `apps/web`): limpo nos arquivos tocados; os
  ~28 erros pré-existentes continuam os mesmos de antes desta Sprint.
- **Build** (`esbuild`): limpo.
- **Harness** (EventBus real, DB isolada em scratchpad): 20 asserções —
  Timeline vazia → `session.started` vira "entrou" com nome real →
  `world.tick` real avança o tick e reflete `players_online` real via
  `sessionManager` → `level.up`/`drop.granted`/Boss (spawned → activated →
  defeated) viram eventos corretos → agregados (`bosses_active_now`,
  `bosses_defeated_total`, `adventurers_total`) refletem o banco real →
  diff de sessão no tick seguinte vira "saiu" → cap de 20 eventos
  respeitado mesmo forçando 25 emissões. Todas passaram.
- **Browser ao vivo**: verificado em dois estados. (1) Reino vazio (banco
  zerado de verdade): tick "—", 0 jogadores, "Nenhum" Boss, idle flavor
  "O Reino está tranquilo." tanto no painel quanto na Timeline, todas as
  11 regiões renderizadas. (2) Após inserir um Boss derrotado real, Gold
  real (42.5) e um item real: "Tick atual" passou a mostrar "1" (o
  `GameEngine` real do servidor de dev tickou sozinho), "Gold em
  circulação" mostrou 42.5, "O Reino derrotou 1 Boss" e "O Reino encontrou
  1 item" corretos. Todos os dados de teste foram removidos ao final
  (confirmado por contagem zero em cada tabela tocada).

## Regressões verificadas

Nenhum arquivo de XP, Gold, Drops, Combat, Boss (Systems), Economia ou
Balance foi alterado. `server.ts` só ganhou linhas novas (import +
registro do subscriber e das rotas), nada existente foi removido ou
modificado — confirmado via diff. `world-state.service.ts`/`routes/world.ts`
são arquivos inteiramente novos, sem nenhuma escrita no banco (só
`SELECT`/`COUNT`/`SUM`).
