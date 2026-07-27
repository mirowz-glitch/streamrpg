# Arquitetura Oficial do StreamRPG — Visão Geral

**Status:** 🟢 Canônico. Escrito na Sprint "RC1 Retrospective & Architecture Freeze", imediatamente após o Vertical Slice RC1 (Engine + Global Idle System + Living Character + Living World + Backpack Experience + City Foundation). Este documento descreve a arquitetura de **engenharia** realmente implementada — não confundir com `docs/ARCHITECTURE_INDEX.md` (canon de design/narrativa: Game Design Bible, Combat Model, World Constitution) nem com `docs/game-design-bible/14-architecture.md` (fluxo Twitch→EventBus→Systems, um eixo de arquitetura legado/comercial largamente não implementado). Este documento é sobre o código que existe hoje em `packages/shared`, `apps/web`, `apps/api`.

Nenhuma linha de código foi alterada para produzir este documento. É consolidação, não implementação.

---

## 0. Por que este documento existe

Depois de seis Sprints consecutivas (Engine em dezenas de sub-Sprints anteriores, Global Idle System, Living Character, Living World, Backpack Experience, City Foundation), o projeto tomou dezenas de decisões arquiteturais reais — mas nenhuma delas até agora vivia em um único lugar. Cada uma estava espalhada em documentos de preparação de Sprint (`docs/design/*-phase1.md`), no código em si, ou só na memória de quem construiu. Antes de começar Economy Core — o primeiro sistema que vai genuinamente testar se essa arquitetura aguenta um domínio nôvo e sensível (recursos, transações) — essas decisões precisam estar escritas uma vez, de forma que qualquer pessoa (ou sessão futura) consiga entender o sistema só lendo.

## 1. A Cadeia de Camadas

```
Engine (packages/shared)
     ↓
Adventure Session (apps/web/src/hooks/useAdventureSession.ts)
     ↓
Estado Global (hudState + idleStatus, compartilhado via singleton de módulo)
     ↓
Funções Puras (apps/web/src/lib/*.ts)
     ↓
React Components (apps/web/src/components, src/pages)
     ↓
UI (o que o jogador vê)
```

Cada seta é uma dependência de UMA via: uma camada só pode importar/consumir a camada imediatamente acima dela nesta lista. Nenhuma camada importa de uma camada abaixo dela.

### 1.1 Engine (`packages/shared`)

A camada mais interna. Contém toda regra de jogo real: geração de itens (`itemgen/`), combate (`combat/`), inimigos (`enemy/`), encontros de mundo (`worldencounter/`), progressão (`xp.ts`), recuperação (`recovery/`), objetivos (`objectives/`), expedições (`expeditions/`), facções (`factions/`), masmorras/chefes (`dungeon/`), eventos de mundo (`worldevents/`), World Tiers (`worldtiers/`), a Presentation Layer (`presentation/`), o HUD state (`hud/`), animações (`animation/`) e o Idle Driver (`idle/`).

**Responsabilidade**: decidir O QUE acontece na exploração — dano, loot, XP, chefes, checkpoints — de forma determinística e testável, com zero conhecimento de como isso é mostrado.

**Regra permanente**: a Engine nunca importa React, nunca importa `apps/web` ou `apps/api`, nunca sabe que existe um navegador. Isso é o que permite `packages/shared` ter 449 testes `node:test` puros, sem DOM, sem mock de rede, rodando em milissegundos, e o que permitiu construir um Simulador (`simulation/`) capaz de rodar milhares de campanhas fora de qualquer navegador — a ferramenta que calibrou todo o balanceamento do jogo (RNG, Combat, Loot, Bosses, Dungeons) ao longo de dezenas de Sprints.

### 1.2 Adventure Session (`apps/web/src/hooks/useAdventureSession.ts`)

Um singleton de módulo — não um Context React, não uma instância por componente. Nasceu na Sprint "Global Idle System — Architecture Refactor", que moveu o `IdleDriver` (antes vivendo dentro de `AdventurePage`) para este módulo, junto com o próprio tick global (`runGlobalTick()`).

**Responsabilidade**: ser o único ponto de contato entre a Engine e o resto do app. Mantém a instância viva do `IdleDriver`, roda o tick em intervalo (`idleTickIntervalId`), aplica os resultados no HUD state, persiste eventos (`persistTick()`, fire-and-forget), e notifica quem estiver inscrito (`subscribers: Set<() => void>`).

**Regra permanente**: existe exatamente UMA sessão de aventura por processo de navegador, independente de quantas telas montam o hook `useAdventureSession()`. Isso é o que torna a exploração "global" — sair da tela de Aventura para a de Cidade não pausa nada, porque não existe uma segunda instância do driver esperando ser criada.

### 1.3 Estado Global (`hudState` + `idleStatus`)

O valor de retorno do hook: `{ hudState, error, restart, ready, isDemoSession, lootRejectedFeedback, idleStatus, pauseIdle, resumeIdle, lastTickOutcome, msUntilNextTick }`.

**Responsabilidade**: ser a única fonte da verdade sobre "o que está acontecendo com o aventureiro agora" — região, status (explorando/pausado/em combate), HP, loot recente, equipamento, expedição/masmorra ativa, estatísticas. Qualquer tela que precisa saber algo sobre a aventura lê daqui, nunca duplica o cálculo.

