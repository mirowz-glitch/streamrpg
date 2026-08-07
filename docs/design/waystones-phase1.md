# Waystones — Phase I (Sprint 37)

**Status:** ✅ Primeiro item real de "abrir mapa" — `packages/shared/src/waystone/` cria `Waystone`/`WaystoneInstance` (mapId + tier + rarity, deliberadamente SEM Map Modifiers) e `generateWaystone()`. Map Device (`atlas/mapDevice.ts`, Sprint 36) passa a aceitar `WaystoneInstance` como um terceiro tipo alternativo de Mapa carregável, ao lado de `RareMapInstance`/`CorruptedMap` — "O Atlas organiza. O Waystone abre o mapa." Nenhuma mudança em `AdventureConfiguration` nem em `createAdventureSessionFromConfiguration()` foi necessária.

## 1. Auditoria (Fase 1) — reconfirmação do pipeline (nada mudou desde a Sprint 36)

- **Como Atlas prepara Adventure:** `buildAtlasState(progress)` (`atlas/atlasRegistry.ts`) organiza os 9 Mapas reais em `AtlasNode`s; um Node escolhido fornece `mapId` pronto pra um Map Device.
- **Como RareMap entra:** `generateRareMap(seed, options?)` produz um `RareMapInstance` (mapId + rarity + tier + mods); `loadMapIntoDevice()` o embrulha; `prepareAdventureConfiguration()` extrai `mapId`/o próprio objeto como `rareMap`.
- **Como CorruptedMap entra:** `generateCorruptedMap(rareMap, seed)` produz um `CorruptedMap` (mesmo formato de campos); segue o MESMO caminho de Map Device que RareMap.
- **Onde Adventure nasce:** `createAdventureSessionFromConfiguration()` (`adventure/session.ts`, Sprint 36) delega 100% para `createAdventureSession()` (Sprint 34, intocada) — `AdventureConfiguration.mapId` vira `regionId`, `AdventureConfiguration.rareMap` vira o 6º parâmetro opcional.
- **Onde activeMapModifiers aparecem:** `session.activeMapModifiers = rareMap?.mods ?? []` — o único lugar do Engine que lê `.mods`.

Nenhuma alteração foi feita durante esta Fase, conforme exigido.

## 2. Sistema Waystone

`Waystone`/`WaystoneInstance` (`waystone/types.ts`) espelham estruturalmente `RareMap`/`RareMapInstance` (Sprint 34) — mesmo padrão Definição/Instância, `WaystoneTier`/`WaystoneRarity` são aliases diretos de `RareMapTier`/`RareMapRarity` (nunca um segundo vocabulário de raridade/tier). A diferença deliberada: um Waystone NUNCA carrega `mods` — filosofia "O Waystone é um item. Nunca um mapa. Nunca uma região. Nunca altera o Atlas. Ele apenas abre um mapa" é honrada literalmente: um Waystone puro só sabe QUAL dos 9 Mapas reais abrir, nada mais. Tudo puro, sem persistência.

## 3. Generator

`generateWaystone(seed, options?)` espelha `generateRareMap()` (escolhe um Mapa real de `listMapDefinitions()`, rola rarity/tier com uma tabela de pesos PRÓPRIA — nunca importada de `raremap/generator.ts`, mesmo princípio de "cada Generator define sua própria tabela" já usado por `mapcorruption/generator.ts`) mas nunca rola Mods. Determinístico (mesma seed → mesma `WaystoneInstance`); nunca produz `rarity: "unique"` (mesma decisão de escopo da Sprint 34); nunca inicia Adventure; nunca abre mapas.

## 4. Integração com Map Device

`MapDevice.loadedMap` (`atlas/types.ts`) alarga para `RareMapInstance | CorruptedMap | WaystoneInstance` — os três tipos já compartilhavam `.mapId`, o único campo que o Map Device sempre leu. `prepareAdventureConfiguration()` ganhou um único type guard novo (`hasMapModifiers()`, testa `"mods" in loadedMap`) que distingue um Waystone (sem Mods) de um RareMap/CorruptedMap (com Mods) — quando o Mapa carregado é um Waystone puro, `AdventureConfiguration.rareMap` fica `undefined`, exatamente o mesmo caminho já coberto pela Sprint 36 ("sem rareMap na AdventureConfiguration" → `activeMapModifiers: []`). Nenhuma lógica nova em `AdventureConfiguration` nem em `createAdventureSessionFromConfiguration()` — "Adventure continua igual" foi honrado literalmente.

