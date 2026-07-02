/**
 * PlaytestMetrics — instrumentação temporária de playtest.
 *
 * Contador em memória, sem persistência, sem tabela, sem EventBus.
 * Existe só porque Gold e o resultado de isChannelLive() não passam por
 * nenhum evento hoje (decisão já registrada: emissão de Gold via evento
 * é uma decisão da Economia 1.0, não implementada agora) — sem essa
 * ponte mínima, o Tick Summary não teria como incluir os dois.
 *
 * Não decide nada, não concede nada, não é regra de jogo. Zerado a cada
 * tick pelo DebugEventSubscriber via snapshotAndReset(). Se este arquivo
 * for removido, as duas chamadas que o alimentam (xp.service.ts,
 * twitch.service.ts) também precisam ser removidas — não é 100%
 * invisível para quem chama, mas é uma única linha de contagem trivial
 * em cada lugar, sem nenhuma decisão de jogo envolvida.
 *
 * Vida útil esperada: até a leitura de logs crus deixar de ser a
 * principal ferramenta de playtest (ver docs/technical-design/
 * operations-panel.md).
 */

let goldGrantedThisTick = 0;
let liveOnlineCount = 0;
let liveOfflineCount = 0;

export function recordGoldGranted(amount: number): void {
  goldGrantedThisTick += amount;
}

export function recordLiveCheck(live: boolean): void {
  if (live) {
    liveOnlineCount += 1;
  } else {
    liveOfflineCount += 1;
  }
}

export interface PlaytestMetricsSnapshot {
  goldGranted: number;
  liveOnline: number;
  liveOffline: number;
}

/**
 * Lê os contadores acumulados desde o último snapshot e zera para o
 * próximo tick. Chamado uma única vez por tick, pelo DebugEventSubscriber.
 */
export function snapshotAndReset(): PlaytestMetricsSnapshot {
  const snapshot: PlaytestMetricsSnapshot = {
    goldGranted: Math.round(goldGrantedThisTick * 100) / 100,
    liveOnline: liveOnlineCount,
    liveOffline: liveOfflineCount,
  };
  goldGrantedThisTick = 0;
  liveOnlineCount = 0;
  liveOfflineCount = 0;
  return snapshot;
}
