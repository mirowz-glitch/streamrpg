import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/HallOfFame.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var HallOfFameSlotItem = (0, import_react.memo)(function HallOfFameSlotItem2({ slot }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: "hall-of-fame-slot", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hall-of-fame-icon", children: slot.icon }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hall-of-fame-role", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: slot.role_name }),
      slot.holder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hall-of-fame-holder", children: slot.holder.display_name }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hall-of-fame-empty", children: "Ainda sem ocupante" })
    ] })
  ] });
});
function HallOfFame({ slots }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "hall-of-fame-list", children: slots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HallOfFameSlotItem, { slot }, slot.role)) });
}

// apps/web/src/components/ui/RegionGallery.tsx
var import_react2 = __toESM(require_react(), 1);

// apps/web/src/lib/regions.ts
var REGIONS = [
  {
    id: "porto-do-amanhecer",
    name: "Porto do Amanhecer",
    description: "Eu estou seguro, mas o mundo l\xE1 fora est\xE1 esperando.",
    difficulty: "Nenhuma (hub inicial)",
    theme: "Segura, acolhedora, sem tens\xE3o"
  },
  {
    id: "bosque-sussurrante",
    name: "Bosque Sussurrante",
    description: "Isto \xE9 seguro o bastante pra eu explorar sem medo, mas ainda me surpreende.",
    difficulty: "Baixa",
    theme: "Curiosidade tranquila"
  },
  {
    id: "pantano-podre",
    name: "P\xE2ntano Podre",
    description: "Preciso ir com cautela, isto n\xE3o perdoa pressa.",
    difficulty: "Baixa-m\xE9dia",
    theme: "Pavor contido"
  },
  {
    id: "colinas-aridas",
    name: "Colinas \xC1ridas",
    description: "Estou exposto, e eles sabem disso.",
    difficulty: "Baixa-m\xE9dia",
    theme: "Exposi\xE7\xE3o"
  },
  {
    id: "planicie-dourada",
    name: "Plan\xEDcie Dourada",
    description: "Aqui eu relaxo \u2014 mas nem tudo aqui \xE9 inofensivo.",
    difficulty: "Muito baixa",
    theme: "Falsa tranquilidade"
  },
  {
    id: "minas-abandonadas",
    name: "Minas Abandonadas",
    description: "O ar est\xE1 pesado, e eu n\xE3o sei o que vem depois da pr\xF3xima curva.",
    difficulty: "M\xE9dia",
    theme: "Claustrofobia crescente"
  },
  {
    id: "litoral-quebrado",
    name: "Litoral Quebrado",
    description: "Algo aqui j\xE1 afundou antes de mim \u2014 espero n\xE3o ser o pr\xF3ximo.",
    difficulty: "M\xE9dia",
    theme: "Melancolia"
  },
  {
    id: "picos-congelados",
    name: "Picos Congelados",
    description: "Estou pequeno diante disto, e isso \xE9 intencional.",
    difficulty: "M\xE9dia-alta",
    theme: "Isolamento e rever\xEAncia"
  },
  {
    id: "deserto-de-vidro",
    name: "Deserto de Vidro",
    description: "Algo terr\xEDvel aconteceu aqui, e ainda n\xE3o terminou.",
    difficulty: "Alta",
    theme: "Errado, artificial"
  },
  {
    id: "ruinas-esquecidas",
    name: "Ru\xEDnas Esquecidas",
    description: "Isto j\xE1 foi grandioso \u2014 e talvez ainda seja perigoso por causa disso.",
    difficulty: "Alta",
    theme: "Rever\xEAncia e inquieta\xE7\xE3o"
  },
  {
    id: "fortaleza-sombria",
    name: "Fortaleza Sombria",
    description: "Tudo que aprendi at\xE9 aqui est\xE1 sendo testado agora.",
    difficulty: "Muito alta (endgame)",
    theme: "Cl\xEDmax"
  }
];

// apps/web/src/components/ui/RegionGallery.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var RegionGallery = (0, import_react2.memo)(function RegionGallery2() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "region-grid", children: REGIONS.map((region) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "region-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "region-name", children: region.name }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "region-difficulty", children: region.difficulty }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "region-description", children: [
      '"',
      region.description,
      '"'
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "region-theme", children: region.theme })
  ] }, region.id)) });
});

export {
  HallOfFame,
  REGIONS,
  RegionGallery
};
