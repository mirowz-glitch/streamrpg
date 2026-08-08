import type { PlayerPresence, PlayerPresenceInput } from "./types.js";

// Mesma janela de tolerância já usada por SessionManager.SESSION_TIMEOUT_MS
// (apps/api/src/engine/SessionManager.ts) — 1.5x o intervalo de heartbeat
// esperado. Reaproveitada aqui como o limite "online", não reinventada.
const ONLINE_WINDOW_MS = 90_000;
// Janela mais larga antes de considerar o jogador "afk" (ainda presente,
// mas sem atividade recente) — acima disso, tratado como offline.
const IDLE_WINDOW_MS = 5 * 60_000;
const AFK_WINDOW_MS = 15 * 60_000;

/**
 * Deriva o PlayerPresence de um personagem a partir de sinais reais —
 * nunca de PresenceProvider.isLive()/Twitch. Função pura, sem I/O,
 * testável sem banco ou rede (D1/D3, docs/architecture/decisions.md).
 *
 * Prioridade: sem sinal nunca visto ou expirado além de AFK_WINDOW_MS ->
 * offline; Aventura ativa agora -> in_adventure (o sinal mais forte de
 * presença real); visto recentemente -> in_kingdom (se Cidadão) ou
 * online; visto há mais tempo mas ainda dentro da janela -> idle; além
 * disso -> afk.
 */
export function derivePlayerPresence(input: PlayerPresenceInput): PlayerPresence {
  const { lastSeenAt, now, isAdventuring, isCitizenOfKingdom } = input;

  if (lastSeenAt === null) return "offline";
  const elapsed = now - lastSeenAt;
  if (elapsed > AFK_WINDOW_MS) return "offline";

  if (isAdventuring) return "in_adventure";
  if (elapsed <= ONLINE_WINDOW_MS) return isCitizenOfKingdom ? "in_kingdom" : "online";
  if (elapsed <= IDLE_WINDOW_MS) return "idle";
  return "afk";
}
