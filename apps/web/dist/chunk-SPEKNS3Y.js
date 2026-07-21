import {
  Link
} from "./chunk-ATYDFFRC.js";
import {
  isFlagSet
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/AppNav.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function AppNav() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/character", className: isFlagSet("profile_seen") ? "" : "nav-glow", children: "Personagem" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/inventory", children: "Invent\xE1rio" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/chronicle", children: "\u{1F4D6} Cr\xF4nicas" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/city", className: isFlagSet("city_seen") ? "" : "nav-glow", children: "Cidade" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/ranking", className: isFlagSet("ranking_seen") ? "" : "nav-glow", children: "Ranking" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/world", className: isFlagSet("world_seen") ? "" : "nav-glow", children: "Mundo" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/streamer", children: "Streamer" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, { to: "/app/adventure", className: "nav-glow", children: "\u2694\uFE0F Aventura" })
  ] });
}

export {
  AppNav
};
