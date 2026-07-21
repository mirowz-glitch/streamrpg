import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBalanceSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport, formatBalanceReport } from "../src/simulation/report.js";

// Gameplay Balance & First Playable Experience Phase I — requisito 8/9:
// "Simulação Automatizada... 100 aventuras, personagem nível 1,
// equipamento inicial" + "Relatório de Balanceamento" gerado
// automaticamente. Executar com:
//
//   npx tsx packages/shared/scripts/runBalanceSimulation.ts
//
// Nenhuma alteração de gameplay — só chama runBalanceSimulation()
// (Simulador, packages/shared/src/simulation/), que por sua vez só
// chama advanceAdventureWithPresentation() (Presentation Layer, já
// existente) em loop.
const RUNS = 100;

const results = runBalanceSimulation({ runs: RUNS });
const report = generateBalanceReport(results);
const markdown = formatBalanceReport(report);

console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "balance-report.md");
writeFileSync(outputPath, markdown, "utf8");
console.log(`\nRelatório salvo em: ${outputPath}`);
