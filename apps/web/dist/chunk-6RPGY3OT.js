import {
  EXPEDITION_HIGHLIGHT_PRIORITY,
  STATUS_ICON,
  STATUS_LABEL,
  buildExpeditionMomentContext,
  buildExpeditionReactiveContext,
  buildWorldVisualContext,
  feedbackClassName,
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
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/ExpeditionCompact.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function ExpeditionCompact({ expedition, specializationLine }) {
  const narrative = pickExpeditionNarrative(expedition.status);
  const evolutionLine = getExpeditionEvolutionLine({
    status: expedition.status,
    progressPercent: expedition.progress_percent,
    encounterCategory: expedition.encounter?.category
  });
  const journeyLine = getExpeditionJourneyLine({ progressPercent: expedition.progress_percent });
  const regionIdentityLine = getRegionIdentityLine(expedition.region_name);
  const decisionHint = getExpeditionDecisionHint({
    status: expedition.status,
    encounterCategory: expedition.encounter?.category
  });
  const consequenceLine = getExpeditionConsequenceLine(expedition.approach);
  const momentLine = getExpeditionMoment(buildExpeditionMomentContext(expedition));
  const isCombating = expedition.status === "combating";
  const reactiveExpeditionClass = getExpeditionReactiveClass(buildExpeditionReactiveContext(expedition));
  const worldVisualClass = getWorldVisualClass(
    "expedition",
    buildWorldVisualContext({ expeditionReactiveState: getExpeditionReactiveState(buildExpeditionReactiveContext(expedition)) })
  );
  const expeditionHighlightKey = getSingleHighlight(EXPEDITION_HIGHLIGHT_PRIORITY, {
    approach: expedition.approach !== null,
    evolution: evolutionLine !== null,
    journey: journeyLine !== null,
    specialization: specializationLine !== null && specializationLine !== void 0,
    regionIdentity: regionIdentityLine !== null,
    consequence: consequenceLine !== null
  });
  const feedbackCls = feedbackClassName("highlight");
  const narrativeCls = (key) => key === expeditionHighlightKey ? ` ${feedbackCls}` : "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: `expedition-compact${isCombating ? " expedition-compact-combat" : ""} ${reactiveExpeditionClass} ${worldVisualClass}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "expedition-compact-region", children: [
          "\u{1F4CD} ",
          expedition.region_name
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `expedition-compact-status${narrativeCls("approach")}`, children: expedition.encounter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          expedition.encounter.icon,
          " ",
          expedition.encounter.text
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          STATUS_ICON[expedition.status],
          " ",
          STATUS_LABEL[expedition.status]
        ] }) }),
        narrative ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-compact-narrative", children: narrative }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `expedition-compact-narrative${narrativeCls("evolution")}`, children: evolutionLine }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `expedition-compact-narrative${narrativeCls("journey")}`, children: journeyLine }),
        regionIdentityLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `expedition-compact-narrative${narrativeCls("regionIdentity")}`, children: regionIdentityLine }) : null,
        decisionHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-compact-narrative", children: decisionHint }) : null,
        consequenceLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `expedition-compact-narrative${narrativeCls("consequence")}`, children: consequenceLine }) : null,
        specializationLine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `expedition-compact-narrative${narrativeCls("specialization")}`, children: specializationLine }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "expedition-compact-narrative", children: momentLine }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressBar, { percent: expedition.progress_percent, variant: "expedition-compact" })
      ]
    },
    expedition.status
  );
}

export {
  ExpeditionCompact
};
