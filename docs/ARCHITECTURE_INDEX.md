# StreamRPG — Índice de Arquitetura Canônica

**Este arquivo é a porta de entrada do projeto.** Se você é um
desenvolvedor novo, comece aqui — não em `game-design-bible/README.md`,
não em `docs/design/README.md`. Este documento resultou da Sprint
"Canonical Architecture (Final Consolidation)": nenhum arquivo de código,
schema, Combat Model, Boss, Economy ou balanceamento foi tocado para
produzi-lo — é puramente organização do conhecimento já existente (73
documentos, catalogados abaixo).

---

## Como ler este índice

1. **Etapa 1-2** — inventário completo de todos os 73 documentos, cada um
   com exatamente uma classificação (🟢 Canônico / 🟡 Complementar / 🔵
   Histórico / 🔴 Obsoleto).
2. **Etapa 3** — para cada assunto importante, qual é o único documento
   oficial.
3. **Etapa 4** — mapa de dependência Vision → Implementation.
4. **Etapa 5** — as ambiguidades reais encontradas (Classe_mult, Hero
   Token, Kingdom, Boss, Marketplace) e como foram resolvidas.
5. **Etapa 6** — lista de referências adicionadas aos documentos
   históricos apontando para a fonte oficial.
6. **Ordem de leitura recomendada** para um desenvolvedor novo.

O roadmap técnico de implementação (Etapa 8) está em
[docs/design/technical-roadmap.md](design/technical-roadmap.md) — este
índice não repete esse conteúdo.

---

## Etapa 1 e 2 — Inventário completo e classificação

Legenda: 🟢 Canônico (fonte oficial) · 🟡 Complementar (útil, não é a
fonte final) · 🔵 Histórico (registro de um momento passado) · 🔴
Obsoleto (não deveria mais ser consultado).

### Game Design Bible (`docs/game-design-bible/`) — 17 documentos

| Documento | Classificação | Nota |
|---|---|---|
| `README.md` | 🟢 Canônico | Índice oficial da Bible em si — continua válido |
| `01-vision.md` | 🟢 Canônico | Visão permanente do projeto |
| `02-principles.md` | 🟢 Canônico | 7 Princípios de Arquitetura (engenharia) |
| `03-characters.md` | 🟢 Canônico | Definição base do Character |
| `04-classes.md` | 🟡 Complementar | Superado por `docs/design/classes-final-architecture.md` — mantido como cartão de índice da Bible, ver Etapa 6 |
| `05-progression.md` | 🟢 Canônico | XP/Level/Welcome/Drop/Gold |
| `06-bosses.md` | 🟢 Canônico | Decisões de design de Boss (Nascimento/Participação/Combate/Recompensas/Escala/Ranking) |
| `07-quests.md` | 🟢 Canônico | Placeholder oficial — nenhum outro documento o substitui |
| `08-kingdoms.md` | 🟢 Canônico | Placeholder oficial — **ver gap real na Etapa 9** |
| `09-seasons.md` | 🟢 Canônico | Placeholder oficial |
| `10-economy.md` | 🟢 Canônico | Economia geral — subtópico Hero Token aponta para `classes-final-architecture.md`, ver Etapa 6 |
| `11-marketplace.md` | 🟢 Canônico | Único documento substantivo sobre Marketplace |
| `12-roadmap.md` | 🟢 Canônico | Ordem de construção de Sistemas (BossSystem → QuestSystem → Kingdoms → Economia 1.0 → Marketplace → Referral → MetricsSystem) |
| `13-events.md` | 🟢 Canônico | Taxonomia de eventos do EventBus |
| `14-architecture.md` | 🟢 Canônico | Fluxo técnico Twitch → Presence → SessionManager → WorldTick → EventBus → Systems → Repositories → SQLite |
| `consistency-report.md` | 🔵 Histórico | Auditoria de um momento passado — algumas contradições já foram resolvidas desde então (ex.: Classes) |
| `open-questions.md` | 🟢 Canônico | Backlog oficial do que ainda está em aberto — **atualizado nesta Sprint** (Classes removido, ver Etapa 6) |

