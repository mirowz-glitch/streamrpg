import type { FrameTier } from "@streamrpg/shared";
import { frameBorderClass } from "../../lib/identity";

interface FramedAvatarProps {
  avatarUrl: string | null;
  frameTier: FrameTier | null;
  baseClassName: string;
}

// Sprint Founder Identity & Prestige — um único componente para
// avatar+moldura, reaproveitado em Character/Ranking (Overlay usa só o
// título, avatar não aparece lá hoje). Evita desenhar a mesma moldura de
// jeitos diferentes em cada tela.
export function FramedAvatar({ avatarUrl, frameTier, baseClassName }: FramedAvatarProps) {
  const className = `${baseClassName} ${frameBorderClass(frameTier)}`.trim();
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={className} />;
  }
  // Duas convenções de "sem avatar" já existiam antes desta Sprint em
  // telas diferentes (`.character-avatar-placeholder` hifenizado,
  // `.ranking-avatar.placeholder` composto) — este componente emite as
  // duas classes para funcionar com ambas sem precisar unificar o CSS
  // de Sprints anteriores.
  return <div className={`${className} ${baseClassName}-placeholder placeholder`} aria-hidden="true" />;
}
