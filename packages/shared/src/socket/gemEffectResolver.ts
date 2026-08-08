/**
 * Sprint 21 — Gem Effects Phase I, Fase 5/6. O Effect Resolver.
 * "Recebe: Item, Sockets, Gemas ↓ Retorna: todos os modificadores
 * ativos. Nunca alterar o Item. Resolver apenas em tempo de cálculo."
 * Puro, sem I/O — quem chama já buscou `SocketConfiguration` e o mapa
 * `Socket.id -> gemType` (a API, via `gem.service.ts`, mesmo padrão de
 * `getSocketGemDisplayNames`/`getSocketGemTypes`, Sprint 20/21).
 */
import type { SocketConfiguration } from "./types.js";
import type { GemDefinitionRegistry } from "./gemDefinition.js";
import type { GemEffect, GemEffectRegistry, GemEffectStatType } from "./gemEffect.js";

/** Um efeito ativo, com o `socketId`/`gemType` de origem — pra UI/depuração, nunca usado pra alterar o Item. */
export interface ActiveGemEffect {
  socketId: string;
  gemType: string;
  effect: GemEffect;
}

/**
 * "Cada GemDefinition referencia um GemEffect" (Fase 3) — só resolve
 * quando a Gema E o Efeito estão `enabled`; `undefined` em qualquer
 * ponto da cadeia (Gema sem `GemDefinition` registrada, Gema sem
 * `effectId`, `effectId` sem `GemEffect` registrado) é um resultado
 * válido — "nunca inventa um efeito que o dado não sustenta" (mesmo
 * princípio de `isGemCompatibleWithBase`, Sprint 20).
 */
export function resolveGemEffectForGemType(gemDefRegistry: GemDefinitionRegistry, effectRegistry: GemEffectRegistry, gemType: string): GemEffect | undefined {
  const definition = gemDefRegistry[gemType];
  if (!definition?.enabled || !definition.effectId) return undefined;
  const effect = effectRegistry[definition.effectId];
  return effect?.enabled ? effect : undefined;
}

/**
 * Fase 5 — o Resolver propriamente dito, para UM item. Só considera
 * Sockets `filled` com uma Gema conhecida (`socketGemTypes`); Sockets
 * vazios/desabilitados ou sem entrada correspondente nunca produzem
 * efeito algum.
 */
export function resolveActiveGemEffects(
  sockets: SocketConfiguration | null,
  socketGemTypes: Record<string, string> | null,
  gemDefRegistry: GemDefinitionRegistry,
  effectRegistry: GemEffectRegistry,
): ActiveGemEffect[] {
  if (!sockets || !socketGemTypes) return [];
  const active: ActiveGemEffect[] = [];
  for (const socket of sockets.sockets) {
    if (socket.state !== "filled") continue;
    const gemType = socketGemTypes[socket.id];
    if (!gemType) continue;
    const effect = resolveGemEffectForGemType(gemDefRegistry, effectRegistry, gemType);
    if (!effect) continue;
    active.push({ socketId: socket.id, gemType, effect });
  }
  return active;
}

/**
 * Fase 6/7 — o vocabulário de "Status derivados" que Gemas modificam,
 * 1:1 com os 7 `GemEffectStatType` (nenhum stat fora desses 7). Base
 * real hoje (Fase 1, auditoria): só `attack`/`defense` têm uma origem
 * já existente (`/api/character`'s `combat` snapshot,
 * `getCombatAttributes()`); os outros 5 nascem em 0 até algum sistema
 * futuro conceder um valor base — Gemas continuam sendo a ÚNICA fonte
 * deles hoje, honestamente refletido no resultado.
 */
export type ResolvedCharacterStats = Record<GemEffectStatType, number>;

export function zeroResolvedCharacterStats(): ResolvedCharacterStats {
  return { attack: 0, defense: 0, critical: 0, life: 0, mana: 0, attackSpeed: 0, magic: 0 };
}

/**
 * "Os efeitos das Gemas passam a modificar: Status derivados. Nunca
 * persistir bônus. Sempre recalcular." — função pura, sem estado;
 * `base` nunca é mutado (retorna um objeto novo). `percent` aplica
 * sobre o valor de `base` do PRÓPRIO tipo (nunca sobre o resultado já
 * modificado por outra Gema — todas as Gemas leem o mesmo `base`,
 * evita que a ORDEM de aplicação mude o resultado).
 */
export function applyGemEffectsToStats(base: ResolvedCharacterStats, activeEffects: ActiveGemEffect[]): ResolvedCharacterStats {
  const result: ResolvedCharacterStats = { ...base };
  for (const { effect } of activeEffects) {
    const delta = effect.scaling === "percent" ? base[effect.type] * (effect.value / 100) : effect.value;
    result[effect.type] += delta;
  }
  return result;
}
