# Economy Foundation II — Esferas como Moeda do Mundo (Sprint 24)

**Status:** 🚧 Infraestrutura apenas — nenhuma taxa de drop foi balanceada nesta Sprint, nenhum Marketplace/Leilão/NPC vendedor de Esferas existe. Este documento explica a DECISÃO (por que Esferas viram o endgame econômico) — a implementação da economia definitiva fica para uma Sprint futura de Trade Routes/Marketplace, já prevista em `new-roadmap.md`.

## 1. Por que Ouro serve para NPC, e Esferas servem para jogadores

Ouro nasce sem custo real — todo kill de Adventure/Dungeon já concede Ouro (`itemgen`/loot), sem escassez desenhada. Um recurso sem escassez nunca pode carregar valor social entre jogadores; ele só serve pra transações determinísticas contra o mundo (Merchant compra por um preço fixo, Blacksmith cobra um custo fixo) — exatamente os únicos três papéis que o Ouro mantém oficialmente nesta Sprint: **Merchant, Blacksmith, Reparos futuros, NPCs**.

Esferas, ao contrário, já nasceram raras por design desde a Sprint 13 (`DEFAULT_SPHERE_DROP_TABLE`: `dropChance` de 0.08%–10% dependendo da fonte, com Ascensão/Maldição ausentes das fontes mais fáceis — omissão real, nunca `weight: 0`). Escassez real + utilidade real (elas modificam itens de verdade, `crafting/sphereCrafting.ts`) é exatamente o par que faz um recurso virar moeda de fato entre jogadores, mesmo sem nenhum Marketplace formal — o mesmo padrão econômico que Path of Exile já provou (Orbs, não Gold, são a moeda de troca real da comunidade).

## 2. Por que isso mantém o mercado vivo

Mandamento 7 da Filosofia (`00-philosophy.md`): *"A economia é dirigida pelos jogadores, nunca por decreto."* Esta Sprint não fixa um preço de Esfera em Ouro nem cria nenhum mecanismo de troca — ela só garante que a INFRAESTRUTURA de escassez (fontes separadas, pesos configuráveis, exclusividade real) já existe pronta pra um Marketplace futuro ler. O valor de uma Esfera continua emergindo do que os jogadores realmente fazem com ela, nunca de um número de design imutável.

A Esfera da Incerteza é o caso mais extremo desse princípio: ela já é capaz de produzir itens que **nunca existem por nenhum outro caminho** (`BaseTransformation.exclusiveSource: "uncertainty"`, Sprint 17) — o "Anel do Primeiro Rei" só nasce assim, com probabilidade de 1/100.000 por uso elegível. Isso cria histórias reais (Mandamento 4: *"Toda ação relevante deixa legado"*) e um objeto cujo valor de troca não pode ser replicado por nenhum outro sistema do jogo — a definição mais forte possível de "raro" que um MMORPG pode oferecer sem violar o Mandamento contra vender poder com dinheiro real (nenhuma compra concede a Esfera da Incerteza — ela só dropa, joga).

## 3. O que já existe (não recriado nesta Sprint)

- **Registro das 6 Esferas** (Fortuna/Purificação/Ascensão/Lapidação/Maldição/Incerteza): `packages/shared/src/itemization/spheres.ts`, desde as Sprints 10/16. Esta Sprint só formaliza o lookup por chave (`SPHERE_REGISTRY`), sem adicionar nenhuma Esfera nova.
- **SphereDropTable por fonte** (Adventure/Dungeon/Boss/World Boss): `packages/shared/src/spheredrop/`, desde a Sprint 13. Esta Sprint estende o TIPO com campos de gating (`minimumLevel`/`minimumZone`/`minimumBossTier`/`futureSeason`) e duas fontes novas (`world_event`/`future_raid`), todos inertes — nenhuma taxa real muda.
- **Esfera da Incerteza + Itens Exclusivos**: `transformation/` (Sprint 17) + `mythic/` (Sprint 18), totalmente funcionais, com testes reais e um Browser Validation histórico confirmando o fluxo completo (`POST /api/items/sphere` com `sphereId: "uncertainty"`). Esta Sprint só nomeia o conceito de "Uncertainty Exclusive" que o brief pede via `isUncertaintyExclusive()`/`isMythicUncertaintyExclusive()` — reaproveitando `exclusiveSource`, nunca duplicando com um novo campo `uncertaintyOnly`.

## 4. O que esta Sprint deliberadamente NÃO faz

Balanceamento de taxa, drop real das duas fontes novas (`world_event`/`future_raid`), economia definitiva (preço/câmbio), NPC vendedor de Esfera, Leilão, Marketplace, Trading. Todos ficam para a cadeia econômica já prevista em `new-roadmap.md` (Kingdom Treasury → Trade Routes) e para uma Sprint futura de balanceamento de drop-rate, seguindo a mesma disciplina já usada por Enemy Templates/Loot Tables (nunca calibrado sem `runBalanceSimulation.ts`).

---

*Referências: `docs/game-design-bible/00-philosophy.md` (Mandamentos 4 e 7), `docs/design/new-roadmap.md` (Trade Routes/Kingdom Treasury), `docs/design/crafting-phase1-sphere-system.md`, `docs/design/itemization2-phase2-persistence.md`.*
