# StreamRPG

Twitch-overlay RPG evoluindo para uma plataforma/engine de RPG persistente multi-plataforma. Personagens ganham XP/nível/ouro/equipamento explorando um Reino procedural — jogável tanto assistindo a uma live quanto diretamente pelo navegador.

**Estado atual**: [Vertical Slice RC1](docs/releases/vertical-slice-rc1/RC1-SNAPSHOT.md) — jogável do início à morte, sem bugs críticos conhecidos, pronto para o primeiro playtest público em live. Ver o snapshot para o estado completo do projeto.

---

## Estrutura do Monorepo

```
apps/
  api/        Backend (Node.js, tsx, node:sqlite) — servidor HTTP, autenticação Twitch, persistência de personagem
  web/        Frontend (React 19, esbuild) — SPA servida pelo próprio apps/api
packages/
  shared/     @streamrpg/shared — motor de jogo puro em TypeScript (combate, loot, masmorras, facções, etc.), sem dependência de apps/*
commercial/   Documentação de posicionamento comercial e roadmap de valorização
docs/         Game Design Bible, World Constitution, playtesting, arquitetura, releases
```

O motor (`packages/shared`) nunca importa de `apps/*` e nunca sabe que existe uma API ou um navegador — toda integração acontece na borda (`apps/api`/`apps/web`).

## Rodando localmente

```bash
npm install
npm run build:web   # gera apps/web/dist uma vez (esbuild, sem watch)
npm run dev         # inicia apps/api/src/server.ts com tsx watch — serve apps/web/dist automaticamente
```

Acesse `http://localhost:4000`. Copie `.env.example` para `.env` e preencha as credenciais de Twitch se for testar o login real — sem elas, a maior parte do jogo ainda funciona (algumas rotas exigem sessão autenticada).

**Importante**: `apps/web/dist` é gerado uma única vez no startup do servidor (`buildWebOnce()`, `apps/api/src/config/bundler.ts`) e cacheado — não há hot-reload do frontend. Depois de editar qualquer arquivo em `apps/web/src`, rode `npm run build:web` novamente e recarregue o navegador.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o backend com watch (`tsx watch`) — reinicia sozinho ao editar `apps/api/src` |
| `npm start` | Sobe o backend sem watch (produção) |
| `npm run build:web` | Rebuild manual do bundle do frontend |
| `npm run typecheck` | ⚠️ Atualmente quebrado por uma referência de projeto incompleta — ver [dívida técnica](docs/releases/vertical-slice-rc1/technical-debt.md#média), item M1. Use `npx tsc --noEmit -p <pacote>/tsconfig.json` por pacote enquanto isso não for corrigido |

Testes do motor (`packages/shared`):

```bash
cd packages/shared
npx tsx --test 'src/**/*.test.ts'
```

## Documentação

- [`docs/releases/vertical-slice-rc1/`](docs/releases/vertical-slice-rc1/) — estado oficial do RC1: snapshot, estatísticas, dívida técnica, known issues, release notes
- [`docs/game-design-bible/`](docs/game-design-bible/) — princípios de design permanentes, ler antes de projetar qualquer Sistema novo
- [`docs/world-constitution/`](docs/world-constitution/) — referência de lore/narrativa, prioridade acima da Game Design Bible
- [`docs/playtesting/`](docs/playtesting/) — processo reutilizável de ciclos de playtest externo
- [`docs/planning/post-rc1-roadmap.md`](docs/planning/post-rc1-roadmap.md) — plano estratégico de conteúdo pós-RC1
- [`commercial/roadmap/project-valuation-roadmap.md`](commercial/roadmap/project-valuation-roadmap.md) — roadmap de valorização comercial, governa prioridade de Sprint

## Convenções deste projeto

- Cada Sprint de balanceamento constrói um script de auditoria/simulação reutilizável em `packages/shared/scripts/`, versionado junto com o relatório correspondente em `packages/shared/reports/` — não são descartáveis, são acervo de metodologia.
- Mudanças de gameplay são sempre validadas por simulação (Monte Carlo / campanhas simuladas) antes de qualquer smoke test manual em navegador.
- Ver o `CHANGELOG.md` na raiz para o histórico de versões.
