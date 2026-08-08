# Corrupted Maps — Phase I (Sprint 35)

**Status:** ✅ Primeira Corrupção real — `generateCorruptedMap()` (`packages/shared/src/mapcorruption/`) recebe um `RareMapInstance` (Sprint 34) e devolve um `CorruptedMap` — 6 resultados possíveis, sempre determinísticos, sempre irreversíveis. `createAdventureSession()` aceita `CorruptedMap` no mesmo 6º parâmetro que já aceitava `RareMapInstance`, reutilizando 100% do pipeline de efeito real da Sprint 33. "O jogador aceita perder um mapa para tentar criar um mapa muito melhor."

## 1. Corrupção destrói riqueza

Todo `RareMapInstance` corrompido deixa de existir como tal — `generateCorruptedMap()` nunca devolve o `RareMapInstance` original, só um `CorruptedMap` novo referenciando-o via `sourceInstanceId`. Não existe "descorromper" nem reroll (filosofia central desta Sprint) — se o resultado for `"brick"` (Resultado 6, "extremamente difícil"), o jogador perdeu um Rare Map real por um Mapa pior do que quando começou, sem nenhum caminho de volta. Isso é destruição de riqueza literal e permanente, o mesmo princípio econômico de queimar um recurso (mesma categoria de "Nunca existe reroll" já visto em Esferas — Sprint 12-17 — mas aqui aplicado a Mapas, não a Itens).

## 2. Corrupção gera riqueza

Os outros 5 resultados (Fase 4) são estritamente iguais-ou-melhores que "nada acontece": `add-one-modifier`/`add-two-modifiers`/`replace-one-add-two`/`increase-tier` sempre aumentam o número de Mods ativos ou o Tier máximo elegível — mais Mods ativos (Sprint 33) significa, em expectativa, mais risco E mais recompensa ao mesmo tempo (o mesmo par risco/recompensa já documentado em `map-modifiers-phase2.md`). Um jogador que corrompe repetidamente está, estatisticamente, trocando Mapas comuns por uma chance de Mapas muito mais valiosos — a MESMA dinâmica de "aceitar perder para tentar ganhar mais" que já define o gênero (citada literalmente no brief).

## 3. Corrupção remove mapas

Cada corrupção consome exatamente 1 `RareMapInstance` e produz exatamente 1 `CorruptedMap` — nunca 1:N, nunca 0:1. Isso significa que o suprimento total de Rare Maps "não corrompidos" só pode diminuir ao longo do tempo (títulos gerados por `generateRareMap()`, Sprint 34, são a única fonte) — uma pressão deflacionária real sobre o estoque de Rare Maps normais, o tipo de mecânica que sustenta escassez genuína (nunca artificial) numa economia dirigida por jogadores (Mandamento 7 da Bible: "a economia é dirigida pelos jogadores, nunca por decreto").

## 4. Corrupção movimenta mercado

Como Mapas com mais Mods ativos geram mais Gold/loot/raridade reais (pipeline já religado à economia real desde a Sprint 33), um `CorruptedMap` bem-sucedido (`add-two-modifiers`/`increase-tier`) aumenta genuinamente a oferta de itens valiosos entrando no mercado através do Merchant/Blacksmith/Salvage já existentes — sem nenhuma segunda economia, sem nenhum item/moeda nova. O risco de "brick" cria a contrapartida natural: nem todo mundo vai corromper, o que mantém Rare Maps não-corrompidos com valor próprio (opção segura) versus Mapas Corrompidos (aposta de maior variância).

## 5. Corrupção cria itens únicos

`CorruptedMap` em si já É um objeto único por construção — `instanceId` derivado de `mapId + seed`, `corruptionOutcome` gravado permanentemente, `sourceInstanceId` apontando pra uma origem que não existe mais como Rare Map. Um `CorruptedMap` resultado de `"brick"` com todos os 8 Map Modifiers reais ativos ao mesmo tempo (a interpretação desta Sprint pra Resultado 6) é, ele mesmo, um objeto genuinamente raro e identificável — o tipo de "artefato com história" que a Bible já valoriza (Mandamento 4: "toda ação relevante deixa legado"), embora a persistência real desse legado (uma Crônica, um registro) continue fora de escopo desta Sprint (Fase 2: "Tudo puro. Sem persistência.").

## 6. O que já existia (não recriado nesta Sprint)

- **`RareMap`/`RareMapInstance`/`generateRareMap()`** (`raremap/`, Sprint 34) — `generateCorruptedMap()` sempre RECEBE um `RareMapInstance` real, nunca inventa um a partir do zero.
- **`MAP_MODIFIER_REGISTRY`/`MapModifier.weight`/`MapModifier.tier`** (`mapmods/`, Sprint 32) — `generateCorruptedMap()` reaproveita a MESMA tabela e o MESMO `pickWeightedMany()` (itemgen/rng.ts) que `generateRareMap()` já usava, nunca um segundo catálogo de Mods.
- **`applyMapModifiers()`/`CombinedRuntimeConfig`** (`mapmods/mapModifierRuntimeConfig.ts`, Sprint 33) — zero mudança de código; a única coisa nova é que `session.activeMapModifiers` agora também pode vir de um `CorruptedMap`, tratado exatamente como um Rare Map normal.

## 7. O que esta Sprint deliberadamente NÃO faz

Atlas, Waystones, Map Device, Unique Maps, Atlas Passives, League Mechanics. Nenhuma persistência de `CorruptedMap` existe — nenhuma tabela nova, nenhuma rota de API. Nenhum mecanismo real de jogo permite que um jogador de fato corrompa um Mapa dentro do app web (a mesma limitação já documentada em `rare-maps-phase1.md` — sem Atlas/Map Device, não existe UI de "escolher um Rare Map" nem, agora, de "corromper um Rare Map"). A prova de efeito real desta Sprint vem inteiramente da suíte de testes.

---

*Referências: `docs/design/rare-maps-phase1.md` (Sprint 34, `RareMap`/`RareMapInstance`, a origem que esta Sprint consome), `docs/design/map-modifiers-phase2.md` (Sprint 33, o pipeline de efeito real que esta Sprint também alimenta, sem nenhuma mudança de código), `packages/shared/src/mapcorruption/` (implementação real desta Sprint).*
