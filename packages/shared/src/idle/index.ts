// Idle Loop Implementation Phase I — camada de temporização pura entre
// a UI e o gatilho de avanço (Engine, `advanceDungeonTick`, intocada).
//
// Uso básico:
//
//   import { IdleDriver } from "@streamrpg/shared";
//   const driver = new IdleDriver({ intervalMs: 2500 });
//   driver.start(Date.now());
//   if (driver.shouldTick(Date.now(), animationsStillActive)) advance();
export * from "./idleDriver.js";
