# Code Review Checklist — StreamRPG

**Status:** 🟢 Canônico. Checklist de revisão a ser aplicado a toda PR, além (não em vez) da leitura normal de qualidade de código. Cada pergunta aqui existe porque uma das 8 decisões de `docs/architecture/decisions.md` já identificou este exato risco antes.

## Arquitetura

- [ ] **Existe lógica de gameplay em React?** Um componente decidindo se um item é upgrade, calculando prioridade de evento, ou validando saldo é uma violação de D2/D5 (`decisions.md`). Deveria estar em `packages/shared` ou `apps/web/src/lib`.
- [ ] **Há duplicação de estado?** Uma tela mantendo sua própria cópia de algo que já existe em `hudState` viola D4 — Estado Global é fonte única.
- [ ] **Há uma função pura reutilizável aqui, ou uma nova está sendo criada sem necessidade?** Se uma função em `lib/` já resolve o mesmo problema (mesma agregação, mesma classificação), ela deveria ser importada, não reimplementada. Ver `docs/architecture/development-guide.md` para o critério de "reaproveitar vs. criar novo".
- [ ] **O Estado Global continua sendo a fonte única?** Nenhuma PR deveria introduzir um segundo mecanismo de estado compartilhado (segundo Context, segundo singleton) sem um RFC (`docs/architecture/rfc-process.md`).
- [ ] **A Engine continua isolada de React/DOM?** Nenhum arquivo em `packages/shared` deveria importar `react`, `apps/web`, ou `apps/api`.
- [ ] **`apps/api` e `apps/web` continuam sem importar um do outro?**
- [ ] **Um sistema novo segue a convenção de módulo já estabelecida?** (`types.ts` + lógica + `index.ts`, reexportado em `packages/shared/src/index.ts` — ver `docs/architecture/development-guide.md`.)

## Testes

- [ ] **Há testes suficientes?** Toda função pura nova, todo módulo novo de Engine, tem `.test.ts` cobrindo pelo menos: caso vazio, caso normal, caso de borda relevante ao domínio.
- [ ] **A suíte completa foi rodada, não só os testes novos?** Uma PR que só roda os testes que ela mesma escreveu pode estar escondendo uma regressão em código que não tocou diretamente.
- [ ] **Testes de `PresentationEvent` usam `DistributiveOmit`, não `Omit` simples?** (Erro comum documentado em `docs/architecture/development-guide.md` — `Omit` simples colapsa a união discriminada.)

## Browser Validation

- [ ] **Há Browser Validation documentada na PR?** (Ver `docs/process/pull-request-template.md`.) Se a mudança é puramente de Engine sem superfície de UI, isso deve estar declarado explicitamente, não simplesmente omitido.
- [ ] **A validação usou `.click()` real, não `navigate()` para navegação interna?** `navigate()` faz reload completo e destrói o singleton de módulo — um teste que usa `navigate()` para "ir de uma tela a outra" pode estar mascarando uma regressão real de estado.
- [ ] **O console foi conferido limpo ao final do fluxo, não só no meio?**

## Compatibilidade

- [ ] **A PR nomeia explicitamente quais sistemas anteriores poderiam ter sido afetados, e confirma que não foram?** (Formato já usado em todo relatório de Sprint do RC1: "Combate não mudou. Loot não mudou...")
- [ ] **Alguma regra congelada (`docs/architecture/architecture-freeze-rc1.md`) está sendo alterada sem um RFC/ADR correspondente?** Se sim, a PR deveria ser pausada até o processo formal (`docs/architecture/rfc-process.md`) ser seguido.

## Documentação

- [ ] **Um documento de preparação para a próxima Sprint foi deixado, se aplicável?**
- [ ] **Um ADR foi criado, se a PR envolveu uma decisão arquitetural relevante?**

---

*Referências: `docs/architecture/decisions.md` (a origem de cada pergunta acima), `docs/process/definition-of-done.md` (o que precisa estar verdadeiro antes mesmo de abrir a PR), `docs/process/pull-request-template.md` (o formato que este checklist revisa).*
