import { XP_PER_PING } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  CharacterRepository,
  WorldTickEvent,
  XPGrantedEvent,
  LevelUpEvent,
} from "../engine/types.js";
import { isChannelLive } from "../services/twitch.service.js";

export class XPSystem {
  constructor(private repo: CharacterRepository) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;
    return bus.subscribe("world.tick", async (event) => {
      if (event.sessions.length === 0) return;

      // Mapa channelId -> live?, existe apenas durante este tick.
      const liveByChannel = await checkLiveStatusPerChannel(event.sessions);

      // Reduz sessões (uma por characterId:channelId) para personagens
      // únicos. Progressão é sempre por Character — um personagem
      // presente em múltiplas sessões/canais/plataformas simultaneamente
      // é processado uma única vez por tick, nunca uma vez por sessão.
      const liveByCharacter = reduceSessionsToCharacters(event.sessions, liveByChannel);

      for (const [characterId, isLive] of liveByCharacter) {
        try {
          if (!isLive) continue;

          const result = await repo.applyXP(characterId, XP_PER_PING, event.timestamp);
          await repo.addMinutesWatched(characterId, 1);

          console.log(`[XPSystem] Character: ${characterId} | Granted: +${XP_PER_PING} XP | Tick: ${event.tickNumber}`);

          const xpGranted: XPGrantedEvent = {
            type: "xp.granted",
            characterId,
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
              characterId,
              oldLevel: result.oldLevel,
              newLevel: result.newLevel,
              timestamp: event.timestamp,
            };
            bus.emit(levelUp);
          }
        } catch (err) {
          console.error(`[XPSystem] Erro personagem ${characterId}:`, err);
        }
      }
    });
  }
}

/**
 * Verifica o status de "ao vivo" de cada canal único presente nas sessões
 * do tick atual, em paralelo — uma única chamada por canal, nunca uma
 * chamada por sessão. O mapa retornado existe apenas durante este tick.
 *
 * Em caso de erro na consulta de um canal específico, esse canal é
 * tratado como offline neste tick (comportamento conservador).
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

/**
 * Reduz a lista de sessões (uma por characterId:channelId) para um mapa
 * de personagens únicos, decidindo se cada um está "ao vivo" neste tick.
 *
 * Um personagem é considerado ao vivo se pelo menos uma de suas sessões
 * ativas está associada a um canal que está ao vivo. Isso garante que
 * XP é concedido uma única vez por personagem por tick, independentemente
 * de quantas sessões/canais/plataformas ele tenha simultaneamente —
 * Session representa presença, nunca uma oportunidade adicional de
 * progresso.
 *
 * Regra de negócio: um Character pode possuir múltiplas Sessions
 * simultaneamente, mas progresso é concedido apenas uma vez por tick.
 * Esta função reduz múltiplas sessões para um único Character elegível.
 */
function reduceSessionsToCharacters(
  sessions: WorldTickEvent["sessions"],
  liveByChannel: Map<string, boolean>,
): Map<string, boolean> {
  const liveByCharacter = new Map<string, boolean>();

  for (const session of sessions) {
    const channelIsLive = liveByChannel.get(session.channelId) ?? false;
    const alreadyLive = liveByCharacter.get(session.characterId) ?? false;
    liveByCharacter.set(session.characterId, alreadyLive || channelIsLive);
  }

  return liveByCharacter;
}
