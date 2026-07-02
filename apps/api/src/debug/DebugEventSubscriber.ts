/**
 * DebugEventSubscriber — observabilidade temporária de playtest.
 *
 * Registrado apenas por configuração (env.debugEventSubscriber), nunca
 * incondicionalmente — ver server.ts. Só observa eventos que já existem
 * no EventBus (xp.granted, drop.granted, world.tick) mais o pequeno
 * contador de PlaytestMetrics — não decide nada, não concede nada, não
 * altera nenhum comportamento de jogo. Nenhum System sabe que este
 * subscriber existe; remover este arquivo e a linha condicional de
 * registro em server.ts não muda nenhum comportamento.
 *
 * Session End é derivado por diff entre a lista de sessões do tick
 * atual e do tick anterior — não lê SessionManager diretamente, não
 * antecipa o momento exato da expiração (janela de até 1 tick de atraso
 * em relação aos 90s reais do SessionManager, aceitável para um debug
 * de playtest, não para decisão de jogo).
 *
 * Vida útil esperada: até a leitura de logs crus deixar de ser a
 * principal ferramenta de playtest (ver docs/technical-design/
 * operations-panel.md). Sem teste automatizado — é uma ferramenta de
 * observação, não uma regra de jogo.
 */
import type { EventBus } from "../engine/EventBus.js";
import type {
  DropGrantedEvent,
  WorldTickEvent,
  XPGrantedEvent,
} from "../engine/types.js";
import { snapshotAndReset } from "./PlaytestMetrics.js";

export class DebugEventSubscriber {
  private xpGrantedTotal = 0;
  private xpGrantedBySource: Record<string, number> = {};
  private dropSuccessCount = 0;
  private dropRarityTally: Record<string, number> = {};
  private lastSessionKeys = new Set<string>();

  register(bus: EventBus): () => void {
    const unsubXp = bus.subscribe("xp.granted", (event) => {
      const { source } = event as XPGrantedEvent;
      this.xpGrantedTotal += 1;
      this.xpGrantedBySource[source] = (this.xpGrantedBySource[source] ?? 0) + 1;
    });

    const unsubDrop = bus.subscribe("drop.granted", (event) => {
      const { itemRarity } = event as DropGrantedEvent;
      this.dropSuccessCount += 1;
      this.dropRarityTally[itemRarity] = (this.dropRarityTally[itemRarity] ?? 0) + 1;
    });

    const unsubTick = bus.subscribe("world.tick", (event) => {
      this.onTick(event as WorldTickEvent);
    });

    return () => {
      unsubXp();
      unsubDrop();
      unsubTick();
    };
  }

  private onTick(event: WorldTickEvent): void {
    const currentKeys = new Set(
      event.sessions.map((s) => `${s.characterId}:${s.channelId}`),
    );

    for (const key of this.lastSessionKeys) {
      if (!currentKeys.has(key)) {
        console.log(`[DebugEventSubscriber] Session End: ${key}`);
      }
    }
    this.lastSessionKeys = currentKeys;

    const metrics = snapshotAndReset();
    const dropAttempts = this.xpGrantedBySource["tick"] ?? 0; // DropSystem só rola em source=tick

    console.log(
      [
        `=== Tick ${event.tickNumber} ===`,
        `Sessões: ${event.sessions.length}`,
        `XP concedido: ${this.xpGrantedTotal}`,
        `Gold: ${metrics.goldGranted}`,
        `Drops: tentativas=${dropAttempts} sucessos=${this.dropSuccessCount} raridades=${JSON.stringify(this.dropRarityTally)}`,
        `Welcome: novos=${this.xpGrantedBySource["welcome"] ?? 0}`,
        `Live: online=${metrics.liveOnline} offline=${metrics.liveOffline}`,
        `================`,
      ].join("\n"),
    );

    this.xpGrantedTotal = 0;
    this.xpGrantedBySource = {};
    this.dropSuccessCount = 0;
    this.dropRarityTally = {};
  }
}
