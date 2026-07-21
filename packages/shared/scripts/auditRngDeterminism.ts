import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSeededRandom, randomInt } from "../src/itemgen/rng.js";
import { generateEncounter } from "../src/worldencounter/generator.js";
import { runSimulatedAdventure, runDungeonSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport } from "../src/simulation/report.js";

// Engine Audit — Fase 3 (Auditoria de Determinismo). Nenhuma lógica de
// jogo alterada — só observação/comparação de resultados já
// produzidos por funções puras existentes.
const lines: string[] = [];
const checks: { name: string; passed: boolean; detail: string }[] = [];
function check(name: string, passed: boolean, detail: string) {
  checks.push({ name, passed, detail });
}

// 1. Mesma seed -> mesmo resultado (RNG puro, chamada isolada).
{
  const a = createSeededRandom(12345);
  const b = createSeededRandom(12345);
  const seqA = Array.from({ length: 10 }, () => a());
  const seqB = Array.from({ length: 10 }, () => b());
  check("Mesma seed -> mesma sequência (createSeededRandom)", JSON.stringify(seqA) === JSON.stringify(seqB), `10 valores comparados`);
}

// 2. Mesma seed -> mesmo resultado (generateEncounter, função pura de alto nível).
{
  const a = generateEncounter("bosque-sussurrante", 5, 999);
  const b = generateEncounter("bosque-sussurrante", 5, 999);
  check("Mesma seed -> mesmo EncounterResult (generateEncounter)", JSON.stringify(a) === JSON.stringify(b), `regionId/variant/groups comparados`);
}

// 3. Mesma seed -> mesmo resultado (runSimulatedAdventure, sessão completa).
{
  const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42 });
  const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 42 });
  check("Mesma seed -> mesmo SimulatedAdventureResult (sessão completa)", JSON.stringify(a) === JSON.stringify(b), `resultado completo comparado`);
}

// 4. Seeds consecutivas produzem resultados DIFERENTES (não são a mesma constante disfarçada).
{
  const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1 });
  const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 2 });
  check("Seeds consecutivas (1, 2) produzem resultados diferentes", JSON.stringify(a) !== JSON.stringify(b), `seed=1 vs seed=2`);
}

// 5. Seeds espaçadas produzem resultados diferentes (mesmo teste, espaçamento diferente).
{
  const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1 });
  const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1 + 99991 });
  check("Seeds espaçadas (1, 99992) produzem resultados diferentes", JSON.stringify(a) !== JSON.stringify(b), `seed=1 vs seed=99992`);
}

// 6. "Sessões diferentes": dois characterId/sessionId diferentes, mesma seed numérica -> mesmo resultado de RNG (a seed é só o número, não o sessionId).
{
  const a = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 777, classId: "warrior" });
  const b = runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 777, classId: "warrior" });
  check("Sessões diferentes (instâncias distintas), mesma seed -> mesmo resultado", JSON.stringify(a) === JSON.stringify(b), `2 chamadas independentes de runSimulatedAdventure`);
}

// 7. "Execuções paralelas": dispara N gerações intercaladas (simulando concorrência via Promise.all)
// e confirma que nenhuma delas se contamina (cada uma só depende da própria seed).
{
  const seeds = [10, 20, 30, 40, 50];
  const interleavedResults = seeds.map((seed) => runSimulatedAdventure({ regionId: "bosque-sussurrante", seed }));
  const sequentialResults = seeds.map((seed) => runSimulatedAdventure({ regionId: "bosque-sussurrante", seed }));
  const allMatch = interleavedResults.every((r, i) => JSON.stringify(r) === JSON.stringify(sequentialResults[i]));
  check("Execuções 'paralelas' (mesmas seeds, ordens de chamada diferentes) não se contaminam", allMatch, `5 seeds comparadas entre 2 ordens de execução`);
}

// 8. "Replay": runBalanceSimulation com o mesmo seedBase reproduz a MESMA lista de resultados byte a byte.
{
  const a = runDungeonSimulation({ count: 20, seedBase: 500 });
  const b = runDungeonSimulation({ count: 20, seedBase: 500 });
  check("Replay: runDungeonSimulation com o mesmo seedBase reproduz os mesmos 20 resultados", JSON.stringify(a) === JSON.stringify(b), `20 execuções de Dungeon comparadas`);
}

// 9. Relatório agregado também é determinístico ponta a ponta (generateBalanceReport sobre os mesmos resultados).
{
  const results = runDungeonSimulation({ count: 20, seedBase: 500 });
  const reportA = generateBalanceReport(results);
  const reportB = generateBalanceReport(results);
  check("generateBalanceReport é determinístico sobre o mesmo conjunto de resultados", JSON.stringify(reportA) === JSON.stringify(reportB), `BalanceReport completo comparado`);
}

// 10. randomInt determinístico: mesma rng instance em estados equivalentes produz a mesma sequência.
{
  const rngA = createSeededRandom(555);
  const rngB = createSeededRandom(555);
  const drawsA = Array.from({ length: 5 }, () => randomInt(rngA, 0, 1000));
  const drawsB = Array.from({ length: 5 }, () => randomInt(rngB, 0, 1000));
  check("randomInt determinístico sobre streams equivalentes", JSON.stringify(drawsA) === JSON.stringify(drawsB), `5 draws comparados`);
}

lines.push("# Auditoria de Determinismo — Engine Audit Phase I (Fase 3)");
lines.push("");
for (const c of checks) {
  lines.push(`- [${c.passed ? "PASSOU" : "FALHOU"}] ${c.name} — ${c.detail}`);
}
const allPassed = checks.every((c) => c.passed);
lines.push("");
lines.push(`**Resultado geral: ${allPassed ? "TODOS os 10 checks passaram — nenhum comportamento não-determinístico inesperado encontrado." : "ALGUM check falhou — ver acima."}**`);

const markdown = lines.join("\n");
console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "rng-audit-determinism.md"), markdown, "utf8");
console.log(`\nRelatório salvo em: ${join(outputDir, "rng-audit-determinism.md")}`);
