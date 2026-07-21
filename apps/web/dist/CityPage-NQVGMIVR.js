import {
  EldrinGuide,
  ExpeditionPanel,
  buildExpeditionSpecializationContext,
  buildLiveGuideContext,
  getExpeditionSpecialization,
  getRecommendedSurface
} from "./chunk-Y7FC6TWN.js";
import {
  StatsRow
} from "./chunk-J6VXZSCO.js";
import {
  GuideBubble
} from "./chunk-VZ6MUIXB.js";
import {
  useExpedition
} from "./chunk-XPXPPQV6.js";
import {
  CLOCK_TICK_MS
} from "./chunk-LCT2CGOO.js";
import {
  useAuth
} from "./chunk-NCYLE5LN.js";
import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import "./chunk-ATYDFFRC.js";
import {
  CityMap,
  NpcIntro,
  buildMicroEventContext,
  buildWorldCohesionContext,
  getMicroEvent,
  getWorldCohesionLine
} from "./chunk-JJDDG3ZM.js";
import {
  HallOfFame,
  RegionGallery
} from "./chunk-646EJ6LR.js";
import {
  EquipmentSlots
} from "./chunk-INHR2XNO.js";
import {
  BESTIARY_HIGHLIGHT_PRIORITY,
  LIBRARY_HIGHLIGHT_PRIORITY,
  MUSEUM_HIGHLIGHT_PRIORITY,
  buildWorldVisualContext,
  feedbackClassName,
  getLiveHighlights,
  getSingleHighlight,
  getWorldVisualClass,
  resolveFeedback
} from "./chunk-3SXGP2NO.js";
import "./chunk-W3P4YRUG.js";
import {
  buildCollectionInsightContext,
  getBestiaryInsight,
  getLibraryInsight,
  getMuseumInsight
} from "./chunk-SMRWZSNT.js";
import {
  BOOKS,
  BOOK_CATEGORIES,
  CREATURES,
  CREATURE_TYPES,
  DANGER_LABEL,
  EMPTY_ECHO_CONTEXT,
  MUSEUM_CATEGORIES,
  MUSEUM_ENTRIES,
  MUSEUM_STATUS_LABEL,
  NPCS,
  NPC_DIALOGUE,
  STORY_CATEGORIES,
  TAVERN_CONVERSATIONS,
  TAVERN_NIGHT_SONGS,
  TAVERN_RUMORS,
  TAVERN_WALL_NOTES,
  TRAVELLER_STORIES,
  buildExpeditionEchoContext,
  getBookDiscoveryCandidates,
  getBookEchoLine,
  getBookRecommendations,
  getBookRelated,
  getCreatureDiscoveryCandidates,
  getCreatureEchoLine,
  getCreatureMentions,
  getCreatureThreadCandidates,
  getHeroJourneyPlaceLine,
  getLibraryEchoLine,
  getMuseumBookThreadCandidates,
  getMuseumDiscoveryCandidates,
  getNextSteps,
  getRecentEvents,
  getRegionName as getRegionName2,
  getRelatedStoriesAcrossRegions,
  getSimilarRumors,
  keySalt,
  pickByTime,
  pickKnowledge,
  pickOfTheDay,
  recordEvent,
  regionFilterOptions,
  resolveRotatingLine
} from "./chunk-RHKKRLPV.js";
import {
  STAGE_GUILD_AMBIENT,
  buildPlayerFacts,
  getCharacterStage,
  useCharacter,
  useKingdomRole
} from "./chunk-3U2FLU6U.js";
import {
  FOUNDER_TITLE_SLUGS
} from "./chunk-LIYTWNFS.js";
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
import {
  getRegionName
} from "./chunk-S4O55MUY.js";
import {
  hasRemembered,
  isFlagSet,
  remember
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/CityPage.tsx
var import_react24 = __toESM(require_react(), 1);

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
    texts: [
      "A est\xE1tua n\xE3o tem rosto.",
      "Ningu\xE9m sabe por qu\xEA.",
      "Voc\xEA tamb\xE9m n\xE3o vai descobrir hoje.",
      "Dizem que ela tem uma irm\xE3 nas Ru\xEDnas Esquecidas \u2014 tamb\xE9m sem rosto. Ningu\xE9m sabe se \xE9 coincid\xEAncia."
    ]
  },
  {
    key: "janela",
    icon: "\u{1FA9F}",
    name: "Janela",
    description: "Uma janela baixa, de uma casa qualquer.",
    texts: [
      "A janela est\xE1 fechada.",
      "Voc\xEA espia por ela mesmo assim.",
      "N\xE3o tem nada demais l\xE1 dentro.",
      "Ou talvez tenha, e voc\xEA n\xE3o percebeu.",
      "Um corvo solit\xE1rio observa do parapeito. Algu\xE9m jura que \xE9 sempre o mesmo, o Corvo Anci\xE3o, ano ap\xF3s ano."
    ]
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
    texts: [
      "A bigorna est\xE1 fria.",
      "Voc\xEA bate nela uma vez.",
      "Nada acontece, exceto o barulho.",
      "O barulho j\xE1 valeu a pena.",
      "Ao lado, um par de luvas rasgadas espera por algu\xE9m. Talvez por voc\xEA, de novo."
    ]
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
    texts: [
      "Um espelho rachado num canto.",
      "Voc\xEA se olha nele.",
      "Parece voc\xEA, s\xF3 que um pouco mais cansado.",
      "O espelho n\xE3o mente. Isso \xE9 o pior.",
      "Suas luvas rasgadas aparecem no reflexo exatamente do jeito que est\xE3o na vida real. Nem o espelho ajuda nessa."
    ]
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
      "As ma\xE7\xE3s da pra\xE7a continuam desaparecendo, mas n\xE3o foi voc\xEA dessa vez.",
      "Voc\xEA tenta cortar o p\xE3o com suas luvas rasgadas. O p\xE3o vence."
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
    texts: [
      "Um sino pequeno pendurado numa porta.",
      "Voc\xEA toca o sino.",
      "Ningu\xE9m aparece.",
      "Voc\xEA toca de novo, s\xF3 para garantir.",
      "N\xE3o \xE9 o Sino da Torre, mas o som lembra um pouco. Talvez seja por isso que ningu\xE9m aparece r\xE1pido."
    ]
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

// apps/web/src/lib/worldPresence.ts
var HIGH_POPULATION_THRESHOLD = 5;
var WORLD_PRESENCE_LINES = {
  clima: {
    praca: "O tempo muda o jeito como a pra\xE7a se move hoje.",
    ferreiro: "Borin resmunga mais que o normal com esse tempo.",
    biblioteca: "Poucos visitantes apareceram hoje \u2014 o tempo n\xE3o ajudou."
  },
  celebracoes: {
    praca: "A pra\xE7a parece mais animada hoje.",
    taverna: "O sal\xE3o est\xE1 especialmente barulhento hoje."
  },
  reino: {
    praca: "Algo no ar sugere que o Reino guarda um assunto reservado hoje.",
    guilda: "Os aventureiros parecem inquietos hoje."
  },
  militar: {
    praca: "H\xE1 mais guardas circulando pela pra\xE7a hoje.",
    taverna: "Mais mercen\xE1rios que o normal ocupam as mesas hoje.",
    ferreiro: "A forja trabalha sem descanso hoje.",
    guilda: "Os aventureiros treinam com mais afinco hoje.",
    "portao-norte": "H\xE1 mais guardas observando a estrada hoje."
  },
  natureza: {
    praca: "Corvos cruzam o c\xE9u da Capital com mais frequ\xEAncia hoje.",
    bestiario: "Alguns aventureiros comentam uma criatura vista recentemente."
  },
  cidade: {
    praca: "A pra\xE7a parece mais movimentada hoje.",
    museu: "Uma vitrine recebeu mais aten\xE7\xE3o dos visitantes hoje."
  },
  cultura: {
    biblioteca: "Miriam separou alguns livros raros pra quem quiser ver.",
    museu: "Alaric organizou uma pequena exposi\xE7\xE3o tempor\xE1ria."
  },
  taverna: {
    taverna: "O sal\xE3o est\xE1 lotado hoje.",
    praca: "Risadas da Taverna chegam at\xE9 a pra\xE7a hoje."
  },
  misterios: {
    praca: "Um sil\xEAncio estranho toma conta da pra\xE7a hoje.",
    bestiario: "Yannick evita comentar o que ouviu ontem \xE0 noite.",
    museu: "Alaric passou a manh\xE3 catalogando algo que prefere n\xE3o explicar."
  }
};
function getWorldPresenceLine(building, ctx) {
  if (building === "praca" && ctx.playersOnline >= HIGH_POPULATION_THRESHOLD) {
    return "Hoje a pra\xE7a parece mais movimentada.";
  }
  return WORLD_PRESENCE_LINES[ctx.eventCategory]?.[building] ?? null;
}

// apps/web/src/components/ui/WorldPresenceLine.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function WorldPresenceLine({ building, ctx }) {
  if (!ctx) return null;
  const line = getWorldPresenceLine(building, ctx);
  if (!line) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "hint", children: line });
}

// apps/web/src/lib/environmentalStorytelling.ts
var PLACE_VARIANTS = {
  // Grounded em "A Vida no Reino" (lib/library.ts) — a Fonte da praça
  // já é citada lá como um dos "pequenos marcos que todo mundo conhece".
  praca: [{ line: "A Fonte da pra\xE7a ainda molha as pedras ao redor, mesmo sem ningu\xE9m por perto." }],
  ferreiro: [{ line: "Algumas ferramentas ainda est\xE3o quentes sobre a bancada." }],
  biblioteca: [{ line: "Um livro foi deixado aberto sobre uma mesa." }],
  museu: [{ line: "Uma placa antiga parece ter sido recentemente limpa." }],
  guilda: [{ line: "Marcas profundas de espada cobrem uma parede." }],
  taverna: [{ line: "Uma cadeira permanece vazia, como se algu\xE9m tivesse acabado de sair." }],
  "casa-dos-viajantes": [{ line: "Um mapa possui novas anota\xE7\xF5es feitas \xE0 m\xE3o." }],
  "portao-norte": [
    {
      when: (ctx) => ctx.worldEventCategory === "militar",
      line: "Pegadas de botas pesadas marcam a lama perto do port\xE3o \u2014 a patrulha passou h\xE1 pouco."
    },
    { line: "Pegadas recentes desaparecem na estrada." }
  ],
  arena: [{ line: "Marcas antigas de combate continuam vis\xEDveis." }]
};
function getEnvironmentalLine(place, ctx = {}) {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}

// apps/web/src/lib/worldSimulation.ts
var PLACE_VARIANTS2 = {
  praca: [{ line: "Um grupo de viajantes acabou de seguir para o norte." }],
  ferreiro: [{ line: "Mais cedo algu\xE9m encomendou uma espada incomum." }],
  biblioteca: [{ line: "Poucos minutos atr\xE1s um velho manuscrito foi devolvido." }],
  museu: [{ line: "Uma pe\xE7a foi movida para outra vitrine." }],
  guilda: [{ line: "Uma equipe saiu para uma expedi\xE7\xE3o." }],
  arena: [{ line: "Um duelo terminou h\xE1 pouco tempo." }],
  "portao-norte": [{ line: "Os guardas acabaram de liberar uma caravana." }],
  "casa-dos-viajantes": [{ line: "Um explorador deixou novas anota\xE7\xF5es sobre a estrada." }],
  taverna: [
    {
      when: (ctx) => ctx.worldEventCategory === "celebracoes",
      line: "Algu\xE9m acabou de contar uma hist\xF3ria t\xE3o boa que a Taverna inteira parou pra ouvir."
    },
    { line: "Algu\xE9m acabou de contar uma hist\xF3ria curiosa." }
  ]
};
function getWorldSimulationLine(place, ctx = {}) {
  return resolveRotatingLine(PLACE_VARIANTS2[place], ctx, keySalt(place));
}