### Gameplay Design (`docs/gameplay-design/`) — 9 documentos

| Documento | Classificação | Nota |
|---|---|---|
| `README.md` | 🟡 Complementar | Índice local da pasta |
| `01-characters-attributes.md` | 🟡 Complementar | Conceitual (o que ATQ/VEL/SUS/UTI significam) — a matemática real está em `combat-model/canonical-formula.md` |
| `02-groups.md` | 🟡 Complementar | Único documento sobre Grupo/Party — ainda especulativo |
| `03-combat.md` | 🟡 Complementar | Fórmula resumida original — a versão oficial está em `combat-model/canonical-formula.md`; mantido pela tabela Expedição×Boss, que é única |
| `04-builds.md` | 🟢 Canônico | Único documento sobre o sistema de Build |
| `05-equipment.md` | 🟢 Canônico | Único documento sobre comportamento de slot de equipamento |
| `06-classes-skills.md` | 🔵 Histórico | Rascunho original de Classes — **superado por `docs/design/classes-final-architecture.md`**, ver Etapa 6 |
| `07-regions-interface.md` | 🟡 Complementar | Mapeamento região×classe original — a versão por classe está em `classes-final-architecture.md`, ver Etapa 6 |
| `08-boss-interface.md` | 🟡 Complementar | Ponte única entre Combat Model/Classes e a implementação real de Boss — não duplicado em nenhum outro lugar |

### Combat Model (`docs/combat-model/`) — 3 documentos

| Documento | Classificação | Nota |
|---|---|---|
| `README.md` | 🟡 Complementar | Índice local da pasta |
| `canonical-formula.md` | 🟢 Canônico | **A** fonte da verdade para a fórmula de dano, Resistência, SUS, UTI |
| `monsters-and-regions.md` | 🟢 Canônico | Fonte oficial do modelo de stats de monstro |

### World Design (`docs/world-design/`) — 12 documentos

| Documento | Classificação | Nota |
|---|---|---|
| `README.md` | 🟡 Complementar | Índice local da pasta |
| `regions.md` | 🟢 Canônico | Fonte oficial de todas as 11 regiões |
| `roads.md` | 🟢 Canônico | Fonte oficial do grafo de conexão — **amendado nesta Sprint**, ver Etapa 6 |
| `cities.md` | 🟢 Canônico | Fonte oficial de assentamentos |
| `npc-design.md` | 🟢 Canônico | Fonte oficial de NPCs |
| `lore-ambiental.md` | 🟢 Canônico | Fonte oficial de lore ambiental — documento mais maduro da pasta |
| `environmental-mechanics.md` | 🟡 Complementar | Mecânicas ambientais, ainda com hipóteses não validadas (Vento) |
| `exploration.md` | 🟡 Complementar | Sistema de descoberta — **amendado nesta Sprint** para reconciliar com roads.md, ver Etapa 6 |
| `random-events.md` | 🟡 Complementar | 105 eventos locais — auto-classificado "experimental" pelo próprio `world-design-review.md`; **amendado nesta Sprint**, ver Etapa 6 |
| `world-events.md` | 🟡 Complementar | Eventos de escala maior — mesmo status experimental; **amendado nesta Sprint**, ver Etapa 6 |
| `future-expansion.md` | 🟡 Complementar | Conteúdo de mundo específico para os horizontes de expansão — referenciado por `docs/design/long-term-roadmap.md`, não duplicado por ele |
| `world-design-review.md` | 🔵 Histórico | Auditoria de um momento passado (Sprint 2 do World Design) |

### Technical Design (`docs/technical-design/`) — 5 documentos

