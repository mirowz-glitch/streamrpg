// Sprint Performance Optimization — intervalos de poll que já existiam
// espalhados como números soltos (5000/10000/1000) em vários hooks e
// páginas. Mesmos valores de sempre, só nomeados uma única vez.
export const DEFAULT_POLL_MS = 5000;
export const WORLD_POLL_MS = 10_000;
export const CLOCK_TICK_MS = 1000;
