import {
  StatsRow
} from "./chunk-J6VXZSCO.js";
import {
  DEFAULT_POLL_MS,
  isSameData
} from "./chunk-LCT2CGOO.js";
import {
  STATUS_ICON,
  STATUS_LABEL,
  formatRemaining,
  pickExpeditionNarrative
} from "./chunk-YFTN4NLB.js";
import {
  ProgressBar
} from "./chunk-W3P4YRUG.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/ExpeditionPanel.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/hooks/useExpedition.ts
var import_react = __toESM(require_react(), 1);
function useExpedition(enabled, pollMs = DEFAULT_POLL_MS) {
  const [expedition, setExpedition] = (0, import_react.useState)(null);
  const prevRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!enabled) return;
    let cancelled = false;
    function load() {
      void api.get("/api/expedition/current").then((data) => {
        if (cancelled) return;
        if (isSameData(prevRef.current, data.expedition)) return;
        prevRef.current = data.expedition;
        setExpedition(data.expedition);
      }).catch(() => void 0);
    }
    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled, pollMs]);
  return { expedition };
}

// apps/web/src/components/ui/ExpeditionPanel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var ExpeditionPanel = (0, import_react2.memo)(function ExpeditionPanel2({ enabled }) {
  const { expedition } = useExpedition(enabled);
  if (!expedition) return null;
  const arrived = expedition.status === "combating" || expedition.status === "resting" || expedition.status === "returning";
  const narrative = pickExpeditionNarrative(expedition.status);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "expedition-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Aventura Atual" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-trail", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: !arrived ? "expedition-trail-active" : "expedition-trail-visited", children: expedition.origin_region_name }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-trail-arrow", children: "\u2192" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: arrived ? "expedition-trail-active" : "", children: expedition.destination_region_name })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      StatsRow,
      {
        items: [
          { label: "Regi\xE3o atual", value: expedition.current_region_name },
          { label: "Destino", value: expedition.destination_region_name },
          {
            label: "Estado",
            value: `${STATUS_ICON[expedition.status]} ${STATUS_LABEL[expedition.status]}`,
            highlight: true
          },
          { label: "Tempo estimado", value: formatRemaining(expedition.estimated_seconds_remaining) }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent: expedition.progress_percent, variant: "expedition" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-progress-percent", children: [
      expedition.progress_percent,
      "% da expedi\xE7\xE3o conclu\xEDdo"
    ] }),
    expedition.encounter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "expedition-current-event", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-encounter-icon", children: expedition.encounter.icon }),
      " ",
      expedition.encounter.text
    ] }) : null,
    narrative ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "expedition-narrative", children: [
      '"',
      narrative,
      '"'
    ] }) : null
  ] });
});

export {
  ExpeditionPanel
};
