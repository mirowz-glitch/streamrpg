import type { ItemGenBaseItem, ItemGenRolledMod } from "./types.js";

// Item Generator Phase I — requisito 7: Power Score. Soma simples do
// meio da faixa de dano/defesa base do Base Item com o valor de cada
// mod rolado — fórmula deliberadamente simples (mesmo espírito de
// CRITICAL_HIT_CHANCE em items.ts: ilustrativa, não calibrada). Só
// existe pra já existir um número comparável desde já; balanceamento
// real (pesos por tag, por slot, etc.) é decisão futura de
// economia/comparação de equipamentos/loot, listada no requisito 7 —
// não exibida em nenhuma interface por esta Sprint.
export function calculatePowerScore(base: ItemGenBaseItem, rolledMods: ItemGenRolledMod[]): number {
  let score = 0;

  if (base.baseDamage) {
    score += (base.baseDamage.min + base.baseDamage.max) / 2;
  }
  if (base.baseDefense) {
    score += base.baseDefense;
  }

  for (const mod of rolledMods) {
    score += mod.value;
  }

  return Math.round(score);
}
