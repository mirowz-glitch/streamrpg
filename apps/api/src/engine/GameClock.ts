
/**
 * GameClock
 *
 * Responsabilidade única: gerar ticks em intervalos configuráveis.
 *
 * O GameClock é a fonte canônica de tempo da Engine.
 * Ele não conhece GameEngine, EventBus, SessionManager, Twitch,
 * banco de dados, frontend ou qualquer outra parte do sistema.
 *
 * Toda a lógica que depende de tempo dentro do jogo deve derivar
 * dos ticks emitidos pelo GameClock — nunca de Date.now() ou
 * setInterval() chamados diretamente em outros módulos.
 *
 * Decisões de projeto:
 *
 * 1. CALLBACKS em vez de EventEmitter
 *    O GameClock aceita callbacks simples via onTick().
 *    Não usa EventEmitter do Node para evitar dependência de infraestrutura
 *    e manter o núcleo portável e testável sem mocks.
 *
 * 2. TICK NUMBER incremental
 *    Cada tick carrega um número sequencial começando em 1.
 *    Sistemas podem usar esse número para cadências (ex: "executar a cada 5 ticks").
 *    Isso elimina a necessidade de um Scheduler separado para casos simples.
 *
 * 3. TIMESTAMP canônico
 *    O tick carrega o timestamp do momento exato em que foi gerado.
 *    Nenhum sistema deve chamar Date.now() diretamente — deve usar
 *    o timestamp fornecido pelo tick para garantir consistência temporal.
 *
 * 4. START/STOP explícitos
 *    O clock não inicia automaticamente na construção.
 *    Quem controla o ciclo de vida é quem cria o clock (ex: server.ts).
 *    Isso facilita testes e evita ticks indesejados em inicialização.
 *
 * 5. PROTEÇÃO contra double-start
 *    Chamar start() duas vezes não cria dois intervalos.
 *    O clock ignora a segunda chamada silenciosamente.
 *
 * 6. INTERVALO configurável
 *    O intervalo padrão é 60.000ms (1 minuto), mas pode ser sobrescrito
 *    na construção. Isso permite testes com intervalos de milissegundos.
 *
 * TODO: quando GameConfig existir, o intervalMs deve vir de EngineConfig,
 * não ser passado diretamente no construtor.
 */

export interface Tick {
  /** Número sequencial do tick, começando em 1. */
  tickNumber: number;

  /**
   * Timestamp canônico do momento em que o tick foi gerado.
   * Sistemas devem usar este valor em vez de Date.now()
   * para garantir consistência temporal dentro do mesmo tick.
   */
  timestamp: number;

  /**
   * Intervalo configurado do clock, em milissegundos.
   * Útil para sistemas que precisam saber a cadência do mundo.
   */
  intervalMs: number;
}

export type TickCallback = (tick: Tick) => void;

export class GameClock {
  private readonly intervalMs: number;
  private tickNumber = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private callbacks: TickCallback[] = [];

  constructor(intervalMs = 60_000) {
    if (intervalMs <= 0) {
      throw new Error("GameClock: intervalMs must be greater than 0");
    }
    this.intervalMs = intervalMs;
  }

  /**
   * Registra um callback que será chamado a cada tick.
   * Pode ser chamado antes ou depois de start().
   * Múltiplos callbacks podem ser registrados.
   *
   * Retorna uma função de cancelamento (unsubscribe).
   */
  onTick(callback: TickCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Inicia o clock.
   * Se já estiver rodando, a chamada é ignorada silenciosamente.
   */
  start(): void {
    if (this.timer !== null) return;

    this.timer = setInterval(() => {
      this.emitTick();
    }, this.intervalMs);
  }

  /**
   * Para o clock e limpa o intervalo.
   * Após stop(), o tickNumber não é resetado.
   * O clock pode ser reiniciado com start().
   */
  stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Retorna true se o clock está rodando.
   */
  isRunning(): boolean {
    return this.timer !== null;
  }

  /**
   * Retorna o número do último tick emitido.
   * 0 significa que nenhum tick foi emitido ainda.
   */
  getCurrentTick(): number {
    return this.tickNumber;
  }

  /**
   * Emite um tick imediatamente, fora do intervalo normal.
   * Útil para testes e para forçar um tick inicial se necessário.
   * Não interfere no intervalo em andamento.
   */
  forceTickNow(): void {
    this.emitTick();
  }

  private emitTick(): void {
    this.tickNumber += 1;
    const tick: Tick = {
      tickNumber: this.tickNumber,
      timestamp: Date.now(),
      intervalMs: this.intervalMs,
    };
    for (const callback of this.callbacks) {
      try {
        callback(tick);
      } catch (err) {
        // Um callback com erro não deve derrubar os outros
        // nem travar o clock. Erros são logados mas não propagados.
        console.error(
          `GameClock: erro no callback do tick ${tick.tickNumber}:`,
          err,
        );
      }
    }
  }
}
