import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateItem } from "../src/itemgen/generator.js";
import { getEncounterTable } from "../src/worldencounter/encounterTables.js";
import { randomInt, createSeededRandom } from "../src/itemgen/rng.js";
import { MAX_LEVEL } from "../src/xp.js";

// Item Level Progression Model — Architecture Phase I — Sprint
// exclusivamente investigativa. NENHUM arquivo de src/ é alterado ou
// mutado por este script (nem em memória) — Item Level já é um
// parâmetro simples (`itemLevel: number`) de `generateItem()`, então
// comparar modelos alternativos de COMO calcular esse número não exige
// tocar `resolveGroupLevel()`/`rollItemLevel()` (worldencounter/
// lootgen, intocados) — este script calcula o Item Level candidato de
// CADA modelo por conta própria, usando só dados já existentes
// (`ENCOUNTER_TABLES`, a mesma tabela que `resolveGroupLevel()` já lê),
// e alimenta a MESMA `generateItem()` real e intocada.
//
// Fase 1/2 do briefing (Domain Inventory / Dependency Mapping) — ver o
// relatório em prosa (reports/item-level-progression-model-phase-1.md)
// para a documentação completa; aqui só os dados usados nos modelos.

// ---------- Fase 1: dados de entrada, 100% lidos de tabelas já existentes ----------
// Ordem real de progressão + nível médio de personagem na entrada de
// cada região — MESMOS 7 anchors empíricos já medidos e reaproveitados
// pela Sprint "Item Generation Redesign Validation"
// (reports/equipment-progression-audit-AFTER.json, fase4b), com
// colinas-aridas/minas-abandonadas/ruinas-esquecidas desagregados aqui
// (a auditoria anterior os agrupou por não serem a variável em teste
// naquela Sprint; aqui são, porque "Region" precisa da tabela de CADA
// região individualmente).
interface RegionCase {
  region: string;
  order: number; // posição real de progressão (1 = primeira região jogável, maior = mais tardia)
  playerLevelAnchor: number; // nível médio real do personagem quando a região é alcançada
}
const REGION_CASES: RegionCase[] = [
  { region: "bosque-sussurrante", order: 1, playerLevelAnchor: 1 },
  { region: "pantano-podre", order: 2, playerLevelAnchor: 5 },
  { region: "colinas-aridas", order: 3, playerLevelAnchor: 15 },
  { region: "minas-abandonadas", order: 4, playerLevelAnchor: 17 },
  { region: "picos-congelados", order: 5, playerLevelAnchor: 20 },
  { region: "litoral-quebrado", order: 6, playerLevelAnchor: 24 },
  { region: "deserto-de-vidro", order: 7, playerLevelAnchor: 28 },
  { region: "ruinas-esquecidas", order: 8, playerLevelAnchor: 29 },
  { region: "fortaleza-sombria", order: 9, playerLevelAnchor: 30 },
];

// Todos os minItemLevel distintos hoje cadastrados no jogo (14 mods,
// prefixes.ts/suffixes.ts) — reaproveitado da Sprint "Item Generation
// Redesign Validation" (mesma lista, só lida, não alterada).
const ALL_DISTINCT_TIER_THRESHOLDS = [1, 10, 15, 20, 30, 35, 40, 50, 55, 60, 65];
const HIGHEST_TIER_THRESHOLD = Math.max(...ALL_DISTINCT_TIER_THRESHOLDS); // 65 — teto de design do banco de afixos

// ---------- Modelos candidatos de Item Level ----------
type ModelId = "playerLevel" | "region" | "regionFloor" | "playerLevelRegionClamp";
const MODELS: ModelId[] = ["playerLevel", "region", "regionFloor", "playerLevelRegionClamp"];

const ENCOUNTER_VARIANCE = 2; // mesmo WORLD_ENCOUNTER_CONFIG.levelVariance já usado hoje

