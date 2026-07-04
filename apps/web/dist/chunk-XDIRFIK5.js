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
  formatRemaining
} from "./chunk-SLCML2Z6.js";
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
    ] }) : null
  ] });
});

// apps/web/src/hooks/useCharacter.ts
var import_react3 = __toESM(require_react(), 1);
function useCharacter(enabled = true) {
  const [character, setCharacter] = (0, import_react3.useState)(null);
  const [loading, setLoading] = (0, import_react3.useState)(enabled);
  const [error, setError] = (0, import_react3.useState)(null);
  const refresh = (0, import_react3.useCallback)(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/character");
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load character");
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  (0, import_react3.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const updateName = (0, import_react3.useCallback)(async (displayName) => {
    const data = await api.patch("/api/character", { display_name: displayName });
    setCharacter(data);
    return data;
  }, []);
  return { character, loading, error, refresh, updateName };
}

// apps/web/src/hooks/useIdentity.ts
var import_react4 = __toESM(require_react(), 1);
function useIdentity(enabled) {
  const [identity, setIdentity] = (0, import_react4.useState)(null);
  const [loading, setLoading] = (0, import_react4.useState)(enabled);
  const refresh = (0, import_react4.useCallback)(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await api.get("/api/identity/me");
      setIdentity(data);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  (0, import_react4.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const equipTitle = (0, import_react4.useCallback)(
    async (titleId) => {
      const data = await api.post("/api/identity/equip-title", { title_id: titleId });
      setIdentity(data);
    },
    []
  );
  const unequipTitle = (0, import_react4.useCallback)(async () => {
    const data = await api.post("/api/identity/unequip-title", {});
    setIdentity(data);
  }, []);
  const equipFrame = (0, import_react4.useCallback)(async (frameId) => {
    const data = await api.post("/api/identity/equip-frame", { frame_id: frameId });
    setIdentity(data);
  }, []);
  const unequipFrame = (0, import_react4.useCallback)(async () => {
    const data = await api.post("/api/identity/unequip-frame", {});
    setIdentity(data);
  }, []);
  return { identity, loading, refresh, equipTitle, unequipTitle, equipFrame, unequipFrame };
}

export {
  ExpeditionPanel,
  useCharacter,
  useIdentity
};
