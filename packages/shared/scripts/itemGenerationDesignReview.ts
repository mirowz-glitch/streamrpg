import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateItem } from "../src/itemgen/generator.js";
import { ITEM_GEN_PREFIXES } from "../src/itemgen/prefixes.js";
import { ITEM_GEN_SUFFIXES } from "../src/itemgen/suffixes.js";
import { MAX_LEVEL } from "../src/xp.js";

// Item Generation Design Review — Long-Term Progression Phase I —
// Sprint puramente investigativa. Este script NÃO altera nenhuma
// fórmula/tabela existente — só CHAMA generateItem() (Item Generator já
// existente, intocado) repetidamente e analisa estatisticamente o
// resultado. Nenhum Combat Engine/Simulator/RuntimeConfig é tocado ou
// mesmo importado.
//
// Convenções reaproveitadas das auditorias anteriores (mesma
// metodologia, pra comparabilidade histórica):
// - Regiões + nível médio de entrada: medidos empiricamente pela
//   Equipment Progression Audit Phase I (fase4b_powerCurveByRegionEntry,
//   reports/equipment-progression-audit-AFTER.json).
// - SECONDS_PER_TICK=22 e o orçamento de 7200s (2h) — mesma convenção do
//   runEquipmentProgressionAudit.ts.
const REGIONS: { region: string; playerLevel: number }[] = [
  { region: "bosque-sussurrante", playerLevel: 1 },
  { region: "pantano-podre", playerLevel: 5 },
  { region: "colinas-aridas/minas-abandonadas/ruinas-esquecidas", playerLevel: 15 },
  { region: "picos-congelados", playerLevel: 20 },
  { region: "litoral-quebrado", playerLevel: 24 },
  { region: "deserto-de-vidro", playerLevel: 28 },
  { region: "fortaleza-sombria", playerLevel: 30 },
];

const N_PER_REGION = 20_000;
const WEAPON_BASE = "sword";
const ARMOR_BASE = "chest";

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[idx];
}
function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}
function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}
function stats(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  return {
    n: values.length,
    mean: mean(values),
    median: median(values),
    p10: percentile(s, 10),
    p25: percentile(s, 25),
    p75: percentile(s, 75),
    p90: percentile(s, 90),
    p99: percentile(s, 99),
    min: s[0] ?? 0,
    max: s[s.length - 1] ?? 0,
    stddev: Math.sqrt(mean(values.map((v) => (v - mean(values)) ** 2))),
  };
}

// ---------- Fase 2: Expected Value Analysis por região ----------
// Amostragem independente (seeds sequenciais, determinístico) — SEM
// combate, SEM campanha: só generateItem() puro no nível de entrada de
// cada região, pro item WEAPON e ARMOR representativos.
interface RegionSample {
  region: string;
  playerLevel: number;
  weaponPowerScore: number[];
  armorPowerScore: number[];
}
const regionSamples: RegionSample[] = REGIONS.map(({ region, playerLevel }) => {
  const weaponPowerScore: number[] = [];
  const armorPowerScore: number[] = [];
  for (let i = 0; i < N_PER_REGION; i++) {
    const seed = playerLevel * 1_000_003 + i * 7 + 1;
    weaponPowerScore.push(generateItem(WEAPON_BASE, playerLevel, seed).powerScore);
    armorPowerScore.push(generateItem(ARMOR_BASE, playerLevel, seed + 500_000).powerScore);
  }
  return { region, playerLevel, weaponPowerScore, armorPowerScore };
});

const fase2 = regionSamples.map((r) => ({
  region: r.region,
  playerLevel: r.playerLevel,
  weapon: stats(r.weaponPowerScore),
  armor: stats(r.armorPowerScore),
}));

