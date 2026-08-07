# Atlas — Phase I (Sprint 36)

**Status:** ✅ Primeiro Endgame persistente real — `packages/shared/src/atlas/` organiza os 9 Mapas reais (`worldmap/`, Sprint 30) num grafo navegável (`AtlasNode`/`AtlasState`), e um Map Device (`MapDeviceInstance`) prepara um `AdventureConfiguration` a partir de um Rare Map (Sprint 34) ou Corrupted Map (Sprint 35) real. `createAdventureSessionFromConfiguration()` (`adventure/session.ts`) delega 100% para `createAdventureSession()`, intocada — "Atlas apenas organiza. Map Device apenas prepara. Adventure continua sendo o executor."

## 1. Auditoria (Fase 1) — como o pipeline já funcionava antes desta Sprint

- **Como Adventure nasce:** `apps/web/src/hooks/useAdventureSession.ts` é o único call site de produção — sempre `createAdventureSession(sessionId, character, DEFAULT_MAP_ID, seed, Date.now())`, 5 argumentos, `DEFAULT_MAP_ID = "bosque-sussurrante"` hardcoded. Nenhuma escolha real de jogador existia.
- **Como Region é escolhida:** o 3º parâmetro (`regionId`) de `createAdventureSession()` — hoje sempre o mesmo valor fixo. `currentMapId` é sempre derivado 1:1 de `regionId` via `getMapDefinition()` (`worldmap/mapRegistry.ts`, Sprint 30).
- **Como RareMap é criado:** `generateRareMap(seed, options?)` (`raremap/generator.ts`, Sprint 34) — puro, nunca chamado por nenhum código de produção (só testes).
- **Como CorruptedMap entra na sessão:** `generateCorruptedMap(rareMap, seed)` (`mapcorruption/generator.ts`, Sprint 35) produz um `CorruptedMap`; o 6º parâmetro opcional de `createAdventureSession()` (`RareMapInstance | CorruptedMap`) popula `session.activeMapModifiers = rareMap.mods`.
- **Onde MapModifiers são aplicados:** um único ponto de resolução, `advanceDungeonTick()` (`dungeon/dungeonController.ts`) — `applyMapModifiers(resolveCombinedRuntimeConfig(session.worldTier, dungeonRuntimeConfig), session.activeMapModifiers)` — o mesmo `CombinedRuntimeConfig` que já alimenta Combat/Encounter/Loot/XP desde a Sprint 33.

Nenhuma alteração foi feita durante esta Fase, conforme exigido.

## 2. Sistema Atlas

`AtlasNode`/`AtlasState`/`AtlasConnection`/`AtlasProgress` (`atlas/types.ts`) são todos puros, sem persistência. `AtlasProgress` é o único ponto de entrada de estado "do jogador" — `unlockedMapIds`/`completedMapIds`/`favoriteMapIds` são sempre RECEBIDOS de fora, nunca guardados por este módulo entre chamadas. `unlockedMapIds` tem uma fonte real pronta (`AdventureTimeline.unlockedRegionIds`, Sprint de Region Unlock) ou pode ser derivada puramente do nível do personagem via `deriveUnlockedMapIds()`, que reaproveita a MESMA régua de nível que `checkRegionUnlock()` (`worldencounter/regionProgression.ts`) já usa pro desbloqueio incremental real — nunca uma segunda régua. `completedMapIds`/`favoriteMapIds` não têm nenhum produtor real no Engine ainda — documentado aqui como limitação honesta, não como lacuna escondida.

## 3. Atlas Registry

`buildAtlasState()`/`getAtlasNode()` (`atlasRegistry.ts`) reaproveitam `listMapDefinitions()` (`worldmap/mapRegistry.ts`, Sprint 30) como a ÚNICA fonte de "quais mapas existem" — os 9 Mapas reais, `id === mapId` sempre. `AtlasNode.tier` reaproveita `MapDefinition.dangerLevel`, que por sua vez já reaproveita `BIOME_PROGRESSION.order` (Enemy System original) — nunca uma escala nova. `connections` reaproveita `REGION_GRAPH` (`regions.ts`, o grafo de viagem real do Expedition System) filtrado apenas aos ids que também são um Mapa real (as 2 regiões sem conteúdo de combate, `porto-do-amanhecer`/`planicie-dourada`, nunca aparecem como Node nem como conexão) — "Nada procedural" é honrado literalmente: nenhum RNG existe neste arquivo.

## 4. Map Device

