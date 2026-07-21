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
var FOUNDER_TITLE_SLUGS = /* @__PURE__ */ new Set(["primeiro-aventureiro", "founder-alpha", "primeiro-reino"]);

export {
  FRAME_TIER_LABEL,
  frameBorderClass,
  FOUNDER_TITLE_SLUGS
};