function computeItemLevel(model: ModelId, regionCase: RegionCase, rng: ReturnType<typeof createSeededRandom>): number {
  const table = getEncounterTable(regionCase.region);
  if (!table) throw new Error(`Sem Encounter Table pra região "${regionCase.region}"`);
  const { min: regionMin, max: regionMax } = table.levelRange;

  if (model === "playerLevel") {
    // Atual: exatamente a mesma fórmula de resolveGroupLevel() —
    // playerLevel ± variância, clampado por MAX_LEVEL (o personagem
    // nunca excede isso) e pela faixa da região.
    const raw = Math.min(regionCase.playerLevelAnchor, MAX_LEVEL) + randomInt(rng, -ENCOUNTER_VARIANCE, ENCOUNTER_VARIANCE);
    return Math.min(regionMax, Math.max(regionMin, Math.min(raw, MAX_LEVEL)));
  }

  if (model === "playerLevelRegionClamp") {
    // Híbrido do briefing: igual ao Atual, mas SEM re-clampar por
    // MAX_LEVEL depois da variância — testa se o "clamp de região" por
    // si só já resolveria algo, isolado do teto de personagem.
    const raw = regionCase.playerLevelAnchor + randomInt(rng, -ENCOUNTER_VARIANCE, ENCOUNTER_VARIANCE);
    return Math.min(regionMax, Math.max(regionMin, raw));
  }

  if (model === "region") {
    // Região pura: sorteia dentro da faixa JÁ AUTORAL da própria região
    // (mesma ENCOUNTER_TABLES.levelRange que resolveGroupLevel() já lê
    // hoje) — decorre inteiramente de ONDE o personagem está, nunca de
    // QUEM ele é.
    return randomInt(rng, regionMin, regionMax);
  }

  // regionFloor — ladder monotônica por ORDEM real de progressão
  // (REGION_CASES.order), mapeada linearmente sobre 1..65 (o teto de
  // design do próprio banco de afixos, Fase 6/7 da Sprint "Item
  // Generation Design Review") — evita a inconsistência já encontrada
  // nos dados brutos de ENCOUNTER_TABLES (ex.: colinas-aridas, uma
  // região de 1º anel, declara max=45, mais alto que minas-abandonadas
  // max=25, uma região de 2º anel objetivamente mais tardia).
  const maxOrder = Math.max(...REGION_CASES.map((r) => r.order));
  const t = (regionCase.order - 1) / (maxOrder - 1);
  const center = Math.round(1 + t * (HIGHEST_TIER_THRESHOLD - 1));
  const spread = Math.round(HIGHEST_TIER_THRESHOLD / (maxOrder * 2));
  return Math.max(1, center + randomInt(rng, -spread, spread));
}

// ---------- Fase 4/5: Monte Carlo comparativo (mesmo N/seed pattern das Sprints anteriores) ----------
const N_PER_CASE = 6000;
const WEAPON_BASE = "sword";
const ARMOR_BASE = "chest";

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}
function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[idx];
}

interface ModelRegionResult {
  region: string;
  order: number;
  averageItemLevel: number;
  distinctThresholdsUnlocked: number;
  bestThresholdUnlocked: number;
  averagePowerScoreWeapon: number;
  p90PowerScoreWeapon: number;
  t1ReachRateWeapon: number; // % de amostras em que ALGUM mod rolado atingiu o tier de maior minItemLevel elegível no momento (65)
  averagePowerScoreArmor: number;
  p90PowerScoreArmor: number;
}

