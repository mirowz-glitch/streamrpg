import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdventureCharacter, createAdventureSession } from "../src/adventure/session.js";
import { CharacterBuild } from "../src/characterbuild/characterBuild.js";
import { Inventory } from "../src/inventory/inventory.js";
import { Equipment } from "../src/equipment/equipment.js";
import { equipStarterKit } from "../src/adventure/starterKit.js";
import { createAdventureTimeline } from "../src/presentation/presentationLayer.js";
import { advanceDungeonTick } from "../src/dungeon/dungeonController.js";

// Engine Audit — Fase 5 (Impacto). Nenhuma lógica de jogo alterada.
// Compara "itens realmente gerados pelo Loot Generator" (via
// statistics.itemsFound, incrementado só quando addItem() TEM sucesso)
// contra o número de MORTES de inimigo (enemiesKilled, cada uma
// tentando gerar loot) — a diferença mede quanto loot é gerado e
// SILENCIOSAMENTE descartado por falta de espaço no Inventory, ao
// longo de uma sessão longa (mesma causa raiz da Fase 4: Inventory
// saturado).
const seed = 1;
const build = new CharacterBuild("x", "warrior", 0);
const inventory = new Inventory("x", 30);
const equipment = new Equipment("x");
const character = createAdventureCharacter(build, inventory, equipment);
equipStarterKit(character, "warrior", seed);
const session = createAdventureSession("s", character, "bosque-sussurrante", seed, 0);
const timeline = createAdventureTimeline(session.sessionId);

let ticks = 0;
let worldEventsSeen = 0;
const checkpoints = [50, 100, 200, 300, 400, 500];
const snapshotAt: Record<number, { enemiesKilled: number; itemsFound: number; worldEvents: number; inventoryUsed: number }> = {};

while (ticks < 545 && session.character.currentLife > 0) {
  ticks++;
  const { events } = advanceDungeonTick(session, timeline, { currentTime: ticks * 22000, autoEquip: true });
  worldEventsSeen += events.filter((e) => e.kind === "WorldEventStarted").length;
  if (checkpoints.includes(ticks)) {
    snapshotAt[ticks] = {
      enemiesKilled: session.statistics.enemiesKilled,
      itemsFound: session.statistics.itemsFound,
      worldEvents: worldEventsSeen,
      inventoryUsed: session.character.inventory.items.filter((s) => s.instanceId).length,
    };
  }
}

const lines: string[] = [];
lines.push("# Auditoria de Impacto — Engine Audit Phase I (Fase 5)");
lines.push("");
lines.push("Sessão única, seed=1, 545 ticks — mede quantos itens o Loot Generator gera (`enemiesKilled`, cada kill tenta gerar loot) vs. quantos REALMENTE entram no Inventory (`itemsFound`, incrementado só quando `addItem()` tem sucesso).");
lines.push("");
lines.push("| Tick | Inimigos mortos (tentativas de loot) | Itens que ENTRARAM no Inventory | Taxa de sucesso | World Events detectados | Inventory |");
lines.push("| --- | --- | --- | --- | --- | --- |");
for (const tick of checkpoints) {
  const s = snapshotAt[tick];
  if (!s) continue;
  const rate = s.enemiesKilled > 0 ? ((s.itemsFound / s.enemiesKilled) * 100).toFixed(1) : "n/a";
  lines.push(`| ${tick} | ${s.enemiesKilled} | ${s.itemsFound} | ${rate}% | ${s.worldEvents} | ${s.inventoryUsed}/30 |`);
}
lines.push("");
lines.push(
  "**Leitura**: a taxa de sucesso (itens que realmente entraram no Inventory / tentativas de loot) despenca conforme o Inventory " +
    "satura — cada abate depois disso ainda GERA loot (Loot Generator continua funcionando normalmente, intocado), mas o item é " +
    "descartado silenciosamente ao tentar `addItem()`. World Events (que não dependem do mesmo diff de Inventory pra serem " +
    "detectados) continuam crescendo normalmente — a supressão é específica de loot/variantes, não do RNG em si.",
);

const markdown = lines.join("\n");
console.log(markdown);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "rng-audit-impact.md"), markdown, "utf8");
console.log(`\nRelatório salvo em: ${join(outputDir, "rng-audit-impact.md")}`);