| Documento | Classificação | Nota |
|---|---|---|
| `atomic-update-guideline.md` | 🟢 Canônico | Única fonte sobre consistência atômica/transações |
| `boss-system.md` | 🟢 Canônico | Máquina de estados técnica do Boss (distinto da Bible cap. 6, que é design, não implementação) |
| `integration-readiness-review.md` | 🔵 Histórico | Snapshot de prontidão de um momento passado |
| `live-readiness-review.md` | 🔵 Histórico | Checklist de uma live específica já realizada |
| `operations-panel.md` | 🟡 Complementar | Proposta de métricas, ainda não implementada |

### Reviews (`docs/reviews/`) — 16 documentos

**Todos classificados 🔵 Histórico** — cada um é o registro de uma Sprint
já concluída, não uma fonte de decisão viva. Onde uma review contém um
achado ainda verdadeiro hoje (ex.: "Boss não tem nome"), esse achado já
foi incorporado ao documento canônico correspondente durante as Sprints
de Design subsequentes — a review permanece como evidência do porquê,
não como referência a ser consultada primeiro.

`boss-experience-review.md`, `boss-gameplay-validation.md`,
`boss-integration-review.md`, `boss-reward-balance-study.md`,
`character-attributes-schema-review.md`,
`character-runtime-integration-review.md`,
`combat-model-runtime-review.md`, `equipment-experience-review.md`,
`first-player-experience-review.md`, `gameplay-combat-final-review.md`,
`gameplay-combat-world-review.md`, `identity-progression-review.md`,
`mvp-readiness-review.md` (a mais importante do grupo — verdadeiro
snapshot de "o que está pronto vs. só documentado"),
`player-feedback-bridge-review.md`, `player-visibility-review.md`,
`world-simulation-review.md`.

### Design (`docs/design/`) — 11 documentos (mais os 2 desta Sprint)

| Documento | Classificação | Nota |
|---|---|---|
| `README.md` | 🟡 Complementar | Índice local da pasta — este arquivo (`ARCHITECTURE_INDEX.md`) é agora a porta de entrada real do projeto |
| `progression-map.md` | 🟢 Canônico | Fonte oficial do mapa de progressão por hora jogada |
| `goals-inventory.md` | 🟢 Canônico | Fonte oficial do inventário de objetivos de longo prazo |
| `progression-tree.md` | 🟢 Canônico | Fonte oficial da árvore de dependência de sistemas |
| `risks-and-mitigations.md` | 🟢 Canônico | Fonte oficial dos riscos de progressão de 500h+ |
| `identity-and-differentiation.md` | 🟢 Canônico | Fonte oficial da diferenciação competitiva |
| `vision-2.0.md` | 🟡 Complementar | Extensão declarada de `game-design-bible/01-vision.md` — não substitui, não compete |
| `long-term-roadmap.md` | 🟡 Complementar | Estende `game-design-bible/12-roadmap.md` além do que ele cobre — não substitui |
| `streamrpg-core-pillars.md` | 🟢 Canônico | Fonte oficial dos Pilares de Design (produto), distintos dos Princípios de Arquitetura (engenharia, cap. 2 da Bible) |
| `classes-final-architecture.md` | 🟢 Canônico | **Fonte oficial de Classes e de Hero Token** |
| `class-dependency-map.md` | 🟢 Canônico | Fonte oficial da cadeia de dependência específica de Classes |
| `technical-roadmap.md` (novo, Etapa 8) | 🟢 Canônico | Fonte oficial do roadmap de implementação técnica |

### Outros

Nenhum documento encontrado fora das 7 pastas acima — todo `.md` do
projeto está catalogado nesta lista (73 arquivos antes desta Sprint, 74
depois de somar `docs/ARCHITECTURE_INDEX.md`, 75 com
`docs/design/technical-roadmap.md`).

---

## Etapa 3 — Fonte única por assunto