// ---------- Fase 3: Upgrade Probability por região ----------
// "Melhor equipamento atualmente utilizado" = o item de maior Power
// Score já observado nas regiões ANTERIORES (accumulando, mesma lógica
// de "running maximum" que o jogo realmente usa via tryAutoEquip()) —
// pra cada região, mede P(um novo item gerado no nível desta região >
// o melhor já visto até aqui).
function upgradeProbabilityCurve(samplesByRegion: number[][]): { region: string; runningBest: number; upgradeProbability: number }[] {
  const result: { region: string; runningBest: number; upgradeProbability: number }[] = [];
  let runningBest = 0;
  for (let i = 0; i < samplesByRegion.length; i++) {
    const region = REGIONS[i].region;
    const samples = samplesByRegion[i];
    const beat = samples.filter((v) => v > runningBest).length;
    result.push({ region, runningBest, upgradeProbability: beat / samples.length });
    runningBest = Math.max(runningBest, ...samples);
  }
  return result;
}
const fase3_weapon = upgradeProbabilityCurve(regionSamples.map((r) => r.weaponPowerScore));
const fase3_armor = upgradeProbabilityCurve(regionSamples.map((r) => r.armorPowerScore));

// ---------- Fase 4: Running Maximum Analysis ----------
// Caso A (iid puro, base matemática): mesma distribuição (mesmo nível)
// para TODOS os N draws — mede quantos draws viram um novo recorde,
// compara com a previsão teórica de "record statistics" pra variáveis
// contínuas i.i.d.: P(draw k é um novo recorde) = 1/k, exatamente,
// independente da distribuição (Rényi, 1962) — não depende de médias/
// variâncias, só do fato de serem i.i.d. contínuas.
const RUNNING_MAX_N = 2000;
const iidLevel = 20;
let iidRunningMax = -Infinity;
let iidRecords = 0;
const iidRecordFlags: number[] = [];
for (let i = 1; i <= RUNNING_MAX_N; i++) {
  const item = generateItem(WEAPON_BASE, iidLevel, iidLevel * 9_000_001 + i);
  if (item.powerScore > iidRunningMax) {
    iidRunningMax = item.powerScore;
    iidRecords++;
  }
  iidRecordFlags.push(iidRecords);
}
// Previsão teórica: E[número de recordes em n draws i.i.d.] = H_n
// (número harmônico) = soma de 1/k, k=1..n.
function harmonic(n: number): number {
  let h = 0;
  for (let k = 1; k <= n; k++) h += 1 / k;
  return h;
}
const iidTheoreticalRecordsAtN = [100, 500, 1000, 2000].map((n) => ({ n, theoretical: harmonic(n), empirical: iidRecordFlags[n - 1] }));

// Caso B (real, não-iid): nível sobe a cada região, MESMA sequência de
// draws da Fase 2/3 acima (concatenada) — mede quantos novos recordes
// aparecem ao longo da jornada completa, pra comparar contra o caso A.
let realRunningMax = -Infinity;
let realRecords = 0;
const realRecordsPerRegion: { region: string; newRecords: number; totalDraws: number }[] = [];
for (const r of regionSamples) {
  let newRecords = 0;
  for (const v of r.weaponPowerScore) {
    if (v > realRunningMax) {
      realRunningMax = v;
      newRecords++;
      realRecords++;
    }
  }
  realRecordsPerRegion.push({ region: r.region, newRecords, totalDraws: r.weaponPowerScore.length });
}

