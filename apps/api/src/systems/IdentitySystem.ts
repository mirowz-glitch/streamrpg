/**
 * IdentitySystem — Sprint Founder Identity & Prestige
 *
 * Reage a world.tick: para cada personagem presente, verifica se algum
 * Título/Moldura ainda não desbloqueado passou a satisfazer seu
 * critério (identity.service.ts, leitura pura sobre dados que já
 * existem). Nunca concede XP/Gold/item, nunca altera Combat/Boss/
 * Expedição/Encounter — só observa o que esses sistemas já gravaram.
 *
 * Mesmo padrão de "System reage a evento já existente, sem tocar em quem
 * o emitiu" já usado por ExpeditionSystem/WorldEventSubscriber.
 */
import type { EventBus } from "../engine/EventBus.js";
import type { IdentityFrameUnlockedEvent, IdentityTitleUnlockedEvent, WorldTickEvent } from "../engine/types.js";
import { evaluateAndGrantUnlocks } from "../services/identity.service.js";

export class IdentitySystem {
  register(bus: EventBus): () => void {
    const unsub = bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      const seenCharacters = new Set<string>();
      for (const session of sessions) {
        if (seenCharacters.has(session.characterId)) continue;
        seenCharacters.add(session.characterId);
        try {
          const { titles, frames } = evaluateAndGrantUnlocks(session.characterId, timestamp);
          for (const title of titles) {
            const titleEvent: IdentityTitleUnlockedEvent = {
              type: "identity.title_unlocked",
              characterId: session.characterId,
              titleId: title.titleId,
              titleName: title.name,
              timestamp,
            };
            bus.emit(titleEvent);
          }
          for (const frame of frames) {
            const frameEvent: IdentityFrameUnlockedEvent = {
              type: "identity.frame_unlocked",
              characterId: session.characterId,
              frameId: frame.titleId,
              frameName: frame.name,
              timestamp,
            };
            bus.emit(frameEvent);
          }
        } catch (err) {
          console.error(`[IdentitySystem] Erro ao avaliar desbloqueios para ${session.characterId}:`, err);
        }
      }
    });

    return unsub;
  }
}
