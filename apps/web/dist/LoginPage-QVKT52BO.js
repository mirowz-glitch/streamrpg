import {
  Timeline
} from "./chunk-AOYN62YF.js";
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
  ExpeditionCompact
} from "./chunk-BRYJLL2G.js";
import "./chunk-DMGYBMOJ.js";
import {
  FramedAvatar
} from "./chunk-6OZRZBGD.js";
import {
  KINGDOM_ROLE_CATALOG
} from "./chunk-H5WBUEHD.js";
import {
  XpBar
} from "./chunk-2Y76MGBL.js";
import "./chunk-GTLHMQAD.js";
import {
  getLoginUrl
} from "./chunk-I6SULFQR.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-HBQ7EKFV.js";

// apps/web/src/pages/LoginPage.tsx
var import_react = __toESM(require_react(), 1);

// apps/web/src/components/landing/LandingBackground.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function LandingBackground() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "landing-background", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      className: "landing-background-svg",
      viewBox: "0 0 1600 900",
      preserveAspectRatio: "xMidYMax slice",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: "landing-sky", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", stopColor: "#100a1f" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "55%", stopColor: "#1a1030" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", stopColor: "#0e0e1a" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "0", y: "0", width: "1600", height: "900", fill: "url(#landing-sky)" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { opacity: "0.12", fill: "#cfc4ff", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: "220", cy: "140", rx: "120", ry: "26" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: "340", cy: "120", rx: "80", ry: "20" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: "1180", cy: "90", rx: "140", ry: "28" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: "1320", cy: "115", rx: "90", ry: "20" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: "760", cy: "70", rx: "100", ry: "18" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "polygon",
          {
            points: "0,620 140,520 300,600 460,470 640,580 820,500 1000,600 1180,480 1360,590 1600,510 1600,900 0,900",
            fill: "#241a40",
            opacity: "0.55"
          }
        )
      ]
    }
  ) });
}

