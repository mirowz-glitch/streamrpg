/**
 * World Autonomy Phase II (Vision 2.0, Sprint 9) — WorldPresence é um
 * conceito distinto de PlayerPresence (presence/types.ts). PlayerPresence
 * responde "este Jogador está presente agora?". WorldPresence responde
 * "o Mundo está vivo agora?" — horário, dia, clima, regiões ativas —
 * derivado só do relógio real e de sinais de presença já existentes,
 * nunca de Twitch/live/streamer.
 */
export type TimeOfDay = "madrugada" | "manha" | "tarde" | "noite";

export type Weather = "limpo" | "nublado" | "chuva" | "nevoeiro" | "tempestade";

export type RegionActivity = "active" | "dormant";

/**
 * Sinais de entrada para `deriveWorldPresence()`. `activeRegionIds` vem de
 * sinais reais (AdventureSession.currentRegion de sessões com presença
 * recente — engine/SessionManager) — nunca de canal/viewer/live.
 */
export interface WorldPresenceInput {
  /** Epoch ms do momento avaliado — sempre passado pelo chamador (determinístico, testável). */
  now: number;
  /** Regiões com pelo menos um Jogador presente agora (AdventureSession.currentRegion). */
  activeRegionIds: string[];
  /** Todas as regiões do mundo (regions.ts, allRegionIds()) — define o universo do relatório. */
  allRegionIds: string[];
}

export interface WorldPresence {
  /** Dia do mundo, contado a partir de um epoch fixo do jogo (WORLD_EPOCH_MS) — nunca reinicia com o servidor. */
  dayCount: number;
  timeOfDay: TimeOfDay;
  /** Clima determinístico por região, estável dentro do mesmo dia (mesma semente dayCount+regionId). */
  weatherByRegion: Record<string, Weather>;
  /** "active" = tem Jogador presente agora; "dormant" = ninguém presente, mas a região continua existindo. */
  regionActivity: Record<string, RegionActivity>;
}
