// HUD & Gameplay UI Phase I — transforma Adventure Session +
// Presentation Layer em HUD State: um único objeto pronto pra
// renderização, memoizável, framework-agnostic (nenhuma dependência de
// React aqui — o `useMemo` fica na camada de UI, apps/web).
//
// Uso básico:
//
//   import { deriveHudState } from "@streamrpg/shared";
//   const hudState = deriveHudState(session, timeline);
//
// Como adicionar um novo painel ao HUD sem alterar nenhuma lógica
// existente: se o painel só precisa de dado que já existe em
// `HudState`, é só criar o componente React e consumi-lo. Se precisar
// de algo novo, acrescentar um campo em `HudState` (types.ts) e
// derivá-lo em `deriveHudState()` a partir de dado que já existe em
// `AdventureSession`/`AdventureTimeline` (nunca calculando gameplay
// novo) — nenhum componente já existente muda.
export * from "./types.js";
export * from "./deriveHudState.js";
