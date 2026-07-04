import type { FrameTier } from "@streamrpg/shared";

// Sprint Founder Identity & Prestige — mapa único de tier → classe CSS,
// reaproveitado em Character/Overlay/Ranking para nunca desenhar a
// mesma moldura de formas diferentes em cada tela.
export const FRAME_BORDER_CLASS: Record<FrameTier, string> = {
  bronze: "frame-border-bronze",
  prata: "frame-border-prata",
  ouro: "frame-border-ouro",
  fundador: "frame-border-fundador",
  alpha: "frame-border-alpha",
  evento: "frame-border-evento",
};

export const FRAME_TIER_LABEL: Record<FrameTier, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  fundador: "Fundador",
  alpha: "Alpha",
  evento: "Evento",
};

export function frameBorderClass(tier: FrameTier | null | undefined): string {
  return tier ? FRAME_BORDER_CLASS[tier] : "";
}
