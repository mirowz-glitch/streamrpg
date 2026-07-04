# Founder Identity & Prestige (MVP) — Review

Primeiro sistema de identidade permanente — Títulos e Molduras. Nenhuma
regra de gameplay foi alterada; XP, Gold, Drops, Boss, Combat, Economy,
Expedições e Encounter continuam byte-a-byte como estavam antes desta
Sprint. Tudo aqui é puramente cosmético.

## Arquitetura (Etapa 7)

Mesmo padrão já usado para o catálogo de Itens: `titles`/`frames`
(catálogo, seed idempotente) + `character_titles`/`character_frames`
(desbloqueios, `PRIMARY KEY (character_id, título/moldura_id)` — mesma
garantia de não-duplicação já usada em `boss_rewards`) +
`characters.equipped_title_id`/`equipped_frame_id` (um de cada por vez).

**Extensível:** adicionar um título/moldura novo é uma linha no catálogo
(`identity.service.ts`) mais um critério de desbloqueio — nunca uma
migração de schema nova. **Desbloqueável:** cada critério é uma leitura
pura sobre dados que já existem (nível, minutos assistidos,
`boss_rewards`, `expeditions`, `viewer_sessions`) — nenhum novo evento
emitido pelos sistemas de gameplay, um `IdentitySystem` novo só observa.
**Permanente:** desbloqueios nunca são revogados, nem por reset de
Season (não existe lógica de expiração em nenhum lugar). **Independente
de Seasons:** nenhum critério depende de capítulo 9 (Seasons) da Bible,
ainda Placeholder.

Só 6 títulos e 6 molduras para validar a infraestrutura (Etapa 7 pede
explicitamente "não implementar dezenas"):

| Título | Critério (leitura real) |
|---|---|
| Primeiro Aventureiro | Primeiro personagem já criado em todo o sistema |
| Founder Alpha | Um dos primeiros 50 personagens criados |
| Primeiro Reino | Primeiro a assistir em pelo menos um canal (`viewer_sessions`) |
| Explorador | 3+ regiões distintas em expedições concluídas |
| Boss Slayer | 1+ `boss_rewards` com `outcome = 'defeated'` |
| Veterano | 300+ minutos assistidos |

Molduras Bronze/Prata/Ouro são gates de nível (5/15/25); Fundador/Alpha
reaproveitam os mesmos critérios dos títulos equivalentes; Evento fica
deliberadamente sem critério (sempre `false`) — reservada, honestamente
documentada como "ainda sem gatilho real".

## Integração (Etapas 3-6, 9)

- **Perfil (Character Page):** nova seção "Identidade" — título/moldura
  equipados, data de criação, primeira expedição, Bosses derrotados,
  regiões descobertas, mais a lista de desbloqueados com botão
  Equipar/Remover. Avatar do cabeçalho ganha a borda da moldura equipada.
- **Overlay:** título abaixo do nome ("👑 {título}"), fonte pequena,
  nunca ocupando mais que uma linha extra.
- **Ranking:** `.ranking-title-slot` (reservado desde a Sprint Identity &
  Progression, vazio até agora) passa a mostrar o título real; avatar
  ganha a borda da moldura.
- **Mundo:** todo desbloqueio de título/moldura entra na Timeline
  incondicionalmente ("👑 {nome} tornou-se \"{título}\"." /
  "🖼️ {nome} conquistou a {moldura}.") — diferente dos Encounters
  (filtrados por categoria), um desbloqueio é sempre um marco raro.

## Verificação

- **Typecheck** (`apps/api`, `apps/web`): limpo; ~28 erros pré-existentes
  inalterados.
- **Build** (`esbuild`): limpo.
- **Harness** (EventBus real, DB isolada): personagem pré-qualificado
  para 4 títulos + 2 molduras; um único `world.tick` desbloqueou todos
  corretamente; segundo tick não re-concedeu nem duplicou (nem na tabela
  nem na Timeline); equipar título/moldura desbloqueados funciona e
  persiste; equipar um título **não** desbloqueado é recusado; remover
  título volta a `null`; stats do Perfil (Bosses derrotados, regiões
  descobertas, primeira expedição) batem com o dado real. Todos os 21
  checks passaram.
- **Browser ao vivo:** personagem de teste com título "Explorador" e
  moldura "Prata" equipados. Confirmado nos 3 lugares: Character Page
  ("👑 Explorador" abaixo do nome, seção Identidade completa com 4/6
  títulos e 2/6 molduras desbloqueados), Ranking (título visível no slot
  reservado, um segundo personagem sem título ao lado — a diferença é
  imediata), Overlay ("👑 Explorador" abaixo do nome, sem ocupar espaço
  extra). **Bug real encontrado e corrigido:** a borda da moldura no
  Ranking não aparecia — `.ranking-avatar`/`.overlay-avatar` nunca tinham
  `border-style` declarado (diferente de `.character-avatar`, que já
  tinha `border: 2px solid` antes desta Sprint), então `border-width`/
  `border-color` sozinhos não geravam nenhuma borda visível. Corrigido
  adicionando `border-style: solid` explícito em todas as 6 classes
  `.frame-border-*`. Todos os dados de teste removidos ao final
  (confirmado por contagem zero em cada tabela tocada; catálogo de 6
  títulos + 6 molduras permanece, é conteúdo real, não teste).

## Regressão

Confirmado por inspeção: nenhuma linha de `XPSystemV2`, `DropSystem`,
`BossCombatSystem`, `BossRewardSystem`, `BossSpawnSystem`,
`BossParticipationSystem`, `ExpeditionSystem`, `xp.service.ts` (caminho
de Gold/ping) ou `combat-model` foi tocada nesta Sprint. Os únicos
arquivos existentes modificados (`overlay.ts`, `ranking.ts`,
`world-state.service.ts`, `server.ts`, `database.ts`, `schema.ts`,
`engine/types.ts`) receberam apenas adições — novas tabelas, novos
campos opcionais em respostas já existentes, novo System registrado.
Nenhuma recompensa nova, nenhum balanceamento novo.

## Respostas

**O jogador parece único?**
Sim — confirmado ao vivo: dois personagens de nível parecido, um com
"👑 Explorador" e moldura Prata visível, outro sem nada, são
imediatamente diferentes ao olhar o Ranking ou o Overlay.

**O progresso visual ficou evidente?**
Sim — a moldura do avatar é a primeira coisa "permanentemente visível"
que cresce com o jogador (Bronze → Prata → Ouro) fora de números
(level/XP), e sobrevive em qualquer tela que mostre o avatar.

**O mundo ganhou protagonistas?**
Sim, ainda que de forma inicial — cada desbloqueio agora é um evento
público na Timeline do Reino ("👑 Fulano tornou-se..."), não um dado
escondido no banco. Com só 6 títulos, o "elenco" de protagonistas é
pequeno hoje — cresce conforme o catálogo crescer.

**A infraestrutura suporta centenas de títulos futuros?**
Sim, por design: cada título/moldura novo é uma linha de catálogo mais
uma função de critério (uma leitura pura) — nenhuma migração de schema
adicional é necessária para crescer de 6 para centenas. O único limite
real é a qualidade dos critérios (leituras cada vez mais específicas
podem exigir novas colunas/agregações no futuro, não um redesenho da
arquitetura de Títulos/Molduras em si).
