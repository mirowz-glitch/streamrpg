import {
  BossCard,
  useBossState
} from "./chunk-Z55K7IZN.js";
import {
  Feedback,
  SLOT_LABEL
} from "./chunk-DOXJ7TGJ.js";
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
  DEFAULT_POLL_MS
} from "./chunk-LCT2CGOO.js";
import {
  useAuth
} from "./chunk-NCYLE5LN.js";
import {
  AppNav
} from "./chunk-SPEKNS3Y.js";
import {
  Link
} from "./chunk-ATYDFFRC.js";
import {
  FramedAvatar
} from "./chunk-RVLANCZF.js";
import {
  XpBar
} from "./chunk-JO2JM4LA.js";
import {
  EquipmentSlots
} from "./chunk-INHR2XNO.js";
import {
  CHARACTER_TRAIT_PRIORITY,
  buildWorldVisualContext,
  feedbackClassName,
  getSingleHighlight,
  getWorldVisualClass,
  resolveFeedback
} from "./chunk-3SXGP2NO.js";
import "./chunk-W3P4YRUG.js";
import {
  RARITY_COLOR,
  RARITY_LABEL,
  buildCollectionInsightContext,
  getRegionsInsight,
  hasEncounteredLethalCreature
} from "./chunk-SMRWZSNT.js";
import {
  REGIONS,
  buildExpeditionEchoContext,
  getRecentEvents
} from "./chunk-RHKKRLPV.js";
import {
  STAGE_CHARACTER_DESCRIPTION,
  buildPlayerFacts,
  getCharacterStage,
  useCharacter,
  useKingdomRole
} from "./chunk-3U2FLU6U.js";
import {
  FOUNDER_TITLE_SLUGS,
  FRAME_TIER_LABEL
} from "./chunk-LIYTWNFS.js";
import {
  useIdentity
} from "./chunk-WSY5ZGYB.js";
import {
  usePing
} from "./chunk-QNP5WKGO.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import "./chunk-S4O55MUY.js";
import {
  FIRST_STEPS_TOTAL,
  countFirstStepsDone,
  hasRemembered,
  isFlagSet,
  setFlag
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/CharacterPage.tsx
var import_react9 = __toESM(require_react(), 1);

// apps/web/src/components/ui/IdentityPanel.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function formatDate(iso) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
var IdentityPanel = (0, import_react.memo)(function IdentityPanel2({
  identity,
  onEquipTitle,
  onUnequipTitle,
  onEquipFrame,
  onUnequipFrame
}) {
  const unlockedTitles = identity.titles.filter((t) => t.unlocked);
  const unlockedFrames = identity.frames.filter((f) => f.unlocked);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "identity-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Identidade" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      StatsRow,
      {
        items: [
          {
            label: "T\xEDtulo",
            value: identity.equipped_title ? identity.equipped_title.name : "Nenhum",
            highlight: true
          },
          {
            label: "Moldura",
            value: identity.equipped_frame ? FRAME_TIER_LABEL[identity.equipped_frame.tier] : "Nenhuma"
          },
          { label: "Personagem criado em", value: formatDate(identity.created_at) },
          { label: "Primeira expedi\xE7\xE3o", value: formatDate(identity.first_expedition_at) },
          { label: "Bosses derrotados", value: identity.bosses_defeated },
          { label: "Regi\xF5es descobertas", value: identity.regions_discovered }
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "identity-subtitle", children: [
      "T\xEDtulos desbloqueados (",
      unlockedTitles.length,
      "/",
      identity.titles.length,
      ")"
    ] }),
    unlockedTitles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Nenhum t\xEDtulo desbloqueado ainda \u2014 continue jogando para conquistar o primeiro." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "identity-unlock-list", children: unlockedTitles.map((title) => {
      const equipped = identity.equipped_title?.id === title.id;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: equipped ? "identity-unlock-equipped" : "", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: title.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "item-desc", children: title.description })
        ] }),
        equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => onUnequipTitle(), children: "Remover" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => onEquipTitle(title.id), children: "Equipar" })
      ] }, title.id);
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: "identity-subtitle", children: [
      "Molduras desbloqueadas (",
      unlockedFrames.length,
      "/",
      identity.frames.length,
      ")"
    ] }),
    unlockedFrames.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Nenhuma moldura desbloqueada ainda \u2014 continue jogando para conquistar a primeira." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "identity-unlock-list", children: unlockedFrames.map((frame) => {
      const equipped = identity.equipped_frame?.id === frame.id;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: equipped ? "identity-unlock-equipped" : "", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: frame.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "item-desc", children: [
            "Tier: ",
            FRAME_TIER_LABEL[frame.tier]
          ] })
        ] }),
        equipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => onUnequipFrame(), children: "Remover" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => onEquipFrame(frame.id), children: "Equipar" })
      ] }, frame.id);
    }) })
  ] });
});

