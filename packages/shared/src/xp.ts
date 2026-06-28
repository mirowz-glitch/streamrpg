export const MAX_LEVEL = 30;
export const XP_PER_PING = 10;
export const PING_COOLDOWN_MS = 55000;

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
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