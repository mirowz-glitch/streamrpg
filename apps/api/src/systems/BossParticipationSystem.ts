/**
 * BossParticipationSystem — Sprint B2 (Participação)
 *
 * Reage a world.tick. Responsabilidade única: para cada personagem
 * presente (via event.sessions, o mesmo snapshot que o SessionManager já
 * fornece a todo tick) num canal com Boss "active", registra uma presença
 * em BossParticipationRepository.
 *
 * Não define "jogador ativo" de nenhuma forma própria — usa
 * exclusivamente characterId/channelId de ActiveSession, a mesma
 * definição de presença que XPSystemV2 e BossSpawnSystem já usam.
 * Reconexão, múltiplas sessões e timeout de presença são inteiramente
 * responsabilidade do SessionManager (dedup por characterId:channelId,
 * expiração de 90s) — este System não sabe nem precisa saber como isso
 * é decidido, só consome o resultado.
 *
 * Escopo estrito desta Sprint: presença, nada além disso. Sem dano, sem
 * HP, sem recompensa, sem timeout de luta, sem fuga — isso é B3/B4.
 * Nenhum evento novo é emitido: presença por tick é acumulação interna,
 * não uma transição de estado observável por outro System (mesmo
 * raciocínio já usado para "dano por tick" no design técnico do Combate).
 */
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossParticipationRepository,
  BossRepository,
  WorldTickEvent,
} from "../engine/types.js";

export class BossParticipationSystem {
  constructor(
    private bossRepo: BossRepository,
    private participationRepo: BossParticipationRepository,
  ) {}

  register(bus: EventBus): () => void {
    const bossRepo = this.bossRepo;
    const participationRepo = this.participationRepo;

    return bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      if (sessions.length === 0) return;

      // Um findActiveOrAwaiting() por canal único, não por sessão —
      // evita repetir a mesma consulta pra cada personagem que
      // compartilha um canal.
      const channelIds = Array.from(new Set(sessions.map((s) => s.channelId)));
      const activeBossByChannel = new Map<string, string>(); // channelId -> bossId

      for (const channelId of channelIds) {
        try {
          const boss = await bossRepo.findActiveOrAwaiting(channelId);
          if (boss && boss.status === "active") {
            activeBossByChannel.set(channelId, boss.id);
          }
        } catch (err) {
          console.error(`[BossParticipationSystem] Erro ao consultar Boss do canal ${channelId}:`, err);
        }
      }

      if (activeBossByChannel.size === 0) return; // nenhum canal com luta em andamento

      for (const session of sessions) {
        const bossId = activeBossByChannel.get(session.channelId);
        if (!bossId) continue; // canal sem Boss ativo

        try {
          await participationRepo.recordPresence(bossId, session.characterId, timestamp);
        } catch (err) {
          console.error(
            `[BossParticipationSystem] Erro ao registrar presença — boss ${bossId}, personagem ${session.characterId}:`,
            err,
          );
        }
      }
    });
  }
}
