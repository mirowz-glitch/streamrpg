import { XP_PER_PING } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  CharacterRepository,
  WorldTickEvent,
  XPGrantedEvent,
  LevelUpEvent,
} from "../engine/types.js";
import { isChannelLive } from "../services/twitch.service.js";
import { env } from "../config/env.js";

export class XPSystem {
  constructor(private repo: CharacterRepository) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;
    return bus.subscribe("world.tick", async (event) => {
      if (event.sessions.length === 0) return;
      for (const session of event.sessions) {
        try {
          const live = await isChannelLive(session.channelId);
          if (!live) continue;

          if (!env.useEngineXp) {
            // Shadow mode: apenas loga o que seria concedido, sem escrever nada.
            const character = await repo.findById(session.characterId);
            if (!character) continue;
            console.log(`[XPSystem] Character: ${character.displayName} | Would grant: +${XP_PER_PING} XP | Tick: ${event.tickNumber} | Channel: ${session.channelId}`);
            continue;
          }

          // USE_ENGINE_XP=true — ainda NÃO ativado em produção nesta Sprint.
          // Infraestrutura pronta para a Mudança 3, sem execução real até lá.
          const result = await repo.applyXP(session.characterId, XP_PER_PING, event.timestamp);
          await repo.addMinutesWatched(session.characterId, 1);

          console.log(`[XPSystem] Character: ${session.characterId} | Granted: +${XP_PER_PING} XP | Tick: ${event.tickNumber} | Channel: ${session.channelId}`);

          const xpGranted: XPGrantedEvent = {
            type: "xp.granted",
            characterId: session.characterId,
            channelId: session.channelId,
            amount: XP_PER_PING,
            newTotalXp: result.newTotalXp,
            newLevel: result.newLevel,
            leveledUp: result.leveledUp,
            timestamp: event.timestamp,
          };
          bus.emit(xpGranted);

          if (result.leveledUp) {
            const levelUp: LevelUpEvent = {
              type: "level.up",
              characterId: session.characterId,
              channelId: session.channelId,
              oldLevel: result.oldLevel,
              newLevel: result.newLevel,
              timestamp: event.timestamp,
            };
            bus.emit(levelUp);
          }
        } catch (err) {
          console.error(`[XPSystem] Erro sessão ${session.characterId}:`, err);
        }
      }
    });
  }
}
