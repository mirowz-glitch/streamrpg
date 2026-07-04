import {
  DEFAULT_POLL_MS,
  isSameData
} from "./chunk-QJIELRY3.js";
import {
  ProgressBar
} from "./chunk-GTLHMQAD.js";
import {
  api
} from "./chunk-I6SULFQR.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/components/ui/BossCard.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/hooks/useBossState.ts
var import_react = __toESM(require_react(), 1);
var eventSeq = 0;
function mkEvent(text) {
  eventSeq += 1;
  return { id: `boss-evt-${eventSeq}`, text };
}
function useBossState(channel, pollMs = DEFAULT_POLL_MS) {
  const [state, setState] = (0, import_react.useState)(null);
  const [events, setEvents] = (0, import_react.useState)([]);
  const prevRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!channel) return;
    let cancelled = false;
    function load() {
      void api.get(`/api/overlay/${encodeURIComponent(channel)}/boss`).then((data) => {
        if (cancelled) return;
        const prev = prevRef.current;
        if (isSameData(prev, data)) return;
        const newEvents = [];
        if ((!prev || !prev.active) && data.active && data.status === "awaiting") {
          newEvents.push(mkEvent("Um Boss apareceu \u2014 aguardando in\xEDcio"));
        }
        if (prev?.status === "awaiting" && data.status === "active") {
          newEvents.push(mkEvent("Boss entrou em combate!"));
        }
        if (prev?.status === "active" && data.status === "active" && prev.current_hp !== null && data.current_hp !== null && data.current_hp < prev.current_hp) {
          newEvents.push(mkEvent(`Boss perdeu ${prev.current_hp - data.current_hp} HP`));
        }
        if (prev?.active && data.active) {
          const prevIds = new Set(prev.participants.map((p) => p.character_id));
          for (const participant of data.participants) {
            if (!prevIds.has(participant.character_id)) {
              newEvents.push(mkEvent(`${participant.display_name} entrou na luta`));
            }
          }
        }
        if (prev?.status === "active" && data.status === "defeated") {
          newEvents.push(mkEvent("Boss derrotado!"));
        }
        if (prev?.status === "active" && data.status === "escaped") {
          newEvents.push(mkEvent("Boss fugiu..."));
        }
        if (prev?.active && !data.active) {
          newEvents.push(mkEvent("Aguardando o pr\xF3ximo Boss"));
        }
        if (newEvents.length > 0) {
          setEvents((old) => [...old, ...newEvents].slice(-6));
        }
        prevRef.current = data;
        setState(data);
      }).catch(() => void 0);
    }
    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [channel, pollMs]);
  return { state, events };
}

// apps/web/src/components/ui/BossCard.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var BossCard = (0, import_react2.memo)(function BossCard2({ channel, compact = false }) {
  const { state, events } = useBossState(channel);
  if (!state?.active) return null;
  const resolved = state.status === "defeated" || state.status === "escaped";
  const percent = state.max_hp && state.current_hp !== null ? Math.round(state.current_hp / state.max_hp * 100) : 0;
  const secondsLeft = state.ends_at !== null ? Math.max(0, state.ends_at - Math.floor(Date.now() / 1e3)) : null;
  if (resolved) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `boss-card boss-card-resolved${compact ? " boss-card-compact" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boss-card-title", children: state.status === "defeated" ? "\u{1F3C6} Boss derrotado!" : "\u{1F4A8} Boss fugiu" }),
      !compact && state.rewards && state.rewards.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "boss-rewards-list", children: state.rewards.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        r.display_name,
        ": +",
        r.xp_granted,
        " XP",
        r.item_name ? ` \xB7 ${r.item_name} (${r.item_rarity})` : ""
      ] }, r.character_id)) }) : null,
      !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossEventLog, { events }) : null
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `boss-card${compact ? " boss-card-compact" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boss-card-title", children: state.status === "awaiting" ? "\u2694\uFE0F BOSS APARECEU" : "\u2694\uFE0F BOSS ATIVO" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-card-name", children: [
      "Boss do Reino \xB7 Tier ",
      state.tier
    ] }),
    state.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent, variant: "boss" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-card-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          state.current_hp,
          "/",
          state.max_hp,
          " HP (",
          percent,
          "%)"
        ] }),
        secondsLeft !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          Math.floor(secondsLeft / 60),
          "m ",
          secondsLeft % 60,
          "s restantes"
        ] }) : null
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "boss-card-hint", children: "Aguardando o streamer invocar (ou o tempo acabar)." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-card-participants", children: [
      "Jogadores lutando: ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: state.participant_count })
    ] }),
    !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossEventLog, { events }) : null
  ] });
});
function BossEventLog({ events }) {
  if (events.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-event-log", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\xDAltimos eventos" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: e.text }, e.id)) })
  ] });
}

export {
  useBossState,
  BossCard
};
//# sourceMappingURL=chunk-TD2DZMWS.js.map
