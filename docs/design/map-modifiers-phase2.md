# Map Modifiers — Phase II (Sprint 33)

**Status:** ✅ Integração real — os 7 Map Modifiers com eixo definido (`monster-damage-up`, `monster-life-up`, `elite-chance-up`, `gold-quantity-up`, `experience-up`, `loot-quantity-up`, `rarity-up`) agora alteram gameplay de verdade quando presentes em `AdventureSession.activeMapModifiers`. `boss-power-up` (Fase 6) permanece reconhecido, mas inerte — ponto oficial de integração, sem efeito ainda. Não existe, ainda, nenhum mecanismo de jogo real que popule `activeMapModifiers` (Atlas/Map Device/Rare Maps seguem fora de escopo) — hoje só um teste ou um script QA pode ativar um Mod.

## 1. O que mudou desde a Phase I

Phase I (Sprint 32) construiu o catálogo (`MAP_MODIFIER_REGISTRY`) e o campo (`AdventureSession.activeMapModifiers`) como infraestrutura pura, deliberadamente inerte. Phase II (esta Sprint) constrói o ÚNICO elo que faltava: `mapmods/mapModifierRuntimeConfig.ts` traduz uma lista de `MapModifierId` em multiplicadores reais sobre `CombinedRuntimeConfig` — o mesmo formato que Combat/Encounter/Loot/Rewards já liam desde World Tiers Phase I e Dungeon Modifier Runtime Integration Phase I. Nenhum sistema paralelo foi criado; Map Modifiers entraram no mesmo cano que World Tier e Dungeon Modifiers já usavam.

## 2. Como Mods aumentam risco (Combat + Encounter)

`monster-damage-up` (+20%) e `monster-life-up` (+40%) multiplicam `enemyDamageMultiplier`/`enemyLifeMultiplier` — os MESMOS campos que `worldencounter/spawn.ts` já consumia para World Tier/Dungeon Modifiers, então nenhuma mudança de código foi necessária ali: uma instância de mapa com esses Mods ativos spawna inimigos genuinamente mais fortes. `elite-chance-up` (+25%) multiplica `eliteChanceMultiplier`, lido por `worldencounter/generator.ts`'s `rollVariant()` — também sem nenhuma mudança de código, já que o campo já existia. O teste desta Sprint prova matematicamente (via a estrutura de `pickWeighted()`) que subir a chance de Elite nunca REMOVE um Elite que já sairia sem o Mod — só converte alguns encontros normais em Elite, nunca o contrário.

## 3. Como Mods aumentam recompensa (Loot + Economia)

`gold-quantity-up` (+35%) multiplica `rewardMultiplier`, que agora alimenta DOIS pontos reais: o ouro adicional do Mini-Boss (`enemy/lootIntegration.ts`, que antes desta Sprint não lia runtime config nenhum) e o ouro de conclusão de expedição (`expeditions/expeditionController.ts`, já vinha lendo desde World Tiers Phase I). `loot-quantity-up` (+20%) e `rarity-up` (+30%) multiplicam dois campos NOVOS em `CombinedRuntimeConfig` — `lootMultiplier` (já existia desde World Tiers Phase I, mas sem nenhum consumidor real até agora) e `lootRarityMultiplier` (novo nesta Sprint) — que alimentam `lootgen/generator.ts` (quantidade, POR CIMA de `LootTable.quantityMultiplier`) e `lootidentity/generator.ts` (raridade, combinado com o bônus de Elite já existente). `experience-up` (+15%) multiplica `xpMultiplier`, que agora alimenta o XP por abate normal (`presentation/presentationLayer.ts`, a fonte de XP mais frequente durante exploração) além do XP de conclusão de expedição, que já lia esse campo.

Em todos os casos, "somente pesos/multiplicadores" foi respeitado: nenhuma Loot Table, Monster Loot Signature, World Region ou fórmula de XP/combate foi reescrita — os Mods só multiplicam o resultado que esses sistemas já calculavam.

## 4. Como Mods valorizam mapas e criam rotas diferentes

Com efeito real (não mais só catálogo), a mesma "Fortaleza Sombria" com `monster-life-up` + `rarity-up` ativos é agora, literalmente, uma instância de risco/recompensa mais alta do que uma sem Mods — o jogador que puder escolher entre instâncias vai preferir rotas com Mods de economia quando estiver bem equipado, e evitá-las quando estiver fraco. Isso é o material bruto que uma Sprint futura (Atlas/Map Device/Rare Maps) vai usar para decidir preço de mercado e raridade de instância — sem precisar inventar um segundo conceito de "valor", já que o valor real (mais ouro/loot/XP por mais risco) já existe nos números.

## 5. O que sustenta o mercado

Como `gold-quantity-up`/`loot-quantity-up`/`rarity-up` aumentam a MESMA economia (Gold Ledger, Merchant, Blacksmith, Salvage) que já existe desde Economy Core Phase I, uma instância de Mapa "boa" (múltiplos Mods de economia ativos) aumenta genuinamente a oferta de Gold/itens de maior raridade no mercado — sem criar uma segunda moeda ou um segundo pipeline de item. O mesmo Merchant/Blacksmith/Salvage que já processam qualquer item/Gold da sessão continuam funcionando sem nenhuma mudança de código.

## 6. Boss Modifier (Fase 6) — ponto oficial, ainda sem efeito

`boss-power-up` está presente na tabela `MAP_MODIFIER_AXIS` (`mapmods/mapModifierRuntimeConfig.ts`) com `undefined` como eixo — reconhecido explicitamente como "este Mod existe, mas não afeta nenhum campo ainda", em vez de simplesmente omitir o id (o que deixaria a decisão implícita). Uma Sprint futura de Boss Scaling pode adicionar um eixo próprio a `CombinedRuntimeConfig` (ex.: `bossPowerMultiplier`) e ligar essa mesma entrada, sem precisar redesenhar `applyMapModifiers()`.

## 7. O que esta Sprint deliberadamente NÃO faz

Rare Maps, Unique Maps, Corrupted Maps, Atlas, Waystones, Map Device, League Mechanics, Runewords, Boss exclusivos. Nenhuma rolagem/atribuição de Mod a uma sessão real existe ainda — `activeMapModifiers` continua populável só manualmente (teste/QA). Nenhum balanceamento foi alterado — todos os percentuais são exatamente os publicados no Registry desde a Sprint 32.

---

*Referências: `docs/design/map-modifiers-phase1.md` (Sprint 32, infraestrutura pura), `packages/shared/src/mapmods/mapModifierRuntimeConfig.ts` (o resolvedor real desta Sprint), `packages/shared/src/dungeon/dungeonController.ts` (o ponto único de resolução, onde Map Modifiers se somam a World Tier + Dungeon Modifiers), `docs/design/endgame-map-system-phase1.md`/`map-integration-phase1.md` (Sprints 30/31, o Mapa em si).*