// apps/web/src/lib/landmarkIdentity.ts
var LANDMARK_IDENTITY = {
  praca: "Mais cedo ou mais tarde, todos acabam voltando para c\xE1.",
  ferreiro: "O cheiro de metal aquecido parece nunca desaparecer.",
  biblioteca: "\xC9 dif\xEDcil entrar aqui sem acabar descobrindo algo novo.",
  museu: "Cada visita revela um detalhe que passou despercebido.",
  guilda: "Nunca faltam planos para uma nova expedi\xE7\xE3o.",
  taverna: "Quem permanece tempo suficiente sempre acaba ouvindo uma boa hist\xF3ria.",
  "casa-dos-viajantes": "Quase toda hist\xF3ria importante passou por esta mesa.",
  "portao-norte": "Toda grande jornada come\xE7a atravessando este port\xE3o.",
  arena: "At\xE9 o sil\xEAncio aqui parece esperar o pr\xF3ximo combate."
};
function getLandmarkIdentityLine(place) {
  return LANDMARK_IDENTITY[place];
}

// apps/web/src/lib/cityAmbientState.ts
var HIGH_POPULATION_THRESHOLD2 = 5;
var PLACE_VARIANTS3 = {
  // Reage a players_online (mesmo sinal real de World Presence, eixo
  // diferente: aqui é só o objeto físico — bancos —, nunca o
  // "movimento"/"humor" da praça que World Presence já cobre.
  praca: [
    { when: (ctx) => (ctx.playersOnline ?? 0) >= HIGH_POPULATION_THRESHOLD2, line: "V\xE1rios bancos da pra\xE7a est\xE3o ocupados." },
    { line: "Um banco da pra\xE7a est\xE1 ocupado." }
  ],
  // Reage ao evento "militar" (mesma categoria real que World Presence
  // usa pra "A forja trabalha sem descanso hoje." — aqui o vestígio é
  // outro: carvão ainda fumegando, nunca a mesma frase sobre a forja
  // "trabalhando").
  ferreiro: [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "Restos de carv\xE3o ainda fumegam ao lado de v\xE1rias bancadas." },
    { line: "Restos de carv\xE3o ainda fumegam ao lado da bancada." }
  ],
  biblioteca: [{ line: "Algumas cadeiras da Biblioteca ainda est\xE3o fora do lugar." }],
  museu: [{ line: "Uma pe\xE7a est\xE1 coberta por um pano, \xE0 espera de restaura\xE7\xE3o." }],
  // Duas variantes fixas, sem sinal nenhum — rotação diária pura (o
  // mesmo mecanismo de ES/WS quando há mais de uma variante fixa).
  guilda: [
    { line: "Alguns mapas ainda est\xE3o abertos sobre a mesa de reuni\xF5es." },
    { line: "Um banco perto da mesa de reuni\xF5es ainda est\xE1 fora do lugar." }
  ],
  arena: [{ line: "A areia da arena ainda est\xE1 revirada em alguns pontos." }],
  "portao-norte": [{ line: "Marcas de rodas de carro\xE7a ainda cortam a lama da entrada." }],
  "casa-dos-viajantes": [{ line: "Algumas mochilas ainda esperam encostadas perto da porta." }],
  taverna: [{ line: "Algumas canecas na mesa ainda est\xE3o \xFAmidas." }]
};
function getCityAmbientLine(place, ctx = {}) {
  return resolveRotatingLine(PLACE_VARIANTS3[place], ctx, keySalt(place));
}

// apps/web/src/lib/kingdomEvolution.ts
function buildKingdomEvolutionContext(facts, insightCtx, worldPresenceCtx) {
  return {
    facts,
    booksRead: insightCtx?.booksRead ?? 0,
    creaturesViewed: insightCtx?.creaturesViewed ?? 0,
    museumEntriesViewed: insightCtx?.museumEntriesViewed ?? 0,
    playersOnline: worldPresenceCtx?.playersOnline ?? 0,
    worldEventCategory: worldPresenceCtx?.eventCategory
  };
}
var HIGH_POPULATION_THRESHOLD3 = 5;
function getKingdomEvolutionLine(place, ctx) {
  switch (place) {
    case "praca":
      return ctx.playersOnline >= HIGH_POPULATION_THRESHOLD3 ? "A cidade recebe cada vez mais visitantes." : "Aos poucos, mais gente come\xE7a a passar pela Capital.";
    case "portao-norte":
      return ctx.facts.regionsDiscovered >= 5 ? "As estradas parecem mais movimentadas." : "Novas rotas come\xE7am a se abrir para fora da Capital.";
    case "ferreiro":
      return ctx.facts.bossesDefeated >= 3 ? "Algumas constru\xE7\xF5es recebem manuten\xE7\xE3o constante." : "Pequenos reparos come\xE7am a aparecer pela forja.";
    case "taverna":
      return ctx.facts.totalMinutes >= 300 ? "O movimento comercial cresce lentamente." : "O com\xE9rcio ainda d\xE1 os primeiros passos por aqui.";
    case "biblioteca":
      return ctx.booksRead >= 4 ? "O acervo do Reino parece crescer a cada semana." : "Novos registros come\xE7am a ocupar as prateleiras.";
    case "museu":
      return ctx.museumEntriesViewed >= 3 ? "O Museu recebe cada vez mais pe\xE7as para preservar." : "O acervo do Museu come\xE7a a tomar forma.";
    case "guilda":
      return ctx.facts.hasKingdomRole ? "A Guilda parece reunir cada vez mais nomes de peso." : "A Guilda ainda constr\xF3i sua pr\xF3pria hist\xF3ria.";
    case "casa-dos-viajantes":
      return ctx.creaturesViewed >= 4 ? "Cada vez mais relatos chegam de al\xE9m das muralhas." : "Os primeiros relatos de fora come\xE7am a chegar.";
    case "arena":
      if (ctx.worldEventCategory === "militar") return "H\xE1 sinais de que as defesas do Reino se fortalecem.";
      return ctx.facts.hasFounderTitle ? "H\xE1 sinais de que o Reino continua se expandindo." : "O Reino ainda desenha os primeiros passos da sua expans\xE3o.";
  }
}

// apps/web/src/lib/buildingProgression.ts
function buildBuildingProgressionContext(facts, insightCtx, worldPresenceCtx) {
  return {
    facts,
    booksRead: insightCtx?.booksRead ?? 0,
    creaturesViewed: insightCtx?.creaturesViewed ?? 0,
    museumEntriesViewed: insightCtx?.museumEntriesViewed ?? 0,
    playersOnline: worldPresenceCtx?.playersOnline ?? 0
  };
}
var BOOKS_READ_THRESHOLDS = [2, 4, 8];
var MUSEUM_ENTRIES_THRESHOLDS = [1, 3, 6];
var CREATURES_VIEWED_THRESHOLDS = [2, 4, 8];
var GUILD_BOSSES_THRESHOLDS = [1, 3, 6];
var ARENA_BOSSES_THRESHOLDS = [1, 4, 8];
var REGIONS_DISCOVERED_THRESHOLDS = [3, 6, 9];
var TOTAL_MINUTES_THRESHOLDS = [60, 180, 480];
var PRACA_REGIONS_THRESHOLDS = [3, 6, 9];
var HIGH_POPULATION_THRESHOLD4 = 5;
var EQUIPMENT_TIER_STAGE = {
  none: "stage-1",
  weak: "stage-2",
  notable: "stage-3",
  strong: "stage-4"
};
var STAGE_RANK = { "stage-1": 1, "stage-2": 2, "stage-3": 3, "stage-4": 4 };
function stageFromThresholds(value, thresholds) {
  if (value >= thresholds[2]) return "stage-4";
  if (value >= thresholds[1]) return "stage-3";
  if (value >= thresholds[0]) return "stage-2";
  return "stage-1";
}
function bumpStage(stage, amount) {
  const rank = Math.min(4, Math.max(1, STAGE_RANK[stage] + amount));
  return `stage-${rank}`;
}
function getBuildingStage(place, ctx) {
  switch (place) {
    case "biblioteca":
      return stageFromThresholds(ctx.booksRead, BOOKS_READ_THRESHOLDS);
    case "museu":
      return stageFromThresholds(ctx.museumEntriesViewed, MUSEUM_ENTRIES_THRESHOLDS);
    case "bestiario":
      return stageFromThresholds(ctx.creaturesViewed, CREATURES_VIEWED_THRESHOLDS);
    case "guilda":
      return stageFromThresholds(ctx.facts.bossesDefeated, GUILD_BOSSES_THRESHOLDS);
    case "ferreiro":
      return EQUIPMENT_TIER_STAGE[ctx.facts.equipmentTier];
    case "arena":
      return stageFromThresholds(ctx.facts.bossesDefeated, ARENA_BOSSES_THRESHOLDS);
    case "casa-dos-viajantes":
      return stageFromThresholds(ctx.facts.regionsDiscovered, REGIONS_DISCOVERED_THRESHOLDS);
    case "taverna":
      return stageFromThresholds(ctx.facts.totalMinutes, TOTAL_MINUTES_THRESHOLDS);
    case "portao-norte":
      return ctx.facts.hasKingdomRole ? "stage-4" : "stage-1";
    case "praca": {
      const base = stageFromThresholds(ctx.facts.regionsDiscovered, PRACA_REGIONS_THRESHOLDS);
      return ctx.playersOnline >= HIGH_POPULATION_THRESHOLD4 ? bumpStage(base, 1) : base;
    }
  }
}
function getBuildingStageClass(place, ctx) {
  return `building-${getBuildingStage(place, ctx)}`;
}

// apps/web/src/lib/reactiveWorld.ts
function buildReactiveWorldContext(facts, insightCtx, worldPresenceCtx) {
  return {
    facts,
    booksRead: insightCtx?.booksRead ?? 0,
    creaturesViewed: insightCtx?.creaturesViewed ?? 0,
    museumEntriesViewed: insightCtx?.museumEntriesViewed ?? 0,
    playersOnline: worldPresenceCtx?.playersOnline ?? 0,
    worldEventCategory: worldPresenceCtx?.eventCategory
  };
}
var HIGH_POPULATION_THRESHOLD5 = 5;
var BOOKS_READ_GROWING_THRESHOLD = 6;
var MUSEUM_ENTRIES_IMPORTANT_THRESHOLD = 4;
var CREATURES_VIEWED_IMPORTANT_THRESHOLD = 6;
var GUILD_BOSSES_ACTIVE_THRESHOLD = 3;
var TAVERN_MINUTES_BUSY_THRESHOLD = 300;
var REGIONS_DISCOVERED_GROWING_THRESHOLD = 5;
function getReactiveState(place, ctx) {
  switch (place) {
    case "praca":
      return ctx.playersOnline >= HIGH_POPULATION_THRESHOLD5 ? "busy" : "normal";
    case "biblioteca":
      return ctx.booksRead >= BOOKS_READ_GROWING_THRESHOLD ? "growing" : "normal";
    case "museu":
      return ctx.museumEntriesViewed >= MUSEUM_ENTRIES_IMPORTANT_THRESHOLD ? "important" : "normal";
    case "bestiario":
      return ctx.creaturesViewed >= CREATURES_VIEWED_IMPORTANT_THRESHOLD ? "important" : "normal";
    case "guilda":
      return ctx.facts.bossesDefeated >= GUILD_BOSSES_ACTIVE_THRESHOLD ? "active" : "normal";
    case "ferreiro":
      return ctx.facts.equipmentTier === "strong" ? "busy" : "normal";
    case "arena":
      return ctx.worldEventCategory === "militar" ? "active" : "normal";
    case "taverna":
      return ctx.facts.totalMinutes >= TAVERN_MINUTES_BUSY_THRESHOLD ? "busy" : "normal";
    case "casa-dos-viajantes":
      return ctx.facts.regionsDiscovered >= REGIONS_DISCOVERED_GROWING_THRESHOLD ? "growing" : "normal";
    case "portao-norte":
      return ctx.facts.hasKingdomRole ? "important" : "normal";
  }
}
function getReactiveClass(place, ctx) {
  return `reactive-${getReactiveState(place, ctx)}`;
}

