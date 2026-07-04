# StreamRPG — Snapshot Técnico (2026-07-04)

> Retrato único e autocontido do projeto neste momento. Se só um
> documento puder ser lido antes de continuar o trabalho, é este.

## Arquitetura

Monorepo (`npm workspaces`): `apps/api` (backend), `apps/web`
(frontend), `packages/shared` (tipos/regras puras usados pelos dois).
Núcleo do backend é um `GameClock` → `GameEngine` → `EventBus` →
`Systems`, rodando um `world.tick` a cada 60s. Systems nunca se chamam
entre si — só reagem a eventos e escrevem no próprio Repository. Ver
`docs/PROJECT_STATUS.md` §3 para o diagrama completo e a taxonomia de
eventos (Gameplay/Character vs. Platform/Session vs. World).

Frontend é uma SPA React 19 roteada por `react-router-dom` 7, sem
gerenciador de estado global — cada página busca seus próprios dados via
hooks (`useCharacter`, `useIdentity`, etc.), poll simples com
`setInterval` onde precisa de dado "vivo" (Boss, Expedição, World).
Desde a Sprint Performance Optimization, cada página é um chunk
`React.lazy` separado.

## Tecnologias

Node.js 22+ (`node:sqlite`, experimental), `node:http` puro (sem
Express), SQLite em modo WAL, `esbuild` para bundling (com
code-splitting), React 19, `react-router-dom` 7, TypeScript em todo o
código (front e back), CSS global único (`apps/web/styles.css`, sem
CSS-in-JS/Tailwind). Sem dependências de IA, sem bibliotecas de
markdown (parser próprio minúsculo em `apps/web/src/lib/markdownLite.ts`).

## Fluxo do jogador

Login Twitch → personagem criado automaticamente → jogador informa o
canal que está assistindo → ping a cada ~60s (enquanto o canal estiver
de fato ao vivo) → Engine concede XP/Drop de forma assíncrona via
`world.tick`; Gold é concedido de forma síncrona no próprio ping (única
exceção à regra "tudo via Engine", ver Riscos). Em paralelo: Boss pode
aparecer no canal (participação automática por presença), uma
Expedição avança sozinha region a region, e o Reino (canal) acumula
Prestígio e disputa 6 cargos do Hall da Fama. Tudo isso é visível no
Perfil, na Cidade (9 prédios), no Mundo e no Overlay (para OBS).

## Dependências entre sistemas

```
Classes (só design)         → bloqueia SUS/Classe_mult reais no Combat Model
Gold ownership (não resolvida) → bloqueia Marketplace → bloqueia Economy 1.0
Identity/Library/Bestiary/Encounter → esperam CONTEÚDO, não código
Kingdom Prestige (score calculado) → esperando qualquer sistema que o CONSUMA
```

Ver `docs/PROJECT_STATUS.md` §5 para o detalhamento completo.

## Sistemas — visão rápida

| Categoria | Sistemas |
|---|---|
| ✅ Completo (MVP) | Auth, XP/Level, Drops/Itens, Boss, Expedições, Kingdom Prestige, Capital City, Landing Page, Onboarding |
| ✅ Infraestrutura pronta, conteúdo pequeno | Identity (6+6), Encounters (8 categorias, texto genérico), Biblioteca (5 livros), Bestiário (5 criaturas), NPCs (9) |
| ⚠️ Parcial / decisão pendente | Gold (fora da Engine), Kingdoms (só cargos, não o conceito amplo do cap. 8 da Bible) |
| ❌ Não iniciado | Classes (só design fechado), Marketplace, Economy 1.0, Quests, Seasons |

## Estado do projeto

Todo o gameplay central (progressão, Boss, Expedição) está em produção
funcional e testado via harness real (EventBus real, banco isolado) em
cada Sprint. As últimas ~10 Sprints focaram em **apresentação e
infraestrutura de conteúdo** (Cidade, NPCs, Landing, Onboarding,
Biblioteca, Bestiário) e em **saúde técnica** (Engineering Cleanup,
Performance Optimization) — não em gameplay novo. Nenhuma regressão
conhecida; typecheck e build limpos.

## Última Sprint concluída antes deste snapshot

**Bestiary System (MVP)** — infraestrutura do Bestiário dentro da
Cidade, reaproveitando literalmente o `BookPage`/`renderMarkdownLite`
da Biblioteca (Sprint anterior). 5 criaturas placeholder, 8 tipos,
busca + filtro duplo (tipo/periculosidade), estados Bloqueado/Visto/
Estudado. Zero gameplay alterado, zero backend novo (catálogo estático
no frontend, mesmo padrão de NPCs/Regiões).

Antes dela, em ordem: Library System, Performance Optimization,
Engineering Cleanup, New Player Journey, Landing Page 2.0, NPCs Vivos,
Capital City, Kingdom Prestige System, Founder Identity & Prestige.

## Pendências (não-bloqueantes, mas conhecidas)

- `characters.level` é uma coluna morta (nunca atualizada; level real
  vem de `getProgress(xp)` em runtime) — risco de confundir quem
  escrever SQL direto no banco.
- `drop_log` tem colunas que parecem FK mas não têm `REFERENCES`
  declarado.
- `env.ts` tem `JWT_SECRET` como fallback de `SESSION_SECRET`, mas o
  projeto não usa JWT em lugar nenhum — nome de variável enganoso.
- `GET /health` retorna constantes hardcoded (`xp_per_ping: 10` etc.)
  em vez de ler de `@streamrpg/shared` — pode divergir silenciosamente
  se as constantes reais mudarem.
- `PATCH /api/character` existe e funciona, mas nenhuma tela do
  frontend o chama ainda.

## Riscos

1. **`node:sqlite` é experimental** — depende de uma API do Node ainda
   não estabilizada; upgrade de versão do Node pode quebrar sem aviso
   prévio nas release notes de uma API "stable".
2. **Gold fora da Engine** — é a maior divergência arquitetural
   conhecida do projeto (documentada, não escondida) e bloqueia todo o
   próximo passo de Economy.
3. **`refreshChannelPositions()` é O(n) por ping** — recalcula todas as
   posições do canal a cada ping de qualquer membro. Funciona bem hoje;
   é o primeiro ponto que vai doer se um canal crescer para milhares de
   espectadores simultâneos.
4. **Sem testes automatizados em CI** — toda verificação depende de
   harnesses manuais. Uma regressão silenciosa só é pega se alguém
   rodar o harness certo depois de mexer no sistema certo.
5. **Catálogos estáticos no frontend (Library/Bestiary) crescendo** —
   ótimo para 5-50 entradas; se o conteúdo real chegar a milhares de
   linhas como planejado, o bundle do frontend cresce para todo mundo,
   mesmo quem nunca abre a Biblioteca. Não é urgente, mas é uma decisão
   de infraestrutura que vai precisar ser tomada (mover para tabela +
   rota de leitura) antes do conteúdo estar 100% pronto.

## Ver também

`docs/PROJECT_STATUS.md`, `docs/API_REFERENCE.md`,
`docs/DATABASE_REFERENCE.md`, `docs/COMPONENT_MAP.md`,
`docs/IMPLEMENTATION_BACKLOG.md`, `docs/UPLOAD_GUIDE.md`.
