import {
  DEFAULT_POLL_MS,
  isSameData
} from "./chunk-LCT2CGOO.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_react
} from "./chunk-LURRKJSR.js";

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
  const chooseApproach = (0, import_react.useCallback)((option) => {
    void api.post("/api/expedition/approach", { option }).catch(() => void 0);
  }, []);
  return { expedition, chooseApproach };
}

export {
  useExpedition
};
