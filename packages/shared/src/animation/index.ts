// Combat Feel & Animation System Phase I — Presentation Events ->
// Combat Animation Queue -> Animation Controller -> React Components
// -> Screen. Camada puramente visual: consome só PresentationEvent/
// FloatingNumberEvent (Presentation Layer, intocada), nunca calcula
// gameplay.
//
// Uso básico:
//
//   import { AnimationController, buildAnimationsForTick } from "@streamrpg/shared";
//   const controller = new AnimationController();
//   const animations = buildAnimationsForTick(events, floatingNumbers, Date.now());
//   controller.enqueue(animations);
//   const { started, finished } = controller.tick(Date.now());
//
// Como adicionar uma nova animação só com um novo preset e um novo
// handler, sem alterar o Animation Controller: (1) acrescentar um novo
// membro à union `AnimationType` (types.ts) + um registro em
// `ANIMATION_PRESETS` (presets.ts); (2) mapear o evento/floating number
// de origem pra esse tipo em `handlers.ts` (um novo `case` no switch ou
// uma nova entrada de tabela). `AnimationController` (controller.ts)
// nunca precisa mudar — ele só lida com `timestamp`/`duration`/
// `priority`/`id`, nunca com `type`/`payload`.
export * from "./types.js";
export * from "./presets.js";
export * from "./handlers.js";
export * from "./controller.js";