| Assunto | Documento oficial |
|---|---|
| Vision | `game-design-bible/01-vision.md` |
| Princípios de Arquitetura (engenharia) | `game-design-bible/02-principles.md` |
| Pilares de Design (produto) | `docs/design/streamrpg-core-pillars.md` |
| Characters (base) | `game-design-bible/03-characters.md` |
| Classes | `docs/design/classes-final-architecture.md` |
| Hero Token | `docs/design/classes-final-architecture.md` (Etapa 8) |
| Combat (fórmula) | `combat-model/canonical-formula.md` |
| Monstros/Regiões (combate) | `combat-model/monsters-and-regions.md` |
| Builds | `gameplay-design/04-builds.md` |
| Equipment | `gameplay-design/05-equipment.md` |
| Groups/Party | `gameplay-design/02-groups.md` |
| Progression (XP/Level/Gold/Drop) | `game-design-bible/05-progression.md` |
| Bosses (design) | `game-design-bible/06-bosses.md` |
| Bosses (técnico/máquina de estados) | `technical-design/boss-system.md` |
| Quests | `game-design-bible/07-quests.md` |
| Kingdoms | `game-design-bible/08-kingdoms.md` (⚠️ ver gap na Etapa 9) |
| Seasons | `game-design-bible/09-seasons.md` |
| Economy | `game-design-bible/10-economy.md` |
| Marketplace | `game-design-bible/11-marketplace.md` |
| Roadmap de Sistemas | `game-design-bible/12-roadmap.md` |
| Roadmap de Longo Prazo (fases/temporadas/expansões) | `docs/design/long-term-roadmap.md` |
| Events (EventBus) | `game-design-bible/13-events.md` |
| Architecture (fluxo técnico) | `game-design-bible/14-architecture.md` |
| Data Consistency / Transações | `technical-design/atomic-update-guideline.md` |
| World — Regiões | `world-design/regions.md` |
| World — Grafo de conexão | `world-design/roads.md` |
| World — Cidades | `world-design/cities.md` |
| World — NPCs | `world-design/npc-design.md` |
| World — Lore | `world-design/lore-ambiental.md` |
| Progressão por hora jogada | `docs/design/progression-map.md` |
| Inventário de objetivos | `docs/design/goals-inventory.md` |
| Árvore de dependência de sistemas | `docs/design/progression-tree.md` |
| Riscos de progressão longa | `docs/design/risks-and-mitigations.md` |
| Diferenciação competitiva | `docs/design/identity-and-differentiation.md` |
| Roadmap técnico de implementação | `docs/design/technical-roadmap.md` |
| Backlog de perguntas abertas | `game-design-bible/open-questions.md` |

---

## Etapa 4 — Mapa de dependências

```
Vision (game-design-bible/01-vision.md)
  ↓
Core Pillars (docs/design/streamrpg-core-pillars.md)
  + Architecture Principles (game-design-bible/02-principles.md)
  ↓
Gameplay (gameplay-design/01,02,04,05 — atributos, grupos, builds, equipment)
  ↓
Combat (combat-model/canonical-formula.md + monsters-and-regions.md)
  ↓
Classes (docs/design/classes-final-architecture.md)
  ↓
Items (packages/shared/src/items.ts + schema `items`/`character_items`/`equipped_items`)
  ↓
Boss (game-design-bible/06-bosses.md + technical-design/boss-system.md)
  ↓
World (world-design/regions.md, roads.md, cities.md, npc-design.md, lore-ambiental.md)
  ↓
Economy (game-design-bible/10-economy.md + Hero Token em classes-final-architecture.md)
  ↓
Marketplace (game-design-bible/11-marketplace.md)
  ↓
Frontend (apps/web — já implementado para XP/Gold/Drop/Boss/Ranking/Mundo)
  ↓
Engine (game-design-bible/14-architecture.md — já implementado)
  ↓
Implementation (docs/design/technical-roadmap.md)
```

Esta é a ordem lógica de leitura para entender **por que** o jogo é como
é — não a ordem de implementação (essa está em
`docs/design/technical-roadmap.md`, que é puramente sobre sistemas ainda
não construídos, ordenados por dependência técnica real, não por camada
conceitual).

---

## Etapa 5 — Ambiguidades encontradas e resolvidas