// apps/web/src/components/onboarding/WelcomeCard.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function WelcomeCard({ channelDisplayName }) {
  const [dismissed, setDismissed] = (0, import_react2.useState)(() => isFlagSet("welcome_seen"));
  if (dismissed) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "card welcome-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("h2", { className: "welcome-card-title", children: [
      "\u{1F3F0} Bem-vindo ao Reino",
      channelDisplayName ? ` de ${channelDisplayName}` : ""
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { children: "Voc\xEA acaba de iniciar sua jornada." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "hint", children: "Enquanto acompanha esta comunidade, seu aventureiro ir\xE1:" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("ul", { className: "welcome-card-list", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: "\u2694 Evoluir" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: "\u{1F392} Encontrar equipamentos" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: "\u{1F30E} Explorar o mundo" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("li", { children: "\u{1F451} Conquistar t\xEDtulos" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "welcome-card-wish", children: "Boa sorte." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        type: "button",
        onClick: () => {
          setFlag("welcome_seen");
          setDismissed(true);
        },
        children: "Come\xE7ar aventura"
      }
    )
  ] });
}

// apps/web/src/components/onboarding/FirstSteps.tsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function FirstSteps({ totalMinutesWatched }) {
  const [, forceRefresh] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => {
    if (!isFlagSet("profile_seen")) {
      setFlag("profile_seen");
      forceRefresh((n) => n + 1);
    }
  }, []);
  const steps = [
    { label: "Entrar no Perfil", done: isFlagSet("profile_seen") },
    { label: "Conhecer a Cidade", done: isFlagSet("city_seen") },
    { label: "Ver o Ranking", done: isFlagSet("ranking_seen") },
    { label: "Explorar o Mundo", done: isFlagSet("world_seen") },
    { label: "Assistir alguns minutos da live", done: totalMinutesWatched > 0 }
  ];
  const doneCount = steps.filter((s) => s.done).length;
  (0, import_react3.useEffect)(() => {
    if (doneCount === steps.length && !isFlagSet("tutorial_completed")) {
      setFlag("tutorial_completed");
    }
  }, [doneCount]);
  if (isFlagSet("tutorial_completed")) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "first-steps", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: "Primeiros Passos" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { className: "first-steps-list", children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { className: step.done ? "first-steps-done" : "", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "first-steps-check", children: step.done ? "\u2611" : "\u2610" }),
      step.label
    ] }, step.label)) })
  ] });
}

// apps/web/src/components/onboarding/JourneyProgress.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var STAGES = ["Iniciante", "Aventureiro", "Explorador", "Veterano"];
function stageIndex(done) {
  if (done >= FIRST_STEPS_TOTAL) return 3;
  if (done >= 4) return 2;
  if (done >= 2) return 1;
  return 0;
}
function JourneyProgress({ totalMinutesWatched }) {
  const done = countFirstStepsDone(totalMinutesWatched);
  const current = stageIndex(done);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "journey-progress", children: STAGES.map((stage, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: `journey-stage${index <= current ? " journey-stage-active" : ""}`, children: [
    stage,
    index < STAGES.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "journey-stage-arrow", children: "\u2192" }) : null
  ] }, stage)) });
}

// apps/web/src/components/onboarding/FirstItemCard.tsx
var import_react4 = __toESM(require_react(), 1);
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var DROP_TOAST_WATERMARK_KEY = "streamrpg_drop_toast_watermark";
var TOAST_DURATION_MS = 4e3;
function FirstItemCard() {
  const [firstItem, setFirstItem] = (0, import_react4.useState)(null);
  const [dismissed, setDismissed] = (0, import_react4.useState)(() => isFlagSet("first_item_announced"));
  (0, import_react4.useEffect)(() => {
    if (isFlagSet("first_item_announced")) return;
    void api.get("/api/items").then((data) => {
      if (data.items.length === 0) return;
      const earliest = [...data.items].sort((a, b) => a.id - b.id)[0];
      setFirstItem(earliest);
    }).catch(() => void 0);
  }, []);
  const [queue, setQueue] = (0, import_react4.useState)([]);
  const [current, setCurrent] = (0, import_react4.useState)(null);
  (0, import_react4.useEffect)(() => {
    if (!dismissed) return;
    let cancelled = false;
    function load() {
      void api.get("/api/items").then((data) => {
        if (cancelled || data.items.length === 0) return;
        const maxId = Math.max(...data.items.map((i) => i.id));
        const stored = localStorage.getItem(DROP_TOAST_WATERMARK_KEY);
        if (stored === null) {
          localStorage.setItem(DROP_TOAST_WATERMARK_KEY, String(maxId));
          return;
        }
        const watermark = Number(stored);
        if (maxId <= watermark) return;
        const newItems = data.items.filter((i) => i.id > watermark).sort((a, b) => a.id - b.id);
        if (newItems.length === 0) return;
        localStorage.setItem(DROP_TOAST_WATERMARK_KEY, String(maxId));
        setQueue((prev) => [...prev, ...newItems]);
      }).catch(() => void 0);
    }
    load();
    const id = window.setInterval(load, DEFAULT_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [dismissed]);
  (0, import_react4.useEffect)(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
  }, [current, queue]);
  (0, import_react4.useEffect)(() => {
    if (!current) return;
    const timer = window.setTimeout(() => setCurrent(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [current]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
    !dismissed && firstItem ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "card first-item-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "landing-example-tag", children: "Seu primeiro equipamento" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { color: RARITY_COLOR[firstItem.rarity], fontSize: "1.2rem" }, children: firstItem.name }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "hint", children: RARITY_LABEL[firstItem.rarity] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "item-desc", children: firstItem.description }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "hint", children: '\u{1F9D9} Eldrin: "Nada mal. Agora pelo menos voc\xEA consegue machucar um p\xE3o."' }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "hint", children: '\u{1F6E0}\uFE0F Borin: "J\xE1 vi gente lutar pior equipada. Tamb\xE9m j\xE1 vi gente morrer melhor equipada."' }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            setFlag("first_item_announced");
            setDismissed(true);
          },
          children: "Guardar no invent\xE1rio"
        }
      )
    ] }) : null,
    current ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "card first-item-card", style: { borderColor: RARITY_COLOR[current.rarity] }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "landing-example-tag", children: "Novo item!" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { color: RARITY_COLOR[current.rarity], fontSize: "1.2rem" }, children: current.name }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "hint", children: [
        RARITY_LABEL[current.rarity],
        " \xB7 ",
        SLOT_LABEL[current.slot]
      ] })
    ] }) : null
  ] });
}

