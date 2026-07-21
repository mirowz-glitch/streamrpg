import type { RecoveryConfig } from "./types.js";

// Recovery & Adventure Flow Phase I — requisito 9: "toda recuperação
// deve vir de um arquivo de configuração, nunca números mágicos." Este
// é o ÚNICO lugar de todo o Recovery Layer com um número calibrado —
// recoveryLayer.ts só lê este objeto, nunca um valor solto.
//
// `percentOfMaxLife` calibrado empiricamente via o Simulador
// (packages/shared/src/simulation/), comparando "antes x depois" em
// 300 aventuras simuladas (10min cada, seed fixa):
//
//   0%    (antes)  -> 39% taxa de morte (o problema que motivou a Sprint)
//   0.5%            -> 22% taxa de morte
//   0.8%  (escolhido) -> 11% taxa de morte, eficiência 0.29x (cura bem
//                        abaixo do dano recebido — não é "cura infinita")
//   2%+             -> 0% taxa de morte (testado e descartado: dano por
//                        encontro é tão menor que a vida máxima que
//                        qualquer percentual >=2% já zera a taxa de
//                        morte por completo — deixaria "encontros mais
//                        difíceis" incapazes de matar ninguém, o oposto
//                        do pedido: "morrendo apenas... ao enfrentar
//                        encontros mais difíceis")
//
// 0.8% resolve a maior parte do "gambler's ruin" sem remover o risco
// por completo. Ver o relatório gerado por
// scripts/runBalanceSimulation.ts para os números completos.
//
// Balance, Pacing & Player Experience Phase I — Fase 3 (Recovery):
// "porcentagem de recuperação." A calibração de 0.8% acima foi medida
// em sessões CURTAS (300 aventuras de ~10min, ~28 encontros). O
// diagnóstico desta Sprint (before-dungeon-report.md, 100 execuções
// forçadas de ~150-220 encontros) mediu 68% de taxa de morte na
// Dungeon — o mesmo "gambler's ruin" que 0.8% já resolvia bem em
// sessões curtas volta a se acumular ao longo de centenas de rolagens
// consecutivas. Testado empiricamente (scripts/runDiagnosticSuite.ts):
// 0.011 reduz a taxa de morte da Dungeon sem zerar a taxa de morte das
// Aventuras curtas (permanece > 0%, preservando risco real — mesmo
// critério documentado acima, "2%+ zera a morte por completo").
export const RECOVERY_CONFIG: RecoveryConfig = {
  type: "percent-of-max-life",
  percentOfMaxLife: 0.011,
};
