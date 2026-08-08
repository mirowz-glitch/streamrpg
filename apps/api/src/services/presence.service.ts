/**
 * Presence — Sprint Identity Core (Vision 2.0) + World Autonomy Phase I
 * (Vision 2.0, Sprint 7)
 *
 * Implementação concreta de `PresenceProvider` (engine/types.ts) para a
 * Twitch — a única integração de presença que existia até a Sprint
 * Identity Core. Futuras integrações (Kick, YouTube) implementariam a
 * mesma interface aqui do lado, nunca mudando a assinatura que os
 * Systems da Engine consomem.
 *
 * Nenhum comportamento muda no `twitchPresenceProvider`:
 * `isLive` chama exatamente a mesma `isChannelLive()` de sempre.
 */
import type { PresenceProvider } from "../engine/types.js";
import { isChannelLive } from "./twitch.service.js";
import { sessionManager } from "../engine/SessionManager.js";

export const twitchPresenceProvider: PresenceProvider = {
  isLive: isChannelLive,
};

/**
 * World Autonomy Phase I — a auditoria (Fase 1) encontrou o achado mais
 * severo desta Sprint: XPSystem/WelcomeRewardSystem/BossSpawnSystem
 * (apps/api/src/systems/) sempre usaram `twitchPresenceProvider`, cujo
 * `isLive()` consulta a API real da Twitch (`isChannelLive()`,
 * `services/twitch.service.ts`) — ou seja, esses três Systems nunca
 * produziam efeito nenhum para um Jogador sem uma live Twitch de
 * verdade acontecendo agora. `playerPresenceProvider` é o substituto:
 * mesma interface `PresenceProvider`, mas `isLive(contextId)` responde
 * "este contextId tem uma Sessão ativa registrada no SessionManager
 * agora?" — um fato 100% derivado de atividade real do próprio Jogador
 * (heartbeat, ver routes/presence.ts), nunca de audiência/live/Twitch.
 *
 * Como cada System já deriva a lista de contextIds a partir das
 * próprias sessões ativas (`sessions.map(s => s.channelId)`, ver
 * BossSpawnSystem/WelcomeRewardSystem/XPSystem), qualquer contextId
 * checado aqui JÁ tem, por construção, pelo menos uma sessão ativa —
 * `isLive()` deixa de ser um gate de audiência e passa a confirmar
 * "o Jogador está presente", exatamente o requisito da Fase 4 ("o
 * Mundo continua funcionando mesmo sem live/streamer online/viewer").
 */
export const playerPresenceProvider: PresenceProvider = {
  isLive: async (contextId: string) => {
    return sessionManager.getActiveSessions().some((session) => session.channelId === contextId);
  },
};
