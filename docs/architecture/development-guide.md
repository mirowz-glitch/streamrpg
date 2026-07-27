# Guia de Desenvolvimento — StreamRPG

**Status:** 🟢 Canônico. Respostas práticas para as perguntas que qualquer Sprint nova precisa responder antes de escrever código. Pressupõe `docs/architecture/overview.md` e `docs/architecture/decisions.md` já lidos.

## Onde criar novas regras de gameplay?

Em `packages/shared`, dentro do módulo existente cujo domínio ela pertence (`combat/` para dano, `itemgen/` para geração de item, `dungeon/` para masmorra/chefe) — ou em um módulo novo, se o domínio é genuinamente novo (ex.: `idle/` nasceu assim para o Global Idle System). Nunca em `apps/web`, nunca em `apps/api`.

**Teste**: se a regra precisa ser calibrada por simulação, ou se ela decide "o que acontece" (não "o que mostrar"), ela é regra de gameplay e pertence aqui.

## Quando criar um hook?

Só quando o dado exige assinatura/inscrição em um estado vivo (como `useAdventureSession()` faz com o singleton de módulo) ou gerenciamento de ciclo de vida do React (montagem/desmontagem, intervalo próprio). Um hook não deveria conter lógica de agregação — ele busca/inscreve dado e devolve; a agregação em si é responsabilidade de uma função pura de `lib/` chamada de dentro do componente.

**Não crie um hook** só para "organizar" uma função pura sem estado — isso é over-engineering; uma função pura importada diretamente já resolve.

## Quando criar uma função pura em `lib/`?

Sempre que a resposta para "o que devo mostrar" depender de mais de um campo do Estado Global, ou envolver classificação/priorização/formatação. Este foi o padrão mais usado de todo o RC1 (`adventureJourney.ts`, `adventureDiary.ts`, `backpackFinds.ts`, `backpackJourney.ts`, `backpackSignals.ts`, `cityWelcome.ts`, `citySuggestions.ts`) — nunca foi violado numa Sprint sequer.

**Regra prática**: se você está prestes a escrever um `if`/`switch` de mais de duas linhas dentro de um JSX ou de um `useMemo`, pare e mova para uma função pura testável em `lib/`.

## Quando mover código para a Engine (`packages/shared`)?

Quando o código decide um resultado de jogo (dano, loot, XP, saldo, upgrade) em vez de decidir uma apresentação desse resultado. Um sinal prático: se a lógica precisaria ser reaproveitada pelo Simulador (`packages/shared/src/simulation/`) para medir/calibrar alguma coisa, ela pertence à Engine, não a `apps/web`.

## Quando NÃO criar um Context (React)?

Quase sempre, neste projeto. O padrão estabelecido para estado compartilhado entre telas é o singleton de módulo (`useAdventureSession.ts`), não Context — ele evita re-render em cascata e não exige embrulhar a árvore de componentes num Provider. Um Context só se justificaria para um estado genuinamente ISOLADO a uma sub-árvore de UI (ex.: um formulário multi-etapa local a uma única tela) — nunca para o Estado Global da aventura, que já tem seu próprio mecanismo.

## Como escrever Browser Validation?

1. Abra a sessão real via QA seed script (`apps/api/scripts/qaSeedXxx.ts`, sempre deletado ao final) — nunca assuma um estado de banco que não foi realmente criado.
2. Use `navigate()` **uma única vez** — a primeira carga, via redirect do QA server. Toda navegação subsequente dentro do app usa `javascript_tool` disparando um `.click()` real no elemento (`document.querySelectorAll('a')` ou `button.city-building-card`, conforme a tela) — `navigate()` faz reload completo e destrói o singleton de módulo, invalidando o teste.
3. Confirme cada passo com `window.location.pathname` (ou `get_page_text`) — não assuma que um clique despachado teve efeito sem checar.
4. Cheque console (`read_console_messages`) ao final do fluxo completo, não só no meio.
5. Cubra o fluxo de navegação relevante à mudança por inteiro (ex.: Adventure→Inventory→City→Merchant→Blacksmith→Bank→Adventure para qualquer Sprint que toque Cidade/Mochila), nunca só a tela alterada isoladamente — regressão em outra tela é o risco real que este passo existe para pegar.
6. Sempre limpe o QA seed script e as linhas de banco criadas para o teste ao final.

## Como estruturar novos testes?

- `node:test` puro (`npx tsx --test 'src/**/*.test.ts'`), nunca um renderer de React ou jsdom — nem `packages/shared` nem `apps/web/src/lib` têm ou precisam de infraestrutura de DOM para teste.
- Para fixtures de `PresentationEvent` (união discriminada), use o padrão `DistributiveOmit<T, K>` (`type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;`) em vez de `Omit` simples — `Omit` simples colapsa a união e quebra a checagem de tipo por `kind`.
- Cada módulo novo de `lib/` ganha seu `.test.ts` irmão no mesmo diretório, cobrindo pelo menos: caso vazio/sem sinal, caso com um sinal, caso de prioridade/classificação (quando aplicável).
- Rode o typecheck usando o workaround já estabelecido: `apps/web` precisa de um `tsconfig.typecheck.tmp.json` temporário (sem `"references"`, sem `"rootDir"`) porque `packages/shared/tsconfig.json` não tem `"composite": true` — crie, rode `npx tsc --noEmit -p tsconfig.typecheck.tmp.json`, delete ao final.

## Convenção de módulo em `packages/shared`

Um módulo novo é uma pasta com `types.ts`, a lógica em si (um ou mais arquivos), e um `index.ts` que reexporta tudo — depois, uma linha em `packages/shared/src/index.ts` (`export * from "./nome/index.js";`). Este é o padrão usado por `idle/`, `presentation/`, `hud/`, `worldevents/`, `dungeon/`, entre outros — qualquer sistema novo (Economy Core incluso) deveria seguir a mesma forma, não inventar uma estrutura diferente.

---

*Referências: `docs/architecture/overview.md`, `docs/architecture/decisions.md`, `docs/design/rc1-retrospective.md` (evidência real de onde cada regra veio).*
