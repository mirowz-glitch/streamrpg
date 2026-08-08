# Map Modifiers — Phase I (Sprint 32)

**Status:** 🚧 Infraestrutura apenas — nenhum consumidor real (`combat/`, `worldencounter/generator.ts`, `lootidentity/`, `economy.service.ts`) lê nada de `mapmods/` ainda. `AdventureSession.activeMapModifiers` existe e sempre `[]`. Este documento explica a DECISÃO (por que o mesmo Mapa poder ser diferente a cada instância é o próximo passo natural depois de Map Integration Phase I, Sprint 31) — a integração real (efeito de verdade em combate/encontro/loot/economia) fica para uma Sprint futura.

## 1. Como Mods aumentam risco

Cada Mod de combate (`monster-damage-up`: +20%, `monster-life-up`: +40%) e de encontro (`elite-chance-up`: +25%, `boss-power-up`: Boss mais forte) descreve um jeito específico de tornar a MESMA instância de Mapa mais perigosa que outra instância do mesmo Mapa — sem tocar em nenhum número real do jogo hoje (Fase 6: "sem alterar números"). Quando uma Sprint futura ligar isso ao pipeline real (o mesmo padrão de gate já usado por `DungeonRuntimeConfig`, `expeditions/expeditionModifiers.ts`), o jogador vai poder olhar pra `AdventureSession.activeMapModifiers` antes de entrar e decidir se aquela instância específica vale o risco.

## 2. Como Mods aumentam recompensa

Os Mods de economia (`gold-quantity-up`: +35%, `loot-quantity-up`: +20%, `rarity-up`: +30%) e progressão (`experience-up`: +15%) são o lado oposto da mesma moeda — risco maior (combate/encontro mais duro) correlacionado com recompensa maior (mais ouro/loot/raridade/XP), o padrão clássico de "Map Mods" já citado como referência no brief. Nenhum dos dois lados é aplicado ainda; a estrutura de dados (`MapModifier.category`) já separa os dois eixos com precisão suficiente pra uma Sprint futura decidir a correlação exata sem precisar remodelar o tipo.

## 3. Como Mods aumentam o valor do mapa

Hoje, todas as 9 instâncias possíveis de um Mapa (Sprint 30/31) são idênticas — a MESMA "Fortaleza Sombria" sempre tem o mesmo Enemy Pool, os mesmos multiplicadores de economia (`MapEconomicProfile`, ainda inerte). Com `MapModifier` existindo (mesmo sem efeito), o valor de uma instância de Mapa deixa de ser fixo por design — uma Fortaleza Sombria com `boss-power-up` + `rarity-up` "vale mais" narrativamente que uma sem nenhum Mod, preparando o terreno pra Atlas/Map Device decidirem ISSO de verdade (rolagem, raridade de instância, preço de mercado) sem inventar um conceito novo quando chegar a hora.

## 4. O que já existia (não recriado nesta Sprint)

- **`MapDefinition`/`Map.enemyPool`** (`worldmap/`, Sprint 30/31) — continuam a fonte real de "o que pode aparecer neste Mapa"; `MapModifier` nunca duplica nem substitui esse universo, só descreve um multiplicador POR CIMA dele (ainda inerte).
- **`DungeonModifierDefinition`/`resolveDungeonRuntimeConfig()`** (`expeditions/expeditionModifiers.ts`, Vertical Slice "Dungeon Modifier Runtime Integration Phase I") — um sistema de Modifier JÁ REAL e wired, mas escopado por Expedição (Dungeon), nunca por Mapa. `MapModifier` é deliberadamente um tipo/módulo TOTALMENTE separado — mesmo vocabulário conceitual ("modifier"), zero código compartilhado, porque os dois têm ciclos de vida diferentes (Dungeon Modifiers já resolvem pra um `CombinedRuntimeConfig` real a cada tick; Map Modifiers ainda não resolvem nada).
- **`AdventureSession.currentMapId`** (Sprint 31) — continua a referência real de "em qual Mapa estou"; `activeMapModifiers` é um array PARALELO na mesma sessão, nunca embutido dentro do Mapa em si (Mods pertencem à INSTÂNCIA da sessão do jogador, não à definição estática do Mapa).

## 5. O que esta Sprint deliberadamente NÃO faz

Rare Maps, Unique Maps, Atlas, Map Device, Waystones, Corruption, League Mechanics, Boss exclusivos, Raids, Temporadas, World Events. Nenhuma rolagem/atribuição de Mod a uma sessão real existe — `activeMapModifiers` é sempre `[]`, populável apenas manualmente em teste. Nenhum sistema de combate, encontro, loot ou economia lê `mapmods/` — confirmado por teste (`mapModifiersPhase1.test.ts`, "Compatibilidade").

---

*Referências: `docs/design/map-integration-phase1.md` (Sprint 31, `currentMapId`/gate real de Enemy Pool — a integração que este módulo ainda não tem), `docs/design/endgame-map-system-phase1.md` (Sprint 30, `MapDefinition`/`MapEconomicProfile`), `packages/shared/src/expeditions/expeditionModifiers.ts` (o sistema de Modifier real já existente, escopado por Dungeon — nunca confundido com este), `packages/shared/src/mapmods/` (implementação real desta Sprint).*