// apps/web/src/components/landing/HeroIllustration.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var TREES = [
  { x: 40, h: 46 },
  { x: 90, h: 60 },
  { x: 150, h: 40 },
  { x: 205, h: 66 },
  { x: 265, h: 48 },
  { x: 320, h: 58 },
  { x: 700, h: 44 },
  { x: 755, h: 60 },
  { x: 815, h: 40 },
  { x: 1370, h: 50 },
  { x: 1425, h: 62 },
  { x: 1480, h: 42 },
  { x: 1530, h: 56 }
];
var ADVENTURERS = [
  { x: 470, scale: 1 },
  { x: 500, scale: 0.85 },
  { x: 535, scale: 1.1 }
];
function Tree({ x, h }) {
  const baseY = 470;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: `${x},${baseY - h} ${x - h * 0.55},${baseY} ${x + h * 0.55},${baseY}`, fill: "#0f2417" });
}
function Adventurer({ x, scale }) {
  const baseY = 468;
  const s = scale;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${x} ${baseY}) scale(${s})`, fill: "#120c1e", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "0", cy: "-16", r: "4.5" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "-4,-11 4,-11 6,4 -6,4" })
  ] });
}
function HeroIllustration() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "svg",
    {
      className: "hero-illustration-svg",
      viewBox: "0 0 1600 500",
      preserveAspectRatio: "xMidYMax meet",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": "Um castelo diante de montanhas, com um Boss gigante ao fundo e aventureiros pelo caminho.",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("defs", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: "hero-sky", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#1c1236" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#100a1f" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("radialGradient", { id: "hero-boss-glow", cx: "50%", cy: "40%", r: "60%", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#ff3b3b", stopOpacity: "0.35" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#ff3b3b", stopOpacity: "0" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id: "hero-castle", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "0%", stopColor: "#2a2340" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "100%", stopColor: "#181228" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "0", y: "0", width: "1600", height: "500", fill: "url(#hero-sky)" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "1420", cy: "80", r: "46", fill: "#e8e2ff", opacity: "0.18" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "760", cy: "250", r: "230", fill: "url(#hero-boss-glow)" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { fill: "#140a1f", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("ellipse", { cx: "760", cy: "330", rx: "200", ry: "130" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "760", cy: "205", r: "66" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "700,150 715,110 730,155" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "790,155 805,110 820,150" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "740", cy: "200", r: "5.5", fill: "#ff3b3b" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "782", cy: "200", r: "5.5", fill: "#ff3b3b" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "polygon",
          {
            points: "0,320 120,250 260,300 400,220 540,270 620,245 700,268 800,200 940,268 1080,230 1220,290 1360,240 1600,300 1600,500 0,500",
            fill: "#241a40"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "polygon",
          {
            points: "0,500 0,390 160,310 340,380 520,290 700,370 880,300 1060,380 1240,310 1420,390 1600,320 1600,500",
            fill: "#191228"
          }
        ),
        TREES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Tree, { x: t.x, h: t.h }, t.x)),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "380,500 620,500 900,420 860,410 420,470", fill: "#241d33", opacity: "0.6" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "1080", y: "330", width: "220", height: "140", fill: "url(#hero-castle)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "1080", y: "300", width: "26", height: "40", fill: "url(#hero-castle)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "1274", y: "300", width: "26", height: "40", fill: "url(#hero-castle)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "1170", y: "260", width: "60", height: "80", fill: "url(#hero-castle)" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "1080,260 1106,260 1093,238", fill: "#3a2f56" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "1274,260 1300,260 1287,238", fill: "#3a2f56" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "1170,220 1230,220 1200,190", fill: "#3a2f56" }),
          [1090, 1112, 1134, 1156, 1246, 1268, 1290].map((cx) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: cx, y: "322", width: "12", height: "12", fill: "url(#hero-castle)" }, cx)),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "1200", y1: "190", x2: "1200", y2: "160", stroke: "#3a2f56", strokeWidth: "3" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "1200,160 1230,170 1200,180", fill: "#9146ff" })
        ] }),
        ADVENTURERS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Adventurer, { x: a.x, scale: a.scale }, a.x))
      ]
    }
  );
}

// apps/web/src/components/landing/HeroSection.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function HeroSection({ onLogin, loading, error }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "hero-section", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "hero-content", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("h1", { className: "hero-title", children: [
        "Stream",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hero-title-accent", children: "RPG" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "hero-tagline", children: "Seu personagem vive enquanto voc\xEA acompanha seus criadores favoritos." }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "hero-cta", onClick: onLogin, disabled: loading, children: loading ? "Redirecionando..." : "Entrar com Twitch" }),
      error ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "error", children: error }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "hero-illustration", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(HeroIllustration, {}) })
  ] });
}

// apps/web/src/components/landing/FeatureCard.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
function FeatureCard({ icon, title, description }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "feature-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "feature-card-icon", children: icon }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { className: "feature-card-title", children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "feature-card-description", children: description })
  ] });
}

// apps/web/src/components/landing/HowItWorks.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var STEPS = [
  { icon: "\u{1F7E3}", text: "Entrar com Twitch" },
  { icon: "\u{1F4FA}", text: "Escolha uma live" },
  { icon: "\u2728", text: "Seu personagem nasce" },
  { icon: "\u{1F5FA}\uFE0F", text: "Explora o mundo" },
  { icon: "\u{1F409}", text: "Enfrenta Bosses" },
  { icon: "\u{1F3C6}", text: "Constr\xF3i seu legado" }
];
function HowItWorks() {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ol", { className: "how-it-works", children: STEPS.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { className: "how-it-works-step", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "how-it-works-number", children: index + 1 }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "how-it-works-icon", children: step.icon }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "how-it-works-text", children: step.text })
  ] }, step.text)) });
}

// apps/web/src/components/landing/WorldPreview.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var WORLD_HIGHLIGHTS = [
  { icon: "\u{1F5FA}\uFE0F", label: `${REGIONS.length} Regi\xF5es` },
  { icon: "\u{1F409}", label: "Bosses" },
  { icon: "\u{1F392}", label: "Expedi\xE7\xF5es" },
  { icon: "\u{1F9D1}\u200D\u{1F33E}", label: "NPCs" },
  { icon: "\u{1F451}", label: "Reino" },
  { icon: "\u{1F3F0}", label: "Cidade" }
];
function WorldPreview() {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "world-highlights", children: WORLD_HIGHLIGHTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "world-highlight", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "world-highlight-icon", children: item.icon }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: item.label })
    ] }, item.label)) }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RegionGallery, {})
  ] });
}

// apps/web/src/components/landing/KingdomPreview.tsx
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var MOCK_HOLDERS = {
  guardiao: { display_name: "Hudson", held_since: (/* @__PURE__ */ new Date()).toISOString() },
  "campeao-bosses": { display_name: "Ashley", held_since: (/* @__PURE__ */ new Date()).toISOString() },
  "grande-explorador": { display_name: "Kaio", held_since: (/* @__PURE__ */ new Date()).toISOString() },
  "heroi-reino": { display_name: "Luma", held_since: (/* @__PURE__ */ new Date()).toISOString() },
  "membro-antigo": { display_name: "Dexx", held_since: (/* @__PURE__ */ new Date()).toISOString() },
  "maior-sequencia": { display_name: "Vic", held_since: (/* @__PURE__ */ new Date()).toISOString() }
};
var MOCK_HALL_OF_FAME = KINGDOM_ROLE_CATALOG.map((role) => {
  const holder = MOCK_HOLDERS[role.slug];
  return {
    role: role.slug,
    role_name: role.name,
    icon: role.icon,
    holder: holder ? { character_id: role.slug, display_name: holder.display_name, avatar_url: null, held_since: holder.held_since } : null
  };
});
var MOCK_TIMELINE = [
  { id: "mock-1", text: "\u{1F451} Hudson tornou-se Guardi\xE3o do Reino.", timestamp: Date.now() - 6e4 },
  { id: "mock-2", text: "O Boss foi derrotado!", timestamp: Date.now() - 24e4 },
  { id: "mock-3", text: "Ashley concluiu uma expedi\xE7\xE3o em Minas Abandonadas.", timestamp: Date.now() - 48e4 }
];
function KingdomPreview() {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "kingdom-preview", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "landing-example-tag", children: "Exemplo ilustrativo" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "kingdom-preview-prestige", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "Prest\xEDgio do Reino" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { children: "1.240" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(HallOfFame, { slots: MOCK_HALL_OF_FAME }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { className: "identity-subtitle", children: "Linha do tempo" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Timeline, { events: MOCK_TIMELINE, idleFlavor: "O Reino est\xE1 tranquilo." })
  ] });
}

// apps/web/src/components/landing/CityPreview.tsx
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function CityPreview() {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CityMap, { onSelect: () => void 0 }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(NpcIntro, { npc: NPCS.ferreiro })
  ] });
}

// apps/web/src/components/landing/CharacterPreview.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var MOCK_EQUIPPED = [
  { slot: "weapon", character_item_id: 1, name: "Espada da Aurora", rarity: "rare", damage_type: "physical", uti_bonus: 0 },
  { slot: "armor", character_item_id: 2, name: "Cota de Escamas", rarity: "uncommon", damage_type: "physical", uti_bonus: 2 },
  { slot: "amulet", character_item_id: 3, name: "Amuleto da Mar\xE9", rarity: "epic", damage_type: "magic", uti_bonus: 4 }
];
var MOCK_EXPEDITION = {
  region_name: "Bosque Sussurrante",
  status: "exploring",
  progress_percent: 62,
  encounter: { category: "descoberta", icon: "\u{1F381}", text: "Encontrou um ba\xFA escondido entre as ra\xEDzes." }
};
function CharacterPreview() {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "character-preview", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "landing-example-tag", children: "Exemplo ilustrativo" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "character-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(FramedAvatar, { avatarUrl: null, frameTier: "prata", baseClassName: "character-avatar" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h3", { style: { margin: 0 }, children: "Kaio" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "character-title", children: "\u{1F451} Explorador" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "badge-level", children: "N\xEDvel 14" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(XpBar, { percent: 68, label: "680 XP no n\xEDvel \xB7 faltam 320 para o pr\xF3ximo n\xEDvel" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ExpeditionCompact, { expedition: MOCK_EXPEDITION }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h4", { className: "identity-subtitle", children: "Equipamento" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(EquipmentSlots, { equipped: MOCK_EQUIPPED })
  ] });
}

// apps/web/src/components/landing/FinalCTA.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function FinalCTA({ onLogin, loading }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "final-cta", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { className: "final-cta-title", children: "Seu personagem nunca para." }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "final-cta-subtitle", children: "Mesmo quando voc\xEA apenas assiste." }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { type: "button", className: "hero-cta final-cta-button", onClick: onLogin, disabled: loading, children: loading ? "Redirecionando..." : "Entrar com Twitch" })
  ] });
}

// apps/web/src/pages/LoginPage.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var FEATURES = [
  { icon: "\u2694", title: "Evolua", description: "Ganhe experi\xEAncia automaticamente enquanto assiste." },
  { icon: "\u{1F30E}", title: "Explore", description: "Viaje por um mundo vivo, regi\xE3o por regi\xE3o." },
  { icon: "\u{1F451}", title: "Reino", description: "Ajude sua comunidade a crescer e conquistar cargos." },
  { icon: "\u{1F409}", title: "Bosses", description: "Enfrente chefes gigantes ao lado de outros espectadores." },
  { icon: "\u{1F392}", title: "Equipamentos", description: "Descubra itens raros em suas aventuras." },
  { icon: "\u{1F3C6}", title: "Prest\xEDgio", description: "Construa sua hist\xF3ria \u2014 e a do seu Reino." }
];
function LoginPage() {
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await getLoginUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("main", { className: "landing-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(LandingBackground, {}),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(HeroSection, { onLogin: () => void handleLogin(), loading, error }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("section", { className: "landing-section", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "feature-grid", children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(FeatureCard, { icon: feature.icon, title: feature.title, description: feature.description }, feature.title)) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "landing-section-title", children: "Como funciona" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(HowItWorks, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "landing-section-title", children: "Um mundo para explorar" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(WorldPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "landing-section-title", children: "Cada Reino tem sua pr\xF3pria hist\xF3ria" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(KingdomPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "landing-section-title", children: "A Capital espera por voc\xEA" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CityPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "landing-section-title", children: "Seu personagem, sua jornada" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CharacterPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(FinalCTA, { onLogin: () => void handleLogin(), loading })
  ] });
}
export {
  LoginPage
};
//# sourceMappingURL=LoginPage-QVKT52BO.js.map
