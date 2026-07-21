import type { CharacterResistances } from "../equipment/types.js";

// Character Build Phase I — tipos isolados de propósito, prefixados
// pra nunca colidir com nada já existente em packages/shared (nenhum
// dos nomes abaixo existe hoje em types.ts/xp.ts/itemgen//lootgen//
// lootidentity//inventory//equipment/). `CharacterResistances` é
// exceção deliberada: reaproveita o mesmo tipo já definido em
// ../equipment/types.ts (Equipment System) em vez de duplicar um
// idêntico aqui — `FinalStats.resistances` é um passthrough direto de
// `CharacterStats.resistances` (ver finalStats.ts), então faz sentido
// serem literalmente o mesmo tipo.

// Requisito 2 — Base Attributes: permanentes, só progressão do
// personagem (classe + nível). NUNCA recebem bônus de equipamento —
// isso é o que distingue Base Attributes de Final Stats (requisito 4).
export interface BaseAttributes {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
}

// Requisito 3 — Derived Attributes: os 10 stats calculados a partir de
// Base Attributes, sempre pelo mesmo agregador único
// (derivedAttributes.ts).
export interface DerivedAttributes {
  maximumLife: number;
  maximumMana: number;
  physicalDamage: number;
  spellDamage: number;
  criticalChance: number;
  accuracy: number;
  attackSpeed: number;
  movementSpeed: number;
  armor: number;
  powerScore: number;
}

// Requisito 5 — Character Class: só define atributos iniciais e
// crescimento por nível ("Nada mais. Sem habilidades."). Requisito 6
// ("Level Growth... tudo em tabelas") — `growthPerLevel` é a tabela;
// crescimento linear por nível (mais simples, 100% tabela-driven, sem
// nenhum "if"). Curvas não-lineares de balanceamento ficam pra uma
// fase futura ("Sem balanceamento" nesta Sprint).
export interface CharacterClassDefinition {
  id: string;
  name: string;
  startingAttributes: BaseAttributes;
  growthPerLevel: BaseAttributes;
}

// Requisito 4 — Final Stats: Derived Attributes (Character Build) +
// Equipment Stats (CharacterStats do Equipment System, reaproveitado
// via import, nunca duplicado) + Future Buffs/Passives/Talents. Junta
// os nomes dos dois lados num único vocabulário — ver finalStats.ts
// pro mapeamento exato entre CharacterStats (Equipment) e
// DerivedAttributes (Character Build).
export interface FinalStats {
  maximumLife: number;
  maximumMana: number;
  physicalDamage: number;
  spellDamage: number;
  criticalChance: number;
  accuracy: number;
  attackSpeed: number;
  movementSpeed: number;
  armor: number;
  lifeLeech: number;
  resistances: CharacterResistances;
  powerScore: number;
}

// Requisito 7 — Future Hooks: cada campo é um bônus ADITIVO opcional
// por stat NUMÉRICO de Final Stats (tudo exceto `resistances`, que é
// um objeto aninhado), nunca produzido por nenhum sistema real nesta
// Sprint (nenhuma Passive Tree/Ascendancy/Buff/Debuff/Aura/Guild
// Buff/Season Bonus existe ainda) — só a FORMA do pipeline já pronta
// ("Final Stats = Base Attributes + Equipment Stats + Future Buffs +
// Future Passives + Future Talents", requisito 4), pra um sistema
// futuro popular sem precisar mudar finalStats.ts.
export type FinalStatsModifier = Partial<Record<keyof Omit<FinalStats, "resistances">, number>>;

export interface FutureStatModifiers {
  buffs?: FinalStatsModifier;
  passives?: FinalStatsModifier;
  talents?: FinalStatsModifier;
}
