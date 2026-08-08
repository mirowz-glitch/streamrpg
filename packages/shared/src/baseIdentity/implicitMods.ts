/**
 * Sprint 19 — Fase 4: Implicit Modifier. "Não aplicar ainda —
 * infraestrutura apenas." Este módulo só FORMATA o que já está
 * declarado em `BaseIdentity.implicitMods` — nunca soma, nunca altera
 * Power Score, nunca é lido por `sphere.service.ts`/`generator.ts`.
 */
import type { BaseImplicitModifier } from "./types.js";

/** "+8% Velocidade de Ataque" / "+15 Vida Máxima" — só texto, nunca um efeito real. */
export function formatImplicitModifier(mod: BaseImplicitModifier): string {
  const sign = mod.value >= 0 ? "+" : "";
  const suffix = mod.unit === "percent" ? "%" : "";
  return `${sign}${mod.value}${suffix} ${mod.statLabel}`;
}

export function formatImplicitModifiers(mods: readonly BaseImplicitModifier[]): string[] {
  return mods.map(formatImplicitModifier);
}
