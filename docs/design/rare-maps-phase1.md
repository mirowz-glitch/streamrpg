# Rare Maps — Phase I (Sprint 34)

**Status:** ✅ Primeira instância real — `generateRareMap()` (`packages/shared/src/raremap/`) produz um `RareMapInstance` de verdade (Mapa + raridade + tier + Mods), e `createAdventureSession()` aceita esse `RareMapInstance` como 6º parâmetro opcional, populando `AdventureSession.activeMapModifiers` a partir de `RareMap.mods` — reutilizando 100% do pipeline de efeito real já construído na Sprint 33 (`dungeon/dungeonController.ts`'s `applyMapModifiers()`), sem nenhuma mudança de código além da própria criação da sessão. Ainda sem nenhum mecanismo real de jogo (Atlas/Map Device/Waystones, explicitamente fora de escopo) que deixe um jogador ESCOLHER ou ENCONTRAR um Rare Map dentro do app web — isso é o próximo passo natural, não desta Sprint.

## 1. Como Rare Maps criam valor

Antes desta Sprint, toda instância de um Mapa era idêntica — Map Modifiers Phase II (Sprint 33) construiu o pipeline de EFEITO real, mas não existia nenhum jeito de uma instância real do jogo carregar Mods (só teste/QA podia empurrar `activeMapModifiers` manualmente). Com `generateRareMap()` real, uma "Fortaleza Sombria" agora pode nascer, de verdade, com 3-5 Mods simultâneos (raridade Rare) — cada instância é literalmente um objeto diferente, com um valor diferente, mesmo vindo do mesmo `MapDefinition.id`. Isso é o pré-requisito estrutural para qualquer economia de mercado de Rare Maps numa Sprint futura (Atlas/Map Device decidirem preço/raridade de instância) — o valor real (mais risco, mais recompensa) já existe nos números desde a Sprint 33; esta Sprint só faz esse valor nascer de uma instância real em vez de só existir em teoria.

## 2. Como Rare Maps aumentam risco

`generateRareMap()` pode rolar `monster-damage-up`/`monster-life-up`/`elite-chance-up`/`boss-power-up` junto com os Mods de economia — um Rare Map de raridade "rare" (3-5 Mods) tem chance real de empilhar 2+ Mods de combate ao mesmo tempo, tornando aquela instância especificamente mais perigosa que uma instância "normal" (0 Mods) do mesmo Mapa. Como a seleção usa `pickWeightedMany()` sem reposição, nunca rola o mesmo Mod duas vezes na mesma instância — cada Mod ativo é sempre um efeito distinto, nunca um dobro do mesmo multiplicador.

## 3. Como Rare Maps aumentam recompensa

Pela mesma lógica, `gold-quantity-up`/`loot-quantity-up`/`rarity-up`/`experience-up` também competem pelo mesmo pool ponderado — uma instância "rare" tem probabilidade real de combinar risco alto com recompensa alta (o padrão clássico de Map Mods já citado desde a Sprint 32). Como a quantidade de Mods escala com a raridade (Normal 0, Magic 1-2, Rare 3-5), uma instância de raridade mais alta tende a ser, em expectativa, tanto mais perigosa QUANTO mais recompensadora — nunca só uma coisa ou só a outra, porque o pool de 8 Mods mistura os dois eixos livremente.

## 4. Como Rare Maps movimentam mercado

Com o Merchant/Blacksmith/Salvage já reais (Sprints anteriores) e agora recebendo mais Gold/loot/raridade de verdade quando uma sessão real carrega um Rare Map (Sprint 33 já religou esses números à economia real — Gold Ledger, characters.gold), uma instância de Rare Map "boa" aumenta genuinamente a oferta de itens valiosos entrando no mercado através dos mesmos pontos de venda que já existem. Nenhuma segunda economia foi criada — o mesmo Gold, os mesmos itens, só que gerados em maior quantidade/raridade quando a instância em jogo é um Rare Map.

## 5. Como Rare Maps sustentam o endgame

Rare Maps são o primeiro passo real na direção de um loop de endgame reconhecível (farmar mapas melhores → equipamento melhor → conseguir enfrentar/rolar Rare Maps de raridade mais alta) — hoje ainda sem nenhum jeito do jogador obter um Rare Map específico (Atlas/Map Device decidem ISSO, fora de escopo), mas a "receita" (`RareMap`) e a "instância concreta" (`RareMapInstance`) já existem prontas para uma Sprint futura anexar um mecanismo de obtenção real (drop, compra, craft) sem precisar remodelar nenhum tipo.

## 6. O que já existia (não recriado nesta Sprint)

- **`MapDefinition`/`MAP_DEFINITIONS`** (`worldmap/`, Sprint 30/31) — `generateRareMap()` sempre escolhe entre Mapas REAIS já registrados (`listMapDefinitions()`), nunca inventa um Mapa novo.
- **`MAP_MODIFIER_REGISTRY`/`MapModifier.weight`** (`mapmods/`, Sprint 32) — `generateRareMap()` finalmente dá ao campo `weight` seu primeiro consumidor real (`pickWeightedMany()`), exatamente como o comentário original da Sprint 32 previa ("existe só pra já ter o campo certo quando uma Sprint futura precisar sortear Mods").
- **`applyMapModifiers()`/`CombinedRuntimeConfig`** (`mapmods/mapModifierRuntimeConfig.ts`, Sprint 33) — zero mudança de código; a ÚNICA coisa nova é que `session.activeMapModifiers` agora pode chegar populado de um Rare Map real, em vez de sempre `[]` ou empurrado manualmente por teste.
- **`pickWeightedMany()`** (`itemgen/rng.ts`) — já existia desde o Item Generator (escolha de Prefixos/Sufixos sem repetição); reaproveitada aqui pela mesma razão, "escolher N Mods distintos, ponderado, sem repetição" é o mesmo problema.

## 7. O que esta Sprint deliberadamente NÃO faz

Atlas, Map Device, Waystones, Corrupted Maps, Unique Maps (`RareMapRarity` aceita `"unique"` no TIPO, mas `generateRareMap()` nunca a produz), League Mechanics, Boss exclusivos. Nenhuma persistência de `RareMap`/`RareMapInstance` existe (Fase 2: "Tudo puro. Sem persistência.") — nenhuma tabela nova, nenhuma rota de API. Nenhum mecanismo real de jogo (UI, drop, compra) permite que um jogador realmente obtenha um Rare Map dentro do app web — `apps/web/src/hooks/useAdventureSession.ts` continua explorando um único Mapa fixo (`bosque-sussurrante`), sem nenhum seletor. A prova de efeito real desta Sprint vem inteiramente da suíte de testes (que exercita `generateRareMap()` → `createAdventureSession()` → `advanceDungeonTick()`, o mesmo caminho de produção que uma UI futura vai usar), não de um fluxo clicável no navegador.

---

*Referências: `docs/design/map-modifiers-phase1.md` (Sprint 32, infraestrutura pura), `docs/design/map-modifiers-phase2.md` (Sprint 33, o pipeline de efeito real que esta Sprint finalmente alimenta com uma instância de verdade), `packages/shared/src/raremap/` (implementação real desta Sprint), `packages/shared/src/adventure/session.ts` (`createAdventureSession()`, o único ponto de integração).*