function runModel(model: ModelId): { byRegion: ModelRegionResult[]; runningMaxUpgradeProbability: { region: string; weapon: number; armor: number }[] } {
  const rng = createSeededRandom(1000 + MODELS.indexOf(model) * 7919);
  const byRegion: ModelRegionResult[] = [];

  let runningBestWeapon = 0;
  let runningBestArmor = 0;
  const runningMaxUpgradeProbability: { region: string; weapon: number; armor: number }[] = [];

  for (const regionCase of REGION_CASES) {
    const weaponScores: number[] = [];
    const armorScores: number[] = [];
    const unlockedThresholds = new Set<number>();
    let t1Reaches = 0;

    for (let i = 0; i < N_PER_CASE; i++) {
      const itemLevel = computeItemLevel(model, regionCase, rng);
      for (const threshold of ALL_DISTINCT_TIER_THRESHOLDS) if (itemLevel >= threshold) unlockedThresholds.add(threshold);

      const weaponSeed = Math.floor(rng() * 2_147_483_647);
      const armorSeed = Math.floor(rng() * 2_147_483_647);
      const weaponItem = generateItem(WEAPON_BASE, itemLevel, weaponSeed);
      const armorItem = generateItem(ARMOR_BASE, itemLevel, armorSeed);
      weaponScores.push(weaponItem.powerScore);
      armorScores.push(armorItem.powerScore);
      if ([...weaponItem.prefixes, ...weaponItem.suffixes].some((m) => m.tier === 1 && itemLevel >= HIGHEST_TIER_THRESHOLD - 5)) t1Reaches++;
    }

    const sortedWeapon = [...weaponScores].sort((a, b) => a - b);
    const beatWeapon = weaponScores.filter((v) => v > runningBestWeapon).length / weaponScores.length;
    const beatArmor = armorScores.filter((v) => v > runningBestArmor).length / armorScores.length;
    runningBestWeapon = Math.max(runningBestWeapon, ...weaponScores);
    runningBestArmor = Math.max(runningBestArmor, ...armorScores);
    runningMaxUpgradeProbability.push({ region: regionCase.region, weapon: beatWeapon, armor: beatArmor });

    byRegion.push({
      region: regionCase.region,
      order: regionCase.order,
      averageItemLevel: average(
        Array.from({ length: 200 }, () => computeItemLevel(model, regionCase, rng)),
      ),
      distinctThresholdsUnlocked: unlockedThresholds.size,
      bestThresholdUnlocked: unlockedThresholds.size > 0 ? Math.max(...unlockedThresholds) : 0,
      averagePowerScoreWeapon: average(weaponScores),
      p90PowerScoreWeapon: percentile(sortedWeapon, 90),
      t1ReachRateWeapon: t1Reaches / N_PER_CASE,
      averagePowerScoreArmor: average(armorScores),
      p90PowerScoreArmor: percentile([...armorScores].sort((a, b) => a - b), 90),
    });
  }

  return { byRegion, runningMaxUpgradeProbability };
}

console.log("Executando comparação de modelos de Item Level (playerLevel, region, regionFloor, playerLevelRegionClamp)...");
const results: Record<ModelId, ReturnType<typeof runModel>> = {} as never;
for (const model of MODELS) {
  console.log(`  modelo ${model}...`);
  results[model] = runModel(model);
}

// ---------- Fase 6: menor redesenho possível — medido diretamente ----------
// % dos 11 thresholds distintos do jogo alcançados por cada modelo, na
// ÚLTIMA região (fortaleza-sombria) — resposta direta e quantificada
// pra "o modelo dá acesso ao teto de design do banco de afixos?".
const finalRegionCoverage = MODELS.map((model) => {
  const last = results[model].byRegion[results[model].byRegion.length - 1];
  return {
    model,
    region: last.region,
    distinctThresholdsUnlocked: last.distinctThresholdsUnlocked,
    totalThresholds: ALL_DISTINCT_TIER_THRESHOLDS.length,
    coveragePercent: (last.distinctThresholdsUnlocked / ALL_DISTINCT_TIER_THRESHOLDS.length) * 100,
    bestThresholdUnlocked: last.bestThresholdUnlocked,
  };
});

const report = {
  regionCases: REGION_CASES,
  allDistinctTierThresholds: ALL_DISTINCT_TIER_THRESHOLDS,
  models: MODELS,
  byModel: results,
  finalRegionCoverage,
};

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "item-level-progression-model-comparison.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "item-level-progression-model-comparison.json")}`);
console.log(JSON.stringify({ finalRegionCoverage }, null, 2));
