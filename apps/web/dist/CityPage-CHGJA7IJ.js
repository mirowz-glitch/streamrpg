import {
  ExpeditionPanel,
  useCharacter,
  useIdentity
} from "./chunk-IRF6TFE4.js";
import {
  useAuth
} from "./chunk-D5HB47MK.js";
import {
  StatsRow
} from "./chunk-F5IH7LAM.js";
import {
  CityMap,
  NPCS,
  NpcIntro
} from "./chunk-MPIMUCAC.js";
import {
  HallOfFame,
  REGIONS,
  RegionGallery
} from "./chunk-L3Q6SCL4.js";
import {
  EquipmentSlots
} from "./chunk-3TV7DZMP.js";
import "./chunk-IGCLJZA6.js";
import {
  CLOCK_TICK_MS
} from "./chunk-QJIELRY3.js";
import "./chunk-DMGYBMOJ.js";
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
import "./chunk-GTLHMQAD.js";
import {
  api
} from "./chunk-I6SULFQR.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/pages/CityPage.tsx
var import_react14 = __toESM(require_react(), 1);

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

// apps/web/src/components/city/LibraryBuilding.tsx
var import_react8 = __toESM(require_react(), 1);

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
  }
];

// apps/web/src/components/library/BookShelf.tsx
var import_react4 = __toESM(require_react(), 1);

// apps/web/src/components/library/BookCard.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL = {
  bloqueado: "\u{1F512} Bloqueado",
  conhecido: "\u{1F4D8} Conhecido",
  lido: "\u2705 Lido"
};
var BookCard = (0, import_react2.memo)(function BookCard2({ book, selected, onSelect }) {
  const category = BOOK_CATEGORIES.find((c) => c.slug === book.category);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "button",
    {
      type: "button",
      className: `book-card${selected ? " book-card-selected" : ""}${book.locked ? " book-card-locked" : ""}`,
      onClick: () => onSelect(book.id),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "book-card-icon", children: category?.icon ?? "\u{1F4D6}" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "book-card-info", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { className: "book-card-title", children: book.title }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "book-card-author", children: book.author }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "book-card-status", children: STATUS_LABEL[book.status] })
        ] })
      ]
    }
  );
});

// apps/web/src/components/library/BookCategory.tsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var BookCategory = (0, import_react3.memo)(function BookCategory2({ selected, onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "book-category-filter", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      "button",
      {
        type: "button",
        className: `book-category-chip${selected === null ? " book-category-chip-active" : ""}`,
        onClick: () => onSelect(null),
        children: "Todas"
      }
    ),
    BOOK_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
      "button",
      {
        type: "button",
        className: `book-category-chip${selected === category.slug ? " book-category-chip-active" : ""}`,
        onClick: () => onSelect(category.slug),
        children: [
          category.icon,
          " ",
          category.label
        ]
      },
      category.slug
    ))
  ] });
});

// apps/web/src/components/library/BookShelf.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function BookShelf({ books, selectedBookId, onSelectBook }) {
  const [query, setQuery] = (0, import_react4.useState)("");
  const [category, setCategory] = (0, import_react4.useState)(null);
  const filtered = (0, import_react4.useMemo)(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return books.filter((book) => {
      const matchesQuery = normalizedQuery === "" || book.title.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === null || book.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [books, query, category]);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "book-shelf", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "input",
      {
        type: "search",
        className: "book-search-input",
        value: query,
        onChange: (e) => setQuery(e.target.value),
        placeholder: "Pesquisar pelo t\xEDtulo..."
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BookCategory, { selected: category, onSelect: setCategory }),
    filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("p", { className: "hint", children: "Nenhum livro encontrado." }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "book-shelf-list", children: filtered.map((book) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(BookCard, { book, selected: book.id === selectedBookId, onSelect: onSelectBook }, book.id)) })
  ] });
}

// apps/web/src/components/library/BookReader.tsx
var import_react7 = __toESM(require_react(), 1);

// apps/web/src/components/library/BookPage.tsx
var import_react6 = __toESM(require_react(), 1);

// apps/web/src/lib/markdownLite.ts
var import_react5 = __toESM(require_react(), 1);
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((part) => part !== "");
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (0, import_react5.createElement)("strong", { key }, part.slice(2, -2));
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (0, import_react5.createElement)("em", { key }, part.slice(1, -1));
    }
    return (0, import_react5.createElement)(import_react5.Fragment, { key }, part);
  });
}
function renderMarkdownLite(content) {
  const paragraphs = content.split(/\n\s*\n/);
  return paragraphs.map(
    (paragraph, index) => (0, import_react5.createElement)("p", { key: index, className: "book-page-paragraph" }, renderInline(paragraph, `p${index}`))
  );
}