## 5. Economia

- **Waystones consomem riqueza:** um Waystone real seria um item droppável/comprável que se consome ao ser usado — a mesma dinâmica de "gastar pra jogar" já estabelecida por Esferas (Sprint 12-17) e por Corrupted Maps (Sprint 35, "aceitar perder pra tentar ganhar mais"), agora aplicada ao próprio ato de abrir um Mapa.
- **Waystones criam valor:** como Waystones vêm em raridade/tier (mesma escada de RareMap), um Waystone de tier/rarity mais alto vale mais no mercado — a primeira vez que "acesso a um Mapa específico do Atlas" é, ele mesmo, um objeto de valor tradeável, distinto do Mapa que ele abre.
- **Waystones alimentam o Atlas:** ao consumir um Waystone num Node específico do Atlas, o jogador transforma um item genérico num progresso real de exploração — a MESMA dinâmica de "escolha real de qual dos 9 Mapas explorar" já documentada em `atlas-phase1.md`, Seção 6, agora com um mecanismo concreto pra disparar essa escolha.
- **Waystones alimentam Rare Maps:** um Waystone "normal" (a raridade mais comum, 60% de peso) sempre abre um Mapa sem Mods — mas o mesmo Map Device que processa Waystones também processa RareMap/CorruptedMap sem nenhuma mudança; um jogador que encontra um RareMap real (Sprint 34) continua tendo um caminho de acesso independente e superior ao Waystone genérico, preservando a hierarquia de valor Waystone < Rare Map < Corrupted Map já implícita nas Sprints anteriores.
- **Waystones alimentam Corrupted Maps:** a cadeia completa (`Waystone → Map Device → Adventure` para o caminho comum; `RareMap → Corruption → CorruptedMap → Map Device → Adventure` para o caminho de risco/recompensa) continua coexistindo sem nenhuma sobreposição — Waystones nunca competem com Corrupted Maps, servem propósitos econômicos diferentes (acesso básico vs. aposta de alta variância).

Nenhum número foi alterado nesta Sprint.

## 6. Compatibilidade

`AdventureConfiguration`/`createAdventureSessionFromConfiguration()`/`createAdventureSession()` permanecem intocadas — confirmado por teste dedicado (`waystonesPhase1.test.ts`, "Compatibilidade"): RareMap/CorruptedMap continuam produzindo `activeMapModifiers` reais, `createAdventureSession()` direta com 5/6 argumentos continua idêntica. `waystoneMapDevice.test.ts` confirma que o Map Device processa os três tipos (`RareMapInstance`/`CorruptedMap`/`WaystoneInstance`) sem interferência mútua. Nenhum arquivo de `worldmap/`, `mapmods/`, `raremap/`, `mapcorruption/`, `dungeon/`, `atlas/atlasRegistry.ts` foi alterado — só `atlas/types.ts`/`atlas/mapDevice.ts` (widen de tipo) e `adventure/session.ts` (já intocado desde a Sprint 36, sem novas mudanças).

## 7. O que esta Sprint deliberadamente NÃO faz

Atlas Passive Tree, Unique Maps, Fragments, Pinnacle Bosses, Voidstones, Scarabs, League Mechanics, Influence, Sextants. Nenhuma persistência de Waystone existe — nenhuma tabela nova, nenhuma rota de API. Nenhum mecanismo real de jogo permite que um jogador de fato adquira/use um Waystone dentro do app web — a mesma limitação já documentada em `atlas-phase1.md`/`rare-maps-phase1.md`/`corrupted-maps-phase1.md`. A prova de efeito real desta Sprint vem inteiramente da suíte de testes.

---

*Referências: `docs/design/atlas-phase1.md` (Sprint 36, Atlas/Map Device, a base que esta Sprint estende), `docs/design/rare-maps-phase1.md` (Sprint 34, `RareMap`/`RareMapInstance`, o modelo estrutural que `Waystone`/`WaystoneInstance` espelham), `packages/shared/src/waystone/` (implementação real desta Sprint).*