// apps/web/src/components/onboarding/FirstLevelBanner.tsx
var import_react5 = __toESM(require_react(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var LAST_SEEN_LEVEL_KEY = "streamrpg_last_seen_level";
function FirstLevelBanner({ level }) {
  const [dismissed, setDismissed] = (0, import_react5.useState)(() => isFlagSet("first_level_announced"));
  const previousLevelRef = (0, import_react5.useRef)(null);
  const [celebrateLevel, setCelebrateLevel] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    if (previousLevelRef.current === null) {
      const stored = localStorage.getItem(LAST_SEEN_LEVEL_KEY);
      previousLevelRef.current = stored === null ? level : Number(stored);
    }
    if (level > previousLevelRef.current) {
      setCelebrateLevel(level);
    }
    previousLevelRef.current = level;
    localStorage.setItem(LAST_SEEN_LEVEL_KEY, String(level));
  }, [level]);
  if (level < 2) return null;
  if (!dismissed) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "first-level-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "first-level-banner-icon", children: "\u{1F389}" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { children: "Primeiro Level Up!" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { children: [
          "Seu aventureiro alcan\xE7ou o n\xEDvel ",
          level,
          "."
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            setFlag("first_level_announced");
            setDismissed(true);
          },
          children: "\u2715"
        }
      )
    ] });
  }
  if (celebrateLevel !== null) {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "first-level-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "first-level-banner-icon", children: "\u{1F389}" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("strong", { children: [
          "N\xEDvel ",
          celebrateLevel,
          "!"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { children: "Seu aventureiro ficou mais forte." })
      ] })
    ] });
  }
  return null;
}

// apps/web/src/components/onboarding/FirstBossBanner.tsx
var import_react6 = __toESM(require_react(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var REAPPEAR_DURATION_MS = 5e3;
function FirstBossBanner({ channel }) {
  const { state } = useBossState(channel);
  const [dismissed, setDismissed] = (0, import_react6.useState)(() => isFlagSet("first_boss_seen"));
  const wasActiveRef = (0, import_react6.useRef)(false);
  const hasBaselineRef = (0, import_react6.useRef)(false);
  const [justAppeared, setJustAppeared] = (0, import_react6.useState)(false);
  (0, import_react6.useEffect)(() => {
    if (!state) return;
    const isNowAwaiting = state.active && state.status === "awaiting";
    if (hasBaselineRef.current && !wasActiveRef.current && isNowAwaiting) {
      setJustAppeared(true);
    }
    wasActiveRef.current = state.active;
    hasBaselineRef.current = true;
  }, [state]);
  (0, import_react6.useEffect)(() => {
    if (!justAppeared) return;
    const timer = window.setTimeout(() => setJustAppeared(false), REAPPEAR_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [justAppeared]);
  if (!state?.active) return null;
  if (!dismissed) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "first-boss-banner", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "\u2694 O Reino observa seus pr\xF3ximos passos." }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            setFlag("first_boss_seen");
            setDismissed(true);
          },
          children: "\u2715"
        }
      )
    ] });
  }
  if (justAppeared) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "first-boss-banner", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: "\u2694 Um Boss apareceu no Reino!" }) });
  }
  return null;
}

