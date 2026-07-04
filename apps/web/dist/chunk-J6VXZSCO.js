import {
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/StatsRow.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function StatsRow({ items }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "identity-stats", children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `identity-stat${item.highlight ? " identity-stat-highlight" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.value })
  ] }, index)) });
}

export {
  StatsRow
};
