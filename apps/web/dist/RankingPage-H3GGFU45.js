import {
  GuideBubble,
  getStoredChannel
} from "./chunk-ZO6CTZRC.js";
import {
  AppNav
} from "./chunk-WYOAEVA4.js";
import {
  FramedAvatar
} from "./chunk-6OZRZBGD.js";
import {
  getProgress
} from "./chunk-H5WBUEHD.js";
import "./chunk-DYYDBER6.js";
import {
  XpBar
} from "./chunk-2Y76MGBL.js";
import "./chunk-GTLHMQAD.js";
import {
  api
} from "./chunk-I6SULFQR.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/pages/RankingPage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function xpGapToAbove(entries, index) {
  if (index === 0) return null;
  return entries[index - 1].xp - entries[index].xp;
}
var RankingRow = (0, import_react.memo)(function RankingRow2({ entry, gap, isLeader }) {
  const progress = getProgress(entry.xp);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "ranking-entry", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ranking-entry-top", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ranking-position", children: [
        "#",
        entry.position
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FramedAvatar, { avatarUrl: entry.avatar_url, frameTier: entry.frame_tier, baseClassName: "ranking-avatar" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ranking-entry-name", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: entry.display_name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ranking-entry-meta", children: [
          "Nv. ",
          entry.level,
          " \xB7 ",
          entry.xp,
          " XP \xB7 ",
          entry.total_minutes,
          " min"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ranking-title-slot", children: entry.title_name ? `\u{1F451} ${entry.title_name}` : "" })
    ] }),
    entry.role_icons.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ranking-role-icons", children: entry.role_icons.join(" ") }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XpBar, { percent: progress.percent }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ranking-gap", children: isLeader ? "\u{1F3C6} L\xEDder do ranking" : `${gap} XP para alcan\xE7ar #${entry.position - 1}` })
  ] });
});
function RankingPage() {
  const [data, setData] = (0, import_react.useState)(null);
  const [channel, setChannel] = (0, import_react.useState)(getStoredChannel());
  (0, import_react.useEffect)(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get(`/api/ranking${query}`).then(setData);
  }, [channel]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideBubble, { flag: "ranking_seen", message: "Compare seu progresso com outros aventureiros." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Ranking" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
        "Filtrar por canal",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            value: channel,
            onChange: (e) => setChannel(e.target.value),
            placeholder: "login do streamer (vazio = global)"
          }
        )
      ] }),
      !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "loading-state", children: "Carregando ranking..." }) : data.entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "empty-state", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ningu\xE9m no ranking ainda." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Assista uma live com o ping ativo para aparecer aqui." })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", { className: "ranking-list", children: data.entries.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        RankingRow,
        {
          entry,
          gap: xpGapToAbove(data.entries, index),
          isLeader: index === 0
        },
        entry.character_id
      )) }),
      data?.my_position ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "ranking-my-position", children: [
        "Sua posi\xE7\xE3o: #",
        data.my_position
      ] }) : null
    ] })
  ] });
}
export {
  RankingPage
};
//# sourceMappingURL=RankingPage-H3GGFU45.js.map
