/**
 * WorldPresenceSystem — World Autonomy Phase II (Vision 2.0, Sprint 9,
 * Fase 3 — World Tick)
 *
 * A GameEngine já roda um ciclo real e periódico (GameClock, 60s por
 * padrão) e emite "world.tick" no EventBus a cada volta — SEMPRE, desde
 * `engine.start()`, independente de qualquer Jogador estar presente
 * (ver engine/GameEngine.ts). Este System é o primeiro consumidor a
 * transformar esse tick já existente em estado real do Mundo: em vez de
 * inventar um segundo `setInterval` paralelo (o que duplicaria o
 * mecanismo e arriscaria dessincronizar), reaproveita exatamente esse
 * ponto de extensão — mesmo padrão de WorldEventSubscriber/
 * KingdomNewsSystem, que também só observam eventos que já existem.
 *
 * "Regiões ativas" usa um sinal real e já persistido: expedições não
 * concluídas (`expeditions.status != 'completed'`) dos personagens com
 * sessão ativa agora (WorldTickEvent.sessions) — nunca canal/viewer/live.
 * Sem nenhum Jogador presente, a lista fica vazia e toda região vira
 * "dormant" — o mundo continua existindo (dia/horário/clima avançam
 * normalmente), só ninguém está fisicamente em nenhuma região agora.
 */
import { allRegionIds, deriveWorldPresence } from "@streamrpg/shared";
import type { WorldPresence } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type { WorldTickEvent } from "../engine/types.js";
import { getDb } from "../config/database.js";

let cachedWorldPresence: WorldPresence | null = null;

function getActiveRegionIds(characterIds: string[]): string[] {
  if (characterIds.length === 0) return [];
  const placeholders = characterIds.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT DISTINCT current_region_id FROM expeditions
       WHERE character_id IN (${placeholders}) AND status != 'completed'`,
    )
    .all(...characterIds) as { current_region_id: string }[];
  return rows.map((row) => row.current_region_id);
}

function computeWorldPresence(sessions: { characterId: string }[]): WorldPresence {
  const characterIds = [...new Set(sessions.map((session) => session.characterId))];
  return deriveWorldPresence({
    now: Date.now(),
    activeRegionIds: getActiveRegionIds(characterIds),
    allRegionIds: allRegionIds(),
  });
}

export class WorldPresenceSystem {
  register(bus: EventBus): () => void {
    return bus.subscribe("world.tick", (event) => {
      const { sessions } = event as WorldTickEvent;
      cachedWorldPresence = computeWorldPresence(sessions);
    });
  }
}

/**
 * Devolve o WorldPresence mais recente. Antes do primeiro "world.tick"
 * (servidor recém-iniciado), computa uma vez sob demanda — o Mundo já
 * existe mesmo antes do primeiro tick de 60s se completar, nunca
 * devolve null.
 */
export function getWorldPresence(): WorldPresence {
  if (cachedWorldPresence) return cachedWorldPresence;
  cachedWorldPresence = deriveWorldPresence({ now: Date.now(), activeRegionIds: [], allRegionIds: allRegionIds() });
  return cachedWorldPresence;
}
