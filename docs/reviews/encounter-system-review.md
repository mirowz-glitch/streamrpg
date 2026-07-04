# Encounter System (MVP) — Review

Transforma Expedições em narrativa curta através de Encounters — texto +
categoria + ícone, nunca uma recompensa. Nenhum combate real foi criado;
XP, Gold, Drops, Boss, Combat Model, Economy e Classes continuam
byte-a-byte como estavam antes desta Sprint.

## Etapa 1 — Base usada

Relidos antes de qualquer código: `world-design/random-events.md` (105
eventos em 8 categorias A-H), `exploration.md`, `lore-ambiental.md`, e o
próprio `ExpeditionSystem.ts`/Timeline construídos na Sprint anterior.
Nenhum documento foi alterado — apenas usado como base para os textos e
categorias abaixo.

## Etapa 2/3 — O que é um Encounter

Um Encounter é `{ categoria, ícone, texto }` — nunca um sistema de
recompensa. As 8 categorias já propostas pela Sprint mapeiam diretamente
para as categorias já existentes em `random-events.md`:

| Categoria | Ícone | Origem em random-events.md |
|---|---|---|
| Natureza | 🌲 | B (Natureza/Clima) + H (Ambientação regional) |
| Combate | ⚔ | C (Combate/Perigo) |
| Descoberta | 🎁 | D (Tesouro/Recompensa) — narrativa apenas, nenhum item real concedido |
| Descanso | 🏕 | Estado já existente da Expedição |
| Mistério | 🧙 | E (Místico/Mágico) |
| Comércio | 💰 | F (Econômico/Comercial) + parte de A (Social/NPC) |
| Clima | 🌧 | B (Natureza/Clima) |
| Ruínas | 🏛 | Eventos específicos de Ruínas Esquecidas (C/D/E), restritos a regiões com ruína de verdade |

## Etapa 4 — Compatibilidade estado × categoria

| Estado | Categorias permitidas |
|---|---|
| Preparando | Comércio, Natureza |
| Explorando | Natureza, Clima, Descoberta, Mistério, Comércio, Ruínas (só se destino tiver ruína) |
| Combatendo | Combate (exclusivo) |
| Descansando | Descanso, Comércio, Mistério |
| Retornando | Natureza, Clima |

Verificado no harness: nenhum Encounter de "Combatendo" jamais sorteou
categoria fora de Combate, e vice-versa.

## Etapa 5 — Persistência

Sem tabela nova, sem histórico infinito: dois campos a mais na já
existente `expeditions` (`current_encounter_category`,
`current_encounter_icon`, migração idempotente) guardam só o Encounter
**atual** de cada expedição — sempre um por estado, estável durante toda
a duração dele (não recalculado a cada tick). O "histórico curto" pedido
na Etapa 5 vive como um buffer em memória por Kingdom (capado em 15,
mesma decisão já aceita para a Timeline geral — reinicia com o servidor).

## Etapa 6 — Timeline

Só as categorias Combate/Mistério/Ruínas entram na Timeline principal —
Natureza/Clima/Descanso/Comércio/Descoberta ficam só no histórico de
Encounters do Reino (Etapa 9), nunca nos dois lugares ao mesmo tempo
(Etapa 6: "não duplicar mensagens"). O texto usado na Timeline é
exatamente o mesmo do Encounter (ícone + texto), nunca uma segunda
descrição do mesmo momento.

## Etapa 7/8 — Character Page e Overlay

"Aventura Atual" (Character Page) reaproveita o painel de Expedição já
existente, renomeado e enriquecido: Estado, Último encontro (ícone +
texto), Tempo, Região — tudo numa seção só, para não repetir "Estado"/
"Região" em dois painéis diferentes da mesma tela. Overlay compacto
mostra exatamente o formato pedido: "📍 região", encontro atual (ícone +
texto, em vez do rótulo genérico de estado), barra de progresso.

## Etapa 9 — World

Novo card "Encontros do Reino": últimos encontros (histórico em memória,
capado), regiões mais movimentadas (contagem de Encounters por região,
distinto de "regiões mais visitadas" que conta expedições) e tipos de
encontro mais frequentes. Tudo somente leitura.

