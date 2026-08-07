export * from "./types.js";
export * from "./xp.js";
export * from "./items.js";
export * from "./regions.js";
export * from "./itemgen/index.js";
export * from "./lootgen/index.js";
export * from "./lootidentity/index.js";
export * from "./inventory/index.js";
export * from "./equipment/index.js";
export * from "./characterbuild/index.js";
export * from "./combat/index.js";
export * from "./enemy/index.js";
export * from "./worldencounter/index.js";
export * from "./worldevents/index.js";
export * from "./adventure/index.js";
export * from "./presentation/index.js";
export * from "./hud/index.js";
export * from "./animation/index.js";
export * from "./idle/index.js";
export * from "./simulation/index.js";
export * from "./recovery/index.js";
export * from "./objectives/index.js";
export * from "./expeditions/index.js";
export * from "./factions/index.js";
export * from "./dungeon/index.js";
export * from "./economy/index.js";
export * from "./presence/index.js";
export * from "./world/index.js";
export * from "./offline/index.js";
// Sprint 11 — Persistent Items + Affixes: itemization/ deixa de ser
// "inerte" (Sprint 10 deliberadamente não exportava daqui) — agora é
// consumido de verdade por InventoryItem/EquippedItem (types.ts) e por
// apps/api/src/services/sphere.service.ts.
export * from "./itemization/index.js";
// Sprint 12 — Crafting Phase I: SphereInventory/SphereStack + os
// efeitos reais das Esferas (Fortuna/Purificação/Ascensão/Lapidação).
export * from "./crafting/index.js";
// Sprint 13 — Sphere Economy Phase I: distribuição real (drop) das
// Esferas no mundo — Adventure/Dungeon/Boss/World Boss.
export * from "./spheredrop/index.js";
// Sprint 15 — Sockets + Gem System (Foundation): Socket/SocketConfiguration
// (propriedade estrutural do Item) + Gem (identidade própria, level/xp/
// history) — infraestrutura, nenhum efeito de gameplay ainda.
export * from "./socket/index.js";
// Sprint 16 — Economy Foundation: BaseTransformation/TransformationPool
// (infraestrutura da Esfera da Incerteza) — nenhum conteúdo definitivo,
// só o suporte data-driven + 2-3 exemplos QA.
export * from "./transformation/index.js";
// Sprint 18 — Mythic Foundation: MythicDefinition/MythicRegistry/
// DiscoverableBase/Discovery/Hidden Pools — fundação dos Itens
// Míticos ("nunca droppam, só se revelam através da Esfera da
// Incerteza"). Infraestrutura apenas, mesmo princípio de transformation/.
export * from "./mythic/index.js";
// Sprint 19 — Base Identity: BaseIdentity/BaseRegistry/Implicit Mods/
// Base Tags/Base Potential/Base Tier/Base Lore — "cada Base terá uma
// personalidade própria". Infraestrutura apenas: Implicit Mods nunca
// são aplicados a um item real nesta Sprint.
export * from "./baseIdentity/index.js";
// Sprint 25 — World Loot System Phase I: World Region/Biome Registry/
// Drop Profile/Base+Sphere+Gem Affinity/Material Types — "Mundo ->
// Região -> Biome -> Zona -> Monstro -> Item". Infraestrutura apenas:
// nenhum consumidor real (itemgen/lootgen/lootidentity/spheredrop) lê
// nada deste módulo ainda.
export * from "./worldregion/index.js";
// Sprint 26 — Enemy Factions Phase I: EnemyFaction/Faction Registry/
// Enemy Families/Faction Economy/Faction Affinity — "Mundo -> Região ->
// Biome -> Facção -> Família -> Monstro -> Loot -> Item". Infra apenas:
// generateMonsterLoot()/resolveLootBias() (lootidentity/) continuam
// intocados, nenhum consumidor real lê nada deste módulo ainda.
export * from "./enemyFaction/index.js";
// Sprint 27 — Monster Loot Identity Phase I: MonsterLootSignature/
// Monster Registry (22/22 Enemy Templates)/Economic Profiles/Affinity.
// "Facção -> Família -> Monstro -> Assinatura própria". Infra apenas:
// generateMonsterLoot()/resolveLootBias() (lootidentity/) continuam
// intocados, nenhum consumidor real lê nada deste módulo ainda.
export * from "./monsterLoot/index.js";
// Sprint 28 — Loot Tables Phase I: MonsterLootTable/Registry (22/22)/
// Special Drops/Loot Restrictions. "Monster -> Loot Table -> Generator"
// — o Item Generator/Loot Generator continuam intocados, nenhuma
// função de restrição é chamada por código real ainda.
export * from "./monsterLootTable/index.js";
// Sprint 30 — Endgame Map System Phase I: MapDefinition/Map Registry
// (9/9 regiões jogáveis)/Enemy Pool/Economic Profile/Map Affinity —
// "Mapa -> Região -> Biome -> Monster Pool -> Loot". Infra apenas:
// nenhum consumidor real (adventureLoop.ts/dungeonController.ts) lê
// nada deste módulo ainda — "Nenhum mapa influencia gameplay ainda."
export * from "./worldmap/index.js";
// Sprint 31 — Map Integration Phase I: AdventureSession.currentMapId +
// Map.enemyPool gateando generateEncounter() de verdade — "Adventure ->
// Map -> Region -> Encounter -> Enemy Pool -> Loot" real pela primeira
// vez. Nenhum export de barrel novo (currentMapId vive dentro de
// AdventureSession, já exportado por adventure/index.js).
//
// Sprint 32 — Map Modifiers Phase I: MapModifier/Registry (8 mods
// literais do brief) — "Mapa -> Map Modifiers -> Monstros -> Loot".
// Infra apenas: `AdventureSession.activeMapModifiers` sempre `[]`,
// nenhum consumidor real (combat/encounter/loot/economia) lê nada deste
// módulo ainda.
export * from "./mapmods/index.js";

