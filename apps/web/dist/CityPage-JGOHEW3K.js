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
} from "./chunk-MS2MAWWM.js";
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
var import_react13 = __toESM(require_react(), 1);

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

// apps/web/src/lib/codex.ts
function matchesSearch(query, text, locked) {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return true;
  if (locked) return false;
  return text.toLowerCase().includes(normalized);
}
function matchesOption(selected, value) {
  return selected === null || selected === value;
}

// apps/web/src/components/codex/CodexEmptyState.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function CodexEmptyState({ message }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: message });
}

// apps/web/src/components/codex/CodexSidebar.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function CodexSidebar({ toolbar, isEmpty, emptyMessage, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "book-shelf", children: [
    toolbar,
    isEmpty ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CodexEmptyState, { message: emptyMessage }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "book-shelf-list", children })
  ] });
}

// apps/web/src/components/codex/CodexSearch.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function CodexSearch({ value, onChange, placeholder }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
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
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function CodexToolbar({ searchValue, onSearchChange, searchPlaceholder, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CodexSearch, { value: searchValue, onChange: onSearchChange, placeholder: searchPlaceholder }),
    children
  ] });
}

// apps/web/src/components/codex/CodexFilter.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var CodexFilter = (0, import_react2.memo)(function CodexFilter2({ allLabel, options, selected, onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      "button",
      {
        type: "button",
        className: `book-category-chip${selected === null ? " book-category-chip-active" : ""}`,
        onClick: () => onSelect(null),
        children: allLabel
      }
    ),
    options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
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
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
function CodexCategoryList({
  categories,
  selected,
  onSelect,
  allLabel = "Todas"
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "book-category-filter", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
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
var import_react3 = __toESM(require_react(), 1);

// apps/web/src/components/codex/CodexStatusBadge.tsx
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function CodexStatusBadge({ label, className = "book-card-status" }) {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className, children: label });
}

// apps/web/src/components/codex/CodexCard.tsx
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
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
var CodexCard = (0, import_react3.memo)(function CodexCard2({
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
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
    "button",
    {
      type: "button",
      className: `${cls.root}${selected ? ` ${cls.selected}` : ""}${locked ? ` ${cls.locked}` : ""}`,
      onClick: onSelect,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: cls.icon, children: icon }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: cls.info, children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("strong", { className: cls.title, children: title }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: cls.meta, children: meta }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(CodexStatusBadge, { label: statusLabel, className: cls.status })
        ] })
      ]
    }
  );
});

// apps/web/src/components/library/BookShelf.tsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL = {
  bloqueado: "\u{1F512} Bloqueado",
  conhecido: "\u{1F4D8} Conhecido",
  lido: "\u2705 Lido"
};
function BookShelf({ books, selectedBookId, onSelectBook }) {
  const [query, setQuery] = (0, import_react4.useState)("");
  const [category, setCategory] = (0, import_react4.useState)(null);
  const filtered = (0, import_react4.useMemo)(() => {
    return books.filter(
      (book) => matchesSearch(query, book.title, false) && matchesOption(category, book.category)
    );
  }, [books, query, category]);
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(CodexCategoryList, { categories: BOOK_CATEGORIES, selected: category, onSelect: setCategory }) }),
      isEmpty: filtered.length === 0,
      emptyMessage: "Nenhum livro encontrado.",
      children: filtered.map((book) => {
        const bookCategory = BOOK_CATEGORIES.find((c) => c.slug === book.category);
        return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
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
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
var BookPage = (0, import_react6.memo)(function BookPage2({ content, pageNumber, totalPages }) {
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "book-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "book-page-content", children: renderMarkdownLite(content) }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "book-page-number", children: [
      "P\xE1gina ",
      pageNumber,
      " de ",
      totalPages
    ] })
  ] });
});

// apps/web/src/components/codex/CodexHeader.tsx
var import_jsx_runtime20 = __toESM(require_jsx_runtime(), 1);
function CodexHeader({ icon, title, subtitle }) {
  return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h3", { className: "book-reader-title", children: icon ? `${icon} ${title}` : title }),
    subtitle ? /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("span", { className: "book-reader-author", children: subtitle }) : null
  ] });
}

// apps/web/src/components/codex/CodexInfoPanel.tsx
var import_jsx_runtime21 = __toESM(require_jsx_runtime(), 1);
function CodexInfoPanel({ message, hint }) {
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(import_jsx_runtime21.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("p", { className: "book-reader-locked-message", children: message }),
    hint ? /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("p", { className: "hint", children: hint }) : null
  ] });
}

