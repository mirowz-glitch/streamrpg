import type { CombatAnimation } from "./types.js";

export interface AnimationSnapshot {
  queued: CombatAnimation[];
  active: CombatAnimation[];
}

export interface AnimationTickResult {
  started: CombatAnimation[];
  finished: CombatAnimation[];
}

// Requisito 2 — Animation Controller: "iniciar/finalizar/cancelar
// animação, limpar fila. Nunca conhecer regras de combate." Esta
// classe só entende timestamp/duration/priority — nenhum campo de
// `payload` é lido aqui, nenhuma referência a Combat Engine/Enemy
// System/etc. "Nenhum componente poderá consultar diretamente o
// Combat Engine" — o Controller é o único intermediário entre a fila
// (dados já prontos, handlers.ts) e os componentes React.
export class AnimationController {
  private queued: CombatAnimation[] = [];
  private active: CombatAnimation[] = [];

  // Requisito 1 — enfileira animações já prontas (produzidas por
  // buildAnimationsForTick()); mantém a fila ordenada por timestamp,
  // com `priority` como desempate — "a fila nunca poderá modificar
  // gameplay, ela apenas agenda apresentação".
  enqueue(animations: readonly CombatAnimation[]): void {
    this.queued.push(...animations);
    this.queued.sort((a, b) => a.timestamp - b.timestamp || b.priority - a.priority);
  }

  // Requisito 2 — processa a fila pra um instante `now`: promove pra
  // "ativo" tudo cujo timestamp já chegou, e remove de "ativo" tudo
  // cuja duração já terminou. Puro — nunca lê relógio sozinho, `now`
  // sempre vem de fora (determinístico, testável sem esperar tempo
  // real passar).
  tick(now: number): AnimationTickResult {
    const started: CombatAnimation[] = [];
    const stillQueued: CombatAnimation[] = [];
    for (const animation of this.queued) {
      if (animation.timestamp <= now) {
        started.push(animation);
        this.active.push(animation);
      } else {
        stillQueued.push(animation);
      }
    }
    this.queued = stillQueued;

    const finished: CombatAnimation[] = [];
    const stillActive: CombatAnimation[] = [];
    for (const animation of this.active) {
      if (animation.timestamp + animation.duration <= now) {
        finished.push(animation);
      } else {
        stillActive.push(animation);
      }
    }
    this.active = stillActive;

    return { started, finished };
  }

  // Requisito 2/11 — "cancelável": remove uma animação específica da
  // fila ou de ativas, em qualquer estado. Devolve `false` sem efeito
  // nenhum se o id não existir (nunca lança).
  cancel(id: string): boolean {
    const queuedIndex = this.queued.findIndex((animation) => animation.id === id);
    if (queuedIndex !== -1) {
      this.queued.splice(queuedIndex, 1);
      return true;
    }
    const activeIndex = this.active.findIndex((animation) => animation.id === id);
    if (activeIndex !== -1) {
      this.active.splice(activeIndex, 1);
      return true;
    }
    return false;
  }

  // Requisito 2 — "limpar fila": esvazia tudo de uma vez (ex.: ao
  // reiniciar a Adventure Session).
  clear(): void {
    this.queued = [];
    this.active = [];
  }

  getSnapshot(): AnimationSnapshot {
    return { queued: [...this.queued], active: [...this.active] };
  }
}
