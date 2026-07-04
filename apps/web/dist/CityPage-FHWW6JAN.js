import {
  ExpeditionPanel,
  useCharacter,
  useIdentity
} from "./chunk-XDIRFIK5.js";
import {
  useAuth
} from "./chunk-NCYLE5LN.js";
import {
  StatsRow
} from "./chunk-J6VXZSCO.js";
import {
  CityMap,
  NPCS,
  NpcIntro
} from "./chunk-FX75WDYV.js";
import {
  HallOfFame,
  RegionGallery
} from "./chunk-S7FO72FP.js";
import {
  EquipmentSlots
} from "./chunk-C2CTPQOC.js";
import "./chunk-3JY4BVUW.js";
import {
  CLOCK_TICK_MS
} from "./chunk-LCT2CGOO.js";
import "./chunk-SLCML2Z6.js";
import {
  GuideBubble,
  getStoredChannel,
  setStoredChannel
} from "./chunk-JPLGP4HS.js";
import {
  AppNav
} from "./chunk-Q2LVEGGV.js";
import "./chunk-MEHX3SVK.js";
import "./chunk-ATYDFFRC.js";
import "./chunk-W3P4YRUG.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/CityPage.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/components/city/CityHubBar.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function findLastBossDefeated(worldState) {
  if (!worldState) return null;
  return [...worldState.timeline].reverse().find((e) => e.text.includes("Boss foi derrotado")) ?? null;
}
function CityHubBar({ worldState, clock, channelDisplayName }) {
  const lastBossDefeated = findLastBossDefeated(worldState);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "city-hub-bar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "city-hub-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-hub-crest", "aria-hidden": "true", children: "\u{1F6E1}\uFE0F" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: channelDisplayName ?? "Reino do StreamRPG" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      StatsRow,
      {
        items: [
          { label: "Rel\xF3gio da Capital", value: clock },
          { label: "Popula\xE7\xE3o online", value: worldState?.panel.players_online ?? 0 },
          { label: "Expedi\xE7\xF5es ativas", value: worldState?.kingdom.expeditions_active ?? 0 },
          {
            label: "\xDAltimo Boss derrotado",
            value: lastBossDefeated ? new Date(lastBossDefeated.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Nenhum ainda"
          }
        ]
      }
    )
  ] });
}

// apps/web/src/components/city/CitySquareDecor.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var DECOR_ITEMS = [
  { icon: "\u{1F6A9}", label: "Bandeiras do Reino" },
  { icon: "\u{1F6E1}\uFE0F", label: "Bras\xE3o do Reino" },
  { icon: "\u{1F333}", label: "\xC1rvores" },
  { icon: "\u{1FA91}", label: "Banco da pra\xE7a" },
  { icon: "\u26F2", label: "Fonte" }
];
var CitySquareDecor = (0, import_react.memo)(function CitySquareDecor2() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "city-square-decor", children: DECOR_ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "city-decor-item", title: item.label, children: item.icon }, item.label)) });
});

// apps/web/src/components/city/MerchantBuilding.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function MerchantBuilding() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: "\u{1F6D2} Mercador" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(NpcIntro, { npc: NPCS.mercador }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "city-building-banner", children: "Loja fechada" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "hint", children: "Novas mercadorias chegam em breve." })
  ] });
}

// apps/web/src/components/city/BlacksmithBuilding.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
function BlacksmithBuilding({ equipped }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { children: "\u{1F6E0}\uFE0F Ferreiro" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(NpcIntro, { npc: NPCS.ferreiro }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "hint", children: "Seus equipamentos atuais, prontos para a pr\xF3xima forja." }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(EquipmentSlots, { equipped }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "city-building-banner", children: "Forja dispon\xEDvel em breve." })
  ] });
}

// apps/web/src/components/city/AlchemistBuilding.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var ALCHEMY_ITEMS = [
  { icon: "\u{1F9EA}", label: "Po\xE7\xF5es" },
  { icon: "\u{1F9C9}", label: "Frascos" },
  { icon: "\u{1F33F}", label: "Ingredientes" },
  { icon: "\u{1F344}", label: "Ingredientes" },
  { icon: "\u2697\uFE0F", label: "Frascos" },
  { icon: "\u{1F9EB}", label: "Po\xE7\xF5es" }
];
function AlchemistBuilding() {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { children: "\u2697\uFE0F Alquimista" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(NpcIntro, { npc: NPCS.alquimista }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "alchemist-shelf", children: ALCHEMY_ITEMS.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "alchemist-shelf-item", title: item.label, children: item.icon }, i)) }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "city-building-banner", children: "Ainda estou preparando minhas misturas." })
  ] });
}