// Sprint 34 — Rare Maps Phase I. "Rare Map -> Map Instance -> Map
// Modifiers -> Adventure" — a primeira vez que um jogador REALMENTE
// encontra uma instância de Mapa diferente (Map Modifiers deixam de
// ser só QA/teste). `generateRareMap()` só escolhe Mapa/raridade/
// tier/Mods puramente; `createAdventureSession()` (adventure/
// session.ts) ganha um 6º parâmetro opcional `rareMap?:
// RareMapInstance` que popula `activeMapModifiers` a partir de
// `RareMap.mods` — nenhum outro campo da sessão muda.
export * from "./raremap/index.js";

// Sprint 35 — Corrupted Maps Phase I. "Rare Map -> Corruption ->
// Corrupted Rare Map -> Adventure". Corrupção NUNCA é reversível
// (nenhum "descorromper"/reroll existe neste módulo, por design).
// `generateCorruptedMap()` recebe um `RareMapInstance` real (Sprint 34)
// e devolve um `CorruptedMap` — mesmo formato de campos, só com
// `mods`/`tier` possivelmente alterados por um dos 6 resultados
// possíveis. `createAdventureSession()` (adventure/session.ts) aceita
// esse `CorruptedMap` no MESMO parâmetro que já aceitava
// `RareMapInstance` — reutilizando 100% do pipeline de efeito real da
// Sprint 33.
export * from "./mapcorruption/index.js";

// Sprint 36 — Atlas Phase I. "Adventure -> Atlas -> Map Device -> Rare
// Map -> Corrupted Map -> Adventure." O Atlas organiza os 9 Mapas
// reais (worldmap/, Sprint 30) num grafo navegável (AtlasNode/
// AtlasState/AtlasConnection/AtlasProgress); o Map Device
// (MapDeviceInstance) só prepara um `AdventureConfiguration` a partir
// de um Rare Map/Corrupted Map real — nunca inicia Adventure, nunca
// aplica combate. `createAdventureSessionFromConfiguration()`
// (adventure/session.ts) delega 100% para `createAdventureSession()`,
// intocada desde a Sprint 34.
export * from "./atlas/index.js";