// ---------- Fase 5: RNG vs Table vs Formula vs Item Level vs Affix ----------
// Decomposição por "fixar tudo, variar 1 fator":
// (a) RNG puro: MESMO nível/raridade forçada (unique), só a seed muda.
// (b) Item Level: raridade forçada (unique), nível varia 1..60.
// (c) Raridade: nível fixo, raridade natural (todas elegíveis) vs forçada comum.
// (d) Afixos/Base Item: comparar arma (rico em afixos) vs armadura (pobre em afixos) no MESMO nível/raridade.
const FIXED_LEVEL_FOR_RNG = 20;
const rngOnlySamples: number[] = [];
for (let i = 0; i < 5000; i++) {
  rngOnlySamples.push(
    generateItem(WEAPON_BASE, FIXED_LEVEL_FOR_RNG, i * 13 + 3, { rarityWeightMultipliers: { unique: 100000 } }).powerScore,
  );
}
const itemLevelSweep = [1, 10, 20, 30, 40, 50, 60].map((lvl) => {
  const samples: number[] = [];
  for (let i = 0; i < 3000; i++) {
    samples.push(generateItem(WEAPON_BASE, lvl, lvl * 7_777 + i, { rarityWeightMultipliers: { unique: 100000 } }).powerScore);
  }
  return { itemLevel: lvl, ...stats(samples) };
});
const rarityComparisonSamples = (() => {
  const natural: number[] = [];
  const forcedCommon: number[] = [];
  for (let i = 0; i < 5000; i++) {
    natural.push(generateItem(WEAPON_BASE, 20, i * 11 + 5).powerScore);
    forcedCommon.push(generateItem(WEAPON_BASE, 20, i * 11 + 5, { rarityWeightMultipliers: { magic: 0, rare: 0, unique: 0 } }).powerScore);
  }
  return { natural: stats(natural), forcedCommon: stats(forcedCommon) };
})();
const affixPoolComparison = (() => {
  const weapon: number[] = [];
  const armor: number[] = [];
  for (let i = 0; i < 5000; i++) {
    weapon.push(generateItem(WEAPON_BASE, 20, i * 17 + 9, { rarityWeightMultipliers: { unique: 100000 } }).powerScore);
    armor.push(generateItem(ARMOR_BASE, 20, i * 17 + 9, { rarityWeightMultipliers: { unique: 100000 } }).powerScore);
  }
  return { weaponRichPool: stats(weapon), armorPoorPool: stats(armor) };
})();

// ---------- Fase 6/7: Affix Scaling + Power Score Ceiling ----------
// Ceiling PRÁTICO de Item Level: playerLevel (<=MAX_LEVEL) +/- 2
// (WORLD_ENCOUNTER_CONFIG.levelVariance, worldencounter/config.ts) +/-
// itemLevelVariance da Loot Table (2-6, ver lootgen/lootTables.ts) —
// no melhor caso absoluto, ~MAX_LEVEL + 8. Usamos 38 (30+2+6) como teto
// realista superior (generoso) pra checar quais tiers ficam elegíveis.
const PRACTICAL_ITEM_LEVEL_CEILING = MAX_LEVEL + 2 + 6;
const allMods = [...ITEM_GEN_PREFIXES, ...ITEM_GEN_SUFFIXES];
const tierReachability = allMods.map((mod) => ({
  modId: mod.id,
  name: mod.name,
  tiers: mod.tiers.map((tier) => ({
    tier: tier.tier,
    minItemLevel: tier.minItemLevel,
    reachableAtMaxLevel: tier.minItemLevel <= MAX_LEVEL,
    reachableAtPracticalCeiling: tier.minItemLevel <= PRACTICAL_ITEM_LEVEL_CEILING,
  })),
}));
const totalTiers = tierReachability.reduce((sum, m) => sum + m.tiers.length, 0);
const reachableAtMaxLevel = tierReachability.reduce((sum, m) => sum + m.tiers.filter((t) => t.reachableAtMaxLevel).length, 0);
const reachableAtCeiling = tierReachability.reduce((sum, m) => sum + m.tiers.filter((t) => t.reachableAtPracticalCeiling).length, 0);
const bestTierUnreachable = tierReachability.filter((m) => {
  const best = m.tiers.reduce((min, t) => Math.min(min, t.tier), Infinity);
  const bestTierEntry = m.tiers.find((t) => t.tier === best);
  return bestTierEntry && !bestTierEntry.reachableAtPracticalCeiling;
});

