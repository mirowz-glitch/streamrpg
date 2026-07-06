import {
  ExpeditionPanel
} from "./chunk-S2PTMFOV.js";
import {
  StatsRow
} from "./chunk-J6VXZSCO.js";
import {
  GuideBubble
} from "./chunk-B5ZQO4U6.js";
import {
  useAuth
} from "./chunk-NCYLE5LN.js";
import {
  AppNav
} from "./chunk-SFYVYXWE.js";
import {
  CityMap,
  NPCS,
  NpcIntro
} from "./chunk-JFSKKVE3.js";
import {
  HallOfFame,
  REGIONS,
  RegionGallery
} from "./chunk-S7FO72FP.js";
import {
  EquipmentSlots,
  useCharacter,
  useIdentity
} from "./chunk-I4LKOFEV.js";
import {
  getStoredChannel,
  setStoredChannel
} from "./chunk-6RGLD4R5.js";
import "./chunk-3JY4BVUW.js";
import {
  allRegionIds,
  getRegionName
} from "./chunk-AGN4IQHH.js";
import {
  isFlagSet
} from "./chunk-QE563634.js";
import {
  CLOCK_TICK_MS
} from "./chunk-LCT2CGOO.js";
import "./chunk-ATYDFFRC.js";
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

// apps/web/src/pages/CityPage.tsx
var import_react18 = __toESM(require_react(), 1);

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

// apps/web/src/components/city/HiddenObjects.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/lib/hiddenObjects.ts
var HIDDEN_OBJECTS = [
  {
    key: "balde",
    icon: "\u{1FAA3}",
    name: "Balde",
    description: "Encostado perto do po\xE7o, meio esquecido.",
    texts: [
      "O balde est\xE1 cheio de \xE1gua da chuva.",
      "Ainda tem \xE1gua.",
      "Voc\xEA podia lavar algo. Mas n\xE3o vai.",
      "O balde observa voc\xEA em sil\xEAncio."
    ]
  },
  {
    key: "fonte",
    icon: "\u26F2",
    name: "Fonte",
    description: "A fonte central da pra\xE7a, sempre correndo.",
    texts: [
      "A \xE1gua parece limpa.",
      "Voc\xEA lava as m\xE3os.",
      "Agora elas est\xE3o limpas.\n\nAs Luvas Rasgadas continuam n\xE3o."
    ]
  },
  {
    key: "arvore",
    icon: "\u{1F333}",
    name: "\xC1rvore",
    description: "Mais velha que qualquer constru\xE7\xE3o ao redor.",
    texts: [
      "A \xE1rvore balan\xE7a com o vento.",
      "Uma folha cai.",
      "Voc\xEA n\xE3o fez nada para causar isso.",
      "A \xE1rvore continua sendo mais paciente que voc\xEA."
    ]
  },
  {
    key: "banco",
    icon: "\u{1FA91}",
    name: "Banco",
    description: "Um banco de madeira na sombra da \xE1rvore.",
    texts: [
      "O banco da pra\xE7a est\xE1 vazio.",
      "Voc\xEA senta por um momento.",
      "Ningu\xE9m nota. Ningu\xE9m precisa notar.",
      "Voc\xEA se levanta. A pra\xE7a segue igual."
    ]
  },
  {
    key: "fogueira",
    icon: "\u{1F525}",
    name: "Fogueira",
    description: "Uma fogueira pequena, sempre acesa.",
    texts: [
      "O fogo crepita baixinho.",
      "Est\xE1 quente perto dali.",
      "Algu\xE9m deveria trazer mais lenha.",
      "Voc\xEA n\xE3o \xE9 essa pessoa hoje."
    ]
  },
  {
    key: "caixote",
    icon: "\u{1F4E6}",
    name: "Caixote",
    description: "Um caixote de madeira encostado num canto.",
    texts: ["O caixote est\xE1 pregado no ch\xE3o.", "Voc\xEA tenta abrir mesmo assim.", "N\xE3o abre.", "Talvez nunca tenha sido para abrir."]
  },
  {
    key: "barril",
    icon: "\u{1F6E2}",
    name: "Barril",
    description: "Um barril velho, de origem incerta.",
    texts: ["O barril est\xE1 vazio.", "Continua vazio.", "Voc\xEA realmente esperava outro resultado?"]
  },
  {
    key: "estatua",
    icon: "\u{1F56F}",
    name: "Est\xE1tua",
    description: "Uma est\xE1tua de pedra escura, sem nenhuma fei\xE7\xE3o.",
    texts: ["A est\xE1tua n\xE3o tem rosto.", "Ningu\xE9m sabe por qu\xEA.", "Voc\xEA tamb\xE9m n\xE3o vai descobrir hoje."]
  },
  {
    key: "janela",
    icon: "\u{1FA9F}",
    name: "Janela",
    description: "Uma janela baixa, de uma casa qualquer.",
    texts: ["A janela est\xE1 fechada.", "Voc\xEA espia por ela mesmo assim.", "N\xE3o tem nada demais l\xE1 dentro.", "Ou talvez tenha, e voc\xEA n\xE3o percebeu."]
  },
  {
    key: "placa",
    icon: "\u{1FAA7}",
    name: "Placa",
    description: "Uma placa de madeira cravada na terra.",
    texts: ["A placa est\xE1 desbotada.", "Voc\xEA tenta ler mesmo assim.", "Diz algo sobre n\xE3o pisar na grama.", "Voc\xEA est\xE1 pisando na grama."]
  },
  {
    key: "pedra",
    icon: "\u{1FAA8}",
    name: "Pedra",
    description: "Uma pedra qualquer no meio do caminho.",
    texts: ["\xC9 s\xF3 uma pedra.", "Voc\xEA chuta a pedra.", "Ainda \xE9 s\xF3 uma pedra, agora um pouco mais longe."]
  },
  {
    key: "ninho",
    icon: "\u{1F426}",
    name: "Ninho",
    description: "Um ninho num galho baixo.",
    texts: ["H\xE1 um ninho vazio no galho.", "Os p\xE1ssaros devem estar por perto.", "Ou j\xE1 foram embora h\xE1 muito tempo."]
  },
  {
    key: "porta-velha",
    icon: "\u{1F6AA}",
    name: "Porta velha",
    description: "Uma porta isolada, sem parede ao redor.",
    texts: ["A porta est\xE1 trancada.", "Voc\xEA empurra mesmo assim.", "Continua trancada.", "Algu\xE9m, um dia, vai ter que explicar essa porta."]
  },
  {
    key: "bigorna",
    icon: "\u2692",
    name: "Bigorna",
    description: "A bigorna do Borin, fria por enquanto.",
    texts: ["A bigorna est\xE1 fria.", "Voc\xEA bate nela uma vez.", "Nada acontece, exceto o barulho.", "O barulho j\xE1 valeu a pena."]
  },
  {
    key: "pilha-livros",
    icon: "\u{1F4DA}",
    name: "Pilha de livros",
    description: "Livros empilhados num canto, esquecidos.",
    texts: ["Uma pilha de livros esquecida num canto.", "Voc\xEA folheia um deles.", "Est\xE1 em uma l\xEDngua que voc\xEA n\xE3o reconhece.", "Ou s\xF3 est\xE1 de cabe\xE7a para baixo."]
  },
  {
    key: "vassoura",
    icon: "\u{1F9F9}",
    name: "Vassoura",
    description: "Uma vassoura encostada na parede.",
    texts: ["Uma vassoura encostada na parede.", "Voc\xEA pega a vassoura.", "Varre um pouco de poeira.", "A poeira volta amanh\xE3, como sempre."]
  },
  {
    key: "espelho",
    icon: "\u{1FA9E}",
    name: "Espelho",
    description: "Um espelho rachado, apoiado num canto.",
    texts: ["Um espelho rachado num canto.", "Voc\xEA se olha nele.", "Parece voc\xEA, s\xF3 que um pouco mais cansado.", "O espelho n\xE3o mente. Isso \xE9 o pior."]
  },
  {
    key: "cesta-pao",
    icon: "\u{1F956}",
    name: "Cesta de p\xE3o",
    description: "P\xE3o fresco esfriando na janela da padaria.",
    texts: [
      "Uma cesta de p\xE3o fresco na janela.",
      "O cheiro \xE9 bom.",
      "Voc\xEA n\xE3o vai roubar p\xE3o. Provavelmente.",
      "As ma\xE7\xE3s da pra\xE7a continuam desaparecendo, mas n\xE3o foi voc\xEA dessa vez."
    ]
  },
  {
    key: "gato",
    icon: "\u{1F408}",
    name: "Gato",
    description: "Um gato sentado onde bem entende.",
    texts: ["O gato ignora voc\xEA.", "O gato continua ignorando voc\xEA.", "Voc\xEA perdeu a discuss\xE3o."]
  },
  {
    key: "cachorro",
    icon: "\u{1F415}",
    name: "Cachorro",
    description: "Um cachorro que conhece todo mundo na Capital.",
    texts: ["O cachorro balan\xE7a o rabo.", "Voc\xEA faz carinho.", "Ele parece satisfeito. Finalmente algu\xE9m entende as prioridades certas.", "Voc\xEAs dois concordam: isso foi \xF3timo."]
  },
  {
    key: "sino",
    icon: "\u{1F514}",
    name: "Sino",
    description: "Um sino pequeno pendurado numa porta.",
    texts: ["Um sino pequeno pendurado numa porta.", "Voc\xEA toca o sino.", "Ningu\xE9m aparece.", "Voc\xEA toca de novo, s\xF3 para garantir."]
  },
  {
    key: "teia",
    icon: "\u{1F578}",
    name: "Teia de aranha",
    description: "Uma teia entre dois postes de madeira.",
    texts: ["Uma teia de aranha entre dois postes.", "A aranha n\xE3o est\xE1 em casa.", "Ou est\xE1 bem quieta, observando."]
  },
  {
    key: "cesto-roupa",
    icon: "\u{1F9FA}",
    name: "Cesto de roupa",
    description: "Roupas secando ao sol, penduradas num varal.",
    texts: ["Roupas secando ao sol.", "Uma delas nem parece ser de ningu\xE9m que voc\xEA conhece.", "Voc\xEA finge que n\xE3o viu."]
  },
  {
    key: "lenha",
    icon: "\u{1FAB5}",
    name: "Pilha de lenha",
    description: "Lenha cortada e empilhada com cuidado.",
    texts: ["Uma pilha de lenha bem organizada.", "Algu\xE9m teve trabalho com isso.", "Voc\xEA n\xE3o vai desorganizar. Hoje n\xE3o."]
  },
  {
    key: "armadilha",
    icon: "\u{1FAA4}",
    name: "Armadilha",
    description: "Uma armadilha simples, escondida num canto.",
    texts: ["Uma armadilha simples, provavelmente para ratos.", "Est\xE1 vazia.", "Voc\xEA se afasta, por precau\xE7\xE3o.", "Boa decis\xE3o."]
  }
];

// apps/web/src/components/city/HiddenObjects.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var HiddenObject = (0, import_react2.memo)(function HiddenObject2({ object }) {
  const [clicks, setClicks] = (0, import_react2.useState)(0);
  const revealed = clicks > 0;
  const textIndex = Math.min(clicks - 1, object.texts.length - 1);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "button",
    {
      type: "button",
      className: `hidden-object${revealed ? " hidden-object-revealed" : ""}`,
      onClick: () => setClicks((c) => c + 1),
      title: object.description,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hidden-object-icon", children: object.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hidden-object-name", children: object.name }),
        revealed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hidden-object-text", children: object.texts[textIndex] }) : null
      ]
    }
  );
});
function HiddenObjects() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "hidden-objects-grid", children: HIDDEN_OBJECTS.map((object) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(HiddenObject, { object }, object.key)) });
}

// apps/web/src/components/city/MerchantBuilding.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
function MerchantBuilding() {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { children: "\u{1F6D2} Mercador" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(NpcIntro, { npc: NPCS.mercador }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "city-building-banner", children: "Loja fechada" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "hint", children: "Novas mercadorias chegam em breve." })
  ] });
}

// apps/web/src/components/city/BlacksmithBuilding.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function BlacksmithBuilding({ equipped }) {
  const hasSeenFirstItem = isFlagSet("first_item_announced");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { children: "\u{1F6E0}\uFE0F Ferreiro" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(NpcIntro, { npc: NPCS.ferreiro }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "hint", children: "Seus equipamentos atuais, prontos para a pr\xF3xima forja." }),
    hasSeenFirstItem ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "hint", children: '"...acho que essas luvas serviram para alguma coisa."' }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(EquipmentSlots, { equipped }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "city-building-banner", children: "Forja dispon\xEDvel em breve." })
  ] });
}

// apps/web/src/components/city/AlchemistBuilding.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var ALCHEMY_ITEMS = [
  { icon: "\u{1F9EA}", label: "Po\xE7\xF5es" },
  { icon: "\u{1F9C9}", label: "Frascos" },
  { icon: "\u{1F33F}", label: "Ingredientes" },
  { icon: "\u{1F344}", label: "Ingredientes" },
  { icon: "\u2697\uFE0F", label: "Frascos" },
  { icon: "\u{1F9EB}", label: "Po\xE7\xF5es" }
];
function AlchemistBuilding() {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { children: "\u2697\uFE0F Alquimista" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(NpcIntro, { npc: NPCS.alquimista }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "alchemist-shelf", children: ALCHEMY_ITEMS.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "alchemist-shelf-item", title: item.label, children: item.icon }, i)) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "city-building-banner", children: "Ainda estou preparando minhas misturas." })
  ] });
}

// apps/web/src/components/city/GuildBuilding.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var FOUNDER_TITLE_SLUGS = /* @__PURE__ */ new Set(["primeiro-aventureiro", "founder-alpha", "primeiro-reino"]);
function GuildBuilding({ kingdom, identity }) {
  const founderTitles = identity?.titles.filter((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)) ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { children: "\u{1F3DB}\uFE0F Guilda" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(NpcIntro, { npc: NPCS.guildmaster }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "hint", children: "O Hall da Fama do Reino \u2014 quem carrega os cargos mais importantes hoje." }),
    kingdom ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(HallOfFame, { slots: kingdom.hall_of_fame }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "hint", children: "Informe um Reino na Pra\xE7a Central para ver o Hall da Fama." }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "identity-subtitle", children: "Fundadores" }),
    founderTitles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { className: "city-founder-list", children: founderTitles.map((title) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("li", { children: [
      "\u{1F451} ",
      title.name
    ] }, title.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "hint", children: "Nenhum t\xEDtulo de fundador conquistado ainda." })
  ] });
}

// apps/web/src/components/city/BankBuilding.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function BankBuilding({ character }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { children: "\u{1F3E6} Banco" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(NpcIntro, { npc: NPCS.tesoureiro }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: "Seu ouro estar\xE1 seguro comigo \u2014 sem dep\xF3sito, sem saque, s\xF3 consulta." }),
    character ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      StatsRow,
      {
        items: [
          { label: "Gold atual", value: character.gold.toFixed(1), highlight: true },
          { label: "N\xEDvel", value: character.level },
          { label: "XP total", value: character.xp },
          { label: "Minutos assistidos", value: character.total_minutes }
        ]
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "loading-state", children: "Carregando conta..." })
  ] });
}

// apps/web/src/components/city/ArenaBuilding.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function ArenaBuilding({ identity, kingdom }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h2", { children: "\u{1F3DF}\uFE0F Arena" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(NpcIntro, { npc: NPCS.mestreArena }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "hint", children: "Os feitos de combate contra os Bosses \u2014 somente leitura." }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function NorthGateBuilding({ enabled }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { children: "\u{1F6AA} Port\xE3o Norte" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(NpcIntro, { npc: NPCS.guarda }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: "A sa\xEDda da Capital para o mundo \u2014 regi\xF5es desbloqueadas e sua expedi\xE7\xE3o atual." }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ExpeditionPanel, { enabled }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h3", { className: "identity-subtitle", children: "Regi\xF5es desbloqueadas" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(RegionGallery, {})
  ] });
}

// apps/web/src/components/city/LibraryBuilding.tsx
var import_react9 = __toESM(require_react(), 1);

// apps/web/src/lib/library.ts
var BOOK_CATEGORIES = [
  { slug: "historia", label: "Hist\xF3ria", icon: "\u{1F4DC}" },
  { slug: "lendas", label: "Lendas", icon: "\u{1F409}" },
  { slug: "regioes", label: "Regi\xF5es", icon: "\u{1F5FA}\uFE0F" },
  { slug: "criaturas", label: "Criaturas", icon: "\u{1F43E}" },
  { slug: "personagens", label: "Personagens", icon: "\u{1F9D1}" },
  { slug: "religioes", label: "Religi\xF5es", icon: "\u26E9\uFE0F" },
  { slug: "cartas", label: "Cartas", icon: "\u2709\uFE0F" },
  { slug: "diarios", label: "Di\xE1rios", icon: "\u{1F4D3}" },
  { slug: "reinos", label: "Reinos", icon: "\u{1F3F0}" },
  { slug: "misterios", label: "Mist\xE9rios", icon: "\u{1F52E}" }
];
var PLACEHOLDER_PAGES = [
  "**Este livro ainda est\xE1 sendo escrito.**\n\nEm breve, a hist\xF3ria completa estar\xE1 dispon\xEDvel para todos os aventureiros do Reino.",
  "*Livro em desenvolvimento...*\n\nVolte para a Biblioteca em outra ocasi\xE3o.",
  "**Fim da amostra.**\n\nAs pr\xF3ximas p\xE1ginas ainda n\xE3o foram reveladas."
];
var BOOKS = [
  {
    id: "cronicas-do-primeiro-amanhecer",
    title: "Cr\xF4nicas do Primeiro Amanhecer",
    author: "Autor desconhecido",
    category: "historia",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "lido"
  },
  {
    id: "lendas-do-bosque-sussurrante",
    title: "Lendas do Bosque Sussurrante",
    author: "Autor desconhecido",
    category: "lendas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  },
  {
    id: "bestiario-das-terras-selvagens",
    title: "Besti\xE1rio das Terras Selvagens",
    author: "Autor desconhecido",
    category: "criaturas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  },
  {
    id: "cartas-perdidas-de-um-aventureiro",
    title: "Cartas Perdidas de um Aventureiro",
    author: "Autor desconhecido",
    category: "cartas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado"
  },
  {
    id: "misterios-da-fortaleza-sombria",
    title: "Mist\xE9rios da Fortaleza Sombria",
    author: "Autor desconhecido",
    category: "misterios",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado"
  },
  // Sprint Wolves Ecosystem (Phase I) — primeiro livro do catálogo com
  // páginas reais (não PLACEHOLDER_PAGES), escrito por Yannick como
  // registro de campo sobre os Lobos do Bosque Sussurrante.
  {
    id: "tratado-da-matilha",
    title: "Tratado da Matilha",
    author: "Yannick, o Erudito",
    category: "criaturas",
    description: "Um registro de campo sobre os Lobos do Bosque Sussurrante \u2014 e o que os torna diferentes de qualquer outra besta do Reino.",
    pages: [
      "**Tratado da Matilha**\n\nDedico este registro a todo ca\xE7ador que j\xE1 confundiu um lobo comum com um Lobo Alfa \u2014 e viveu para admitir o erro.\n\nOs Lobos Cinzentos do Bosque Sussurrante n\xE3o s\xE3o uma criatura s\xF3. S\xE3o uma estrutura inteira, com hierarquia, territ\xF3rio e mem\xF3ria pr\xF3pria. Passei anos catalogando rastros antes de entender isso.",
      "**I. O Alfa**\n\nO Lobo Alfa lidera n\xE3o pela for\xE7a bruta, mas pela aus\xEAncia dela \u2014 raramente precisa lutar, porque raramente algu\xE9m o desafia duas vezes. Seu uivo, dizem os ca\xE7adores, \xE9 mais grave e mais longo que o de qualquer outro membro da matilha, e \xE9 ouvido, na maioria das ca\xE7adas, uma \xFAnica vez.\n\nBorin j\xE1 comentou comigo que o couro de um Alfa \xE9 quase imposs\xEDvel de conseguir sem rasgos \u2014 o animal n\xE3o se entrega f\xE1cil, nem depois de morto.",
      "**II. A Loba Prateada**\n\nAo lado do Alfa, uma segunda figura: uma loba de pelagem clara que ca\xE7a sozinha, longe da matilha, sempre retornando antes do amanhecer. N\xE3o \xE9 subordinada \u2014 \xE9, pelo que observei, uma parceira que escolheu operar de forma independente. Sua pelagem, mesmo curtida, mant\xE9m um brilho estranho sob luar.",
      "**III. Os Filhotes**\n\nUm filhote separado da matilha \xE9 um dos poucos lobos que se aproxima de humanos sem hostilidade. Um mercador me contou que um o seguiu por dois dias inteiros, sem nunca se aproximar o suficiente para ser tocado. Greta jura guardar uma presa de lobo h\xE1 anos \u2014 provavelmente de um filhote, pelo tamanho que ela descreve.",
      "**IV. As Variantes Regionais**\n\nNem todo lobo do Reino \xE9 do Bosque. Nas Colinas \xC1ridas, a escassez de presas for\xE7a os lobos a ca\xE7ar sozinhos \u2014 a terra ali n\xE3o sustenta uma matilha inteira. No P\xE2ntano Podre, encontrei relatos de um lobo que atravessa \xE1gua parada como se fosse ch\xE3o firme. E nos Picos Congelados, ca\xE7adores juram que existe um lobo cujas presas parecem refletir a luz da lua, como gelo puro.",
      "**V. A Matilha Faminta**\n\nQuando a ca\xE7a escasseia, a matilha muda de comportamento \u2014 cerca em sil\xEAncio absoluto, sem o uivo de aviso que normalmente precede um ataque. \xC9 o encontro mais perigoso de todos, precisamente porque n\xE3o avisa.\n\nIdris jura j\xE1 ter visto o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia. N\xE3o tenho como confirmar. Mas tamb\xE9m n\xE3o tenho como negar.",
      "**Nota final**\n\nH\xE1 uma noite, h\xE1 anos, em que nenhum lobo uivou no Bosque Sussurrante inteiro. Ningu\xE9m soube dizer por qu\xEA. Continuo catalogando rastros, na esperan\xE7a de que, um dia, essa p\xE1gina tamb\xE9m tenha uma resposta."
    ],
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "lido"
  }
];

// apps/web/src/components/library/BookShelf.tsx
var import_react5 = __toESM(require_react(), 1);

// apps/web/src/lib/knowledge.ts
function searchKnowledge(entries, query) {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return entries;
  return entries.filter((entry) => entry.searchText.toLowerCase().includes(normalized));
}
function filterKnowledge(entries, filters) {
  return entries.filter((entry) => filters.every((f) => f.value === null || f.select(entry) === f.value));
}

// apps/web/src/components/codex/CodexEmptyState.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function CodexEmptyState({ message }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: message });
}

// apps/web/src/components/codex/CodexSidebar.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function CodexSidebar({ toolbar, isEmpty, emptyMessage, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "book-shelf", children: [
    toolbar,
    isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CodexEmptyState, { message: emptyMessage }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "book-shelf-list", children })
  ] });
}

// apps/web/src/components/codex/CodexSearch.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function CodexSearch({ value, onChange, placeholder }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    "input",
    {
      type: "search",
      className: "book-search-input",
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder
    }
  );
}

// apps/web/src/components/codex/CodexToolbar.tsx
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
function CodexToolbar({ searchValue, onSearchChange, searchPlaceholder, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(CodexSearch, { value: searchValue, onChange: onSearchChange, placeholder: searchPlaceholder }),
    children
  ] });
}

