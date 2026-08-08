import type { MapModifierId } from "../mapmods/types.js";

// Sprint 34 — Rare Maps Phase I. Requisito arquitetural do brief: "Rare
// Map -> Map Instance -> Map Modifiers -> Adventure" — a primeira vez
// que um jogador realmente ENCONTRA uma instância de Mapa diferente,
// em vez de só existir a infraestrutura (Sprint 32) ou só o pipeline
// de efeito real (Sprint 33). Filosofia: "Map Mods nunca pertencem ao
// jogador. Nunca pertencem ao personagem. Nunca pertencem ao
// mapa-base. Eles pertencem apenas à INSTÂNCIA daquele mapa." — por
// isso `RareMap`/`RareMapInstance` nunca referenciam `characterId`
// nem mutam `MapDefinition` (worldmap/types.ts, Sprint 30): sempre uma
// composição por CIMA de um `MapDefinition.id` existente, nunca um
// mapa novo inventado do zero.
export type RareMapId = string;

// Fase 4 — a mesma escada de raridade já usada por Item Generator
// (itemgen/types.ts: ItemGenRarityId — common/magic/rare/unique),
// reaproveitada aqui de propósito ("nenhum vocabulário novo pro mesmo
// conceito de raridade"). `"unique"` é aceito pelo TIPO (mesmo padrão
// de "Future Hook" já usado por `AdventureFutureHooks`/`boss-power-up`
// em mapmods/mapModifierRegistry.ts) mas `generateRareMap()` NUNCA a
// produz nesta Sprint — "Mapa Unique: fora de escopo" é literal no
// brief (Fase 4).
export type RareMapRarity = "normal" | "magic" | "rare" | "unique";

// Fase 4 — eixo INDEPENDENTE de `RareMapRarity`: gateia quais entradas
// de `MAP_MODIFIER_REGISTRY` (mapmods/mapModifierRegistry.ts) são
// elegíveis pra rolar neste Rare Map, reaproveitando o campo
// `MapModifier.tier` que já existe desde a Sprint 32 mas nunca teve
// nenhum consumidor real ("todo mod real é Tier 1... Tier 2/3 ficam
// pra Sprint futura que precise deles de verdade" — mapmods/types.ts).
// Como hoje TODO MapModifier real é Tier 1, `RareMapTier` nunca filtra
// nada de verdade ainda nesta Sprint — puro scaffold, mesmo espírito
// de "Fase 4: Infraestrutura. Sem balanceamento definitivo." do brief.
export type RareMapTier = 1 | 2 | 3;

// Fase 2 — RareMap: a "receita" de uma instância de Mapa raro — QUAL
// Mapa-base (`mapId`, sempre um `MapDefinition.id` real de
// worldmap/mapRegistry.ts, nunca inventado), sua raridade/tier, e a
// lista de Map Modifiers que essa instância carrega. Puro dado — sem
// nenhuma referência a jogador, personagem, sessão ou Adventure
// (Fase 3: "Nunca abrir mapas. Nunca iniciar Adventure").
export interface RareMap {
  mapId: string;
  rarity: RareMapRarity;
  tier: RareMapTier;
  mods: MapModifierId[];
}

// Fase 2 — RareMapInstance: um `RareMap` que realmente existe em
// algum lugar (um `instanceId` + a `seed` que o gerou, pra
// determinismo — mesmo princípio de `WorldEncounter`/
// `ItemGenGeneratedItem`: a "receita" pura vira uma instância concreta
// só quando alguém precisa referenciá-la de verdade). Ainda sem
// nenhuma persistência (Fase 2: "Tudo puro. Sem persistência.") —
// `instanceId` existe só pra já ter o formato certo quando uma Sprint
// futura (inventário de Rare Maps, Atlas) precisar guardar uma numa
// tabela/numa lista, sem precisar remodelar o tipo.
export interface RareMapInstance extends RareMap {
  instanceId: string;
  seed: number;
}
