import { getBaseItem } from "../itemgen/baseItems.js";
import type { ItemGenGeneratedItem } from "../itemgen/types.js";
import { EQUIPMENT_SLOT_DEFINITIONS } from "../equipment/slots.js";
import type { AdventureCharacter } from "./types.js";

// Requisito 4 — Auto Equip (modo de teste): "opcional e isolado" —
// esta é a ÚNICA função que decide isso, nunca chamada
// automaticamente por nenhum outro sistema (Equipment/Inventory
// continuam exatamente como antes). "Se um item recém-obtido aumentar
// o Power Score, equipá-lo automaticamente" — compara o powerScore do
// item novo com o do item ATUALMENTE equipado no(s) slot(s)
// compatível(is) (0 se o slot estiver vazio); só troca se o novo for
// estritamente maior.
//
// Anéis têm dois slots possíveis (ring1/ring2, Equipment System) —
// tenta os dois, na ordem de EQUIPMENT_SLOT_DEFINITIONS, e equipa no
// primeiro que representar uma melhora real.
//
// "Preparar para futura IA de auto-loot": esta comparação simples
// (só Power Score) é um placeholder deliberado — uma IA de auto-loot
// futura substituiria só o CRITÉRIO de decisão aqui dentro (ex.:
// considerar build/resistência/sinergia), sem precisar mudar
// adventureLoop.ts, que só chama esta função por nome.
//
// Retorna true se equipou de verdade, false caso contrário (item pior,
// nenhum slot compatível, ou falha de validação do Equipment System).
export function tryAutoEquip(character: AdventureCharacter, instanceId: string, item: ItemGenGeneratedItem): boolean {
  const base = getBaseItem(item.baseItemId);
  if (!base) return false;

  const candidateSlots = EQUIPMENT_SLOT_DEFINITIONS.filter((definition) => definition.acceptsItemSlot === base.slot);

  for (const slotDefinition of candidateSlots) {
    const currentlyEquipped = character.equipment.getEquippedItem(slotDefinition.id);
    const currentPowerScore = currentlyEquipped?.powerScore ?? 0;

    if (item.powerScore > currentPowerScore) {
      const result = character.equipment.equipItem(character.inventory, slotDefinition.id, instanceId);
      if (result.success) return true;
    }
  }

  return false;
}