// apps/web/src/components/codex/CodexFilter.tsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var CodexFilter = (0, import_react3.memo)(function CodexFilter2({ allLabel, options, selected, onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "button",
      {
        type: "button",
        className: `book-category-chip${selected === null ? " book-category-chip-active" : ""}`,
        onClick: () => onSelect(null),
        children: allLabel
      }
    ),
    options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      "button",
      {
        type: "button",
        className: `book-category-chip${selected === option.value ? " book-category-chip-active" : ""}`,
        onClick: () => onSelect(option.value),
        children: option.label
      },
      option.value
    ))
  ] });
});

// apps/web/src/components/codex/CodexCategoryList.tsx
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function CodexCategoryList({
  categories,
  selected,
  onSelect,
  allLabel = "Todas"
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "book-category-filter", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
    CodexFilter,
    {
      allLabel,
      selected,
      onSelect: (value) => onSelect(value),
      options: categories.map((category) => ({
        value: category.slug,
        label: category.icon ? `${category.icon} ${category.label}` : category.label
      }))
    }
  ) });
}

// apps/web/src/components/codex/CodexCard.tsx
var import_react4 = __toESM(require_react(), 1);

// apps/web/src/components/codex/CodexStatusBadge.tsx
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
function CodexStatusBadge({ label, className = "book-card-status" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className, children: label });
}

// apps/web/src/components/codex/CodexCard.tsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
var VARIANT_CLASSES = {
  book: {
    root: "book-card",
    selected: "book-card-selected",
    locked: "book-card-locked",
    icon: "book-card-icon",
    info: "book-card-info",
    title: "book-card-title",
    meta: "book-card-author",
    status: "book-card-status"
  },
  creature: {
    root: "creature-card",
    selected: "creature-card-selected",
    locked: "creature-card-locked",
    icon: "creature-card-icon",
    info: "creature-card-info",
    title: "creature-card-name",
    meta: "creature-card-meta",
    status: "creature-card-status"
  }
};
var CodexCard = (0, import_react4.memo)(function CodexCard2({
  variant = "book",
  icon,
  title,
  meta,
  statusLabel,
  locked,
  selected,
  onSelect
}) {
  const cls = VARIANT_CLASSES[variant];
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
    "button",
    {
      type: "button",
      className: `${cls.root}${selected ? ` ${cls.selected}` : ""}${locked ? ` ${cls.locked}` : ""}`,
      onClick: onSelect,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: cls.icon, children: icon }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { className: cls.info, children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("strong", { className: cls.title, children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: cls.meta, children: meta }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(CodexStatusBadge, { label: statusLabel, className: cls.status })
        ] })
      ]
    }
  );
});

// apps/web/src/components/library/BookShelf.tsx
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL = {
  bloqueado: "\u{1F512} Bloqueado",
  conhecido: "\u{1F4D8} Conhecido",
  lido: "\u2705 Lido"
};
var KNOWLEDGE_STATUS = {
  bloqueado: "LOCKED" /* Locked */,
  conhecido: "DISCOVERED" /* Discovered */,
  lido: "READ" /* Read */
};
function BookShelf({ books, selectedBookId, onSelectBook }) {
  const [query, setQuery] = (0, import_react5.useState)("");
  const [category, setCategory] = (0, import_react5.useState)(null);
  const filtered = (0, import_react5.useMemo)(() => {
    const entries = books.map((book) => ({
      id: book.id,
      source: "biblioteca",
      title: book.title,
      category: book.category,
      status: KNOWLEDGE_STATUS[book.status],
      searchText: book.title
    }));
    const matched = filterKnowledge(searchKnowledge(entries, query), [{ select: (e) => e.category, value: category }]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return books.filter((book) => matchedIds.has(book.id));
  }, [books, query, category]);
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CodexCategoryList, { categories: BOOK_CATEGORIES, selected: category, onSelect: setCategory }) }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhum livro encontrado.",
      children: filtered.map((book) => {
        const bookCategory = BOOK_CATEGORIES.find((c) => c.slug === book.category);
        return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          CodexCard,
          {
            icon: bookCategory?.icon ?? "\u{1F4D6}",
            title: book.title,
            meta: book.author,
            statusLabel: STATUS_LABEL[book.status],
            locked: book.locked,
            selected: book.id === selectedBookId,
            onSelect: () => onSelectBook(book.id)
          },
          book.id
        );
      })
    }
  );
}

// apps/web/src/components/codex/CodexReader.tsx
var import_react8 = __toESM(require_react(), 1);

// apps/web/src/components/library/BookPage.tsx
var import_react7 = __toESM(require_react(), 1);

// apps/web/src/lib/markdownLite.ts
var import_react6 = __toESM(require_react(), 1);
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((part) => part !== "");
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (0, import_react6.createElement)("strong", { key }, part.slice(2, -2));
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (0, import_react6.createElement)("em", { key }, part.slice(1, -1));
    }
    return (0, import_react6.createElement)(import_react6.Fragment, { key }, part);
  });
}
function renderMarkdownLite(content) {
  const paragraphs = content.split(/\n\s*\n/);
  return paragraphs.map(
    (paragraph, index) => (0, import_react6.createElement)("p", { key: index, className: "book-page-paragraph" }, renderInline(paragraph, `p${index}`))
  );
}

// apps/web/src/components/library/BookPage.tsx
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
var BookPage = (0, import_react7.memo)(function BookPage2({ content, pageNumber, totalPages }) {
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "book-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "book-page-content", children: renderMarkdownLite(content) }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "book-page-number", children: [
      "P\xE1gina ",
      pageNumber,
      " de ",
      totalPages
    ] })
  ] });
});

// apps/web/src/components/codex/CodexHeader.tsx
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
function CodexHeader({ icon, title, subtitle }) {
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(import_jsx_runtime21.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("h3", { className: "book-reader-title", children: icon ? `${icon} ${title}` : title }),
    subtitle ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: "book-reader-author", children: subtitle }) : null
  ] });
}

// apps/web/src/components/codex/CodexInfoPanel.tsx
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
function CodexInfoPanel({ message, hint }) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("p", { className: "book-reader-locked-message", children: message }),
    hint ? /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("p", { className: "hint", children: hint }) : null
  ] });
}

// apps/web/src/components/codex/CodexFacts.tsx
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
function CodexFacts({ facts }) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: "creature-reader-facts", children: facts.map((fact) => /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "creature-reader-fact", children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: fact.label }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("strong", { children: fact.value })
  ] }, fact.label)) });
}

// apps/web/src/components/codex/CodexPagination.tsx
var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
function CodexPagination({ pageIndex, totalPages, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "book-reader-nav", children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("button", { type: "button", onClick: () => onChange(Math.max(0, pageIndex - 1)), disabled: pageIndex === 0, children: "\u2190 P\xE1gina anterior" }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(
      "button",
      {
        type: "button",
        onClick: () => onChange(Math.min(totalPages - 1, pageIndex + 1)),
        disabled: pageIndex >= totalPages - 1,
        children: "P\xE1gina seguinte \u2192"
      }
    )
  ] });
}

// apps/web/src/components/codex/CodexReader.tsx
var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
function CodexReader({
  isEmpty,
  emptyMessage,
  locked,
  lockedTitle,
  lockedSubtitle,
  lockedMessage,
  unlockCondition,
  icon,
  title,
  subtitle,
  description,
  facts,
  pages
}) {
  const [pageIndex, setPageIndex] = (0, import_react8.useState)(0);
  if (isEmpty) {
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("div", { className: "book-reader book-reader-empty", children: /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CodexEmptyState, { message: emptyMessage }) });
  }
  if (locked) {
    return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "book-reader book-reader-locked", children: [
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CodexHeader, { title: lockedTitle, subtitle: lockedSubtitle }),
      /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CodexInfoPanel, { message: lockedMessage, hint: `Condi\xE7\xE3o de desbloqueio: ${unlockCondition}` })
    ] });
  }
  const totalPages = pages.length;
  const currentPage = pages[Math.min(pageIndex, totalPages - 1)];
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "book-reader", children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CodexHeader, { icon, title, subtitle }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("p", { className: "book-reader-description", children: description }),
    facts && facts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CodexFacts, { facts }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(BookPage, { content: currentPage, pageNumber: pageIndex + 1, totalPages }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(CodexPagination, { pageIndex, totalPages, onChange: setPageIndex })
  ] });
}

// apps/web/src/components/library/BookReader.tsx
var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
function BookReader({ book }) {
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(
    CodexReader,
    {
      isEmpty: !book,
      emptyMessage: "Escolha um livro na estante ao lado.",
      locked: book?.locked ?? false,
      lockedTitle: book?.title ?? "",
      lockedSubtitle: book?.author,
      lockedMessage: "\u{1F512} Este livro ainda est\xE1 bloqueado.",
      unlockCondition: book?.unlockCondition ?? "",
      title: book?.title ?? "",
      subtitle: book?.author,
      description: book?.description ?? "",
      pages: book?.pages ?? []
    }
  );
}

// apps/web/src/components/codex/CodexLayout.tsx
var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
function CodexLayout({ sidebar, reader }) {
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("div", { className: "library-screen", children: [
    sidebar,
    reader
  ] });
}

