/**
 * XPSystem — M-006 / atualizado M-007
 *
 * Sistema responsável pela concessão de XP a jogadores ativos.
 *
 * MILESTONE 6 — MODO SHADOW:
 * Este sistema roda em paralelo com o applyPing() existente.
 * Ele calcula o XP que seria concedido mas NÃO escreve no banco.
 * Serve para validar que a Engine processa sessões reais corretamente
 * antes de assumir o controle oficial da progressão.
 *
 * MILESTONE 7:
 * Removido acesso direto ao banco (getDb()).
 * O XPSystem agora depende exclusivamente do CharacterRepository
 * injetado no construtor — conforme arquitetura aprovada.
 *
 * Quando o modo shadow for validado:
 * - applyPing() deixará de conceder XP
 * - XPSystem passará a chamar characterRepository.applyXP()
 * - O log de shadow será removido
 *
 * O XPSystem NÃO conhece:
 * - EventBus (recebe via register())
 * - GameEngine ou GameClock
 * - Frontend, Twitch ou Railway
 * - Outros sistemas (DropSystem, BossSystem, etc.)
 * - SQLite ou qualquer banco de dados
 *
 * Ele conhece apenas:
 * - WorldTickEvent (via EventBus)
 * - CharacterRepository (via injeção no construtor)
 * - XP_PER_PING (constante do shared)
 */

import { XP_PER_PING } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type { CharacterRepository, WorldTickEvent } from "../engine/types.js";

export class XPSystem {
  private readonly characters: CharacterRepository;

  constructor(characters: CharacterRepository) {
    this.characters = characters;
  }

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
   * Para cada sessão ativa, busca o personagem via repository
   * e loga o XP que seria concedido.
   */
  private async onWorldTick(event: WorldTickEvent): Promise<void> {
    if (event.sessions.length === 0) return;

    for (const session of event.sessions) {
      try {
        const character = await this.characters.findById(session.characterId);
        if (!character) continue;

        // MODO SHADOW — apenas loga, nunca escreve
        console.log(
          `[XPSystem] Character: ${character.displayName} | Would grant: +${XP_PER_PING} XP | Tick: ${event.tickNumber} | Channel: ${session.channelId}`,
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