// apps/web/src/components/library/BookPage.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
var BookPage = (0, import_react6.memo)(function BookPage2({ content, pageNumber, totalPages }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "book-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: "book-page-content", children: renderMarkdownLite(content) }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "book-page-number", children: [
      "P\xE1gina ",
      pageNumber,
      " de ",
      totalPages
    ] })
  ] });
});

// apps/web/src/components/library/BookReader.tsx
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
function BookReader({ book }) {
  const [pageIndex, setPageIndex] = (0, import_react7.useState)(0);
  if (!book) {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "book-reader book-reader-empty", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("p", { className: "hint", children: "Escolha um livro na estante ao lado." }) });
  }
  if (book.locked) {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "book-reader book-reader-locked", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "book-reader-title", children: book.title }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "book-reader-author", children: book.author }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("p", { className: "book-reader-locked-message", children: "\u{1F512} Este livro ainda est\xE1 bloqueado." }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("p", { className: "hint", children: [
        "Condi\xE7\xE3o de desbloqueio: ",
        book.unlockCondition
      ] })
    ] });
  }
  const totalPages = book.pages.length;
  const currentPage = book.pages[Math.min(pageIndex, totalPages - 1)];
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "book-reader", children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("h3", { className: "book-reader-title", children: book.title }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("span", { className: "book-reader-author", children: book.author }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("p", { className: "book-reader-description", children: book.description }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(BookPage, { content: currentPage, pageNumber: pageIndex + 1, totalPages }),
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "book-reader-nav", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("button", { type: "button", onClick: () => setPageIndex((p) => Math.max(0, p - 1)), disabled: pageIndex === 0, children: "\u2190 P\xE1gina anterior" }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        "button",
        {
          type: "button",
          onClick: () => setPageIndex((p) => Math.min(totalPages - 1, p + 1)),
          disabled: pageIndex >= totalPages - 1,
          children: "P\xE1gina seguinte \u2192"
        }
      )
    ] })
  ] });
}

// apps/web/src/components/city/LibraryBuilding.tsx
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
function LibraryBuilding() {
  const [selectedBookId, setSelectedBookId] = (0, import_react8.useState)(null);
  const selectedBook = BOOKS.find((book) => book.id === selectedBookId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("h2", { children: "\u{1F4DA} Biblioteca" }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(NpcIntro, { npc: NPCS.bibliotecaria }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("p", { className: "hint", children: "Um c\xF3dice para cada hist\xF3ria do Reino \u2014 algumas ainda por vir." }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "library-screen", children: [
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(BookShelf, { books: BOOKS, selectedBookId, onSelectBook: setSelectedBookId }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(BookReader, { book: selectedBook }, selectedBook?.id ?? "empty")
    ] })
  ] });
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_react13 = __toESM(require_react(), 1);

// apps/web/src/lib/bestiary.ts
var CREATURE_TYPES = [
  { slug: "besta", label: "Besta", icon: "\u{1F43A}" },
  { slug: "morto-vivo", label: "Morto-vivo", icon: "\u{1F480}" },
  { slug: "elemental", label: "Elemental", icon: "\u{1F525}" },
  { slug: "humanoide", label: "Humanoide", icon: "\u{1F5E1}\uFE0F" },
  { slug: "dragao", label: "Drag\xE3o", icon: "\u{1F409}" },
  { slug: "espirito", label: "Esp\xEDrito", icon: "\u{1F47B}" },
  { slug: "aberracao", label: "Aberra\xE7\xE3o", icon: "\u{1F441}\uFE0F" },
  { slug: "construto", label: "Constructo", icon: "\u2699\uFE0F" }
];
var DANGER_LABEL = {
  baixa: "Baixa",
  media: "M\xE9dia",
  alta: "Alta",
  letal: "Letal"
};
function getRegionName(regionId) {
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
    status: "estudado"
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
    status: "visto"
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
    status: "visto"
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
    status: "bloqueado"
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
    status: "bloqueado"
  }
];

// apps/web/src/components/bestiary/CreatureCatalog.tsx
var import_react11 = __toESM(require_react(), 1);

