import {
  frameBorderClass
} from "./chunk-LIYTWNFS.js";
import {
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/ui/FramedAvatar.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function FramedAvatar({ avatarUrl, frameTier, baseClassName }) {
  const className = `${baseClassName} ${frameBorderClass(frameTier)}`.trim();
  if (avatarUrl) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: avatarUrl, alt: "", className });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `${className} ${baseClassName}-placeholder placeholder`, "aria-hidden": "true" });
}

export {
  FramedAvatar
};
