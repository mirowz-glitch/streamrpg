# Dívida Técnica — RC1

Lista objetiva, só itens reais e confirmados (código lido, erro reproduzido, ou achado já documentado em um relatório de Sprint). Nenhum item de desejo futuro.

## Alta

| # | Item | Onde | Por quê é Alta |
| --- | --- | --- | --- |
| A1 | Sessão de Aventura não sobrevive a um F5/reload real (região, masmorra, timeline) — só navegação interna sobrevive (resolvido nesta Sprint) | `apps/web/src/hooks/useAdventureSession.ts` | Corrigir exigiria persistência de região/masmorra no backend — hoje o motor cliente é a única fonte de verdade para esse estado. Aceito como limitação documentada, mas é a maior lacuna estrutural do sistema de Aventura |
| A2 | Decisão de arquitetura de Ouro (emissão vs. ledger/gasto) ainda não resolvida | Nenhuma implementação ainda — decisão congelada em memória de projeto | Bloqueia qualquer trabalho de Economia/Mercador/Crafting — precisa ser resolvida ANTES de qualquer código nessa área, não durante |

## Média

| # | Item | Onde | Impacto |
| --- | --- | --- | --- |
| M1 | `npm run typecheck` (raiz) está quebrado — `packages/shared/tsconfig.json` não tem `"composite": true`, exigido por `apps/api/tsconfig.json` e `apps/web/tsconfig.json` via `references` | `packages/shared/tsconfig.json`, `apps/api/tsconfig.json`, `apps/web/tsconfig.json` | Toda Sprint neste projeto precisou rodar `tsc --noEmit -p tsconfig.json` pacote por pacote em vez do script oficial — funciona, mas é um script "quebrado" na raiz do monorepo há várias Sprints |
| M2 | `apps/api` tem um subsistema de Engine em migração com erros reais de typecheck (`EventBus.ts`/`.test.ts`, `GameEngine.test.ts`, `SQLiteBossRepository.ts`, `SQLiteBossParticipationRepository.ts`, `SQLiteCharacterRepository.test.ts`) | `apps/api/src/engine/*`, `apps/api/src/infrastructure/SQLiteBoss*` | Confirmado nesta Sprint via typecheck direto: faltam `esModuleInterop`, casts de linha de banco incompatíveis com os tipos de linha esperados, um `Set` iterado sem a flag correta. Não afeta o Vertical Slice em execução (não é importado pelo caminho de runtime ativo), mas bloqueia qualquer ativação futura desse Engine sem uma Sprint dedicada |
| M3 | `apps/web` não tem infraestrutura de testes de componente/hook (Vitest, React Testing Library, jsdom) — só o `node:test` puro adicionado nesta Sprint pra lógica não-React | `apps/web/src` (ausência) | Qualquer regressão de renderização/JSX só é pega por playtest manual em navegador, nunca por CI. Cresce de risco a cada nova página/componente |
| M4 | Loot de regiões a partir da 3ª (aprox.) mede uso ~0% mesmo sob Continuous Affix Scaling — a melhoria agregada de Dead Loot (94.4%) vem quase toda do volume das 2 primeiras regiões | `packages/shared/src/itemgen/*` | Já identificado e deliberadamente fora de escopo na Sprint Global Gameplay Rebalance (não mexer em Loot Tables/Item Generator naquela Sprint) — segue sem dono |

## Baixa

| # | Item | Onde | Impacto |
| --- | --- | --- | --- |
| B1 | Colinas Áridas / Minas Abandonadas medem ~22s de tempo médio na região (vs. 400-2000s nas demais) — possível "região de passagem" | `packages/shared/src/worldencounter/biomes.ts`, `encounterTables.ts` | Flagueado no Global Gameplay Rebalance, nunca investigado — risco de mexer em lógica de transição de região sem uma Sprint dedicada |
| B2 | Afixos procedurais completos de um item não são 100% garantidos em trocas de aba raras — só `baseItemId` + Power Score + raridade mapeada persistem com certeza | `apps/web/src/hooks/useAdventureSession.ts` (`persistTick`) | Item aparece corretamente no Personagem/Inventário reais; o afixo exato pode variar num caso raro |
| B3 | `EQUIPMENT_SLOT_DEFINITIONS` tem 9 slots mas o Item Generator (`ItemGenSlot`) só tem 8 — Anel vira 2 sockets (`ring1`/`ring2`) mapeados pro mesmo `ring` | `apps/web/src/hooks/useAdventureSession.ts`, `packages/shared/src/equipment/slots.ts` | Não é um bug (mapeamento intencional, documentado em comentário), mas é uma assimetria que qualquer dev novo vai estranhar sem o contexto |

---

**Nota de metodologia**: todo item acima foi confirmado por leitura direta de código ou reprodução de erro nesta Sprint (nunca "acho que" ou "provavelmente"). Itens de sprints anteriores só entram aqui se ainda estavam sem dono no momento do congelamento.
