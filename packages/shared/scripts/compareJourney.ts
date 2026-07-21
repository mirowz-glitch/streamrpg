import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { BalanceReport } from "../src/simulation/types.js";

// Vertical Slice — Player Journey, Retention & First Hour Experience
// Phase I — Fase 4 (Validação): "comparar Antes x Depois de forma
// transparente." Lê os 2 snapshots JSON já salvos por
// runDiagnosticSuite.ts (journey-before/journey-after) — nenhuma nova
// simulação aqui, só formatação lado a lado dos BalanceReport já
// gerados.
const reportsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");

interface Snapshot {
  adventures: BalanceReport;
  expeditions: BalanceReport;
  dungeon: BalanceReport;
}

const before: Snapshot = JSON.parse(readFileSync(join(reportsDir, "journey-before-diagnostic-summary.json"), "utf8"));
const after: Snapshot = JSON.parse(readFileSync(join(reportsDir, "journey-after-diagnostic-summary.json"), "utf8"));

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
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
lines.push("# Comparação Antes x Depois — Vertical Slice: Player Journey, Retention & First Hour Experience Phase I");
lines.push("");
lines.push("Mesma metodologia dos dois lados: 2000 Aventuras, 1000 Expedições (5 tipos x 200), 300 Dungeons, mesmas seeds.");
lines.push("");

lines.push("## Jornada até o Boss (Dungeon, 300 execuções — foco principal da Sprint)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Tempo até 1º Elite", before.dungeon.progression.averageSecondsToFirstElite, after.dungeon.progression.averageSecondsToFirstElite, secs));
lines.push(row("Tempo até 1ª Expedição concluída", before.dungeon.progression.averageSecondsToFirstExpeditionCompletion, after.dungeon.progression.averageSecondsToFirstExpeditionCompletion, secs));
lines.push(row("Tempo até 1ª Dungeon", before.dungeon.progression.averageSecondsToFirstDungeonStart, after.dungeon.progression.averageSecondsToFirstDungeonStart, secs));
lines.push(row("Tempo até 1º Boss avistado", before.dungeon.progression.averageSecondsToFirstBossEncounter, after.dungeon.progression.averageSecondsToFirstBossEncounter, secs));
lines.push(row("Taxa de chegada ao Boss", before.dungeon.dungeon.boss.arrivalRate, after.dungeon.dungeon.boss.arrivalRate, pct));
lines.push(row("Taxa de vitória contra o Boss", before.dungeon.dungeon.bossWinRate, after.dungeon.dungeon.bossWinRate, pct));
lines.push(row("Duração média da jornada (Dungeons encerradas)", before.dungeon.dungeon.averageDurationSeconds, after.dungeon.dungeon.averageDurationSeconds, secs));
lines.push(row("Encontros médios (reconstruído)", before.dungeon.dungeon.averageEncountersCompleted, after.dungeon.dungeon.averageEncountersCompleted, (n) => n.toFixed(0)));
lines.push(row("Nível médio alcançado", before.dungeon.progression.averageFinalLevel, after.dungeon.progression.averageFinalLevel));
lines.push(row("Taxa de morte (sobrevivência)", before.dungeon.survival.deathRate, after.dungeon.survival.deathRate, pct));
lines.push(row("Loot: itens encontrados/execução", before.dungeon.loot.averageItemsFound, after.dungeon.loot.averageItemsFound));
lines.push(row("Loot: raridade média", before.dungeon.loot.averageRarityScore, after.dungeon.loot.averageRarityScore));
for (const regionId of ["pantano-podre", "minas-abandonadas", "ruinas-esquecidas", "colinas-aridas"]) {
  lines.push(
    row(
      `Alcançou "${regionId}"`,
      before.dungeon.regionProgression.find((r) => r.regionId === regionId)?.reachRate ?? 0,
      after.dungeon.regionProgression.find((r) => r.regionId === regionId)?.reachRate ?? 0,
      pct,
    ),
  );
}
lines.push("");

lines.push("## Retenção simulada (proxy): jornada completa em execuções abertas de 12000s");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Deserto de loot (>=600s sem upgrade)", before.dungeon.equipmentProgression.lootDesertRate, after.dungeon.equipmentProgression.lootDesertRate, pct));
lines.push(row("Maior período sem upgrade (média)", before.dungeon.equipmentProgression.averageLongestGapWithoutUpgradeSeconds, after.dungeon.equipmentProgression.averageLongestGapWithoutUpgradeSeconds, secs));
lines.push(row("Tempo médio em combate (ritmo)", before.dungeon.rhythm.averageCombatSeconds, after.dungeon.rhythm.averageCombatSeconds, secs));
lines.push(row("Tempo médio em checkpoints (ritmo)", before.dungeon.rhythm.averageCheckpointSeconds, after.dungeon.rhythm.averageCheckpointSeconds, secs));
lines.push("");

lines.push("## Aventuras Gerais (2000 execuções, região inicial única)");
lines.push("| Métrica | Antes | Depois | Delta |");
lines.push("| --- | --- | --- | --- |");
lines.push(row("Taxa de morte", before.adventures.survival.deathRate, after.adventures.survival.deathRate, pct));
lines.push(row("Nível médio alcançado", before.adventures.progression.averageFinalLevel, after.adventures.progression.averageFinalLevel));
lines.push(row("Elite: taxa de vitória", before.adventures.eliteMiniBoss.elite.winRate, after.adventures.eliteMiniBoss.elite.winRate, pct));
lines.push(
  "",
);
lines.push(
  "Nota metodológica: a métrica 'Aventuras Gerais' do lado 'Antes' usava STARTER_REGION_IDS = [bosque-sussurrante, pântano-podre] " +
    "(50/50); o lado 'Depois' usa STARTER_REGION_IDS = [bosque-sussurrante] apenas, porque pântano-podre deixou de ser uma região " +
    "de entrada válida nesta Sprint (seu gate de nível subiu de 1 para 5, ver biomes.ts). Isso muda a composição da amostra " +
    "'Aventuras Gerais' nos dois lados — não afeta a comparação da Dungeon acima (o foco real desta Sprint), que usa a mesma " +
    "metodologia (forceExpeditionId) nos dois lados.",
);
lines.push("");

const markdown = lines.join("\n");
console.log(markdown);
writeFileSync(join(reportsDir, "journey-before-after-comparison.md"), markdown, "utf8");
console.log(`\nComparação salva em: ${join(reportsDir, "journey-before-after-comparison.md")}`);
