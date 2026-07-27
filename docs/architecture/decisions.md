# Decisões Arquiteturais — RC1

**Status:** 🟢 Canônico. Cada decisão abaixo já era seguida na prática ao longo do RC1 — este documento é o registro formal, não uma nova regra. A partir desta Sprint, qualquer uma delas só pode ser revertida por um RFC explícito (ver `docs/architecture/architecture-freeze-rc1.md`).

Formato de cada entrada: a decisão, a motivação, as alternativas descartadas e por quê, e as consequências futuras (o que ela facilita ou bloqueia).

---

## D1 — Engine nunca conhece React

**Decisão**: nenhum arquivo em `packages/shared` importa `react`, DOM, `window`, ou qualquer módulo de `apps/web`/`apps/api`.

**Motivação**: a Engine precisa ser executável e testável fora de um navegador — é isso que torna o Simulador (`packages/shared/src/simulation/`) possível, e o Simulador foi a ferramenta real usada para calibrar Combat/Loot/Progressão/Dungeons/Bosses ao longo de dezenas de Sprints anteriores ao RC1. Sem esse isolamento, cada rodada de calibração exigiria abrir um navegador e jogar manualmente.

**Alternativas descartadas**: acoplar a Engine a hooks React desde o início (mais rápido para o primeiro protótipo, mas tornaria o Simulador impossível sem reescrever a Engine depois — o mesmo padrão de "construir sobre uma base que precisa ser desfeita depois" que o projeto já identificou e evitou em outras decisões, ver `commercial/roadmap/project-valuation-roadmap.md` Seção 0.6).

**Consequências futuras**: qualquer sistema novo que precise ser calibrado por simulação (Economy Core incluso, se algum dia precisar simular economia) deve nascer em `packages/shared`, nunca em `apps/web`.

---

## D2 — React nunca contém regra de gameplay

**Decisão**: um componente React não decide se um item é upgrade, não calcula prioridade de evento, não decide se um saldo é suficiente — ele só renderiza uma resposta já calculada por `lib/` ou pela Engine.

**Motivação**: regra de jogo dentro de JSX não é testável sem um renderer, é invisível para o Simulador, e tende a ser duplicada entre componentes (o mesmo cálculo reaparecendo em `InventoryPage.tsx` e `EquipmentSlots.tsx`, por exemplo — o tipo de duplicação que `docs/architecture/domain-vocabulary.md` já documentou e corrigiu para outros casos).

**Alternativas descartadas**: `useMemo` com lógica de agregação inline no componente (comum em projetos React, mas some do campo de testes puros e tende a divergir entre componentes irmãos).

**Consequências futuras**: qualquer revisão de código que encontre um `if` de regra de negócio dentro de um `.tsx` deveria tratar isso como um sinal de extração pendente para `lib/`, não como estilo aceitável.

---

## D3 — Toda agregação pertence ao `lib/`

**Decisão**: qualquer função que combina, classifica, prioriza ou formata mais de um campo de estado em texto/estrutura de exibição vive em `apps/web/src/lib/*.ts`, como função pura, sem import de `react`.

**Motivação**: é o padrão que permitiu testar (`node:test`, sem jsdom) toda a lógica de narrativa construída nas últimas 4 Sprints — `adventureJourney.ts`, `adventureDiary.ts`, `backpackFinds.ts`, `backpackJourney.ts`, `backpackSignals.ts`, `cityWelcome.ts`, `citySuggestions.ts` somam 88 testes hoje, todos sem nenhum componente montado.

**Alternativas descartadas**: nenhuma foi seriamente considerada — este padrão nasceu já na primeira Sprint que precisou dele (Living Character Phase I) e nunca foi violado desde então.

**Consequências futuras**: Economy Core, ao decidir como mostrar saldo/histórico de transação (mesmo que a Sprint de UI ainda não exista), deve seguir o mesmo padrão — qualquer formatação de "quanto você tem"/"o que mudou" nasce como função pura testável antes de qualquer JSX.

---

## D4 — Estado Global é a única fonte de verdade

**Decisão**: existe um único `hudState` (mais `idleStatus`) por sessão de navegador, mantido pelo singleton `useAdventureSession.ts`. Nenhuma tela mantém uma cópia paralela do estado de aventura.

**Motivação**: antes do Global Idle System, o `IdleDriver` vivia dentro de `AdventurePage` — sair da tela pausava a exploração de fato, porque a instância do driver era destruída com o componente. Elevar o driver para um singleton de módulo eliminou essa classe inteira de bug, e é o que torna Living Character/Living World/Backpack/City Foundation possíveis sem nenhuma tela precisar "puxar" dados manualmente de outra.

**Alternativas descartadas**: um Context React global (resolveria o compartilhamento, mas cada atualização de estado dispararia re-render em cascata por toda a árvore de componentes inscrita, e exigiria embrulhar toda a aplicação num Provider); manter uma instância de driver por tela com sincronização manual entre elas (mais complexo, mais propenso a divergência, sem benefício real sobre o singleton).

**Consequências futuras**: qualquer sistema novo que precise de estado compartilhado entre telas (Economy Core incluso) deveria avaliar primeiro se pode ser mais um campo do mesmo Estado Global, antes de introduzir um segundo mecanismo de compartilhamento.

