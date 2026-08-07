import type { RareMapRarity, RareMapTier } from "../raremap/types.js";

// Sprint 37 — Waystones Phase I. "O Atlas organiza. O Waystone abre o
// mapa." Filosofia: "O Waystone é um item. Nunca um mapa. Nunca uma
// região. Nunca altera o Atlas. Ele apenas abre um mapa. Depois é
// consumido." A diferença deliberada de `RareMap` (Sprint 34): um
// Waystone nunca carrega Map Modifiers — ele só referencia QUAL dos 9
// Mapas reais abrir, nada mais. É o item "genérico" que o Map Device já
// sabia processar desde a Sprint 36 (quando `AdventureConfiguration.rareMap`
// fica `undefined`, `createAdventureSessionFromConfiguration()` já
// produzia `activeMapModifiers: []` sem nenhuma mudança de código) —
// esta Sprint só dá um NOME e uma origem real a esse caminho.

// `WaystoneTier`/`WaystoneRarity` são aliases diretos de `RareMapTier`/
// `RareMapRarity` (raremap/types.ts, Sprint 34) — mesmo princípio de
// "nunca um vocabulário novo pro mesmo conceito" já usado por
// `CorruptionModifier = MapModifierId` (Sprint 35). Tipos próprios (não
// um reexport) só pra que o domínio Waystone tenha nomes legíveis —
// nunca uma segunda escala de valores.
export type WaystoneTier = RareMapTier;
export type WaystoneRarity = RareMapRarity;

// Fase 2 — Waystone: a "receita" de um item que abre um Mapa real —
// QUAL Mapa-base (`mapId`, sempre um `MapDefinition.id` real de
// worldmap/mapRegistry.ts, nunca inventado) e sua raridade/tier.
// Deliberadamente SEM `mods` — Map Modifiers continuam exclusivos de
// `RareMap`/`CorruptedMap` (Sprints 34/35); um Waystone puro sempre abre
// um Mapa neutro. Puro dado — sem nenhuma referência a jogador,
// personagem, sessão ou Adventure (Decisões Oficiais: "Ele apenas
// fornece AdventureConfiguration").
export interface Waystone {
  mapId: string;
  tier: WaystoneTier;
  rarity: WaystoneRarity;
}

// Fase 2 — WaystoneInstance: um `Waystone` que realmente existe em
// algum lugar (`instanceId` + a `seed` que o gerou, pra determinismo) —
// mesmo padrão Definição/Instância já usado por `RareMap`/`RareMapInstance`.
// Ainda sem nenhuma persistência (Fase 2: "Tudo puro. Sem persistência.").
export interface WaystoneInstance extends Waystone {
  instanceId: string;
  seed: number;
}