// apps/web/src/components/codex/CodexFacts.tsx
var import_jsx_runtime22 = __toESM(require_jsx_runtime(), 1);
function CodexFacts({ facts }) {
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: "creature-reader-facts", children: facts.map((fact) => /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: "creature-reader-fact", children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { children: fact.label }),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("strong", { children: fact.value })
  ] }, fact.label)) });
}

// apps/web/src/components/codex/CodexPagination.tsx
var import_jsx_runtime23 = __toESM(require_jsx_runtime(), 1);
function CodexPagination({ pageIndex, totalPages, onChange }) {
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: "book-reader-nav", children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("button", { type: "button", onClick: () => onChange(Math.max(0, pageIndex - 1)), disabled: pageIndex === 0, children: "\u2190 P\xE1gina anterior" }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
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
var import_jsx_runtime24 = __toESM(require_jsx_runtime(), 1);
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
  const [pageIndex, setPageIndex] = (0, import_react7.useState)(0);
  if (isEmpty) {
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("div", { className: "book-reader book-reader-empty", children: /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(CodexEmptyState, { message: emptyMessage }) });
  }
  if (locked) {
    return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "book-reader book-reader-locked", children: [
      /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(CodexHeader, { title: lockedTitle, subtitle: lockedSubtitle }),
      /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(CodexInfoPanel, { message: lockedMessage, hint: `Condi\xE7\xE3o de desbloqueio: ${unlockCondition}` })
    ] });
  }
  const totalPages = pages.length;
  const currentPage = pages[Math.min(pageIndex, totalPages - 1)];
  return /* @__PURE__ */ (0, import_jsx_runtime24.jsxs)("div", { className: "book-reader", children: [
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(CodexHeader, { icon, title, subtitle }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)("p", { className: "book-reader-description", children: description }),
    facts && facts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(CodexFacts, { facts }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(BookPage, { content: currentPage, pageNumber: pageIndex + 1, totalPages }),
    /* @__PURE__ */ (0, import_jsx_runtime24.jsx)(CodexPagination, { pageIndex, totalPages, onChange: setPageIndex })
  ] });
}

