import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { BalanceReport } from "../src/simulation/types.js";

// Boss Accessibility & Endgame Balance Phase I — Fase 4 (Validação):
// "comparar Antes x Depois de forma transparente." Lê os 2 snapshots
// JSON já salvos por runDiagnosticSuite.ts (bossaccess-before/
// bossaccess-after) — nenhuma nova simulação aqui, só formatação lado
// a lado dos BalanceReport já gerados.
const reportsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");

interface Snapshot {
  adventures: BalanceReport;
  expeditions: BalanceReport;
  dungeon: BalanceReport;
}

const before: Snapshot = JSON.parse(readFileSync(join(reportsDir, "bossaccess-before-diagnostic-summary.json"), "utf8"));
const after: Snapshot = JSON.parse(readFileSync(join(reportsDir, "bossaccess-after-diagnostic-summary.json"), "utf8"));

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
function secs(n: number): string {
  return n >= 0 ? `${n.toFixed(0)}s` : "nunca aconteceu";
}
function row(label: string, b: number, a: number, fmt: (n: number) => string = (n) => n.toFixed(1)): string {
  const delta = a - b;
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "=";
  return `| ${label} | ${fmt(b)} | ${fmt(a)} | ${arrow} ${fmt(Math.abs(delta))} |`;
}

const lines: string[] = [];
lines.push("# Comparação Antes x Depois — Boss Accessibility & Endgame Balance Phase I");
lines.push("");
lines.push("Mesma metodologia dos dois lados: 5000 Aventuras, 2000 Expedições (5 tipos x 400), 500 Dungeons, mesmas seeds.");
lines.push("");

lines.push("## Boss Balance Report (500 execuções — foco principal da Sprint)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Tempo até avistar o Chefe", before.dungeon.dungeon.boss.averageSecondsUntilEncountered, after.dungeon.dungeon.boss.averageSecondsUntilEncountered, secs));
lines.push(row("Taxa de chegada (avistou o Chefe)", before.dungeon.dungeon.boss.arrivalRate, after.dungeon.dungeon.boss.arrivalRate, pct));
lines.push(row("Chefe Final encontrado (de 500)", before.dungeon.dungeon.bossEncountered, after.dungeon.dungeon.bossEncountered, (n) => n.toFixed(0)));
lines.push(row("Taxa de vitória contra o Chefe", before.dungeon.dungeon.bossWinRate, after.dungeon.dungeon.bossWinRate, pct));
lines.push("");

lines.push("## Estado do Personagem ao encontrar o Chefe Final");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Nível médio", before.dungeon.bossEncounterProfile.averageCharacterLevel, after.dungeon.bossEncounterProfile.averageCharacterLevel));
lines.push(row("HP% médio", before.dungeon.bossEncounterProfile.averageHpPercent, after.dungeon.bossEncounterProfile.averageHpPercent, (n) => `${n.toFixed(1)}%`));
lines.push(row("Vida máxima média", before.dungeon.bossEncounterProfile.averageMaxLife, after.dungeon.bossEncounterProfile.averageMaxLife));
lines.push(row("DPS estimado médio", before.dungeon.bossEncounterProfile.averageEstimatedDps, after.dungeon.bossEncounterProfile.averageEstimatedDps));
lines.push(row("Raridade média equipada", before.dungeon.bossEncounterProfile.averageRarityScore, after.dungeon.bossEncounterProfile.averageRarityScore));
lines.push(row("Ouro médio acumulado", before.dungeon.bossEncounterProfile.averageGold, after.dungeon.bossEncounterProfile.averageGold));
lines.push(row("Reputação total média", before.dungeon.bossEncounterProfile.averageReputationTotal, after.dungeon.bossEncounterProfile.averageReputationTotal));
lines.push(row("Encontros completados até aqui", before.dungeon.bossEncounterProfile.averageEncountersCompleted, after.dungeon.bossEncounterProfile.averageEncountersCompleted, (n) => n.toFixed(0)));
lines.push(row("Checkpoints usados até aqui", before.dungeon.bossEncounterProfile.averageCheckpointsUsed, after.dungeon.bossEncounterProfile.averageCheckpointsUsed));
lines.push(
  row(
    "HP do Boss quando o jogador perde",
    before.dungeon.bossEncounterProfile.averageBossHpPercentRemainingOnLoss,
    after.dungeon.bossEncounterProfile.averageBossHpPercentRemainingOnLoss,
    (n) => `${n.toFixed(1)}%`,
  ),
);
lines.push("");

lines.push("## Jornada geral da Dungeon (500 execuções)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Taxa de morte (sobrevivência)", before.dungeon.survival.deathRate, after.dungeon.survival.deathRate, pct));
lines.push(row("HP médio geral", before.dungeon.survival.averageHpPercent, after.dungeon.survival.averageHpPercent, (n) => `${n.toFixed(1)}%`));
lines.push(row("Duração média (Dungeons encerradas)", before.dungeon.dungeon.averageDurationSeconds, after.dungeon.dungeon.averageDurationSeconds, secs));
lines.push(row("Encontros médios (reconstruído)", before.dungeon.dungeon.averageEncountersCompleted, after.dungeon.dungeon.averageEncountersCompleted, (n) => n.toFixed(0)));
lines.push(row("Checkpoints usados (média)", before.dungeon.dungeon.averageCheckpointsUsed, after.dungeon.dungeon.averageCheckpointsUsed));
lines.push(row("Recovery recebido dentro da Dungeon (média)", before.dungeon.dungeon.averageRecoveryReceived, after.dungeon.dungeon.averageRecoveryReceived));
lines.push(row("HP ao chegar no checkpoint", before.dungeon.dungeon.averageCheckpointHpBeforePercent, after.dungeon.dungeon.averageCheckpointHpBeforePercent, (n) => `${n.toFixed(1)}%`));
lines.push(row("XP médio da Aventura (Progressão)", before.dungeon.progression.averageXpGained, after.dungeon.progression.averageXpGained));
lines.push(row("Ouro/min (Progressão)", before.dungeon.progression.goldPerMinute, after.dungeon.progression.goldPerMinute));
lines.push(row("Nível médio final", before.dungeon.progression.averageFinalLevel, after.dungeon.progression.averageFinalLevel));
lines.push(row("Raridade média (Loot geral)", before.dungeon.loot.averageRarityScore, after.dungeon.loot.averageRarityScore));
lines.push("");

const markdown = lines.join("\n");
console.log(markdown);
writeFileSync(join(reportsDir, "bossaccess-before-after-comparison.md"), markdown, "utf8");
console.log(`\nComparação salva em: ${join(reportsDir, "bossaccess-before-after-comparison.md")}`);
