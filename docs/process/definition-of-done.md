# Definition of Done — StreamRPG

**Status:** 🟢 Canônico. Critérios mínimos para considerar QUALQUER Sprint concluída, a partir desta Sprint em diante. Formaliza uma prática já seguida informalmente em toda Sprint do RC1 — não introduz nenhum critério novo, só torna explícito o que já era exigido de fato.

Uma Sprint não é "concluída" só porque a funcionalidade parece funcionar. É concluída quando todos os itens abaixo são verdadeiros — e verificados, não presumidos.

## 1. Typecheck limpo

Rodar o typecheck real de cada pacote tocado, usando o workaround já documentado quando necessário (`docs/architecture/development-guide.md`: `tsconfig.typecheck.tmp.json` temporário para `apps/web`, devido ao `packages/shared/tsconfig.json` não ter `"composite": true`). "Parece que compila" não é typecheck limpo — rodar o comando e ler o resultado é.

## 2. Testes passando

Toda a suíte relevante (`npx tsx --test 'src/**/*.test.ts'` em cada pacote tocado) rodando com 0 falhas — não só os testes novos da Sprint, a suíte inteira, para pegar regressão em código que a Sprint não pretendia tocar. Toda função pura nova em `lib/` ou módulo novo na Engine precisa ter teste próprio antes da Sprint ser considerada concluída, não depois.

## 3. Build limpa

`npm run build:web` (ou equivalente do pacote tocado) sem erro. Uma Sprint que só passou no typecheck mas nunca rodou o build real não verificou o mesmo caminho que produção usa.

## 4. Browser Validation executada

Obrigatória para toda Sprint que altera qualquer coisa visível ou navegável pelo jogador (ver D6, `docs/architecture/decisions.md`) — mesmo quando a mudança é "só backend"/"só arquitetura", se ela pode ser indiretamente observada em uma tela (ex.: Economy Core sem UI própria, mas testável via regressão de navegação), a Browser Validation cobre esse cenário de regressão. Seguir o método já estabelecido: `navigate()` só na primeira carga; toda navegação subsequente via `.click()` real despachado por `javascript_tool`; conferir console limpo ao final.

Não é Browser Validation: rodar só os testes automatizados e assumir que a UI funciona. É: abrir a sessão real e navegar pelo fluxo relevante.

## 5. Documentação atualizada

Todo documento de preparação (`docs/design/*-phase1.md` ou equivalente) que a Sprint consumiu deve receber, ao final, uma atualização ou um documento novo de preparação para a PRÓXIMA Sprint — o padrão que todo o arco RC1 seguiu (cada Sprint terminou deixando o terreno pronto para a seguinte, nunca exigindo que a próxima Sprint redescubra contexto). Se a Sprint introduziu uma decisão arquitetural relevante (ver gatilhos de RFC, `docs/architecture/rfc-process.md`), um ADR correspondente deve existir antes de a Sprint ser considerada concluída.

## 6. Compatibilidade analisada

Confirmação explícita (não assumida) de que nenhum sistema anterior regrediu — a lista específica depende da Sprint, mas deve nomear os sistemas que PODERIAM ter sido afetados e confirmar, um a um, que não foram (o mesmo formato já usado em toda Sprint do RC1: "Combate não mudou. Loot não mudou. XP não mudou...").

## 7. Sem regressões conhecidas

Nenhum bug novo introduzido e deixado sem registro. Se algo quebrou e não foi corrigido dentro do escopo da Sprint, ele precisa estar explicitamente listado como um problema conhecido (não silenciosamente ignorado) — ver o formato de "Problemas Encontrados" já usado em relatórios de Sprint anteriores.

## O que NÃO é suficiente

- "Os testes que eu escrevi passam" (sem rodar a suíte inteira).
- "Compilou" (sem rodar o build real de produção).
- "Deveria funcionar no navegador" (sem realmente abrir e navegar).
- Documentação escrita ANTES da implementação e nunca revisada depois de o código mudar de rumo.

## Checklist Rápido

```
[ ] Typecheck limpo (todos os pacotes tocados)
[ ] Suíte de testes inteira passando (não só os testes novos)
[ ] Build de produção rodou sem erro
[ ] Browser Validation real executada e documentada
[ ] Documentação de preparação da próxima Sprint escrita (se aplicável)
[ ] ADR criado, se a Sprint envolveu decisão arquitetural relevante
[ ] Compatibilidade com sistemas anteriores confirmada, sistema por sistema
[ ] Nenhuma regressão nova sem registro explícito
```

---

*Referências: `docs/architecture/decisions.md` D6 (Browser Validation obrigatória), `docs/architecture/rfc-process.md` (quando um ADR é exigido), `docs/process/sprint-template.md` (onde este DoD se encaixa no ciclo de uma Sprint).*
