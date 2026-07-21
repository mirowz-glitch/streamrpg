import type { BaseAttributes, DerivedAttributes } from "./types.js";

type DerivedStatKey = keyof Omit<DerivedAttributes, "powerScore">;

interface DerivedStatFormula {
  key: DerivedStatKey;
  base: number;
  coefficients: Partial<Record<keyof BaseAttributes, number>>;
}

// Requisito 3 — a ÚNICA tabela de fórmulas: cada Derived Attribute é
// um valor base + coeficientes por Base Attribute. Valores
// ilustrativos, não calibrados (mesma convenção de
// CRITICAL_HIT_CHANCE/pesos do Item Generator). Adicionar um novo
// Derived Attribute = inserir um novo registro aqui — o agregador
// (calculateDerivedAttributes) nunca precisa mudar.
const DERIVED_STAT_FORMULAS: DerivedStatFormula[] = [
  { key: "maximumLife", base: 50, coefficients: { vitality: 5, strength: 1 } },
  { key: "maximumMana", base: 30, coefficients: { intelligence: 4, vitality: 0.5 } },
  { key: "physicalDamage", base: 0, coefficients: { strength: 1, dexterity: 0.5 } },
  { key: "spellDamage", base: 0, coefficients: { intelligence: 1.2 } },
  { key: "criticalChance", base: 5, coefficients: { dexterity: 0.1 } },
  { key: "accuracy", base: 50, coefficients: { dexterity: 2 } },
  { key: "attackSpeed", base: 1, coefficients: { dexterity: 0.01 } },
  { key: "movementSpeed", base: 100, coefficients: { dexterity: 0.2 } },
  { key: "armor", base: 0, coefficients: { strength: 0.5, vitality: 0.5 } },
];

function applyFormula(formula: DerivedStatFormula, base: BaseAttributes): number {
  let value = formula.base;
  for (const [attribute, coefficient] of Object.entries(formula.coefficients) as [keyof BaseAttributes, number][]) {
    value += base[attribute] * coefficient;
  }
  return value;
}

// Power Score do Character Build — soma ponderada dos próprios Derived
// Attributes (ilustrativa, não calibrada), calculada à parte porque
// depende dos OUTROS 9 stats já resolvidos, não de Base Attributes
// diretamente. Ainda assim passa pelo mesmo agregador único
// (calculateDerivedAttributes), nunca somada em outro lugar do código.
function computePowerScore(derived: Omit<DerivedAttributes, "powerScore">): number {
  return Math.round(
    derived.maximumLife * 0.5 +
      derived.maximumMana * 0.3 +
      derived.physicalDamage * 2 +
      derived.spellDamage * 2 +
      derived.armor * 1.5 +
      derived.criticalChance * 3 +
      derived.accuracy * 0.3 +
      derived.attackSpeed * 20 +
      derived.movementSpeed * 0.2,
  );
}

// Requisito 3 — "toda derivação deve passar por um único agregador":
// esta é a única função que transforma Base Attributes em Derived
// Attributes em todo o Character Build. Determinística: mesmos Base
// Attributes sempre produzem os mesmos Derived Attributes.
export function calculateDerivedAttributes(base: BaseAttributes): DerivedAttributes {
  const partial = {} as Omit<DerivedAttributes, "powerScore">;
  for (const formula of DERIVED_STAT_FORMULAS) {
    partial[formula.key] = applyFormula(formula, base);
  }
  return { ...partial, powerScore: computePowerScore(partial) };
}
