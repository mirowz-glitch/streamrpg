/**
 * Sprint 20 — Fase 3/12: exemplo de referência de `SocketLayoutRegistry`
 * cobrindo as 13 Bases reais (mesmo catálogo de `itemgen/baseItems.ts`/
 * `baseIdentity/baseIdentities.ts`). "Nada fixo, nada hardcoded" — os
 * pesos aqui são um ponto de partida honesto (decrescente: quanto mais
 * Sockets, mais raro), NUNCA uma curva de balanceamento real; e,
 * confirmado no comentário de `socketLayout.ts`, esta tabela não é lida
 * por nenhum pipeline de geração real ainda.
 *
 * `maxSockets` por Base usa `exampleMaxSocketsForTier(tier)`, reaproveitando
 * o Tier já real da Sprint 19 (`baseIdentity/baseIdentities.ts`) — os
 * valores de tier abaixo são copiados de lá, não recalculados (evita
 * criar uma dependência de runtime entre os dois módulos).
 */
import type { SocketLayout, SocketLayoutRegistry } from "./socketLayout.js";
import { exampleMaxSocketsForTier } from "./socketLayout.js";

function buildLayout(baseId: string, tier: 1 | 2 | 3 | 4 | 5): SocketLayout {
  const maxSockets = exampleMaxSocketsForTier(tier);
  const weights = [];
  for (let count = 0; count <= maxSockets; count++) {
    weights.push({ count, weight: maxSockets - count + 1 });
  }
  return { baseId, minSockets: 0, maxSockets, weights };
}

export const EXAMPLE_SOCKET_LAYOUT_REGISTRY: SocketLayoutRegistry = {
  sword: buildLayout("sword", 2),
  axe: buildLayout("axe", 3),
  bow: buildLayout("bow", 2),
  dagger: buildLayout("dagger", 1),
  staff: buildLayout("staff", 3),
  wand: buildLayout("wand", 1),
  mace: buildLayout("mace", 4),
  helmet: buildLayout("helmet", 2),
  chest: buildLayout("chest", 3),
  gloves: buildLayout("gloves", 1),
  boots: buildLayout("boots", 1),
  ring: buildLayout("ring", 3),
  amulet: buildLayout("amulet", 2),
  belt: buildLayout("belt", 1),
};