`MapDevice` (vazio, atlas/types.ts) e `MapDeviceInstance` (`mapDevice.ts`, com `loadedMap` obrigatório) seguem o mesmo padrão Definição/Instância já usado por `RareMap`/`RareMapInstance` (Sprint 34). `loadMapIntoDevice()` só embrulha um `RareMapInstance`/`CorruptedMap` real; `prepareAdventureConfiguration()` só extrai `mapId`/o próprio Mapa num `AdventureConfiguration` — nenhuma das duas funções inicia Adventure, abre mapas, ou aplica combate, exatamente como as Decisões Oficiais exigem.

## 5. Integração com Adventure

`createAdventureSessionFromConfiguration()` (`adventure/session.ts`) é a única função nova nesta camada — desempacota `AdventureConfiguration.mapId`/`.rareMap` nos MESMOS parâmetros posicionais que `createAdventureSession()` já aceitava desde a Sprint 34, e delega 100%. `createAdventureSession()` em si permanece byte-a-byte intocada — as ~40 chamadas existentes (incluindo `useAdventureSession.ts`) continuam válidas sem nenhuma mudança de comportamento. "Nunca duplicar lógica" é honrado por construção: a nova função tem uma única linha de corpo.

## 6. Economia

- **Atlas cria mercado:** ao dar ao jogador uma escolha real de QUAL dos 9 Mapas explorar (em vez de um único caminho fixo), o Atlas cria a primeira razão real pra Rare Maps/Corrupted Maps terem valor de troca — um Mapa vale mais quando o jogador pode ESCOLHER usá-lo num Node específico de maior tier, em vez de um destino único e forçado.
- **Atlas cria progressão:** `AtlasProgress.unlockedMapIds`/`completedMapIds` dão forma a uma segunda camada de progresso, paralela ao nível do personagem — "quantos dos 9 Nodes eu já explorei/completei" é um objetivo de fim de jogo genuinamente novo, que nenhum sistema anterior media.
- **Atlas cria valor:** um Node de tier alto (`AtlasNode.tier`, reaproveitando `dangerLevel`) só é alcançável depois que os Nodes conectados a ele (`connections`, o grafo real de regiões) forem desbloqueados — isso dá a cada Rare Map/Corrupted Map gerado para aquele Node um valor implícito maior, sem nenhum número novo inventado.
- **Atlas cria escassez:** como `favoriteMapIds`/`completedMapIds` ainda não têm persistência real (Fase 2: "Sem persistência"), a escassez real desta Fase é a mesma da Sprint 34/35 — Rare Maps/Corrupted Maps continuam limitados pelo que `generateRareMap()`/`generateCorruptedMap()` realmente produzem, o Atlas só dá um destino mais estruturado pra essa escassez.
- **Atlas cria objetivos:** um jogador que vê o Atlas inteiro (`AtlasState.nodes`) ganha uma lista visível de "o que falta" — Nodes não desbloqueados, Nodes não completados — sem que nenhum sistema de Objective precise ser duplicado (o Objective System, Sprint própria, continua a única fonte real de objetivos de jogo).

Nenhum número foi alterado nesta Sprint.

## 7. Compatibilidade

`createAdventureSession()` permanece intocada — confirmado por teste (`atlasPhase1.test.ts`, "Compatibilidade"): chamadas de 5 argumentos e chamadas com `RareMapInstance` direta (Sprint 34) continuam produzindo resultado idêntico ao de antes desta Sprint. Nenhum arquivo de `worldmap/`, `mapmods/`, `raremap/`, `mapcorruption/`, `dungeon/`, `worldtiers/` foi alterado — só lido. Adventure/Idle/Dungeon/Combat/Loot/Merchant/Blacksmith/Craft/Sockets continuam sem nenhuma dependência do Atlas.

## 8. O que esta Sprint deliberadamente NÃO faz

Waystones, Atlas Passive Tree, Unique Maps, Fragments, Pinnacle Bosses, Voidstones, Scarabs, League Mechanics. Nenhuma persistência de `AtlasProgress`/Node desbloqueado/favorito existe — nenhuma tabela nova, nenhuma rota de API. Nenhum mecanismo real de jogo permite que um jogador de fato veja o Atlas ou use um Map Device dentro do app web — a mesma limitação já documentada em `rare-maps-phase1.md`/`corrupted-maps-phase1.md` (sem UI real, não existe fluxo de "escolher um Node" nem "carregar um Mapa num Device"). A prova de efeito real desta Sprint vem inteiramente da suíte de testes.

---

*Referências: `docs/design/endgame-map-system-phase1.md` (Sprint 30, `MapDefinition`/Map Registry, a fonte real dos 9 Nodes), `docs/design/map-integration-phase1.md` (Sprint 31, Map como entrada oficial do Adventure), `docs/design/rare-maps-phase1.md` (Sprint 34), `docs/design/corrupted-maps-phase1.md` (Sprint 35, a origem que o Map Device consome), `packages/shared/src/atlas/` (implementação real desta Sprint).*
