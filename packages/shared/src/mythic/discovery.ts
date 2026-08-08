/**
 * Sprint 18 — Fase 5: Discovery. "Todo Item Mítico deve registrar:
 * Primeiro jogador, Primeiro Reino, Primeira data, Servidor. Nunca
 * apagar. Nunca sobrescrever." Modelado como um reducer puro
 * first-write-wins: a primeira chamada pra um `mythicId` cria o
 * registro; qualquer chamada seguinte pro MESMO `mythicId` é
 * ignorada (devolve o registry inalterado) — nunca sobrescreve quem
 * já foi o primeiro. A persistência real (apps/api) só precisa de um
 * INSERT idempotente (ON CONFLICT DO NOTHING) pra satisfazer esta
 * mesma garantia contra concorrência real — este módulo só define a
 * regra, não a tabela.
 *
 * "Sem ranking, sem UI" — nenhuma função aqui ordena/lista por data;
 * só grava e lê pontualmente por `mythicId`.
 */
import type { MythicDiscoveryRecord, MythicDiscoveryRegistry } from "./types.js";

export interface RecordDiscoveryResult {
  registry: MythicDiscoveryRegistry;
  record: MythicDiscoveryRecord;
  /** true só quando ESTA chamada criou o registro (era a primeira vez). */
  isFirstDiscovery: boolean;
}

export function recordMythicDiscovery(
  registry: MythicDiscoveryRegistry,
  mythicId: string,
  characterId: string,
  kingdomId: string | null,
  atIso: string,
  server: string,
): RecordDiscoveryResult {
  const existing = registry[mythicId];
  if (existing) {
    return { registry, record: existing, isFirstDiscovery: false };
  }
  const record: MythicDiscoveryRecord = { mythicId, firstCharacterId: characterId, firstKingdomId: kingdomId, firstAt: atIso, server };
  return { registry: { ...registry, [mythicId]: record }, record, isFirstDiscovery: true };
}

export function getMythicDiscovery(registry: MythicDiscoveryRegistry, mythicId: string): MythicDiscoveryRecord | undefined {
  return registry[mythicId];
}
