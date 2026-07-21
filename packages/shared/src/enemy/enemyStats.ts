import { computeBaseAttributes } from "../characterbuild/baseAttributes.js";
import { calculateDerivedAttributes } from "../characterbuild/derivedAttributes.js";
import type { BaseAttributes, CharacterClassDefinition, DerivedAttributes, FinalStats } from "../characterbuild/types.js";
import type { EnemyTemplate } from "./types.js";

// Requisito 3 — Enemy Stats: "Gerar automaticamente os atributos a
// partir de: Template -> Level -> Growth -> Final Enemy Stats. Nunca
// armazenar atributos duplicados. Sempre recalcular pelo agregador."
//
// O agregador é o MESMO do Character Build (computeBaseAttributes/
// calculateDerivedAttributes, packages/shared/src/characterbuild/) —
// "não alterar Character Build" nesta Sprint, mas nada impede
// REAPROVEITAR as funções puras já existentes. Um Enemy Template tem
// exatamente o mesmo shape de dados que um CharacterClassDefinition
// (`baseStats`/`growth` = `startingAttributes`/`growthPerLevel`), então
// vira um objeto ad-hoc só pra alimentar essas funções — nenhuma
// fórmula nova, nenhuma duplicação.
function asCharacterClassDefinition(template: EnemyTemplate): CharacterClassDefinition {
  return {
    id: template.id,
    name: template.name,
    startingAttributes: template.baseStats,
    growthPerLevel: template.growth,
  };
}

export function computeEnemyBaseAttributes(template: EnemyTemplate, level: number): BaseAttributes {
  return computeBaseAttributes(asCharacterClassDefinition(template), level);
}

export function computeEnemyDerivedAttributes(template: EnemyTemplate, level: number): DerivedAttributes {
  return calculateDerivedAttributes(computeEnemyBaseAttributes(template, level));
}

// Inimigos não têm Equipment nesta Sprint (não solicitado) — lifeLeech
// e resistances ficam sempre zerados, mesmo princípio de "arquitetura
// pronta, sem dado inventado" das Sprints anteriores (ex.: Currency no
// Loot Generator, Resistências no Equipment System).
const EMPTY_ENEMY_RESISTANCES = { physical: 0, fire: 0, cold: 0, lightning: 0 };

// Final Enemy Stats — o shape completo (FinalStats) que o Combat
// Engine espera de qualquer Combatant. NUNCA guardado em EnemyInstance
// (requisito 3) — sempre chamado de novo, na hora, por quem precisa
// (ex.: toCombatant() em combatant.ts).
export function computeEnemyFinalStats(template: EnemyTemplate, level: number): FinalStats {
  const derived = computeEnemyDerivedAttributes(template, level);
  return { ...derived, lifeLeech: 0, resistances: { ...EMPTY_ENEMY_RESISTANCES } };
}
