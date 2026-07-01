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

      // Mapa channelId -> live?, existe apenas durante este tick.
      // Nunca é reaproveitado entre ticks — recriado do zero a cada chamada.
      const liveByChannel = await checkLiveStatusPerChannel(event.sessions);

      for (const session of event.sessions) {
        try {
          const live = liveByChannel.get(session.channelId) ?? false;
          if (!live) continue;

          if (!env.useEngineXp) {
            // Shadow mode: apenas loga o que seria concedido, sem escrever nada.
            const character = await repo.findById(session.characterId);
            if (!character) continue;
            console.log(`[XPSystem] Character: ${character.displayName} | Would grant: +${XP_PER_PING} XP | Tick: ${event.tickNumber} | Channel: ${session.channelId}`);
            continue;
          }

          // USE_ENGINE_XP=true — ainda NÃO ativado em produção nesta Sprint.
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

/**
 * Verifica o status de "ao vivo" de cada canal único presente nas sessões
 * do tick atual, em paralelo — uma única chamada por canal, nunca uma
 * chamada por sessão.
 *
 * O mapa retornado existe apenas durante este tick. Nunca é cacheado
 * ou reaproveitado entre ticks — cada chamada a esta função começa do zero.
 *
 * Em caso de erro na consulta de um canal específico, esse canal é
 * tratado como offline neste tick (comportamento conservador: não concede
 * XP quando não há confirmação de que o canal está ao vivo). O erro é
 * logado uma única vez por canal, nunca por sessão. Um canal com erro
 * nunca impede o processamento dos demais canais no mesmo tick.
 *
 * Isolado nesta função para que, no futuro, isChannelLive() seja
 * substituído por PlatformProvider.isLive() sem alterar a lógica de
 * agrupamento e paralelização abaixo.
 */
async function checkLiveStatusPerChannel(
  sessions: WorldTickEvent["sessions"],
): Promise<Map<string, boolean>> {
  const uniqueChannelIds = Array.from(
    new Set(sessions.map((session) => session.channelId)),
  );

  const results = await Promise.all(
    uniqueChannelIds.map(async (channelId) => {
      try {
        const live = await isChannelLive(channelId);
        return { channelId, live };
      } catch (err) {
        console.error(`[XPSystem] Erro ao verificar live do canal ${channelId}:`, err);
        return { channelId, live: false };
      }
    }),
  );

  return new Map(results.map((r) => [r.channelId, r.live] as const));
}
