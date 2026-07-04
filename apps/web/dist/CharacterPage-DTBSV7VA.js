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
  Feedback
} from "./chunk-WG45DOPD.js";
import {
  EquipmentSlots,
  NpcPortrait
} from "./chunk-C2CTPQOC.js";
import {
  RARITY_COLOR,
  RARITY_LABEL
} from "./chunk-3JY4BVUW.js";
import {
  BossCard,
  useBossState
} from "./chunk-RU5FUJGJ.js";
import "./chunk-LCT2CGOO.js";
import "./chunk-SLCML2Z6.js";
import {
  GuideBubble,
  usePing
} from "./chunk-JPLGP4HS.js";
import {
  AppNav,
  FIRST_STEPS_TOTAL,
  ONBOARDING_FLAG_EVENT,
  advanceEldrinStep,
  countFirstStepsDone,
  getEldrinStep,
  isFlagSet,
  setFlag
} from "./chunk-Q2LVEGGV.js";
import {
  FRAME_TIER_LABEL,
  FramedAvatar
} from "./chunk-XSYP33XW.js";
import "./chunk-MEHX3SVK.js";
import {
  Link
} from "./chunk-ATYDFFRC.js";
import {
  XpBar
} from "./chunk-JO2JM4LA.js";
import "./chunk-W3P4YRUG.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/pages/CharacterPage.tsx
var import_react10 = __toESM(require_react(), 1);

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
    unlockedFrames.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Nenhuma moldura desbloqueada ainda." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "identity-unlock-list", children: unlockedFrames.map((frame) => {
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

// apps/web/src/hooks/useKingdomRole.ts
var import_react2 = __toESM(require_react(), 1);
function useKingdomRole(channel, enabled) {
  const [roles, setRoles] = (0, import_react2.useState)([]);
  (0, import_react2.useEffect)(() => {
    if (!enabled || !channel) {
      setRoles([]);
      return;
    }
    let cancelled = false;
    void api.get(`/api/kingdom/${encodeURIComponent(channel)}/me`).then((data) => {
      if (!cancelled) setRoles(data.roles);
    }).catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [channel, enabled]);
  return roles;
}

// apps/web/src/components/onboarding/WelcomeCard.tsx
var import_react3 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function WelcomeCard({ channelDisplayName }) {
  const [dismissed, setDismissed] = (0, import_react3.useState)(() => isFlagSet("welcome_seen"));
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
var import_react4 = __toESM(require_react(), 1);
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function FirstSteps({ totalMinutesWatched }) {
  const [, forceRefresh] = (0, import_react4.useState)(0);
  (0, import_react4.useEffect)(() => {
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
  (0, import_react4.useEffect)(() => {
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

// apps/web/src/components/onboarding/EldrinGuide.tsx
var import_react5 = __toESM(require_react(), 1);
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var ELDRIN = {
  key: "eldrin",
  name: "Eldrin",
  profession: "Guia do Reino",
  quote: "",
  description: "",
  icon: "\u{1F9D9}",
  color: "#4285f4",
  shape: "circle"
};
var LINES = [
  { after: "welcome_seen", text: "Comece conhecendo nossa Cidade." },
  { after: "city_seen", text: "Veja como seu personagem evolui." },
  { after: "tutorial_completed", text: "Nos encontramos novamente." }
];
function EldrinGuide() {
  const [step, setStep] = (0, import_react5.useState)(getEldrinStep);
  const [, forceRefresh] = (0, import_react5.useState)(0);
  (0, import_react5.useEffect)(() => {
    const onFlagChange = () => forceRefresh((n) => n + 1);
    window.addEventListener(ONBOARDING_FLAG_EVENT, onFlagChange);
    return () => window.removeEventListener(ONBOARDING_FLAG_EVENT, onFlagChange);
  }, []);
  if (step >= LINES.length) return null;
  const line = LINES[step];
  if (!isFlagSet(line.after)) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eldrin-guide", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(NpcPortrait, { npc: ELDRIN }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "eldrin-guide-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: ELDRIN.name }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { children: [
        '"',
        line.text,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        type: "button",
        className: "eldrin-guide-dismiss",
        onClick: () => {
          advanceEldrinStep();
          setStep((s) => s + 1);
        },
        children: "Entendi"
      }
    )
  ] });
}

// apps/web/src/components/onboarding/FirstItemCard.tsx
var import_react6 = __toESM(require_react(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
function FirstItemCard() {
  const [firstItem, setFirstItem] = (0, import_react6.useState)(null);
  const [dismissed, setDismissed] = (0, import_react6.useState)(() => isFlagSet("first_item_announced"));
  (0, import_react6.useEffect)(() => {
    if (isFlagSet("first_item_announced")) return;
    void api.get("/api/items").then((data) => {
      if (data.items.length === 0) return;
      const earliest = [...data.items].sort((a, b) => a.id - b.id)[0];
      setFirstItem(earliest);
    }).catch(() => void 0);
  }, []);
  if (dismissed || !firstItem) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "card first-item-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "landing-example-tag", children: "Seu primeiro equipamento" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { color: RARITY_COLOR[firstItem.rarity], fontSize: "1.2rem" }, children: firstItem.name }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "hint", children: RARITY_LABEL[firstItem.rarity] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "item-desc", children: firstItem.description }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
  ] });
}

// apps/web/src/components/onboarding/FirstLevelBanner.tsx
var import_react7 = __toESM(require_react(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
function FirstLevelBanner({ level }) {
  const [dismissed, setDismissed] = (0, import_react7.useState)(() => isFlagSet("first_level_announced"));
  if (dismissed || level < 2) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "first-level-banner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "first-level-banner-icon", children: "\u{1F389}" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { children: "Primeiro Level Up!" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { children: [
        "Seu aventureiro alcan\xE7ou o n\xEDvel ",
        level,
        "."
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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

// apps/web/src/components/onboarding/FirstBossBanner.tsx
var import_react8 = __toESM(require_react(), 1);
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
function FirstBossBanner({ channel }) {
  const { state } = useBossState(channel);
  const [dismissed, setDismissed] = (0, import_react8.useState)(() => isFlagSet("first_boss_seen"));
  if (dismissed || !state?.active) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "first-boss-banner", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: "\u2694 O Reino precisa de voc\xEA." }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
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

// apps/web/src/components/onboarding/NewTitleModal.tsx
var import_react9 = __toESM(require_react(), 1);
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
function NewTitleModal({ identity, onEquipTitle }) {
  const [dismissed, setDismissed] = (0, import_react9.useState)(() => isFlagSet("first_title_announced"));
  const unlocked = identity?.titles.filter((t) => t.unlocked) ?? [];
  if (dismissed || unlocked.length === 0) return null;
  const mostRecent = [...unlocked].sort((a, b) => (b.unlocked_at ?? "").localeCompare(a.unlocked_at ?? ""))[0];
  function dismiss() {
    setFlag("first_title_announced");
    setDismissed(true);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "modal-overlay", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "card new-title-modal", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("h2", { children: "\u{1F451} Novo T\xEDtulo" }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { className: "new-title-modal-name", children: mostRecent.name }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("p", { className: "hint", children: mostRecent.description }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "new-title-modal-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "new-title-modal-later", onClick: dismiss, children: "Mais tarde" })
    ] })
  ] }) });
}

