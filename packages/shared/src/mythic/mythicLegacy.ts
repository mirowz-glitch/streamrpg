/**
 * Sprint 18 — Fase 6: "Atualizar Legacy. Adicionar suporte para
 * first_discovery, mythic_revealed. Nunca persistir dados duplicados.
 * Tudo derivado."
 *
 * `mythic_revealed` já é um `ItemHistoryEventType` classificado em
 * `itemization/legacy.ts` desde a Sprint 17 (craft/legendary/public) —
 * nada muda ali. O que faltava era `first_discovery`: nunca um evento
 * de História por item (seria um dado GLOBAL, não por-item — quem foi
 * o primeiro jogador do SERVIDOR a revelar este Mítico, não algo que
 * pertence só a este item específico). Por isso este módulo vive em
 * `mythic/`, não em `itemization/legacy.ts` — `itemization/` continua
 * sem nenhuma dependência de conceitos globais/cross-personagem.
 *
 * A derivação nunca duplica dado: ela só COMPARA o evento
 * `mythic_revealed` já gravado no History deste item (characterId +
 * timestamp) contra o registro em `MythicDiscoveryRegistry` (Fase 5) —
 * se os dois baterem, ESTE item específico foi o que revelou o
 * Mítico pela primeira vez no servidor.
 */
import type { ItemHistoryEvent } from "../itemization/history.js";
import type { MythicDiscoveryRegistry, MythicRegistry } from "./types.js";
import { findMythicDefinitionByRevealedName } from "./registry.js";
import { getMythicDiscovery } from "./discovery.js";

export interface MythicOrigin {
  isMythic: boolean;
  mythicId: string | null;
  displayName: string | null;
  isFirstDiscovery: boolean;
}

const NOT_MYTHIC: MythicOrigin = { isMythic: false, mythicId: null, displayName: null, isFirstDiscovery: false };

/**
 * Deriva a Origem Mítica de um item a partir do seu History real —
 * pura, sem I/O. Devolve `NOT_MYTHIC` pra qualquer item sem evento
 * `mythic_revealed` (a maioria de todos os itens do jogo). Se o
 * evento existir mas o nome revelado não corresponder a nenhum
 * `MythicDefinition` registrado (dado antigo/desconhecido — mesmo
 * espírito do fallback de `deriveLegacyEvents`), ainda assim marca
 * `isMythic: true` (o History nunca mente), só sem `mythicId`/
 * `isFirstDiscovery` resolvidos.
 */
export function deriveMythicOrigin(events: readonly ItemHistoryEvent[], mythicRegistry: MythicRegistry, discoveryRegistry: MythicDiscoveryRegistry): MythicOrigin {
  const revealEvent = events.find((evt) => evt.event === "mythic_revealed");
  if (!revealEvent) return NOT_MYTHIC;

  const definition = revealEvent.detail ? findMythicDefinitionByRevealedName(mythicRegistry, revealEvent.detail) : undefined;
  if (!definition) {
    return { isMythic: true, mythicId: null, displayName: revealEvent.detail, isFirstDiscovery: false };
  }

  const discovery = getMythicDiscovery(discoveryRegistry, definition.id);
  const isFirstDiscovery = discovery !== undefined && discovery.firstCharacterId === revealEvent.characterId && discovery.firstAt === revealEvent.at;

  return { isMythic: true, mythicId: definition.id, displayName: definition.displayName, isFirstDiscovery };
}