**Regra permanente**: nenhuma tela mantém sua própria cópia de estado de aventura. Se um dado não existe no `hudState`, a resposta certa é perguntar se ele deveria ser derivado dele (ver 1.4), nunca inventar um segundo estado paralelo.

### 1.4 Funções Puras (`apps/web/src/lib/*.ts`)

Módulos como `adventureJourney.ts`, `adventureDiary.ts`, `adventureLiveState.ts`, `backpackFinds.ts`, `backpackJourney.ts`, `backpackSignals.ts`, `cityWelcome.ts`, `citySuggestions.ts` — cerca de 70 arquivos ao todo nesta pasta hoje.

**Responsabilidade**: toda agregação, classificação, formatação e derivação de texto/estado vive aqui — nunca dentro de um componente React. Uma função pura recebe dados (tipicamente uma fatia do `hudState` ou uma lista de `PresentationEvent`) e devolve dados prontos para exibição (strings, listas classificadas, sinais booleanos) — sem side effects, sem `useState`, sem acesso a `window`/DOM.

**Regra permanente**: se uma lógica de "o que devo mostrar" pode ser escrita e testada sem importar `react`, ela pertence a `lib/`, não a um componente. Este é o padrão mais repetido de todo o RC1 — nenhuma das 6 Sprints recentes quebrou essa regra uma única vez.

### 1.5 React Components (`apps/web/src/components`, `apps/web/src/pages`)

**Responsabilidade**: montar o hook, chamar as funções puras de `lib/` com os dados do estado, e renderizar o resultado. Um componente decide COMO algo aparece (classe CSS, ordem de elementos, condicional de exibição) — nunca O QUE deveria aparecer (isso já veio pronto de `lib/`).

**Regra permanente**: React nunca contém regra de gameplay. Um componente não decide se um item é upgrade, não calcula prioridade de um evento, não decide se a mochila está cheia — ele só recebe essas respostas já prontas.

### 1.6 UI

O que o jogador realmente vê e com o que interage — CSS, ícones, animação, layout. Camada final, sem lógica própria além de apresentação pura.

## 2. Dependências Permitidas e Proibidas

| De → Para | Permitido? |
| --- | --- |
| `packages/shared` → `apps/web` ou `apps/api` | **Proibido.** A Engine nunca importa a aplicação. |
| `packages/shared` → React, DOM, `window` | **Proibido.** |
| `apps/web/src/lib` → `packages/shared` | **Permitido e esperado.** `lib/` consome tipos e dados da Engine. |
| `apps/web/src/lib` → React | **Proibido.** Nenhum arquivo em `lib/` importa `react`. |
| Componentes React → `apps/web/src/lib` | **Permitido e esperado.** |
| Componentes React → `packages/shared` diretamente (pulando `lib/`) | **Permitido só para tipos/constantes simples** (ex.: `ItemGenRarityId`) — qualquer AGREGAÇÃO real (mais de um campo combinado, classificação, formatação) deve passar por uma função de `lib/`, nunca ficar inline no componente. |
| `apps/api` → `packages/shared` | **Permitido.** A API persiste o que a Engine já decidiu; não reimplementa regra de jogo. |
| `apps/api` → `apps/web` | **Proibido.** Backend não depende de frontend. |

## 3. Onde vive cada tipo de decisão

| Pergunta | Camada responsável |
| --- | --- |
| "Este item é um upgrade?" | Engine (`equipment/`, `itemgen/`) |
| "Quanto XP este encontro dá?" | Engine (`xp.ts`) |
| "A mochila está perto do limite?" | `lib/` (`backpackSignals.ts`, lê a capacidade real da Engine) |
| "Que texto mostro para 'jornada atual'?" | `lib/` (`adventureJourney.ts`) |
| "Esta cor de raridade é roxa ou dourada?" | Componente/CSS |
| "O saldo pode ficar negativo?" (futuro, Economy Core) | Engine/Ledger — nunca `lib/`, nunca componente |

## 4. Por que esta arquitetura, e não outra

A alternativa mais comum em projetos React — colocar `useEffect`/`useMemo` com lógica de agregação direto no componente — foi deliberadamente evitada em toda Sprint do RC1. A razão prática, não só estética: toda vez que uma lógica de "o que mostrar" viveu em `lib/`, ela pôde ser testada com `node:test` puro, sem *renderer* de React, sem jsdom, sem mock de hook — o mesmo motivo que já tornava a Engine testável em massa desde antes do RC1. As 88 suítes de teste de `apps/web/src/lib` (ver `docs/releases/rc1.md`) só existem porque essa regra foi seguida à risca.

A alternativa de um Context React global para o Estado Global também foi conscientemente rejeitada — o singleton de módulo em `useAdventureSession.ts` já resolve o mesmo problema (estado compartilhado entre telas) sem re-render em cascata de um Provider, e sem a necessidade de embrulhar a árvore de componentes. Ver `docs/architecture/decisions.md` para o registro formal dessa e das demais decisões, com alternativas descartadas e consequências.

---

*Referências: `docs/design/idle-experience-redesign.md` (Bíblia de UX, a origem de "o mundo nunca para"); `docs/design/living-character-phase1.md` (documentação de como o Estado Global passou a ser consultável de qualquer tela); `docs/design/backpack-experience-plan.md` e `docs/design/city-foundation-phase1.md` (reaproveitamento do padrão função-pura em `lib/`); `docs/architecture/domain-vocabulary.md` (nomenclatura de tipos, um nível abaixo desta visão geral).*
