export const MAX_LEVEL = 30;
export const XP_PER_PING = 10;
export const GOLD_PER_PING = 0.3;
export const PING_COOLDOWN_MS = 60_000;
export const DROP_CHANCE = 0.15;
export const OVERLAY_ACTIVE_SECONDS = 300;

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Gameplay Balance & First Playable Experience Phase I — requisito 4:
// "reutilizar apenas a curva existente [xpForLevel/getLevel], ajustar
// somente as recompensas de XP." XP_KILLS_PER_LEVEL é o único número
// novo desta Sprint pra progressão: quantos abates, em média, um
// personagem precisa pra subir UM nível, em QUALQUER nível — a
// recompensa por abate é sempre xpForLevel(nívelAtual)/K, então K
// abates sempre fecham exatamente o XP que falta pro próximo nível,
// não importa quão grande xpForLevel(nível) já tenha crescido.
//
// Calibrado empiricamente via o Simulador (packages/shared/src/
// simulation/) contra o ritmo de abates real do Adventure Loop já
// balanceado (enemy/templates.ts, worldencounter/encounterTables.ts,
// simulation/simulator.ts): ~4 abates/minuto observados em 400
// aventuras simuladas (22s assumidos por tick — ver
// DEFAULT_SECONDS_PER_TICK). K=14 produz nível 2 em ~3.5min, nível 3
// em ~7min, nível 4 em ~10.5min — dentro das janelas pedidas (2-4min /
// 6-8min / ~10min).
export const XP_KILLS_PER_LEVEL = 14;

// Reaproveita xpForLevel() como ÚNICA fonte da curva — esta função só
// decide QUANTO de recompensa um abate concede, nunca como XP vira
// nível (isso continua 100% em getLevel()/getProgress(), intocados).
// Usada pela Presentation Layer (presentationLayer.ts) no lugar do
// antigo XP_PER_PING (constante de um sistema totalmente diferente —
// o "ping" de viewer do Twitch, ritmo de ~1/minuto — reaproveitá-la
// pra combate era um placeholder da Sprint anterior, substituído aqui
// por um valor calibrado especificamente pro Adventure Loop).
export function xpRewardForKill(characterLevel: number): number {
  return Math.max(1, Math.round(xpForLevel(characterLevel) / XP_KILLS_PER_LEVEL));
}

function buildXpTable(): number[] {
  const table: number[] = [0];
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    table.push(table[lvl - 1] + xpForLevel(lvl));
  }
  return table;
}

const XP_TABLE = buildXpTable();

export function getLevel(totalXp: number): number {
  let level = 1;
  for (let i = 0; i < MAX_LEVEL - 1; i++) {
    if (totalXp >= XP_TABLE[i + 1]) {
      level = i + 2;
    } else {
      break;
    }
  }
  return level;
}

export interface XpProgress {
  level: number;
  xp: number;
  xp_to_next: number;
  percent: number;
}

export function getProgress(totalXp: number): XpProgress {
  const level = getLevel(totalXp);

  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, xp: 0, xp_to_next: 0, percent: 100 };
  }

  const baseXp = XP_TABLE[level - 1];
  const xpInLevel = totalXp - baseXp;
  const xpNeeded = xpForLevel(level);

  return {
    level,
    xp: xpInLevel,
    xp_to_next: xpNeeded - xpInLevel,
    percent: Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100)),
  };
}

export const RARITY_WEIGHTS: Record<string, number> = {
  common: 6000,
  uncommon: 2500,
  rare: 1300,
  epic: 180,
  legendary: 20,
};

export function pickRarity(rng = Math.random()): string {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = rng * total;
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return "common";
}
