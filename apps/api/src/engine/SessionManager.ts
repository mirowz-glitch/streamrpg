import type { ActiveSession } from "./types.js";

/**
 * SessionManager
 *
 * Responsabilidade única: manter o registro de quais personagens
 * estão ativos em quais canais, e quando foram vistos pela última vez.
 *
 * Esta classe não conhece XP, drops, banco de dados, Twitch ou frontend.
 * Ela apenas responde: "quem está ativo agora?"
 *
 * Sprint 1: integrada ao ping existente sem alterar nenhum comportamento de jogo.
 * Futuramente: alimentada por ChatPresenceProvider, ExtensionPresenceProvider, etc.
 */

// TODO: migrar para GameConfig/GameRules quando essa camada for criada.
// Valor atual: 1.5x o intervalo de ping (60s), garantindo tolerância a
// um ping atrasado antes de expirar a sessão.
const SESSION_TIMEOUT_MS = 90_000;

export class SessionManager {
  private sessions = new Map<string, ActiveSession>();

  private sessionKey(characterId: string, channelId: string): string {
    return `${characterId}:${channelId}`;
  }

  /**
   * Registra que um personagem está presente num canal agora.
   *
   * IMPORTANTE: este método APENAS registra presença. Ele nunca executa
   * lógica de jogo, nunca concede XP, nunca rola drops e nunca acessa
   * o banco de dados. Toda lógica de jogo é responsabilidade da GameEngine
   * e dos sistemas registrados no EventBus.
   *
   * Chamado atualmente pelo ping do frontend (WebsitePresenceProvider).
   * No futuro, pode ser chamado por qualquer PresenceProvider sem que
   * nenhuma outra parte do sistema precise mudar.
   */
  reportPresent(
    characterId: string,
    channelId: string,
    provider = "website",
  ): void {
    const key = this.sessionKey(characterId, channelId);
    this.sessions.set(key, {
      characterId,
      channelId,
      lastSeenAt: Date.now(),
      provider,
    });
  }

  /**
   * Retorna cópias das sessões ativas no momento.
   *
   * Retorna cópias shallow dos objetos de sessão para garantir que
   * nenhum consumidor externo possa mutar o estado interno do SessionManager.
   * Uma sessão é considerada ativa se foi vista nos últimos SESSION_TIMEOUT_MS.
   * Remove sessões expiradas como efeito colateral (lazy cleanup).
   */
  getActiveSessions(): ActiveSession[] {
    const now = Date.now();
    const active: ActiveSession[] = [];

    for (const [key, session] of this.sessions.entries()) {
      if (now - session.lastSeenAt > SESSION_TIMEOUT_MS) {
        this.sessions.delete(key);
      } else {
        active.push({ ...session });
      }
    }

    return active;
  }

  /**
   * Retorna o número total de sessões ativas.
   * Útil para métricas e health checks.
   */
  getActiveCount(): number {
    return this.getActiveSessions().length;
  }

  /**
   * Remove todas as sessões.
   * Útil para testes e reset de estado.
   */
  clear(): void {
    this.sessions.clear();
  }
}

/**
 * Singleton do SessionManager.
 *
 * DECISÃO TEMPORÁRIA: este singleton funciona corretamente apenas em
 * ambientes de processo único (modelo atual do Railway com 1 réplica).
 * Se o projeto escalar para múltiplas réplicas ou workers, esta instância
 * precisará ser substituída por uma implementação distribuída
 * (ex: Redis-backed SessionManager) sem alterar a interface pública.
 *
 * Enquanto o projeto rodar em processo único, este singleton é suficiente
 * e correto.
 */
export const sessionManager = new SessionManager();
