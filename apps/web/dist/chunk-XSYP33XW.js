import {
  __toESM,
  require_jsx_runtime
} from "./chunk-LURRKJSR.js";

// apps/web/src/lib/identity.ts
var FRAME_BORDER_CLASS = {
  bronze: "frame-border-bronze",
  prata: "frame-border-prata",
  ouro: "frame-border-ouro",
  fundador: "frame-border-fundador",
  alpha: "frame-border-alpha",
  evento: "frame-border-evento"
};
var FRAME_TIER_LABEL = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  fundador: "Fundador",
  alpha: "Alpha",
  evento: "Evento"
};
function frameBorderClass(tier) {
  return tier ? FRAME_BORDER_CLASS[tier] : "";
}

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
  FRAME_TIER_LABEL,
  FramedAvatar
};
