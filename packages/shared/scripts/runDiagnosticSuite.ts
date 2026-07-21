import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBalanceSimulation, runDungeonSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport, formatBalanceReport } from "../src/simulation/report.js";
import { EXPEDITION_DEFINITIONS } from "../src/expeditions/expeditionDefinitions.js";

// Balance, Pacing & Player Experience Phase I / Vertical Slice — Player
// Journey, Retention & First Hour Experience Phase I — Fase 1
// (Diagnóstico). Um único script reaproveita os 3 runners já
// existentes (runBalanceSimulation/runDungeonSimulation), nenhuma
// lógica de simulação nova.
//
//   npx tsx packages/shared/scripts/runDiagnosticSuite.ts <label>
//
// O argumento de linha de comando decide o PREFIXO dos arquivos salvos
// em reports/ (<label>-*.md), pra permitir rodar a mesma suíte várias
// vezes (antes/depois de cada Sprint de balanceamento) com as MESMAS
// seeds e comparar de forma honesta, sem sobrescrever os snapshots de
// Sprints anteriores.
const label = process.argv[2] ?? "before";

// Boss Accessibility & Endgame Balance Phase I — Fase 1: "5.000
// Aventuras, 2.000 Expedições, 500 Dungeons" — escala maior que a
// Sprint anterior (2000/1000/300), mesma metodologia.
const ADVENTURE_RUNS = 5000;
const EXPEDITION_TOTAL_RUNS = 2000;
const DUNGEON_RUNS = 500;

const nonDungeonExpeditions = EXPEDITION_DEFINITIONS.filter((definition) => definition.id !== "queda-da-fortaleza-sombria");
const runsPerExpedition = Math.floor(EXPEDITION_TOTAL_RUNS / nonDungeonExpeditions.length);

console.log(`=== Diagnóstico "${label}" ===`);
console.log(`Aventuras: ${ADVENTURE_RUNS} | Expedições: ${runsPerExpedition * nonDungeonExpeditions.length} (${nonDungeonExpeditions.length} tipos x ${runsPerExpedition}) | Dungeons: ${DUNGEON_RUNS}`);

const adventureResults = runBalanceSimulation({ runs: ADVENTURE_RUNS, seedBase: 1 });
const adventureReport = generateBalanceReport(adventureResults);
const adventureMarkdown = formatBalanceReport(adventureReport);

const expeditionResults = nonDungeonExpeditions.flatMap((definition, index) =>
  runDungeonSimulation({
    count: runsPerExpedition,
    expeditionId: definition.id,
    seedBase: 1 + index * 1_000_000,
  }),
);
const expeditionReport = generateBalanceReport(expeditionResults);
const expeditionMarkdown = formatBalanceReport(expeditionReport);

const dungeonResults = runDungeonSimulation({ count: DUNGEON_RUNS, seedBase: 1 });
const dungeonReport = generateBalanceReport(dungeonResults);
const dungeonMarkdown = formatBalanceReport(dungeonReport);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });

writeFileSync(join(outputDir, `${label}-adventures-report.md`), adventureMarkdown, "utf8");
writeFileSync(join(outputDir, `${label}-expeditions-report.md`), expeditionMarkdown, "utf8");
writeFileSync(join(outputDir, `${label}-dungeon-report.md`), dungeonMarkdown, "utf8");

// Snapshot compacto em JSON (só os objetos BalanceReport agregados, não
// os resultados brutos por execução) — usado pela Fase 4 pra montar a
// comparação Antes x Depois sem precisar re-executar o cenário "antes".
writeFileSync(
  join(outputDir, `${label}-diagnostic-summary.json`),
  JSON.stringify({ adventures: adventureReport, expeditions: expeditionReport, dungeon: dungeonReport }, null, 2),
  "utf8",
);

console.log(`\nRelatórios salvos em: ${outputDir} (prefixo "${label}-")`);
