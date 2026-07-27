// Idle Loop Implementation Phase I — implementa docs/design/
// idle-experience-redesign.md Seção 4/13 (Sprint 1). Motor de tempo
// puro que decide SÓ "já passou tempo suficiente pra chamar advance()
// de novo?" — nunca sabe o que advance() faz (combate/loot/XP/etc, tudo
// intocado). Mesma separação que AnimationController (animation/
// controller.ts) já usa entre "quando apresentar" e "o quê apresentar":
// aqui é "quando avançar", nunca "o quê avançar".
export type IdleDriverStatus = "running" | "paused" | "stopped";

export interface IdleDriverConfig {
  intervalMs: number;
}

export class IdleDriver {
  private status: IdleDriverStatus = "running";
  private lastTickAt: number | null = null;

  constructor(private readonly config: IdleDriverConfig) {}

  getStatus(): IdleDriverStatus {
    return this.status;
  }

  // Reinicia a contagem de intervalo pra permitir um tick imediato na
  // próxima checagem — usado tanto na primeira montagem (explorar desde
  // a chegada, sem espera inicial) quanto depois de um Reiniciar
  // pós-morte (nova sessão, nenhuma razão pra esperar o intervalo
  // inteiro antes do primeiro avanço da nova campanha).
  start(): void {
    this.status = "running";
    this.lastTickAt = null;
  }

  pause(): void {
    if (this.status === "running") this.status = "paused";
  }

  // Mesmo raciocínio de start(): retomar de uma pausa também libera um
  // tick imediato, em vez de forçar o jogador a esperar o intervalo
  // inteiro de novo só porque pausou.
  resume(): void {
    if (this.status !== "paused") return;
    this.status = "running";
    this.lastTickAt = null;
  }

  // Terminal até um novo start() (ex.: sessão derrotada — ver Seção 4
  // do documento de design, "Derrota" sempre leva a um estado que não
  // avança sozinho até o jogador reiniciar).
  stop(): void {
    this.status = "stopped";
  }

  // Puro e determinístico — `now` sempre vem de fora (mesmo padrão do
  // AnimationController.tick()), nunca lê relógio sozinho. `blocked`
  // é decidido inteiramente por quem chama (ex.: ainda existe animação
  // tocando) — o driver não sabe o motivo, só respeita o sinal.
  shouldTick(now: number, blocked: boolean): boolean {
    if (this.status !== "running") return false;
    if (blocked) return false;
    if (this.lastTickAt === null || now - this.lastTickAt >= this.config.intervalMs) {
      this.lastTickAt = now;
      return true;
    }
    return false;
  }

  // Global Idle System Phase I — "tempo até o próximo avanço" (Fase 4
  // do documento de design: um dos campos de Estado Global que qualquer
  // tela deve poder ler). `null` quando não aplicável (pausado/parado —
  // não existe "próximo avanço" nesse caso), `0` quando o próximo
  // `shouldTick()` já vai disparar (inclui o caso `lastTickAt === null`,
  // ainda não houve nenhum tick).
  msUntilNextTick(now: number): number | null {
    if (this.status !== "running") return null;
    if (this.lastTickAt === null) return 0;
    return Math.max(0, this.config.intervalMs - (now - this.lastTickAt));
  }
}