// apps/web/src/components/onboarding/NewTitleModal.tsx
var import_react7 = __toESM(require_react(), 1);
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function NewTitleModal({ identity, onEquipTitle }) {
  const [dismissed, setDismissed] = (0, import_react7.useState)(() => isFlagSet("first_title_announced"));
  const unlocked = identity?.titles.filter((t) => t.unlocked) ?? [];
  if (dismissed || unlocked.length === 0) return null;
  const mostRecent = [...unlocked].sort((a, b) => (b.unlocked_at ?? "").localeCompare(a.unlocked_at ?? ""))[0];
  function dismiss() {
    setFlag("first_title_announced");
    setDismissed(true);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "modal-overlay", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "card new-title-modal", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h2", { children: "\u{1F451} Novo T\xEDtulo" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("strong", { className: "new-title-modal-name", children: mostRecent.name }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hint", children: mostRecent.description }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "new-title-modal-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            onEquipTitle(mostRecent.id);
            dismiss();
          },
          children: "Equipar agora"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "new-title-modal-later", onClick: dismiss, children: "Mais tarde" })
    ] })
  ] }) });
}

// apps/web/src/components/ui/PlayerGoals.tsx
var import_react8 = __toESM(require_react(), 1);

// apps/web/src/lib/playerGoals.ts
var TOTAL_EQUIPMENT_SLOTS = 6;
var EXPERIENCED_LEVEL_THRESHOLD = 15;
var EXPERIENCED_BOSS_THRESHOLD = 3;
function buildPlayerGoalsContext(character, identity, hasActiveWorldEvent, kingdomRoles = []) {
  const booksRead = getRecentEvents(20).filter((e) => e.kind === "book_read").length;
  return {
    hasWeaponEquipped: character.equipped.some((item) => item.slot === "weapon"),
    equippedSlotCount: character.equipped.length,
    hasVisitedBestiary: hasRemembered("first_bestiary_entry"),
    bossesDefeated: identity.bosses_defeated,
    booksRead,
    regionsDiscovered: identity.regions_discovered,
    totalRegions: REGIONS.length,
    hasFounderTitle: identity.titles.some((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug)),
    isExperienced: character.level >= EXPERIENCED_LEVEL_THRESHOLD || identity.bosses_defeated >= EXPERIENCED_BOSS_THRESHOLD,
    hasActiveWorldEvent,
    stage: getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles))
  };
}
var GOAL_RULES = [
  {
    when: (ctx) => !ctx.hasWeaponEquipped,
    text: "Sua arma ainda est\xE1 vazia. Equipar uma pode ser um bom pr\xF3ximo passo."
  },
  {
    when: (ctx) => ctx.hasWeaponEquipped && ctx.equippedSlotCount <= 2,
    text: "Voc\xEA pode ficar mais forte equipando o que j\xE1 carrega."
  },
  {
    when: (ctx) => !ctx.hasVisitedBestiary,
    text: "Conhe\xE7a as criaturas do Reino \u2014 o Besti\xE1rio guarda mais do que parece."
  },
  {
    when: (ctx) => ctx.bossesDefeated === 0,
    text: "O Reino ainda n\xE3o ouviu falar do seu nome."
  },
  {
    when: (ctx) => ctx.booksRead < 2,
    text: "A Biblioteca guarda conhecimentos que podem ajudar."
  },
  {
    when: (ctx) => ctx.regionsDiscovered <= 2,
    text: "Ainda existem muitas terras desconhecidas."
  },
  // Jogadores experientes — mesmos temas (regiões, título), fraseados
  // pra quem já avançou, nunca repetindo as sugestões de iniciante.
  {
    when: (ctx) => ctx.isExperienced && ctx.regionsDiscovered >= 5 && ctx.regionsDiscovered < ctx.totalRegions,
    text: "Poucas terras ainda escapam de voc\xEA. Vale terminar o mapa."
  },
  {
    when: (ctx) => ctx.isExperienced && !ctx.hasFounderTitle,
    text: "Poucos chegam t\xE3o longe. Talvez seja hora de mirar num t\xEDtulo que ainda n\xE3o \xE9 seu."
  },
  // Sprint Character Evolution Presence Phase I — objetivos mais
  // ambiciosos pra estágios avançados, mesmos temas (regiões, título,
  // reputação) mas fraseados pra quem o Reino já reconhece.
  {
    when: (ctx) => ctx.stage === "lenda",
    text: "Seu nome j\xE1 \xE9 lenda no Reino. O que ainda resta pra algu\xE9m no seu n\xEDvel provar?"
  },
  {
    when: (ctx) => ctx.stage === "heroi",
    text: "Poucos chegam t\xE3o longe quanto voc\xEA. Talvez seja hora de mirar em algo que s\xF3 her\xF3is tentam."
  },
  {
    when: (ctx) => ctx.equippedSlotCount < TOTAL_EQUIPMENT_SLOTS,
    text: "Ainda h\xE1 espa\xE7o no seu equipamento para mais alguma coisa."
  },
  {
    when: (ctx) => ctx.hasActiveWorldEvent,
    text: "Talvez hoje seja um bom dia para visitar o Reino."
  },
  // Sprint Character Page — Adventure Goals Phase I — catch-all: sempre
  // a ÚLTIMA regra avaliada (nenhuma das anteriores foi alterada), só
  // garante que `getPlayerGoals` nunca devolve lista vazia (a tela
  // sempre mostra exatamente UM objetivo, nunca "nenhum"). Mesmo
  // mecanismo de sempre, nenhuma lógica nova além de "quando nada mais
  // bateu, isto bate".
  {
    when: () => true,
    text: "Continue jogando \u2014 o Reino sempre tem algo novo para quem presta aten\xE7\xE3o."
  }
];
function getPlayerGoals(ctx, limit = 2) {
  const matched = [];
  for (const rule of GOAL_RULES) {
    if (matched.length >= limit) break;
    if (rule.when(ctx)) matched.push(rule.text);
  }
  return matched;
}

