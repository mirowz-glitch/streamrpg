import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSimulatedAdventure, runDungeonSimulation } from "../src/simulation/simulator.js";
import { generateBalanceReport } from "../src/simulation/report.js";
import { EXPEDITION_DEFINITIONS } from "../src/expeditions/expeditionDefinitions.js";
import { xpForLevel } from "../src/xp.js";
import type { SimulatedAdventureResult } from "../src/simulation/types.js";

// Vertical Slice — Progression Economy & Reward Curve Phase I — Fase 1
// (Auditoria da Curva). "Reutilizar integralmente o simulador
// existente... não criar novos modos de simulação": só chama
// runSimulatedAdventure()/runDungeonSimulation()/generateBalanceReport()
// já existentes, várias vezes com `forceExpeditionId`/`worldTier`/
// `startingXp` (os dois primeiros já existiam; `startingXp` é a ÚNICA
// extensão desta Sprint ao Simulador — um campo opcional a mais, mesmo
// padrão de `worldTier`, nunca um modo novo de simulação) — nenhuma
// lógica nova de simulação, só orquestração de leitura (mesmo padrão de
// scripts/runDiagnosticSuite.ts/compareBeforeAfter.ts já usados em
// Sprints de balanceamento passadas).
//
// `startingXp` existe porque conteúdo endgame (Dungeons novas, Colinas
// Áridas/Minas Abandonadas, World Tiers) é calibrado pra um personagem
// que JÁ chegou lá organicamente (nível 15-42) — testar com um
// personagem nível 1 nessas regiões mede "quão rápido ele morre
// instantaneamente", não o balanceamento de verdade do conteúdo.
//
// Escala moderada de propósito ("evitar campanhas extensas... uma única
// campanha, suficiente pra comparar antes/depois"): 200 por Expedição
// regional, 100 por Dungeon (WT1), 80 por Tier na comparação de World
// Tier — ~1700 execuções simuladas no total, rápido o bastante pra
// rodar 2x (antes/depois) sem virar uma campanha extensa repetida.
interface RegionalCase {
  expeditionId: string;
  startingLevel?: number;
}

const REGIONAL_CASES: RegionalCase[] = [
  { expeditionId: "bosque-antigo" },
  { expeditionId: "travessia-do-pantano" },
  { expeditionId: "rota-das-colinas", startingLevel: 20 },
  { expeditionId: "descida-as-minas", startingLevel: 15 },
  { expeditionId: "exploracao-das-ruinas" },
];

interface DungeonCase {
  expeditionId: string;
  startingLevel?: number;
}

const DUNGEON_CASES: DungeonCase[] = [
  { expeditionId: "queda-da-fortaleza-sombria" },
  { expeditionId: "fortaleza-congelada", startingLevel: 25 },
  { expeditionId: "catedral-esquecida", startingLevel: 28 },
  { expeditionId: "covil-do-dragao", startingLevel: 30 },
];

const WORLD_TIER_COMPARISON_DUNGEON = "queda-da-fortaleza-sombria";
const WORLD_TIERS = ["WT1", "WT2", "WT3", "WT4"];

const REGIONAL_COUNT = 200;
const DUNGEON_COUNT = 100;
const WORLD_TIER_COUNT = 80;

// `xpForLevel(N)` é o custo INCREMENTAL de subir de N pra N+1, nunca o
// total acumulado pra ESTAR no nível N (ver xp.ts: buildXpTable() soma
// xpForLevel(1)+xpForLevel(2)+...+xpForLevel(N-1) pra montar a tabela
// real de limiares) — replicado aqui (mesma fórmula pública, nenhuma
// alteração em xp.ts) só pra poder pedir "comece no nível X" de forma
// correta. Descoberto durante esta própria auditoria: `addExperience(xpForLevel(N))`
// sozinho (o padrão usado nos smoke tests de Sprints anteriores) NÃO
// chega nem perto do nível N pretendido pra N alto (ex.: nível 25 pedia
// só 12.500 XP em vez dos ~113.000 acumulados reais) — inofensivo nos
// smoke tests anteriores (só precisavam de "nível alto o bastante" pra
// evitar um efeito colateral específico), mas inválido pra uma
// auditoria de economia que precisa do nível certo.
function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let lvl = 1; lvl < level; lvl++) total += xpForLevel(lvl);
  return total;
}

function startingXpFor(level: number | undefined): number | undefined {
  return level ? cumulativeXpForLevel(level) : undefined;
}

const lines: string[] = [];
lines.push("# Auditoria de Economia de Progressão — Vertical Slice: Progression Economy & Reward Curve Phase I");
lines.push("");

