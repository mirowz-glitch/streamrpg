import { generateItem } from "../itemgen/generator.js";
import type { AdventureCharacter } from "./types.js";

// Gameplay Balance & First Playable Experience Phase I — requisito 8
// ("100 aventuras, personagem nível 1, EQUIPAMENTO INICIAL") assume que
// um personagem novo já começa com algum equipamento básico, não
// completamente nu — condição que faltava tanto na demo
// (apps/web/src/hooks/useAdventureSession.ts) quanto no Simulador
// (simulation/simulator.ts), e que contribuía pro personagem nível 1
// morrer quase sempre no primeiro encontro (ver nota em
// enemy/templates.ts). Uma única função, reutilizada pelos dois
// lugares — nenhuma lógica de bootstrap duplicada.
//
// Sempre raridade "common" (rarityWeightMultipliers zera magic/rare/
// unique) e Item Level 1: um kit inicial deliberadamente básico, sem
// nenhum mod mágico — só os stats neutros do próprio Base Item (dano
// da arma, defesa da armadura), exatamente "equipamento inicial", não
// um upgrade disfarçado.
const STARTER_KIT_ITEM_LEVEL = 1;
const STARTER_KIT_SEED_OFFSET = 777_001;
const FORCE_COMMON_RARITY = { magic: 0, rare: 0, unique: 0 };

const STARTER_WEAPON_BY_CLASS: Record<string, string> = {
  warrior: "sword",
  mage: "wand",
  ranger: "bow",
  cleric: "mace",
};

interface StarterKitEntry {
  baseItemId: string;
  slotId: string;
}

function starterKitFor(classId: string): StarterKitEntry[] {
  const weaponId = STARTER_WEAPON_BY_CLASS[classId] ?? "sword";
  return [
    { baseItemId: weaponId, slotId: "weapon" },
    { baseItemId: "helmet", slotId: "helmet" },
    { baseItemId: "chest", slotId: "chest" },
    { baseItemId: "gloves", slotId: "gloves" },
    { baseItemId: "boots", slotId: "boots" },
  ];
}

// Equipa o kit inicial diretamente no Inventory/Equipment já existentes
// do personagem (mesma API pública que tryAutoEquip() já usa — nenhuma
// mudança na arquitetura de Inventory/Equipment). Silenciosamente pula
// um item se, por algum motivo, não puder ser adicionado/equipado
// (nunca deveria acontecer com um Inventory/Equipment recém-criados,
// mas sem lançar erro por um kit cosmético/inicial).
export function equipStarterKit(character: AdventureCharacter, classId: string, seed: number): void {
  const kit = starterKitFor(classId);

  kit.forEach((entry, index) => {
    const itemSeed = STARTER_KIT_SEED_OFFSET + seed + index;
    const item = generateItem(entry.baseItemId, STARTER_KIT_ITEM_LEVEL, itemSeed, {
      rarityWeightMultipliers: FORCE_COMMON_RARITY,
    });
    const instanceId = `starter-${entry.baseItemId}-${itemSeed}`;
    const addResult = character.inventory.addItem(instanceId, item);
    if (!addResult.success) return;
    character.equipment.equipItem(character.inventory, entry.slotId, instanceId);
  });
}
