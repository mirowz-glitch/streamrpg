/**
 * KingdomPrestigeSystem — Sprint Kingdom Prestige System
 *
 * Reage a world.tick: para cada canal com pelo menos um personagem
 * presente neste tick, recalcula os 6 cargos do Hall da Fama
 * (kingdom-prestige.service.ts, leitura pura sobre dados que já
 * existem) e emite kingdom.role_changed para cada troca real de
 * ocupante. Nunca concede XP/Gold/item, nunca altera Combat/Boss/
 * Expedição/Encounter — só observa o que esses sistemas já gravaram.
 *
 * Mesmo escopo de "só quem está presente agora" já usado pelo
 * IdentitySystem: um Reino sem ninguém presente neste tick não é
 * recalculado agora — ele se atualiza no próximo tick em que alguém
 * pingar ali. Evita varrer canais irrelevantes a cada tick.
 */
import type { EventBus } from "../engine/EventBus.js";
import type { KingdomRoleChangedEvent, WorldTickEvent } from "../engine/types.js";
import { evaluateAndUpdateRoles } from "../services/kingdom-prestige.service.js";

export class KingdomPrestigeSystem {
  register(bus: EventBus): () => void {
    const unsub = bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      const seenChannels = new Set<string>();
      for (const session of sessions) {
        if (seenChannels.has(session.channelId)) continue;
        seenChannels.add(session.channelId);
        try {
          const changes = evaluateAndUpdateRoles(session.channelId, timestamp);
          for (const change of changes) {
            const roleEvent: KingdomRoleChangedEvent = {
              type: "kingdom.role_changed",
              channelId: session.channelId,
              roleSlug: change.roleSlug,
              roleName: change.roleName,
              characterId: change.characterId,
              previousCharacterId: change.previousCharacterId,
              timestamp,
            };
            bus.emit(roleEvent);
          }
        } catch (err) {
          console.error(`[KingdomPrestigeSystem] Erro ao avaliar cargos do canal ${session.channelId}:`, err);
        }
      }
    });

    return unsub;
  }
}
