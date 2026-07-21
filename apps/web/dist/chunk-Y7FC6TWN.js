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
  NpcPortrait
} from "./chunk-INHR2XNO.js";
import {
  EXPEDITION_HIGHLIGHT_PRIORITY,
  STATUS_ICON,
  STATUS_LABEL,
  buildExpeditionMomentContext,
  buildExpeditionReactiveContext,
  buildWorldVisualContext,
  feedbackClassName,
  formatRemaining,
  getExpeditionConsequenceLine,
  getExpeditionDecisionHint,
  getExpeditionEvolutionLine,
  getExpeditionJourneyLine,
  getExpeditionMoment,
  getExpeditionReactiveClass,
  getExpeditionReactiveState,
  getRegionIdentityLine,
  getSingleHighlight,
  getWorldVisualClass,
  pickExpeditionNarrative
} from "./chunk-3SXGP2NO.js";
import {
  ProgressBar
} from "./chunk-W3P4YRUG.js";
import {
  buildCollectionInsightContext
} from "./chunk-SMRWZSNT.js";
import {
  getRecentEvents,
  recordEvent
} from "./chunk-RHKKRLPV.js";
import {
  ONBOARDING_FLAG_EVENT,
  advanceEldrinStep,
  getEldrinStep,
  isFlagSet
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/ExpeditionPanel.tsx
var import_react = __toESM(require_react(), 1);

// apps/web/src/lib/expeditionChoice.ts
function isExpeditionChoiceAvailable(ctx) {
  return ctx.status === "exploring" && ctx.encounterCategory === "descoberta";
}
var OUTCOME_LINE = {
  investigate: "O grupo decide parar e investigar de perto.",
  continue: "O grupo decide n\xE3o se distrair e seguir em frente."
};
var OUTCOME_ICON = {
  investigate: "\u{1F50D}",
  continue: "\u{1F3C3}"
};
function getExpeditionChoiceOutcomeLine(option) {
  return OUTCOME_LINE[option];
}
function getExpeditionChoiceOutcomeIcon(option) {
  return OUTCOME_ICON[option];
}
var APPROACH_LABEL = {
  investigate: "Investigando",
  continue: "Rota R\xE1pida"
};
var APPROACH_ACCENT_CLASS = {
  investigate: "expedition-approach-investigate",
  continue: "expedition-approach-continue"
};
function getExpeditionApproachLabel(option) {
  return APPROACH_LABEL[option];
}
function getExpeditionApproachIcon(option) {
  return OUTCOME_ICON[option];
}
function getExpeditionApproachAccentClass(option) {
  return APPROACH_ACCENT_CLASS[option];
}

// apps/web/src/components/ui/ExpeditionPanel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var CLOSURE_DURATION_MS = 5e3;
var ExpeditionPanel = (0, import_react.memo)(function ExpeditionPanel2({ enabled, specializationLine }) {
  const { expedition, chooseApproach } = useExpedition(enabled);
  const lastExpeditionRef = (0, import_react.useRef)(null);
  const [justCompleted, setJustCompleted] = (0, import_react.useState)(null);
  const expeditionId = expedition?.id ?? "";
  const [lastExpeditionIdForChoice, setLastExpeditionIdForChoice] = (0, import_react.useState)(expeditionId);
  const [chosenOption, setChosenOption] = (0, import_react.useState)(null);
  if (lastExpeditionIdForChoice !== expeditionId) {
    setLastExpeditionIdForChoice(expeditionId);
    setChosenOption(null);
  }
  (0, import_react.useEffect)(() => {
    if (!expedition) return;
    const previous = lastExpeditionRef.current;
    if (previous && previous.id !== expedition.id) {
      setJustCompleted(previous);
    }
    lastExpeditionRef.current = expedition;
  }, [expedition]);
  (0, import_react.useEffect)(() => {
    if (!justCompleted) return;
    const timer = window.setTimeout(() => setJustCompleted(null), CLOSURE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [justCompleted]);
  if (!expedition) return null;
  const arrived = expedition.status === "combating" || expedition.status === "resting" || expedition.status === "returning";
  const isCombating = expedition.status === "combating";
  const narrative = pickExpeditionNarrative(expedition.status);
  const evolutionLine = getExpeditionEvolutionLine({
    status: expedition.status,
    progressPercent: expedition.progress_percent,
    encounterCategory: expedition.encounter?.category
  });
  const journeyLine = getExpeditionJourneyLine({ progressPercent: expedition.progress_percent });
  const regionIdentityLine = getRegionIdentityLine(expedition.current_region_name);
  const decisionHint = getExpeditionDecisionHint({
    status: expedition.status,
    encounterCategory: expedition.encounter?.category
  });
  const choiceAvailable = isExpeditionChoiceAvailable({
    status: expedition.status,
    encounterCategory: expedition.encounter?.category
  });
  const consequenceLine = getExpeditionConsequenceLine(chosenOption);
  const momentLine = getExpeditionMoment(buildExpeditionMomentContext(expedition));
  const reactiveExpeditionClass = getExpeditionReactiveClass(buildExpeditionReactiveContext(expedition));
  const worldVisualClass = getWorldVisualClass(
    "expedition",
    buildWorldVisualContext({ expeditionReactiveState: getExpeditionReactiveState(buildExpeditionReactiveContext(expedition)) })
  );
  const expeditionHighlightKey = getSingleHighlight(EXPEDITION_HIGHLIGHT_PRIORITY, {
    approach: chosenOption !== null,
    evolution: evolutionLine !== null,
    journey: journeyLine !== null,
    specialization: specializationLine !== null && specializationLine !== void 0,
    regionIdentity: regionIdentityLine !== null,
    consequence: consequenceLine !== null
  });
  const expeditionFeedbackCls = feedbackClassName("highlight");
  const narrativeCls = (key) => key === expeditionHighlightKey && key !== "approach" ? ` ${expeditionFeedbackCls}` : "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `expedition-panel${isCombating ? " expedition-panel-combat" : ""} ${reactiveExpeditionClass} ${worldVisualClass}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Aventura Atual" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      GuideBubble,
      {
        flag: "expedition_seen",
        message: "Seu personagem nunca para: sempre est\xE1 indo a algum lugar, ou voltando de l\xE1 \u2014 inclusive combatendo, \xE0s vezes."
      }
    ),
    justCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "expedition-current-event", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-encounter-icon", children: "\u{1F3C1}" }),
      " Voltou de ",
      justCompleted.destination_region_name,
      ".",
      justCompleted.encounter ? ` ${justCompleted.encounter.icon} ${justCompleted.encounter.text}` : ""
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: `expedition-state-block${chosenOption ? ` ${getExpeditionApproachAccentClass(chosenOption)}` : ""}`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-trail", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: !arrived ? "expedition-trail-active" : "expedition-trail-visited", children: expedition.origin_region_name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-trail-arrow", children: "\u2192" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: arrived ? "expedition-trail-active" : "", children: expedition.destination_region_name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            StatsRow,
            {
              items: [
                { label: "Regi\xE3o atual", value: expedition.current_region_name },
                { label: "Destino", value: expedition.destination_region_name },
                {
                  label: "Estado",
                  // Sprint Expedition Choice Phase II — Persistent Identity:
                  // "Explorando • Investigando" enquanto a identidade da
                  // expedição estiver ativa (persiste até a expedição
                  // acabar, independente do status atual).
                  value: chosenOption ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    STATUS_ICON[expedition.status],
                    " ",
                    STATUS_LABEL[expedition.status],
                    " \u2022 ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: getExpeditionApproachAccentClass(chosenOption), children: [
                      getExpeditionApproachIcon(chosenOption),
                      " ",
                      getExpeditionApproachLabel(chosenOption)
                    ] })
                  ] }) : `${STATUS_ICON[expedition.status]} ${STATUS_LABEL[expedition.status]}`,
                  highlight: true
                },
                { label: "Tempo estimado", value: formatRemaining(expedition.estimated_seconds_remaining) }
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent: expedition.progress_percent, variant: "expedition" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-progress-percent", children: [
            expedition.progress_percent,
            "% da expedi\xE7\xE3o conclu\xEDdo"
          ] }),
          expedition.encounter || narrative || evolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-story", children: [
            expedition.encounter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "expedition-current-event", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-encounter-icon", children: expedition.encounter.icon }),
              " ",
              expedition.encounter.text
            ] }) : null,
            narrative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "expedition-narrative", children: narrative }) : null,
            evolutionLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: `expedition-narrative${narrativeCls("evolution")}`, children: evolutionLine }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: `expedition-narrative${narrativeCls("journey")}`, children: journeyLine }),
            regionIdentityLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: `expedition-narrative${narrativeCls("regionIdentity")}`, children: regionIdentityLine }) : null,
            choiceAvailable ? chosenOption ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "expedition-narrative expedition-choice-outcome", children: [
              getExpeditionChoiceOutcomeIcon(chosenOption),
              " ",
              getExpeditionChoiceOutcomeLine(chosenOption)
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              decisionHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "expedition-narrative", children: decisionHint }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "expedition-choice-options", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "expedition-choice-button",
                    onClick: () => {
                      setChosenOption("investigate");
                      chooseApproach("investigate");
                      recordEvent("expedition_approach_chosen", { option: "investigate" });
                    },
                    children: "\u{1F50D} Investigar"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "expedition-choice-button",
                    onClick: () => {
                      setChosenOption("continue");
                      chooseApproach("continue");
                      recordEvent("expedition_approach_chosen", { option: "continue" });
                    },
                    children: "\u{1F3C3} Seguir em frente"
                  }
                )
              ] })
            ] }) : decisionHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "expedition-narrative", children: decisionHint }) : null,
            consequenceLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: `expedition-narrative${narrativeCls("consequence")}`, children: consequenceLine }) : null,
            specializationLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: `expedition-narrative${narrativeCls("specialization")}`, children: specializationLine }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "expedition-narrative", children: momentLine })
          ] }) : null
        ]
      },
      expedition.status
    )
  ] });
});

