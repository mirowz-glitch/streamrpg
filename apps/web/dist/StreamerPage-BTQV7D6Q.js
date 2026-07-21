import {
  useAuth
} from "./chunk-NCYLE5LN.js";
import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import "./chunk-ATYDFFRC.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/StreamerPage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function StreamerPage() {
  const { profile } = useAuth();
  const [dashboard, setDashboard] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [error, setError] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!profile) return;
    void api.get("/api/streamer/dashboard").then(setDashboard).catch(async () => {
      try {
        await api.post("/api/streamer/connect");
        const data = await api.get("/api/streamer/dashboard");
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao carregar painel");
      }
    }).finally(() => setLoading(false));
  }, [profile]);
  if (!profile) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { className: "page", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card", children: "Fa\xE7a login para acessar o painel do streamer." }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Painel do Streamer" }),
      loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Carregando..." }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "error", children: error }) : dashboard ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          "Canal: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: dashboard.channel.display_name })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          "Viewers ativos (5 min): ",
          dashboard.active_viewers
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          "Total de viewers: ",
          dashboard.total_viewers
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "obs-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "URL para OBS (Browser Source)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: dashboard.overlay_url }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Polling a cada 5 segundos. Fundo transparente recomendado." })
        ] }),
        dashboard.ranking_preview.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Top viewers" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { children: dashboard.ranking_preview.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            "#",
            entry.position,
            " ",
            entry.display_name,
            " \u2014 Nv. ",
            entry.level
          ] }, entry.character_id)) })
        ] }) : null
      ] }) : null
    ] })
  ] });
}
export {
  StreamerPage
};
