import {
  isFlagSet,
  setFlag
} from "./chunk-QE563634.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/hooks/useFirstVisit.ts
var import_react = __toESM(require_react(), 1);
function useFirstVisit(flag) {
  const [wasFirstVisit] = (0, import_react.useState)(() => !isFlagSet(flag));
  (0, import_react.useEffect)(() => {
    setFlag(flag);
  }, [flag]);
  return wasFirstVisit;
}

// apps/web/src/components/onboarding/GuideBubble.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function GuideBubble({ flag, message }) {
  const isFirstVisit = useFirstVisit(flag);
  if (!isFirstVisit) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "guide-bubble", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "guide-bubble-icon", "aria-hidden": "true", children: "\u{1F4AC}" }),
    message
  ] });
}

export {
  GuideBubble
};
