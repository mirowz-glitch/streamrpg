// World Autonomy Phase II (Vision 2.0, Sprint 9) — WorldPresence é o
// mundo em si (horário/dia/clima/regiões ativas), distinto de
// PlayerPresence (presence/index.ts, "o Jogador está presente?").
//
// Uso básico:
//
//   import { deriveWorldPresence, allRegionIds } from "@streamrpg/shared";
//   const world = deriveWorldPresence({ now: Date.now(), activeRegionIds, allRegionIds: allRegionIds() });
export * from "./types.js";
export * from "./deriveWorldPresence.js";
