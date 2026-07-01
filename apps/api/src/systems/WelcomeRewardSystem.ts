/**
 * WelcomeRewardSystem — M-008 (complementar)
 *
 * Concede uma recompensa única de boas-vindas ao personagem na
 * primeira vez que ele é visto pelo SessionManager, SEM depender
 * do GameClock — reage a session.started, não a world.tick.
 *
 * Isso preserva o GameClock como única fonte oficial de tempo do
 * mundo: esta recompensa é independente do relógio, não gera tick
 * adicional, e não afeta a cadência sincronizada de XP por tick.
 *
 * A unicidade da concessão é garantida pela coluna first_join_reward_at
 * no banco (via CharacterRepository), não pelo evento em si — o mesmo
 * personagem pode disparar session.started várias vezes na vida
 * (ex: reconexão após timeout de sessão) sem receber a recompensa de novo.
 *
 * Desenhado para crescer: hoje concede só XP, mas a estrutura permite
 * adicionar ouro, itens ou mensagens no futuro sem alterar o GameClock,
 * o XPSystem ou a GameEngine.
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

// Mantém paridade com o comportamento atual do applyPing():
// primeiro ping de um personagem novo concede XP_PER_PING (10) imediatamente.
const WELCOME_XP = XP_PER_PING;

export class WelcomeRewardSystem {
  constructor(private repo: CharacterRepository) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;
    return bus.subscribe("session.started", async (event) => {
      const { characterId, channelId, timestamp } = event as SessionStartedEvent;
      try {
        const alreadyRewarded = await repo.hasReceivedWelcomeReward(characterId);
        if (alreadyRewarded) return;

        const live = await isChannelLive(channelId);
        if (!live) return;

        const result = await repo.applyXP(characterId, WELCOME_XP, timestamp);
        await repo.markWelcomeRewardGranted(characterId, timestamp);

        console.log(
          `[WelcomeRewardSystem] Character: ${characterId} | Welcome Reward: +${WELCOME_XP} XP | Channel: ${channelId}`,
        );

        const xpGranted: XPGrantedEvent = {
          type: "xp.granted",
          characterId,
          channelId,
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
            channelId,
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
