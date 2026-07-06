import {
  BossCard
} from "./chunk-RU5FUJGJ.js";
import {
  DEFAULT_POLL_MS,
  isSameData
} from "./chunk-LCT2CGOO.js";
import {
  useParams
} from "./chunk-ATYDFFRC.js";
import {
  ExpeditionCompact
} from "./chunk-GAAXDWSI.js";
import {
  XpBar
} from "./chunk-JO2JM4LA.js";
import "./chunk-YFTN4NLB.js";
import "./chunk-W3P4YRUG.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/OverlayPage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var joinLeaveSeq = 0;
function diffViewers(prev, current) {
  if (!prev) return [];
  const events = [];
  const prevIds = new Set(prev.viewers.map((v) => v.id));
  const currentIds = new Set(current.viewers.map((v) => v.id));
  for (const viewer of current.viewers) {
    if (!prevIds.has(viewer.id)) {
      joinLeaveSeq += 1;
      events.push({ id: `join-${joinLeaveSeq}`, text: `${viewer.display_name} entrou` });
    }
  }
  for (const viewer of prev.viewers) {
    if (!currentIds.has(viewer.id)) {
      joinLeaveSeq += 1;
      events.push({ id: `leave-${joinLeaveSeq}`, text: `${viewer.display_name} saiu` });
    }
  }
  return events;
}
function OverlayPage() {
  const { channel = "" } = useParams();
  const [data, setData] = (0, import_react.useState)(null);
  const [log, setLog] = (0, import_react.useState)([]);
  const prevRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!channel) return;
    const load = () => {
      void api.get(`/api/overlay/${encodeURIComponent(channel)}/viewers`).then((next) => {
        if (isSameData(prevRef.current, next)) return;
        const events = diffViewers(prevRef.current, next);
        if (events.length > 0) {
          setLog((old) => [...old, ...events].slice(-3));
        }
        prevRef.current = next;
        setData(next);
      }).catch(() => void 0);
    };
    load();
    const id = window.setInterval(load, DEFAULT_POLL_MS);
    return () => window.clearInterval(id);
  }, [channel]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page overlay-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "overlay-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
        "StreamRPG \xB7 ",
        channel
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "overlay-count", children: [
        data?.total ?? 0,
        " viewers ativos"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossCard, { channel, compact: true }),
    data && data.hall_of_fame_highlights.some((slot) => slot.holder) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "overlay-hall-of-fame", children: data.hall_of_fame_highlights.filter((slot) => slot.holder).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
      slot.icon,
      " ",
      slot.holder.display_name
    ] }, slot.role)) }) : null,
    log.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "overlay-log", children: log.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: e.text }, e.id)) }) : null,
    !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "overlay-empty", children: "Aguardando viewers..." }) : data.viewers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "overlay-empty", children: "Nenhum viewer ativo nos \xFAltimos 5 minutos." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "overlay-list", children: data.viewers.map((viewer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "overlay-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "overlay-card-top", children: [
        viewer.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: viewer.avatar_url, alt: "", className: "overlay-avatar" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "overlay-avatar placeholder" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: viewer.display_name }),
          viewer.title_name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "overlay-title", children: [
            "\u{1F451} ",
            viewer.title_name
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "overlay-meta", children: [
            "Nv. ",
            viewer.level,
            " \xB7 ",
            viewer.xp,
            " XP",
            viewer.equipped_weapon ? ` \xB7 ${viewer.equipped_weapon}` : ""
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XpBar, { percent: viewer.percent }),
      viewer.expedition ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpeditionCompact, { expedition: viewer.expedition }) : null
    ] }, viewer.id)) })
  ] });
}
export {
  OverlayPage
};
