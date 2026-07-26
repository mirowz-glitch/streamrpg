# RC1 Snapshot — StreamRPG Vertical Slice

**Data de congelamento**: 2026-07-26
**Branch**: `release/vertical-slice-rc1`
**Este documento é a referência oficial do estado do projeto no momento do congelamento do RC1.** Qualquer trabalho futuro parte daqui — não de memória, não de suposição sobre o que "deve" existir.

---

## 1. Sistemas Concluídos

### Core
- **Character** — CharacterBuild, XP/nível (curva `xp.ts`), atributos de combate, persistência real via `apps/api` (perfil, sessão, DB).
- **Combat** — Adventure Loop, encontros, recuperação entre combates, dano/DPS, elites e mini-bosses.
- **Inventory** — 24 slots, captura de itens, comparação com equipado.
- **Equipment** — 9 slots (Arma/Elmo/Peitoral/Luvas/Botas/2×Anel/Amuleto/Cinto), AutoEquip.
- **Loot** — Item Generator procedural (4 raridades, Continuous Affix Scaling — ver Arquitetura).
- **Objectives** — 29 definições data-driven, cobrindo caça/exploração/facção/expedição/mundo.
- **Bosses** — 4 chefes de masmorra + elites/mini-bosses nas 9 regiões (22 templates de inimigo no total).
- **Dungeons** — 4 masmorras completas (Queda da Fortaleza Sombria, Fortaleza Congelada, Catedral Esquecida, Covil do Dragão), cada uma com chefe final e relíquia única.
- **Persistence** — Nível/XP/Ouro/Itens sincronizados com o personagem real via API; sessão de Aventura (região/masmorra/timeline) persistente entre navegações (ver Adventure Session Persistence).

### UX
- **Landing** — página inicial, onboarding.
- **Navigation** — `AppNav`, 8 rotas principais (Personagem/Inventário/Crônicas/Cidade/Ranking/Mundo/Streamer/Aventura).
- **Session Recovery** — Session Safety Banner + `useBlocker`/`beforeunload` para sessões demo (sem login); sessão de Aventura sobrevive à navegação normal para contas logadas (RC1 Blocker B1, resolvido).
- **Chronicle** — livro de capítulos do personagem, condicionado a eventos reais.
- **World** — visão do Reino (tick, eventos, notícias, estado agregado).
- **Vertical Slice** — jogo completo, do login à morte, sem sistemas incompletos visíveis.

### Architecture
- **Continuous Affix Scaling** — substituiu o sistema de tiers discretos de afixos por uma curva contínua de valor (envelope pooling por grupo, `EFFECTIVE_MAX_ITEM_LEVEL = MAX_LEVEL`). Dead Loot 95.2% → 94.4%, upgrades +62%.
- **Gameplay Rebalance** — chefes/masmorras recalibrados após a Continuous Affix Scaling deixar os personagens mais fortes; 2 masmorras que mediam 0% de conclusão corrigidas.
- **Dungeon Rebalance** / **Boss Rebalance** — parte do mesmo esforço acima (orçamento de encontros, stats de chefe).
- **Adventure Session Persistence** — estado de sessão movido de `useRef` de componente pra singleton de módulo; navegação normal não perde mais progresso.

### Validation
- **Browser Playtests** — múltiplos playthroughs reais completos (login → morte → reinício), sempre com verificação de console.
- **Monte Carlo** — distribuição de tiers/mods/raridade validada estatisticamente em milhares de rolagens.
- **Campaign Simulations** — campanhas simuladas (N=300 a N=5000) usadas pra calibrar Balance/Boss Accessibility/Progression Economy.
- **442 testes automatizados** (`packages/shared`, `node:test`) + 7 novos (`apps/web`, sessão de Aventura) — **449 no total**, 0 falhas.
- **RC Blocker B1 resolvido** — última pendência crítica antes da primeira live pública.

---

## 2. Sistemas Parciais

| Sistema | Estado | O que falta |
| --- | --- | --- |
| Mercador / Alquimista | Prédios na Cidade rotulados "em construção" | Sistema de compra/venda (depende da decisão de arquitetura de Ouro — ver Dívida Técnica) |
| Integração Twitch/OBS | XP automático assistindo live existe (`viewer_sessions`), login via Twitch funcional | Nenhum recurso adicional voltado a streamer (overlays, comandos de chat, etc.) — fora de escopo desta fase |
| Reload da sessão de Aventura | Nível/XP/Ouro/Itens sobrevivem a um F5 | Região/masmorra/timeline não sobrevivem a um F5 real (só à navegação interna) — decisão de escopo, não bug |
| Fidelidade de afixos entre abas | `baseItemId`/Power Score/raridade sempre sincronizados | Afixos procedurais completos do item não são 100% garantidos em trocas de aba raras |

## 3. Sistemas Não Iniciados

- Economia (ouro com função de gasto real, comércio)
- Crafting / evolução de equipamento
- Eventos dinâmicos expandidos (a arquitetura de World Events já existe e suporta expansão, mas nenhum evento novo foi adicionado desde a base)
- Novas regiões além das 9 atuais
- Progressão de longo prazo (prestígio/renome pós-nível-máximo)
- Recursos de streamer além do XP automático (comandos, overlays dedicados)

---

## 4. Métricas Atuais

Ver `docs/releases/vertical-slice-rc1/project-statistics.md` para o levantamento completo. Resumo:

- **~60.200 linhas de código** (TypeScript/TSX, `apps/` + `packages/`)
- **449 testes automatizados** (442 motor + 7 sessão de Aventura), 0 falhas
- **11 páginas** web
- **9 regiões**, **4 masmorras**, **4 chefes de masmorra**, **22 templates de inimigo**
- **4 facções** (5 níveis de reputação cada), **15 eventos de mundo**, **4 relíquias únicas**, **4 World Tiers**
- **9 slots de equipamento**, **14 itens-base**, **4 raridades**, **7 prefixos + 7 sufixos**
- **29 objetivos** data-driven

---

## 5. Limitações Conhecidas

Ver `docs/releases/vertical-slice-rc1/known-issues-rc1.md` para a lista completa e classificada (Bugs/Limitações/Features Futuras). Resumo dos itens de maior impacto:

- Picos Congelados com mortalidade alta em condições normais (rotulado "Muito Alta" na região, mas a transição de risco é abrupta)
- "Deserto de loot" em trechos longos de uma expedição (checkpoints sem upgrade sentido)
- Ranking/Mundo compartilham dados agregados entre sessões de teste no mesmo servidor
- Ouro sem função de gasto real ainda
- `apps/api` tem um subsistema de Engine em migração (`engine/*`, `infrastructure/SQLiteBoss*`) com erros de typecheck pré-existentes — não afeta o Vertical Slice em execução

## 6. Próximas Prioridades

Ver `docs/planning/post-rc1-roadmap.md` para o plano estratégico completo pós-RC1. Ordem recomendada de curto prazo:
1. Visual Polish + Identity (maior salto de percepção "protótipo → produto")
2. Eventos dinâmicos (menor risco, reaproveita arquitetura existente)
3. Conteúdo de endgame + novas regiões
4. Decisão de arquitetura de Ouro → Economia → Crafting (nessa ordem, cada um depende do anterior)

---

*Este snapshot substitui qualquer entendimento anterior do estado do projeto. Atualizar apenas na próxima Sprint de congelamento (RC2 ou equivalente).*
