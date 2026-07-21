import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/hooks/useIdentity.ts
var import_react = __toESM(require_react(), 1);
function useIdentity(enabled) {
  const [identity, setIdentity] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(enabled);
  const refresh = (0, import_react.useCallback)(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await api.get("/api/identity/me");
      setIdentity(data);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  (0, import_react.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const equipTitle = (0, import_react.useCallback)(
    async (titleId) => {
      const data = await api.post("/api/identity/equip-title", { title_id: titleId });
      setIdentity(data);
    },
    []
  );
  const unequipTitle = (0, import_react.useCallback)(async () => {
    const data = await api.post("/api/identity/unequip-title", {});
    setIdentity(data);
  }, []);
  const equipFrame = (0, import_react.useCallback)(async (frameId) => {
    const data = await api.post("/api/identity/equip-frame", { frame_id: frameId });
    setIdentity(data);
  }, []);
  const unequipFrame = (0, import_react.useCallback)(async () => {
    const data = await api.post("/api/identity/unequip-frame", {});
    setIdentity(data);
  }, []);
  return { identity, loading, refresh, equipTitle, unequipTitle, equipFrame, unequipFrame };
}

export {
  useIdentity
};