// apps/web/src/components/city/BlacksmithBuilding.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var BLACKSMITH_DECOR = {
  "stage-1": "\u2694\uFE0F",
  "stage-2": "\u2694\uFE0F\u{1F5E1}\uFE0F",
  "stage-3": "\u{1F94B}",
  "stage-4": "\u{1F94B} \u{1F6E1}\uFE0F"
};
function BlacksmithBuilding({ equipped, worldPresenceCtx, playerFacts = null }) {
  const hasSeenFirstItem = isFlagSet("first_item_announced");
  const environmentalLine = getEnvironmentalLine("ferreiro");
  const worldSimulationLine = getWorldSimulationLine("ferreiro");
  const landmarkIdentityLine = getLandmarkIdentityLine("ferreiro");
  const cityAmbientLine = getCityAmbientLine("ferreiro", { worldEventCategory: worldPresenceCtx?.eventCategory });
  const microEventLine = getMicroEvent("ferreiro");
  const worldCohesionLine = getWorldCohesionLine("ferreiro", buildWorldCohesionContext(worldPresenceCtx));
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("ferreiro", buildKingdomEvolutionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("ferreiro", buildBuildingProgressionContext(playerFacts)) : null;
  const buildingStage = playerFacts ? getBuildingStage("ferreiro", buildBuildingProgressionContext(playerFacts)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("ferreiro", buildReactiveWorldContext(playerFacts)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass("building", buildWorldVisualContext({ buildingReactiveState: getReactiveState("ferreiro", buildReactiveWorldContext(playerFacts)) })) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { className: `city-building-screen city-building-ferreiro${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { children: "\u{1F6E0}\uFE0F Ferreiro" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "building-decor", children: BLACKSMITH_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(NpcIntro, { npc: NPCS.ferreiro }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: "Seus equipamentos atuais, prontos para a pr\xF3xima forja." }),
    hasSeenFirstItem ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: '"...acho que essas luvas serviram para alguma coisa."' }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(EquipmentSlots, { equipped }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "city-building-banner", children: "Forja dispon\xEDvel em breve." }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(WorldPresenceLine, { building: "ferreiro", ctx: worldPresenceCtx }),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/components/city/AlchemistBuilding.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var ALCHEMY_ITEMS = [
  { icon: "\u{1F9EA}", label: "Po\xE7\xF5es" },
  { icon: "\u{1F9C9}", label: "Frascos" },
  { icon: "\u{1F33F}", label: "Ingredientes" },
  { icon: "\u{1F344}", label: "Ingredientes" },
  { icon: "\u2697\uFE0F", label: "Frascos" },
  { icon: "\u{1F9EB}", label: "Po\xE7\xF5es" }
];
function AlchemistBuilding() {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { children: "\u2697\uFE0F Alquimista" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(NpcIntro, { npc: NPCS.alquimista }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "alchemist-shelf", children: ALCHEMY_ITEMS.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "alchemist-shelf-item", title: item.label, children: item.icon }, i)) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "city-building-banner", children: "Ainda estou preparando minhas misturas." })
  ] });
}

// apps/web/src/components/city/GuildBuilding.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var GUILD_DECOR = {
  "stage-1": "\u{1F5FA}\uFE0F",
  "stage-2": "\u{1F5FA}\uFE0F \u{1F5BC}\uFE0F",
  "stage-3": "\u{1F5FA}\uFE0F \u{1F5BC}\uFE0F \u{1F4DC}",
  "stage-4": "\u{1F3C6} \u{1F4DC}\u{1F4DC}"
};
function GuildBuilding({
  kingdom,
  identity,
  character,
  kingdomRoles,
  worldPresenceCtx,
  echoContext = EMPTY_ECHO_CONTEXT
}) {
  const founderTitles = identity?.titles.filter((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)) ?? [];
  const environmentalLine = getEnvironmentalLine("guilda");
  const worldSimulationLine = getWorldSimulationLine("guilda");
  const landmarkIdentityLine = getLandmarkIdentityLine("guilda");
  const cityAmbientLine = getCityAmbientLine("guilda");
  const microEventLine = getMicroEvent("guilda");
  const worldCohesionLine = getWorldCohesionLine("guilda", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  const facts = character && identity ? buildPlayerFacts(character, identity, kingdomRoles ?? []) : null;
  const kingdomEvolutionLine = facts ? getKingdomEvolutionLine("guilda", buildKingdomEvolutionContext(facts, void 0, worldPresenceCtx)) : null;
  const buildingStageClass = facts ? getBuildingStageClass("guilda", buildBuildingProgressionContext(facts)) : null;
  const buildingStage = facts ? getBuildingStage("guilda", buildBuildingProgressionContext(facts)) : null;
  const reactiveClass = facts ? getReactiveClass("guilda", buildReactiveWorldContext(facts)) : null;
  const worldVisualClass = facts ? getWorldVisualClass("building", buildWorldVisualContext({ buildingReactiveState: getReactiveState("guilda", buildReactiveWorldContext(facts)) })) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: `city-building-screen city-building-guilda${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { children: "\u{1F3DB}\uFE0F Guilda" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "building-decor", children: GUILD_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(NpcIntro, { npc: NPCS.guildmaster }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: "O Hall da Fama do Reino \u2014 quem carrega os cargos mais importantes hoje." }),
    kingdom ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(HallOfFame, { slots: kingdom.hall_of_fame }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: "Informe um Reino na Pra\xE7a Central para ver o Hall da Fama." }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h3", { className: "identity-subtitle", children: "Fundadores" }),
    founderTitles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("ul", { className: "city-founder-list", children: founderTitles.map((title) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("li", { children: [
      "\u{1F451} ",
      title.name
    ] }, title.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: "Nenhum t\xEDtulo de fundador conquistado ainda." }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(WorldPresenceLine, { building: "guilda", ctx: worldPresenceCtx }),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null,
    facts ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: STAGE_GUILD_AMBIENT[getCharacterStage(facts)] }) : null
  ] });
}

// apps/web/src/components/city/BankBuilding.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function BankBuilding({ character }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h2", { children: "\u{1F3E6} Banco" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(NpcIntro, { npc: NPCS.tesoureiro }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "hint", children: "Seu ouro estar\xE1 seguro comigo \u2014 sem dep\xF3sito, sem saque, s\xF3 consulta." }),
    character ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      StatsRow,
      {
        items: [
          { label: "Gold atual", value: character.gold.toFixed(1), highlight: true },
          { label: "N\xEDvel", value: character.level },
          { label: "XP total", value: character.xp },
          { label: "Minutos assistidos", value: character.total_minutes }
        ]
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "loading-state", children: "Carregando conta..." })
  ] });
}

// apps/web/src/components/city/ArenaBuilding.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
var ARENA_DECOR = {
  "stage-1": "",
  "stage-2": "\u{1F6A9}",
  "stage-3": "\u{1F6A9}\u{1F6A9}",
  "stage-4": "\u{1F6A9}\u{1F6A9} \u{1F3C6}"
};
function ArenaBuilding({ identity, kingdom, worldPresenceCtx, playerFacts = null }) {
  const environmentalLine = getEnvironmentalLine("arena");
  const worldSimulationLine = getWorldSimulationLine("arena");
  const landmarkIdentityLine = getLandmarkIdentityLine("arena");
  const cityAmbientLine = getCityAmbientLine("arena");
  const microEventLine = getMicroEvent("arena");
  const worldCohesionLine = getWorldCohesionLine("arena", buildWorldCohesionContext(worldPresenceCtx));
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("arena", buildKingdomEvolutionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("arena", buildBuildingProgressionContext(playerFacts)) : null;
  const buildingStage = playerFacts ? getBuildingStage("arena", buildBuildingProgressionContext(playerFacts)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("arena", buildReactiveWorldContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("arena", buildReactiveWorldContext(playerFacts, void 0, worldPresenceCtx)) })
  ) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: `city-building-screen city-building-arena${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { children: "\u{1F3DF}\uFE0F Arena" }),
    buildingStage && ARENA_DECOR[buildingStage] ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "building-decor", children: ARENA_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(NpcIntro, { npc: NPCS.mestreArena }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: "Os feitos de combate contra os Bosses \u2014 somente leitura." }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
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
    ),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/components/city/NorthGateBuilding.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var NORTH_GATE_DECOR = {
  "stage-1": "\u{1F6E1}\uFE0F",
  "stage-2": "\u{1F6E1}\uFE0F\u{1F6E1}\uFE0F",
  "stage-3": "\u{1F531}",
  "stage-4": "\u{1F531} \u{1F6A9}"
};
function NorthGateBuilding({
  enabled,
  worldPresenceCtx,
  echoContext = EMPTY_ECHO_CONTEXT,
  specializationLine,
  playerFacts = null
}) {
  const environmentalLine = getEnvironmentalLine("portao-norte", { worldEventCategory: worldPresenceCtx?.eventCategory });
  const worldSimulationLine = getWorldSimulationLine("portao-norte");
  const landmarkIdentityLine = getLandmarkIdentityLine("portao-norte");
  const cityAmbientLine = getCityAmbientLine("portao-norte");
  const microEventLine = getMicroEvent("portao-norte", buildMicroEventContext(worldPresenceCtx));
  const worldCohesionLine = getWorldCohesionLine("portao-norte", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("portao-norte", buildKingdomEvolutionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("portao-norte", buildBuildingProgressionContext(playerFacts)) : null;
  const buildingStage = playerFacts ? getBuildingStage("portao-norte", buildBuildingProgressionContext(playerFacts)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("portao-norte", buildReactiveWorldContext(playerFacts)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("portao-norte", buildReactiveWorldContext(playerFacts)) })
  ) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: `city-building-screen city-building-portao-norte${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { children: "\u{1F6AA} Port\xE3o Norte" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "building-decor", children: NORTH_GATE_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(NpcIntro, { npc: NPCS.guarda, echoContext }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: "A sa\xEDda da Capital para o mundo \u2014 regi\xF5es desbloqueadas e sua expedi\xE7\xE3o atual." }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(ExpeditionPanel, { enabled, specializationLine }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h3", { className: "identity-subtitle", children: "Regi\xF5es desbloqueadas" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(RegionGallery, { echoContext }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(WorldPresenceLine, { building: "portao-norte", ctx: worldPresenceCtx }),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/components/city/LibraryBuilding.tsx
var import_react11 = __toESM(require_react(), 1);

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
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function CodexEmptyState({ message }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "hint", children: message });
}

// apps/web/src/components/codex/CodexSidebar.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function CodexSidebar({ toolbar, isEmpty, emptyMessage, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "book-shelf", children: [
    toolbar,
    isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CodexEmptyState, { message: emptyMessage }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "book-shelf-list", children })
  ] });
}

// apps/web/src/components/codex/CodexSearch.tsx
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
function CodexSearch({ value, onChange, placeholder }) {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
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
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
function CodexToolbar({ searchValue, onSearchChange, searchPlaceholder, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(import_jsx_runtime15.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CodexSearch, { value: searchValue, onChange: onSearchChange, placeholder: searchPlaceholder }),
    children
  ] });
}