| Decisão duplicada | Onde aparecia | Resolução |
|---|---|---|
| `Classe_mult` | `game-design-bible/06-bosses.md` (placeholder `1`), `gameplay-design/01-characters-attributes.md`, `gameplay-design/08-boss-interface.md`, `combat-model/canonical-formula.md` (estrutura sem valor) | **Fonte única: `docs/design/classes-final-architecture.md`, Etapa 7** — valores reais por classe/tipo de dano. Todas as outras menções continuam corretas como estrutura, mas o valor real vem só de lá. |
| Hero Token | `game-design-bible/10-economy.md` (conceito + pergunta em aberto), `game-design-bible/04-classes.md` (menção) | **Fonte única: `docs/design/classes-final-architecture.md`, Etapa 8** — todas as 8 perguntas fechadas. `10-economy.md` agora aponta para lá (ver Etapa 6). |
| Kingdom = instância por canal | `world-design/README.md`, `regions.md`, `exploration.md`, `future-expansion.md`, `world-events.md`, `docs/design/*` (citado em 4+ documentos diferentes, nunca definido como conceito próprio) | **Não totalmente resolvido nesta Sprint** — ver gap explícito na Etapa 9. `game-design-bible/08-kingdoms.md` é o ponteiro oficial, mas seu conteúdo continua Placeholder. |
| Boss | `game-design-bible/06-bosses.md` (design) vs. `technical-design/boss-system.md` (técnico) | **Não é uma duplicação real** — são dois assuntos diferentes (decisão de design vs. máquina de estados de implementação), cada um com sua própria fonte única, ambos 🟢 Canônico. |
| Marketplace | `game-design-bible/11-marketplace.md` (único documento substantivo) | **Nenhuma duplicação real encontrada** — as únicas outras menções (Hero Token circulando, `boss-reward-balance-study.md`) já foram reconciliadas via Classes (Etapa 8) e permanecem citações, não definições concorrentes. |
| Região × Classe favorecida | `gameplay-design/07-regions-interface.md` (visão por região) vs. `docs/design/classes-final-architecture.md` (visão por classe, Etapa 6) | **Fonte única: `docs/design/classes-final-architecture.md`** para "qual classe brilha em qual região". `07-regions-interface.md` permanece como registro do processo que descobriu as lacunas (arma mágica ausente, "dano em área" não modelado) — não é mais a tabela a ser consultada primeiro. |
| Roadmap (Systems) vs. Roadmap (Longo Prazo) | `game-design-bible/12-roadmap.md` vs. `docs/design/long-term-roadmap.md` | **Não é uma duplicação real** — `12-roadmap.md` é a ordem de construção de Sistemas (✅ Estável); `long-term-roadmap.md` estende isso para fases de Season/Expansion que `12-roadmap.md` não cobre, e já se declara explicitamente como extensão, não substituição. |
| Escassez / Colheita (nomes repetidos com escopos diferentes) | `world-design/random-events.md` (local, dias, uma Vila) vs. `world-design/world-events.md` (todo o Kingdom, temporada) | **Resolvido nesta Sprint** — ver amendment em ambos os arquivos, Etapa 6. |
| "Todo caminho passa pela Capital" | `world-design/roads.md` (regra) vs. `world-design/exploration.md` (Teleporte da Palafita quebra a regra) | **Resolvido nesta Sprint** — ver amendment em `roads.md`, Etapa 6. |

---

## Etapa 6 — Referências adicionadas (histórico → oficial)

As seguintes edições foram feitas — todas são **ponteiros curtos**,
nenhuma cópia de conteúdo:

1. `game-design-bible/04-classes.md` — nota apontando para
   `docs/design/classes-final-architecture.md` como a arquitetura fechada.
2. `game-design-bible/10-economy.md` — nota na seção Hero Token apontando
   para `docs/design/classes-final-architecture.md` (Etapa 8).
3. `game-design-bible/open-questions.md` — as 3 perguntas de Classes
   removidas da lista de abertas, substituídas por uma nota apontando
   para a resolução.
