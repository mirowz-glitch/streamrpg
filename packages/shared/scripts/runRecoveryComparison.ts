import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBalanceSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport, formatComparisonReport } from "../src/simulation/report.js";

// Recovery & Adventure Flow Phase I — requisito 6: "Executar
// novamente: 100 aventuras, 400 aventuras. Comparar automaticamente...
// Gerar comparação antes x depois." Nenhuma alteração de gameplay — só
// chama runBalanceSimulation() duas vezes (enableRecovery
// false/true) pra cada tamanho de amostra.
//
//   npx tsx packages/shared/scripts/runRecoveryComparison.ts
const SAMPLE_SIZES = [100, 400];

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });

for (const runs of SAMPLE_SIZES) {
  const before = generateBalanceReport(runBalanceSimulation({ runs, seedBase: 1, enableRecovery: false }));
  const after = generateBalanceReport(runBalanceSimulation({ runs, seedBase: 1, enableRecovery: true }));

  const markdown = formatComparisonReport(before, after, `${runs} aventuras`);
  console.log(markdown);

  const outputPath = join(outputDir, `recovery-comparison-${runs}.md`);
  writeFileSync(outputPath, markdown, "utf8");
  console.log(`Relatório salvo em: ${outputPath}\n`);
}