// apps/web/src/components/codex/CodexFilter.tsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
var CodexFilter = (0, import_react3.memo)(function CodexFilter2({ allLabel, options, selected, onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(import_jsx_runtime16.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
      "button",
      {
        type: "button",
        className: `book-category-chip${selected === null ? " book-category-chip-active" : ""}`,
        onClick: () => onSelect(null),
        children: allLabel
      }
    ),
    options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
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
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
function CodexCategoryList({
  categories,
  selected,
  onSelect,
  allLabel = "Todas"
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "book-category-filter", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
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
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
function CodexStatusBadge({ label, className = "book-card-status" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className, children: label });
}

// apps/web/src/components/codex/CodexCard.tsx
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
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
  onSelect,
  feedbackState = null
}) {
  const cls = VARIANT_CLASSES[variant];
  const feedbackCls = feedbackClassName(feedbackState);
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
    "button",
    {
      type: "button",
      className: `${cls.root}${selected ? ` ${cls.selected}` : ""}${locked ? ` ${cls.locked}` : ""}${feedbackCls ? ` ${feedbackCls}` : ""}`,
      onClick: onSelect,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: cls.icon, children: icon }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: cls.info, children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("strong", { className: cls.title, children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: cls.meta, children: meta }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(CodexStatusBadge, { label: statusLabel, className: cls.status })
        ] })
      ]
    }
  );
});

// apps/web/src/components/library/BookShelf.tsx
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
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
function BookShelf({ books, selectedBookId, onSelectBook, highlightedBookId = null }) {
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
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CodexCategoryList, { categories: BOOK_CATEGORIES, selected: category, onSelect: setCategory }) }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhum livro encontrado.",
      children: filtered.map((book) => {
        const bookCategory = BOOK_CATEGORIES.find((c) => c.slug === book.category);
        return /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          CodexCard,
          {
            icon: bookCategory?.icon ?? "\u{1F4D6}",
            title: book.title,
            meta: book.author,
            statusLabel: STATUS_LABEL[book.status],
            locked: book.locked,
            selected: book.id === selectedBookId,
            onSelect: () => onSelectBook(book.id),
            feedbackState: resolveFeedback(book.id === highlightedBookId, "highlight")
          },
          book.id
        );
      })
    }
  );
}

// apps/web/src/components/library/BookReader.tsx
var import_react9 = __toESM(require_react(), 1);

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
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
var BookPage = (0, import_react7.memo)(function BookPage2({ content, pageNumber, totalPages }) {
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "book-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: "book-page-content", children: renderMarkdownLite(content) }),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "book-page-number", children: [
      "P\xE1gina ",
      pageNumber,
      " de ",
      totalPages
    ] })
  ] });
});

// apps/web/src/components/codex/CodexHeader.tsx
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
function CodexHeader({ icon, title, subtitle }) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)(import_jsx_runtime22.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("h3", { className: "book-reader-title", children: icon ? `${icon} ${title}` : title }),
    subtitle ? /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: "book-reader-author", children: subtitle }) : null
  ] });
}

// apps/web/src/components/codex/CodexInfoPanel.tsx
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
function CodexInfoPanel({ message, hint }) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(import_jsx_runtime23.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("p", { className: "book-reader-locked-message", children: message }),
    hint ? /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("p", { className: "hint", children: hint }) : null
  ] });
}

// apps/web/src/components/codex/CodexFacts.tsx
var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
function CodexFacts({ facts }) {
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "creature-reader-facts", children: facts.map((fact) => /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "creature-reader-fact", children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("span", { children: fact.label }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("strong", { children: fact.value })
  ] }, fact.label)) });
}

// apps/web/src/components/codex/CodexPagination.tsx
var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
function CodexPagination({ pageIndex, totalPages, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsxs)("div", { className: "book-reader-nav", children: [
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)("button", { type: "button", onClick: () => onChange(Math.max(0, pageIndex - 1)), disabled: pageIndex === 0, children: "\u2190 P\xE1gina anterior" }),
    /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
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
var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
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
  pages,
  feedbackState = null
}) {
  const [pageIndex, setPageIndex] = (0, import_react8.useState)(0);
  const feedbackCls = feedbackClassName(feedbackState);
  if (isEmpty) {
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("div", { className: "book-reader book-reader-empty", children: /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(CodexEmptyState, { message: emptyMessage }) });
  }
  if (locked) {
    return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "book-reader book-reader-locked", children: [
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(CodexHeader, { title: lockedTitle, subtitle: lockedSubtitle }),
      /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(CodexInfoPanel, { message: lockedMessage, hint: `Condi\xE7\xE3o de desbloqueio: ${unlockCondition}` })
    ] });
  }
  const totalPages = pages.length;
  const currentPage = pages[Math.min(pageIndex, totalPages - 1)];
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: `book-reader${feedbackCls ? ` ${feedbackCls}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(CodexHeader, { icon, title, subtitle }),
    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)("p", { className: "book-reader-description", children: description }),
    facts && facts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(CodexFacts, { facts }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(BookPage, { content: currentPage, pageNumber: pageIndex + 1, totalPages }),
    /* @__PURE__ */ (0, import_jsx_runtime26.jsx)(CodexPagination, { pageIndex, totalPages, onChange: setPageIndex })
  ] });
}

// apps/web/src/components/library/BookReader.tsx
var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
function BookReader({ book, echoContext = EMPTY_ECHO_CONTEXT, feedbackState = null }) {
  (0, import_react9.useEffect)(() => {
    if (!book || book.locked) return;
    recordEvent("book_read", { bookId: book.id });
    if (!hasRemembered("first_book_read")) {
      remember("first_book_read");
      recordEvent("first_book_read", { bookId: book.id });
    }
  }, [book]);
  const related = book ? getBookRelated(book.id) : [];
  const recommendations = book ? getBookRecommendations(book.id) : [];
  const pages = book?.pages ?? [];
  const withRelated = related.length > 0 ? [...pages, `**Relacionados**

${related.map((r) => `**${r.label}:** ${r.value}`).join("\n\n")}`] : pages;
  const allPages = recommendations.length > 0 ? [...withRelated, `**Leitura recomendada**

${recommendations.map((b) => `**${b.title}** \u2014 ${b.author}`).join("\n\n")}`] : withRelated;
  const discoveryLines = book ? pickKnowledge(getBookDiscoveryCandidates(book.id), echoContext.approach) : [];
  const bookRegionName = related.find((m) => m.label === "Regi\xE3o")?.value ?? null;
  const echoLine = book ? getBookEchoLine(bookRegionName, echoContext) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
    CodexReader,
    {
      feedbackState,
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
      facts: discoveryLines.length > 0 || echoLine ? [
        ...discoveryLines.length > 0 ? [{ label: "Descoberta", value: discoveryLines.join(" ") }] : [],
        ...echoLine ? [{ label: "Eco da Expedi\xE7\xE3o", value: echoLine }] : []
      ] : void 0,
      pages: allPages
    }
  );
}

// apps/web/src/components/codex/CodexLayout.tsx
var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
function CodexLayout({ sidebar, reader }) {
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "library-screen", children: [
    sidebar,
    reader
  ] });
}

// apps/web/src/hooks/useReactiveGlow.ts
var import_react10 = __toESM(require_react(), 1);
function useReactiveGlow(key) {
  const [isNew] = (0, import_react10.useState)(() => !hasRemembered(key));
  (0, import_react10.useEffect)(() => {
    remember(key);
  }, [key]);
  return isNew;
}

// apps/web/src/lib/kingdomMemory.ts
var RULES_BY_BUILDING = {
  taverna: [
    { when: (ctx) => ctx.facts.bossesDefeated >= 6, line: "H\xE1 quem diga que os monstros andam mais cautelosos ultimamente." },
    { when: (ctx) => ctx.facts.bossesDefeated >= 2, line: "Alguns comentam sobre confrontos recentes contra criaturas perigosas." }
  ],
  biblioteca: [
    { when: (ctx) => ctx.facts.regionsDiscovered >= 7, line: "Novos mapas aparecem com mais frequ\xEAncia ultimamente." },
    { when: (ctx) => ctx.facts.regionsDiscovered >= 3, line: "Alguns visitantes comentam sobre terras que poucos exploraram." }
  ],
  museu: [{ when: (ctx) => ctx.booksRead >= 8, line: "Algumas vitrines receberam pequenas anota\xE7\xF5es recentes." }],
  bestiario: [{ when: (ctx) => ctx.creaturesViewed >= 10, line: "Alguns registros receberam observa\xE7\xF5es recentes." }],
  "casa-dos-viajantes": [
    { when: (ctx) => ctx.facts.totalMinutes >= 240, line: "Um viajante jurava ter seguido os mesmos caminhos, h\xE1 tempos." }
  ]
};
function getKingdomMemoryLine(building, ctx, approach) {
  const matched = RULES_BY_BUILDING[building].filter((r) => r.when(ctx)).map((r) => r.line);
  if (matched.length === 0) return null;
  if (approach === "investigate") {
    return getNextSteps([matched], approach).join(" ");
  }
  return pickOfTheDay(matched, keySalt(building));
}

