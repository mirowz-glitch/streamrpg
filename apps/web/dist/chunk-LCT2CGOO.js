// apps/web/src/lib/compare.ts
function isSameData(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// apps/web/src/lib/pollIntervals.ts
var DEFAULT_POLL_MS = 5e3;
var WORLD_POLL_MS = 1e4;
var CLOCK_TICK_MS = 1e3;

export {
  isSameData,
  DEFAULT_POLL_MS,
  WORLD_POLL_MS,
  CLOCK_TICK_MS
};