// apps/web/src/components/bestiary/CreatureCard.tsx
var import_react9 = __toESM(require_react(), 1);
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL2 = {
  bloqueado: "\u{1F512} Bloqueado",
  visto: "\u{1F441}\uFE0F Visto",
  estudado: "\u{1F4D7} Estudado"
};
var CreatureCard = (0, import_react9.memo)(function CreatureCard2({ creature, selected, onSelect }) {
  const type = CREATURE_TYPES.find((t) => t.slug === creature.type);
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
    "button",
    {
      type: "button",
      className: `creature-card${selected ? " creature-card-selected" : ""}${creature.locked ? " creature-card-locked" : ""}`,
      onClick: () => onSelect(creature.id),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "creature-card-icon", children: creature.locked ? "\u2754" : creature.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "creature-card-info", children: [
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("strong", { className: "creature-card-name", children: creature.locked ? "Criatura desconhecida" : creature.name }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("span", { className: "creature-card-meta", children: [
            type?.label ?? creature.type,
            " \xB7 Periculosidade ",
            DANGER_LABEL[creature.dangerLevel]
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "creature-card-status", children: STATUS_LABEL2[creature.status] })
        ] })
      ]
    }
  );
});

// apps/web/src/components/bestiary/CreatureFilter.tsx
var import_react10 = __toESM(require_react(), 1);
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var DANGER_LEVELS = ["baixa", "media", "alta", "letal"];
var CreatureFilter = (0, import_react10.memo)(function CreatureFilter2({
  selectedType,
  onSelectType,
  selectedDanger,
  onSelectDanger
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "creature-filters", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "creature-filter-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        "button",
        {
          type: "button",
          className: `book-category-chip${selectedType === null ? " book-category-chip-active" : ""}`,
          onClick: () => onSelectType(null),
          children: "Todos os tipos"
        }
      ),
      CREATURE_TYPES.map((type) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
        "button",
        {
          type: "button",
          className: `book-category-chip${selectedType === type.slug ? " book-category-chip-active" : ""}`,
          onClick: () => onSelectType(type.slug),
          children: [
            type.icon,
            " ",
            type.label
          ]
        },
        type.slug
      ))
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "creature-filter-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        "button",
        {
          type: "button",
          className: `book-category-chip${selectedDanger === null ? " book-category-chip-active" : ""}`,
          onClick: () => onSelectDanger(null),
          children: "Qualquer periculosidade"
        }
      ),
      DANGER_LEVELS.map((danger) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        "button",
        {
          type: "button",
          className: `book-category-chip${selectedDanger === danger ? " book-category-chip-active" : ""}`,
          onClick: () => onSelectDanger(danger),
          children: DANGER_LABEL[danger]
        },
        danger
      ))
    ] })
  ] });
});

// apps/web/src/components/bestiary/CreatureCatalog.tsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
function CreatureCatalog({ creatures, selectedCreatureId, onSelectCreature }) {
  const [query, setQuery] = (0, import_react11.useState)("");
  const [type, setType] = (0, import_react11.useState)(null);
  const [danger, setDanger] = (0, import_react11.useState)(null);
  const filtered = (0, import_react11.useMemo)(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return creatures.filter((creature) => {
      const matchesQuery = normalizedQuery === "" || !creature.locked && creature.name.toLowerCase().includes(normalizedQuery);
      const matchesType = type === null || creature.type === type;
      const matchesDanger = danger === null || creature.dangerLevel === danger;
      return matchesQuery && matchesType && matchesDanger;
    });
  }, [creatures, query, type, danger]);
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "book-shelf", children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      "input",
      {
        type: "search",
        className: "book-search-input",
        value: query,
        onChange: (e) => setQuery(e.target.value),
        placeholder: "Pesquisar pelo nome..."
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(CreatureFilter, { selectedType: type, onSelectType: setType, selectedDanger: danger, onSelectDanger: setDanger }),
    filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("p", { className: "hint", children: "Nenhuma criatura encontrada." }) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "book-shelf-list", children: filtered.map((creature) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      CreatureCard,
      {
        creature,
        selected: creature.id === selectedCreatureId,
        onSelect: onSelectCreature
      },
      creature.id
    )) })
  ] });
}

