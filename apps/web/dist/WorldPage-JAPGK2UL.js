import {
  StatsRow
} from "./chunk-J6VXZSCO.js";
import {
  GuideBubble
} from "./chunk-VZ6MUIXB.js";
import {
  CLOCK_TICK_MS,
  WORLD_POLL_MS,
  isSameData
} from "./chunk-LCT2CGOO.js";
import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import "./chunk-ATYDFFRC.js";
import {
  Timeline
} from "./chunk-IYTETKIK.js";
import {
  HallOfFame,
  RegionGallery
} from "./chunk-646EJ6LR.js";
import {
  getKingdomEchoes
} from "./chunk-RHKKRLPV.js";
import {
  useIdentity
} from "./chunk-WSY5ZGYB.js";
import {
  getStoredChannel,
  setStoredChannel
} from "./chunk-QNP5WKGO.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import "./chunk-S4O55MUY.js";
import {
  remember
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/WorldPage.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/components/ui/KingdomNews.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var KingdomNewsItemRow = (0, import_react.memo)(function KingdomNewsItemRow2({ item }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-time", children: new Date(item.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      item.icon,
      " ",
      item.text
    ] })
  ] });
});
function KingdomNews({ items }) {
  const reversed = (0, import_react.useMemo)(() => [...items].reverse(), [items]);
  if (items.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "timeline-idle", children: "O Reino ainda n\xE3o tem novidades nesta sess\xE3o." });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "timeline-list", children: reversed.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KingdomNewsItemRow, { item }, item.id)) });
}

// apps/web/src/components/ui/WorldEventCard.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function formatRemaining(seconds) {
  if (seconds <= 0) return "menos de 1 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  if (hours > 0) return `~${hours}h${minutes > 0 ? `${minutes}min` : ""}`;
  return `~${minutes} min`;
}
function WorldEventCard({ event }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "card world-event-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { children: "\u{1F30D} Evento Atual" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "world-event-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "world-event-icon", children: event.icon }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "world-event-name", children: event.name })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "world-event-description", children: event.description }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "hint", children: [
      event.duration_label,
      " \xB7 ",
      formatRemaining(event.seconds_remaining),
      " restantes"
    ] }),
    event.npc_comment ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "world-event-npc-comment", children: [
      event.npc_comment.npc_icon,
      " ",
      event.npc_comment.npc_name,
      ': "',
      event.npc_comment.text,
      '"'
    ] }) : null
  ] });
}

