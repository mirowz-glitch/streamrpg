import { calculateCharacterStats } from "../equipment/stats.js";
import type { Equipment } from "../equipment/equipment.js";
import type { CharacterBuild } from "./characterBuild.js";
import type { FinalStats, FinalStatsModifier, FutureStatModifiers } from "./types.js";

function applyModifiers(stats: FinalStats, modifier: FinalStatsModifier | undefined): void {
  if (!modifier) return;
  for (const [key, value] of Object.entries(modifier) as [keyof Omit<FinalStats, "resistances">, number][]) {
    stats[key] += value;
  }
}

// Requisito 4 — pipeline único:
//
//   Final Stats = Base Attributes (via Derived Attributes do Character
//   Build) + Equipment Stats (Equipment System, reaproveitado via
//   calculateCharacterStats(), NUNCA duplicado) + Future Buffs +
//   Future Passives + Future Talents
//
// UMA função, nenhuma soma espalhada em outro lugar do código.
// Determinística: mesmo Character Build + mesmo Equipment + mesmos
// modifiers sempre produzem o mesmo FinalStats.
//
// Mapeamento entre os dois vocabulários (Equipment.CharacterStats x
// Character Build.DerivedAttributes — os dois sistemas nomeiam
// algumas coisas diferente):
//   maximumLife    = derived.maximumLife + equipmentStats.life
//   maximumMana    = derived.maximumMana (Equipment não concede mana ainda — nenhum mod do Item Generator dá isso)
//   physicalDamage = derived.physicalDamage + equipmentStats.attack (attack do Equipment já soma físico+elemental, decisão do Equipment Phase I)
//   spellDamage    = derived.spellDamage + equipmentStats.spellDamage
//   criticalChance = derived.criticalChance + equipmentStats.critical
//   accuracy       = derived.accuracy + equipmentStats.accuracy
//   attackSpeed    = derived.attackSpeed + equipmentStats.attackSpeed
//   movementSpeed  = derived.movementSpeed (Equipment não concede movement speed ainda)
//   armor          = derived.armor + equipmentStats.defense
//   lifeLeech      = equipmentStats.lifeLeech (Character Build não tem baseline própria de leech)
//   resistances    = equipmentStats.resistances (passthrough — nenhum dos dois sistemas soma resistência real ainda)
//   powerScore     = derived.powerScore + equipmentStats.powerScore
export function calculateFinalStats(
  build: CharacterBuild,
  equipment: Equipment,
  modifiers: FutureStatModifiers = {},
): FinalStats {
  const derived = build.getDerivedAttributes();
  const equipmentStats = calculateCharacterStats(equipment);

  const stats: FinalStats = {
    maximumLife: derived.maximumLife + equipmentStats.life,
    maximumMana: derived.maximumMana,
    physicalDamage: derived.physicalDamage + equipmentStats.attack,
    spellDamage: derived.spellDamage + equipmentStats.spellDamage,
    criticalChance: derived.criticalChance + equipmentStats.critical,
    accuracy: derived.accuracy + equipmentStats.accuracy,
    attackSpeed: derived.attackSpeed + equipmentStats.attackSpeed,
    movementSpeed: derived.movementSpeed,
    armor: derived.armor + equipmentStats.defense,
    lifeLeech: equipmentStats.lifeLeech,
    resistances: { ...equipmentStats.resistances },
    powerScore: derived.powerScore + equipmentStats.powerScore,
  };

  // Requisito 7 — Future Buffs/Passives/Talents: o pipeline já soma
  // de verdade se algum modifier for passado, mas nenhum sistema real
  // produz um ainda (nenhuma chamada existente passa `modifiers`,
  // então nenhum comportamento muda até um sistema futuro começar a
  // usar isso).
  applyModifiers(stats, modifiers.buffs);
  applyModifiers(stats, modifiers.passives);
  applyModifiers(stats, modifiers.talents);

  return stats;
}
