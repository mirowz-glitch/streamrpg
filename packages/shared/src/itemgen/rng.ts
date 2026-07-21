// Item Generator Phase I — PRNG determinístico (mulberry32), isolado do
// RandomProvider do engine (apps/api/src/engine/types.ts), que é um
// stream global não-reproduzível (next(): number, tipicamente
// Math.random()). O Item Generator precisa do oposto: a MESMA seed
// numérica deve sempre produzir o MESMO item (sincronização
// multiplayer, replay, prevenção de exploits, consistência de mercado —
// requisito 8 da Sprint). Por isso vive só aqui, sem nenhuma
// dependência do engine.
export type ItemGenRandom = () => number;

export function createSeededRandom(seed: number): ItemGenRandom {
  let state = seed >>> 0;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Inteiro uniforme em [min, max], inclusive nas duas pontas.
export function randomInt(rng: ItemGenRandom, min: number, max: number): number {
  if (max <= min) return min;
  return Math.floor(rng() * (max - min + 1)) + min;
}

export interface Weighted {
  weight: number;
}

// Sorteio ponderado por `weight` — usado tanto para Rarity Roll quanto
// para Prefix/Suffix Roll. Nenhuma lista de pesos hardcoded aqui: quem
// chama passa a tabela de dados, esta função só sabe somar/comparar.
export function pickWeighted<T extends Weighted>(rng: ItemGenRandom, options: readonly T[]): T {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let roll = rng() * totalWeight;
  for (const option of options) {
    roll -= option.weight;
    if (roll <= 0) return option;
  }
  return options[options.length - 1];
}

// Sorteia até `count` itens distintos (sem repetição), respeitando peso,
// removendo do pool a cada escolha. Usado para escolher N prefixos/N
// sufixos sem repetir o mesmo mod duas vezes na mesma rolagem.
export function pickWeightedMany<T extends Weighted>(
  rng: ItemGenRandom,
  options: readonly T[],
  count: number,
): T[] {
  const pool = [...options];
  const picked: T[] = [];
  while (picked.length < count && pool.length > 0) {
    const choice = pickWeighted(rng, pool);
    picked.push(choice);
    pool.splice(pool.indexOf(choice), 1);
  }
  return picked;
}
