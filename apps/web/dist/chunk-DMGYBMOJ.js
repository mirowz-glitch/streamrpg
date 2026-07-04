// apps/web/src/lib/expedition.ts
var STATUS_ICON = {
  preparing: "\u{1F392}",
  exploring: "\u{1F6B6}",
  combating: "\u2694\uFE0F",
  resting: "\u{1F3D5}\uFE0F",
  returning: "\u21A9\uFE0F",
  completed: "\u{1F3C1}"
};
var STATUS_LABEL = {
  preparing: "Preparando",
  exploring: "Explorando",
  combating: "Combatendo",
  resting: "Descansando",
  returning: "Retornando",
  completed: "Conclu\xEDda"
};
function formatRemaining(seconds) {
  if (seconds <= 0) return "menos de 1 min";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `~${hours}h${rest}min` : `~${hours}h`;
}

export {
  STATUS_ICON,
  STATUS_LABEL,
  formatRemaining
};
//# sourceMappingURL=chunk-DMGYBMOJ.js.map