// apps/web/src/components/city/LibraryBuilding.tsx
var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
var LIBRARY_DECOR = {
  "stage-1": "\u{1F4DA}",
  "stage-2": "\u{1F4DA}\u{1F4DA}",
  "stage-3": "\u{1F4DA}\u{1F4DA} \u{1F5C2}\uFE0F",
  "stage-4": "\u{1F4DA}\u{1F4DA}\u{1F4DA} \u{1F5C2}\uFE0F\u{1F4D6}"
};
function LibraryBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }) {
  const [selectedBookId, setSelectedBookId] = (0, import_react11.useState)(null);
  const selectedBook = BOOKS.find((book) => book.id === selectedBookId) ?? null;
  const { character } = useCharacter(true);
  const unlockedBooksCount = BOOKS.filter((b) => !b.locked).length;
  const bookOfTheDay = (0, import_react11.useMemo)(() => {
    const unlocked = BOOKS.filter((b) => !b.locked);
    return unlocked.length > 0 ? pickOfTheDay(unlocked) : null;
  }, []);
  const isFirstVisit = useReactiveGlow("library_first_visit");
  const insightCtx = buildCollectionInsightContext();
  const reaction = isFirstVisit ? "Voc\xEA parece curioso." : getLibraryInsight(insightCtx);
  const placeMemory = getHeroJourneyPlaceLine("biblioteca", {
    totalMinutes: character?.total_minutes ?? 0,
    isFirstVisitToPlace: isFirstVisit
  });
  (0, import_react11.useEffect)(() => {
    if (!placeMemory) return;
    remember(placeMemory.memoryKey);
  }, [placeMemory]);
  const environmentalLine = getEnvironmentalLine("biblioteca");
  const worldSimulationLine = getWorldSimulationLine("biblioteca");
  const landmarkIdentityLine = getLandmarkIdentityLine("biblioteca");
  const hasRegionRelatedBook = (0, import_react11.useMemo)(
    () => echoContext.regionName !== null && BOOKS.some((b) => getBookRelated(b.id).some((m) => m.label === "Regi\xE3o" && m.value === echoContext.regionName)),
    [echoContext.regionName]
  );
  const libraryEchoLine = getLibraryEchoLine(hasRegionRelatedBook, echoContext);
  const cityAmbientLine = getCityAmbientLine("biblioteca");
  const microEventLine = getMicroEvent("biblioteca", buildMicroEventContext(worldPresenceCtx));
  const worldCohesionLine = getWorldCohesionLine("biblioteca", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  const kingdomMemoryLine = playerFacts ? getKingdomMemoryLine(
    "biblioteca",
    { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
    echoContext.approach
  ) : null;
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("biblioteca", buildKingdomEvolutionContext(playerFacts, insightCtx, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("biblioteca", buildBuildingProgressionContext(playerFacts, insightCtx)) : null;
  const buildingStage = playerFacts ? getBuildingStage("biblioteca", buildBuildingProgressionContext(playerFacts, insightCtx)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("biblioteca", buildReactiveWorldContext(playerFacts, insightCtx)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("biblioteca", buildReactiveWorldContext(playerFacts, insightCtx)) })
  ) : null;
  const hasDiscoveryChain = selectedBook ? getBookDiscoveryCandidates(selectedBook.id).length > 0 : false;
  const libraryHighlightKey = getSingleHighlight(LIBRARY_HIGHLIGHT_PRIORITY, {
    bookOfTheDay: bookOfTheDay !== null,
    discoveryChain: hasDiscoveryChain,
    kingdomMemory: kingdomMemoryLine !== null,
    expeditionEcho: libraryEchoLine !== null
  });
  const libraryFeedbackCls = feedbackClassName("softGlow");
  const readerFeedbackState = libraryHighlightKey === "discoveryChain" ? "softGlow" : null;
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("section", { className: `city-building-screen city-building-biblioteca${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("h2", { children: "\u{1F4DA} Biblioteca" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "building-decor", children: LIBRARY_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(NpcIntro, { npc: NPCS.bibliotecaria }),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(GuideBubble, { flag: "library_seen", message: "Cada livro daqui guarda um peda\xE7o da hist\xF3ria do Reino \u2014 nem tudo est\xE1 confirmado." }),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: "Um c\xF3dice para cada hist\xF3ria do Reino \u2014 algumas ainda por vir." }),
    /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("h3", { className: "identity-subtitle", children: [
      "Livros catalogados (",
      unlockedBooksCount,
      "/",
      BOOKS.length,
      ")"
    ] }),
    bookOfTheDay ? /* @__PURE__ */ (0, import_jsx_runtime29.jsxs)("p", { className: `hint city-of-the-day${libraryHighlightKey === "bookOfTheDay" ? ` ${libraryFeedbackCls}` : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("span", { children: "\u{1F4D6} Recomendado do dia:" }),
      " ",
      bookOfTheDay.title,
      " \u2014 ",
      bookOfTheDay.author
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          BookShelf,
          {
            books: BOOKS,
            selectedBookId,
            onSelectBook: setSelectedBookId,
            highlightedBookId: bookOfTheDay?.id ?? null
          }
        ),
        reader: /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
          BookReader,
          {
            book: selectedBook,
            echoContext,
            feedbackState: readerFeedbackState
          },
          selectedBook?.id ?? "empty"
        )
      }
    ),
    reaction ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: reaction }) : null,
    placeMemory ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: placeMemory.line }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(WorldPresenceLine, { building: "biblioteca", ctx: worldPresenceCtx }),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    libraryEchoLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: `hint${libraryHighlightKey === "expeditionEcho" ? ` ${libraryFeedbackCls}` : ""}`, children: libraryEchoLine }) : null,
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomMemoryLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: `hint${libraryHighlightKey === "kingdomMemory" ? ` ${libraryFeedbackCls}` : ""}`, children: kingdomMemoryLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime29.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_react14 = __toESM(require_react(), 1);