---

## D5 — Componentes apenas apresentam dados

**Decisão**: um componente React (isolado, `memo`, ou não) só tem duas responsabilidades: montar o(s) hook(s) que fornecem dado, e renderizar esse dado com CSS/JSX. Nenhuma terceira responsabilidade (validação, cálculo, side-effect de negócio) é aceita.

**Motivação**: mesma motivação de D2, e o padrão que permitiu que `AdventureLivePanel`/`BackpackNarrativePanel` fossem isolados com sua própria assinatura de `useAdventureSession()` sem duplicar nenhuma lógica de derivação — a lógica sempre veio de uma função de `lib/` importada, nunca reescrita ali.

**Alternativas descartadas**: nenhuma — este é um corolário direto de D2/D3, não uma decisão isolada.

**Consequências futuras**: nenhuma tela futura de Economy Core (Mercador, Ferreiro, Banco) deveria calcular preço, validar saldo, ou decidir resultado de transação dentro do componente — isso é trabalho do Resource Ledger/Transaction Layer (ver `docs/design/economy-core-phase1.md`).

---

## D6 — Browser Validation é obrigatória para toda Sprint que toca UI

**Decisão**: nenhuma Sprint que altera comportamento visível ao jogador é considerada concluída sem uma validação real em navegador (não só typecheck/testes), cobrindo o fluxo de navegação completo relevante à mudança.

**Motivação**: testes unitários (`node:test`) provam que uma função pura devolve o valor certo — não provam que o React realmente renderiza esse valor, que a navegação client-side não quebra o estado, ou que o console está livre de erros. O projeto já documentou um caso concreto onde isso importou: `navigate()` da ferramenta de browser faz reload completo (destrói o singleton de módulo) — só descoberto porque a Browser Validation testava navegação real, não só o retorno de uma função.

**Alternativas descartadas**: confiar só em typecheck + suíte de testes (mais rápido, mas já teria deixado passar a regressão de navegação acima, e deixaria passar qualquer quebra puramente visual/CSS).

**Consequências futuras**: Economy Core, mesmo sendo "só arquitetura, sem interface" nesta Sprint, ainda precisa de uma Browser Validation de regressão (fluxo Adventure→Inventory→City→Merchant→Blacksmith→Bank→Adventure) — não para validar uma UI nova, mas para confirmar que nada quebrou.

---

## D7 — Arquitetura incremental, sem refatoração destrutiva

**Decisão**: cada Sprint constrói sobre o que já existe (reaproveitando `lib/` já escrito, tipos já definidos, componentes já validados) em vez de reescrever camadas inteiras — mesmo quando uma reescrita pareceria "mais limpa".

**Motivação**: o próprio histórico do RC1 é evidência — Living World Phase II reaproveitou `formatRelativeTime`/`rarityLabel` de Living Character; Backpack Experience reaproveitou o padrão de classificação por prioridade de `adventureDiary.ts`; City Foundation reaproveitou `buildRecentFinds`/`deriveBackpackSignals` inteiros, sem duplicar uma linha. Nenhuma Sprint precisou desfazer o trabalho da anterior.

**Alternativas descartadas**: "big rewrite" por sistema quando um padrão passa a se repetir (tentador quando um terceiro caso de uso aparece, mas historicamente mais caro do que estender o padrão existente, e nenhuma Sprint do RC1 encontrou evidência de que fosse necessário).

**Consequências futuras**: Economy Core deve, sempre que possível, seguir o mesmo molde estrutural de módulo já usado por `idle/`, `presentation/`, `hud/` (types.ts + lógica + index.ts) em vez de inventar uma convenção nova.

---

## D8 — Persistência é uma fronteira, não uma extensão da Engine

**Decisão**: `apps/api` traduz o que a Engine decide para o schema de banco (SQLite) na fronteira — a Engine nunca sabe que SQL existe, e o schema nunca dita uma regra de jogo.

**Motivação**: já formalizado indiretamente em `docs/architecture/domain-vocabulary.md` (Seção 2.7, sobre `apps/api/src/engine/types.ts` ser deliberadamente espelhado, não importado, para isolar a Engine de qualquer dependência de infraestrutura) e reafirmado em `docs/design/gold-architecture-phase1.md` Seção 7 ("o lado de GASTO vive inteiramente em `apps/api`... nunca em `packages/shared`").

**Alternativas descartadas**: dar à Engine conhecimento direto do schema SQL (mais direto no curto prazo, mas acoplaria regra de jogo a uma escolha de banco específica, e impediria testar a Engine sem banco).

**Consequências futuras**: Economy Core precisa decidir explicitamente onde a linha entre "regra do Ledger" (Engine, `packages/shared/src/economy/`) e "como o Ledger é gravado em disco" (`apps/api`) fica — ver `docs/design/economy-core-phase1.md` Seção de Persistência.

---

*Cada decisão aqui é considerada CONGELADA no sentido de "não pode ser silenciosamente contradita" — mudá-la exige um RFC explícito, não uma escolha implícita de uma Sprint futura. Ver `docs/architecture/architecture-freeze-rc1.md` para o que está aberto vs. congelado.*