// apps/web/src/components/library/BookReader.tsx
var import_jsx_runtime25 = __toESM(require_jsx_runtime(), 1);
function BookReader({ book }) {
  return /* @__PURE__ */ (0, import_jsx_runtime25.jsx)(
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
var import_jsx_runtime26 = __toESM(require_jsx_runtime(), 1);
function CodexLayout({ sidebar, reader }) {
  return /* @__PURE__ */ (0, import_jsx_runtime26.jsxs)("div", { className: "library-screen", children: [
    sidebar,
    reader
  ] });
}

// apps/web/src/components/city/LibraryBuilding.tsx
var import_jsx_runtime27 = __toESM(require_jsx_runtime(), 1);
function LibraryBuilding() {
  const [selectedBookId, setSelectedBookId] = (0, import_react8.useState)(null);
  const selectedBook = BOOKS.find((book) => book.id === selectedBookId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime27.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("h2", { children: "\u{1F4DA} Biblioteca" }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(NpcIntro, { npc: NPCS.bibliotecaria }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)("p", { className: "hint", children: "Um c\xF3dice para cada hist\xF3ria do Reino \u2014 algumas ainda por vir." }),
    /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(BookShelf, { books: BOOKS, selectedBookId, onSelectBook: setSelectedBookId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime27.jsx)(BookReader, { book: selectedBook }, selectedBook?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_react10 = __toESM(require_react(), 1);

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
var import_react9 = __toESM(require_react(), 1);
var import_jsx_runtime28 = __toESM(require_jsx_runtime(), 1);
var STATUS_LABEL2 = {
  bloqueado: "\u{1F512} Bloqueado",
  visto: "\u{1F441}\uFE0F Visto",
  estudado: "\u{1F4D7} Estudado"
};
var DANGER_LEVELS = ["baixa", "media", "alta", "letal"];
function CreatureCatalog({ creatures, selectedCreatureId, onSelectCreature }) {
  const [query, setQuery] = (0, import_react9.useState)("");
  const [type, setType] = (0, import_react9.useState)(null);
  const [danger, setDanger] = (0, import_react9.useState)(null);
  const filtered = (0, import_react9.useMemo)(() => {
    return creatures.filter(
      (creature) => matchesSearch(query, creature.name, creature.locked) && matchesOption(type, creature.type) && matchesOption(danger, creature.dangerLevel)
    );
  }, [creatures, query, type, danger]);
  return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo nome...", children: /* @__PURE__ */ (0, import_jsx_runtime28.jsxs)("div", { className: "creature-filters", children: [
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
          CodexFilter,
          {
            allLabel: "Todos os tipos",
            selected: type,
            onSelect: (value) => setType(value),
            options: CREATURE_TYPES.map((t) => ({ value: t.slug, label: `${t.icon} ${t.label}` }))
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime28.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
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
        return /* @__PURE__ */ (0, import_jsx_runtime28.jsx)(
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
var import_jsx_runtime29 = __toESM(require_jsx_runtime(), 1);
function CreatureReader({ creature }) {
  const type = creature ? CREATURE_TYPES.find((t) => t.slug === creature.type) : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime29.jsx)(
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
        { label: "Regi\xE3o", value: getRegionName(creature.regionId) },
        { label: "Periculosidade", value: DANGER_LABEL[creature.dangerLevel] }
      ] : [],
      pages: creature?.pages ?? []
    }
  );
}

// apps/web/src/components/city/BestiaryBuilding.tsx
var import_jsx_runtime30 = __toESM(require_jsx_runtime(), 1);
function BestiaryBuilding() {
  const [selectedCreatureId, setSelectedCreatureId] = (0, import_react10.useState)(null);
  const selectedCreature = CREATURES.find((creature) => creature.id === selectedCreatureId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime30.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("h2", { children: "\u{1F52C} Besti\xE1rio" }),
    /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(NpcIntro, { npc: NPCS.erudito }),
    /* @__PURE__ */ (0, import_jsx_runtime30.jsx)("p", { className: "hint", children: "Um registro de tudo que j\xE1 foi visto \u2014 e do pouco que j\xE1 foi entendido." }),
    /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(
          CreatureCatalog,
          {
            creatures: CREATURES,
            selectedCreatureId,
            onSelectCreature: setSelectedCreatureId
          }
        ),
        reader: /* @__PURE__ */ (0, import_jsx_runtime30.jsx)(CreatureReader, { creature: selectedCreature }, selectedCreature?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/components/city/MuseumBuilding.tsx
var import_react12 = __toESM(require_react(), 1);

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
var import_react11 = __toESM(require_react(), 1);
var import_jsx_runtime31 = __toESM(require_jsx_runtime(), 1);
var STATUS_OPTIONS = ["bloqueado", "conhecido", "registrado"];
function MuseumShelf({ entries, selectedEntryId, onSelectEntry }) {
  const [query, setQuery] = (0, import_react11.useState)("");
  const [category, setCategory] = (0, import_react11.useState)(null);
  const [year, setYear] = (0, import_react11.useState)(null);
  const [status, setStatus] = (0, import_react11.useState)(null);
  const years = (0, import_react11.useMemo)(() => Array.from(new Set(entries.map((entry) => entry.year))), [entries]);
  const filtered = (0, import_react11.useMemo)(() => {
    return entries.filter(
      (entry) => matchesSearch(query, entry.title, entry.locked) && matchesOption(category, entry.category) && matchesOption(year, entry.year) && matchesOption(status, entry.status)
    );
  }, [entries, query, category, year, status]);
  return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
    CodexSidebar,
    {
      toolbar: /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)(CodexToolbar, { searchValue: query, onSearchChange: setQuery, searchPlaceholder: "Pesquisar pelo t\xEDtulo...", children: [
        /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(CodexCategoryList, { categories: MUSEUM_CATEGORIES, selected: category, onSelect: setCategory, allLabel: "Todas as alas" }),
        /* @__PURE__ */ (0, import_jsx_runtime31.jsxs)("div", { className: "creature-filters", children: [
          /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
            CodexFilter,
            {
              allLabel: "Qualquer status",
              selected: status,
              onSelect: (value) => setStatus(value),
              options: STATUS_OPTIONS.map((option) => ({ value: option, label: MUSEUM_STATUS_LABEL[option] }))
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime31.jsx)("div", { className: "creature-filter-row", children: /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
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
        return /* @__PURE__ */ (0, import_jsx_runtime31.jsx)(
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
var import_jsx_runtime32 = __toESM(require_jsx_runtime(), 1);
function MuseumReader({ entry }) {
  const category = entry ? MUSEUM_CATEGORIES.find((c) => c.slug === entry.category) : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime32.jsx)(
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
var import_jsx_runtime33 = __toESM(require_jsx_runtime(), 1);
function MuseumBuilding() {
  const [selectedEntryId, setSelectedEntryId] = (0, import_react12.useState)(null);
  const selectedEntry = MUSEUM_ENTRIES.find((entry) => entry.id === selectedEntryId) ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime33.jsxs)("section", { className: "city-building-screen", children: [
    /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("h2", { children: "\u{1F5BC}\uFE0F Museu do Reino" }),
    /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(NpcIntro, { npc: NPCS.curador }),
    /* @__PURE__ */ (0, import_jsx_runtime33.jsx)("p", { className: "hint", children: "Onde a hist\xF3ria da comunidade fica registrada \u2014 parte dela, ao menos." }),
    /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(
      CodexLayout,
      {
        sidebar: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(MuseumShelf, { entries: MUSEUM_ENTRIES, selectedEntryId, onSelectEntry: setSelectedEntryId }),
        reader: /* @__PURE__ */ (0, import_jsx_runtime33.jsx)(MuseumReader, { entry: selectedEntry }, selectedEntry?.id ?? "empty")
      }
    )
  ] });
}

// apps/web/src/pages/CityPage.tsx
var import_jsx_runtime34 = __toESM(require_jsx_runtime(), 1);
function formatClock(ms) {
  return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function CityPage() {
  const { profile } = useAuth();
  const { character } = useCharacter(!!profile);
  const { identity } = useIdentity(!!profile);
  const [channel, setChannel] = (0, import_react13.useState)(getStoredChannel());
  const [worldState, setWorldState] = (0, import_react13.useState)(null);
  const [selected, setSelected] = (0, import_react13.useState)(null);
  const [clock, setClock] = (0, import_react13.useState)(() => formatClock(Date.now()));
  (0, import_react13.useEffect)(() => {
    const query = channel ? `?channel=${encodeURIComponent(channel)}` : "";
    void api.get(`/api/world/state${query}`).then(setWorldState).catch(() => void 0);
  }, [channel]);
  (0, import_react13.useEffect)(() => {
    const id = window.setInterval(() => setClock(formatClock(Date.now())), CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const kingdom = worldState?.channel_kingdom ?? null;
  return /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(GuideBubble, { flag: "city_seen", message: "Este \xE9 o centro do Reino." }),
    /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "card city-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h1", { children: "Capital" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "hint", children: "A cidade onde toda a jornada do Reino acontece." }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("label", { children: [
        "Reino atual",
        /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
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
    selected ? /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "card city-building", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("button", { type: "button", className: "city-back-btn", onClick: () => setSelected(null), children: "\u2190 Voltar \xE0 Pra\xE7a Central" }),
      selected === "arena" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(ArenaBuilding, { identity, kingdom }) : null,
      selected === "ferreiro" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(BlacksmithBuilding, { equipped: character?.equipped ?? [] }) : null,
      selected === "mercador" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(MerchantBuilding, {}) : null,
      selected === "alquimista" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(AlchemistBuilding, {}) : null,
      selected === "guilda" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(GuildBuilding, { kingdom, identity }) : null,
      selected === "banco" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(BankBuilding, { character }) : null,
      selected === "portao-norte" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(NorthGateBuilding, { enabled: !!profile }) : null,
      selected === "biblioteca" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(LibraryBuilding, {}) : null,
      selected === "bestiario" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(BestiaryBuilding, {}) : null,
      selected === "museu" ? /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(MuseumBuilding, {}) : null
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime34.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("h2", { children: "Pra\xE7a Central" }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(
        CityHubBar,
        {
          worldState,
          clock,
          channelDisplayName: kingdom?.channel_display_name ?? null
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(CitySquareDecor, {}),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)("p", { className: "hint", children: "Escolha um edif\xEDcio para visitar." }),
      /* @__PURE__ */ (0, import_jsx_runtime34.jsx)(CityMap, { onSelect: setSelected })
    ] })
  ] });
}
export {
  CityPage
};
//# sourceMappingURL=CityPage-JGOHEW3K.js.map
