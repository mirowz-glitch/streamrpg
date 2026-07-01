/**
 * XPSystem — M-006
 *
 * Sistema responsável pela concessão de XP a jogadores ativos.
 *
 * MILESTONE 6 — MODO SHADOW:
 * Este sistema roda em paralelo com o applyPing() existente.
 * Ele calcula o XP que seria concedido mas NÃO escreve no banco.
 * Serve para validar que a Engine processa sessões reais corretamente
 * antes de assumir o controle oficial da progressão.
 *
 * Quando o modo shadow for validado:
 * - applyPing() deixará de conceder XP
 * - XPSystem passará a escrever no banco via CharacterRepository
 * - O log de shadow será removido
 *
 * O XPSystem NÃO conhece:
 * - EventBus (recebe via register())
 * - GameEngine ou GameClock
 * - Frontend, Twitch ou Railway
 * - Outros sistemas (DropSystem, BossSystem, etc.)
 *
 * Ele conhece apenas:
 * - WorldTickEvent (via EventBus)
 * - O banco de dados (apenas leitura nesta Milestone)
 * - XP_PER_PING (constante do shared)
 */

import { XP_PER_PING } from "@streamrpg/shared";
import { getDb } from "../config/database.js";
import type { EventBus } from "../engine/EventBus.js";
import type { WorldTickEvent } from "../engine/types.js";

export class XPSystem {
  /**
   * Registra o XPSystem no EventBus.
   * A partir deste momento, o sistema passa a escutar WorldTickEvent.
   *
   * Retorna uma função de cancelamento — útil para testes e teardown.
   */
  register(bus: EventBus): () => void {
    return bus.subscribe("world.tick", (event) => {
      void this.onWorldTick(event);
    });
  }

  /**
   * Processa um tick do mundo.
   *
   * MODO SHADOW: apenas calcula e loga. Não escreve no banco.
   *
   * Para cada sessão ativa, busca o display_name do personagem
   * e loga o XP que seria concedido.
   */
  private async onWorldTick(event: WorldTickEvent): Promise<void> {
    if (event.sessions.length === 0) return;

    const db = getDb();

    for (const session of event.sessions) {
      try {
        const character = db
          .prepare("SELECT display_name FROM characters WHERE id = ?")
          .get(session.characterId) as { display_name: string } | undefined;

        if (!character) continue;

        // MODO SHADOW — apenas loga, nunca escreve
        console.log(
          `[XPSystem] Character: ${character.display_name} | Would grant: +${XP_PER_PING} XP | Tick: ${event.tickNumber} | Channel: ${session.channelId}`,
        );
      } catch (err) {
        console.error(
          `[XPSystem] Erro ao processar sessão ${session.characterId}:`,
          err,
        );
      }
    }
  }
}
