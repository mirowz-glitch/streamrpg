/**
 * BossCombatSystem — Sprint B3 (Combate)
 *
 * Reage a world.tick. Responsabilidade única: fazer Bosses "active"
 * avançarem — aplicar dano coletivo, verificar HP, verificar duração, e
 * emitir boss.defeated/boss.escaped quando a luta termina.
 *
 * Decisão da B2 resolvida aqui: esta é uma classe própria, separada de
 * BossParticipationSystem — não a estende. Motivo: responsabilidades
 * diferentes (participação é presença acumulada; combate é HP e fim de
 * luta), mesmo padrão de Systems estreitos já usado no resto da Engine.
 * As duas reagem independentemente ao mesmo world.tick, cada uma
 * derivando "quem está presente" de event.sessions por conta própria —
 * nenhuma lê o estado da outra (Princípio 4: Systems nunca chamam
 * Systems).
 *
 * Fórmula de dano: temporária e deliberadamente simples. `Dano Base ×
 * Equipamentos × Classe × Critical` (capítulo 6) não pode ser
 * implementada de verdade ainda — Equipamentos e Classe não existem como
 * valor numérico (capítulo 3/4, ainda placeholder). Esta Sprint usa só
 * dano fixo por personagem presente por tick. Sem crítico: o capítulo 6
 * já decidiu que crítico existe no MVP, mas incluir RNG aqui adicionaria
 * complexidade que a fórmula "temporária e simples" pedida para esta
 * Sprint não precisa — fica para quando a fórmula real (com
 * Equipamentos/Classe) for implementada.
 *
 * Fora do escopo desta Sprint, por decisão explícita: recompensas, UI,
 * ataques do Boss, dano em personagens, Modifiers, Economia 1.0,
 * Frontend Event Bridge.
 */
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossDefeatedEvent,
  BossEscapedEvent,
  BossRepository,
  BossSnapshot,
  WorldTickEvent,
} from "../engine/types.js";

// Ilustrativo, não calibrado — mesma convenção dos placeholders da B1/B2.
// Com max_hp=500 (tier 1, B1) e 1 personagem presente, ~10 ticks para
// derrotar — compatível com a duração de luta ilustrativa (10min/~10 ticks).
const DAMAGE_PER_CHARACTER_PER_TICK = 50;

export class BossCombatSystem {
  constructor(private repo: BossRepository) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;

    return bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      const now = Math.floor(timestamp / 1000);

      const activeBosses = await repo.findAllActive().catch((err) => {
        console.error("[BossCombatSystem] Erro ao buscar Bosses ativos:", err);
        return [];
      });
      if (activeBosses.length === 0) return;

      const presentCountByChannel = new Map<string, number>();
      for (const session of sessions) {
        presentCountByChannel.set(
          session.channelId,
          (presentCountByChannel.get(session.channelId) ?? 0) + 1,
        );
      }

      for (const boss of activeBosses) {
        try {
          await this.advance(boss, presentCountByChannel.get(boss.channelId) ?? 0, now, timestamp, bus);
        } catch (err) {
          console.error(`[BossCombatSystem] Erro ao processar Boss ${boss.id}:`, err);
        }
      }
    });
  }

  private async advance(
    boss: BossSnapshot,
    presentCount: number,
    now: number,
    timestamp: number,
    bus: EventBus,
  ): Promise<void> {
    const repo = this.repo;

    let current: BossSnapshot = boss;

    if (presentCount > 0) {
      const damage = presentCount * DAMAGE_PER_CHARACTER_PER_TICK;
      current = await repo.applyDamage(boss.id, damage);
      console.log(`[BossCombatSystem] Boss ${boss.id} | Dano: ${damage} (${presentCount} presentes) | HP restante: ${current.currentHp}`);
    }

    // Derrota tem prioridade sobre fuga: um golpe que zera o HP no mesmo
    // tick em que a duração expira ainda conta como vitória, não fuga.
    if (current.currentHp <= 0) {
      const resolved = await repo.resolve(boss.id, "defeated", now);
      console.log(`[BossCombatSystem] Boss ${resolved.id} | DERROTADO`);
      const defeated: BossDefeatedEvent = {
        type: "boss.defeated",
        channelId: resolved.channelId,
        bossId: resolved.id,
        timestamp,
      };
      bus.emit(defeated);
      return;
    }

    if (boss.endsAt !== null && now >= boss.endsAt) {
      const resolved = await repo.resolve(boss.id, "escaped", now);
      console.log(`[BossCombatSystem] Boss ${resolved.id} | FUGIU`);
      const escaped: BossEscapedEvent = {
        type: "boss.escaped",
        channelId: resolved.channelId,
        bossId: resolved.id,
        timestamp,
      };
      bus.emit(escaped);
    }
  }
}
