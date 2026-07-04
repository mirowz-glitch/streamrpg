import {
  NpcPortrait
} from "./chunk-C2CTPQOC.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/city/CityMap.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var BUILDINGS = [
  { key: "arena", name: "Arena", icon: "\u{1F3DF}\uFE0F", description: "Onde os feitos contra os Bosses s\xE3o lembrados." },
  { key: "ferreiro", name: "Ferreiro", icon: "\u{1F6E0}\uFE0F", description: "Seu equipamento, sempre \xE0 mostra." },
  { key: "mercador", name: "Mercador", icon: "\u{1F6D2}", description: "O com\xE9rcio do Reino \u2014 em constru\xE7\xE3o." },
  { key: "alquimista", name: "Alquimista", icon: "\u2697\uFE0F", description: "Po\xE7\xF5es e reagentes \u2014 em constru\xE7\xE3o." },
  { key: "guilda", name: "Guilda", icon: "\u{1F3DB}\uFE0F", description: "O Hall da Fama do Reino." },
  { key: "banco", name: "Banco", icon: "\u{1F3E6}", description: "Seu Gold, guardado com seguran\xE7a." },
  { key: "portao-norte", name: "Port\xE3o Norte", icon: "\u{1F6AA}", description: "A sa\xEDda para o mundo \u2014 regi\xF5es e expedi\xE7\xF5es." },
  { key: "biblioteca", name: "Biblioteca", icon: "\u{1F4DA}", description: "Um c\xF3dice para cada hist\xF3ria do Reino." },
  { key: "bestiario", name: "Besti\xE1rio", icon: "\u{1F52C}", description: "Um registro de cada criatura j\xE1 avistada." },
  { key: "museu", name: "Museu do Reino", icon: "\u{1F5BC}\uFE0F", description: "Onde a hist\xF3ria da comunidade fica registrada." }
];
var CityMap = (0, import_react.memo)(function CityMap2({ onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "city-map-grid", children: BUILDINGS.map((building) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: "city-building-card",
      onClick: () => onSelect(building.key),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-building-icon", children: building.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "city-building-name", children: building.name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-building-description", children: building.description })
      ]
    },
    building.key
  )) });
});

// apps/web/src/components/city/NpcIntro.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function NpcIntro({ npc }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "npc-intro", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(NpcPortrait, { npc }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "npc-intro-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "npc-name", children: npc.name }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "npc-profession", children: npc.profession }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-quote", children: [
        '"',
        npc.quote,
        '"'
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "npc-description", children: npc.description })
    ] })
  ] });
}

// apps/web/src/lib/npcs.ts
var NPCS = {
  ferreiro: {
    key: "ferreiro",
    name: "Borin, o Ferreiro",
    profession: "Ferreiro",
    quote: "Uma boa espada dura mais que um guerreiro.",
    description: "Forjou a primeira l\xE2mina da Capital com as pr\xF3prias m\xE3os \u2014 e n\xE3o deixa ningu\xE9m esquecer disso.",
    icon: "\u{1F6E0}\uFE0F",
    color: "#b08d57",
    shape: "square"
  },
  mercador: {
    key: "mercador",
    name: "Talia, a Mercadora",
    profession: "Mercadora",
    quote: "Toda moeda tem uma hist\xF3ria \u2014 a minha loja vai guardar muitas.",
    description: "Viajou por tr\xEAs Reinos antes de decidir que este merecia sua loja.",
    icon: "\u{1F6D2}",
    color: "#34a853",
    shape: "arch"
  },
  alquimista: {
    key: "alquimista",
    name: "Zoltar, o Alquimista",
    profession: "Alquimista",
    quote: "Toda mistura precisa de paci\xEAncia \u2014 e de um pouco de perigo.",
    description: "Ningu\xE9m sabe de onde ele veio. S\xF3 que os frascos nunca param de borbulhar.",
    icon: "\u2697\uFE0F",
    color: "#9146ff",
    shape: "hex"
  },
  guildmaster: {
    key: "guildmaster",
    name: "Mestra Elenya",
    profession: "Guildmaster",
    quote: "O Reino \xE9 feito de quem escolhe ficar.",
    description: "Guarda a mem\xF3ria de cada Campe\xE3o e Fundador que j\xE1 passou por aqui.",
    icon: "\u{1F3DB}\uFE0F",
    color: "#fbbc04",
    shape: "shield"
  },
  tesoureiro: {
    key: "tesoureiro",
    name: "Dorwin, o Tesoureiro",
    profession: "Tesoureiro",
    quote: "Seu ouro estar\xE1 seguro comigo.",
    description: "Conta cada moeda duas vezes \u2014 e nunca erra.",
    icon: "\u{1F3E6}",
    color: "#4285f4",
    shape: "square"
  },
  mestreArena: {
    key: "mestreArena",
    name: "Kade, o Mestre da Arena",
    profession: "Mestre da Arena",
    quote: "Cicatrizes contam mais hist\xF3rias que trof\xE9us.",
    description: "J\xE1 viu incont\xE1veis Bosses ca\xEDrem \u2014 e lembra do nome de quem os derrotou.",
    icon: "\u{1F3DF}\uFE0F",
    color: "#ea4335",
    shape: "hex"
  },
  guarda: {
    key: "guarda",
    name: "Sargento Roth",
    profession: "Guarda do Port\xE3o Norte",
    quote: "Boa sorte na estrada.",
    description: "Fica de olho em quem parte e em quem volta \u2014 poucos escapam do seu aceno.",
    icon: "\u{1F6AA}",
    color: "#9aa0a6",
    shape: "arch"
  },
  bibliotecaria: {
    key: "bibliotecaria",
    name: "Bibliotec\xE1ria Miriam",
    profession: "Bibliotec\xE1ria",
    quote: "Cada livro aqui espera por quem souber l\xEA-lo.",
    description: "Cataloga cada p\xE1gina que chega \xE0 Capital \u2014 mesmo as que ainda ningu\xE9m pode abrir.",
    icon: "\u{1F4DA}",
    color: "#6a3bd6",
    shape: "circle"
  },
  erudito: {
    key: "erudito",
    name: "Erudito Yannick",
    profession: "Bi\xF3logo do Reino",
    quote: "Toda criatura tem um comportamento \u2014 a maioria de n\xF3s s\xF3 nunca ficou tempo suficiente para ver.",
    description: "Passou mais noites observando covis do que dormindo em uma cama de verdade.",
    icon: "\u{1F52C}",
    color: "#34a853",
    shape: "hex"
  },
  curador: {
    key: "curador",
    name: "Curador Alaric",
    profession: "Curador do Museu",
    quote: "Um objeto sem hist\xF3ria \xE9 s\xF3 um objeto. Aqui, cada um tem as duas coisas.",
    description: "Passa os dias catalogando o que o Reino ainda n\xE3o teve coragem de esquecer.",
    icon: "\u{1F5BC}\uFE0F",
    color: "#fbbc04",
    shape: "square"
  }
};

export {
  CityMap,
  NpcIntro,
  NPCS
};