// apps/web/src/components/bestiary/CreatureCatalog.tsx
var import_react12 = __toESM(require_react(), 1);
var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
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
  const [query, setQuery] = (0, import_react12.useState)("");
  const [type, setType] = (0, import_react12.useState)(null);
  const [danger, setDanger] = (0, import_react12.useState)(null);
  const filtered = (0, import_react12.useMemo)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo nome...", children: /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("div", { className: "creature-filters", children: [
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
          CodexFilter,
          {
            allLabel: "Todos os tipos",
            selected: type,
            onSelect: (value) => setType(value),
            options: CREATURE_TYPES.map((t) => ({ value: t.slug, label: `${t.icon} ${t.label}` }))
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
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
        return /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
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
var import_react13 = __toESM(require_react(), 1);

// apps/web/src/lib/ravens.ts
var RAVEN_SPECIES = [
  {
    id: "corvo-do-reino",
    name: "Corvo do Reino",
    behavior: "Segue viajantes \xE0 dist\xE2ncia, observando sem nunca se aproximar demais.",
    habitat: "Presente em quase todas as regi\xF5es, mais comum perto de estradas e expedi\xE7\xF5es.",
    personality: "Curioso, silencioso, nunca hostil.",
    story: "Contam que o mesmo corvo j\xE1 foi visto acompanhando a mesma estrada por gera\xE7\xF5es \u2014 ou s\xE3o v\xE1rios, indistingu\xEDveis uns dos outros. Ningu\xE9m consegue confirmar.",
    curiosity: "Alguns ca\xE7adores juram que ele reconhece rostos que j\xE1 viu antes.",
    loreDrops: ["Pena Escura", "Bico Curto"]
  },
  {
    id: "corvo-das-ruinas",
    name: "Corvo das Ru\xEDnas",
    behavior: "Nunca sai das Ru\xEDnas Esquecidas, pousando sempre nos mesmos pontos exatos.",
    habitat: "Colunas quebradas e corredores das Ru\xEDnas Esquecidas.",
    personality: "Silencioso, quase im\xF3vel por horas seguidas.",
    story: "Alaric, o Curador, evita comentar sobre eles \u2014 diz s\xF3 que nenhum corvo das Ru\xEDnas parece incomodado com o que quer que viva l\xE1 dentro.",
    curiosity: "Um deles foi visto dias inteiros sobre a mesma l\xE1pide vazia, sem se mover.",
    loreDrops: ["Pena de Pedra", "Olho de Corvo"]
  },
  {
    id: "corvo-das-montanhas",
    name: "Corvo das Montanhas",
    behavior: "Voa em bandos pequenos acima da neve, acompanhando exploradores por dias inteiros.",
    habitat: "Picos Congelados, sempre acima da linha de neve.",
    personality: "Resistente ao frio, teimoso, dif\xEDcil de afastar.",
    story: "Exploradores dos Picos Congelados contam que um bando os seguiu at\xE9 o topo de uma escalada inteira, sem nunca pousar uma vez.",
    curiosity: "Uma pena encontrada l\xE1 em cima nunca murchou, mesmo anos depois.",
    loreDrops: ["Pena Congelada", "Garra Fina"]
  },
  {
    id: "corvo-do-bosque",
    name: "Corvo do Bosque",
    behavior: "Segue matilhas de lobos \xE0 dist\xE2ncia, alimentando-se do que sobra de uma ca\xE7ada.",
    habitat: "Bosque Sussurrante, sempre nas proximidades de territ\xF3rio de lobo.",
    personality: "Oportunista, paciente, nunca apressado.",
    story: "Ca\xE7adores do Bosque Sussurrante dizem que ver corvos sobre a copa das \xE1rvores \xE9 sinal de que uma matilha ca\xE7ou por perto, antes mesmo de qualquer rastro aparecer.",
    curiosity: "Somem por completo pouco antes de a matilha atacar \u2014 ningu\xE9m sabe explicar por qu\xEA.",
    loreDrops: ["Pena Suja", "Bico Manchado"]
  },
  {
    id: "corvo-mensageiro",
    name: "Corvo Mensageiro",
    behavior: "Alguns viajantes tentam trein\xE1-lo para carregar bilhetes curtos entre regi\xF5es.",
    habitat: "Encontrado perto da Casa dos Viajantes e das principais estradas do Reino.",
    personality: "Obediente \xE0s vezes, mas nunca confi\xE1vel o bastante para mensagens importantes.",
    story: "Idris jura que j\xE1 confiou uma mensagem de verdade a um. S\xF3 uma vez \u2014 e nunca mais tentou repetir.",
    curiosity: "Ningu\xE9m sabe explicar como ele sempre volta para o dono certo, mesmo quando muda de regi\xE3o.",
    loreDrops: ["Broche do Mensageiro (lore)", "Pena Marcada"]
  },
  {
    id: "corvo-anciao",
    name: "Corvo Anci\xE3o",
    behavior: "Visto sempre sozinho, nunca em bando.",
    habitat: "Aparece em qualquer regi\xE3o do Reino, sem padr\xE3o conhecido.",
    personality: "Observador silencioso, quase deliberado no que faz.",
    story: "Alguns ca\xE7adores juram reconhecer o mesmo corvo observando-os por anos seguidos, em lugares completamente diferentes. Se ele entende o que os humanos dizem, nunca deu esse sinal.",
    curiosity: "Nunca foi visto se alimentando, brigando ou fugindo de nada.",
    loreDrops: ["Pena Eterna", "Olho Antigo"]
  }
];
var RAVEN_ENCOUNTERS = [
  "Um corvo observa o grupo de um galho pr\xF3ximo, sem se mover.",
  "Centenas de corvos levantam voo ao mesmo tempo, sem motivo aparente.",
  "Uma pena negra cai devagar entre os viajantes.",
  "Um ninho abandonado \xE9 encontrado entre as pedras.",
  "Um sil\xEAncio absoluto toma conta do caminho \u2014 nem um pio de corvo.",
  "Um \xFAnico corvo acompanha a expedi\xE7\xE3o por um bom trecho, depois desaparece.",
  "Um corvo pousa exatamente onde algu\xE9m trope\xE7ou segundos antes.",
  "Um bando pequeno de corvos sobrevoa em c\xEDrculos, sem pousar.",
  "Um corvo grasna tr\xEAs vezes e depois some entre as \xE1rvores.",
  "Um corvo observa o acampamento a noite inteira, im\xF3vel.",
  "Pegadas de corvo cruzam a lama, indo e voltando sem raz\xE3o clara.",
  "Um corvo pousa no ombro de um dos viajantes por um instante, depois voa.",
  "Um bando inteiro segue a expedi\xE7\xE3o por um trecho curto do caminho.",
  "Um corvo solit\xE1rio observa de uma pedra alta, sem se aproximar.",
  "Uma pena escura fica presa entre os equipamentos do grupo.",
  "Um corvo interrompe o sil\xEAncio da noite com um grasnido s\xF3.",
  "V\xE1rios corvos pousam ao mesmo tempo, formando um c\xEDrculo estranho.",
  "Um corvo acompanha o grupo de galho em galho, sem nunca se aproximar demais.",
  "Um ninho rec\xE9m-feito \xE9 avistado alto demais para ser alcan\xE7ado.",
  "Um corvo observa de longe enquanto o grupo descansa, sem emitir som."
];

// apps/web/src/lib/creatureEcology.ts
function includes(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}
function getCreatureEcologyCandidates(creature) {
  const regionName = getRegionName2(creature.regionId);
  const candidates = [];
  const relatedRaven = RAVEN_SPECIES.find(
    (raven) => includes(raven.habitat, regionName) || includes(raven.story, regionName)
  );
  if (relatedRaven && creature.type === "besta") {
    candidates.push("Corvos costumam aparecer depois que esta criatura \xE9 vista.");
  }
  if (includes(creature.habitat, "ru\xEDna")) {
    candidates.push("Dizem que algumas ru\xEDnas ficam silenciosas quando esta criatura aparece.");
  }
  if (creature.dangerLevel === "letal") {
    candidates.push("Ca\xE7adores evitam seguir os rastros desta esp\xE9cie.");
  }
  return candidates;
}

// apps/web/src/components/bestiary/CreatureReader.tsx
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
function CreatureReader({ creature, echoContext = EMPTY_ECHO_CONTEXT, feedbackState = null }) {
  const type = creature ? CREATURE_TYPES.find((t) => t.slug === creature.type) : void 0;
  const [isFirstEntry] = (0, import_react13.useState)(
    () => creature !== null && !creature.locked && !hasRemembered("first_bestiary_entry")
  );
  (0, import_react13.useEffect)(() => {
    if (!creature || creature.locked) return;
    recordEvent("creature_viewed", { creatureId: creature.id });
    if (!hasRemembered("first_bestiary_entry")) {
      remember("first_bestiary_entry");
      recordEvent("first_bestiary_entry", { creatureId: creature.id });
    }
  }, [creature]);
  const mentions = creature ? getCreatureMentions(creature) : [];
  const pages = creature?.pages ?? [];
  const withMentions = mentions.length > 0 ? [...pages, `**Tamb\xE9m citado em**

${mentions.map((m) => `**${m.label}:** ${m.value}`).join("\n\n")}`] : pages;
  const allPages = isFirstEntry ? [...withMentions, "Primeira criatura registrada."] : withMentions;
  const ecologyLines = creature ? pickKnowledge(getCreatureEcologyCandidates(creature), echoContext.approach) : [];
  const nextSteps = creature ? getNextSteps([getCreatureDiscoveryCandidates(creature), getCreatureThreadCandidates(creature)], echoContext.approach) : [];
  const echoLine = creature ? getCreatureEchoLine(getRegionName2(creature.regionId), echoContext) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
    CodexReader,
    {
      feedbackState,
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
        { label: "Periculosidade", value: DANGER_LABEL[creature.dangerLevel] },
        ...ecologyLines.length > 0 ? [{ label: "Ecologia", value: ecologyLines.join(" ") }] : [],
        ...nextSteps.length > 0 ? [{ label: "Pr\xF3ximo Passo", value: nextSteps.join(" ") }] : [],
        ...echoLine ? [{ label: "Eco da Expedi\xE7\xE3o", value: echoLine }] : []
      ] : [],
      pages: allPages
    }
  );
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
var BESTIARY_DECOR = {
  "stage-1": "\u{1F43E}",
  "stage-2": "\u{1F43E}\u{1F43E}",
  "stage-3": "\u{1F4D6}",
  "stage-4": "\u{1F4D6} \u{1F43E}\u{1F43E}"
};
function BestiaryBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }) {
  const [selectedCreatureId, setSelectedCreatureId] = (0, import_react14.useState)(null);
  const selectedCreature = CREATURES.find((creature) => creature.id === selectedCreatureId) ?? null;
  const unlockedCreaturesCount = CREATURES.filter((c) => !c.locked).length;
  const creatureOfTheDay = (0, import_react14.useMemo)(() => {
    const unlocked = CREATURES.filter((c) => !c.locked);
    return unlocked.length > 0 ? pickOfTheDay(unlocked) : null;
  }, []);
  const insightCtx = buildCollectionInsightContext();
  const reaction = getBestiaryInsight(insightCtx);
  const kingdomMemoryLine = playerFacts ? getKingdomMemoryLine(
    "bestiario",
    { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
    echoContext.approach
  ) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("bestiario", buildBuildingProgressionContext(playerFacts, insightCtx)) : null;
  const buildingStage = playerFacts ? getBuildingStage("bestiario", buildBuildingProgressionContext(playerFacts, insightCtx)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("bestiario", buildReactiveWorldContext(playerFacts, insightCtx)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("bestiario", buildReactiveWorldContext(playerFacts, insightCtx)) })
  ) : null;
  const hasCreatureEcology = selectedCreature ? getCreatureEcologyCandidates(selectedCreature).length > 0 : false;
  const hasNextSteps = selectedCreature ? getNextSteps(
    [getCreatureDiscoveryCandidates(selectedCreature), getCreatureThreadCandidates(selectedCreature)],
    echoContext.approach
  ).length > 0 : false;
  const hasExpeditionEcho = selectedCreature ? getCreatureEchoLine(getRegionName2(selectedCreature.regionId), echoContext) !== null : false;
  const bestiaryHighlightKey = getSingleHighlight(BESTIARY_HIGHLIGHT_PRIORITY, {
    creatureEcology: hasCreatureEcology,
    nextSteps: hasNextSteps,
    expeditionEcho: hasExpeditionEcho,
    collectionInsight: reaction !== null
  });
  const bestiaryFeedbackCls = feedbackClassName(bestiaryHighlightKey === "collectionInsight" ? "softGlow" : null);
  const readerFeedbackState = bestiaryHighlightKey === "creatureEcology" || bestiaryHighlightKey === "nextSteps" || bestiaryHighlightKey === "expeditionEcho" ? "softGlow" : null;
  return /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("section", { className: `city-building-screen city-building-bestiario${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("h2", { children: "\u{1F52C} Besti\xE1rio" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("p", { className: "building-decor", children: BESTIARY_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(NpcIntro, { npc: NPCS.erudito }),
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(GuideBubble, { flag: "bestiary_seen", message: "Toda criatura j\xE1 avistada no Reino vira um registro permanente aqui." }),
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("p", { className: "hint", children: "Um registro de tudo que j\xE1 foi visto \u2014 e do pouco que j\xE1 foi entendido." }),
    /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("h3", { className: "identity-subtitle", children: [
      "Criaturas registradas (",
      unlockedCreaturesCount,
      "/",
      CREATURES.length,
      ")"
    ] }),
    creatureOfTheDay ? /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("p", { className: "hint city-of-the-day", children: [
      /* @__PURE__ */ (0, import_jsx_runtime32.jsxs)("span", { children: [
        creatureOfTheDay.icon,
        " Observada recentemente:"
      ] }),
      " ",
      creatureOfTheDay.name
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          CreatureCatalog,
          {
            creatures: CREATURES,
            selectedCreatureId,
            onSelectCreature: setSelectedCreatureId
          }
        ),
        reader: /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
          CreatureReader,
          {
            creature: selectedCreature,
            echoContext,
            feedbackState: readerFeedbackState
          },
          selectedCreature?.id ?? "empty"
        )
      }
    ),
    reaction ? /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("p", { className: `hint${bestiaryFeedbackCls ? ` ${bestiaryFeedbackCls}` : ""}`, children: reaction }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(WorldPresenceLine, { building: "bestiario", ctx: worldPresenceCtx }),
    kingdomMemoryLine ? /* @__PURE__ */ (0, import_jsx_runtime32.jsx)("p", { className: "hint", children: kingdomMemoryLine }) : null
  ] });
}

// apps/web/src/components/city/MuseumBuilding.tsx
var import_react17 = __toESM(require_react(), 1);

// apps/web/src/components/museum/MuseumShelf.tsx
var import_react15 = __toESM(require_react(), 1);
var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
var STATUS_OPTIONS = ["bloqueado", "conhecido", "registrado"];
var KNOWLEDGE_STATUS3 = {
  bloqueado: "LOCKED" /* Locked */,
  conhecido: "DISCOVERED" /* Discovered */,
  registrado: "READ" /* Read */
};
function MuseumShelf({ entries, selectedEntryId, onSelectEntry }) {
  const [query, setQuery] = (0, import_react15.useState)("");
  const [category, setCategory] = (0, import_react15.useState)(null);
  const [year, setYear] = (0, import_react15.useState)(null);
  const [status, setStatus] = (0, import_react15.useState)(null);
  const years = (0, import_react15.useMemo)(() => Array.from(new Set(entries.map((entry) => entry.year))), [entries]);
  const filtered = (0, import_react15.useMemo)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: [
        /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(CodexCategoryList, { categories: MUSEUM_CATEGORIES, selected: category, onSelect: setCategory, allLabel: "Todas as alas" }),
        /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("div", { className: "creature-filters", children: [
          /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
            CodexFilter,
            {
              allLabel: "Qualquer status",
              selected: status,
              onSelect: (value) => setStatus(value),
              options: STATUS_OPTIONS.map((option) => ({ value: option, label: MUSEUM_STATUS_LABEL[option] }))
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
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
        return /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
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
var import_react16 = __toESM(require_react(), 1);
var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
function MuseumReader({ entry, echoContext = EMPTY_ECHO_CONTEXT, feedbackState = null }) {
  const category = entry ? MUSEUM_CATEGORIES.find((c) => c.slug === entry.category) : void 0;
  (0, import_react16.useEffect)(() => {
    if (!entry || entry.locked) return;
    recordEvent("museum_entry_viewed", { entryId: entry.id });
  }, [entry]);
  const nextSteps = entry ? getNextSteps([getMuseumDiscoveryCandidates(entry.id), getMuseumBookThreadCandidates(entry)], echoContext.approach) : [];
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
    CodexReader,
    {
      feedbackState,
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
        { label: "Ano", value: entry.year },
        ...nextSteps.length > 0 ? [{ label: "Pr\xF3ximo Passo", value: nextSteps.join(" ") }] : []
      ] : [],
      pages: entry?.pages ?? []
    }
  );
}

// apps/web/src/components/city/MuseumBuilding.tsx
var import_jsx_runtime35 = __toESM(require_jsx_runtime(), 1);
var MUSEUM_DECOR = {
  "stage-1": "\u{1F3FA}",
  "stage-2": "\u{1F3FA}\u{1F3FA}",
  "stage-3": "\u{1F3DB}\uFE0F",
  "stage-4": "\u{1F3DB}\uFE0F \u{1F5BC}\uFE0F"
};
function MuseumBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }) {
  const [selectedEntryId, setSelectedEntryId] = (0, import_react17.useState)(null);
  const selectedEntry = MUSEUM_ENTRIES.find((entry) => entry.id === selectedEntryId) ?? null;
  const unlockedEntriesCount = MUSEUM_ENTRIES.filter((e) => !e.locked).length;
  const entryOfTheDay = (0, import_react17.useMemo)(() => {
    const unlocked = MUSEUM_ENTRIES.filter((e) => !e.locked);
    return unlocked.length > 0 ? pickOfTheDay(unlocked) : null;
  }, []);
  const isFirstVisit = useReactiveGlow("museum_first_visit");
  (0, import_react17.useEffect)(() => {
    if (!isFirstVisit && !hasRemembered("museum_return_recorded")) {
      remember("museum_return_recorded");
      recordEvent("museum_return");
    }
  }, [isFirstVisit]);
  const reaction = isFirstVisit ? "O passado costuma receber poucos visitantes." : "Vejo que voltou.";
  const insightCtx = buildCollectionInsightContext();
  const collectionInsight = getMuseumInsight(insightCtx);
  const placeMemory = getHeroJourneyPlaceLine("museu", { totalMinutes: 0, museumEntriesViewed: insightCtx.museumEntriesViewed });
  (0, import_react17.useEffect)(() => {
    if (!placeMemory) return;
    remember(placeMemory.memoryKey);
  }, [placeMemory]);
  const environmentalLine = getEnvironmentalLine("museu");
  const worldSimulationLine = getWorldSimulationLine("museu");
  const landmarkIdentityLine = getLandmarkIdentityLine("museu");
  const cityAmbientLine = getCityAmbientLine("museu");
  const microEventLine = getMicroEvent("museu");
  const worldCohesionLine = getWorldCohesionLine("museu", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  const kingdomMemoryLine = playerFacts ? getKingdomMemoryLine(
    "museu",
    { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
    echoContext.approach
  ) : null;
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("museu", buildKingdomEvolutionContext(playerFacts, insightCtx, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("museu", buildBuildingProgressionContext(playerFacts, insightCtx)) : null;
  const buildingStage = playerFacts ? getBuildingStage("museu", buildBuildingProgressionContext(playerFacts, insightCtx)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("museu", buildReactiveWorldContext(playerFacts, insightCtx)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("museu", buildReactiveWorldContext(playerFacts, insightCtx)) })
  ) : null;
  const hasNextSteps = selectedEntry ? getNextSteps([getMuseumDiscoveryCandidates(selectedEntry.id), getMuseumBookThreadCandidates(selectedEntry)], echoContext.approach).length > 0 : false;
  const museumHighlightKey = getSingleHighlight(MUSEUM_HIGHLIGHT_PRIORITY, {
    nextSteps: hasNextSteps,
    collectionInsight: collectionInsight !== null
  });
  const museumFeedbackCls = feedbackClassName("softGlow");
  const readerFeedbackState = museumHighlightKey === "nextSteps" ? "softGlow" : null;
  return /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("section", { className: `city-building-screen city-building-museu${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("h2", { children: "\u{1F5BC}\uFE0F Museu do Reino" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "building-decor", children: MUSEUM_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(NpcIntro, { npc: NPCS.curador }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: "Onde a hist\xF3ria da comunidade fica registrada \u2014 parte dela, ao menos." }),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("h3", { className: "identity-subtitle", children: [
      "Registros catalogados (",
      unlockedEntriesCount,
      "/",
      MUSEUM_ENTRIES.length,
      ")"
    ] }),
    entryOfTheDay ? /* @__PURE__ */ (0, import_jsx_runtime35.jsxs)("p", { className: "hint city-of-the-day", children: [
      /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("span", { children: "\u{1F5BC}\uFE0F Pe\xE7a em destaque:" }),
      " ",
      entryOfTheDay.title
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(MuseumShelf, { entries: MUSEUM_ENTRIES, selectedEntryId, onSelectEntry: setSelectedEntryId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(
          MuseumReader,
          {
            entry: selectedEntry,
            echoContext,
            feedbackState: readerFeedbackState
          },
          selectedEntry?.id ?? "empty"
        )
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: reaction }),
    collectionInsight ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: `hint${museumHighlightKey === "collectionInsight" ? ` ${museumFeedbackCls}` : ""}`, children: collectionInsight }) : null,
    placeMemory ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: placeMemory.line }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)(WorldPresenceLine, { building: "museu", ctx: worldPresenceCtx }),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomMemoryLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: kingdomMemoryLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime35.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/components/city/TavernBuilding.tsx
var import_react20 = __toESM(require_react(), 1);

// apps/web/src/components/tavern/TavernRumor.tsx
var import_react18 = __toESM(require_react(), 1);
var import_jsx_runtime36 = __toESM(require_jsx_runtime(), 1);
var SIX_HOURS_MS = 6 * 60 * 60 * 1e3;
function rumorOfTheMoment() {
  return pickByTime(TAVERN_RUMORS, SIX_HOURS_MS);
}
function TavernRumor() {
  const [rumor] = (0, import_react18.useState)(rumorOfTheMoment);
  const [similar] = (0, import_react18.useState)(() => getSimilarRumors(rumor));
  return /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("h3", { children: "\u{1F5E3}\uFE0F Rumor do Dia" }),
    /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("p", { className: "tavern-rumor", children: [
      '"',
      rumor,
      '"'
    ] }),
    similar.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("div", { className: "tavern-similar-rumors", children: [
      /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("span", { children: "Outros rumores semelhantes:" }),
      /* @__PURE__ */ (0, import_jsx_runtime36.jsx)("ul", { children: similar.map((r) => /* @__PURE__ */ (0, import_jsx_runtime36.jsxs)("li", { children: [
        '"',
        r,
        '"'
      ] }, r)) })
    ] }) : null
  ] });
}

// apps/web/src/components/tavern/AdventurerTable.tsx
var import_react19 = __toESM(require_react(), 1);
var import_jsx_runtime37 = __toESM(require_jsx_runtime(), 1);
var SHOWN_COUNT = 5;
function randomConversations() {
  const shuffled = [...TAVERN_CONVERSATIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SHOWN_COUNT);
}
function AdventurerTable() {
  const [conversations] = (0, import_react19.useState)(randomConversations);
  return /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("h3", { children: "\u{1F37B} Mesa dos Aventureiros" }),
    /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("div", { className: "tavern-conversations", children: conversations.map((lines, i) => /* @__PURE__ */ (0, import_jsx_runtime37.jsx)("div", { className: "tavern-conversation", children: lines.map((line, j) => /* @__PURE__ */ (0, import_jsx_runtime37.jsxs)("p", { children: [
      "\u2014 ",
      line
    ] }, j)) }, i)) })
  ] });
}