4. `gameplay-design/06-classes-skills.md` — cabeçalho marcando o
   documento como histórico, apontando para
   `docs/design/classes-final-architecture.md`.
5. `gameplay-design/07-regions-interface.md` — nota apontando para a
   visão por-classe em `docs/design/classes-final-architecture.md`.
6. `world-design/roads.md` — amendment reconciliando a regra "todo
   caminho passa pela Capital" com a exceção já registrada em
   `exploration.md`.
7. `world-design/random-events.md` e `world-design/world-events.md` —
   nota distinguindo escopo de "Escassez"/"Colheita" local vs. de Kingdom.

---

## Ordem de leitura recomendada para um desenvolvedor novo

1. `game-design-bible/01-vision.md` — o que é o jogo.
2. `docs/design/streamrpg-core-pillars.md` — o que nunca pode ser
   quebrado.
3. `game-design-bible/02-principles.md` — como o código é organizado.
4. `game-design-bible/14-architecture.md` — o fluxo técnico real.
5. `combat-model/canonical-formula.md` — como combate funciona.
6. `docs/design/classes-final-architecture.md` — como Classes funciona
   (o sistema mais recentemente fechado, bom exemplo de "design pronto
   para implementar").
7. `game-design-bible/06-bosses.md` + `technical-design/boss-system.md`
   — o sistema mais maduro do jogo, do design à implementação real.
8. `world-design/regions.md` + `roads.md` — o mundo.
9. `docs/design/progression-tree.md` — o que vem depois, e por quê.
10. `docs/design/technical-roadmap.md` — o que implementar primeiro.

---

## Etapa 9 — Auditoria final

**Existe algum documento que ainda permita interpretações diferentes?**

Não para os assuntos com fonte única definida na Etapa 3. A única área
que ainda permite leitura ambígua é **Kingdoms** — ver abaixo.

**Existe alguma decisão ainda aberta?**

Sim, e isso é esperado — nem toda decisão deveria fechar nesta Sprint
(ela é de consolidação, não de novo design). Em aberto, oficialmente:
- Quests (capítulo 7) — Placeholder total, nenhuma Sprint de design
  ainda dedicada a ele.
- Kingdoms (capítulo 8) — Placeholder, e **sem dono de documento real**:
  o conceito "Kingdom = instância por canal" é usado como premissa em 5+
  documentos, mas nunca foi escrito como sua própria decisão em nenhum
  lugar — a mesma lacuna que `world-design-review.md` já havia
  identificado como "opportunity #1" e que esta Sprint de consolidação
  **não resolve** (resolver exigiria design novo, não consolidação —
  fora do escopo desta Sprint).
- Seasons (capítulo 9) — Placeholder total.
- Economia 1.0 e Marketplace — 🚧 Em discussão, aguardando Sprint de
  design dedicada, na ordem já confirmada pelo Roadmap.

**Existe algum sistema ainda sem dono?**

Sim — **Kingdoms** é o único sistema importante hoje sem um documento
que seja, de fato, sua fonte real de decisão (só um Placeholder + citações
espalhadas). Isso deveria ser o próximo candidato a uma Sprint de Design
dedicada, no mesmo formato bloco-a-bloco já usado para Bosses e Classes —
não esta Sprint, que é de consolidação, não de fechamento de novos
sistemas.

**Depois desta Sprint, três desenvolvedores conseguem trabalhar em
sistemas diferentes sem gerar conflito de arquitetura?**

Sim, para os sistemas com fonte única já fechada: um desenvolvedor
implementando Classes (`docs/design/classes-final-architecture.md`), um
implementando o próximo passo do Combat Model em Boss
(`combat-model/canonical-formula.md` + `technical-design/boss-system.md`),
e um trabalhando em World/Exploração (`world-design/regions.md` +
`roads.md`) têm, cada um, exatamente um documento para consultar, sem
precisar adivinhar qual dos vários é o certo. Um quarto desenvolvedor
tentando começar Kingdoms **não teria** essa clareza — e não deveria
começar até essa Sprint de design específica acontecer.
