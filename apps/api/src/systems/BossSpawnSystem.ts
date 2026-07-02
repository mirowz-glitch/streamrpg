/**
 * BossSpawnSystem — Sprint B1 (Nascimento)
 *
 * Reage a world.tick. Decide quando um Boss nasce por canal (condição de
 * cooldown + atividade, capítulo 6/Nascimento da Game Design Bible) e
 * controla a transição awaiting → active, seja por invocação manual do
 * streamer (invoke(), chamado por uma rota HTTP futura — fora do escopo
 * desta Sprint) ou automaticamente ao expirar o timeout de invocação.
 *
 * Não processa combate — isso é responsabilidade do BossCombatSystem
 * (Sprint B2/B3). Ver docs/technical-design/boss-system.md para o design
 * completo e a máquina de estados (seção 9).
 *
 * Valores abaixo (cooldown, timeout de invocação, HP do tier 1) são
 * ilustrativos, copiados do capítulo 6 — não calibrados, marcados
 * explicitamente como placeholder até a Sprint B5 (Escala) existir.
 */
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossActivatedEvent,
  BossRepository,
  BossSnapshot,
  BossSpawnedEvent,
  WorldTickEvent,
} from "../engine/types.js";
import { isChannelLive } from "../services/twitch.service.js";
import { nowUnix } from "../config/database.js";

const BOSS_COOLDOWN_SECONDS = 3 * 60 * 60; // 3h, ilustrativo (capítulo 6)
const INVOCATION_TIMEOUT_SECONDS = 15 * 60; // 15min, ilustrativo (capítulo 6)
const FIGHT_DURATION_SECONDS = 10 * 60; // 10min, ilustrativo (capítulo 6) — usado só para calcular ends_at aqui; quem de fato encerra a luta por duração é o BossCombatSystem (Sprint B3)

// Placeholder até a Sprint B5 (Escala) existir de verdade — só tier 1 por
// enquanto, HP ilustrativo.
const TIER_MAX_HP: Record<number, number> = {
  1: 500,
};

export class BossSpawnSystem {
  private bus: EventBus | null = null;

  constructor(private repo: BossRepository) {}

  register(bus: EventBus): () => void {
    this.bus = bus;
    const repo = this.repo;

    return bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      const now = nowUnix();

      const channelIds = Array.from(new Set(sessions.map((s) => s.channelId)));

      for (const channelId of channelIds) {
        try {
          await this.trySpawn(channelId, now, timestamp);
        } catch (err) {
          console.error(`[BossSpawnSystem] Erro ao avaliar nascimento no canal ${channelId}:`, err);
        }
      }

      try {
        const due = await repo.findAwaitingPastDeadline(now);
        for (const boss of due) {
          await this.activateAndEmit(boss, "auto", timestamp);
        }
      } catch (err) {
        console.error("[BossSpawnSystem] Erro ao processar timeouts de invocação:", err);
      }
    });
  }

  private async trySpawn(channelId: string, now: number, timestamp: number): Promise<void> {
    const repo = this.repo;

    const existing = await repo.findActiveOrAwaiting(channelId);
    if (existing) return; // já existe Boss não-resolvido neste canal

    const lastResolved = await repo.findLastResolved(channelId);
    if (lastResolved?.resolvedAt && now - lastResolved.resolvedAt < BOSS_COOLDOWN_SECONDS) {
      return; // ainda em cooldown
    }

    const live = await isChannelLive(channelId);
    if (!live) return;

    const tier = 1; // placeholder — cálculo real de tier é a Sprint B5
    const maxHp = TIER_MAX_HP[tier];
    const invocationDeadline = now + INVOCATION_TIMEOUT_SECONDS;

    const boss = await repo.create(channelId, tier, maxHp, invocationDeadline);

    console.log(`[BossSpawnSystem] Channel: ${channelId} | Boss ${boss.id} nasceu | Tier: ${tier} | Aguardando invocação`);

    const spawned: BossSpawnedEvent = {
      type: "boss.spawned",
      channelId,
      bossId: boss.id,
      tier,
      invocationDeadline,
      timestamp,
    };
    this.bus?.emit(spawned);
  }

  private async activateAndEmit(
    boss: BossSnapshot,
    activatedBy: string,
    timestamp: number,
  ): Promise<void> {
    const endsAt = nowUnix() + FIGHT_DURATION_SECONDS;
    const activated = await this.repo.activate(boss.id, endsAt);

    console.log(`[BossSpawnSystem] Channel: ${activated.channelId} | Boss ${activated.id} ativado | Por: ${activatedBy}`);

    const event: BossActivatedEvent = {
      type: "boss.activated",
      channelId: activated.channelId,
      bossId: activated.id,
      activatedBy,
      endsAt,
      timestamp,
    };
    this.bus?.emit(event);
  }

  /**
   * Invocação manual — chamada por uma rota HTTP futura (fora do escopo
   * desta Sprint), análoga a como sessionManager.reportPresent() é
   * chamada hoje pela rota de ping. Só ativa um Boss que ainda está
   * "awaiting"; silenciosamente ignora se já foi ativado ou não existe
   * (mesmo padrão defensivo do resto da Engine — nunca lança para uma
   * ação de usuário que chegou tarde demais).
   */
  async invoke(bossId: string, activatedBy: string): Promise<void> {
    if (!this.bus) {
      throw new Error("BossSpawnSystem: invoke() chamado antes de register()");
    }
    // Recarrega o estado atual — não confia em um snapshot potencialmente
    // desatualizado vindo de fora.
    const boss = await this.repo.findById(bossId);
    if (!boss || boss.status !== "awaiting") return; // já ativado, ou não existe — nada a fazer

    await this.activateAndEmit(boss, activatedBy, Date.now());
  }
}