## Verificação

- **Typecheck** (`apps/api`, `apps/web`): limpo; os ~28 erros
  pré-existentes continuam os mesmos.
- **Build** (`esbuild`): limpo.
- **Harness** (Etapa 10, EventBus real): expedição nasce já com um
  Encounter (sem esperar o próximo tick); Encounter observado e validado
  contra a tabela de compatibilidade em todos os 5 estados não-terminais;
  persistência confirmada após "refresh"; Timeline recebeu o encontro de
  combate; estatísticas do Reino calculadas corretamente (histórico
  ≤ 15, categorias mais frequentes, regiões mais movimentadas); todas as
  categorias observadas pertencem às 8 já existentes. Todos os checks
  passaram.
- **Browser ao vivo**: expedição de teste seedada (estado `combating`,
  destino Bosque Sussurrante, encounter "⚔ Lobos cercaram o grupo").
  Confirmado: Character Page mostra "Aventura Atual" com o encontro;
  Overlay mostra exatamente "📍 Bosque Sussurrante / ⚔ Lobos cercaram o
  grupo" + barra; World Page mostra o estado vazio honesto ("Nenhum
  encontro registrado ainda nesta sessão do servidor") já que o seed foi
  inserido direto no banco, sem passar pelo EventBus real — a agregação
  em si já foi validada pelo harness. Todos os dados de teste removidos
  ao final.

## Regressão (Etapa 11)

Confirmado por inspeção: nenhuma linha de `XPSystemV2`, `DropSystem`,
`BossCombatSystem`, `BossRewardSystem`, `xp.service.ts` (caminho de
Gold/ping) ou `combat-model` foi tocada nesta Sprint. As únicas mudanças
em arquivos existentes (`ExpeditionSystem.ts`, `expedition-status.service.ts`,
`world-state.service.ts`, `SQLiteExpeditionRepository.ts`, `engine/types.ts`,
`database.ts`, `routes/world.ts`) são estritamente aditivas ou
substituem a representação textual de um encontro (`current_event`) por
uma versão mais rica (`encounter`), nunca uma regra de jogo. Nenhuma
recompensa nova, nenhum balanceamento novo.

## Respostas (Etapa 12)

**Os encontros tornam a aventura mais interessante?**
Sim — antes, "Combatendo" era só um rótulo de estado; agora é "Lobos
cercaram o grupo". A mesma máquina de estados de antes ganhou uma voz.

**O jogador entende o que aconteceu?**
Sim, sem abrir logs — confirmado ao vivo: ícone + texto aparecem juntos
em Character Page e Overlay, no mesmo lugar onde já se via o estado.

**A Timeline ficou mais viva?**
Sim, com moderação deliberada — só combate/mistério/ruínas entram nela,
para não afogar Boss/level up/drop com narrativa de fundo repetitiva.

**Existe repetição excessiva?**
Um risco real, honestamente registrado: cada estado tem entre 3 e 8
frases fixas — com muitas expedições simultâneas de longa duração, a
repetição vai aparecer eventualmente. Não resolvido nesta Sprint
(aumentar o pool é conteúdo, não arquitetura) — fica como dependência
futura.

**Quais dependências futuras ficaram preparadas?**
1. O pool de Encounters por estado está isolado em `ExpeditionSystem.ts`
   — crescer o número de frases por categoria não exige tocar em nenhuma
   outra parte do sistema.
2. Encounters de Ruínas já usam o mesmo padrão de "restrito a região
   compatível" que Classes (Etapa 6 da Sprint anterior) já usa para
   regiões favorecidas — quando Combat Model real for conectado às
   Expedições, os Encounters de Combate já têm o gancho certo (o momento
   exato em que o dano deveria ser calculado) sem precisar redesenhar o
   fluxo.
3. "Regiões mais movimentadas"/"tipos mais frequentes" (Etapa 9) são
   in-memory, reiniciam com o servidor — se o volume justificar,
   persistir esses contadores é um passo futuro isolado, não uma
   mudança de arquitetura.
