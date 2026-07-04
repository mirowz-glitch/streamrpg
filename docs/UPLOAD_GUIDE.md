# StreamRPG — Upload Guide

> O que enviar para outra IA (ou colar num novo chat) entender o
> projeto rápido, sem gastar contexto com o que não importa. Não é um
> ZIP de verdade — é a lista de pastas/arquivos que valeriam a pena
> entrar num ZIP, e em que ordem ler.

## Leia primeiro (nesta ordem)

1. `docs/PROJECT_SNAPSHOT_2026-07-04.md` — retrato único, mais curto, começa por aqui.
2. `docs/PROJECT_STATUS.md` — a versão longa/detalhada do mesmo retrato.
3. `docs/API_REFERENCE.md` + `docs/DATABASE_REFERENCE.md` — se o trabalho for no backend.
4. `docs/COMPONENT_MAP.md` — se o trabalho for no frontend.
5. `docs/IMPLEMENTATION_BACKLOG.md` — antes de propor qualquer feature nova, para não reinventar o que já está preparado.

Só depois disso, se precisar de profundidade histórica de uma decisão
específica: `docs/ARCHITECTURE_INDEX.md` (índice classificado de todos
os ~80 documentos de design/Sprints anteriores) e `docs/reviews/*.md`
(um por Sprint já concluída).

## Essencial (sempre incluir)

```
package.json                      — workspaces, scripts (dev/build/typecheck)
apps/api/package.json
apps/api/tsconfig.json
apps/api/src/                     — TODO o backend (56 arquivos .ts)
apps/web/package.json
apps/web/tsconfig.json
apps/web/src/                     — TODO o frontend (88 arquivos .ts/.tsx)
apps/web/styles.css               — único CSS do projeto
apps/web/index.html
packages/shared/package.json
packages/shared/tsconfig.json
packages/shared/src/              — tipos/regras compartilhadas
docs/PROJECT_STATUS.md
docs/PROJECT_SNAPSHOT_2026-07-04.md
docs/API_REFERENCE.md
docs/DATABASE_REFERENCE.md
docs/COMPONENT_MAP.md
docs/IMPLEMENTATION_BACKLOG.md
```

Isso sozinho (código-fonte + os 6 documentos novos) já é suficiente
para qualquer IA entender o projeto inteiro e continuar o trabalho —
sem precisar abrir nenhum outro arquivo.

## Útil, mas opcional (contexto histórico/de design)

```
docs/ARCHITECTURE_INDEX.md        — índice de tudo que já foi escrito
docs/game-design-bible/           — visão/princípios/capítulos de design (alguns ainda "Placeholder")
docs/design/                      — Classes fechadas, roadmap de longo prazo, pilares
docs/combat-model/                — fórmula canônica de dano
docs/world-design/                — regiões, exploração, NPCs (rascunhos, não Bible)
docs/reviews/                     — um documento de review por Sprint já concluída
```

Só vale enviar se a tarefa exigir entender **por que** uma decisão de
design foi tomada, não só o que existe hoje.

## Pode ignorar sempre (não enviar)

```
node_modules/                     — ~62 MB, reconstruível com `npm install`
apps/web/dist/                    — ~5 MB, bundle gerado, reconstruível com `npm run build:web`
data/streamrpg.db*                — banco SQLite real (dado de jogadores, não código) — ~1 MB
.git/                             — histórico de commits
.claude/                          — config local de ferramentas de dev
```

Nenhum desses arquivos ajuda outra IA a entender a arquitetura — todos
são reconstruíveis ou são dado de runtime, não código-fonte.

## Se o limite de contexto for pequeno (resumo mínimo)

Só estes 3, nesta ordem, já dão uma base de trabalho real:

1. `docs/PROJECT_SNAPSHOT_2026-07-04.md`
2. `docs/API_REFERENCE.md` **ou** `docs/COMPONENT_MAP.md` (o lado do stack que importa para a tarefa)
3. `docs/IMPLEMENTATION_BACKLOG.md`

## Nota sobre tamanho

`apps/api/src` + `apps/web/src` + `packages/shared/src` juntos somam
~150 arquivos TypeScript/TSX. Não é grande o bastante para precisar de
recorte — a única razão para não enviar tudo de uma vez é limite de
contexto da ferramenta de destino, não volume real do projeto.
