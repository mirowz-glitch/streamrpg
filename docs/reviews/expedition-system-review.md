# Expedition System (MVP) — Review

Primeiro sistema de Expedições, usando exclusivamente arquitetura já
existente (EventBus/Systems/Repositories, mesmo padrão de Boss). Nenhum
combate novo foi criado — "Combatendo" é um rótulo de estado com texto de
sabor, nunca uma luta real contra stats de monstro. XP, Gold, Drops,
Boss, Economy e Combat Model continuam byte-a-byte como estavam antes
desta Sprint.

## Etapa 1 — Base usada

Relidos antes de qualquer código: World Design (`regions.md`, `roads.md`),
Gameplay Design, Boss (Bible cap. 6 + `technical-design/boss-system.md`),
World Simulation (`world-state.service.ts`, `WorldPage.tsx`) e Combat
Model. Nenhum documento foi alterado.

## O que foi construído

- **Schema**: tabela `expeditions` (região de origem/destino/atual,
  estado, progresso, evento atual, timestamps) — mesmo padrão de índice
  parcial único já usado por Boss ("uma expedição ativa por personagem
  por vez").
- **Grafo de regiões** (`packages/shared/src/regions.ts`): as 11 regiões
  já documentadas em `world-design/regions.md`, com adjacência refletindo
  `roads.md` (Última Coroa/Capital tratada como travessia implícita entre
  primeiro e segundo anel, não como um nó de viagem próprio — simplificação
  documentada, não uma região nova). Inclui BFS (`shortestPathLength`) para
  o tempo de viagem escalar com a distância real do grafo.
- **`ExpeditionSystem`**: reage a `session.started` (garante que todo
  personagem com presença tenha uma expedição) e `world.tick` (avança
  estado/progresso). Modelo de viagem: toda expedição parte do hub (Porto
  do Amanhecer), sorteia um destino entre as demais 10 regiões, viaja
  (tempo proporcional à distância BFS), combate/descansa, retorna, conclui
  — e uma nova expedição começa imediatamente. Emite `expedition.started`,
  `expedition.state_changed`, `expedition.completed` (Gameplay/Character,
  nunca `channelId` — mesmo princípio de `xp.granted`/`level.up`).
- **`expedition-status.service.ts`**: leitura pura para a API (mesmo
  padrão de `boss-status.service.ts`/`world-state.service.ts`).
- **Frontend**: `ExpeditionPanel` (Character Page — região atual, destino,
  trilha origem→destino, estado com ícone, progresso, tempo estimado,
  evento atual), `ExpeditionCompact` (Overlay — versão compacta por
  viewer), integração no World Page (Etapa 8 — "Exploração" deixou de
  mostrar "Em breve", agora mostra expedições ativas reais + regiões mais
  visitadas).
- **Timeline**: só os dois momentos mais narrativos (chegada ao destino,
  conclusão) entram no buffer de 20 eventos — as transições intermediárias
  (preparing→exploring→resting→returning) não empurram evento, para não
  encher o buffer só com expedições quando vários personagens estão
  presentes ao mesmo tempo (ver seção "Dependência futura" abaixo).

## Etapas 3-5 — Estados, Movimento, Eventos

| Estado | Ícone | Descrição | Duração (ticks) |
|---|---|---|---|
| Preparando | 🎒 | Organizando equipamento, revisando rota | 1 |
| Explorando | 🚶 | Viajando até o destino | distância BFS até o destino (mín. 1) |
| Combatendo | ⚔️ | No destino — rótulo apenas, sem dano real | 2 |
| Descansando | 🏕️ | Recuperando o fôlego | 1 |
| Retornando | ↩️ | Viajando de volta ao hub | mesma distância da ida |
| Concluída | 🏁 | Terminal — nova expedição começa no mesmo tick | 0 |

Movimento nunca teleporta — todo destino é alcançado via
`getNeighbors()`/BFS sobre o grafo real de `roads.md`. Eventos mostrados
("Encontrou inimigos", "Atravessando uma ponte", "Entrando em ruínas
antigas", etc.) são todos texto de sabor pré-definido, nunca inventando
uma mecânica nova — confirmado no harness que "Combatendo" nunca chama
nenhuma função de dano.

## Verificação

- **Typecheck** (`apps/api`, `apps/web`): limpo nos arquivos tocados; os
  ~28 erros pré-existentes continuam os mesmos.
- **Build** (`esbuild`): limpo.
- **Harness** (Etapa 10, EventBus real, DB isolada): expedição criada
  automaticamente ao reportar presença real (`sessionManager.reportPresent`,
  mesmo caminho do ping); nasce em `preparing`, origem sempre o hub,
  destino diferente da origem; ciclo completo (`preparing`→...→`returning`)
  observado em 8 ticks reais de `world.tick`; nova expedição iniciada
  automaticamente após conclusão, também partindo do hub; persistência
  confirmada por releitura direta do banco ("refresh"); exatamente 1
  expedição ativa e 1 concluída no total; regiões mais visitadas
  calculadas a partir do histórico real. Todos os checks passaram.
- **Browser ao vivo**: expedição de teste seedada direto em
  `data/streamrpg.db` (estado `combating`, destino Ruínas Esquecidas,
  50% de progresso). Confirmado: Character Page mostra painel completo
  (trilha "Porto do Amanhecer → Ruínas Esquecidas", região atual,
  destino, "⚔️ Combatendo", "~5 min", "50% da expedição concluído", evento
  "Entrando em ruínas antigas"); Overlay mostra a versão compacta por
  viewer ("📍 Ruínas Esquecidas · ⚔️ Combatendo" + barra); World Page
  mostra "Exploração: 1 expedição em andamento" e "Regiões mais
  visitadas: Ruínas Esquecidas — 1 expedição". Todos os dados de teste
  foram removidos ao final (confirmado por contagem zero).

## Regressão (Etapa 11)

Confirmado por inspeção de diff: as únicas mudanças em arquivos
existentes (`schema.ts`, `engine/types.ts`, `server.ts`, `overlay.ts`,
`world-state.service.ts`, `routes/world.ts`, `packages/shared/src/types.ts`)
foram estritamente aditivas — nova tabela, novos tipos de evento, novo
System registrado, novos campos em respostas já existentes
(`OverlayViewer.expedition`, `KingdomState.expeditions_active`
substituindo o antigo placeholder `exploration_available: false`,
`WorldStateResponse.most_visited_regions`). Nenhuma linha de
`XPSystemV2`, `DropSystem`, `BossCombatSystem`, `BossRewardSystem`,
`xp.service.ts` (caminho de Gold/ping) ou `combat-model` foi tocada.
XP, Gold, Drops, Boss, Economia e Combat continuam idênticos.

## Respostas (Etapa 12)

**A expedição tornou o mundo mais vivo?**
Sim. Antes desta Sprint, um personagem presente só produzia números
subindo (XP, Gold) sem nenhuma representação de "onde" ou "fazendo o
quê". Agora, tanto o próprio jogador (Character Page) quanto quem assiste
pelo Overlay veem uma jornada em andamento — região, estado, progresso —
conectando Boss, Timeline, Kingdom e Overlay num fio narrativo contínuo,
exatamente o objetivo declarado da Sprint.

**O jogador entende onde seu personagem está?**
Sim, sem precisar abrir logs — confirmado ao vivo: em menos de 10
segundos de carregar `/app/character`, região atual, destino, estado e
progresso aparecem juntos no painel "Expedição Atual", satisfazendo o
critério de sucesso da Sprint.

**O sistema reutiliza corretamente o World Design?**
Sim — nenhuma região nova, nenhuma estrada inventada. A única
simplificação deliberada foi tratar Última Coroa (a Capital, uma cidade)
como travessia implícita entre os dois anéis de região em vez de um nó de
viagem próprio — documentado explicitamente em
`packages/shared/src/regions.ts`, não escondido.

**Existe alguma dependência futura?**
Sim, três, todas registradas honestamente:
1. **Combat Model real**: "Combatendo" continua sendo só um rótulo —
   quando Classes (já fechado em design, `docs/design/classes-final-architecture.md`)
   e a fórmula canônica forem implementadas de verdade em expedições,
   este sistema já tem o estado/timing certo para receber dano real sem
   precisar ser redesenhado, só conectado.
2. **Timeline com muitos personagens simultâneos**: a decisão de só
   registrar "chegou ao destino" e "concluiu" (não cada transição
   intermediária) foi deliberada para não estourar o buffer de 20 eventos
   — se o volume de jogadores crescer muito, pode valer a pena um buffer
   dedicado só para expedições, separado do buffer geral do Mundo.
3. **Kingdoms**: "regiões mais visitadas" hoje é global (todo o banco,
   não por canal) — quando Kingdoms (ainda Placeholder, ver
   `docs/ARCHITECTURE_INDEX.md`) definir o escopo real de "por canal",
   essa agregação precisará ser refeita por Kingdom, não antes.