lines.push("## 1. Expedições Regionais (XP/Ouro por bioma)");
lines.push("");
lines.push("| Expedição | Bioma | Nível inicial | XP médio | Ouro médio | Taxa de conclusão | Duração média (s) |");
lines.push("| --- | --- | --- | --- | --- | --- | --- |");
for (const { expeditionId, startingLevel } of REGIONAL_CASES) {
  const definition = EXPEDITION_DEFINITIONS.find((d) => d.id === expeditionId)!;
  const results: SimulatedAdventureResult[] = [];
  for (let i = 0; i < REGIONAL_COUNT; i++) {
    results.push(
      runSimulatedAdventure({
        regionId: definition.startBiome,
        seed: 1 + i * 99991,
        forceExpeditionId: expeditionId,
        startingXp: startingXpFor(startingLevel),
      }),
    );
  }
  const report = generateBalanceReport(results);
  lines.push(
    `| ${definition.name} | ${definition.startBiome} | ${startingLevel ?? 1} | ${report.expeditions.averageXpGained.toFixed(0)} | ${report.expeditions.averageGoldGained.toFixed(0)} | ${(report.expeditions.completionRate * 100).toFixed(1)}% | ${report.expeditions.averageDurationSeconds.toFixed(0)} |`,
  );
}
lines.push("");

lines.push("## 2. Dungeons (XP/Ouro/Reputação, WT1)");
lines.push("");
lines.push("| Dungeon | Nível inicial | XP médio | Ouro médio | Reputação média | Conclusão | Boss encontrado (total) | Boss vencido (total) | Win rate por encontro |");
lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const { expeditionId, startingLevel } of DUNGEON_CASES) {
  const definition = EXPEDITION_DEFINITIONS.find((d) => d.id === expeditionId)!;
  const results = runDungeonSimulation({
    expeditionId,
    count: DUNGEON_COUNT,
    seedBase: 1,
    worldTier: "WT1",
    startingXp: startingXpFor(startingLevel),
  });
  const report = generateBalanceReport(results);
  const winRatePerEncounter = report.dungeon.bossEncountered > 0 ? (report.dungeon.bossDefeated / report.dungeon.bossEncountered) * 100 : 0;
  lines.push(
    `| ${definition.name} | ${startingLevel ?? 1} | ${report.dungeon.averageXpGranted.toFixed(0)} | ${report.dungeon.averageGoldGranted.toFixed(0)} | ${report.dungeon.averageReputationGranted.toFixed(1)} | ${(report.dungeon.completionRate * 100).toFixed(1)}% | ${report.dungeon.bossEncountered} | ${report.dungeon.bossDefeated} | ${winRatePerEncounter.toFixed(1)}% |`,
  );
}
lines.push("");
lines.push(
  "**Nota sobre 'Boss encontrado/vencido (total)'**: soma de TODOS os encontros com o Mini-Boss/Chefe Final ao longo de todas as execuções (o mesmo Boss pode ser reencontrado várias vezes dentro de UMA única Dungeon longa, ver worldencounter/encounterTables.ts) — não é 'em quantas das N execuções', é o total de rolagens.",
);
lines.push("");

lines.push(`## 3. World Tiers (mesma Dungeon: ${WORLD_TIER_COMPARISON_DUNGEON})`);
lines.push("");
lines.push("| World Tier | XP médio | Ouro médio | Reputação média | Win rate por encontro | Raridade 'unique' (contagem total) |");
lines.push("| --- | --- | --- | --- | --- | --- |");
for (const worldTier of WORLD_TIERS) {
  const results = runDungeonSimulation({ expeditionId: WORLD_TIER_COMPARISON_DUNGEON, count: WORLD_TIER_COUNT, seedBase: 1, worldTier });
  const report = generateBalanceReport(results);
  const winRatePerEncounter = report.dungeon.bossEncountered > 0 ? (report.dungeon.bossDefeated / report.dungeon.bossEncountered) * 100 : 0;
  lines.push(
    `| ${worldTier} | ${report.dungeon.averageXpGranted.toFixed(0)} | ${report.dungeon.averageGoldGranted.toFixed(0)} | ${report.dungeon.averageReputationGranted.toFixed(1)} | ${winRatePerEncounter.toFixed(1)}% | ${report.loot.rarityCounts.unique ?? 0} |`,
  );
}
lines.push("");

lines.push("## 4. Distribuição de raridades (agregado das 4 Dungeons, WT1, níveis iniciais corretos)");
lines.push("");
{
  const allDungeonResults: SimulatedAdventureResult[] = [];
  for (const { expeditionId, startingLevel } of DUNGEON_CASES) {
    allDungeonResults.push(
      ...runDungeonSimulation({ expeditionId, count: DUNGEON_COUNT, seedBase: 1, worldTier: "WT1", startingXp: startingXpFor(startingLevel) }),
    );
  }
  const report = generateBalanceReport(allDungeonResults);
  lines.push("| Raridade | Contagem | % do total |");
  lines.push("| --- | --- | --- |");
  const total = Object.values(report.loot.rarityCounts).reduce((sum, count) => sum + count, 0);
  for (const [rarity, count] of Object.entries(report.loot.rarityCounts)) {
    lines.push(`| ${rarity} | ${count} | ${total > 0 ? ((count / total) * 100).toFixed(2) : "0.00"}% |`);
  }
  lines.push(`| **Total** | **${total}** | |`);
}
lines.push("");

const markdown = lines.join("\n");
console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
const label = process.argv[2] ?? "snapshot";
writeFileSync(join(outputDir, `progression-economy-audit-${label}.md`), markdown, "utf8");
console.log(`\nRelatório salvo em: ${join(outputDir, `progression-economy-audit-${label}.md`)}`);
