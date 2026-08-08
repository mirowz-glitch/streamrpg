# Map Integration — Phase I (Sprint 31)

**Status:** ✅ Primeira integração real de `worldmap/` (Sprint 30). `Map` passa a ser a entrada oficial do Adventure (`Adventure → Map → Region → Encounter → Monster Pool → Loot`) e `Map.enemyPool` passa a gatear de verdade quem pode aparecer num encontro — encerrando o ciclo iniciado na Sprint 25 (World Regions → Enemy Factions → Monster Loot Signature → Monster Loot Table → Loot Integration → World Maps → **Gameplay Integration**). Nenhum número mudou; nenhuma mecânica nova (Map Mods/Rare Maps/Atlas/Waystones continuam fora de escopo).

## 1. Como Map muda o farm

Antes desta Sprint, o universo de monstros de uma região era só `EncounterTable.entries` (`worldencounter/encounterTables.ts`) — um dado hand-authored, nunca verificado contra nada. Agora, todo encontro gerado passa por um gate real: `generateEncounter()` (`worldencounter/generator.ts`) interseca `table.entries` com `Map.enemyPool` (`worldmap/mapRegistry.ts`) antes de sortear. Hoje isso nunca remove um monstro de verdade — a auditoria desta Sprint corrigiu `Map.enemyPool` pra ser a união entre a etiqueta administrativa (`EnemyTemplate.region`) e o que a Encounter Table realmente usa, então a interseção é sempre total — mas o farm passa a ter uma fundação estruturalmente auditável: um Mapa futuro (Rare/Unique) que declare um `enemyPool` mais estreito vai restringir de verdade, sem precisar tocar em `generator.ts` de novo.

## 2. Como Map muda a rota

O jogador continua explorando exatamente as mesmas 9 regiões de sempre — nada na rota observável mudou. A diferença é arquitetural: `AdventureSession.currentMapId` (novo campo, sempre `Map.id === regionId` nesta Fase) é agora o dado "oficial" que o Engine carrega ao lado de `currentRegion`, exposto também em `AdventureSessionResult.mapId` — pronto pra uma UI futura de seleção de Mapa (Atlas) ler sem precisar inventar um campo novo na hora. `Dungeon` (via `advanceDungeonTick()`) herda esse contexto de graça, porque — achado reconfirmado da auditoria desta Sprint, já documentado nas Sprints anteriores — Dungeon nunca teve mecanismo próprio de região/monstro: é literalmente a mesma `AdventureSession`/`advanceAdventure()` que Adventure usa, com um Boss Final mapeado por `expeditionId` (`dungeon/dungeonDefinitions.ts`), nunca por Mapa/Região.

## 3. Como Map muda a economia

`MapEconomicProfile`/`MapAffinity` (Sprint 30) continuam completamente inertes — nenhum número de gold/materials/sphere/gem/equipment foi lido por nenhum consumidor real nesta Sprint. A única mudança econômica real é a correção do universo de spawn: `Map.enemyPool` de "minas-abandonadas" ganhou `skeleton` (achado da auditoria — Skeleton já spawna de verdade nas Minas por decisão de lore documentada em `encounterTables.ts`, "mortos-vivos também aparecem nas Minas", mas essa informação nunca tinha chegado ao catálogo de Mapa da Sprint 30). Isso não muda nenhuma taxa de drop — só corrige o catálogo pra refletir o que já acontecia de verdade.

## 4. Como Map muda o endgame

Esta Sprint é o marco que a Observação Arquitetural do brief define: "o projeto deixa de apenas possuir infraestrutura para mapas e passa a jogar através dela." A partir daqui, Map Mods/Corruption/Rare Maps/Unique Maps/Atlas/Waystones/Map Device têm uma base real pra se apoiar — `Map.enemyPool` já é um gate funcional (não só um catálogo), `AdventureSession.currentMapId` já é um campo real da sessão, e o ponto único de resolução (`generateEncounter()`) já existe pronto pra receber um `Map` alternativo no lugar do 1:1 atual com Região.

## 5. O que já existia (não recriado nesta Sprint)

- **`MapDefinition`/`MAP_DEFINITIONS`** (`worldmap/mapRegistry.ts`, Sprint 30) — continuam a fonte real; só a derivação de `enemyPool` foi corrigida (união com a Encounter Table real, nunca substituída).
- **`EncounterTable.entries`/`miniBossTemplateId`** (`worldencounter/encounterTables.ts`, Enemy System original) — continuam o dado bruto real; `Map.enemyPool` nunca inventa uma entrada nova, só valida/gateia o que já existe.
- **`checkRegionUnlock()`** (`worldencounter/regionProgression.ts`, Biomes/Regions/World Progression Phase I) — continua a única lógica de progressão automática de região; esta Sprint só ensinou `objectives/objectiveLayer.ts` (o único outro mutador real de `session.currentRegion`, achado da auditoria de compatibilidade) a manter `session.currentMapId` sincronizado quando ela dispara.
- **`getFinalBossTemplateId()`/`isDungeonExpedition()`** (`dungeon/dungeonDefinitions.ts`) — Dungeon continua sem nenhuma lógica própria de região/monstro.

## 6. O que esta Sprint deliberadamente NÃO faz

Map Mods, Corruption, Rare Maps, Unique Maps, Boss exclusivo por Mapa, Atlas, Waystones, Map Device, Runewords, Raids, Temporadas, World Events. Nenhum seletor de Mapa real existe na UI — `apps/web` continua explorando um único Mapa padrão (`bosque-sussurrante`), agora conceitualmente através de `currentMapId` em vez de `currentRegion` direto, mas sem nenhuma escolha real do jogador (Atlas explicitamente fora de escopo). Balanceamento de drop rate, `MapEconomicProfile` real, e qualquer Mapa com `enemyPool` genuinamente mais estreito que sua Região ficam para uma Sprint futura de Endgame.

---

*Referências: `docs/design/endgame-map-system-phase1.md` (Sprint 30, Map/Enemy Pool/Economic Profile como catálogo inerte), `docs/design/loot-integration-phase1.md` (Sprint 29, o precedente arquitetural desta integração — mesmo padrão de "gate real + fallback de segurança"), `packages/shared/src/worldencounter/generator.ts` (ponto único do gate real desta Sprint), `packages/shared/src/adventure/session.ts` (`currentMapId`), `packages/shared/src/objectives/objectiveLayer.ts` (sincronização com a Progressão Automática de Região).*
