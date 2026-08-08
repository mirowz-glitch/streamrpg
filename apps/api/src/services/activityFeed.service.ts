/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9), Fase 6 — Activity
 * Feed: um registro FACTUAL de eventos notáveis do Mundo inteiro
 * (Boss derrotado, Casa comprada, Reino fundado, item lendário
 * encontrado). Deliberadamente distinto de:
 *   - KingdomNewsSystem (Jornal do Reino): narra o MESMO tipo de fato
 *     com variação de texto/voz de NPC. Activity Feed nunca varia —
 *     um tipo de evento sempre produz o mesmo formato de frase.
 *   - Chat: não existe interação, ninguém posta nada aqui — é só
 *     observação de fatos reais, mesmo espírito read-only de todo
 *     System desta Sprint (WorldPresenceSystem, KingdomNewsSystem).
 *
 * Muitos dos domínios que alimentam este feed (Housing/Kingdom/Real
 * Estate) nunca emitiram eventos no EventBus — são serviços síncronos
 * chamados direto pelas rotas (auditoria da Sprint Kingdom Domain).
 * Em vez de retrofitar EventBus nesses domínios só para este consumidor
 * (fora de escopo, D7), `pushActivityFeedEntry()` é chamada
 * diretamente no ponto de sucesso de cada serviço — mesmo princípio de
 * "reaproveitar o formato, não inventar mecanismo novo".
 */
import type { EventBus } from "../engine/EventBus.js";
import type { BossDefeatedEvent } from "../engine/types.js";

export interface ActivityFeedEntry {
  id: string;
  icon: string;
  text: string;
  timestamp: number;
}

const MAX_ENTRIES = 20;

let entries: ActivityFeedEntry[] = [];
let seq = 0;

export function pushActivityFeedEntry(icon: string, text: string, timestamp: number = Date.now()): void {
  seq += 1;
  entries.push({ id: `feed-${seq}`, icon, text, timestamp });
  if (entries.length > MAX_ENTRIES) {
    entries = entries.slice(-MAX_ENTRIES);
  }
}

/** Mais recentes primeiro. */
export function getActivityFeed(): ActivityFeedEntry[] {
  return [...entries].reverse();
}

/**
 * "Boss derrotado" É um evento real do EventBus (boss.defeated,
 * disparado por BossRewardSystem) — diferente de Housing/Kingdom/Real
 * Estate, este domínio já tinha o mecanismo certo, então esta é a única
 * fonte deste módulo que usa subscribe() em vez de chamada direta.
 */
export function registerActivityFeedBusListeners(bus: EventBus): () => void {
  return bus.subscribe("boss.defeated", (event) => {
    const { timestamp } = event as BossDefeatedEvent;
    pushActivityFeedEntry("🐉", "Um Boss foi derrotado.", timestamp);
  });
}
