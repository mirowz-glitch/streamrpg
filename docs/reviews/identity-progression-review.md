# Identity & Progression (MVP) — Review

Sprint de UX/apresentação, conduzida enquanto o First Playtest está pausado
aguardando uma live real. Nenhuma regra de Engine, XP, Gold, Drops, Boss,
Combat Model ou Economy foi alterada — apenas a forma como os dados que já
existiam são mostrados.

## Missão

Percorrer todas as telas pós-login perguntando "um jogador entende que
está ficando mais forte?" e melhorar onde a resposta fosse não.

## O que foi feito, tela por tela

### Character Page
Virou um perfil de verdade: nome, "Classe: Aventureiro" (placeholder
estático, sem coluna no banco — só reserva o espaço visual para quando
Classes existir de verdade), Nível, barra de XP com rótulo explícito
("faltam N para o próximo nível"), Gold, minutos assistidos e um novo
**Poder Total**.

Poder Total é a soma dos 6 números que já apareciam na grade de combate
(ATQ Físico + ATQ Mágico + Resistência Física + Resistência Mágica + SUS +
UTI). É um indicador visual, não um stat de combate — o
`BossCombatSystem` nunca lê esse número, ele nunca entra em nenhuma
fórmula. Existe só para dar ao jogador um número que sobe conforme ele
equipa itens melhores, sem precisar somar a grade de cabeça.

### Equipamento
Antes, a lista de equipados só mostrava os slots preenchidos — um
personagem com elmo/botas/anel vazios simplesmente não tinha essas linhas
na tela, e nada indicava que esses slots existiam. Agora todo personagem
sempre mostra os 6 slots (Arma, Armadura, Elmo, Botas, Amuleto, Anel);
slot vazio mostra "Não equipado" em itálico, nunca um espaço em branco.
Cada slot preenchido mostra raridade + atributo real (ATQ ou Resistência,
mais UTI quando existir) — os mesmos números já usados no Inventário,
sem fórmula nova.

Isso exigiu uma mudança mínima no backend: `getEquippedItems()`
(`drop.service.ts`) passou a trazer `damage_type`/`uti_bonus` junto (só
mais duas colunas no `SELECT`, mesmas colunas que `listInventory()` já
trazia) — sem isso, o Character Page não tinha como calcular o atributo
de cada item equipado sem uma segunda chamada de API.

### Inventário
Itens agora são agrupados por slot (Arma, Armadura, Elmo, Botas, Amuleto,
Anel), cada grupo com seu próprio cabeçalho — antes era uma lista única,
misturando tudo. Estado vazio ganhou uma caixa dedicada com texto
amigável em vez de uma frase solta.

### Overlay
Adicionado um log compacto de "quem entrou / quem saiu" (máximo 3 linhas,
fonte pequena) — mesmo padrão de diff client-side já validado no Boss
Experience (compara o poll atual com o anterior, sem nenhum evento novo
do backend). Também passou a mostrar o XP de cada viewer, não só o
nível — informação que a API já enviava (`OverlayViewer.xp`) e não era
exibida.