// apps/web/src/components/tavern/WallNotes.tsx
var import_jsx_runtime38 = __toESM(require_jsx_runtime(), 1);
function WallNotes() {
  return /* @__PURE__ */ (0, import_jsx_runtime38.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("h3", { children: "\u{1F4CC} Recados na Parede" }),
    /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("ul", { className: "tavern-wall-notes", children: TAVERN_WALL_NOTES.map((note, i) => /* @__PURE__ */ (0, import_jsx_runtime38.jsx)("li", { className: "tavern-note", children: note }, i)) })
  ] });
}

// apps/web/src/components/tavern/NightSongs.tsx
var import_jsx_runtime39 = __toESM(require_jsx_runtime(), 1);
function NightSongs() {
  return /* @__PURE__ */ (0, import_jsx_runtime39.jsxs)("div", { className: "tavern-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("h3", { children: "\u{1F3B5} M\xFAsica da Noite" }),
    /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("ul", { className: "tavern-songs", children: TAVERN_NIGHT_SONGS.map((title, i) => /* @__PURE__ */ (0, import_jsx_runtime39.jsx)("li", { children: title }, i)) })
  ] });
}

// apps/web/src/components/city/TavernBuilding.tsx
var import_jsx_runtime40 = __toESM(require_jsx_runtime(), 1);
var TAVERN_DECOR = {
  "stage-1": "\u{1F37A}",
  "stage-2": "\u{1F37A}\u{1F37A}",
  "stage-3": "\u{1F6E2}\uFE0F",
  "stage-4": "\u{1F6E2}\uFE0F \u{1F357}"
};
function TavernBuilding({ worldPresenceCtx, echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }) {
  const isFirstVisit = useReactiveGlow("tavern_first_visit");
  (0, import_react20.useEffect)(() => {
    if (!isFirstVisit && !hasRemembered("tavern_regular_recorded")) {
      remember("tavern_regular_recorded");
      recordEvent("tavern_regular");
    }
  }, [isFirstVisit]);
  const reaction = isFirstVisit ? "O rosto ainda \xE9 novo por aqui." : "J\xE1 est\xE1 virando fregu\xEAs.";
  const environmentalLine = getEnvironmentalLine("taverna");
  const worldSimulationLine = getWorldSimulationLine("taverna", { worldEventCategory: worldPresenceCtx?.eventCategory });
  const landmarkIdentityLine = getLandmarkIdentityLine("taverna");
  const cityAmbientLine = getCityAmbientLine("taverna");
  const microEventLine = getMicroEvent("taverna", buildMicroEventContext(worldPresenceCtx));
  const worldCohesionLine = getWorldCohesionLine("taverna", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  const insightCtxForMemory = buildCollectionInsightContext();
  const kingdomMemoryLine = playerFacts ? getKingdomMemoryLine(
    "taverna",
    { facts: playerFacts, booksRead: insightCtxForMemory.booksRead, creaturesViewed: insightCtxForMemory.creaturesViewed },
    echoContext.approach
  ) : null;
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("taverna", buildKingdomEvolutionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("taverna", buildBuildingProgressionContext(playerFacts)) : null;
  const buildingStage = playerFacts ? getBuildingStage("taverna", buildBuildingProgressionContext(playerFacts)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("taverna", buildReactiveWorldContext(playerFacts)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass("building", buildWorldVisualContext({ buildingReactiveState: getReactiveState("taverna", buildReactiveWorldContext(playerFacts)) })) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)("section", { className: `city-building-screen city-building-taverna${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("h2", { children: "\u{1F37A} Taverna" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "building-decor", children: TAVERN_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(NpcIntro, { npc: NPCS.taverneira, worldEventCategory: worldPresenceCtx?.eventCategory, echoContext }),
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(GuideBubble, { flag: "tavern_seen", message: "Rumores daqui nunca s\xE3o confirmados \u2014 mas quase todos apontam pra algo real." }),
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: "Onde o Reino descansa, conversa e inventa hist\xF3rias." }),
    /* @__PURE__ */ (0, import_jsx_runtime40.jsxs)("div", { className: "tavern-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(TavernRumor, {}),
      /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(AdventurerTable, {}),
      /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(WallNotes, {}),
      /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(NightSongs, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: reaction }),
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)(WorldPresenceLine, { building: "taverna", ctx: worldPresenceCtx }),
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomMemoryLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: kingdomMemoryLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime40.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/components/city/TravellerHouseBuilding.tsx
var import_react23 = __toESM(require_react(), 1);

// apps/web/src/components/travellerHouse/StoryShelf.tsx
var import_react21 = __toESM(require_react(), 1);
var import_jsx_runtime41 = __toESM(require_jsx_runtime(), 1);
var CATEGORY_LABEL = Object.fromEntries(
  STORY_CATEGORIES.map((c) => [c.slug, `${c.icon} ${c.label}`])
);
function StoryShelf({ stories, selectedId, onSelect }) {
  const [query, setQuery] = (0, import_react21.useState)("");
  const [region, setRegion] = (0, import_react21.useState)(null);
  const filtered = (0, import_react21.useMemo)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(CodexCategoryList, { categories: regionFilterOptions(), selected: region, onSelect: setRegion, allLabel: "Todas as regi\xF5es" }) }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhuma hist\xF3ria encontrada.",
      children: filtered.map((story) => /* @__PURE__ */ (0, import_jsx_runtime41.jsx)(
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
var import_react22 = __toESM(require_react(), 1);
var import_jsx_runtime42 = __toESM(require_jsx_runtime(), 1);
function StoryReader({ story }) {
  const category = story ? STORY_CATEGORIES.find((c) => c.slug === story.category) : void 0;
  (0, import_react22.useEffect)(() => {
    if (!story) return;
    recordEvent("story_read", { storyId: story.id });
  }, [story]);
  const related = story ? getRelatedStoriesAcrossRegions(story) : [];
  const pages = story ? related.length > 0 ? [
    story.text,
    `**Tamb\xE9m aconteceu em**

${related.map((s) => `**${getRegionName(s.regionId)}:** ${s.title}`).join("\n\n")}`
  ] : [story.text] : [];
  return /* @__PURE__ */ (0, import_jsx_runtime42.jsx)(
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
      pages
    }
  );
}

// apps/web/src/components/city/TravellerHouseBuilding.tsx
var import_jsx_runtime43 = __toESM(require_jsx_runtime(), 1);
var TRAVELLER_HOUSE_DECOR = {
  "stage-1": "\u{1F392}",
  "stage-2": "\u{1F392}\u{1F392}",
  "stage-3": "\u{1F5FA}\uFE0F",
  "stage-4": "\u{1F392}\u{1F392} \u{1F5FA}\uFE0F"
};
function TravellerHouseBuilding({ echoContext = EMPTY_ECHO_CONTEXT, playerFacts = null }) {
  const [selectedId, setSelectedId] = (0, import_react23.useState)(null);
  const selectedStory = TRAVELLER_STORIES.find((story) => story.id === selectedId) ?? null;
  const handleRandomStory = () => {
    const random = TRAVELLER_STORIES[Math.floor(Math.random() * TRAVELLER_STORIES.length)];
    setSelectedId(random.id);
  };
  const storiesRead = getRecentEvents(20).filter((e) => e.kind === "story_read").length;
  const reaction = storiesRead >= 6 ? "Voc\xEA gosta de ouvir hist\xF3rias." : null;
  const environmentalLine = getEnvironmentalLine("casa-dos-viajantes");
  const worldSimulationLine = getWorldSimulationLine("casa-dos-viajantes");
  const landmarkIdentityLine = getLandmarkIdentityLine("casa-dos-viajantes");
  const cityAmbientLine = getCityAmbientLine("casa-dos-viajantes");
  const microEventLine = getMicroEvent("casa-dos-viajantes");
  const worldCohesionLine = getWorldCohesionLine("casa-dos-viajantes", buildWorldCohesionContext(void 0, echoContext));
  const insightCtx = buildCollectionInsightContext();
  const kingdomMemoryLine = playerFacts ? getKingdomMemoryLine(
    "casa-dos-viajantes",
    { facts: playerFacts, booksRead: insightCtx.booksRead, creaturesViewed: insightCtx.creaturesViewed },
    echoContext.approach
  ) : null;
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("casa-dos-viajantes", buildKingdomEvolutionContext(playerFacts, insightCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("casa-dos-viajantes", buildBuildingProgressionContext(playerFacts)) : null;
  const buildingStage = playerFacts ? getBuildingStage("casa-dos-viajantes", buildBuildingProgressionContext(playerFacts)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("casa-dos-viajantes", buildReactiveWorldContext(playerFacts)) : null;
  const worldVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("casa-dos-viajantes", buildReactiveWorldContext(playerFacts)) })
  ) : null;
  (0, import_react23.useEffect)(() => {
    if (reaction && !hasRemembered("traveller_listener_recorded")) {
      remember("traveller_listener_recorded");
      recordEvent("traveller_listener");
    }
  }, [reaction]);
  return /* @__PURE__ */ (0, import_jsx_runtime43.jsxs)("section", { className: `city-building-screen city-building-viajantes${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${worldVisualClass ? ` ${worldVisualClass}` : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("h2", { children: "\u{1F4DC} Casa dos Viajantes" }),
    buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "building-decor", children: TRAVELLER_HOUSE_DECOR[buildingStage] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(NpcIntro, { npc: NPCS.viajante, echoContext }),
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: "Hist\xF3rias contadas por gente comum. Ningu\xE9m sabe se s\xE3o verdade." }),
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("button", { type: "button", className: "traveller-random-btn", onClick: handleRandomStory, children: "\u{1F3B2} Hist\xF3ria Aleat\xF3ria" }),
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(StoryShelf, { stories: TRAVELLER_STORIES, selectedId, onSelect: setSelectedId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime43.jsx)(StoryReader, { story: selectedStory }, selectedStory?.id ?? "empty")
      }
    ),
    reaction ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: reaction }) : null,
    environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: environmentalLine }) : null,
    worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
    cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
    kingdomMemoryLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: kingdomMemoryLine }) : null,
    kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime43.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null
  ] });
}

