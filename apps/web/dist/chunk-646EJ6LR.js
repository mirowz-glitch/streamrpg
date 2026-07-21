import {
  EMPTY_ECHO_CONTEXT,
  REGIONS,
  getNextSteps,
  getRegionCreatureThreadCandidates,
  getRegionDiscoveryCandidates,
  getRegionGalleryEchoLine,
  getRegionKnowledge,
  getRegionSiblingRuinsThreadCandidates
} from "./chunk-RHKKRLPV.js";
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
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var RegionGallery = (0, import_react2.memo)(function RegionGallery2({ echoContext = EMPTY_ECHO_CONTEXT }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "region-grid", children: REGIONS.map((region) => {
    const knowledge = getRegionKnowledge(region.id);
    const nextSteps = getNextSteps(
      [
        getRegionDiscoveryCandidates(region.id),
        getRegionCreatureThreadCandidates(region.id),
        getRegionSiblingRuinsThreadCandidates(region.id)
      ],
      echoContext.approach
    );
    const echoLine = getRegionGalleryEchoLine(region.name, echoContext);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "region-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "region-name", children: region.name }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "region-difficulty", children: region.difficulty }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "region-description", children: [
        '"',
        region.description,
        '"'
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "region-theme", children: region.theme }),
      knowledge.stories.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "region-knowledge", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Hist\xF3rias: " }),
        knowledge.stories.slice(0, 2).join(", "),
        knowledge.stories.length > 2 ? ` +${knowledge.stories.length - 2}` : ""
      ] }) : null,
      knowledge.ruins.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "region-knowledge", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "Ru\xEDnas: " }),
        knowledge.ruins.slice(0, 2).join(", "),
        knowledge.ruins.length > 2 ? ` +${knowledge.ruins.length - 2}` : ""
      ] }) : null,
      nextSteps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "region-knowledge", children: nextSteps.join(" ") }) : null,
      echoLine ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "region-knowledge", children: echoLine }) : null
    ] }, region.id);
  }) });
});

export {
  HallOfFame,
  RegionGallery
};
