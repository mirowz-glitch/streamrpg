/**
 * Sprint 15 — Sockets + Gem System (Foundation), Fase 7. Mesmo
 * princípio append-only de `itemization/history.ts`, mas para
 * `GemHistory` — deliberadamente um módulo/tipo SEPARADO (ver nota de
 * restrição em `types.ts`: `itemization/history.ts`/`legacy.ts` não
 * podem ser tocados nesta Sprint).
 */
import type { GemHistory, GemHistoryEventType } from "./types.js";

/** Cria um Gem History novo — o primeiro evento é sempre "created". */
export function createGemHistory(characterId: string, nowIso: string): GemHistory {
  return { events: [{ event: "created", characterId, detail: null, at: nowIso }] };
}

/**
 * Anexa um evento — nunca edita/remove os já existentes. Pura, devolve
 * um objeto novo (nunca muta `history` recebido).
 */
export function appendGemHistoryEvent(
  history: GemHistory,
  event: GemHistoryEventType,
  characterId: string | null,
  detail: string | null,
  atIso: string,
): GemHistory {
  return { events: [...history.events, { event, characterId, detail, at: atIso }] };
}