### Ranking
Cada posição agora mostra uma barra de progresso (`getProgress(xp)`,
mesma função pura já usada em todo o resto do projeto) e a diferença de
XP para a posição imediatamente acima — pura subtração sobre os XPs já
retornados pela API. O #1 mostra "🏆 Líder do ranking" em vez de uma
subtração sem sentido. Foi reservado um espaço vazio (`.ranking-title-slot`)
ao lado do nome para o título ativo de uma Sprint futura — sem nenhuma
lógica, só o layout já preparado, exatamente como pedido ("não
implementar títulos agora").

Também corrigido, de passagem: a lista já usava `<ol>` (numeração nativa
do navegador) e ao mesmo tempo escrevia "#N" manualmente — resultava em
dois números por linha. Removida a numeração nativa via CSS.

### Estados vazios, carregamento e feedback
Padronizadas as classes `.loading-state` e `.empty-state` (usadas agora
em Character/Inventory/Ranking). As mensagens de feedback (erro, level
up, drop, "item equipado/desequipado") foram consolidadas num componente
único (`Feedback.tsx`) reaproveitado por Character e Inventory — antes
cada página tinha seu próprio `<p className="...">` duplicado. Nenhum
evento novo foi inventado, só organizados os que já existiam.

### Refatoração (sem tocar arquitetura)
- Extraído `RARITY_COLOR`/`RARITY_LABEL` para `lib/rarity.ts` (antes só
  existia dentro de `InventoryPage.tsx`; agora reaproveitado também pelo
  Character Page).
- Removido CSS morto: `.compare-badge`/`.compare-better`/`.compare-worse`/
  `.compare-equal`/`.compare-new` (confirmado, via busca em todo
  `apps/web/src`, que nenhum componente usava essas classes — sobra de
  uma versão anterior do sistema de comparação, superada pelo
  `.item-comparison`/`.comparison-delta-*` da Sprint Equipment
  Experience) e `.stat-line`/`.equipped-list` (classes do markup antigo do
  Character Page, substituído nesta Sprint).

## Arquivos alterados

**Novos:**
- `apps/web/src/components/ui/EquipmentSlots.tsx`
- `apps/web/src/components/ui/Feedback.tsx`
- `apps/web/src/lib/rarity.ts`

**Modificados (aditivos, sem tocar regra de jogo):**
- `apps/api/src/services/drop.service.ts` — `getEquippedItems()` expõe
  `damage_type`/`uti_bonus`.
- `apps/api/src/routes/character.ts` — repassa os dois campos novos na
  resposta.
- `packages/shared/src/types.ts` — `EquippedItem` ganhou `damage_type`/
  `uti_bonus`.
- `apps/web/src/pages/CharacterPage.tsx` — reescrita da tela.
- `apps/web/src/pages/InventoryPage.tsx` — agrupamento por slot + estado
  vazio + `Feedback`.
- `apps/web/src/pages/OverlayPage.tsx` — log de entrada/saída + XP no
  card do viewer.
- `apps/web/src/pages/RankingPage.tsx` — barra de progresso, gap de XP,
  espaço reservado para título.
- `apps/web/styles.css` — classes novas + remoção de CSS morto.

## Verificação

- **Typecheck** (`apps/api`, `apps/web`, tsconfig temporário): limpo nos
  arquivos tocados; os ~28 erros pré-existentes (testes antigos,
  `SQLOutputValue` cast noise) continuam os mesmos de antes desta Sprint.
- **Build** (`esbuild`): limpo.
- **Browser ao vivo**: personagem de teste seedado (perfil + character +
  session + itens em 4 dos 6 slots, deixando Elmo/Botas/Anel-equipado
  vazios de propósito) direto em `data/streamrpg.db`, verificado e
  removido ao final. Confirmado: Character Page mostra os 6 slots (3
  preenchidos, 3 "Não equipado"), Poder Total = 17 (soma correta dos 6
  atributos: 5+0+6+0+4+2), Inventário agrupado por slot. Ranking testado
  com 2 personagens reais (700 XP e 450 XP): #1 mostrou "🏆 Líder do
  ranking", #2 mostrou "250 XP para alcançar #1" (delta correto) e "Sua
  posição: #2". Overlay testado com uma entrada e saída reais de viewer
  (via `channel_rankings.last_ping_at`): log mostrou "IdentityTester
  entrou" e, no poll seguinte após a remoção, "IdentityTester saiu",
  contagem de viewers indo de 0 → 1 → 0 corretamente. Todos os dados de
  teste foram removidos ao final (confirmado por contagem zero em cada
  tabela tocada).

## Regressões verificadas

Nenhum arquivo de XP, Gold, Drops, Boss, Combat Model ou Economy foi
tocado nesta Sprint. As únicas mudanças em arquivos de backend
(`drop.service.ts`, `character.ts`, `types.ts`) foram estritamente
aditivas — mais colunas numa consulta já existente e mais dois campos
opcionais num tipo já existente, nenhuma fórmula, nenhuma regra de
concessão de XP/Gold/Item alterada. `equipItem()`/`unequipItem()`
(as únicas funções que de fato mudam estado de equipamento) não foram
tocadas — só a leitura (`getEquippedItems`) foi expandida.

## Respostas

**Um jogador novo entende, em menos de 30 segundos, que está evoluindo?**
Sim, de forma mais direta que antes: o Character Page agora abre com
Nível, XP, Gold e Poder Total lado a lado, e os 6 slots de equipamento
sempre visíveis (nunca "sumindo" um slot vazio) deixam claro que ainda há
progresso disponível (itens para conseguir).

**Existe algum ponto ainda fraco?**
Sim: "Classe" continua sendo um placeholder estático ("Aventureiro") sem
nenhum dado real por trás — isso é intencional e documentado, mas
continua sendo um espaço da tela que hoje não evolui com o jogador. O
Overlay, por escolha explícita do escopo ("sem aumentar muito o
tamanho"), mostra só as últimas 3 entradas/saídas — em um canal com
tráfego alto, esse log vai rolar rápido demais para ser lido; isso é uma
limitação conhecida, não um bug.
