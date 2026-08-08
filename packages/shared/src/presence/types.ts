/**
 * World Autonomy Phase I (Vision 2.0, Sprint 7) — PlayerPresence nunca
 * depende de Twitch, live, viewer ou canal. Representa se um Jogador
 * está presente no Mundo agora, derivado só de sinais reais do próprio
 * jogo (última atividade, Aventura em andamento, cidadania de Reino).
 */
export type PlayerPresence =
  | "online"
  | "offline"
  | "idle"
  | "in_adventure"
  | "in_kingdom"
  | "afk";

/**
 * Sinais de entrada para `derivePlayerPresence()`. Todos vêm de fatos já
 * existentes no jogo — nenhum depende de PresenceProvider.isLive()
 * (Twitch) nem de qualquer conceito de canal/streamer/audiência.
 */
export interface PlayerPresenceInput {
  /** Epoch ms do último sinal de atividade real (heartbeat/tick). `null` = nunca visto. */
  lastSeenAt: number | null;
  /** Epoch ms do momento avaliado — sempre passado pelo chamador (determinístico, testável). */
  now: number;
  /** O IdleDriver deste personagem está avançando ativamente agora. */
  isAdventuring: boolean;
  /** O personagem é Cidadão ativo de algum Reino (Citizen System). */
  isCitizenOfKingdom: boolean;
}
