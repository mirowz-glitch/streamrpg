/**
 * EventBus — M-004
 *
 * Canal de comunicação entre os sistemas da Game Engine.
 *
 * O EventBus é a única forma legítima de comunicação entre sistemas.
 * Sistemas nunca se chamam diretamente — eles emitem eventos e
 * se inscrevem para receber eventos de outros sistemas.
 *
 * O EventBus NÃO conhece:
 * - Regras de jogo (XP, drops, boss, economia)
 * - GameEngine, GameClock ou SessionManager
 * - Twitch, banco de dados, frontend ou Railway
 *
 * Ele apenas responde a três perguntas:
 * - "Quero ouvir eventos do tipo X." → subscribe()
 * - "Não quero mais ouvir eventos do tipo X." → unsubscribe()
 * - "Aconteceu um evento do tipo X." → emit()
 *
 * DECISÕES DE PROJETO:
 *
 * 1. TIPAGEM via GameEvent union type
 *    O EventBus usa o union type GameEvent de engine/types.ts.
 *    Isso garante em tempo de compilação que nenhum handler recebe
 *    um evento com estrutura errada.
 *
 * 2. HANDLERS SÍNCRONOS
 *    emit() é síncrono. Handlers async são suportados mas o EventBus
 *    não aguarda sua resolução. Erros em handlers async não propagam
 *    para o emit(). Isso é intencional — o emit não deve bloquear
 *    o tick da Engine aguardando handlers lentos.
 *
 * 3. ISOLAMENTO DE ERROS
 *    Um handler com erro não impede os outros de executar.
 *    Erros são logados mas não propagados para quem emitiu o evento.
 *
 * 4. UNSUBSCRIBE por função de retorno
 *    subscribe() retorna uma função de cancelamento.
 *    Isso elimina a necessidade de guardar referências a handlers
 *    para passar para unsubscribe() posteriormente.
 *
 * 5. SEM WILDCARDS, FILAS OU PRIORIDADES
 *    O EventBus mais simples possível. Complexidade adicional
 *    deve ser justificada por necessidade real, não antecipada.
 *
 * LIMITE DE RESPONSABILIDADE:
 *    Se o EventBus começar a acumular lógica de filtragem, ordenação
 *    ou transformação de eventos, essa lógica pertence aos sistemas,
 *    não ao EventBus.
 */

import type { GameEvent, GameEventHandler, EventOfType } from "./types.js";

export class EventBus {
  private handlers = new Map<string, Set<GameEventHandler<GameEvent>>>();

  /**
   * Inscreve um handler para receber eventos de um tipo específico.
   *
   * Retorna uma função de cancelamento (unsubscribe).
   * Chamar a função retornada remove o handler silenciosamente.
   *
   * Exemplo:
   *   const unsubscribe = bus.subscribe("xp.granted", (event) => { ... });
   *   // later:
   *   unsubscribe();
   */
  subscribe<T extends GameEvent["type"]>(
    eventType: T,
    handler: GameEventHandler<EventOfType<T>>,
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const set = this.handlers.get(eventType)!;
    set.add(handler as GameEventHandler<GameEvent>);

    return () => {
      set.delete(handler as GameEventHandler<GameEvent>);
      if (set.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  /**
   * Emite um evento para todos os handlers inscritos no tipo desse evento.
   *
   * A emissão é síncrona: os handlers são chamados na ordem de inscrição.
   * Handlers async são disparados mas não aguardados.
   * Erros em handlers individuais são capturados e logados,
   * sem interromper os handlers seguintes.
   */
  emit<T extends GameEvent>(event: T): void {
    const set = this.handlers.get(event.type);
    if (!set || set.size === 0) return;

    for (const handler of set) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((err) => {
            console.error(
              `EventBus: erro assíncrono no handler de "${event.type}":`,
              err,
            );
          });
        }
      } catch (err) {
        console.error(
          `EventBus: erro síncrono no handler de "${event.type}":`,
          err,
        );
      }
    }
  }

  /**
   * Retorna o número de handlers inscritos para um tipo de evento.
   * Útil para testes e diagnóstico.
   */
  listenerCount(eventType: GameEvent["type"]): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }

  /**
   * Remove todos os handlers de todos os tipos de evento.
   * Útil para testes e teardown.
   */
  clear(): void {
    this.handlers.clear();
  }
}
