import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSeededRandom, randomInt, pickWeighted } from "../src/itemgen/rng.js";
import { generateEncounter } from "../src/worldencounter/generator.js";
import { generateLoot } from "../src/lootgen/generator.js";
import { getEncounterTable } from "../src/worldencounter/encounterTables.js";
import { getExplorationEventTable } from "../src/worldevents/worldEventTables.js";
import { selectExplorationEvent } from "../src/worldevents/generator.js";

// Engine Audit — RNG, Determinism & System Validation Phase I — Fase 2
// (Diagnóstico Estatístico). Script isolado, NENHUMA lógica de jogo
// alterada — só observa (chama as mesmas funções puras já existentes:
// generateEncounter/generateLoot/selectExplorationEvent) com duas
// estratégias de seed diferentes:
//
//   "consecutive": seedBase + i          (i = 0..N-1, o padrão REAL
//                   usado em gameplay — session.seed + encountersCompleted/
//                   completedCount/tickIndex, ver Fase 1 do relatório)
//   "spaced":      seedBase + i*99991    (o padrão já usado pelo
//                   Simulador ENTRE execuções, nunca dentro de uma só)
//
// Cada seção mede: frequência observada vs. teórica, autocorrelação
// lag-1 da série binária "evento raro aconteceu", distribuição de
// distância entre eventos raros (vs. geométrica esperada sob Bernoulli
// i.i.d.), e maior sequência sem evento raro.

const N = 100_000;

function pearsonAutocorrelationLag1(series: number[]): number {
  const n = series.length;
  if (n < 2) return 0;
  const mean = series.reduce((s, v) => s + v, 0) / n;
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) denominator += (series[i] - mean) ** 2;
  for (let i = 0; i < n - 1; i++) numerator += (series[i] - mean) * (series[i + 1] - mean);
  return denominator > 0 ? numerator / denominator : 0;
}

function gapStats(hitIndices: number[]): { meanGap: number; expectedGap: number; maxGap: number; gapCount: number } {
  if (hitIndices.length < 2) return { meanGap: NaN, expectedGap: NaN, maxGap: NaN, gapCount: 0 };
  const gaps: number[] = [];
  for (let i = 1; i < hitIndices.length; i++) gaps.push(hitIndices[i] - hitIndices[i - 1]);
  const meanGap = gaps.reduce((s, v) => s + v, 0) / gaps.length;
  const maxGap = Math.max(...gaps);
  return { meanGap, expectedGap: NaN, maxGap, gapCount: gaps.length };
}

