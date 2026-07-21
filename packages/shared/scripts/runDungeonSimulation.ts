import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runDungeonSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport, formatBalanceReport } from "../src/simulation/report.js";

// First Dungeon, Final Boss & Complete Game Loop Phase I — requisito
// 10: "Executar 100 Dungeons completas" — usa `forceExpeditionId` (ver
// simulation/types.ts) pra garantir que todas as execuções realmente
// tentam "queda-da-fortaleza-sombria" desde a 1ª tick, em vez de
// depender da seleção aleatória. Executar com:
//
//   npx tsx packages/shared/scripts/runDungeonSimulation.ts
//
// Nenhuma alteração de gameplay — só chama runDungeonSimulation()
// (Simulador, packages/shared/src/simulation/), que por sua vez só
// chama advanceDungeonTick() em loop.
const COUNT = 100;

const results = runDungeonSimulation({ count: COUNT });
const report = generateBalanceReport(results);
const markdown = formatBalanceReport(report);

console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "dungeon-balance-report.md");
writeFileSync(outputPath, markdown, "utf8");
console.log(`\nRelatório salvo em: ${outputPath}`);
