// Combat Engine Phase I — requisito 9: "todos os multiplicadores
// deverão ficar centralizados". Toda constante numérica do pipeline
// vive aqui, nada espalhado em pipeline.ts/combatEngine.ts. Valores
// ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE/pesos do Item Generator/Loot Generator).
export const COMBAT_CONFIG = {
  hitChance: {
    // Requisito 6 — "preparado para Evasion futura": até o Target ter
    // seu próprio stat de Evasion (não existe em FinalStats ainda),
    // usamos este valor fixo como "evasão padrão" de qualquer alvo —
    // um único número pra trocar por `target.finalStats.evasion` no
    // dia em que esse stat existir, sem mudar a fórmula em pipeline.ts.
    baselineEvasion: 100,
    // Nunca 0% (sempre existe uma chance mínima de acertar) nem acima
    // de 100%.
    min: 0.05,
    max: 1.0,
  },
  damage: {
    // Requisito 3 ("Damage Roll") — variação aleatória em torno do
    // dano base, uniforme em [1 - variance, 1 + variance].
    variance: 0.15,
  },
  armor: {
    // Fórmula clássica de mitigação por Armor: reduction = armor /
    // (armor + mitigationConstant). Só usada quando
    // CombatDamageTypeDefinition.mitigatedByArmor === true.
    mitigationConstant: 100,
  },
  resistance: {
    // Resistência (0-100) vira % de mitigação direta, com teto —
    // convenção clássica de ARPG (nunca 100% de mitigação via
    // resistência).
    maxMitigation: 0.75,
  },
} as const;
