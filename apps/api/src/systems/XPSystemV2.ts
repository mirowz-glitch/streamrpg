import { XP_PER_PING } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type { CharacterRepository, WorldTickEvent } from "../engine/types.js";

export class XPSystem {
  constructor(private repo: CharacterRepository) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;
    return bus.subscribe("world.tick", async (event) => {
      if (event.sessions.length === 0) return;
      for (const session of event.sessions) {
        try {
          const character = await repo.findById(session.characterId);
          if (!character) continue;
          console.log(`[XPSystem] Character: ${character.displayName} | Would grant: +${XP_PER_PING} XP | Tick: ${event.tickNumber} | Channel: ${session.channelId}`);
        } catch (err) {
          console.error(`[XPSystem] Erro sessão ${session.characterId}:`, err);
        }
      }
    });
  }
}