// apps/web/src/pages/WorldPage.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function WorldPage() {
  const [data, setData] = (0, import_react2.useState)(null);
  const [clock, setClock] = (0, import_react2.useState)(() => formatClock(Date.now()));
  const [channel, setChannel] = (0, import_react2.useState)(getStoredChannel());
  (0, import_react2.useEffect)(() => {
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
  (0, import_react2.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const { identity } = useIdentity(true);
  const echoes = (0, import_react2.useMemo)(
    () => getKingdomEchoes({ regionsDiscovered: identity?.regions_discovered ?? 0 }),
    [identity]
  );
  (0, import_react2.useEffect)(() => {
    echoes.forEach((echo) => remember(echo.id));
  }, [echoes]);
  if (!data) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("main", { className: "page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AppNav, {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "loading-state", children: "Carregando o Reino..." }) })
    ] });
  }
  const { panel, kingdom, stats, timeline, idle_flavor, most_visited_regions, encounter_stats, channel_kingdom, news, current_event } = data;
  const echoNewsItems = echoes.map((echo) => ({
    id: echo.id,
    icon: echo.icon,
    text: echo.text,
    timestamp: Date.now()
  }));
  const newsWithEchoes = [...news, ...echoNewsItems];
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GuideBubble, { flag: "world_seen", message: "As expedi\xE7\xF5es acontecem automaticamente." }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { children: [
      "Ver o Reino de um canal",
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
    channel_kingdom ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card kingdom-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("h1", { children: [
        "Reino de ",
        channel_kingdom.channel_display_name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "kingdom-prestige", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "kingdom-prestige-label", children: "Prest\xEDgio do Reino" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { className: "kingdom-prestige-score", children: channel_kingdom.prestige.score })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("ul", { className: "kingdom-stats-list", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.members_count,
          " membro",
          channel_kingdom.prestige.breakdown.members_count === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.bosses_defeated,
          " Boss",
          channel_kingdom.prestige.breakdown.bosses_defeated === 1 ? "" : "es",
          " derrotado",
          channel_kingdom.prestige.breakdown.bosses_defeated === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.total_xp,
          " XP acumulado por este Reino"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.total_minutes_watched,
          " minutos assistidos"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          channel_kingdom.prestige.breakdown.regions_discovered,
          " regi\xE3o",
          channel_kingdom.prestige.breakdown.regions_discovered === 1 ? "" : "\xF5es",
          " descoberta",
          channel_kingdom.prestige.breakdown.regions_discovered === 1 ? "" : "s"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "kingdom-stats-title", children: "Hall da Fama" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(HallOfFame, { slots: channel_kingdom.hall_of_fame }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "kingdom-stats-title", children: "\xDAltimas conquistas" }),
      channel_kingdom.recent_achievements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "hint", children: "Nenhuma troca de cargo registrada ainda nesta sess\xE3o do servidor." }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "kingdom-stats-list", children: channel_kingdom.recent_achievements.map((achievement) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("li", { children: achievement.text }, achievement.id)) })
    ] }) : channel ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "card", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "hint", children: [
      'Nenhum Reino encontrado para "',
      channel,
      '" ainda \u2014 assista uma live com o ping ativo para cri\xE1-lo.'
    ] }) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { children: "Mundo" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("p", { className: "hint", children: [
        "\xDAltimo evento: ",
        panel.last_event ? panel.last_event.text : idle_flavor
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(WorldEventCard, { event: current_event }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: "Linha do tempo" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Timeline, { events: timeline, idleFlavor: idle_flavor })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: "\u{1F4F0} Not\xEDcias do Reino" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(KingdomNews, { items: newsWithEchoes })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { children: "Estado do Reino" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "kingdom-stats-title", children: "O Reino em n\xFAmeros" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("ul", { className: "kingdom-stats-list", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          "O Reino possui ",
          stats.adventurers_total,
          " aventureiro",
          stats.adventurers_total === 1 ? "" : "s",
          "."
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          "O Reino derrotou ",
          stats.bosses_defeated_total,
          " Boss",
          stats.bosses_defeated_total === 1 ? "" : "es",
          "."
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          "O Reino encontrou ",
          stats.items_found_total,
          " ite",
          stats.items_found_total === 1 ? "m" : "ns",
          "."
        ] })
      ] }),
      most_visited_regions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "kingdom-stats-title", children: "Regi\xF5es mais visitadas" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "kingdom-stats-list", children: most_visited_regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          region.region_name,
          " \u2014 ",
          region.visits,
          " expedi\xE7\xE3o",
          region.visits === 1 ? "" : "\xF5es"
        ] }, region.region_id)) })
      ] }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { children: "Encontros do Reino" }),
      encounter_stats.recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "hint", children: "Nenhum encontro registrado ainda nesta sess\xE3o do servidor." }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "encounter-recent-list", children: encounter_stats.recent.slice(0, 8).map((event) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "encounter-recent-icon", children: event.encounter.icon }),
        " ",
        event.encounter.text,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "encounter-recent-region", children: [
          " \xB7 ",
          event.region_name
        ] })
      ] }, event.id)) }),
      encounter_stats.most_active_regions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "kingdom-stats-title", children: "Regi\xF5es mais movimentadas" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "kingdom-stats-list", children: encounter_stats.most_active_regions.map((region) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          region.region_name,
          " \u2014 ",
          region.count,
          " encontro",
          region.count === 1 ? "" : "s"
        ] }, region.region_id)) })
      ] }) : null,
      encounter_stats.most_common_categories.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "kingdom-stats-title", children: "Tipos de encontro mais frequentes" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "kingdom-stats-list", children: encounter_stats.most_common_categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { children: [
          cat.icon,
          " ",
          cat.category,
          " \u2014 ",
          cat.count
        ] }, cat.category)) })
      ] }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { children: "Regi\xF5es do Reino" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(GuideBubble, { flag: "world_gallery_seen", message: "Onze regi\xF5es, cada uma com sua pr\xF3pria hist\xF3ria \u2014 seu personagem s\xF3 visitou uma fra\xE7\xE3o delas at\xE9 agora." }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(RegionGallery, {})
    ] })
  ] });
}
export {
  WorldPage
};