// apps/web/src/components/ui/PlayerGoals.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function PlayerGoals({ character, identity, kingdomRoles }) {
  const [worldState, setWorldState] = (0, import_react8.useState)(null);
  (0, import_react8.useEffect)(() => {
    void api.get("/api/world/state").then(setWorldState).catch(() => void 0);
  }, []);
  if (!character || !identity) return null;
  const ctx = buildPlayerGoalsContext(character, identity, worldState !== null, kingdomRoles ?? []);
  const [goal] = getPlayerGoals(ctx, 1);
  const feedbackCls = feedbackClassName(resolveFeedback(true, "attention"));
  if (!goal) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: `player-goals${feedbackCls ? ` ${feedbackCls}` : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "goal-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "goal-card-title", children: "\u{1F9ED} Objetivo Atual" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "goal-card-text", children: goal }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "goal-progress-placeholder" })
  ] }) });
}

// apps/web/src/lib/legacy.ts
function buildLegacyContext(facts) {
  const insightCtx = buildCollectionInsightContext({ regionsDiscovered: facts.regionsDiscovered });
  return {
    facts,
    booksRead: insightCtx.booksRead,
    museumEntriesViewed: insightCtx.museumEntriesViewed,
    totalRegions: REGIONS.length
  };
}
var LEGACY_RULES = [
  // Fama — Character Presence já cobre o estágio "lenda" sozinho; aqui
  // exige também um Título de Fundador (dado real e raro de Identity).
  // A combinação mais rara de todas (score quase máximo + flag rara).
  {
    when: (ctx) => getCharacterStage(ctx.facts) === "lenda" && ctx.facts.hasFounderTitle,
    line: "Seu nome j\xE1 \xE9 conhecido em algumas estradas."
  },
  // Autoridade + combate — Living Consequences só verifica hasKingdomRole
  // sozinho (Roth); aqui exige também um histórico de combate real.
  {
    when: (ctx) => ctx.facts.hasKingdomRole && ctx.facts.bossesDefeated >= 6,
    line: "Guardas parecem lembrar de suas passagens."
  },
  // Exploração — Collection Insights já cobre "boa parte do Reino" em
  // 8/11; aqui exige as 11 regiões, um patamar estritamente mais raro.
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= ctx.totalRegions,
    line: "Poucos aventureiros exploraram tantas terras."
  },
  // Multi-domínio — exemplo exato do brief: presença reconhecida em 3
  // lugares independentes ao mesmo tempo (combate, museu, biblioteca).
  // Nenhuma camada existente combina 3 domínios assim.
  {
    when: (ctx) => ctx.facts.bossesDefeated >= 2 && ctx.museumEntriesViewed >= 3 && ctx.booksRead >= 3,
    line: "Arena, Museu e Biblioteca j\xE1 conhecem seu rosto."
  },
  // Conhecimento — Collection Insights já cobre booksRead >= 6 sozinho;
  // aqui exige também um título equipado (Identity), combinação nova.
  {
    when: (ctx) => ctx.booksRead >= 6 && ctx.facts.hasEquippedTitle,
    line: "Alguns estudiosos j\xE1 reconhecem seu interesse pelo conhecimento."
  },
  // Equipamento — equipmentTier "strong" já é só um dos 6 sinais do
  // estágio de Character Presence, nunca verbalizado sozinho em nenhum
  // lugar; aqui combinado com nível alto, uma afirmação nova.
  {
    when: (ctx) => ctx.facts.equipmentTier === "strong" && ctx.facts.level >= 20,
    line: "Mercadores comentam sobre seu equipamento."
  }
];
function getLegacyLine(facts) {
  const ctx = buildLegacyContext(facts);
  const rule = LEGACY_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}

// apps/web/src/lib/kingdomReputation.ts
function buildKingdomReputationContext(facts) {
  const insightCtx = buildCollectionInsightContext();
  return {
    facts,
    creaturesViewed: insightCtx.creaturesViewed,
    booksRead: insightCtx.booksRead,
    hasEncounteredLethal: hasEncounteredLethalCreature()
  };
}
var REPUTATION_RULES = [
  {
    when: (ctx) => ctx.facts.hasFounderTitle,
    line: "Circula a not\xEDcia de que um dos primeiros aventureiros deste Reino ainda anda por a\xED."
  },
  {
    when: (ctx) => ctx.hasEncounteredLethal,
    line: "Dizem que algu\xE9m enfrentou uma criatura que poucos conseguem descrever direito."
  },
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= 9,
    line: "Alguns viajantes juram que existe um aventureiro que conhece quase todo o Reino."
  },
  {
    when: (ctx) => ctx.facts.bossesDefeated >= 4,
    line: "Boatos comentam sobre um aventureiro que j\xE1 enfrentou v\xE1rios Bosses e ainda segue de p\xE9."
  },
  {
    when: (ctx) => ctx.facts.hasKingdomRole,
    line: "Na Guilda come\xE7aram a falar bastante sobre seu nome."
  },
  {
    when: (ctx) => ctx.facts.totalMinutes >= 180 && ctx.facts.regionsDiscovered >= 5,
    line: "Os comerciantes comentam que voc\xEA j\xE1 passou por muitos lugares."
  },
  {
    when: (ctx) => ctx.creaturesViewed >= 5 && ctx.booksRead >= 4,
    line: "Moradores comentam que um aventureiro anda estudando o Reino com mais aten\xE7\xE3o que o normal."
  }
];
function getKingdomReputationLine(facts) {
  const ctx = buildKingdomReputationContext(facts);
  const rule = REPUTATION_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}

// apps/web/src/lib/personalChronicle.ts
function buildPersonalChronicleContext(facts) {
  const insightCtx = buildCollectionInsightContext();
  return {
    facts,
    booksRead: insightCtx.booksRead,
    creaturesViewed: insightCtx.creaturesViewed,
    museumEntriesViewed: insightCtx.museumEntriesViewed
  };
}
var CHRONICLE_RULES = [
  // Fundador — sinal isolado (Kingdom Reputation também usa
  // hasFounderTitle isolado, mas em tom de boato coletivo; aqui é uma
  // retrospectiva pessoal sobre QUANDO a jornada começou).
  {
    when: (ctx) => ctx.facts.hasFounderTitle,
    line: "Sua jornada come\xE7ou nos primeiros dias deste Reino."
  },
  // Jornada plural — presença real em 3 domínios ao mesmo tempo, com
  // limiares deliberadamente mais baixos que o multi-domínio de Legacy
  // (bosses≥2+museu≥3+livros≥3) — aqui não envolve Bosses, é sobre
  // conhecimento/cultura, não combate.
  {
    when: (ctx) => ctx.booksRead >= 2 && ctx.creaturesViewed >= 2 && ctx.museumEntriesViewed >= 1,
    line: "Sua jornada at\xE9 aqui re\xFAne um pouco de cada canto do Reino."
  },
  // Jornada longa — totalMinutes isolado, limiar mais alto que o
  // combo de Kingdom Reputation (totalMinutes≥180+regiões≥5).
  {
    when: (ctx) => ctx.facts.totalMinutes >= 300,
    line: "Sua jornada j\xE1 se estende por bastante tempo."
  },
  // Jornada de explorador — regiões descobertas é o traço DOMINANTE da
  // jornada (maior que livros/criaturas/museu), não só um número
  // isolado. Exemplo quase literal do brief.
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= 4 && ctx.facts.regionsDiscovered >= ctx.booksRead && ctx.facts.regionsDiscovered >= ctx.creaturesViewed && ctx.facts.regionsDiscovered >= ctx.museumEntriesViewed,
    line: "Boa parte da sua jornada foi constru\xEDda explorando o Reino."
  },
  // Jornada de coragem — combate real enfrentado mesmo com
  // equipamento ainda modesto (nunca "strong", o tier que Legacy usa).
  {
    when: (ctx) => ctx.facts.equipmentTier === "notable" && ctx.facts.bossesDefeated >= 1,
    line: "Voc\xEA j\xE1 enfrentou perigos reais mesmo sem o melhor equipamento."
  },
  // Jornada de estudo — conhecimento construído mais pelos livros do
  // que pela própria observação de campo (proporção, não sequência).
  {
    when: (ctx) => ctx.booksRead >= 3 && ctx.creaturesViewed < 2,
    line: "Grande parte do que voc\xEA sabe sobre o Reino veio dos livros, n\xE3o das pr\xF3prias descobertas."
  }
];
function getPersonalChronicleLine(facts) {
  const ctx = buildPersonalChronicleContext(facts);
  const rule = CHRONICLE_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}

// apps/web/src/pages/CharacterPage.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function totalPower(combat) {
  return combat.attack_physical + combat.attack_magic + combat.resistance_physical + combat.resistance_magic + combat.sus + combat.uti;
}
function CharacterPage() {
  const [activeTab, setActiveTab] = (0, import_react9.useState)("geral");
  const { profile, logout } = useAuth();
  const { character, loading, refresh } = useCharacter(!!profile);
  const { identity, equipTitle, unequipTitle, equipFrame, unequipFrame } = useIdentity(!!profile);
  const [channelInput, setChannelInput] = (0, import_react9.useState)("");
  const { lastPing, cooldownMs, ping, canPing, error, channel, setChannel } = usePing(
    !!profile,
    channelInput || void 0
  );
  const kingdomRoles = useKingdomRole(channel || void 0, !!profile);
  const { expedition } = useExpedition(!!profile);
  const regionsInsight = identity ? getRegionsInsight(buildCollectionInsightContext({ regionsDiscovered: identity.regions_discovered })) : null;
  const legacyLine = character && identity ? getLegacyLine(buildPlayerFacts(character, identity, kingdomRoles)) : null;
  const characterVisualClass = character && identity ? getWorldVisualClass(
    "character",
    buildWorldVisualContext({
      hasFounderTitle: buildPlayerFacts(character, identity, kingdomRoles).hasFounderTitle,
      hasActiveLegacy: legacyLine !== null
    })
  ) : null;
  const kingdomReputationLine = character && identity ? getKingdomReputationLine(buildPlayerFacts(character, identity, kingdomRoles)) : null;
  const personalChronicleLine = character && identity ? getPersonalChronicleLine(buildPlayerFacts(character, identity, kingdomRoles)) : null;
  const characterTraitHighlight = getSingleHighlight(CHARACTER_TRAIT_PRIORITY, {
    legacy: legacyLine !== null,
    kingdomReputation: kingdomReputationLine !== null,
    personalChronicle: personalChronicleLine !== null
  });
  const legacyFeedbackCls = feedbackClassName(resolveFeedback(characterTraitHighlight === "legacy", "subtleBorder"));
  const kingdomReputationFeedbackCls = feedbackClassName(
    resolveFeedback(characterTraitHighlight === "kingdomReputation", "subtleBorder")
  );
  const personalChronicleFeedbackCls = feedbackClassName(
    resolveFeedback(characterTraitHighlight === "personalChronicle", "subtleBorder")
  );
  const expeditionSpecializationLine = character && identity ? getExpeditionSpecialization(buildExpeditionSpecializationContext(buildPlayerFacts(character, identity, kingdomRoles))) : null;
  const liveGuideLine = character && identity ? getRecommendedSurface(
    buildLiveGuideContext(
      buildPlayerFacts(character, identity, kingdomRoles),
      buildCollectionInsightContext(),
      buildExpeditionEchoContext(expedition)
    )
  ) : null;
  const handleEquipTitle = (0, import_react9.useCallback)((titleId) => void equipTitle(titleId), [equipTitle]);
  const handleUnequipTitle = (0, import_react9.useCallback)(() => void unequipTitle(), [unequipTitle]);
  const handleEquipFrame = (0, import_react9.useCallback)((frameId) => void equipFrame(frameId), [equipFrame]);
  const handleUnequipFrame = (0, import_react9.useCallback)(() => void unequipFrame(), [unequipFrame]);
  if (!profile && !loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("main", { className: "page", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { children: "Fa\xE7a login para ver seu personagem." }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Link, { to: "/login", children: "Ir para login" })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("main", { className: "page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(AppNav, {}),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { className: "logout-btn", onClick: () => void logout(), children: "Sair" }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(WelcomeCard, { channelDisplayName: channel || null }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: `card${characterVisualClass ? ` ${characterVisualClass}` : ""}`, children: loading || !character ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "loading-state", children: "Carregando personagem..." }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(GuideBubble, { flag: "profile_seen", message: "Aqui voc\xEA acompanha seu aventureiro." }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(JourneyProgress, { totalMinutesWatched: character.total_minutes }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "character-header-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "character-header", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            FramedAvatar,
            {
              avatarUrl: character.avatar_url,
              frameTier: identity?.equipped_frame?.tier ?? null,
              baseClassName: "character-avatar"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h1", { children: character.display_name }),
            identity?.equipped_title ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "character-title", children: [
              "\u{1F451} ",
              identity.equipped_title.name
            ] }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "character-badges", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "badge-compact", title: "Classes chegam em uma Sprint futura", children: [
              "Aventureiro \u2022 Lv.",
              character.level
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "character-header-equipment", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { children: "Equipamento" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EquipmentSlots, { equipped: character.equipped }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstItemCard, {})
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstLevelBanner, { level: character.level }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(XpBar, { percent: character.percent, label: `${character.xp} XP no n\xEDvel \xB7 faltam ${character.xp_to_next} para o pr\xF3ximo n\xEDvel` }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstBossBanner, { channel: channel || void 0 }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "character-tabs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "button",
          {
            type: "button",
            className: `character-tab-button${activeTab === "geral" ? " active" : ""}`,
            onClick: () => setActiveTab("geral"),
            children: "Vis\xE3o Geral"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "button",
          {
            type: "button",
            className: `character-tab-button${activeTab === "identidade" ? " active" : ""}`,
            onClick: () => setActiveTab("identidade"),
            children: "Identidade"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "button",
          {
            type: "button",
            className: `character-tab-button${activeTab === "expedicao" ? " active" : ""}`,
            onClick: () => setActiveTab("expedicao"),
            children: "Expedi\xE7\xE3o"
          }
        )
      ] }),
      activeTab === "geral" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
        identity ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "character-summary", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "character-summary-line", children: STAGE_CHARACTER_DESCRIPTION[getCharacterStage(buildPlayerFacts(character, identity, kingdomRoles))] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "character-summary-line", children: [
            "Voc\xEA j\xE1 explorou o Reino por ",
            character.total_minutes,
            " minutos."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "character-summary-line", children: [
            "Conhece ",
            identity.regions_discovered,
            " ",
            identity.regions_discovered === 1 ? "regi\xE3o" : "regi\xF5es",
            "."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "character-summary-line", children: identity.bosses_defeated > 0 ? `${identity.bosses_defeated} ${identity.bosses_defeated === 1 ? "Boss derrotado" : "Bosses derrotados"} at\xE9 agora.` : "O Reino ainda aguarda sua primeira grande vit\xF3ria." })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          StatsRow,
          {
            items: [
              { label: "Ouro", value: character.gold.toFixed(1), highlight: true },
              { label: "Minutos assistidos", value: character.total_minutes },
              { label: "Poder", value: totalPower(character.combat), highlight: true }
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(PlayerGoals, { character, identity, kingdomRoles }),
        liveGuideLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "guide-bubble", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "guide-bubble-icon", "aria-hidden": "true", children: "\u{1F5FA}\uFE0F" }),
          liveGuideLine
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "power-summary", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { children: "Atributos de combate" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "power-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "ATQ F\xEDsico" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { children: character.combat.attack_physical })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "ATQ M\xE1gico" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { children: character.combat.attack_magic })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "Resist\xEAncia F\xEDsica" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { children: character.combat.resistance_physical })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "Resist\xEAncia M\xE1gica" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { children: character.combat.resistance_magic })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "SUS" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { children: character.combat.sus })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: "UTI" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { children: character.combat.uti })
            ] })
          ] })
        ] }),
        expedition && channel ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "expedition-status-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h3", { className: "expedition-status-title", children: "\u26A1 Expedi\xE7\xE3o Ativa" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "expedition-status-line", children: [
            "Explorando a live de ",
            channel
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "expedition-status-live", children: "\u25CF Ao vivo" }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "expedition-status-caption", children: "Atualiza\xE7\xF5es autom\xE1ticas" })
        ] }) : null,
        lastPing?.leveled_up ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Feedback, { kind: "level-up", children: [
          "Level up! Agora voc\xEA \xE9 n\xEDvel ",
          lastPing.level,
          "."
        ] }) : null,
        lastPing?.drop?.dropped && lastPing.drop.item ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Feedback, { kind: "drop-alert", children: [
          "Drop: ",
          lastPing.drop.item.name,
          " (",
          lastPing.drop.item.rarity,
          ")"
        ] }) : null
      ] }) : null,
      activeTab === "identidade" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
        regionsInsight ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "hint", children: regionsInsight }) : null,
        legacyLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: `hint${legacyFeedbackCls ? ` ${legacyFeedbackCls}` : ""}`, children: legacyLine }) : null,
        kingdomReputationLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: `hint${kingdomReputationFeedbackCls ? ` ${kingdomReputationFeedbackCls}` : ""}`, children: kingdomReputationLine }) : null,
        personalChronicleLine ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: `hint${personalChronicleFeedbackCls ? ` ${personalChronicleFeedbackCls}` : ""}`, children: personalChronicleLine }) : null,
        channel && kingdomRoles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "character-kingdom-roles", children: [
          "Cargo",
          kingdomRoles.length > 1 ? "s" : "",
          " no Reino de ",
          channel,
          ":",
          " ",
          kingdomRoles.map((role) => `${role.icon} ${role.name}`).join(" \xB7 ")
        ] }) : null,
        identity ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          IdentityPanel,
          {
            identity,
            onEquipTitle: handleEquipTitle,
            onUnequipTitle: handleUnequipTitle,
            onEquipFrame: handleEquipFrame,
            onUnequipFrame: handleUnequipFrame
          }
        ) : null
      ] }) : null,
      activeTab === "expedicao" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(BossCard, { channel: channel || void 0, myCharacterId: character.id }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ExpeditionPanel, { enabled: !!profile, specializationLine: expeditionSpecializationLine })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstSteps, { totalMinutesWatched: character.total_minutes }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EldrinGuide, {}),
      identity ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(NewTitleModal, { identity, onEquipTitle: handleEquipTitle }) : null
    ] }) })
  ] });
}
export {
  CharacterPage
};
