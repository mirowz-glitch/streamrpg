import type { RegionActivity, TimeOfDay, Weather, WorldPresence, WorldPresenceInput } from "./types.js";

// Epoch fixo do calendário do mundo (não é o boot do servidor nem
// nenhuma data de sessão) — dayCount é estável entre restarts e
// deploys, exatamente como PlayerPresence é estável entre reconexões
// (presence/derivePresence.ts).
const WORLD_EPOCH_MS = Date.UTC(2026, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

const WEATHER_OPTIONS: readonly Weather[] = ["limpo", "nublado", "chuva", "nevoeiro", "tempestade"];

// Hash determinístico simples (sem dependência externa) só para
// escolher um clima estável por (dia, região) — não é RNG do jogo,
// nunca usa itemgen/rng.ts (esse é reservado para loot/combate, D1).
function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function deriveTimeOfDay(hourUtc: number): TimeOfDay {
  if (hourUtc < 6) return "madrugada";
  if (hourUtc < 12) return "manha";
  if (hourUtc < 18) return "tarde";
  return "noite";
}

/**
 * Deriva o WorldPresence a partir do relógio real e de regiões
 * ativas conhecidas. Função pura, sem I/O, determinística e testável
 * sem banco ou rede (D1/D3, docs/architecture/decisions.md) — mesmo
 * padrão de derivePlayerPresence().
 */
export function deriveWorldPresence(input: WorldPresenceInput): WorldPresence {
  const { now, activeRegionIds, allRegionIds } = input;

  const dayCount = Math.max(1, Math.floor((now - WORLD_EPOCH_MS) / DAY_MS) + 1);
  const timeOfDay = deriveTimeOfDay(new Date(now).getUTCHours());

  const activeSet = new Set(activeRegionIds);
  const weatherByRegion: Record<string, Weather> = {};
  const regionActivity: Record<string, RegionActivity> = {};

  for (const regionId of allRegionIds) {
    const seed = stableHash(`${regionId}:${dayCount}`);
    weatherByRegion[regionId] = WEATHER_OPTIONS[seed % WEATHER_OPTIONS.length]!;
    regionActivity[regionId] = activeSet.has(regionId) ? "active" : "dormant";
  }

  return { dayCount, timeOfDay, weatherByRegion, regionActivity };
}
