// Combat Presentation Layer Phase I — transforma o Adventure Loop
// (intocado) numa experiência apresentável: Adventure Tick -> Combat
// Presentation -> Animation Events -> Floating Numbers -> Health Bars
// -> Loot Presentation -> HUD Update.
//
// Uso básico:
//
//   import {
//     createAdventureTimeline, advanceAdventureWithPresentation,
//     toHealthBarState,
//   } from "@streamrpg/shared";
//
//   const timeline = createAdventureTimeline(session.sessionId);
//   const { tickResult, events, floatingNumbers } =
//     advanceAdventureWithPresentation(session, timeline, { autoEquip: true });
//
//   const characterBar = toHealthBarState(session.character.currentLife, maximumLife);
//
// Como adicionar uma nova animação apenas registrando um novo
// Presentation Event, sem alterar a lógica principal: acrescentar um
// novo membro à union `PresentationEvent` (types.ts) e o `push`
// correspondente em presentationLayer.ts, derivado de algum dado que
// já existe no diff antes/depois (ou no AdventureTickResult) — nunca
// inventando um dado novo. Qualquer camada de UI futura consumiria o
// novo `kind` do mesmo jeito que já consome os outros (um switch/map
// por `event.kind`), sem precisar que Adventure Loop/Combat Engine/
// Enemy System/etc. saibam que essa animação existe.
export * from "./types.js";
export * from "./healthBar.js";
export * from "./floatingNumbers.js";
export * from "./presentationLayer.js";
