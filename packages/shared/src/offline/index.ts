// World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 4 — Offline
// Summary. "Seu personagem continuou existindo enquanto você esteve
// fora": projeta uma ausência real usando o mesmo Adventure Loop da
// Aventura ao vivo, nunca uma fórmula estatística paralela.
//
// Uso básico:
//
//   import { computeOfflineCatchUp } from "@streamrpg/shared";
//   const summary = computeOfflineCatchUp({ characterLevel, characterXp, regionId, elapsedMs, seed });
export * from "./types.js";
export * from "./computeOfflineCatchUp.js";
