import {
  ExpeditionCompact
} from "./chunk-6RPGY3OT.js";
import {
  Timeline
} from "./chunk-IYTETKIK.js";
import {
  FramedAvatar
} from "./chunk-RVLANCZF.js";
import {
  XpBar
} from "./chunk-JO2JM4LA.js";
import {
  CityMap,
  NpcIntro,
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
  GLOBAL_HIGHLIGHT_PRIORITY,
  feedbackClassName,
  getLiveHighlights
} from "./chunk-3SXGP2NO.js";
import "./chunk-W3P4YRUG.js";
import "./chunk-SMRWZSNT.js";
import {
  NPCS,
  REGIONS
} from "./chunk-RHKKRLPV.js";
import "./chunk-3U2FLU6U.js";
import "./chunk-LIYTWNFS.js";
import "./chunk-WSY5ZGYB.js";
import "./chunk-QNP5WKGO.js";
import {
  getLoginUrl
} from "./chunk-R22SVZL5.js";
import {
  KINGDOM_ROLE_CATALOG
} from "./chunk-S4O55MUY.js";
import "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/LoginPage.tsx
var import_react2 = __toESM(require_react(), 1);

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
function WorldPreview({ highlighted = false }) {
  const highlightCls = feedbackClassName("softGlow");
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "world-highlights", children: WORLD_HIGHLIGHTS.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
      "div",
      {
        className: `world-highlight${highlighted && index === 0 ? ` ${highlightCls}` : ""}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "world-highlight-icon", children: item.icon }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: item.label })
        ]
      },
      item.label
    )) }),
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
function CityPreview({ highlighted = false }) {
  const highlightCls = feedbackClassName("softGlow");
  const microEventLine = getMicroEvent("praca");
  const worldCohesionLine = getWorldCohesionLine("praca");
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: highlighted ? highlightCls : void 0, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CityMap, { onSelect: () => void 0 }),
    microEventLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: microEventLine }) : null,
    worldCohesionLine ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: worldCohesionLine }) : null,
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
  encounter: { category: "descoberta", icon: "\u{1F381}", text: "Encontrou um ba\xFA escondido entre as ra\xEDzes." },
  // Sprint Expedition Consequences Phase I — dado fabricado (mesma
  // convenção de todo o resto deste mock), mostra a linha ambiente
  // nova na própria vitrine ilustrativa.
  approach: "investigate"
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

// apps/web/src/components/landing/WorldSimulationPreview.tsx
var import_react = __toESM(require_react(), 1);

// apps/web/src/lib/worldSimulationState.ts
var STATUS_TO_ANIMATION = {
  preparing: "idle",
  exploring: "walking",
  combating: "combat",
  resting: "idle",
  returning: "returning",
  completed: "idle"
};
var ANIMATION_TO_DIRECTION = {
  walking: "right",
  returning: "left",
  combat: "none",
  idle: "none"
};
var FIXED_Y = 0;
var SIMULATION_SPEED = 20;
function buildWorldSimulationState(expedition) {
  const animationState = STATUS_TO_ANIMATION[expedition.status];
  return {
    x: expedition.progress_percent,
    y: FIXED_Y,
    targetX: expedition.progress_percent,
    speed: SIMULATION_SPEED,
    direction: ANIMATION_TO_DIRECTION[animationState],
    animationState,
    status: expedition.status,
    region: expedition.current_region_name
  };
}

// apps/web/src/components/ui/PlayerSprite.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function PlayerSprite({ entity }) {
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "div",
    {
      className: `entity-marker entity-player entity-player-${entity.variant} player-sprite`,
      style: { left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 },
      children: "\u{1F9CD}"
    }
  );
}

// apps/web/src/components/ui/EnemySprite.tsx
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function EnemySprite({ entity }) {
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
    "div",
    {
      className: `entity-marker enemy-sprite enemy-sprite-${entity.variant}`,
      style: { left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }
    }
  );
}

// apps/web/src/components/ui/LootSprite.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function LootSprite({ entity }) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
    "div",
    {
      className: `entity-marker loot-sprite loot-sprite-${entity.variant}`,
      style: { left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }
    }
  );
}

// apps/web/src/components/ui/NpcSprite.tsx
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function NpcSprite({ entity }) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    "div",
    {
      className: `entity-marker npc-sprite npc-sprite-${entity.variant}`,
      style: { left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 }
    }
  );
}

// apps/web/src/components/ui/EntityMarker.tsx
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
function EntityMarker({ entity, children }) {
  if (entity.kind === "player") {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(PlayerSprite, { entity });
  }
  if (entity.kind === "enemy") {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(EnemySprite, { entity });
  }
  if (entity.kind === "loot") {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(LootSprite, { entity });
  }
  if (entity.kind === "npc") {
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(NpcSprite, { entity });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    "div",
    {
      className: `entity-marker entity-${entity.kind} entity-${entity.kind}-${entity.variant}`,
      style: { left: `${entity.position.x}%`, top: `${entity.position.y}%`, opacity: entity.visible ? 1 : 0 },
      children
    }
  );
}

// apps/web/src/components/landing/WorldSimulationPreview.tsx
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var MOCK_STEPS = [
  { progress: 20, region: "Bosque Sussurrante", status: "exploring", encounterCategory: null, lootType: null, lootLeft: null },
  { progress: 35, region: "Deserto de Vidro", status: "exploring", encounterCategory: null, lootType: null, lootLeft: null },
  { progress: 58, region: "P\xE2ntano Podre", status: "combating", encounterCategory: "misterio", lootType: null, lootLeft: null },
  { progress: 81, region: "Picos Congelados", status: "returning", encounterCategory: null, lootType: "rare", lootLeft: 68 },
  { progress: 100, region: "Porto do Amanhecer", status: "preparing", encounterCategory: null, lootType: null, lootLeft: null }
];
var MOCK_STEP_INTERVAL_MS = 2500;
function getRegionClass(regionName) {
  if (regionName.includes("Bosque")) return "region-bosque";
  if (regionName.includes("Deserto")) return "region-deserto";
  if (regionName.includes("P\xE2ntano")) return "region-pantano";
  if (regionName.includes("Picos Congelados")) return "region-neve";
  return "region-default";
}
var TILE_COUNT = 24;
var TRACK_TILES = Array.from({ length: TILE_COUNT });
var REGION_TRANSITION_RATIO = 0.7;
var REGION_TRANSITION_CLASS = "region-transition";
function getTileRegion(index, currentRegion) {
  const transitionStartIndex = Math.floor(TILE_COUNT * REGION_TRANSITION_RATIO);
  return index < transitionStartIndex ? currentRegion : REGION_TRANSITION_CLASS;
}
var REGION_TO_DECORATION = {
  "region-bosque": "decoration-tree",
  "region-deserto": "decoration-rock",
  "region-pantano": "decoration-swamp",
  "region-neve": "decoration-ice",
  "region-default": "decoration-default"
};
var DECORATION_POSITIONS = [
  { left: 5, top: 20 },
  { left: 14, top: 75 },
  { left: 24, top: 25 },
  { left: 35, top: 70 },
  { left: 47, top: 20 },
  { left: 60, top: 78 },
  { left: 72, top: 22 },
  { left: 85, top: 72 }
];
function getEnemyClass(category) {
  switch (category) {
    case "descoberta":
      return "enemy-discovery";
    case "natureza":
      return "enemy-nature";
    case "misterio":
      return "enemy-mystery";
    case "clima":
      return "enemy-climate";
    case "comercio":
      return "enemy-commerce";
    default:
      return "enemy-default";
  }
}
var ENEMY_OFFSET = 10;
var ENEMY_MAX_LEFT = 96;
function getEnemyLeft(playerTargetX) {
  return Math.min(playerTargetX + ENEMY_OFFSET, ENEMY_MAX_LEFT);
}
var PLAYER_STOP_GAP = 4;
function getPlayerLeft(status, targetX, enemyLeft) {
  if (status !== "combating") return targetX;
  return Math.min(targetX, enemyLeft - PLAYER_STOP_GAP);
}
var PLAYER_VERTICAL_CENTER = 50;
var ENEMY_VERTICAL_CENTER = 50;
var LOOT_VERTICAL_CENTER = 50;
function getLootClass(lootType) {
  switch (lootType) {
    case "common":
      return "loot-common";
    case "rare":
      return "loot-rare";
    case "gold":
      return "loot-gold";
    case "discovery":
      return "loot-discovery";
    default:
      return "loot-common";
  }
}
var NPC_CONFIGS = [
  { id: "npc-1", baseX: 12, variant: "villager" },
  { id: "npc-2", baseX: 34, variant: "merchant" },
  { id: "npc-3", baseX: 63, variant: "guard" },
  { id: "npc-4", baseX: 88, variant: "traveller" }
];
var NPC_STEP_DRIFT = 1.5;
var NPC_DRIFT_RANGE = 8;
var NPC_VERTICAL_CENTER = 50;
function getNpcLeft(baseX, stepIndex) {
  return baseX + stepIndex * NPC_STEP_DRIFT % NPC_DRIFT_RANGE;
}
var BACKGROUND_ELEMENTS = [
  { left: 3, top: 15, className: "bg-mountain" },
  { left: 18, top: 10, className: "bg-tree" },
  { left: 40, top: 12, className: "bg-mountain" },
  { left: 55, top: 15, className: "bg-bush" },
  { left: 76, top: 10, className: "bg-tree" },
  { left: 93, top: 18, className: "bg-stone" }
];
var FOREGROUND_ELEMENTS = [
  { left: 20, top: 62, className: "fg-branch" },
  { left: 50, top: 58, className: "fg-leaves" },
  { left: 82, top: 62, className: "fg-stone" }
];
var BIRD_POSITIONS = [
  { left: 15, top: 8 },
  { left: 45, top: 5 },
  { left: 75, top: 9 }
];
var LEAF_POSITIONS = [
  { left: 25, top: 10 },
  { left: 60, top: 15 }
];
var DUST_POSITIONS = [
  { left: 30, top: 40 },
  { left: 70, top: 55 }
];
var SPARKLE_POSITIONS = [
  { left: 20, top: 20 },
  { left: 50, top: 35 },
  { left: 80, top: 25 }
];
var INSECT_POSITIONS = [
  { left: 35, top: 45 },
  { left: 65, top: 50 }
];
var PARALLAX_BACKGROUND_RATIO = 0.2;
var PARALLAX_DECORATION_RATIO = 0.4;
var PARALLAX_NPC_RATIO = 0.6;
var PARALLAX_FOREGROUND_RATIO = 1.2;
function getParallaxOffset(targetX, ratio) {
  return targetX * ratio;
}
var LANDMARK_CONFIGS = [
  { position: 15, top: 30, kind: "sign" },
  { position: 38, top: 25, kind: "ruins" },
  { position: 50, top: 70, kind: "campfire" },
  { position: 63, top: 28, kind: "bridge" },
  { position: 88, top: 22, kind: "portal" }
];
function WorldSimulationPreview() {
  const [stepIndex, setStepIndex] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % MOCK_STEPS.length);
    }, MOCK_STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);
  const currentStep = MOCK_STEPS[stepIndex];
  const state = buildWorldSimulationState({
    status: currentStep.status,
    progress_percent: currentStep.progress,
    current_region_name: currentStep.region
  });
  const regionClass = getRegionClass(state.region);
  const decorationClass = REGION_TO_DECORATION[regionClass];
  const showEnemy = state.status === "combating";
  const enemyClass = getEnemyClass(currentStep.encounterCategory);
  const enemyLeft = getEnemyLeft(state.targetX);
  const playerLeft = getPlayerLeft(state.status, state.targetX, enemyLeft);
  const showLoot = state.status === "returning";
  const lootClass = getLootClass(currentStep.lootType);
  const lootLeft = currentStep.lootLeft ?? enemyLeft;
  const lootVariant = lootClass.replace("loot-", "");
  const lootEntity = {
    id: "loot",
    kind: "loot",
    variant: lootVariant,
    position: { x: lootLeft, y: LOOT_VERTICAL_CENTER },
    visible: showLoot
  };
  const playerEntity = {
    id: "player",
    kind: "player",
    variant: state.animationState,
    position: { x: playerLeft, y: PLAYER_VERTICAL_CENTER },
    visible: true
  };
  const enemyVariant = enemyClass.replace("enemy-", "");
  const enemyEntity = {
    id: "enemy",
    kind: "enemy",
    variant: enemyVariant,
    position: { x: enemyLeft, y: ENEMY_VERTICAL_CENTER },
    visible: showEnemy
  };
  const npcEntities = NPC_CONFIGS.map((npc) => ({
    id: npc.id,
    kind: "npc",
    variant: npc.variant,
    position: { x: getNpcLeft(npc.baseX, stepIndex), y: NPC_VERTICAL_CENTER },
    visible: true
  }));
  const backgroundParallax = getParallaxOffset(state.targetX, PARALLAX_BACKGROUND_RATIO);
  const decorationParallax = getParallaxOffset(state.targetX, PARALLAX_DECORATION_RATIO);
  const npcParallax = getParallaxOffset(state.targetX, PARALLAX_NPC_RATIO);
  const foregroundParallax = getParallaxOffset(state.targetX, PARALLAX_FOREGROUND_RATIO);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "world-simulation", children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "landing-example-tag", children: "Exemplo ilustrativo" }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: `simulation-track ${regionClass}`, children: [
      TRACK_TILES.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: `simulation-tile ${getTileRegion(i, regionClass)}` }, i)),
      BACKGROUND_ELEMENTS.map((el, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "div",
        {
          className: `simulation-background parallax-background ${el.className}`,
          style: { left: `${el.left}%`, top: `${el.top}%`, transform: `translateX(${backgroundParallax}px)` }
        },
        i
      )),
      BIRD_POSITIONS.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "simulation-bird", style: { left: `${pos.left}%`, top: `${pos.top}%` } }, i)),
      DECORATION_POSITIONS.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "div",
        {
          className: `simulation-decoration parallax-decoration ${decorationClass}`,
          style: { left: `${pos.left}%`, top: `${pos.top}%`, transform: `translateX(${decorationParallax}px)` }
        },
        i
      )),
      LANDMARK_CONFIGS.map((landmark, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "div",
        {
          className: `landmark landmark-${landmark.kind}`,
          style: { left: `${landmark.position}%`, top: `${landmark.top}%`, transform: `translateX(${decorationParallax}px)` }
        },
        i
      )),
      regionClass === "region-bosque" ? LEAF_POSITIONS.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "simulation-leaf", style: { left: `${pos.left}%`, top: `${pos.top}%` } }, i)) : null,
      regionClass === "region-deserto" ? DUST_POSITIONS.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "simulation-dust", style: { left: `${pos.left}%`, top: `${pos.top}%` } }, i)) : null,
      regionClass === "region-neve" ? SPARKLE_POSITIONS.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "simulation-sparkle", style: { left: `${pos.left}%`, top: `${pos.top}%` } }, i)) : null,
      regionClass === "region-pantano" ? INSECT_POSITIONS.map((pos, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "simulation-insect", style: { left: `${pos.left}%`, top: `${pos.top}%` } }, i)) : null,
      npcEntities.map((npc) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "parallax-npc", style: { transform: `translateX(${npcParallax}px)` }, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(EntityMarker, { entity: npc }) }, npc.id)),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(EntityMarker, { entity: enemyEntity }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(EntityMarker, { entity: lootEntity }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(EntityMarker, { entity: playerEntity, children: "\u25CF" }),
      FOREGROUND_ELEMENTS.map((el, i) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "div",
        {
          className: `simulation-foreground parallax-foreground ${el.className}`,
          style: { left: `${el.left}%`, top: `${el.top}%`, transform: `translateX(${foregroundParallax}px)` }
        },
        i
      ))
    ] })
  ] });
}

// apps/web/src/components/landing/FinalCTA.tsx
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
function FinalCTA({ onLogin, loading }) {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("section", { className: "final-cta", children: [
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h2", { className: "final-cta-title", children: "Seu personagem nunca para." }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "final-cta-subtitle", children: "Mesmo quando voc\xEA apenas assiste." }),
    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { type: "button", className: "hero-cta final-cta-button", onClick: onLogin, disabled: loading, children: loading ? "Redirecionando..." : "Entrar com Twitch" })
  ] });
}

// apps/web/src/pages/LoginPage.tsx
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
var FEATURES = [
  { icon: "\u2694", title: "Evolua", description: "Ganhe experi\xEAncia automaticamente enquanto assiste." },
  { icon: "\u{1F30E}", title: "Explore", description: "Viaje por um mundo vivo, regi\xE3o por regi\xE3o." },
  { icon: "\u{1F451}", title: "Reino", description: "Ajude sua comunidade a crescer e conquistar cargos." },
  { icon: "\u{1F409}", title: "Bosses", description: "Enfrente chefes gigantes ao lado de outros espectadores." },
  { icon: "\u{1F392}", title: "Equipamentos", description: "Descubra itens raros em suas aventuras." },
  { icon: "\u{1F3C6}", title: "Prest\xEDgio", description: "Construa sua hist\xF3ria \u2014 e a do seu Reino." }
];
function LoginPage() {
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  const landingHighlights = getLiveHighlights(GLOBAL_HIGHLIGHT_PRIORITY, {
    expedition: true,
    npc: true,
    region: true
  });
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
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("main", { className: "landing-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(LandingBackground, {}),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(HeroSection, { onLogin: () => void handleLogin(), loading, error }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("section", { className: "landing-section", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "feature-grid", children: FEATURES.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(FeatureCard, { icon: feature.icon, title: feature.title, description: feature.description }, feature.title)) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "landing-section-title", children: "Como funciona" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(HowItWorks, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "landing-section-title", children: "Um mundo para explorar" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(WorldPreview, { highlighted: landingHighlights.includes("region") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "landing-section-title", children: "Cada Reino tem sua pr\xF3pria hist\xF3ria" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(KingdomPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "landing-section-title", children: "A Capital espera por voc\xEA" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(CityPreview, { highlighted: landingHighlights.includes("npc") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "landing-section-title", children: "Seu personagem, sua jornada" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(CharacterPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("section", { className: "landing-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h2", { className: "landing-section-title", children: "Pr\xE9via do mundo" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(WorldSimulationPreview, {})
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(FinalCTA, { onLogin: () => void handleLogin(), loading })
  ] });
}
export {
  LoginPage
};
