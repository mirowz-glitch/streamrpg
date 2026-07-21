import { getBaseItem } from "../itemgen/baseItems.js";
import type { Equipment } from "./equipment.js";
import type { CharacterStats } from "./types.js";

type NumericStatKey = "attack" | "spellDamage" | "critical" | "accuracy" | "attackSpeed" | "lifeLeech" | "life";

// Requisito 5 — Stat Aggregator: a ÚNICA tabela nova deste arquivo,
// mapeando o `statLabel` de um mod já rolado (itemgen/prefixes.ts/
// suffixes.ts) pro Character Stat que ele alimenta. Mods com
// statLabel fora daqui (ex.: "Strength", do prefixo Heavy) não mapeiam
// pra nenhum dos 10 stats pedidos nesta Sprint — são deliberadamente
// ignorados, sem inventar um stat novo fora do que foi pedido. Nenhum
// `if (statLabel === "...")` espalhado: um novo mod com um statLabel
// já existente na tabela passa a contar automaticamente, sem tocar
// nesta função.
const STAT_LABEL_BUCKET: Partial<Record<string, NumericStatKey>> = {
  "Physical Damage": "attack",
  "Fire Damage": "attack",
  "Cold Damage": "attack",
  "Lightning Damage": "attack",
  "Spell Damage": "spellDamage",
  "Critical Strike Chance": "critical",
  Accuracy: "accuracy",
  "Attack Speed": "attackSpeed",
  "Life Leech": "lifeLeech",
  Life: "life",
};

// Requisito 4 — pipeline único: Equipment -> Base Item -> Prefixos ->
// Sufixos -> Stats -> Character Stats. UMA função, UM laço por item
// equipado — nenhuma soma duplicada em nenhum outro lugar do código.
// Determinística: mesmo Equipment (mesmos itens equipados) sempre
// produz o mesmo CharacterStats.
export function calculateCharacterStats(equipment: Equipment): CharacterStats {
  const stats: CharacterStats = {
    life: 0,
    attack: 0,
    defense: 0,
    spellDamage: 0,
    critical: 0,
    accuracy: 0,
    attackSpeed: 0,
    lifeLeech: 0,
    // Requisito 6 — nenhum mod do Item Generator concede resistência
    // ainda (só dano elemental existe hoje); os 4 campos já existem no
    // formato certo (mesmos 4 tipos de dano de itemgen/) pra somar de
    // verdade assim que esse tipo de mod for adicionado ao Item
    // Generator numa fase futura, sem precisar mudar esta função.
    resistances: { physical: 0, fire: 0, cold: 0, lightning: 0 },
    powerScore: 0,
  };

  for (const slot of equipment.items) {
    const item = slot.item;
    if (!item) continue;

    const base = getBaseItem(item.baseItemId);
    if (base?.baseDamage) {
      stats.attack += (base.baseDamage.min + base.baseDamage.max) / 2;
    }
    if (base?.baseDefense) {
      stats.defense += base.baseDefense;
    }
    if (base?.baseAttackSpeed) {
      stats.attackSpeed += base.baseAttackSpeed;
    }

    for (const mod of [...item.prefixes, ...item.suffixes]) {
      const bucket = STAT_LABEL_BUCKET[mod.statLabel];
      if (bucket) stats[bucket] += mod.value;
    }

    stats.powerScore += item.powerScore;
  }

  return stats;
}
