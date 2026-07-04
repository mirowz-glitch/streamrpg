# New Player Journey (MVP) — Review

Onboarding completo do primeiro acesso — sem popups invasivos, sem
tutorial gigante, sem bloquear navegação. Sprint exclusivamente de UX;
nenhuma regra de XP/Gold/Drops/Combat/Boss/Classes/Marketplace/Economy/
Kingdom Prestige/Expedition/Encounter foi alterada. Persistência
exclusivamente local (`localStorage`), nenhuma tabela/coluna nova.

## Arquitetura

`apps/web/src/lib/onboarding.ts` é a única fonte da verdade: 10 flags
booleanas simples (`welcome_seen`, `city_seen`, `world_seen`,
`ranking_seen`, `profile_seen`, `tutorial_completed`,
`first_item_announced`, `first_level_announced`, `first_boss_seen`,
`first_title_announced`) mais um contador (`eldrin_step`). `setFlag()`
também dispara um evento próprio (`streamrpg:onboarding-flag`) — usado
por componentes que precisam reagir a uma flag mudada por um **irmão**
na mesma página (ex: `EldrinGuide` reagindo ao `WelcomeCard` ser
dispensado), sem precisar esperar uma navegação/remount.

7 componentes em `components/onboarding/`, exatamente os nomes pedidos:
`WelcomeCard`, `FirstSteps`, `GuideBubble`, `JourneyProgress`,
`EldrinGuide`, `FirstItemCard`, `FirstLevelBanner`, mais
`FirstBossBanner` e `NewTitleModal` (também pedidos na lista de
implementação, fora da lista de "organização" mas com o mesmo espírito).
Um hook novo, `useFirstVisit(flag)`, captura no mount se é a primeira
visita (antes de marcar a flag para sempre) — usado por `GuideBubble` e
implicitamente por `AppNav` (brilho) e `FirstSteps`/`JourneyProgress`
(que leem as mesmas flags diretamente).

Todos os dados reais vêm de sistemas já existentes: `character.level`,
`/api/items` (primeiro equipamento), `identity.titles` (primeiro
título), `useBossState` (primeiro Boss), `character.total_minutes`
(quinto Primeiro Passo). Nenhum dado novo foi inventado.

## Verificação

- **Typecheck/Build:** limpos, mesma baseline de sempre.
- **Browser ao vivo, fluxo completo** com um personagem novo (nível 1,
  sem itens, sem títulos, 0 minutos): `WelcomeCard` apareceu no
  primeiro carregamento do Perfil, com todo o conteúdo pedido; ao
  dispensar, o menu mostrava brilho em Cidade/Ranking/Mundo (Personagem
  já sem brilho, pois `FirstSteps` marca `profile_seen` assim que a
  página monta); `Eldrin` mostrou sua primeira fala imediatamente após
  o `WelcomeCard` ser fechado (confirmando o evento de reatividade
  funcionando dentro da mesma página); visitando Cidade/Ranking/Mundo,
  cada `GuideBubble` apareceu uma única vez e o brilho correspondente
  no menu desapareceu; de volta ao Perfil, `FirstSteps` mostrava 4/5
  marcados (com risco), `JourneyProgress` avançou para "Explorador", e
  a segunda fala de Eldrin apareceu.
- **Celebrações**, com o mesmo personagem elevado a nível 2 + primeiro
  item + primeiro título + Boss ativo no canal: `NewTitleModal`
  apareceu ("👑 Novo Título / Explorador"), "Equipar agora" realmente
  equipou o título (confirmado pelo "👑 Explorador" no cabeçalho);
  `FirstLevelBanner` ("🎉 Primeiro Level Up!") e `FirstItemCard` ("Seu
  primeiro equipamento / Espada de Madeira") apareceram simultaneamente
  atrás do modal; ao informar o canal com Boss ativo,
  `FirstBossBanner` ("⚔ O Reino precisa de você.") apareceu acima do
  `BossCard` real, sem bloquear nada. Nenhum erro no console, nenhuma
  requisição falhando. Todos os dados de teste removidos ao final
  (contagem zero em cada tabela tocada).

## Regressão

Nenhum arquivo de XP/Gold/Drops/Combat/Boss/Classes/Marketplace/
Economy/Kingdom Prestige/Expedition/Encounter foi tocado. Os únicos
arquivos existentes modificados foram de apresentação
(`AppNav.tsx`, `CharacterPage.tsx`, `CityPage.tsx`, `WorldPage.tsx`,
`RankingPage.tsx`, `styles.css`) — todos receberam só adições.

## Respostas

**O jogador entende o que fazer?**
Sim — o `WelcomeCard` já entrega a lista do que vai acontecer; o brilho
no menu aponta fisicamente para onde ir; `FirstSteps` funciona como
checklist permanente até completar; Eldrin reforça verbalmente o
próximo passo nos momentos certos.

**O tutorial interrompe a experiência?**
Não — nenhum componente bloqueia navegação (nem o `WelcomeCard`, que só
ocupa espaço na própria página, nem `GuideBubble`/brilho/`FirstSteps`,
que são sempre discretos). Só `NewTitleModal` é um overlay real, e
mesmo assim tem uma saída rápida ("Mais tarde").

**O mundo parece acolhedor?**
Sim — o Reino recebe o jogador pelo nome (quando um canal já foi
informado), Eldrin fala como um NPC de verdade (curto, nunca repete), e
cada conquista real (item, level, título, Boss) ganha um momento
próprio em vez de passar despercebida.

**O fluxo aproveita os sistemas já existentes?**
Integralmente — nenhuma mecânica nova, nenhuma recompensa nova. Todo
onboarding é uma camada de apresentação sobre XP/Level/Drop/Identity/
Boss/Kingdom que já existiam antes desta Sprint.

**Existe motivo para continuar explorando?**
Sim — `JourneyProgress` dá um objetivo visual claro (chegar a
"Veterano"), `FirstSteps` nunca concede recompensa mas deixa claro que
faltam poucos passos, e as celebrações (item/level/título/Boss) mostram
que o jogo reage e recompensa presença real, não é um sistema vazio.