// apps/web/src/components/onboarding/EldrinGuide.tsx
var import_react2 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
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
  { after: "first_item_announced", text: "J\xE1 que est\xE1 equipado, vale explorar os outros pr\xE9dios da Cidade." },
  { after: "tutorial_completed", text: "Nos encontramos novamente." }
];
function EldrinGuide() {
  const [step, setStep] = (0, import_react2.useState)(getEldrinStep);
  const [, forceRefresh] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
    const onFlagChange = () => forceRefresh((n) => n + 1);
    window.addEventListener(ONBOARDING_FLAG_EVENT, onFlagChange);
    return () => window.removeEventListener(ONBOARDING_FLAG_EVENT, onFlagChange);
  }, []);
  if (step >= LINES.length) return null;
  const line = LINES[step];
  if (!isFlagSet(line.after)) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eldrin-guide", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(NpcPortrait, { npc: ELDRIN }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "eldrin-guide-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: ELDRIN.name }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { children: [
        '"',
        line.text,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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

// apps/web/src/lib/expeditionSpecialization.ts
function countRecentApproachChoices() {
  let investigate = 0;
  let continueCount = 0;
  for (const event of getRecentEvents(20)) {
    if (event.kind !== "expedition_approach_chosen") continue;
    if (event.meta?.option === "investigate") investigate++;
    else if (event.meta?.option === "continue") continueCount++;
  }
  return { investigate, continueCount };
}
function buildExpeditionSpecializationContext(facts) {
  const insightCtx = buildCollectionInsightContext({ regionsDiscovered: facts.regionsDiscovered });
  const { investigate, continueCount } = countRecentApproachChoices();
  return {
    facts,
    booksRead: insightCtx.booksRead,
    creaturesViewed: insightCtx.creaturesViewed,
    investigateChoices: investigate,
    continueChoices: continueCount
  };
}
var SPECIALIZATION_RULES = [
  // Investigador — único sinal comportamental real (nunca um contador
  // estático): exige uma amostra mínima (>=3 escolhas recentes) e
  // predominância estrita, nunca um empate.
  {
    key: "investigador",
    when: (ctx) => ctx.investigateChoices >= 3 && ctx.investigateChoices > ctx.continueChoices,
    line: "O grupo parece cada vez mais atento aos detalhes."
  },
  // Explorador — regiões descobertas, sinal isolado, patamar acima de
  // qualquer tier já usado por Collection Insights/Legacy/Kingdom
  // Reputation/Personal Chronicle.
  {
    key: "explorador",
    when: (ctx) => ctx.facts.regionsDiscovered >= 6,
    line: "O grupo j\xE1 atravessou boa parte do Reino."
  },
  // Naturalista — criaturas vistas, sinal isolado, acima do tier máximo
  // de Collection Insights (6).
  {
    key: "naturalista",
    when: (ctx) => ctx.creaturesViewed >= 8,
    line: "Poucas criaturas passam despercebidas."
  },
  // Erudito — livros lidos, sinal isolado, acima do tier máximo de
  // Collection Insights/Legacy (6).
  {
    key: "erudito",
    when: (ctx) => ctx.booksRead >= 8,
    line: "Conhecimento parece orientar cada jornada."
  },
  // Veterano — tempo total jogado, sinal isolado, acima do patamar de
  // Personal Chronicle (300).
  {
    key: "veterano",
    when: (ctx) => ctx.facts.totalMinutes >= 480,
    line: "As expedi\xE7\xF5es parecem mais naturais do que antes."
  }
];
function getExpeditionSpecialization(ctx) {
  const rule = SPECIALIZATION_RULES.find((r) => r.when(ctx));
  return rule ? rule.line : null;
}

// apps/web/src/lib/liveGuide.ts
function buildLiveGuideContext(facts, insightCtx, echoContext) {
  return {
    facts,
    booksRead: insightCtx.booksRead,
    creaturesViewed: insightCtx.creaturesViewed,
    approach: echoContext?.approach ?? null
  };
}
var SURFACE_RULES = [
  // Fundador — GuildBuilding já lista Títulos de Fundador (Sprint
  // Founder Identity & Prestige); conexão natural e real, nunca
  // repetindo o boato de Kingdom Reputation nem a retrospectiva de
  // Personal Chronicle pro mesmo sinal.
  {
    when: (ctx) => ctx.facts.hasFounderTitle,
    line: "A Guilda talvez reconhe\xE7a seu lugar entre os primeiros."
  },
  // Veterano — muito tempo de jogo, limiar acima do de Expedition
  // Specialization (480) e Personal Chronicle (300).
  {
    when: (ctx) => ctx.facts.totalMinutes >= 600,
    line: "A Arena pode interessar a quem j\xE1 viveu tanto tempo no Reino."
  },
  // Depois de vários Bosses — exemplo quase literal do brief.
  {
    when: (ctx) => ctx.facts.bossesDefeated >= 3,
    line: "Os moradores parecem comentar suas vit\xF3rias na Taverna."
  },
  // Depois de várias regiões — exemplo quase literal do brief.
  {
    when: (ctx) => ctx.facts.regionsDiscovered >= 5,
    line: "Talvez existam novas hist\xF3rias na Casa dos Viajantes."
  },
  // Depois de ler livros — exemplo quase literal do brief.
  {
    when: (ctx) => ctx.booksRead >= 4,
    line: "O Museu pode complementar essas descobertas."
  },
  // Depois de abrir o Bestiário (creaturesViewed>0 já prova visita
  // real, sem depender de PlayerMemory) — exemplo quase literal do
  // brief.
  {
    when: (ctx) => ctx.creaturesViewed >= 4,
    line: "A Biblioteca possui registros relacionados."
  },
  // Approach — eixo comportamental da expedição atual (Investigador
  // tende a reparar em detalhe, Continue tende a manter o ritmo);
  // nunca repete o texto de Expedition Specialization pro mesmo eixo.
  {
    when: (ctx) => ctx.approach === "investigate",
    line: "Registros mais detalhados de expedi\xE7\xF5es costumam aparecer na Biblioteca."
  },
  {
    when: (ctx) => ctx.approach === "continue",
    line: "Novas expedi\xE7\xF5es sempre esperam por quem segue em frente no Port\xE3o Norte."
  },
  // Jogador novo — fallback garantido, sempre por último. Exemplo
  // literal do brief.
  {
    when: () => true,
    line: "Talvez seja uma boa ideia conhecer o Besti\xE1rio."
  }
];
function getRecommendedSurface(ctx) {
  const rule = SURFACE_RULES.find((r) => r.when(ctx));
  return (rule ?? SURFACE_RULES[SURFACE_RULES.length - 1]).line;
}

export {
  ExpeditionPanel,
  EldrinGuide,
  buildExpeditionSpecializationContext,
  getExpeditionSpecialization,
  buildLiveGuideContext,
  getRecommendedSurface
};