// apps/web/src/components/city/GuildBuilding.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var FOUNDER_TITLE_SLUGS = /* @__PURE__ */ new Set(["primeiro-aventureiro", "founder-alpha", "primeiro-reino"]);
function GuildBuilding({ kingdom, identity }) {
  const founderTitles = identity?.titles.filter((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)) ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { children: "\u{1F3DB}\uFE0F Guilda" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(NpcIntro, { npc: NPCS.guildmaster }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: "O Hall da Fama do Reino \u2014 quem carrega os cargos mais importantes hoje." }),
    kingdom ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(HallOfFame, { slots: kingdom.hall_of_fame }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: "Informe um Reino na Pra\xE7a Central para ver o Hall da Fama." }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "identity-subtitle", children: "Fundadores" }),
    founderTitles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("ul", { className: "city-founder-list", children: founderTitles.map((title) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("li", { children: [
      "\u{1F451} ",
      title.name
    ] }, title.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: "Nenhum t\xEDtulo de fundador conquistado ainda." })
  ] });
}

// apps/web/src/components/city/BankBuilding.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
function BankBuilding({ character }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { children: "\u{1F3E6} Banco" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(NpcIntro, { npc: NPCS.tesoureiro }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "hint", children: "Seu ouro estar\xE1 seguro comigo \u2014 sem dep\xF3sito, sem saque, s\xF3 consulta." }),
    character ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      StatsRow,
      {
        items: [
          { label: "Gold atual", value: character.gold.toFixed(1), highlight: true },
          { label: "N\xEDvel", value: character.level },
          { label: "XP total", value: character.xp },
          { label: "Minutos assistidos", value: character.total_minutes }
        ]
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "loading-state", children: "Carregando conta..." })
  ] });
}

// apps/web/src/components/city/ArenaBuilding.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function ArenaBuilding({ identity, kingdom }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { children: "\u{1F3DF}\uFE0F Arena" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(NpcIntro, { npc: NPCS.mestreArena }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: "Os feitos de combate contra os Bosses \u2014 somente leitura." }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      StatsRow,
      {
        items: [
          { label: "Suas vit\xF3rias", value: identity?.bosses_defeated ?? 0, highlight: true },
          {
            label: "Bosses derrotados pelo Reino",
            value: kingdom ? kingdom.prestige.breakdown.bosses_defeated : "\u2014"
          },
          { label: "Maior dano", value: "Em breve" }
        ]
      }
    )
  ] });
}

// apps/web/src/components/city/NorthGateBuilding.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function NorthGateBuilding({ enabled }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h2", { children: "\u{1F6AA} Port\xE3o Norte" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(NpcIntro, { npc: NPCS.guarda }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "hint", children: "A sa\xEDda da Capital para o mundo \u2014 regi\xF5es desbloqueadas e sua expedi\xE7\xE3o atual." }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ExpeditionPanel, { enabled }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h3", { className: "identity-subtitle", children: "Regi\xF5es desbloqueadas" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RegionGallery, {})
  ] });
}

// apps/web/src/pages/CityPage.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = (0, import_react2.useState)(getStoredChannel());
  const [worldState, setWorldState] = (0, import_react2.useState)(null);
  const [selected, setSelected] = (0, import_react2.useState)(null);
  const [clock, setClock] = (0, import_react2.useState)(() => formatClock(Date.now()));
  (0, import_react2.useEffect)(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get(`/api/world/state${query}`).then(setWorldState).catch(() => void 0);
  }, [channel]);
  (0, import_react2.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const kingdom = worldState?.channel_kingdom ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(GuideBubble, { flag: "city_seen", message: "Este \xE9 o centro do Reino." }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "card city-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h1", { children: "Capital" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: "A cidade onde toda a jornada do Reino acontece." }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("label", { children: [
        "Reino atual",
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "input",
          {
            value: channel,
            onChange: (e) => {
              setChannel(e.target.value);
              setStoredChannel(e.target.value);
            },
            placeholder: "login do streamer (define o Reino da Guilda/Arena/Port\xE3o Norte)"
          }
        )
      ] })
    ] }),
    selected ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "card city-building", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { type: "button", className: "city-back-btn", onClick: () => setSelected(null), children: "\u2190 Voltar \xE0 Pra\xE7a Central" }),
      selected === "arena" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ArenaBuilding, { identity, kingdom }) : null,
      selected === "ferreiro" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(BlacksmithBuilding, { equipped: character?.equipped ?? [] }) : null,
      selected === "mercador" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(MerchantBuilding, {}) : null,
      selected === "alquimista" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(AlchemistBuilding, {}) : null,
      selected === "guilda" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(GuildBuilding, { kingdom, identity }) : null,
      selected === "banco" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(BankBuilding, { character }) : null,
      selected === "portao-norte" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(NorthGateBuilding, { enabled: !!profile }) : null
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { children: "Pra\xE7a Central" }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        CityHubBar,
        {
          worldState,
          clock,
          channelDisplayName: kingdom?.channel_display_name ?? null
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CitySquareDecor, {}),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: "Escolha um edif\xEDcio para visitar." }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(CityMap, { onSelect: setSelected })
    ] })
  ] });
}
export {
  CityPage
};
