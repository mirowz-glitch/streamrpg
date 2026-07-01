/**
 * WelcomeRewardSystem — M-008 (parte da migração de XP)
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
 * IMPORTANTE — respeita USE_ENGINE_XP:
 * Este sistema só existe para preservar a equivalência de comportamento
 * entre o applyPing() antigo e a Engine nova. Enquanto USE_ENGINE_XP=false,
 * o applyPing() já concede o primeiro XP instantaneamente por conta própria
 * (via last_ping_at IS NULL) — se o WelcomeRewardSystem também agisse nesse
 * momento, o personagem receberia XP em dobro no primeiro ping.
 * Por isso, com a flag false, este sistema ignora session.started
 * completamente, sem logar nem tocar no banco. Só passa a agir quando
 * USE_ENGINE_XP=true, quando o applyPing() para de conceder XP.
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
      // Enquanto a Engine não assumiu o XP, o applyPing() já cuida do
      // primeiro XP instantâneo. Este sistema fica inativo para não
      // duplicar a concessão.
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
