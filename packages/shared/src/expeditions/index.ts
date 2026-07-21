// Expeditions, Checkpoints & Long Session Progression Phase I — a
// Expedição organiza a sequência de encontros (Adventure Loop, nunca
// alterado) numa estrutura maior (início -> trechos -> checkpoint ->
// trechos -> final), reutilizando integralmente Adventure/Objective
// System/Recovery/Progression/Loot/World Event System já existentes.
//
// Uso básico (mesmo padrão de advanceAdventureWithObjectives, só
// substituindo a chamada):
//
//   import { advanceExpeditionTick } from "@streamrpg/shared";
//   const { tickResult, events, floatingNumbers, recovery, objective } =
//     advanceExpeditionTick(session, timeline, { autoEquip: true, currentTime: Date.now() });
//   // hudState.expedition já reflete a expedição ativa (se houver),
//   // derivado puramente da mesma Timeline (deriveHudState.ts).
export * from "./types.js";
export * from "./expeditionDefinitions.js";
export * from "./expeditionProgress.js";
export * from "./expeditionController.js";
