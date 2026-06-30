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

export interface ActiveSession {
  characterId: string;
  channelId: string;
  lastSeenAt: number;
  provider: string;
}

const SESSION_TIMEOUT_MS = 90_000; // 1.5x o intervalo de ping (60s)

export class SessionManager {
  private sessions = new Map<string, ActiveSession>();

  private sessionKey(characterId: string, channelId: string): string {
    return `${characterId}:${channelId}`;
  }

  /**
   * Registra que um personagem está presente num canal agora.
   * Chamado pelo ping do frontend (WebsitePresenceProvider).
   * No futuro, pode ser chamado por qualquer PresenceProvider.
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
   * Retorna todas as sessões ativas no momento.
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
        active.push(session);
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
   * Útil para testes.
   */
  clear(): void {
    this.sessions.clear();
  }
}

// Singleton — uma única instância compartilhada pelo processo
export const sessionManager = new SessionManager();
