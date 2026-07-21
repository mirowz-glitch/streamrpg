import { getLevel } from "../xp.js";
import { getCharacterClass } from "./classes.js";
import { computeBaseAttributes } from "./baseAttributes.js";
import { calculateDerivedAttributes } from "./derivedAttributes.js";
import type { BaseAttributes, DerivedAttributes } from "./types.js";

// Character Build Phase I — requisito 1: Level, Experience, Classe,
// Base Attributes, Derived Attributes, tudo num único lugar ("nenhum
// cálculo espalhado"). Igual a Inventory/Equipment (estado que muda
// durante uma sessão — personagem ganha XP) — mesma classe com
// mutação interna, no mesmo espírito de apps/api/src/engine|systems.
export class CharacterBuild {
  readonly characterId: string;
  readonly classId: string;
  experience: number;
  version: number;

  constructor(characterId: string, classId: string, experience = 0) {
    if (!getCharacterClass(classId)) {
      throw new Error(`Character Build: classe desconhecida "${classId}"`);
    }
    if (!Number.isFinite(experience) || experience < 0) {
      throw new Error(`Character Build: experience precisa ser um número >= 0 (recebido ${experience})`);
    }
    this.characterId = characterId;
    this.classId = classId;
    this.experience = experience;
    this.version = 0;
  }

  // Requisito 1 — "Level": reaproveita getLevel() já existente
  // (packages/shared/src/xp.ts, a mesma curva usada hoje pelo
  // backend/CharacterPage) em vez de duplicar uma segunda curva de
  // XP — nunca uma segunda fonte de verdade pra "quanto XP = qual
  // nível". Sempre derivado de `experience`, nunca setado à parte
  // (impossível ficar dessincronizado).
  get level(): number {
    return getLevel(this.experience);
  }

  addExperience(amount: number): void {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Character Build: amount precisa ser um número >= 0 (recebido ${amount})`);
    }
    this.experience += amount;
    this.version++;
  }

  // Requisito 2 — Base Attributes: classe + nível, nunca equipamento.
  getBaseAttributes(): BaseAttributes {
    const classDef = getCharacterClass(this.classId);
    if (!classDef) {
      throw new Error(`Character Build: classe desconhecida "${this.classId}"`);
    }
    return computeBaseAttributes(classDef, this.level);
  }

  // Requisito 3 — Derived Attributes: sempre pelo agregador único
  // (derivedAttributes.ts), nunca calculado aqui.
  getDerivedAttributes(): DerivedAttributes {
    return calculateDerivedAttributes(this.getBaseAttributes());
  }
}
