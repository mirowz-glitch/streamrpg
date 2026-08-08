/**
 * Sprint 23 — Sockets & Gems Phase II, Fase 3. O Behavior Resolver.
 * Mesmo contrato do Effect Resolver (Sprint 21, gemEffectResolver.ts):
 * "Recebe: Item, Sockets, Gemas ↓ Retorna: todos os comportamentos
 * ativos. Nunca alterar o Item. Resolver apenas em tempo de cálculo."
 * Puro, sem I/O — quem chama já buscou `SocketConfiguration` e o mapa
 * `Socket.id -> gemType` (a API, via `gem.service.ts`).
 */
import type { SocketConfiguration } from "./types.js";
import type { GemDefinitionRegistry } from "./gemDefinition.js";
import type { GemBehavior, GemBehaviorRegistry } from "./gemBehavior.js";

/** Um comportamento ativo, com o `socketId`/`gemType` de origem — pra UI/depuração, nunca usado pra alterar o Item. */
export interface ActiveGemBehavior {
  socketId: string;
  gemType: string;
  behavior: GemBehavior;
}

/**
 * "Cada GemDefinition referencia um behaviorId" (Fase 3) — só resolve
 * quando a Gema E o Comportamento estão `enabled`; `undefined` em
 * qualquer ponto da cadeia (Gema sem `GemDefinition` registrada, Gema
 * sem `behaviorId`, `behaviorId` sem `GemBehavior` registrado) é um
 * resultado válido — "nunca inventa um comportamento que o dado não
 * sustenta" (mesmo princípio de `resolveGemEffectForGemType`).
 */
export function resolveGemBehaviorForGemType(gemDefRegistry: GemDefinitionRegistry, behaviorRegistry: GemBehaviorRegistry, gemType: string): GemBehavior | undefined {
  const definition = gemDefRegistry[gemType];
  if (!definition?.enabled || !definition.behaviorId) return undefined;
  const behavior = behaviorRegistry[definition.behaviorId];
  return behavior?.enabled ? behavior : undefined;
}

/**
 * O Resolver propriamente dito, para UM item. Só considera Sockets
 * `filled` com uma Gema conhecida (`socketGemTypes`); Sockets vazios/
 * desabilitados ou sem entrada correspondente nunca produzem
 * comportamento algum.
 */
export function resolveActiveGemBehaviors(
  sockets: SocketConfiguration | null,
  socketGemTypes: Record<string, string> | null,
  gemDefRegistry: GemDefinitionRegistry,
  behaviorRegistry: GemBehaviorRegistry,
): ActiveGemBehavior[] {
  if (!sockets || !socketGemTypes) return [];
  const active: ActiveGemBehavior[] = [];
  for (const socket of sockets.sockets) {
    if (socket.state !== "filled") continue;
    const gemType = socketGemTypes[socket.id];
    if (!gemType) continue;
    const behavior = resolveGemBehaviorForGemType(gemDefRegistry, behaviorRegistry, gemType);
    if (!behavior) continue;
    active.push({ socketId: socket.id, gemType, behavior });
  }
  return active;
}
