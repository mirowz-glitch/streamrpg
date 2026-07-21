import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBalanceSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport, formatBalanceReport } from "../src/simulation/report.js";

// Biomes, Regions & World Progression Phase I — requisito 8: "100
// aventuras completas... regiões alcançadas, tempo por região, mortes
// por região, loot por região, objetivos concluídos por região."
//
// Janela de 6000s (100min simulados): o desbloqueio do primeiro bioma
// seguinte (Colinas Áridas/Minas Abandonadas, nível 12-15) leva bem
// mais que os 600s ("primeiros 10 minutos") usados pelas Sprints de
// Balance/Recovery/Objectives — medido empiricamente: com 1800s (30min)
// NENHUMA região além das duas iniciais chega a ser alcançada (nível
// médio só ~6.87). 6000s é a menor janela que efetivamente exercita a
// progressão automática de biomas de ponta a ponta.
//
//   npx tsx packages/shared/scripts/runRegionProgressionSimulation.ts
const RUNS = 100;
const MAX_SIMULATED_SECONDS = 6000;

const results = runBalanceSimulation({ runs: RUNS, maxSimulatedSeconds: MAX_SIMULATED_SECONDS });
const report = generateBalanceReport(results, MAX_SIMULATED_SECONDS);
const markdown = formatBalanceReport(report);

console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "region-progression-report.md");
writeFileSync(outputPath, markdown, "utf8");
console.log(`\nRelatório salvo em: ${outputPath}`);