// apps/web/src/components/city/LibraryBuilding.tsx
var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
function LibraryBuilding() {
  const [selectedBookId, setSelectedBookId] = (0, import_react9.useState)(null);
  const selectedBook = BOOKS.find((book) => book.id === selectedBookId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("h2", { children: "\u{1F4DA} Biblioteca" }),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(NpcIntro, { npc: NPCS.bibliotecaria }),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("p", { className: "hint", children: "Um c\xF3dice para cada hist\xF3ria do Reino \u2014 algumas ainda por vir." }),
    /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(BookShelf, { books: BOOKS, selectedBookId, onSelectBook: setSelectedBookId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(BookReader, { book: selectedBook }, selectedBook?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_react11 = __toESM(require_react(), 1);

// apps/web/src/lib/bestiary.ts
var CREATURE_TYPES = [
  { slug: "besta", label: "Besta", icon: "\u{1F43A}" },
  { slug: "morto-vivo", label: "Morto-vivo", icon: "\u{1F480}" },
  { slug: "elemental", label: "Elemental", icon: "\u{1F525}" },
  { slug: "humanoide", label: "Humanoide", icon: "\u{1F5E1}\uFE0F" },
  { slug: "dragao", label: "Drag\xE3o", icon: "\u{1F409}" },
  { slug: "espirito", label: "Esp\xEDrito", icon: "\u{1F47B}" },
  { slug: "aberracao", label: "Aberra\xE7\xE3o", icon: "\u{1F441}\uFE0F" },
  { slug: "construto", label: "Constructo", icon: "\u2699\uFE0F" },
  { slug: "mamifero", label: "Mam\xEDfero", icon: "\u{1F98A}" },
  { slug: "inseto", label: "Inseto", icon: "\u{1F41D}" }
];
var DANGER_LABEL = {
  baixa: "Baixa",
  media: "M\xE9dia",
  alta: "Alta",
  letal: "Letal"
};
function getRegionName2(regionId) {
  return REGIONS.find((region) => region.id === regionId)?.name ?? regionId;
}
var PLACEHOLDER_PAGES2 = [
  "**Esta criatura ainda est\xE1 sendo estudada.**\n\nOs eruditos da Capital continuam reunindo relatos de quem a encontrou.",
  "*Registro em desenvolvimento...*\n\nVolte ao Besti\xE1rio em outra ocasi\xE3o.",
  "**Fim do registro conhecido.**\n\nO restante do comportamento desta criatura ainda n\xE3o foi documentado."
];
var CREATURES = [
  {
    id: "lobos-cinzentos",
    name: "Lobos Cinzentos",
    type: "besta",
    habitat: "Florestas densas e sombrias",
    regionId: "bosque-sussurrante",
    dangerLevel: "baixa",
    icon: "\u{1F43A}",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES2,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "estudado",
    connections: {
      itemSlug: "colar-dentes-lobo",
      npcKey: "ferreiro",
      npcNote: "Borin comenta que couro de lobo forte \xE9 raro de achar sem rasgos.",
      travellerStoryId: "lobo-de-olhos-claros",
      bookId: "bestiario-das-terras-selvagens"
    }
  },
  {
    id: "espectros-da-neblina",
    name: "Espectros da Neblina",
    type: "espirito",
    habitat: "P\xE2ntanos e ru\xEDnas alagadas",
    regionId: "pantano-podre",
    dangerLevel: "media",
    icon: "\u{1F47B}",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES2,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "visto",
    connections: {
      npcKey: "alquimista",
      npcNote: "Zoltar acredita que a neblina do p\xE2ntano carrega mais do que s\xF3 \xE1gua.",
      rumor: "Um viajante jura ter visto luzes no P\xE2ntano Podre \xE0 noite.",
      travellerStoryId: "criatura-do-pantano-sem-nome"
    }
  },
  {
    id: "golens-de-pedra-antiga",
    name: "Golens de Pedra Antiga",
    type: "construto",
    habitat: "Galerias e minas abandonadas",
    regionId: "minas-abandonadas",
    dangerLevel: "alta",
    icon: "\u2699\uFE0F",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES2,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "visto",
    connections: {
      itemSlug: "lamina-forjada-minas-abandonadas",
      npcKey: "ferreiro",
      npcNote: "Borin estuda o mecanismo interno sempre que encontra um fragmento."
    }
  },
  {
    id: "serpente-das-areias-de-vidro",
    name: "Serpente das Areias de Vidro",
    type: "aberracao",
    habitat: "Dunas v\xEDtreas e cegantes",
    regionId: "deserto-de-vidro",
    dangerLevel: "alta",
    icon: "\u{1F441}\uFE0F",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES2,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
    connections: {
      itemSlug: "foice-deserto-vidro",
      npcKey: "alquimista",
      npcNote: "Zoltar tem uma teoria inteira sobre o veneno dela, nunca publicada.",
      rumor: "Dizem que o Deserto de Vidro engoliu mais uma bota essa semana.",
      travellerStoryId: "serpente-que-fala-baixo"
    }
  },
  {
    id: "o-sussurro-sem-nome",
    name: "O Sussurro Sem Nome",
    type: "aberracao",
    habitat: "Sal\xF5es esquecidos da fortaleza",
    regionId: "fortaleza-sombria",
    dangerLevel: "letal",
    icon: "\u{1F52E}",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES2,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
    connections: {
      itemSlug: "lanca-fortaleza-sombria",
      npcKey: "alquimista",
      npcNote: "Zoltar se recusa terminantemente a comentar sobre esse.",
      rumor: "Ouviram cantoria vindo da Fortaleza Sombria. Ningu\xE9m foi conferir.",
      bookId: "misterios-da-fortaleza-sombria"
    }
  },
  // ============================================================
  // Sprint Creature Expansion — Phase I — 120 criaturas novas,
  // expandindo o catálogo já existente acima (nenhuma das 5 originais
  // foi tocada). Cada `pages` tem 3 entradas: pequena história,
  // curiosidade, e "drops futuros" (só texto de lore — nenhum drop real
  // implementado, nenhuma tabela, nenhuma regra de Combat/Encounter lê
  // isso). `rarity`/`suggestedLevel` são novos, opcionais, só leitura.
  // ============================================================
  // ---- Mamíferos (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "raposa-do-trigo", name: "Raposa-do-Trigo", type: "mamifero", rarity: "comum", suggestedLevel: 2, habitat: "Campos abertos e bordas de planta\xE7\xE3o", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F98A}", description: "Rouba ovos de galinheiro sempre que pode.", pages: ["Aprendeu a abrir cercas simples observando fazendeiros descuidados.", "Alguns fazendeiros deixam um ovo de prop\xF3sito, s\xF3 pra ela ir embora satisfeita.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pele Alaranjada, Cauda Fofa, Dente Pequeno."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "javali-das-colinas", name: "Javali das Colinas", type: "mamifero", rarity: "comum", suggestedLevel: 3, habitat: "Encostas secas e trilhas estreitas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F417}", description: "Destr\xF3i planta\xE7\xF5es inteiras numa \xFAnica noite.", pages: ["Vive em bandos pequenos e defende o territ\xF3rio com viol\xEAncia surpreendente.", "O Ferreiro Borin jura que um j\xE1 derrubou uma cerca de ferro.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa Curva, Couro Grosso, Casco Rachado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { npcKey: "ferreiro", npcNote: "Borin jura que um javali j\xE1 derrubou uma cerca de ferro inteira." } },
  { id: "esquilo-do-bosque", name: "Esquilo do Bosque", type: "mamifero", rarity: "comum", suggestedLevel: 1, habitat: "Copas altas e troncos ocos", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F43F}\uFE0F", description: "Rouba comida de qualquer mochila aberta.", pages: ["Enterra sementes e esquece a maioria, plantando metade da floresta sem querer.", "Idris jura que um j\xE1 roubou uma moeda de dentro da bota dele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Macia, Cauda Peluda, Semente Roubada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "cabra-das-rochas", name: "Cabra das Rochas", type: "mamifero", rarity: "comum", suggestedLevel: 2, habitat: "Encostas \xEDngremes e plat\xF4s altos", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F410}", description: "Escala paredes que nenhum humano tentaria.", pages: ["Vive em fam\xEDlias pequenas, sempre no ponto mais alto dispon\xEDvel.", "Roth garante que uma j\xE1 observou a Guarda do alto da muralha, por dias.", "Poss\xEDveis drops (lore, n\xE3o implementado): Chifre Curvo, Pelo \xC1spero, Casco Firme."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "doninha-do-celeiro", name: "Doninha do Celeiro", type: "mamifero", rarity: "incomum", suggestedLevel: 4, habitat: "Celeiros e dep\xF3sitos de gr\xE3o", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F43E}", description: "Rouba ovos e foge antes de qualquer rea\xE7\xE3o.", pages: ["Vive perto de celeiros, sempre um passo \xE0 frente de quem tenta peg\xE1-la.", "Um fazendeiro jura que perdeu uma d\xFAzia de ovos pra mesma doninha, num \xFAnico m\xEAs.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Fina, Garra Curta, Cauda Listrada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "texugo-teimoso", name: "Texugo Teimoso", type: "mamifero", rarity: "incomum", suggestedLevel: 5, habitat: "Tocas profundas perto de \xE1gua parada", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F9A1}", description: "N\xE3o recua de ningu\xE9m, nem de coisas maiores que ele.", pages: ["Cava tocas profundas e defende cada cent\xEDmetro delas.", "H\xE1 uma aposta antiga na Taverna sobre quem consegue passar por um sem ser mordido.", "Poss\xEDveis drops (lore, n\xE3o implementado): Garra Curta, Pelagem Escura, Presa Pequena."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { npcKey: "taverneira", npcNote: "Greta \xE9 quem toma conta da aposta antiga sobre o texugo." } },
  { id: "urso-das-minas", name: "Urso das Minas", type: "mamifero", rarity: "incomum", suggestedLevel: 6, habitat: "Galerias abandonadas e entradas escuras", regionId: "minas-abandonadas", dangerLevel: "alta", icon: "\u{1F43B}", description: "Vive perto de galerias abandonadas, longe de qualquer trilha.", pages: ["Adaptou-se ao escuro das minas melhor que qualquer outro animal da regi\xE3o.", "Mineiros deixam comida na entrada s\xF3 pra ele n\xE3o entrar mais fundo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Garra Grossa, Pelagem Densa, Presa Longa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "botas-forjadas-minas-abandonadas", npcKey: "ferreiro", npcNote: "Borin diz que o metal das Minas Abandonadas nunca esquenta de verdade \u2014 nem perto de um urso irritado." } },
  { id: "lince-do-deserto-de-vidro", name: "Lince do Deserto de Vidro", type: "mamifero", rarity: "raro", suggestedLevel: 9, habitat: "Dunas v\xEDtreas ao entardecer", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F406}", description: "Ca\xE7a sozinho e nunca deixa rastro na areia vitrificada.", pages: ["Poucos o veem duas vezes \u2014 a maioria s\xF3 v\xEA o brilho dos olhos \xE0 noite.", "Alguns ca\xE7adores duvidam que ele exista de verdade.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Reluzente, Garra de Vidro, Olho Claro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "botas-cacador-feras", npcKey: "erudito", npcNote: "Yannick duvida que o lince exista de verdade \u2014 mas guarda as marcas de garra como prova." } },
  { id: "alce-dos-picos", name: "Alce dos Picos", type: "mamifero", rarity: "raro", suggestedLevel: 10, habitat: "Vales altos entre a neve", regionId: "picos-congelados", dangerLevel: "media", icon: "\u{1F98C}", description: "Migra em rotas que ningu\xE9m conseguiu mapear por completo.", pages: ["Aparece s\xF3 em certas \xE9pocas do ano, e some por meses.", "Roth garante que um j\xE1 parou o tr\xE1fego inteiro do Port\xE3o Norte por uma tarde.", "Poss\xEDveis drops (lore, n\xE3o implementado): Chifre Congelado, Pelagem Grossa, Casco Duro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "elmo-picos-congelados", npcKey: "guarda", npcNote: "Roth garante que um alce j\xE1 parou o tr\xE1fego inteiro do Port\xE3o Norte por uma tarde." } },
  { id: "morcego-das-ruinas", name: "Morcego das Ru\xEDnas", type: "mamifero", rarity: "raro", suggestedLevel: 11, habitat: "C\xE2maras profundas sem luz", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F987}", description: "Vive nas c\xE2maras mais profundas, longe de qualquer luz.", pages: ["Guia-se por ecos entre paredes que ningu\xE9m mais consegue interpretar.", "Alaric acredita que eles vivem ali h\xE1 mais tempo que as pr\xF3prias Ru\xEDnas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Asa Fina, Presa Curva, Pelagem Escura."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "urso-fantasma-da-fortaleza", name: "Urso-Fantasma da Fortaleza", type: "mamifero", rarity: "muito-raro", suggestedLevel: 15, habitat: "Corredores internos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F43B}\u200D\u2744\uFE0F", description: "Raramente ataca \u2014 na maioria das vezes, s\xF3 observa de longe.", pages: ["Ningu\xE9m sabe explicar como um urso comum sobreviveria tanto tempo ali dentro.", "Alguns juram que ele \xE9 branco s\xF3 \xE0 noite.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem P\xE1lida, Garra Imensa, Presa Gasta."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "cervo-de-chifres-torcidos-bestiario", name: "O Cervo de Chifres Torcidos", type: "mamifero", rarity: "lendaria", suggestedLevel: 20, habitat: "Trecho \xFAnico de floresta densa", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F98C}", description: "Foi visto tr\xEAs vezes em uma d\xE9cada, sempre no mesmo trecho de floresta.", pages: ["Alguns ca\xE7adores dedicam a vida inteira s\xF3 pra v\xEA-lo de novo.", "Yannick tem um caderno inteiro dedicado s\xF3 a relatos sobre ele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Galhada Torcida, Pelagem Prateada, Casco Antigo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado", connections: { npcKey: "erudito", npcNote: "Yannick tem um caderno inteiro dedicado s\xF3 a relatos sobre este cervo.", travellerStoryId: "cervo-de-chifres-torcidos", bookId: "bestiario-das-terras-selvagens" } },
  // ---- Insetos (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "vespa-da-colheita", name: "Vespa da Colheita", type: "inseto", rarity: "comum", suggestedLevel: 1, habitat: "Favos entre os trigais", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F41D}", description: "Ataca quem se aproxima demais dos favos.", pages: ["Constr\xF3i ninhos enormes entre os trigais, todo ver\xE3o.", "Talia vende mel dela na feira, mas nunca conta de onde tira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Ferr\xE3o Fino, Asa Transparente, Favo Pequeno."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "besouro-de-casco-duro", name: "Besouro de Casco Duro", type: "inseto", rarity: "comum", suggestedLevel: 1, habitat: "Terreno pedregoso e seco", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1FAB2}", description: "Rola pedrinhas maiores que o pr\xF3prio corpo.", pages: ["Ningu\xE9m sabe exatamente por qu\xEA ele faz isso.", "Crian\xE7as da Capital colecionam os cascos vazios que ele deixa para tr\xE1s.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Reluzente, Perna Fina, Antena Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "formiga-de-fogo-da-planicie", name: "Formiga-de-Fogo da Plan\xEDcie", type: "inseto", rarity: "comum", suggestedLevel: 2, habitat: "Formigueiros na terra batida", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F41C}", description: "Defende o formigueiro com uma agressividade fora do comum.", pages: ["Vive em col\xF4nias enormes, organizadas com precis\xE3o incomum.", "Um fazendeiro jura que elas reconstroem o formigueiro do mesmo jeito toda vez que \xE9 destru\xEDdo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Mand\xEDbula Pequena, Casco Avermelhado, Ferr\xE3o Ardido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "grilo-da-taverna", name: "Grilo da Taverna", type: "inseto", rarity: "comum", suggestedLevel: 1, habitat: "Frestas perto de luz acesa", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F997}", description: "Canta a noite toda perto de qualquer luz acesa.", pages: ["Greta j\xE1 tentou expulsar os da Taverna dezenas de vezes. Eles sempre voltam.", "Alguns b\xEAbados juram que o canto deles muda de tom conforme a noite avan\xE7a.", "Poss\xEDveis drops (lore, n\xE3o implementado): Perna Saltitante, Asa Fina, Antena Longa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "aranha-do-bosque-sussurrante", name: "Aranha do Bosque Sussurrante", type: "inseto", rarity: "incomum", suggestedLevel: 5, habitat: "Teias entre copas altas", regionId: "bosque-sussurrante", dangerLevel: "media", icon: "\u{1F577}\uFE0F", description: "Tece teias entre \xE1rvores altas demais para qualquer humano alcan\xE7ar.", pages: ["Raramente desce ao ch\xE3o, exceto para ca\xE7ar.", "Idris garante que uma teia dela j\xE1 segurou o peso de um homem adulto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Teia Resistente, Perna Longa, Presa Fina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "viajante", npcNote: "Idris garante que uma teia dela j\xE1 segurou o peso de um homem adulto." } },
  { id: "libelula-do-pantano", name: "Lib\xE9lula do P\xE2ntano", type: "inseto", rarity: "incomum", suggestedLevel: 4, habitat: "\xC1gua parada e vegeta\xE7\xE3o densa", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1FAB0}", description: "Voa em padr\xF5es que parecem, de longe, desenhados de prop\xF3sito.", pages: ["Aparece s\xF3 perto de \xE1gua parada, nunca de \xE1gua corrente.", "Yannick j\xE1 passou uma tarde inteira tentando desenhar o padr\xE3o de voo dela. Desistiu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Asa Iridescente, Corpo Fino, Olho Composto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "escaravelho-das-minas", name: "Escaravelho das Minas", type: "inseto", rarity: "incomum", suggestedLevel: 6, habitat: "T\xFAneis pr\xF3prios dentro das minas", regionId: "minas-abandonadas", dangerLevel: "media", icon: "\u{1FAB2}", description: "Cava t\xFAneis pr\xF3prios, ignorando completamente os j\xE1 existentes.", pages: ["Mineiros o consideram sinal de boa sorte, apesar de nunca explicarem por qu\xEA.", "Alguns juram que ele consegue sentir veios de min\xE9rio antes de qualquer humano.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Met\xE1lico, Mand\xEDbula Forte, Antena Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "luvas-forjadas-minas-abandonadas", npcKey: "ferreiro", npcNote: "Borin acha que o escaravelho sente veio de min\xE9rio antes de qualquer mineiro." } },
  { id: "vespa-de-vidro-do-deserto", name: "Vespa de Vidro do Deserto", type: "inseto", rarity: "raro", suggestedLevel: 9, habitat: "Ninhos dentro da areia vitrificada", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F41D}", description: "As asas cortam como l\xE2mina fina quando ela voa r\xE1pido demais.", pages: ["Constr\xF3i ninhos dentro da pr\xF3pria areia vitrificada, um mist\xE9rio em si.", "Ningu\xE9m que j\xE1 foi cortado por uma esqueceu a experi\xEAncia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Asa Cortante, Ferr\xE3o de Vidro, Casco Transl\xFAcido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "centopeia-das-ruinas", name: "Centopeia das Ru\xEDnas", type: "inseto", rarity: "raro", suggestedLevel: 10, habitat: "Frestas estreitas entre pedras antigas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F41B}", description: "Vive nas frestas mais estreitas entre as pedras antigas.", pages: ["Cresce mais do que qualquer centopeia deveria, segundo os estudiosos.", "Alaric se recusa a guardar uma no Museu, viva ou morta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Segmentado, Perna Fina, Presa Curva."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "mariposa-da-fortaleza", name: "Mariposa da Fortaleza", type: "inseto", rarity: "raro", suggestedLevel: 11, habitat: "Escurid\xE3o completa dos corredores internos", regionId: "fortaleza-sombria", dangerLevel: "media", icon: "\u{1F98B}", description: "S\xF3 voa em completa escurid\xE3o, nunca perto de luz.", pages: ["Ningu\xE9m sabe do que ela se alimenta l\xE1 dentro.", "Guardas juram que o p\xF3 das asas dela apaga tochas.", "Poss\xEDveis drops (lore, n\xE3o implementado): P\xF3 de Asa, Antena Longa, Casco Escuro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "rainha-formiga-do-formigueiro-profundo", name: "Rainha-Formiga do Formigueiro Profundo", type: "inseto", rarity: "muito-raro", suggestedLevel: 16, habitat: "Centro de formigueiros antigos", regionId: "planicie-dourada", dangerLevel: "alta", icon: "\u{1F41C}", description: "Nunca sai do centro do formigueiro, protegida por gera\xE7\xF5es de oper\xE1rias.", pages: ["Alguns formigueiros da Plan\xEDcie Dourada existem h\xE1 mais tempo que a pr\xF3pria Capital.", "Um estudioso passou anos tentando encontrar uma. Nunca encontrou.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Real, Mand\xEDbula Imensa, Ferr\xE3o Grosso."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-enxame-sem-fim", name: "O Enxame Sem Fim", type: "inseto", rarity: "lendaria", suggestedLevel: 19, habitat: "Clareira espec\xEDfica, uma vez por gera\xE7\xE3o", regionId: "bosque-sussurrante", dangerLevel: "letal", icon: "\u{1F41D}", description: "Aparece uma vez a cada gera\xE7\xE3o, cobrindo uma clareira inteira.", pages: ["As \xFAltimas tr\xEAs apari\xE7\xF5es coincidem com mudan\xE7as grandes no Reino, segundo Alaric.", "Ningu\xE9m sabe se \xE9 um enxame s\xF3 ou v\xE1rios agindo juntos.", "Poss\xEDveis drops (lore, n\xE3o implementado): Enxame Capturado, Asa Coletiva, Mel Escuro."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Mortos-vivos (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "esqueleto-de-sentinela", name: "Esqueleto de Sentinela", type: "morto-vivo", rarity: "comum", suggestedLevel: 3, habitat: "Postos de guarda abandonados", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F480}", description: "Continua de posto, mesmo sem ningu\xE9m mais pra vigiar.", pages: ["Ningu\xE9m sabe h\xE1 quantas gera\xE7\xF5es ele est\xE1 ali parado.", "Alaric j\xE1 tentou catalogar a armadura dele. O esqueleto n\xE3o deixou.", "Poss\xEDveis drops (lore, n\xE3o implementado): Osso Quebrado, Fragmento de Armadura, Elmo Enferrujado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "zumbi-de-vila-abandonada", name: "Zumbi de Vila Abandonada", type: "morto-vivo", rarity: "comum", suggestedLevel: 3, habitat: "Casas vazias e ruas desertas", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F9DF}", description: "Repete os mesmos passos, todos os dias, como se ainda tivesse rotina.", pages: ["Alguns moradores juram reconhecer o rosto de gente que j\xE1 morreu h\xE1 anos.", "Ningu\xE9m tem coragem de perguntar de perto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Roupa Rasgada, Osso Solto, Sapato Velho."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "mao-rastejante", name: "M\xE3o Rastejante", type: "morto-vivo", rarity: "comum", suggestedLevel: 2, habitat: "Terrenos alagados e lamacentos", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1F590}\uFE0F", description: "Se move sozinha, sem dono nem explica\xE7\xE3o.", pages: ["Encontrada, mais de uma vez, longe de qualquer corpo.", "Ningu\xE9m quis levar uma pra casa como trof\xE9u, apesar da oferta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Dedo \xD3sseo, Unha Quebrada, Pele Ressecada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "mumia-menor-das-areias", name: "M\xFAmia Menor das Areias", type: "morto-vivo", rarity: "comum", suggestedLevel: 4, habitat: "Sepulturas rasas sob a areia", regionId: "deserto-de-vidro", dangerLevel: "media", icon: "\u{1F9FB}", description: "Enterrada superficialmente, sempre volta \xE0 superf\xEDcie.", pages: ["Ningu\xE9m sabe se ela sai sozinha ou se algo a desenterra.", "Os panos dela nunca se desfazem, n\xE3o importa o tempo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Faixa Antiga, Amuleto Partido, P\xF3 Fino."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "cavaleiro-sem-cabeca-da-estrada-velha", name: "Cavaleiro Sem Cabe\xE7a da Estrada Velha", type: "morto-vivo", rarity: "incomum", suggestedLevel: 6, habitat: "Trecho fixo de estrada antiga", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u{1F5E1}\uFE0F", description: "Percorre sempre o mesmo trecho de estrada, todas as noites.", pages: ["Ningu\xE9m sabe seu nome, mas todo mundo conhece a estrada que ele guarda.", "Guardas evitam essa estrada \xE0 noite, mesmo sendo o caminho mais curto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Elmo Vazio, Espada Cega, Armadura Fria."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "espectro-de-marinheiro", name: "Espectro de Marinheiro", type: "morto-vivo", rarity: "incomum", suggestedLevel: 7, habitat: "Perto de naufr\xE1gios na costa", regionId: "litoral-quebrado", dangerLevel: "media", icon: "\u{1F47B}", description: "Aparece s\xF3 perto de naufr\xE1gios, nunca em \xE1gua aberta.", pages: ["Alguns pescadores juram j\xE1 ter conversado com um, brevemente.", "Ningu\xE9m que conversou concorda no que ele disse.", "Poss\xEDveis drops (lore, n\xE3o implementado): Corda Molhada, Chap\xE9u Encharcado, Moeda Antiga."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "enforcado-da-forca-velha", name: "Enforcado da Forca Velha", type: "morto-vivo", rarity: "incomum", suggestedLevel: 6, habitat: "Estruturas de madeira abandonadas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1FAA2}", description: "Balan\xE7a mesmo sem vento nenhum.", pages: ["Ningu\xE9m sabe o crime, nem se houve um de verdade.", "A corda nunca se rompe, n\xE3o importa quanto tempo passe.", "Poss\xEDveis drops (lore, n\xE3o implementado): Corda Velha, Roupa Rasgada, Anel Simples."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guardiao-osseo-da-ultima-coroa", name: "Guardi\xE3o \xD3sseo da \xDAltima Coroa", type: "morto-vivo", rarity: "raro", suggestedLevel: 10, habitat: "Corredores centrais das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2694\uFE0F", description: "Protege um trecho espec\xEDfico das Ru\xEDnas, sem descanso.", pages: ["Dizem que j\xE1 foi um soldado da guarda real, h\xE1 muito tempo.", "Nenhum registro confirma seu nome, apesar de v\xE1rios j\xE1 terem tentado descobrir.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escudo Antigo, Elmo Real, Osso Refor\xE7ado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "elmo-guardiao-ruinas", npcKey: "curador", npcNote: "Alaric acredita que ele j\xE1 foi um soldado da guarda real, h\xE1 muito tempo." } },
  { id: "bruxa-cinza-da-fortaleza", name: "Bruxa Cinza da Fortaleza", type: "morto-vivo", rarity: "raro", suggestedLevel: 12, habitat: "Sal\xF5es silenciosos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F9D9}\u200D\u2640\uFE0F", description: "S\xF3 fala quando algu\xE9m realmente escuta.", pages: ["Ningu\xE9m sabe se ela j\xE1 foi viva de verdade ou se sempre foi assim.", "Zoltar se recusa a falar sobre ela em detalhes.", "Poss\xEDveis drops (lore, n\xE3o implementado): Manto Cinzento, Cajado Quebrado, Frasco Vazio."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "o-rei-sem-sepultura", name: "O Rei Sem Sepultura", type: "morto-vivo", rarity: "muito-raro", suggestedLevel: 16, habitat: "Corredores mais antigos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F451}", description: "Anda pelos corredores mais antigos, sozinho, sem pressa.", pages: ["Nenhum historiador confirma qual rei foi, apesar das teorias.", "Alaric acredita que \xE9 o mesmo rei mencionado em relatos antigos, mas nunca provou.", "Poss\xEDveis drops (lore, n\xE3o implementado): Coroa Partida, Manto Real, Cetro Quebrado."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "a-viuva-da-ponte", name: "A Vi\xFAva da Ponte", type: "morto-vivo", rarity: "muito-raro", suggestedLevel: 17, habitat: "Ponte antiga sobre um rio seco", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u{1F47B}", description: "Espera, todas as noites, no mesmo ponto da ponte antiga.", pages: ["Ningu\xE9m sabe quem ela esperava, nem se um dia ele chegou.", "Alguns viajantes deixam flores na ponte, s\xF3 por precau\xE7\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): V\xE9u Rasgado, Anel de Casamento, Flor Seca."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-exercito-esquecido", name: "O Ex\xE9rcito Esquecido", type: "morto-vivo", rarity: "lendaria", suggestedLevel: 22, habitat: "P\xE1tio principal da fortaleza, s\xF3 \xE0 noite", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u2694\uFE0F", description: "Aparece completo, em forma\xE7\xE3o, e desaparece antes do amanhecer.", pages: ["Nenhum relato concorda em quantos soldados realmente s\xE3o.", "Alaric dedicou um cap\xEDtulo inteiro do Museu s\xF3 a teorias sobre eles.", "Poss\xEDveis drops (lore, n\xE3o implementado): Estandarte Rasgado, Armadura Completa, Espada de Comando."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Espíritos (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "sussurro-do-vento", name: "Sussurro do Vento", type: "espirito", rarity: "comum", suggestedLevel: 1, habitat: "Encostas abertas ao vento", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F4A8}", description: "S\xF3 \xE9 notado quando o vento para de repente.", pages: ["Pastores dizem que \xE9 normal, e seguem trabalhando sem se abalar.", "Ningu\xE9m j\xE1 viu, s\xF3 ouviu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Eco Capturado, Pena Solta, Poeira Fina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "luz-errante-do-pantano", name: "Luz Errante do P\xE2ntano", type: "espirito", rarity: "comum", suggestedLevel: 2, habitat: "Trilhas enlameadas ao anoitecer", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1F32B}\uFE0F", description: "Guia viajantes pro caminho errado, na maioria das vezes sem querer.", pages: ["Ningu\xE9m sabe se ela tem inten\xE7\xE3o ou s\xF3 existe assim.", "Alguns juram que ela muda de cor dependendo de quem a segue.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento de Luz, N\xE9voa Capturada, Vidro Emba\xE7ado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { npcKey: "taverneira", npcNote: "Greta diz que \xE9 essa luz que os viajantes juram ver no P\xE2ntano \xE0 noite.", rumor: "Um viajante jura ter visto luzes no P\xE2ntano Podre \xE0 noite." } },
  { id: "eco-da-capital-velha", name: "Eco da Capital Velha", type: "espirito", rarity: "comum", suggestedLevel: 2, habitat: "Becos vazios \xE0 noite", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F514}", description: "Repete sons antigos em becos vazios, sem motivo aparente.", pages: ["Moradores mais velhos dizem que j\xE1 era assim antes deles nascerem.", "O sino da torre, dizem, \xE9 onde ele mais aparece.", "Poss\xEDveis drops (lore, n\xE3o implementado): Som Preso, Sino Rachado, Poeira Antiga."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sombra-da-vela-apagada", name: "Sombra da Vela Apagada", type: "espirito", rarity: "comum", suggestedLevel: 3, habitat: "C\xF4modos fechados sem janelas", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F56F}\uFE0F", description: "Aparece s\xF3 quando uma vela apaga sozinha.", pages: ["Ningu\xE9m sabe se ela apaga a vela ou s\xF3 aparece depois.", "Miriam mant\xE9m uma vela sempre acesa na Biblioteca, s\xF3 por garantia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cera Fria, Sombra Capturada, Pavio Queimado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "pranto-da-ponte-velha", name: "Pranto da Ponte Velha", type: "espirito", rarity: "incomum", suggestedLevel: 6, habitat: "Perto de \xE1gua corrente, \xE0 noite", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F622}", description: "Chora baixinho perto da \xE1gua, sem nunca se mostrar.", pages: ["Ningu\xE9m sabe se \xE9 o mesmo esp\xEDrito da Vi\xFAva da Ponte ou algo diferente.", "Alguns viajantes evitam a ponte \xE0 noite s\xF3 por causa do choro.", "Poss\xEDveis drops (lore, n\xE3o implementado): L\xE1grima Congelada, V\xE9u Molhado, Eco de Choro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guardiao-silencioso-das-ruinas", name: "Guardi\xE3o Silencioso das Ru\xEDnas", type: "espirito", rarity: "incomum", suggestedLevel: 7, habitat: "C\xE2maras centrais das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F32B}\uFE0F", description: "Observa exploradores sem nunca interferir.", pages: ["Alguns juram que ele afasta perigos maiores, sem ningu\xE9m perceber.", "Alaric acredita que ele protege as Ru\xEDnas h\xE1 mais tempo que qualquer registro.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xE9voa Antiga, Pedra Fria, Eco de Passos."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "amuleto-guardiao-ruinas", npcKey: "curador", npcNote: "Alaric acredita que ele protege as Ru\xEDnas h\xE1 mais tempo que qualquer registro." } },
  { id: "espirito-da-fogueira-apagada", name: "Esp\xEDrito da Fogueira Apagada", type: "espirito", rarity: "incomum", suggestedLevel: 6, habitat: "Acampamentos abandonados", regionId: "bosque-sussurrante", dangerLevel: "media", icon: "\u{1F525}", description: "Aparece s\xF3 onde uma fogueira foi abandonada acesa.", pages: ["Alguns ca\xE7adores juram que ele reacende o fogo sozinho, \xE0 noite.", "Kade jura que uma vez ele reacendeu uma fogueira na Arena, sem explica\xE7\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Brasa Fria, Fuma\xE7a Presa, Cinza Quente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "vulto-do-deserto-de-vidro", name: "Vulto do Deserto de Vidro", type: "espirito", rarity: "raro", suggestedLevel: 11, habitat: "Dunas durante tempestades de areia", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F464}", description: "Aparece s\xF3 durante tempestades de areia, nunca antes ou depois.", pages: ["Alguns viajantes juram que ele os guiou pra fora da tempestade.", "Ningu\xE9m sabe se ele \xE9 benevolente ou s\xF3 indiferente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Areia Vitrificada, Vulto Capturado, Vidro Quente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "voz-da-fortaleza-sombria", name: "Voz da Fortaleza Sombria", type: "espirito", rarity: "raro", suggestedLevel: 12, habitat: "Corredores profundos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F5E3}\uFE0F", description: "Sussurra frases incompletas, nunca a mesma duas vezes.", pages: ["Ningu\xE9m que j\xE1 ouviu concorda no que ela disse de verdade.", "Zoltar tentou registrar as frases. Desistiu depois da terceira tentativa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Sussurro Capturado, Eco Sombrio, Fragmento de Voz."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "alquimista", npcNote: "Zoltar tentou registrar as frases dela. Desistiu depois da terceira tentativa.", rumor: "Ouviram cantoria vindo da Fortaleza Sombria. Ningu\xE9m foi conferir.", bookId: "misterios-da-fortaleza-sombria" } },
  { id: "o-guardiao-sem-rosto", name: "O Guardi\xE3o Sem Rosto", type: "espirito", rarity: "muito-raro", suggestedLevel: 17, habitat: "Perto da est\xE1tua sem rosto da capital antiga", regionId: "ruinas-esquecidas", dangerLevel: "letal", icon: "\u{1F32B}\uFE0F", description: "Vigia a est\xE1tua sem rosto da \xDAltima Coroa, ou \xE9 ele mesmo a est\xE1tua.", pages: ["Ningu\xE9m sabe se \xE9 um esp\xEDrito ou apenas uma lenda que ganhou vida pr\xF3pria.", "Alaric se recusa a comentar essa teoria espec\xEDfica.", "Poss\xEDveis drops (lore, n\xE3o implementado): M\xE1scara Vazia, Pedra Polida, Eco Antigo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado", connections: { npcKey: "curador", npcNote: "Alaric se recusa terminantemente a comentar essa teoria espec\xEDfica." } },
  { id: "a-dama-do-amanhecer", name: "A Dama do Amanhecer", type: "espirito", rarity: "muito-raro", suggestedLevel: 18, habitat: "Praia leste, no exato nascer do sol", regionId: "porto-do-amanhecer", dangerLevel: "media", icon: "\u{1F305}", description: "Aparece s\xF3 no exato instante do nascer do sol, uma vez por esta\xE7\xE3o.", pages: ["Alguns acreditam que ela \xE9 mais antiga que a pr\xF3pria Capital.", "O nome do Porto do Amanhecer vem, segundo alguns, dela mesma.", "Poss\xEDveis drops (lore, n\xE3o implementado): Luz Capturada, V\xE9u Dourado, Orvalho Eterno."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-silencio-antes-da-tempestade", name: "O Sil\xEAncio Antes da Tempestade", type: "espirito", rarity: "lendaria", suggestedLevel: 21, habitat: "Picos mais altos, minutos antes de tempestades", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u{1F32A}\uFE0F", description: "Aparece s\xF3 nos minutos antes das piores tempestades dos Picos.", pages: ["Alguns exploradores usam a apari\xE7\xE3o dele como aviso pra recuar a tempo.", "Ningu\xE9m sabe se ele causa a tempestade ou s\xF3 a antecipa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Sil\xEAncio Capturado, Gelo Eterno, Vento Preso."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Constructos (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "boneco-de-palha-animado", name: "Boneco de Palha Animado", type: "construto", rarity: "comum", suggestedLevel: 2, habitat: "Meio de planta\xE7\xF5es", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F3AD}", description: "Fica parado no meio da planta\xE7\xE3o at\xE9 algu\xE9m chegar perto.", pages: ["Ningu\xE9m lembra quem o encantou pela primeira vez.", "Alguns fazendeiros trocam a roupa dele todo ano, por tradi\xE7\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Palha Tran\xE7ada, Bot\xE3o Velho, Pano Remendado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "golem-de-barro-pequeno", name: "Golem de Barro Pequeno", type: "construto", rarity: "comum", suggestedLevel: 3, habitat: "Po\xE7as de lama seca", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F5FF}", description: "Se forma sozinho quando a lama seca de um jeito espec\xEDfico.", pages: ["Desmancha em poucos dias, e outro se forma em outro lugar.", "Ningu\xE9m nunca viu dois ao mesmo tempo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Barro Endurecido, Argila Rachada, Pedra Molhada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "espantalho-de-ferro", name: "Espantalho de Ferro", type: "construto", rarity: "comum", suggestedLevel: 3, habitat: "Bordas de planta\xE7\xF5es antigas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F6E1}\uFE0F", description: "Protege planta\xE7\xF5es que j\xE1 nem existem mais.", pages: ["Alguns fazendeiros o mant\xEAm por h\xE1bito, n\xE3o por necessidade.", "Borin garante que j\xE1 consertou um sem lembrar quem pediu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Placa de Ferro, Parafuso Solto, Pano Velho."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "marionete-sem-dono", name: "Marionete Sem Dono", type: "construto", rarity: "comum", suggestedLevel: 2, habitat: "Lojas fechadas e dep\xF3sitos", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F38E}", description: "Se move sozinha quando ningu\xE9m est\xE1 olhando direito.", pages: ["Encontrada numa loja fechada h\xE1 anos, sem explica\xE7\xE3o de como chegou l\xE1.", "Ningu\xE9m quis comprar, mesmo de gra\xE7a.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fio Cortado, Madeira Entalhada, Roupa em Miniatura."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "golem-de-pedra-antiga-menor", name: "Golem de Pedra Menor", type: "construto", rarity: "incomum", suggestedLevel: 6, habitat: "Galerias profundas e escuras", regionId: "minas-abandonadas", dangerLevel: "alta", icon: "\u2699\uFE0F", description: "Guarda galerias que ningu\xE9m mais consegue identificar o prop\xF3sito.", pages: ["Move-se devagar, mas nunca para completamente.", "Mineiros aprenderam a simplesmente andar ao redor dele, sem provocar.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento de Pedra, N\xFAcleo Rachado, Placa Gravada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sentinela-de-bronze-enferrujado", name: "Sentinela de Bronze Enferrujado", type: "construto", rarity: "incomum", suggestedLevel: 7, habitat: "Postos avan\xE7ados das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F6E1}\uFE0F", description: "Continua de posto, ferrugem e tudo, h\xE1 gera\xE7\xF5es.", pages: ["Alaric acredita que ele j\xE1 protegia algo importante, esquecido h\xE1 muito tempo.", "Ningu\xE9m j\xE1 conseguiu identificar o que ele est\xE1 protegendo, exatamente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Placa de Bronze, Engrenagem Presa, Parafuso Antigo."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "boneco-de-cera-da-feira", name: "Boneco de Cera da Feira", type: "construto", rarity: "incomum", suggestedLevel: 5, habitat: "Barracas de feira antigas", regionId: "porto-do-amanhecer", dangerLevel: "media", icon: "\u{1F56F}\uFE0F", description: "Derrete um pouco a cada ver\xE3o, e volta a se formar no inverno.", pages: ["Ningu\xE9m lembra quem o esculpiu originalmente.", "Crian\xE7as da Capital juram que o rosto dele muda, ano ap\xF3s ano.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cera Derretida, Pavio Antigo, Molde Rachado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guardiao-de-ferro-da-ultima-coroa", name: "Guardi\xE3o de Ferro da \xDAltima Coroa", type: "construto", rarity: "raro", suggestedLevel: 11, habitat: "Sal\xF5es centrais das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2699\uFE0F", description: "Protegia algo importante. Ningu\xE9m mais sabe o qu\xEA.", pages: ["Encontrado ainda de p\xE9, d\xE9cadas depois de tudo ao redor ter ca\xEDdo.", "Alaric tentou mover um pra exposi\xE7\xE3o. N\xE3o conseguiu nem arranhar.", "Poss\xEDveis drops (lore, n\xE3o implementado): Placa Refor\xE7ada, N\xFAcleo de Ferro, Engrenagem Grande."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "luvas-guardiao-ruinas", npcKey: "curador", npcNote: "Alaric tentou mover um pra exposi\xE7\xE3o do Museu. N\xE3o conseguiu nem arranhar." } },
  { id: "automato-do-deserto-de-vidro", name: "Aut\xF4mato do Deserto de Vidro", type: "construto", rarity: "raro", suggestedLevel: 12, habitat: "Linha reta pelo meio do deserto", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F916}", description: "Anda em linha reta pelo deserto, sem nunca desviar.", pages: ["Ningu\xE9m sabe seu destino, nem se ele sabe.", "Zoltar tentou conversar com um. N\xE3o obteve resposta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Vidro Fundido, Engrenagem de Vidro, N\xFAcleo Transl\xFAcido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sentinela-congelada-dos-picos", name: "Sentinela Congelada dos Picos", type: "construto", rarity: "raro", suggestedLevel: 13, habitat: "Trilhas altas cobertas de gelo", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u2744\uFE0F", description: "Fica im\xF3vel por meses, at\xE9 algo se aproximar demais.", pages: ["Alguns exploradores confundem com uma est\xE1tua, at\xE9 ser tarde demais.", "Roth garante que um j\xE1 ficou parado tempo suficiente pra virar ponto de refer\xEAncia num mapa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Gelo Compacto, N\xFAcleo Congelado, Placa Gelada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "botas-picos-congelados", npcKey: "guarda", npcNote: "Roth garante que uma sentinela j\xE1 ficou parada tempo suficiente pra virar ponto de refer\xEAncia num mapa." } },
  { id: "o-guardiao-sem-instrucoes", name: "O Guardi\xE3o Sem Instru\xE7\xF5es", type: "construto", rarity: "muito-raro", suggestedLevel: 17, habitat: "Sal\xE3o mais profundo da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F5FF}", description: "Continua executando uma tarefa que ningu\xE9m mais lembra qual era.", pages: ["Alguns acreditam que ele protege algo que j\xE1 nem existe mais.", "Alaric passou meses tentando decifrar as inscri\xE7\xF5es na base dele. Ainda tenta.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xFAcleo Antigo, Placa Inscrita, Engrenagem Complexa."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-primeiro-automato", name: "O Primeiro Aut\xF4mato", type: "construto", rarity: "lendaria", suggestedLevel: 24, habitat: "C\xE2mara mais antiga das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2699\uFE0F", description: "Dizem que foi o primeiro construto j\xE1 feito no Reino.", pages: ["Nenhum ferreiro atual sabe reproduzir a t\xE9cnica usada nele.", "Borin diz que estudaria a vida inteira s\xF3 pra entender uma junta dele.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xFAcleo Primordial, Placa Original, Engrenagem Perfeita."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Elementais (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "faisca-errante", name: "Fa\xEDsca Errante", type: "elemental", rarity: "comum", suggestedLevel: 2, habitat: "Perto de forjas acesas por tempo demais", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u2728", description: "Aparece perto de qualquer forja acesa por tempo demais.", pages: ["Borin diz que toda forja atrai uma, mais cedo ou mais tarde.", "Algumas somem sozinhas. Outras precisam ser 'convencidas'.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fagulha Presa, Cinza Quente, Carv\xE3o Aceso."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "poca-viva", name: "Po\xE7a Viva", type: "elemental", rarity: "comum", suggestedLevel: 2, habitat: "\xC1reas alagadas rasas", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1F4A7}", description: "Se move devagar, sempre em dire\xE7\xE3o \xE0 \xE1gua mais pr\xF3xima.", pages: ["Ningu\xE9m sabe se ela busca algo ou s\xF3 segue um instinto simples.", "Crian\xE7as gostam de seguir uma at\xE9 ela desaparecer numa po\xE7a maior.", "Poss\xEDveis drops (lore, n\xE3o implementado): \xC1gua Densa, Lodo Vivo, Gota Espessa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "brisa-teimosa", name: "Brisa Teimosa", type: "elemental", rarity: "comum", suggestedLevel: 1, habitat: "Campos abertos e ventosos", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F343}", description: "Sopra sempre contra o vento principal, sem explica\xE7\xE3o.", pages: ["Fazendeiros usam a dire\xE7\xE3o dela pra prever mudan\xE7as de tempo.", "Alguns dizem que ela nunca sopra igual duas vezes.", "Poss\xEDveis drops (lore, n\xE3o implementado): Ar Comprimido, Pena Levitando, Poeira Suspensa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "barro-fervente", name: "Barro Fervente", type: "elemental", rarity: "comum", suggestedLevel: 3, habitat: "Po\xE7as pequenas dentro das minas", regionId: "minas-abandonadas", dangerLevel: "media", icon: "\u{1F30B}", description: "Borbulha sozinho em po\xE7as pequenas dentro das minas.", pages: ["Mineiros aprenderam a identificar o barulho antes de chegar perto.", "J\xE1 apagou mais de uma tocha esquecida no ch\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Barro Quente, Pedra Amolecida, Vapor Denso."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "chama-baixa-do-acampamento", name: "Chama Baixa do Acampamento", type: "elemental", rarity: "incomum", suggestedLevel: 5, habitat: "Fogueiras mal apagadas", regionId: "bosque-sussurrante", dangerLevel: "media", icon: "\u{1F525}", description: "Aparece em fogueiras mal apagadas, \xE0 noite.", pages: ["Viajantes aprenderam a apagar bem o fogo, s\xF3 por precau\xE7\xE3o.", "Alguns juram que ela ajuda a manter o calor at\xE9 de manh\xE3.", "Poss\xEDveis drops (lore, n\xE3o implementado): Brasa Viva, Fuma\xE7a Densa, Cinza Ardente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "redemoinho-das-colinas", name: "Redemoinho das Colinas", type: "elemental", rarity: "incomum", suggestedLevel: 6, habitat: "Encostas secas sem vento aparente", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F300}", description: "Levanta poeira em espiral, sem vento nenhum ao redor.", pages: ["Pastores acreditam que segue certos animais por longas dist\xE2ncias.", "Alguns dizem que ele carrega vozes distantes dentro da poeira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Poeira Girante, Ar Denso, Pedra Polida pelo Vento."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "nevoa-gelada-dos-picos", name: "N\xE9voa Gelada dos Picos", type: "elemental", rarity: "incomum", suggestedLevel: 7, habitat: "Trilhas altas sem aviso pr\xE9vio", regionId: "picos-congelados", dangerLevel: "media", icon: "\u2744\uFE0F", description: "Cobre trilhas inteiras em minutos, sem aviso.", pages: ["Guias experientes sabem esperar, nunca atravessar.", "Alguns exploradores relatam vozes dentro da n\xE9voa. Ningu\xE9m confirma.", "Poss\xEDveis drops (lore, n\xE3o implementado): Gelo Fino, N\xE9voa Presa, Cristal de Frost."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "coracao-de-vidro-do-deserto", name: "Cora\xE7\xE3o de Vidro do Deserto", type: "elemental", rarity: "raro", suggestedLevel: 11, habitat: "Interior de dunas espec\xEDficas", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F536}", description: "Pulsa devagar dentro de dunas espec\xEDficas, como um cora\xE7\xE3o de verdade.", pages: ["Ningu\xE9m sabe se est\xE1 vivo, ou se s\xF3 imita algo vivo.", "Zoltar dedicou anos tentando entender o padr\xE3o do pulso.", "Poss\xEDveis drops (lore, n\xE3o implementado): Vidro Pulsante, N\xFAcleo Transl\xFAcido, Areia Quente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "chama-profunda-da-fortaleza", name: "Chama Profunda da Fortaleza", type: "elemental", rarity: "raro", suggestedLevel: 12, habitat: "C\xE2maras internas da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F525}", description: "Arde sem consumir nada ao redor, h\xE1 gera\xE7\xF5es.", pages: ["Alguns acreditam que ela guarda algo importante dentro do fogo.", "Ningu\xE9m j\xE1 conseguiu apag\xE1-la, apesar de v\xE1rias tentativas registradas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Chama Eterna, Cinza Fria, Carv\xE3o Intacto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "o-rio-que-sobe", name: "O Rio Que Sobe", type: "elemental", rarity: "muito-raro", suggestedLevel: 16, habitat: "Curso d'\xE1gua pr\xF3ximo ao litoral", regionId: "litoral-quebrado", dangerLevel: "alta", icon: "\u{1F30A}", description: "Corre morro acima, contra toda l\xF3gica, uma vez por esta\xE7\xE3o.", pages: ["Pescadores organizam a rotina inteira em torno dessa uma vez.", "Ningu\xE9m sabe pra onde a \xE1gua vai depois.", "Poss\xEDveis drops (lore, n\xE3o implementado): \xC1gua Ascendente, Espuma Densa, Pedra Molhada Sempre."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-vento-que-lembra", name: "O Vento Que Lembra", type: "elemental", rarity: "muito-raro", suggestedLevel: 17, habitat: "Encostas altas e isoladas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F32C}\uFE0F", description: "Carrega sons de conversas antigas, \xE0s vezes reconhec\xEDveis.", pages: ["Alguns moradores juram j\xE1 ter ouvido a pr\xF3pria voz, mais jovem, no vento.", "Ningu\xE9m recomenda escutar por tempo demais.", "Poss\xEDveis drops (lore, n\xE3o implementado): Eco Antigo, Ar Denso de Mem\xF3ria, Poeira de Tempo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-coracao-da-tempestade", name: "O Cora\xE7\xE3o da Tempestade", type: "elemental", rarity: "lendaria", suggestedLevel: 23, habitat: "Centro das piores tempestades j\xE1 registradas", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u26C8\uFE0F", description: "Aparece s\xF3 no centro das piores tempestades j\xE1 registradas.", pages: ["Cada gera\xE7\xE3o tem no m\xE1ximo um relato confirmado dele.", "Alguns acreditam que ele \xC9 a tempestade, n\xE3o s\xF3 parte dela.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xFAcleo da Tempestade, Raio Capturado, Gelo Eterno."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Dragões (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "lagarto-alado-da-planicie", name: "Lagarto-Alado da Plan\xEDcie", type: "dragao", rarity: "comum", suggestedLevel: 3, habitat: "C\xE9u baixo sobre os trigais", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F98E}", description: "Voa baixo, raramente mais alto que uma \xE1rvore.", pages: ["Considerado por muitos um drag\xE3o jovem demais pra ser perigoso.", "Fazendeiros os espantam com barulho, n\xE3o com for\xE7a.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Pequena, Asa Fina, Garra Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "mestreArena", npcNote: "Kade acha que \xE9 isso que a crian\xE7a da Taverna viu \u2014 n\xE3o uma nuvem grande.", rumor: "Uma crian\xE7a jura ter visto um drag\xE3o. Era uma nuvem grande." } },
  { id: "filhote-de-dragao-das-colinas", name: "Filhote de Drag\xE3o das Colinas", type: "dragao", rarity: "comum", suggestedLevel: 4, habitat: "Fendas rochosas nas encostas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F409}", description: "Ainda aprende a voar, caindo mais do que decolando.", pages: ["A m\xE3e nunca \xE9 vista por perto, o que preocupa mais que tranquiliza.", "Kade jura que j\xE1 viu um trope\xE7ar nas pr\xF3prias asas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Macia, Garra Pequena, Dente de Leite."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "dragao-lagarto-do-pantano", name: "Drag\xE3o-Lagarto do P\xE2ntano", type: "dragao", rarity: "comum", suggestedLevel: 4, habitat: "\xC1guas rasas e lamacentas", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F40A}", description: "Nada mais do que voa, na maior parte do tempo.", pages: ["Parece mais r\xE9ptil comum que drag\xE3o, at\xE9 abrir as asas.", "Alguns pescadores nem percebem a diferen\xE7a at\xE9 ser tarde.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Encharcada, Cauda Grossa, Dente Afiado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "draconido-das-rochas", name: "Drac\xF4nido das Rochas", type: "dragao", rarity: "comum", suggestedLevel: 3, habitat: "Fendas e afloramentos rochosos", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F98E}", description: "Se camufla t\xE3o bem entre pedras que a maioria passa direto.", pages: ["Prefere fugir a lutar, na esmagadora maioria das vezes.", "Roth garante que um j\xE1 ficou parado perto do Port\xE3o Norte por dias sem ser notado.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Cinzenta, Garra Curta, Cauda Pequena."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "dragao-das-minas", name: "Drag\xE3o das Minas", type: "dragao", rarity: "incomum", suggestedLevel: 7, habitat: "Galerias mais profundas e desconhecidas", regionId: "minas-abandonadas", dangerLevel: "alta", icon: "\u{1F432}", description: "Vive nas galerias mais profundas, longe de qualquer entrada conhecida.", pages: ["Mineiros evitam certos t\xFAneis s\xF3 por precau\xE7\xE3o, mesmo sem prova de que ele more ali.", "Ningu\xE9m sabe o tamanho real dele \u2014 s\xF3 rastros.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Escura, Garra Robusta, Dente Quebrado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "serpente-alada-do-litoral", name: "Serpente Alada do Litoral", type: "dragao", rarity: "incomum", suggestedLevel: 8, habitat: "\xC1guas costeiras profundas", regionId: "litoral-quebrado", dangerLevel: "alta", icon: "\u{1F40D}", description: "Ca\xE7a peixes grandes, mergulhando de altura consider\xE1vel.", pages: ["Pescadores aprenderam a reconhecer a sombra dela na \xE1gua antes de qualquer outra coisa.", "Alguns acreditam que \xE9 parente distante das serpentes marinhas de hist\xF3rias antigas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Molhada, Asa Membranosa, Dente Curvo."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "colar-conchas", npcKey: "viajante", npcNote: "Idris acredita que ela \xE9 parente distante das serpentes marinhas de hist\xF3rias antigas." } },
  { id: "dragao-de-gelo-jovem", name: "Drag\xE3o de Gelo Jovem", type: "dragao", rarity: "incomum", suggestedLevel: 8, habitat: "Fendas nevadas nas montanhas", regionId: "picos-congelados", dangerLevel: "alta", icon: "\u{1F409}", description: "Ainda n\xE3o sopra gelo de verdade, s\xF3 n\xE9voa fria.", pages: ["Exploradores relatam encontros breves, sempre \xE0 dist\xE2ncia.", "Yannick tem um desenho detalhado, feito de mem\xF3ria, depois de um encontro r\xE1pido.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Congelada, Garra Fria, Dente de Gelo."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "espada-curva-picos-congelados", npcKey: "erudito", npcNote: "Yannick tem um desenho detalhado dele, feito de mem\xF3ria, depois de um encontro r\xE1pido." } },
  { id: "dragao-das-ruinas-esquecidas", name: "Drag\xE3o das Ru\xEDnas Esquecidas", type: "dragao", rarity: "raro", suggestedLevel: 12, habitat: "Entre as pedras mais antigas das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F432}", description: "Dorme na maior parte do tempo, entre as pedras mais antigas.", pages: ["Alguns exploradores juram j\xE1 ter dormido a poucos metros dele, sem perceber.", "Alaric acredita que ele nasceu depois das Ru\xEDnas ca\xEDrem, n\xE3o antes.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Antiga, Garra Grande, Dente Amarelado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "serpente-dragao-do-deserto-de-vidro", name: "Serpente-Drag\xE3o do Deserto de Vidro", type: "dragao", rarity: "raro", suggestedLevel: 13, habitat: "Sob a areia vitrificada", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F40D}", description: "Nada pela areia como se fosse \xE1gua.", pages: ["Ningu\xE9m sabe como ela respira l\xE1 dentro, mas respira.", "Zoltar acredita que ela \xE9 mais velha que o pr\xF3prio deserto vitrificado.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama V\xEDtrea, Presa de Vidro, Cauda Reluzente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "o-dragao-da-fortaleza-sombria", name: "O Drag\xE3o da Fortaleza Sombria", type: "dragao", rarity: "muito-raro", suggestedLevel: 18, habitat: "Sal\xE3o principal da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F409}", description: "Raramente sai do sal\xE3o principal, protegendo algo que ningu\xE9m identificou.", pages: ["Alguns acreditam que ele guarda a Fortaleza h\xE1 mais tempo que qualquer rei j\xE1 registrado.", "Ningu\xE9m que o viu de perto concorda na cor exata das escamas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Sombria, Garra Imensa, Dente Negro."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "a-dragoa-dos-picos-eternos", name: "A Dragoa dos Picos Eternos", type: "dragao", rarity: "muito-raro", suggestedLevel: 19, habitat: "Ninho oculto no alto das montanhas", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u{1F409}", description: "Protege um ninho que ningu\xE9m jamais encontrou.", pages: ["Exploradores que se aproximam demais relatam apenas o som de asas, nunca a vis\xE3o completa.", "Roth acredita que ela \xE9 a m\xE3e de todo drag\xE3o de gelo j\xE1 avistado na regi\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Glacial, Garra Afiada, Ovo Intacto."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-velho-das-terras-altas", name: "O Velho das Terras Altas", type: "dragao", rarity: "lendaria", suggestedLevel: 27, habitat: "Picos mais remotos das colinas", regionId: "colinas-aridas", dangerLevel: "letal", icon: "\u{1F432}", description: "Ningu\xE9m sabe a idade real, s\xF3 que \xE9 mais velho que qualquer relato escrito.", pages: ["Alguns acreditam que ele viu a funda\xE7\xE3o do Reino com os pr\xF3prios olhos.", "Alaric guardaria um cap\xEDtulo inteiro do Museu s\xF3 pra ele, se algum dia tivesse a chance.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Ancestral, Garra Lend\xE1ria, Dente do Tempo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Bestas (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "cao-selvagem-da-estrada", name: "C\xE3o Selvagem da Estrada", type: "besta", rarity: "comum", suggestedLevel: 2, habitat: "Estradas abertas entre regi\xF5es", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F415}\u200D\u{1F9BA}", description: "Segue viajantes por quil\xF4metros, sem nunca se aproximar demais.", pages: ["Alguns acreditam que j\xE1 foram c\xE3es dom\xE9sticos, h\xE1 gera\xE7\xF5es.", "Idris garante que um j\xE1 o seguiu pelo Reino inteiro.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Suja, Presa Pequena, Coleira Velha."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "viajante", npcNote: "Idris garante que um j\xE1 o seguiu pelo Reino inteiro.", travellerStoryId: "cao-sem-dono-que-sempre-aparece" } },
  { id: "coelho-das-colinas", name: "Coelho das Colinas", type: "besta", rarity: "comum", suggestedLevel: 1, habitat: "Tocas rasas nas encostas", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F407}", description: "Multiplica-se r\xE1pido demais pra qualquer fazendeiro controlar.", pages: ["Alguns consideram praga. Outros, sorte.", "Talia vende p\xE9-de-coelho na feira, sempre com a mesma hist\xF3ria duvidosa de origem.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Macia, Pata Traseira, Orelha Comprida."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "porco-espinho-do-bosque", name: "Porco-Espinho do Bosque", type: "besta", rarity: "comum", suggestedLevel: 1, habitat: "Sob folhas ca\xEDdas na floresta", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F994}", description: "Se enrola ao menor sinal de perigo, e espera.", pages: ["Raramente ataca \u2014 a defesa dele j\xE1 \xE9 suficiente.", "Crian\xE7as aprendem cedo a n\xE3o cutucar um, geralmente da pior forma poss\xEDvel.", "Poss\xEDveis drops (lore, n\xE3o implementado): Espinho Solto, Pelagem Curta, Casco Pequeno."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "gato-selvagem-da-vila", name: "Gato Selvagem da Vila", type: "besta", rarity: "comum", suggestedLevel: 2, habitat: "Telhados e becos da capital", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F408}\u200D\u2B1B", description: "Ignora praticamente todo mundo, com raras exce\xE7\xF5es.", pages: ["Alguns moradores juram que ele escolhe quem alimentar, n\xE3o o contr\xE1rio.", "Greta garante que ele prefere a Taverna a qualquer outro lugar da Capital.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Malhada, Garra Curta, Bigode Solto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "lince-das-colinas", name: "Lince das Colinas", type: "besta", rarity: "incomum", suggestedLevel: 5, habitat: "Encostas ao entardecer", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F406}", description: "Ca\xE7a sozinho, ao entardecer, quase sem ser visto.", pages: ["Pastores reconhecem o rastro antes de reconhecer o animal.", "Kade jura que treinaria com um, se conseguisse chegar perto o suficiente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Malhada, Garra Afiada, Presa Curva."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "javali-cinza-da-fronteira", name: "Javali Cinza da Fronteira", type: "besta", rarity: "incomum", suggestedLevel: 6, habitat: "Bordas entre regi\xF5es", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F417}", description: "Mais agressivo que o javali comum, e bem maior.", pages: ["Vive nas bordas entre regi\xF5es, nunca se estabelecendo de vez em nenhuma.", "Borin forjou uma lan\xE7a especial s\xF3 pra ca\xE7adores desse aqui.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa Longa, Couro Duro, Casco Rachado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "corvo-de-ferro", name: "Corvo-de-Ferro", type: "besta", rarity: "incomum", suggestedLevel: 5, habitat: "Telhados e torres da capital", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F426}\u200D\u2B1B", description: "Rouba qualquer coisa que brilhe, sem exce\xE7\xE3o.", pages: ["Talia j\xE1 perdeu moedas pra um mais de uma vez, e nunca recuperou.", "Alguns moradores deixam objetos brilhantes de prop\xF3sito, s\xF3 pra distra\xED-lo de outra coisa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pena Escura, Bico Afiado, Garra Pequena."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "capacete-penas-corvo", npcKey: "mercador", npcNote: "Talia j\xE1 perdeu moedas pra um corvo-de-ferro mais de uma vez, e nunca recuperou.", travellerStoryId: "corvo-que-conta-ate-tres" } },
  { id: "urso-pardo-da-fronteira-norte", name: "Urso-Pardo da Fronteira Norte", type: "besta", rarity: "raro", suggestedLevel: 9, habitat: "Territ\xF3rio extenso e isolado", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u{1F43B}", description: "Territ\xF3rio enorme, quase nunca cruzado por humanos.", pages: ["Guardas do Port\xE3o Norte o consideram o verdadeiro dono daquela fronteira.", "Roth garante que j\xE1 negociou passagem com um, \xE0 sua maneira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Densa, Garra Grossa, Presa Longa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "luvas-cacador-feras", npcKey: "guarda", npcNote: "Roth garante que j\xE1 negociou passagem com um, \xE0 sua maneira.", travellerStoryId: "urso-que-chora-a-noite" } },
  { id: "pantera-das-ruinas", name: "Pantera das Ru\xEDnas", type: "besta", rarity: "raro", suggestedLevel: 10, habitat: "Sombras entre as pedras antigas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F406}", description: "Ca\xE7a entre as pedras antigas, quase invis\xEDvel \xE0 noite.", pages: ["Exploradores aprenderam a checar as sombras duas vezes, sempre.", "Alaric acredita que ela vive ali h\xE1 gera\xE7\xF5es, adaptada ao ambiente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Escura, Garra Silenciosa, Presa Fina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "botas-cacador-feras", npcKey: "curador", npcNote: "Alaric acredita que ela vive ali h\xE1 gera\xE7\xF5es, adaptada ao ambiente." } },
  { id: "lobo-solitario-da-fortaleza", name: "Lobo Solit\xE1rio da Fortaleza", type: "besta", rarity: "raro", suggestedLevel: 11, habitat: "Arredores isolados da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F43A}", description: "Vive sozinho, longe de qualquer matilha conhecida.", pages: ["Ningu\xE9m sabe por que ele escolheu viver t\xE3o perto de um lugar como aquele.", "Alguns acreditam que ele protege algo, \xE0 sua pr\xF3pria maneira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Grisalha, Presa Longa, Olho Atento."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "o-urso-de-duas-cabecas", name: "O Urso de Duas Cabe\xE7as", type: "besta", rarity: "muito-raro", suggestedLevel: 16, habitat: "\xC1reas remotas das montanhas", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u{1F43B}", description: "Avistado poucas vezes, sempre \xE0 dist\xE2ncia segura.", pages: ["Alguns acreditam ser dois ursos muito pr\xF3ximos. Outros, algo diferente.", "Yannick tem um relato detalhado, mas nunca confirmado por mais ningu\xE9m.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Dupla, Garra Imensa, Presa Rara."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-lobo-que-nao-envelhece", name: "O Lobo Que N\xE3o Envelhece", type: "besta", rarity: "lendaria", suggestedLevel: 22, habitat: "Trechos profundos da floresta", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Visto em relatos que remontam a gera\xE7\xF5es passadas, sempre com a mesma descri\xE7\xE3o.", pages: ["Alguns acreditam que \xE9 sempre o mesmo lobo. Outros, uma linhagem inteira.", "Yannick dedicaria a vida inteira s\xF3 pra confirmar qual das teorias \xE9 verdadeira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Eterna, Presa Ancestral, Olho Dourado."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Humanoides (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "bandido-de-estrada", name: "Bandido de Estrada", type: "humanoide", rarity: "comum", suggestedLevel: 2, habitat: "Emboscadas em estradas abertas", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F5E1}\uFE0F", description: "Assalta viajantes desprevenidos, quase sempre em grupo.", pages: ["Alguns j\xE1 foram fazendeiros, antes de uma colheita ruim demais.", "Roth prende os mesmos rostos com frequ\xEAncia incomoda.", "Poss\xEDveis drops (lore, n\xE3o implementado): Faca Enferrujada, Bolsa Vazia, Capuz Surrado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "batedor-das-colinas", name: "Batedor das Colinas", type: "humanoide", rarity: "comum", suggestedLevel: 3, habitat: "Pontos altos com boa vis\xE3o", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F3F9}", description: "Observa viajantes de longe antes de decidir se aproxima ou n\xE3o.", pages: ["Vive isolado, evitando a Capital sempre que poss\xEDvel.", "Idris j\xE1 trocou informa\xE7\xF5es com um, em vez de lutar.", "Poss\xEDveis drops (lore, n\xE3o implementado): Arco Simples, Flecha Gasta, Capa Surrada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "pescador-renegado", name: "Pescador Renegado", type: "humanoide", rarity: "comum", suggestedLevel: 2, habitat: "Trechos afastados da costa", regionId: "litoral-quebrado", dangerLevel: "baixa", icon: "\u{1F3A3}", description: "Rouba peixe de redes alheias, quando ningu\xE9m est\xE1 olhando.", pages: ["Foi expulso da vila por um motivo que ningu\xE9m quer repetir.", "Alguns pescadores locais j\xE1 deixam peixe de prop\xF3sito, s\xF3 pra ele ir embora.", "Poss\xEDveis drops (lore, n\xE3o implementado): Rede Rasgada, Faca de Pesca, Chap\xE9u Surrado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "vagabundo-das-ruinas", name: "Vagabundo das Ru\xEDnas", type: "humanoide", rarity: "comum", suggestedLevel: 3, habitat: "Entre as pedras das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F97E}", description: "Vive entre as pedras, evitando contato com qualquer grupo.", pages: ["Alguns acreditam que ele sabe mais sobre as Ru\xEDnas do que qualquer estudioso.", "Alaric j\xE1 tentou conversar com um. A conversa n\xE3o durou muito.", "Poss\xEDveis drops (lore, n\xE3o implementado): Farrapo, Faca Cega, Saco Vazio."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "mercenario-sem-bandeira", name: "Mercen\xE1rio Sem Bandeira", type: "humanoide", rarity: "incomum", suggestedLevel: 6, habitat: "Onde houver pagamento", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u2694\uFE0F", description: "Luta por quem pagar mais, sem lealdade fixa a ningu\xE9m.", pages: ["Alguns j\xE1 trabalharam pra mais de um Reino ao mesmo tempo, sem contar pra nenhum dos dois.", "Kade recusa duelo com eles, por princ\xEDpio.", "Poss\xEDveis drops (lore, n\xE3o implementado): Espada Gasta, Armadura Remendada, Bolsa de Moedas."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "mestreArena", npcNote: "Kade recusa duelo com eles, por princ\xEDpio." } },
  { id: "cacador-de-recompensas", name: "Ca\xE7ador de Recompensas", type: "humanoide", rarity: "incomum", suggestedLevel: 7, habitat: "Rotas comerciais e cidades pequenas", regionId: "planicie-dourada", dangerLevel: "alta", icon: "\u{1F3AF}", description: "Persegue alvos por regi\xF5es inteiras, sem desistir f\xE1cil.", pages: ["Alguns confundem com Guarda, at\xE9 perceberem que n\xE3o seguem regra nenhuma.", "Roth j\xE1 teve que negociar limites com mais de um.", "Poss\xEDveis drops (lore, n\xE3o implementado): Corda Resistente, Marca de Procurado, Adaga Curva."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "eremita-das-montanhas", name: "Eremita das Montanhas", type: "humanoide", rarity: "incomum", suggestedLevel: 6, habitat: "Cabanas isoladas nas alturas", regionId: "picos-congelados", dangerLevel: "media", icon: "\u{1F9D9}", description: "Vive sozinho, h\xE1 tanto tempo que esqueceu como conversar direito.", pages: ["Alguns exploradores relatam conselhos estranhos, mas surpreendentemente \xFAteis.", "Zoltar acredita que ele sabe mais de alquimia do que qualquer alquimista da Capital.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cajado Torto, Manto Pu\xEDdo, Frasco Vazio."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guerreiro-esquecido-das-ruinas", name: "Guerreiro Esquecido das Ru\xEDnas", type: "humanoide", rarity: "raro", suggestedLevel: 11, habitat: "Postos avan\xE7ados de um ex\xE9rcito extinto", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2694\uFE0F", description: "Ainda usa uma armadura de um ex\xE9rcito que n\xE3o existe mais.", pages: ["Ningu\xE9m sabe se ele sabe que a guerra dele j\xE1 acabou.", "Alaric j\xE1 tentou explicar. N\xE3o teve certeza se foi entendido.", "Poss\xEDveis drops (lore, n\xE3o implementado): Armadura Antiga, Espada Cega, Emblema Desconhecido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "xama-da-tribo-perdida", name: "Xam\xE3 da Tribo Perdida", type: "humanoide", rarity: "raro", suggestedLevel: 12, habitat: "Clareiras profundas da floresta", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1FAB6}", description: "Fala com animais que ningu\xE9m mais consegue se aproximar.", pages: ["Alguns acreditam que a tribo dele desapareceu h\xE1 gera\xE7\xF5es, deixando s\xF3 ele.", "Yannick tentaria estud\xE1-lo a vida inteira, se ele permitisse.", "Poss\xEDveis drops (lore, n\xE3o implementado): Colar de Ossos, Cajado Emplumado, Pele Pintada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "erudito", npcNote: "Yannick tentaria estud\xE1-lo a vida inteira, se ele permitisse." } },
  { id: "cavaleiro-sem-reino", name: "Cavaleiro Sem Reino", type: "humanoide", rarity: "raro", suggestedLevel: 13, habitat: "Passagens esquecidas da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F6E1}\uFE0F", description: "Ainda usa um bras\xE3o que ningu\xE9m reconhece mais.", pages: ["Alguns acreditam que o Reino dele caiu h\xE1 muito tempo, e ele nunca soube.", "Alaric adoraria identificar o bras\xE3o, sem sucesso at\xE9 agora.", "Poss\xEDveis drops (lore, n\xE3o implementado): Bras\xE3o Desconhecido, Espada Nobre, Elmo Riscado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "o-mensageiro-que-nunca-chega", name: "O Mensageiro Que Nunca Chega", type: "humanoide", rarity: "muito-raro", suggestedLevel: 17, habitat: "Estradas abertas, sempre em tr\xE2nsito", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F4DC}", description: "Sempre a caminho de algum lugar, nunca visto duas vezes no mesmo ponto.", pages: ["Alguns acreditam que ele carrega uma mensagem h\xE1 d\xE9cadas, sem nunca entregar.", "Ningu\xE9m sabe pra quem \xE9 a mensagem, nem o que ela diz.", "Poss\xEDveis drops (lore, n\xE3o implementado): Selo Lacrado, Carta N\xE3o Entregue, Bota Gasta."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-ultimo-soldado", name: "O \xDAltimo Soldado", type: "humanoide", rarity: "lendaria", suggestedLevel: 24, habitat: "Posto avan\xE7ado esquecido da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u2694\uFE0F", description: "Ainda defende um posto de uma guerra que terminou h\xE1 gera\xE7\xF5es.", pages: ["Nenhum registro confirma de que lado ele lutava, originalmente.", "Alaric acredita que identific\xE1-lo resolveria um mist\xE9rio inteiro do Museu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Armadura de Comando, Espada Hist\xF3rica, Estandarte Perdido."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Aberrações (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "rato-de-duas-caudas", name: "Rato de Duas Caudas", type: "aberracao", rarity: "comum", suggestedLevel: 2, habitat: "T\xFAneis e galerias escuras", regionId: "minas-abandonadas", dangerLevel: "baixa", icon: "\u{1F400}", description: "Nasce assim, sem explica\xE7\xE3o conhecida.", pages: ["Alguns mineiros acreditam que d\xE1 sorte encontrar um. Outros, o oposto.", "Yannick j\xE1 catalogou mais de uma dezena de casos parecidos.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cauda Extra, Pelagem Rala, Dente Torto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sapo-de-olhos-multiplos", name: "Sapo de Olhos M\xFAltiplos", type: "aberracao", rarity: "comum", suggestedLevel: 3, habitat: "\xC1gua parada e lodosa", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F438}", description: "Enxerga em praticamente todas as dire\xE7\xF5es ao mesmo tempo.", pages: ["Alguns acreditam que \xE9 resultado de algo na \xE1gua do p\xE2ntano.", "Ningu\xE9m consegue se aproximar de surpresa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Olho Extra, Pele Viscosa, L\xEDngua El\xE1stica."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "verme-de-pedra", name: "Verme de Pedra", type: "aberracao", rarity: "comum", suggestedLevel: 3, habitat: "Dentro de rochas s\xF3lidas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1FAB1}", description: "Se move dentro de rochas s\xF3lidas, deixando t\xFAneis perfeitos.", pages: ["Ningu\xE9m entende como ele consegue perfurar pedra t\xE3o facilmente.", "Alguns pastores usam os t\xFAneis dele como atalho, quando d\xE1 certo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Segmento P\xE9treo, P\xF3 de Pedra, Baba Mineral."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "planta-carnivora-ana", name: "Planta Carn\xEDvora An\xE3", type: "aberracao", rarity: "comum", suggestedLevel: 2, habitat: "Solo \xFAmido sob a copa das \xE1rvores", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F331}", description: "Pequena demais pra ser perigosa, mas insiste em tentar.", pages: ["Alguns viajantes j\xE1 perderam um dedo de luva pra uma, por descuido.", "Idris jura que uma tentou comer sua bota inteira.", "Poss\xEDveis drops (lore, n\xE3o implementado): P\xE9tala Afiada, Seiva Grudenta, Raiz Retorcida."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "sombra-com-dentes", name: "Sombra com Dentes", type: "aberracao", rarity: "incomum", suggestedLevel: 7, habitat: "Corredores sem qualquer luz", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F464}", description: "Some completamente na escurid\xE3o, s\xF3 os dentes ficam vis\xEDveis.", pages: ["Guardas evitam corredores sem luz por causa dela, especificamente.", "Ningu\xE9m sabe se ela realmente morde, ou s\xF3 assusta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Dente Flutuante, Sombra Densa, Escurid\xE3o Presa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "fungo-pensante", name: "Fungo Pensante", type: "aberracao", rarity: "incomum", suggestedLevel: 6, habitat: "Troncos podres no p\xE2ntano", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F344}", description: "Reage a quem se aproxima, de um jeito que parece decis\xE3o, n\xE3o instinto.", pages: ["Yannick acredita que ele se comunica de alguma forma com outros fungos pr\xF3ximos.", "Alguns juram que ele muda de cor quando algu\xE9m mente perto dele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Esporo Denso, Cogumelo Pulsante, Raiz F\xFAngica."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "criatura-de-areia-movedica", name: "Criatura de Areia Movedi\xE7a", type: "aberracao", rarity: "incomum", suggestedLevel: 7, habitat: "Dunas inst\xE1veis", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F3DC}\uFE0F", description: "Se forma e desmancha na areia, sem forma fixa.", pages: ["Viajantes aprenderam a nunca confiar em dunas 'estranhamente perfeitas'.", "Zoltar acredita que ela \xE9 feita de vidro derretido misturado com areia comum.", "Poss\xEDveis drops (lore, n\xE3o implementado): Areia Compacta, N\xFAcleo Inst\xE1vel, Vidro Fundido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "serpente-de-vidro-menor", name: "Serpente de Vidro Menor", type: "aberracao", rarity: "raro", suggestedLevel: 10, habitat: "Sob a areia vitrificada", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F40D}", description: "Move-se sem deixar rastro, cortando a areia como \xE1gua.", pages: ["Ningu\xE9m sabe explicar como ela respira, ou se precisa.", "Zoltar tem uma teoria inteira, mas admite que \xE9 s\xF3 teoria.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama de Vidro, Presa Afiada, Veneno Cristalizado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "luvas-deserto-vidro", npcKey: "alquimista", npcNote: "Zoltar tem uma teoria inteira sobre como ela respira, mas admite que \xE9 s\xF3 teoria." } },
  { id: "olho-flutuante-das-ruinas", name: "Olho Flutuante das Ru\xEDnas", type: "aberracao", rarity: "raro", suggestedLevel: 11, habitat: "Corredores altos das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F441}\uFE0F", description: "Flutua sozinho, observando tudo, sem corpo vis\xEDvel.", pages: ["Alguns exploradores relatam ter sido observados por dias, sem entender por qu\xEA.", "Alaric se recusa a manter um catalogado por muito tempo perto de si.", "Poss\xEDveis drops (lore, n\xE3o implementado): \xCDris Flutuante, Membrana Fina, Fluido Viscoso."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "a-voz-sem-rosto", name: "A Voz Sem Rosto", type: "aberracao", rarity: "muito-raro", suggestedLevel: 17, habitat: "Profundezas sem luz da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F52E}", description: "Ningu\xE9m sabe descrever exatamente o que \xE9, s\xF3 o que sente perto dele.", pages: ["Todo relato sobre ela \xE9 vago, como se a pr\xF3pria mem\xF3ria se recusasse a guardar detalhes.", "Zoltar se recusa terminantemente a falar sobre essa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento Inomin\xE1vel, Eco Distorcido, Sombra Densa."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "a-coisa-entre-as-pedras", name: "A Coisa Entre as Pedras", type: "aberracao", rarity: "muito-raro", suggestedLevel: 18, habitat: "Dentro da rocha s\xF3lida", regionId: "colinas-aridas", dangerLevel: "letal", icon: "\u{1FAA8}", description: "Vive literalmente dentro da rocha s\xF3lida, aparecendo s\xF3 por rachaduras.", pages: ["Alguns acreditam que ela esteve ali antes das pr\xF3prias colinas se formarem.", "Yannick tem pesadelos recorrentes desde que estudou o caso de perto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento Vivo, Pedra Pulsante, P\xF3 Estranho."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-que-nao-deveria-existir", name: "O Que N\xE3o Deveria Existir", type: "aberracao", rarity: "lendaria", suggestedLevel: 26, habitat: "Profundezas do deserto vitrificado", regionId: "deserto-de-vidro", dangerLevel: "letal", icon: "\u{1F441}\uFE0F", description: "Nenhuma descri\xE7\xE3o confi\xE1vel concorda em nada, exceto que ele existe.", pages: ["Cada estudioso que j\xE1 se aproximou o suficiente descreve algo completamente diferente.", "Alaric se recusa terminantemente a abrir uma exposi\xE7\xE3o sobre ele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento Imposs\xEDvel, Amostra Inst\xE1vel, Vest\xEDgio Inexplic\xE1vel."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ============================================================
  // Sprint Wolves Ecosystem (Phase I) — 8 variantes de lobos, aprofundando
  // o ecossistema já existente (Lobos Cinzentos, Lobo Solitário da
  // Fortaleza, O Lobo Que Não Envelhece). Cada uma conectada a um item,
  // NPC, rumor, história de viajante e/ou livro reais, criados nesta
  // mesma Sprint.
  // ============================================================
  { id: "lobo-alfa", name: "Lobo Alfa", type: "besta", rarity: "raro", suggestedLevel: 14, habitat: "Cora\xE7\xE3o da matilha, no centro do bosque", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Lidera a matilha sem precisar provar isso duas vezes.", pages: ["Raramente entra em combate direto \u2014 a matilha inteira se move para proteg\xEA-lo primeiro.", "Borin jura que o couro de um Alfa \xE9 quase imposs\xEDvel de conseguir sem rasgos.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa do Alfa, Pelagem de L\xEDder, Garra Dominante."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "presa-do-alfa", npcKey: "ferreiro", npcNote: "Borin jura que o couro de um Alfa \xE9 quase imposs\xEDvel de conseguir sem rasgos.", rumor: "Contam que o Lobo Alfa s\xF3 aparece pra quem j\xE1 enfrentou a matilha inteira e sobreviveu.", travellerStoryId: "uivo-que-lidera", bookId: "tratado-da-matilha" } },
  { id: "loba-prateada", name: "Loba Prateada", type: "besta", rarity: "raro", suggestedLevel: 13, habitat: "Trilhas afastadas da matilha principal", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Ca\xE7a sozinha, longe da matilha, sempre retornando antes do amanhecer.", pages: ["N\xE3o \xE9 subordinada ao Alfa \u2014 opera por conta pr\xF3pria, por escolha.", "Yannick descreve a pelagem dela como quase brilhante sob luar, mesmo depois de curtida.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Prateada, Presa Curva, Olho Claro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "manto-da-loba-prateada", npcKey: "erudito", npcNote: "Yannick descreve a pelagem dela como quase brilhante sob luar, mesmo depois de curtida.", travellerStoryId: "loba-que-anda-sozinha", bookId: "tratado-da-matilha" } },
  { id: "filhote-de-lobo-perdido", name: "Filhote de Lobo Perdido", type: "besta", rarity: "comum", suggestedLevel: 2, habitat: "Bordas do bosque, longe da matilha", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F43A}", description: "Separado da matilha, ainda aprendendo a sobreviver sozinho.", pages: ["Um dos poucos lobos que se aproxima de humanos sem hostilidade.", "Greta jura guardar uma presa de lobo h\xE1 anos \u2014 talvez a dele mesmo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa de Leite, Pelagem Macia, Coleira Improvisada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "coleira-do-filhote-perdido", npcKey: "taverneira", npcNote: "Greta jura guardar uma presa de lobo h\xE1 anos \u2014 talvez a dele mesmo.", rumor: "Dizem que um filhote de lobo foi visto sozinho perto da Capital. Ningu\xE9m teve coragem de se aproximar.", travellerStoryId: "filhote-que-seguiu-um-viajante" } },
  { id: "lobo-das-colinas-aridas", name: "Lobo das Colinas \xC1ridas", type: "besta", rarity: "comum", suggestedLevel: 4, habitat: "Encostas secas, longe de qualquer matilha grande", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F43A}", description: "Ca\xE7a sozinho \u2014 a terra ali n\xE3o sustenta uma matilha inteira.", pages: ["Mais magro que o lobo do Bosque, adaptado \xE0 escassez de presas.", "Idris j\xE1 cruzou com um duas vezes na mesma travessia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Seca, Garra Fina, Presa Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "botas-de-pelagem-seca", npcKey: "viajante", npcNote: "Idris j\xE1 cruzou com um lobo das Colinas \xC1ridas duas vezes na mesma travessia.", travellerStoryId: "lobos-que-nao-cacam-em-bando" } },
  { id: "lobo-do-pantano", name: "Lobo do P\xE2ntano", type: "besta", rarity: "incomum", suggestedLevel: 7, habitat: "Trilhas alagadas do p\xE2ntano", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F43A}", description: "Atravessa \xE1gua parada como se fosse ch\xE3o firme.", pages: ["Adaptou-se \xE0 \xE1gua melhor que qualquer outro lobo do Reino.", "Idris afirma que os lobos daqui nadam melhor do que ca\xE7am.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Encharcada, Garra Molhada, Presa Escorregadia."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "manto-de-pelagem-encharcada", npcKey: "viajante", npcNote: "Idris afirma que os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am.", rumor: "Um viajante afirma que os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am.", travellerStoryId: "lobo-que-nada-no-pantano" } },
  { id: "lobo-de-presas-de-gelo", name: "Lobo de Presas de Gelo", type: "besta", rarity: "raro", suggestedLevel: 12, habitat: "Fendas nevadas nos picos", regionId: "picos-congelados", dangerLevel: "alta", icon: "\u{1F43A}", description: "Suas presas parecem refletir a luz da lua, como gelo puro.", pages: ["Exploradores relatam avistamentos breves, sempre \xE0 dist\xE2ncia segura.", "Yannick nunca conseguiu confirmar se as presas realmente brilham, ou se \xE9 s\xF3 a neve.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa Gelada, Pelagem Congelada, Garra Cristalina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "elmo-de-presas-de-gelo", npcKey: "erudito", npcNote: "Yannick nunca conseguiu confirmar se as presas realmente brilham, ou se \xE9 s\xF3 a neve.", rumor: "Contam que existe um lobo nos Picos Congelados com presas que brilham como gelo puro.", travellerStoryId: "presas-que-brilham-na-neve" } },
  { id: "matilha-faminta", name: "Matilha Faminta", type: "besta", rarity: "incomum", suggestedLevel: 9, habitat: "Trechos densos do bosque, longe de presa f\xE1cil", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Cerca em sil\xEAncio absoluto, sem o uivo de aviso de costume.", pages: ["O encontro mais perigoso de todos, precisamente porque n\xE3o avisa.", "Borin recusa forjar armadilhas pra lobo. Diz que n\xE3o \xE9 esse tipo de ferreiro.", "Poss\xEDveis drops (lore, n\xE3o implementado): Garras de Matilha, Pelagem \xC1spera, Presa Rachada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "garras-de-matilha", npcKey: "ferreiro", npcNote: "Borin recusa forjar armadilhas pra lobo. Diz que n\xE3o \xE9 esse tipo de ferreiro.", travellerStoryId: "matilha-que-cerca-em-silencio" } },
  { id: "o-lobo-marcado", name: "O Lobo Marcado", type: "besta", rarity: "muito-raro", suggestedLevel: 19, habitat: "Trechos mais profundos do bosque", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Magro, cicatrizado, imposs\xEDvel de encurralar.", pages: ["Alguns ca\xE7adores juram reconhecer sempre o mesmo lobo, marcado no focinho.", "Idris jura ter visto o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Marcada, Presa Rachada, Garra Antiga."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado", connections: { npcKey: "viajante", npcNote: "Idris jura ter visto o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia.", rumor: "Dizem que existe um lobo t\xE3o velho que j\xE1 foi visto pela av\xF3 de quem conta a hist\xF3ria agora.", travellerStoryId: "lobo-com-cicatriz-no-focinho" } }
];

// apps/web/src/components/bestiary/CreatureCatalog.tsx
var import_react10 = __toESM(require_react(), 1);
var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL2 = {
  bloqueado: "\u{1F512} Bloqueado",
  visto: "\u{1F441}\uFE0F Visto",
  estudado: "\u{1F4D7} Estudado"
};
var KNOWLEDGE_STATUS2 = {
  bloqueado: "LOCKED" /* Locked */,
  visto: "DISCOVERED" /* Discovered */,
  estudado: "READ" /* Read */
};
var DANGER_LEVELS = ["baixa", "media", "alta", "letal"];
function CreatureCatalog({ creatures, selectedCreatureId, onSelectCreature }) {
  const [query, setQuery] = (0, import_react10.useState)("");
  const [type, setType] = (0, import_react10.useState)(null);
  const [danger, setDanger] = (0, import_react10.useState)(null);
  const filtered = (0, import_react10.useMemo)(() => {
    const entries = creatures.map((creature) => ({
      id: creature.id,
      source: "bestiario",
      title: creature.name,
      category: creature.type,
      status: KNOWLEDGE_STATUS2[creature.status],
      dangerLevel: creature.dangerLevel,
      searchText: creature.locked ? "" : creature.name
    }));
    const matched = filterKnowledge(searchKnowledge(entries, query), [
      { select: (e) => e.category, value: type },
      { select: (e) => e.dangerLevel, value: danger }
    ]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return creatures.filter((creature) => matchedIds.has(creature.id));
  }, [creatures, query, type, danger]);
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo nome...", children: /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("div", { className: "creature-filters", children: [
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          CodexFilter,
          {
            allLabel: "Todos os tipos",
            selected: type,
            onSelect: (value) => setType(value),
            options: CREATURE_TYPES.map((t) => ({ value: t.slug, label: `${t.icon} ${t.label}` }))
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          CodexFilter,
          {
            allLabel: "Qualquer periculosidade",
            selected: danger,
            onSelect: (value) => setDanger(value),
            options: DANGER_LEVELS.map((d) => ({ value: d, label: DANGER_LABEL[d] }))
          }
        ) })
      ] }) }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhuma criatura encontrada.",
      children: filtered.map((creature) => {
        const type2 = CREATURE_TYPES.find((t) => t.slug === creature.type);
        return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          CodexCard,
          {
            variant: "creature",
            icon: creature.locked ? "\u2754" : creature.icon,
            title: creature.locked ? "Criatura desconhecida" : creature.name,
            meta: `${type2?.label ?? creature.type} \xB7 Periculosidade ${DANGER_LABEL[creature.dangerLevel]}`,
            statusLabel: STATUS_LABEL2[creature.status],
            locked: creature.locked,
            selected: creature.id === selectedCreatureId,
            onSelect: () => onSelectCreature(creature.id)
          },
          creature.id
        );
      })
    }
  );
}

// apps/web/src/components/bestiary/CreatureReader.tsx
var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
function CreatureReader({ creature }) {
  const type = creature ? CREATURE_TYPES.find((t) => t.slug === creature.type) : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
    CodexReader,
    {
      isEmpty: !creature,
      emptyMessage: "Escolha uma criatura no cat\xE1logo ao lado.",
      locked: creature?.locked ?? false,
      lockedTitle: "Criatura desconhecida",
      lockedMessage: "\u{1F512} Este registro ainda est\xE1 bloqueado.",
      unlockCondition: creature?.unlockCondition ?? "",
      icon: creature?.icon,
      title: creature?.name ?? "",
      subtitle: type?.label ?? creature?.type,
      description: creature?.description ?? "",
      facts: creature ? [
        { label: "Habitat", value: creature.habitat },
        { label: "Regi\xE3o", value: getRegionName2(creature.regionId) },
        { label: "Periculosidade", value: DANGER_LABEL[creature.dangerLevel] }
      ] : [],
      pages: creature?.pages ?? []
    }
  );
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
function BestiaryBuilding() {
  const [selectedCreatureId, setSelectedCreatureId] = (0, import_react11.useState)(null);
  const selectedCreature = CREATURES.find((creature) => creature.id === selectedCreatureId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("h2", { children: "\u{1F52C} Besti\xE1rio" }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(NpcIntro, { npc: NPCS.erudito }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("p", { className: "hint", children: "Um registro de tudo que j\xE1 foi visto \u2014 e do pouco que j\xE1 foi entendido." }),
    /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
          CreatureCatalog,
          {
            creatures: CREATURES,
            selectedCreatureId,
            onSelectCreature: setSelectedCreatureId
          }
        ),
        reader: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(CreatureReader, { creature: selectedCreature }, selectedCreature?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/components/city/MuseumBuilding.tsx
var import_react13 = __toESM(require_react(), 1);

// apps/web/src/lib/museum.ts
var MUSEUM_CATEGORIES = [
  { slug: "grandes-herois", label: "Grandes Her\xF3is", icon: "\u{1F9B8}" },
  { slug: "grandes-bosses", label: "Grandes Bosses", icon: "\u{1F432}" },
  { slug: "grandes-descobertas", label: "Grandes Descobertas", icon: "\u{1F50E}" },
  { slug: "reliquias-historicas", label: "Rel\xEDquias Hist\xF3ricas", icon: "\u{1F3FA}" },
  { slug: "primeiros-aventureiros", label: "Primeiros Aventureiros", icon: "\u{1F947}" },
  { slug: "fundacao-do-reino", label: "Funda\xE7\xE3o do Reino", icon: "\u{1F3F0}" },
  { slug: "grandes-tragedias", label: "Grandes Trag\xE9dias", icon: "\u{1F56F}\uFE0F" },
  { slug: "grandes-conquistas", label: "Grandes Conquistas", icon: "\u{1F3C6}" },
  { slug: "monumentos", label: "Monumentos", icon: "\u{1F5FF}" },
  { slug: "misterios", label: "Mist\xE9rios", icon: "\u{1F52E}" }
];
var MUSEUM_STATUS_LABEL = {
  bloqueado: "\u{1F512} Bloqueado",
  conhecido: "\u{1F4D8} Conhecido",
  registrado: "\u2705 Registrado"
};
var PLACEHOLDER_PAGES3 = [
  "**Este registro ainda est\xE1 sendo compilado.**\n\nO Curador continua reunindo relatos e evid\xEAncias antes de fechar a exposi\xE7\xE3o.",
  "*Registro em desenvolvimento...*\n\nVolte ao Museu em outra ocasi\xE3o.",
  "**Fim do registro conhecido.**\n\nO restante desta hist\xF3ria ainda n\xE3o foi documentado."
];
var MUSEUM_ENTRIES = [
  {
    id: "a-fundacao-do-reino",
    title: "A Funda\xE7\xE3o do Reino",
    category: "fundacao-do-reino",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "registrado",
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    icon: "\u{1F3F0}",
    year: "Ano 1 do Reino",
    author: "Curador Alaric"
  },
  {
    id: "o-primeiro-boss",
    title: "O Primeiro Boss",
    category: "grandes-bosses",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "conhecido",
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    icon: "\u{1F432}",
    year: "Ano 3 do Reino",
    author: "Curador Alaric"
  },
  {
    id: "a-ponte-antiga",
    title: "A Ponte Antiga",
    category: "monumentos",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "conhecido",
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    icon: "\u{1F5FF}",
    year: "Desconhecido",
    author: "Curador Alaric"
  },
  {
    id: "o-grande-incendio",
    title: "O Grande Inc\xEAndio",
    category: "grandes-tragedias",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "\u{1F56F}\uFE0F",
    year: "Desconhecido",
    author: "Curador Alaric"
  },
  {
    id: "o-explorador-desconhecido",
    title: "O Explorador Desconhecido",
    category: "primeiros-aventureiros",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "\u{1F947}",
    year: "Desconhecido",
    author: "Curador Alaric"
  }
];

// apps/web/src/components/museum/MuseumShelf.tsx
var import_react12 = __toESM(require_react(), 1);
var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
var STATUS_OPTIONS = ["bloqueado", "conhecido", "registrado"];
var KNOWLEDGE_STATUS3 = {
  bloqueado: "LOCKED" /* Locked */,
  conhecido: "DISCOVERED" /* Discovered */,
  registrado: "READ" /* Read */
};
function MuseumShelf({ entries, selectedEntryId, onSelectEntry }) {
  const [query, setQuery] = (0, import_react12.useState)("");
  const [category, setCategory] = (0, import_react12.useState)(null);
  const [year, setYear] = (0, import_react12.useState)(null);
  const [status, setStatus] = (0, import_react12.useState)(null);
  const years = (0, import_react12.useMemo)(() => Array.from(new Set(entries.map((entry) => entry.year))), [entries]);
  const filtered = (0, import_react12.useMemo)(() => {
    const knowledgeEntries = entries.map((entry) => ({
      id: entry.id,
      source: "museu",
      title: entry.title,
      category: entry.category,
      status: KNOWLEDGE_STATUS3[entry.status],
      domainStatus: entry.status,
      year: entry.year,
      searchText: entry.locked ? "" : entry.title
    }));
    const matched = filterKnowledge(searchKnowledge(knowledgeEntries, query), [
      { select: (e) => e.category, value: category },
      { select: (e) => e.domainStatus, value: status },
      { select: (e) => e.year, value: year }
    ]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return entries.filter((entry) => matchedIds.has(entry.id));
  }, [entries, query, category, year, status]);
  return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: [
        /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(CodexCategoryList, { categories: MUSEUM_CATEGORIES, selected: category, onSelect: setCategory, allLabel: "Todas as alas" }),
        /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("div", { className: "creature-filters", children: [
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
            CodexFilter,
            {
              allLabel: "Qualquer status",
              selected: status,
              onSelect: (value) => setStatus(value),
              options: STATUS_OPTIONS.map((option) => ({ value: option, label: MUSEUM_STATUS_LABEL[option] }))
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
            CodexFilter,
            {
              allLabel: "Qualquer ano",
              selected: year,
              onSelect: setYear,
              options: years.map((y) => ({ value: y, label: y }))
            }
          ) })
        ] })
      ] }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhum registro encontrado.",
      children: filtered.map((entry) => {
        const category2 = MUSEUM_CATEGORIES.find((c) => c.slug === entry.category);
        return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          CodexCard,
          {
            icon: entry.locked ? "\u2754" : entry.icon,
            title: entry.locked ? "Registro desconhecido" : entry.title,
            meta: `${category2?.icon ?? "\u{1F3DB}\uFE0F"} ${category2?.label ?? entry.category} \xB7 ${entry.year}`,
            statusLabel: MUSEUM_STATUS_LABEL[entry.status],
            locked: entry.locked,
            selected: entry.id === selectedEntryId,
            onSelect: () => onSelectEntry(entry.id)
          },
          entry.id
        );
      })
    }
  );
}

// apps/web/src/components/museum/MuseumReader.tsx
var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
function MuseumReader({ entry }) {
  const category = entry ? MUSEUM_CATEGORIES.find((c) => c.slug === entry.category) : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
    CodexReader,
    {
      isEmpty: !entry,
      emptyMessage: "Escolha um registro na estante ao lado.",
      locked: entry?.locked ?? false,
      lockedTitle: "Registro desconhecido",
      lockedMessage: "\u{1F512} Este registro ainda est\xE1 bloqueado.",
      unlockCondition: entry?.unlockCondition ?? "",
      icon: entry?.icon,
      title: entry?.title ?? "",
      subtitle: entry ? `Por ${entry.author} \xB7 ${entry.year}` : void 0,
      description: entry?.description ?? "",
      facts: entry ? [
        { label: "Ala", value: category?.label ?? entry.category },
        { label: "Ano", value: entry.year }
      ] : [],
      pages: entry?.pages ?? []
    }
  );
}

// apps/web/src/components/city/MuseumBuilding.tsx
var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
function MuseumBuilding() {
  const [selectedEntryId, setSelectedEntryId] = (0, import_react13.useState)(null);
  const selectedEntry = MUSEUM_ENTRIES.find((entry) => entry.id === selectedEntryId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h2", { children: "\u{1F5BC}\uFE0F Museu do Reino" }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(NpcIntro, { npc: NPCS.curador }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "hint", children: "Onde a hist\xF3ria da comunidade fica registrada \u2014 parte dela, ao menos." }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(MuseumShelf, { entries: MUSEUM_ENTRIES, selectedEntryId, onSelectEntry: setSelectedEntryId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(MuseumReader, { entry: selectedEntry }, selectedEntry?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/components/tavern/TavernRumor.tsx
var import_react14 = __toESM(require_react(), 1);

// apps/web/src/lib/tavern.ts
var TAVERN_RUMORS = [
  "Disseram que um aventureiro voltou vivo das Ru\xEDnas Esquecidas.",
  "O Ferreiro jurou que algu\xE9m tentou afiar uma colher.",
  "Ningu\xE9m sabe quem continua roubando as ma\xE7\xE3s da pra\xE7a.",
  "O Guarda diz que ouviu passos na muralha durante a madrugada.",
  "Dizem que a Bibliotec\xE1ria dorme l\xE1 dentro h\xE1 tr\xEAs dias.",
  "Um viajante jura ter visto luzes no P\xE2ntano Podre \xE0 noite.",
  "Algu\xE9m trocou o sino da torre por um mais desafinado. Ningu\xE9m confessa.",
  "O po\xE7o da Vila do Bosque continua sem fundo, dizem os mais teimosos.",
  "Um cavalo apareceu na pra\xE7a sem dono. Ningu\xE9m reclamou o cavalo.",
  "Contam que um explorador voltou de Picos Congelados falando s\xF3 em rimas.",
  "O Tesoureiro jura que contou o mesmo Gold duas vezes essa semana.",
  "Uma crian\xE7a jura ter visto um drag\xE3o. Era uma nuvem grande.",
  "Algu\xE9m deixou uma carta sem assinatura na Guilda. Ningu\xE9m a leu at\xE9 o fim.",
  "Dizem que o Deserto de Vidro engoliu mais uma bota essa semana.",
  "Um mercador afirma ter vendido a mesma espada tr\xEAs vezes para o mesmo homem.",
  "Ouviram cantoria vindo da Fortaleza Sombria. Ningu\xE9m foi conferir.",
  "Um aventureiro trocou seu escudo por um chap\xE9u. Ningu\xE9m entendeu por qu\xEA.",
  "Dizem que o Ferreiro fala sozinho enquanto forja. Ele nega.",
  // Sprint Wolves Ecosystem (Phase I) — 15 rumores sobre os Lobos do
  // Bosque Sussurrante e variantes regionais.
  "Borin jura que um lobo j\xE1 roeu o cabo de um martelo esquecido do lado de fora da forja.",
  "Dizem que a matilha do Bosque Sussurrante cresceu \u2014 ningu\xE9m sabe contar quantos s\xE3o de verdade.",
  "Um ca\xE7ador voltou sem uma bota e sem explica\xE7\xE3o. S\xF3 disse 'foi um lobo' e n\xE3o quis falar mais.",
  "Greta guarda uma presa de lobo debaixo do balc\xE3o. Ningu\xE9m sabe desde quando, nem por qu\xEA.",
  "Idris jura ter visto o mesmo lobo em duas regi\xF5es diferentes, no mesmo dia.",
  "Contam que o Lobo Alfa s\xF3 aparece pra quem j\xE1 enfrentou a matilha inteira e sobreviveu.",
  "Um fazendeiro das Colinas \xC1ridas culpa os lobos por todo galinheiro vazio, mesmo quando a raposa \xE9 mais prov\xE1vel.",
  "Yannick tem um caderno s\xF3 de rastros de lobo, catalogados por tamanho da pegada.",
  "Dizem que um filhote de lobo foi visto sozinho perto da Capital. Ningu\xE9m teve coragem de se aproximar.",
  "Um viajante afirma que os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am.",
  "Contam que existe um lobo nos Picos Congelados com presas que brilham como gelo puro.",
  "Borin recusa forjar armadilhas pra lobo. Diz que n\xE3o \xE9 esse tipo de ferreiro.",
  "Uma crian\xE7a jura ter dado comida pra um lobo e ele simplesmente foi embora, sem atacar.",
  "Dizem que existe um lobo t\xE3o velho que j\xE1 foi visto pela av\xF3 de quem conta a hist\xF3ria agora.",
  "Algu\xE9m ouviu uivos vindos de tr\xEAs dire\xE7\xF5es diferentes na mesma noite, no Bosque Sussurrante."
];
var TAVERN_CONVERSATIONS = [
  ["Aquele lobo parecia menor quando eu contei a hist\xF3ria.", "Foi o lobo que ficou maior."],
  [
    "Quem foi o maluco que enfrentou um Boss usando Luvas Rasgadas?",
    "Ele venceu.",
    "Mentira.",
    "As luvas perderam."
  ],
  ["Voc\xEA viu o tamanho daquela aranha nas Minas Abandonadas?", "Vi o tamanho da sua cara quando ela pulou."],
  ["Eu n\xE3o corri.", "Voc\xEA derrubou a mesa correndo.", "Foi estrat\xE9gia.", "Estrat\xE9gia de correr."],
  ["Troquei minha espada por uma faca de cozinha.", "E funcionou?", "Melhor que a espada, sinceramente."],
  ["Algu\xE9m viu meu escudo?", "Vi ele virar prato ontem \xE0 noite.", "Isso explica o cheiro de sopa."],
  ["Dormi na Plan\xEDcie Dourada e sonhei que era rei.", "De qu\xEA?", "Da plan\xEDcie.", "Isso j\xE1 \xE9 seu mesmo."],
  ["O Guarda me deixou passar sem perguntar nada.", "Ele te reconheceu.", "Ou desistiu de perguntar."],
  ["Encontrei uma moeda estranha no Litoral Quebrado.", "Gasta ela?", "N\xE3o sei de onde \xE9.", "Gasta assim mesmo."],
  ["Tr\xEAs dias no Bosque Sussurrante e s\xF3 ouvi passarinho.", "Passarinho grande?", "N\xE3o sei, eu corri."],
  ["Meu personagem subiu de n\xEDvel ontem.", "Sentiu diferen\xE7a?", "Sim.", "Qual?", "Fome."],
  ["Vi um sujeito treinando sozinho na Arena de madrugada.", "Kade?", "De novo."],
  [
    "Perdi uma aposta e agora devo uma rodada pro grupo inteiro.",
    "Aposta de qu\xEA?",
    "Se o lobo era grande ou gigante.",
    "E era?",
    "Gigante. Eu sabia."
  ],
  [
    "Achei um chap\xE9u chique na trilha.",
    "Onde?",
    "Numa trilha que n\xE3o leva a lugar nenhum.",
    "E voc\xEA seguiu ela mesmo assim?",
    "O chap\xE9u era bonito."
  ],
  ["Ouvi dizer que tem gente estudando os lobos.", "Pra qu\xEA?", "Pra entender por que fogem de mim.", "Talvez seja o cheiro."],
  ["Voltei da Fortaleza Sombria inteiro.", "S\xF3 inteiro?", "E com menos coragem que antes."],
  ["Aposto que aquele Boss nem viu a gente chegando.", "Viu, sim.", "Como voc\xEA sabe?", "Porque ele riu."],
  ["Minha armadura range toda vez que eu ando.", "Isso \xE9 normal?", "N\xE3o sei, mas assusta os lobos."],
  ["Achei estranho o po\xE7o n\xE3o ter fundo.", "Voc\xEA jogou uma pedra?", "Joguei tr\xEAs.", "E?", "Ainda n\xE3o ouvi nenhuma."],
  ["Aquele Boss quase me pegou.", "Quase n\xE3o conta.", "Conta pra mim."],
  ["Vou tentar de novo amanh\xE3.", "Tentar o qu\xEA?", "N\xE3o sei, mas vou tentar."],
  ["Algu\xE9m trocou meu elmo por um chap\xE9u de festa.", "Foi voc\xEA mesmo, ontem, b\xEAbado.", "Isso explica muita coisa."],
  ["O ferreiro cobrou caro dessa vez.", "Ele sempre cobra caro.", "Dessa vez foi mais caro que caro."],
  ["Voc\xEA acredita em Grandes Feras?", "Acredito em conta grande de taverna.", "Isso \xE9 mais assustador."],
  ["Vi uma sombra enorme no Deserto de Vidro.", "Era o qu\xEA?", "Minha pr\xF3pria sombra.", "Ah."],
  ["Fiquei sabendo que algu\xE9m desafiou o Mestre da Arena.", "E?", "Ainda estamos esperando not\xEDcias."],
  ["Troquei de regi\xE3o tr\xEAs vezes hoje.", "Por qu\xEA?", "Procurando algu\xE9m que n\xE3o fugisse de mim."],
  ["Aquele item que eu achei era m\xE1gico?", "Era uma pedra.", "Uma pedra especial?", "Uma pedra."],
  [
    "Ouvi um barulho estranho vindo do P\xE2ntano Podre.",
    "Foi voc\xEA que fez.",
    "Como voc\xEA sabe?",
    "Porque s\xF3 voc\xEA reclama de barulho estranho toda noite."
  ],
  ["Achei que ia ser f\xE1cil.", "Nada nesse Reino \xE9 f\xE1cil.", "Devia ter uma placa avisando isso na entrada."]
];
var TAVERN_WALL_NOTES = [
  "Perdi uma panela.",
  "Se encontrar um chap\xE9u, ele provavelmente \xE9 meu.",
  "Procura-se algu\xE9m que saiba cozinhar.",
  "N\xC3O alimentar os patos.",
  "Vendo botas quase novas. Uma delas fura um pouco.",
  "Compro hist\xF3rias de viagem. Pago em p\xE3o.",
  "Se voc\xEA pegou minha corda emprestada, devolva. Se n\xE3o pegou, ainda assim procure uma corda.",
  "Aula de escrita aos domingos. Tragam a pr\xF3pria pena.",
  "Achado: um anel. Achado: outro anel. Achado: sim, os dois eram meus.",
  "Algu\xE9m sabe consertar um rel\xF3gio? Um espec\xEDfico, na torre.",
  "Ofere\xE7o abrigo por uma noite em troca de uma boa hist\xF3ria.",
  "N\xE3o deixem a porta dos fundos aberta. Os gansos entram.",
  "Vendo espada. Nunca usada. Comprada por engano.",
  "Se voc\xEA \xE9 o dono da cabra, ela est\xE1 na minha horta de novo.",
  "Preciso de algu\xE9m forte para carregar barris. Sem perguntas.",
  "Perdido: senso de dire\xE7\xE3o. \xDAltima vez visto nas Colinas \xC1ridas.",
  "Troco remendos de roupa por informa\xE7\xF5es sobre o Litoral Quebrado.",
  "Aviso: o po\xE7o n\xE3o \xE9 um desejo. \xC9 s\xF3 um po\xE7o.",
  "Algu\xE9m emprestou meu machado h\xE1 dois anos. Ainda espero.",
  "Vendo mapa antigo. Provavelmente errado.",
  "Recompensa para quem encontrar meu gato. Ele n\xE3o quer ser encontrado, mas tente.",
  "Aula de dan\xE7a improvisada essa noite, quem quiser aparecer.",
  "Aviso da Guarda: n\xE3o escalar a muralha. De novo.",
  "Algu\xE9m est\xE1 deixando flores na porta da ferraria. O Ferreiro quer saber quem.",
  "Compro qualquer coisa que brilhe. N\xE3o pergunto de onde veio.",
  "Se essa carta \xE9 sua, sinto muito. Se n\xE3o \xE9, ignore.",
  "Aviso: a fonte da pra\xE7a n\xE3o serve pra lavar roupa.",
  "Algu\xE9m viu um cachorro com uma bota na boca? A bota \xE9 minha. O cachorro n\xE3o.",
  "Vendo rem\xE9dio para ressaca. Funciona \xE0s vezes.",
  "Precisa-se de testemunha. N\xE3o vou dizer para qu\xEA.",
  "Achei uma chave. N\xE3o abre nenhuma porta que eu conhe\xE7o.",
  "Aula de costura cancelada essa semana. A professora sumiu.",
  "Aviso: n\xE3o cutucar o po\xE7o com um graveto. Algu\xE9m sempre cutuca.",
  "Vendo tr\xEAs galinhas. Uma delas \xE9 especial. N\xE3o direi qual.",
  "Se algu\xE9m souber cantar bem, a Taverna est\xE1 contratando. Ou s\xF3 ouvindo.",
  "Perdido: um par de luvas rasgadas. N\xE3o que valham muito, mas eram minhas.",
  "Aviso: o sino da torre est\xE1 desafinado. Ningu\xE9m sabe desde quando.",
  "Procuro companhia para viagem. Prefiro algu\xE9m que n\xE3o fale demais.",
  "Vendo lanterna que \xE0s vezes acende sozinha. Talvez seja um defeito.",
  "Aula de esgrima b\xE1sica aos s\xE1bados. Tragam um peda\xE7o de madeira.",
  "Se voc\xEA \xE9 dono do porco que est\xE1 solto na pra\xE7a, venha busc\xE1-lo antes que ele vire jantar.",
  "Recompensa para quem contar uma hist\xF3ria que eu ainda n\xE3o ouvi.",
  "Aviso: as ma\xE7\xE3s da pra\xE7a n\xE3o s\xE3o de gra\xE7a. Algu\xE9m continua achando que s\xE3o.",
  "Vendo uma armadura. S\xF3 um pouco amassada. Tem hist\xF3ria.",
  "Preciso de algu\xE9m que saiba ler mapas velhos. Muito velhos.",
  "Achado: uma carta de amor. N\xE3o \xE9 minha, mas \xE9 bonita.",
  "Aviso: n\xE3o durma perto da lareira. Algu\xE9m sempre dorme perto da lareira.",
  "Vendo semente rara. Talvez cres\xE7a. Talvez n\xE3o. Aceito o risco quem comprar.",
  "Aula de contar hist\xF3rias aos domingos. Requisito: ter pelo menos uma.",
  "Se algu\xE9m encontrar minha coragem, devolva na Taverna."
];
var TAVERN_NIGHT_SONGS = [
  "O \xDAltimo Barril",
  "Can\xE7\xE3o da Ponte Velha",
  "O Ferreiro Apaixonado",
  "Dan\xE7a do Lobo",
  "Cerveja Antes da Gl\xF3ria",
  "A Balada do Aventureiro Cansado",
  "Tr\xEAs Moedas e um Adeus",
  "O Sino que N\xE3o Toca Certo",
  "Lamento das Colinas \xC1ridas",
  "A Garota do Litoral Quebrado",
  "Onde Foi Meu Cavalo",
  "Noite Sem Estrelas",
  "O Brinde dos Que Ficaram",
  "Can\xE7\xE3o do Po\xE7o Sem Fundo",
  "Valsa da \xDAltima Rodada",
  "O Explorador Que Nunca Voltou",
  "Cinco Copos de Coragem",
  "A Dan\xE7a da Fogueira",
  "L\xE1 Vem o Vento do Deserto de Vidro",
  "Balada do Escudo Perdido",
  "O Homem Que Cantava Sozinho",
  "Can\xE7\xE3o Para Ningu\xE9m Ouvir",
  "A \xDAltima Vela da Taverna",
  "O Grito da Fortaleza",
  "Serenata Para uma Cabra",
  "O Peso da Armadura Velha",
  "Refr\xE3o do Aventureiro B\xEAbado",
  "A Ponte Que Ningu\xE9m Atravessa",
  "Can\xE7\xE3o do Primeiro Amanhecer",
  "O Fim de Uma Longa Estrada",
  "Balada das Luvas Rasgadas",
  "A Taverna Nunca Dorme",
  "Canto Baixo Para Noites Longas",
  "O \xDAltimo Suspiro do Her\xF3i",
  "Dan\xE7a Torta do Ferreiro",
  "Melodia da Pra\xE7a Vazia",
  "A Can\xE7\xE3o Que Ningu\xE9m Termina",
  "Barril Vazio, Copo Cheio",
  "O Segredo do Bosque Sussurrante",
  "\xDAltima Can\xE7\xE3o Antes do Sil\xEAncio"
];

// apps/web/src/components/tavern/TavernRumor.tsx
var import_jsx_runtime35 = __toESM(require_jsx_runtime(), 1);
function randomRumor() {
  return TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)];
}
function TavernRumor() {
  const [rumor] = (0, import_react14.useState)(randomRumor);
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("h3", { children: "\u{1F5E3}\uFE0F Rumor do Dia" }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("p", { className: "tavern-rumor", children: [
      '"',
      rumor,
      '"'
    ] })
  ] });
}

// apps/web/src/components/tavern/AdventurerTable.tsx
var import_react15 = __toESM(require_react(), 1);
var import_jsx_runtime36 = __toESM(require_jsx_runtime(), 1);
var SHOWN_COUNT = 5;
function randomConversations() {
  const shuffled = [...TAVERN_CONVERSATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SHOWN_COUNT);
}
function AdventurerTable() {
  const [conversations] = (0, import_react15.useState)(randomConversations);
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("h3", { children: "\u{1F37B} Mesa dos Aventureiros" }),
    /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("div", { className: "tavern-conversations", children: conversations.map((lines, i) => /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("div", { className: "tavern-conversation", children: lines.map((line, j) => /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("p", { children: [
      "\u2014 ",
      line
    ] }, j)) }, i)) })
  ] });
}

// apps/web/src/components/tavern/WallNotes.tsx
var import_jsx_runtime37 = __toESM(require_jsx_runtime(), 1);
function WallNotes() {
  return /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("h3", { children: "\u{1F4CC} Recados na Parede" }),
    /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("ul", { className: "tavern-wall-notes", children: TAVERN_WALL_NOTES.map((note, i) => /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("li", { className: "tavern-note", children: note }, i)) })
  ] });
}

// apps/web/src/components/tavern/NightSongs.tsx
var import_jsx_runtime38 = __toESM(require_jsx_runtime(), 1);
function NightSongs() {
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("h3", { children: "\u{1F3B5} M\xFAsica da Noite" }),
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("ul", { className: "tavern-songs", children: TAVERN_NIGHT_SONGS.map((title, i) => /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("li", { children: title }, i)) })
  ] });
}

// apps/web/src/components/city/TavernBuilding.tsx
var import_jsx_runtime39 = __toESM(require_jsx_runtime(), 1);
function TavernBuilding() {
  return /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("h2", { children: "\u{1F37A} Taverna" }),
    /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(NpcIntro, { npc: NPCS.taverneira }),
    /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("p", { className: "hint", children: "Onde o Reino descansa, conversa e inventa hist\xF3rias." }),
    /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)("div", { className: "tavern-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(TavernRumor, {}),
      /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(AdventurerTable, {}),
      /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(WallNotes, {}),
      /* @__PURE__ */ (0, import_jsx_runtime39.jsx)(NightSongs, {})
    ] })
  ] });
}

// apps/web/src/components/city/TravellerHouseBuilding.tsx
var import_react17 = __toESM(require_react(), 1);

// apps/web/src/lib/travellerStories.ts
var STORY_CATEGORIES = [
  { slug: "misterio", label: "Mist\xE9rio", icon: "\u2754" },
  { slug: "criaturas", label: "Criaturas", icon: "\u{1F43E}" },
  { slug: "ruinas", label: "Ru\xEDnas", icon: "\u{1F3DB}\uFE0F" },
  { slug: "reis_antigos", label: "Reis Antigos", icon: "\u{1F451}" },
  { slug: "objetos_estranhos", label: "Objetos Estranhos", icon: "\u{1F52E}" },
  { slug: "viagens", label: "Viagens", icon: "\u{1F9F3}" },
  { slug: "mar", label: "Mar", icon: "\u{1F30A}" },
  { slug: "floresta", label: "Floresta", icon: "\u{1F332}" },
  { slug: "montanhas", label: "Montanhas", icon: "\u26F0\uFE0F" },
  { slug: "magia", label: "Magia", icon: "\u2728" }
];
var REGION_ICON = {
  "porto-do-amanhecer": "\u{1F305}",
  "bosque-sussurrante": "\u{1F332}",
  "pantano-podre": "\u{1F438}",
  "colinas-aridas": "\u{1F3DC}\uFE0F",
  "planicie-dourada": "\u{1F33E}",
  "minas-abandonadas": "\u26CF\uFE0F",
  "litoral-quebrado": "\u{1F30A}",
  "picos-congelados": "\u{1F3D4}\uFE0F",
  "deserto-de-vidro": "\u{1F537}",
  "ruinas-esquecidas": "\u{1F3DB}\uFE0F",
  "fortaleza-sombria": "\u{1F3F0}"
};
function regionFilterOptions() {
  return allRegionIds().map((id) => ({ slug: id, label: getRegionName(id), icon: REGION_ICON[id] ?? "\u{1F4CD}" }));
}
var TRAVELLER_STORIES = [
  // ---- Mistério ----
  { id: "luzes-sobre-o-lago", title: "Luzes Sobre o Lago", text: "Um pescador jurou ter visto luzes caminhando sobre o lago, uma noite sem lua.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "relogio-que-nunca-bate-certo", title: "O Rel\xF3gio que Nunca Bate Certo", text: "Dizem que o rel\xF3gio da torre sempre atrasa um minuto, todos os dias, desde sempre.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "sombra-que-segue-de-longe", title: "A Sombra que Segue de Longe", text: "Um viajante contou ter sido seguido por uma sombra que nunca se aproximava nem se afastava.", regionId: "colinas-aridas", category: "misterio" },
  { id: "segundo-reflexo", title: "O Segundo Reflexo", text: "Uma mulher jura que, por um instante, seu reflexo na \xE1gua piscou fora de tempo.", regionId: "planicie-dourada", category: "misterio" },
  { id: "pegadas-que-voltam", title: "As Pegadas que Voltam", text: "Encontraram pegadas na neve que iam e voltavam, mas nunca cruzavam com outras.", regionId: "picos-congelados", category: "misterio" },
  { id: "sino-sem-motivo", title: "O Sino Sem Motivo", text: "Moradores contam que, certas noites, um sino toca em algum lugar que ningu\xE9m consegue localizar.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "porta-que-muda-de-lugar", title: "A Porta que Muda de Lugar", text: "Dizem que uma porta antiga aparece em paredes diferentes, dependendo de quem procura.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "homem-que-perguntou-as-horas", title: "O Homem que Perguntou as Horas", text: "Um estranho perguntou as horas a tr\xEAs pessoas diferentes, no mesmo instante, em lugares distantes.", regionId: "planicie-dourada", category: "misterio" },
  { id: "vela-que-nao-apaga", title: "A Vela que N\xE3o Apaga", text: "H\xE1 uma vela na capela velha que, dizem, nunca foi vista apagada, nem acesa.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "eco-atrasado", title: "O Eco Atrasado", text: "Alguns juram que, nas Colinas \xC1ridas, o eco de um grito demora exatamente um dia para responder.", regionId: "colinas-aridas", category: "misterio" },
  // ---- Criaturas ----
  { id: "lobo-de-olhos-claros", title: "O Lobo de Olhos Claros", text: "Ca\xE7adores contam sobre um lobo com olhos claros demais que nunca ataca, s\xF3 observa.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "serpente-que-fala-baixo", title: "A Serpente que Fala Baixo", text: "Dizem que uma serpente do Deserto de Vidro sussurra antes de atacar, como um aviso.", regionId: "deserto-de-vidro", category: "criaturas" },
  { id: "cervo-de-chifres-torcidos", title: "O Cervo de Chifres Torcidos", text: "Um cervo com chifres estranhamente torcidos foi visto tr\xEAs vezes, sempre no mesmo lugar.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "peixe-que-sabe-nomes", title: "O Peixe que Sabe Nomes", text: "Pescadores do Litoral Quebrado juram que um peixe grande j\xE1 chamou algu\xE9m pelo nome.", regionId: "litoral-quebrado", category: "criaturas" },
  { id: "aranha-do-tamanho-de-um-prato", title: "A Aranha do Tamanho de um Prato", text: "Mineiros contam sobre uma aranha enorme que s\xF3 aparece quando ningu\xE9m est\xE1 sozinho.", regionId: "minas-abandonadas", category: "criaturas" },
  { id: "urso-que-chora-a-noite", title: "O Urso que Chora \xE0 Noite", text: "Moradores das colinas dizem ouvir um som parecido com choro, vindo de um urso que ningu\xE9m encontra de dia.", regionId: "colinas-aridas", category: "criaturas" },
  { id: "corvo-que-conta-ate-tres", title: "O Corvo que Conta At\xE9 Tr\xEAs", text: "Um corvo espec\xEDfico \xE9 visto sempre em grupos de tr\xEAs, nunca mais, nunca menos.", regionId: "porto-do-amanhecer", category: "criaturas" },
  { id: "criatura-do-pantano-sem-nome", title: "A Criatura do P\xE2ntano Sem Nome", text: "Ningu\xE9m colocou nome na coisa que se move no P\xE2ntano Podre. Achar um nome parece perigoso.", regionId: "pantano-podre", category: "criaturas" },
  { id: "gigante-gentil", title: "O Gigante Gentil", text: "Uma crian\xE7a voltou da floresta dizendo que conversou com um gigante gentil, que s\xF3 queria companhia.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "cao-sem-dono-que-sempre-aparece", title: "O C\xE3o Sem Dono que Sempre Aparece", text: "Um c\xE3o sem dono aparente \xE9 visto ajudando viajantes perdidos, e depois desaparece.", regionId: "planicie-dourada", category: "criaturas" },
  // ---- Ruínas ----
  { id: "cavaleiro-da-ponte-velha", title: "O Cavaleiro da Ponte Velha", text: "H\xE1 quem diga que um cavaleiro continua protegendo uma ponte, mesmo depois de morto.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "sala-que-ninguem-encontra-duas-vezes", title: "A Sala que Ningu\xE9m Encontra Duas Vezes", text: "Exploradores contam sobre uma sala nas Ru\xEDnas que nunca conseguem achar de novo.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "passos-debaixo-da-pedra", title: "Os Passos Debaixo da Pedra", text: "Alguns viajantes evitam atravessar as Ru\xEDnas Esquecidas durante a madrugada, por causa dos passos.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "estatua-que-muda-de-postura", title: "A Est\xE1tua que Muda de Postura", text: "Dizem que uma das est\xE1tuas das ru\xEDnas est\xE1 sempre numa posi\xE7\xE3o diferente da \xFAltima vez.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "portal-que-nao-leva-a-lugar-nenhum", title: "O Portal que N\xE3o Leva a Lugar Nenhum", text: "Um portal de pedra isolado continua de p\xE9, sem levar a lugar algum \u2014 ou levando a algum lugar que ningu\xE9m contou.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "voz-na-fortaleza-sombria", title: "A Voz na Fortaleza Sombria", text: "Guardas juram ouvir uma voz calma vindo do interior da Fortaleza Sombria, mesmo sabendo que est\xE1 vazia.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "trono-vazio-que-range", title: "O Trono Vazio que Range", text: "Contam que o trono abandonado da Fortaleza range como se algu\xE9m ainda sentasse nele.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "inscricoes-que-mudam", title: "As Inscri\xE7\xF5es que Mudam", text: "Estudiosos discordam se as inscri\xE7\xF5es das Ru\xEDnas realmente mudam, ou se \xE9 s\xF3 a mem\xF3ria que falha.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "templo-dentro-do-templo", title: "O Templo Dentro do Templo", text: "Uma c\xE2mara mais antiga que o resto das Ru\xEDnas foi encontrada, e ningu\xE9m sabe explicar a diferen\xE7a de idade.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "guardiao-que-nao-ataca", title: "O Guardi\xE3o que N\xE3o Ataca", text: "Um vigia de pedra na Fortaleza Sombria nunca se moveu, mas ningu\xE9m garante que ele n\xE3o possa.", regionId: "fortaleza-sombria", category: "ruinas" },
  // ---- Reis antigos ----
  { id: "rei-que-nunca-foi-coroado", title: "O Rei que Nunca Foi Coroado", text: "Contam que um rei governou por anos sem nunca aceitar a coroa oficialmente.", regionId: "planicie-dourada", category: "reis_antigos" },
  { id: "rainha-que-sumiu-na-neblina", title: "A Rainha que Sumiu na Neblina", text: "Uma rainha antiga teria desaparecido numa neblina espessa, e nunca mais foi vista.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "ultimo-decreto-nao-lido", title: "O \xDAltimo Decreto N\xE3o Lido", text: "Dizem que existe um decreto de um rei antigo que nunca foi lido em voz alta at\xE9 hoje.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "rei-que-conversava-com-pedras", title: "O Rei que Conversava com Pedras", text: "Um governante antigo era famoso por falar sozinho com pedras, como se elas respondessem.", regionId: "colinas-aridas", category: "reis_antigos" },
  { id: "coroa-perdida-nas-minas", title: "A Coroa Perdida nas Minas", text: "H\xE1 quem acredite que uma coroa antiga ainda est\xE1 enterrada nas Minas Abandonadas.", regionId: "minas-abandonadas", category: "reis_antigos" },
  { id: "rei-sem-nome-nos-registros", title: "O Rei Sem Nome nos Registros", text: "Um reinado inteiro existe nos relatos populares, mas nenhum registro oficial confirma o nome do rei.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "promessa-feita-ao-deserto", title: "A Promessa Feita ao Deserto", text: "Contam que um rei antigo fez uma promessa ao Deserto de Vidro, e que o deserto ainda espera.", regionId: "deserto-de-vidro", category: "reis_antigos" },
  { id: "trono-afundado", title: "O Trono Afundado", text: "Dizem que um trono inteiro afundou lentamente no P\xE2ntano Podre, com o tempo.", regionId: "pantano-podre", category: "reis_antigos" },
  { id: "rei-que-nunca-envelheceu", title: "O Rei que Nunca Envelheceu", text: "Um relato antigo insiste que um certo rei nunca pareceu envelhecer, at\xE9 desaparecer de vez.", regionId: "planicie-dourada", category: "reis_antigos" },
  { id: "ultima-ceia-do-rei-esquecido", title: "A \xDAltima Ceia do Rei Esquecido", text: "Contam que a \xFAltima refei\xE7\xE3o de um rei esquecido ainda est\xE1 representada em um mural desbotado.", regionId: "ruinas-esquecidas", category: "reis_antigos" },
  // ---- Objetos estranhos ----
  { id: "moinho-sem-vento", title: "O Moinho Sem Vento", text: "O velho moinho continua funcionando mesmo sem vento.", regionId: "planicie-dourada", category: "objetos_estranhos" },
  { id: "chave-que-nao-serve-em-nada", title: "A Chave que N\xE3o Serve em Nada", text: "Uma chave antiga passa de m\xE3o em m\xE3o, mas ningu\xE9m encontrou a porta que ela abre.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "espelho-que-chega-atrasado", title: "O Espelho que Chega Atrasado", text: "Um espelho antigo mostra o reflexo um instante depois do esperado, segundo quem j\xE1 usou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "relogio-que-conta-ao-contrario", title: "O Rel\xF3gio que Conta ao Contr\xE1rio", text: "Um rel\xF3gio de bolso encontrado nas Ru\xEDnas conta as horas de tr\xE1s para frente.", regionId: "ruinas-esquecidas", category: "objetos_estranhos" },
  { id: "lampada-que-nunca-apaga-sozinha", title: "A L\xE2mpada que Nunca Apaga Sozinha", text: "Uma l\xE2mpada de \xF3leo \xE9 famosa por nunca se apagar, mesmo sem ningu\xE9m reabastec\xEA-la.", regionId: "minas-abandonadas", category: "objetos_estranhos" },
  { id: "bau-que-ninguem-consegue-abrir", title: "O Ba\xFA que Ningu\xE9m Consegue Abrir", text: "Um ba\xFA de ferro segue fechado h\xE1 gera\xE7\xF5es, e ningu\xE9m encontrou a fechadura certa.", regionId: "fortaleza-sombria", category: "objetos_estranhos" },
  { id: "bussola-que-aponta-para-dentro", title: "A B\xFAssola que Aponta para Dentro", text: "Uma b\xFAssola estranha aponta sempre para o centro do Deserto de Vidro, n\xE3o para o norte.", regionId: "deserto-de-vidro", category: "objetos_estranhos" },
  { id: "sino-que-ninguem-ouve-igual", title: "O Sino que Ningu\xE9m Ouve Igual", text: "Cada pessoa que ouve o sino da torre descreve um som diferente do anterior.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "luva-que-aparece-sozinha", title: "A Luva que Aparece Sozinha", text: "Dizem que, de vez em quando, uma luva surge sozinha em lugares onde ningu\xE9m a deixou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "cajado-deixado-na-neve", title: "O Cajado Deixado na Neve", text: "Um cajado antigo permanece cravado na neve dos Picos Congelados, imune ao tempo.", regionId: "picos-congelados", category: "objetos_estranhos" },
  // ---- Viagens ----
  { id: "viajante-que-nunca-chegou", title: "O Viajante que Nunca Chegou", text: "Um mercador partiu para outro Reino e nunca chegou, nem voltou, nem foi encontrado.", regionId: "planicie-dourada", category: "viagens" },
  { id: "estrada-que-ninguem-reconhece-duas-vezes", title: "A Estrada que Ningu\xE9m Reconhece Duas Vezes", text: "Alguns viajantes contam ter seguido uma estrada que, na volta, parecia completamente diferente.", regionId: "colinas-aridas", category: "viagens" },
  { id: "grupo-que-voltou-em-menos-tempo", title: "O Grupo que Voltou em Menos Tempo", text: "Um grupo de viajantes voltou de uma jornada longa em menos tempo do que deveria ser fisicamente poss\xEDvel.", regionId: "planicie-dourada", category: "viagens" },
  { id: "carroca-sem-cavalo", title: "A Carro\xE7a Sem Cavalo", text: "Contam que uma carro\xE7a foi vista se movendo sozinha por uma estrada vazia.", regionId: "planicie-dourada", category: "viagens" },
  { id: "mapa-que-nao-bate-com-o-caminho", title: "O Mapa que N\xE3o Bate com o Caminho", text: "Um mapa antigo mostra uma estrada que n\xE3o existe mais, ou talvez nunca tenha existido.", regionId: "colinas-aridas", category: "viagens" },
  { id: "viajante-que-trocou-de-nome-no-caminho", title: "O Viajante que Trocou de Nome no Caminho", text: "Um homem chegou a um vilarejo com um nome diferente do que usava ao partir de outro.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "ponte-que-so-aparece-a-noite", title: "A Ponte que S\xF3 Aparece \xE0 Noite", text: "Viajantes juram ter atravessado uma ponte que, de dia, simplesmente n\xE3o est\xE1 l\xE1.", regionId: "pantano-podre", category: "viagens" },
  { id: "atalho-que-ninguem-recomenda-duas-vezes", title: "O Atalho que Ningu\xE9m Recomenda Duas Vezes", text: "Um atalho famoso encurta a viagem, mas quem o usa nunca quer contar o que viu no caminho.", regionId: "bosque-sussurrante", category: "viagens" },
  { id: "peso-extra-na-bagagem", title: "O Peso Extra na Bagagem", text: "Um viajante jurou que sua bagagem pesava mais na volta do que na ida, sem nada ter sido acrescentado.", regionId: "deserto-de-vidro", category: "viagens" },
  { id: "caravana-que-ninguem-viu-partir", title: "A Caravana que Ningu\xE9m Viu Partir", text: "Moradores contam sobre uma caravana que ningu\xE9m viu chegar, mas que todos garantem ter visto partir.", regionId: "planicie-dourada", category: "viagens" },
  // ---- Mar ----
  { id: "navio-que-encalhou-longe-da-agua", title: "O Navio que Encalhou Longe da \xC1gua", text: "Um casco partido foi encontrado longe demais da \xE1gua para ter encalhado numa tempestade normal.", regionId: "litoral-quebrado", category: "mar" },
  { id: "voz-debaixo-das-ondas", title: "A Voz Debaixo das Ondas", text: "Pescadores contam ter ouvido uma voz cantando debaixo da \xE1gua, em noites calmas.", regionId: "litoral-quebrado", category: "mar" },
  { id: "farol-que-acende-sozinho", title: "O Farol que Acende Sozinho", text: "Um farol abandonado \xE0s vezes acende sozinho, segundo quem mora por perto.", regionId: "litoral-quebrado", category: "mar" },
  { id: "rede-que-sempre-volta-vazia", title: "A Rede que Sempre Volta Vazia num Certo Dia", text: "Uma vez por ano, dizem os pescadores, nenhuma rede traz nada, n\xE3o importa onde seja lan\xE7ada.", regionId: "litoral-quebrado", category: "mar" },
  { id: "marinheiro-que-nunca-envelheceu-no-mar", title: "O Marinheiro que Nunca Envelheceu no Mar", text: "Um velho marujo jura ter conhecido, na juventude, um marinheiro que parecia sempre da mesma idade.", regionId: "litoral-quebrado", category: "mar" },
  { id: "mercadora-do-navio-fantasma", title: "A Mercadora do Navio Fantasma", text: "Contam sobre uma mercadora que aparece vendendo objetos estranhos, sempre vinda de um navio que ningu\xE9m mais v\xEA.", regionId: "litoral-quebrado", category: "mar" },
  { id: "conchas-que-sussurram", title: "As Conchas que Sussurram", text: "Algumas conchas do litoral, dizem, sussurram quando encostadas no ouvido, mas ningu\xE9m concorda no que dizem.", regionId: "litoral-quebrado", category: "mar" },
  { id: "naufragio-que-se-move", title: "O Naufr\xE1gio que Se Move", text: "Um naufr\xE1gio antigo parece estar mais perto da vila a cada ano, sem que ningu\xE9m o tenha movido.", regionId: "litoral-quebrado", category: "mar" },
  { id: "mare-que-chegou-sem-aviso", title: "A Mar\xE9 que Chegou Sem Aviso", text: "Uma mar\xE9 alta incomum chegou sem qualquer sinal de tempestade, e ningu\xE9m soube explicar por qu\xEA.", regionId: "litoral-quebrado", category: "mar" },
  { id: "pescador-que-trouxe-algo-que-nao-devia", title: "O Pescador que Trouxe Algo que N\xE3o Devia", text: "Um pescador puxou algo em sua rede que ele nunca descreveu para ningu\xE9m, e nunca mais pescou.", regionId: "litoral-quebrado", category: "mar" },
  // ---- Floresta ----
  { id: "arvore-que-respondeu", title: "A \xC1rvore que Respondeu", text: "Disseram que uma \xE1rvore respondeu quando um aventureiro pediu ajuda, no Bosque Sussurrante.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "caminho-que-sussurra-nomes", title: "O Caminho que Sussurra Nomes", text: "Viajantes contam ouvir seus pr\xF3prios nomes sussurrados entre as \xE1rvores, sem ningu\xE9m por perto.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "clareira-que-nao-aparece-no-mapa", title: "A Clareira que N\xE3o Aparece no Mapa", text: "Uma clareira perfeita foi encontrada no meio do bosque, mas nenhum mapa a registra.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "musgo-que-cresce-em-forma-de-letras", title: "O Musgo que Cresce em Forma de Letras", text: "Alguns juram ter visto musgo crescendo em padr\xF5es parecidos com letras antigas.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "aves-que-silenciam-juntas", title: "As Aves que Silenciam Juntas", text: "H\xE1 momentos em que todos os p\xE1ssaros do bosque param de cantar ao mesmo tempo, sem motivo aparente.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "cabana-vazia-sempre-arrumada", title: "A Cabana Vazia Sempre Arrumada", text: "Uma cabana abandonada no bosque est\xE1 sempre limpa, embora ningu\xE9m confesse cuidar dela.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "riacho-que-muda-de-direcao", title: "O Riacho que Muda de Dire\xE7\xE3o", text: "Moradores locais dizem que um riacho pequeno j\xE1 mudou de dire\xE7\xE3o mais de uma vez, sem chuva ou motivo.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "nevoa-que-so-cobre-uma-arvore", title: "A N\xE9voa que S\xF3 Cobre uma \xC1rvore", text: "Uma n\xE9voa estranha \xE0s vezes cobre s\xF3 uma \xE1rvore espec\xEDfica, mesmo em dias claros.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "eco-que-devolve-outra-voz", title: "O Eco que Devolve Outra Voz", text: "Algu\xE9m gritou no bosque e jura ter ouvido de volta uma voz que n\xE3o era a sua.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "raizes-que-formam-um-rosto", title: "As Ra\xEDzes que Formam um Rosto", text: "Um conjunto de ra\xEDzes expostas parece, para alguns, formar um rosto \u2014 mas nunca o mesmo rosto duas vezes.", regionId: "bosque-sussurrante", category: "floresta" },
  // ---- Montanhas ----
  { id: "grito-que-vem-do-topo", title: "O Grito que Vem do Topo", text: "Moradores das redondezas contam ouvir um grito vindo do topo dos Picos Congelados, sem nunca ver quem grita.", regionId: "picos-congelados", category: "montanhas" },
  { id: "trilha-que-termina-no-nada", title: "A Trilha que Termina no Nada", text: "Uma trilha talhada na rocha termina abruptamente num penhasco, sem explica\xE7\xE3o de para onde levava.", regionId: "picos-congelados", category: "montanhas" },
  { id: "viajante-congelado-que-ainda-sorri", title: "O Viajante Congelado que Ainda Sorri", text: "Contam sobre um viajante encontrado congelado nas montanhas, com uma express\xE3o calma demais para o frio.", regionId: "picos-congelados", category: "montanhas" },
  { id: "neve-que-nao-derrete-num-ponto-so", title: "A Neve que N\xE3o Derrete num Ponto S\xF3", text: "H\xE1 um ponto espec\xEDfico nos Picos onde a neve nunca derrete, nem no ver\xE3o mais quente.", regionId: "picos-congelados", category: "montanhas" },
  { id: "sino-da-montanha", title: "O Sino da Montanha", text: "Alguns dizem ouvir um sino distante nas Colinas \xC1ridas, embora n\xE3o haja nenhum sino conhecido por l\xE1.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "caverna-que-ninguem-mediu-ate-o-fim", title: "A Caverna que Ningu\xE9m Mediu At\xE9 o Fim", text: "Uma caverna nas colinas nunca foi completamente explorada \u2014 quem tenta, sempre volta antes do fim.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "vento-que-fala-baixo", title: "O Vento que Fala Baixo", text: "Pastores das colinas juram que o vento, em certas noites, parece formar palavras.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "pedra-que-aquece-sozinha", title: "A Pedra que Aquece Sozinha", text: "Uma pedra espec\xEDfica nas colinas est\xE1 sempre morna, mesmo nas noites mais frias.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "rebanho-que-segue-sozinho", title: "O Rebanho que Segue Sozinho", text: "Um rebanho foi visto se movendo em forma\xE7\xE3o organizada, sem nenhum pastor por perto.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "passagem-que-so-alguns-encontram", title: "A Passagem que S\xF3 Alguns Encontram", text: "Dizem que existe uma passagem nos Picos Congelados que s\xF3 aparece para quem realmente precisa dela.", regionId: "picos-congelados", category: "montanhas" },
  // ---- Magia ----
  { id: "feitico-que-ninguem-lancou", title: "O Feiti\xE7o que Ningu\xE9m Lan\xE7ou", text: "Zoltar jura ter sentido um feiti\xE7o se formar no ar, sem ningu\xE9m por perto para lan\xE7\xE1-lo.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "luz-que-cura-sem-ser-pedida", title: "A Luz que Cura Sem Ser Pedida", text: "Contam sobre uma luz vista no P\xE2ntano Podre que parece aliviar feridas, sem que ningu\xE9m a tenha invocado.", regionId: "pantano-podre", category: "magia" },
  { id: "livro-que-se-escreve-sozinho", title: "O Livro que Se Escreve Sozinho", text: "Miriam guarda um livro que, segundo boatos antigos, ganha novas p\xE1ginas sem ningu\xE9m escrever.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "fumaca-que-forma-simbolos", title: "A Fuma\xE7a que Forma S\xEDmbolos", text: "Alquimistas relatam que certa fuma\xE7a, ao se dissipar, forma s\xEDmbolos que ningu\xE9m consegue copiar a tempo.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "anel-que-esquenta-perto-de-perigo", title: "O Anel que Esquenta Perto de Perigo", text: "Um anel antigo \xE9 famoso por esquentar sempre que o perigo se aproxima do dono.", regionId: "deserto-de-vidro", category: "magia" },
  { id: "chama-que-nao-queima", title: "A Chama que N\xE3o Queima", text: "Uma fogueira nas Ru\xEDnas Esquecidas queima sem consumir a lenha, segundo quem j\xE1 viu de perto.", regionId: "ruinas-esquecidas", category: "magia" },
  { id: "sussurro-que-ensina-feiticos", title: "O Sussurro que Ensina Feiti\xE7os", text: "Um aprendiz jurou ter aprendido um feiti\xE7o simplesmente ouvindo um sussurro vindo do nada.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "agua-que-reflete-outro-lugar", title: "A \xC1gua que Reflete Outro Lugar", text: "Um po\xE7o no Bosque Sussurrante \xE0s vezes reflete uma paisagem que n\xE3o \xE9 a do bosque ao redor.", regionId: "bosque-sussurrante", category: "magia" },
  { id: "circulo-que-aparece-na-terra-queimada", title: "O C\xEDrculo que Aparece na Terra Queimada", text: "Um c\xEDrculo perfeito de terra queimada surge, some, e reaparece em outro lugar da Plan\xEDcie Dourada.", regionId: "planicie-dourada", category: "magia" },
  { id: "magia-que-zoltar-nao-explica", title: "A Magia que Zoltar N\xE3o Explica", text: "Zoltar se recusa a comentar certos boatos sobre magia antiga. Isso, por si s\xF3, j\xE1 \xE9 um boato.", regionId: "porto-do-amanhecer", category: "magia" },
  // ---- Sprint Wolves Ecosystem (Phase I) — 10 histórias sobre os Lobos
  // do Bosque Sussurrante e variantes regionais, mesma categoria já usada
  // por "lobo-de-olhos-claros" (Traveller Stories original).
  { id: "uivo-que-lidera", title: "O Uivo que Lidera", text: "Ca\xE7adores dizem reconhecer o uivo do Lobo Alfa entre todos os outros \u2014 mais grave, mais longo, e ouvido s\xF3 uma vez por ca\xE7ada.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "loba-que-anda-sozinha", title: "A Loba que Anda Sozinha", text: "Contam que uma loba de pelagem clara ca\xE7a longe da matilha, sempre voltando antes do amanhecer.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "filhote-que-seguiu-um-viajante", title: "O Filhote que Seguiu um Viajante", text: "Um mercador jura que um filhote de lobo o seguiu por dois dias inteiros, sem nunca se aproximar o bastante para ser tocado.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "lobos-que-nao-cacam-em-bando", title: "Os Lobos que N\xE3o Ca\xE7am em Bando", text: "Nas Colinas \xC1ridas, dizem que os lobos ca\xE7am sozinhos \u2014 a terra ali n\xE3o sustenta uma matilha inteira.", regionId: "colinas-aridas", category: "criaturas" },
  { id: "lobo-que-nada-no-pantano", title: "O Lobo que Nada no P\xE2ntano", text: "Um ca\xE7ador afirma ter visto um lobo atravessar um trecho de \xE1gua parada como se fosse ch\xE3o firme.", regionId: "pantano-podre", category: "criaturas" },
  { id: "presas-que-brilham-na-neve", title: "As Presas que Brilham na Neve", text: "Exploradores dos Picos Congelados contam sobre um lobo cujas presas pareciam refletir a luz da lua.", regionId: "picos-congelados", category: "criaturas" },
  { id: "matilha-que-cerca-em-silencio", title: "A Matilha que Cerca em Sil\xEAncio", text: "Dizem que uma matilha inteira consegue cercar um viajante sem que ele perceba, at\xE9 ser tarde demais.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "lobo-com-cicatriz-no-focinho", title: "O Lobo com uma Cicatriz no Focinho", text: "Alguns ca\xE7adores juram reconhecer sempre o mesmo lobo \u2014 marcado, magro, e imposs\xEDvel de encurralar.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "noite-em-que-os-lobos-nao-uivaram", title: "A Noite em que os Lobos N\xE3o Uivaram", text: "Moradores do Bosque Sussurrante contam sobre uma \xFAnica noite, h\xE1 anos, em que nenhum lobo uivou \u2014 e ningu\xE9m soube dizer por qu\xEA.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "rastro-que-termina-no-nada", title: "O Rastro que Termina no Nada", text: "Um batedor contou ter seguido pegadas de lobo por horas, at\xE9 elas simplesmente pararem de existir, no meio do caminho.", regionId: "bosque-sussurrante", category: "criaturas" }
];

// apps/web/src/components/travellerHouse/StoryShelf.tsx
var import_react16 = __toESM(require_react(), 1);
var import_jsx_runtime40 = __toESM(require_jsx_runtime(), 1);
var CATEGORY_LABEL = Object.fromEntries(
  STORY_CATEGORIES.map((c) => [c.slug, `${c.icon} ${c.label}`])
);
function StoryShelf({ stories, selectedId, onSelect }) {
  const [query, setQuery] = (0, import_react16.useState)("");
  const [region, setRegion] = (0, import_react16.useState)(null);
  const filtered = (0, import_react16.useMemo)(() => {
    const entries = stories.map((story) => ({
      id: story.id,
      source: "casa-dos-viajantes",
      title: story.title,
      category: story.regionId,
      regionId: story.regionId,
      status: "DISCOVERED" /* Discovered */,
      searchText: story.title
    }));
    const matched = filterKnowledge(searchKnowledge(entries, query), [{ select: (e) => e.regionId, value: region }]);
    const matchedIds = new Set(matched.map((e) => e.id));
    return stories.filter((story) => matchedIds.has(story.id));
  }, [stories, query, region]);
  return /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(CodexCategoryList, { categories: regionFilterOptions(), selected: region, onSelect: setRegion, allLabel: "Todas as regi\xF5es" }) }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhuma hist\xF3ria encontrada.",
      children: filtered.map((story) => /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(
        CodexCard,
        {
          icon: "\u{1F4DC}",
          title: story.title,
          meta: getRegionName(story.regionId),
          statusLabel: CATEGORY_LABEL[story.category],
          locked: false,
          selected: story.id === selectedId,
          onSelect: () => onSelect(story.id)
        },
        story.id
      ))
    }
  );
}

// apps/web/src/components/travellerHouse/StoryReader.tsx
var import_jsx_runtime41 = __toESM(require_jsx_runtime(), 1);
function StoryReader({ story }) {
  const category = story ? STORY_CATEGORIES.find((c) => c.slug === story.category) : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(
    CodexReader,
    {
      isEmpty: !story,
      emptyMessage: "Escolha uma hist\xF3ria na estante ao lado.",
      locked: false,
      lockedTitle: "",
      lockedMessage: "",
      unlockCondition: "",
      icon: "\u{1F4DC}",
      title: story?.title ?? "",
      subtitle: story ? getRegionName(story.regionId) : void 0,
      description: "",
      facts: story ? [
        { label: "Categoria", value: category ? `${category.icon} ${category.label}` : story.category },
        { label: "Regi\xE3o", value: getRegionName(story.regionId) }
      ] : [],
      pages: story ? [story.text] : []
    }
  );
}

// apps/web/src/components/city/TravellerHouseBuilding.tsx
var import_jsx_runtime42 = __toESM(require_jsx_runtime(), 1);
function TravellerHouseBuilding() {
  const [selectedId, setSelectedId] = (0, import_react17.useState)(null);
  const selectedStory = TRAVELLER_STORIES.find((story) => story.id === selectedId) ?? null;
  const handleRandomStory = () => {
    const random = TRAVELLER_STORIES[Math.floor(Math.random() * TRAVELLER_STORIES.length)];
    setSelectedId(random.id);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime42.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("h2", { children: "\u{1F4DC} Casa dos Viajantes" }),
    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(NpcIntro, { npc: NPCS.viajante }),
    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("p", { className: "hint", children: "Hist\xF3rias contadas por gente comum. Ningu\xE9m sabe se s\xE3o verdade." }),
    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)("button", { type: "button", className: "traveller-random-btn", onClick: handleRandomStory, children: "\u{1F3B2} Hist\xF3ria Aleat\xF3ria" }),
    /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(StoryShelf, { stories: TRAVELLER_STORIES, selectedId, onSelect: setSelectedId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(StoryReader, { story: selectedStory }, selectedStory?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/pages/CityPage.tsx
var import_jsx_runtime43 = __toESM(require_jsx_runtime(), 1);
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = (0, import_react18.useState)(getStoredChannel());
  const [worldState, setWorldState] = (0, import_react18.useState)(null);
  const [selected, setSelected] = (0, import_react18.useState)(null);
  const [clock, setClock] = (0, import_react18.useState)(() => formatClock(Date.now()));
  (0, import_react18.useEffect)(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get(`/api/world/state${query}`).then(setWorldState).catch(() => void 0);
  }, [channel]);
  (0, import_react18.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const kingdom = worldState?.channel_kingdom ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(GuideBubble, { flag: "city_seen", message: "Este \xE9 o centro do Reino." }),
    /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("div", { className: "card city-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("h1", { children: "Capital" }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: "A cidade onde toda a jornada do Reino acontece." }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("label", { children: [
        "Reino atual",
        /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
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
    selected ? /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("div", { className: "card city-building", children: [
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("button", { type: "button", className: "city-back-btn", onClick: () => setSelected(null), children: "\u2190 Voltar \xE0 Pra\xE7a Central" }),
      selected === "arena" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(ArenaBuilding, { identity, kingdom }) : null,
      selected === "ferreiro" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(BlacksmithBuilding, { equipped: character?.equipped ?? [] }) : null,
      selected === "mercador" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(MerchantBuilding, {}) : null,
      selected === "alquimista" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(AlchemistBuilding, {}) : null,
      selected === "guilda" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(GuildBuilding, { kingdom, identity }) : null,
      selected === "banco" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(BankBuilding, { character }) : null,
      selected === "portao-norte" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(NorthGateBuilding, { enabled: !!profile }) : null,
      selected === "biblioteca" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(LibraryBuilding, {}) : null,
      selected === "bestiario" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(BestiaryBuilding, {}) : null,
      selected === "museu" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(MuseumBuilding, {}) : null,
      selected === "taverna" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TavernBuilding, {}) : null,
      selected === "casa-dos-viajantes" ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(TravellerHouseBuilding, {}) : null
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("h2", { children: "Pra\xE7a Central" }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
        CityHubBar,
        {
          worldState,
          clock,
          channelDisplayName: kingdom?.channel_display_name ?? null
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(CitySquareDecor, {}),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: "Escolha um edif\xEDcio para visitar." }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(CityMap, { onSelect: setSelected }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("h3", { className: "hidden-objects-title", children: "Pela pra\xE7a" }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: "Alguns cantos da pra\xE7a respondem quando voc\xEA clica neles." }),
      /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(HiddenObjects, {})
    ] })
  ] });
}
export {
  CityPage
};
