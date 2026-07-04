import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/Timeline.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var TimelineItem = (0, import_react.memo)(function TimelineItem2({ event }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-time", children: new Date(event.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: event.text })
  ] });
});
function Timeline({ events, idleFlavor }) {
  const reversed = (0, import_react.useMemo)(() => [...events].reverse(), [events]);
  if (events.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "timeline-idle", children: idleFlavor });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "timeline-list", children: reversed.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineItem, { event }, event.id)) });
}

export {
  Timeline
};
