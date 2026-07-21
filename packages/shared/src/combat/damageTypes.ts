import type { CharacterResistances } from "../equipment/types.js";
import type { FinalStats } from "../characterbuild/types.js";

// Combat Engine Phase I — requisito 4: "Damage Types: Physical/Fire/
// Cold/Lightning/Chaos. Hoje apenas Physical precisa funcionar. Os
// demais ficam preparados." `CombatDamageType` (não `DamageType` —
// esse nome já existe em ../types.ts, o par físico/mágico simples de
// EquippedItem, um tipo completamente diferente e intocado por esta
// Sprint).
export type CombatDamageType = "physical" | "fire" | "cold" | "lightning" | "chaos";

// Requisito 9 ("data driven, nenhum cálculo espalhado") — a ÚNICA
// tabela que decide, por tipo de dano:
// - `finalStatKey`: qual campo de FinalStats (Character Build)
//   fornece o dano base. `null` = nenhum Final Stat real alimenta esse
//   tipo ainda (dano sempre 0) — Fire/Cold/Lightning/Chaos ficam assim
//   de propósito ("preparados", não "funcionando") até uma fase futura
//   dar a eles seu próprio stat (hoje Equipment já soma dano
//   elemental dentro de `physicalDamage`, então não existe um número
//   SEPARADO de Fire/Cold/Lightning pra usar aqui sem inventar dado).
// - `resistanceKey`: qual campo de CharacterResistances mitiga esse
//   tipo. `null` = ignora resistência (Chaos bypassa tanto Armor
//   quanto Resistência — convenção clássica de ARPG).
// - `mitigatedByArmor`: só Physical é reduzido por Armor; os demais
//   (quando tiverem dano de verdade) usariam Resistência, nunca Armor.
//
// Adicionar um novo tipo de dano = inserir um novo registro aqui. O
// pipeline (pipeline.ts/combatEngine.ts) nunca precisa mudar — ele só
// lê esta tabela pelo `attackType` do Combat Context.
export interface CombatDamageTypeDefinition {
  id: CombatDamageType;
  label: string;
  finalStatKey: keyof Pick<FinalStats, "physicalDamage"> | null;
  resistanceKey: keyof CharacterResistances | null;
  mitigatedByArmor: boolean;
}

export const COMBAT_DAMAGE_TYPES: CombatDamageTypeDefinition[] = [
  { id: "physical", label: "Physical", finalStatKey: "physicalDamage", resistanceKey: "physical", mitigatedByArmor: true },
  { id: "fire", label: "Fire", finalStatKey: null, resistanceKey: "fire", mitigatedByArmor: false },
  { id: "cold", label: "Cold", finalStatKey: null, resistanceKey: "cold", mitigatedByArmor: false },
  { id: "lightning", label: "Lightning", finalStatKey: null, resistanceKey: "lightning", mitigatedByArmor: false },
  { id: "chaos", label: "Chaos", finalStatKey: null, resistanceKey: null, mitigatedByArmor: false },
];

export function getCombatDamageTypeDefinition(id: CombatDamageType): CombatDamageTypeDefinition {
  const found = COMBAT_DAMAGE_TYPES.find((definition) => definition.id === id);
  if (!found) {
    throw new Error(`Combat Engine: tipo de dano desconhecido "${id}"`);
  }
  return found;
}
