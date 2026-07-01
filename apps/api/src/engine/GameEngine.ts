/**
 * GameEngine — M-005
 *
 * O coração do mundo do StreamRPG.
 *
 * A GameEngine conecta o GameClock, o EventBus e o SessionManager
 * num ciclo contínuo: a cada tick do clock, ela consulta as sessões
 * ativas e emite um WorldTickEvent no EventBus.
 *
 * Sistemas que quiserem processar o tick do mundo se inscrevem no
 * EventBus — a Engine nunca os conhece diretamente.
 *
 * A GameEngine NÃO conhece:
 * - Regras de jogo (XP, drops, boss, economia)
 * - Banco de dados, Twitch, frontend ou Railway
 * - XPSystem, DropSystem ou qualquer sistema específico
 * - Repositories ou configurações de gameplay
 *
 * Ela apenas responde a uma pergunta: "o mundo avançou um tick?"
 * E para cada tick: "quem estava presente?"
 *
 * DECISÕES DE PROJETO:
 *
 * 1. GAMECONTEXT via interface
 *    A Engine recebe um GameContext (definido em types.ts) em vez de
 *    depender do SessionManager diretamente. Isso garante que a Engine
 *    permanece testável com qualquer implementação de contexto,
 *    incluindo implementações em memória para testes.
 *
 * 2. EVENTBUS injetado
 *    O EventBus é injetado no construtor — não instanciado internamente.
 *    Quem cria a Engine controla o EventBus e pode registrar sistemas
 *    antes de chamar start().
 *
 * 3. GAMECLOCK interno
 *    O GameClock é criado internamente pela Engine.
 *    O intervalo é configurável via construtor.
 *    Isso mantém o controle do tempo encapsulado na Engine.
 *
 * 4. API MÍNIMA
 *    A Engine expõe apenas start(), stop() e isRunning().
 *    Nada mais precisa ser público neste momento.
 *
 * TODO: quando GameConfig/EngineConfig existir, o tickIntervalMs
 * deve vir de lá, não ser passado diretamente no construtor.
 */

import { GameClock } from "./GameClock.js";
import { EventBus } from "./EventBus.js";
import type { GameContext, WorldTickEvent } from "./types.js";

export class GameEngine {
  private readonly clock: GameClock;
  private readonly bus: EventBus;
  private readonly context: GameContext;

  constructor(
    bus: EventBus,
    context: GameContext,
    tickIntervalMs = 60_000,
  ) {
    this.bus = bus;
    this.context = context;
    this.clock = new GameClock(tickIntervalMs);

    this.clock.onTick((tick) => {
      const sessions = this.context.getActiveSessions();

      const event: WorldTickEvent = {
        type: "world.tick",
        tickNumber: tick.tickNumber,
        timestamp: tick.timestamp,
        sessions,
      };

      this.bus.emit(event);
    });
  }

  /**
   * Inicia a Engine.
   * O GameClock começa a gerar ticks no intervalo configurado.
   * Se já estiver rodando, a chamada é ignorada silenciosamente.
   */
  start(): void {
    this.clock.start();
  }

  /**
   * Para a Engine.
   * O GameClock para de gerar ticks.
   * Sistemas inscritos no EventBus continuam inscritos.
   */
  stop(): void {
    this.clock.stop();
  }

  /**
   * Retorna true se a Engine está rodando.
   */
  isRunning(): boolean {
    return this.clock.isRunning();
  }
}
