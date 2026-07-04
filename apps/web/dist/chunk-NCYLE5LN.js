import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/hooks/useAuth.ts
var import_react = __toESM(require_react(), 1);
function useAuth() {
  const [state, setState] = (0, import_react.useState)({
    profile: null,
    loading: true,
    error: null
  });
  const refresh = (0, import_react.useCallback)(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get("/api/auth/me");
      setState({ profile: data.profile, loading: false, error: null });
    } catch {
      setState({ profile: null, loading: false, error: null });
    }
  }, []);
  (0, import_react.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const logout = (0, import_react.useCallback)(async () => {
    await api.post("/api/auth/logout");
    setState({ profile: null, loading: false, error: null });
  }, []);
  return { ...state, refresh, logout };
}

export {
  useAuth
};