// apps/web/src/pages/CharacterPage.tsx
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function totalPower(combat) {
  return combat.attack_physical + combat.attack_magic + combat.resistance_physical + combat.resistance_magic + combat.sus + combat.uti;
}
function CharacterPage() {
  const { profile, logout } = useAuth();
  const { character, loading, refresh } = useCharacter(!!profile);
  const { identity, equipTitle, unequipTitle, equipFrame, unequipFrame } = useIdentity(!!profile);
  const [channelInput, setChannelInput] = (0, import_react10.useState)("");
  const { lastPing, cooldownMs, ping, canPing, error, channel, setChannel } = usePing(
    !!profile,
    channelInput || void 0
  );
  const kingdomRoles = useKingdomRole(channel || void 0, !!profile);
  const handleEquipTitle = (0, import_react10.useCallback)((titleId) => void equipTitle(titleId), [equipTitle]);
  const handleUnequipTitle = (0, import_react10.useCallback)(() => void unequipTitle(), [unequipTitle]);
  const handleEquipFrame = (0, import_react10.useCallback)((frameId) => void equipFrame(frameId), [equipFrame]);
  const handleUnequipFrame = (0, import_react10.useCallback)(() => void unequipFrame(), [unequipFrame]);
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
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "card", children: loading || !character ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "loading-state", children: "Carregando personagem..." }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(GuideBubble, { flag: "profile_seen", message: "Aqui voc\xEA acompanha seu aventureiro." }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(JourneyProgress, { totalMinutesWatched: character.total_minutes }),
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
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "character-badges", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "badge-class", title: "Classes chegam em uma Sprint futura", children: "Aventureiro" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "badge-level", children: [
              "N\xEDvel ",
              character.level
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstLevelBanner, { level: character.level }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(XpBar, { percent: character.percent, label: `${character.xp} XP no n\xEDvel \xB7 faltam ${character.xp_to_next} para o pr\xF3ximo n\xEDvel` }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        StatsRow,
        {
          items: [
            { label: "Gold", value: character.gold.toFixed(1) },
            { label: "Minutos assistidos", value: character.total_minutes },
            { label: "Poder Total", value: totalPower(character.combat), highlight: true }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstBossBanner, { channel: channel || void 0 }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(BossCard, { channel: channel || void 0 }),
      channel && kingdomRoles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "character-kingdom-roles", children: [
        "Cargo",
        kingdomRoles.length > 1 ? "s" : "",
        " no Reino de ",
        channel,
        ":",
        " ",
        kingdomRoles.map((role) => `${role.icon} ${role.name}`).join(" \xB7 ")
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(ExpeditionPanel, { enabled: !!profile }),
      identity ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        IdentityPanel,
        {
          identity,
          onEquipTitle: handleEquipTitle,
          onUnequipTitle: handleUnequipTitle,
          onEquipFrame: handleEquipFrame,
          onUnequipFrame: handleUnequipFrame
        }
      ) : null,
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstItemCard, {}),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("section", { className: "equipment-section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("h2", { children: "Equipamento" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EquipmentSlots, { equipped: character.equipped })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FirstSteps, { totalMinutesWatched: character.total_minutes }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EldrinGuide, {}),
      identity ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(NewTitleModal, { identity, onEquipTitle: handleEquipTitle }) : null,
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
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "ping-box", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("label", { htmlFor: "channel", children: "Canal da live (login Twitch)" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "input",
          {
            id: "channel",
            value: channelInput || channel,
            onChange: (e) => setChannelInput(e.target.value),
            onBlur: () => {
              if (channelInput.trim()) setChannel(channelInput.trim());
            },
            placeholder: "ex: nomedostreamer"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          "button",
          {
            onClick: () => {
              if (channelInput.trim()) setChannel(channelInput.trim());
              void ping().then(() => refresh());
            },
            disabled: !canPing,
            children: canPing ? "Ping (+10 XP)" : `Aguarde ${Math.ceil(cooldownMs / 1e3)}s`
          }
        ),
        error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Feedback, { kind: "error", children: error }) : null,
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
      ] })
    ] }) })
  ] });
}
export {
  CharacterPage
};