// apps/web/src/components/bestiary/CreatureReader.tsx
var import_react12 = __toESM(require_react(), 1);
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
function CreatureReader({ creature }) {
  const [pageIndex, setPageIndex] = (0, import_react12.useState)(0);
  if (!creature) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "book-reader book-reader-empty", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "hint", children: "Escolha uma criatura no cat\xE1logo ao lado." }) });
  }
  if (creature.locked) {
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "book-reader book-reader-locked", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("h3", { className: "book-reader-title", children: "Criatura desconhecida" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "book-reader-locked-message", children: "\u{1F512} Este registro ainda est\xE1 bloqueado." }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("p", { className: "hint", children: [
        "Condi\xE7\xE3o de desbloqueio: ",
        creature.unlockCondition
      ] })
    ] });
  }
  const type = CREATURE_TYPES.find((t) => t.slug === creature.type);
  const totalPages = creature.pages.length;
  const currentPage = creature.pages[Math.min(pageIndex, totalPages - 1)];
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "book-reader", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("h3", { className: "book-reader-title", children: [
      creature.icon,
      " ",
      creature.name
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "book-reader-author", children: type?.label ?? creature.type }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("p", { className: "book-reader-description", children: creature.description }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "creature-reader-facts", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "creature-reader-fact", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: "Habitat" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("strong", { children: creature.habitat })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "creature-reader-fact", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: "Regi\xE3o" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("strong", { children: getRegionName(creature.regionId) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "creature-reader-fact", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: "Periculosidade" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("strong", { children: DANGER_LABEL[creature.dangerLevel] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(BookPage, { content: currentPage, pageNumber: pageIndex + 1, totalPages }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "book-reader-nav", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("button", { type: "button", onClick: () => setPageIndex((p) => Math.max(0, p - 1)), disabled: pageIndex === 0, children: "\u2190 P\xE1gina anterior" }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "button",
        {
          type: "button",
          onClick: () => setPageIndex((p) => Math.min(totalPages - 1, p + 1)),
          disabled: pageIndex >= totalPages - 1,
          children: "P\xE1gina seguinte \u2192"
        }
      )
    ] })
  ] });
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
function BestiaryBuilding() {
  const [selectedCreatureId, setSelectedCreatureId] = (0, import_react13.useState)(null);
  const selectedCreature = CREATURES.find((creature) => creature.id === selectedCreatureId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h2", { children: "\u{1F52C} Besti\xE1rio" }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(NpcIntro, { npc: NPCS.erudito }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("p", { className: "hint", children: "Um registro de tudo que j\xE1 foi visto \u2014 e do pouco que j\xE1 foi entendido." }),
    /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: "library-screen", children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        CreatureCatalog,
        {
          creatures: CREATURES,
          selectedCreatureId,
          onSelectCreature: setSelectedCreatureId
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CreatureReader, { creature: selectedCreature }, selectedCreature?.id ?? "empty")
    ] })
  ] });
}

// apps/web/src/pages/CityPage.tsx
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = (0, import_react14.useState)(getStoredChannel());
  const [worldState, setWorldState] = (0, import_react14.useState)(null);
  const [selected, setSelected] = (0, import_react14.useState)(null);
  const [clock, setClock] = (0, import_react14.useState)(() => formatClock(Date.now()));
  (0, import_react14.useEffect)(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get(`/api/world/state${query}`).then(setWorldState).catch(() => void 0);
  }, [channel]);
  (0, import_react14.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const kingdom = worldState?.channel_kingdom ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(GuideBubble, { flag: "city_seen", message: "Este \xE9 o centro do Reino." }),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "card city-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("h1", { children: "Capital" }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("p", { className: "hint", children: "A cidade onde toda a jornada do Reino acontece." }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("label", { children: [
        "Reino atual",
        /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
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
    selected ? /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "card city-building", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { type: "button", className: "city-back-btn", onClick: () => setSelected(null), children: "\u2190 Voltar \xE0 Pra\xE7a Central" }),
      selected === "arena" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(ArenaBuilding, { identity, kingdom }) : null,
      selected === "ferreiro" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(BlacksmithBuilding, { equipped: character?.equipped ?? [] }) : null,
      selected === "mercador" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(MerchantBuilding, {}) : null,
      selected === "alquimista" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(AlchemistBuilding, {}) : null,
      selected === "guilda" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(GuildBuilding, { kingdom, identity }) : null,
      selected === "banco" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(BankBuilding, { character }) : null,
      selected === "portao-norte" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(NorthGateBuilding, { enabled: !!profile }) : null,
      selected === "biblioteca" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(LibraryBuilding, {}) : null,
      selected === "bestiario" ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(BestiaryBuilding, {}) : null
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("h2", { children: "Pra\xE7a Central" }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        CityHubBar,
        {
          worldState,
          clock,
          channelDisplayName: kingdom?.channel_display_name ?? null
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(CitySquareDecor, {}),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("p", { className: "hint", children: "Escolha um edif\xEDcio para visitar." }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(CityMap, { onSelect: setSelected })
    ] })
  ] });
}
export {
  CityPage
};
//# sourceMappingURL=CityPage-CHGJA7IJ.js.map
