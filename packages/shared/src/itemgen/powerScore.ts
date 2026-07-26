import type { ItemGenBaseItem, ItemGenRolledMod } from "./types.js";

// Item Generator Phase I — requisito 7: Power Score. Soma simples do
// meio da faixa de dano/defesa base do Base Item com o valor de cada
// mod rolado — fórmula deliberadamente simples (mesmo espírito de
// CRITICAL_HIT_CHANCE em items.ts: ilustrativa, não calibrada). Só
// existe pra já existir um número comparável desde já; balanceamento
// real (pesos por tag, por slot, etc.) é decisão futura de
// economia/comparação de equipamentos/loot, listada no requisito 7 —
// não exibida em nenhuma interface por esta Sprint.
// Equipment Progression Repair Phase II — Root Cause (Fase 1):
// auditoria anterior (equipment-progression-audit-phase-1.md) mediu 0
// upgrades de Elmo/Peitoral em 1.361 eventos (300 campanhas completas),
// contra 273/49 de Botas/Luvas — os 4 compartilham o MESMO pool de
// afixos (o banco de mods não tem nenhum afixo de "Defesa" — só
// Força/Vida se qualificam em itens sem tag "weapon", ver prefixes.ts/
// suffixes.ts), mas `baseDefense` somava em peso cheio (8/8/12/24) —
// Peitoral/Elmo exigiam uma combinação de afixos rara demais pra
// superar seu próprio piso, enquanto Botas/Luvas (piso 8) eram batidas
// por quase qualquer rolagem de Vida (10-110 dependendo do nível/tier).
// Reduzir o PESO da contribuição de `baseDefense` (não substituir a
// fórmula, não adicionar afixo novo) reequilibra os 4 proporcionalmente
// sem mudar Combat Engine/stats reais do item (Power Score é só o
// critério de comparação do Auto Equip — ver adventure/autoEquip.ts).
const ARMOR_DEFENSE_WEIGHT = 0.5;

export function calculatePowerScore(base: ItemGenBaseItem, rolledMods: ItemGenRolledMod[]): number {
  let score = 0;

  if (base.baseDamage) {
    score += (base.baseDamage.min + base.baseDamage.max) / 2;
  }
  if (base.baseDefense) {
    score += base.baseDefense * ARMOR_DEFENSE_WEIGHT;
  }

  for (const mod of rolledMods) {
    score += mod.value;
  }

  return Math.round(score);
}
