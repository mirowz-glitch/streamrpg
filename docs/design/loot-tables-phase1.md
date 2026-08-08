# Loot Tables — Phase I (Sprint 28)

**Status:** 🚧 Infraestrutura apenas — nenhuma função de `restrictions.ts` é chamada por `itemgen/generator.ts`, `lootgen/generator.ts` ou `lootidentity/resolve.ts`. Este documento explica a DECISÃO (por que um limite explícito, além da afinidade suave já existente, evita quebrar a economia) — a integração real fica para uma Sprint futura.

## 1. Por que isso evita inflação

Até esta Sprint, toda afinidade por monstro (`MonsterLootSignature`, Sprint 27) e por Facção (Sprint 26) era só um PESO — nunca um limite. Em teoria, qualquer monstro sempre poderia dropar QUALQUER Base/Esfera/Gema, só com probabilidade menor. Isso significa que, com jogo suficiente, um jogador eventualmente acumularia tudo de qualquer fonte — nunca existiria um recurso genuinamente escasso a um lugar. `MonsterLootTable` introduz o oposto: um Goblin NUNCA pode dropar um Cajado, nem que o jogador jogue mil horas. Escassez real (não só improvável) é o que dá valor de mercado a um item — o mesmo argumento já usado em `economy-sphere-currency.md` pra Esferas, agora estendido pra Bases/Gemas/Materiais por monstro.

## 2. Por que isso evita farm universal

Sem limites, o "melhor monstro" seria sempre o de maior nível (mais Item Level, mesmas probabilidades de tudo) — nenhum motivo real de escolher um monstro específico além de dano/HP. Com `MonsterLootTable`, um Cavaleiro Negro literalmente NUNCA droppa uma Esfera (`allowedSpheres` vazio nesta Sprint, já que nenhuma afinidade de Esfera foi derivada pra ele) — um jogador que precise de Esferas nunca "farma universal", precisa necessariamente ir atrás de um Cultista.

## 3. Por que isso cria rotas de farm

`allowedBases`/`allowedSpheres`/`allowedGems`/`allowedMaterials` de cada um dos 22 monstros reais são uma partição do catálogo real (nunca sobrepostos com `blockedX`, verificado por teste) — isso significa que a resposta a "onde eu consigo X" deixa de ser "em qualquer lugar, com sorte" e passa a ser "nestes monstros especificamente". Combinado com a identidade regional já criada (`world-loot-system-phase1.md`) e a identidade de Facção (`enemy-factions-phase1.md`), o jogador agora tem 3 camadas reais de decisão de farm (região → facção → monstro específico) — cada uma mais granular que a anterior.

## 4. Por que isso mantém a economia viva

Mandamento 7 da Filosofia (`00-philosophy.md`): *"A economia é dirigida pelos jogadores, nunca por decreto."* Esta Sprint não fixa nenhuma probabilidade real — ela só declara o universo do POSSÍVEL por monstro. O valor de mercado de cada recurso continua emergindo do que os jogadores decidirem fazer, mas agora sobre uma base onde a escassez é estrutural (impossível, não só rara) — a diferença entre "raro" e "impossível de obter de outra forma" é exatamente o que já fazia da Esfera da Incerteza o caso mais forte de "raro" do jogo (`economy-sphere-currency.md`); esta Sprint estende esse mesmo princípio a toda Base/Gema/Material do jogo.

## 5. O que já existia (não recriado nesta Sprint — achado central da auditoria)

- **`lootgen/types.ts` já exporta um `LootTable` real** (`{id, weight, itemLevelVariance, dropChance, allowedBaseItems, baseItemWeights, rarityMultiplier, quantityMultiplier, quantityOptions, seedOffset}`), já usado de verdade por `generateLoot()` — `allowedBaseItems` já é um allow-list real por monstro, já em produção desde a Sprint 13. `MonsterLootTable` (esta Sprint) é uma camada MAIS AMPLA (cobre também Esferas/Gemas/Materiais/Afixos) e ainda inerte — candidata a, numa Sprint futura, GATEAR o `LootTable` real, nunca substituí-lo hoje.
- **`MonsterLootSignature`** (Sprint 27) — toda entrada de `allowedX`/`blockedX` desta Sprint é derivada diretamente da afinidade real já registrada lá; nenhum peso novo.
- **`itemgen/baseItems.ts`/`itemization/spheres.ts`/`socket/gemDefinition.ts`/`worldregion/materialTypes.ts`/`itemgen/prefixes.ts`+`suffixes.ts`** — os 5 universos reais e fechados usados pra particionar `allowed`/`blocked`; nenhum id inventado em nenhuma das 5 dimensões.

## 6. O que esta Sprint deliberadamente NÃO faz

Ligação real no pipeline de drop (`generateLoot()`/`generateMonsterLoot()`/`resolveLootBias()` continuam lendo só o que já liam), alteração de Item Generator, Loot Generator, Adventure, Dungeon, Boss, Craft, Sockets, Transformation, Mythic, Legacy, Economia existente. Balanceamento de probabilidade real, drop rate definitivo.

---

*Referências: `docs/game-design-bible/00-philosophy.md` (Mandamento 7), `docs/design/monster-loot-identity-phase1.md` (a camada de peso que esta Sprint complementa com limite, Sprint 27), `docs/design/economy-sphere-currency.md` (o mesmo princípio de escassez estrutural aplicado primeiro à Esfera da Incerteza), `packages/shared/src/monsterLootTable/` (implementação real desta Sprint), `packages/shared/src/lootgen/` (`LootTable` real, distinto e intocado).*