function longestRun(series: number[], value: number): number {
  let longest = 0;
  let current = 0;
  for (const v of series) {
    if (v === value) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

interface AuditResult {
  label: string;
  strategy: string;
  n: number;
  theoreticalRate: number;
  observedRate: number;
  observedCount: number;
  suppressionPercent: number;
  autocorrelationLag1: number;
  meanGapObserved: number;
  meanGapTheoretical: number;
  longestRunWithoutHit: number;
  longestRunTheoreticalP99: number;
}

function auditBernoulliSeries(label: string, strategy: "consecutive" | "spaced", seedBase: number, n: number, theoreticalRate: number, rollFn: (seed: number) => boolean): AuditResult {
  const series: number[] = new Array(n);
  const hitIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    const seed = strategy === "consecutive" ? seedBase + i : seedBase + i * 99991;
    const hit = rollFn(seed);
    series[i] = hit ? 1 : 0;
    if (hit) hitIndices.push(i);
  }
  const observedCount = hitIndices.length;
  const observedRate = observedCount / n;
  const suppressionPercent = theoreticalRate > 0 ? ((theoreticalRate - observedRate) / theoreticalRate) * 100 : 0;
  const { meanGap } = gapStats(hitIndices);
  const meanGapTheoretical = theoreticalRate > 0 ? 1 / theoreticalRate : NaN;
  // p99 do maior "run" sem sucesso sob Bernoulli i.i.d. verdadeiro:
  // aproximação via 1-(1-p)^L = 0.99 pra achar L tal que a chance de um
  // run desse tamanho ocorrer em N tentativas seja baixa — usamos a
  // fórmula clássica de "longest run of failures" L ~ log(N*p)/log(1/(1-p)).
  const longestRunTheoreticalP99 = theoreticalRate > 0 && theoreticalRate < 1 ? Math.log(n * theoreticalRate) / -Math.log(1 - theoreticalRate) : NaN;
  return {
    label,
    strategy,
    n,
    theoreticalRate,
    observedRate,
    observedCount,
    suppressionPercent,
    autocorrelationLag1: pearsonAutocorrelationLag1(series),
    meanGapObserved: meanGap,
    meanGapTheoretical,
    longestRunWithoutHit: longestRun(series, 0),
    longestRunTheoreticalP99,
  };
}

const results: AuditResult[] = [];

// === 1. Encounter Generator — variant roll (miniboss em ruinas-esquecidas) ===
const table = getEncounterTable("ruinas-esquecidas")!;
const miniBossChance = table.variantChances.miniBoss;
for (const strategy of ["consecutive", "spaced"] as const) {
  results.push(
    auditBernoulliSeries("Encounter Generator: MiniBoss roll (ruinas-esquecidas, variantChances.miniBoss)", strategy, 1, N, miniBossChance, (seed) => {
      // Réplica EXATA da fórmula real de 2 camadas (adventureLoop.ts:50/58
      // -> generator.ts:136/149): 1ª camada deriva o recipeSeed, 2ª
      // camada é o generateEncounter() real, sem nenhuma reimplementação.
      const layer1 = createSeededRandom(seed);
      const recipeSeed = randomInt(layer1, 0, 2_147_483_647);
      const recipe = generateEncounter("ruinas-esquecidas", 15, recipeSeed);
      return recipe.variant === "miniboss";
    }),
  );
}

// === 2. Encounter Generator — variant roll (elite, bosque-sussurrante) ===
const bosqueTable = getEncounterTable("bosque-sussurrante")!;
for (const strategy of ["consecutive", "spaced"] as const) {
  results.push(
    auditBernoulliSeries("Encounter Generator: Elite roll (bosque-sussurrante, variantChances.elite)", strategy, 1, N, bosqueTable.variantChances.elite, (seed) => {
      const layer1 = createSeededRandom(seed);
      const recipeSeed = randomInt(layer1, 0, 2_147_483_647);
      const recipe = generateEncounter("bosque-sussurrante", 5, recipeSeed);
      return recipe.variant === "elite";
    }),
  );
}

// === 3. World Events — shrine category roll (bosque-sussurrante) ===
const explorationTable = getExplorationEventTable("bosque-sussurrante")!;
for (const strategy of ["consecutive", "spaced"] as const) {
  results.push(
    auditBernoulliSeries("World Events: qualquer evento (bosque-sussurrante, ExplorationEventTable.chance)", strategy, 1, N, explorationTable.chance, (seed) => {
      const layer1 = createSeededRandom(seed);
      const recipeSeed = randomInt(layer1, 0, 2_147_483_647);
      const rng2 = createSeededRandom(recipeSeed);
      const event = selectExplorationEvent(rng2, explorationTable);
      return event !== null;
    }),
  );
}

// === 4. Loot Generator — rare+ rarity roll (via generateLoot em "wolf") ===
for (const strategy of ["consecutive", "spaced"] as const) {
  results.push(
    auditBernoulliSeries("Loot Generator: item de raridade rara+ (generateLoot('wolf'))", strategy, 1, N, 0.11, (seed) => {
      // 0.11 = weight combinado ilustrativo (rare+unique) do Item
      // Generator (rarities.ts: rare=11, unique=1, total=100) — teórico
      // aproximado, só pra medir supressão relativa, não um novo valor
      // de jogo.
      const loot = generateLoot("wolf", 10, seed, { dropChanceOverride: 1 });
      return loot.generatedItems.some((item) => item.rarity === "rare" || item.rarity === "unique");
    }),
  );
}

// === 5. Boss (Final Boss / mesmo miniBoss role) — chegada num intervalo típico de jornada ===
// Reaproveita a mesma medição do item 1 (o Chefe Final USA o mesmo
// papel de MiniBoss em ruinas-esquecidas, ver dungeon/dungeonDefinitions.ts) —
// já coberta acima; aqui medimos especificamente a distância entre
// ocorrências em uma janela do tamanho real de uma Dungeon (~450 ticks).
for (const strategy of ["consecutive", "spaced"] as const) {
  const journeyN = 450;
  const trials = Math.floor(N / journeyN);
  let journeysWithAtLeastOneHit = 0;
  for (let journey = 0; journey < trials; journey++) {
    const seedBase = strategy === "consecutive" ? 1 + journey * journeyN : 1 + journey * journeyN * 99991;
    let hit = false;
    for (let i = 0; i < journeyN; i++) {
      const seed = strategy === "consecutive" ? seedBase + i : seedBase + i * 99991;
      const layer1 = createSeededRandom(seed);
      const recipeSeed = randomInt(layer1, 0, 2_147_483_647);
      const recipe = generateEncounter("ruinas-esquecidas", 15, recipeSeed);
      if (recipe.variant === "miniboss") {
        hit = true;
        break;
      }
    }
    if (hit) journeysWithAtLeastOneHit++;
  }
  const observedArrivalRate = journeysWithAtLeastOneHit / trials;
  const theoreticalArrivalRate = 1 - Math.pow(1 - miniBossChance, journeyN);
  results.push({
    label: `Boss: taxa de chegada em ${trials} jornadas de ${journeyN} ticks (>=1 ocorrência)`,
    strategy,
    n: trials,
    theoreticalRate: theoreticalArrivalRate,
    observedRate: observedArrivalRate,
    observedCount: journeysWithAtLeastOneHit,
    suppressionPercent: theoreticalArrivalRate > 0 ? ((theoreticalArrivalRate - observedArrivalRate) / theoreticalArrivalRate) * 100 : 0,
    autocorrelationLag1: NaN,
    meanGapObserved: NaN,
    meanGapTheoretical: NaN,
    longestRunWithoutHit: NaN,
    longestRunTheoreticalP99: NaN,
  });
}

// === Saída ===
const lines: string[] = [];
lines.push("# Auditoria Estatística do RNG — Engine Audit Phase I");
lines.push("");
lines.push(`N por medição: ${N.toLocaleString("pt-BR")} (exceto item 5, jornadas de 450 ticks)`);
lines.push("");
for (const r of results) {
  lines.push(`## ${r.label} — estratégia: ${r.strategy}`);
  lines.push(`- n: ${r.n}`);
  lines.push(`- Taxa teórica: ${(r.theoreticalRate * 100).toFixed(4)}%`);
  lines.push(`- Taxa observada: ${(r.observedRate * 100).toFixed(4)}% (${r.observedCount} ocorrências)`);
  lines.push(`- Supressão: ${r.suppressionPercent.toFixed(1)}%`);
  if (!Number.isNaN(r.autocorrelationLag1)) lines.push(`- Autocorrelação lag-1: ${r.autocorrelationLag1.toFixed(4)}`);
  if (!Number.isNaN(r.meanGapObserved)) lines.push(`- Distância média observada entre ocorrências: ${r.meanGapObserved.toFixed(1)} (teórica: ${r.meanGapTheoretical.toFixed(1)})`);
  if (!Number.isNaN(r.longestRunWithoutHit)) lines.push(`- Maior sequência sem ocorrência: ${r.longestRunWithoutHit} (p99 teórico sob i.i.d.: ${r.longestRunTheoreticalP99.toFixed(0)})`);
  lines.push("");
}

const markdown = lines.join("\n");
console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "rng-audit-statistical.md"), markdown, "utf8");
writeFileSync(join(outputDir, "rng-audit-statistical.json"), JSON.stringify(results, null, 2), "utf8");
console.log(`\nRelatório salvo em: ${join(outputDir, "rng-audit-statistical.md")}`);
