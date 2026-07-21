// Adventure Loop Phase I — conecta todos os sistemas já existentes:
// Character (Character Build + Inventory + Equipment) -> Adventure
// Session -> Encounter (World Encounter System) -> Combat (Combat
// Engine) -> Loot (Loot Identity/Loot Generator) -> Inventory ->
// Equipment (Auto Equip opcional) -> Character Progress -> Próximo
// Encounter.
//
// Uso básico:
//
//   import {
//     createAdventureCharacter, createAdventureSession,
//     advanceAdventure, getSessionResult,
//   } from "@streamrpg/shared";
//
//   const character = createAdventureCharacter(characterBuild, inventory, equipment);
//   const session = createAdventureSession("session-1", character, "bosque-sussurrante", 1234567);
//
//   const tick = advanceAdventure(session, { autoEquip: true });
//   const result = getSessionResult(session);
//
// Como adicionar uma mecânica nova (Quests, Eventos, etc.) usando só
// os Future Hooks, sem alterar a lógica principal: popular
// `session.futureHooks` (ex.: `session.futureHooks.activeQuestIds =
// [...]`) a partir de UM sistema novo e separado (ex.: um futuro
// QuestSystem), que leria `AdventureTickResult`/`AdventureSession`
// depois de cada `advanceAdventure()` pra decidir se progrediu uma
// quest — sem precisar que `adventureLoop.ts` conheça o conceito de
// "quest". `AdventureFutureHooks` (types.ts) já reserva o campo certo
// pra cada mecânica listada no requisito 6.
export * from "./types.js";
export * from "./session.js";
export * from "./autoEquip.js";
export * from "./adventureLoop.js";
export * from "./starterKit.js";
