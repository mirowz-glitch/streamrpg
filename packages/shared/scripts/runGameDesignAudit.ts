import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSimulatedAdventure } from "../src/simulation/simulator.js";
import { generateBalanceReport } from "../src/simulation/report.js";

// Game Design Audit — Player Progression, Economy & Balance Report
// Phase I — "reutilizar integralmente o simulador... executar apenas
// as campanhas estritamente necessárias." Uma ÚNICA campanha nova:
// jornada NATURAL (sem forceExpeditionId, sem worldTier) começando em
// bosque-sussurrante, orçamento longo o bastante pra deixar o Region
// Unlock (checkRegionUnlock, intocado) avançar organicamente por
// quantos biomas o personagem conseguir alcançar sozinho — a MESMA
// técnica de "Player Journey"/"Boss Accessibility" já usada em Sprints
// de auditoria passadas, nunca um modo de simulação novo.
//
// N=300, maxSimulatedSeconds=7200 (2h simuladas) — grande o bastante
// pra estabilizar percentuais (mesma ordem de grandeza de
// "Player Journey Phase I", que usou 2000/1000/300) sem repetir
// rodadas (esta é a ÚNICA execução desta Sprint).
const results = Array.from({ length: 300 }, (_, i) =>
  runSimulatedAdventure({ regionId: "bosque-sussurrante", seed: 1 + i * 99991, maxSimulatedSeconds: 7200, autoEquip: true, enableRecovery: true }),
);

const report = generateBalanceReport(results);

const outputDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports");
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "game-design-audit-natural-journey.json"), JSON.stringify(report, null, 2), "utf8");
console.log(`Relatório salvo em: ${join(outputDir, "game-design-audit-natural-journey.json")}`);
console.log(JSON.stringify(report, null, 2));
