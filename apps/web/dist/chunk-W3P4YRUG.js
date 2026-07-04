import {
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/ProgressBar.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function ProgressBar({ percent, variant = "xp", label }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `progress-bar progress-bar-${variant}`, "aria-label": label ?? "progress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "progress-bar-fill", style: { width: `${clamped}%` } }) });
}

export {
  ProgressBar
};
