import {
  STATUS_ICON,
  STATUS_LABEL,
  pickExpeditionNarrative
} from "./chunk-YFTN4NLB.js";
import {
  ProgressBar
} from "./chunk-W3P4YRUG.js";
import {
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/ExpeditionCompact.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function ExpeditionCompact({ expedition }) {
  const narrative = pickExpeditionNarrative(expedition.status);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-compact", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "expedition-compact-region", children: [
      "\u{1F4CD} ",
      expedition.region_name
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-compact-status", children: expedition.encounter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      expedition.encounter.icon,
      " ",
      expedition.encounter.text
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      STATUS_ICON[expedition.status],
      " ",
      STATUS_LABEL[expedition.status]
    ] }) }),
    narrative ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "expedition-compact-narrative", children: [
      '"',
      narrative,
      '"'
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent: expedition.progress_percent, variant: "expedition-compact" })
  ] });
}

export {
  ExpeditionCompact
};