// Power Score máximo TEÓRICO (todos os tiers, valor máximo de cada
// afixo elegível por tag, unique com maxPrefixes+maxSuffixes) vs máximo
// PRATICAMENTE alcançável (só tiers elegíveis até o teto de Item Level)
// vs máximo REALMENTE observado nesta amostragem (Fase 2, N=20.000/região).
function theoreticalMaxPowerScore(baseItemId: string, itemLevel: number, eligiblePrefixCount: number, eligibleSuffixCount: number): number {
  const eligible = (mods: typeof ITEM_GEN_PREFIXES, count: number) => {
    const withMax = mods
      .map((mod) => {
        const eligibleTiers = mod.tiers.filter((t) => t.minItemLevel <= itemLevel);
        if (eligibleTiers.length === 0) return 0;
        return Math.max(...eligibleTiers.map((t) => t.max));
      })
      .sort((a, b) => b - a)
      .slice(0, count);
    return withMax.reduce((a, b) => a + b, 0);
  };
  const base = baseItemId === WEAPON_BASE ? 0 : 0; // placeholder, base contribution added by caller for clarity
  return base + eligible(ITEM_GEN_PREFIXES, eligiblePrefixCount) + eligible(ITEM_GEN_SUFFIXES, eligibleSuffixCount);
}
const uniqueRarity = { minPrefixes: 2, maxPrefixes: 3, minSuffixes: 2, maxSuffixes: 3 };
const theoreticalCeilingAtMaxLevel = theoreticalMaxPowerScore(WEAPON_BASE, MAX_LEVEL, uniqueRarity.maxPrefixes, uniqueRarity.maxSuffixes);
const theoreticalCeilingAtPracticalCeiling = theoreticalMaxPowerScore(WEAPON_BASE, PRACTICAL_ITEM_LEVEL_CEILING, uniqueRarity.maxPrefixes, uniqueRarity.maxSuffixes);
const theoreticalAbsoluteCeiling65 = theoreticalMaxPowerScore(WEAPON_BASE, 65, uniqueRarity.maxPrefixes, uniqueRarity.maxSuffixes);
const observedMaxAtFortaleza = Math.max(...regionSamples[regionSamples.length - 1].weaponPowerScore);

// ---------- Fase 8: Monte Carlo (geração pura, sem combate) ----------
const MONTE_CARLO_N = 50_000;
const monteCarloSamples: number[] = [];
for (let i = 0; i < MONTE_CARLO_N; i++) {
  monteCarloSamples.push(generateItem(WEAPON_BASE, 20, i * 31 + 17).powerScore);
}
const monteCarloStats = stats(monteCarloSamples);
// Quantos "novos recordes" surgem a cada bloco de 1000 draws (mede se a
// taxa de upgrade útil realmente vai a zero depois de centenas de gerações).
const monteCarloRecordsPerBlock: { block: number; newRecords: number }[] = [];
let mcRunningMax = -Infinity;
for (let block = 0; block < MONTE_CARLO_N / 1000; block++) {
  let newRecords = 0;
  for (let i = 0; i < 1000; i++) {
    const v = monteCarloSamples[block * 1000 + i];
    if (v > mcRunningMax) {
      mcRunningMax = v;
      newRecords++;
    }
  }
  monteCarloRecordsPerBlock.push({ block, newRecords });
}

const report = {
  practicalItemLevelCeiling: PRACTICAL_ITEM_LEVEL_CEILING,
  maxLevel: MAX_LEVEL,
  fase2_expectedValueByRegion: fase2,
  fase3_upgradeProbability: { weapon: fase3_weapon, armor: fase3_armor },
  fase4_runningMaximum: {
    iid: { level: iidLevel, n: RUNNING_MAX_N, totalRecords: iidRecords, theoreticalVsEmpirical: iidTheoreticalRecordsAtN },
    real: { totalRecords: realRecords, perRegion: realRecordsPerRegion },
  },
  fase5_decomposition: {
    rngOnly: stats(rngOnlySamples),
    itemLevelSweep,
    rarityComparison: rarityComparisonSamples,
    affixPoolComparison,
  },
  fase6_7_affixScalingAndCeiling: {
    totalTiers,
    reachableAtMaxLevel,
    reachableAtPracticalCeiling: reachableAtCeiling,
    modsWhoseBestTierIsUnreachable: bestTierUnreachable.map((m) => m.modId),
    tierReachability,
    theoreticalCeilingAtMaxLevel,
    theoreticalCeilingAtPracticalCeiling,
    theoreticalAbsoluteCeiling65,
    observedMaxAtFortaleza,
  },
  fase8_monteCarlo: {
    n: MONTE_CARLO_N,
    stats: monteCarloStats,
    recordsPerBlock: monteCarloRecordsPerBlock,
  },
};

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "item-generation-design-review.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "item-generation-design-review.json")}`);
console.log(JSON.stringify(report, null, 2).slice(0, 4000));
