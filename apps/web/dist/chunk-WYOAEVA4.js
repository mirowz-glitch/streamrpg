import {
  Link
} from "./chunk-DYYDBER6.js";
import {
  __toESM,
  require_jsx_runtime
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/lib/onboarding.ts
var PREFIX = "streamrpg_onboarding_";
function isFlagSet(flag) {
  return localStorage.getItem(PREFIX + flag) === "1";
}
var ONBOARDING_FLAG_EVENT = "streamrpg:onboarding-flag";
function setFlag(flag) {
  localStorage.setItem(PREFIX + flag, "1");
  window.dispatchEvent(new Event(ONBOARDING_FLAG_EVENT));
}
var FIRST_STEPS_PAGE_FLAGS = ["profile_seen", "city_seen", "ranking_seen", "world_seen"];
var FIRST_STEPS_TOTAL = FIRST_STEPS_PAGE_FLAGS.length + 1;
function countFirstStepsDone(totalMinutesWatched) {
  const pageDone = FIRST_STEPS_PAGE_FLAGS.filter(isFlagSet).length;
  return pageDone + (totalMinutesWatched > 0 ? 1 : 0);
}
var ELDRIN_STEP_KEY = `${PREFIX}eldrin_step`;
function getEldrinStep() {
  return Number(localStorage.getItem(ELDRIN_STEP_KEY) ?? 0);
}
function advanceEldrinStep() {
  localStorage.setItem(ELDRIN_STEP_KEY, String(getEldrinStep() + 1));
}

// apps/web/src/components/ui/AppNav.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function AppNav() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/character", className: isFlagSet("profile_seen") ? "" : "nav-glow", children: "Personagem" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/inventory", children: "Invent\xE1rio" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/city", className: isFlagSet("city_seen") ? "" : "nav-glow", children: "Cidade" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/ranking", className: isFlagSet("ranking_seen") ? "" : "nav-glow", children: "Ranking" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/world", className: isFlagSet("world_seen") ? "" : "nav-glow", children: "Mundo" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/streamer", children: "Streamer" })
  ] });
}

export {
  isFlagSet,
  ONBOARDING_FLAG_EVENT,
  setFlag,
  FIRST_STEPS_TOTAL,
  countFirstStepsDone,
  getEldrinStep,
  advanceEldrinStep,
  AppNav
};
//# sourceMappingURL=chunk-WYOAEVA4.js.map
