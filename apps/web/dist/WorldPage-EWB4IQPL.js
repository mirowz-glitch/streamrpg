import {
  StatsRow
} from "./chunk-F5IH7LAM.js";
import {
  Timeline
} from "./chunk-AOYN62YF.js";
import {
  HallOfFame,
  RegionGallery
} from "./chunk-L3Q6SCL4.js";
import {
  CLOCK_TICK_MS,
  WORLD_POLL_MS,
  isSameData
} from "./chunk-QJIELRY3.js";
import {
  GuideBubble,
  getStoredChannel,
  setStoredChannel
} from "./chunk-ZO6CTZRC.js";
import {
  AppNav
} from "./chunk-WYOAEVA4.js";
import "./chunk-H5WBUEHD.js";
import "./chunk-DYYDBER6.js";
import {
  api
} from "./chunk-I6SULFQR.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/pages/WorldPage.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function WorldPage() {
  const [data, setData] = (0, import_react.useState)(null);
  const [clock, setClock] = (0, import_react.useState)(() => formatClock(Date.now()));
  const [channel, setChannel] = (0, import_react.useState)(getStoredChannel());
  (0, import_react.useEffect)(() => {
    const load = () => {
      const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
      void api.get(`/api/world/state${query}`).then((next) => {
        setData((prev) => isSameData(prev, next) ? prev : next);
      }).catch(() => void 0);
    };
    load();
    const id = window.setInterval(load, WORLD_POLL_MS);
    return () => window.clearInterval(id);
  }, [channel]);
  (0, import_react.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  if (!data) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "loading-state", children: "Carregando o Reino..." }) })
    ] });
  }
  const { panel, kingdom, stats, timeline, idle_flavor, most_visited_regions, encounter_stats, channel_kingdom } = data;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GuideBubble, { flag: "world_seen", message: "As expedi\xE7\xF5es acontecem automaticamente." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
      "Ver o Reino de um canal",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          value: channel,
          onChange: (e) => {
            const value = e.target.value;
            setChannel(value);
            setStoredChannel(value);
          },
          placeholder: "login do streamer (vazio = vis\xE3o global)"
        }
      )
    ] }) }),
    channel_kingdom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card kingdom-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
        "Reino de ",
        channel_kingdom.channel_display_name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "kingdom-prestige", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "kingdom-prestige-label", children: "Prest\xEDgio do Reino" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "kingdom-prestige-score", children: channel_kingdom.prestige.score })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "kingdom-stats-list", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.members_count,
          " membro",
          channel_kingdom.prestige.breakdown.members_count === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.bosses_defeated,
          " Boss",
          channel_kingdom.prestige.breakdown.bosses_defeated === 1 ? "" : "es",
          " derrotado",
          channel_kingdom.prestige.breakdown.bosses_defeated === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.total_xp,
          " XP acumulado por este Reino"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.total_minutes_watched,
          " minutos assistidos"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.regions_discovered,
          " regi\xE3o",
          channel_kingdom.prestige.breakdown.regions_discovered === 1 ? "" : "\xF5es",
          " descoberta",
          channel_kingdom.prestige.breakdown.regions_discovered === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "kingdom-stats-title", children: "Hall da Fama" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HallOfFame, { slots: channel_kingdom.hall_of_fame }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "kingdom-stats-title", children: "\xDAltimas conquistas" }),
      channel_kingdom.recent_achievements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Nenhuma troca de cargo registrada ainda nesta sess\xE3o do servidor." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "kingdom-stats-list", children: channel_kingdom.recent_achievements.map((achievement) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: achievement.text }, achievement.id)) })
    ] }) : channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "hint", children: [
      'Nenhum Reino encontrado para "',
      channel,
      '" ainda \u2014 assista uma live com o ping ativo para cri\xE1-lo.'
    ] }) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Mundo" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        StatsRow,
        {
          items: [
            { label: "Hor\xE1rio do Reino", value: clock },
            { label: "Tick atual", value: panel.current_tick > 0 ? panel.current_tick : "\u2014" },
            { label: "Jogadores online", value: panel.players_online },
            {
              label: "Boss ativo",
              value: panel.bosses_active_now > 0 ? panel.bosses_active_now : "Nenhum",
              highlight: true
            }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "hint", children: [
        "\xDAltimo evento: ",
        panel.last_event ? panel.last_event.text : idle_flavor
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Linha do tempo" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { events: timeline, idleFlavor: idle_flavor })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Estado do Reino" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        StatsRow,
        {
          items: [
            { label: "Jogadores ativos", value: kingdom.players_active },
            {
              label: "Boss",
              value: kingdom.bosses_active_now > 0 ? `${kingdom.bosses_active_now} ativo(s)` : "Nenhum ativo"
            },
            {
              label: "Explora\xE7\xE3o",
              value: `${kingdom.expeditions_active} expedi\xE7\xE3o${kingdom.expeditions_active === 1 ? "" : "\xF5es"} em andamento`
            },
            { label: "Gold em circula\xE7\xE3o", value: kingdom.gold_in_circulation.toFixed(1) }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "kingdom-stats-title", children: "O Reino em n\xFAmeros" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "kingdom-stats-list", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          "O Reino possui ",
          stats.adventurers_total,
          " aventureiro",
          stats.adventurers_total === 1 ? "" : "s",
          "."
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          "O Reino derrotou ",
          stats.bosses_defeated_total,
          " Boss",
          stats.bosses_defeated_total === 1 ? "" : "es",
          "."
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          "O Reino encontrou ",
          stats.items_found_total,
          " ite",
          stats.items_found_total === 1 ? "m" : "ns",
          "."
        ] })
      ] }),
      most_visited_regions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "kingdom-stats-title", children: "Regi\xF5es mais visitadas" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "kingdom-stats-list", children: most_visited_regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          region.region_name,
          " \u2014 ",
          region.visits,
          " expedi\xE7\xE3o",
          region.visits === 1 ? "" : "\xF5es"
        ] }, region.region_id)) })
      ] }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Encontros do Reino" }),
      encounter_stats.recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Nenhum encontro registrado ainda nesta sess\xE3o do servidor." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "encounter-recent-list", children: encounter_stats.recent.slice(0, 8).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "encounter-recent-icon", children: event.encounter.icon }),
        " ",
        event.encounter.text,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "encounter-recent-region", children: [
          " \xB7 ",
          event.region_name
        ] })
      ] }, event.id)) }),
      encounter_stats.most_active_regions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "kingdom-stats-title", children: "Regi\xF5es mais movimentadas" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "kingdom-stats-list", children: encounter_stats.most_active_regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          region.region_name,
          " \u2014 ",
          region.count,
          " encontro",
          region.count === 1 ? "" : "s"
        ] }, region.region_id)) })
      ] }) : null,
      encounter_stats.most_common_categories.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "kingdom-stats-title", children: "Tipos de encontro mais frequentes" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "kingdom-stats-list", children: encounter_stats.most_common_categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
          cat.icon,
          " ",
          cat.category,
          " \u2014 ",
          cat.count
        ] }, cat.category)) })
      ] }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Regi\xF5es do Reino" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegionGallery, {})
    ] })
  ] });
}
export {
  WorldPage
};
//# sourceMappingURL=WorldPage-EWB4IQPL.js.map
