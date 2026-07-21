import type { BaseAttributes, CharacterClassDefinition } from "./types.js";

// As 4 chaves de BaseAttributes, numa lista só — usado pra aplicar o
// crescimento por nível genericamente (nenhum `if`/`switch` por
// atributo). Adicionar um novo Base Attribute exigiria só acrescentar
// aqui + no tipo — fora do escopo desta Sprint (só 4 existem).
const ATTRIBUTE_KEYS: (keyof BaseAttributes)[] = ["strength", "dexterity", "intelligence", "vitality"];

// Requisito 2/6 — Base Attributes = atributos iniciais da classe +
// crescimento por nível (linear, 100% tabela-driven via
// `growthPerLevel`, ver classes.ts). Nível 1 = só os iniciais (0
// níveis ganhos). NUNCA soma nada vindo de Equipment — isso é feito
// só em finalStats.ts, numa etapa separada do pipeline.
export function computeBaseAttributes(classDef: CharacterClassDefinition, level: number): BaseAttributes {
  const levelsGained = Math.max(0, level - 1);
  const result = {} as BaseAttributes;
  for (const key of ATTRIBUTE_KEYS) {
    result[key] = classDef.startingAttributes[key] + classDef.growthPerLevel[key] * levelsGained;
  }
  return result;
}
