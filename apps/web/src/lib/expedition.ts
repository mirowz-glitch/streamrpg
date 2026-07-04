import type { ExpeditionStatus } from "@streamrpg/shared";

// Sprint Expedition System, Etapa 3 — cada estado com ícone e descrição
// fixos, nunca inventados a cada tela (uma única fonte para painel
// completo e versão compacta do overlay).
export const STATUS_ICON: Record<ExpeditionStatus, string> = {
  preparing: "🎒",
  exploring: "🚶",
  combating: "⚔️",
  resting: "🏕️",
  returning: "↩️",
  completed: "🏁",
};

export const STATUS_LABEL: Record<ExpeditionStatus, string> = {
  preparing: "Preparando",
  exploring: "Explorando",
  combating: "Combatendo",
  resting: "Descansando",
  returning: "Retornando",
  completed: "Concluída",
};

export function formatRemaining(seconds: number): string {
  if (seconds <= 0) return "menos de 1 min";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `~${hours}h${rest}min` : `~${hours}h`;
}
