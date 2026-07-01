/**
 * WelcomeRewardSystem — M-008 (parte da migração de XP)
 *
 * Concede uma recompensa única de boas-vindas ao personagem na
 * primeira vez que ele é visto pelo SessionManager, SEM depender
 * do GameClock — reage a session.started, não a world.tick.
 *
 * IMPORTANTE — respeita USE_ENGINE_XP:
 * Enquanto USE_ENGINE_XP=false, o applyPing() já concede o primeiro XP
 * instantaneamente por conta própria — este sistema fica inativo para
 * não duplicar a concessão.
 *
 * Os eventos de gameplay emitidos (xp.granted, level.up) não carregam
 * channelId — progressão pertence ao Character, nunca à sessão ou
 * canal onde a presença foi detectada. O channelId do evento
 * session.started que originou esta concessão é usado apenas
 * internamente (para a checagem de isChannelLive), nunca repassado
 * para os eventos de gameplay emitidos.
 */
import { XP_PER_PING } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  CharacterRepository,
  SessionStartedEvent,
  XPGrantedEvent,
  LevelUpEvent,
} from "../engine/types.js";
import { isChannelLive } from "../services/twitch.service.js";
import { env } from "../config/env.js";

// Mantém paridade com o comportamento atual do applyPing():
// primeiro ping de um personagem novo concede XP_PER_PING (10) imediatamente.
const WELCOME_XP = XP_PER_PING;

export class WelcomeRewardSystem {
  constructor(private repo: CharacterRepository) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;
    return bus.subscribe("session.started", async (event) => {
      if (!env.useEngineXp) return;

      const { characterId, channelId, timestamp } = event as SessionStartedEvent;
      try {
        const alreadyRewarded = await repo.hasReceivedWelcomeReward(characterId);
        if (alreadyRewarded) return;

        const live = await isChannelLive(channelId);
        if (!live) return;

        const result = await repo.applyXP(characterId, WELCOME_XP, timestamp);
        await repo.markWelcomeRewardGranted(characterId, timestamp);

        console.log(
          `[WelcomeRewardSystem] Character: ${characterId} | Welcome Reward: +${WELCOME_XP} XP`,
        );

        const xpGranted: XPGrantedEvent = {
          type: "xp.granted",
          characterId,
          amount: WELCOME_XP,
          newTotalXp: result.newTotalXp,
          newLevel: result.newLevel,
          leveledUp: result.leveledUp,
          timestamp,
        };
        bus.emit(xpGranted);

        if (result.leveledUp) {
          const levelUp: LevelUpEvent = {
            type: "level.up",
            characterId,
            oldLevel: result.oldLevel,
            newLevel: result.newLevel,
            timestamp,
          };
          bus.emit(levelUp);
        }
      } catch (err) {
        console.error(`[WelcomeRewardSystem] Erro sessão ${characterId}:`, err);
      }
    });
  }
}
