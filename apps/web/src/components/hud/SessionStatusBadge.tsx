import type { HudSessionStatus } from "@streamrpg/shared";

interface SessionStatusBadgeProps {
  status: HudSessionStatus;
}

// HUD & Gameplay UI Phase I — requisito 10: "Explorando/Em combate/
// Vitória/Derrota/Encerrada, nunca inferir estados, usar apenas dados
// existentes." O `status` já vem pronto de deriveHudState() (que só lê
// currentLife/currentEncounter da AdventureSession) — este componente
// só escolhe um rótulo/classe visual por valor, nunca decide o estado
// em si. "vitoria"/"encerrada" nunca acontecem nesta fase (sem
// condição de vitória/encerramento no Adventure Loop ainda), mas os
// rótulos já existem, prontos pro dia em que existirem.
const STATUS_LABEL: Record<HudSessionStatus, string> = {
  explorando: "Explorando",
  "em-combate": "Em combate",
  vitoria: "Vitória",
  derrota: "Derrota",
  encerrada: "Encerrada",
};

export function SessionStatusBadge({ status }: SessionStatusBadgeProps) {
  return <span className={`hud-session-status hud-session-status-${status}`}>{STATUS_LABEL[status]}</span>;
}
