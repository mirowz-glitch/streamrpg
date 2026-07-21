import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { BalanceReport } from "../src/simulation/types.js";

// Balance, Pacing & Player Experience Phase I — Fase 4 (Validação):
// "comparar Antes x Depois de forma transparente." Lê os 2 snapshots
// JSON já salvos por runDiagnosticSuite.ts (before-diagnostic-summary/
// after-diagnostic-summary) — nenhuma nova simulação aqui, só
// formatação lado a lado dos BalanceReport já gerados.
const reportsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");

interface Snapshot {
  adventures: BalanceReport;
  expeditions: BalanceReport;
  dungeon: BalanceReport;
}

const before: Snapshot = JSON.parse(readFileSync(join(reportsDir, "before-diagnostic-summary.json"), "utf8"));
const after: Snapshot = JSON.parse(readFileSync(join(reportsDir, "after-diagnostic-summary.json"), "utf8"));

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

function row(label: string, b: number, a: number, fmt: (n: number) => string = (n) => n.toFixed(1)): string {
  const delta = a - b;
  const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "=";
  return `| ${label} | ${fmt(b)} | ${fmt(a)} | ${arrow} ${fmt(Math.abs(delta))} |`;
}

const lines: string[] = [];
lines.push("# Comparação Antes x Depois — Balance, Pacing & Player Experience Phase I");
lines.push("");
lines.push("Mesma metodologia dos dois lados: 1000 Aventuras, 500 Expedições (5 tipos x 100), 100 Dungeons, mesmas seeds.");
lines.push("");

lines.push("## Dungeon (100 execuções, foco principal da Sprint)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Taxa de morte", before.dungeon.survival.deathRate, after.dungeon.survival.deathRate, pct));
lines.push(row("HP médio", before.dungeon.survival.averageHpPercent, after.dungeon.survival.averageHpPercent, (n) => `${n.toFixed(1)}%`));
lines.push(row("Nível médio alcançado", before.dungeon.progression.averageFinalLevel, after.dungeon.progression.averageFinalLevel));
lines.push(
  row(
    "Alcançou Ruínas Esquecidas (bioma do Chefe)",
    before.dungeon.regionProgression.find((r) => r.regionId === "ruinas-esquecidas")?.reachRate ?? 0,
    after.dungeon.regionProgression.find((r) => r.regionId === "ruinas-esquecidas")?.reachRate ?? 0,
    pct,
  ),
);
lines.push(row("Chefe Final encontrado (de 100)", before.dungeon.dungeon.bossEncountered, after.dungeon.dungeon.bossEncountered, (n) => n.toFixed(0)));
lines.push(row("Chefe Final derrotado (de 100)", before.dungeon.dungeon.bossDefeated, after.dungeon.dungeon.bossDefeated, (n) => n.toFixed(0)));
lines.push(row("Taxa de conclusão da Dungeon", before.dungeon.dungeon.completionRate, after.dungeon.dungeon.completionRate, pct));
lines.push(row("Checkpoints usados (média)", before.dungeon.dungeon.averageCheckpointsUsed, after.dungeon.dungeon.averageCheckpointsUsed));
lines.push(row("Recovery recebido dentro da Dungeon (média)", before.dungeon.dungeon.averageRecoveryReceived, after.dungeon.dungeon.averageRecoveryReceived));
lines.push(row("HP ao chegar no checkpoint", before.dungeon.dungeon.averageCheckpointHpBeforePercent, after.dungeon.dungeon.averageCheckpointHpBeforePercent, (n) => `${n.toFixed(1)}%`));
lines.push(row("Duração média (Dungeons encerradas)", before.dungeon.dungeon.averageDurationSeconds, after.dungeon.dungeon.averageDurationSeconds, (n) => `${n.toFixed(0)}s`));
lines.push(row("Encontros médios (reconstruído)", before.dungeon.dungeon.averageEncountersCompleted, after.dungeon.dungeon.averageEncountersCompleted, (n) => n.toFixed(0)));
lines.push(row("Recompensa XP da Dungeon (config)", 1500, 2200));
lines.push(row("Recompensa ouro da Dungeon (config)", 400, 600));
lines.push("");

lines.push("## Aventuras Gerais (1000 execuções, regiões iniciais)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Taxa de morte", before.adventures.survival.deathRate, after.adventures.survival.deathRate, pct));
lines.push(row("Eficiência de recuperação", before.adventures.recovery.efficiency, after.adventures.recovery.efficiency, (n) => `${n.toFixed(2)}x`));
lines.push(
  row(
    "Elite: taxa de vitória",
    before.adventures.eliteMiniBoss.elite.winRate,
    after.adventures.eliteMiniBoss.elite.winRate,
    pct,
  ),
);
lines.push(row("Nível médio alcançado", before.adventures.progression.averageFinalLevel, after.adventures.progression.averageFinalLevel));
lines.push("");

lines.push("## Expedições (500 execuções, 5 tipos regionais)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Taxa de morte", before.expeditions.survival.deathRate, after.expeditions.survival.deathRate, pct));
lines.push(row("HP médio", before.expeditions.survival.averageHpPercent, after.expeditions.survival.averageHpPercent, (n) => `${n.toFixed(1)}%`));
lines.push(
  row("Elite: taxa de vitória", before.expeditions.eliteMiniBoss.elite.winRate, after.expeditions.eliteMiniBoss.elite.winRate, pct),
);
lines.push(
  row("Mini-Boss: taxa de vitória", before.expeditions.eliteMiniBoss.miniBoss.winRate, after.expeditions.eliteMiniBoss.miniBoss.winRate, pct),
);
lines.push(row("Taxa de conclusão de Expedições", before.expeditions.expeditions.completionRate, after.expeditions.expeditions.completionRate, pct));
lines.push("");
lines.push(
  "Nota metodológica: as Expedições regionais (Rota das Colinas/Descida às Minas/Exploração das Ruínas) forçam o personagem a " +
    "entrar direto na região a partir do nível 1 (mesma metodologia usada em ambos os lados desta comparação) — na prática, um " +
    "jogador real só inicia essas Expedições depois de alcançar a região naturalmente via Region Unlock (já em nível alto). A " +
    "taxa de morte de 95-100% nessas 3 Expedições é um artefato da metodologia de simulação, não um bug de balanceamento novo " +
    "introduzido nesta Sprint — mantido idêntico nos dois lados da comparação.",
);
lines.push("");

const markdown = lines.join("\n");
console.log(markdown);
writeFileSync(join(reportsDir, "before-after-comparison.md"), markdown, "utf8");
console.log(`\nComparação salva em: ${join(reportsDir, "before-after-comparison.md")}`);