// apps/web/src/pages/CityPage.tsx
var import_jsx_runtime44 = __toESM(require_jsx_runtime(), 1);
var PRACA_DECOR = {
  "stage-1": "\u26F2",
  "stage-2": "\u26F2 \u{1FA91}",
  "stage-3": "\u26F2 \u{1F337}\u{1F337}",
  "stage-4": "\u26F2 \u{1FA91} \u{1F337}\u{1F337}"
};
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
var objectOfTheDay = pickOfTheDay(HIDDEN_OBJECTS, 1);
var rumorTopicOfTheDay = pickOfTheDay(TRAVELLER_STORIES, 2);
var ravenAmbient = pickOfTheDay(RAVEN_ENCOUNTERS, 3);
var guardComment = pickOfTheDay(NPC_DIALOGUE.guarda.comentarios_reino, 4);
function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = (0, import_react24.useState)(getStoredChannel());
  const kingdomRoles = useKingdomRole(channel || void 0, !!profile);
  const { expedition } = useExpedition(!!profile);
  const echoContext = (0, import_react24.useMemo)(() => buildExpeditionEchoContext(expedition), [expedition]);
  const playerFacts = character && identity ? buildPlayerFacts(character, identity, kingdomRoles) : null;
  const expeditionSpecializationLine = playerFacts ? getExpeditionSpecialization(buildExpeditionSpecializationContext(playerFacts)) : null;
  const [worldState, setWorldState] = (0, import_react24.useState)(null);
  const [selected, setSelected] = (0, import_react24.useState)(null);
  const [clock, setClock] = (0, import_react24.useState)(() => formatClock(Date.now()));
  (0, import_react24.useEffect)(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get(`/api/world/state${query}`).then(setWorldState).catch(() => void 0);
  }, [channel]);
  (0, import_react24.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const kingdom = worldState?.channel_kingdom ?? null;
  const worldPresenceCtx = worldState ? { eventCategory: worldState.current_event.category, playersOnline: worldState.panel.players_online } : void 0;
  const environmentalLine = getEnvironmentalLine("praca");
  const worldSimulationLine = getWorldSimulationLine("praca");
  const landmarkIdentityLine = getLandmarkIdentityLine("praca");
  const cityAmbientLine = getCityAmbientLine("praca", {
    worldEventCategory: worldPresenceCtx?.eventCategory,
    playersOnline: worldPresenceCtx?.playersOnline
  });
  const microEventLine = getMicroEvent("praca", buildMicroEventContext(worldPresenceCtx));
  const worldCohesionLine = getWorldCohesionLine("praca", buildWorldCohesionContext(worldPresenceCtx, echoContext));
  const kingdomEvolutionLine = playerFacts ? getKingdomEvolutionLine("praca", buildKingdomEvolutionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingStageClass = playerFacts ? getBuildingStageClass("praca", buildBuildingProgressionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingStage = playerFacts ? getBuildingStage("praca", buildBuildingProgressionContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const reactiveClass = playerFacts ? getReactiveClass("praca", buildReactiveWorldContext(playerFacts, void 0, worldPresenceCtx)) : null;
  const buildingVisualClass = playerFacts ? getWorldVisualClass(
    "building",
    buildWorldVisualContext({ buildingReactiveState: getReactiveState("praca", buildReactiveWorldContext(playerFacts, void 0, worldPresenceCtx)) })
  ) : null;
  const cityVisualClass = getWorldVisualClass(
    "city",
    buildWorldVisualContext({ worldEventCategory: worldPresenceCtx?.eventCategory, playersOnline: worldPresenceCtx?.playersOnline })
  );
  const NOTABLE_EVENT_CATEGORIES = ["reino", "misterios", "militar"];
  const eventFeedbackCls = feedbackClassName(
    resolveFeedback(
      worldState !== null && NOTABLE_EVENT_CATEGORIES.includes(worldState.current_event.category),
      "highlight"
    )
  );
  const cityInsightCtx = buildCollectionInsightContext();
  const cityMapHighlights = playerFacts ? getLiveHighlights(
    ["portao-norte", "biblioteca", "bestiario", "museu", "taverna", "casa-dos-viajantes"],
    {
      "portao-norte": expedition !== null,
      biblioteca: getKingdomMemoryLine("biblioteca", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
      bestiario: getKingdomMemoryLine("bestiario", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
      museu: getKingdomMemoryLine("museu", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
      taverna: getKingdomMemoryLine("taverna", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null,
      "casa-dos-viajantes": getKingdomMemoryLine("casa-dos-viajantes", { facts: playerFacts, ...cityInsightCtx }, echoContext.approach) !== null
    }
  ) : [];
  const liveGuideLine = playerFacts ? getRecommendedSurface(buildLiveGuideContext(playerFacts, cityInsightCtx, echoContext)) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(GuideBubble, { flag: "city_seen", message: "Este \xE9 o centro do Reino." }),
    /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(EldrinGuide, {}),
    /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("div", { className: `card city-banner ${cityVisualClass}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("h1", { children: "Capital" }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: "A cidade onde toda a jornada do Reino acontece." }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("label", { children: [
        "Reino atual",
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
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
    selected ? /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("div", { className: "card city-building", children: [
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("button", { type: "button", className: "city-back-btn", onClick: () => setSelected(null), children: "\u2190 Voltar \xE0 Pra\xE7a Central" }),
      selected === "arena" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(ArenaBuilding, { identity, kingdom, worldPresenceCtx, playerFacts }) : null,
      selected === "ferreiro" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(BlacksmithBuilding, { equipped: character?.equipped ?? [], worldPresenceCtx, playerFacts }) : null,
      selected === "mercador" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(MerchantBuilding, {}) : null,
      selected === "alquimista" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(AlchemistBuilding, {}) : null,
      selected === "guilda" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
        GuildBuilding,
        {
          kingdom,
          identity,
          character,
          kingdomRoles,
          worldPresenceCtx,
          echoContext
        }
      ) : null,
      selected === "banco" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(BankBuilding, { character }) : null,
      selected === "portao-norte" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
        NorthGateBuilding,
        {
          enabled: !!profile,
          worldPresenceCtx,
          echoContext,
          specializationLine: expeditionSpecializationLine,
          playerFacts
        }
      ) : null,
      selected === "biblioteca" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(LibraryBuilding, { worldPresenceCtx, echoContext, playerFacts }) : null,
      selected === "bestiario" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(BestiaryBuilding, { worldPresenceCtx, echoContext, playerFacts }) : null,
      selected === "museu" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(MuseumBuilding, { worldPresenceCtx, echoContext, playerFacts }) : null,
      selected === "taverna" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(TavernBuilding, { worldPresenceCtx, echoContext, playerFacts }) : null,
      selected === "casa-dos-viajantes" ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(TravellerHouseBuilding, { echoContext, playerFacts }) : null
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("div", { className: `card city-square-view city-building-praca${buildingStageClass ? ` ${buildingStageClass}` : ""}${reactiveClass ? ` ${reactiveClass}` : ""}${buildingVisualClass ? ` ${buildingVisualClass}` : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("h2", { children: "Pra\xE7a Central" }),
      buildingStage ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "building-decor", children: PRACA_DECOR[buildingStage] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(
        CityHubBar,
        {
          worldState,
          clock,
          channelDisplayName: kingdom?.channel_display_name ?? null
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(CitySquareDecor, {}),
      worldState ? /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("p", { className: `hint city-of-the-day${eventFeedbackCls ? ` ${eventFeedbackCls}` : ""}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("span", { children: [
          worldState.current_event.icon,
          " No Reino, agora:"
        ] }),
        " ",
        worldState.current_event.name
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: "Escolha um edif\xEDcio para visitar." }),
      liveGuideLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("p", { className: "guide-bubble", children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("span", { className: "guide-bubble-icon", "aria-hidden": "true", children: "\u{1F5FA}\uFE0F" }),
        liveGuideLine
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(CityMap, { onSelect: setSelected, highlightedBuildings: cityMapHighlights }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(WorldPresenceLine, { building: "praca", ctx: worldPresenceCtx }),
      environmentalLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: environmentalLine }) : null,
      worldSimulationLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: worldSimulationLine }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: landmarkIdentityLine }),
      cityAmbientLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: cityAmbientLine }) : null,
      microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: microEventLine }) : null,
      worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
      kingdomEvolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: kingdomEvolutionLine }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("p", { className: "hint city-of-the-day", children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("span", { children: "\u{1F4AC} Hoje muitos viajantes comentam sobre:" }),
        " ",
        rumorTopicOfTheDay.title
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("p", { className: "hint city-of-the-day", children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("span", { children: "\u{1F426}" }),
        " ",
        ravenAmbient
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("h3", { className: "hidden-objects-title", children: "Pela pra\xE7a" }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(GuideBubble, { flag: "hidden_object_seen", message: "Alguns cantos comuns da pra\xE7a escondem uma pequena curiosidade \u2014 vale clicar." }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("p", { className: "hint", children: "Alguns cantos da pra\xE7a respondem quando voc\xEA clica neles." }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("p", { className: "hint city-of-the-day", children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsx)("span", { children: "\u{1F6E1}\uFE0F Um guarda comenta:" }),
        ' "',
        guardComment,
        '"'
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("p", { className: "hint city-of-the-day", children: [
        /* @__PURE__ */ (0, import_jsx_runtime44.jsxs)("span", { children: [
          objectOfTheDay.icon,
          " Objeto curioso do dia:"
        ] }),
        " ",
        objectOfTheDay.name
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime44.jsx)(HiddenObjects, {})
    ] })
  ] });
}
export {
  CityPage
};
