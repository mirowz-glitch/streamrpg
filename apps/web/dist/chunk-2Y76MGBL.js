import {
  ProgressBar
} from "./chunk-GTLHMQAD.js";
import {
  __toESM,
  require_jsx_runtime
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/components/ui/XpBar.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function XpBar({ percent, label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginBottom: "0.25rem", fontSize: "0.875rem" }, children: label }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent, variant: "xp", label: label ?? "XP progress" })
  ] });
}

export {
  XpBar
};
//# sourceMappingURL=chunk-2Y76MGBL.js.map
